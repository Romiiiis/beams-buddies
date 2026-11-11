import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { buildMoved, buildOnTheWay, buildVisit, renderEmail, renderText, type EmailContent, type EmailSender } from '@/lib/email-theme'
import { emailLogoUrl, formatPhone } from '@/lib/automation-email'
import { customerAddress, durationLabel, minutesBetween, VISIT_KINDS } from '@/lib/schedule'

// Emails the customer about a booked visit, on request from the visit window: a reminder ("Email a reminder"),
// "on my way", or "your visit has a new time". Each one is kept in visit_messages so Marketing can show it.
//
// Security: the caller's Supabase session token is forwarded, so the visit and the customer are read as that user,
// under the normal business-scoped rules. Nobody can email another business's customers. The day and time wording
// comes from the browser (the server does not know the business's time zone) and is cleaned before it is used.
// The technician's internal notes are never put in this email.

const DEFAULT_SEND_DOMAIN = 'mail.jobyra.app'
const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/
const DAILY_LIMIT = 100 // per business, across all three kinds
const KINDS = ['reminder', 'on_the_way', 'moved'] as const
type Kind = (typeof KINDS)[number]

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status })
}

const safeName = (name: string) => name.replace(/[\r\n<>"\\]/g, '').trim().slice(0, 80) || 'Jobyra'
const label = (v: unknown, max: number) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max)

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
  const visitId = body?.visit_id
  if (typeof visitId !== 'string' || !UUID.test(visitId)) return json({ error: 'bad_request', message: 'Invalid visit.' }, 400)
  const kind: Kind = KINDS.includes(body?.kind) ? body.kind : 'reminder'
  const when = label(body?.when, 60)
  const time = label(body?.time, 60)
  if (!when || !time) return json({ error: 'bad_request', message: 'Missing the day and time.' }, 400)
  const eta = label(body?.eta, 40)
  const wasWhen = label(body?.was_when, 60)
  const wasTime = label(body?.was_time, 60)
  if (kind === 'moved' && (!wasWhen || !wasTime)) return json({ error: 'bad_request', message: 'Missing the earlier day and time.' }, 400)

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: authData, error: authError } = await supabase.auth.getUser(token)
  if (authError || !authData.user) return json({ error: 'unauthorized', message: 'Please sign in again.' }, 401)

  const { data: userRow } = await supabase.from('users').select('business_id').eq('id', authData.user.id).single()
  if (!userRow?.business_id) return json({ error: 'forbidden', message: 'No business found for this account.' }, 403)
  const businessId = userRow.business_id as string

  const [{ data: visit }, { data: business }] = await Promise.all([
    supabase
      .from('job_visits')
      .select('*, customers(first_name, last_name, email, address, suburb, state, postcode), jobs(brand, model), staff_members(name)')
      .eq('id', visitId)
      .eq('business_id', businessId)
      .single(),
    supabase.from('businesses').select('name, phone, email, logo_url, email_domain, email_domain_verified').eq('id', businessId).single(),
  ])
  if (!visit) return json({ error: 'not_found', message: 'Visit not found.' }, 404)

  const v = visit as any
  if (v.status === 'cancelled' || v.status === 'completed') return json({ error: 'not_needed', message: 'This visit is already finished or cancelled.' }, 400)
  const to = String(v.customers?.email || '').trim()
  if (!EMAIL.test(to)) return json({ error: 'no_email', message: 'This customer has no email address saved.' }, 400)

  const sender: EmailSender = {
    name: String(business?.name || '').trim(),
    phone: formatPhone(business?.phone),
    email: String(business?.email || '').trim(),
    logoUrl: emailLogoUrl(business?.logo_url),
  }
  const kindLabel = VISIT_KINDS.find(k => k.value === v.kind)?.label || 'Visit'
  const equipment = [v.jobs?.brand, v.jobs?.model].map((x: unknown) => String(x || '').trim()).filter(Boolean).join(' ')
  const tech = String(v.staff_members?.name || '').trim().split(/\s+/)[0]
  const parts = {
    first: String(v.customers?.first_name || '').trim(),
    when,
    time,
    what: kindLabel,
    equipment: equipment || undefined,
    address: customerAddress(v.customers) || undefined,
    tech: tech || undefined,
  }
  const length = durationLabel(Math.max(15, minutesBetween(new Date(v.start_at), new Date(v.end_at))))
  const content: EmailContent =
    kind === 'on_the_way'
      ? buildOnTheWay({ ...parts, eta: eta || undefined }, sender)
      : kind === 'moved'
        ? buildMoved({ ...parts, length, wasWhen, wasTime }, sender)
        : buildVisit({ ...parts, length }, sender)

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase.from('visit_messages').select('id', { count: 'exact', head: true }).eq('business_id', businessId).gte('sent_at', since)
  if ((count ?? 0) >= DAILY_LIMIT) return json({ error: 'rate_limited', message: `Daily limit of ${DAILY_LIMIT} visit emails reached. Try again tomorrow.` }, 429)

  const ownDomain = String((business as any)?.email_domain || '').trim().toLowerCase()
  const sendDomain = (business as any)?.email_domain_verified && DOMAIN.test(ownDomain) ? ownDomain : DEFAULT_SEND_DOMAIN
  const replyTo = EMAIL.test(sender.email || '') ? sender.email : undefined

  const html = renderEmail('classic', content, sender)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${safeName(sender.name)} <reminders@${sendDomain}>`,
      to: [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject: content.subject,
      html,
      text: renderText(content, sender),
    }),
  })
  const result = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('Resend error:', res.status, result)
    return json({ error: 'send_failed', message: 'The email could not be sent. Please try again shortly.' }, 502)
  }

  // Remember it, so the visit window can show when it went and the automatic job does not send the same one again
  const sentAt = new Date().toISOString()
  await Promise.all([
    // Only a reminder counts for the automatic reminder (it must not send a second one for the same time)
    kind === 'reminder' ? supabase.from('visit_reminders').insert({ business_id: businessId, visit_id: visitId, for_start: v.start_at, to_email: to, source: 'manual', sent_at: sentAt }) : Promise.resolve(),
    supabase.from('visit_messages').insert({ business_id: businessId, visit_id: visitId, kind, to_email: to, subject: content.subject, body_html: html, sent_by: authData.user.id, sent_at: sentAt }),
  ])
  return json({ ok: true, to, sent_at: sentAt, kind }, 200)
}
