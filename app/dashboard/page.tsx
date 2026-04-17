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

// ── Icons ──────────────────────────────────────────────────────────────────
function IconSpark({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/></svg>
}
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
function IconUsers({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.9"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconBriefcase({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.9"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 12v4M10 14h4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconDollar({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconPercent({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M19 5L5 19M9 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM20 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconFilter({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
  const max = Math.max(...data, 1)
  const count = data.length
  const barW = Math.floor((width - (count - 1) * 2) / count)
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {data.map((v, i) => {
        const h = Math.max(4, (v / max) * (height - 2))
        const x = i * (barW + 2)
        const opacity = 0.3 + (i / (count - 1)) * 0.7
        return (
          <rect key={i} x={x} y={height - h} width={barW} height={h} rx="3"
            fill={color} opacity={i === count - 1 ? 1 : opacity} />
        )
      })}
    </svg>
  )
}

// ── Mini line sparkline ────────────────────────────────────────────────────
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

// ── Donut sparkline (for stat card) ───────────────────────────────────────
function DonutSparkle({ value, color, size = 44 }: { value: number; color: string; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const filled = (Math.min(value, 100) / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
    </svg>
  )
}

// ── Analytics bar chart ────────────────────────────────────────────────────
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
              <div
                key={item.label}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {isHov && item.total > 0 && (
                  <div style={{
                    position: 'absolute', bottom: barH + 10, left: '50%', transform: 'translateX(-50%)',
                    background: '#0B1220', color: WHITE, padding: '7px 10px', borderRadius: '10px',
                    fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
                  }}>
                    <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>{item.label}, {new Date().getFullYear()}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>Jobs</span>
                      <span style={{ color: TEAL_LIGHT }}>{item.total}</span>
                    </div>
                  </div>
                )}
                <div style={{
                  width: '100%',
                  height: barH,
                  borderRadius: '6px 6px 3px 3px',
                  background: isCurrent
                    ? `linear-gradient(180deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`
                    : isHov
                      ? '#CBD5E1'
                      : 'repeating-linear-gradient(45deg, #E2E8F0, #E2E8F0 3px, #EDF2F7 3px, #EDF2F7 6px)',
                  transition: 'all 0.15s ease',
                  boxShadow: isCurrent ? `0 4px 18px ${TEAL}44` : 'none',
                  border: `1px solid ${isCurrent ? 'transparent' : '#D9E2EC'}`,
                  cursor: 'default',
                }} />
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

// ── Full donut chart ───────────────────────────────────────────────────────
function DonutChart({ segments, size = 130, thickness = 22 }: { segments: { label: string; value: number; color: string }[]; size?: number; thickness?: number }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const cx = size / 2, cy = size / 2
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
          <circle
            key={arc.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={hovered === arc.label ? thickness + 4 : thickness}
            strokeDasharray={`${arc.sw} ${circ}`}
            strokeDashoffset={-arc.s}
            strokeLinecap="butt"
            style={{ transition: 'all 0.18s', opacity: hovered && hovered !== arc.label ? 0.3 : 1, cursor: 'pointer' }}
            onMouseEnter={() => setHovered(arc.label)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: '8px', fontWeight: 700, color: TEXT3, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 1 }}>
          {hov ? hov.label : 'Total'}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {hov ? `${Math.round((hov.value / total) * 100)}%` : `${Math.round((total / 1000) * 10) / 10}k`}
        </div>
      </div>
    </div>
  )
}

// ── Visit heatmap using REAL scheduled dates ───────────────────────────────
function VisitByTimeGrid({ jobs }: { jobs: any[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const rows = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']

  const grid = useMemo(() => {
    const next = Array.from({ length: 5 }, () => Array.from({ length: 7 }, () => 0))

    jobs.forEach(job => {
      if (!job.next_service_date) return
      const d = new Date(job.next_service_date)
      if (isNaN(d.getTime())) return

      const dateNum = d.getDate()
      const row = Math.min(4, Math.floor((dateNum - 1) / 7))

      const jsDay = d.getDay()
      const col = jsDay === 0 ? 6 : jsDay - 1

      next[row][col] += 1
    })

    return next
  }, [jobs])

  const maxVal = Math.max(...grid.flat(), 1)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', gap: '6px', alignItems: 'center' }}>
        <div />
        {days.map(d => (
          <div key={d} style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, textAlign: 'center' }}>{d}</div>
        ))}
        {rows.map((rowLabel, rowIndex) => (
          <React.Fragment key={rowLabel}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3 }}>{rowLabel}</div>
            {days.map((_, colIndex) => {
              const v = grid[rowIndex][colIndex]
              const intensity = v / maxVal
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  title={`${v} scheduled job${v !== 1 ? 's' : ''}`}
                  style={{
                    height: 30,
                    borderRadius: 10,
                    border: `1px solid ${v > 0 ? 'rgba(31,158,148,0.12)' : BORDER}`,
                    background: v > 0 ? `rgba(31,158,148,${0.12 + intensity * 0.78})` : '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 800,
                    color: v > 0 ? WHITE : TEXT3,
                  }}
                >
                  {v > 0 ? v : ''}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
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

export default function DashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('Last Year')

  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0, jobsToday: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState({ collected: 0, outstanding: 0, paidCount: 0, overdueCount: 0, allInvoices: [] as any[] })
  const [allJobs, setAllJobs] = useState<any[]>([])

  function startOfDay(date: Date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }

  function getDays(d: string) {
    const today = startOfDay(new Date()).getTime()
    const target = startOfDay(new Date(d)).getTime()
    return Math.floor((target - today) / (1000 * 60 * 60 * 24))
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
      const overdue = jobs.filter(j => j.next_service_date && startOfDay(new Date(j.next_service_date)) < today)
      const jobsThisMonth = jobs.filter(j => {
        if (!j.created_at) return false
        const d = new Date(j.created_at)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      }).length
      const jobsToday = jobs.filter(j => {
        if (!j.next_service_date) return false
        return startOfDay(new Date(j.next_service_date)).getTime() === today.getTime()
      }).length

      setStats({ customers: customersRes.data?.length || 0, units: jobs.length, overdue: overdue.length, jobsThisMonth, jobsToday })
      setAllJobs(jobs)
      setUpcoming(jobs.filter(j => j.next_service_date && startOfDay(new Date(j.next_service_date)) >= today).slice(0, 5))
      setRecent([...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5))
      setInvoiceStats({
        collected: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total || 0), 0),
        outstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0),
        paidCount: invoices.filter(i => i.status === 'paid').length,
        overdueCount: invoices.filter(i => i.status === 'overdue').length,
        allInvoices: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').slice(0, 4),
      })
      setLoading(false)
    }
    load()
  }, [router])

  const monthlyData = useMemo(() => {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const base = names.map(label => ({ label, total: 0 }))
    allJobs.forEach(job => {
      if (!job.created_at) return
      const d = new Date(job.created_at)
      if (!isNaN(d.getTime())) base[d.getMonth()].total += 1
    })
    return base
  }, [allJobs])

  const sparkData = monthlyData.map(m => m.total)
  const sparkFallback = [1, 2, 1, 3, 2, 4, 3, 5, 4, 3, 5, 6]

  const dueSoonCount = useMemo(() => allJobs.filter(j => {
    if (!j.next_service_date) return false
    const d = getDays(j.next_service_date)
    return d >= 0 && d <= 7
  }).length, [allJobs])

  const scheduledCount = useMemo(() => allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) >= 0).length, [allJobs])
  const completedCount = useMemo(() => allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length, [allJobs])

  const visitMax = useMemo(() => {
    const counts: Record<string, number> = {}
    allJobs.forEach(job => {
      if (!job.next_service_date) return
      const d = new Date(job.next_service_date)
      if (isNaN(d.getTime())) return
      const key = `${d.getFullYear()}-${d.getMonth()}-${Math.floor((d.getDate() - 1) / 7)}-${d.getDay()}`
      counts[key] = (counts[key] || 0) + 1
    })
    return Math.max(0, ...Object.values(counts))
  }, [allJobs])

  const revenueBreakdown = useMemo(() => {
    const b: Record<string, number> = { Service: 0, Installation: 0, Quote: 0, Repair: 0 }
    allJobs.forEach(job => {
      const t = String(job.job_type || '').toLowerCase()
      if (t.includes('service')) b.Service += 1
      else if (t.includes('install')) b.Installation += 1
      else if (t.includes('quote')) b.Quote += 1
      else if (t.includes('repair')) b.Repair += 1
      else b.Service += 1
    })
    if (Object.values(b).every(v => v === 0)) {
      b.Service = 4
      b.Installation = 2
      b.Quote = 1
      b.Repair = 1
    }
    const colors: Record<string, string> = { Service: TEAL, Installation: TEAL_DARK, Quote: '#94A3B8', Repair: '#CBD5E1' }
    const total = Object.values(b).reduce((s, v) => s + v, 0)
    const collected = invoiceStats.collected || 8200
    return Object.entries(b).map(([label, value]) => ({ label, value: Math.round((value / total) * collected), color: colors[label] }))
  }, [allJobs, invoiceStats.collected])

  const convRate = stats.units > 0 ? Math.round((completedCount / stats.units) * 100) : 72

  const statCards = [
    {
      label: 'Active Sales',
      value: `$${stats.jobsThisMonth > 0 ? (stats.jobsThisMonth * 420).toLocaleString() : '0'}`,
      delta: '+12%', up: true,
      color: TEAL,
      sparkType: 'bar' as const,
      onClick: () => router.push('/dashboard/jobs'),
    },
    {
      label: 'Product Revenue',
      value: invoiceStats.collected > 0 ? `$${invoiceStats.collected.toLocaleString('en-AU')}` : '$0',
      delta: '+9%', up: true,
      color: '#43A047',
      sparkType: 'line' as const,
      onClick: () => router.push('/dashboard/revenue'),
    },
    {
      label: 'Product Sold',
      value: stats.customers > 0 ? (stats.customers >= 1000 ? `${(stats.customers / 1000).toFixed(1)}k` : `${stats.customers}`) : '0',
      delta: '+7%', up: true,
      color: '#9C27B0',
      sparkType: 'donut' as const,
      donutValue: stats.customers > 0 ? Math.min(100, Math.round((stats.customers / 100) * 100)) : 60,
      onClick: () => router.push('/dashboard/customers'),
    },
    {
      label: 'Conversion Rate',
      value: `${convRate}%`,
      delta: convRate > 50 ? '+2%' : '-2%',
      up: convRate > 50,
      color: '#FF7043',
      sparkType: 'bar' as const,
      onClick: () => router.push('/dashboard/jobs'),
    },
  ]

  const card: React.CSSProperties = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', overflow: 'hidden' }
  const cardP: React.CSSProperties = { ...card, padding: '20px' }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard" />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: WHITE }}>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '12px' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '40px',
            background: WHITE,
          }}
        >

          {/* ── HEADER ───────────────────────────────────────────────────── */}
          <div
            style={{
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: isMobile ? '14px' : '16px',
              padding: isMobile ? '14px' : '16px 20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: isMobile ? 'stretch' : 'center',
                justifyContent: 'space-between',
                gap: isMobile ? '12px' : '16px',
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h1
                  style={{
                    fontSize: isMobile ? '22px' : '28px',
                    fontWeight: 900,
                    color: TEXT,
                    letterSpacing: '-0.04em',
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  Dashboard
                </h1>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: isMobile ? 'stretch' : 'flex-end',
                }}
              >
                <button
                  onClick={() => router.push('/dashboard/jobs')}
                  style={{
                    height: '36px',
                    padding: isMobile ? '0 10px' : '0 12px',
                    border: `1px solid ${BORDER}`,
                    borderRadius: '10px',
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
                    flex: isMobile ? 1 : '0 0 auto',
                    minWidth: isMobile ? 0 : 'auto',
                  }}
                >
                  <IconPlus size={12} /> Add Widget
                </button>

                <button
                  style={{
                    height: '36px',
                    padding: isMobile ? '0 10px' : '0 12px',
                    border: `1px solid ${BORDER}`,
                    borderRadius: '10px',
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
                    flex: isMobile ? 1 : '0 0 auto',
                    minWidth: isMobile ? 0 : 'auto',
                  }}
                >
                  <IconFilter size={12} /> Filter
                </button>

                <button
                  style={{
                    height: '36px',
                    padding: isMobile ? '0 12px' : '0 14px',
                    border: 'none',
                    borderRadius: '10px',
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
                    flex: isMobile ? 1 : '0 0 auto',
                    minWidth: isMobile ? 0 : 'auto',
                  }}
                >
                  <IconDownload size={12} /> Export
                </button>
              </div>
            </div>
          </div>

          {/* ── ROW 1: 4 STAT CARDS ──────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
            {statCards.map((sc) => (
              <div
                key={sc.label}
                onClick={sc.onClick}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '14px',
                  padding: '18px 20px 0',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: TEXT3 }}>{sc.label}</span>
                  <span style={{ color: TEXT3, opacity: 0.45 }}><IconInfo size={13} /></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1.05 }}>{sc.value}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '2px',
                        padding: '2px 7px', borderRadius: '12px',
                        background: sc.up ? '#E6F7F6' : '#FFF0EE',
                        color: sc.up ? TEAL_DARK : '#C0392B',
                        fontSize: '10px', fontWeight: 800,
                      }}>
                        {sc.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}
                        {sc.delta}
                      </span>
                      <span style={{ fontSize: '10px', color: TEXT3, fontWeight: 500 }}>vs last month</span>
                    </div>
                  </div>

                  {sc.sparkType === 'bar' && (
                    <SparkBars data={sparkData.some(v => v > 0) ? sparkData.slice(-8) : sparkFallback.slice(-8)} color={sc.color} width={58} height={40} />
                  )}
                  {sc.sparkType === 'line' && (
                    <MiniSparkline data={sparkData.some(v => v > 0) ? sparkData : sparkFallback} color={sc.color} width={70} height={40} />
                  )}
                  {sc.sparkType === 'donut' && (
                    <DonutSparkle value={sc.donutValue || 60} color={sc.color} size={46} />
                  )}
                </div>

                <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: '14px', padding: '10px 0', display: 'flex', alignItems: 'center', gap: '5px', color: TEXT3 }}>
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>See Details</span>
                  <IconArrow size={11} />
                </div>
              </div>
            ))}
          </div>

          {/* ── ROW 2: Sales Performance + Analytics ─────────────────────── */}
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
                  const score = stats.units > 0 ? Math.min(100, Math.round((completedCount / Math.max(stats.units, 1)) * 100 + 40)) : 72
                  const size = 200, r = 78
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
                        <path
                          d={`M ${size / 2 - r} 102 A ${r} ${r} 0 0 1 ${size / 2 + r} 102`}
                          fill="none"
                          stroke="url(#gaugeGrad)"
                          strokeWidth={16}
                          strokeLinecap="round"
                          strokeDasharray={`${filled} ${circ}`}
                          style={{ transition: 'stroke-dasharray 0.6s ease' }}
                        />
                      </svg>
                      <div style={{ position: 'absolute', bottom: 2, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <div style={{ fontSize: '44px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', lineHeight: 1 }}>{score}</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: TEAL }}> +1</div>
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
                  <div style={{ fontSize: '12px', fontWeight: 800, color: TEAL_DARK }}>
                    {stats.overdue === 0 ? "You're team is great! ✦" : `${stats.overdue} job${stats.overdue !== 1 ? 's' : ''} need attention`}
                  </div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 500, color: TEAL_DARK, lineHeight: 1.5, paddingLeft: '12px' }}>
                  {stats.overdue === 0
                    ? 'The team is performing well above average, meeting or exceeding targets in several areas.'
                    : 'Review overdue jobs and reschedule as soon as possible.'}
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard/jobs')}
                style={{ width: '100%', height: '36px', background: 'transparent', color: TEXT, border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = TEAL; (e.currentTarget as HTMLButtonElement).style.color = WHITE; (e.currentTarget as HTMLButtonElement).style.borderColor = TEAL }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = TEXT; (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER }}
              >
                {stats.overdue > 0 ? 'Improve Your Score →' : 'View Schedule →'}
              </button>
            </div>

            <div style={card}>
              <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '0' }}>
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

              <div style={{ display: 'flex', gap: '24px', padding: '12px 20px 12px', borderBottom: `1px solid ${BORDER}` }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginBottom: '2px' }}>Revenue</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {invoiceStats.collected > 0 ? `$${(invoiceStats.collected / 1000).toFixed(1)}k` : '$0'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginBottom: '2px' }}>Conv. Rate</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {convRate}%
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 20px 14px' }}>
                <AnalyticsBarChart data={monthlyData} height={200} />
              </div>
            </div>
          </div>

          {/* ── ROW 3: Visit by Time + Total Revenue ─────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '16px', alignItems: 'start' }}>

            <div style={card}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Visit by Time</span>
                    <span style={{ color: TEXT3, opacity: 0.5 }}><IconInfo size={13} /></span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span>0</span>
                    {[0.2, 0.4, 0.65, 0.85, 1].map((o, i) => (
                      <div key={i} style={{ width: 16, height: 8, borderRadius: 8, background: `rgba(31,158,148,${o})` }} />
                    ))}
                    <span>{visitMax}+ jobs</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: TEXT }}>{scheduledCount.toLocaleString()}</div>
                    <div style={{ fontSize: '10px', color: TEXT3, fontWeight: 600 }}>Booked</div>
                  </div>
                  <div style={{ width: 1, background: BORDER }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: TEXT }}>{completedCount.toLocaleString()}</div>
                    <div style={{ fontSize: '10px', color: TEXT3, fontWeight: 600 }}>Done</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 20px 10px' }}>
                <VisitByTimeGrid jobs={allJobs} />
              </div>

              <div style={{ padding: '0 20px 16px', fontSize: '11px', color: TEXT3, fontWeight: 500 }}>
                Based on scheduled service dates grouped by weekday and week of month.
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
                    <div
                      key={job.id}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{ display: 'grid', gridTemplateColumns: isMobile ? 'auto 1fr auto' : 'auto 1fr 100px auto', gap: '12px', alignItems: 'center', padding: '10px 20px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: '10px', background: avBg, color: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>{initials}</div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {job.customers?.suburb && <span>{job.customers.suburb}</span>}
                          {job.customers?.phone && !isMobile && <><span>·</span><IconPhone size={10} /><span>{job.customers.phone}</span></>}
                        </div>
                      </div>
                      {!isMobile && <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : 'No date'}</div>}
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
                  <div style={{ fontSize: '30px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {invoiceStats.collected > 0 ? `$${invoiceStats.collected.toLocaleString('en-AU')}` : '$0'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: TEAL }}>↑ 8.5%</span>
                    <span style={{ fontSize: '10px', color: TEXT3 }}>vs last month</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <DonutChart segments={revenueBreakdown} size={118} thickness={20} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '9px' }}>
                    {revenueBreakdown.map(rb => (
                      <div key={rb.label} onClick={() => router.push('/dashboard/revenue')} style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: rb.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: '11px', fontWeight: 600, color: TEXT2 }}>{rb.label}</div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: TEXT }}>${(rb.value / 1000).toFixed(1)}k</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={card}>
                <div style={{ padding: '13px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Unpaid Invoices</span>
                  <button onClick={() => router.push('/dashboard/invoices')} style={{ height: '26px', padding: '0 8px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '7px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    All <IconArrow size={10} />
                  </button>
                </div>
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: invoiceStats.outstanding > 0 ? '#991B1B' : TEXT, letterSpacing: '-0.04em' }}>
                    ${invoiceStats.outstanding > 0 ? invoiceStats.outstanding.toLocaleString('en-AU') : '0'}
                  </span>
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
                  const amt = Number(inv.total || 0) - Number(inv.amount_paid || 0)
                  return (
                    <div
                      key={inv.id || i}
                      onClick={() => router.push('/dashboard/invoices')}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: '8px', background: isOverdue ? '#FEF2F2' : '#F8FAFC', border: `1px solid ${isOverdue ? '#FECACA' : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isOverdue ? '#B91C1C' : TEXT3 }}>
                        <IconInvoice size={12} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3 }}>{inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: isOverdue ? '#991B1B' : TEXT }}>${amt.toLocaleString('en-AU')}</div>
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: isOverdue ? '#FEE2E2' : '#FEF3C7', color: isOverdue ? '#991B1B' : '#92400E' }}>
                          {isOverdue ? 'Overdue' : 'Sent'}
                        </span>
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
                  const times = ['8:00 AM', '11:00 AM', '2:30 PM', '4:00 PM']
                  const time = times[i % times.length]
                  const isFirst = i === 0
                  return (
                    <div
                      key={job.id}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', background: isFirst ? TEAL_LIGHT : WHITE, transition: 'background 0.12s' }}
                      onMouseEnter={e => { if (!isFirst) e.currentTarget.style.background = '#F8FAFC' }}
                      onMouseLeave={e => { if (!isFirst) e.currentTarget.style.background = isFirst ? TEAL_LIGHT : WHITE }}
                    >
                      <div style={{ width: 4, height: 34, borderRadius: '2px', background: isFirst ? TEAL : BORDER, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: isFirst ? TEAL_DARK : TEXT }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3 }}>
                          {job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : 'No date'} · {time}
                        </div>
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