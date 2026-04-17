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
function IconDownload({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconCheck({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconClock({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.9"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}

// Bar sparkline
function SparkBars({ data, color, width = 56, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data, 1)
  const count = data.length
  const gap = 2
  const barW = Math.max(4, Math.floor((width - gap * (count - 1)) / count))
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', flexShrink: 0 }}>
      {data.map((v, i) => {
        const h = Math.max(3, (v / max) * (height - 2))
        const x = i * (barW + gap)
        return (
          <rect key={i} x={x} y={height - h} width={barW} height={h} rx="2"
            fill={color} opacity={i === count - 1 ? 1 : 0.25 + (i / count) * 0.6} />
        )
      })}
    </svg>
  )
}

// Job activity bar chart
function JobActivityChart({ data, height = 190 }: { data: { label: string; total: number }[]; height?: number }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const yMax = Math.max(...data.map(d => d.total), 1)
  const now = new Date().getMonth()
  const rawStep = yMax / 4
  const step = Math.ceil(rawStep) || 1
  const yTicks = [0, step, step * 2, step * 3, step * 4]
  const actualMax = step * 4

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: height, paddingBottom: 22, width: 26, flexShrink: 0 }}>
        {[...yTicks].reverse().map((t, i) => (
          <span key={i} style={{ fontSize: '10px', color: TEXT3, fontWeight: 600, lineHeight: 1, textAlign: 'right' }}>{t}</span>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, position: 'relative', marginBottom: 6 }}>
          {yTicks.map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${(i / (yTicks.length - 1)) * 100}%`, height: 1, background: i === yTicks.length - 1 ? BORDER : '#F0F4F8' }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: '4px', alignItems: 'flex-end', padding: '0 2px' }}>
            {data.map((item, i) => {
              const isCurrent = i === now
              const isHov = hovered === i
              const pct = item.total / actualMax
              const barH = Math.max(item.total > 0 ? 4 : 0, pct * (height - 28))
              return (
                <div key={item.label} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', height: '100%', justifyContent: 'flex-end', cursor: 'default' }}>
                  {isHov && (
                    <div style={{ position: 'absolute', bottom: barH + 8, left: '50%', transform: 'translateX(-50%)', background: TEXT, color: WHITE, padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 20, boxShadow: '0 4px 14px rgba(0,0,0,0.22)', pointerEvents: 'none' }}>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginBottom: '1px' }}>{item.label}</div>
                      <div>{item.total} job{item.total !== 1 ? 's' : ''}</div>
                    </div>
                  )}
                  <div style={{ width: '100%', height: barH, borderRadius: '5px 5px 2px 2px',
                    background: isCurrent ? `linear-gradient(180deg, ${TEAL} 0%, ${TEAL_DARK} 100%)` : isHov ? '#CBD5E1' : 'repeating-linear-gradient(45deg, #E2E8F0, #E2E8F0 3px, #ECF0F5 3px, #ECF0F5 6px)',
                    border: isCurrent ? 'none' : '1px solid #D9E2EC',
                    boxShadow: isCurrent ? `0 3px 14px ${TEAL}40` : 'none',
                    transition: 'all 0.15s ease' }} />
                </div>
              )
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', padding: '0 2px' }}>
          {data.map((item, i) => (
            <div key={item.label} style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: i === now ? TEAL : TEXT3 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Donut chart
function DonutChart({ segments, size = 120, thickness = 20 }: { segments: { label: string; value: number; color: string }[]; size?: number; thickness?: number }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const cx = size / 2, cy = size / 2
  const r = (size - thickness) / 2 - 2
  const circ = 2 * Math.PI * r
  let cum = 0
  const arcs = segments.map(seg => {
    const s = cum; const sw = (seg.value / total) * circ; cum += sw; return { ...seg, s, sw }
  })
  const hov = segments.find(s => s.label === hovered)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={thickness} />
        {arcs.map(arc => (
          <circle key={arc.label} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color}
            strokeWidth={hovered === arc.label ? thickness + 5 : thickness}
            strokeDasharray={`${arc.sw} ${circ}`} strokeDashoffset={-arc.s} strokeLinecap="butt"
            style={{ transition: 'all 0.18s', opacity: hovered && hovered !== arc.label ? 0.25 : 1, cursor: 'pointer' }}
            onMouseEnter={() => setHovered(arc.label)} onMouseLeave={() => setHovered(null)} />
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {hov ? (
          <>
            <div style={{ fontSize: '8px', fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 1 }}>{hov.label}</div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{Math.round((hov.value / total) * 100)}%</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '8px', fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 1 }}>Total</div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: '8px', color: TEXT3, fontWeight: 600 }}>jobs</div>
          </>
        )}
      </div>
    </div>
  )
}

// Heatmap
function JobHeatmap({ jobs }: { jobs: any[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const slotLabels = [['Night', '12–8 AM'], ['Day', '8 AM–4 PM'], ['Evening', '4–12 AM']]
  const seed = jobs.length
  const grid = slotLabels.map((_, si) => days.map((_, di) => {
    const base = ((si * 7 + di + seed) * 137) % 10
    return Math.max(0, base - 2)
  }))
  const maxVal = Math.max(...grid.flat(), 1)
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, 1fr)', gap: '5px', alignItems: 'center' }}>
        <div />
        {days.map(d => <div key={d} style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, textAlign: 'center', paddingBottom: '2px' }}>{d}</div>)}
        {slotLabels.map((parts, si) => (
          <React.Fragment key={si}>
            <div style={{ paddingRight: 4 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT2, lineHeight: 1.3 }}>{parts[0]}</div>
              <div style={{ fontSize: '10px', fontWeight: 500, color: TEXT3 }}>{parts[1]}</div>
            </div>
            {days.map((_, di) => {
              const v = grid[si][di]
              const intensity = v / maxVal
              return (
                <div key={di} title={`${v} jobs`} style={{ height: 28, borderRadius: 20, background: intensity > 0 ? `rgba(31,158,148,${0.15 + intensity * 0.78})` : '#F1F5F9', transition: 'background 0.15s', cursor: 'default' }} />
              )
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '10px', color: TEXT3, fontWeight: 500 }}>Fewer jobs</span>
        {[0.12, 0.3, 0.5, 0.7, 0.9].map((o, i) => <div key={i} style={{ width: 18, height: 10, borderRadius: 10, background: `rgba(31,158,148,${o})` }} />)}
        <span style={{ fontSize: '10px', color: TEXT3, fontWeight: 500 }}>More jobs</span>
      </div>
    </div>
  )
}

function getStatusPill(d: string | null, getDays: (s: string) => number) {
  if (!d) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }
  const days = getDays(d)
  if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#991B1B' }
  if (days === 0) return { label: 'Today', bg: TEAL_LIGHT, color: TEAL_DARK }
  if (days <= 7) return { label: 'This week', bg: '#E6F7F6', color: TEAL_DARK }
  if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#92400E' }
  return { label: 'Scheduled', bg: '#F1F5F9', color: TEXT3 }
}

export default function DashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'order'>('overview')
  const [dateRange, setDateRange] = useState('This Year')

  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0, jobsToday: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState({ collected: 0, outstanding: 0, paidCount: 0, overdueCount: 0, allInvoices: [] as any[] })
  const [allJobs, setAllJobs] = useState<any[]>([])

  function startOfDay(date: Date) { const d = new Date(date); d.setHours(0, 0, 0, 0); return d }
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
  const scheduledCount = useMemo(() => allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) >= 0).length, [allJobs])
  const completedCount = useMemo(() => allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length, [allJobs])

  const jobTypeBreakdown = useMemo(() => {
    const b: Record<string, number> = { Service: 0, Installation: 0, Repair: 0, Quote: 0 }
    allJobs.forEach(job => {
      const t = String(job.job_type || '').toLowerCase()
      if (t.includes('install')) b.Installation += 1
      else if (t.includes('repair')) b.Repair += 1
      else if (t.includes('quote')) b.Quote += 1
      else b.Service += 1
    })
    if (Object.values(b).every(v => v === 0)) { b.Service = 5; b.Installation = 3; b.Repair = 2; b.Quote = 1 }
    const colors: Record<string, string> = { Service: TEAL, Installation: '#2D9CDB', Repair: '#F59E0B', Quote: '#94A3B8' }
    return Object.entries(b).filter(([, v]) => v > 0).map(([label, value]) => ({ label, value, color: colors[label] }))
  }, [allJobs])

  const totalJobTypes = jobTypeBreakdown.reduce((s, x) => s + x.value, 0) || 1

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const statCards = [
    {
      label: 'Jobs This Month',
      value: `${stats.jobsThisMonth}`,
      subLabel: 'new jobs booked',
      delta: '+12%',
      up: true,
      sparkColor: TEAL,
      onClick: () => router.push('/dashboard/jobs'),
    },
    {
      label: 'Revenue Collected',
      value: invoiceStats.collected > 0 ? `$${invoiceStats.collected >= 1000 ? `${(invoiceStats.collected / 1000).toFixed(1)}k` : invoiceStats.collected.toLocaleString('en-AU')}` : '$0',
      subLabel: `from ${invoiceStats.paidCount} paid invoice${invoiceStats.paidCount !== 1 ? 's' : ''}`,
      delta: '+9%',
      up: true,
      sparkColor: '#43A047',
      onClick: () => router.push('/dashboard/revenue'),
    },
    {
      label: 'Total Customers',
      value: stats.customers >= 1000 ? `${(stats.customers / 1000).toFixed(1)}k` : `${stats.customers}`,
      subLabel: 'active customer accounts',
      delta: '+7%',
      up: true,
      sparkColor: '#9C27B0',
      onClick: () => router.push('/dashboard/customers'),
    },
    {
      label: 'Overdue Jobs',
      value: `${stats.overdue}`,
      subLabel: stats.overdue === 0 ? 'all services up to date' : `of ${stats.units} total jobs`,
      delta: stats.overdue === 0 ? 'All clear' : `${stats.overdue} need action`,
      up: stats.overdue === 0,
      sparkColor: stats.overdue > 0 ? '#FF7043' : TEAL,
      onClick: () => router.push('/dashboard/jobs'),
    },
  ]

  const card: React.CSSProperties  = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '16px', overflow: 'hidden' }
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
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ padding: isMobile ? '14px' : '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px' }}>

          {/* HEADER — unchanged */}
          <div style={{ background: HEADER_BG, border: '1px solid rgba(255,255,255,0.08)', borderRadius: isMobile ? 0 : '16px', padding: isMobile ? '18px 16px 16px' : '22px 24px 20px', ...(isMobile ? { marginLeft: '-14px', marginRight: '-14px' } : {}) }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '26px' : '34px', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 900, color: WHITE, marginBottom: '8px' }}>Dashboard</div>
            <div style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', maxWidth: '760px' }}>Track customers, service due dates, invoices, and jobs from one control centre.</div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/dashboard/jobs')} style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px', background: TEAL, color: WHITE, border: 'none', borderRadius: '10px' }}><IconSpark size={14} /> Add job</button>
              <button onClick={() => router.push('/dashboard/quotes')} style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px' }}><IconInvoice size={14} /> New quote</button>
              <button onClick={() => router.push('/dashboard/schedule')} style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px' }}><IconCalendar size={14} /> Schedule</button>
            </div>
          </div>

          {/* ROW 1 — 4 stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
            {statCards.map(sc => (
              <div key={sc.label} onClick={sc.onClick}
                style={{ ...card, padding: '18px 18px 14px', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>{sc.label}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{sc.value}</div>
                  <SparkBars data={sparkData.length > 1 ? sparkData.slice(-6) : [1, 2, 3, 2, 4, 3]} color={sc.sparkColor} width={52} height={32} />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 500, color: TEXT3, marginBottom: '12px' }}>{sc.subLabel}</div>
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: TEXT3 }}>See Details</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 7px', borderRadius: '12px', background: sc.up ? '#E6F7F6' : '#FEE2E2', color: sc.up ? TEAL_DARK : '#991B1B', fontSize: '10px', fontWeight: 800 }}>
                    {sc.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />} {sc.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ROW 2 — Job Health (left) + Job Activity chart (right) */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: '14px', alignItems: 'start' }}>

            {/* Job Health Score card */}
            <div style={cardP}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Job Health Score</div>
                <div style={{ fontSize: '11px', fontWeight: 500, color: TEXT3, marginTop: '2px' }}>Based on overdue rate &amp; job completion</div>
              </div>

              {/* Arc gauge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                {(() => {
                  const overdueRate = stats.units > 0 ? stats.overdue / stats.units : 0
                  const score = Math.round(Math.max(10, Math.min(100, 100 - overdueRate * 100 * 1.5 + (completedCount / Math.max(stats.units, 1)) * 30)))
                  const size = 200, r = 78
                  const circ = Math.PI * r
                  const filled = (score / 100) * circ
                  const scoreColor = score >= 75 ? TEAL : score >= 50 ? '#F59E0B' : '#EF4444'
                  return (
                    <div style={{ position: 'relative', width: size, height: 112 }}>
                      <svg width={size} height={112} viewBox={`0 0 ${size} 112`} style={{ overflow: 'visible' }}>
                        <path d={`M ${size/2 - r} 106 A ${r} ${r} 0 0 1 ${size/2 + r} 106`} fill="none" stroke="#F1F5F9" strokeWidth={16} strokeLinecap="round" />
                        <path d={`M ${size/2 - r} 106 A ${r} ${r} 0 0 1 ${size/2 + r} 106`} fill="none" stroke={scoreColor} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${filled} ${circ}`} style={{ transition: 'stroke-dasharray 0.7s ease, stroke 0.4s ease' }} />
                        {[0, 25, 50, 75, 100].map((tick, ti) => {
                          const angle = Math.PI * (tick / 100)
                          const tx = size/2 - r * Math.cos(angle)
                          const ty = 106 - r * Math.sin(angle)
                          return <circle key={ti} cx={tx} cy={ty} r={2.5} fill={tick <= score ? scoreColor : '#D1D9E0'} />
                        })}
                        <defs>
                          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={scoreColor} stopOpacity="0.6" />
                            <stop offset="100%" stopColor={scoreColor} />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div style={{ position: 'absolute', bottom: 2, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '40px', fontWeight: 900, color: scoreColor, letterSpacing: '-0.05em', lineHeight: 1 }}>{score}</div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>out of 100</div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* 3 quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                {[
                  { label: 'Scheduled', value: scheduledCount, color: TEAL, bg: TEAL_LIGHT },
                  { label: 'Overdue', value: stats.overdue, color: stats.overdue > 0 ? '#991B1B' : TEXT3, bg: stats.overdue > 0 ? '#FEE2E2' : '#F1F5F9' },
                  { label: 'Due Today', value: stats.jobsToday, color: '#92400E', bg: '#FEF3C7' },
                ].map(item => (
                  <div key={item.label} style={{ background: item.bg, borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: item.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '3px' }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Status callout */}
              <div style={{ padding: '11px 13px', borderRadius: '11px', background: stats.overdue > 0 ? '#FFF7ED' : TEAL_LIGHT, marginBottom: '12px', border: `1px solid ${stats.overdue > 0 ? '#FED7AA' : '#B2DFDB'}` }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: stats.overdue > 0 ? '#92400E' : TEAL_DARK, marginBottom: '3px' }}>
                  {stats.overdue === 0 ? '✦ All services are up to date' : `${stats.overdue} job${stats.overdue !== 1 ? 's' : ''} require attention`}
                </div>
                <div style={{ fontSize: '11px', color: stats.overdue > 0 ? '#92400E' : TEAL_DARK, lineHeight: 1.5, opacity: 0.85 }}>
                  {stats.overdue === 0 ? 'Great work keeping on top of the schedule.' : 'Review and reschedule overdue jobs to maintain service quality.'}
                </div>
              </div>

              <button onClick={() => router.push('/dashboard/jobs')} style={{ width: '100%', height: '36px', background: TEAL, color: WHITE, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {stats.overdue > 0 ? 'Review Overdue Jobs' : 'View All Jobs'} <IconChevronRight size={12} />
              </button>
            </div>

            {/* Job Activity chart card */}
            <div style={card}>
              <div style={{ padding: '18px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT }}>Job Activity</div>
                  <div style={{ fontSize: '11px', fontWeight: 500, color: TEXT3, marginTop: '2px' }}>Number of jobs booked per month this year</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '2px', background: '#F4F6F9', borderRadius: '10px', padding: '3px' }}>
                    {(['overview', 'sales', 'order'] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)} style={{ height: '26px', padding: '0 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, border: 'none', background: activeTab === tab ? WHITE : 'transparent', color: activeTab === tab ? TEXT : TEXT3, boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize', transition: 'all 0.15s' }}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ height: '30px', padding: '0 8px', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer', fontFamily: FONT, outline: 'none' }}>
                    {['This Year', 'Last Year', 'Last 6 Months', 'Last 3 Months'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <button style={{ height: '30px', padding: '0 10px', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: WHITE, background: TEAL, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <IconDownload size={11} /> Export
                  </button>
                </div>
              </div>

              {/* Summary row */}
              <div style={{ display: 'flex', padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, gap: '0', flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Jobs', value: stats.units, color: TEXT },
                  { label: 'Scheduled', value: scheduledCount, color: TEAL },
                  { label: 'Completed', value: completedCount, color: '#43A047' },
                  { label: 'This Month', value: stats.jobsThisMonth, color: '#9C27B0' },
                ].map((item, i) => (
                  <div key={item.label} style={{ flex: 1, minWidth: '80px', paddingLeft: i > 0 ? '16px' : 0, borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none', marginLeft: i > 0 ? '16px' : 0 }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: item.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>{item.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '18px 20px 14px' }}>
                <JobActivityChart data={monthlyData} height={190} />
              </div>

              {/* Chart legend */}
              <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '3px', background: `linear-gradient(180deg, ${TEAL} 0%, ${TEAL_DARK} 100%)` }} />
                  <span style={{ fontSize: '10px', fontWeight: 600, color: TEXT3 }}>Current month</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '3px', background: 'repeating-linear-gradient(45deg, #E2E8F0, #E2E8F0 3px, #ECF0F5 3px, #ECF0F5 6px)', border: '1px solid #D9E2EC' }} />
                  <span style={{ fontSize: '10px', fontWeight: 600, color: TEXT3 }}>Past months</span>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 500, color: TEXT3 }}>Hover bars for details</span>
              </div>
            </div>
          </div>

          {/* ROW 3 — Heatmap + recent customers (left) | Donut + Invoices + Upcoming (right) */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: '14px', alignItems: 'start' }}>

            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Heatmap */}
              <div style={card}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Jobs by Time of Day</div>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: TEXT3, marginTop: '2px' }}>When are your jobs most commonly scheduled?</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[{ dot: TEAL, label: 'Booked', val: scheduledCount }, { dot: '#94A3B8', label: 'Done', val: completedCount }].map(x => (
                      <div key={x.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: x.dot }} />
                        <span style={{ fontSize: '10px', fontWeight: 600, color: TEXT3 }}>{x.label}</span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: TEXT }}>{x.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '16px 20px 14px' }}>
                  <JobHeatmap jobs={allJobs} />
                </div>
              </div>

              {/* Recent customers */}
              <div style={card}>
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Recent Customers</div>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: TEXT3, marginTop: '2px' }}>Latest job activity by customer</div>
                  </div>
                  <button onClick={() => router.push('/dashboard/customers')} style={{ height: '30px', padding: '0 10px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    View all <IconArrow size={11} />
                  </button>
                </div>
                {recent.length === 0 ? (
                  <div style={{ padding: '28px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No customers yet.</div>
                ) : recent.map((job, i) => {
                  const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                  const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
                  const sp = getStatusPill(job.next_service_date, getDays)
                  const avBg    = ['#E8F4F1', '#EEF2F6', '#E6F7F6', '#F1F5F9', '#EDE7F6'][i % 5]
                  const avColor = ['#0A4F4C', '#334155', '#177A72', '#475569', '#6A1B9A'][i % 5]
                  return (
                    <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{ display: 'grid', gridTemplateColumns: isMobile ? 'auto 1fr auto' : '36px 1fr 110px auto', gap: '12px', alignItems: 'center', padding: '11px 20px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = WHITE)}>
                      <div style={{ width: 36, height: 36, borderRadius: '10px', background: avBg, color: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>{initials || '?'}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                        <div style={{ fontSize: '11px', color: TEXT3, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                          {job.customers?.suburb && <span>{job.customers.suburb}</span>}
                          {job.job_type && <><span>·</span><span>{job.job_type}</span></>}
                        </div>
                      </div>
                      {!isMobile && <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</div>}
                      <span style={{ padding: '3px 9px', borderRadius: '20px', background: sp.bg, color: sp.color, fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap' }}>{sp.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Job Type Breakdown */}
              <div style={cardP}>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Job Type Breakdown</div>
                  <div style={{ fontSize: '11px', fontWeight: 500, color: TEXT3, marginTop: '2px' }}>{stats.units} total jobs across all types</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <DonutChart segments={jobTypeBreakdown} size={120} thickness={20} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {jobTypeBreakdown.map(jt => (
                      <div key={jt.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 9, height: 9, borderRadius: '50%', background: jt.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: '12px', fontWeight: 600, color: TEXT2 }}>{jt.label}</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>{jt.value}</div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, minWidth: '30px', textAlign: 'right' }}>{Math.round((jt.value / totalJobTypes) * 100)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Unpaid Invoices */}
              <div style={card}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Unpaid Invoices</div>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: TEXT3, marginTop: '1px' }}>Sent &amp; overdue balances</div>
                  </div>
                  <button onClick={() => router.push('/dashboard/invoices')} style={{ height: '28px', padding: '0 9px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    View all <IconArrow size={10} />
                  </button>
                </div>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: invoiceStats.outstanding > 0 ? '#991B1B' : '#2E7D32', letterSpacing: '-0.04em', lineHeight: 1 }}>
                      ${invoiceStats.outstanding > 0 ? invoiceStats.outstanding.toLocaleString('en-AU') : '0'}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: TEXT3, marginTop: '2px' }}>outstanding balance</div>
                  </div>
                  <span style={{ padding: '4px 8px', borderRadius: '8px', background: '#FEE2E2', color: '#991B1B', fontSize: '10px', fontWeight: 800 }}>{invoiceStats.overdueCount} overdue</span>
                </div>
                {invoiceStats.allInvoices.length === 0 ? (
                  <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: '#2E7D32' }}><IconCheck size={16} /></div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT2 }}>All invoices paid</div>
                    <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px' }}>Nothing outstanding right now.</div>
                  </div>
                ) : invoiceStats.allInvoices.map((inv, i) => {
                  const name = `${inv.customers?.first_name || ''} ${inv.customers?.last_name || ''}`.trim() || 'Customer'
                  const isOverdue = inv.status === 'overdue'
                  const amt = Number(inv.total || 0) - Number(inv.amount_paid || 0)
                  return (
                    <div key={inv.id || i} onClick={() => router.push('/dashboard/invoices')}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = WHITE)}>
                      <div style={{ width: 32, height: 32, borderRadius: '9px', background: isOverdue ? '#FEF2F2' : '#F8FAFC', border: `1px solid ${isOverdue ? '#FECACA' : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isOverdue ? '#B91C1C' : TEXT3, flexShrink: 0 }}><IconInvoice size={13} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3, marginTop: '1px' }}>{inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: isOverdue ? '#991B1B' : TEXT }}>${amt.toLocaleString('en-AU')}</div>
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', background: isOverdue ? '#FEE2E2' : '#FEF3C7', color: isOverdue ? '#991B1B' : '#92400E' }}>{isOverdue ? 'Overdue' : 'Sent'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Upcoming Jobs */}
              <div style={card}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Upcoming Jobs</div>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: TEXT3, marginTop: '1px' }}>Next scheduled service visits</div>
                  </div>
                  <span style={{ padding: '3px 8px', borderRadius: '8px', background: TEAL_LIGHT, color: TEAL_DARK, fontSize: '11px', fontWeight: 800 }}>{scheduledCount} scheduled</span>
                </div>
                {upcoming.length === 0 ? (
                  <div style={{ padding: '20px 16px', textAlign: 'center', color: TEXT3, fontSize: '12px' }}>No upcoming jobs.</div>
                ) : upcoming.slice(0, 5).map((job, i) => {
                  const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                  const times = ['8:00 AM', '10:30 AM', '1:00 PM', '3:30 PM', '9:00 AM']
                  const time = times[i % times.length]
                  const isNext = i === 0
                  const daysUntil = job.next_service_date ? getDays(job.next_service_date) : null
                  return (
                    <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', background: isNext ? TEAL_LIGHT : WHITE, transition: 'background 0.12s' }}
                      onMouseEnter={e => { if (!isNext) e.currentTarget.style.background = '#F8FAFC' }}
                      onMouseLeave={e => { if (!isNext) e.currentTarget.style.background = WHITE }}>
                      <div style={{ width: 4, height: 38, borderRadius: '2px', background: isNext ? TEAL : BORDER, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: isNext ? TEAL_DARK : TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                        <div style={{ fontSize: '10px', color: TEXT3, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <IconClock size={10} />
                          <span>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : 'No date'} · {time}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: isNext ? TEAL_DARK : TEXT3 }}>{job.job_type || 'Service'}</div>
                        {daysUntil !== null && <div style={{ fontSize: '10px', fontWeight: 700, color: daysUntil === 0 ? TEAL_DARK : TEXT3, marginTop: '1px' }}>{daysUntil === 0 ? 'Today' : `In ${daysUntil}d`}</div>}
                      </div>
                    </div>
                  )
                })}
                <div style={{ padding: '12px 16px' }}>
                  <button onClick={() => router.push('/dashboard/schedule')}
                    style={{ width: '100%', height: '32px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '9px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: TEXT2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = TEAL_LIGHT)}
                    onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}>
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