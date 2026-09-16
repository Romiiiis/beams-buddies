'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { useBusiness } from '@/lib/useBusiness'

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
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
}
function IconCalendar({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9"/><path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconDownload({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconArrow({ size = 11 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconChevronLeft({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
function IconInvoice({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M7 3h10a2 2 0 0 1 2 2v16l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconUsers({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.9"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconBarChart({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
}
function IconClipboard({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.9"/><path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}

// ── Constants ──────────────────────────────────────────────────────────────

const MONTH_NAMES      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_NAMES_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS       = ['SUN','MON','TUE','WED','THU','FRI','SAT']
const DAY_LABELS_SHORT = ['S','M','T','W','T','F','S']

// ── Job Day Popup ──────────────────────────────────────────────────────────

function JobDayPopup({ date, jobs, onClose, onJobClick }: {
  date: Date; jobs: any[]; onClose: () => void; onJobClick: (job: any) => void
}) {
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
          {jobs.map(job => {
            const name     = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
            const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
            const jobLabel = (job.job_type || job.equipment_type || 'Service').replace(/_/g, ' ')
            return (
              <div key={job.id} onClick={() => onJobClick(job)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }} onMouseEnter={e => (e.currentTarget.style.background = TEAL_LIGHT)} onMouseLeave={e => (e.currentTarget.style.background = WHITE)}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: TEAL_LIGHT, color: TEAL_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>{initials || '?'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{name}</div>
                  <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px', textTransform: 'capitalize' }}>{jobLabel}{job.customers?.suburb ? ` · ${job.customers.suburb}` : ''}</div>
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

// ── Bookings Widget (week strip + month calendar) ──────────────────────────

function BookingsWidget({ allJobs, isMobile, onDateClick }: {
  allJobs: any[]
  isMobile: boolean
  onDateClick: (date: Date, jobs: any[]) => void
}) {
  const todayDate  = useMemo(() => startOfDay(new Date()), [])
  const todayKey   = useMemo(() => toYMD(todayDate), [todayDate])
  const [viewYear,  setViewYear]  = useState(todayDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth())

  const jobsByDate = useMemo(() => {
    const map: Record<string, any[]> = {}
    allJobs.forEach(job => {
      const d = parseDateLocal(job.next_service_date)
      if (!d) return
      const key = toYMD(d)
      if (!map[key]) map[key] = []
      map[key].push(job)
    })
    return map
  }, [allJobs])

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
          <div style={{ width: 30, height: 30, borderRadius: '8px', background: TEAL_LIGHT, color: TEAL_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconBarChart size={14} />
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
  const [popupJobs,    setPopupJobs]    = useState<any[]>([])
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
      if (!userData) { setLoading(false); return }

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

      const overdue       = jobs.filter(j => { const d = parseDateLocal(j.next_service_date); return d && startOfDay(d).getTime() < todayMs })
      const jobsToday     = jobs.filter(j => String(j.next_service_date || '').slice(0, 10) === todayKey).length
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

  const scheduledCount = useMemo(() => {
    const todayMs = startOfDay(new Date()).getTime()
    return allJobs.filter(j => { const d = parseDateLocal(j.next_service_date); return d && startOfDay(d).getTime() >= todayMs }).length
  }, [allJobs])

  const todayKey  = toYMD(startOfDay(new Date()))
  const todayJobs = useMemo(() => allJobs.filter(j => String(j.next_service_date || '').slice(0, 10) === todayKey), [allJobs, todayKey])

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
      <Sidebar active="/dashboard" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>Loading dashboard...</div>
    </div>
  )

  // Stat chips (row 1)
  const statChips = [
    { label: 'Total Customers', value: stats.customers,  danger: false,              onClick: () => router.push('/dashboard/customers') },
    { label: 'Upcoming Jobs',   value: scheduledCount,   danger: false,              onClick: () => router.push('/dashboard/jobs') },
    { label: 'Jobs Today',      value: stats.jobsToday,  danger: false,              onClick: () => router.push('/dashboard/schedule') },
    { label: 'Overdue Jobs',    value: stats.overdue,    danger: stats.overdue > 0,  onClick: () => router.push('/dashboard/jobs') },
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

  const btnOutline: React.CSSProperties = {
    height: '34px', padding: '0 14px', border: `1px solid ${BORDER}`, borderRadius: '9px',
    fontSize: '12px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer',
    fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' as const,
  }
  const btnDark: React.CSSProperties = {
    ...btnOutline, background: TEAL, border: 'none', color: WHITE,
  }

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
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: isMobile ? 0 : '0', paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '40px' }}>

          {/* ── Header ── */}
          <div style={{ padding: isMobile ? '16px 14px 14px' : '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: BG, borderBottom: `1px solid ${BORDER}`, gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '14px' }}>
              <div style={{ width: isMobile ? 42 : 48, height: isMobile ? 42 : 48, borderRadius: '13px', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(31,158,148,0.35)', overflow: 'hidden' }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Business logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: isMobile ? '17px' : '20px', fontWeight: 900, color: WHITE, letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {userName ? userName[0].toUpperCase() : '?'}
                  </span>
                )}
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>
                  {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <h1 style={{ fontSize: isMobile ? '19px' : '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0, lineHeight: 1.1 }}>
                  {getGreeting()}{userName ? `, ${userName}` : ''}
                </h1>
              </div>
            </div>
            {!isMobile && (
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => router.push('/dashboard/jobs')} style={btnOutline}><IconPlus size={12} /> Add Job</button>
                <button onClick={() => router.push('/dashboard/jobs')} style={btnOutline}><IconCalendar size={12} /> Schedule</button>
                <button onClick={() => router.push('/dashboard/revenue')} style={btnDark}><IconDownload size={12} /> Revenue</button>
              </div>
            )}
            {isMobile && (
              <button onClick={() => router.push('/dashboard/jobs')} style={{ ...btnDark, flexShrink: 0 }}><IconPlus size={12} /> Add Job</button>
            )}
          </div>

          {/* ── Row 1: Stat chips ── */}
          <div style={{ padding: isMobile ? '10px 14px' : '12px 24px', background: BG, borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', overflow: 'hidden' }}>
              {statChips.map((chip, i) => (
                <div
                  key={chip.label}
                  onClick={chip.onClick}
                  style={{ padding: isMobile ? '11px 10px' : '14px 20px', cursor: 'pointer', borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none', transition: 'background 0.12s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = TEAL_LIGHT)}
                  onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = WHITE)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                      {chip.value}
                    </div>
                    {chip.danger && chip.value > 0 && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', flexShrink: 0, marginBottom: 2, display: 'inline-block' }} />
                    )}
                  </div>
                  <div style={{ fontSize: isMobile ? '9px' : '11px', fontWeight: 600, color: TEXT3, marginTop: '4px', lineHeight: 1.2 }}>
                    {chip.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Row 2: Metric cards ── */}
          <div style={{ padding: isMobile ? '12px 14px' : '0 24px 16px', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
            {metricCards.map(mc => (
              <div
                key={mc.label}
                onClick={mc.onClick}
                style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: isMobile ? '14px 14px 12px' : '18px 18px 14px', cursor: 'pointer', transition: 'box-shadow 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: `3px solid ${TEAL}` }}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 5px 16px rgba(0,0,0,0.09)')}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)')}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: TEAL, color: WHITE, padding: '4px 10px 4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.03em' }}>
                      <span style={{ width: 7, height: 7, background: 'rgba(255,255,255,0.8)', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite' }} />
                      TODAY
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>Schedule</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: TEXT3 }}>{todayJobs.length} job{todayJobs.length !== 1 ? 's' : ''}</span>
                    <button onClick={() => router.push('/dashboard/schedule')} style={{ fontSize: '11px', fontWeight: 700, color: TEAL, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT, padding: 0 }}>
                      Full calendar →
                    </button>
                  </div>
                </div>

                <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.25} }`}</style>

                {todayJobs.length === 0 ? (
                  <div style={{ padding: '28px', textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: TEAL_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: TEAL_DARK }}>
                      <IconClipboard size={18} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT2 }}>No jobs scheduled today</div>
                    <button onClick={() => router.push('/dashboard/jobs')} style={{ marginTop: '8px', color: TEAL, fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: '11px' }}>
                      + Add a job
                    </button>
                  </div>
                ) : todayJobs.map((job, i) => {
                  const name     = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                  const jobLabel = (job.job_type || job.equipment_type || 'Service').replace(/_/g, ' ')
                  const timeStr  = job.start_time || job.time || null
                  const isFirst  = i === 0
                  const isLast   = i === todayJobs.length - 1
                  return (
                    <div
                      key={job.id}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{ display: 'grid', gridTemplateColumns: timeStr ? '64px 18px 1fr auto' : '18px 1fr auto', alignItems: 'stretch', padding: '0 18px', cursor: 'pointer', minHeight: '64px', borderBottom: isLast ? 'none' : `1px solid ${BORDER}`, transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = TEAL_LIGHT)}
                      onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                    >
                      {timeStr && (
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right', padding: '12px 8px 12px 0' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{timeStr.split(' ')[0]}</div>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, marginTop: '2px', letterSpacing: '0.04em' }}>{timeStr.split(' ')[1] || ''}</div>
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 18 }}>
                        <div style={{ width: 2, flex: 1, background: isFirst ? 'transparent' : BORDER }} />
                        <div style={{ width: isFirst ? 13 : 10, height: isFirst ? 13 : 10, borderRadius: '50%', background: isFirst ? TEAL : BORDER, border: `2px solid ${WHITE}`, flexShrink: 0, zIndex: 1, marginLeft: isFirst ? '-1.5px' : 0, boxShadow: isFirst ? `0 0 0 4px ${TEAL_LIGHT}` : 'none' }} />
                        <div style={{ width: 2, flex: 1, background: isLast ? 'transparent' : BORDER }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '12px 0 12px 12px', minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                        <div style={{ fontSize: '11px', color: TEXT3, fontWeight: 500, marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          <span style={{ textTransform: 'capitalize' }}>{jobLabel}</span>
                          {job.customers?.suburb && <><span style={{ color: BORDER }}>·</span><span>{job.customers.suburb}</span></>}
                          {job.customers?.phone  && <><span style={{ color: BORDER }}>·</span><span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '10px' }}>{job.customers.phone}</span></>}
                        </div>
                      </div>
                      <div style={{ alignSelf: 'center' }}>
                        <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', background: isFirst ? TEAL_LIGHT : BORDER, color: isFirst ? TEAL_DARK : TEXT3 }}>
                          {isFirst ? 'Next up' : 'Scheduled'}
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
                  <button onClick={() => router.push('/dashboard/schedule')} style={{ fontSize: '11px', fontWeight: 700, color: TEAL, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT, padding: 0 }}>
                    View schedule →
                  </button>
                </div>
                <BookingsWidget
                  allJobs={allJobs}
                  isMobile={isMobile}
                  onDateClick={(date, jobs) => { setPopupDate(date); setPopupJobs(jobs) }}
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
                    <button onClick={() => router.push('/dashboard/invoices')} style={{ height: '28px', padding: '0 10px', background: TEAL, border: 'none', borderRadius: '8px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: WHITE, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      View all <IconArrow size={9} />
                    </button>
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
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: TEAL_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: TEAL_DARK }}>
                      <IconInvoice size={16} />
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
                { label: 'New Job',       sub: 'Create a new job for a customer',  icon: <IconPlus size={16} />,     onClick: () => router.push('/dashboard/jobs/add') },
                { label: 'New Invoice',   sub: 'Create and send an invoice',       icon: <IconInvoice size={16} />,  onClick: () => router.push('/dashboard/invoices') },
                { label: 'Add Customer',  sub: 'Register a new customer',          icon: <IconUsers size={16} />,    onClick: () => router.push('/dashboard/customers') },
                { label: 'View Schedule', sub: 'Open the full job calendar',       icon: <IconCalendar size={16} />, onClick: () => router.push('/dashboard/schedule') },
              ] as { label: string; sub: string; icon: React.ReactNode; onClick: () => void }[]).map((action, i, arr) => (
                <div
                  key={action.label}
                  onClick={action.onClick}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = TEAL_LIGHT)}
                  onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = WHITE)}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: TEAL_LIGHT, color: TEAL_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
