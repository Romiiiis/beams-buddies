import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { invoiceHtml, invoiceSubject, invoiceText, type InvoiceSender } from '@/lib/invoice-email'

// Sends an invoice email to the invoice's customer through Resend, same as service reminders.
//
// Security: the caller's Supabase session token is forwarded, so every read and write below runs
// as that user under the normal business-scoped rules. A user can only send invoices that belong
// to their own business. No service-role key is used.

const DEFAULT_SEND_DOMAIN = 'mail.jobyra.app'
const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status })
}

function safeDisplayName(name: string) {
  return name.replace(/[\r\n<>"\\]/g, '').trim().slice(0, 80) || 'Jobyra'
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return json({ error: 'not_configured', message: 'Email sending is not set up yet.' }, 503)
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'unauthorized', message: 'Please sign in again.' }, 401)

  let invoiceId: unknown
  try {
    ;({ invoice_id: invoiceId } = await request.json())
  } catch {
    return json({ error: 'bad_request', message: 'Invalid request.' }, 400)
  }
  if (typeof invoiceId !== 'string' || !UUID.test(invoiceId)) return json({ error: 'bad_request', message: 'Invalid invoice.' }, 400)

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: authData, error: authError } = await supabase.auth.getUser(token)
  if (authError || !authData.user) return json({ error: 'unauthorized', message: 'Please sign in again.' }, 401)

  const { data: userRow } = await supabase.from('users').select('business_id').eq('id', authData.user.id).single()
  if (!userRow?.business_id) return json({ error: 'forbidden', message: 'No business found for this account.' }, 403)
  const businessId = userRow.business_id as string

  const [{ data: invoice }, { data: business }, { data: settings }] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, customers(first_name, last_name, suburb, phone, email, address)')
      .eq('id', invoiceId)
      .eq('business_id', businessId)
      .single(),
    supabase.from('businesses').select('name, phone, email, email_domain, email_domain_verified').eq('id', businessId).single(),
    supabase.from('business_settings').select('*').eq('business_id', businessId).single(),
  ])
  if (!invoice) return json({ error: 'not_found', message: 'Invoice not found.' }, 404)

  const to = String((invoice as any).customers?.email || '').trim()
  if (!EMAIL.test(to)) return json({ error: 'no_email', message: 'This customer has no valid email address saved.' }, 400)

  const sender: InvoiceSender = { name: business?.name || '', phone: business?.phone || '', email: business?.email || '' }
  const subject = invoiceSubject(invoice, sender)
  const replyTo = EMAIL.test(sender.email.trim()) ? sender.email.trim() : undefined

  const ownDomain = String((business as any)?.email_domain || '').trim().toLowerCase()
  const sendDomain = (business as any)?.email_domain_verified && DOMAIN.test(ownDomain) ? ownDomain : DEFAULT_SEND_DOMAIN

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${safeDisplayName(sender.name)} <invoices@${sendDomain}>`,
      to: [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html: invoiceHtml(invoice, sender, settings),
      text: invoiceText(invoice, sender, settings),
    }),
  })

  const result = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('Resend error:', res.status, result)
    return json({ error: 'send_failed', message: 'The email could not be sent. Please try again shortly.' }, 502)
  }

  // A draft becomes "sent" once it has gone to the customer
  if ((invoice as any).status === 'draft') {
    await supabase.from('invoices').update({ status: 'sent' }).eq('id', invoiceId).eq('business_id', businessId)
  }

  return json({ ok: true, sent_at: new Date().toISOString(), to, status: (invoice as any).status === 'draft' ? 'sent' : (invoice as any).status }, 200)
}
