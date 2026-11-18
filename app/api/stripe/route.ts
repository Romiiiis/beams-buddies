import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/booking-token'
import { stripeApi, stripeConfigured } from '@/lib/stripe'

// Signed-in business owners connect (or disconnect) their own Stripe account here.
//   action "connect"    -> creates the Stripe account if needed and returns the Stripe onboarding link
//   action "status"     -> asks Stripe whether the account can take card payments yet
//   action "disconnect" -> forgets the link (the Stripe account itself is untouched)

const json = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

export async function POST(request: Request) {
  if (!stripeConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'not_configured', message: 'Card payments are not switched on for Jobyra yet.' }, 503)
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'unauthorized', message: 'Please sign in again.' }, 401)
  let action = ''
  try { action = String((await request.json())?.action || '') } catch { return json({ error: 'bad_request', message: 'Invalid request.' }, 400) }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } })
  const { data: auth, error: authError } = await anon.auth.getUser(token)
  if (authError || !auth.user) return json({ error: 'unauthorized', message: 'Please sign in again.' }, 401)
  const { data: userRow } = await anon.from('users').select('business_id').eq('id', auth.user.id).single()
  if (!userRow?.business_id) return json({ error: 'forbidden', message: 'No business found for this account.' }, 403)
  const businessId = userRow.business_id as string

  const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: row } = await db.from('business_stripe').select('account_id, charges_enabled').eq('business_id', businessId).maybeSingle()

  if (action === 'disconnect') {
    await db.from('business_stripe').delete().eq('business_id', businessId)
    return json({ ok: true, connected: false, ready: false })
  }

  if (action === 'status') {
    if (!row) return json({ ok: true, connected: false, ready: false })
    const r = await stripeApi<any>('GET', `/accounts/${row.account_id}`)
    if (!r.ok) return json({ ok: true, connected: true, ready: !!row.charges_enabled })
    const ready = !!r.data.charges_enabled
    if (ready !== row.charges_enabled) await db.from('business_stripe').update({ charges_enabled: ready, updated_at: new Date().toISOString() }).eq('business_id', businessId)
    return json({ ok: true, connected: true, ready })
  }

  if (action === 'connect') {
    let accountId = row?.account_id as string | undefined
    if (!accountId) {
      const { data: biz } = await db.from('businesses').select('name, email').eq('id', businessId).single()
      const created = await stripeApi<any>('POST', '/accounts', { type: 'standard', country: 'AU', email: biz?.email || undefined, business_profile: { name: biz?.name || undefined }, metadata: { jobyra_business_id: businessId } })
      if (!created.ok || !created.data?.id) return json({ error: 'stripe', message: created.data?.error?.message || 'Stripe could not start the connection. Please try again.' }, 502)
      accountId = created.data.id as string
      const { error } = await db.from('business_stripe').upsert({ business_id: businessId, account_id: accountId, charges_enabled: false, updated_at: new Date().toISOString() })
      if (error) return json({ error: 'failed', message: 'Sorry, that did not save. Please try again.' }, 500)
    }
    const link = await stripeApi<any>('POST', '/account_links', { account: accountId, type: 'account_onboarding', refresh_url: `${SITE_URL}/dashboard/settings?stripe=refresh`, return_url: `${SITE_URL}/dashboard/settings?stripe=return` })
    if (!link.ok || !link.data?.url) return json({ error: 'stripe', message: link.data?.error?.message || 'Stripe could not open the setup page. Please try again.' }, 502)
    return json({ ok: true, url: link.data.url })
  }

  return json({ error: 'bad_request', message: 'Invalid request.' }, 400)
}
