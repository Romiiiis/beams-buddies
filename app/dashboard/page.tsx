'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL      = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEXT      = '#0B1220'
const TEXT2     = '#1F2937'
const TEXT3     = '#475569'
const BORDER    = '#E2E8F0'
const BG        = '#FAFAFA'
const WHITE     = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT      = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TYPE = {
  label:  { fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em' as const, textTransform: 'uppercase' as const, color: TEXT3 },
  bodySm: { fontSize: '11px', fontWeight: 500, color: TEXT3, lineHeight: 1.45 },
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function IconSpark({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
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
function IconAlert({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.9"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
}
function IconChevronRight({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconTrendUp({ size = 11 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 7l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconPhone({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.4 19.4 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.2 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.8 9.8a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5A2 2 0 0 1 22 16.9Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/></svg>
}

// ── Radial Gauge (v3 original) ────────────────────────────────────────────────
function RadialGauge({ value, label, color, size = 76 }: { value: number; label: string; color: string; size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const filled = Math.min(value / Math.max(value + 2, 10), 1) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={BORDER} strokeWidth={7}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
            strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em' }}>{value}</span>
        </div>
      </div>
      <span style={{ fontSize: '10px', fontWeight: 600, color: TEXT3 }}>{label}</span>
    </div>
  )
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color, width = 160, height = 50 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return <div style={{ width, height }}/>
  const min = Math.min(...data), max = Math.max(...data) || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / (max - min || 1)) * (height - 8) - 4
    return `${x},${y}`
  })
  const uid = `sp${color.replace('#', '')}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', width: '100%' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.14"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`M ${pts[0]} L ${pts.join(' L ')} L ${width},${height} L 0,${height} Z`} fill={`url(#${uid})`}/>
      <path d={`M ${pts.join(' L ')}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 180, thickness = 28 }: { segments: { label: string; value: number; color: string }[]; size?: number; thickness?: number }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const cx = size / 2, cy = size / 2, r = (size - thickness) / 2 - 2
  const circ = 2 * Math.PI * r
  let cum = 0
  const arcs = segments.map(seg => { const s = cum; const sw = (seg.value / total) * circ; cum += sw; return { ...seg, s, sw } })
  const hov = segments.find(s => s.label === hovered)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={thickness}/>
        {arcs.map(arc => (
          <circle key={arc.label} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color}
            strokeWidth={hovered === arc.label ? thickness + 5 : thickness}
            strokeDasharray={`${arc.sw} ${circ}`} strokeDashoffset={-arc.s} strokeLinecap="butt"
            style={{ transition: 'all 0.18s', opacity: hovered && hovered !== arc.label ? 0.3 : 1, cursor: 'pointer' }}
            onMouseEnter={() => setHovered(arc.label)} onMouseLeave={() => setHovered(null)}/>
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.05em', marginBottom: 2 }}>{hov ? hov.label : 'MIX'}</div>
        <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {hov ? `${Math.round((hov.value / total) * 100)}%` : `$${(total / 1000).toFixed(1)}k`}
        </div>
      </div>
    </div>
  )
}

// ── Monthly Bar Chart ─────────────────────────────────────────────────────────
function MonthlyBarChart({ data }: { data: { label: string; total: number; completed: number }[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const yMax = Math.max(...data.map(d => d.total), 1)
  const H = 80
  const now = new Date().getMonth()
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: H + 18 }}>
      {data.map((item, i) => {
        const isCurrent = i === now
        const isHov = hovered === item.label
        const barH = Math.max(4, (item.total / yMax) * H)
        const compH = item.completed > 0 ? Math.max(3, (item.completed / yMax) * H) : 0
        return (
          <div key={item.label} onMouseEnter={() => setHovered(item.label)} onMouseLeave={() => setHovered(null)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'default', position: 'relative' }}>
            {isHov && item.total > 0 && (
              <div style={{ position: 'absolute', bottom: H + 4, left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 800, color: WHITE, background: TEXT, padding: '2px 5px', borderRadius: '5px', whiteSpace: 'nowrap', zIndex: 5 }}>{item.total}</div>
            )}
            <div style={{ width: '100%', height: barH, borderRadius: '4px 4px 2px 2px', background: isHov ? '#C8D3DF' : BORDER, position: 'relative', overflow: 'hidden', marginTop: 'auto' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: compH, background: TEAL, opacity: isCurrent ? 1 : 0.6, borderRadius: '4px 4px 2px 2px' }}/>
            </div>
            <span style={{ fontSize: '8px', fontWeight: 700, color: isCurrent ? TEXT : TEXT3 }}>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState({ collected: 0, outstanding: 0, paidCount: 0, overdueCount: 0, allInvoices: [] as any[] })
  const [allJobs, setAllJobs] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'next7' | 'due' | 'attime'>('next7')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) { setLoading(false); return }
      const bid = userData.business_id
      const today = new Date()
      const [customersRes, jobsRes, invoicesRes] = await Promise.all([
        supabase.from('customers').select('id').eq('business_id', bid),
        supabase.from('jobs').select('*, customers(first_name, last_name, suburb, phone)').eq('business_id', bid).order('next_service_date', { ascending: true }),
        supabase.from('invoices').select('*, customers(first_name, last_name)').eq('business_id', bid).order('created_at', { ascending: false }),
      ])
      const jobs = jobsRes.data || []
      const invoices = invoicesRes.data || []
      const overdue = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today)
      const jobsThisMonth = jobs.filter(j => { const d = new Date(j.created_at); return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() }).length
      setStats({ customers: customersRes.data?.length || 0, units: jobs.length, overdue: overdue.length, jobsThisMonth })
      setAllJobs(jobs)
      setUpcoming(jobs.filter(j => j.next_service_date && new Date(j.next_service_date) >= today).slice(0, 5))
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

  function getDays(d: string) { return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) }

  const dueSoonCount = useMemo(() => allJobs.filter(j => { if (!j.next_service_date) return false; const d = getDays(j.next_service_date); return d >= 0 && d <= 7 }).length, [allJobs])
  const inProgressCount = useMemo(() => allJobs.filter(j => !j.next_service_date || getDays(j.next_service_date) >= 0).length, [allJobs])
  const completedCount  = useMemo(() => allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length, [allJobs])

  const monthlyData = useMemo(() => {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const base = names.map(label => ({ label, total: 0, completed: 0 }))
    allJobs.forEach(job => {
      const c = job.created_at ? new Date(job.created_at) : null
      if (c && !isNaN(c.getTime())) base[c.getMonth()].total += 1
      if (job.next_service_date) { const d = new Date(job.next_service_date); if (!isNaN(d.getTime()) && d <= new Date()) base[d.getMonth()].completed += 1 }
    })
    return base
  }, [allJobs])

  const sparkData = monthlyData.map(m => m.total)

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
  const jobTimes = ['8:00 AM', '11:00 AM', '2:30 PM', '4:00 PM', '9:00 AM']

  // Flat cards — no boxShadow
  const card: React.CSSProperties = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '16px', overflow: 'hidden' }
  const cardP: React.CSSProperties = { ...card, padding: '18px' }

  function statusPill(d: string | null) {
    if (!d) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }
    const days = getDays(d)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#991B1B' }
    if (days <= 7) return { label: 'This week', bg: '#E6F7F6', color: TEAL_DARK }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#92400E' }
    return { label: 'Scheduled', bg: '#F1F5F9', color: TEXT3 }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard"/>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard"/>

      {/* No height:100vh / overflow:scroll — browser handles scroll natively */}
      <div style={{ flex: 1, minWidth: 0, background: BG }}>
        <div style={{ padding: isMobile ? '14px' : '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: isMobile ? 'calc(120px + env(safe-area-inset-bottom))' : '60px' }}>

          {/* ── HEADER ──────────────────────────────────────────────────── */}
          <div style={{ ...card, padding: isMobile ? '18px 16px 16px' : '22px 24px 20px', background: HEADER_BG, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '26px' : '34px', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 900, color: WHITE, marginBottom: '8px' }}>Dashboard</div>
            <div style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', maxWidth: '760px' }}>
              Track customers, service due dates, invoices, and jobs from one control centre.
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/dashboard/jobs')} style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px', background: TEAL, color: WHITE, border: 'none', borderRadius: '10px' }}>
                <IconSpark size={14}/> Add job
              </button>
              <button onClick={() => router.push('/dashboard/quotes')} style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px' }}>
                <IconInvoice size={14}/> New quote
              </button>
              <button onClick={() => router.push('/dashboard/schedule')} style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px' }}>
                <IconCalendar size={14}/> Schedule
              </button>
            </div>
          </div>

          {/* ── ROW 1: 4 stat cards — 1-col on mobile, 4-col on desktop ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '12px' }}>

            {/* 1. TODAY'S JOBS — radial gauges from v3 */}
            <div style={cardP}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ ...TYPE.label }}>Today's Jobs</div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: TEXT3 }}>{stats.jobsThisMonth}</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', marginBottom: '14px' }}>
                <span>{stats.jobsThisMonth}</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: TEXT3 }}> Jobs Scheduled</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '14px' }}>
                <RadialGauge value={inProgressCount} label="In Progress" color={TEAL} size={76}/>
                <RadialGauge value={dueSoonCount} label="Upcoming" color={TEAL_DARK} size={76}/>
                <RadialGauge value={completedCount} label="Completed" color="#94A3B8" size={76}/>
              </div>
              <button onClick={() => router.push('/dashboard/schedule')}
                style={{ width: '100%', height: '36px', background: TEAL, color: WHITE, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                View schedule
              </button>
            </div>

            {/* 2. REVENUE STAT — sparkline + legend from v3 */}
            <div style={cardP}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ ...TYPE.label }}>Revenue Stat</div>
                <button onClick={() => router.push('/dashboard/revenue')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT3, padding: 0 }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em' }}>
                  ${invoiceStats.collected > 0 ? (invoiceStats.collected / 1000).toFixed(1) + 'k' : '0'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT3, marginLeft: 6 }}>this month</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '10px', padding: '3px 7px', borderRadius: '6px', background: '#E6F7F6' }}>
                <span style={{ color: TEAL }}><IconTrendUp size={11}/></span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: TEAL_DARK }}>
                  ${invoiceStats.outstanding > 0 ? (invoiceStats.outstanding / 1000).toFixed(1) + 'k' : '0'} vs last month
                </span>
              </div>
              <Sparkline data={sparkData} color={TEAL} width={160} height={50}/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                {revenueBreakdown.slice(0, 3).map(rb => (
                  <div key={rb.label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: rb.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: TEXT2, flex: 1 }}>{rb.label}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: TEXT3 }}>${(rb.value / 1000).toFixed(1)}k</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. NEW LEADS / CUSTOMERS — from v3 */}
            <div style={cardP}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ ...TYPE.label }}>New Leads</div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: TEXT3 }}>{stats.customers}</span>
              </div>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em' }}>
                  {stats.customers > 0 ? (stats.customers >= 1000 ? (stats.customers / 1000).toFixed(1) + 'k' : stats.customers) : '0'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT3, marginLeft: 6 }}>this week</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '14px' }}>
                {revenueBreakdown.map(rb => (
                  <div key={rb.label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: rb.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: TEXT2, flex: 1 }}>{rb.label}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: TEXT }}>${(rb.value / 1000).toFixed(1)}k</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: `1px solid ${BORDER}`, fontSize: '11px', fontWeight: 600, color: TEXT3 }}>
                {stats.units} units tracked in CRM
              </div>
            </div>

            {/* 4. URGENT ISSUES — from v3 */}
            <div style={cardP}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ ...TYPE.label }}>Urgent Issues</div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#B91C1C' }}>{stats.overdue + invoiceStats.overdueCount}</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', marginBottom: '16px' }}>
                {stats.overdue > 0
                  ? <><span style={{ color: '#B91C1C' }}>{stats.overdue}</span> Overdue Service{stats.overdue !== 1 ? 's' : ''}</>
                  : <span style={{ color: TEAL }}>All Clear</span>
                }
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div onClick={() => router.push('/dashboard/jobs')}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FECACA', cursor: 'pointer' }}>
                  <span style={{ color: '#B91C1C', flexShrink: 0 }}><IconAlert size={15}/></span>
                  <div style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: '#7F1D1D' }}>
                    {stats.overdue > 0
                      ? <><span style={{ fontWeight: 900 }}>{stats.overdue} Job{stats.overdue !== 1 ? 's' : ''}</span> Overdue</>
                      : 'No overdue jobs'}
                  </div>
                  <IconChevronRight size={13}/>
                </div>
                <div onClick={() => router.push('/dashboard/invoices')}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FECACA', cursor: 'pointer' }}>
                  <span style={{ color: '#B91C1C', flexShrink: 0 }}><IconAlert size={15}/></span>
                  <div style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: '#7F1D1D' }}>
                    {invoiceStats.outstanding > 0
                      ? <><span style={{ fontWeight: 900 }}>${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</span> Overdue Invoices</>
                      : 'No overdue invoices'}
                  </div>
                  <IconChevronRight size={13}/>
                </div>
              </div>
              <button onClick={() => router.push('/dashboard/jobs')}
                style={{ width: '100%', height: '34px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2 }}>
                View all
              </button>
            </div>
          </div>

          {/* ── ROW 2: Upcoming appointments + Revenue Stats ─────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 290px', gap: '14px', alignItems: 'start' }}>

            {/* UPCOMING APPOINTMENTS */}
            <div style={card}>
              <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT }}>Upcoming appointments</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Today', val: upcoming.filter(j => getDays(j.next_service_date || '') === 0).length },
                    { label: 'Due', val: stats.overdue },
                    { label: 'Scheduled', val: stats.units },
                    { label: 'Soon', val: dueSoonCount },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: TEXT3, fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 900, color: TEXT }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {upcoming.length === 0 ? (
                <div style={{ padding: '32px 18px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No upcoming appointments.</div>
              ) : upcoming.slice(0, 4).map((job, i) => {
                const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                const isFirst = i === 0
                const time = jobTimes[i % jobTimes.length]
                const brand = job.brand ? `${job.brand}${job.capacity_kw ? ' ' + job.capacity_kw + 'kW' : ''}` : job.job_type || 'Service'
                return (
                  <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                    style={{ display: 'grid', gridTemplateColumns: isMobile ? '60px 1fr auto' : '72px 1fr auto auto', gap: '10px', alignItems: 'center', padding: '13px 18px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.background = WHITE)}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: isFirst ? TEXT : TEXT3, whiteSpace: 'nowrap' }}>{time}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: isFirst ? TEAL : TEXT }}>{name}</span>
                        <span style={{ fontSize: '11px', color: TEXT3 }}>{job.customers?.suburb || ''}</span>
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : 'No date'} · {brand}
                      </div>
                    </div>
                    {!isMobile && <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, whiteSpace: 'nowrap' }}>{job.job_type || 'Service'}</div>}
                    {isFirst ? (
                      <button onClick={e => { e.stopPropagation(); router.push(`/dashboard/customers/${job.customer_id}`) }}
                        style={{ height: '30px', padding: '0 10px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                        Start Job <IconChevronRight size={11}/>
                      </button>
                    ) : <div style={{ color: TEXT3 }}><IconChevronRight size={13}/></div>}
                  </div>
                )
              })}

              <div style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {([['next7', 'Next 7 Days'], ['due', 'Jobs Due'], ['attime', 'At time']] as const).map(([key, lbl]) => (
                      <button key={key} onClick={() => setActiveTab(key)}
                        style={{ height: '28px', padding: '0 9px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, border: `1px solid ${activeTab === key ? TEAL : BORDER}`, background: activeTab === key ? '#E6F7F6' : WHITE, color: activeTab === key ? TEAL_DARK : TEXT3 }}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => router.push('/dashboard/jobs')}
                    style={{ height: '28px', padding: '0 9px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    View all <IconArrow size={11}/>
                  </button>
                </div>
                <MonthlyBarChart data={monthlyData}/>
              </div>
            </div>

            {/* REVENUE STATS */}
            <div style={cardP}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT, marginBottom: '16px' }}>Revenue Stats</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <DonutChart segments={revenueBreakdown} size={180} thickness={28}/>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {revenueBreakdown.map(rb => (
                  <div key={rb.label} onClick={() => router.push('/dashboard/revenue')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: rb.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT, flex: 1 }}>{rb.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: TEXT2 }}>${(rb.value / 1000).toFixed(1)}k</span>
                    <IconChevronRight size={12}/>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '12px', padding: '12px', borderRadius: '11px', background: '#E6F7F6', border: '1px solid #C4E8E5' }}>
                <div style={{ ...TYPE.label, marginBottom: '3px' }}>Total collected</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em' }}>
                  ${invoiceStats.collected > 0 ? invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 }) : '0'}
                </div>
                <div style={{ ...TYPE.bodySm, marginTop: '2px' }}>{invoiceStats.paidCount} paid invoices</div>
              </div>
            </div>
          </div>

          {/* ── ROW 3: Recent Customers + Unpaid Invoices ─────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: '14px', alignItems: 'start' }}>

            {/* RECENT CUSTOMERS */}
            <div style={card}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Recent customers</div>
                <button onClick={() => router.push('/dashboard/customers')}
                  style={{ height: '28px', padding: '0 9px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  View all <IconArrow size={11}/>
                </button>
              </div>
              {recent.length === 0 ? (
                <div style={{ padding: '28px 18px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No customers yet.</div>
              ) : recent.map((job, i) => {
                const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
                const sp = statusPill(job.next_service_date)
                const avBg = ['#E8F4F1', '#EEF2F6', '#E6F7F6', '#F1F5F9', '#E8F4F1'][i % 5]
                const avColor = ['#0A4F4C', '#334155', '#177A72', '#475569', '#1F9E94'][i % 5]
                return (
                  <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                    style={{ display: 'grid', gridTemplateColumns: isMobile ? 'auto 1fr auto' : 'auto 1fr 120px 110px auto', gap: '12px', alignItems: 'center', padding: '12px 18px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.background = WHITE)}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: avBg, color: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                      <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        {job.customers?.suburb && <span>{job.customers.suburb}</span>}
                        {job.customers?.phone && !isMobile && <><span>·</span><span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><IconPhone size={11}/>{job.customers.phone}</span></>}
                      </div>
                    </div>
                    {!isMobile && (
                      <>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>Unit</div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.brand || 'Unit'}{job.capacity_kw ? ` ${job.capacity_kw}kW` : ''}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>Next service</div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT2 }}>
                            {job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'}
                          </div>
                        </div>
                      </>
                    )}
                    <span style={{ padding: '4px 9px', borderRadius: '999px', background: sp.bg, color: sp.color, fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap' }}>{sp.label}</span>
                  </div>
                )
              })}
            </div>

            {/* UNPAID INVOICES */}
            <div style={card}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Unpaid invoices</div>
                <button onClick={() => router.push('/dashboard/invoices')}
                  style={{ height: '28px', padding: '0 9px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  View all <IconArrow size={11}/>
                </button>
              </div>
              <div style={{ padding: '12px 18px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: invoiceStats.outstanding > 0 ? '#991B1B' : TEXT, letterSpacing: '-0.04em' }}>
                  ${invoiceStats.outstanding > 0 ? invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 }) : '0'}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>outstanding · {invoiceStats.overdueCount} overdue</div>
              </div>
              {invoiceStats.allInvoices.length === 0 ? (
                <div style={{ padding: '24px 18px', textAlign: 'center', color: TEXT3, fontSize: '12px', fontWeight: 600 }}>
                  <div style={{ fontSize: '22px', marginBottom: 6 }}>✓</div>All invoices paid
                </div>
              ) : invoiceStats.allInvoices.map((inv, i) => {
                const name = `${inv.customers?.first_name || ''} ${inv.customers?.last_name || ''}`.trim() || 'Customer'
                const isOverdue = inv.status === 'overdue'
                const amt = Number(inv.total || 0) - Number(inv.amount_paid || 0)
                return (
                  <div key={inv.id || i} onClick={() => router.push('/dashboard/invoices')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.background = WHITE)}>
                    <div style={{ width: 32, height: 32, borderRadius: '9px', background: isOverdue ? '#FEF2F2' : '#F8FAFC', border: `1px solid ${isOverdue ? '#FECACA' : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isOverdue ? '#B91C1C' : TEXT3, flexShrink: 0 }}>
                      <IconInvoice size={14}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                      <div style={{ fontSize: '10px', color: TEXT3, marginTop: '1px' }}>
                        {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : ''} · {inv.job_type || 'Invoice'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: isOverdue ? '#991B1B' : TEXT }}>${amt.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</div>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '5px', background: isOverdue ? '#FEE2E2' : '#FEF3C7', color: isOverdue ? '#991B1B' : '#92400E' }}>
                        {isOverdue ? 'Overdue' : 'Sent'}
                      </span>
                    </div>
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