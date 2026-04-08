'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const RED = '#B91C1C'
const AMBER = '#92400E'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E2E8F0'
const BG = '#F1F5F9'
const WHITE = '#FFFFFF'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TYPE = {
  label: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  section: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.14em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  bodySm: {
    fontSize: '11px',
    fontWeight: 500,
    color: TEXT3,
    lineHeight: 1.45,
  },
  body: {
    fontSize: '12px',
    fontWeight: 500,
    color: TEXT2,
    lineHeight: 1.45,
  },
  titleSm: {
    fontSize: '12px',
    fontWeight: 700,
    color: TEXT,
    lineHeight: 1.3,
  },
  title: {
    fontSize: '13px',
    fontWeight: 600,
    color: TEXT2,
    lineHeight: 1.35,
  },
  valueLg: {
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: '-0.04em' as const,
    lineHeight: 1,
  },
  valueMd: {
    fontSize: '20px',
    fontWeight: 800,
    color: TEXT,
    letterSpacing: '-0.03em' as const,
    lineHeight: 1,
  },
  valueSm: {
    fontSize: '16px',
    fontWeight: 700,
    color: TEXT,
    letterSpacing: '-0.02em' as const,
    lineHeight: 1,
  },
}

const avColors = [
  { bg: '#E8F4F1', color: '#0A4F4C' },
  { bg: '#DBEAFE', color: '#1E3A8A' },
  { bg: '#FEF3C7', color: '#78350F' },
  { bg: '#EDE9FE', color: '#4C1D95' },
  { bg: '#FFE4E6', color: '#881337' },
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
function IconSpark({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
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
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#DCFCE7', color: '#166534' }
  }

  const dueSoonCount = useMemo(() => allJobs.filter(j => { if (!j.next_service_date) return false; const d = getDays(j.next_service_date); return d >= 0 && d <= 30 }).length, [allJobs])
  const goodStandingCount = useMemo(() => allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) > 30).length, [allJobs])
  const avgInvoice = useMemo(() => { const t = invoiceStats.paidCount + invoiceStats.overdueCount; return t ? Math.round((invoiceStats.collected + invoiceStats.outstanding) / t) : 0 }, [invoiceStats])
  const priorityItems = useMemo(() => allJobs.filter(j => j.next_service_date).sort((a, b) => new Date(a.next_service_date).getTime() - new Date(b.next_service_date).getTime()).slice(0, 4), [allJobs])

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const shellCard: React.CSSProperties = {
    background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.04)', overflow: 'hidden',
  }

  const sectionLabel: React.CSSProperties = {
    ...TYPE.section, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px',
  }

  const sectionDash = <span style={{ width: '12px', height: '2px', background: TEAL, borderRadius: '999px', display: 'inline-block', flexShrink: 0 }}/>

  const iconWrap = (color: string): React.CSSProperties => ({
    width: '32px', height: '32px', borderRadius: '9px', background: BG, color,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: `1px solid ${BORDER}`, flexShrink: 0,
  })

  const rowItem: React.CSSProperties = {
    borderRadius: '10px', padding: '11px 13px', background: BG,
    border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '10px',
  }

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: FONT }}>
      <Sidebar active="/dashboard"/>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>Loading…</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: FONT, background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard"/>
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: BG }}>

        {/* HEADER — matches page bg, no jarring black */}
        <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: isMobile ? '16px' : '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '11px', color: TEXT3, fontWeight: 500, marginBottom: '3px' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>Dashboard</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/dashboard/quotes')}
              style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconInvoice size={14}/> New quote
            </button>
            <button onClick={() => router.push('/dashboard/jobs')}
              style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: 'none', background: TEAL, color: WHITE, fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconSpark size={14}/> Add job
            </button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: isMobile ? '14px' : '20px 24px', paddingBottom: isMobile ? '90px' : '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* KPI CARDS */}
          <div>
            <div style={sectionLabel}>{sectionDash}Overview</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(12, minmax(0,1fr))', gap: '10px' }}>
              {[
                { label: 'Customers', value: stats.customers, sub: 'Registered in CRM', icon: <IconUsers size={16}/>, accent: TEXT, span: 'span 3' },
                { label: 'Active units', value: stats.units, sub: 'Installed & tracked', icon: <IconTool size={16}/>, accent: TEAL_DARK, span: 'span 3' },
                { label: 'Overdue services', value: stats.overdue, sub: stats.overdue > 0 ? 'Needs attention' : 'All clear', icon: <IconAlert size={16}/>, accent: stats.overdue > 0 ? RED : TEXT, span: 'span 3' },
                { label: 'Outstanding', value: `$${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, sub: invoiceStats.outstanding > 0 ? 'Awaiting payment' : 'Nothing due', icon: <IconInvoice size={16}/>, accent: invoiceStats.outstanding > 0 ? AMBER : TEXT, span: 'span 3' },
              ].map(item => (
                <div key={item.label} style={{ ...shellCard, padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', gridColumn: isMobile ? 'span 1' : item.span }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={iconWrap(item.accent)}>{item.icon}</div>
                    <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TEXT3 }}>Live</span>
                  </div>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>{item.label}</div>
                    <div style={{ ...TYPE.valueLg, fontSize: isMobile ? '22px' : '26px', color: item.accent, marginBottom: '4px' }}>{item.value}</div>
                    <div style={{ fontSize: '11px', color: TEXT3, fontWeight: 500 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MIDDLE ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0,1fr))', gap: '12px', alignItems: 'start' }}>

            {/* Revenue snapshot */}
            <div style={{ ...shellCard, padding: '16px', gridColumn: isMobile ? 'span 1' : 'span 4' }}>
              <div style={sectionLabel}>{sectionDash}Revenue snapshot</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <div style={{ ...TYPE.label, marginBottom: '5px' }}>Collected</div>
                  <div style={{ ...TYPE.valueMd, color: '#166534' }}>${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</div>
                </div>
                <div>
                  <div style={{ ...TYPE.label, marginBottom: '5px' }}>Outstanding</div>
                  <div style={{ ...TYPE.valueMd, color: invoiceStats.outstanding > 0 ? AMBER : TEXT }}>${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</div>
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '11px', color: TEXT3, fontWeight: 500 }}>Collection rate</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: TEXT2 }}>
                    {invoiceStats.collected + invoiceStats.outstanding > 0 ? `${Math.round((invoiceStats.collected / (invoiceStats.collected + invoiceStats.outstanding)) * 100)}%` : '—'}
                  </span>
                </div>
                <div style={{ height: '6px', background: BORDER, borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: invoiceStats.collected + invoiceStats.outstanding > 0 ? `${(invoiceStats.collected / (invoiceStats.collected + invoiceStats.outstanding)) * 100}%` : '0%', background: TEAL, borderRadius: '999px' }}/>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[{ label: 'Paid', value: invoiceStats.paidCount }, { label: 'Overdue', value: invoiceStats.overdueCount }, { label: 'Avg', value: `$${avgInvoice.toLocaleString('en-AU')}` }].map(s => (
                  <div key={s.label} style={{ padding: '10px', background: BG, borderRadius: '9px', border: `1px solid ${BORDER}` }}>
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>{s.label}</div>
                    <div style={TYPE.valueSm}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service pipeline */}
            <div style={{ ...shellCard, padding: '16px', gridColumn: isMobile ? 'span 1' : 'span 4' }}>
              <div style={sectionLabel}>{sectionDash}Service pipeline</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Overdue', value: stats.overdue },
                  { label: 'Due in 30 days', value: dueSoonCount },
                  { label: 'Good standing', value: goodStandingCount },
                  { label: 'New this month', value: stats.jobsThisMonth },
                ].map(item => (
                  <div key={item.label} style={rowItem}>
                    <div>
                      <div style={{ ...TYPE.titleSm, marginBottom: '2px' }}>{item.label}</div>
                      <div style={{ fontSize: '11px', color: TEXT3, fontWeight: 500 }}>Current status</div>
                    </div>
                    <div style={TYPE.valueMd}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priorities + Quick actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', gridColumn: isMobile ? 'span 1' : 'span 4' }}>
              <div style={{ ...shellCard, padding: '16px' }}>
                <div style={sectionLabel}>{sectionDash}Today's priorities</div>
                {priorityItems.length === 0 ? (
                  <div style={{ ...rowItem, justifyContent: 'center', color: TEXT3, fontSize: '13px' }}>Nothing urgent right now.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {priorityItems.map(job => {
                      const days = job.next_service_date ? getDays(job.next_service_date) : 9999
                      const u = urgency(days)
                      return (
                        <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                          style={{ ...rowItem, cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#E8EEF4'}
                          onMouseLeave={e => e.currentTarget.style.background = BG}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                            <div style={{ fontSize: '11px', color: TEXT3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: u.val, lineHeight: 1 }}>{u.text}</div>
                            <div style={{ fontSize: '10px', color: TEXT3, marginTop: '2px' }}>{u.label}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div style={{ ...shellCard, padding: '16px' }}>
                <div style={sectionLabel}>{sectionDash}Quick actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {[
                    { label: 'Service reminders', href: '/dashboard/schedule', icon: <IconCalendar size={14}/> },
                    { label: 'Create invoice', href: '/dashboard/invoices', icon: <IconInvoice size={14}/> },
                    { label: 'View revenue', href: '/dashboard/revenue', icon: <IconRevenue size={14}/> },
                    { label: 'QR codes', href: '/dashboard/qrcodes', icon: <IconSpark size={14}/> },
                  ].map(a => (
                    <button key={a.label} onClick={() => router.push(a.href)}
                      style={{ height: '36px', borderRadius: '9px', border: `1px solid ${BORDER}`, background: BG, color: TEXT2, padding: '0 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#E8EEF4'}
                      onMouseLeave={e => e.currentTarget.style.background = BG}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: TEAL_DARK, display: 'flex' }}>{a.icon}</span>
                        {a.label}
                      </span>
                      <span style={{ color: TEXT3, display: 'flex' }}><IconArrow size={13}/></span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0,1fr))', gap: '12px', alignItems: 'start' }}>

            {/* Recent customers */}
            <div style={{ ...shellCard, padding: '16px', gridColumn: isMobile ? 'span 1' : 'span 8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={sectionLabel}>{sectionDash}Recent customers</div>
                <button onClick={() => router.push('/dashboard/customers')}
                  style={{ height: '30px', padding: '0 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: BG, color: TEXT2, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  View all <IconArrow size={12}/>
                </button>
              </div>
              {recent.length === 0 ? (
                <div style={{ ...rowItem, justifyContent: 'center', color: TEXT3, fontSize: '13px' }}>
                  No jobs yet. <span style={{ color: TEAL, cursor: 'pointer', fontWeight: 600, marginLeft: '4px' }} onClick={() => router.push('/dashboard/jobs')}>Add first job →</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recent.map((job, i) => {
                    const av = avColors[i % avColors.length]
                    const s = statusPill(job.next_service_date)
                    return (
                      <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        style={{ ...rowItem, cursor: 'pointer', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.4fr) minmax(0,1fr) auto', display: 'grid', gap: '12px' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#E8EEF4'}
                        onMouseLeave={e => e.currentTarget.style.background = BG}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>
                            {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                            <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.suburb || '—'}</div>
                          </div>
                        </div>
                        {!isMobile && (
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                            <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px' }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'}</div>
                          </div>
                        )}
                        <div style={{ justifySelf: isMobile ? 'start' : 'end' }}>
                          <span style={{ background: s.bg, color: s.color, padding: '4px 9px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{s.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Upcoming services */}
            <div style={{ ...shellCard, padding: '16px', gridColumn: isMobile ? 'span 1' : 'span 4' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={sectionLabel}>{sectionDash}Upcoming services</div>
                <button onClick={() => router.push('/dashboard/schedule')}
                  style={{ height: '30px', padding: '0 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: BG, color: TEXT2, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  All <IconArrow size={12}/>
                </button>
              </div>
              {upcoming.length === 0 ? (
                <div style={{ ...rowItem, justifyContent: 'center', color: TEXT3, fontSize: '13px' }}>No upcoming services.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {upcoming.map(job => {
                    const days = getDays(job.next_service_date)
                    const u = urgency(days)
                    return (
                      <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        style={{ ...rowItem, cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#E8EEF4'}
                        onMouseLeave={e => e.currentTarget.style.background = BG}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: u.dot, flexShrink: 0 }}/>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                            <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: u.val, lineHeight: 1 }}>{u.text}</div>
                          <div style={{ fontSize: '10px', color: TEXT3, marginTop: '2px' }}>{u.label}</div>
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