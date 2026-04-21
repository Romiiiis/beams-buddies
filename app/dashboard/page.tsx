'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL       = '#1F9E94'
const TEAL_DARK  = '#177A72'
const TEAL_MID   = '#5BBFB9'
const TEAL_LIGHT = '#E6F7F6'
const TEXT       = '#0B1220'
const TEXT2      = '#1F2937'
const TEXT3      = '#64748B'
const BORDER     = '#E8EDF2'
const BG         = '#FFFFFF'
const WHITE      = '#FFFFFF'
const FONT       = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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

function formatDateParam(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseDateLocal(dateStr: string): Date | null {
  if (!dateStr) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) return null
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

function dateToKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// ── Icons ──────────────────────────────────────────────────────────────────
function IconCalendar({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9"/><path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconInvoice({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M7 3h10a2 2 0 0 1 2 2v16l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconArrow({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconChevronRight({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconTrendUp({ size = 11 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 7l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconTrendDown({ size = 11 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 17l-8-8-4 4-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconPhone({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.4 19.4 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.2 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.8 9.8a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5A2 2 0 0 1 22 16.9Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/></svg>
}
function IconDownload({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconInfo({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.9"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
}
function IconPlus({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
}
function IconUsers({ size = 12 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.9"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconTrendUpNav({ size = 12 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 7l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

// ── Sparkline (bar style) ──────────────────────────────────────────────────
function SparkBars({ data, color, width = 52, height = 36 }: { data: number[]; color: string; width?: number; height?: number }) {
  const safeData = data.length ? data : [0]
  const max = Math.max(...safeData, 1)
  const count = safeData.length
  const barW = Math.max(3, Math.floor((width - (count - 1) * 2) / count))
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {safeData.map((v, i) => {
        const h = Math.max(4, (v / max) * (height - 2))
        const x = i * (barW + 2)
        const opacity = count === 1 ? 1 : 0.3 + (i / (count - 1)) * 0.7
        return <rect key={i} x={x} y={height - h} width={barW} height={h} rx="3" fill={color} opacity={i === count - 1 ? 1 : opacity} />
      })}
    </svg>
  )
}

function MiniSparkline({ data, color, width = 72, height = 36 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return <div style={{ width, height }} />
  const min = Math.min(...data)
  const max = Math.max(...data) || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / (max - min || 1)) * (height - 6) - 3
    return `${x},${y}`
  })
  const uid = `sp${color.replace('#', '')}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${pts[0]} L ${pts.join(' L ')} L ${width},${height} L 0,${height} Z`} fill={`url(#${uid})`} />
      <path d={`M ${pts.join(' L ')}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DonutSparkle({ value, color, size = 44 }: { value: number; color: string; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const filled = (Math.min(Math.max(value, 0), 100) / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8} strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
    </svg>
  )
}

type AnalyticsMetric = 'revenue' | 'jobs' | 'outstanding'
type AnalyticsRange = 'This Year' | 'Last Year' | 'Last 6 Months' | 'Last 3 Months'

function AnalyticsCard({
  allJobs,
  allInvoices,
}: {
  allJobs: any[]
  allInvoices: any[]
}) {
  const [metric, setMetric] = useState<AnalyticsMetric>('revenue')
  const [range, setRange] = useState<AnalyticsRange>('This Year')
  const [hovered, setHovered] = useState<number | null>(null)

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth()

  const months = useMemo((): { year: number; month: number; label: string }[] => {
    if (range === 'This Year') {
      return Array.from({ length: 12 }, (_, i) => ({ year: thisYear, month: i, label: MONTH_NAMES[i] }))
    }
    if (range === 'Last Year') {
      return Array.from({ length: 12 }, (_, i) => ({ year: thisYear - 1, month: i, label: MONTH_NAMES[i] }))
    }
    if (range === 'Last 6 Months') {
      return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(thisYear, thisMonth - 5 + i, 1)
        return { year: d.getFullYear(), month: d.getMonth(), label: MONTH_NAMES[d.getMonth()] }
      })
    }
    return Array.from({ length: 3 }, (_, i) => {
      const d = new Date(thisYear, thisMonth - 2 + i, 1)
      return { year: d.getFullYear(), month: d.getMonth(), label: MONTH_NAMES[d.getMonth()] }
    })
  }, [range, thisYear, thisMonth])

  const data = useMemo(() => {
    return months.map(({ year, month, label }) => {
      const start = new Date(year, month, 1)
      const end = new Date(year, month + 1, 1)
      if (metric === 'revenue') {
        const total = allInvoices
          .filter(inv => inv.status === 'paid' && inv.created_at)
          .filter(inv => { const d = parseDateLocal(inv.created_at); return d && d >= start && d < end })
          .reduce((s, inv) => s + Number(inv.total || 0), 0)
        return { label, total }
      }
      if (metric === 'jobs') {
        const total = allJobs
          .filter(job => job.created_at)
          .filter(job => { const d = parseDateLocal(job.created_at); return d && d >= start && d < end })
          .length
        return { label, total }
      }
      const total = allInvoices
        .filter(inv => (inv.status === 'sent' || inv.status === 'overdue') && inv.created_at)
        .filter(inv => { const d = parseDateLocal(inv.created_at); return d && d >= start && d < end })
        .reduce((s, inv) => s + Math.max(0, Number(inv.total || 0) - Number(inv.amount_paid || 0)), 0)
      return { label, total }
    })
  }, [metric, months, allJobs, allInvoices])

  const yMax = Math.max(...data.map(d => d.total), 1)
  const periodTotal = data.reduce((s, d) => s + d.total, 0)
  const peak = data.reduce((best, d) => d.total > best.total ? d : best, data[0] || { label: '—', total: 0 })
  const avg = data.length ? Math.round(periodTotal / data.length) : 0

  const isCurrency = metric === 'revenue' || metric === 'outstanding'
  function fmtFull(n: number) {
    if (!isCurrency) return String(Math.round(n))
    return `$${Math.round(n).toLocaleString('en-AU')}`
  }

  const CHART_H = 220
  const LABEL_H = 24
  const DOT_SIZE = 8
  const DOT_GAP = 4
  const NUM_ROWS = Math.floor((CHART_H - LABEL_H) / (DOT_SIZE + DOT_GAP))

  const dotUnit = peak.total > 0 ? Math.ceil(peak.total / NUM_ROWS) : 1
  const dotUnitLabel = isCurrency
    ? dotUnit >= 1000 ? `$${Math.round(dotUnit / 1000)}k` : `$${dotUnit}`
    : `${dotUnit}`

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

      {/* Header */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, letterSpacing: '-0.01em' }}>Revenue Analytics</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={metric}
            onChange={e => setMetric(e.target.value as AnalyticsMetric)}
            style={{ height: '30px', padding: '0 10px', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: TEXT2, background: WHITE, outline: 'none', cursor: 'pointer', fontFamily: FONT }}
          >
            <option value="revenue">Revenue</option>
            <option value="jobs">Jobs</option>
            <option value="outstanding">Outstanding</option>
          </select>
          <select
            value={range}
            onChange={e => setRange(e.target.value as AnalyticsRange)}
            style={{ height: '30px', padding: '0 10px', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: TEXT2, background: WHITE, outline: 'none', cursor: 'pointer', fontFamily: FONT }}
          >
            {(['This Year', 'Last Year', 'Last 6 Months', 'Last 3 Months'] as AnalyticsRange[]).map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr' }}>

        {/* Left stats */}
        <div style={{ borderRight: `1px solid ${BORDER}`, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Period total</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{fmtFull(periodTotal)}</div>
          </div>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Monthly avg</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{fmtFull(avg)}</div>
          </div>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Best month</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: TEAL, letterSpacing: '-0.04em', lineHeight: 1 }}>{fmtFull(peak.total)}</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>{peak.label}</div>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: TEAL, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: TEXT }}>1 dot = {dotUnitLabel}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8EDF2', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>Future months</span>
            </div>
            <div style={{ fontSize: '10px', fontWeight: 500, color: TEXT3, paddingLeft: '15px' }}>scaled to peak month</div>
          </div>
        </div>

        {/* Right dot chart */}
        <div style={{ padding: '20px 20px 0', overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: CHART_H }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: LABEL_H, display: 'flex', alignItems: 'flex-end', gap: '5px' }}>
              {data.map((item, i) => {
                const filledDots = dotUnit > 0 ? Math.round(item.total / dotUnit) : 0
                const isHov = hovered === i
                const isCurrentMonth = range === 'This Year' && i === thisMonth
                const isBest = peak.total > 0 && item.label === peak.label && item.total === peak.total
                const isFuture = range === 'This Year' && i > thisMonth

                return (
                  <div
                    key={item.label + i}
                    style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: `${DOT_GAP}px`, position: 'relative', cursor: 'default' }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {isHov && item.total > 0 && (
                      <div style={{ position: 'absolute', bottom: NUM_ROWS * (DOT_SIZE + DOT_GAP) + 8, left: '50%', transform: 'translateX(-50%)', background: TEXT, color: WHITE, padding: '5px 9px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10 }}>
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', marginBottom: '1px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{item.label}</div>
                        <div>{fmtFull(item.total)}</div>
                      </div>
                    )}
                    {Array.from({ length: NUM_ROWS }).map((_, di) => {
                      const dotIndex = NUM_ROWS - di
                      const filled = !isFuture && dotIndex <= filledDots

                      let bg: string
                      let op: number

                      if (isFuture) {
                        bg = '#E8EDF2'
                        op = 0.18
                      } else if (filled) {
                        bg = TEAL
                        op = isHov || isBest || isCurrentMonth ? 1 : 0.5 + (di / NUM_ROWS) * 0.5
                      } else {
                        bg = '#E8EDF2'
                        op = 0.25
                      }

                      return (
                        <div
                          key={di}
                          style={{
                            width: DOT_SIZE,
                            height: DOT_SIZE,
                            borderRadius: '50%',
                            background: bg,
                            opacity: op,
                            flexShrink: 0,
                            transition: 'opacity 0.12s',
                          }}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* X labels */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: LABEL_H, display: 'flex', gap: '5px', alignItems: 'center' }}>
              {data.map((item, i) => {
                const isCurrentMonth = range === 'This Year' && i === thisMonth
                const isBest = peak.total > 0 && item.label === peak.label && item.total === peak.total
                const isFutureLabel = range === 'This Year' && i > thisMonth
                return (
                  <div key={item.label + i} style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: isCurrentMonth || isBest ? TEAL : isFutureLabel ? '#CBD5E1' : TEXT3 }}>{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DonutChart({ segments, size = 130, thickness = 22 }: { segments: { label: string; value: number; color: string }[]; size?: number; thickness?: number }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const cx = size / 2
  const cy = size / 2
  const r = (size - thickness) / 2 - 2
  const circ = 2 * Math.PI * r
  let cum = 0
  const arcs = segments.map(seg => {
    const s = cum
    const sw = (seg.value / total) * circ
    cum += sw
    return { ...seg, s, sw }
  })
  const hov = segments.find(s => s.label === hovered)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={thickness} />
        {arcs.map(arc => (
          <circle key={arc.label} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color} strokeWidth={hovered === arc.label ? thickness + 4 : thickness} strokeDasharray={`${arc.sw} ${circ}`} strokeDashoffset={-arc.s} strokeLinecap="butt" style={{ transition: 'all 0.18s', opacity: hovered && hovered !== arc.label ? 0.3 : 1, cursor: 'pointer' }} onMouseEnter={() => setHovered(arc.label)} onMouseLeave={() => setHovered(null)} />
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: '8px', fontWeight: 700, color: TEXT3, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 1 }}>{hov ? hov.label : 'Total'}</div>
        <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1 }}>{hov ? `${Math.round((hov.value / total) * 100)}%` : `${Math.round((total / 1000) * 10) / 10}k`}</div>
      </div>
    </div>
  )
}

// ── Job Day Popup ──────────────────────────────────────────────────────────
function JobDayPopup({
  date,
  jobs,
  onClose,
  onJobClick,
}: {
  date: Date
  jobs: any[]
  onClose: () => void
  onJobClick: (job: any) => void
}) {
  const dayLabel = date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(11,18,32,0.45)', backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: WHITE, borderRadius: '18px', width: '100%', maxWidth: '420px',
          margin: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
          overflow: 'hidden', fontFamily: FONT,
        }}
      >
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>
              Scheduled Jobs
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT }}>{dayLabel}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '4px 10px', borderRadius: '20px', background: TEAL_LIGHT, color: TEAL_DARK, fontSize: '11px', fontWeight: 800 }}>
              {jobs.length} job{jobs.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={onClose}
              style={{ width: 30, height: 30, borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#F8FAFC', cursor: 'pointer', fontFamily: FONT, fontSize: '16px', color: TEXT3, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {jobs.map((job, i) => {
            const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
            const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
            const avBg = ['#E8F4F1', '#EEF2F6', '#E6F7F6', '#F1F5F9', '#E8F4F1'][i % 5]
            const avColor = ['#0A4F4C', '#334155', '#177A72', '#475569', '#1F9E94'][i % 5]
            return (
              <div
                key={job.id}
                onClick={() => onJobClick(job)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 20px', borderBottom: `1px solid ${BORDER}`,
                  cursor: 'pointer', transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = TEAL_LIGHT)}
                onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
              >
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: avBg, color: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>
                  {initials || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{name}</div>
                  <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px' }}>
                    {job.job_type || 'Service'}{job.customers?.suburb ? ` · ${job.customers.suburb}` : ''}
                  </div>
                  {job.customers?.phone && (
                    <div style={{ fontSize: '10px', color: TEXT3, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                      <IconPhone size={10} /> {job.customers.phone}
                    </div>
                  )}
                </div>
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: TEAL_DARK, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    View <IconChevronRight size={11} />
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ padding: '12px 20px' }}>
          <button
            onClick={onClose}
            style={{ width: '100%', height: '36px', background: TEXT, color: WHITE, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Slim Heat-Map Calendar ─────────────────────────────────────────────────
function VisitCalendarMonths({
  jobs,
  monthCount,
  isMobile,
  onDateClick,
}: {
  jobs: any[]
  monthCount: number
  isMobile: boolean
  onDateClick: (date: Date, jobsOnDay: any[]) => void
}) {
  const months = useMemo(() => {
    const now = new Date()
    const result: Date[] = []
    if (monthCount === 1) {
      result.push(new Date(now.getFullYear(), now.getMonth(), 1))
    } else if (monthCount === 3) {
      for (let i = 1; i >= -1; i--) result.push(new Date(now.getFullYear(), now.getMonth() - i, 1))
    } else {
      for (let i = monthCount - 1; i >= 0; i--) result.push(new Date(now.getFullYear(), now.getMonth() - i, 1))
    }
    return result
  }, [monthCount])

  const jobsByDate = useMemo(() => {
    const map: Record<string, any[]> = {}
    jobs.forEach(job => {
      if (!job.next_service_date) return
      const key = String(job.next_service_date).slice(0, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return
      if (!map[key]) map[key] = []
      map[key].push(job)
    })
    return map
  }, [jobs])

  const maxCount = useMemo(() => {
    const counts = Object.values(jobsByDate).map(arr => arr.length)
    return Math.max(1, ...counts)
  }, [jobsByDate])

  React.useEffect(() => {
    console.log('[Calendar] jobsByDate keys:', Object.keys(jobsByDate).sort())
    console.log('[Calendar] total jobs received:', jobs.length)
    if (jobs.length > 0) {
      console.log('[Calendar] sample next_service_date values:', jobs.slice(0, 5).map(j => j.next_service_date))
    }
  }, [jobsByDate, jobs])

  function toRawKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function heatColor(count: number): { bg: string; textColor: string; dotColor: string } | null {
    if (count === 0) return null
    const ratio = count / maxCount
    if (ratio <= 0.33) return { bg: TEAL_LIGHT, textColor: TEAL_DARK, dotColor: TEAL_DARK }
    if (ratio <= 0.66) return { bg: TEAL_MID, textColor: WHITE, dotColor: 'rgba(255,255,255,0.8)' }
    return { bg: TEAL, textColor: WHITE, dotColor: 'rgba(255,255,255,0.7)' }
  }

  function buildMonth(monthDate: Date) {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const mondayStart = (firstDay.getDay() + 6) % 7
    const cells: Array<{ date: Date | null; jobs: any[] }> = []
    for (let i = 0; i < mondayStart; i++) cells.push({ date: null, jobs: [] })
    for (let day = 1; day <= daysInMonth; day++) {
      const key = toRawKey(year, month, day)
      cells.push({ date: new Date(year, month, day), jobs: jobsByDate[key] || [] })
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, jobs: [] })
    return cells
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayKey = dateToKey(new Date())
  const cols = isMobile ? 1 : Math.min(2, months.length)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '12px' }}>
      {months.map((monthDate, idx) => {
        const cells = buildMonth(monthDate)
        const totalBooked = cells.reduce((s, c) => s + c.jobs.length, 0)

        return (
          <div
            key={`${monthDate.getFullYear()}-${monthDate.getMonth()}-${idx}`}
            style={{ border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', background: WHITE }}
          >
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FCFCFD' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: TEXT, letterSpacing: '-0.01em' }}>
                {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
              </span>
              {totalBooked > 0 ? (
                <span style={{ fontSize: '10px', fontWeight: 700, color: TEAL_DARK, background: TEAL_LIGHT, padding: '2px 8px', borderRadius: '20px' }}>
                  {totalBooked} booked
                </span>
              ) : (
                <span style={{ fontSize: '10px', fontWeight: 600, color: TEXT3 }}>0 booked</span>
              )}
            </div>

            <div style={{ padding: '8px 10px 10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '4px' }}>
                {dayNames.map(day => (
                  <div key={day} style={{ textAlign: 'center', fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', padding: '0 0 2px' }}>
                    {day}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                {cells.map((cell, i) => {
                  if (!cell.date) return <div key={i} style={{ height: 34 }} />
                  const count = cell.jobs.length
                  const heat = heatColor(count)
                  const isToday = dateToKey(cell.date) === todayKey
                  const hasJobs = count > 0
                  const bg = heat ? heat.bg : '#F8FAFC'
                  const numColor = heat ? heat.textColor : TEXT3
                  const borderStyle = isToday ? `2px solid ${TEAL}` : `1px solid ${heat ? 'transparent' : BORDER}`
                  const dotCount = Math.min(count, 3)
                  const hasOverflow = count > 3

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { if (hasJobs) onDateClick(cell.date!, cell.jobs) }}
                      title={hasJobs ? `${count} job${count !== 1 ? 's' : ''} · ${cell.date.toLocaleDateString('en-AU')}` : cell.date.toLocaleDateString('en-AU')}
                      style={{ height: 34, borderRadius: '7px', border: borderStyle, background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', cursor: hasJobs ? 'pointer' : 'default', padding: 0, outline: 'none', fontFamily: FONT, transition: 'transform 0.1s ease, box-shadow 0.1s ease' }}
                      onMouseEnter={e => { if (!hasJobs) return; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(31,158,148,0.22)' }}
                      onMouseLeave={e => { if (!hasJobs) return; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: hasJobs ? 800 : 500, color: numColor, lineHeight: 1 }}>
                        {cell.date.getDate()}
                      </span>
                      {hasJobs && (
                        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                          {Array.from({ length: dotCount }).map((_, di) => (
                            <div key={di} style={{ width: 3, height: 3, borderRadius: '50%', background: heat?.dotColor ?? TEAL, opacity: 1 - di * 0.15 }} />
                          ))}
                          {hasOverflow && <div style={{ width: 3, height: 3, borderRadius: '50%', background: heat?.dotColor ?? TEAL, opacity: 0.4 }} />}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Legend strip ───────────────────────────────────────────────────────────
function CalendarLegend() {
  const items = [
    { label: '1–2 jobs', bg: TEAL_LIGHT, border: `1px solid ${TEAL}` },
    { label: '3–4 jobs', bg: TEAL_MID, border: 'none' },
    { label: '5+ jobs',  bg: TEAL,      border: 'none' },
    { label: 'Today',    bg: 'transparent', border: `2px solid ${TEAL}` },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '3px', background: item.bg, border: item.border, flexShrink: 0 }} />
          <span style={{ fontSize: '10px', fontWeight: 600, color: TEXT3 }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function statusPill(d: string | null, getDays: (s: string) => number) {
  if (!d) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }
  const days = getDays(d)
  if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#991B1B' }
  if (days <= 7) return { label: 'This week', bg: '#E6F7F6', color: TEAL_DARK }
  if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#92400E' }
  return { label: 'Scheduled', bg: '#F1F5F9', color: TEXT3 }
}

function pctChange(current: number, previous: number) {
  if (previous === 0) { if (current === 0) return 0; return 100 }
  return Math.round(((current - previous) / previous) * 100)
}

function formatDelta(n: number) { return `${n >= 0 ? '+' : ''}${n}%` }

export default function DashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [visitMonths, setVisitMonths] = useState('1')

  const [popupDate, setPopupDate] = useState<Date | null>(null)
  const [popupJobs, setPopupJobs] = useState<any[]>([])

  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0, jobsToday: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState({ collected: 0, outstanding: 0, paidCount: 0, overdueCount: 0, allInvoices: [] as any[] })
  const [allJobs, setAllJobs] = useState<any[]>([])
  const [allInvoices, setAllInvoices] = useState<any[]>([])

  function startOfDay(date: Date) { const d = new Date(date); d.setHours(0, 0, 0, 0); return d }
  function getDays(d: string) {
    const today = startOfDay(new Date()).getTime()
    const parsed = parseDateLocal(d)
    if (!parsed) return 0
    const target = startOfDay(parsed).getTime()
    return Math.floor((target - today) / (1000 * 60 * 60 * 24))
  }
  function isBetween(dateStr: string | null | undefined, start: Date, end: Date) {
    if (!dateStr) return false
    const d = parseDateLocal(dateStr)
    if (!d || isNaN(d.getTime())) return false
    return d >= start && d < end
  }

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) { setLoading(false); return }

      const bid = userData.business_id
      const today = startOfDay(new Date())
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()

      const [customersRes, jobsRes, invoicesRes] = await Promise.all([
        supabase.from('customers').select('id').eq('business_id', bid),
        supabase.from('jobs').select('*, customers(first_name, last_name, suburb, phone)').eq('business_id', bid).order('next_service_date', { ascending: true }),
        supabase.from('invoices').select('*, customers(first_name, last_name)').eq('business_id', bid).order('created_at', { ascending: false }),
      ])

      const jobs = jobsRes.data || []
      const invoices = invoicesRes.data || []
      const overdue = jobs.filter(j => {
        if (!j.next_service_date) return false
        const d = parseDateLocal(j.next_service_date)
        return d && startOfDay(d) < today
      })
      const jobsThisMonth = jobs.filter(j => {
        if (!j.created_at) return false
        const d = parseDateLocal(j.created_at)
        return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear
      }).length
      const jobsToday = jobs.filter(j => {
        if (!j.next_service_date) return false
        const d = parseDateLocal(j.next_service_date)
        return d && startOfDay(d).getTime() === today.getTime()
      }).length

      setStats({ customers: customersRes.data?.length || 0, units: jobs.length, overdue: overdue.length, jobsThisMonth, jobsToday })
      setAllJobs(jobs)
      setAllInvoices(invoices)
      setUpcoming(jobs.filter(j => {
        if (!j.next_service_date) return false
        const d = parseDateLocal(j.next_service_date)
        return d && startOfDay(d) >= today
      }).slice(0, 5))
      setRecent([...jobs].sort((a, b) => {
        const da = parseDateLocal(a.created_at || '')?.getTime() || 0
        const db = parseDateLocal(b.created_at || '')?.getTime() || 0
        return db - da
      }).slice(0, 5))
      setInvoiceStats({
        collected: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total || 0), 0),
        outstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + Math.max(0, Number(i.total || 0) - Number(i.amount_paid || 0)), 0),
        paidCount: invoices.filter(i => i.status === 'paid').length,
        overdueCount: invoices.filter(i => i.status === 'overdue').length,
        allInvoices: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').slice(0, 4),
      })
      setLoading(false)
    }
    load()
  }, [router])

  const now = new Date()
  const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const startCurrent30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  const startPrev30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60)

  const jobsSpark = useMemo(() => {
    const base = Array(12).fill(0)
    allJobs.forEach(job => {
      if (!job.created_at) return
      const d = parseDateLocal(job.created_at)
      if (d && d.getFullYear() === now.getFullYear()) base[d.getMonth()] += 1
    })
    return base
  }, [allJobs])

  const revenueSpark = useMemo(() => {
    const base = Array(12).fill(0)
    allInvoices.forEach(inv => {
      if (!inv.created_at || inv.status !== 'paid') return
      const d = parseDateLocal(inv.created_at)
      if (d && d.getFullYear() === now.getFullYear()) base[d.getMonth()] += Number(inv.total || 0)
    })
    return base
  }, [allInvoices])

  const jobsCurrentMonth = useMemo(() => allJobs.filter(job => isBetween(job.created_at, startCurrentMonth, startNextMonth)).length, [allJobs])
  const jobsPrevMonth = useMemo(() => allJobs.filter(job => isBetween(job.created_at, startPrevMonth, startCurrentMonth)).length, [allJobs])
  const revenueCurrent30 = useMemo(() => allInvoices.filter(inv => inv.status === 'paid' && isBetween(inv.created_at, startCurrent30, now)).reduce((s, inv) => s + Number(inv.total || 0), 0), [allInvoices])
  const revenuePrev30 = useMemo(() => allInvoices.filter(inv => inv.status === 'paid' && isBetween(inv.created_at, startPrev30, startCurrent30)).reduce((s, inv) => s + Number(inv.total || 0), 0), [allInvoices])
  const activeSalesCurrent = useMemo(() => allInvoices.filter(inv => (inv.status === 'sent' || inv.status === 'overdue') && isBetween(inv.created_at, startCurrent30, now)).reduce((s, inv) => s + Math.max(0, Number(inv.total || 0) - Number(inv.amount_paid || 0)), 0), [allInvoices])
  const activeSalesPrev = useMemo(() => allInvoices.filter(inv => (inv.status === 'sent' || inv.status === 'overdue') && isBetween(inv.created_at, startPrev30, startCurrent30)).reduce((s, inv) => s + Math.max(0, Number(inv.total || 0) - Number(inv.amount_paid || 0)), 0), [allInvoices])

  const totalInvoices = allInvoices.length
  const paidInvoices = allInvoices.filter(inv => inv.status === 'paid').length
  const convRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0

  const currentInvoicesWindow = allInvoices.filter(inv => isBetween(inv.created_at, startCurrent30, now))
  const prevInvoicesWindow = allInvoices.filter(inv => isBetween(inv.created_at, startPrev30, startCurrent30))
  const currentPaidWindow = currentInvoicesWindow.filter(inv => inv.status === 'paid').length
  const prevPaidWindow = prevInvoicesWindow.filter(inv => inv.status === 'paid').length
  const currentConv = currentInvoicesWindow.length > 0 ? Math.round((currentPaidWindow / currentInvoicesWindow.length) * 100) : 0
  const prevConv = prevInvoicesWindow.length > 0 ? Math.round((prevPaidWindow / prevInvoicesWindow.length) * 100) : 0

  const scheduledCount = useMemo(() => allJobs.filter(j => {
    if (!j.next_service_date) return false
    const d = parseDateLocal(j.next_service_date)
    return d && getDays(j.next_service_date) >= 0
  }).length, [allJobs])

  const activeSalesDelta = pctChange(activeSalesCurrent, activeSalesPrev)
  const revenueDelta = pctChange(revenueCurrent30, revenuePrev30)
  const jobsDelta = pctChange(jobsCurrentMonth, jobsPrevMonth)
  const convDelta = currentConv - prevConv

  const visitMax = useMemo(() => {
    const counts: Record<string, number> = {}
    allJobs.forEach(job => {
      if (!job.next_service_date) return
      const key = String(job.next_service_date).slice(0, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return
      counts[key] = (counts[key] || 0) + 1
    })
    return Math.max(0, ...Object.values(counts))
  }, [allJobs])

  const revenueBreakdown = useMemo(() => {
    const b: Record<string, number> = { Service: 0, Installation: 0, Repair: 0, Maintenance: 0 }
    const colors: Record<string, string> = { Service: TEAL, Installation: TEAL_DARK, Repair: '#94A3B8', Maintenance: '#CBD5E1' }
    allInvoices.forEach(inv => {
      const relatedJob = allJobs.find(job => job.id === inv.job_id)
      const t = String(relatedJob?.job_type || '').toLowerCase()
      if (t.includes('service')) b.Service += Number(inv.total || 0)
      else if (t.includes('install')) b.Installation += Number(inv.total || 0)
      else if (t.includes('repair')) b.Repair += Number(inv.total || 0)
      else if (t.includes('maint')) b.Maintenance += Number(inv.total || 0)
      else b.Service += Number(inv.total || 0)
    })
    return Object.entries(b).filter(([, value]) => value > 0).map(([label, value]) => ({ label, value, color: colors[label] }))
  }, [allInvoices, allJobs])

  const revenueBreakdownSafe = revenueBreakdown.length ? revenueBreakdown : [{ label: 'Service', value: 0, color: TEAL }]

  const statCards = [
    { label: 'Outstanding Invoices', value: `$${activeSalesCurrent.toLocaleString('en-AU')}`, delta: formatDelta(activeSalesDelta), up: activeSalesDelta >= 0, color: TEAL, sparkType: 'bar' as const, onClick: () => router.push('/dashboard/invoices') },
    { label: 'Revenue', value: `$${revenueCurrent30.toLocaleString('en-AU')}`, delta: formatDelta(revenueDelta), up: revenueDelta >= 0, color: '#43A047', sparkType: 'line' as const, onClick: () => router.push('/dashboard/revenue') },
    { label: 'Jobs This Month', value: `${jobsCurrentMonth}`, delta: formatDelta(jobsDelta), up: jobsDelta >= 0, color: '#9C27B0', sparkType: 'donut' as const, donutValue: stats.units > 0 ? Math.round((jobsCurrentMonth / Math.max(stats.units, 1)) * 100) : 0, onClick: () => router.push('/dashboard/jobs') },
    { label: 'Invoice Paid Rate', value: `${convRate}%`, delta: `${convDelta >= 0 ? '+' : ''}${convDelta}%`, up: convDelta >= 0, color: '#FF7043', sparkType: 'bar' as const, onClick: () => router.push('/dashboard/invoices') },
  ]

  const card: React.CSSProperties = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
  const cardP: React.CSSProperties = { ...card, padding: '20px' }

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
    whiteSpace: 'nowrap' as const,
    transition: 'border-color 0.12s, color 0.12s',
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
    whiteSpace: 'nowrap' as const,
    transition: 'opacity 0.12s',
  }

  // Mobile button styles — compact, equal width
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

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard" />

      {popupDate && (
        <JobDayPopup
          date={popupDate}
          jobs={popupJobs}
          onClose={() => { setPopupDate(null); setPopupJobs([]) }}
          onJobClick={(job) => {
            setPopupDate(null)
            setPopupJobs([])
            router.push(`/dashboard/customers/${job.customer_id}`)
          }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px' : '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '40px', background: BG }}>

          {/* ── HEADER ── */}
          {isMobile ? (
            // ── Mobile header: edge-to-edge, BG colour top, white card bottom ──
            <div style={{ margin: '-12px -12px 0', overflow: 'hidden' }}>
              {/* Top section — white, matching bottom half */}
              <div style={{ background: WHITE, padding: '16px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                {/* Left: date + title */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    {new Date().toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                  <h1 style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>
                    Dashboard
                  </h1>
                </div>
                {/* Right: KPI numbers */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{stats.customers}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>Customers</div>
                  </div>
                  <div style={{ width: 1, height: 30, background: BORDER }} />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{scheduledCount}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>Scheduled</div>
                  </div>
                </div>
              </div>

              {/* Bottom section — white card with chips + buttons */}
              <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}` }}>
                {/* Status chips */}
                <div style={{ display: 'flex', gap: '6px', padding: '10px 16px 10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', background: TEAL_LIGHT, color: TEAL_DARK, fontSize: '10px', fontWeight: 800 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: TEAL }} />
                    {stats.jobsToday} today
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', background: TEAL_LIGHT, color: TEAL_DARK, fontSize: '10px', fontWeight: 800 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: TEAL }} />
                    ${invoiceStats.collected.toLocaleString('en-AU')} collected
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', background: stats.overdue > 0 ? '#FEE2E2' : '#F1F5F9', color: stats.overdue > 0 ? '#991B1B' : TEXT3, fontSize: '10px', fontWeight: 800 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: stats.overdue > 0 ? '#991B1B' : '#94A3B8' }} />
                    {stats.overdue} overdue
                  </div>
                </div>
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px', padding: '0 16px 14px' }}>
                  <button onClick={() => router.push('/dashboard/jobs')} style={btnMobileSm}>
                    <IconPlus size={12} /> Add Job
                  </button>
                  <button onClick={() => router.push('/dashboard/jobs')} style={btnMobileSm}>
                    <IconCalendar size={12} /> Schedule
                  </button>
                  <button onClick={() => router.push('/dashboard/revenue')} style={btnMobileDark}>
                    <IconDownload size={12} /> Revenue
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // ── Desktop header (unchanged) ──
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', gap: 0 }}>
                <div style={{ width: 4, background: TEAL, alignSelf: 'stretch', borderRadius: 0, flexShrink: 0, marginRight: 20 }} />
                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h1 style={{ fontSize: '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>
                    Dashboard
                  </h1>
                </div>
                <div style={{ width: 1, background: BORDER, alignSelf: 'stretch', margin: '0 22px', flexShrink: 0 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center', padding: '0 18px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{stats.customers}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '3px' }}>Customers</div>
                  </div>
                  <div style={{ width: 1, height: 28, background: BORDER, flexShrink: 0 }} />
                  <div style={{ textAlign: 'center', padding: '0 18px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{scheduledCount}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '3px' }}>Scheduled</div>
                  </div>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    onClick={() => router.push('/dashboard/jobs')}
                    style={btnOutline}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = TEXT; e.currentTarget.style.color = TEXT }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT2 }}
                  >
                    <IconPlus size={12} /> Add Job
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/jobs')}
                    style={btnOutline}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = TEXT; e.currentTarget.style.color = TEXT }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT2 }}
                  >
                    <IconCalendar size={12} /> Schedule
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/revenue')}
                    style={btnDark}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.82' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                  >
                    <IconDownload size={12} /> Revenue
                  </button>
                </div>
              </div>

              {/* Footer strip */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '9px 24px', borderTop: `1px solid ${BORDER}`, background: WHITE, gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: TEAL_LIGHT, color: TEAL_DARK, fontSize: '10px', fontWeight: 800 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: TEAL, flexShrink: 0 }} />
                  {stats.jobsToday} job{stats.jobsToday !== 1 ? 's' : ''} today
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: TEAL_LIGHT, color: TEAL_DARK, fontSize: '10px', fontWeight: 800 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: TEAL, flexShrink: 0 }} />
                  ${invoiceStats.collected.toLocaleString('en-AU')} collected
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: stats.overdue > 0 ? '#FEE2E2' : '#F1F5F9', color: stats.overdue > 0 ? '#991B1B' : TEXT3, fontSize: '10px', fontWeight: 800 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: stats.overdue > 0 ? '#991B1B' : '#94A3B8', flexShrink: 0 }} />
                  {stats.overdue} overdue
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: '#F1F5F9', color: TEXT3, fontSize: '10px', fontWeight: 800 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#94A3B8', flexShrink: 0 }} />
                  ${invoiceStats.outstanding.toLocaleString('en-AU')} outstanding
                </div>
              </div>
            </div>
          )}
          {/* ── END HEADER ── */}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
            {statCards.map((sc) => (
              <div key={sc.label} onClick={sc.onClick} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '18px 20px 0', cursor: 'pointer', transition: 'box-shadow 0.15s', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)')} onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: TEXT3 }}>{sc.label}</span>
                  <span style={{ color: TEXT3, opacity: 0.45 }}><IconInfo size={13} /></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1.05 }}>{sc.value}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 7px', borderRadius: '12px', background: sc.up ? '#E6F7F6' : '#FFF0EE', color: sc.up ? TEAL_DARK : '#C0392B', fontSize: '10px', fontWeight: 800 }}>
                        {sc.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}{sc.delta}
                      </span>
                      <span style={{ fontSize: '10px', color: TEXT3, fontWeight: 500 }}>vs prev</span>
                    </div>
                  </div>
                  {sc.sparkType === 'bar' && <SparkBars data={jobsSpark.slice(-8)} color={sc.color} width={58} height={40} />}
                  {sc.sparkType === 'line' && <MiniSparkline data={revenueSpark} color={sc.color} width={70} height={40} />}
                  {sc.sparkType === 'donut' && <DonutSparkle value={stats.units > 0 ? Math.round((jobsCurrentMonth / Math.max(stats.units, 1)) * 100) : 0} color={sc.color} size={46} />}
                </div>
                <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: '14px', padding: '10px 0', display: 'flex', alignItems: 'center', gap: '5px', color: TEXT3 }}>
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>See Details</span>
                  <IconArrow size={11} />
                </div>
              </div>
            ))}
          </div>

          <AnalyticsCard allJobs={allJobs} allInvoices={allInvoices} />

          {/* ── VISIT BY TIME + SIDE PANELS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '16px', alignItems: 'start' }}>

            {/* Visit by Time card */}
            <div style={card}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Visit by Time</span>
                    <span style={{ color: TEXT3, opacity: 0.5 }}><IconInfo size={13} /></span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>
                    Click a booked date to view jobs · Today has teal border
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1 }}>{scheduledCount}</div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '1px' }}>Booked</div>
                    </div>
                    <div style={{ width: 1, height: 28, background: BORDER }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1 }}>{visitMax}</div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '1px' }}>Peak day</div>
                    </div>
                  </div>
                  <select
                    value={visitMonths}
                    onChange={e => setVisitMonths(e.target.value)}
                    style={{ height: '30px', padding: '0 8px', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, outline: 'none' }}
                  >
                    <option value="1">Current month</option>
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                  </select>
                </div>
              </div>

              <div style={{ padding: '14px 16px 10px' }}>
                <VisitCalendarMonths
                  jobs={allJobs}
                  monthCount={Number(visitMonths)}
                  isMobile={isMobile}
                  onDateClick={(date, jobsOnDay) => {
                    setPopupDate(date)
                    setPopupJobs(jobsOnDay)
                  }}
                />
              </div>

              <div style={{ padding: '8px 16px 14px', borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <CalendarLegend />
                <span style={{ fontSize: '10px', fontWeight: 500, color: TEXT3 }}>
                  Dates reflect <code style={{ fontSize: '10px', background: '#F1F5F9', padding: '1px 4px', borderRadius: '4px' }}>next_service_date</code>
                </span>
              </div>

              {/* Recent Customers */}
              <div style={{ borderTop: `1px solid ${BORDER}` }}>
                <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Recent Customers</div>
                  <button onClick={() => router.push('/dashboard/customers')} style={{ height: '28px', padding: '0 10px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    View all <IconArrow size={11} />
                  </button>
                </div>
                {recent.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: TEXT3, fontSize: '12px' }}>No customers yet.</div>
                ) : recent.map((job, i) => {
                  const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                  const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
                  const sp = statusPill(job.next_service_date, getDays)
                  const avBg = ['#E8F4F1', '#EEF2F6', '#E6F7F6', '#F1F5F9', '#E8F4F1'][i % 5]
                  const avColor = ['#0A4F4C', '#334155', '#177A72', '#475569', '#1F9E94'][i % 5]
                  return (
                    <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)} style={{ display: 'grid', gridTemplateColumns: isMobile ? 'auto 1fr auto' : 'auto 1fr 100px auto', gap: '12px', alignItems: 'center', padding: '10px 20px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }} onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')} onMouseLeave={e => (e.currentTarget.style.background = WHITE)}>
                      <div style={{ width: 34, height: 34, borderRadius: '10px', background: avBg, color: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>{initials}</div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {job.customers?.suburb && <span>{job.customers.suburb}</span>}
                          {job.customers?.phone && !isMobile && <><span>·</span><IconPhone size={10} /><span>{job.customers.phone}</span></>}
                        </div>
                      </div>
                      {!isMobile && <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>{job.next_service_date ? parseDateLocal(job.next_service_date)?.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : 'No date'}</div>}
                      <span style={{ padding: '3px 8px', borderRadius: '20px', background: sp.bg, color: sp.color, fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap' }}>{sp.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={cardP}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Total Revenue</span>
                    <span style={{ color: TEXT3, opacity: 0.5 }}><IconInfo size={12} /></span>
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '30px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>${invoiceStats.collected.toLocaleString('en-AU')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: revenueDelta >= 0 ? TEAL : '#C0392B' }}>{revenueDelta >= 0 ? '↑' : '↓'} {Math.abs(revenueDelta)}%</span>
                    <span style={{ fontSize: '10px', color: TEXT3 }}>vs previous 30 days</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <DonutChart segments={revenueBreakdownSafe} size={118} thickness={20} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '9px' }}>
                    {revenueBreakdownSafe.map(rb => (
                      <div key={rb.label} onClick={() => router.push('/dashboard/revenue')} style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: rb.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: '11px', fontWeight: 600, color: TEXT2 }}>{rb.label}</div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: TEXT }}>${rb.value.toLocaleString('en-AU')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={card}>
                <div style={{ padding: '13px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Unpaid Invoices</span>
                  <button onClick={() => router.push('/dashboard/invoices')} style={{ height: '26px', padding: '0 8px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '7px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>All <IconArrow size={10} /></button>
                </div>
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: invoiceStats.outstanding > 0 ? '#991B1B' : TEXT, letterSpacing: '-0.04em' }}>${invoiceStats.outstanding.toLocaleString('en-AU')}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginLeft: '8px' }}>· {invoiceStats.overdueCount} overdue</span>
                </div>
                {invoiceStats.allInvoices.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', marginBottom: 4 }}>✓</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT3 }}>All invoices paid</div>
                  </div>
                ) : invoiceStats.allInvoices.map((inv, i) => {
                  const name = `${inv.customers?.first_name || ''} ${inv.customers?.last_name || ''}`.trim() || 'Customer'
                  const isOverdue = inv.status === 'overdue'
                  const amt = Math.max(0, Number(inv.total || 0) - Number(inv.amount_paid || 0))
                  return (
                    <div key={inv.id || i} onClick={() => router.push('/dashboard/invoices')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }} onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')} onMouseLeave={e => (e.currentTarget.style.background = WHITE)}>
                      <div style={{ width: 28, height: 28, borderRadius: '8px', background: isOverdue ? '#FEF2F2' : '#F8FAFC', border: `1px solid ${isOverdue ? '#FECACA' : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isOverdue ? '#B91C1C' : TEXT3 }}><IconInvoice size={12} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3 }}>{inv.created_at ? parseDateLocal(inv.created_at)?.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: isOverdue ? '#991B1B' : TEXT }}>${amt.toLocaleString('en-AU')}</div>
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: isOverdue ? '#FEE2E2' : '#FEF3C7', color: isOverdue ? '#991B1B' : '#92400E' }}>{isOverdue ? 'Overdue' : 'Sent'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={card}>
                <div style={{ padding: '13px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Upcoming Jobs</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: TEXT }}>{scheduledCount}</span>
                    <span style={{ fontSize: '10px', color: TEXT3, fontWeight: 600 }}>scheduled</span>
                  </div>
                </div>
                {upcoming.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: TEXT3, fontSize: '12px' }}>No upcoming jobs.</div>
                ) : upcoming.slice(0, 4).map((job, i) => {
                  const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                  const isFirst = i === 0
                  const dateText = job.next_service_date ? parseDateLocal(job.next_service_date)?.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : 'No date'
                  return (
                    <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', background: isFirst ? TEAL_LIGHT : WHITE, transition: 'background 0.12s' }} onMouseEnter={e => { if (!isFirst) e.currentTarget.style.background = '#F8FAFC' }} onMouseLeave={e => { if (!isFirst) e.currentTarget.style.background = isFirst ? TEAL_LIGHT : WHITE }}>
                      <div style={{ width: 4, height: 34, borderRadius: '2px', background: isFirst ? TEAL : BORDER, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: isFirst ? TEAL_DARK : TEXT }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3 }}>{dateText}{job.customers?.suburb ? ` · ${job.customers.suburb}` : ''}</div>
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: isFirst ? TEAL_DARK : TEXT3 }}>{job.job_type || 'Service'}</div>
                      <IconChevronRight size={11} />
                    </div>
                  )
                })}
                <div style={{ padding: '10px 16px' }}>
                  <button onClick={() => router.push('/dashboard/schedule')} style={{ width: '100%', height: '30px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <IconCalendar size={12} /> Open Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}