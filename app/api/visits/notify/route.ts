import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { renderEmail, renderText, type EmailContent } from '@/lib/email-theme'
import { emailLogoUrl, formatPhone } from '@/lib/automation-email'
import { customerName, durationLabel, mapsUrl, minutesBetween, visitAddress, VISIT_KINDS } from '@/lib/schedule'

// Emails a technician the details of a visit they have been given.
//
// Security: the caller's Supabase session token is forwarded, so the visit, the customer and the technician
// are all read as that user, under the normal business-scoped rules. Nobody can email another business's team.
// The date and time text comes from the browser (the server does not know the business's timezone) and is
// escaped before it goes into the email.

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
  const when = label(body?.when, 60)
  const time = label(body?.time, 60)
  const repeat = label(body?.repeat, 120)

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
      .select('*, customers(first_name, last_name, phone, address, suburb, state, postcode), jobs(brand, model), staff_members(name, email), customer_sites(label, address, suburb, state, postcode)')
      .eq('id', visitId)
      .eq('business_id', businessId)
      .single(),
    supabase.from('businesses').select('name, phone, email, logo_url, email_domain, email_domain_verified').eq('id', businessId).single(),
  ])
  if (!visit) return json({ error: 'not_found', message: 'Visit not found.' }, 404)

  const staff = (visit as any).staff_members as { name: string; email: string | null } | null
  const to = String(staff?.email || '').trim()
  if (!staff || !EMAIL.test(to)) return json({ error: 'no_email', message: 'This technician has no email address saved.' }, 400)

  const bizName = String(business?.name || '').trim()
  const sender = {
    name: bizName,
    phone: formatPhone(business?.phone),
    email: String(business?.email || '').trim(),
    logoUrl: emailLogoUrl(business?.logo_url),
  }

  const c: any = (visit as any).customers
  const who = customerName(c)
  const address = visitAddress({ customer_sites: (visit as any).customer_sites, customers: c })
  const kind = VISIT_KINDS.find(k => k.value === (visit as any).kind)?.label || 'visit'
  const first = staff.name.trim().split(/\s+/)[0] || 'there'
  const minutes = minutesBetween(new Date((visit as any).start_at), new Date((visit as any).end_at))
  const unit = [(visit as any).jobs?.brand, (visit as any).jobs?.model].filter(Boolean).join(' ')

  const facts: [string, string][] = []
  if (who) facts.push(['Customer', who])
  if (c?.phone) facts.push(['Phone', formatPhone(c.phone)])
  if (address) facts.push(['Address', address])
  if (unit) facts.push(['Equipment', unit])
  if (repeat) facts.push(['Repeats', repeat])
  if ((visit as any).notes) facts.push(['Notes', String((visit as any).notes)])

  const content: EmailContent = {
    kind: 'service',
    subject: `New job${when ? `: ${when}` : ''}${time ? ` ${time.split(' to ')[0]}` : ''}${who ? ` | ${who}` : ''}`,
    preheader: `${kind}${who ? ` for ${who}` : ''}${address ? ` at ${address}` : ''}.`,
    label: 'New job',
    headline: `${first}, you have a ${kind.toLowerCase()}${when ? ` on ${when}` : ''}`,
    greeting: `Hi ${first},`,
    paragraphs: [`${bizName || 'Your team'} has booked you in for a ${kind.toLowerCase()}${who ? ` with ${who}` : ''}. The details are below.`],
    highlight: when || time ? { label: 'When', value: when || time, sub: when && time ? time : undefined, chip: { text: durationLabel(minutes), tone: 'neutral' } } : undefined,
    facts,
    closing: ['It is also on your phone calendar if you have added your calendar link.'],
    button: address ? { text: 'Get directions', href: mapsUrl(address) } : undefined,
    signoff: 'Thanks,',
    footer: `You are getting this because ${bizName || 'your employer'} gave you a job on Jobyra.`,
  }

  const ownDomain = String((business as any)?.email_domain || '').trim().toLowerCase()
  const sendDomain = (business as any)?.email_domain_verified && DOMAIN.test(ownDomain) ? ownDomain : DEFAULT_SEND_DOMAIN
  const replyTo = EMAIL.test(sender.email) ? sender.email : undefined

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${safeName(bizName)} <schedule@${sendDomain}>`,
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
  return json({ ok: true, to }, 200)
}
