'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const RED = '#B91C1C'
const AMBER = '#92400E'
const GREEN = '#166534'
const BLUE = '#1E3A8A'
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
}

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

type Job = {
  id: string
  created_at: string
  install_date: string | null
  next_service_date: string | null
  brand: string | null
  capacity_kw: number | null
  customer_id: string | null
}

type Invoice = {
  id: string
  created_at: string
  status: string
  total: number
  amount_paid: number
}

type Quote = {
  id: string
  created_at: string
  status: string
  total: number
}

type Customer = {
  id: string
  created_at: string
  suburb: string | null
}

type ReportView = 'revenue' | 'jobs' | 'quotes' | 'services'

function isSameMonth(dateStr: string | null | undefined, base: Date) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return d.getMonth() === base.getMonth() && d.getFullYear() === base.getFullYear()
}

function formatMoney(value: number) {
  return `$${value.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`
}

function monthLabelFromOffset(base: Date, offset: number) {
  const d = new Date(base.getFullYear(), base.getMonth() + offset, 1)
  return d.toLocaleDateString('en-AU', { month: 'short' })
}

function DashboardImageIcon({
  src,
  alt,
  size = 28,
}: {
  src: string
  alt: string
  size?: number
}) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
  )
}

function IconCollected({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_6128eed6331e4d0188d1bd62ed3e4c89~mv2.png"
      alt="Revenue collected"
      size={size}
    />
  )
}

function IconOutstanding({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_147eeb738a784ca184267c67f66c1c30~mv2.png"
      alt="Outstanding"
      size={size}
    />
  )
}

function IconAcceptedValue({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_9cbf007dda55411888ac59c3123f8657~mv2.png"
      alt="Accepted quote value"
      size={size}
    />
  )
}

function IconOverdueServices({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_85b27ad4a4ff4fe585436aaf59c63b94~mv2.png"
      alt="Overdue services"
      size={size}
    />
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

function IconPrint({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <rect x="7" y="14" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

function IconExternalLink({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ReportsPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [reportView, setReportView] = useState<ReportView>('revenue')

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

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

      const [jobsRes, invoicesRes, quotesRes, customersRes] = await Promise.all([
        supabase
          .from('jobs')
          .select('id, created_at, install_date, next_service_date, brand, capacity_kw, customer_id')
          .eq('business_id', userData.business_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('invoices')
          .select('id, created_at, status, total, amount_paid')
          .eq('business_id', userData.business_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('quotes')
          .select('id, created_at, status, total')
          .eq('business_id', userData.business_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('customers')
          .select('id, created_at, suburb')
          .eq('business_id', userData.business_id)
          .order('created_at', { ascending: false }),
      ])

      setJobs((jobsRes.data || []) as Job[])
      setInvoices((invoicesRes.data || []) as Invoice[])
      setQuotes((quotesRes.data || []) as Quote[])
      setCustomers((customersRes.data || []) as Customer[])
      setLoading(false)
    }

    load()
  }, [router])

  const today = new Date()

  const todayStr = today.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const report = useMemo(() => {
    const currentMonth = today
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

    const revenueCollected = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (Number(i.total) || 0), 0)

    const outstanding = invoices
      .filter(i => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + ((Number(i.total) || 0) - (Number(i.amount_paid) || 0)), 0)

    const quotesAcceptedValue = quotes
      .filter(q => q.status === 'accepted')
      .reduce((sum, q) => sum + (Number(q.total) || 0), 0)

    const jobsThisMonth = jobs.filter(j => isSameMonth(j.created_at, currentMonth)).length
    const jobsLastMonth = jobs.filter(j => isSameMonth(j.created_at, previousMonth)).length
    const newCustomersThisMonth = customers.filter(c => isSameMonth(c.created_at, currentMonth)).length
    const invoicesThisMonth = invoices.filter(i => isSameMonth(i.created_at, currentMonth)).length
    const quotesThisMonth = quotes.filter(q => isSameMonth(q.created_at, currentMonth)).length

    const overdueServices = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today).length

    const dueSoonServices = jobs.filter(j => {
      if (!j.next_service_date) return false
      const diff = Math.floor((new Date(j.next_service_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diff >= 0 && diff <= 30
    }).length

    const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length
    const sentQuotes = quotes.filter(q => q.status === 'sent').length
    const acceptanceRate = quotes.length > 0 ? Math.round((acceptedQuotes / quotes.length) * 100) : 0

    const monthlyRevenue = [-5, -4, -3, -2, -1, 0].map(offset => {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + offset, 1)
      const total = invoices
        .filter(i => isSameMonth(i.created_at, monthDate))
        .reduce((sum, i) => sum + (Number(i.total) || 0), 0)

      return {
        label: monthLabelFromOffset(today, offset),
        total,
      }
    })

    const suburbCounts: Record<string, number> = {}
    customers.forEach(c => {
      const key = (c.suburb || 'Unknown').trim() || 'Unknown'
      suburbCounts[key] = (suburbCounts[key] || 0) + 1
    })
    const topSuburbs = Object.entries(suburbCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

    const brandCounts: Record<string, number> = {}
    jobs.forEach(j => {
      const key = (j.brand || 'Unknown').trim() || 'Unknown'
      brandCounts[key] = (brandCounts[key] || 0) + 1
    })
    const topBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

    return {
      revenueCollected,
      outstanding,
      quotesAcceptedValue,
      jobsThisMonth,
      jobsLastMonth,
      newCustomersThisMonth,
      invoicesThisMonth,
      quotesThisMonth,
      overdueServices,
      dueSoonServices,
      acceptedQuotes,
      sentQuotes,
      acceptanceRate,
      monthlyRevenue,
      topSuburbs,
      topBrands,
    }
  }, [customers, invoices, jobs, quotes, today])

  const trendConfig = useMemo(() => {
    if (reportView === 'jobs') {
      const monthly = [-5, -4, -3, -2, -1, 0].map(offset => {
        const monthDate = new Date(today.getFullYear(), today.getMonth() + offset, 1)
        const total = jobs.filter(j => isSameMonth(j.created_at, monthDate)).length
        return { label: monthLabelFromOffset(today, offset), total }
      })

      return {
        title: 'Jobs trend',
        subtitle: 'Jobs created over the last 6 months.',
        pill: `${report.jobsThisMonth} this month`,
        widgets: [
          { label: 'Jobs this month', value: report.jobsThisMonth },
          { label: 'Last month', value: report.jobsLastMonth },
          { label: 'New customers', value: report.newCustomersThisMonth },
          { label: 'Invoices', value: report.invoicesThisMonth },
          { label: 'Quotes', value: report.quotesThisMonth },
          { label: 'Due soon', value: report.dueSoonServices },
        ],
        monthly,
        max: Math.max(...monthly.map(m => m.total), 1),
        formatValue: (v: number) => String(v),
      }
    }

    if (reportView === 'quotes') {
      const monthly = [-5, -4, -3, -2, -1, 0].map(offset => {
        const monthDate = new Date(today.getFullYear(), today.getMonth() + offset, 1)
        const total = quotes
          .filter(q => isSameMonth(q.created_at, monthDate))
          .reduce((sum, q) => sum + (Number(q.total) || 0), 0)
        return { label: monthLabelFromOffset(today, offset), total }
      })

      return {
        title: 'Quote trend',
        subtitle: 'Quote value over the last 6 months.',
        pill: `Acceptance ${report.acceptanceRate}%`,
        widgets: [
          { label: 'Accepted', value: report.acceptedQuotes },
          { label: 'Sent', value: report.sentQuotes },
          { label: 'Quotes this month', value: report.quotesThisMonth },
          { label: 'Acceptance', value: `${report.acceptanceRate}%` },
          { label: 'Accepted value', value: formatMoney(report.quotesAcceptedValue) },
          { label: 'Outstanding', value: formatMoney(report.outstanding) },
        ],
        monthly,
        max: Math.max(...monthly.map(m => m.total), 1),
        formatValue: (v: number) => `$${Math.round(v).toLocaleString('en-AU')}`,
      }
    }

    if (reportView === 'services') {
      const monthly = [-5, -4, -3, -2, -1, 0].map(offset => {
        const monthDate = new Date(today.getFullYear(), today.getMonth() + offset, 1)
        const total = jobs.filter(j => j.next_service_date && isSameMonth(j.next_service_date, monthDate)).length
        return { label: monthLabelFromOffset(today, offset), total }
      })

      return {
        title: 'Service trend',
        subtitle: 'Scheduled services over the last 6 months.',
        pill: `${report.overdueServices + report.dueSoonServices} active`,
        widgets: [
          { label: 'Overdue', value: report.overdueServices },
          { label: 'Due soon', value: report.dueSoonServices },
          { label: 'Jobs this month', value: report.jobsThisMonth },
          { label: 'Last month', value: report.jobsLastMonth },
          { label: 'New customers', value: report.newCustomersThisMonth },
          { label: 'Quotes', value: report.quotesThisMonth },
        ],
        monthly,
        max: Math.max(...monthly.map(m => m.total), 1),
        formatValue: (v: number) => String(v),
      }
    }

    const monthly = report.monthlyRevenue

    return {
      title: 'Revenue trend',
      subtitle: 'Invoiced revenue over the last 6 months with current collections snapshot.',
      pill: `Acceptance rate ${report.acceptanceRate}%`,
      widgets: [
        { label: 'Jobs this month', value: report.jobsThisMonth },
        { label: 'Last month', value: report.jobsLastMonth },
        { label: 'New customers', value: report.newCustomersThisMonth },
        { label: 'Invoices', value: report.invoicesThisMonth },
        { label: 'Quotes', value: report.quotesThisMonth },
        { label: 'Due soon', value: report.dueSoonServices },
      ],
      monthly,
      max: Math.max(...monthly.map(m => m.total), 1),
      formatValue: (v: number) => `$${Math.round(v).toLocaleString('en-AU')}`,
    }
  }, [reportView, report, jobs, quotes, today])

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    overflow: 'hidden',
  }

  const statCard: React.CSSProperties = {
    ...card,
    padding: isMobile ? '14px 14px 13px' : '14px 16px 13px',
    minHeight: isMobile ? 112 : 118,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '16px',
    borderRadius: '16px',
  }

  const sectionHeaderTitle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 800,
    color: TEXT,
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  }

  const cardArrowBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: TEXT3,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  }

  const topCards = [
    {
      label: 'Revenue collected',
      value: formatMoney(report.revenueCollected),
      sub: 'Paid invoices',
      icon: <IconCollected size={28} />,
      accent: GREEN,
      tag: 'Financials',
    },
    {
      label: 'Outstanding',
      value: formatMoney(report.outstanding),
      sub: 'Awaiting payment',
      icon: <IconOutstanding size={28} />,
      accent: BLUE,
      tag: 'Receivables',
    },
    {
      label: 'Accepted quote value',
      value: formatMoney(report.quotesAcceptedValue),
      sub: 'Approved quotes',
      icon: <IconAcceptedValue size={28} />,
      accent: TEAL_DARK,
      tag: 'Quote value',
    },
    {
      label: 'Overdue services',
      value: String(report.overdueServices),
      sub: report.overdueServices > 0 ? 'Needs action now' : 'All clear',
      icon: <IconOverdueServices size={28} />,
      accent: report.overdueServices > 0 ? RED : TEXT,
      tag: 'Service load',
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/reports" />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: TEXT3,
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Loading reports...
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        fontFamily: FONT,
        background: BG,
        minHeight: '100vh',
      }}
    >
      <Sidebar active="/dashboard/reports" />

      <div style={{ flex: 1, minWidth: 0, background: BG }}>
        <div
          style={{
            padding: isMobile ? '14px' : '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
          }}
        >
          <div
            style={{
              ...card,
              padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
              background: HEADER_BG,
              border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: isMobile ? 0 : '16px',
              marginLeft: isMobile ? '-14px' : 0,
              marginRight: isMobile ? '-14px' : 0,
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>
              {todayStr}
            </div>

            <div
              style={{
                fontSize: isMobile ? '26px' : '34px',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                fontWeight: 900,
                color: WHITE,
                marginBottom: '8px',
              }}
            >
              Reports
            </div>

            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.72)',
                maxWidth: '760px',
              }}
            >
              Review revenue, activity, service workload, and customer trends from one premium reporting centre.
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
                onClick={() => window.print()}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: 'rgba(255,255,255,0.06)',
                  color: WHITE,
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '10px',
                }}
              >
                <IconPrint size={14} />
                Print report
              </button>

              <button
                onClick={() => router.push('/dashboard/invoices')}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: TEAL,
                  color: WHITE,
                  border: 'none',
                  borderRadius: '10px',
                }}
              >
                <IconSpark size={14} />
                View invoices
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            {topCards.map(item => (
              <div key={item.label} style={statCard}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>{item.tag}</div>
                    <div style={{ ...TYPE.title, fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>{item.label}</div>
                  </div>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      ...TYPE.valueLg,
                      fontSize: item.label === 'Accepted quote value' && isMobile ? '22px' : '26px',
                      color: item.accent,
                    }}
                  >
                    {item.value}
                  </div>
                  <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 320px',
              gap: '14px',
              alignItems: 'start',
            }}
          >
            <div style={card}>
              <div
                style={{
                  padding: '14px 16px 12px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={sectionHeaderTitle}>{trendConfig.title}</div>
                  <div style={{ ...TYPE.bodySm }}>{trendConfig.subtitle}</div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                    width: isMobile ? '100%' : 'auto',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      width: isMobile ? '100%' : 'auto',
                    }}
                  >
                    <select
                      value={reportView}
                      onChange={e => setReportView(e.target.value as ReportView)}
                      style={{
                        height: '40px',
                        padding: '0 38px 0 12px',
                        borderRadius: '10px',
                        border: `1px solid ${BORDER}`,
                        background: WHITE,
                        color: TEXT2,
                        fontSize: '12px',
                        fontWeight: 700,
                        fontFamily: FONT,
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        minWidth: '140px',
                        width: isMobile ? '100%' : 'auto',
                      }}
                    >
                      <option value="revenue">Revenue</option>
                      <option value="jobs">Jobs</option>
                      <option value="quotes">Quotes</option>
                      <option value="services">Services</option>
                    </select>

                    <div
                      style={{
                        position: 'absolute',
                        right: '12px',
                        pointerEvents: 'none',
                        color: TEXT3,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  <div
                    style={{
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '10px',
                      border: `1px solid ${BORDER}`,
                      background: WHITE,
                      color: TEXT2,
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {trendConfig.pill}
                  </div>
                </div>
              </div>

              <div style={{ padding: '14px 16px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, minmax(0, 1fr))',
                    gap: '10px',
                    marginBottom: '14px',
                  }}
                >
                  {trendConfig.widgets.map(item => (
                    <div
                      key={item.label}
                      style={{
                        minWidth: 0,
                        minHeight: isMobile ? '72px' : '78px',
                        borderRadius: '12px',
                        background: '#F8FAFC',
                        border: `1px solid ${BORDER}`,
                        padding: isMobile ? '10px' : '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          ...TYPE.label,
                          marginBottom: 0,
                          lineHeight: 1.25,
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          ...TYPE.valueMd,
                          fontSize:
                            typeof item.value === 'string' && item.value.length > 9 ? '16px' : '20px',
                          lineHeight: 1,
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    height: isMobile ? 250 : 290,
                    borderRadius: '14px',
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    padding: '16px 16px 14px',
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
                      fontSize: '11px',
                      color: TEXT3,
                      paddingTop: '4px',
                      paddingBottom: '24px',
                      fontWeight: 700,
                    }}
                  >
                    {[100, 75, 50, 25, 0].map(tick => (
                      <span key={tick}>{trendConfig.formatValue(Math.round((trendConfig.max * tick) / 100))}</span>
                    ))}
                  </div>

                  <div
                    style={{
                      position: 'relative',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                      gap: '10px',
                      alignItems: 'end',
                      paddingTop: '6px',
                    }}
                  >
                    {[0, 25, 50, 75].map((top, i) => (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: `${top}%`,
                          borderTop: '1px dashed #E8EDF3',
                          zIndex: 0,
                        }}
                      />
                    ))}

                    {trendConfig.monthly.map(item => {
                      const height = Math.max(16, Math.round((item.total / trendConfig.max) * (isMobile ? 136 : 166)))

                      return (
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
                              fontSize: '10px',
                              fontWeight: 800,
                              color: TEXT3,
                              minHeight: '14px',
                              textAlign: 'center',
                            }}
                          >
                            {item.total > 0 ? trendConfig.formatValue(item.total) : trendConfig.formatValue(0)}
                          </div>

                          <div
                            style={{
                              width: '100%',
                              maxWidth: '42px',
                              height: isMobile ? '146px' : '178px',
                              display: 'flex',
                              alignItems: 'flex-end',
                              justifyContent: 'center',
                            }}
                          >
                            <div
                              style={{
                                width: '30px',
                                height: `${height}px`,
                                borderRadius: '999px',
                                background: item.total > 0 ? TEAL : '#E2E8F0',
                              }}
                            />
                          </div>

                          <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3 }}>
                            {item.label}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>This month</div>
                  <button onClick={() => router.push('/dashboard/jobs')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    ['New customers', report.newCustomersThisMonth],
                    ['Jobs created', report.jobsThisMonth],
                    ['Invoices created', report.invoicesThisMonth],
                    ['Quotes created', report.quotesThisMonth],
                    ['Due soon services', report.dueSoonServices],
                  ].map(([label, value]) => (
                    <div
                      key={label as string}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: '#F8FAFC',
                        border: `1px solid ${BORDER}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: TEXT }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Quote performance</div>
                  <button onClick={() => router.push('/dashboard/quotes')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    ['Accepted quotes', report.acceptedQuotes],
                    ['Sent quotes', report.sentQuotes],
                    ['Acceptance rate', `${report.acceptanceRate}%`],
                  ].map(([label, value]) => (
                    <div
                      key={label as string}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: '#F8FAFC',
                        border: `1px solid ${BORDER}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: TEXT }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Snapshot</div>
                  <button onClick={() => router.push('/dashboard/revenue')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ marginTop: '14px', display: 'grid', gap: '8px' }}>
                  {[
                    {
                      label: 'Jobs trend',
                      heading: report.jobsThisMonth >= report.jobsLastMonth ? 'Up or steady' : 'Down from last month',
                      sub: `${report.jobsThisMonth} this month vs ${report.jobsLastMonth} last month`,
                      accent: report.jobsThisMonth >= report.jobsLastMonth ? GREEN : AMBER,
                    },
                    {
                      label: 'Service workload',
                      heading: `${report.overdueServices + report.dueSoonServices} upcoming actions`,
                      sub: `${report.overdueServices} overdue · ${report.dueSoonServices} due soon`,
                      accent: report.overdueServices > 0 ? RED : TEAL,
                    },
                    {
                      label: 'Cash flow',
                      heading: report.outstanding > 0 ? 'Follow-up recommended' : 'Healthy',
                      sub: `${formatMoney(report.outstanding)} outstanding right now`,
                      accent: report.outstanding > 0 ? AMBER : GREEN,
                    },
                  ].map(s => (
                    <div
                      key={s.label}
                      style={{
                        background: '#F9FAFB',
                        border: `1px solid ${BORDER}`,
                        borderRadius: '12px',
                        padding: '14px',
                        borderLeft: `3px solid ${s.accent}`,
                      }}
                    >
                      <div style={{ ...TYPE.label, marginBottom: '6px' }}>{s.label}</div>
                      <div style={{ ...TYPE.title, fontSize: '14px', marginBottom: '4px' }}>{s.heading}</div>
                      <div style={TYPE.bodySm}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '14px',
              alignItems: 'start',
            }}
          >
            {[
              {
                title: 'Top suburbs',
                subtitle: 'Where most of your customers are located',
                data: report.topSuburbs,
                avatarBg: '#E8F4F1',
                avatarColor: '#0A4F4C',
                empty: 'No suburb data yet.',
              },
              {
                title: 'Top installed brands',
                subtitle: 'Most common equipment brands in your records',
                data: report.topBrands,
                avatarBg: '#DBEAFE',
                avatarColor: '#1E3A8A',
                empty: 'No brand data yet.',
              },
            ].map(section => (
              <div key={section.title} style={card}>
                <div
                  style={{
                    padding: '14px 16px 12px',
                    borderBottom: `1px solid ${BORDER}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={sectionHeaderTitle}>{section.title}</div>
                    <div style={{ ...TYPE.bodySm }}>{section.subtitle}</div>
                  </div>

                  <button onClick={() => router.push('/dashboard/customers')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ padding: '14px 16px' }}>
                  {section.data.length === 0 ? (
                    <div
                      style={{
                        padding: '20px 14px',
                        borderRadius: '10px',
                        background: '#F8FAFC',
                        border: `1px solid ${BORDER}`,
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: TEXT3,
                      }}
                    >
                      {section.empty}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {section.data.map(([name, count], index) => (
                        <div
                          key={name as string}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: '#F8FAFC',
                            border: `1px solid ${BORDER}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '10px',
                                background: section.avatarBg,
                                color: section.avatarColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {index + 1}
                            </div>
                            <span
                              style={{
                                ...TYPE.titleSm,
                                fontSize: '13px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {name}
                            </span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 900, color: TEXT }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}