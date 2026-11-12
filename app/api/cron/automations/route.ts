import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { overdueContent, quoteContent, renderAutomation, reviewContent, senderFrom, serviceContent, visitContent } from '@/lib/automation-email'
import { applyCopy, type EmailCopy } from '@/lib/email-copy'
import { bookingUrl } from '@/lib/booking-token'
import { nextServiceDate, toYMD } from '@/lib/service'
import { AUTOMATION_DEFAULT_DAYS, overdueDue, quoteDue, reviewDue, serviceDue, visitDue } from '@/lib/automation-rules'

// Runs once a day (see vercel.json). For every business with an automation switched on, sends the
// matching customer emails through Resend, at most once per job / invoice / quote.
//
// Security: only callable with the CRON_SECRET (Vercel sends it as a Bearer token). It uses the
// service-role key because no user is signed in, so every query below is filtered by business_id.

export const maxDuration = 60

const DEFAULT_SEND_DOMAIN = 'mail.jobyra.app'
const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/
const PER_BUSINESS_LIMIT = 30

type Kind = 'service' | 'overdue' | 'quote' | 'review' | 'visit'

function safeDisplayName(name: string) {
  return name.replace(/[\r\n<>"\\]/g, '').trim().slice(0, 80) || 'Jobyra'
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const apiKey = process.env.RESEND_API_KEY
  if (!secret || !serviceKey || !apiKey) {
    return NextResponse.json({ error: 'not_configured', message: 'Automations need CRON_SECRET, SUPABASE_SERVICE_ROLE_KEY and RESEND_API_KEY.' }, { status: 503 })
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: enabledRows } = await db.from('automation_settings').select('business_id, kind, days, subject, intro, closing').eq('enabled', true)
  // Owner-level pause: businesses with auto_reminders_enabled = false are manual only, whatever
  // they have switched on in Marketing (e.g. Avalanche Air / info@avalancheair.com.au for now)
  const { data: pausedRows } = await db.from('businesses').select('id').eq('auto_reminders_enabled', false)
  const paused = new Set((pausedRows || []).map(b => b.id as string))
  const byBusiness = new Map<string, Set<Kind>>()
  const daysFor = new Map<string, number>()
  const copyFor = new Map<string, EmailCopy>()
  for (const r of enabledRows || []) {
    if (paused.has(r.business_id)) continue
    if (!byBusiness.has(r.business_id)) byBusiness.set(r.business_id, new Set())
    byBusiness.get(r.business_id)!.add(r.kind as Kind)
    copyFor.set(`${r.business_id}:${r.kind}`, { subject: r.subject, intro: r.intro, closing: r.closing })
    daysFor.set(`${r.business_id}:${r.kind}`, Number(r.days) > 0 ? Number(r.days) : AUTOMATION_DEFAULT_DAYS[r.kind as Kind])
  }

  const summary: Record<string, number> = { service: 0, overdue: 0, quote: 0, review: 0, visit: 0, failed: 0 }

  for (const [businessId, kinds] of byBusiness) {
    const [{ data: business }, { data: settings }] = await Promise.all([
      db.from('businesses').select('name, phone, email, logo_url, email_domain, email_domain_verified, timezone').eq('id', businessId).single(),
      db.from('business_settings').select('*').eq('business_id', businessId).single(),
    ])
    if (!business) continue
    const sender = senderFrom(business)
    const replyTo = sender.email && EMAIL.test(sender.email) ? sender.email : undefined
    const ownDomain = String((business as any).email_domain || '').trim().toLowerCase()
    const sendDomain = (business as any).email_domain_verified && DOMAIN.test(ownDomain) ? ownDomain : DEFAULT_SEND_DOMAIN
    let budget = PER_BUSINESS_LIMIT
    const copyOf = (k: Kind) => copyFor.get(`${businessId}:${k}`)
    const days = (k: Kind) => daysFor.get(`${businessId}:${k}`) ?? AUTOMATION_DEFAULT_DAYS[k]

    // Claims the right to send (unique key stops duplicates), sends, and releases the claim if sending fails
    async function deliver(kind: Kind, refId: string, cycle: string, to: string, mail: { subject: string; html: string; text: string }) {
      if (budget <= 0 || !EMAIL.test(to)) return false
      const { data: claim, error } = await db
        .from('automation_log')
        .insert({ business_id: businessId, kind, ref_id: refId, cycle, to_email: to, subject: mail.subject, body_html: mail.html })
        .select('id')
        .single()
      if (error || !claim) return false // already sent (or could not record), so do not send
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${safeDisplayName(sender.name)} <reminders@${sendDomain}>`,
          to: [to],
          ...(replyTo ? { reply_to: replyTo } : {}),
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
        }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        console.error('Automation send failed:', kind, res.status, result)
        await db.from('automation_log').delete().eq('id', claim.id)
        summary.failed++
        return false
      }
      await db.from('automation_log').update({ provider_id: (result as any)?.id ?? null }).eq('id', claim.id)
      budget--
      summary[kind]++
      return true
    }

    const emailOf = (c: any) => String(c?.email || '').trim()

    if (kinds.has('service') || kinds.has('review')) {
      const { data: jobs } = await db
        .from('jobs')
        .select('*, customers(first_name, last_name, email, phone, address, suburb), customer_sites(label, address, suburb, state, postcode)')
        .eq('business_id', businessId)

      for (const job of jobs || []) {
        const to = emailOf(job.customers)
        if (!to) continue

        if (kinds.has('service')) {
          if (serviceDue(job, days('service'))) {
            const next = nextServiceDate(job)
            await deliver('service', job.id, next ? toYMD(next) : '', to, renderAutomation(applyCopy(serviceContent(job, sender, bookingUrl(job.id)), sender, copyOf('service')), sender))
          }
        }

        if (kinds.has('review')) {
          const url = String(settings?.google_review_url || '').trim()
          if (/^https:\/\//i.test(url) && reviewDue(job, days('review'))) {
            await deliver('review', job.id, '', to, renderAutomation(applyCopy(reviewContent(job, sender, url), sender, copyOf('review')), sender))
          }
        }
      }
    }

    if (kinds.has('overdue')) {
      const { data: invoices } = await db
        .from('invoices')
        .select('*, customers(first_name, last_name, suburb, phone, email, address)')
        .eq('business_id', businessId)
        .in('status', ['sent', 'overdue'])
      for (const inv of invoices || []) {
        const to = emailOf(inv.customers)
        if (to && overdueDue(inv, days('overdue'))) {
          await deliver('overdue', inv.id, '', to, renderAutomation(applyCopy(overdueContent(inv, sender, settings), sender, copyOf('overdue')), sender))
        }
      }
    }

    if (kinds.has('visit')) {
      const tz = String((business as any).timezone || 'Australia/Sydney')
      const ymdIn = (d: Date) => {
        try {
          return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
        } catch {
          return new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
        }
      }
      const asDay = (ymd: string) => {
        const [y, m, dd] = ymd.split('-').map(Number)
        return new Date(y, m - 1, dd)
      }
      const nowD = new Date()
      const today = asDay(ymdIn(nowD))
      const { data: visits } = await db
        .from('job_visits')
        .select('*, customers(first_name, last_name, email, address, suburb, state, postcode), jobs(brand, model), staff_members(name), customer_sites(label, address, suburb, state, postcode)')
        .eq('business_id', businessId)
        .eq('status', 'scheduled')
        .gt('start_at', nowD.toISOString())
        .lt('start_at', new Date(nowD.getTime() + (days('visit') + 2) * 86400000).toISOString())
      // Reminders sent by hand count too, so nobody is told twice
      const ids = (visits || []).map(v => v.id as string)
      const { data: manual } = ids.length ? await db.from('visit_reminders').select('visit_id, for_start').in('visit_id', ids) : { data: [] as { visit_id: string; for_start: string }[] }
      const manualSent = new Set((manual || []).map(m => `${m.visit_id}:${new Date(m.for_start).toISOString()}`))
      for (const v of visits || []) {
        const to = emailOf(v.customers)
        const startIso = new Date(v.start_at).toISOString()
        if (!to || manualSent.has(`${v.id}:${startIso}`)) continue
        if (!visitDue(v, days('visit'), today, nowD, iso => asDay(ymdIn(new Date(iso))))) continue
        const sentOk = await deliver('visit', v.id, startIso, to, renderAutomation(applyCopy(visitContent(v, sender, tz), sender, copyOf('visit')), sender))
        if (sentOk) await db.from('visit_reminders').insert({ business_id: businessId, visit_id: v.id, for_start: v.start_at, to_email: to, source: 'auto' })
      }
    }

    if (kinds.has('quote')) {
      const { data: quotes } = await db
        .from('quotes')
        .select('*, customers(first_name, last_name, email)')
        .eq('business_id', businessId)
        .eq('status', 'sent')
      for (const q of quotes || []) {
        const to = emailOf(q.customers)
        if (to && quoteDue(q, days('quote'))) {
          await deliver('quote', q.id, '', to, renderAutomation(applyCopy(quoteContent(q, sender), sender, copyOf('quote')), sender))
        }
      }
    }
  }

  // Message copies are for looking back at recent emails; clear the wording after 90 days (the log rows stay)
  const cutoff = new Date(Date.now() - 90 * 86400000).toISOString()
  await Promise.all(
    ['automation_log', 'reminder_emails', 'visit_messages'].map(table =>
      db.from(table).update({ body_html: null }).lt('sent_at', cutoff).not('body_html', 'is', null)
    )
  )

  return NextResponse.json({ ok: true, businesses: byBusiness.size, sent: summary })
}
