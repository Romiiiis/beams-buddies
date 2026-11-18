import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { EMAIL_STYLE, senderFrom } from '@/lib/automation-email'
import { renderEmail, renderText, type EmailContent } from '@/lib/email-theme'
import { SITE_URL } from '@/lib/booking-token'
import { verifyStripeSignature } from '@/lib/stripe'

// Stripe tells us (a "Connect" webhook, covering every connected business) when a card payment succeeded.
// The invoice is only touched when the signature is valid AND the event came from the Stripe account that
// belongs to the invoice's business.

const DEFAULT_SEND_DOMAIN = 'mail.jobyra.app'
const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/
const money = (n: unknown) => `$${Number(n || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const clean = (v: unknown) => String(v ?? '').trim()

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret || !key) return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  const raw = await request.text()
  if (!verifyStripeSignature(raw, request.headers.get('stripe-signature'), secret)) return NextResponse.json({ error: 'bad_signature' }, { status: 400 })

  let event: any
  try { event = JSON.parse(raw) } catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }) }
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', key, { auth: { persistSession: false, autoRefreshToken: false } })

  if (event.type === 'account.updated' && event.account) {
    await db.from('business_stripe').update({ charges_enabled: !!event.data?.object?.charges_enabled, updated_at: new Date().toISOString() }).eq('account_id', event.account)
    return NextResponse.json({ received: true })
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const s = event.data?.object || {}
    const invoiceId = clean(s.metadata?.invoice_id)
    if (s.payment_status !== 'paid' || !invoiceId || !event.account) return NextResponse.json({ received: true })

    const { data: inv } = await db.from('invoices').select('id, business_id, invoice_number, customers(first_name, last_name)').eq('id', invoiceId).maybeSingle()
    if (!inv) return NextResponse.json({ received: true })
    const { data: link } = await db.from('business_stripe').select('account_id').eq('business_id', inv.business_id).maybeSingle()
    if (!link || link.account_id !== event.account) return NextResponse.json({ received: true })

    const amount = Math.round(Number(s.amount_total || 0)) / 100
    if (amount <= 0) return NextResponse.json({ received: true })
    const { error } = await db.from('invoice_payments').insert({ business_id: inv.business_id, invoice_id: inv.id, amount, method: 'card', note: 'Paid by card (Stripe)', stripe_session_id: clean(s.id) })
    if (error) {
      // A repeated delivery of the same session hits the unique index: that is fine, it is already recorded.
      if ((error as any).code === '23505') return NextResponse.json({ received: true })
      return NextResponse.json({ error: 'failed' }, { status: 500 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const { data: business } = await db.from('businesses').select('name, phone, email, logo_url, email_domain, email_domain_verified').eq('id', inv.business_id).single()
      const owner = clean(business?.email)
      if (business && EMAIL.test(owner)) {
        const cust: any = Array.isArray((inv as any).customers) ? (inv as any).customers[0] : (inv as any).customers
        const who = [cust?.first_name, cust?.last_name].map(clean).filter(Boolean).join(' ') || 'A customer'
        const number = clean(inv.invoice_number)
        const c: EmailContent = {
          kind: 'invoice',
          subject: `${who} paid invoice ${number} by card`,
          preheader: `${money(amount)} received by card.`,
          label: 'Payment received',
          headline: `${who} paid by card`,
          greeting: '',
          paragraphs: [`Invoice ${number} was paid by card. Jobyra has marked it as paid. The money goes to your Stripe account and is paid out to your bank on Stripe's normal schedule.`],
          highlight: { label: 'Amount', value: money(amount), sub: `Invoice ${number}`, chip: { text: 'Paid by card', tone: 'good' } },
          facts: [['Invoice', number], ['Customer', who]],
          closing: [],
          button: { text: 'Open invoices', href: `${SITE_URL}/dashboard/invoices` },
          signoff: '',
          footer: 'You are getting this because a customer paid one of your invoices by card.',
        }
        const ownDomain = clean((business as any).email_domain).toLowerCase()
        const sendDomain = (business as any).email_domain_verified && DOMAIN.test(ownDomain) ? ownDomain : DEFAULT_SEND_DOMAIN
        const name = clean(business.name).replace(/[\r\n<>"\\]/g, '').slice(0, 80) || 'Jobyra'
        const sender = senderFrom(business)
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: `${name} <invoices@${sendDomain}>`, to: [owner], subject: c.subject, html: renderEmail(EMAIL_STYLE, c, sender), text: renderText(c, sender) }),
        }).catch(() => null)
      }
    }
  }
  return NextResponse.json({ received: true })
}
