'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserRow } from '@/lib/session'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { PageSkeleton } from '@/components/Skeleton'
import { HeaderToolbar } from '@/components/HeaderToolbar'
import { EMAIL_STYLE, senderFrom } from '@/lib/automation-email'
import { renderEmail, sampleContent, type EmailKind } from '@/lib/email-theme'
import { nextServiceDate, toYMD } from '@/lib/service'
import { AUTOMATION_DAY_OPTIONS, AUTOMATION_DEFAULT_DAYS, AUTOMATION_WHEN, dayWord, overdueDue, quoteDue, reviewDue, serviceDue, visitDue, type AutomationKind } from '@/lib/automation-rules'
import { Select } from '@/components/Select'

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

type Automation = {
  id: string
  name: string
  channels: string
  blurb: string
  live: boolean
  href?: string
  action?: string
}

const AUTOMATIONS: Automation[] = [
  { id: 'service', name: 'Service reminder', channels: 'Email', blurb: 'Emails customers before their service is due, so they can book in.', live: true, href: '/dashboard/schedule', action: 'Open service schedule' },
  { id: 'visit', name: 'Visit reminder', channels: 'Email', blurb: 'Emails customers before a booked visit, with the day, time and address.', live: true, href: '/dashboard/calendar', action: 'Open calendar' },
  { id: 'overdue', name: 'Overdue invoice nudge', channels: 'Email', blurb: 'Emails the invoice again when it is late and still unpaid.', live: true, href: '/dashboard/invoices', action: 'Open invoices' },
  { id: 'quote', name: 'Quote follow-up', channels: 'Email', blurb: 'Checks in on quotes that have not had a reply.', live: true, href: '/dashboard/quotes', action: 'Open quotes' },
  { id: 'review', name: 'Review request', channels: 'Email', blurb: 'Asks customers for a Google review after an install.', live: true, href: '/dashboard/settings', action: 'Open settings' },
]

type RecentMessage = { key: string; id: string; source: 'reminder_emails' | 'automation_log' | 'visit_messages'; kind: string; to_email: string; subject: string; sent_at: string }

const card: React.CSSProperties = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }
const cardTitle: React.CSSProperties = { fontSize: 17, fontWeight: 900, color: TEXT, letterSpacing: '-0.035em' }

function Pill({ children, tone }: { children: React.ReactNode; tone: 'live' | 'soon' | 'chan' }) {
  const t = tone === 'live' ? { bg: TEAL_LIGHT, fg: TEAL_DARK } : tone === 'soon' ? { bg: '#F1F5F9', fg: '#64748B' } : { bg: '#F3F4F6', fg: TEXT2 }
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: t.bg, color: t.fg, whiteSpace: 'nowrap' }}>{children}</span>
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MarketingPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [recent, setRecent] = useState<RecentMessage[]>([])
  const [openMsg, setOpenMsg] = useState<string | null>(null)
  const [bodies, setBodies] = useState<Record<string, string | null>>({})
  const [business, setBusiness] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [sel, setSel] = useState('service')
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const [daysSel, setDaysSel] = useState<Record<string, number>>({})
  const [bizId, setBizId] = useState('')
  const [quotes, setQuotes] = useState<any[]>([])
  const [autoLog, setAutoLog] = useState<any[]>([])
  const [saveError, setSaveError] = useState('')
  const [visits, setVisits] = useState<any[]>([])
  const [visitSent, setVisitSent] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: u } = await getUserRow(session.user.id)
      if (!u?.business_id) { setLoading(false); return }
      const bid = u.business_id
      setBizId(bid)
      const since = new Date(Date.now() - 30 * 86400000).toISOString()
      const nowIso = new Date().toISOString()
      const cust = 'customers(email)'
      // Only what the "Next" lines and the message list need: a few columns each, filtered in the database
      const [j, i, r, b, s, st, lg, rc, qs, vs, vr, vm] = await Promise.all([
        supabase.from('jobs').select(`id, install_date, next_service_date, service_interval_months, ${cust}`).eq('business_id', bid),
        supabase.from('invoices').select(`id, status, total, amount_paid, due_date, ${cust}`).eq('business_id', bid).in('status', ['sent', 'overdue']),
        supabase.from('reminder_emails').select('id, to_email, subject, sent_at').eq('business_id', bid).gte('sent_at', since).order('sent_at', { ascending: false }).limit(8),
        supabase.from('businesses').select('name, phone, email, logo_url, timezone').eq('id', bid).single(),
        supabase.from('business_settings').select('google_review_url').eq('business_id', bid).maybeSingle(),
        supabase.from('automation_settings').select('kind, enabled, days').eq('business_id', bid),
        supabase.from('automation_log').select('kind, ref_id, cycle').eq('business_id', bid).order('sent_at', { ascending: false }).limit(1000),
        supabase.from('automation_log').select('id, kind, to_email, subject, sent_at').eq('business_id', bid).gte('sent_at', since).order('sent_at', { ascending: false }).limit(8),
        supabase.from('quotes').select(`id, status, created_at, ${cust}`).eq('business_id', bid).eq('status', 'sent'),
        supabase.from('job_visits').select(`id, status, start_at, ${cust}`).eq('business_id', bid).eq('status', 'scheduled').gt('start_at', nowIso).lt('start_at', new Date(Date.now() + 10 * 86400000).toISOString()),
        supabase.from('visit_reminders').select('visit_id, for_start').eq('business_id', bid).gte('for_start', new Date(Date.now() - 86400000).toISOString()),
        supabase.from('visit_messages').select('id, kind, to_email, subject, sent_at').eq('business_id', bid).gte('sent_at', since).order('sent_at', { ascending: false }).limit(8),
      ])
      const merged: RecentMessage[] = [
        ...(r.data || []).map((m: any) => ({ ...m, key: `reminder_emails:${m.id}`, source: 'reminder_emails' as const, kind: 'service' })),
        ...(rc.data || []).map((m: any) => ({ ...m, key: `automation_log:${m.id}`, source: 'automation_log' as const })),
        ...(vm.data || []).map((m: any) => ({ ...m, key: `visit_messages:${m.id}`, source: 'visit_messages' as const, kind: m.kind === 'reminder' ? 'visit' : m.kind })),
      ]
      setRecent(merged.sort((x, y) => (x.sent_at < y.sent_at ? 1 : -1)).slice(0, 8))
      setVisits(vs.data || [])
      setQuotes(qs.data || [])
      setVisitSent(new Set((vr.data || []).map((m: any) => `${m.visit_id}:${new Date(m.for_start).toISOString()}`)))
      setDaysSel(Object.fromEntries((st.data || []).filter((x: any) => x.days).map((x: any) => [x.kind, x.days])))
      setEnabled(Object.fromEntries((st.data || []).map((x: any) => [x.kind, !!x.enabled])))
      setAutoLog(lg.data || [])
      setJobs(j.data || [])
      setInvoices(i.data || [])
      setBusiness(b.data)
      setSettings(s.data)
      setLoading(false)
    }
    load()
  }, [router])

  const sender = useMemo(() => senderFrom(business), [business])

  // The preview uses an example customer with your real business name, logo and contact details
  const cur = AUTOMATIONS.find(a => a.id === sel) || AUTOMATIONS[0]
  const content = useMemo(() => sampleContent(cur.id as EmailKind, sender), [cur.id, sender])
  const emailDoc = useMemo(() => renderEmail(EMAIL_STYLE, content, sender), [content, sender])
  const emailSubject = content.subject

  const daysOf = (kind: string) => daysSel[kind] ?? AUTOMATION_DEFAULT_DAYS[kind as AutomationKind]

  async function save(kind: string, on: boolean, days: number, undo: () => void) {
    if (!bizId) return
    setSaveError('')
    const { error } = await supabase.from('automation_settings').upsert({ business_id: bizId, kind, enabled: on, days, updated_at: new Date().toISOString() }, { onConflict: 'business_id,kind' })
    if (error) {
      undo()
      setSaveError(`Could not save that change: ${error.message}`)
    }
  }

  function toggle(kind: string) {
    const next = !enabled[kind]
    setEnabled(prev => ({ ...prev, [kind]: next }))
    save(kind, next, daysOf(kind), () => setEnabled(prev => ({ ...prev, [kind]: !next })))
  }

  function changeDays(kind: string, n: number) {
    const before = daysOf(kind)
    setDaysSel(prev => ({ ...prev, [kind]: n }))
    save(kind, !!enabled[kind], n, () => setDaysSel(prev => ({ ...prev, [kind]: before })))
  }

  // Customers who would get this email on the next run (has an email, not already sent)
  const alreadySent = useMemo(() => new Set(autoLog.map(l => `${l.kind}:${l.ref_id}:${l.cycle || ''}`)), [autoLog])
  function eligibleCount(kind: AutomationKind) {
    const d = daysOf(kind)
    const hasEmail = (c: any) => !!String(c?.email || '').trim()
    if (kind === 'service') return jobs.filter(j => hasEmail(j.customers) && serviceDue(j, d) && !alreadySent.has(`service:${j.id}:${nextServiceDate(j) ? toYMD(nextServiceDate(j)!) : ''}`)).length
    if (kind === 'overdue') return invoices.filter(i => hasEmail(i.customers) && overdueDue(i, d) && !alreadySent.has(`overdue:${i.id}:`)).length
    if (kind === 'quote') return quotes.filter(q => hasEmail(q.customers) && quoteDue(q, d) && !alreadySent.has(`quote:${q.id}:`)).length
    if (kind === 'visit') {
      const tz = business?.timezone || 'Australia/Sydney'
      const ymdIn = (d: Date) => {
        try {
          return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
        } catch {
          return toYMD(d)
        }
      }
      const asDay = (ymd: string) => {
        const [y, m, dd] = ymd.split('-').map(Number)
        return new Date(y, m - 1, dd)
      }
      const now = new Date()
      const today = asDay(ymdIn(now))
      return visits.filter(v => hasEmail(v.customers) && visitDue(v, d, today, now, iso => asDay(ymdIn(new Date(iso)))) && !visitSent.has(`${v.id}:${new Date(v.start_at).toISOString()}`) && !alreadySent.has(`visit:${v.id}:${new Date(v.start_at).toISOString()}`)).length
    }
    const url = String(settings?.google_review_url || '').trim()
    if (!/^https:\/\//i.test(url)) return 0
    return jobs.filter(j => hasEmail(j.customers) && reviewDue(j, d) && !alreadySent.has(`review:${j.id}:`)).length
  }

  const KIND_LABEL: Record<string, string> = { service: 'Service reminder', visit: 'Visit reminder', overdue: 'Overdue invoice', quote: 'Quote follow-up', review: 'Review request', on_the_way: 'On my way', moved: 'Visit moved' }

  /** Open or close a message; its wording is fetched the first time it is opened. */
  async function toggleMessage(m: RecentMessage) {
    if (openMsg === m.key) {
      setOpenMsg(null)
      return
    }
    setOpenMsg(m.key)
    if (m.key in bodies) return
    const { data } = await supabase.from(m.source).select('body_html').eq('id', m.id).single()
    setBodies(prev => ({ ...prev, [m.key]: (data as { body_html: string | null } | null)?.body_html ?? null }))
  }

  function nextLine(a: Automation) {
    const k = a.id as AutomationKind
    if (k === 'review' && !/^https:\/\//i.test(String(settings?.google_review_url || '').trim())) return { text: 'Add your Google review link in Settings first', tone: 'warn' as const }
    if (!enabled[a.id]) return { text: 'Off, nothing will be sent', tone: 'off' as const }
    const n = eligibleCount(k)
    return { text: n > 0 ? `Tomorrow around 8am to ${n} customer${n === 1 ? '' : 's'}` : 'Tomorrow around 8am, no one is due right now', tone: 'on' as const }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/marketing" />
        <PageSkeleton variant="report" label="Loading marketing" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard/marketing" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <PageHeader title="Marketing">
          <HeaderToolbar
            isMobile={isMobile}
            items={[
              { label: 'Invoices', onClick: () => router.push('/dashboard/invoices') },
              { label: 'Send reminders', tone: 'primary', onClick: () => router.push('/dashboard/schedule') },
            ]}
          />
        </PageHeader>

        <div
          className="page-content"
          style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : 48 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.25fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
            <div style={card}>
              <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={cardTitle}>Automations</div>
              </div>
              {AUTOMATIONS.map((a, idx) => (
                <div
                  key={a.id}
                  onClick={() => setSel(a.id)}
                  style={{ padding: '18px', borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}`, background: sel === a.id ? '#F7FCFB' : WHITE, boxShadow: sel === a.id ? `inset 3px 0 0 ${TEAL}` : 'none', cursor: 'pointer', fontFamily: FONT }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: TEXT, letterSpacing: '-0.01em' }}>{a.name}</div>
                      <div style={{ fontSize: 13, color: TEXT3, marginTop: 3, lineHeight: 1.45 }}>{a.blurb}</div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!!enabled[a.id]}
                      aria-label={`${a.name} automation`}
                      onClick={e => { e.stopPropagation(); toggle(a.id) }}
                      style={{ width: 44, height: 26, borderRadius: 13, border: 'none', padding: 3, background: enabled[a.id] ? TEAL : '#CBD5E1', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: enabled[a.id] ? 'flex-end' : 'flex-start' }}
                    >
                      <span style={{ width: 20, height: 20, borderRadius: 10, background: WHITE, display: 'block' }} />
                    </button>
                  </div>

                  <div onClick={e => e.stopPropagation()} style={{ marginTop: 14, border: `1px solid ${BORDER}`, borderRadius: 12, background: WHITE, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '11px 14px', fontSize: 13, color: TEXT2 }}>
                      <span style={{ width: 44, color: TEXT3, fontWeight: 600 }}>Send</span>
                      <Select
                        value={daysOf(a.id)}
                        onChange={e => changeDays(a.id, Number(e.target.value))}
                        aria-label={`${a.name}: days`}
                        style={{ height: 34, padding: '0 28px 0 10px', borderRadius: 10, border: `1px solid ${BORDER}`, background: '#F8FAFC', color: TEXT, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: 'pointer' }}
                      >
                        {Array.from(new Set([...AUTOMATION_DAY_OPTIONS[a.id as AutomationKind], daysOf(a.id)])).sort((x, y) => x - y).map(n => <option key={n} value={n}>{dayWord(n)}</option>)}
                      </Select>
                      <span>{AUTOMATION_WHEN[a.id as AutomationKind].after.replace(/^days /, '')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderTop: `1px solid ${BORDER}`, fontSize: 13, background: '#FBFCFD' }}>
                      <span style={{ width: 44, color: TEXT3, fontWeight: 600, flexShrink: 0 }}>Next</span>
                      <span style={{ fontWeight: 700, color: nextLine(a).tone === 'on' ? TEAL_DARK : nextLine(a).tone === 'warn' ? '#92400E' : TEXT3 }}>{nextLine(a).text}</span>
                    </div>
                  </div>
                </div>
              ))}
              {saveError && <div style={{ padding: '12px 18px', fontSize: 12, fontWeight: 600, color: '#B91C1C', background: '#FEF2F2', borderTop: `1px solid ${BORDER}` }}>{saveError}</div>}
            </div>

            <div style={card}>
              <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={cardTitle}>Preview: {cur.name}</div>
              </div>
              <div style={{ padding: 18, display: 'grid', gap: 16 }}>
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '8px 12px', fontSize: 12, color: TEXT2, borderBottom: `1px solid ${BORDER}`, overflowWrap: 'anywhere' }}><span style={{ color: TEXT3 }}>Subject </span><b>{emailSubject}</b></div>
                  <iframe title="Email preview" srcDoc={emailDoc} sandbox="" style={{ width: '100%', height: isMobile ? 480 : 640, border: 'none', display: 'block', background: '#F4F6F8' }} />
                </div>

                {cur.href && (
                  <button type="button" onClick={() => router.push(cur.href!)} style={{ height: 40, borderRadius: 10, border: 'none', background: TEAL, color: WHITE, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                    {cur.action}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
              <div style={cardTitle}>Recent messages</div>
            </div>
            {recent.length === 0 ? (
              <div style={{ padding: '22px 18px', fontSize: 13, color: TEXT3 }}>Nothing sent in the last 30 days. Switch an automation on, or send a reminder from the service schedule.</div>
            ) : (
              recent.map((m, idx) => {
                const open = openMsg === m.key
                const loaded = m.key in bodies
                const body = bodies[m.key]
                return (
                  <div key={m.key} style={{ borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}`, background: open ? '#F7FCFB' : WHITE }}>
                    <button
                      type="button"
                      onClick={() => toggleMessage(m)}
                      aria-expanded={open}
                      style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 18px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: FONT }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, overflowWrap: 'anywhere' }}>{m.subject}</div>
                        <div style={{ fontSize: 12, color: TEXT3, marginTop: 2, overflowWrap: 'anywhere' }}>{KIND_LABEL[m.kind] || 'Email'} · {m.to_email}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: TEXT3, whiteSpace: 'nowrap' }}>{fmtDate(m.sent_at)}</span>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={TEXT3} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </button>
                    {open && (
                      <div style={{ padding: '0 18px 18px' }}>
                        <div style={{ fontSize: 12, color: TEXT3, marginBottom: 10, lineHeight: 1.6 }}>
                          Sent to <b style={{ color: TEXT2 }}>{m.to_email}</b> on {new Date(m.sent_at).toLocaleString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })}
                        </div>
                        {!loaded ? (
                          <div style={{ fontSize: 13, color: TEXT3 }}>Loading...</div>
                        ) : body ? (
                          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                            <iframe title="Message" srcDoc={body} sandbox="" loading="lazy" style={{ width: '100%', height: isMobile ? 480 : 560, border: 'none', display: 'block', background: '#F4F6F8' }} />
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: TEXT3, lineHeight: 1.5, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 14px', background: WHITE }}>
                            The wording of this message was not kept. Jobyra started keeping copies recently, and it clears copies after 90 days.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
