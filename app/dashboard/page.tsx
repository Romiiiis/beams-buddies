'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

// ─── Design Tokens ───────────────────────────────────────────────────────────
const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_LIGHT = '#E6F7F6'
const RED = '#B91C1C'
const RED_LIGHT = '#FEE2E2'
const AMBER = '#92400E'
const AMBER_LIGHT = '#FEF3C7'
const GREEN = '#166534'
const GREEN_LIGHT = '#DCFCE7'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E2E8F0'
const BG = '#F4F6F9'
const WHITE = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const avColors = [
  { bg: '#E8F4F1', color: '#0A4F4C' },
  { bg: '#DBEAFE', color: '#1E3A8A' },
  { bg: '#FEF3C7', color: '#78350F' },
  { bg: '#EDE9FE', color: '#4C1D95' },
  { bg: '#FFE4E6', color: '#881337' },
]

// ─── Hooks ────────────────────────────────────────────────────────────────────
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

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconPlus({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
}
function IconBriefcase({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.9"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M2 13h20" stroke="currentColor" strokeWidth="1.9"/></svg>
}
function IconInvoice({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M7 3h10a2 2 0 0 1 2 2v16l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconCalendar({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9"/><path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconArrow({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconDots({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>
}
function IconTrendUp({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 7l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 7h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconTrendDown({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 17l-8-8-4 4-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 17h6v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconPhone({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.4 19.4 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.2 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.8 9.8a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5A2 2 0 0 1 22 16.9Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/></svg>
}
function IconBell({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconCheck({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconStar({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color, fill }: { data: number[]; color: string; fill: string }) {
  if (!data.length) return null
  const w = 120, h = 44
  const min = Math.min(...data)
  const max = Math.max(...data) || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3
    return `${x},${y}`
  })
  const pathD = `M ${pts.join(' L ')}`
  const fillD = `M ${pts[0]} L ${pts.join(' L ')} L ${w},${h} L 0,${h} Z`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={fill} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#sg-${color.replace('#','')})`}/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function MiniDonut({ segments, size = 160 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const thickness = 26
  const cx = size / 2, cy = size / 2
  const r = (size - thickness) / 2 - 2
  const circumference = 2 * Math.PI * r
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let cumulative = 0
  const arcs = segments.map(seg => {
    const startAngle = cumulative
    const sweep = (seg.value / total) * circumference
    cumulative += sweep
    return { ...seg, startAngle, sweep }
  })
  const hov = segments.find(s => s.label === hovered)
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A1A1A" strokeWidth={thickness}/>
        {arcs.map(arc => (
          <circle key={arc.label} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color}
            strokeWidth={hovered === arc.label ? thickness + 5 : thickness}
            strokeDasharray={`${arc.sweep} ${circumference}`}
            strokeDashoffset={-arc.startAngle} strokeLinecap="butt"
            style={{ transition: 'all 0.18s', opacity: hovered && hovered !== arc.label ? 0.3 : 1, cursor: 'pointer' }}
            onMouseEnter={() => setHovered(arc.label)} onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {hov ? (
          <>
            <div style={{ fontSize: '20px', fontWeight: 900, color: WHITE, letterSpacing: '-0.04em', lineHeight: 1 }}>{Math.round((hov.value / total) * 100)}%</div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginTop: 3, textAlign: 'center', maxWidth: 60, lineHeight: 1.3 }}>{hov.label}</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '20px', fontWeight: 900, color: WHITE, letterSpacing: '-0.04em' }}>{total}</div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>TOTAL</div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const yMax = Math.max(...data.map(d => d.value), 1)
  const CHART_H = 80
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: CHART_H }}>
        {data.map(item => {
          const barH = Math.max(4, (item.value / yMax) * CHART_H)
          const isHov = hovered === item.label
          return (
            <div key={item.label} onMouseEnter={() => setHovered(item.label)} onMouseLeave={() => setHovered(null)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', cursor: 'default', position: 'relative' }}>
              {isHov && (
                <div style={{ position: 'absolute', bottom: barH + 4, left: '50%', transform: 'translateX(-50%)', background: WHITE, color: TEXT, fontSize: '10px', fontWeight: 800, padding: '2px 5px', borderRadius: '5px', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', zIndex: 5 }}>
                  {item.value}
                </div>
              )}
              <div style={{ height: barH, borderRadius: '4px 4px 2px 2px', background: isHov ? color : `${color}99`, transition: 'all 0.15s' }}/>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '4px', marginTop: '5px' }}>
        {data.map(item => (
          <div key={item.label} style={{ flex: 1, textAlign: 'center', fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>{item.label}</div>
        ))}
      </div>
    </div>
  )
}

// ─── Schedule Row ─────────────────────────────────────────────────────────────
function ScheduleGrid({ jobs, isMobile }: { jobs: any[]; isMobile: boolean }) {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return { date: d, label: d.toLocaleDateString('en-AU', { weekday: 'short' }), dayNum: d.getDate(), month: d.toLocaleDateString('en-AU', { month: 'short' }) }
  })

  const jobColors = [
    { bg: '#1F9E94', text: WHITE },
    { bg: '#3B82F6', text: WHITE },
    { bg: '#F59E0B', text: WHITE },
    { bg: '#EF4444', text: WHITE },
    { bg: '#8B5CF6', text: WHITE },
  ]

  const scheduled = jobs.filter(j => j.next_service_date).slice(0, 4)

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: isMobile ? 600 : 'auto' }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: '3px', marginBottom: '6px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', padding: '0 4px' }}>Team</div>
          {days.map((d, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: i === 0 ? TEAL : 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>{d.label}</div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: i === 0 ? WHITE : 'rgba(255,255,255,0.6)' }}>{d.dayNum}–{d.month}</div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {scheduled.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>No upcoming jobs scheduled.</div>
        ) : scheduled.map((job, idx) => {
          const jc = jobColors[idx % jobColors.length]
          const jDate = job.next_service_date ? new Date(job.next_service_date) : null
          // find which day column this job lands on
          const dayIdx = jDate ? days.findIndex(d => d.date.toDateString() === jDate.toDateString()) : -1
          const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
          const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
          const avC = avColors[idx % avColors.length]
          return (
            <div key={job.id} style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: '3px', marginBottom: '4px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 2px' }}>
                <div style={{ width: 28, height: 28, borderRadius: '8px', background: avC.bg, color: avC.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 44 }}>{name.split(' ')[0]}</span>
              </div>
              {days.map((_, di) => (
                <div key={di} style={{ height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {di === dayIdx && (
                    <div style={{ width: '100%', height: '100%', background: jc.bg, borderRadius: '8px', padding: '4px 6px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '9px', fontWeight: 800, color: jc.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.job_type || 'Service'} – {name.split(' ')[0]}</div>
                      <div style={{ fontSize: '8px', fontWeight: 600, color: `${jc.text}CC` }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState({ collected: 0, outstanding: 0, paidCount: 0, overdueCount: 0 })
  const [allJobs, setAllJobs] = useState<any[]>([])
  const [businessName, setBusinessName] = useState('My Business')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) { setLoading(false); return }
      const bid = userData.business_id
      const today = new Date()

      const [customersRes, jobsRes, invoicesRes, bizRes] = await Promise.all([
        supabase.from('customers').select('id').eq('business_id', bid),
        supabase.from('jobs').select('*, customers(first_name, last_name, suburb, phone)').eq('business_id', bid).order('next_service_date', { ascending: true }),
        supabase.from('invoices').select('status, total, amount_paid, created_at').eq('business_id', bid),
        supabase.from('businesses').select('name').eq('id', bid).single(),
      ])

      if (bizRes.data?.name) setBusinessName(bizRes.data.name)

      const jobs = jobsRes.data || []
      const invoices = invoicesRes.data || []
      const overdue = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today)
      const jobsThisMonth = jobs.filter(j => { const d = new Date(j.created_at); return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() }).length

      setStats({ customers: customersRes.data?.length || 0, units: jobs.length, overdue: overdue.length, jobsThisMonth })
      setAllJobs(jobs)
      setUpcoming(jobs.filter(j => j.next_service_date && new Date(j.next_service_date) >= today).slice(0, 5))
      setRecent([...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6))
      setInvoiceStats({
        collected: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total || 0), 0),
        outstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0),
        paidCount: invoices.filter(i => i.status === 'paid').length,
        overdueCount: invoices.filter(i => i.status === 'overdue').length,
      })
      setLoading(false)
    }
    load()
  }, [router])

  function getDays(d: string) { return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) }

  function statusPill(d: string | null) {
    if (!d) return { label: 'No date', bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
    const days = getDays(d)
    if (days < 0) return { label: 'Overdue', bg: '#7F1D1D33', color: '#FCA5A5' }
    if (days <= 30) return { label: 'Due soon', bg: '#78350F33', color: '#FCD34D' }
    return { label: 'Good', bg: '#166534' + '33', color: '#6EE7B7' }
  }

  const dueSoonCount = useMemo(() =>
    allJobs.filter(j => { if (!j.next_service_date) return false; const d = getDays(j.next_service_date); return d >= 0 && d <= 30 }).length
  , [allJobs])

  const monthlyData = useMemo(() => {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const base = names.map((label, i) => ({ label, value: 0, month: i }))
    allJobs.forEach(job => {
      const c = job.created_at ? new Date(job.created_at) : null
      if (c && !isNaN(c.getTime())) base[c.getMonth()].value += 1
    })
    return base
  }, [allJobs])

  const jobStatusSegments = useMemo(() => {
    const inProgress = allJobs.filter(j => !j.next_service_date || getDays(j.next_service_date) >= 0).length
    const completed = allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length
    const pending = dueSoonCount
    const onHold = Math.max(0, allJobs.length - inProgress - completed)
    if (allJobs.length === 0) return [
      { label: 'In Progress', value: 3, color: '#3B82F6' },
      { label: 'Completed', value: 5, color: TEAL },
      { label: 'Pending', value: 2, color: '#F59E0B' },
      { label: 'On Hold', value: 1, color: '#6B7280' },
    ]
    return [
      { label: 'In Progress', value: inProgress, color: '#3B82F6' },
      { label: 'Completed', value: completed, color: TEAL },
      { label: 'Pending', value: pending, color: '#F59E0B' },
      { label: 'On Hold', value: onHold, color: '#6B7280' },
    ]
  }, [allJobs, dueSoonCount])

  const quotePipelineData = [
    { label: 'Sent', value: invoiceStats.paidCount + invoiceStats.overdueCount + 2 },
    { label: 'Follow', value: Math.max(1, invoiceStats.overdueCount) },
    { label: 'Accept', value: invoiceStats.paidCount },
    { label: 'Closed', value: Math.max(1, Math.floor(invoiceStats.paidCount * 0.8)) },
  ]

  const sparkData = monthlyData.map(m => m.value)

  // Metric top cards
  const topCards = [
    {
      label: 'Total Revenue',
      value: `$${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
      change: '+12.5%', up: true,
      spark: sparkData,
      sparkColor: TEAL,
    },
    {
      label: 'New Jobs',
      value: stats.jobsThisMonth.toString(),
      change: stats.jobsThisMonth > 0 ? `+${stats.jobsThisMonth}` : '0', up: stats.jobsThisMonth > 0,
      spark: sparkData.map((v, i) => i < 6 ? Math.floor(v * 0.6) : v),
      sparkColor: '#3B82F6',
    },
    {
      label: 'Active Customers',
      value: stats.customers.toString(),
      change: `${stats.units} units`, up: true,
      spark: sparkData.map(v => Math.floor(v * 0.4)),
      sparkColor: '#8B5CF6',
    },
    {
      label: 'Overdue Services',
      value: stats.overdue.toString(),
      change: stats.overdue > 0 ? 'Needs attention' : 'All clear', up: stats.overdue === 0,
      spark: Array.from({ length: 12 }, (_, i) => i % 3 === 0 ? stats.overdue : Math.max(0, stats.overdue - 1)),
      sparkColor: stats.overdue > 0 ? '#EF4444' : TEAL,
    },
  ]

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // Shared card style (dark)
  const darkCard: React.CSSProperties = {
    background: '#161B27',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    overflow: 'hidden',
  }
  const darkCardPad: React.CSSProperties = { ...darkCard, padding: '16px' }

  const cardLabel: React.CSSProperties = {
    fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: '4px',
  }
  const sectionTitle: React.CSSProperties = {
    fontSize: '14px', fontWeight: 800, color: WHITE, marginBottom: '12px', letterSpacing: '-0.02em',
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: '#0D1117', fontFamily: FONT }}>
        <Sidebar active="/dashboard" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 600 }}>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: '#0D1117', minHeight: '100vh' }}>
      <Sidebar active="/dashboard" />

      <div style={{ flex: 1, minWidth: 0, background: '#0D1117', ...(isMobile ? {} : { height: '100vh', overflowY: 'scroll' }) }}>

        {/* ── Top Nav Bar ───────────────────────────────────────────────────── */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,17,23,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '12px 16px' : '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '1px' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: WHITE, letterSpacing: '-0.04em', lineHeight: 1 }}>Dashboard</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!isMobile && (
              <button onClick={() => router.push('/dashboard/jobs')} style={{ height: '38px', padding: '0 16px', background: TEAL, color: WHITE, border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 12px rgba(31,158,148,0.3)' }}>
                <IconPlus size={15}/> New Job
              </button>
            )}
            <button onClick={() => router.push('/dashboard/quotes')} style={{ height: '38px', padding: '0 16px', background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
              <IconInvoice size={14}/> {isMobile ? 'Quote' : 'Send Quote'}
            </button>
          </div>
        </div>

        <div style={{ padding: isMobile ? '14px' : '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: isMobile ? '80px' : '60px' }}>

          {/* ── Metric Cards Row ──────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
            {topCards.map((card, i) => (
              <div key={i} style={{ ...darkCardPad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 130 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={cardLabel}>{card.label}</div>
                    <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 900, color: WHITE, letterSpacing: '-0.05em', lineHeight: 1.1, marginTop: '2px' }}>{card.value}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', padding: '3px 7px', borderRadius: '6px', background: card.up ? 'rgba(31,158,148,0.15)' : 'rgba(239,68,68,0.15)' }}>
                      {card.up ? <IconTrendUp size={11}/> : <IconTrendDown size={11}/>}
                      <span style={{ fontSize: '10px', fontWeight: 800, color: card.up ? TEAL : '#F87171' }}>{card.change}</span>
                    </div>
                  </div>
                  <button style={{ width: 28, height: 28, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconDots size={14}/>
                  </button>
                </div>
                <Sparkline data={card.spark} color={card.sparkColor} fill={card.sparkColor}/>
              </div>
            ))}
          </div>

          {/* ── Middle Row: Schedule + Donut + Pipeline ────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 200px 200px', gap: '12px', alignItems: 'start' }}>

            {/* Job Schedule */}
            <div style={{ ...darkCardPad }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={sectionTitle}>Job Schedule (This Week)</div>
                <button onClick={() => router.push('/dashboard/schedule')} style={{ height: '30px', padding: '0 10px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  View Schedule
                </button>
              </div>
              <ScheduleGrid jobs={upcoming} isMobile={isMobile}/>
            </div>

            {/* Job Status Donut */}
            <div style={{ ...darkCardPad }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={sectionTitle}>Job Status</div>
                <button style={{ width: 28, height: 28, borderRadius: '7px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconDots size={14}/></button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <MiniDonut segments={jobStatusSegments} size={154}/>
              </div>
              <div style={{ display: 'grid', gap: '6px' }}>
                {jobStatusSegments.map(seg => (
                  <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '2px', background: seg.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', flex: 1 }}>{seg.value} {seg.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push('/dashboard/jobs')} style={{ width: '100%', marginTop: '12px', height: '32px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                View Schedule
              </button>
            </div>

            {/* Quote Pipeline */}
            <div style={{ ...darkCardPad }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={sectionTitle}>Quote Pipeline</div>
                <button style={{ width: 28, height: 28, borderRadius: '7px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconDots size={14}/></button>
              </div>
              <MiniBarChart data={quotePipelineData} color={TEAL}/>
              <div style={{ marginTop: '12px', padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>Key stages</div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Sent → Follow-up → Accepted → Closed</div>
              </div>
            </div>
          </div>

          {/* ── Active Jobs Table ──────────────────────────────────────────── */}
          <div style={darkCard}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={sectionTitle}>Active Jobs (Top 5)</div>
              <button onClick={() => router.push('/dashboard/jobs')} style={{ height: '32px', padding: '0 12px', background: TEAL, color: WHITE, border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconPlus size={13}/> New Job
              </button>
            </div>

            {/* Table Header */}
            {!isMobile && (
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px 100px 90px 80px', gap: '8px', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Job ID', 'Client', 'Service', 'Status', 'Assigned', 'Due Date', 'Progress'].map(h => (
                  <div key={h} style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
                ))}
              </div>
            )}

            {/* Table Rows */}
            {recent.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No jobs yet.</div>
            ) : recent.slice(0, 5).map((job, i) => {
              const status = statusPill(job.next_service_date)
              const av = avColors[i % avColors.length]
              const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
              const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
              const progress = job.next_service_date ? Math.max(10, Math.min(95, 100 - Math.max(0, getDays(job.next_service_date)) * 2)) : 50
              const jobId = `#${String(job.id || '').slice(0, 4).toUpperCase() || (4500 + i)}`

              if (isMobile) {
                return (
                  <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                    style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: WHITE, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{job.job_type || 'Service'} · {jobId}</div>
                    </div>
                    <span style={{ padding: '4px 8px', borderRadius: '6px', background: status.bg, color: status.color, fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}>{status.label}</span>
                  </div>
                )
              }

              return (
                <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                  style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px 100px 90px 80px', gap: '8px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: TEAL }}>{jobId}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '8px', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: WHITE, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{job.job_type || 'HVAC'}</div>
                  <div>
                    <span style={{ padding: '4px 8px', borderRadius: '7px', background: status.bg, color: status.color, fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap' }}>{status.label}</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>{job.customers?.suburb || '—'}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '—'}</div>
                  <div>
                    <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, borderRadius: '999px', background: TEAL, transition: 'width 0.4s ease' }}/>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Bottom Row: Pending Quotes + Unpaid Invoices + Activity ──────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '12px' }}>

            {/* Pending Quotes */}
            <div style={{ ...darkCardPad }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Pending Quotes</div>
                <button style={{ width: 26, height: 26, borderRadius: '7px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconDots size={13}/></button>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: WHITE, letterSpacing: '-0.05em' }}>${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</div>
                <span style={{ padding: '4px 9px', borderRadius: '7px', background: 'rgba(245,158,11,0.15)', color: '#FCD34D', fontSize: '11px', fontWeight: 800 }}>In Progress</span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>Outstanding amount across {invoiceStats.overdueCount + 1} quotes</div>
              <button onClick={() => router.push('/dashboard/quotes')} style={{ width: '100%', height: '34px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <IconInvoice size={13}/> Send Quote
              </button>
            </div>

            {/* Unpaid Invoices */}
            <div style={{ ...darkCardPad }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Unpaid Invoices</div>
                <button style={{ width: 26, height: 26, borderRadius: '7px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconDots size={13}/></button>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: WHITE, letterSpacing: '-0.05em' }}>${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</div>
                <span style={{ padding: '4px 9px', borderRadius: '7px', background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', fontSize: '11px', fontWeight: 800 }}>Unpaid</span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>{invoiceStats.overdueCount} overdue · {invoiceStats.paidCount} collected</div>
              <button onClick={() => router.push('/dashboard/invoices')} style={{ width: '100%', height: '34px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <IconBriefcase size={13}/> New Job
              </button>
            </div>

            {/* Recent Activity Feed */}
            <div style={{ ...darkCardPad }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={sectionTitle}>Recent Activity</div>
                <button style={{ width: 26, height: 26, borderRadius: '7px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconDots size={13}/></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recent.slice(0, 3).map((job, i) => {
                  const av = avColors[i % avColors.length]
                  const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                  const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
                  const actions = ['added a new job', 'approved quote', 'completed service', 'scheduled service']
                  const icons = [<IconPlus size={10}/>, <IconStar size={10}/>, <IconCheck size={10}/>, <IconCalendar size={10}/>]
                  const iconColors = [TEAL, '#F59E0B', '#6EE7B7', '#93C5FD']
                  const idx = i % 4
                  return (
                    <div key={job.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.025)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '9px', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: WHITE, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {name} <span style={{ color: iconColors[idx] }}>{actions[idx]}</span>
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                          {job.created_at ? new Date(job.created_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : ''} · {job.customers?.suburb || ''}
                        </div>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: '6px', background: `${iconColors[idx]}22`, color: iconColors[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {icons[idx]}
                      </div>
                    </div>
                  )
                })}
                {recent.length === 0 && (
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '12px 0' }}>No recent activity yet.</div>
                )}
              </div>
              {/* Total Status summary */}
              <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '11px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Total Status</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: WHITE, letterSpacing: '-0.04em' }}>${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</span>
                  <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(31,158,148,0.15)', color: TEAL, fontSize: '10px', fontWeight: 800 }}>Collected</span>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>{invoiceStats.paidCount} paid invoices total</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}