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

// Parse a date string safely, always returning a local-midnight Date.
// Handles:
//   - "YYYY-MM-DD"                  → parse directly as local date (no timezone shift)
//   - "YYYY-MM-DDTHH:MM:SS+HH:MM"  → parse via Date() then re-anchor to local calendar day
//   - "YYYY-MM-DDTHH:MM:SSZ"        → same — converts UTC to local then extracts local date
function parseDateLocal(dateStr: string): Date | null {
  if (!dateStr) return null
  // Pure date string with no time component — parse as local midnight directly
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  // Has time/timezone — let the browser parse it (gets UTC right),
  // then re-anchor to the LOCAL calendar day so timezone shifts don't bleed
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

function AnalyticsBarChart({ data, height = 200 }: { data: { label: string; total: number }[]; height?: number }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const yMax = Math.max(...data.map(d => d.total), 1)
  const now = new Date().getMonth()

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <div style={{ width: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height, paddingBottom: 28, flexShrink: 0 }}>
        {[yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0].map((t, i) => (
          <span key={i} style={{ fontSize: '10px', color: TEXT3, fontWeight: 600, lineHeight: 1 }}>
            {t > 999 ? `$${(t / 1000).toFixed(0)}k` : t}
          </span>
        ))}
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
          <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${frac * (height - 28)}px`, height: 1, background: '#F0F4F8', zIndex: 0 }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, paddingBottom: 28, display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
          {data.map((item, i) => {
            const isCurrent = i === now
            const isHov = hovered === i
            const barH = Math.max(4, (item.total / yMax) * (height - 36))
            return (
              <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                {isHov && (
                  <div style={{ position: 'absolute', bottom: barH + 10, left: '50%', transform: 'translateX(-50%)', background: '#0B1220', color: WHITE, padding: '7px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.22)' }}>
                    <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>{item.label}, {new Date().getFullYear()}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>Jobs</span>
                      <span style={{ color: TEAL_LIGHT }}>{item.total}</span>
                    </div>
                  </div>
                )}
                <div style={{ width: '100%', height: barH, borderRadius: '6px 6px 3px 3px', background: isCurrent ? TEAL : isHov ? '#CBD5E1' : 'repeating-linear-gradient(45deg, #E2E8F0, #E2E8F0 3px, #EDF2F7 3px, #EDF2F7 6px)', transition: 'all 0.15s ease', border: `1px solid ${isCurrent ? 'transparent' : '#D9E2EC'}`, cursor: 'default' }} />
              </div>
            )
          })}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', gap: '4px', height: 24 }}>
          {data.map((item, i) => (
            <div key={item.label} style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: i === now ? TEAL_DARK : TEXT3 }}>{item.label}</span>
            </div>
          ))}
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

// ── Job Preview Popup ──────────────────────────────────────────────────────
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
        {/* Header */}
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

        {/* Job list */}
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

        {/* Footer */}
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

  const recentJobsByDate = useMemo(() => {
    const map: Record<string, number> = {}
    jobs.forEach(job => {
      if (!job.created_at) return
      const key = String(job.created_at).slice(0, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return
      map[key] = (map[key] || 0) + 1
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

  function buildMonth(monthDate: Date) {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const mondayStart = (firstDay.getDay() + 6) % 7
    const cells: Array<{ date: Date | null; jobs: any[]; recentCount: number }> = []

    for (let i = 0; i < mondayStart; i++) cells.push({ date: null, jobs: [], recentCount: 0 })
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day)
      const key = toRawKey(year, month, day)
      cells.push({
        date: d,
        jobs: jobsByDate[key] || [],
        recentCount: recentJobsByDate[key] || 0,
      })
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, jobs: [], recentCount: 0 })

    return cells
  }

  function renderDots(count: number, active: boolean) {
    if (count <= 0) return null
    const visible = Math.min(count, 3)

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', minHeight: '8px' }}>
        {Array.from({ length: visible }).map((_, idx) => (
          <span
            key={idx}
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: active ? WHITE : TEAL,
              opacity: active ? 1 : 0.95,
              display: 'block',
            }}
          />
        ))}
        {count > 3 && (
          <span
            style={{
              fontSize: '9px',
              fontWeight: 800,
              color: active ? WHITE : TEAL_DARK,
              lineHeight: 1,
              marginLeft: '1px',
            }}
          >
            +{count - 3}
          </span>
        )}
      </div>
    )
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : monthCount === 1 ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
      {months.map((monthDate, idx) => {
        const cells = buildMonth(monthDate)
        const totalBooked = cells.reduce((sum, c) => sum + c.jobs.length, 0)

        return (
          <div
            key={`${monthDate.getFullYear()}-${monthDate.getMonth()}-${idx}`}
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: '18px',
              overflow: 'hidden',
              background: WHITE,
              boxShadow: '0 8px 28px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div
              style={{
                padding: isMobile ? '14px 14px 10px' : '16px 18px 12px',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                background: WHITE,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: TEAL,
                    boxShadow: `0 0 0 5px ${TEAL_LIGHT}`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em' }}>
                  {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
                </div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT3 }}>{totalBooked} booked</div>
            </div>

            <div style={{ padding: isMobile ? '10px 10px 12px' : '12px 14px 14px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: isMobile ? '4px' : '6px',
                  marginBottom: '8px',
                }}
              >
                {dayNames.map(day => (
                  <div
                    key={day}
                    style={{
                      textAlign: 'center',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#94A3B8',
                      padding: '2px 0 4px',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: isMobile ? '4px' : '6px' }}>
                {cells.map((cell, i) => {
                  if (!cell.date) {
                    return <div key={i} style={{ minHeight: isMobile ? 42 : 50, borderRadius: '12px' }} />
                  }

                  const scheduledCount = cell.jobs.length
                  const recentCount = cell.recentCount
                  const intensity = scheduledCount > 0 ? scheduledCount / maxCount : 0
                  const isClickable = scheduledCount > 0
                  const todayLocal = new Date()
                  const isToday = dateToKey(cell.date) === dateToKey(todayLocal)
                  const isActive = scheduledCount > 0

                  const background = isActive
                    ? `linear-gradient(180deg, rgba(31,158,148,${0.18 + intensity * 0.18}) 0%, rgba(31,158,148,${0.10 + intensity * 0.12}) 100%)`
                    : '#FBFCFE'

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (!isClickable) return
                        onDateClick(cell.date!, cell.jobs)
                      }}
                      title={
                        isClickable
                          ? `${scheduledCount} job${scheduledCount !== 1 ? 's' : ''} on ${cell.date.toLocaleDateString('en-AU')}`
                          : cell.date.toLocaleDateString('en-AU')
                      }
                      style={{
                        minHeight: isMobile ? 42 : 50,
                        borderRadius: '12px',
                        border: isToday
                          ? `1.5px solid ${TEAL}`
                          : isActive
                            ? '1px solid rgba(31,158,148,0.18)'
                            : `1px solid ${BORDER}`,
                        background,
                        padding: isMobile ? '6px 4px 5px' : '7px 5px 6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: isClickable ? 'pointer' : 'default',
                        textAlign: 'center',
                        outline: 'none',
                        fontFamily: FONT,
                        transition: 'transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease, background 0.14s ease',
                        boxShadow: isToday ? '0 0 0 4px rgba(31,158,148,0.10)' : 'none',
                        position: 'relative',
                      }}
                      onMouseEnter={e => {
                        if (!isClickable) return
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 10px 24px rgba(31,158,148,0.16)'
                        e.currentTarget.style.borderColor = 'rgba(31,158,148,0.38)'
                      }}
                      onMouseLeave={e => {
                        if (!isClickable) return
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = isToday ? '0 0 0 4px rgba(31,158,148,0.10)' : 'none'
                        e.currentTarget.style.borderColor = isToday ? TEAL : 'rgba(31,158,148,0.18)'
                      }}
                    >
                      <div
                        style={{
                          fontSize: isMobile ? '11px' : '12px',
                          fontWeight: 900,
                          color: TEXT,
                          lineHeight: 1,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {cell.date.getDate()}
                      </div>

                      {renderDots(scheduledCount, false)}

                      {recentCount > 0 ? (
                        <div
                          style={{
                            fontSize: '8px',
                            fontWeight: 800,
                            color: '#94A3B8',
                            lineHeight: 1,
                            minHeight: '8px',
                          }}
                        >
                          +{recentCount} new
                        </div>
                      ) : (
                        <div style={{ minHeight: '8px' }} />
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
  const [dateRange, setDateRange] = useState('Last Year')
  const [visitMonths, setVisitMonths] = useState('1')

  // Popup state
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

  const monthlyJobsData = useMemo(() => {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const base = names.map(label => ({ label, total: 0 }))
    allJobs.forEach(job => {
      if (!job.created_at) return
      const d = parseDateLocal(job.created_at)
      if (d && !isNaN(d.getTime())) base[d.getMonth()].total += 1
    })
    return base
  }, [allJobs])

  const monthlyRevenueData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({ label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i], total: 0 }))
    allInvoices.forEach(inv => {
      if (!inv.created_at || inv.status !== 'paid') return
      const d = parseDateLocal(inv.created_at)
      if (d && !isNaN(d.getTime())) months[d.getMonth()].total += Number(inv.total || 0)
    })
    return months
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

  const onTimeScore = stats.units > 0 ? Math.round(((stats.units - stats.overdue) / stats.units) * 100) : 0

  const currentMonthScore = useMemo(() => {
    const currentMonthJobsOnly = allJobs.filter(job => isBetween(job.created_at, startCurrentMonth, startNextMonth))
    if (!currentMonthJobsOnly.length) return onTimeScore
    const currentMonthOverdue = currentMonthJobsOnly.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length
    return Math.round(((currentMonthJobsOnly.length - currentMonthOverdue) / currentMonthJobsOnly.length) * 100)
  }, [allJobs, onTimeScore])

  const prevMonthScore = useMemo(() => {
    const prevMonthJobsOnly = allJobs.filter(job => isBetween(job.created_at, startPrevMonth, startCurrentMonth))
    if (!prevMonthJobsOnly.length) return currentMonthScore
    const prevMonthOverdue = prevMonthJobsOnly.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length
    return Math.round(((prevMonthJobsOnly.length - prevMonthOverdue) / prevMonthJobsOnly.length) * 100)
  }, [allJobs, currentMonthScore])

  const activeSalesDelta = pctChange(activeSalesCurrent, activeSalesPrev)
  const revenueDelta = pctChange(revenueCurrent30, revenuePrev30)
  const jobsDelta = pctChange(jobsCurrentMonth, jobsPrevMonth)
  const convDelta = currentConv - prevConv
  const scoreDelta = currentMonthScore - prevMonthScore

  const jobsSpark = monthlyJobsData.map(m => m.total)
  const revenueSpark = monthlyRevenueData.map(m => m.total)

  const visitMax = useMemo(() => {
    const counts: Record<string, number> = {}
    allJobs.forEach(job => {
      if (!job.next_service_date) return
      const d = parseDateLocal(job.next_service_date)
      if (!d || isNaN(d.getTime())) return
      const key = dateToKey(d)
      counts[key] = (counts[key] || 0) + 1
    })
    return Math.max(0, ...Object.values(counts))
  }, [allJobs])

  const revenueBreakdown = useMemo(() => {
    const b: Record<string, number> = { Service: 0, Installation: 0, Quote: 0, Repair: 0 }
    const colors: Record<string, string> = { Service: TEAL, Installation: TEAL_DARK, Quote: '#94A3B8', Repair: '#CBD5E1' }
    allInvoices.forEach(inv => {
      const relatedJob = allJobs.find(job => job.id === inv.job_id)
      const t = String(relatedJob?.job_type || '').toLowerCase()
      if (t.includes('service')) b.Service += Number(inv.total || 0)
      else if (t.includes('install')) b.Installation += Number(inv.total || 0)
      else if (t.includes('quote')) b.Quote += Number(inv.total || 0)
      else if (t.includes('repair')) b.Repair += Number(inv.total || 0)
      else b.Service += Number(inv.total || 0)
    })
    return Object.entries(b).filter(([, value]) => value > 0).map(([label, value]) => ({ label, value, color: colors[label] }))
  }, [allInvoices, allJobs])

  const revenueBreakdownSafe = revenueBreakdown.length ? revenueBreakdown : [{ label: 'Service', value: 0, color: TEAL }]

  const statCards = [
    { label: 'Active Sales', value: `$${activeSalesCurrent.toLocaleString('en-AU')}`, delta: formatDelta(activeSalesDelta), up: activeSalesDelta >= 0, color: TEAL, sparkType: 'bar' as const, onClick: () => router.push('/dashboard/invoices') },
    { label: 'Product Revenue', value: `$${revenueCurrent30.toLocaleString('en-AU')}`, delta: formatDelta(revenueDelta), up: revenueDelta >= 0, color: '#43A047', sparkType: 'line' as const, onClick: () => router.push('/dashboard/revenue') },
    { label: 'Product Sold', value: `${jobsCurrentMonth}`, delta: formatDelta(jobsDelta), up: jobsDelta >= 0, color: '#9C27B0', sparkType: 'donut' as const, donutValue: stats.units > 0 ? Math.round((jobsCurrentMonth / Math.max(stats.units, 1)) * 100) : 0, onClick: () => router.push('/dashboard/jobs') },
    { label: 'Conversion Rate', value: `${convRate}%`, delta: `${convDelta >= 0 ? '+' : ''}${convDelta}%`, up: convDelta >= 0, color: '#FF7043', sparkType: 'bar' as const, onClick: () => router.push('/dashboard/invoices') },
  ]

  const card: React.CSSProperties = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', overflow: 'hidden' }
  const cardP: React.CSSProperties = { ...card, padding: '20px' }

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

      {/* Job Day Popup */}
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
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: isMobile ? '14px' : '16px', padding: isMobile ? '16px' : '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: isMobile ? '14px' : '0', flexDirection: isMobile ? 'column' : 'row' }}>

              {/* Title */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <h1 style={{ fontSize: isMobile ? '26px' : '34px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>
                  Dashboard
                </h1>
              </div>

              {/* Desktop: divider + quick stats */}
              {!isMobile && (
                <>
                  <div style={{ width: 1, height: 44, background: BORDER, margin: '0 24px', flexShrink: 0 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>Customers</div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{stats.customers}</div>
                    </div>
                    <div style={{ width: 1, height: 32, background: BORDER }} />
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>Scheduled</div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{scheduledCount}</div>
                    </div>
                    <div style={{ width: 1, height: 32, background: BORDER }} />
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>Overdue</div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: stats.overdue > 0 ? '#991B1B' : TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{stats.overdue}</div>
                    </div>
                  </div>
                </>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'stretch' : 'flex-end', marginLeft: isMobile ? 0 : '24px', flexShrink: 0 }}>
                <button
                  onClick={() => router.push('/dashboard/jobs')}
                  style={{ height: '36px', padding: isMobile ? '0 12px' : '0 14px', border: `1px solid ${BORDER}`, borderRadius: '9px', fontSize: '12px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', flex: isMobile ? 1 : '0 0 auto', transition: 'border-color 0.12s, color 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = TEXT; e.currentTarget.style.color = TEXT }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT2 }}
                >
                  <IconPlus size={12} /> Add Job
                </button>
                <button
                  onClick={() => router.push('/dashboard/jobs')}
                  style={{ height: '36px', padding: isMobile ? '0 12px' : '0 14px', border: `1px solid ${BORDER}`, borderRadius: '9px', fontSize: '12px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', flex: isMobile ? 1 : '0 0 auto', transition: 'border-color 0.12s, color 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = TEXT; e.currentTarget.style.color = TEXT }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT2 }}
                >
                  <IconCalendar size={12} /> Schedule
                </button>
                <button
                  onClick={() => router.push('/dashboard/revenue')}
                  style={{ height: '36px', padding: isMobile ? '0 14px' : '0 16px', border: `1px solid ${TEXT}`, borderRadius: '9px', fontSize: '12px', fontWeight: 700, color: WHITE, background: TEXT, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: isMobile ? 1 : '0 0 auto', transition: 'opacity 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.82' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  <IconDownload size={12} /> Revenue
                </button>
              </div>
            </div>
          </div>
          {/* ── END HEADER ── */}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
            {statCards.map((sc) => (
              <div key={sc.label} onClick={sc.onClick} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '18px 20px 0', cursor: 'pointer', transition: 'box-shadow 0.15s', overflow: 'hidden' }} onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)')} onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
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
                      <span style={{ fontSize: '10px', color: TEXT3, fontWeight: 500 }}>vs previous period</span>
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

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: '16px', alignItems: 'start' }}>
            <div style={cardP}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Sales Performance</span>
                  <span style={{ color: TEXT3, opacity: 0.5 }}><IconInfo size={13} /></span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                {(() => {
                  const score = onTimeScore
                  const size = 200
                  const r = 78
                  const circ = Math.PI * r
                  const filled = (score / 100) * circ
                  return (
                    <div style={{ position: 'relative', width: size, height: 106 }}>
                      <svg width={size} height={106} viewBox={`0 0 ${size} 106`} style={{ overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={TEAL_DARK} />
                            <stop offset="100%" stopColor={TEAL} />
                          </linearGradient>
                        </defs>
                        <path d={`M ${size / 2 - r} 102 A ${r} ${r} 0 0 1 ${size / 2 + r} 102`} fill="none" stroke="#F1F5F9" strokeWidth={16} strokeLinecap="round" />
                        <path d={`M ${size / 2 - r} 102 A ${r} ${r} 0 0 1 ${size / 2 + r} 102`} fill="none" stroke="url(#gaugeGrad)" strokeWidth={16} strokeLinecap="round" strokeDasharray={`${filled} ${circ}`} style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                      </svg>
                      <div style={{ position: 'absolute', bottom: 2, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <div style={{ fontSize: '44px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', lineHeight: 1 }}>{score}</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: scoreDelta >= 0 ? TEAL : '#C0392B' }}>{scoreDelta >= 0 ? '+' : ''}{scoreDelta}</div>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>of 100 points</div>
                      </div>
                    </div>
                  )
                })()}
              </div>
              <div style={{ padding: '12px 14px', borderRadius: '12px', background: TEAL_LIGHT, marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL }} />
                  <div style={{ fontSize: '12px', fontWeight: 800, color: TEAL_DARK }}>{stats.overdue === 0 ? 'No overdue jobs right now' : `${stats.overdue} job${stats.overdue !== 1 ? 's' : ''} need attention`}</div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 500, color: TEAL_DARK, lineHeight: 1.5, paddingLeft: '12px' }}>{stats.overdue === 0 ? 'Your current schedule is clear based on the dates stored in the CRM.' : 'Review overdue jobs and reschedule as soon as possible.'}</div>
              </div>
              <button onClick={() => router.push('/dashboard/jobs')} style={{ width: '100%', height: '36px', background: 'transparent', color: TEXT, border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = TEAL; (e.currentTarget as HTMLButtonElement).style.color = WHITE; (e.currentTarget as HTMLButtonElement).style.borderColor = TEAL }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = TEXT; (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER }}>
                {stats.overdue > 0 ? 'Improve Your Score →' : 'View Schedule →'}
              </button>
            </div>

            <div style={card}>
              <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Analytics</span>
                  <span style={{ color: TEXT3, opacity: 0.5 }}><IconInfo size={13} /></span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ height: '30px', padding: '0 8px', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, outline: 'none' }}>
                    {['Last Year', 'This Year', 'Last 6 Months', 'Last 3 Months'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <button style={{ height: '30px', width: '30px', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '14px', color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>⤢</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px', padding: '12px 20px', borderBottom: `1px solid ${BORDER}` }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginBottom: '2px' }}>Revenue</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>${revenueCurrent30.toLocaleString('en-AU')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginBottom: '2px' }}>Conv. Rate</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{convRate}%</div>
                </div>
              </div>
              <div style={{ padding: '16px 20px 14px' }}>
                <AnalyticsBarChart data={monthlyJobsData} height={200} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '16px', alignItems: 'start' }}>
            <div style={card}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Visit by Time</span>
                    <span style={{ color: TEXT3, opacity: 0.5 }}><IconInfo size={13} /></span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>Click a booked date to open its jobs. Service dates stay matched to your job bookings.</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <select value={visitMonths} onChange={e => setVisitMonths(e.target.value)} style={{ height: '30px', padding: '0 8px', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, outline: 'none' }}>
                    <option value="1">Current month</option>
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                  </select>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: TEXT }}>{scheduledCount.toLocaleString()}</div>
                      <div style={{ fontSize: '10px', color: TEXT3, fontWeight: 600 }}>Booked</div>
                    </div>
                    <div style={{ width: 1, background: BORDER }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: TEXT }}>{visitMax}</div>
                      <div style={{ fontSize: '10px', color: TEXT3, fontWeight: 600 }}>Peak day</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 20px 10px' }}>
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
              <div style={{ padding: '0 20px 16px', fontSize: '11px', color: TEXT3, fontWeight: 500 }}>
                Booked dates are pulled from next_service_date, so the calendar stays aligned with the jobs table. New jobs are shown separately.
              </div>
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