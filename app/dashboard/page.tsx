'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL       = '#1F9E94'
const TEAL_DARK  = '#177A72'
const TEAL_LIGHT = '#E6F7F6'
const TEXT       = '#0B1220'
const TEXT2      = '#1F2937'
const TEXT3      = '#64748B'
const BORDER     = '#E8EDF2'
const BG         = '#FAFAFA'
const WHITE      = '#FFFFFF'
const FONT       = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

// ── Date helpers ─────────────────────────────────────────────────────────────
function parseDateLocal(raw: string | null | undefined): Date | null {
  if (!raw) return null
  const s = String(raw).slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function startOfDay(d: Date): Date {
  const c = new Date(d); c.setHours(0, 0, 0, 0); return c
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Greeting helper ───────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Icons ─────────────────────────────────────────────────────────────────────
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
function IconChevronLeft({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconTrendUp({ size = 11 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 7l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconTrendDown({ size = 11 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 17l-8-8-4 4-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

// ── Sparklines ────────────────────────────────────────────────────────────────
function SparkBars({ data, color, width = 52, height = 36 }: { data: number[]; color: string; width?: number; height?: number }) {
  const safe = data.length ? data : [0]
  const max = Math.max(...safe, 1)
  const count = safe.length
  const barW = Math.max(3, Math.floor((width - (count - 1) * 2) / count))
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {safe.map((v, i) => {
        const h = Math.max(4, (v / max) * (height - 2))
        const opacity = count === 1 ? 1 : 0.3 + (i / (count - 1)) * 0.7
        return <rect key={i} x={i * (barW + 2)} y={height - h} width={barW} height={h} rx="3" fill={color} opacity={i === count - 1 ? 1 : opacity} />
      })}
    </svg>
  )
}

function MiniSparkline({ data, color, width = 72, height = 36 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return <div style={{ width, height }} />
  const min = Math.min(...data)
  const max = Math.max(...data) || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / (max - min || 1)) * (height - 6) - 3}`)
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

// ── Analytics Card ────────────────────────────────────────────────────────────
type AnalyticsMetric = 'revenue' | 'jobs' | 'outstanding'
type AnalyticsRange  = 'This Year' | 'Last Year' | 'Last 6 Months' | 'Last 3 Months'
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function AnalyticsCard({ allJobs, allInvoices }: { allJobs: any[]; allInvoices: any[] }) {
  const [metric, setMetric] = useState<AnalyticsMetric>('revenue')
  const [range,  setRange]  = useState<AnalyticsRange>('This Year')
  const [hovered, setHovered] = useState<number | null>(null)
  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth()

  const months = useMemo(() => {
    if (range === 'This Year')     return Array.from({ length: 12 }, (_, i) => ({ year: thisYear, month: i, label: MONTH_NAMES[i] }))
    if (range === 'Last Year')     return Array.from({ length: 12 }, (_, i) => ({ year: thisYear - 1, month: i, label: MONTH_NAMES[i] }))
    if (range === 'Last 6 Months') return Array.from({ length: 6 }, (_, i) => { const d = new Date(thisYear, thisMonth - 5 + i, 1); return { year: d.getFullYear(), month: d.getMonth(), label: MONTH_NAMES[d.getMonth()] } })
    return Array.from({ length: 3 }, (_, i) => { const d = new Date(thisYear, thisMonth - 2 + i, 1); return { year: d.getFullYear(), month: d.getMonth(), label: MONTH_NAMES[d.getMonth()] } })
  }, [range, thisYear, thisMonth])

  const data = useMemo(() => months.map(({ year, month, label }) => {
    const start = new Date(year, month, 1)
    const end   = new Date(year, month + 1, 1)
    if (metric === 'revenue') {
      const total = allInvoices.filter(inv => inv.status === 'paid').filter(inv => { const d = parseDateLocal(inv.created_at); return d && d >= start && d < end }).reduce((s, i) => s + Number(i.total || 0), 0)
      return { label, total }
    }
    if (metric === 'jobs') {
      const total = allJobs.filter(j => { const d = parseDateLocal(j.created_at); return d && d >= start && d < end }).length
      return { label, total }
    }
    const total = allInvoices.filter(i => i.status === 'sent' || i.status === 'overdue').filter(i => { const d = parseDateLocal(i.created_at); return d && d >= start && d < end }).reduce((s, i) => s + Math.max(0, Number(i.total || 0) - Number(i.amount_paid || 0)), 0)
    return { label, total }
  }), [metric, months, allJobs, allInvoices])

  const periodTotal = data.reduce((s, d) => s + d.total, 0)
  const peak = data.reduce((best, d) => d.total > best.total ? d : best, data[0] || { label: '—', total: 0 })
  const avg  = data.length ? Math.round(periodTotal / data.length) : 0
  const isCurrency = metric !== 'jobs'
  function fmt(n: number) { return isCurrency ? `$${Math.round(n).toLocaleString('en-AU')}` : String(Math.round(n)) }

  const CHART_H = 220; const LABEL_H = 24; const DOT_SIZE = 8; const DOT_GAP = 4
  const NUM_ROWS = Math.floor((CHART_H - LABEL_H) / (DOT_SIZE + DOT_GAP))
  const dotUnit = peak.total > 0 ? Math.ceil(peak.total / NUM_ROWS) : 1
  const dotUnitLabel = isCurrency ? (dotUnit >= 1000 ? `$${Math.round(dotUnit / 1000)}k` : `$${dotUnit}`) : `${dotUnit}`

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, letterSpacing: '-0.01em' }}>Analytics</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={metric} onChange={e => setMetric(e.target.value as AnalyticsMetric)} style={{ height: '30px', padding: '0 10px', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: TEXT2, background: WHITE, outline: 'none', cursor: 'pointer', fontFamily: FONT }}>
            <option value="revenue">Revenue</option><option value="jobs">Jobs</option><option value="outstanding">Outstanding</option>
          </select>
          <select value={range} onChange={e => setRange(e.target.value as AnalyticsRange)} style={{ height: '30px', padding: '0 10px', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: TEXT2, background: WHITE, outline: 'none', cursor: 'pointer', fontFamily: FONT }}>
            {(['This Year','Last Year','Last 6 Months','Last 3 Months'] as AnalyticsRange[]).map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr' }}>
        <div style={{ borderRight: `1px solid ${BORDER}`, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[['Period total', fmt(periodTotal), TEXT], ['Monthly avg', fmt(avg), TEXT], ['Best month', fmt(peak.total), TEAL]].map(([lbl, val, col]) => (
            <div key={lbl as string}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>{lbl}</div>
              <div style={{ fontSize: lbl === 'Period total' ? '22px' : '18px', fontWeight: 900, color: col as string, letterSpacing: '-0.04em', lineHeight: 1 }}>{val}</div>
              {lbl === 'Best month' && <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>{peak.label}</div>}
            </div>
          ))}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: TEAL, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: TEXT }}>1 dot = {dotUnitLabel}</span>
          </div>
        </div>
        <div style={{ padding: '20px 20px 0', overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: CHART_H }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: LABEL_H, display: 'flex', alignItems: 'flex-end', gap: '5px' }}>
              {data.map((item, i) => {
                const filledDots = dotUnit > 0 ? Math.round(item.total / dotUnit) : 0
                const isHov = hovered === i
                const isCurrentMonth = range === 'This Year' && i === thisMonth
                const isBest = peak.total > 0 && item.label === peak.label && item.total === peak.total
                return (
                  <div key={item.label + i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: `${DOT_GAP}px`, position: 'relative', cursor: 'default' }} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                    {isHov && item.total > 0 && (
                      <div style={{ position: 'absolute', bottom: NUM_ROWS * (DOT_SIZE + DOT_GAP) + 8, left: '50%', transform: 'translateX(-50%)', background: TEXT, color: WHITE, padding: '5px 9px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10 }}>
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', marginBottom: '1px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{item.label}</div>
                        <div>{fmt(item.total)}</div>
                      </div>
                    )}
                    {Array.from({ length: NUM_ROWS }).map((_, di) => {
                      const filled = (NUM_ROWS - di) <= filledDots
                      const bg = filled ? TEAL : '#E8EDF2'
                      const op = filled ? (isHov || isBest || isCurrentMonth ? 1 : 0.5 + (di / NUM_ROWS) * 0.5) : 0.25
                      return <div key={di} style={{ width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%', background: bg, opacity: op, flexShrink: 0, transition: 'opacity 0.12s' }} />
                    })}
                  </div>
                )
              })}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: LABEL_H, display: 'flex', gap: '5px', alignItems: 'center' }}>
              {data.map((item, i) => {
                const isCurrentMonth = range === 'This Year' && i === thisMonth
                const isBest = peak.total > 0 && item.label === peak.label && item.total === peak.total
                return <div key={item.label + i} style={{ flex: 1, textAlign: 'center' }}><span style={{ fontSize: '10px', fontWeight: 700, color: isCurrentMonth || isBest ? TEAL : TEXT3 }}>{item.label}</span></div>
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Job Day Popup ─────────────────────────────────────────────────────────────
function JobDayPopup({ date, jobs, onClose, onJobClick }: { date: Date; jobs: any[]; onClose: () => void; onJobClick: (job: any) => void }) {
  const dayLabel = date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,18,32,0.45)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: '18px', width: '100%', maxWidth: '420px', margin: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden', fontFamily: FONT }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>Scheduled Jobs</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT }}>{dayLabel}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '4px 10px', borderRadius: '20px', background: TEAL_LIGHT, color: TEAL_DARK, fontSize: '11px', fontWeight: 800 }}>{jobs.length} job{jobs.length !== 1 ? 's' : ''}</span>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#F8FAFC', cursor: 'pointer', fontFamily: FONT, fontSize: '16px', color: TEXT3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        </div>
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {jobs.map((job, i) => {
            const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
            const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
            const avBg    = ['#E8F4F1','#EEF2F6','#E6F7F6','#F1F5F9','#E8F4F1'][i % 5]
            const avColor = ['#0A4F4C','#334155','#177A72','#475569','#1F9E94'][i % 5]
            const serviceDate = parseDateLocal(job.next_service_date)?.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
            const jobLabel = (job.job_type || job.equipment_type || 'Service').replace(/_/g, ' ')
            return (
              <div key={job.id} onClick={() => onJobClick(job)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }} onMouseEnter={e => (e.currentTarget.style.background = TEAL_LIGHT)} onMouseLeave={e => (e.currentTarget.style.background = WHITE)}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: avBg, color: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>{initials || '?'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{name}</div>
                  <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px', textTransform: 'capitalize' }}>{jobLabel}{job.customers?.suburb ? ` · ${job.customers.suburb}` : ''}</div>
                  {serviceDate && <div style={{ fontSize: '10px', color: TEAL_DARK, fontWeight: 600, marginTop: '2px' }}>📅 {serviceDate}</div>}
                  {job.customers?.phone && <div style={{ fontSize: '10px', color: TEXT3, marginTop: '2px' }}>📞 {job.customers.phone}</div>}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: TEAL_DARK, display: 'flex', alignItems: 'center', gap: '3px' }}>View <IconChevronRight size={11} /></span>
              </div>
            )
          })}
        </div>
        <div style={{ padding: '12px 20px' }}>
          <button onClick={onClose} style={{ width: '100%', height: '36px', background: TEXT, color: WHITE, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Calendar Widget ───────────────────────────────────────────────────────────
const MONTH_NAMES_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function VisitCalendarWidget({ jobs, isMobile, onDateClick }: {
  jobs: any[]
  isMobile: boolean
  onDateClick: (date: Date, jobs: any[]) => void
}) {
  const todayDate = useMemo(() => startOfDay(new Date()), [])
  const todayKey  = useMemo(() => toYMD(todayDate), [todayDate])
  const [viewYear,  setViewYear]  = useState(todayDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth())

  const jobsByDate = useMemo(() => {
    const map: Record<string, any[]> = {}
    jobs.forEach(job => {
      const d = parseDateLocal(job.next_service_date)
      if (!d) return
      const key = toYMD(d)
      if (!map[key]) map[key] = []
      map[key].push(job)
    })
    return map
  }, [jobs])

  function prevMonth() { viewMonth === 0 ? (setViewYear(y => y - 1), setViewMonth(11)) : setViewMonth(m => m - 1) }
  function nextMonth() { viewMonth === 11 ? (setViewYear(y => y + 1), setViewMonth(0)) : setViewMonth(m => m + 1) }

  const todayJobs = jobsByDate[todayKey] || []

  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: { day: number | null; dateKey: string | null; colIndex: number }[] = []
  for (let i = 0; i < firstDayOffset; i++) cells.push({ day: null, dateKey: null, colIndex: i })
  for (let day = 1; day <= daysInMonth; day++) cells.push({ day, dateKey: toYMD(new Date(viewYear, viewMonth, day)), colIndex: (firstDayOffset + day - 1) % 7 })
  while (cells.length % 7 !== 0) cells.push({ day: null, dateKey: null, colIndex: cells.length % 7 })

  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-`
  const monthJobEntries = Object.entries(jobsByDate).filter(([k]) => k.startsWith(monthPrefix)).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div>
      <div style={{ padding: '14px 20px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '15px', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>{MONTH_NAMES_FULL[viewMonth]}</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: TEXT3 }}>{viewYear}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <button onClick={prevMonth} style={{ width: 28, height: 28, borderRadius: '7px', border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, outline: 'none' }}><IconChevronLeft size={13} /></button>
          <button onClick={nextMonth} style={{ width: 28, height: 28, borderRadius: '7px', border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, outline: 'none' }}><IconChevronRight size={13} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 16px 4px' }}>
        {DAY_NAMES_SHORT.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', paddingBottom: '4px' }}>{d}</div>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', padding: '0 16px' }}>
        {cells.map((cell, i) => {
          if (!cell.day || !cell.dateKey) return <div key={i} style={{ height: 38 }} />
          const jobsOnDay = jobsByDate[cell.dateKey] || []
          const count = jobsOnDay.length
          const isToday = cell.dateKey === todayKey
          const hasJobs = count > 0
          return (
            <button key={i} type="button"
              onClick={() => { if (hasJobs || isToday) onDateClick(new Date(viewYear, viewMonth, cell.day!), jobsOnDay) }}
              title={hasJobs ? `${count} job${count !== 1 ? 's' : ''} — ${cell.dateKey}` : undefined}
              style={{ height: 38, borderRadius: '9px', border: 'none', background: isToday ? TEAL : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', cursor: hasJobs ? 'pointer' : 'default', padding: 0, outline: 'none', fontFamily: FONT, transition: 'background 0.12s' }}
              onMouseEnter={e => { if (!isToday && hasJobs) e.currentTarget.style.background = TEAL_LIGHT }}
              onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: '12px', fontWeight: isToday ? 800 : hasJobs ? 700 : 500, color: isToday ? WHITE : TEXT, lineHeight: 1 }}>{cell.day}</span>
              {hasJobs && (
                <div style={{ display: 'flex', gap: '2px' }}>
                  {Array.from({ length: Math.min(count, 3) }).map((_, di) => (
                    <div key={di} style={{ width: 3, height: 3, borderRadius: '50%', background: isToday ? 'rgba(255,255,255,0.8)' : TEAL }} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ padding: '12px 20px 4px', borderTop: `1px solid ${BORDER}`, marginTop: '10px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2, marginBottom: '10px' }}>
          Today: <span style={{ color: TEAL, fontWeight: 800 }}>{todayJobs.length} booking{todayJobs.length !== 1 ? 's' : ''}</span>
        </div>
        {monthJobEntries.length === 0 ? (
          <div style={{ fontSize: '11px', color: TEXT3, paddingBottom: '12px' }}>No jobs scheduled this month.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {monthJobEntries.slice(0, 3).flatMap(([dateKey, dayJobs]) => {
              const d = parseDateLocal(dateKey)
              const dateLabel = d ? d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }) : dateKey
              return dayJobs.slice(0, 1).map(job => {
                const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                const jobLabel = (job.job_type || job.equipment_type || 'Service').replace(/_/g, ' ')
                return (
                  <div key={`${dateKey}-${job.id}`} onClick={() => d && onDateClick(d, dayJobs)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.opacity = '0.65')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    <div style={{ width: 3, height: 34, borderRadius: '2px', background: TEAL, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{name} — {jobLabel}</div>
                      <div style={{ fontSize: '10px', color: TEXT3, marginTop: '1px' }}>{dateLabel}</div>
                    </div>
                    <IconChevronRight size={11} />
                  </div>
                )
              })
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Status pill ───────────────────────────────────────────────────────────────
function statusPill(nextServiceDate: string | null | undefined): { label: string; bg: string; color: string } {
  if (!nextServiceDate) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }
  const d = parseDateLocal(nextServiceDate)
  if (!d) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }
  const diffDays = Math.floor((startOfDay(d).getTime() - startOfDay(new Date()).getTime()) / 86400000)
  if (diffDays < 0)   return { label: 'Overdue',   bg: '#FEE2E2', color: '#991B1B' }
  if (diffDays <= 7)  return { label: 'This week',  bg: '#E6F7F6', color: TEAL_DARK }
  if (diffDays <= 30) return { label: 'Due soon',   bg: '#FEF3C7', color: '#92400E' }
  return { label: 'Scheduled', bg: '#F1F5F9', color: TEXT3 }
}

function pctChange(curr: number, prev: number) { if (prev === 0) return curr === 0 ? 0 : 100; return Math.round(((curr - prev) / prev) * 100) }
function fmtDelta(n: number) { return `${n >= 0 ? '+' : ''}${n}%` }

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router   = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [popupDate, setPopupDate] = useState<Date | null>(null)
  const [popupJobs, setPopupJobs] = useState<any[]>([])
  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0, jobsToday: 0 })
  const [upcoming, setUpcoming]         = useState<any[]>([])
  const [recent,   setRecent]           = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState({ outstanding: 0, overdueCount: 0, allInvoices: [] as any[] })
  const [allJobs,     setAllJobs]       = useState<any[]>([])
  const [allInvoices, setAllInvoices]   = useState<any[]>([])
  const [userName,    setUserName]       = useState<string>('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id, full_name').eq('id', session.user.id).single()
      if (!userData) { setLoading(false); return }

      const bid      = userData.business_id
      // User's display name: prefer users.full_name, fall back to email prefix
      const rawName = (userData as any).full_name || session.user.email?.split('@')[0] || ''
      setUserName(rawName.split(' ')[0]) // first name only
      const todayLocal = startOfDay(new Date())
      const todayKey   = toYMD(todayLocal)
      const todayMs    = todayLocal.getTime()
      const nowMonth   = todayLocal.getMonth()
      const nowYear    = todayLocal.getFullYear()

      const [customersRes, jobsRes, invoicesRes] = await Promise.all([
        supabase.from('customers').select('id, first_name, last_name, suburb, phone').eq('business_id', bid).order('id', { ascending: false }),
        supabase.from('jobs').select('*, customers(first_name, last_name, suburb, phone)').eq('business_id', bid).order('next_service_date', { ascending: true }),
        supabase.from('invoices').select('*, customers(first_name, last_name)').eq('business_id', bid).order('created_at', { ascending: false }),
      ])

      if (jobsRes.error)       console.error('[dashboard] jobs:', jobsRes.error)
      if (customersRes.error)  console.error('[dashboard] customers:', customersRes.error)

      const jobs: any[]     = jobsRes.data     || []
      const invoices: any[] = invoicesRes.data || []

      const overdue = jobs.filter(j => { const d = parseDateLocal(j.next_service_date); return d && startOfDay(d).getTime() < todayMs })
      const jobsToday = jobs.filter(j => j.next_service_date && String(j.next_service_date).slice(0, 10) === todayKey).length
      const jobsThisMonth = jobs.filter(j => { const d = parseDateLocal(j.created_at); return d && d.getMonth() === nowMonth && d.getFullYear() === nowYear }).length
      const upcomingJobs = jobs.filter(j => { const d = parseDateLocal(j.next_service_date); return d && startOfDay(d).getTime() >= todayMs })

      setStats({ customers: customersRes.data?.length || 0, units: jobs.length, overdue: overdue.length, jobsThisMonth, jobsToday })
      setAllJobs(jobs)
      setAllInvoices(invoices)
      setUpcoming(upcomingJobs.slice(0, 5))
      setRecent((customersRes.data || []).slice(0, 8))
      setInvoiceStats({
        outstanding:  invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + Math.max(0, Number(i.total || 0) - Number(i.amount_paid || 0)), 0),
        overdueCount: invoices.filter(i => i.status === 'overdue').length,
        allInvoices:  invoices.filter(i => i.status === 'sent' || i.status === 'overdue').slice(0, 4),
      })
      setLoading(false)
    }
    load()
  }, [router])

  // ── Derived numbers for stat cards ────────────────────────────────────────
  const now = new Date()
  const startCurrMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const start30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  const start60 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60)

  function inRange(raw: string | null | undefined, from: Date, to: Date) {
    const d = parseDateLocal(raw); return d ? d >= from && d < to : false
  }

  const jobsCurrMonth = useMemo(() => allJobs.filter(j => inRange(j.created_at, startCurrMonth, startNextMonth)).length, [allJobs])
  const jobsPrevMonth = useMemo(() => allJobs.filter(j => inRange(j.created_at, startPrevMonth, startCurrMonth)).length, [allJobs])

  const revCurr = useMemo(() => allInvoices.filter(i => i.status === 'paid' && inRange(i.created_at, start30, now)).reduce((s, i) => s + Number(i.total || 0), 0), [allInvoices])
  const revPrev = useMemo(() => allInvoices.filter(i => i.status === 'paid' && inRange(i.created_at, start60, start30)).reduce((s, i) => s + Number(i.total || 0), 0), [allInvoices])
  const outCurr = useMemo(() => allInvoices.filter(i => (i.status === 'sent' || i.status === 'overdue') && inRange(i.created_at, start30, now)).reduce((s, i) => s + Math.max(0, Number(i.total || 0) - Number(i.amount_paid || 0)), 0), [allInvoices])
  const outPrev = useMemo(() => allInvoices.filter(i => (i.status === 'sent' || i.status === 'overdue') && inRange(i.created_at, start60, start30)).reduce((s, i) => s + Math.max(0, Number(i.total || 0) - Number(i.amount_paid || 0)), 0), [allInvoices])

  const totalInv = allInvoices.length
  const paidInv  = allInvoices.filter(i => i.status === 'paid').length
  const convRate = totalInv > 0 ? Math.round((paidInv / totalInv) * 100) : 0
  const currWin  = allInvoices.filter(i => inRange(i.created_at, start30, now))
  const prevWin  = allInvoices.filter(i => inRange(i.created_at, start60, start30))
  const currConv = currWin.length > 0 ? Math.round((currWin.filter(i => i.status === 'paid').length / currWin.length) * 100) : 0
  const prevConv = prevWin.length > 0 ? Math.round((prevWin.filter(i => i.status === 'paid').length / prevWin.length) * 100) : 0

  const jobsSpark = useMemo(() => {
    const base = Array(12).fill(0)
    allJobs.forEach(j => { const d = parseDateLocal(j.next_service_date); if (d && d.getFullYear() === now.getFullYear()) base[d.getMonth()] += 1 })
    return base
  }, [allJobs])
  const revSpark = useMemo(() => {
    const base = Array(12).fill(0)
    allInvoices.forEach(inv => { if (inv.status !== 'paid') return; const d = parseDateLocal(inv.created_at); if (d && d.getFullYear() === now.getFullYear()) base[d.getMonth()] += Number(inv.total || 0) })
    return base
  }, [allInvoices])

  const scheduledCount = useMemo(() => {
    const todayMs = startOfDay(new Date()).getTime()
    return allJobs.filter(j => { const d = parseDateLocal(j.next_service_date); return d && startOfDay(d).getTime() >= todayMs }).length
  }, [allJobs])

  const statCards = [
    { label: 'Outstanding',      value: `$${outCurr.toLocaleString('en-AU')}`, delta: fmtDelta(pctChange(outCurr, outPrev)), up: pctChange(outCurr, outPrev) >= 0, color: TEAL,      sparkType: 'bar'   as const, onClick: () => router.push('/dashboard/invoices') },
    { label: 'Revenue (30d)',    value: `$${revCurr.toLocaleString('en-AU')}`, delta: fmtDelta(pctChange(revCurr, revPrev)), up: pctChange(revCurr, revPrev) >= 0, color: '#43A047',  sparkType: 'line'  as const, onClick: () => router.push('/dashboard/revenue') },
    { label: 'Jobs This Month',  value: `${jobsCurrMonth}`,                    delta: fmtDelta(pctChange(jobsCurrMonth, jobsPrevMonth)), up: pctChange(jobsCurrMonth, jobsPrevMonth) >= 0, color: '#9C27B0', sparkType: 'donut' as const, onClick: () => router.push('/dashboard/jobs') },
    { label: 'Invoice Paid Rate',value: `${convRate}%`,                        delta: `${currConv - prevConv >= 0 ? '+' : ''}${currConv - prevConv}%`, up: currConv >= prevConv, color: '#FF7043', sparkType: 'bar' as const, onClick: () => router.push('/dashboard/invoices') },
  ]

  const card: React.CSSProperties       = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
  const btnOutline: React.CSSProperties = { height: '34px', padding: '0 14px', border: `1px solid ${BORDER}`, borderRadius: '9px', fontSize: '12px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' as const }
  const btnDark: React.CSSProperties    = { height: '34px', padding: '0 16px', border: `1px solid ${TEXT}`, borderRadius: '9px', fontSize: '12px', fontWeight: 700, color: WHITE, background: TEXT, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' as const }
  const btnMobileSm: React.CSSProperties   = { height: '36px', padding: '0 10px', border: `1px solid ${BORDER}`, borderRadius: '9px', fontSize: '12px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '5px', flex: 1 }
  const btnMobileDark: React.CSSProperties = { ...btnMobileSm, background: TEXT, border: `1px solid ${TEXT}`, color: WHITE }

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
      <Sidebar active="/dashboard" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>Loading dashboard...</div>
    </div>
  )

  // ── Stat chips config ─────────────────────────────────────────────────────
  const statChips = [
    { label: 'Customers', value: stats.customers, sub: 'total',         onClick: () => router.push('/dashboard/customers'), icon: '👥', accent: TEAL,      accentLight: TEAL_LIGHT },
    { label: 'Scheduled', value: scheduledCount,  sub: 'upcoming jobs', onClick: () => router.push('/dashboard/jobs'),       icon: '📅', accent: '#6366F1', accentLight: '#EEF2FF' },
    { label: 'Today',     value: stats.jobsToday, sub: 'jobs today',    onClick: () => router.push('/dashboard/jobs'),       icon: '⚡', accent: '#F59E0B', accentLight: '#FFFBEB' },
    { label: 'Overdue',   value: stats.overdue,   sub: 'need attention', onClick: () => router.push('/dashboard/jobs'),      icon: '⚠️', accent: '#EF4444', accentLight: '#FFF5F5', danger: stats.overdue > 0 },
  ]

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard" />

      {popupDate && (
        <JobDayPopup
          date={popupDate} jobs={popupJobs}
          onClose={() => { setPopupDate(null); setPopupJobs([]) }}
          onJobClick={job => { setPopupDate(null); setPopupJobs([]); router.push(`/dashboard/customers/${job.customer_id}`) }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '0' : '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '40px' }}>

          {/* ── Header ── */}
          {isMobile ? (
            <div style={{ padding: '20px 12px 4px' }}>
              {/* Greeting row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0, lineHeight: 1.1 }}>
                    {getGreeting()}{userName ? `, ${userName}` : ''}
                  </h1>
                  <p style={{ fontSize: '12px', color: TEXT3, fontWeight: 500, margin: '4px 0 0', lineHeight: 1.4 }}>
                    Here's what's happening across your business.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginTop: '2px' }}>
                  <button onClick={() => router.push('/dashboard/jobs')} style={btnMobileSm}><IconPlus size={12} /></button>
                  <button onClick={() => router.push('/dashboard/revenue')} style={btnMobileDark}><IconDownload size={12} /></button>
                </div>
              </div>
              {/* Stat chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {statChips.map(chip => (
                  <div key={chip.label} onClick={chip.onClick}
                    style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '10px 8px', cursor: 'pointer', textAlign: 'center', borderTop: `2px solid ${chip.accent}` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = chip.accentLight }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = WHITE }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: 900, color: chip.danger ? '#991B1B' : TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: chip.danger ? '#DC2626' : TEXT3, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '4px', lineHeight: 1.2 }}>{chip.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Top row: greeting + actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0, lineHeight: 1.1 }}>
                    {getGreeting()}{userName ? `, ${userName}` : ''}
                  </h1>
                  <p style={{ fontSize: '13px', color: TEXT3, fontWeight: 500, margin: '5px 0 0' }}>
                    Here's what's happening across your business.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => router.push('/dashboard/jobs')} style={btnOutline}><IconPlus size={12} /> Add Job</button>
                  <button onClick={() => router.push('/dashboard/jobs')} style={btnOutline}><IconCalendar size={12} /> Schedule</button>
                  <button onClick={() => router.push('/dashboard/revenue')} style={btnDark}><IconDownload size={12} /> Revenue</button>
                </div>
              </div>
              {/* Stat chips row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {statChips.map((chip) => (
                  <div key={chip.label} onClick={chip.onClick}
                    style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `2px solid ${chip.accent}`, borderRadius: '10px', padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'background 0.12s, box-shadow 0.12s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = chip.accentLight; el.style.boxShadow = '0 4px 14px rgba(0,0,0,0.07)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = WHITE; el.style.boxShadow = 'none' }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: '8px', background: chip.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{chip.icon}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>{chip.label}</div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: chip.danger ? '#991B1B' : TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Stat cards ── */}
          <div style={{ padding: isMobile ? '0 12px' : '0', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
            {statCards.map(sc => (
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
                  {sc.sparkType === 'bar'   && <SparkBars data={jobsSpark.slice(-8)} color={sc.color} width={58} height={40} />}
                  {sc.sparkType === 'line'  && <MiniSparkline data={revSpark} color={sc.color} width={70} height={40} />}
                  {sc.sparkType === 'donut' && <DonutSparkle value={stats.units > 0 ? Math.round((jobsCurrMonth / Math.max(stats.units, 1)) * 100) : 0} color={sc.color} size={46} />}
                </div>
                <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: '14px', padding: '10px 0', display: 'flex', alignItems: 'center', gap: '5px', color: TEXT3 }}>
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>See Details</span>
                  <IconArrow size={11} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: isMobile ? '0 12px' : '0' }}>
            <AnalyticsCard allJobs={allJobs} allInvoices={allInvoices} />
          </div>

          {/* ── Lower section ── */}
          <div style={{ padding: isMobile ? '0 12px' : '0', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '16px', alignItems: 'start' }}>

            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Bookings card */}
              <div style={card}>
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Bookings</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1 }}>{scheduledCount}</div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '1px' }}>Booked</div>
                    </div>
                    <div style={{ width: 1, height: 28, background: BORDER }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1 }}>{stats.jobsToday}</div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '1px' }}>Today</div>
                    </div>
                  </div>
                </div>
                <VisitCalendarWidget jobs={allJobs} isMobile={isMobile} onDateClick={(date, dayJobs) => { setPopupDate(date); setPopupJobs(dayJobs) }} />
              </div>

              {/* Recent Customers */}
              <div style={card}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Recent Customers</div>
                    <div style={{ fontSize: '11px', color: TEXT3, fontWeight: 500, marginTop: '2px' }}>Last {recent.length} added</div>
                  </div>
                  <button onClick={() => router.push('/dashboard/customers')} style={{ height: '30px', padding: '0 12px', background: TEAL_LIGHT, border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEAL_DARK, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    View all <IconArrow size={11} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', padding: '8px 20px 6px', borderBottom: `1px solid ${BORDER}` }}>
                  {['Customer', 'Service Date', 'Status'].map((h, i) => (
                    <div key={h} style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right' }}>{h}</div>
                  ))}
                </div>
                {recent.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: TEXT3 }}>No customers yet</div>
                  </div>
                ) : recent.map((customer: any, i: number) => {
                  const name = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer'
                  const todayMs = startOfDay(new Date()).getTime()
                  const custJobs = allJobs
                    .filter(j => j.customer_id === customer.id && j.next_service_date)
                    .sort((a, b) => (parseDateLocal(a.next_service_date)?.getTime() ?? 0) - (parseDateLocal(b.next_service_date)?.getTime() ?? 0))
                  const nextJob = custJobs.find(j => { const d = parseDateLocal(j.next_service_date); return d && startOfDay(d).getTime() >= todayMs }) ?? custJobs[custJobs.length - 1]
                  const sp = statusPill(nextJob?.next_service_date)
                  const jobDate = nextJob?.next_service_date ? parseDateLocal(nextJob.next_service_date)?.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '—'
                  const accent = [TEAL,'#9C27B0','#FF7043','#43A047','#2196F3','#FF6B35','#E040FB'][i % 7]
                  return (
                    <div key={customer.id} onClick={() => router.push(`/dashboard/customers/${customer.id}`)} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', alignItems: 'center', padding: '0 20px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s', minHeight: '52px' }} onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')} onMouseLeave={e => (e.currentTarget.style.background = WHITE)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '8px' }}>
                        <div style={{ width: 3, height: 32, borderRadius: '2px', background: accent, flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                          <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {customer.suburb && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer.suburb}</span>}
                            {nextJob?.equipment_type && customer.suburb && <span style={{ opacity: 0.35 }}>·</span>}
                            {nextJob?.equipment_type && <span style={{ color: accent, fontWeight: 600, flexShrink: 0, textTransform: 'capitalize' }}>{nextJob.equipment_type.replace(/_/g, ' ')}</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, textAlign: 'center' }}>{jobDate}</div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ padding: '3px 9px', borderRadius: '20px', background: sp.bg, color: sp.color, fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap' }}>{sp.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Unpaid Invoices */}
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
                        <div style={{ fontSize: '10px', color: TEXT3 }}>{parseDateLocal(inv.created_at)?.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) || ''}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: isOverdue ? '#991B1B' : TEXT }}>${amt.toLocaleString('en-AU')}</div>
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: isOverdue ? '#FEE2E2' : '#FEF3C7', color: isOverdue ? '#991B1B' : '#92400E' }}>{isOverdue ? 'Overdue' : 'Sent'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Upcoming Jobs */}
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
                  const dateText = parseDateLocal(job.next_service_date)?.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) || 'No date'
                  const jobLabel = (job.job_type || job.equipment_type || 'Service').replace(/_/g, ' ')
                  return (
                    <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', background: isFirst ? TEAL_LIGHT : WHITE, transition: 'background 0.12s' }} onMouseEnter={e => { if (!isFirst) e.currentTarget.style.background = '#F8FAFC' }} onMouseLeave={e => { if (!isFirst) e.currentTarget.style.background = isFirst ? TEAL_LIGHT : WHITE }}>
                      <div style={{ width: 4, height: 34, borderRadius: '2px', background: isFirst ? TEAL : BORDER, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: isFirst ? TEAL_DARK : TEXT }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3 }}>{dateText}{job.customers?.suburb ? ` · ${job.customers.suburb}` : ''}</div>
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: isFirst ? TEAL_DARK : TEXT3, textTransform: 'capitalize' }}>{jobLabel}</div>
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