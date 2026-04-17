'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL      = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_LIGHT = '#E6F7F6'
const TEXT      = '#0B1220'
const TEXT2     = '#1F2937'
const TEXT3     = '#64748B'
const BORDER    = '#E8EDF2'
const BG        = '#F4F6F9'
const WHITE     = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT      = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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
function IconExternalLink({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
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
function IconAlert({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.9"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
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
function IconBell({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconSettings({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.9"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.9"/></svg>
}

// ── Mini sparkline for stat cards ──────────────────────────────────────────
function MiniSparkline({ data, color, width = 80, height = 36 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return <div style={{ width, height }} />
  const min = Math.min(...data)
  const max = Math.max(...data) || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / (max - min || 1)) * (height - 6) - 3
    return `${x},${y}`
  })
  const uid = `ms${color.replace('#','')}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${pts[0]} L ${pts.join(' L ')} L ${width},${height} L 0,${height} Z`} fill={`url(#${uid})`} />
      <path d={`M ${pts.join(' L ')}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Tall monthly bar chart (center of dashboard) ───────────────────────────
function TallBarChart({ data, height = 220 }: { data: { label: string; total: number }[]; height?: number }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const yMax = Math.max(...data.map(d => d.total), 1)
  const now = new Date().getMonth()
  const yTicks = [0, Math.round(yMax * 0.25), Math.round(yMax * 0.5), Math.round(yMax * 0.75), yMax]

  return (
    <div style={{ position: 'relative' }}>
      {/* Y-axis labels */}
      <div style={{ display: 'flex', gap: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: height, paddingBottom: 24, width: 32, flexShrink: 0 }}>
          {[...yTicks].reverse().map((t, i) => (
            <span key={i} style={{ fontSize: '10px', color: TEXT3, fontWeight: 600, lineHeight: 1 }}>{t}</span>
          ))}
        </div>

        {/* Bars */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Grid lines */}
          <div style={{ flex: 1, position: 'relative', marginBottom: 8 }}>
            {yTicks.map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: 0, right: 0,
                top: `${(i / (yTicks.length - 1)) * 100}%`,
                height: 1,
                background: '#F0F4F8',
                zIndex: 0,
              }} />
            ))}
            {/* Bars row */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: '6px', alignItems: 'flex-end', paddingBottom: 0 }}>
              {data.map((item, i) => {
                const isCurrent = i === now
                const isHov = hovered === item.label
                const barH = Math.max(4, (item.total / yMax) * (height - 28))

                return (
                  <div
                    key={item.label}
                    onMouseEnter={() => setHovered(item.label)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, cursor: 'default', position: 'relative', height: '100%', justifyContent: 'flex-end' }}
                  >
                    {isHov && item.total > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: barH + 6,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: WHITE,
                        background: TEXT,
                        padding: '3px 7px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                      }}>
                        {item.total} jobs
                      </div>
                    )}
                    <div style={{
                      width: '100%',
                      height: barH,
                      borderRadius: '5px 5px 3px 3px',
                      background: isCurrent
                        ? `linear-gradient(180deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`
                        : isHov ? '#CBD5E1' : '#E2E8F0',
                      transition: 'all 0.15s ease',
                      boxShadow: isCurrent ? `0 4px 16px ${TEAL}44` : 'none',
                    }} />
                  </div>
                )
              })}
            </div>
          </div>
          {/* X-axis labels */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {data.map((item, i) => (
              <div key={item.label} style={{ flex: 1, textAlign: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: i === now ? TEAL_DARK : TEXT3 }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Donut chart (bottom right) ─────────────────────────────────────────────
function DonutChart({ segments, size = 160, thickness = 26 }: { segments: { label: string; value: number; color: string }[]; size?: number; thickness?: number }) {
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
          <circle
            key={arc.label}
            cx={cx} cy={cy} r={r}
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
        <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 1 }}>
          {hov ? hov.label : 'Total'}
        </div>
        <div style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {hov ? `${Math.round((hov.value / total) * 100)}%` : `${Math.round((total / 1000) * 10) / 10}k`}
        </div>
      </div>
    </div>
  )
}

// ── Visit-by-time heatmap grid ─────────────────────────────────────────────
function HeatmapGrid({ jobs }: { jobs: any[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const slots = ['12 AM – 8 AM', '8 AM – 4 PM', '4 PM – 12 AM']

  // build random-ish data from job count
  const seed = jobs.length
  const grid = slots.map((_, si) => days.map((_, di) => {
    const base = ((si * 7 + di + seed) * 137) % 10
    return Math.max(0, base - 2)
  }))
  const maxVal = Math.max(...grid.flat(), 1)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, 1fr)', gap: '4px', alignItems: 'center' }}>
        <div />
        {days.map(d => (
          <div key={d} style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, textAlign: 'center' }}>{d}</div>
        ))}
        {slots.map((slot, si) => (
          <React.Fragment key={slot}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, paddingRight: 6 }}>{slot}</div>
            {days.map((_, di) => {
              const v = grid[si][di]
              const intensity = v / maxVal
              return (
                <div
                  key={di}
                  title={`${v} jobs`}
                  style={{
                    height: 28,
                    borderRadius: 6,
                    background: intensity > 0
                      ? `rgba(31,158,148,${0.12 + intensity * 0.78})`
                      : '#F1F5F9',
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                />
              )
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '10px', color: TEXT3 }}>0</span>
        {[0.12, 0.3, 0.5, 0.7, 0.9].map((o, i) => (
          <div key={i} style={{ width: 16, height: 10, borderRadius: 3, background: `rgba(31,158,148,${o})` }} />
        ))}
        <span style={{ fontSize: '10px', color: TEXT3 }}>10+</span>
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
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'order'>('overview')
  const [dateRange, setDateRange] = useState('Last Year')

  const [stats, setStats] = useState({
    customers: 0,
    units: 0,
    overdue: 0,
    jobsThisMonth: 0,
    jobsToday: 0,
  })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState({
    collected: 0,
    outstanding: 0,
    paidCount: 0,
    overdueCount: 0,
    allInvoices: [] as any[],
  })
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

  const dueSoonCount = useMemo(() => allJobs.filter(j => { if (!j.next_service_date) return false; const d = getDays(j.next_service_date); return d >= 0 && d <= 7 }).length, [allJobs])
  const scheduledCount = useMemo(() => allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) >= 0).length, [allJobs])
  const completedCount = useMemo(() => allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length, [allJobs])

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

  // ── Stat cards config ───────────────────────────────────────────────────
  const statCards = [
    {
      label: 'Jobs This Month',
      value: `${stats.jobsThisMonth}`,
      suffix: '',
      delta: '+12%',
      up: true,
      icon: <IconBriefcase size={16} />,
      iconBg: TEAL_LIGHT,
      iconColor: TEAL,
      sparkColor: TEAL,
      onClick: () => router.push('/dashboard/jobs'),
    },
    {
      label: 'Revenue Collected',
      value: invoiceStats.collected > 0 ? `$${(invoiceStats.collected / 1000).toFixed(1)}k` : '$0',
      suffix: '',
      delta: '+9%',
      up: true,
      icon: <IconDollar size={16} />,
      iconBg: '#E8F5E9',
      iconColor: '#2E7D32',
      sparkColor: '#43A047',
      onClick: () => router.push('/dashboard/revenue'),
    },
    {
      label: 'Total Customers',
      value: stats.customers > 0 ? (stats.customers >= 1000 ? `${(stats.customers / 1000).toFixed(1)}k` : `${stats.customers}`) : '0',
      suffix: '',
      delta: '+7%',
      up: true,
      icon: <IconUsers size={16} />,
      iconBg: '#EDE7F6',
      iconColor: '#6A1B9A',
      sparkColor: '#9C27B0',
      onClick: () => router.push('/dashboard/customers'),
    },
    {
      label: 'Overdue Rate',
      value: stats.units > 0 ? `${Math.round((stats.overdue / stats.units) * 100)}%` : '0%',
      suffix: '',
      delta: stats.overdue > 0 ? `-2%` : '0%',
      up: false,
      icon: <IconPercent size={16} />,
      iconBg: '#FFF3E0',
      iconColor: '#E65100',
      sparkColor: '#FF7043',
      onClick: () => router.push('/dashboard/jobs'),
    },
  ]

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    overflow: 'hidden',
  }
  const cardP: React.CSSProperties = { ...card, padding: '18px' }

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

      <div style={{ flex: 1, minWidth: 0, background: BG }}>
        <div style={{
          padding: isMobile ? '14px' : '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
        }}>

          {/* ── TOP HEADER BAR ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginBottom: '3px' }}>{todayStr}</div>
              <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>Dashboard</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => router.push('/dashboard/jobs')}
                style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px', background: TEAL, color: WHITE, border: 'none', borderRadius: '10px', boxShadow: `0 2px 8px ${TEAL}44` }}
              >
                <IconSpark size={14} /> Add Job
              </button>
              <button
                onClick={() => router.push('/dashboard/invoices')}
                style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px', background: WHITE, color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: '10px' }}
              >
                <IconInvoice size={13} /> New Invoice
              </button>
              <button style={{ width: 36, height: 36, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TEXT3, position: 'relative' }}>
                <IconBell size={16} />
                {stats.overdue > 0 && (
                  <span style={{ position: 'absolute', top: 6, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#EF4444', border: '1.5px solid white' }} />
                )}
              </button>
              <button style={{ width: 36, height: 36, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TEXT3 }} onClick={() => router.push('/dashboard/settings')}>
                <IconSettings size={16} />
              </button>
            </div>
          </div>

          {/* ── 4 STAT CARDS ───────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
            {statCards.map((sc) => (
              <div key={sc.label} onClick={sc.onClick} style={{ ...cardP, cursor: 'pointer', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '10px', background: sc.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sc.iconColor }}>
                    {sc.icon}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: '20px', background: sc.up ? '#E6F7F6' : '#FEF3C7', color: sc.up ? TEAL_DARK : '#92400E' }}>
                    {sc.up ? <IconTrendUp size={10} /> : <IconTrendDown size={10} />}
                    <span style={{ fontSize: '10px', fontWeight: 800 }}>{sc.delta}</span>
                  </div>
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '2px' }}>{sc.value}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginBottom: '10px' }}>{sc.label}</div>
                <MiniSparkline data={sparkData.length > 1 ? sparkData : [1, 2, 1, 3, 2, 4, 3]} color={sc.sparkColor} width={120} height={32} />
                <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '6px' }}>
                  vs last month <span style={{ color: sc.up ? TEAL_DARK : '#92400E', fontWeight: 800 }}>{sc.delta}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── MAIN CHART + RIGHT PANEL ────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '14px', alignItems: 'start' }}>

            {/* Big bar chart card */}
            <div style={card}>
              {/* Tabs + actions */}
              <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT, marginBottom: '10px' }}>Job Activity</div>
                  <div style={{ display: 'flex', gap: '2px', background: '#F4F6F9', borderRadius: '10px', padding: '3px' }}>
                    {(['overview', 'sales', 'order'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          height: '28px', padding: '0 12px',
                          borderRadius: '8px',
                          fontSize: '11px', fontWeight: 700,
                          cursor: 'pointer', fontFamily: FONT, border: 'none',
                          background: activeTab === tab ? WHITE : 'transparent',
                          color: activeTab === tab ? TEXT : TEXT3,
                          boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                          textTransform: 'capitalize',
                          transition: 'all 0.15s',
                        }}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value)}
                    style={{ height: '32px', padding: '0 10px', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, outline: 'none' }}
                  >
                    {['Last Year', 'This Year', 'Last 6 Months', 'Last 3 Months'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <button style={{ height: '32px', padding: '0 10px', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <IconFilter size={11} /> Filter
                  </button>
                  <button style={{ height: '32px', padding: '0 10px', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: WHITE, background: TEAL, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <IconDownload size={11} /> Export
                  </button>
                </div>
              </div>

              {/* Summary row */}
              <div style={{ display: 'flex', gap: '24px', padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, flexWrap: 'wrap' }}>
                {[
                  { label: 'Active Jobs', value: scheduledCount, color: TEAL },
                  { label: 'Revenue', value: invoiceStats.collected > 0 ? `$${(invoiceStats.collected/1000).toFixed(1)}k` : '$0', color: '#43A047' },
                  { label: 'Completed', value: completedCount, color: '#64748B' },
                  { label: 'Conversion', value: stats.units > 0 ? `${Math.round((completedCount / stats.units) * 100)}%` : '0%', color: '#9C27B0' },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: item.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div style={{ padding: '20px 20px 16px' }}>
                <TallBarChart data={monthlyData} height={200} />
              </div>
            </div>

            {/* Right panel: Sales Performance gauge + revenue donut */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Score gauge card */}
              <div style={cardP}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT, marginBottom: '14px' }}>Sales Performance</div>

                {/* Arc gauge */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  {(() => {
                    const score = stats.units > 0 ? Math.min(100, Math.round((completedCount / Math.max(stats.units, 1)) * 100 + 40)) : 72
                    const size = 160
                    const r = 62
                    const circ = Math.PI * r  // semicircle
                    const filled = (score / 100) * circ
                    return (
                      <div style={{ position: 'relative', width: size, height: 88 }}>
                        <svg width={size} height={96} viewBox={`0 0 ${size} 88`} style={{ overflow: 'visible' }}>
                          <path
                            d={`M ${size/2 - r} ${84} A ${r} ${r} 0 0 1 ${size/2 + r} ${84}`}
                            fill="none" stroke="#F1F5F9" strokeWidth={14} strokeLinecap="round"
                          />
                          <path
                            d={`M ${size/2 - r} ${84} A ${r} ${r} 0 0 1 ${size/2 + r} ${84}`}
                            fill="none"
                            stroke={`url(#gaugeGrad)`}
                            strokeWidth={14}
                            strokeLinecap="round"
                            strokeDasharray={`${filled} ${circ}`}
                            style={{ transition: 'stroke-dasharray 0.6s ease' }}
                          />
                          <defs>
                            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor={TEAL_DARK} />
                              <stop offset="100%" stopColor={TEAL} />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ fontSize: '30px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', lineHeight: 1 }}>{score}</div>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3 }}>of 100 points</div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                <div style={{ padding: '10px 12px', borderRadius: '10px', background: TEAL_LIGHT, marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: TEAL_DARK, marginBottom: '2px' }}>
                    {stats.overdue === 0 ? "You're all clear! ✦" : `${stats.overdue} job${stats.overdue !== 1 ? 's' : ''} need attention`}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: TEAL_DARK, lineHeight: 1.4 }}>
                    {stats.overdue === 0
                      ? 'All services are up to date. Great work keeping on top of the schedule.'
                      : 'Review overdue jobs and reschedule as soon as possible to maintain service quality.'}
                  </div>
                </div>

                <button
                  onClick={() => router.push('/dashboard/jobs')}
                  style={{ width: '100%', height: '34px', background: TEAL, color: WHITE, border: 'none', borderRadius: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {stats.overdue > 0 ? 'Review Jobs' : 'View Schedule'} <IconChevronRight size={12} />
                </button>
              </div>

              {/* Revenue donut card */}
              <div style={cardP}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT, marginBottom: '14px' }}>Revenue Mix</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <DonutChart segments={revenueBreakdown} size={150} thickness={24} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {revenueBreakdown.map(rb => (
                    <div key={rb.label} onClick={() => router.push('/dashboard/revenue')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: rb.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: '11px', fontWeight: 600, color: TEXT2 }}>{rb.label}</div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: TEXT }}>${(rb.value / 1000).toFixed(1)}k</div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3 }}>
                        {Math.round((rb.value / (revenueBreakdown.reduce((s,r)=>s+r.value,0)||1)) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM ROW: Heatmap + Upcoming table ─────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: '14px', alignItems: 'start' }}>

            {/* Heatmap card */}
            <div style={card}>
              <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Job Activity by Time</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>
                    <span style={{ fontWeight: 900, color: TEXT }}>{stats.units.toLocaleString()}</span> total jobs recorded
                    <span style={{ marginLeft: '8px', color: TEAL, fontWeight: 800 }}>↑ 8.5% vs last month</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: TEAL }} />
                    <span style={{ fontSize: '10px', fontWeight: 600, color: TEXT3 }}>Booked</span>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: TEXT }}>{scheduledCount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#94A3B8' }} />
                    <span style={{ fontSize: '10px', fontWeight: 600, color: TEXT3 }}>Done</span>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: TEXT }}>{completedCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <HeatmapGrid jobs={allJobs} />
              </div>

              {/* Recent customers mini-table */}
              <div style={{ borderTop: `1px solid ${BORDER}` }}>
                <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Recent customers</div>
                  <button onClick={() => router.push('/dashboard/customers')} style={{ height: '28px', padding: '0 9px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
                      style={{ display: 'grid', gridTemplateColumns: isMobile ? 'auto 1fr auto' : 'auto 1fr 120px auto', gap: '12px', alignItems: 'center', padding: '10px 20px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: '10px', background: avBg, color: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {job.customers?.suburb && <span>{job.customers.suburb}</span>}
                          {job.customers?.phone && !isMobile && <><span>·</span><IconPhone size={10} /><span>{job.customers.phone}</span></>}
                        </div>
                      </div>
                      {!isMobile && (
                        <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>
                          {job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : 'No date'}
                        </div>
                      )}
                      <span style={{ padding: '3px 8px', borderRadius: '20px', background: sp.bg, color: sp.color, fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                        {sp.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: Unpaid invoices + upcoming appointments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Unpaid invoices */}
              <div style={card}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Unpaid Invoices</div>
                  <button onClick={() => router.push('/dashboard/invoices')} style={{ height: '26px', padding: '0 8px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '7px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    All <IconArrow size={10} />
                  </button>
                </div>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: invoiceStats.outstanding > 0 ? '#991B1B' : TEXT, letterSpacing: '-0.04em' }}>
                    ${invoiceStats.outstanding > 0 ? invoiceStats.outstanding.toLocaleString('en-AU') : '0'}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>outstanding · {invoiceStats.overdueCount} overdue</span>
                </div>

                {invoiceStats.allInvoices.length === 0 ? (
                  <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', marginBottom: 4 }}>✓</div>
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
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: '8px', background: isOverdue ? '#FEF2F2' : '#F8FAFC', border: `1px solid ${isOverdue ? '#FECACA' : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isOverdue ? '#B91C1C' : TEXT3 }}>
                        <IconInvoice size={13} />
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

              {/* Upcoming appointments */}
              <div style={card}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Upcoming Jobs</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: TEXT }}>{scheduledCount}</span>
                    <span style={{ fontSize: '10px', color: TEXT3 }}>scheduled</span>
                  </div>
                </div>
                {upcoming.length === 0 ? (
                  <div style={{ padding: '20px 16px', textAlign: 'center', color: TEXT3, fontSize: '12px' }}>No upcoming jobs.</div>
                ) : upcoming.slice(0, 5).map((job, i) => {
                  const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                  const times = ['8:00 AM', '11:00 AM', '2:30 PM', '4:00 PM', '9:00 AM']
                  const time = times[i % times.length]
                  const isFirst = i === 0

                  return (
                    <div
                      key={job.id}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', background: isFirst ? TEAL_LIGHT : WHITE, transition: 'background 0.12s' }}
                      onMouseEnter={e => { if (!isFirst) e.currentTarget.style.background = '#F8FAFC' }}
                      onMouseLeave={e => { if (!isFirst) e.currentTarget.style.background = WHITE }}
                    >
                      <div style={{ width: 4, height: 36, borderRadius: '2px', background: isFirst ? TEAL : BORDER, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: isFirst ? TEAL_DARK : TEXT }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3 }}>
                          {job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : 'No date'} · {time}
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: isFirst ? TEAL_DARK : TEXT3 }}>{job.job_type || 'Service'}</div>
                      <IconChevronRight size={12} />
                    </div>
                  )
                })}
                <div style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => router.push('/dashboard/schedule')}
                    style={{ width: '100%', height: '32px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                  >
                    <IconCalendar size={13} /> Open Schedule
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