'use client'

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
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
    function check() { setIsMobile(window.innerWidth < 768) }
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
  if (previous === 0) { if (current === 0) return 0; return 100 }
  return Math.round(((current - previous) / previous) * 100)
}

function formatDelta(n: number) { return `${n >= 0 ? '+' : ''}${n}%` }

// ─── SVG Line/Area Chart ───────────────────────────────────────────────────────
type ChartPoint = { label: string; shortLabel: string; value: number; count: number }

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
    return PAD_L + (i / (n - 1)) * chartW
  }
  function yOf(v: number) {
    const pct = maxVal > 0 ? v / maxVal : 0
    return PAD_T + chartH - pct * chartH
  }

  const points = series.map((s, i) => ({ x: xOf(i), y: yOf(s.value), ...s }))

  // Build smooth cubic bezier path
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

  const gradId = 'areaGrad'

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

        {/* Horizontal grid lines */}
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

        {/* Vertical hover lines */}
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

        {/* Area fill */}
        {areaPath && (
          <path d={areaPath} fill={`url(#${gradId})`} />
        )}

        {/* Line */}
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

        {/* Dots + hit areas */}
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
            {/* Invisible wide hit target */}
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

        {/* X-axis labels */}
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

        {/* Count labels below month */}
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

        {/* Tooltip */}
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

// ─── Stats Grid ────────────────────────────────────────────────────────────────
type StatItem = {
  label: string
  value: string | number
  sublabel?: string
}

function StatsGrid({ items, isMobile }: { items: StatItem[]; isMobile: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : `repeat(${items.length}, 1fr)`,
        gap: '8px',
        marginBottom: '14px',
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            borderRadius: '11px',
            background: '#F8FAFC',
            border: `1px solid ${BORDER}`,
            padding: isMobile ? '9px 10px' : '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '5px',
            minHeight: '62px',
          }}
        >
          <div style={{ fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: TEXT3, lineHeight: 1.3 }}>
            {item.label}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Types ─────────────────────────────────────────────────────────────────────
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

type TopCustomer = { name: string; total: number; count: number }
type MetricMode = 'invoiced' | 'collected' | 'outstanding' | 'overdue'

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function RevenuePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [metricMode, setMetricMode] = useState<MetricMode>('invoiced')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) { setLoading(false); return }
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

  const last6 = useMemo(() =>
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
    }), [])

  const monthlyStats = useMemo(() =>
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
        ...m, invoiced, collected, outstanding: outstandingValue, overdue: overdueValue,
        invoiceCount: monthInvoices.length, paidCount: monthInvoices.filter(i => i.status === 'paid').length,
        openCount: open.length, overdueCount: monthInvoices.filter(i => i.status === 'overdue').length,
      }
    }), [last6, invoices])

  const chartSeries = useMemo(() =>
    monthlyStats.map(m => ({
      label: m.label, shortLabel: m.shortLabel,
      value: metricMode === 'invoiced' ? m.invoiced : metricMode === 'collected' ? m.collected : metricMode === 'outstanding' ? m.outstanding : m.overdue,
      count: metricMode === 'invoiced' ? m.invoiceCount : metricMode === 'collected' ? m.paidCount : metricMode === 'outstanding' ? m.openCount : m.overdueCount,
    })), [monthlyStats, metricMode])

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
  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

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

  const card: React.CSSProperties = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
  const sideCard: React.CSSProperties = { ...card, padding: '16px' }
  const sectionHeaderTitle: React.CSSProperties = { fontSize: '15px', fontWeight: 800, color: TEXT, marginBottom: '4px', letterSpacing: '-0.02em' }
  const cardArrowBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: TEXT3, padding: 0, display: 'flex', alignItems: 'center' }
  const btnOutline: React.CSSProperties = { height: '34px', padding: '0 14px', border: `1px solid ${BORDER}`, borderRadius: '9px', fontSize: '12px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }
  const btnDark: React.CSSProperties = { height: '34px', padding: '0 16px', border: `1px solid ${TEXT}`, borderRadius: '9px', fontSize: '12px', fontWeight: 700, color: WHITE, background: TEXT, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }
  const btnMobileSm: React.CSSProperties = { height: '36px', padding: '0 10px', border: `1px solid ${BORDER}`, borderRadius: '9px', fontSize: '12px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', flex: 1 }
  const btnMobileDark: React.CSSProperties = { ...btnMobileSm, background: TEXT, border: `1px solid ${TEXT}`, color: WHITE }

  const topCards = [
    { label: 'Collected', value: `$${Math.round(totalRevenue).toLocaleString('en-AU')}`, delta: formatDelta(pctChange(currentCollected, prevCollected)), up: pctChange(currentCollected, prevCollected) >= 0 },
    { label: 'Outstanding', value: `$${Math.round(totalOutstanding).toLocaleString('en-AU')}`, delta: formatDelta(pctChange(currentOutstanding, prevOutstanding)), up: pctChange(currentOutstanding, prevOutstanding) >= 0 },
    { label: 'Overdue', value: `$${Math.round(totalOverdue).toLocaleString('en-AU')}`, delta: formatDelta(pctChange(currentOverdue, prevOverdue)), up: pctChange(currentOverdue, prevOverdue) >= 0 },
    { label: 'Total invoiced', value: `$${Math.round(totalInvoiced).toLocaleString('en-AU')}`, delta: formatDelta(pctChange(currentInvoiced, prevInvoiced)), up: pctChange(currentInvoiced, prevInvoiced) >= 0 },
  ]

  const selectedMetricLabel = metricMode === 'invoiced' ? 'Invoiced value' : metricMode === 'collected' ? 'Collected value' : metricMode === 'outstanding' ? 'Outstanding value' : 'Overdue value'
  const selectedMetricTotal = metricMode === 'invoiced' ? totalInvoiced : metricMode === 'collected' ? totalRevenue : metricMode === 'outstanding' ? totalOutstanding : totalOverdue
  const selectedMetricCount = metricMode === 'invoiced' ? invoices.length : metricMode === 'collected' ? paid.length : metricMode === 'outstanding' ? outstanding.length : overdue.length

  // Stats items fed into new StatsGrid
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
        <div style={{ padding: isMobile ? '12px' : '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px' }}>

          {isMobile ? (
            <div style={{ margin: '-12px -12px 0', overflow: 'hidden', background: WHITE }}>
              <div style={{ background: WHITE, padding: '16px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flexShrink: 0, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    {new Date().toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                  <h1 style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>Revenue</h1>
                </div>
              </div>
              <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', gap: '8px', padding: '0 16px 16px' }}>
                  <button onClick={() => router.push('/dashboard/invoices')} style={btnMobileDark}><IconSpark size={12} /> View invoices</button>
                  <button onClick={() => router.push('/dashboard/customers')} style={btnMobileSm}>Customers</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', gap: 0 }}>
                <div style={{ width: 4, background: TEAL, alignSelf: 'stretch', borderRadius: 0, flexShrink: 0, marginRight: 20 }} />
                <div style={{ flexShrink: 0, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' }}>{todayStr}</div>
                  <h1 style={{ fontSize: '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>Revenue</h1>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => router.push('/dashboard/customers')} style={btnOutline}>View customers</button>
                  <button onClick={() => router.push('/dashboard/invoices')} style={btnDark}><IconSpark size={14} />View invoices</button>
                </div>
              </div>
            </div>
          )}

          {/* Top stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, 1fr)', gap: '12px' }}>
            {topCards.map(item => (
              <div key={item.label} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: isMobile ? '10px 10px' : '10px 14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', minHeight: isMobile ? '70px' : '68px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {isMobile ? (
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, flex: 1 }}>{item.label}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{item.value}</div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '3px 7px', borderRadius: '999px', background: item.up ? '#E6F7F6' : '#FFF0EE', color: item.up ? TEAL_DARK : '#C0392B', fontSize: '9px', fontWeight: 800, flexShrink: 0, alignSelf: 'flex-end', marginTop: '2px' }}>
                        {item.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}{item.delta}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{item.value}</div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '3px 7px', borderRadius: '999px', background: item.up ? '#E6F7F6' : '#FFF0EE', color: item.up ? TEAL_DARK : '#C0392B', fontSize: '9px', fontWeight: 800, flexShrink: 0 }}>
                      {item.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}{item.delta}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Main content grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 320px', gap: '14px', alignItems: 'start' }}>

            {/* ── Monthly performance card — full redesign ── */}
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

              {/* Header */}
              <div style={{ padding: isMobile ? '16px 16px 0' : '20px 24px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: TEXT3, marginBottom: '5px' }}>
                      Last 6 months
                    </div>
                    <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      Monthly Performance
                    </div>
                  </div>

                  {/* Live badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '999px', background: '#F0FDF9', border: '1px solid #BBF7ED', flexShrink: 0, marginTop: '2px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL }} />
                    <span style={{ fontSize: '10px', fontWeight: 800, color: TEAL_DARK, letterSpacing: '0.04em' }}>Live</span>
                  </div>
                </div>

                {/* Metric pill tabs */}
                <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', borderRadius: '11px', padding: '3px', width: 'fit-content', maxWidth: '100%' }}>
                  {(['invoiced', 'collected', 'outstanding', 'overdue'] as MetricMode[]).map(mode => {
                    const active = metricMode === mode
                    const labels: Record<MetricMode, string> = { invoiced: 'Invoiced', collected: 'Collected', outstanding: 'Outstanding', overdue: 'Overdue' }
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
                        }}
                      >
                        {labels[mode]}
                      </button>
                    )
                  })}
                </div>

                {/* KPI strip */}
                <div style={{ display: 'flex', borderTop: `1px solid ${BORDER}`, marginLeft: isMobile ? '-16px' : '-24px', marginRight: isMobile ? '-16px' : '-24px' }}>
                  {statsItems.map((item, i) => (
                    <div
                      key={item.label}
                      style={{
                        flex: 1,
                        padding: isMobile ? '12px 10px' : '14px 20px',
                        borderRight: i < statsItems.length - 1 ? `1px solid ${BORDER}` : 'none',
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
              </div>

              {/* Chart area */}
              <div style={{ padding: isMobile ? '16px 12px 12px' : '20px 24px 16px' }}>
                <AreaChart
                  series={chartSeries}
                  maxVal={maxMonthly}
                  height={isMobile ? 210 : 240}
                  isMobile={isMobile}
                />

                {/* Footer legend */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: isMobile ? '4px' : '52px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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

            {/* Sidebar cards — unchanged */}
            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Revenue summary</div>
                  <button onClick={() => router.push('/dashboard/invoices')} style={cardArrowBtn}><IconExternalLink size={14} /></button>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', marginBottom: '14px' }}>
                  {collectionRate >= 80 ? (
                    <span style={{ color: TEAL }}>Collections Strong</span>
                  ) : (
                    <><span style={{ color: RED }}>{collectionRate}%</span> Collection Rate</>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: totalOverdue > 0 ? '#FEF2F2' : '#F8FAFC', border: `1px solid ${totalOverdue > 0 ? '#FECACA' : BORDER}` }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: totalOverdue > 0 ? '#7F1D1D' : TEXT2 }}>Overdue</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: totalOverdue > 0 ? '#991B1B' : TEXT }}>${Math.round(totalOverdue).toLocaleString('en-AU')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: totalOutstanding > 0 ? '#FFFBEB' : '#F8FAFC', border: `1px solid ${totalOutstanding > 0 ? '#FDE68A' : BORDER}` }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: totalOutstanding > 0 ? '#92400E' : TEXT2 }}>Outstanding</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: totalOutstanding > 0 ? '#92400E' : TEXT }}>${Math.round(totalOutstanding).toLocaleString('en-AU')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>Drafts</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: TEXT }}>{drafts.length}</span>
                  </div>
                </div>
              </div>

              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Top customers</div>
                  <button onClick={() => router.push('/dashboard/customers')} style={cardArrowBtn}><IconExternalLink size={14} /></button>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em' }}>{topCustomers.length}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT3, marginLeft: 6 }}>active revenue accounts</span>
                </div>
                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {topCustomers.length === 0 ? (
                    <div style={{ padding: '12px', borderRadius: '10px', background: '#F8FAFC', border: `1px solid ${BORDER}`, fontSize: '12px', fontWeight: 600, color: TEXT3, textAlign: 'center' }}>No paid invoices yet</div>
                  ) : (
                    topCustomers.slice(0, 4).map((customer, index) => (
                      <div key={`${customer.name}-${index}`} style={{ padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '7px' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{customer.name}</div>
                            <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>{customer.count} paid invoice{customer.count === 1 ? '' : 's'}</div>
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: TEXT2, flexShrink: 0 }}>${Math.round(customer.total).toLocaleString('en-AU')}</div>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#EAEFF4', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.max(10, Math.round((customer.total / maxCustomer) * 100))}%`, height: '100%', background: TEAL, borderRadius: '999px' }} />
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