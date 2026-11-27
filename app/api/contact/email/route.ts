import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { bookingUrl } from '@/lib/booking-token'
import {
  invoiceContent,
  overdueContent,
  publicInvoiceUrl,
  publicQuoteUrl,
  quoteContent,
  renderAutomation,
  reviewContent,
  senderFrom,
  serviceContent,
} from '@/lib/automation-email'
import { contactEmailContent, isContactEmailTemplate, type ContactEmailTemplateId } from '@/lib/contact-email'
import { hasPromoOfferPlaceholder, renderPromoEmail, renderPromoText, SAMPLE_PROMO_EMAIL, sanitizePromoEmailContent } from '@/lib/promo-email'

const DEFAULT_SEND_DOMAIN = 'mail.jobyra.app'
const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PROMO_EDITOR_EMAIL = 'ramizarib@hotmail.com'
const EMAIL = /^[^\s@<>\"]+@[^\s@<>\"]+\.[^\s@<>\"]+$/

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

function safeDisplayName(name: string) {
  return name.replace(/[\r\n<>"\\]/g, '').trim().slice(0, 80) || 'Jobyra'
}

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'unauthorized', message: 'Please sign in again.' }, 401)

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'bad_request', message: 'Invalid request.' }, 400)
  }

  const mode = payload.mode === undefined || payload.mode === 'send' ? 'send' : payload.mode
  if (mode !== 'preview' && mode !== 'send') {
    return json({ error: 'bad_request', message: 'Invalid email action.' }, 400)
  }
  const customerId = payload.customer_id
  const template = payload.template
  const message = payload.message
  const subjectInput = payload.subject
  const isPromoAction = template === 'promo'

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
    global: { headers: { Authorization: 'Bearer ' + token } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authData, error: authError } = await supabase.auth.getUser(token)
  if (authError || !authData.user) return json({ error: 'unauthorized', message: 'Please sign in again.' }, 401)
  if (isPromoAction && String(authData.user.email || '').trim().toLowerCase() !== PROMO_EDITOR_EMAIL) {
    return json({ error: 'forbidden', message: 'Promotional emails are not enabled for this account.' }, 403)
  }

  if (typeof customerId !== 'string' || !UUID.test(customerId) || !isContactEmailTemplate(template)) {
    return json({ error: 'bad_request', message: 'Invalid customer or email template.' }, 400)
  }
  if (typeof message !== 'string' || message.length > 8000 || (mode === 'send' && template !== 'promo' && !message.trim())) {
    return json({ error: 'bad_request', message: 'Add a message of 8,000 characters or fewer.' }, 400)
  }
  if (subjectInput !== undefined && (typeof subjectInput !== 'string' || subjectInput.length > 150)) {
    return json({ error: 'bad_request', message: 'The subject must be 150 characters or fewer.' }, 400)
  }
  const subject = typeof subjectInput === 'string' ? subjectInput.replace(/[\r\n]+/g, ' ').trim() : ''

  const { data: userRow } = await supabase.from('users').select('business_id').eq('id', authData.user.id).single()
  if (!userRow?.business_id) return json({ error: 'forbidden', message: 'No business found for this account.' }, 403)
  const businessId = userRow.business_id as string

  const [{ data: customer }, { data: business }, { data: settings }] = await Promise.all([
    supabase.from('customers').select('id, first_name, last_name, email').eq('id', String(customerId || '')).eq('business_id', businessId).single(),
    supabase.from('businesses').select('name, phone, email, logo_url, email_domain, email_domain_verified').eq('id', businessId).single(),
    supabase.from('business_settings').select('*').eq('business_id', businessId).maybeSingle(),
  ])

  const supabaseOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://invalid.invalid').origin
  if (!customer) return json({ error: 'not_found', message: 'Customer not found.' }, 404)

  const to = String((customer as any).email || '').trim()
  if (mode === 'send' && !EMAIL.test(to)) return json({ error: 'no_email', message: 'This customer has no valid email address saved.' }, 400)

  const sender = senderFrom(business)
  const recipient = { customers: customer }
  let baseContent
  let resourceMissing = false
  let createUrl: string | undefined

  if (template === 'service_reminder') {
    const { data: job } = await supabase
      .from('jobs')
      .select('*, customers(first_name, last_name, email, phone, address, suburb), customer_sites(label, address, suburb, state, postcode)')
      .eq('business_id', businessId)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    resourceMissing = !job
    baseContent = job ? serviceContent(job, sender, bookingUrl(job.id)) : undefined
  } else if (template === 'review') {
    const reviewUrl = String((settings as any)?.google_review_url || '').trim()
    baseContent = reviewContent(recipient, sender, /^https:\/\//i.test(reviewUrl) ? reviewUrl : '')
  } else if (template === 'new_quote') {
    const { data: quotes } = await supabase
      .from('quotes')
      .select('*, customers(first_name, last_name, email)')
      .eq('business_id', businessId)
      .eq('customer_id', customerId)
      .neq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(5)
    const quote = (quotes || []).find(item => publicQuoteUrl((item as any).public_token))
    resourceMissing = !quote
    createUrl = `/dashboard/quotes?new=1&customer_id=${encodeURIComponent(customerId)}`
    baseContent = quote ? quoteContent(quote, sender, publicQuoteUrl((quote as any).public_token)) : undefined
  } else if (template === 'outstanding') {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*, customers(first_name, last_name, email, phone, address, suburb)')
      .eq('business_id', businessId)
      .eq('customer_id', customerId)
      .in('status', ['sent', 'overdue'])
      .order('created_at', { ascending: false })
      .limit(10)
    const invoice = (invoices || []).find(item => Number((item as any).total) > Number((item as any).amount_paid || 0) && publicInvoiceUrl((item as any).public_token))
    resourceMissing = !invoice
    createUrl = `/dashboard/invoices?new=1&customer_id=${encodeURIComponent(customerId)}`
    baseContent = invoice ? overdueContent(invoice, sender, settings, publicInvoiceUrl((invoice as any).public_token)) : undefined
  }

  const canSend = !resourceMissing
  let rendered: { html: string; text: string; subject: string }
  if (template === 'promo') {
    const promoContent = sanitizePromoEmailContent(payload.promo_content ?? (settings as any)?.promo_email_config ?? SAMPLE_PROMO_EMAIL, businessId, supabaseOrigin)
    if (!promoContent) return json({ error: 'bad_request', message: 'The promotional campaign is invalid. Reopen the editor and check the content.' }, 400)
    if (mode === 'send' && hasPromoOfferPlaceholder(promoContent)) {
      return json({ error: 'unfinished_offer', message: 'Replace the bracketed offer amount and date before sending this promotion.' }, 400)
    }
    const campaign = { ...promoContent, subject: subject || promoContent.subject }
    rendered = {
      html: renderPromoEmail(campaign, sender, 'https://jobyra.app', businessId, supabaseOrigin),
      text: renderPromoText(campaign, sender),
      subject: campaign.subject,
    }
  } else {
    rendered = renderAutomation(contactEmailContent({
      template: template as ContactEmailTemplateId,
      firstName: (customer as any).first_name,
      subject,
      message,
    }, sender, baseContent), sender)
  }

  if (mode === 'preview') {
    return json({
      ok: true,
      html: rendered.html,
      text: rendered.text,
      subject: rendered.subject,
      to,
      can_send: canSend,
      needs_resource: resourceMissing,
      create_url: resourceMissing ? createUrl : undefined,
    })
  }
  if (!canSend) {
    const label = template === 'new_quote' ? 'quote' : template === 'outstanding' ? 'outstanding invoice' : 'service record'
    return json({ error: 'missing_resource', message: `This customer has no ${label} to link yet. Create one first.` }, 409)
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return json({ error: 'not_configured', message: 'Email sending is not set up yet.' }, 503)
  const replyTo = EMAIL.test(String(sender.email || '').trim()) ? String(sender.email).trim() : undefined
  const ownDomain = String((business as any)?.email_domain || '').trim().toLowerCase()
  const sendDomain = (business as any)?.email_domain_verified && DOMAIN.test(ownDomain) ? ownDomain : DEFAULT_SEND_DOMAIN

  let response: Response
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: safeDisplayName(sender.name || '') + ' <contact@' + sendDomain + '>',
        to: [to],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      }),
    })
  } catch {
    return json({ error: 'send_failed', message: 'The email could not be sent. Please try again shortly.' }, 502)
  }

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    console.error('Resend contact email error:', response.status, result)
    return json({ error: 'send_failed', message: 'The email could not be sent. Please try again shortly.' }, 502)
  }

  return json({ ok: true, sent_at: new Date().toISOString(), to, subject: rendered.subject }, 200)
}
