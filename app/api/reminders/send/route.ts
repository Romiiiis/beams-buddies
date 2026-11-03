import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { reminderHtml, reminderSubject, reminderText, type ReminderSender } from '@/lib/reminder-email'

// Sends a service reminder email (design C) to a job's customer through Resend.
//
// Security: the caller's Supabase session token is forwarded, so every read and write below runs
// as that user under the normal business-scoped rules. A user can only send reminders for jobs
// that belong to their own business. No service-role key is used.

const DEFAULT_SEND_DOMAIN = 'mail.jobyra.app'
const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i
const DAILY_LIMIT = 50 // per business, keeps well inside Resend's free daily allowance
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status })
}

// Display names go into an email header, so strip anything that could break it
function safeDisplayName(name: string) {
  return name.replace(/[\r\n<>"\\]/g, '').trim().slice(0, 80) || 'Jobyra'
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // The app falls back to opening a plain-text draft in the user's mail app
    return json({ error: 'not_configured', message: 'Email sending is not set up yet.' }, 503)
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'unauthorized', message: 'Please sign in again.' }, 401)

  let jobId: unknown
  try {
    ;({ job_id: jobId } = await request.json())
  } catch {
    return json({ error: 'bad_request', message: 'Invalid request.' }, 400)
  }
  if (typeof jobId !== 'string' || !UUID.test(jobId)) return json({ error: 'bad_request', message: 'Invalid job.' }, 400)

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: authData, error: authError } = await supabase.auth.getUser(token)
  if (authError || !authData.user) return json({ error: 'unauthorized', message: 'Please sign in again.' }, 401)

  const { data: userRow } = await supabase.from('users').select('business_id').eq('id', authData.user.id).single()
  if (!userRow?.business_id) return json({ error: 'forbidden', message: 'No business found for this account.' }, 403)
  const businessId = userRow.business_id as string

  // Business-scoped rules mean this only finds jobs belonging to the caller's business
  const [{ data: job }, { data: business }] = await Promise.all([
    supabase
      .from('jobs')
      .select('*, customers(first_name, last_name, email, phone, address, suburb)')
      .eq('id', jobId)
      .eq('business_id', businessId)
      .single(),
    supabase.from('businesses').select('name, phone, email, email_domain, email_domain_verified').eq('id', businessId).single(),
  ])
  if (!job) return json({ error: 'not_found', message: 'Job not found.' }, 404)

  const to = String((job as any).customers?.email || '').trim()
  if (!EMAIL.test(to)) return json({ error: 'no_email', message: 'This customer has no valid email address saved.' }, 400)

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('reminder_emails')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('sent_at', since)
  if ((count ?? 0) >= DAILY_LIMIT) {
    return json({ error: 'rate_limited', message: `Daily limit of ${DAILY_LIMIT} reminder emails reached. Try again tomorrow.` }, 429)
  }

  const sender: ReminderSender = { name: business?.name || '', phone: business?.phone || '', email: business?.email || '' }
  const subject = reminderSubject(job, sender)
  const replyTo = EMAIL.test(sender.email.trim()) ? sender.email.trim() : undefined

  // A business sends from its own domain once Jobyra has verified it in Resend (owner-only setting)
  const ownDomain = String((business as any)?.email_domain || '').trim().toLowerCase()
  const sendDomain = (business as any)?.email_domain_verified && DOMAIN.test(ownDomain) ? ownDomain : DEFAULT_SEND_DOMAIN

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${safeDisplayName(sender.name)} <reminders@${sendDomain}>`,
      to: [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html: reminderHtml(job, sender),
      text: reminderText(job, sender),
    }),
  })

  const result = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('Resend error:', res.status, result)
    return json({ error: 'send_failed', message: 'The email could not be sent. Please try again shortly.' }, 502)
  }

  const sentAt = new Date().toISOString()
  await Promise.all([
    supabase.from('reminder_emails').insert({
      business_id: businessId,
      job_id: jobId,
      customer_id: (job as any).customer_id ?? null,
      to_email: to,
      subject,
      provider_id: (result as any)?.id ?? null,
      sent_at: sentAt,
    }),
    supabase.from('jobs').update({ last_reminder_at: sentAt }).eq('id', jobId).eq('business_id', businessId),
  ])

  return json({ ok: true, sent_at: sentAt, to }, 200)
}
