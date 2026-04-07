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
const TEXT3 = '#64748B'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const HEADER_BG = '#111111'

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
    function check() {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M20 8.5a3.5 3.5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function IconTool() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.86l-6.01 6.01a1.5 1.5 0 1 0 2.12 2.12l6.01-6.01a4 4 0 0 0 5.86-5.4l-2.33 2.33-2.25-.45-.45-2.25 2.45-2.21Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconAlert() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor"/>
      <path d="M10.29 3.86 1.82 18A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3l-8.47-14.14a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconInvoice() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3h10a2 2 0 0 1 2 2v16l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function IconRevenue() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v20M17 6.5c0-1.93-2.24-3.5-5-3.5S7 4.57 7 6.5 9.24 10 12 10s5 1.57 5 3.5S14.76 17 12 17s-5-1.57-5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function IconArrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconSpark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  )
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
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('business_id')
        .eq('id', session.user.id)
        .single()

      if (!userData) {
        setLoading(false)
        return
      }

      const bid = userData.business_id
      const today = new Date()

      const [customersRes, jobsRes, invoicesRes] = await Promise.all([
        supabase.from('customers').select('id').eq('business_id', bid),
        supabase
          .from('jobs')
          .select('*, customers(first_name, last_name, suburb, phone)')
          .eq('business_id', bid)
          .order('next_service_date', { ascending: true }),
        supabase.from('invoices').select('status, total, amount_paid, created_at').eq('business_id', bid),
      ])

      const jobs = jobsRes.data || []
      const invoices = invoicesRes.data || []

      const overdue = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today)
      const jobsThisMonth = jobs.filter(j => {
        const d = new Date(j.created_at)
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
      }).length

      setStats({
        customers: customersRes.data?.length || 0,
        units: jobs.length,
        overdue: overdue.length,
        jobsThisMonth,
      })

      setAllJobs(jobs)
      setUpcoming(
        jobs
          .filter(j => j.next_service_date && new Date(j.next_service_date) >= today)
          .slice(0, 6)
      )
      setRecent(
        [...jobs]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 6)
      )

      setInvoiceStats({
        collected: invoices
          .filter(i => i.status === 'paid')
          .reduce((s, i) => s + Number(i.total || 0), 0),
        outstanding: invoices
          .filter(i => i.status === 'sent' || i.status === 'overdue')
          .reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0),
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
    if (days < 0) return { dot: '#EF4444', val: RED, label: 'Overdue', text: `${Math.abs(days)}d` }
    if (days <= 30) return { dot: '#F59E0B', val: AMBER, label: 'Due soon', text: `${days}d` }
    return { dot: TEAL, val: TEAL_DARK, label: 'On track', text: `${days}d` }
  }

  function statusPill(nextServiceDate: string | null) {
    if (!nextServiceDate) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }
    const days = getDays(nextServiceDate)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#DCFCE7', color: '#166534' }
  }

  const dueSoonCount = useMemo(() => {
    return allJobs.filter(j => {
      if (!j.next_service_date) return false
      const days = getDays(j.next_service_date)
      return days >= 0 && days <= 30
    }).length
  }, [allJobs])

  const avgInvoice = useMemo(() => {
    const totalInvoices = invoiceStats.paidCount + invoiceStats.overdueCount
    if (!totalInvoices) return 0
    return Math.round((invoiceStats.collected + invoiceStats.outstanding) / totalInvoices)
  }, [invoiceStats])

  const priorityItems = useMemo(() => {
    return allJobs
      .filter(j => j.next_service_date)
      .sort((a, b) => new Date(a.next_service_date).getTime() - new Date(b.next_service_date).getTime())
      .slice(0, 4)
  }, [allJobs])

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const shellCard: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '18px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.05), 0 1px 3px rgba(15,23,42,0.04)',
    overflow: 'hidden',
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 800,
    color: TEXT,
    letterSpacing: '-0.03em',
    margin: 0,
  }

  const quickActionStyle: React.CSSProperties = {
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT2,
    borderRadius: '10px',
    height: '38px',
    padding: '0 14px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  }

  const filteredRecent = useMemo(() => {
    if (!search.trim()) return recent
    const term = search.toLowerCase()
    return recent.filter(job => {
      const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.toLowerCase()
      const suburb = `${job.customers?.suburb || ''}`.toLowerCase()
      const brand = `${job.brand || ''}`.toLowerCase()
      return name.includes(term) || suburb.includes(term) || brand.includes(term)
    })
  }, [recent, search])

  const kpis = [
    {
      label: 'Customers',
      value: stats.customers,
      sub: 'Registered in your CRM',
      icon: <IconUsers />,
      accent: TEXT,
    },
    {
      label: 'Active units',
      value: stats.units,
      sub: 'Installed and tracked',
      icon: <IconTool />,
      accent: TEAL_DARK,
    },
    {
      label: 'Overdue services',
      value: stats.overdue,
      sub: stats.overdue > 0 ? 'Needs attention now' : 'All clear',
      icon: <IconAlert />,
      accent: stats.overdue > 0 ? RED : TEXT,
    },
    {
      label: 'Outstanding invoices',
      value: `$${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
      sub: invoiceStats.outstanding > 0 ? 'Awaiting payment' : 'Nothing outstanding',
      icon: <IconInvoice />,
      accent: invoiceStats.outstanding > 0 ? AMBER : TEXT,
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Sidebar active="/dashboard" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: BG,
        overflow: 'hidden',
      }}
    >
      <Sidebar active="/dashboard" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: BG }}>
        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: BG }}>
          {/* HERO */}
          <div
            style={{
              background: HEADER_BG,
              padding: isMobile ? '18px 16px 16px' : '20px 24px 18px',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr',
              gap: '14px',
              alignItems: 'stretch',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.68)', marginBottom: '5px', fontWeight: 500 }}>
                {todayStr}
              </div>

              <div
                style={{
                  fontSize: isMobile ? '28px' : '34px',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  marginBottom: '8px',
                }}
              >
                Dashboard
              </div>

              <div
                style={{
                  fontSize: isMobile ? '14px' : '14px',
                  lineHeight: 1.5,
                  color: 'rgba(255,255,255,0.72)',
                  maxWidth: '760px',
                }}
              >
                Track customers, service due dates, invoices, and jobs from one premium control centre built for fast daily decisions.
              </div>

              <div
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  onClick={() => router.push('/dashboard/jobs')}
                  style={{
                    ...quickActionStyle,
                    background: TEAL,
                    color: '#FFFFFF',
                    border: 'none',
                  }}
                >
                  <IconSpark />
                  Add job
                </button>

                <button
                  onClick={() => router.push('/dashboard/quotes')}
                  style={quickActionStyle}
                >
                  <IconInvoice />
                  New quote
                </button>

                <button
                  onClick={() => router.push('/dashboard/schedule')}
                  style={quickActionStyle}
                >
                  <IconCalendar />
                  Service schedule
                </button>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div
            style={{
              padding: isMobile ? '16px' : '22px 24px 24px',
              background: BG,
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              flex: 1,
            }}
          >
            {/* KPI CARDS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))',
                gap: '12px',
              }}
            >
              {kpis.map(item => (
                <div
                  key={item.label}
                  style={{
                    ...shellCard,
                    padding: isMobile ? '14px' : '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      color: item.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT3, marginBottom: '8px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: 900, color: item.accent, lineHeight: 1, letterSpacing: '-0.05em', marginBottom: '8px' }}>
                      {item.value}
                    </div>
                    <div style={{ fontSize: '13px', color: TEXT3, lineHeight: 1.45 }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* MAIN LAYOUT */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.45fr) minmax(320px,0.75fr)',
                gap: '18px',
                alignItems: 'start',
              }}
            >
              {/* LEFT COLUMN */}
              <div style={{ display: 'grid', gap: '18px' }}>
                {/* Recent customers */}
                <div style={{ ...shellCard, padding: isMobile ? '16px' : '18px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: isMobile ? 'stretch' : 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexDirection: isMobile ? 'column' : 'row',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <h3 style={sectionTitle}>Recent customers</h3>
                      <div style={{ fontSize: '13px', color: TEXT3, marginTop: '4px' }}>
                        Your latest customer activity in one clean view.
                      </div>
                    </div>

                    <button
                      onClick={() => router.push('/dashboard/customers')}
                      style={{
                        height: '38px',
                        borderRadius: '11px',
                        border: `1px solid ${BORDER}`,
                        background: '#FFFFFF',
                        color: TEXT2,
                        fontSize: '13px',
                        fontWeight: 700,
                        padding: '0 14px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        alignSelf: isMobile ? 'flex-start' : 'center',
                      }}
                    >
                      View all
                      <IconArrow />
                    </button>
                  </div>

                  {filteredRecent.length === 0 ? (
                    <div
                      style={{
                        borderRadius: '14px',
                        padding: '26px 16px',
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        textAlign: 'center',
                        color: TEXT3,
                        fontSize: '14px',
                      }}
                    >
                      No matching recent customers.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {filteredRecent.map((job, i) => {
                        const av = avColors[i % avColors.length]
                        const s = statusPill(job.next_service_date)

                        return (
                          <div
                            key={job.id}
                            onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                            style={{
                              borderRadius: '14px',
                              border: `1px solid ${BORDER}`,
                              background: WHITE,
                              padding: '14px 16px',
                              display: 'grid',
                              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.2fr) minmax(0,1fr) auto',
                              gap: '12px',
                              alignItems: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                              <div
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '14px',
                                  background: av.bg,
                                  color: av.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  flexShrink: 0,
                                }}
                              >
                                {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                              </div>

                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {job.customers?.first_name} {job.customers?.last_name}
                                </div>
                                <div style={{ fontSize: '12px', color: TEXT3, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {job.customers?.suburb || 'No suburb'}
                                </div>
                              </div>
                            </div>

                            {!isMobile && (
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                                </div>
                                <div style={{ fontSize: '12px', color: TEXT3, marginTop: '4px' }}>
                                  {job.next_service_date
                                    ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : 'No next service date'}
                                </div>
                              </div>
                            )}

                            <div style={{ justifySelf: isMobile ? 'start' : 'end' }}>
                              <span
                                style={{
                                  background: s.bg,
                                  color: s.color,
                                  padding: '6px 10px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  whiteSpace: 'nowrap',
                                  display: 'inline-block',
                                }}
                              >
                                {s.label}
                              </span>
                            </div>

                            {isMobile && (
                              <div style={{ fontSize: '12px', color: TEXT3 }}>
                                {job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Upcoming services */}
                <div style={{ ...shellCard, padding: isMobile ? '16px' : '18px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={sectionTitle}>Upcoming services</h3>
                    <div style={{ fontSize: '13px', color: TEXT3, marginTop: '4px' }}>
                      The next services coming up across your customers.
                    </div>
                  </div>

                  {upcoming.length === 0 ? (
                    <div
                      style={{
                        borderRadius: '14px',
                        padding: '24px 16px',
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        textAlign: 'center',
                        color: TEXT3,
                        fontSize: '14px',
                      }}
                    >
                      No upcoming services.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {upcoming.map(job => {
                        const days = getDays(job.next_service_date)
                        const u = urgency(days)

                        return (
                          <div
                            key={job.id}
                            onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                            style={{
                              borderRadius: '14px',
                              padding: '14px 16px',
                              background: WHITE,
                              border: `1px solid ${BORDER}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                              <div
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  background: u.dot,
                                  flexShrink: 0,
                                }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {job.customers?.first_name} {job.customers?.last_name}
                                </div>
                                <div style={{ fontSize: '12px', color: TEXT3, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 900, color: u.val }}>
                                {u.text}
                              </div>
                              <div style={{ fontSize: '11px', color: TEXT3, marginTop: '3px' }}>
                                {u.label}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ display: 'grid', gap: '18px' }}>
                {/* Today’s priorities */}
                <div style={{ ...shellCard, padding: isMobile ? '16px' : '18px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={sectionTitle}>Today’s priorities</h3>
                    <div style={{ fontSize: '13px', color: TEXT3, marginTop: '4px' }}>
                      Focus on what needs attention first.
                    </div>
                  </div>

                  {priorityItems.length === 0 ? (
                    <div
                      style={{
                        borderRadius: '14px',
                        padding: '24px 16px',
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        textAlign: 'center',
                        fontSize: '14px',
                        color: TEXT3,
                      }}
                    >
                      Nothing urgent right now.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {priorityItems.map(job => {
                        const days = job.next_service_date ? getDays(job.next_service_date) : 9999
                        const u = urgency(days)

                        return (
                          <div
                            key={job.id}
                            onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                            style={{
                              borderRadius: '14px',
                              padding: '14px 16px',
                              background: WHITE,
                              border: `1px solid ${BORDER}`,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {job.customers?.first_name} {job.customers?.last_name}
                              </div>
                              <div style={{ fontSize: '12px', color: TEXT3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 900, color: u.val }}>
                                {u.text}
                              </div>
                              <div style={{ fontSize: '11px', color: TEXT3, marginTop: '3px' }}>
                                {u.label}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Business snapshot */}
                <div style={{ ...shellCard, padding: isMobile ? '16px' : '18px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={sectionTitle}>Business snapshot</h3>
                    <div style={{ fontSize: '13px', color: TEXT3, marginTop: '4px' }}>
                      A cleaner summary of service load and cashflow.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    {[
                      { label: 'Due in 30 days', value: dueSoonCount, icon: <IconCalendar /> },
                      { label: 'Outstanding invoices', value: `$${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, icon: <IconInvoice /> },
                      { label: 'Collected revenue', value: `$${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, icon: <IconRevenue /> },
                      { label: 'Average invoice', value: `$${avgInvoice.toLocaleString('en-AU')}`, icon: <IconSpark /> },
                    ].map(item => (
                      <div
                        key={item.label}
                        style={{
                          borderRadius: '14px',
                          padding: '14px 16px',
                          background: WHITE,
                          border: `1px solid ${BORDER}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '12px',
                              background: '#F8FAFC',
                              color: TEAL_DARK,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `1px solid ${BORDER}`,
                              flexShrink: 0,
                            }}
                          >
                            {item.icon}
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT2 }}>
                              {item.label}
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: '18px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', flexShrink: 0 }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div style={{ ...shellCard, padding: isMobile ? '16px' : '18px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={sectionTitle}>Quick actions</h3>
                    <div style={{ fontSize: '13px', color: TEXT3, marginTop: '4px' }}>
                      Jump straight into the next task.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    {[
                      { label: 'Send service reminders', href: '/dashboard/schedule' },
                      { label: 'Create a new invoice', href: '/dashboard/invoices' },
                      { label: 'View QR codes', href: '/dashboard/qrcodes' },
                      { label: 'Open revenue page', href: '/dashboard/revenue' },
                    ].map(a => (
                      <button
                        key={a.label}
                        onClick={() => router.push(a.href)}
                        style={{
                          height: '44px',
                          borderRadius: '12px',
                          border: `1px solid ${BORDER}`,
                          background: '#FFFFFF',
                          color: TEXT2,
                          padding: '0 14px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{a.label}</span>
                        <span style={{ color: TEAL_DARK, display: 'flex', alignItems: 'center' }}>
                          <IconArrow />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}