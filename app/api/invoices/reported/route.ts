import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { EMAIL_STYLE, formatPhone, senderFrom } from '@/lib/automation-email'
import { renderEmail, renderText, type EmailContent } from '@/lib/email-theme'
import { SITE_URL } from '@/lib/booking-token'

// A customer taps "I've paid" on the public invoice page. There is no signed-in user, so this uses the service-role
// key; the invoice is found only by its unguessable public token. It marks the invoice "payment reported" (it does
// NOT mark it paid: the business checks its bank and does that) and emails the business once.

const DEFAULT_SEND_DOMAIN = 'mail.jobyra.app'
const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const json = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
const clean = (v: unknown) => String(v ?? '').trim()
const money = (n: unknown) => `$${Number(n || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export async function POST(request: Request) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return json({ error: 'not_configured', message: 'This is not set up yet.' }, 503)
  let token = ''
  try {
    token = clean((await request.json())?.token)
  } catch {
    return json({ error: 'bad_request', message: 'Invalid request.' }, 400)
  }
  if (!UUID.test(token)) return json({ error: 'invalid', message: 'This link is not valid.' }, 404)

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: inv } = await db
    .from('invoices')
    .select('id, business_id, invoice_number, status, total, amount_paid, payment_reported_at, customers(first_name, last_name, phone, email)')
    .eq('public_token', token)
    .maybeSingle()
  if (!inv || inv.status === 'draft') return json({ error: 'invalid', message: 'This link is not valid.' }, 404)
  if (inv.status === 'paid') return json({ ok: true, already: true })
  if (inv.payment_reported_at) return json({ ok: true, already: true })

  const { error } = await db.from('invoices').update({ payment_reported_at: new Date().toISOString() }).eq('id', inv.id).is('payment_reported_at', null)
  if (error) return json({ error: 'failed', message: 'Sorry, that did not save. Please try again.' }, 500)

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    const { data: business } = await db.from('businesses').select('name, phone, email, logo_url, email_domain, email_domain_verified').eq('id', inv.business_id).single()
    const owner = clean(business?.email)
    if (business && EMAIL.test(owner)) {
      const sender = senderFrom(business)
      const cust: any = Array.isArray((inv as any).customers) ? (inv as any).customers[0] : (inv as any).customers
      const who = [cust?.first_name, cust?.last_name].map(clean).filter(Boolean).join(' ') || 'A customer'
      const owing = Math.max(0, Number(inv.total) - Number(inv.amount_paid || 0))
      const facts: [string, string][] = [['Invoice', clean(inv.invoice_number)], ['Customer', who]]
      if (cust?.phone) facts.push(['Phone', formatPhone(cust.phone)])
      facts.push(['Reference to look for', clean(inv.invoice_number)])
      const c: EmailContent = {
        kind: 'invoice',
        subject: `${who} says they have paid invoice ${clean(inv.invoice_number)}`,
        preheader: `${money(owing)} reported as paid. Check your bank, then mark it paid.`,
        label: 'Payment reported',
        headline: `${who} says they have paid`,
        greeting: '',
        paragraphs: [`They tapped "I've paid" on invoice ${clean(inv.invoice_number)}. Check your bank account for the transfer, then mark the invoice as paid in Jobyra.`],
        highlight: { label: 'Amount', value: money(owing), sub: `Invoice ${clean(inv.invoice_number)}`, chip: { text: 'Waiting for you to confirm', tone: 'warn' } },
        facts,
        closing: [],
        button: { text: 'Open invoices', href: `${SITE_URL}/dashboard/invoices` },
        signoff: '',
        footer: 'You are getting this because a customer reported a payment on one of your invoices.',
      }
      const ownDomain = clean((business as any).email_domain).toLowerCase()
      const sendDomain = (business as any).email_domain_verified && DOMAIN.test(ownDomain) ? ownDomain : DEFAULT_SEND_DOMAIN
      const name = clean(business.name).replace(/[\r\n<>"\\]/g, '').slice(0, 80) || 'Jobyra'
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: `${name} <invoices@${sendDomain}>`, to: [owner], subject: c.subject, html: renderEmail(EMAIL_STYLE, c, sender), text: renderText(c, sender) }),
      }).catch(() => null)
    }
  }
  return json({ ok: true })
}
