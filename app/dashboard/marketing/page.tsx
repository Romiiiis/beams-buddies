'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserRow } from '@/lib/session'
import { Sidebar } from '@/components/Sidebar'
import { PageSkeleton } from '@/components/Skeleton'
import { StatStrip } from '@/components/StatStrip'
import { HeaderToolbar } from '@/components/HeaderToolbar'
import { EMAIL_STYLE, senderFrom } from '@/lib/automation-email'
import { renderEmail, sampleContent, type EmailKind } from '@/lib/email-theme'
import { nextServiceDate, serviceBucket, toYMD } from '@/lib/service'
import { AUTOMATION_DAY_OPTIONS, AUTOMATION_DEFAULT_DAYS, AUTOMATION_WHEN, dayWord, overdueDue, quoteDue, reviewDue, serviceDue, type AutomationKind } from '@/lib/automation-rules'
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
  { id: 'overdue', name: 'Overdue invoice nudge', channels: 'Email', blurb: 'Emails the invoice again when it is late and still unpaid.', live: true, href: '/dashboard/invoices', action: 'Open invoices' },
  { id: 'quote', name: 'Quote follow-up', channels: 'Email', blurb: 'Checks in on quotes that have not had a reply.', live: true, href: '/dashboard/quotes', action: 'Open quotes' },
  { id: 'review', name: 'Review request', channels: 'Email', blurb: 'Asks customers for a Google review after an install.', live: true, href: '/dashboard/settings', action: 'Open settings' },
]

const card: React.CSSProperties = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }
const cardTitle: React.CSSProperties = { fontSize: 15, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }

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
  const [customers, setCustomers] = useState<any[]>([])
  const [sent, setSent] = useState<any[]>([])
  const [business, setBusiness] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [sel, setSel] = useState('service')
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const [daysSel, setDaysSel] = useState<Record<string, number>>({})
  const [bizId, setBizId] = useState('')
  const [quotes, setQuotes] = useState<any[]>([])
  const [autoLog, setAutoLog] = useState<any[]>([])
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: u } = await getUserRow(session.user.id)
      if (!u?.business_id) { setLoading(false); return }
      const bid = u.business_id
      setBizId(bid)
      const since = new Date(Date.now() - 30 * 86400000).toISOString()
      const [j, i, c, r, b, s, st, lg, qs] = await Promise.all([
        supabase.from('jobs').select('*, customers(first_name, last_name, email, phone, address, suburb)').eq('business_id', bid),
        supabase.from('invoices').select('*, customers(first_name, last_name, suburb, phone, email, address)').eq('business_id', bid).order('created_at', { ascending: false }),
        supabase.from('customers').select('id, email, phone').eq('business_id', bid),
        supabase.from('reminder_emails').select('id, to_email, subject, sent_at').eq('business_id', bid).gte('sent_at', since).order('sent_at', { ascending: false }),
        supabase.from('businesses').select('name, phone, email, logo_url').eq('id', bid).single(),
        supabase.from('business_settings').select('*').eq('business_id', bid).single(),
        supabase.from('automation_settings').select('kind, enabled, days').eq('business_id', bid),
        supabase.from('automation_log').select('id, kind, ref_id, cycle, to_email, subject, sent_at').eq('business_id', bid).order('sent_at', { ascending: false }).limit(1000),
        supabase.from('quotes').select('*, customers(first_name, last_name, email)').eq('business_id', bid).order('created_at', { ascending: false }),
      ])
      setQuotes(qs.data || [])
      setDaysSel(Object.fromEntries((st.data || []).filter((x: any) => x.days).map((x: any) => [x.kind, x.days])))
      setEnabled(Object.fromEntries((st.data || []).map((x: any) => [x.kind, !!x.enabled])))
      setAutoLog(lg.data || [])
      setJobs(j.data || [])
      setInvoices(i.data || [])
      setCustomers(c.data || [])
      setSent(r.data || [])
      setBusiness(b.data)
      setSettings(s.data)
      setLoading(false)
    }
    load()
  }, [router])

  const sender = useMemo(() => senderFrom(business), [business])

  const dueJobs = useMemo(() => jobs.filter(j => ['overdue', 'due_soon'].includes(serviceBucket(j))), [jobs])
  const overdueJobs = useMemo(() => jobs.filter(j => serviceBucket(j) === 'overdue'), [jobs])
  const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid || 0)), 0)
  const reachable = customers.filter(c => (c.email || '').trim() || (c.phone || '').trim()).length

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
    const url = String(settings?.google_review_url || '').trim()
    if (!/^https:\/\//i.test(url)) return 0
    return jobs.filter(j => hasEmail(j.customers) && reviewDue(j, d) && !alreadySent.has(`review:${j.id}:`)).length
  }

  const allSent = useMemo(() => {
    const since = new Date(Date.now() - 30 * 86400000).toISOString()
    return [...sent.map(m => ({ ...m, kind: 'service' })), ...autoLog.filter(l => l.sent_at >= since)].sort((x, y) => (x.sent_at < y.sent_at ? 1 : -1))
  }, [sent, autoLog])
  const sentCount = (kind: string) => allSent.filter(m => m.kind === kind).length
  const KIND_LABEL: Record<string, string> = { service: 'Service reminder', overdue: 'Overdue invoice', quote: 'Quote follow-up', review: 'Review request' }

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
        <div style={{ background: BG, borderBottom: `1px solid ${BORDER}`, padding: isMobile ? '14px 14px 12px' : '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0 }}>Marketing</h1>
          <HeaderToolbar
            isMobile={isMobile}
            items={[
              { label: 'Invoices', onClick: () => router.push('/dashboard/invoices') },
              { label: 'Send reminders', tone: 'primary', onClick: () => router.push('/dashboard/schedule') },
            ]}
          />
        </div>

        <div
          className="page-content"
          style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : 48 }}
        >
          <StatStrip
            isMobile={isMobile}
            items={[
              { label: 'Emails sent', value: allSent.length, sub: 'last 30 days' },
              { label: 'Services overdue', value: overdueJobs.length, sub: `${dueJobs.length} due or overdue` },
              { label: 'Outstanding', value: `$${outstanding.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`, sub: 'unpaid invoices' },
              { label: 'Customers reachable', value: reachable, sub: `of ${customers.length} customers` },
            ]}
          />

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
            {allSent.length === 0 ? (
              <div style={{ padding: '22px 18px', fontSize: 13, color: TEXT3 }}>Nothing sent in the last 30 days. Switch an automation on, or send a reminder from the service schedule.</div>
            ) : (
              allSent.slice(0, 8).map((m, idx) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 18px', borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}` }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, overflowWrap: 'anywhere' }}>{m.subject}</div>
                    <div style={{ fontSize: 12, color: TEXT3, marginTop: 2, overflowWrap: 'anywhere' }}>{KIND_LABEL[m.kind] || 'Email'} · {m.to_email}</div>
                  </div>
                  <div style={{ fontSize: 12, color: TEXT3, whiteSpace: 'nowrap' }}>{fmtDate(m.sent_at)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
