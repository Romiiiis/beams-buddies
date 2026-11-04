'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserRow } from '@/lib/session'
import { Sidebar } from '@/components/Sidebar'
import { PageSkeleton } from '@/components/Skeleton'
import { StatStrip } from '@/components/StatStrip'
import { HeaderToolbar } from '@/components/HeaderToolbar'
import { reminderHtml, reminderSms, reminderSubject, type ReminderSender } from '@/lib/reminder-email'
import { invoiceHtml, invoiceSms, invoiceSubject } from '@/lib/invoice-email'
import { serviceBucket, soonestJob } from '@/lib/service'

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
  { id: 'service', name: 'Service reminder', channels: 'Email and text', blurb: 'Tell customers their service is coming up or overdue', live: true, href: '/dashboard/schedule', action: 'Open service schedule' },
  { id: 'invoice', name: 'Invoice', channels: 'Email and text', blurb: 'Send a finished invoice with your bank details', live: true, href: '/dashboard/invoices', action: 'Open invoices' },
  { id: 'overdue', name: 'Overdue invoice nudge', channels: 'Email and text', blurb: 'A polite reminder when an invoice passes its due date', live: false },
  { id: 'quote', name: 'Quote follow-up', channels: 'Email and text', blurb: 'Check in a few days after a quote is sent', live: false },
  { id: 'review', name: 'Review request', channels: 'Text', blurb: 'Ask for a review after a completed job', live: false },
]

const SAMPLE_TEXT: Record<string, string> = {
  overdue: 'Hi Sophie, it’s your team at {biz}. Invoice INV-0012 for $242.00 was due on 3 Nov. Pay to the details on your invoice, or reply here if you need anything. Thanks!',
  quote: 'Hi Sophie, it’s {biz}. Just checking in on the quote we sent. Happy to answer any questions or lock in a time that suits you.',
  review: 'Hi Sophie, thanks for choosing {biz}. If you were happy with the work, a quick Google review would mean a lot to us. Thank you!',
}

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

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: u } = await getUserRow(session.user.id)
      if (!u?.business_id) { setLoading(false); return }
      const bid = u.business_id
      const since = new Date(Date.now() - 30 * 86400000).toISOString()
      const [j, i, c, r, b, s] = await Promise.all([
        supabase.from('jobs').select('*, customers(first_name, last_name, email, phone, address, suburb)').eq('business_id', bid),
        supabase.from('invoices').select('*, customers(first_name, last_name, suburb, phone, email, address)').eq('business_id', bid).order('created_at', { ascending: false }),
        supabase.from('customers').select('id, email, phone').eq('business_id', bid),
        supabase.from('reminder_emails').select('id, to_email, subject, sent_at').eq('business_id', bid).gte('sent_at', since).order('sent_at', { ascending: false }),
        supabase.from('businesses').select('name, phone, email').eq('id', bid).single(),
        supabase.from('business_settings').select('*').eq('business_id', bid).single(),
      ])
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

  const sender: ReminderSender = { name: business?.name || '', phone: business?.phone || '', email: business?.email || '' }

  const dueJobs = useMemo(() => jobs.filter(j => ['overdue', 'due_soon'].includes(serviceBucket(j))), [jobs])
  const overdueJobs = useMemo(() => jobs.filter(j => serviceBucket(j) === 'overdue'), [jobs])
  const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid || 0)), 0)
  const reachable = customers.filter(c => (c.email || '').trim() || (c.phone || '').trim()).length

  // Sample data for the previews: a real job and invoice when there is one, so it looks like the real thing
  const sampleJob = useMemo(() => soonestJob(jobs.filter(j => j.customers?.first_name)) || null, [jobs])
  const sampleInvoice = invoices.find(i => i.customers?.first_name) || null
  const cur = AUTOMATIONS.find(a => a.id === sel) || AUTOMATIONS[0]

  let smsText = ''
  let emailDoc = ''
  let emailSubject = ''
  if (cur.id === 'service' && sampleJob) {
    smsText = reminderSms(sampleJob, sender)
    emailSubject = reminderSubject(sampleJob, sender)
    emailDoc = reminderHtml(sampleJob, sender)
  } else if (cur.id === 'invoice' && sampleInvoice) {
    smsText = invoiceSms(sampleInvoice, sender, settings)
    emailSubject = invoiceSubject(sampleInvoice, sender)
    emailDoc = invoiceHtml(sampleInvoice, sender, settings)
  } else if (SAMPLE_TEXT[cur.id]) {
    smsText = SAMPLE_TEXT[cur.id].replace('{biz}', sender.name || 'your business')
  }
  const hasEmail = !!emailDoc
  const frame = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:18px 16px;background:#FFFFFF;">${emailDoc}</body></html>`

  function metricFor(a: Automation) {
    if (a.id === 'service') return `${dueJobs.length} due or overdue · ${sent.length} sent in 30 days`
    if (a.id === 'invoice') return `${invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length} awaiting payment`
    return ''
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
              { label: 'Reminders sent', value: sent.length, sub: 'last 30 days' },
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
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSel(a.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '14px 18px', border: 'none', borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}`, background: sel === a.id ? TEAL_LIGHT : WHITE, cursor: 'pointer', fontFamily: FONT }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{a.name}</span>
                      <Pill tone="chan">{a.channels}</Pill>
                    </div>
                    <div style={{ fontSize: 12, color: TEXT3, marginTop: 3 }}>{a.blurb}</div>
                    {metricFor(a) && <div style={{ fontSize: 12, color: TEXT2, fontWeight: 600, marginTop: 3 }}>{metricFor(a)}</div>}
                  </div>
                  <Pill tone={a.live ? 'live' : 'soon'}>{a.live ? 'Live' : 'Coming soon'}</Pill>
                </button>
              ))}
            </div>

            <div style={card}>
              <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={cardTitle}>Preview: {cur.name}</div>
              </div>
              <div style={{ padding: 18, display: 'grid', gap: 16 }}>
                {smsText ? (
                  <div style={{ maxWidth: 300, width: '100%', margin: '0 auto', border: `1px solid ${BORDER}`, borderRadius: 24, padding: '10px 14px 16px', background: '#F8FAFC' }}>
                    <div style={{ width: 44, height: 4, borderRadius: 2, background: BORDER, margin: '0 auto 10px' }} />
                    <div style={{ textAlign: 'center', fontSize: 11, color: TEXT3, marginBottom: 10 }}>{sender.name || 'Your business'}<br />Text message</div>
                    <div style={{ background: TEAL_LIGHT, color: TEXT, fontSize: 13, lineHeight: 1.5, padding: '10px 12px', borderRadius: '14px 14px 14px 4px' }}>{smsText}</div>
                    <div style={{ fontSize: 11, color: TEXT3, marginTop: 8 }}>Delivered</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: TEXT3, textAlign: 'center', padding: '20px 0' }}>Add a job or an invoice to see a live preview.</div>
                )}

                {hasEmail && (
                  <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '8px 12px', fontSize: 12, color: TEXT2, borderBottom: `1px solid ${BORDER}`, overflowWrap: 'anywhere' }}><span style={{ color: TEXT3 }}>Subject </span><b>{emailSubject}</b></div>
                    <iframe title="Email preview" srcDoc={frame} sandbox="" style={{ width: '100%', height: isMobile ? 360 : 420, border: 'none', display: 'block', background: '#fff' }} />
                  </div>
                )}

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
            {sent.length === 0 ? (
              <div style={{ padding: '22px 18px', fontSize: 13, color: TEXT3 }}>No reminders sent in the last 30 days. Send one from the service schedule.</div>
            ) : (
              sent.slice(0, 8).map((m, idx) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 18px', borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}` }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, overflowWrap: 'anywhere' }}>{m.subject}</div>
                    <div style={{ fontSize: 12, color: TEXT3, marginTop: 2, overflowWrap: 'anywhere' }}>{m.to_email}</div>
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
