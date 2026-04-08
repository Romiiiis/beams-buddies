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
const TEXT3 = '#475569'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TYPE = {
  label: {
    fontSize: '10px',
    fontWeight: 800,
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
    fontWeight: 800,
    color: TEXT,
    lineHeight: 1.3,
  },
  title: {
    fontSize: '13px',
    fontWeight: 700,
    color: TEXT2,
    lineHeight: 1.35,
  },
  valueLg: {
    fontSize: '28px',
    fontWeight: 900,
    letterSpacing: '-0.05em' as const,
    lineHeight: 1,
  },
  valueMd: {
    fontSize: '20px',
    fontWeight: 900,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
    lineHeight: 1,
  },
  valueSm: {
    fontSize: '16px',
    fontWeight: 900,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
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
    function check() {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile
}

function IconUsers({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.9"/>
      <path d="M20 8.5a3.5 3.5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
      <path d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.35" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
  )
}

function IconTool({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.86l-6.01 6.01a1.5 1.5 0 1 0 2.12 2.12l6.01-6.01a4 4 0 0 0 5.86-5.4l-2.33 2.33-2.25-.45-.45-2.25 2.45-2.21Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconAlert({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 9v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
      <circle cx="12" cy="16.5" r="0.9" fill="currentColor"/>
      <path d="M10.29 3.86 1.82 18A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3l-8.47-14.14a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconInvoice({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3h10a2 2 0 0 1 2 2v16l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/>
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
  )
}

function IconRevenue({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v20M17 6.5c0-1.93-2.24-3.5-5-3.5S7 4.57 7 6.5 9.24 10 12 10s5 1.57 5 3.5S14.76 17 12 17s-5-1.57-5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconCalendar({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9"/>
      <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
  )
}

function IconArrow({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/>
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
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
          .slice(0, 3)
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
    if (days < 0) return { dot: '#EF4444', val: RED, label: 'overdue', text: `${Math.abs(days)}d` }
    if (days <= 30) return { dot: '#F59E0B', val: AMBER, label: 'until due', text: `${days}d` }
    return { dot: TEAL, val: TEAL_DARK, label: 'until due', text: `${days}d` }
  }

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const shellCard: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
    overflow: 'hidden',
  }

  const panelCard: React.CSSProperties = {
    ...shellCard,
    padding: '16px',
  }

  const sectionLabel: React.CSSProperties = {
    ...TYPE.title,
    fontSize: '13px',
    fontWeight: 800,
    marginBottom: '12px',
  }

  const quickActionStyle: React.CSSProperties = {
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT2,
    borderRadius: '10px',
    height: '38px',
    padding: '0 14px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
  }

  const iconWrap = (color: string): React.CSSProperties => ({
    width: '34px',
    height: '34px',
    borderRadius: '11px',
    background: '#F8FAFC',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${BORDER}`,
    flexShrink: 0,
  })

  const kpis = [
    {
      label: 'Customers',
      value: stats.customers.toLocaleString('en-AU'),
      sub: 'Registered in your CRM',
      icon: <IconUsers size={17} />,
      accent: TEXT,
    },
    {
      label: 'New jobs',
      value: `+${stats.jobsThisMonth.toLocaleString('en-AU')}`,
      sub: 'Created this month',
      icon: <IconSpark size={17} />,
      accent: TEAL_DARK,
    },
    {
      label: 'Revenue',
      value: `$${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
      sub: 'Collected invoices',
      icon: <IconRevenue size={17} />,
      accent: TEXT,
    },
    {
      label: 'Overdue services',
      value: `${stats.overdue}%`.replace('%', ''),
      sub: stats.overdue > 0 ? 'Needs attention now' : 'All clear',
      icon: <IconAlert size={17} />,
      accent: stats.overdue > 0 ? RED : TEAL_DARK,
    },
  ]

  const monthlyAppointments = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const base = monthNames.map((label, i) => ({ label, total: 0, done: 0, month: i }))

    allJobs.forEach(job => {
      const d = job.created_at ? new Date(job.created_at) : null
      if (!d || Number.isNaN(d.getTime())) return
      const month = d.getMonth()
      base[month].total += 1
      if (job.next_service_date) {
        const due = new Date(job.next_service_date)
        if (due <= new Date()) base[month].done += 1
      }
    })

    const max = Math.max(...base.map(item => Math.max(item.total, item.done)), 1)

    return base.map(item => ({
      ...item,
      totalHeight: `${Math.max(18, (item.total / max) * 160)}px`,
      doneHeight: `${Math.max(12, (item.done / max) * 160)}px`,
    }))
  }, [allJobs])

  const revenueDistribution = useMemo(() => {
    const buckets = {
      Service: 0,
      Installation: 0,
      Quote: 0,
      Repair: 0,
      Other: 0,
    }

    allJobs.forEach(job => {
      const value = 1
      const type = String(job.job_type || '').toLowerCase()

      if (type.includes('service')) buckets.Service += value
      else if (type.includes('install')) buckets.Installation += value
      else if (type.includes('quote')) buckets.Quote += value
      else if (type.includes('repair')) buckets.Repair += value
      else buckets.Other += value
    })

    if (Object.values(buckets).every(v => v === 0)) {
      buckets.Service = 4
      buckets.Installation = 3
      buckets.Quote = 2
      buckets.Repair = 2
      buckets.Other = 1
    }

    const colors = {
      Service: '#C7B8FF',
      Installation: '#A9D79A',
      Quote: '#8EC5FF',
      Repair: '#F3C87B',
      Other: '#E5E7EB',
    }

    const total = Object.values(buckets).reduce((sum, value) => sum + value, 0)

    return Object.entries(buckets).map(([label, value]) => ({
      label,
      value,
      percent: Math.round((value / total) * 100),
      color: colors[label as keyof typeof colors],
    }))
  }, [allJobs])

  const donutBackground = useMemo(() => {
    let current = 0
    const parts = revenueDistribution.map(item => {
      const start = current
      const end = current + item.percent
      current = end
      return `${item.color} ${start}% ${end}%`
    })
    return `conic-gradient(${parts.join(', ')})`
  }, [revenueDistribution])

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: FONT }}>
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
        fontFamily: FONT,
        background: BG,
        overflow: 'hidden',
      }}
    >
      <Sidebar active="/dashboard" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: BG }}>
        <div
          style={{
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: BG,
            padding: isMobile ? '14px' : '16px',
            gap: '12px',
          }}
        >
          <div
            style={{
              ...shellCard,
              padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
              background: HEADER_BG,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.68)',
                  marginBottom: '6px',
                }}
              >
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
                  fontSize: '14px',
                  fontWeight: 500,
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
                    boxShadow: '0 6px 14px rgba(31,158,148,0.20)',
                  }}
                >
                  <IconSpark size={16} />
                  Add job
                </button>

                <button
                  onClick={() => router.push('/dashboard/quotes')}
                  style={{
                    ...quickActionStyle,
                    background: 'rgba(255,255,255,0.06)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.10)',
                    boxShadow: 'none',
                  }}
                >
                  <IconInvoice size={16} />
                  New quote
                </button>

                <button
                  onClick={() => router.push('/dashboard/schedule')}
                  style={{
                    ...quickActionStyle,
                    background: 'rgba(255,255,255,0.06)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.10)',
                    boxShadow: 'none',
                  }}
                >
                  <IconCalendar size={16} />
                  Service schedule
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))',
              gap: '12px',
            }}
          >
            {kpis.map((item, index) => (
              <div
                key={item.label}
                style={{
                  ...panelCard,
                  gridColumn: isMobile ? 'span 1' : 'span 3',
                  minHeight: 148,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ ...TYPE.title, fontSize: '14px', fontWeight: 800, marginBottom: '14px' }}>
                      {item.label}
                    </div>
                    <div style={{ ...TYPE.valueLg, fontSize: '25px', color: item.accent }}>
                      {item.value}
                    </div>
                    <div style={{ ...TYPE.bodySm, marginTop: '8px' }}>
                      {item.sub}
                    </div>
                  </div>

                  <div style={iconWrap(item.accent)}>
                    {item.icon}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '4px', marginTop: '14px', height: 52 }}>
                  {[18, 26, 20, 36, 28, 44, 30].map((h, i) => (
                    <div
                      key={`${item.label}-${i}`}
                      style={{
                        width: '10px',
                        borderRadius: '999px',
                        background: i === index + 2 ? TEAL : '#E8EDF3',
                        height: `${h}px`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))',
              gap: '12px',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                ...panelCard,
                gridColumn: isMobile ? 'span 1' : 'span 8',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                <div style={sectionLabel}>Total appointments</div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px',
                    borderRadius: '12px',
                    background: '#F8FAFC',
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <span style={{ padding: '6px 10px', borderRadius: '9px', fontSize: '11px', fontWeight: 700, color: TEXT3 }}>Week</span>
                  <span style={{ padding: '6px 10px', borderRadius: '9px', fontSize: '11px', fontWeight: 800, color: TEXT, background: WHITE, boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>Month</span>
                  <span style={{ padding: '6px 10px', borderRadius: '9px', fontSize: '11px', fontWeight: 700, color: TEXT3 }}>Year</span>
                </div>
              </div>

              <div
                style={{
                  height: 260,
                  borderRadius: '14px',
                  background: '#FCFCFD',
                  border: `1px solid ${BORDER}`,
                  padding: '18px 16px 14px',
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    fontSize: '11px',
                    color: TEXT3,
                  }}
                >
                  <span>4k</span>
                  <span>3k</span>
                  <span>2k</span>
                  <span>1k</span>
                  <span>0k</span>
                </div>

                <div
                  style={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                    gap: '10px',
                    alignItems: 'end',
                  }}
                >
                  {[20, 25, 50, 75].map((top, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: `${top}%`,
                        borderTop: '1px dashed #E5E7EB',
                        zIndex: 0,
                      }}
                    />
                  ))}

                  {monthlyAppointments.map(item => (
                    <div
                      key={item.label}
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        height: '100%',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '38px',
                          height: '170px',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            width: '26px',
                            height: item.totalHeight,
                            borderRadius: '999px',
                            background: '#E6EBF0',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            width: '26px',
                            height: item.doneHeight,
                            borderRadius: '999px',
                            background: TEAL,
                          }}
                        />
                      </div>

                      <div style={{ fontSize: '11px', color: TEXT3 }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                ...panelCard,
                gridColumn: isMobile ? 'span 1' : 'span 4',
              }}
            >
              <div style={sectionLabel}>Revenue source distribution</div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 0 2px',
                  }}
                >
                  <div
                    style={{
                      width: isMobile ? 220 : 230,
                      height: isMobile ? 220 : 230,
                      borderRadius: '50%',
                      background: donutBackground,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '54%',
                        height: '54%',
                        borderRadius: '50%',
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: TEAL_DARK,
                      }}
                    >
                      <IconRevenue size={24} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {revenueDistribution.map(item => (
                    <div
                      key={item.label}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '12px',
                        color: TEXT2,
                      }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: item.color,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.label}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700 }}>{item.percent}%</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    borderRadius: '12px',
                    background: '#F8FAFC',
                    border: `1px solid ${BORDER}`,
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: TEXT3,
                  }}
                >
                  Your strongest workflow this month is <span style={{ color: TEXT, fontWeight: 700 }}>{revenueDistribution[0]?.label || 'Service'}</span>.
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...panelCard }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
              <div style={sectionLabel}>Upcoming jobs</div>

              <button
                onClick={() => router.push('/dashboard/schedule')}
                style={{
                  height: '34px',
                  borderRadius: '10px',
                  border: `1px solid ${BORDER}`,
                  background: '#FFFFFF',
                  color: TEXT2,
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '0 12px',
                  cursor: 'pointer',
                  fontFamily: FONT,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
                }}
              >
                View all
                <IconArrow size={15} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
                gap: '10px',
              }}
            >
              {upcoming.length === 0 ? (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    borderRadius: '12px',
                    padding: '26px 16px',
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  No upcoming jobs.
                </div>
              ) : (
                upcoming.map((job, i) => {
                  const av = avColors[i % avColors.length]
                  const days = job.next_service_date ? getDays(job.next_service_date) : 999
                  const u = urgency(days)

                  return (
                    <div
                      key={job.id}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{
                        borderRadius: '14px',
                        padding: '14px',
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        cursor: 'pointer',
                        display: 'grid',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
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
                          <div style={{ ...TYPE.titleSm, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.customers?.first_name} {job.customers?.last_name}
                          </div>
                          <div style={{ ...TYPE.bodySm, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: TEXT3, fontSize: '11px', fontWeight: 500 }}>
                          <IconCalendar size={14} />
                          <span>
                            {job.next_service_date
                              ? new Date(job.next_service_date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                              : 'No scheduled date'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ ...TYPE.bodySm, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.customers?.suburb || 'No suburb'}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: u.val }}>
                            {u.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div style={{ ...panelCard }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
              <div style={sectionLabel}>Recent customers</div>

              <button
                onClick={() => router.push('/dashboard/customers')}
                style={{
                  height: '34px',
                  borderRadius: '10px',
                  border: `1px solid ${BORDER}`,
                  background: '#FFFFFF',
                  color: TEXT2,
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '0 12px',
                  cursor: 'pointer',
                  fontFamily: FONT,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
                }}
              >
                View all
                <IconArrow size={15} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
                gap: '10px',
              }}
            >
              {recent.length === 0 ? (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    borderRadius: '12px',
                    padding: '26px 16px',
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  No recent customers yet.
                </div>
              ) : (
                recent.slice(0, 3).map((job, i) => {
                  const av = avColors[(i + 1) % avColors.length]

                  return (
                    <div
                      key={job.id}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{
                        borderRadius: '14px',
                        padding: '14px',
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        cursor: 'pointer',
                        display: 'grid',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
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
                          <div style={{ ...TYPE.titleSm, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.customers?.first_name} {job.customers?.last_name}
                          </div>
                          <div style={{ ...TYPE.bodySm, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.customers?.suburb || 'No suburb'}
                          </div>
                        </div>
                      </div>

                      <div style={{ ...TYPE.bodySm }}>
                        {job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}