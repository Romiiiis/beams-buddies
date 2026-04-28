'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_LIGHT = '#E6F7F6'
const RED = '#B91C1C'
const AMBER = '#92400E'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
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

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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

type ChartPoint = {
  label: string
  shortLabel: string
  value: number
  count: number
}

function AreaChart({
  series,
  maxVal,
  height = 180,
  isMobile = false,
}: {
  series: ChartPoint[]
  maxVal: number
  height?: number
  isMobile?: boolean
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
  const PAD_B = 36
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

  const points = series.map((s, i) => ({ x: xOf(i), y: yOf(s.value), ...s }))

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

  const gradId = 'areaGradRevenue'

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
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
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
              {t.val >= 1000 ? `$${(t.val / 1000).toFixed(0)}k` : `$${t.val}`}
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

        {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}

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
              x={p.x - (chartW / n) / 2}
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
            y={PAD_T + chartH + 18}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={hovered === i ? TEXT : TEXT3}
            fontFamily={FONT}
            style={{ transition: 'fill 0.15s' }}
          >
            {p.shortLabel}
          </text>
        ))}

        {points.map((p, i) => (
          <text
            key={`cnt-${i}`}
            x={p.x}
            y={PAD_T + chartH + 30}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill={hovered === i ? TEXT3 : '#C0CCDA'}
            fontFamily={FONT}
            style={{ transition: 'fill 0.15s' }}
          >
            {p.count > 0 ? `${p.count}` : ''}
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
                ${Math.round(p.value).toLocaleString('en-AU')}
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}

type StatItem = {
  label: string
  value: string | number
  sublabel?: string
}

type InvoiceRow = {
  id: string
  status: string
  total: number | null
  amount_paid: number | null
  created_at: string
  paid_at?: string | null
  customer_id?: string | null
  customers?: { first_name?: string | null; last_name?: string | null } | null
}

type TopCustomer = {
  name: string
  total: number
  count: number
}

type MetricMode = 'invoiced' | 'collected' | 'outstanding' | 'overdue'

export default function RevenuePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [metricMode, setMetricMode] = useState<MetricMode>('invoiced')

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()

      if (!userData) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('invoices')
        .select('*, customers(first_name, last_name)')
        .eq('business_id', userData.business_id)
        .order('created_at', { ascending: false })

      setInvoices((data || []) as InvoiceRow[])
      setLoading(false)
    }

    load()
  }, [router])

  const paid = useMemo(() => invoices.filter(i => i.status === 'paid'), [invoices])
  const outstanding = useMemo(() => invoices.filter(i => i.status === 'sent' || i.status === 'overdue'), [invoices])
  const overdue = useMemo(() => invoices.filter(i => i.status === 'overdue'), [invoices])
  const drafts = useMemo(() => invoices.filter(i => i.status === 'draft'), [invoices])

  const totalRevenue = useMemo(() => paid.reduce((sum, i) => sum + Number(i.total || 0), 0), [paid])
  const totalOutstanding = useMemo(() => outstanding.reduce((sum, i) => sum + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0), [outstanding])
  const totalOverdue = useMemo(() => overdue.reduce((sum, i) => sum + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0), [overdue])
  const totalInvoiced = useMemo(() => invoices.reduce((sum, i) => sum + Number(i.total || 0), 0), [invoices])

  const last6 = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setDate(1)
        d.setMonth(d.getMonth() - (5 - i))

        return {
          label: d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }),
          shortLabel: d.toLocaleDateString('en-AU', { month: 'short' }),
          month: d.getMonth(),
          year: d.getFullYear(),
        }
      }),
    []
  )

  const monthlyStats = useMemo(
    () =>
      last6.map(m => {
        const monthInvoices = invoices.filter(i => {
          const d = new Date(i.created_at)
          return d.getMonth() === m.month && d.getFullYear() === m.year
        })

        const invoiced = monthInvoices.reduce((sum, i) => sum + Number(i.total || 0), 0)
        const collected = monthInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total || 0), 0)
        const open = monthInvoices.filter(i => i.status === 'sent' || i.status === 'overdue')
        const outstandingValue = open.reduce((sum, i) => sum + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0)
        const overdueValue = monthInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0)

        return {
          ...m,
          invoiced,
          collected,
          outstanding: outstandingValue,
          overdue: overdueValue,
          invoiceCount: monthInvoices.length,
          paidCount: monthInvoices.filter(i => i.status === 'paid').length,
          openCount: open.length,
          overdueCount: monthInvoices.filter(i => i.status === 'overdue').length,
        }
      }),
    [last6, invoices]
  )

  const chartSeries = useMemo(
    () =>
      monthlyStats.map(m => ({
        label: m.label,
        shortLabel: m.shortLabel,
        value: metricMode === 'invoiced' ? m.invoiced : metricMode === 'collected' ? m.collected : metricMode === 'outstanding' ? m.outstanding : m.overdue,
        count: metricMode === 'invoiced' ? m.invoiceCount : metricMode === 'collected' ? m.paidCount : metricMode === 'outstanding' ? m.openCount : m.overdueCount,
      })),
    [monthlyStats, metricMode]
  )

  const maxMonthly = Math.max(...chartSeries.map(m => m.value), 1)

  const topCustomers = useMemo(() => {
    const customerRevenue: Record<string, TopCustomer> = {}

    paid.forEach(inv => {
      const id = inv.customer_id || 'unknown'
      const name = `${inv.customers?.first_name || ''} ${inv.customers?.last_name || ''}`.trim() || 'Unknown'

      if (!customerRevenue[id]) customerRevenue[id] = { name, total: 0, count: 0 }

      customerRevenue[id].total += Number(inv.total || 0)
      customerRevenue[id].count += 1
    })

    return Object.values(customerRevenue).sort((a, b) => b.total - a.total).slice(0, 5)
  }, [paid])

  const maxCustomer = topCustomers.length ? topCustomers[0].total : 1
  const collectionRate = totalInvoiced > 0 ? Math.round((totalRevenue / totalInvoiced) * 100) : 0

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const now = new Date()
  const startCurrent30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  const startPrev30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60)

  function inRange(dateStr?: string | null, start?: Date, end?: Date) {
    if (!dateStr) return false
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    return d >= start! && d < end!
  }

  const currentCollected = invoices.filter(i => i.status === 'paid' && inRange(i.created_at, startCurrent30, now)).reduce((s, i) => s + Number(i.total || 0), 0)
  const prevCollected = invoices.filter(i => i.status === 'paid' && inRange(i.created_at, startPrev30, startCurrent30)).reduce((s, i) => s + Number(i.total || 0), 0)

  const currentOutstanding = invoices.filter(i => (i.status === 'sent' || i.status === 'overdue') && inRange(i.created_at, startCurrent30, now)).reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0)
  const prevOutstanding = invoices.filter(i => (i.status === 'sent' || i.status === 'overdue') && inRange(i.created_at, startPrev30, startCurrent30)).reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0)

  const currentOverdue = invoices.filter(i => i.status === 'overdue' && inRange(i.created_at, startCurrent30, now)).reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0)
  const prevOverdue = invoices.filter(i => i.status === 'overdue' && inRange(i.created_at, startPrev30, startCurrent30)).reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0)

  const currentInvoiced = invoices.filter(i => inRange(i.created_at, startCurrent30, now)).reduce((s, i) => s + Number(i.total || 0), 0)
  const prevInvoiced = invoices.filter(i => inRange(i.created_at, startPrev30, startCurrent30)).reduce((s, i) => s + Number(i.total || 0), 0)

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '16px',
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
    transition: 'border-color 0.12s, color 0.12s',
  }

  const btnTeal: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    border: 'none',
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: WHITE,
    background: TEAL,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.12s',
  }

  const btnMobileSm: React.CSSProperties = {
    height: '36px',
    padding: '0 12px',
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

  const btnMobileTeal: React.CSSProperties = {
    ...btnMobileSm,
    background: TEAL,
    border: `1px solid ${TEAL}`,
    color: WHITE,
  }

  const topCards = [
    {
      label: 'Collected',
      value: `$${Math.round(totalRevenue).toLocaleString('en-AU')}`,
      delta: formatDelta(pctChange(currentCollected, prevCollected)),
      up: pctChange(currentCollected, prevCollected) >= 0,
      onClick: () => setMetricMode('collected' as MetricMode),
    },
    {
      label: 'Outstanding',
      value: `$${Math.round(totalOutstanding).toLocaleString('en-AU')}`,
      delta: formatDelta(pctChange(currentOutstanding, prevOutstanding)),
      up: pctChange(currentOutstanding, prevOutstanding) >= 0,
      onClick: () => setMetricMode('outstanding' as MetricMode),
    },
    {
      label: 'Overdue',
      value: `$${Math.round(totalOverdue).toLocaleString('en-AU')}`,
      delta: formatDelta(pctChange(currentOverdue, prevOverdue)),
      up: pctChange(currentOverdue, prevOverdue) >= 0,
      onClick: () => setMetricMode('overdue' as MetricMode),
    },
    {
      label: 'Total invoiced',
      value: `$${Math.round(totalInvoiced).toLocaleString('en-AU')}`,
      delta: formatDelta(pctChange(currentInvoiced, prevInvoiced)),
      up: pctChange(currentInvoiced, prevInvoiced) >= 0,
      onClick: () => setMetricMode('invoiced' as MetricMode),
    },
  ]

  const selectedMetricLabel = metricMode === 'invoiced' ? 'Invoiced value' : metricMode === 'collected' ? 'Collected value' : metricMode === 'outstanding' ? 'Outstanding value' : 'Overdue value'
  const selectedMetricCount = metricMode === 'invoiced' ? invoices.length : metricMode === 'collected' ? paid.length : metricMode === 'outstanding' ? outstanding.length : overdue.length

  const statsItems: StatItem[] = [
    { label: 'Related invoices', value: selectedMetricCount },
    { label: 'Collection rate', value: `${collectionRate}%` },
    { label: 'Paid invoices', value: paid.length },
    { label: 'Open invoices', value: outstanding.length },
    { label: 'Overdue count', value: overdue.length },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/revenue" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>
          Loading revenue...
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard/revenue" />

      <div style={{ flex: 1, minWidth: 0, background: BG }}>
        <div
          style={{
            padding: isMobile ? '0' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
            background: BG,
          }}
        >
          {isMobile ? (
            <div style={{ padding: '20px 12px 4px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: TEXT3,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    marginBottom: '5px',
                  }}
                >
                  {new Date().toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>
                  Revenue
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => router.push('/dashboard/invoices')} style={btnMobileTeal}>
                  <IconSpark size={12} /> View invoices
                </button>
                <button onClick={() => router.push('/dashboard/customers')} style={btnMobileSm}>
                  Customers
                </button>
              </div>

              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderTop: `2px solid ${TEAL}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {topCards.map((chip, i) => (
                  <div
                    key={chip.label}
                    onClick={chip.onClick}
                    style={{
                      padding: '10px 8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = TEAL_LIGHT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ fontSize: '18px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chip.value}
                    </div>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: TEXT3, marginTop: '3px', lineHeight: 1.2 }}>{chip.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    {todayStr}
                  </div>
                  <h1 style={{ fontSize: '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>
                    Revenue
                  </h1>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => router.push('/dashboard/customers')}
                    style={btnOutline}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = TEXT
                      e.currentTarget.style.color = TEXT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = BORDER
                      e.currentTarget.style.color = TEXT2
                    }}
                  >
                    View customers
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/invoices')}
                    style={btnTeal}
                    onMouseEnter={e => {
                      e.currentTarget.style.opacity = '0.82'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    <IconSpark size={14} />
                    View invoices
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderTop: `2px solid ${TEAL}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {topCards.map((chip, i) => (
                  <div
                    key={chip.label}
                    onClick={chip.onClick}
                    style={{
                      padding: '14px 20px',
                      cursor: 'pointer',
                      borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = TEAL_LIGHT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '4px' }}>{chip.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 320px',
              gap: '14px',
              alignItems: 'start',
              padding: isMobile ? '0 12px' : 0,
            }}
          >
            <div style={card}>
              <div
                style={{
                  padding: isMobile ? '16px' : '18px 20px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '14px',
                  background: WHITE,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: 4, height: 44, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em' }}>Monthly Performance</span>
                      <span
                        style={{
                          height: '22px',
                          padding: '0 8px',
                          borderRadius: '999px',
                          border: `1px solid #BFE7E3`,
                          background: TEAL_LIGHT,
                          color: TEAL_DARK,
                          fontSize: '10px',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        Live
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '4px' }}>
                      Last 6 months of invoice performance, collection activity, and open revenue.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                    background: '#F1F5F9',
                    borderRadius: '11px',
                    padding: '3px',
                    width: isMobile ? '100%' : 'fit-content',
                    maxWidth: '100%',
                    overflowX: 'auto',
                  }}
                >
                  {(['invoiced', 'collected', 'outstanding', 'overdue'] as MetricMode[]).map(mode => {
                    const active = metricMode === mode
                    const labels: Record<MetricMode, string> = {
                      invoiced: 'Invoiced',
                      collected: 'Collected',
                      outstanding: 'Outstanding',
                      overdue: 'Overdue',
                    }

                    return (
                      <button
                        key={mode}
                        onClick={() => setMetricMode(mode)}
                        style={{
                          height: '30px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: active ? WHITE : 'transparent',
                          color: active ? TEXT : TEXT3,
                          fontSize: '11px',
                          fontWeight: active ? 800 : 600,
                          fontFamily: FONT,
                          cursor: 'pointer',
                          boxShadow: active ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
                          transition: 'all 0.15s',
                          whiteSpace: 'nowrap' as const,
                          flex: isMobile ? 1 : undefined,
                        }}
                      >
                        {labels[mode]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
                  borderBottom: `1px solid ${BORDER}`,
                  background: '#FCFCFD',
                }}
              >
                {statsItems.map((item, i) => (
                  <div
                    key={item.label}
                    style={{
                      padding: isMobile ? '12px 10px' : '14px 20px',
                      borderLeft: !isMobile && i > 0 ? `1px solid ${BORDER}` : 'none',
                      borderTop: isMobile && i > 1 ? `1px solid ${BORDER}` : 'none',
                      borderRight: isMobile && i % 2 === 0 ? `1px solid ${BORDER}` : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      minWidth: 0,
                    }}
                  >
                    <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: TEXT3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: isMobile ? '16px 12px 12px' : '20px 24px 16px' }}>
                <AreaChart
                  series={chartSeries}
                  maxVal={maxMonthly}
                  height={isMobile ? 210 : 240}
                  isMobile={isMobile}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: isMobile ? '4px' : '52px', marginTop: '6px', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: 16, height: 2, background: TEAL, borderRadius: 1 }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: TEXT3 }}>{selectedMetricLabel}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CBD5E1', border: '1.5px solid #94A3B8' }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: TEXT3 }}>Invoice count</span>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT, letterSpacing: '-0.025em' }}>Revenue summary</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>Collection and open balance</div>
                    </div>
                  </div>
                  <button onClick={() => router.push('/dashboard/invoices')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', marginBottom: '14px' }}>
                  {collectionRate >= 80 ? (
                    <span style={{ color: TEAL_DARK }}>Collections strong</span>
                  ) : (
                    <>
                      <span style={{ color: RED }}>{collectionRate}%</span> collection rate
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    {
                      label: 'Overdue',
                      value: `$${Math.round(totalOverdue).toLocaleString('en-AU')}`,
                      bg: totalOverdue > 0 ? '#FEE2E2' : '#F8FAFC',
                      border: totalOverdue > 0 ? '#FECACA' : BORDER,
                      color: totalOverdue > 0 ? '#991B1B' : TEXT,
                    },
                    {
                      label: 'Outstanding',
                      value: `$${Math.round(totalOutstanding).toLocaleString('en-AU')}`,
                      bg: totalOutstanding > 0 ? '#FEF3C7' : '#F8FAFC',
                      border: totalOutstanding > 0 ? '#FDE68A' : BORDER,
                      color: totalOutstanding > 0 ? AMBER : TEXT,
                    },
                    {
                      label: 'Drafts',
                      value: drafts.length,
                      bg: '#F8FAFC',
                      border: BORDER,
                      color: TEXT,
                    },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: item.bg,
                        border: `1px solid ${item.border}`,
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: item.color }}>{item.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT, letterSpacing: '-0.025em' }}>Top customers</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>Highest paid accounts</div>
                    </div>
                  </div>
                  <button onClick={() => router.push('/dashboard/customers')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em' }}>{topCustomers.length}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT3, marginLeft: 6 }}>active revenue accounts</span>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {topCustomers.length === 0 ? (
                    <div style={{ padding: '12px', borderRadius: '12px', background: '#F8FAFC', border: `1px solid ${BORDER}`, fontSize: '12px', fontWeight: 600, color: TEXT3, textAlign: 'center' }}>
                      No paid invoices yet
                    </div>
                  ) : (
                    topCustomers.slice(0, 4).map((customer, index) => (
                      <div key={`${customer.name}-${index}`} style={{ padding: '10px 12px', borderRadius: '12px', background: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '7px' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {customer.name}
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>
                              {customer.count} paid invoice{customer.count === 1 ? '' : 's'}
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: TEXT2, flexShrink: 0 }}>
                            ${Math.round(customer.total).toLocaleString('en-AU')}
                          </div>
                        </div>

                        <div style={{ width: '100%', height: '8px', background: '#EAEFF4', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.max(10, Math.round((customer.total / maxCustomer) * 100))}%`,
                              height: '100%',
                              background: TEAL,
                              borderRadius: '999px',
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}