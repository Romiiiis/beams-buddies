'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const RED = '#B91C1C'
const AMBER = '#92400E'
const TEXT = '#0F172A'
const TEXT2 = '#334155'
const TEXT3 = '#94A3B8'
const BORDER = '#E2E8F0'
const BG = '#F1F5F9'
const WHITE = '#FFFFFF'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const avColors = [
  { bg: '#F0FDF4', color: '#166534' },
  { bg: '#EFF6FF', color: '#1E3A8A' },
  { bg: '#FFFBEB', color: '#92400E' },
  { bg: '#F5F3FF', color: '#4C1D95' },
  { bg: '#FFF1F2', color: '#881337' },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function IconUsers({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M20 8.5a3.5 3.5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}
function IconTool({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.86l-6.01 6.01a1.5 1.5 0 1 0 2.12 2.12l6.01-6.01a4 4 0 0 0 5.86-5.4l-2.33 2.33-2.25-.45-.45-2.25 2.45-2.21Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconAlert({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="16.5" r="0.9" fill="currentColor"/><path d="M10.29 3.86 1.82 18A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3l-8.47-14.14a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconInvoice({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M7 3h10a2 2 0 0 1 2 2v16l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}
function IconRevenue({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 6.5c0-1.93-2.24-3.5-5-3.5S7 4.57 7 6.5 9.24 10 12 10s5 1.57 5 3.5S14.76 17 12 17s-5-1.57-5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconCalendar({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8"/><path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}
function IconArrow({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconPlus({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
}

export default function DashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState({ collected: 0, outstanding: 0, paidCount: 0, overdueCount: 0 })
  const [allJobs, setAllJobs] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) { setLoading(false); return }
      const bid = userData.business_id
      const today = new Date()
      const [customersRes, jobsRes, invoicesRes] = await Promise.all([
        supabase.from('customers').select('id').eq('business_id', bid),
        supabase.from('jobs').select('*, customers(first_name, last_name, suburb, phone)').eq('business_id', bid).order('next_service_date', { ascending: true }),
        supabase.from('invoices').select('status, total, amount_paid, created_at').eq('business_id', bid),
      ])
      const jobs = jobsRes.data || []
      const invoices = invoicesRes.data || []
      const overdue = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today)
      const jobsThisMonth = jobs.filter(j => { const d = new Date(j.created_at); return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() }).length
      setStats({ customers: customersRes.data?.length || 0, units: jobs.length, overdue: overdue.length, jobsThisMonth })
      setAllJobs(jobs)
      setUpcoming(jobs.filter(j => j.next_service_date && new Date(j.next_service_date) >= today).slice(0, 6))
      setRecent([...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6))
      setInvoiceStats({
        collected: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total || 0), 0),
        outstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0),
        paidCount: invoices.filter(i => i.status === 'paid').length,
        overdueCount: invoices.filter(i => i.status === 'overdue').length,
      })
      setLoading(false)
    }
    load()
  }, [router])

  function getDays(d: string) {
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function urgency(days: number) {
    if (days < 0) return { dot: '#EF4444', val: RED, label: 'overdue', text: `${Math.abs(days)}d` }
    if (days <= 30) return { dot: '#F59E0B', val: AMBER, label: 'until due', text: `${days}d` }
    return { dot: TEAL, val: TEAL_DARK, label: 'until due', text: `${days}d` }
  }

  function statusPill(d: string | null) {
    if (!d) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }
    const days = getDays(d)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#991B1B' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#92400E' }
    return { label: 'Good', bg: '#DCFCE7', color: '#166534' }
  }

  const dueSoonCount = useMemo(() => allJobs.filter(j => { if (!j.next_service_date) return false; const d = getDays(j.next_service_date); return d >= 0 && d <= 30 }).length, [allJobs])
  const goodStandingCount = useMemo(() => allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) > 30).length, [allJobs])
  const avgInvoice = useMemo(() => { const t = invoiceStats.paidCount + invoiceStats.overdueCount; return t ? Math.round((invoiceStats.collected + invoiceStats.outstanding) / t) : 0 }, [invoiceStats])
  const priorityItems = useMemo(() => allJobs.filter(j => j.next_service_date).sort((a, b) => new Date(a.next_service_date).getTime() - new Date(b.next_service_date).getTime()).slice(0, 4), [allJobs])

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pad = isMobile ? '14px' : '20px 24px'

  const card: React.CSSProperties = {
    background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.06)', overflow: 'hidden',
  }

  const iconBox = (color: string): React.CSSProperties => ({
    width: '32px', height: '32px', borderRadius: '8px', background: BG,
    color, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: `1px solid ${BORDER}`, flexShrink: 0,
  })

  const sectionHead = (title: string, action?: { label: string; href: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '3px', height: '14px', background: TEAL, borderRadius: '2px', display: 'inline-block' }}/>
        <span style={{ fontSize: '11px', fontWeight: '700', color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
      </div>
      {action && (
        <button onClick={() => router.push(action.href)}
          style={{ fontSize: '12px', color: TEAL, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px' }}>
          {action.label} <IconArrow size={12}/>
        </button>
      )}
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: FONT }}>
      <Sidebar active="/dashboard"/>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: FONT, background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard"/>
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: BG }}>

        {/* HEADER */}
        <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: isMobile ? '16px' : '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '11px', color: TEXT3, fontWeight: '500', marginBottom: '2px' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: TEXT, letterSpacing: '-0.5px', lineHeight: 1 }}>Dashboard</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/dashboard/quotes')}
              style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: FONT }}>
              New quote
            </button>
            <button onClick={() => router.push('/dashboard/jobs')}
              style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: 'none', background: TEAL, color: WHITE, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconPlus size={13}/> Add job
            </button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: isMobile ? '14px' : '20px 24px', paddingBottom: isMobile ? '90px' : '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* KPI ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px' }}>
            {[
              { label: 'Customers', value: stats.customers, sub: 'registered', icon: <IconUsers size={16}/>, accent: TEAL_DARK },
              { label: 'Active units', value: stats.units, sub: 'installed', icon: <IconTool size={16}/>, accent: TEAL_DARK },
              { label: 'Overdue', value: stats.overdue, sub: stats.overdue > 0 ? 'need attention' : 'all clear', icon: <IconAlert size={16}/>, accent: stats.overdue > 0 ? RED : TEAL_DARK },
              { label: 'Outstanding', value: `$${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, sub: invoiceStats.outstanding > 0 ? 'awaiting payment' : 'nothing due', icon: <IconInvoice size={16}/>, accent: invoiceStats.outstanding > 0 ? AMBER : TEAL_DARK },
            ].map(k => (
              <div key={k.label} style={{ ...card, padding: isMobile ? '14px' : '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={iconBox(k.accent)}>{k.icon}</div>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: TEXT3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Live</span>
                </div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{k.label}</div>
                <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: k.accent, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '4px' }}>{k.value}</div>
                <div style={{ fontSize: '11px', color: TEXT3, fontWeight: '500' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* MIDDLE ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 320px', gap: '12px', alignItems: 'start' }}>

            {/* Revenue snapshot */}
            <div style={{ ...card, padding: '16px' }}>
              {sectionHead('Revenue snapshot', { label: 'View invoices', href: '/dashboard/invoices' })}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div style={{ padding: '14px', background: BG, borderRadius: '10px', border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Collected</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#166534', letterSpacing: '-0.04em' }}>${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</div>
                </div>
                <div style={{ padding: '14px', background: BG, borderRadius: '10px', border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Outstanding</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: invoiceStats.outstanding > 0 ? AMBER : TEXT, letterSpacing: '-0.04em' }}>${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</div>
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: TEXT3, fontWeight: '500' }}>Collection rate</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: TEXT2 }}>
                    {invoiceStats.collected + invoiceStats.outstanding > 0 ? `${Math.round((invoiceStats.collected / (invoiceStats.collected + invoiceStats.outstanding)) * 100)}%` : '—'}
                  </span>
                </div>
                <div style={{ height: '6px', background: BORDER, borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: invoiceStats.collected + invoiceStats.outstanding > 0 ? `${(invoiceStats.collected / (invoiceStats.collected + invoiceStats.outstanding)) * 100}%` : '0%', background: TEAL, borderRadius: '999px' }}/>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[{ label: 'Paid', value: invoiceStats.paidCount }, { label: 'Overdue', value: invoiceStats.overdueCount }, { label: 'Avg', value: `$${avgInvoice.toLocaleString('en-AU')}` }].map(s => (
                  <div key={s.label} style={{ padding: '10px', background: BG, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{s.label}</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: TEXT, letterSpacing: '-0.03em' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service pipeline */}
            <div style={{ ...card, padding: '16px' }}>
              {sectionHead('Service pipeline', { label: 'View schedule', href: '/dashboard/schedule' })}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {[
                  { label: 'Overdue', value: stats.overdue, color: '#EF4444', bg: '#FEF2F2' },
                  { label: 'Due in 30 days', value: dueSoonCount, color: '#F59E0B', bg: '#FFFBEB' },
                  { label: 'Good standing', value: goodStandingCount, color: TEAL, bg: '#F0FDFA' },
                  { label: 'New this month', value: stats.jobsThisMonth, color: TEXT2, bg: BG },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: s.bg, borderRadius: '10px', border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT2 }}>{s.label}</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: s.color, letterSpacing: '-0.04em' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right col — priorities + quick actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ ...card, padding: '16px' }}>
                {sectionHead("Today's priorities")}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {priorityItems.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>Nothing urgent.</div>
                  ) : priorityItems.map(job => {
                    const days = job.next_service_date ? getDays(job.next_service_date) : 9999
                    const u = urgency(days)
                    return (
                      <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 12px', background: BG, borderRadius: '9px', border: `1px solid ${BORDER}`, cursor: 'pointer' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                          <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: u.val }}>{u.text}</div>
                          <div style={{ fontSize: '10px', color: TEXT3, marginTop: '1px' }}>{u.label}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ ...card, padding: '16px' }}>
                {sectionHead('Quick actions')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { label: 'Service reminders', href: '/dashboard/schedule', icon: <IconCalendar size={14}/> },
                    { label: 'Create invoice', href: '/dashboard/invoices', icon: <IconInvoice size={14}/> },
                    { label: 'Revenue report', href: '/dashboard/revenue', icon: <IconRevenue size={14}/> },
                    { label: 'QR codes', href: '/dashboard/qrcodes', icon: <IconPlus size={14}/> },
                  ].map(a => (
                    <button key={a.label} onClick={() => router.push(a.href)}
                      style={{ height: '36px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, padding: '0 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      onMouseEnter={e => e.currentTarget.style.background = BG}
                      onMouseLeave={e => e.currentTarget.style.background = WHITE}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: TEAL_DARK }}>{a.icon}<span style={{ color: TEXT2 }}>{a.label}</span></span>
                      <IconArrow size={12}/>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: '12px', alignItems: 'start' }}>

            {/* Recent customers */}
            <div style={{ ...card, padding: '16px' }}>
              {sectionHead('Recent customers', { label: 'View all', href: '/dashboard/customers' })}
              {recent.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
                  No jobs yet. <span style={{ color: TEAL, cursor: 'pointer', fontWeight: '600' }} onClick={() => router.push('/dashboard/jobs')}>Add first job →</span>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: BG }}>
                      {['#', 'Customer', 'Unit', 'Next service', 'Status'].map(h => (
                        <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: TEXT3, borderBottom: `1px solid ${BORDER}`, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((job, i) => {
                      const av = avColors[i % avColors.length]
                      const s = statusPill(job.next_service_date)
                      return (
                        <tr key={job.id} style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }}
                          onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                          onMouseEnter={e => e.currentTarget.style.background = BG}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '11px 12px', fontSize: '12px', fontWeight: '600', color: TEXT3 }}>{i + 1}</td>
                          <td style={{ padding: '11px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                                {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                                <div style={{ fontSize: '11px', color: TEXT3 }}>{job.customers?.suburb || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '11px 12px', fontSize: '12px', color: TEXT2, fontWeight: '500' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</td>
                          <td style={{ padding: '11px 12px', fontSize: '12px', color: TEXT2 }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                          <td style={{ padding: '11px 12px' }}>
                            <span style={{ background: s.bg, color: s.color, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>{s.label}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Upcoming services */}
            <div style={{ ...card, padding: '16px' }}>
              {sectionHead('Upcoming services', { label: 'View all', href: '/dashboard/schedule' })}
              {upcoming.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No upcoming services.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {upcoming.slice(0, 6).map(job => {
                    const days = getDays(job.next_service_date)
                    const u = urgency(days)
                    return (
                      <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: BG, borderRadius: '9px', border: `1px solid ${BORDER}`, cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#E8EEF4'}
                        onMouseLeave={e => e.currentTarget.style.background = BG}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: u.dot, flexShrink: 0 }}/>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                          <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: u.val }}>{u.text}</div>
                          <div style={{ fontSize: '10px', color: TEXT3, marginTop: '1px' }}>{u.label}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}