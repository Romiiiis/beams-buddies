'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { nextServiceDate, serviceBucket, daysUntilService } from '@/lib/service'
import { HeaderToolbar } from '@/components/HeaderToolbar'
import { useBusiness } from '@/lib/useBusiness'
import { getEquipmentLabel } from '@/lib/industry-config'
import { AppIcon } from '@/components/AppIcon'

const TEAL       = '#2AA198'
const TEAL_DARK  = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const TEXT       = '#0B1220'
const TEXT2      = '#1F2937'
const TEXT3      = '#64748B'
const BORDER     = '#E8EDF2'
const BG         = '#FAFAFA'
const WHITE      = '#FFFFFF'
const FONT       = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

// ── Helpers ────────────────────────────────────────────────────────────────

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

function getGreeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function pctChange(curr: number, prev: number) {
  if (prev === 0) return curr === 0 ? 0 : 100
  return Math.round(((curr - prev) / prev) * 100)
}

function fmtDelta(n: number) {
  return `${n >= 0 ? '+' : ''}${n}%`
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

// ── Icons ──────────────────────────────────────────────────────────────────

function IconPlus({ size = 13 }: { size?: number }) {
  return <AppIcon name="add" size={size} />
}
function IconCalendar({ size = 13 }: { size?: number }) {
  return <AppIcon name="calendar" size={size} />
}
function IconChevronLeft({ size = 13 }: { size?: number }) {
  return <AppIcon name="chevron-left" size={size} />
}
function IconChevronRight({ size = 13 }: { size?: number }) {
  return <AppIcon name="chevron-right" size={size} />
}
function IconTrendUp({ size = 11 }: { size?: number }) {
  return <AppIcon name="trend-up" size={size} />
}
function IconTrendDown({ size = 11 }: { size?: number }) {
  return <AppIcon name="trend-down" size={size} />
}
function IconInvoice({ size = 13 }: { size?: number }) {
  return <AppIcon name="invoice" size={size} />
}
function IconUsers({ size = 15 }: { size?: number }) {
  return <AppIcon name="customers" size={size} />
}
function IconBarChart({ size = 14 }: { size?: number }) {
  return <AppIcon name="stats" size={size} />
}
function IconClipboard({ size = 15 }: { size?: number }) {
  return <AppIcon name="clipboard" size={size} />
}
function IconClock({ size = 13 }: { size?: number }) {
  return <AppIcon name="clock" size={size} />
}
function IconAlertCircle({ size = 13 }: { size?: number }) {
  return <AppIcon name="warning" size={size} />
}

// ── Constants ──────────────────────────────────────────────────────────────

const MONTH_NAMES      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_NAMES_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS       = ['SUN','MON','TUE','WED','THU','FRI','SAT']
const DAY_LABELS_SHORT = ['S','M','T','W','T','F','S']

// ── Job Day Popup ──────────────────────────────────────────────────────────

type CalItem = {
  id: string
  kind: 'service' | 'booking'
  dateKey: string
  name: string
  label: string
  suburb?: string | null
  phone?: string | null
  time?: string | null
  href: string
}

const KIND_STYLE = {
  service: { label: 'Service due', bg: TEAL_LIGHT, fg: TEAL_DARK },
  booking: { label: 'Booked', bg: '#EFF6FF', fg: '#1D4ED8' },
}

function JobDayPopup({ date, jobs, onClose, onJobClick }: {
  date: Date; jobs: CalItem[]; onClose: () => void; onJobClick: (item: CalItem) => void
}) {
  const dayLabel = date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,18,32,0.45)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: '18px', width: '100%', maxWidth: '420px', margin: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden', fontFamily: FONT }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT }}>{dayLabel}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>{jobs.length === 0 ? 'Nothing booked' : `${jobs.length} thing${jobs.length !== 1 ? 's' : ''} on`}</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#F8FAFC', cursor: 'pointer', fontFamily: FONT, fontSize: '16px', color: TEXT3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {jobs.length === 0 && <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: '13px', color: TEXT3 }}>Nothing booked for this day.</div>}
          {jobs.map(item => {
            const k = KIND_STYLE[item.kind]
            const initials = item.name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
            return (
              <div key={item.id} onClick={() => onJobClick(item)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }} onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')} onMouseLeave={e => (e.currentTarget.style.background = WHITE)}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: k.bg, color: k.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>{initials || '?'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px', textTransform: 'capitalize' }}>{[item.time, item.label, item.suburb].filter(Boolean).join(' · ')}</div>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: '6px', background: k.bg, color: k.fg, fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap' }}>{k.label}</span>
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

// ── Bookings Widget (week strip + month calendar) ──────────────────────────

function BookingsWidget({ items, isMobile, onDateClick }: {
  items: CalItem[]
  isMobile: boolean
  onDateClick: (date: Date, items: CalItem[]) => void
}) {
  const todayDate  = useMemo(() => startOfDay(new Date()), [])
  const todayKey   = useMemo(() => toYMD(todayDate), [todayDate])
  const [viewYear,  setViewYear]  = useState(todayDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth())

  const jobsByDate = useMemo(() => {
    const map: Record<string, CalItem[]> = {}
    items.forEach(item => {
      if (!map[item.dateKey]) map[item.dateKey] = []
      map[item.dateKey].push(item)
    })
    return map
  }, [items])

  function prevMonth() { viewMonth === 0 ? (setViewYear(y => y - 1), setViewMonth(11)) : setViewMonth(m => m - 1) }
  function nextMonth() { viewMonth === 11 ? (setViewYear(y => y + 1), setViewMonth(0)) : setViewMonth(m => m + 1) }

  // Month calendar cells
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: { day: number | null; dateKey: string | null }[] = []
  for (let i = 0; i < firstDayOffset; i++) cells.push({ day: null, dateKey: null })
  for (let day = 1; day <= daysInMonth; day++) cells.push({ day, dateKey: toYMD(new Date(viewYear, viewMonth, day)) })
  while (cells.length % 7 !== 0) cells.push({ day: null, dateKey: null })

  return (
    <div>
      {/* Month calendar */}
      <div style={{ padding: '14px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>
            {MONTH_NAMES_FULL[viewMonth]} {viewYear}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={prevMonth} style={{ width: 28, height: 28, borderRadius: '7px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconChevronLeft size={12} />
            </button>
            <button onClick={nextMonth} style={{ width: 28, height: 28, borderRadius: '7px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconChevronRight size={12} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
          {DAY_LABELS_SHORT.map((d, i) => (
            <div key={`${d}-${i}`} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: TEXT3 }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {cells.map((cell, i) => {
            if (!cell.day || !cell.dateKey) return <div key={i} style={{ height: 36 }} />
            const jobsOnDay = jobsByDate[cell.dateKey] || []
            const hasJobs   = jobsOnDay.length > 0
            const isToday   = cell.dateKey === todayKey
            const isPast    = cell.dateKey < todayKey
            return (
              <button key={i} type="button"
                onClick={() => { if (hasJobs || isToday) onDateClick(new Date(viewYear, viewMonth, cell.day!), jobsOnDay) }}
                style={{ height: 36, borderRadius: '8px', border: isToday ? `1.5px solid ${TEAL}` : '1px solid transparent', background: isToday ? TEAL : 'transparent', color: isToday ? WHITE : isPast && !hasJobs ? '#94A3B8' : TEXT, cursor: hasJobs || isToday ? 'pointer' : 'default', fontFamily: FONT, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', fontSize: '12px', fontWeight: isToday ? 900 : 600, opacity: isPast && !hasJobs ? 0.7 : 1, transition: 'background 0.12s' }}
                onMouseEnter={e => { if (hasJobs && !isToday) e.currentTarget.style.background = TEAL_LIGHT }}
                onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ lineHeight: 1 }}>{cell.day}</span>
                {hasJobs && (
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: Math.min(jobsOnDay.length, 3) }).map((_, di) => (
                      <span key={di} style={{ width: 4, height: 4, borderRadius: '50%', background: isToday ? 'rgba(255,255,255,0.85)' : TEAL }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Analytics Card ─────────────────────────────────────────────────────────

type AnalyticsMetric = 'revenue' | 'jobs' | 'outstanding'
type AnalyticsRange  = 'This Year' | 'Last Year' | 'Last 6 Months' | 'Last 3 Months'

function AnalyticsCard({ allJobs, allInvoices, isMobile }: { allJobs: any[]; allInvoices: any[]; isMobile: boolean }) {
  const [metric,  setMetric]  = useState<AnalyticsMetric>('revenue')
  const [range,   setRange]   = useState<AnalyticsRange>('This Year')
  const [hovered, setHovered] = useState<number | null>(null)

  const now       = new Date()
  const thisYear  = now.getFullYear()
  const thisMonth = now.getMonth()

  const months = useMemo(() => {
    if (range === 'This Year')     return Array.from({ length: 12 }, (_, i) => ({ year: thisYear,     month: i, label: MONTH_NAMES[i] }))
    if (range === 'Last Year')     return Array.from({ length: 12 }, (_, i) => ({ year: thisYear - 1, month: i, label: MONTH_NAMES[i] }))
    if (range === 'Last 6 Months') return Array.from({ length: 6 },  (_, i) => { const d = new Date(thisYear, thisMonth - 5 + i, 1); return { year: d.getFullYear(), month: d.getMonth(), label: MONTH_NAMES[d.getMonth()] } })
    return Array.from({ length: 3 }, (_, i) => { const d = new Date(thisYear, thisMonth - 2 + i, 1); return { year: d.getFullYear(), month: d.getMonth(), label: MONTH_NAMES[d.getMonth()] } })
  }, [range, thisYear, thisMonth])

  const data = useMemo(() => months.map(({ year, month, label }) => {
    const start = new Date(year, month, 1)
    const end   = new Date(year, month + 1, 1)
    if (metric === 'revenue') {
      return { label, total: allInvoices.filter(inv => inv.status === 'paid').filter(inv => { const d = parseDateLocal(inv.created_at); return d && d >= start && d < end }).reduce((s, i) => s + Number(i.total || 0), 0) }
    }
    if (metric === 'jobs') {
      return { label, total: allJobs.filter(j => { const d = parseDateLocal(j.created_at); return d && d >= start && d < end }).length }
    }
    return { label, total: allInvoices.filter(i => i.status === 'sent' || i.status === 'overdue').filter(i => { const d = parseDateLocal(i.created_at); return d && d >= start && d < end }).reduce((s, i) => s + Math.max(0, Number(i.total || 0) - Number(i.amount_paid || 0)), 0) }
  }), [metric, months, allJobs, allInvoices])

  const periodTotal = data.reduce((s, d) => s + d.total, 0)
  const peak        = data.reduce((best, d) => d.total > best.total ? d : best, data[0] || { label: '—', total: 0 })
  const avg         = data.length ? Math.round(periodTotal / data.length) : 0
  const isCurrency  = metric !== 'jobs'
  function fmt(n: number) { return isCurrency ? `$${Math.round(n).toLocaleString('en-AU')}` : String(Math.round(n)) }

  const maxValue    = Math.max(...data.map(d => d.total), 1)
  const activeIndex = hovered !== null ? hovered : data.findIndex(d => d.label === peak.label && d.total === peak.total)

  const selectStyle: React.CSSProperties = {
    height: '32px', padding: '0 10px', border: `1px solid ${BORDER}`, borderRadius: '8px',
    fontSize: '11px', fontWeight: 700, color: TEXT2, background: WHITE, outline: 'none',
    cursor: 'pointer', fontFamily: FONT,
  }

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}`, gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 30, height: 30, borderRadius: '8px', background: WHITE, border: `1px solid ${BORDER}`, boxSizing: 'border-box', color: TEXT2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconBarChart size={17} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', lineHeight: 1 }}>Analytics</div>
            <div style={{ fontSize: '11px', color: TEXT3, fontWeight: 500, marginTop: '3px' }}>Track your business performance</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={metric} onChange={e => { setMetric(e.target.value as AnalyticsMetric); setHovered(null) }} style={selectStyle}>
            <option value="revenue">Revenue</option>
            <option value="jobs">Jobs</option>
            <option value="outstanding">Outstanding</option>
          </select>
          <select value={range} onChange={e => { setRange(e.target.value as AnalyticsRange); setHovered(null) }} style={selectStyle}>
            {(['This Year', 'Last Year', 'Last 6 Months', 'Last 3 Months'] as AnalyticsRange[]).map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : '170px minmax(0,1fr)' }}>
        {/* Left stats panel */}
        <div style={{ borderRight: isMobile ? 'none' : `1px solid ${BORDER}`, borderBottom: isMobile ? `1px solid ${BORDER}` : 'none', padding: isMobile ? '16px 20px' : '20px 18px', display: isMobile ? 'grid' : 'block', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : undefined, gap: isMobile ? '0' : undefined }}>
          {[
            { label: 'Period total', value: fmt(periodTotal), color: TEAL_DARK },
            { label: 'Monthly avg',  value: fmt(avg),         color: TEXT },
            { label: 'Best month',   value: fmt(peak.total),  color: TEXT, sub: peak.label },
          ].map((item, i) => (
            <div key={i} style={isMobile ? { padding: '0 12px', borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none' } : {}}>
              {!isMobile && i > 0 && <div style={{ height: 1, background: BORDER, margin: '16px 0' }} />}
              <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
              <div style={{ fontSize: isMobile ? '16px' : '22px', fontWeight: 900, color: item.color, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{item.value}</div>
              {item.sub && <div style={{ fontSize: '11px', color: TEXT3, fontWeight: 600, marginTop: '5px' }}>{item.sub}</div>}
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{ padding: '20px 22px 16px', minWidth: 0 }}>
          <div style={{ height: 230, position: 'relative' }}>
            {[0.25, 0.5, 0.75, 1].map((line, i) => (
              <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: `${line * 174 + 28}px`, borderTop: '1px dashed #E4ECF0' }}>
                <span style={{ position: 'absolute', left: 0, top: -9, fontSize: '10px', fontWeight: 600, color: TEXT3, background: WHITE, paddingRight: 6 }}>
                  {fmt(maxValue * line)}
                </span>
              </div>
            ))}
            <div style={{ position: 'absolute', left: 40, right: 0, bottom: 28, height: 174, display: 'grid', gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: data.length > 6 ? '8px' : '18px', alignItems: 'end' }}>
              {data.map((item, i) => {
                const barH   = Math.max(6, (item.total / maxValue) * 174)
                const active = i === activeIndex
                return (
                  <div key={`${item.label}-${i}`} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ height: '100%', display: 'flex', alignItems: 'end', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
                    {active && item.total > 0 && (
                      <div style={{ position: 'absolute', bottom: barH + 10, left: '50%', transform: 'translateX(-50%)', background: TEXT, color: WHITE, padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 3 }}>
                        <div style={{ opacity: 0.6, fontSize: '10px', marginBottom: 2 }}>{item.label}</div>
                        <div>{fmt(item.total)}</div>
                      </div>
                    )}
                    <div style={{ width: data.length > 8 ? '62%' : '52%', maxWidth: 30, height: barH, borderRadius: '7px 7px 3px 3px', background: active ? TEAL_DARK : TEAL, opacity: active ? 1 : 0.72, transition: 'height 0.15s, background 0.15s, opacity 0.15s' }} />
                  </div>
                )
              })}
            </div>
            <div style={{ position: 'absolute', left: 40, right: 0, bottom: 0, display: 'grid', gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: data.length > 6 ? '8px' : '18px' }}>
              {data.map((item, i) => (
                <div key={`${item.label}-label-${i}`} style={{ textAlign: 'center', fontSize: '10px', fontWeight: i === activeIndex ? 800 : 600, color: i === activeIndex ? TEAL_DARK : TEXT3 }}>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Dashboard Page ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router    = useRouter()
  const isMobile  = useIsMobile()
  const business  = useBusiness()
  const logoUrl   = business?.logo_url ?? null
  const [loading,      setLoading]      = useState(true)
  const [popupDate,    setPopupDate]    = useState<Date | null>(null)
  const [popupJobs,    setPopupJobs]    = useState<CalItem[]>([])
  const [allLeads,     setAllLeads]     = useState<any[]>([])
  const [stats,        setStats]        = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0, jobsToday: 0 })
  const [invoiceStats, setInvoiceStats] = useState({ outstanding: 0, overdueCount: 0, allInvoices: [] as any[] })
  const [allJobs,      setAllJobs]      = useState<any[]>([])
  const [allInvoices,  setAllInvoices]  = useState<any[]>([])
  const [userName,     setUserName]     = useState<string>('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: userData } = await supabase.from('users').select('business_id, full_name').eq('id', session.user.id).single()
      // First sign-in: Settings creates the business record, so send new logins there.
      if (!userData) { router.push('/dashboard/settings'); return }

      const bid     = userData.business_id
      const rawName = (userData as any).full_name || session.user.email?.split('@')[0] || ''
      setUserName(rawName.split(' ')[0])

      const todayLocal = startOfDay(new Date())
      const todayKey   = toYMD(todayLocal)
      const todayMs    = todayLocal.getTime()
      const nowMonth   = todayLocal.getMonth()
      const nowYear    = todayLocal.getFullYear()

      const [customersRes, jobsRes, invoicesRes] = await Promise.all([
        supabase.from('customers').select('id').eq('business_id', bid),
        supabase.from('jobs').select('*, customers(first_name, last_name, suburb, phone)').eq('business_id', bid).order('next_service_date', { ascending: true }),
        supabase.from('invoices').select('*, customers(first_name, last_name)').eq('business_id', bid).order('created_at', { ascending: false }),
      ])

      const jobs: any[]     = jobsRes.data || []
      const invoices: any[] = invoicesRes.data || []

      // Booked visits from the Leads pipeline also belong on the calendar
      const leadsRes = await supabase
        .from('leads')
        .select('id, customer_name, phone_number, suburb, job_type, status, preferred_date, preferred_start_time')
        .eq('status', 'booked')
        .not('preferred_date', 'is', null)
      setAllLeads(leadsRes.data || [])

      const overdue       = jobs.filter(j => serviceBucket(j) === 'overdue')
      const jobsToday     = 0 // worked out from the calendar items below
      const jobsThisMonth = jobs.filter(j => { const d = parseDateLocal(j.created_at); return d && d.getMonth() === nowMonth && d.getFullYear() === nowYear }).length

      setStats({ customers: customersRes.data?.length || 0, units: jobs.length, overdue: overdue.length, jobsThisMonth, jobsToday })
      setAllJobs(jobs)
      setAllInvoices(invoices)
      setInvoiceStats({
        outstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + Math.max(0, Number(i.total || 0) - Number(i.amount_paid || 0)), 0),
        overdueCount: invoices.filter(i => i.status === 'overdue').length,
        allInvoices: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').slice(0, 4),
      })
      setLoading(false)
    }
    load()
  }, [router])

  const now            = new Date()
  const startCurrMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const start30        = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  const start60        = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60)

  function inRange(raw: string | null | undefined, from: Date, to: Date) {
    const d = parseDateLocal(raw)
    return d ? d >= from && d < to : false
  }

  const revCurr       = useMemo(() => allInvoices.filter(i => i.status === 'paid' && inRange(i.created_at, start30, now)).reduce((s, i) => s + Number(i.total || 0), 0), [allInvoices])
  const revPrev       = useMemo(() => allInvoices.filter(i => i.status === 'paid' && inRange(i.created_at, start60, start30)).reduce((s, i) => s + Number(i.total || 0), 0), [allInvoices])
  const outCurr       = useMemo(() => allInvoices.filter(i => (i.status === 'sent' || i.status === 'overdue') && inRange(i.created_at, start30, now)).reduce((s, i) => s + Math.max(0, Number(i.total || 0) - Number(i.amount_paid || 0)), 0), [allInvoices])
  const outPrev       = useMemo(() => allInvoices.filter(i => (i.status === 'sent' || i.status === 'overdue') && inRange(i.created_at, start60, start30)).reduce((s, i) => s + Math.max(0, Number(i.total || 0) - Number(i.amount_paid || 0)), 0), [allInvoices])
  const jobsCurrMonth = useMemo(() => allJobs.filter(j => inRange(j.created_at, startCurrMonth, startNextMonth)).length, [allJobs])
  const jobsPrevMonth = useMemo(() => allJobs.filter(j => inRange(j.created_at, startPrevMonth, startCurrMonth)).length, [allJobs])

  const totalInv = allInvoices.length
  const paidInv  = allInvoices.filter(i => i.status === 'paid').length
  const convRate = totalInv > 0 ? Math.round((paidInv / totalInv) * 100) : 0

  const currWin  = allInvoices.filter(i => inRange(i.created_at, start30, now))
  const prevWin  = allInvoices.filter(i => inRange(i.created_at, start60, start30))
  const currConv = currWin.length > 0 ? Math.round((currWin.filter(i => i.status === 'paid').length / currWin.length) * 100) : 0
  const prevConv = prevWin.length > 0 ? Math.round((prevWin.filter(i => i.status === 'paid').length / prevWin.length) * 100) : 0

  const scheduledCount = useMemo(() => allJobs.filter(j => { const d = daysUntilService(j); return d !== null && d >= 0 }).length, [allJobs])

  const todayKey = toYMD(startOfDay(new Date()))

  // Everything that is booked: services falling due plus booked visits from Leads
  const calendarItems = useMemo<CalItem[]>(() => {
    const out: CalItem[] = []
    allJobs.forEach(job => {
      const d = nextServiceDate(job)
      if (!d) return
      out.push({
        id: `job-${job.id}`,
        kind: 'service',
        dateKey: toYMD(d),
        name: `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer',
        label: job.job_type ? String(job.job_type).replace(/_/g, ' ') : getEquipmentLabel(job.equipment_type) || 'Service',
        suburb: job.customers?.suburb,
        phone: job.customers?.phone,
        time: null,
        href: `/dashboard/customers/${job.customer_id}`,
      })
    })
    allLeads.forEach(l => {
      const d = parseDateLocal(l.preferred_date)
      if (!d) return
      out.push({
        id: `lead-${l.id}`,
        kind: 'booking',
        dateKey: toYMD(d),
        name: l.customer_name || 'Caller',
        label: l.job_type ? String(l.job_type).replace(/_/g, ' ') : 'Visit',
        suburb: l.suburb,
        phone: l.phone_number,
        time: l.preferred_start_time ? String(l.preferred_start_time).slice(0, 5) : null,
        href: '/dashboard/leads',
      })
    })
    return out
  }, [allJobs, allLeads])

  const todayItems = useMemo(
    () => calendarItems.filter(i => i.dateKey === todayKey).sort((a, b) => (a.time || '99').localeCompare(b.time || '99')),
    [calendarItems, todayKey]
  )

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
      <Sidebar active="/dashboard" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>Loading dashboard...</div>
    </div>
  )

  // Stat chips (row 1)
  const statChips = [
    { label: 'Total Customers', value: stats.customers,  danger: false,              icon: <IconUsers size={13} />,       onClick: () => router.push('/dashboard/customers') },
    { label: 'Upcoming Jobs',   value: scheduledCount,   danger: false,              icon: <IconCalendar size={13} />,    onClick: () => router.push('/dashboard/jobs') },
    { label: 'Jobs Today',      value: todayItems.length,  danger: false,              icon: <IconClock size={13} />,       onClick: () => router.push('/dashboard/schedule') },
    { label: 'Overdue Jobs',    value: stats.overdue,    danger: stats.overdue > 0,  icon: <IconAlertCircle size={13} />, onClick: () => router.push('/dashboard/jobs') },
  ]

  // Metric cards (row 2)
  const metricCards = [
    { label: 'Outstanding',       value: `$${outCurr.toLocaleString('en-AU')}`,  delta: pctChange(outCurr, outPrev),         up: pctChange(outCurr, outPrev) >= 0,         hasDelta: outPrev > 0,          sub: `${invoiceStats.overdueCount} overdue`,      accent: '#EF4444', onClick: () => router.push('/dashboard/invoices') },
    { label: 'Revenue (30d)',      value: `$${revCurr.toLocaleString('en-AU')}`,  delta: pctChange(revCurr, revPrev),         up: pctChange(revCurr, revPrev) >= 0,         hasDelta: revPrev > 0,          sub: 'vs prev 30 days',                           accent: TEAL,      onClick: () => router.push('/dashboard/revenue') },
    { label: 'Jobs This Month',    value: `${jobsCurrMonth}`,                     delta: pctChange(jobsCurrMonth, jobsPrevMonth), up: pctChange(jobsCurrMonth, jobsPrevMonth) >= 0, hasDelta: jobsPrevMonth > 0, sub: 'vs last month',                           accent: '#6366F1', onClick: () => router.push('/dashboard/jobs') },
    { label: 'Invoice Paid Rate',  value: `${convRate}%`,                         delta: currConv - prevConv,                  up: currConv >= prevConv,                     hasDelta: prevWin.length > 0,   sub: `${paidInv} of ${totalInv} invoices`,        accent: '#10B981', onClick: () => router.push('/dashboard/invoices') },
  ]

  const card: React.CSSProperties = {
    background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px',
    overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard" />

      {popupDate && (
        <JobDayPopup
          date={popupDate} jobs={popupJobs}
          onClose={() => { setPopupDate(null); setPopupJobs([]) }}
          onJobClick={item => { setPopupDate(null); setPopupJobs([]); router.push(item.href) }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <div className="page-content" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: isMobile ? 0 : '0', paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '48px' }}>

          {/* ── Header ── */}
          <div style={{ padding: isMobile ? '16px 14px 14px' : '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: BG, borderBottom: `1px solid ${BORDER}`, gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '14px' }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Business logo" style={{ width: isMobile ? 72 : 84, height: isMobile ? 72 : 84, objectFit: 'contain', flexShrink: 0 }} />
              ) : (
                <div style={{ width: isMobile ? 42 : 48, height: isMobile ? 42 : 48, borderRadius: '13px', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: isMobile ? '17px' : '20px', fontWeight: 900, color: WHITE, letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {userName ? userName[0].toUpperCase() : '?'}
                  </span>
                </div>
              )}
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>
                  {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <h1 style={{ fontSize: isMobile ? '19px' : '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0, lineHeight: 1.1 }}>
                  {getGreeting()}{userName ? `, ${userName}` : ''}
                </h1>
              </div>
            </div>
            {/* Phones only have room for the main action next to the logo and greeting */}
            <HeaderToolbar
              isMobile={isMobile}
              items={[
                ...(!isMobile
                  ? [
                      { label: 'Schedule', icon: <AppIcon name="calendar-clock" size={15} />, onClick: () => router.push('/dashboard/schedule') },
                      { label: 'Revenue', icon: <AppIcon name="dollar" size={15} />, onClick: () => router.push('/dashboard/revenue') },
                    ]
                  : []),
                { label: 'Add job', icon: <AppIcon name="add" size={15} />, tone: 'primary' as const, onClick: () => router.push('/dashboard/jobs/add') },
              ]}
            />
          </div>

          {/* ── Row 1: Stat chips ── */}
          <div style={{ padding: isMobile ? '12px 14px 0' : '14px 24px 12px', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', background: BG }}>
            {statChips.map(chip => {
              const isAlert = chip.danger && chip.value > 0
              return (
                <div
                  key={chip.label}
                  onClick={chip.onClick}
                  style={{
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    borderTop: `3px solid ${isAlert ? '#EF4444' : TEAL}`,
                    borderRadius: '14px',
                    padding: isMobile ? '9px 14px' : '10px 16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    minWidth: 0,
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 500, color: TEXT3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chip.label}</div>
                  <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 700, color: isAlert ? '#EF4444' : TEXT, letterSpacing: '-0.02em', lineHeight: 1.2, marginTop: '1px', fontVariantNumeric: 'tabular-nums' }}>{chip.value}</div>
                </div>
              )
            })}
          </div>

          {/* ── Row 2: Metric cards ── */}
          <div style={{ padding: isMobile ? '12px 14px' : '0 24px 16px', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
            {metricCards.map(mc => (
              <div
                key={mc.label}
                onClick={mc.onClick}
                style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: isMobile ? '14px 14px 12px' : '18px 18px 14px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: `3px solid ${TEAL}` }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  {mc.label}
                </div>
                <div style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: '10px' }}>
                  {mc.value}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {mc.hasDelta ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '3px 7px', borderRadius: '12px', background: mc.up ? TEAL_LIGHT : '#FFF0EE', color: mc.up ? TEAL_DARK : '#C0392B', fontSize: '10px', fontWeight: 800, flexShrink: 0 }}>
                      {mc.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}
                      {fmtDelta(mc.delta)}
                    </span>
                  ) : null}
                  <span style={{ fontSize: '10px', color: TEXT3, fontWeight: 500 }}>{mc.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Content grid ── */}
          <div style={{ padding: isMobile ? '0 14px' : '0 24px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '16px', alignItems: 'start' }}>

            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Today's Schedule */}
              <div style={card}>
                <div style={{ padding: '13px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Today&apos;s schedule</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: TEXT3 }}>{todayItems.length} booked</span>
                    <HeaderToolbar size="sm" items={[{ label: 'Full calendar', icon: <AppIcon name="calendar" size={14} />, onClick: () => router.push('/dashboard/schedule') }]} />
                  </div>
                </div>

                {todayItems.length === 0 ? (
                  <div style={{ padding: '28px', textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: WHITE, border: `1px solid ${BORDER}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: TEXT2 }}>
                      <IconClipboard size={22} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT2 }}>Nothing booked today</div>
                    <div style={{ marginTop: '10px' }}>
                      <HeaderToolbar size="sm" items={[{ label: 'Add job', icon: <AppIcon name="add" size={14} />, tone: 'primary', onClick: () => router.push('/dashboard/jobs/add') }]} />
                    </div>
                  </div>
                ) : todayItems.map((item, i) => {
                  const timeStr  = item.time || null
                  const isFirst  = i === 0
                  const isLast   = i === todayItems.length - 1
                  const k        = KIND_STYLE[item.kind]
                  return (
                    <div
                      key={item.id}
                      onClick={() => router.push(item.href)}
                      style={{ display: 'grid', gridTemplateColumns: timeStr ? '64px 18px 1fr auto' : '18px 1fr auto', alignItems: 'stretch', padding: '0 18px', cursor: 'pointer', minHeight: '64px', borderBottom: isLast ? 'none' : `1px solid ${BORDER}`, transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                    >
                      {timeStr && (
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right', padding: '12px 8px 12px 0' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{timeStr}</div>
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 18 }}>
                        <div style={{ width: 2, flex: 1, background: isFirst ? 'transparent' : BORDER }} />
                        <div style={{ width: isFirst ? 13 : 10, height: isFirst ? 13 : 10, borderRadius: '50%', background: isFirst ? TEAL : BORDER, border: `2px solid ${WHITE}`, flexShrink: 0, zIndex: 1, marginLeft: isFirst ? '-1.5px' : 0, }} />
                        <div style={{ width: 2, flex: 1, background: isLast ? 'transparent' : BORDER }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '12px 0 12px 12px', minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: TEXT3, fontWeight: 500, marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          <span style={{ textTransform: 'capitalize' }}>{item.label}</span>
                          {item.suburb && <><span style={{ color: BORDER }}>·</span><span>{item.suburb}</span></>}
                          {item.phone  && <><span style={{ color: BORDER }}>·</span><span>{item.phone}</span></>}
                        </div>
                      </div>
                      <div style={{ alignSelf: 'center' }}>
                        <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', background: k.bg, color: k.fg }}>
                          {k.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bookings — week strip + month calendar */}
              <div style={card}>
                <div style={{ padding: '13px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Bookings</span>
                  <HeaderToolbar size="sm" items={[{ label: 'View schedule', icon: <AppIcon name="calendar-clock" size={14} />, onClick: () => router.push('/dashboard/schedule') }]} />
                </div>
                <BookingsWidget
                  items={calendarItems}
                  isMobile={isMobile}
                  onDateClick={(date, items) => { setPopupDate(date); setPopupJobs(items) }}
                />
              </div>

            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Unpaid Invoices */}
              <div style={card}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Unpaid Invoices</span>
                    <HeaderToolbar size="sm" items={[{ label: 'View all', icon: <AppIcon name="invoice" size={14} />, onClick: () => router.push('/dashboard/invoices') }]} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 900, color: invoiceStats.outstanding > 0 ? '#DC2626' : TEAL_DARK, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                      ${invoiceStats.outstanding.toLocaleString('en-AU')}
                    </span>
                    {invoiceStats.overdueCount > 0 && (
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: '#FEE2E2', color: '#991B1B' }}>
                        {invoiceStats.overdueCount} overdue
                      </span>
                    )}
                  </div>
                </div>
                {invoiceStats.allInvoices.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: WHITE, border: `1px solid ${BORDER}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: TEXT2 }}>
                      <IconInvoice size={20} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>All clear</div>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: TEXT3, marginTop: '2px' }}>No outstanding invoices</div>
                  </div>
                ) : invoiceStats.allInvoices.map((inv, i) => {
                  const name      = `${inv.customers?.first_name || ''} ${inv.customers?.last_name || ''}`.trim() || 'Customer'
                  const isOverdue = inv.status === 'overdue'
                  const amt       = Math.max(0, Number(inv.total || 0) - Number(inv.amount_paid || 0))
                  return (
                    <div key={inv.id || i} onClick={() => router.push('/dashboard/invoices')}
                      style={{ display: 'grid', gridTemplateColumns: '3px 1fr auto', cursor: 'pointer', borderBottom: `1px solid ${BORDER}`, transition: 'background 0.12s', overflow: 'hidden' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = TEAL_LIGHT)}
                      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = WHITE)}
                    >
                      <div style={{ background: isOverdue ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
                      <div style={{ padding: '10px 12px', minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3, marginTop: '2px', fontWeight: 500 }}>
                          {parseDateLocal(inv.created_at)?.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) || ''}
                        </div>
                      </div>
                      <div style={{ padding: '10px 14px 10px 0', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: isOverdue ? '#991B1B' : TEXT, fontVariantNumeric: 'tabular-nums' }}>${amt.toLocaleString('en-AU')}</div>
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '5px', background: isOverdue ? '#FEE2E2' : '#FEF3C7', color: isOverdue ? '#991B1B' : '#92400E', textAlign: 'center' }}>
                          {isOverdue ? 'Overdue' : 'Sent'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          </div>

          {/* ── Analytics (full width) ── */}
          <div style={{ padding: isMobile ? '16px 14px 0' : '16px 24px 0' }}>
            <AnalyticsCard allJobs={allJobs} allInvoices={allInvoices} isMobile={isMobile} />
          </div>

          {/* ── Quick Actions (full width, bottom) ── */}
          <div style={{ padding: isMobile ? '12px 14px 0' : '16px 24px 0' }}>
            <div style={card}>
              <div style={{ padding: '13px 18px', borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Quick Actions</span>
              </div>
              {([
                { label: 'New Job',       sub: 'Create a new job for a customer',  icon: <IconPlus size={20} />,     onClick: () => router.push('/dashboard/jobs/add') },
                { label: 'New Invoice',   sub: 'Create and send an invoice',       icon: <IconInvoice size={20} />,  onClick: () => router.push('/dashboard/invoices') },
                { label: 'Add Customer',  sub: 'Register a new customer',          icon: <IconUsers size={20} />,    onClick: () => router.push('/dashboard/customers') },
                { label: 'View Schedule', sub: 'Open the full job calendar',       icon: <IconCalendar size={20} />, onClick: () => router.push('/dashboard/schedule') },
              ] as { label: string; sub: string; icon: React.ReactNode; onClick: () => void }[]).map((action, i, arr) => (
                <div
                  key={action.label}
                  onClick={action.onClick}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = '#F8FAFC')}
                  onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = WHITE)}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: WHITE, border: `1px solid ${BORDER}`, color: TEXT2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box' }}>
                    {action.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{action.label}</div>
                    <div style={{ fontSize: '11px', color: TEXT3, fontWeight: 500, marginTop: '2px' }}>{action.sub}</div>
                  </div>
                  <div style={{ color: TEXT3, flexShrink: 0 }}><IconChevronRight size={14} /></div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
