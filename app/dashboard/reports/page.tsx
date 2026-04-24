'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
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

type TrendPoint = {
  label: string
  total: number
}

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

function IconTrendUp({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 7l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrendDown({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 17l-8-8-4 4-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function pctChange(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return 0
    return 100
  }
  return Math.round(((current - previous) / previous) * 100)
}

function formatDelta(n: number) {
  return `${n >= 0 ? '+' : ''}${n}%`
}

function AreaChart({
  series,
  maxVal,
  height = 240,
  isMobile = false,
  formatValue,
}: {
  series: TrendPoint[]
  maxVal: number
  height?: number
  isMobile?: boolean
  formatValue: (v: number) => string
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [svgWidth, setSvgWidth] = useState(600)

  useEffect(() => {
    function measure() {
      if (svgRef.current) setSvgWidth(svgRef.current.getBoundingClientRect().width)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const PAD_L = isMobile ? 8 : 12
  const PAD_R = isMobile ? 8 : 12
  const PAD_T = 28
  const PAD_B = 34
  const chartW = svgWidth - PAD_L - PAD_R
  const chartH = height - PAD_T - PAD_B
  const n = series.length

  function xOf(i: number) {
    return PAD_L + (i / Math.max(n - 1, 1)) * chartW
  }

  function yOf(v: number) {
    const pct = maxVal > 0 ? v / maxVal : 0
    return PAD_T + chartH - pct * chartH
  }

  const points = series.map((s, i) => ({ x: xOf(i), y: yOf(s.total), ...s }))

  function smoothPath(pts: { x: number; y: number }[]) {
    if (pts.length < 2) return ''
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]
      const curr = pts[i]
      const cpx = (prev.x + curr.x) / 2
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
    }
    return d
  }

  const linePath = smoothPath(points)
  const areaPath = linePath
    ? `${linePath} L ${points[n - 1].x} ${PAD_T + chartH} L ${points[0].x} ${PAD_T + chartH} Z`
    : ''

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: PAD_T + chartH - f * chartH,
    val: Math.round(maxVal * f),
  }))

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        style={{ display: 'block', overflow: 'visible' }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="reportsAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TEAL} stopOpacity="0.18" />
            <stop offset="100%" stopColor={TEAL} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              x2={PAD_L + chartW}
              y1={t.y}
              y2={t.y}
              stroke={i === 0 ? BORDER : '#EEF2F7'}
              strokeWidth={i === 0 ? 1 : 0.8}
              strokeDasharray={i === 0 ? '0' : '4 3'}
            />
            <text
              x={PAD_L - 6}
              y={t.y + 3.5}
              textAnchor="end"
              fontSize="9"
              fontWeight="700"
              fill={TEXT3}
              fontFamily={FONT}
            >
              {formatValue(t.val)}
            </text>
          </g>
        ))}

        {points.map((p, i) => (
          <line
            key={`vl-${i}`}
            x1={p.x}
            x2={p.x}
            y1={PAD_T}
            y2={PAD_T + chartH}
            stroke={hovered === i ? '#CBD5E1' : 'transparent'}
            strokeWidth="1"
            strokeDasharray="3 2"
          />
        ))}

        {areaPath && <path d={areaPath} fill="url(#reportsAreaGrad)" />}

        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={TEAL}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((p, i) => (
          <g key={`dot-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hovered === i ? 5 : 3.5}
              fill={hovered === i ? TEAL : WHITE}
              stroke={TEAL}
              strokeWidth={hovered === i ? 2.5 : 1.8}
              style={{ transition: 'r 0.15s, fill 0.15s' }}
            />
            <rect
              x={p.x - chartW / n / 2}
              y={PAD_T}
              width={chartW / n}
              height={chartH}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setHovered(i)}
            />
          </g>
        ))}

        {points.map((p, i) => (
          <text
            key={`xl-${i}`}
            x={p.x}
            y={PAD_T + chartH + 20}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={hovered === i ? TEXT : TEXT3}
            fontFamily={FONT}
          >
            {p.label}
          </text>
        ))}

        {hovered !== null && (() => {
          const p = points[hovered]
          const tw = 90
          const th = 38
          let tx = p.x - tw / 2
          if (tx < PAD_L) tx = PAD_L
          if (tx + tw > PAD_L + chartW) tx = PAD_L + chartW - tw
          const ty = Math.max(PAD_T - 2, p.y - th - 10)

          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={tx} y={ty} width={tw} height={th} rx="8" fill={TEXT} />
              <text x={tx + tw / 2} y={ty + 13} textAnchor="middle" fontSize="9" fontWeight="700" fill="#94A3B8" fontFamily={FONT}>
                {p.label}
              </text>
              <text x={tx + tw / 2} y={ty + 27} textAnchor="middle" fontSize="12" fontWeight="900" fill={WHITE} fontFamily={FONT}>
                {formatValue(p.total)}
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
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
        pill: `${report.jobsThisMonth} this month`,
        selectedLabel: 'Jobs created',
        selectedTotal: report.jobsThisMonth,
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
        pill: `Acceptance ${report.acceptanceRate}%`,
        selectedLabel: 'Quote value',
        selectedTotal: report.quotesAcceptedValue,
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
        pill: `${report.overdueServices + report.dueSoonServices} active`,
        selectedLabel: 'Services scheduled',
        selectedTotal: report.overdueServices + report.dueSoonServices,
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
      pill: `Acceptance rate ${report.acceptanceRate}%`,
      selectedLabel: 'Invoiced revenue',
      selectedTotal: report.revenueCollected,
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

  const currentJobs = report.jobsThisMonth
  const previousJobs = report.jobsLastMonth
  const jobDelta = pctChange(currentJobs, previousJobs)

  const currentQuotes = report.quotesThisMonth
  const previousQuotes = quotes.filter(q => isSameMonth(q.created_at, new Date(today.getFullYear(), today.getMonth() - 1, 1))).length
  const quoteDelta = pctChange(currentQuotes, previousQuotes)

  const currentInvoices = report.invoicesThisMonth
  const previousInvoices = invoices.filter(i => isSameMonth(i.created_at, new Date(today.getFullYear(), today.getMonth() - 1, 1))).length
  const invoiceDelta = pctChange(currentInvoices, previousInvoices)

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '16px',
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

  const btnOutline: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    border: `1px solid ${BORDER}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: TEXT2,
    background: WHITE,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  }

  const btnDark: React.CSSProperties = {
    height: '34px',
    padding: '0 16px',
    border: `1px solid ${TEXT}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: WHITE,
    background: TEXT,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  }

  const btnMobileSm: React.CSSProperties = {
    height: '36px',
    padding: '0 10px',
    border: `1px solid ${BORDER}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: TEXT2,
    background: WHITE,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    flex: 1,
  }

  const btnMobileDark: React.CSSProperties = {
    ...btnMobileSm,
    background: TEXT,
    border: `1px solid ${TEXT}`,
    color: WHITE,
  }

  const topCards = [
    {
      label: 'Revenue collected',
      value: formatMoney(report.revenueCollected),
      delta: formatDelta(0),
      up: true,
    },
    {
      label: 'Outstanding',
      value: formatMoney(report.outstanding),
      delta: report.outstanding > 0 ? 'Open' : 'Clear',
      up: report.outstanding === 0,
    },
    {
      label: 'Jobs this month',
      value: report.jobsThisMonth,
      delta: formatDelta(jobDelta),
      up: jobDelta >= 0,
    },
    {
      label: 'Quotes this month',
      value: report.quotesThisMonth,
      delta: formatDelta(quoteDelta),
      up: quoteDelta >= 0,
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
            padding: isMobile ? '12px' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
          }}
        >
          {isMobile ? (
            <div style={{ margin: '-12px -12px 0', overflow: 'hidden', background: WHITE }}>
              <div style={{ background: WHITE, padding: '16px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flexShrink: 0, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    {new Date().toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                  <h1 style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>
                    Reports
                  </h1>
                </div>
              </div>

              <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', gap: '8px', padding: '0 16px 16px' }}>
                  <button onClick={() => window.print()} style={btnMobileSm}>
                    <IconPrint size={13} />
                    Print
                  </button>
                  <button onClick={() => router.push('/dashboard/invoices')} style={btnMobileDark}>
                    <IconSpark size={12} />
                    View invoices
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', gap: 0 }}>
                <div style={{ width: 4, background: TEAL, alignSelf: 'stretch', borderRadius: 0, flexShrink: 0, marginRight: 20 }} />
                <div style={{ flexShrink: 0, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    {todayStr}
                  </div>
                  <h1 style={{ fontSize: '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>
                    Reports
                  </h1>
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => window.print()} style={btnOutline}>
                    <IconPrint size={14} />
                    Print report
                  </button>
                  <button onClick={() => router.push('/dashboard/invoices')} style={btnDark}>
                    <IconSpark size={14} />
                    View invoices
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            {topCards.map(item => (
              <div
                key={item.label}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '14px',
                  padding: isMobile ? '10px 10px' : '10px 14px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  minHeight: isMobile ? '70px' : '68px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {isMobile ? (
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, flex: 1 }}>
                        {item.label}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.value}
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '3px 7px', borderRadius: '999px', background: item.up ? '#E6F7F6' : '#FFF0EE', color: item.up ? TEAL_DARK : '#C0392B', fontSize: '9px', fontWeight: 800, flexShrink: 0, alignSelf: 'flex-end', marginTop: '2px' }}>
                        {item.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}
                        {item.delta}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.value}
                      </div>
                    </div>

                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '3px 7px', borderRadius: '999px', background: item.up ? '#E6F7F6' : '#FFF0EE', color: item.up ? TEAL_DARK : '#C0392B', fontSize: '9px', fontWeight: 800, flexShrink: 0 }}>
                      {item.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}
                      {item.delta}
                    </span>
                  </div>
                )}
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
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: isMobile ? '16px 16px 0' : '20px 24px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: TEXT3, marginBottom: '5px' }}>
                      Last 6 months
                    </div>
                    <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {trendConfig.title}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '999px', background: '#F0FDF9', border: '1px solid #BBF7ED', flexShrink: 0, marginTop: '2px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL }} />
                    <span style={{ fontSize: '10px', fontWeight: 800, color: TEAL_DARK, letterSpacing: '0.04em' }}>
                      Live
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
                    <select
                      value={reportView}
                      onChange={e => setReportView(e.target.value as ReportView)}
                      style={{
                        height: '34px',
                        padding: '0 38px 0 12px',
                        borderRadius: '9px',
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
                        minWidth: isMobile ? '100%' : '150px',
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
                      height: '34px',
                      padding: '0 12px',
                      borderRadius: '9px',
                      border: `1px solid ${BORDER}`,
                      background: '#F8FAFC',
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

                <div style={{ display: 'flex', borderTop: `1px solid ${BORDER}`, marginLeft: isMobile ? '-16px' : '-24px', marginRight: isMobile ? '-16px' : '-24px' }}>
                  {trendConfig.widgets.slice(0, 5).map((item, i) => (
                    <div
                      key={item.label}
                      style={{
                        flex: 1,
                        padding: isMobile ? '12px 10px' : '14px 20px',
                        borderRight: i < trendConfig.widgets.slice(0, 5).length - 1 ? `1px solid ${BORDER}` : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        minWidth: 0,
                      }}
                    >
                      <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: TEXT3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: isMobile ? '16px 12px 12px' : '20px 24px 16px' }}>
                <AreaChart
                  series={trendConfig.monthly}
                  maxVal={trendConfig.max}
                  height={isMobile ? 210 : 240}
                  isMobile={isMobile}
                  formatValue={trendConfig.formatValue}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: isMobile ? '4px' : '52px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: 16, height: 2, background: TEAL, borderRadius: 1 }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: TEXT3 }}>
                        {trendConfig.selectedLabel}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CBD5E1', border: '1.5px solid #94A3B8' }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: TEXT3 }}>
                        Monthly count
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3 }}>
                    {new Date().toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
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
                        background: '#F8FAFC',
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