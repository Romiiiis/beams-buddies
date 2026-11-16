import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { customerFromToken } from '@/lib/unsubscribe-token'

// Lets a customer stop (or restart) reminder and follow-up emails from the link at the bottom of an email.
//
// Security: the signed link is the only key (see lib/unsubscribe-token.ts). There is no signed-in user, so this uses
// the service-role key, and it only ever touches the one customer named in the link, and only the two unsubscribe
// fields. Nothing about the customer is sent back, only the business name.
//
// GET  ?token=...   what the page needs to show
// POST ?token=...   unsubscribe. Mail apps call this for their own Unsubscribe button (one click, form body).
//                   The page sends JSON: { resubscribe: true } turns the emails back on.

const json = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

function admin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', key, { auth: { persistSession: false, autoRefreshToken: false } })
}

type Db = NonNullable<ReturnType<typeof admin>>

async function find(db: Db, customerId: string) {
  const { data: customer } = await db.from('customers').select('id, business_id, email_opt_out').eq('id', customerId).maybeSingle()
  if (!customer) return null
  const { data: business } = await db.from('businesses').select('name').eq('id', customer.business_id).maybeSingle()
  return { optedOut: !!customer.email_opt_out, business: String(business?.name || '').trim() }
}

export async function GET(request: Request) {
  const db = admin()
  if (!db) return json({ error: 'not_configured', message: 'This link is not available right now.' }, 503)
  const customerId = customerFromToken(new URL(request.url).searchParams.get('token') || '')
  if (!customerId) return json({ error: 'invalid', message: 'This link is not valid.' }, 404)
  const found = await find(db, customerId)
  if (!found) return json({ error: 'invalid', message: 'This link is not valid.' }, 404)
  return json(found)
}

export async function POST(request: Request) {
  const db = admin()
  if (!db) return json({ error: 'not_configured', message: 'This link is not available right now.' }, 503)
  const customerId = customerFromToken(new URL(request.url).searchParams.get('token') || '')
  if (!customerId) return json({ error: 'invalid', message: 'This link is not valid.' }, 404)

  // Only the page asks to turn emails back on; anything else (including a mail app's one-click call) unsubscribes
  let resubscribe = false
  if ((request.headers.get('content-type') || '').includes('application/json')) {
    try {
      resubscribe = (await request.json())?.resubscribe === true
    } catch {}
  }

  const { data, error } = await db
    .from('customers')
    .update({ email_opt_out: !resubscribe, email_opt_out_at: resubscribe ? null : new Date().toISOString() })
    .eq('id', customerId)
    .select('id')
    .maybeSingle()
  if (error) return json({ error: 'failed', message: 'Sorry, that did not work. Please try again.' }, 500)
  if (!data) return json({ error: 'invalid', message: 'This link is not valid.' }, 404)
  return json({ ok: true, optedOut: !resubscribe })
}
