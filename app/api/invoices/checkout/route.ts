import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/booking-token'
import { stripeApi, stripeConfigured } from '@/lib/stripe'

// A customer taps "Pay by card" on the public invoice page. We create a Stripe Checkout page on the business's own
// Stripe account for exactly what is still owing, and send the customer there. The invoice is found only by its
// unguessable public token. The webhook (app/api/stripe/webhook) records the payment once Stripe confirms it.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/
const json = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

export async function POST(request: Request) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || !stripeConfigured()) return json({ error: 'not_configured', message: 'Card payment is not available right now.' }, 503)
  let token = ''
  try { token = String((await request.json())?.token || '').trim() } catch { return json({ error: 'bad_request', message: 'Invalid request.' }, 400) }
  if (!UUID.test(token)) return json({ error: 'invalid', message: 'This link is not valid.' }, 404)

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: inv } = await db.from('invoices').select('id, business_id, invoice_number, status, total, amount_paid, customers(email)').eq('public_token', token).maybeSingle()
  if (!inv || inv.status === 'draft' || inv.status === 'cancelled') return json({ error: 'invalid', message: 'This link is not valid.' }, 404)
  const owing = Math.round((Number(inv.total) - Number(inv.amount_paid || 0)) * 100)
  if (inv.status === 'paid' || owing <= 0) return json({ error: 'paid', message: 'This invoice has already been paid.' }, 409)

  const [{ data: stripe }, { data: settings }, { data: biz }] = await Promise.all([
    db.from('business_stripe').select('account_id, charges_enabled').eq('business_id', inv.business_id).maybeSingle(),
    db.from('business_settings').select('payment_mode').eq('business_id', inv.business_id).maybeSingle(),
    db.from('businesses').select('name').eq('id', inv.business_id).single(),
  ])
  if (!stripe?.charges_enabled || !['card', 'both'].includes(settings?.payment_mode || '')) return json({ error: 'unavailable', message: 'Card payment is not available for this invoice.' }, 409)

  const cust: any = Array.isArray((inv as any).customers) ? (inv as any).customers[0] : (inv as any).customers
  const number = String(inv.invoice_number || '')
  const session = await stripeApi<any>('POST', '/checkout/sessions', {
    mode: 'payment',
    line_items: [{ quantity: 1, price_data: { currency: 'aud', unit_amount: owing, product_data: { name: `Invoice ${number}`, description: biz?.name ? `From ${biz.name}` : undefined } } }],
    customer_email: cust?.email && EMAIL.test(String(cust.email)) ? String(cust.email) : undefined,
    success_url: `${SITE_URL}/invoice/${token}?paid=1`,
    cancel_url: `${SITE_URL}/invoice/${token}`,
    metadata: { invoice_id: inv.id, business_id: inv.business_id },
    payment_intent_data: { description: `Invoice ${number}`, metadata: { invoice_id: inv.id, invoice_number: number } },
  }, stripe.account_id)
  if (!session.ok || !session.data?.url) return json({ error: 'stripe', message: 'Sorry, the card page did not open. Please try again.' }, 502)
  return json({ ok: true, url: session.data.url })
}
