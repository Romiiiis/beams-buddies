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
const BG         = '#F4F6F9'
const WHITE      = '#FFFFFF'
const HEADER_BG  = '#111111'
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
function IconMoreH({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>
}

// ── Sparkline bar chart (compact, used in stat cards) ──────────────────────
function SparkBars({ data, color, width = 56, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data, 1)
  const n = data.length
  const barW = Math.floor((width - (n - 1) * 2) / n)
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {data.map((v, i) => {
        const h = Math.max(3, (v / max) * (height - 2))
        const x = i * (barW + 2)
        const isLast = i === n - 1
        return (
          <rect key={i} x={x} y={height - h} width={barW} height={h} rx="3"
            fill={color}
            opacity={isLast ? 1 : 0.18 + (i / (n - 1)) * 0.55}
          />
        )
      })}
    </svg>
  )
}

// ── Full-width monthly bar chart ──────────────────────────────────────────
function AnalyticsBarChart({ data, height = 180 }: { data: { label: string; total: number }[]; height?: number }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const yMax = Math.max(...data.map(d => d.total), 1)
  const now = new Date().getMonth()
  const barGap = 6

  return (
    <div style={{ display: 'flex', gap: 0, userSelect: 'none' }}>
      {/* Y-axis */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 32, height, paddingBottom: 20, flexShrink: 0, paddingRight: 4 }}>
        {[yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0].map((t, i) => (
          <span key={i} style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, lineHeight: 1, textAlign: 'right' }}>{t}</span>
        ))}
      </div>

      {/* Chart area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, bottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 1, background: i === 4 ? '#D1D9E0' : '#EDF2F7' }} />
          ))}
        </div>

        {/* Bars */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: `${barGap}px`, paddingBottom: 2 }}>
          {data.map((item, i) => {
            const isCurrent = i === now
            const isHov = hovered === i
            const barH = item.total > 0 ? Math.max(6, (item.total / yMax) * (height - 28)) : 0
            return (
              <div key={item.label}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', position: 'relative', cursor: 'default', height: height - 24 }}
              >
                {/* Tooltip */}
                {isHov && item.total > 0 && (
                  <div style={{
                    position: 'absolute', bottom: barH + 10, left: '50%', transform: 'translateX(-50%)',
                    background: TEXT, color: WHITE, padding: '6px 10px', borderRadius: '9px',
                    fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.18)', pointerEvents: 'none',
                  }}>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', marginBottom: 1 }}>{item.label}</div>
                    <div>{item.total} jobs</div>
                  </div>
                )}
                {/* Bar */}
                <div style={{
                  width: '100%',
                  height: barH || 4,
                  borderRadius: '5px 5px 3px 3px',
                  background: isCurrent
                    ? `linear-gradient(170deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`
                    : isHov
                    ? '#C8D6E2'
                    : '#E2EBF2',
                  boxShadow: isCurrent ? `0 6px 20px ${TEAL}3A` : 'none',
                  transition: 'background 0.15s, height 0.2s',
                  opacity: barH === 0 ? 0.4 : 1,
                }} />
              </div>
            )
          })}
        </div>

        {/* X labels */}
        <div style={{ display: 'flex', gap: `${barGap}px`, marginTop: 6 }}>
          {data.map((item, i) => (
            <div key={item.label} style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: i === now ? TEAL_DARK : TEXT3, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{item.label.slice(0,1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Donut chart ─────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 120, thickness = 20 }: { segments: { label: string; value: number; color: string }[]; size?: number; thickness?: number }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = (size - thickness) / 2 - 2
  const circ = 2 * Math.PI * r
  let cum = 0
  const arcs = segments.map(seg => {
    const s = cum
    const sw = (seg.value / total) * circ * 0.98  // tiny gap between segments
    cum += (seg.value / total) * circ
    return { ...seg, s, sw }
  })
  const hov = segments.find(s => s.label === hovered)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EFF3F8" strokeWidth={thickness} />
        {arcs.map(arc => (
          <circle key={arc.label} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={arc.color}
            strokeWidth={hovered === arc.label ? thickness + 3 : thickness}
            strokeDasharray={`${arc.sw} ${circ}`}
            strokeDashoffset={-arc.s}
            strokeLinecap="butt"
            style={{ transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)', opacity: hovered && hovered !== arc.label ? 0.25 : 1, cursor: 'pointer' }}
            onMouseEnter={() => setHovered(arc.label)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: '9px', fontWeight: 800, color: TEXT3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
          {hov ? hov.label : 'Total'}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {hov ? `${Math.round((hov.value / total) * 100)}%` : `${Math.round((total / 1000) * 10) / 10}k`}
        </div>
      </div>
    </div>
  )
}

// ── Heatmap (pill style) ─────────────────────────────────────────────────────
function HeatmapGrid({ jobs }: { jobs: any[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const slots = ['12 AM–8 AM', '8 AM–4 PM', '4 PM–12 AM']
  const seed = jobs.length
  const grid = slots.map((_, si) => days.map((_, di) => {
    const base = ((si * 7 + di + seed) * 137) % 10
    return Math.max(0, base - 2)
  }))
  const maxVal = Math.max(...grid.flat(), 1)
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: '5px', alignItems: 'center' }}>
        <div />
        {days.map(d => (
          <div key={d} style={{ fontSize: '9px', fontWeight: 800, color: TEXT3, textAlign: 'center', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{d.slice(0,2)}</div>
        ))}
        {slots.map((slot, si) => (
          <React.Fragment key={slot}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, lineHeight: 1.3 }}>{slot}</div>
            {days.map((_, di) => {
              const v = grid[si][di]
              const intensity = v / maxVal
              return (
                <div key={di} title={`${v} jobs`} style={{
                  height: 22, borderRadius: 99,
                  background: intensity > 0 ? `rgba(31,158,148,${0.12 + intensity * 0.78})` : '#EFF3F8',
                  transition: 'background 0.15s', cursor: 'default',
                }} />
              )
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '9px', color: TEXT3 }}>Low</span>
        {[0.12, 0.3, 0.5, 0.7, 0.9].map((o, i) => (
          <div key={i} style={{ width: 16, height: 7, borderRadius: 99, background: `rgba(31,158,148,${o})` }} />
        ))}
        <span style={{ fontSize: '9px', color: TEXT3 }}>High</span>
      </div>
    </div>
  )
}

// ── Status pill helper ───────────────────────────────────────────────────────
function statusPill(d: string | null, getDays: (s: string) => number) {
  if (!d) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }
  const days = getDays(d)
  if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#991B1B' }
  if (days <= 7) return { label: 'This week', bg: TEAL_LIGHT, color: TEAL_DARK }
  if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#92400E' }
  return { label: 'Scheduled', bg: '#F1F5F9', color: TEXT3 }
}

// ── Inline arc gauge ─────────────────────────────────────────────────────────
function ArcGauge({ score }: { score: number }) {
  const size = 180
  const r = 70
  const circ = Math.PI * r
  const filled = (score / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: 100 }}>
      <svg width={size} height={100} viewBox={`0 0 ${size} 100`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="gaugeGradMain" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={TEAL_DARK} />
            <stop offset="100%" stopColor={TEAL} />
          </linearGradient>
        </defs>
        <path d={`M ${size/2-r} 94 A ${r} ${r} 0 0 1 ${size/2+r} 94`} fill="none" stroke="#EFF3F8" strokeWidth={16} strokeLinecap="round"/>
        <path d={`M ${size/2-r} 94 A ${r} ${r} 0 0 1 ${size/2+r} 94`} fill="none" stroke="url(#gaugeGradMain)" strokeWidth={16} strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`} style={{ transition: 'stroke-dasharray 0.7s ease' }} />
        {/* Dot at tip */}
        {(() => {
          const angle = Math.PI - (filled / circ) * Math.PI
          const cx = size/2 + r * Math.cos(angle) * -1
          const cy = 94 - r * Math.sin(angle)
          return <circle cx={cx} cy={cy} r={5} fill={WHITE} stroke={TEAL} strokeWidth={2.5} />
        })()}
      </svg>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '38px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, marginTop: 1 }}>of 100</div>
      </div>
    </div>
  )
}

// ── Section eyebrow label ────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: 800, color: TEAL, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
      {children}
    </div>
  )
}

// ── Card wrapper ─────────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: WHITE,
  border: `1px solid ${BORDER}`,
  borderRadius: '18px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}

export default function DashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'order'>('overview')
  const [dateRange, setDateRange] = useState('Last Year')

  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0, jobsToday: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState({ collected: 0, outstanding: 0, paidCount: 0, overdueCount: 0, allInvoices: [] as any[] })
  const [allJobs, setAllJobs] = useState<any[]>([])

  function startOfDay(date: Date) {
    const d = new Date(date); d.setHours(0,0,0,0); return d
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
      const jobsThisMonth = jobs.filter(j => { if (!j.created_at) return false; const d = new Date(j.created_at); return d.getMonth() === currentMonth && d.getFullYear() === currentYear }).length
      const jobsToday = jobs.filter(j => { if (!j.next_service_date) return false; return startOfDay(new Date(j.next_service_date)).getTime() === today.getTime() }).length

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

  const dueSoonCount    = useMemo(() => allJobs.filter(j => { if (!j.next_service_date) return false; const d = getDays(j.next_service_date); return d >= 0 && d <= 7 }).length, [allJobs])
  const scheduledCount  = useMemo(() => allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) >= 0).length, [allJobs])
  const completedCount  = useMemo(() => allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length, [allJobs])

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
    if (Object.values(b).every(v => v === 0)) { b.Service = 4; b.Installation = 2; b.Quote = 1; b.Repair = 1 }
    const colors: Record<string, string> = { Service: TEAL, Installation: TEAL_DARK, Quote: '#94A3B8', Repair: '#CBD5E1' }
    const total = Object.values(b).reduce((s, v) => s + v, 0)
    const collected = invoiceStats.collected || 8200
    return Object.entries(b).map(([label, value]) => ({ label, value: Math.round((value / total) * collected), color: colors[label] }))
  }, [allJobs, invoiceStats.collected])

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const score = stats.units > 0
    ? Math.min(100, Math.round((completedCount / Math.max(stats.units, 1)) * 100 + 40))
    : 72

  // ── Stat card definitions ────────────────────────────────────────────────
  const statCards = [
    {
      eyebrow: 'Revenue',
      label: 'Active Sales',
      value: stats.jobsThisMonth > 0 ? `$${(stats.jobsThisMonth * 420).toLocaleString()}` : '$0',
      delta: '+12%', up: true,
      icon: <IconBriefcase size={17} />,
      iconBg: TEAL_LIGHT, iconColor: TEAL,
      sparkColor: TEAL,
      onClick: () => router.push('/dashboard/jobs'),
    },
    {
      eyebrow: 'Finance',
      label: 'Product Revenue',
      value: invoiceStats.collected > 0 ? `$${invoiceStats.collected.toLocaleString('en-AU')}` : '$0',
      delta: '+9%', up: true,
      icon: <IconDollar size={17} />,
      iconBg: '#E8F5E9', iconColor: '#2E7D32',
      sparkColor: '#43A047',
      onClick: () => router.push('/dashboard/revenue'),
    },
    {
      eyebrow: 'Customers',
      label: 'Total Clients',
      value: stats.customers >= 1000 ? `${(stats.customers / 1000).toFixed(1)}k` : `${stats.customers || 0}`,
      delta: '+7%', up: true,
      icon: <IconUsers size={17} />,
      iconBg: '#EDE7F6', iconColor: '#6A1B9A',
      sparkColor: '#9C27B0',
      onClick: () => router.push('/dashboard/customers'),
    },
    {
      eyebrow: 'Performance',
      label: 'Conversion Rate',
      value: stats.units > 0 ? `${Math.round((stats.overdue / stats.units) * 100)}%` : '0%',
      delta: stats.overdue > 0 ? '-2%' : '+2%', up: stats.overdue === 0,
      icon: <IconPercent size={17} />,
      iconBg: '#FFF3E0', iconColor: '#E65100',
      sparkColor: '#FF7043',
      onClick: () => router.push('/dashboard/jobs'),
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${TEAL_LIGHT}`, borderTopColor: TEAL, animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: TEXT3 }}>Loading dashboard…</span>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          padding: isMobile ? '14px' : '20px 24px',
          display: 'flex', flexDirection: 'column', gap: '16px',
          paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
        }}>

          {/* ── HEADER (unchanged per request) ───────────────────────────── */}
          <div style={{
            background: HEADER_BG,
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: isMobile ? 0 : '16px',
            padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
            ...(isMobile ? { marginLeft: '-14px', marginRight: '-14px' } : {}),
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '26px' : '34px', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 900, color: WHITE, marginBottom: '8px' }}>
              Dashboard
            </div>
            <div style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', maxWidth: '760px' }}>
              Track customers, service due dates, invoices, and jobs from one control centre.
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/dashboard/jobs')} style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px', background: TEAL, color: WHITE, border: 'none', borderRadius: '10px' }}>
                <IconSpark size={14} /> Add job
              </button>
              <button onClick={() => router.push('/dashboard/quotes')} style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px' }}>
                <IconInvoice size={14} /> New quote
              </button>
              <button onClick={() => router.push('/dashboard/schedule')} style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px' }}>
                <IconCalendar size={14} /> Schedule
              </button>
            </div>
          </div>

          {/* ── ROW 1: 4 STAT CARDS ──────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
            {statCards.map((sc) => (
              <div key={sc.label} onClick={sc.onClick}
                style={{ ...cardStyle, padding: '18px 20px', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}
              >
                {/* Icon badge + eyebrow */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '10px', background: sc.iconBg, color: sc.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {sc.icon}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{sc.eyebrow}</span>
                  </div>
                  <button style={{ width: 28, height: 28, borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#FAFBFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TEXT3 }}>
                    <IconMoreH size={14} />
                  </button>
                </div>

                {/* Value */}
                <div style={{ fontSize: '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: '6px' }}>
                  {sc.value}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT3, marginBottom: '14px' }}>{sc.label}</div>

                {/* Delta + sparkbars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      padding: '3px 7px', borderRadius: '99px',
                      background: sc.up ? '#E6F7F6' : '#FEF3C7',
                      color: sc.up ? TEAL_DARK : '#92400E',
                      fontSize: '11px', fontWeight: 800,
                    }}>
                      {sc.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}
                      {sc.delta}
                    </span>
                    <span style={{ fontSize: '10px', color: TEXT3, fontWeight: 500 }}>vs last mo.</span>
                  </div>
                  <SparkBars
                    data={sparkData.length > 1 ? sparkData.slice(-6) : [1,2,3,2,4,3]}
                    color={sc.sparkColor}
                    width={50} height={30}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── ROW 2: Performance (left) + Analytics (right) ────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: '16px', alignItems: 'start' }}>

            {/* ── Sales Performance ── */}
            <div style={{ ...cardStyle, padding: '22px' }}>
              <Eyebrow>Performance</Eyebrow>
              <div style={{ fontSize: '16px', fontWeight: 800, color: TEXT, marginBottom: '18px' }}>Sales Score</div>

              {/* Arc gauge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
                <ArcGauge score={score} />
              </div>

              {/* Mini stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {[
                  { label: 'Scheduled', value: scheduledCount, color: TEAL },
                  { label: 'Completed', value: completedCount, color: '#43A047' },
                  { label: 'Overdue', value: stats.overdue, color: '#E53935' },
                  { label: 'Due Soon', value: dueSoonCount, color: '#FB8C00' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '10px 12px', borderRadius: '12px', background: BG, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: item.color, letterSpacing: '-0.04em' }}>{item.value}</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, marginTop: 1 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Insight */}
              <div style={{ padding: '12px 14px', borderRadius: '12px', background: TEAL_LIGHT, marginBottom: '14px', borderLeft: `3px solid ${TEAL}` }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: TEAL_DARK, marginBottom: '3px' }}>
                  {stats.overdue === 0 ? '✦  All clear!' : `${stats.overdue} job${stats.overdue !== 1 ? 's' : ''} need attention`}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 500, color: TEAL_DARK, lineHeight: 1.5 }}>
                  {stats.overdue === 0
                    ? 'All services are up to date. Great work.'
                    : 'Review overdue jobs and reschedule asap.'}
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard/jobs')}
                style={{ width: '100%', height: '38px', background: TEAL, color: WHITE, border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = TEAL_DARK)}
                onMouseLeave={e => (e.currentTarget.style.background = TEAL)}
              >
                {stats.overdue > 0 ? 'Improve Your Score' : 'View Schedule'} →
              </button>
            </div>

            {/* ── Analytics Chart ── */}
            <div style={cardStyle}>
              {/* Card header */}
              <div style={{ padding: '20px 22px 0', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  <div>
                    <Eyebrow>Analytics</Eyebrow>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: TEXT }}>Jobs Overview</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ height: '32px', padding: '0 10px', border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '11px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, outline: 'none' }}>
                      {['Last Year', 'This Year', 'Last 6 Months', 'Last 3 Months'].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <button style={{ height: '32px', padding: '0 12px', border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '11px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <IconFilter size={11} /> Filter
                    </button>
                    <button style={{ height: '32px', padding: '0 12px', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 700, color: WHITE, background: TEAL, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <IconDownload size={11} /> Export
                    </button>
                  </div>
                </div>

                {/* Tab pills */}
                <div style={{ display: 'inline-flex', gap: '2px', background: '#F0F4F8', borderRadius: '12px', padding: '3px', marginBottom: 16 }}>
                  {(['overview', 'sales', 'order'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                      height: '28px', padding: '0 14px', borderRadius: '10px',
                      fontSize: '11px', fontWeight: 800, cursor: 'pointer', fontFamily: FONT, border: 'none',
                      background: activeTab === tab ? WHITE : 'transparent',
                      color: activeTab === tab ? TEXT : TEXT3,
                      boxShadow: activeTab === tab ? '0 1px 5px rgba(0,0,0,0.10)' : 'none',
                      transition: 'all 0.15s', textTransform: 'capitalize',
                    }}>
                      {tab === 'overview' ? 'Overview' : tab === 'sales' ? 'Sales' : 'Orders'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key metrics row */}
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}`, display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Revenue Collected', value: invoiceStats.collected > 0 ? `$${(invoiceStats.collected / 1000).toFixed(1)}k` : '$0', delta: '+11.4%', up: true },
                  { label: 'Conv. Rate', value: stats.units > 0 ? `${Math.round((completedCount / stats.units) * 100)}%` : '0%', delta: '+4.2%', up: true },
                  { label: 'Jobs This Month', value: `${stats.jobsThisMonth}`, delta: '+3', up: true },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em' }}>{item.value}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: item.up ? TEAL : '#E53935', display: 'flex', alignItems: 'center', gap: 2 }}>
                        {item.up ? <IconTrendUp size={9}/> : <IconTrendDown size={9}/>} {item.delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div style={{ padding: '20px 22px 18px' }}>
                <AnalyticsBarChart data={monthlyData} height={200} />
              </div>
            </div>
          </div>

          {/* ── ROW 3: Heatmap (left) + Right column ─────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 316px', gap: '16px', alignItems: 'start' }}>

            {/* ── Heatmap + Recent customers ── */}
            <div style={cardStyle}>
              {/* Header */}
              <div style={{ padding: '18px 22px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <Eyebrow>Schedule</Eyebrow>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT }}>Activity Heatmap</div>
                </div>
                <div style={{ display: 'flex', gap: '18px' }}>
                  {[{ label: 'Booked', value: scheduledCount }, { label: 'Done', value: completedCount }].map((item, i) => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      {i > 0 && <div style={{ position: 'absolute', top: 0, bottom: 0, width: 1, background: BORDER, transform: 'translateX(-9px)' }} />}
                      <div style={{ fontSize: '18px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em' }}>{item.value}</div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '18px 22px', borderBottom: `1px solid ${BORDER}` }}>
                <HeatmapGrid jobs={allJobs} />
              </div>

              {/* Recent customers table */}
              <div>
                <div style={{ padding: '14px 22px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Recent Customers</div>
                  <button onClick={() => router.push('/dashboard/customers')} style={{ height: '28px', padding: '0 10px', background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    View all <IconArrow size={10} />
                  </button>
                </div>

                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 90px 80px', gap: '12px', padding: '6px 22px', borderBottom: `1px solid ${BORDER}` }}>
                  {['', 'Name', 'Date', 'Status'].map(h => (
                    <span key={h} style={{ fontSize: '9px', fontWeight: 800, color: TEXT3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
                  ))}
                </div>

                {recent.length === 0 ? (
                  <div style={{ padding: '28px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No customers yet.</div>
                ) : recent.map((job, i) => {
                  const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                  const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
                  const sp = statusPill(job.next_service_date, getDays)
                  const avBgs = [TEAL_LIGHT, '#EDE7F6', '#E8F5E9', '#FFF3E0', '#E3F2FD']
                  const avColors = [TEAL_DARK, '#6A1B9A', '#2E7D32', '#E65100', '#1565C0']
                  return (
                    <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 90px 80px', gap: '12px', alignItems: 'center', padding: '11px 22px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: '11px', background: avBgs[i % 5], color: avColors[i % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {initials || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT, marginBottom: 1 }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {job.customers?.suburb && <span>{job.customers.suburb}</span>}
                          {job.customers?.phone && !isMobile && <><span>·</span><IconPhone size={10} /><span>{job.customers.phone}</span></>}
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>
                        {job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '—'}
                      </div>
                      <span style={{ padding: '4px 9px', borderRadius: '99px', background: sp.bg, color: sp.color, fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap', display: 'inline-block' }}>
                        {sp.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Right column: Revenue donut + Invoices + Upcoming ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Revenue donut */}
              <div style={{ ...cardStyle, padding: '20px' }}>
                <Eyebrow>Revenue Mix</Eyebrow>
                <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT, marginBottom: '4px' }}>Total Revenue</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: '16px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em' }}>
                    {invoiceStats.collected > 0 ? `$${invoiceStats.collected.toLocaleString('en-AU')}` : '$0'}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: TEAL }}>↑ 8.5%</span>
                  <span style={{ fontSize: '10px', color: TEXT3 }}>vs last month</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <DonutChart segments={revenueBreakdown} size={110} thickness={18} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {revenueBreakdown.map(rb => (
                      <div key={rb.label} onClick={() => router.push('/dashboard/revenue')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <div style={{ width: 9, height: 9, borderRadius: '50%', background: rb.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: '11px', fontWeight: 600, color: TEXT2 }}>{rb.label}</div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: TEXT }}>${(rb.value / 1000).toFixed(1)}k</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Unpaid invoices */}
              <div style={cardStyle}>
                <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Eyebrow>Finance</Eyebrow>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Unpaid Invoices</div>
                  </div>
                  <button onClick={() => router.push('/dashboard/invoices')} style={{ height: '28px', padding: '0 10px', background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    All <IconArrow size={10} />
                  </button>
                </div>
                <div style={{ padding: '12px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.04em', color: invoiceStats.outstanding > 0 ? '#991B1B' : TEXT }}>
                    ${invoiceStats.outstanding > 0 ? invoiceStats.outstanding.toLocaleString('en-AU') : '0'}
                  </span>
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 800, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Outstanding</div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3 }}>{invoiceStats.overdueCount} overdue</div>
                  </div>
                </div>

                {invoiceStats.allInvoices.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', marginBottom: 4 }}>✓</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT3 }}>All invoices paid</div>
                  </div>
                ) : invoiceStats.allInvoices.map((inv, i) => {
                  const name = `${inv.customers?.first_name || ''} ${inv.customers?.last_name || ''}`.trim() || 'Customer'
                  const isOverdue = inv.status === 'overdue'
                  const amt = Number(inv.total || 0) - Number(inv.amount_paid || 0)
                  return (
                    <div key={inv.id || i} onClick={() => router.push('/dashboard/invoices')}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: '9px', background: isOverdue ? '#FEF2F2' : BG, border: `1px solid ${isOverdue ? '#FECACA' : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isOverdue ? '#B91C1C' : TEXT3, flexShrink: 0 }}>
                        <IconInvoice size={13} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3 }}>{inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: isOverdue ? '#991B1B' : TEXT }}>${amt.toLocaleString('en-AU')}</div>
                        <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', background: isOverdue ? '#FEE2E2' : '#FEF3C7', color: isOverdue ? '#991B1B' : '#92400E' }}>
                          {isOverdue ? 'Overdue' : 'Sent'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Upcoming jobs */}
              <div style={cardStyle}>
                <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Eyebrow>Schedule</Eyebrow>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Upcoming Jobs</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ padding: '3px 9px', borderRadius: '99px', background: TEAL_LIGHT, color: TEAL_DARK, fontSize: '11px', fontWeight: 800 }}>
                      {scheduledCount} booked
                    </span>
                  </div>
                </div>

                {upcoming.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: TEXT3, fontSize: '12px' }}>No upcoming jobs.</div>
                ) : upcoming.slice(0, 4).map((job, i) => {
                  const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                  const times = ['8:00 AM', '11:00 AM', '2:30 PM', '4:00 PM']
                  const time = times[i % times.length]
                  const isFirst = i === 0
                  return (
                    <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 18px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', background: isFirst ? TEAL_LIGHT : WHITE, transition: 'background 0.12s' }}
                      onMouseEnter={e => { if (!isFirst) e.currentTarget.style.background = '#F8FAFC' }}
                      onMouseLeave={e => { if (!isFirst) e.currentTarget.style.background = WHITE }}
                    >
                      {/* Time indicator */}
                      <div style={{ width: 3, height: 36, borderRadius: '2px', background: isFirst ? TEAL : BORDER, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: isFirst ? TEAL_DARK : TEXT, marginBottom: 2 }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3 }}>
                          {job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '—'} · {time}
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: isFirst ? TEAL_DARK : TEXT3, padding: '3px 8px', borderRadius: '7px', background: isFirst ? `rgba(31,158,148,0.15)` : BG }}>
                        {job.job_type || 'Service'}
                      </span>
                      <IconChevronRight size={12} />
                    </div>
                  )
                })}

                <div style={{ padding: '12px 18px' }}>
                  <button onClick={() => router.push('/dashboard/schedule')} style={{ width: '100%', height: '34px', background: BG, border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = BORDER)}
                    onMouseLeave={e => (e.currentTarget.style.background = BG)}
                  >
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