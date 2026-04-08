'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_SOFT = '#E8F4F1'
const RED = '#B91C1C'
const RED_SOFT = '#FEE2E2'
const AMBER = '#92400E'
const AMBER_SOFT = '#FEF3C7'
const BLUE_SOFT = '#E9F2FF'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#475569'
const MUTED = '#64748B'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const PANEL = '#FFFFFF'
const SUBTLE = '#F8FAFC'
const HEADER_BG = '#111111'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TYPE = {
  overline: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.12em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    color: TEXT3,
  },
  bodySm: {
    fontSize: '12px',
    fontWeight: 500,
    color: TEXT3,
    lineHeight: 1.45,
  },
  body: {
    fontSize: '13px',
    fontWeight: 500,
    color: TEXT2,
    lineHeight: 1.45,
  },
  titleSm: {
    fontSize: '13px',
    fontWeight: 800,
    color: TEXT,
    lineHeight: 1.35,
  },
  title: {
    fontSize: '15px',
    fontWeight: 800,
    color: TEXT,
    lineHeight: 1.25,
  },
  valueLg: {
    fontSize: '28px',
    fontWeight: 900,
    letterSpacing: '-0.05em' as const,
    color: TEXT,
    lineHeight: 1,
  },
  valueMd: {
    fontSize: '22px',
    fontWeight: 900,
    letterSpacing: '-0.04em' as const,
    color: TEXT,
    lineHeight: 1,
  },
  valueSm: {
    fontSize: '16px',
    fontWeight: 900,
    letterSpacing: '-0.03em' as const,
    color: TEXT,
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.9" />
      <path d="M20 8.5a3.5 3.5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.35" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconAlert({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 9v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.9" fill="currentColor" />
      <path d="M10.29 3.86 1.82 18A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3l-8.47-14.14a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconInvoice({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3h10a2 2 0 0 1 2 2v16l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconRevenue({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v20M17 6.5c0-1.93-2.24-3.5-5-3.5S7 4.57 7 6.5 9.24 10 12 10s5 1.57 5 3.5S14.76 17 12 17s-5-1.57-5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCalendar({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconArrow({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconJob({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="16" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M9 6V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconPhone({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.4 19.4 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.2 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.8 9.8a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5A2 2 0 0 1 22 16.9Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12 4.2 4.2L19 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCircle({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function DashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState({ collected: 0, outstanding: 0, paidCount: 0, overdueCount: 0, sentCount: 0 })
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
          .slice(0, 4)
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
        sentCount: invoices.filter(i => i.status === 'sent').length,
      })

      setLoading(false)
    }

    load()
  }, [router])

  function getDays(d: string) {
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function urgency(days: number) {
    if (days < 0) return { val: RED, bg: RED_SOFT, label: 'Overdue', text: `${Math.abs(days)}d late` }
    if (days <= 30) return { val: AMBER, bg: AMBER_SOFT, label: 'Due soon', text: `${days}d left` }
    return { val: TEAL_DARK, bg: TEAL_SOFT, label: 'On track', text: `${days}d left` }
  }

  function statusPill(nextServiceDate: string | null) {
    if (!nextServiceDate) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }
    const days = getDays(nextServiceDate)
    if (days < 0) return { label: 'Overdue', bg: RED_SOFT, color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: AMBER_SOFT, color: '#78350F' }
    return { label: 'Good', bg: '#DCFCE7', color: '#166534' }
  }

  const dueSoonCount = useMemo(() => {
    return allJobs.filter(j => {
      if (!j.next_service_date) return false
      const days = getDays(j.next_service_date)
      return days >= 0 && days <= 30
    }).length
  }, [allJobs])

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const shellCard: React.CSSProperties = {
    background: PANEL,
    border: `1px solid ${BORDER}`,
    borderRadius: '18px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
    overflow: 'hidden',
  }

  const panelCard: React.CSSProperties = {
    ...shellCard,
    padding: isMobile ? '16px' : '18px',
  }

  const sectionTitle: React.CSSProperties = {
    ...TYPE.title,
    margin: 0,
  }

  const buttonStyle: React.CSSProperties = {
    height: '40px',
    borderRadius: '12px',
    border: `1px solid ${BORDER}`,
    background: PANEL,
    color: TEXT2,
    fontSize: '13px',
    fontWeight: 700,
    padding: '0 14px',
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  }

  const monthlyAppointments = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const base = monthNames.map(label => ({ label, total: 0, completed: 0 }))

    allJobs.forEach(job => {
      const created = job.created_at ? new Date(job.created_at) : null
      if (created && !Number.isNaN(created.getTime())) {
        base[created.getMonth()].total += 1
      }

      if (job.next_service_date) {
        const due = new Date(job.next_service_date)
        if (!Number.isNaN(due.getTime()) && due <= new Date()) {
          base[due.getMonth()].completed += 1
        }
      }
    })

    const max = Math.max(...base.map(item => Math.max(item.total, item.completed)), 1)

    return base.map(item => ({
      ...item,
      totalHeight: Math.max(18, (item.total / max) * 150),
      completedHeight: Math.max(item.completed > 0 ? 12 : 0, (item.completed / max) * 150),
    }))
  }, [allJobs])

  const performanceScore = useMemo(() => {
    const totalUnits = Math.max(stats.units, 1)
    const overduePenalty = (stats.overdue / totalUnits) * 45
    const dueSoonPenalty = (dueSoonCount / totalUnits) * 20
    const unpaidPenalty = invoiceStats.outstanding > 0 ? 12 : 0
    const raw = 100 - overduePenalty - dueSoonPenalty - unpaidPenalty
    return Math.max(42, Math.min(98, Math.round(raw)))
  }, [stats.units, stats.overdue, dueSoonCount, invoiceStats.outstanding])

  const performanceTasks = [
    {
      label: 'Keep overdue services under control',
      complete: stats.overdue === 0,
      accent: TEAL,
      meta: stats.overdue === 0 ? 'On track' : `${stats.overdue} open`,
    },
    {
      label: 'Convert sent invoices into paid',
      complete: invoiceStats.sentCount === 0 && invoiceStats.outstanding === 0,
      accent: '#8AB4F8',
      meta: invoiceStats.sentCount > 0 ? `${invoiceStats.sentCount} awaiting payment` : 'Clear',
    },
    {
      label: 'Schedule units due in next 30 days',
      complete: dueSoonCount === 0,
      accent: '#B2D97E',
      meta: dueSoonCount > 0 ? `${dueSoonCount} due soon` : 'Up to date',
    },
  ]

  const gaugeBackground = useMemo(() => {
    const tealStop = Math.min(40, performanceScore * 0.45)
    const blueStop = Math.min(76, tealStop + 26)
    const amberStop = 90
    return `conic-gradient(
      from 220deg,
      ${TEAL} 0deg ${tealStop * 1.8}deg,
      #7DA8F7 ${tealStop * 1.8}deg ${blueStop * 1.8}deg,
      #E9C46A ${blueStop * 1.8}deg ${amberStop * 1.8}deg,
      #E5E7EB ${amberStop * 1.8}deg 360deg
    )`
  }, [performanceScore])

  const revenueCards = [
    {
      label: 'Customers',
      value: stats.customers.toLocaleString('en-AU'),
      icon: <IconUsers size={18} />,
      accent: TEAL,
      chipBg: TEAL_SOFT,
      chipColor: TEAL_DARK,
      sub: 'Active clients',
    },
    {
      label: 'New jobs',
      value: stats.jobsThisMonth.toLocaleString('en-AU'),
      icon: <IconJob size={18} />,
      accent: '#7DA8F7',
      chipBg: BLUE_SOFT,
      chipColor: '#2156B5',
      sub: 'This month',
    },
    {
      label: 'Revenue',
      value: formatCurrency(invoiceStats.collected),
      icon: <IconRevenue size={18} />,
      accent: TEAL_DARK,
      chipBg: TEAL_SOFT,
      chipColor: TEAL_DARK,
      sub: 'Collected invoices',
    },
    {
      label: 'Overdue',
      value: stats.overdue.toLocaleString('en-AU'),
      icon: <IconAlert size={18} />,
      accent: stats.overdue > 0 ? RED : TEAL_DARK,
      chipBg: stats.overdue > 0 ? RED_SOFT : TEAL_SOFT,
      chipColor: stats.overdue > 0 ? RED : TEAL_DARK,
      sub: stats.overdue > 0 ? 'Needs attention' : 'All clear',
    },
  ]

  const sideTasks = [
    {
      title: stats.overdue > 0 ? 'Follow up overdue services' : 'Overdue services cleared',
      date: stats.overdue > 0 ? `${stats.overdue} units need action` : 'Nothing pending',
      toneBg: stats.overdue > 0 ? RED_SOFT : TEAL_SOFT,
      toneColor: stats.overdue > 0 ? RED : TEAL_DARK,
      toneLabel: stats.overdue > 0 ? 'High' : 'Good',
    },
    {
      title: invoiceStats.outstanding > 0 ? 'Outstanding invoices to collect' : 'Invoices collected',
      date: invoiceStats.outstanding > 0 ? formatCurrency(invoiceStats.outstanding) : 'No outstanding balance',
      toneBg: invoiceStats.outstanding > 0 ? AMBER_SOFT : TEAL_SOFT,
      toneColor: invoiceStats.outstanding > 0 ? AMBER : TEAL_DARK,
      toneLabel: invoiceStats.outstanding > 0 ? 'Medium' : 'Good',
    },
    {
      title: dueSoonCount > 0 ? 'Upcoming service reminders' : 'Upcoming services under control',
      date: dueSoonCount > 0 ? `${dueSoonCount} due within 30 days` : 'No near-term service risk',
      toneBg: dueSoonCount > 0 ? BLUE_SOFT : TEAL_SOFT,
      toneColor: dueSoonCount > 0 ? '#2156B5' : TEAL_DARK,
      toneLabel: dueSoonCount > 0 ? 'Planned' : 'Good',
    },
  ]

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
            gap: '14px',
            padding: isMobile ? '14px' : '18px',
            background: BG,
          }}
        >
          <div
            style={{
              ...shellCard,
              background: HEADER_BG,
              border: '1px solid rgba(255,255,255,0.08)',
              padding: isMobile ? '18px 16px 16px' : '22px 24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                gap: '16px',
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
                    fontSize: isMobile ? '30px' : '34px',
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
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <button
                  onClick={() => router.push('/dashboard/jobs')}
                  style={{
                    ...buttonStyle,
                    background: TEAL,
                    color: '#FFFFFF',
                    border: 'none',
                    boxShadow: '0 8px 18px rgba(31,158,148,0.20)',
                  }}
                >
                  <IconSpark size={16} />
                  Add job
                </button>

                <button
                  onClick={() => router.push('/dashboard/quotes')}
                  style={{
                    ...buttonStyle,
                    background: 'rgba(255,255,255,0.06)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <IconInvoice size={16} />
                  New quote
                </button>

                <button
                  onClick={() => router.push('/dashboard/schedule')}
                  style={{
                    ...buttonStyle,
                    background: 'rgba(255,255,255,0.06)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.10)',
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
              gap: '14px',
            }}
          >
            {revenueCards.map(card => (
              <div
                key={card.label}
                style={{
                  ...panelCard,
                  gridColumn: isMobile ? 'span 1' : 'span 3',
                  minHeight: 138,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: SUBTLE,
                        border: `1px solid ${BORDER}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.accent,
                        flexShrink: 0,
                      }}
                    >
                      {card.icon}
                    </div>
                    <div style={{ ...TYPE.label, fontSize: '12px', color: TEXT2 }}>{card.label}</div>
                  </div>

                  <div
                    style={{
                      padding: '6px 10px',
                      borderRadius: '999px',
                      background: card.chipBg,
                      color: card.chipColor,
                      fontSize: '11px',
                      fontWeight: 800,
                      lineHeight: 1,
                    }}
                  >
                    Live
                  </div>
                </div>

                <div>
                  <div style={{ ...TYPE.valueLg, fontSize: card.label === 'Revenue' ? '26px' : '30px', marginBottom: '8px' }}>
                    {card.value}
                  </div>
                  <div style={{ ...TYPE.bodySm }}>{card.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))',
              gap: '14px',
              alignItems: 'stretch',
            }}
          >
            <div
              style={{
                ...panelCard,
                gridColumn: isMobile ? 'span 1' : 'span 8',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <h3 style={sectionTitle}>Revenues and performance</h3>
                  <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>
                    Your body layout now follows the cleaner dashboard style, while keeping your original palette and data.
                  </div>
                </div>

                <button style={buttonStyle}>
                  This year
                  <span style={{ fontSize: '11px', color: MUTED }}>▼</span>
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    borderRadius: '14px',
                    background: SUBTLE,
                    border: `1px solid ${BORDER}`,
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: BLUE_SOFT,
                        color: '#2156B5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconRevenue size={16} />
                    </div>
                    <div>
                      <div style={{ ...TYPE.label, color: TEXT2 }}>Revenue</div>
                      <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>Paid invoices</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ ...TYPE.valueSm, fontSize: '18px' }}>{formatCurrency(invoiceStats.collected)}</div>
                    <div
                      style={{
                        marginTop: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '5px 8px',
                        borderRadius: '999px',
                        background: TEAL_SOFT,
                        color: TEAL_DARK,
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {invoiceStats.paidCount} paid
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: '14px',
                    background: SUBTLE,
                    border: `1px solid ${BORDER}`,
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: AMBER_SOFT,
                        color: AMBER,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconInvoice size={16} />
                    </div>
                    <div>
                      <div style={{ ...TYPE.label, color: TEXT2 }}>Outstanding</div>
                      <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>Uncollected invoices</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ ...TYPE.valueSm, fontSize: '18px' }}>{formatCurrency(invoiceStats.outstanding)}</div>
                    <div
                      style={{
                        marginTop: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '5px 8px',
                        borderRadius: '999px',
                        background: invoiceStats.outstanding > 0 ? AMBER_SOFT : TEAL_SOFT,
                        color: invoiceStats.outstanding > 0 ? AMBER : TEAL_DARK,
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {invoiceStats.overdueCount} overdue
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  height: 300,
                  borderRadius: '16px',
                  background: PANEL,
                  border: `1px solid ${BORDER}`,
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: '42px 1fr',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    color: TEXT3,
                    fontSize: '11px',
                    fontWeight: 700,
                    paddingBottom: '24px',
                  }}
                >
                  {[4, 3, 2, 1, 0].map(tick => (
                    <span key={tick}>${tick}k</span>
                  ))}
                </div>

                <div
                  style={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                    gap: '10px',
                    alignItems: 'end',
                    height: '100%',
                  }}
                >
                  {[12, 35, 58, 81].map((top, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: `${top}%`,
                        borderTop: '1px solid #EEF2F7',
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
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '40px',
                          height: '190px',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            width: '12px',
                            height: `${item.totalHeight}px`,
                            borderRadius: '999px',
                            background: 'linear-gradient(180deg, #B7CCF8 0%, #7EA5EA 100%)',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: `${item.totalHeight + 8 > 182 ? 8 : item.totalHeight + 8}px`,
                            width: '12px',
                            height: `${Math.max(10, item.completedHeight * 0.5)}px`,
                            borderRadius: '999px',
                            background: 'linear-gradient(180deg, #B9DD7C 0%, #A8D167 100%)',
                          }}
                        />
                      </div>

                      <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                ...panelCard,
                gridColumn: isMobile ? 'span 1' : 'span 4',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <h3 style={sectionTitle}>Your performance</h3>
                <button style={{ ...buttonStyle, height: '36px', padding: '0 12px' }}>
                  View all
                  <IconArrow size={14} />
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: '4px',
                }}
              >
                <div
                  style={{
                    width: isMobile ? 210 : 230,
                    height: isMobile ? 210 : 230,
                    borderRadius: '50%',
                    background: gaugeBackground,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    clipPath: 'inset(0 0 44% 0)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      width: '58%',
                      height: '58%',
                      borderRadius: '50%',
                      background: PANEL,
                      border: `1px solid ${BORDER}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 18px rgba(15,23,42,0.04)',
                      top: '21%',
                    }}
                  >
                    <div style={{ ...TYPE.valueLg, fontSize: '26px' }}>{performanceScore}%</div>
                    <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>Success</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '12px', marginTop: '-12px' }}>
                {performanceTasks.map(task => (
                  <div
                    key={task.label}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: task.accent,
                        display: 'inline-block',
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ ...TYPE.body, fontWeight: 700 }}>{task.label}</div>
                      <div style={{ ...TYPE.bodySm, marginTop: '2px' }}>{task.meta}</div>
                    </div>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: `1.5px solid ${task.complete ? '#84CC16' : '#CBD5E1'}`,
                        color: task.complete ? '#65A30D' : '#CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {task.complete ? <IconCheck size={14} /> : <IconCircle size={14} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))',
              gap: '14px',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                ...panelCard,
                gridColumn: isMobile ? 'span 1' : 'span 8',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <h3 style={sectionTitle}>Upcoming schedule</h3>
                  <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>
                    Upcoming service work laid out in a cleaner table-style body.
                  </div>
                </div>

                <button
                  onClick={() => router.push('/dashboard/schedule')}
                  style={{ ...buttonStyle, height: '38px' }}
                >
                  View all
                  <IconArrow size={14} />
                </button>
              </div>

              {upcoming.length === 0 ? (
                <div
                  style={{
                    borderRadius: '14px',
                    border: `1px solid ${BORDER}`,
                    background: SUBTLE,
                    padding: '28px 18px',
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  No upcoming jobs.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: isMobile ? 0 : 720 }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1.2fr 1fr 0.9fr' : '1.35fr 1fr 1fr 0.75fr',
                        gap: '14px',
                        padding: '0 12px 10px',
                        color: MUTED,
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      <div>Client</div>
                      <div>{isMobile ? 'Date' : 'Next service'}</div>
                      <div>{isMobile ? 'Status' : 'Location'}</div>
                      {!isMobile && <div>Status</div>}
                    </div>

                    <div style={{ display: 'grid', gap: '8px' }}>
                      {upcoming.map((job, i) => {
                        const av = avColors[i % avColors.length]
                        const days = job.next_service_date ? getDays(job.next_service_date) : 999
                        const u = urgency(days)

                        return (
                          <div
                            key={job.id}
                            onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: isMobile ? '1.2fr 1fr 0.9fr' : '1.35fr 1fr 1fr 0.75fr',
                              gap: '14px',
                              alignItems: 'center',
                              padding: '14px 12px',
                              borderRadius: '14px',
                              border: `1px solid ${BORDER}`,
                              background: PANEL,
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
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
                                <div style={{ ...TYPE.titleSm, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {job.customers?.first_name} {job.customers?.last_name}
                                </div>
                                <div style={{ ...TYPE.bodySm, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                                </div>
                              </div>
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <div style={{ ...TYPE.body, fontWeight: 700 }}>
                                {job.next_service_date
                                  ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                                  : 'Not scheduled'}
                              </div>
                              <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>
                                {job.next_service_date
                                  ? new Date(job.next_service_date).toLocaleDateString('en-AU', { weekday: 'short' })
                                  : ''}
                              </div>
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <div style={{ ...TYPE.body, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {isMobile ? u.text : (job.customers?.suburb || 'No suburb')}
                              </div>
                              <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>
                                {isMobile ? (job.customers?.suburb || 'No suburb') : u.text}
                              </div>
                            </div>

                            {!isMobile && (
                              <div>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '8px 11px',
                                    borderRadius: '999px',
                                    background: u.bg,
                                    color: u.val,
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {u.label}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                gridColumn: isMobile ? 'span 1' : 'span 4',
                display: 'grid',
                gap: '14px',
              }}
            >
              <div style={panelCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '14px' }}>
                  <h3 style={sectionTitle}>Pending tasks</h3>
                  <button style={{ ...buttonStyle, height: '36px', padding: '0 12px' }}>
                    View all
                    <IconArrow size={14} />
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {sideTasks.map((task, index) => (
                    <div
                      key={task.title}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderTop: index === 0 ? 'none' : `1px solid ${BORDER}`,
                      }}
                    >
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: task.toneBg,
                          color: task.toneColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {index === 0 ? <IconAlert size={18} /> : index === 1 ? <IconInvoice size={18} /> : <IconCalendar size={18} />}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ ...TYPE.body, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {task.title}
                        </div>
                        <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>{task.date}</div>
                      </div>

                      <span
                        style={{
                          padding: '8px 11px',
                          borderRadius: '999px',
                          background: task.toneBg,
                          color: task.toneColor,
                          fontSize: '11px',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {task.toneLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={panelCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '14px' }}>
                  <h3 style={sectionTitle}>Recent customers</h3>
                  <button
                    onClick={() => router.push('/dashboard/customers')}
                    style={{ ...buttonStyle, height: '36px', padding: '0 12px' }}
                  >
                    View all
                    <IconArrow size={14} />
                  </button>
                </div>

                {recent.length === 0 ? (
                  <div
                    style={{
                      borderRadius: '14px',
                      border: `1px solid ${BORDER}`,
                      background: SUBTLE,
                      padding: '24px 16px',
                      textAlign: 'center',
                      color: TEXT3,
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    No recent customers yet.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {recent.slice(0, 4).map((job, i) => {
                      const av = avColors[(i + 1) % avColors.length]
                      const status = statusPill(job.next_service_date)

                      return (
                        <div
                          key={job.id}
                          onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 0',
                            borderTop: i === 0 ? 'none' : `1px solid ${BORDER}`,
                            cursor: 'pointer',
                          }}
                        >
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
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
                            <div style={{ ...TYPE.body, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.customers?.first_name} {job.customers?.last_name}
                            </div>
                            <div style={{ ...TYPE.bodySm, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              {job.customers?.phone ? (
                                <>
                                  <IconPhone size={12} />
                                  <span>{job.customers.phone}</span>
                                </>
                              ) : (
                                <span>{job.customers?.suburb || 'No suburb'}</span>
                              )}
                            </div>
                          </div>

                          <span
                            style={{
                              padding: '7px 10px',
                              borderRadius: '999px',
                              background: status.bg,
                              color: status.color,
                              fontSize: '11px',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {status.label}
                          </span>
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
    </div>
  )
}