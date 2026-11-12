import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { jobFromToken } from '@/lib/booking-token'
import { computeSlots, safeZone, type Slot } from '@/lib/booking-slots'
import { EMAIL_STYLE, formatPhone, senderFrom } from '@/lib/automation-email'
import { buildVisit, renderEmail, renderText } from '@/lib/email-theme'
import { getEquipmentLabel } from '@/lib/industry-config'

// Public booking for a service. The link in the customer's reminder email carries a signed job id (see
// lib/booking-token.ts). GET returns the free times; POST books one. There is no signed-in user, so this uses the
// service-role key and every query is limited to the business that owns the job named in the link. A time is only
// booked if it is still one of the free times the server works out itself, so a customer cannot pick any other time.

export const maxDuration = 30

const DURATION_MIN = 60
const DAYS_AHEAD = 14
const DEFAULT_SEND_DOMAIN = 'mail.jobyra.app'
const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/

const json = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
const clean = (v: unknown) => String(v ?? '').trim()

function admin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', key, { auth: { persistSession: false, autoRefreshToken: false } })
}

type Db = NonNullable<ReturnType<typeof admin>>

async function load(db: Db, jobId: string) {
  const { data: job } = await db
    .from('jobs')
    .select('id, business_id, customer_id, site_id, brand, model, equipment_type, install_location, customers(first_name, last_name, email, phone, address, suburb, state, postcode), customer_sites(label, address, suburb, state, postcode)')
    .eq('id', jobId)
    .maybeSingle()
  if (!job) return null
  const [{ data: business }, { data: staff }] = await Promise.all([
    db.from('businesses').select('name, phone, email, logo_url, timezone, email_domain, email_domain_verified').eq('id', job.business_id).single(),
    db.from('staff_members').select('id, name, work_days, work_start, work_end').eq('business_id', job.business_id).eq('active', true),
  ])
  if (!business) return null
  const staffIds = (staff || []).map(s => s.id as string)
  const now = new Date()
  const horizon = new Date(now.getTime() + (DAYS_AHEAD + 2) * 86400000).toISOString()
  const [{ data: visits }, { data: timeOff }, { data: upcoming }] = await Promise.all([
    db.from('job_visits').select('staff_id, start_at, end_at, status').eq('business_id', job.business_id).neq('status', 'cancelled').gt('end_at', now.toISOString()).lt('start_at', horizon),
    staffIds.length ? db.from('staff_time_off').select('staff_id, start_date, end_date').in('staff_id', staffIds) : Promise.resolve({ data: [] as { staff_id: string; start_date: string; end_date: string }[] }),
    db.from('job_visits').select('id, start_at, end_at').eq('job_id', job.id).eq('status', 'scheduled').gt('start_at', now.toISOString()).order('start_at').limit(1),
  ])
  const tz = safeZone((business as any).timezone)
  const slots = computeSlots({ tz, now, staff: (staff || []) as any, timeOff: (timeOff || []) as any, visits: (visits || []) as any, durationMin: DURATION_MIN, days: DAYS_AHEAD })
  return { job: job as any, business: business as any, staff: staff || [], tz, slots, upcoming: (upcoming || [])[0] as { id: string; start_at: string; end_at: string } | undefined }
}

const fmt = (tz: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-AU', { timeZone: tz, ...opts })
const dayLabel = (d: Date, tz: string) => fmt(tz, { weekday: 'short', day: 'numeric', month: 'short' }).format(d).replace(',', '')
const clockLabel = (d: Date, tz: string) => fmt(tz, { hour: 'numeric', minute: '2-digit', hour12: true }).format(d).replace(/\s/g, '').toLowerCase()
const dateKey = (d: Date, tz: string) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)

function describe(job: any) {
  const unit = [job.brand, job.model].map(clean).filter(Boolean).join(' ') || getEquipmentLabel(job.equipment_type) || 'system'
  const place = job.customer_sites && [job.customer_sites.address, job.customer_sites.suburb].some(Boolean) ? job.customer_sites : job.customers || {}
  const address = [place.address, place.suburb, place.state, place.postcode].map(clean).filter(Boolean).join(', ')
  return { unit, address }
}

export async function GET(request: Request) {
  const db = admin()
  if (!db) return json({ error: 'not_configured', message: 'Online booking is not set up yet.' }, 503)
  const jobId = jobFromToken(new URL(request.url).searchParams.get('token') || '')
  if (!jobId) return json({ error: 'invalid', message: 'This booking link is not valid.' }, 404)
  const ctx = await load(db, jobId)
  if (!ctx) return json({ error: 'invalid', message: 'This booking link is not valid.' }, 404)
  const { job, business, tz, slots, upcoming } = ctx
  const { unit, address } = describe(job)
  const base = {
    business: { name: clean(business.name), phone: formatPhone(business.phone), logoUrl: clean(business.logo_url) || null },
    first: clean(job.customers?.first_name),
    unit,
    address,
    minutes: DURATION_MIN,
  }
  if (upcoming) {
    const s = new Date(upcoming.start_at)
    return json({ ...base, booked: { when: dayLabel(s, tz), time: `${clockLabel(s, tz)} to ${clockLabel(new Date(upcoming.end_at), tz)}` } })
  }
  const byDay = new Map<string, { date: string; label: string; times: { start: string; label: string }[] }>()
  for (const sl of slots) {
    const d = new Date(sl.startMs)
    const key = dateKey(d, tz)
    if (!byDay.has(key)) byDay.set(key, { date: key, label: dayLabel(d, tz), times: [] })
    byDay.get(key)!.times.push({ start: d.toISOString(), label: clockLabel(d, tz) })
  }
  return json({ ...base, days: [...byDay.values()] })
}

async function sendMail(apiKey: string, from: string, to: string, replyTo: string | undefined, subject: string, html: string, text: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], ...(replyTo ? { reply_to: replyTo } : {}), subject, html, text }),
  })
  return res.ok
}

export async function POST(request: Request) {
  const db = admin()
  if (!db) return json({ error: 'not_configured', message: 'Online booking is not set up yet.' }, 503)
  let body: any
  try {
    body = await request.json()
  } catch {
    return json({ error: 'bad_request', message: 'Invalid request.' }, 400)
  }
  const jobId = jobFromToken(clean(body?.token))
  if (!jobId) return json({ error: 'invalid', message: 'This booking link is not valid.' }, 404)
  const wanted = Date.parse(clean(body?.start))
  if (!wanted) return json({ error: 'bad_request', message: 'Pick a time.' }, 400)

  const ctx = await load(db, jobId)
  if (!ctx) return json({ error: 'invalid', message: 'This booking link is not valid.' }, 404)
  const { job, business, tz, slots, upcoming } = ctx
  if (upcoming) return json({ error: 'already_booked', message: 'This service is already booked in.' }, 409)
  const slot: Slot | undefined = slots.find(s => s.startMs === wanted)
  if (!slot) return json({ error: 'taken', message: 'Sorry, that time has just been taken. Please pick another.' }, 409)

  const start = new Date(slot.startMs)
  const end = new Date(slot.endMs)
  const { unit, address } = describe(job)
  const customer = job.customers || {}
  const { data: visit, error } = await db
    .from('job_visits')
    .insert({
      business_id: job.business_id,
      job_id: job.id,
      site_id: job.site_id || null,
      customer_id: job.customer_id,
      staff_id: slot.staffId,
      title: 'Service',
      kind: 'service',
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status: 'scheduled',
      notes: 'Booked online by the customer',
    })
    .select('id')
    .single()
  if (error || !visit) return json({ error: 'failed', message: 'Sorry, we could not book that. Please try again or contact us.' }, 500)
  // It is no longer waiting to be booked
  await db.from('to_book').delete().eq('job_id', job.id)

  // Confirmation to the customer and a heads-up to the business (best effort: the booking already stands)
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    const sender = senderFrom(business)
    const ownDomain = clean(business.email_domain).toLowerCase()
    const sendDomain = business.email_domain_verified && DOMAIN.test(ownDomain) ? ownDomain : DEFAULT_SEND_DOMAIN
    const name = clean(business.name).replace(/[\r\n<>"\\]/g, '').trim().slice(0, 80) || 'Jobyra'
    const from = `${name} <reminders@${sendDomain}>`
    const replyTo = sender.email && EMAIL.test(sender.email) ? sender.email : undefined
    const when = dayLabel(start, tz)
    const time = `${clockLabel(start, tz)} to ${clockLabel(end, tz)}`
    const to = clean(customer.email)
    if (EMAIL.test(to)) {
      const c = buildVisit({ first: clean(customer.first_name), when, time, length: '1 hr', what: 'Service', equipment: unit, address: address || undefined }, sender)
      const first = clean(customer.first_name) || 'there'
      c.subject = `You are booked in: ${when} at ${clockLabel(start, tz)} | ${sender.name || 'Your service'}`
      c.preheader = `Your service is booked for ${when} at ${clockLabel(start, tz)}.`
      c.label = 'Booking confirmed'
      c.headline = `Hi ${first.charAt(0).toUpperCase() + first.slice(1)}, you are booked in`
      c.paragraphs = [`Thanks for booking online. Your service with ${sender.name || 'us'} is confirmed. The details are below, and we will send a reminder the day before.`]
      await sendMail(apiKey, from, to, replyTo, c.subject, renderEmail(EMAIL_STYLE, c, sender), renderText(c, sender))
    }
    const owner = clean(business.email)
    if (EMAIL.test(owner)) {
      const who = [customer.first_name, customer.last_name].map(clean).filter(Boolean).join(' ') || 'A customer'
      const text = `${who} booked their service online.\n\n${when}, ${time}\n${unit}${address ? `\n${address}` : ''}${customer.phone ? `\n${customer.phone}` : ''}\n\nIt is on your calendar now.`
      await sendMail(apiKey, from, owner, undefined, `New online booking: ${who}, ${when} at ${clockLabel(start, tz)}`, `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`, text)
    }
  }

  return json({ ok: true, when: dayLabel(start, tz), time: `${clockLabel(start, tz)} to ${clockLabel(end, tz)}` })
}
