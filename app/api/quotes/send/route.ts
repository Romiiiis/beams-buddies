import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { renderEmail, renderText, type EmailSender } from '@/lib/email-theme'
import { emailLogoUrl, formatPhone } from '@/lib/automation-email'
import { quoteSendContent } from '@/lib/quote-email'
import { quoteLink } from '@/lib/site'

// Emails a quote to its customer through Resend, with a button to the private quote page.
//
// Security: the caller's Supabase session token is forwarded, so every read and write below runs as that user
// under the normal business-scoped rules. A user can only send quotes that belong to their own business.
// No service-role key is used.

const DEFAULT_SEND_DOMAIN = 'mail.jobyra.app'
const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status })
}

function safeName(name: string) {
  return name.replace(/[\r\n<>"\\]/g, '').trim().slice(0, 80) || 'Jobyra'
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return json({ error: 'not_configured', message: 'Email sending is not set up yet.' }, 503)

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'unauthorized', message: 'Please sign in again.' }, 401)

  let body: any
  try {
    body = await request.json()
  } catch {
    return json({ error: 'bad_request', message: 'Invalid request.' }, 400)
  }
  const quoteId = body?.quote_id
  if (typeof quoteId !== 'string' || !UUID.test(quoteId)) return json({ error: 'bad_request', message: 'Invalid quote.' }, 400)
  const note = String(body?.note ?? '').replace(/\r/g, '').trim().slice(0, 1000)

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: authData, error: authError } = await supabase.auth.getUser(token)
  if (authError || !authData.user) return json({ error: 'unauthorized', message: 'Please sign in again.' }, 401)

  const { data: userRow } = await supabase.from('users').select('business_id').eq('id', authData.user.id).single()
  if (!userRow?.business_id) return json({ error: 'forbidden', message: 'No business found for this account.' }, 403)
  const businessId = userRow.business_id as string

  const [{ data: quote }, { data: business }] = await Promise.all([
    supabase.from('quotes').select('*, customers(first_name, last_name, email)').eq('id', quoteId).eq('business_id', businessId).single(),
    supabase.from('businesses').select('name, phone, email, logo_url, email_domain, email_domain_verified').eq('id', businessId).single(),
  ])
  if (!quote) return json({ error: 'not_found', message: 'Quote not found.' }, 404)

  const to = String((quote as any).customers?.email || '').trim()
  if (!EMAIL.test(to)) return json({ error: 'no_email', message: 'This customer has no valid email address saved.' }, 400)

  const sender: EmailSender = {
    name: String(business?.name || '').trim(),
    phone: formatPhone(business?.phone),
    email: String(business?.email || '').trim(),
    logoUrl: emailLogoUrl(business?.logo_url),
  }
  const content = quoteSendContent(quote, sender, quoteLink(String((quote as any).public_token)), note)
  const replyTo = EMAIL.test(sender.email || '') ? sender.email : undefined

  const ownDomain = String((business as any)?.email_domain || '').trim().toLowerCase()
  const sendDomain = (business as any)?.email_domain_verified && DOMAIN.test(ownDomain) ? ownDomain : DEFAULT_SEND_DOMAIN

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${safeName(sender.name)} <quotes@${sendDomain}>`,
      to: [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject: content.subject,
      html: renderEmail('classic', content, sender),
      text: renderText(content, sender),
    }),
  })
  const result = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('Resend error:', res.status, result)
    return json({ error: 'send_failed', message: 'The email could not be sent. Please try again shortly.' }, 502)
  }

  // A draft becomes "sent" once it has gone to the customer. An answered quote keeps its answer.
  const status = (quote as any).status as string
  const patch: Record<string, unknown> = { sent_at: new Date().toISOString() }
  if (status === 'draft') patch.status = 'sent'
  await supabase.from('quotes').update(patch).eq('id', quoteId).eq('business_id', businessId)

  return json({ ok: true, to, status: status === 'draft' ? 'sent' : status, sent_at: patch.sent_at }, 200)
}
