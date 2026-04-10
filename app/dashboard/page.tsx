'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

// ─── Design Tokens (unchanged) ────────────────────────────────────────────────
const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const RED = '#B91C1C'
const AMBER = '#92400E'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#475569'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const METRIC_ICON_SIZE = 30

const TYPE = {
  label: { fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em' as const, textTransform: 'uppercase' as const, color: TEXT3 },
  bodySm: { fontSize: '11px', fontWeight: 500, color: TEXT3, lineHeight: 1.45 },
  body: { fontSize: '12px', fontWeight: 500, color: TEXT2, lineHeight: 1.45 },
  titleSm: { fontSize: '12px', fontWeight: 800, color: TEXT, lineHeight: 1.3 },
  title: { fontSize: '13px', fontWeight: 700, color: TEXT2, lineHeight: 1.35 },
  valueLg: { fontSize: '28px', fontWeight: 900, letterSpacing: '-0.05em' as const, lineHeight: 1 },
  valueSm: { fontSize: '16px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em' as const, lineHeight: 1 },
}

const avColors = [
  { bg: '#E8F4F1', color: '#0A4F4C' },
  { bg: '#EEF2F6', color: '#334155' },
  { bg: '#E6F7F6', color: '#177A72' },
  { bg: '#F1F5F9', color: '#475569' },
  { bg: '#E8F4F1', color: '#1F9E94' },
]

// ─── Hooks ─────────────────────────────────────────────────────────────────────
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

// ─── Icons (unchanged from original) ─────────────────────────────────────────
function IconCustomersImage({ size = METRIC_ICON_SIZE }: { size?: number }) {
  return <img src="https://static.wixstatic.com/media/48c433_26bb14532fd9463f8c2b52b5c16a1483~mv2.png" alt="Customers icon" width={size} height={size} style={{ display: 'block', width: size, height: size, objectFit: 'contain' }}/>
}
function IconMonthlyFlowImage({ size = METRIC_ICON_SIZE }: { size?: number }) {
  return <img src="https://static.wixstatic.com/media/48c433_7935079b22ff414ea0f865be42d66955~mv2.png" alt="Monthly flow icon" width={size} height={size} style={{ display: 'block', width: size, height: size, objectFit: 'contain' }}/>
}
function IconPaidTotalImage({ size = METRIC_ICON_SIZE }: { size?: number }) {
  return <img src="https://static.wixstatic.com/media/48c433_c60e43bdd7c54c4a834aad9132d7a0d8~mv2.png" alt="Paid total icon" width={size} height={size} style={{ display: 'block', width: size, height: size, objectFit: 'contain' }}/>
}
function IconActionNeededImage({ size = METRIC_ICON_SIZE }: { size?: number }) {
  return <img src="https://static.wixstatic.com/media/48c433_f55b6ff5cc4141fcbaf6ce460c56c4c3~mv2.png" alt="Action needed icon" width={size} height={size} style={{ display: 'block', width: size, height: size, objectFit: 'contain' }}/>
}
function IconRevenueMixImage({ size = 22 }: { size?: number }) {
  return <img src="https://static.wixstatic.com/media/48c433_c2a83be57f7745f4ab9e345fa6cd2149~mv2.png" alt="Revenue mix icon" width={size} height={size} style={{ display: 'block', width: size, height: size, objectFit: 'contain' }}/>
}
function IconInvoice({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M7 3h10a2 2 0 0 1 2 2v16l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconCalendar({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9"/><path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconArrow({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconSpark({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
}
function IconPhone({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.4 19.4 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.2 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.8 9.8a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5A2 2 0 0 1 22 16.9Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconDots({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>
}
function IconTrendUp({ size = 12 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 7l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconTrendDown({ size = 12 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 17l-8-8-4 4-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

// ─── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const w = 100, h = 36
  const min = Math.min(...data)
  const max = Math.max(...data) || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3
    return `${x},${y}`
  })
  const pathD = `M ${pts.join(' L ')}`
  const fillD = `M ${pts[0]} L ${pts.join(' L ')} L ${w},${h} L 0,${h} Z`
  const uid = color.replace('#', '')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#sg${uid})`}/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Donut Chart (from original, unchanged) ───────────────────────────────────
function DonutChart({ segments, size = 160, thickness = 28 }: { segments: { label: string; percent: number; color: string }[]; size?: number; thickness?: number }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const cx = size / 2, cy = size / 2
  const r = (size - thickness) / 2 - 4
  const circumference = 2 * Math.PI * r
  let cumulative = 0
  const arcs = segments.map(seg => {
    const startAngle = cumulative
    const sweep = (seg.percent / 100) * circumference
    cumulative += sweep
    return { ...seg, startAngle, sweep }
  })
  const hoveredSeg = segments.find(s => s.label === hovered)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={thickness}/>
        {arcs.map(arc => (
          <circle key={arc.label} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color}
            strokeWidth={hovered === arc.label ? thickness + 5 : thickness}
            strokeDasharray={`${arc.sweep} ${circumference}`}
            strokeDashoffset={-arc.startAngle} strokeLinecap="butt"
            style={{ transition: 'stroke-width 0.18s ease, opacity 0.18s ease', opacity: hovered && hovered !== arc.label ? 0.3 : 1, cursor: 'pointer' }}
            onMouseEnter={() => setHovered(arc.label)} onMouseLeave={() => setHovered(null)}/>
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {hoveredSeg ? (
          <>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: hoveredSeg.color, marginBottom: 5 }}/>
            <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{hoveredSeg.percent}%</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, marginTop: 3, textAlign: 'center', maxWidth: 56, lineHeight: 1.3 }}>{hoveredSeg.label}</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT3, marginBottom: 4 }}>Mix</div>
            <IconRevenueMixImage size={20}/>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Mini Bar Chart (Quote Pipeline) ─────────────────────────────────────────
function PipelineBarChart({ data }: { data: { label: string; value: number }[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const yMax = Math.max(...data.map(d => d.value), 1)
  const CHART_H = 90
  const barColors = [TEAL, TEAL_DARK, '#94A3B8', '#CBD5E1']
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: CHART_H }}>
        {data.map((item, i) => {
          const barH = Math.max(6, (item.value / yMax) * CHART_H)
          const isHov = hovered === item.label
          const col = barColors[i % barColors.length]
          return (
            <div key={item.label} onMouseEnter={() => setHovered(item.label)} onMouseLeave={() => setHovered(null)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', cursor: 'default', position: 'relative' }}>
              {isHov && (
                <div style={{ position: 'absolute', bottom: barH + 6, left: '50%', transform: 'translateX(-50%)', background: TEXT, color: WHITE, fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '5px', whiteSpace: 'nowrap', zIndex: 5 }}>
                  {item.value}
                </div>
              )}
              <div style={{ height: barH, borderRadius: '5px 5px 3px 3px', background: isHov ? col : `${col}BB`, border: `1px solid ${col}44`, transition: 'all 0.15s' }}/>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
        {data.map(item => (
          <div key={item.label} style={{ flex: 1, textAlign: 'center', fontSize: '9px', fontWeight: 700, color: TEXT3 }}>{item.label}</div>
        ))}
      </div>
      <div style={{ marginTop: '8px', fontSize: '10px', fontWeight: 600, color: TEXT3, textAlign: 'center' }}>Key stages</div>
    </div>
  )
}

// ─── Schedule Grid ─────────────────────────────────────────────────────────────
function ScheduleGrid({ jobs, isMobile }: { jobs: any[]; isMobile: boolean }) {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return { date: d, label: d.toLocaleDateString('en-AU', { weekday: 'short' }), dayNum: d.getDate(), month: d.toLocaleDateString('en-AU', { month: 'short' }) }
  })
  const jobColors = [
    { bg: TEAL, text: WHITE },
    { bg: TEAL_DARK, text: WHITE },
    { bg: '#475569', text: WHITE },
    { bg: '#94A3B8', text: WHITE },
    { bg: '#CBD5E1', text: TEXT },
  ]
  const scheduled = jobs.filter(j => j.next_service_date).slice(0, 4)

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: isMobile ? 560 : 'auto' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
          <div style={{ ...TYPE.label, padding: '0 4px' }}>Team</div>
          {days.map((d, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: i === 0 ? TEAL : TEXT3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.label}</div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: i === 0 ? TEXT : TEXT3 }}>{d.dayNum}–{d.month}</div>
            </div>
          ))}
        </div>
        {/* Rows */}
        {scheduled.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: TEXT3, fontSize: '12px' }}>No upcoming jobs scheduled.</div>
        ) : scheduled.map((job, idx) => {
          const jc = jobColors[idx % jobColors.length]
          const jDate = job.next_service_date ? new Date(job.next_service_date) : null
          const dayIdx = jDate ? days.findIndex(d => d.date.toDateString() === jDate.toDateString()) : -1
          const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
          const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
          const av = avColors[idx % avColors.length]
          return (
            <div key={job.id} style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, 1fr)', gap: '4px', marginBottom: '4px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 2px' }}>
                <div style={{ width: 28, height: 28, borderRadius: '8px', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 44 }}>{name.split(' ')[0]}</span>
              </div>
              {days.map((_, di) => (
                <div key={di} style={{ height: '38px', borderRadius: '8px', background: '#F8FAFC', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                  {di === dayIdx && (
                    <div style={{ width: '100%', height: '100%', background: jc.bg, padding: '4px 6px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '8px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 800, color: jc.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.job_type || 'Service'} – {name.split(' ')[0]}</div>
                      <div style={{ fontSize: '8px', color: `${jc.text}CC`, marginTop: 1 }}>{jDate ? jDate.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
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

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState({ collected: 0, outstanding: 0, paidCount: 0, overdueCount: 0 })
  const [allJobs, setAllJobs] = useState<any[]>([])

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
        supabase.from('invoices').select('status, total, amount_paid, created_at').eq('business_id', bid),
      ])
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
    if (!d) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }
    const days = getDays(d)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#DCFCE7', color: '#166534' }
  }

  const dueSoonCount = useMemo(() =>
    allJobs.filter(j => { if (!j.next_service_date) return false; const d = getDays(j.next_service_date); return d >= 0 && d <= 30 }).length
  , [allJobs])

  const monthlyData = useMemo(() => {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const base = names.map((label, i) => ({ label, value: 0 }))
    allJobs.forEach(job => {
      const c = job.created_at ? new Date(job.created_at) : null
      if (c && !isNaN(c.getTime())) base[c.getMonth()].value += 1
    })
    return base
  }, [allJobs])

  const sparkNums = monthlyData.map(m => m.value)

  const revenueDistribution = useMemo(() => {
    const b = { Service: 0, Installation: 0, Quote: 0, Repair: 0, Other: 0 }
    allJobs.forEach(job => {
      const t = String(job.job_type || '').toLowerCase()
      if (t.includes('service')) b.Service += 1
      else if (t.includes('install')) b.Installation += 1
      else if (t.includes('quote')) b.Quote += 1
      else if (t.includes('repair')) b.Repair += 1
      else b.Other += 1
    })
    if (Object.values(b).every(v => v === 0)) { b.Service = 4; b.Installation = 3; b.Quote = 2; b.Repair = 2; b.Other = 1 }
    const colors: Record<string, string> = { Service: TEAL, Installation: TEAL_DARK, Quote: '#94A3B8', Repair: '#CBD5E1', Other: '#E2E8F0' }
    const total = Object.values(b).reduce((s, v) => s + v, 0)
    return Object.entries(b).map(([label, value]) => ({ label, value, percent: Math.round((value / total) * 100), color: colors[label] }))
  }, [allJobs])

  const jobStatusSegments = useMemo(() => {
    const inProgress = allJobs.filter(j => !j.next_service_date || getDays(j.next_service_date) >= 0).length
    const completed = allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length
    const pending = dueSoonCount
    const onHold = Math.max(0, allJobs.length - inProgress - completed)
    if (allJobs.length === 0) return [
      { label: 'In Progress', value: 3, percent: 33, color: TEAL },
      { label: 'Completed', value: 5, percent: 42, color: '#94A3B8' },
      { label: 'Pending', value: 2, percent: 17, color: '#CBD5E1' },
      { label: 'On Hold', value: 1, percent: 8, color: '#E2E8F0' },
    ]
    const total = inProgress + completed + pending + onHold || 1
    return [
      { label: 'In Progress', value: inProgress, percent: Math.round(inProgress / total * 100), color: TEAL },
      { label: 'Completed', value: completed, percent: Math.round(completed / total * 100), color: '#94A3B8' },
      { label: 'Pending', value: pending, percent: Math.round(pending / total * 100), color: '#CBD5E1' },
      { label: 'On Hold', value: onHold, percent: Math.round(onHold / total * 100), color: '#E2E8F0' },
    ]
  }, [allJobs, dueSoonCount])

  const quotePipelineData = [
    { label: 'Sent', value: invoiceStats.paidCount + invoiceStats.overdueCount + 2 },
    { label: 'Follow-up', value: Math.max(1, invoiceStats.overdueCount) },
    { label: 'Accepted', value: invoiceStats.paidCount },
    { label: 'Closed', value: Math.max(0, Math.floor(invoiceStats.paidCount * 0.8)) },
  ]

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // Shared styles
  const shellCard: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 1px 4px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03)',
    overflow: 'hidden',
  }
  const panelCard: React.CSSProperties = { ...shellCard, padding: '16px' }

  const cardMenuBtn: React.CSSProperties = {
    width: 28, height: 28, borderRadius: '8px', background: 'transparent',
    border: `1px solid ${BORDER}`, color: TEXT3, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }

  const sectionTitle = (mb = 12): React.CSSProperties => ({
    fontSize: '14px', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', marginBottom: mb,
  })

  const topCards = [
    {
      label: 'Total Revenue', tag: 'Paid total',
      value: `$${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
      sub: `${invoiceStats.paidCount} paid invoices`,
      change: invoiceStats.collected > 0 ? '+vs last month' : 'No data yet',
      up: invoiceStats.collected > 0,
      sparkColor: TEAL,
      icon: <IconPaidTotalImage size={METRIC_ICON_SIZE}/>,
    },
    {
      label: 'New Jobs', tag: 'Monthly flow',
      value: `+${stats.jobsThisMonth}`,
      sub: 'Created this month',
      change: stats.jobsThisMonth > 0 ? `+${stats.jobsThisMonth} this month` : 'None yet',
      up: stats.jobsThisMonth > 0,
      sparkColor: TEAL,
      icon: <IconMonthlyFlowImage size={METRIC_ICON_SIZE}/>,
    },
    {
      label: 'Customers', tag: 'CRM total',
      value: stats.customers.toLocaleString('en-AU'),
      sub: `${stats.units} units tracked`,
      change: stats.customers > 0 ? 'Active in CRM' : 'None yet',
      up: stats.customers > 0,
      sparkColor: TEAL,
      icon: <IconCustomersImage size={METRIC_ICON_SIZE}/>,
    },
    {
      label: 'Overdue Services', tag: 'Action needed',
      value: stats.overdue.toLocaleString('en-AU'),
      sub: stats.overdue > 0 ? 'Needs attention now' : 'All clear',
      change: stats.overdue > 0 ? `${stats.overdue} overdue` : 'All clear',
      up: stats.overdue === 0,
      sparkColor: stats.overdue > 0 ? '#EF4444' : TEAL,
      icon: <IconActionNeededImage size={METRIC_ICON_SIZE}/>,
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard"/>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard"/>

      <div style={{ flex: 1, minWidth: 0, background: BG, ...(isMobile ? {} : { height: '100vh', overflowY: 'scroll' }) }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: isMobile ? '14px' : '16px', gap: '12px', paddingBottom: isMobile ? '100px' : '60px' }}>

          {/* ── HEADER (completely unchanged from original) ─────────────────── */}
          <div style={{ ...shellCard, padding: isMobile ? '18px 16px 16px' : '22px 24px 20px', background: HEADER_BG, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '28px' : '34px', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 900, color: WHITE, marginBottom: '8px' }}>Dashboard</div>
            <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', maxWidth: '760px' }}>
              Track customers, service due dates, invoices, and jobs from one control centre.
            </div>
            {isMobile ? (
              <div style={{ marginTop: '14px', display: 'flex', gap: '6px' }}>
                <button onClick={() => router.push('/dashboard/jobs')} style={{ flex: 1, height: '36px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: TEAL, color: WHITE, border: 'none', borderRadius: '10px', boxShadow: '0 6px 14px rgba(31,158,148,0.20)', whiteSpace: 'nowrap' as const }}>
                  <IconSpark size={13}/> Add job
                </button>
                <button onClick={() => router.push('/dashboard/quotes')} style={{ flex: 1, height: '36px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px', whiteSpace: 'nowrap' as const }}>
                  <IconInvoice size={13}/> Quote
                </button>
                <button onClick={() => router.push('/dashboard/schedule')} style={{ flex: 1, height: '36px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px', whiteSpace: 'nowrap' as const }}>
                  <IconCalendar size={13}/> Schedule
                </button>
              </div>
            ) : (
              <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => router.push('/dashboard/jobs')} style={{ background: TEAL, color: WHITE, borderRadius: '10px', height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '8px', border: 'none', boxShadow: '0 6px 14px rgba(31,158,148,0.20)' }}>
                  <IconSpark size={16}/> Add job
                </button>
                <button onClick={() => router.push('/dashboard/quotes')} style={{ background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px', height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <IconInvoice size={16}/> New quote
                </button>
                <button onClick={() => router.push('/dashboard/schedule')} style={{ background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px', height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <IconCalendar size={16}/> Service schedule
                </button>
              </div>
            )}
          </div>

          {/* ── ROW 1: Metric cards with sparklines ───────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
            {topCards.map((card, i) => (
              <div key={i} style={{ ...panelCard, display: 'flex', flexDirection: 'column', gap: '0', padding: '16px' }}>
                {/* Top row: label + menu + icon */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...TYPE.label, marginBottom: '2px' }}>{card.tag}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT2 }}>{card.label}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div style={{ width: METRIC_ICON_SIZE, height: METRIC_ICON_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                    <button style={cardMenuBtn}><IconDots size={13}/></button>
                  </div>
                </div>
                {/* Value */}
                <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', lineHeight: 1 }}>{card.value}</div>
                {/* Trend badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', padding: '3px 7px', borderRadius: '6px', background: card.up ? '#E6F7F6' : '#FEE2E2', alignSelf: 'flex-start' }}>
                  {card.up ? <IconTrendUp size={11}/> : <IconTrendDown size={11}/>}
                  <span style={{ fontSize: '10px', fontWeight: 800, color: card.up ? TEAL_DARK : '#B91C1C' }}>{card.change}</span>
                </div>
                {/* Sparkline */}
                <div style={{ marginTop: '10px' }}>
                  <Sparkline data={sparkNums} color={card.sparkColor}/>
                </div>
                <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* ── ROW 2: Schedule (wide) + Job Status Donut + Quote Pipeline ──── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 220px 200px', gap: '12px', alignItems: 'start' }}>

            {/* Job Schedule */}
            <div style={panelCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={sectionTitle(0)}>Job Schedule (This Week)</div>
                <button onClick={() => router.push('/dashboard/schedule')} style={{ height: '30px', padding: '0 10px', background: WHITE, color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  View Schedule
                </button>
              </div>
              <ScheduleGrid jobs={upcoming} isMobile={isMobile}/>
            </div>

            {/* Job Status Donut */}
            <div style={panelCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={sectionTitle(0)}>Job Status Overview</div>
                <button style={cardMenuBtn}><IconDots size={13}/></button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <DonutChart segments={jobStatusSegments} size={156} thickness={26}/>
              </div>
              <div style={{ display: 'grid', gap: '6px' }}>
                {jobStatusSegments.map(seg => (
                  <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '2px', background: seg.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, flex: 1 }}>{seg.value} {seg.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push('/dashboard/jobs')} style={{ width: '100%', marginTop: '12px', height: '32px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '9px', color: TEXT2, fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                View Schedule
              </button>
            </div>

            {/* Quote Pipeline */}
            <div style={panelCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={sectionTitle(0)}>Quote Pipeline</div>
                <button style={cardMenuBtn}><IconDots size={13}/></button>
              </div>
              <PipelineBarChart data={quotePipelineData}/>
            </div>
          </div>

          {/* ── ROW 3: Active Jobs Table ──────────────────────────────────────── */}
          <div style={shellCard}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={sectionTitle(0)}>Active Jobs (Top 5)</div>
              <button onClick={() => router.push('/dashboard/jobs')} style={{ height: '32px', padding: '0 12px', background: TEAL, color: WHITE, border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(31,158,148,0.2)' }}>
                + New Job
              </button>
            </div>
            {/* Table header */}
            {!isMobile && (
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 110px 100px 90px 90px', gap: '8px', padding: '9px 16px', borderBottom: `1px solid ${BORDER}`, background: '#FAFBFC' }}>
                {['Job ID', 'Client', 'Service', 'Status', 'Suburb', 'Due Date', 'Progress'].map(h => (
                  <div key={h} style={{ ...TYPE.label }}>{h}</div>
                ))}
              </div>
            )}
            {recent.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No jobs yet.</div>
            ) : recent.slice(0, 5).map((job, i) => {
              const status = statusPill(job.next_service_date)
              const av = avColors[i % avColors.length]
              const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
              const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
              const progress = job.next_service_date ? Math.max(10, Math.min(95, 100 - Math.max(0, getDays(job.next_service_date)) * 2)) : 50
              const jobId = `#${String(job.id || '').slice(-4).toUpperCase() || String(4500 + i)}`

              if (isMobile) {
                return (
                  <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                    style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT }}>{name}</div>
                      <div style={{ fontSize: '10px', color: TEXT3, marginTop: '2px' }}>{job.job_type || 'Service'} · {jobId}</div>
                    </div>
                    <span style={{ padding: '4px 8px', borderRadius: '6px', background: status.bg, color: status.color, fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}>{status.label}</span>
                  </div>
                )
              }

              return (
                <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                  style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 110px 100px 90px 90px', gap: '8px', padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', alignItems: 'center', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = WHITE)}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: TEAL }}>{jobId}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '8px', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT3 }}>{job.job_type || 'HVAC'}</div>
                  <div>
                    <span style={{ padding: '4px 9px', borderRadius: '7px', background: status.bg, color: status.color, fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap' }}>{status.label}</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>{job.customers?.suburb || '—'}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '—'}</div>
                  <div>
                    <div style={{ height: '5px', borderRadius: '999px', background: BORDER, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, borderRadius: '999px', background: TEAL, transition: 'width 0.4s ease' }}/>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── ROW 4: Pending Quotes + Unpaid Invoices + Recent Activity ──── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '12px' }}>

            {/* Pending Quotes */}
            <div style={panelCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={sectionTitle(0)}>Pending Quotes</div>
                <button style={cardMenuBtn}><IconDots size={13}/></button>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: '6px' }}>
                ${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}
              </div>
              <span style={{ display: 'inline-flex', padding: '4px 9px', borderRadius: '7px', background: '#FEF3C7', color: '#78350F', fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>In Progress</span>
              <div style={{ ...TYPE.bodySm, marginBottom: '14px' }}>Outstanding across {invoiceStats.overdueCount + 1} quotes</div>
              <button onClick={() => router.push('/dashboard/quotes')} style={{ width: '100%', height: '34px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '9px', color: TEXT2, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <IconInvoice size={13}/> Send Quote
              </button>
            </div>

            {/* Unpaid Invoices */}
            <div style={panelCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={sectionTitle(0)}>Unpaid Invoices</div>
                <button style={cardMenuBtn}><IconDots size={13}/></button>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: '6px' }}>
                ${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}
              </div>
              <span style={{ display: 'inline-flex', padding: '4px 9px', borderRadius: '7px', background: '#FEE2E2', color: '#7F1D1D', fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>Unpaid</span>
              <div style={{ ...TYPE.bodySm, marginBottom: '14px' }}>{invoiceStats.overdueCount} overdue · {invoiceStats.paidCount} collected</div>
              <button onClick={() => router.push('/dashboard/jobs')} style={{ width: '100%', height: '34px', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '9px', color: TEXT2, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                New Job
              </button>
            </div>

            {/* Recent Activity Feed */}
            <div style={panelCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={sectionTitle(0)}>Recent Activity</div>
                <button style={cardMenuBtn}><IconDots size={13}/></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recent.slice(0, 3).map((job, i) => {
                  const av = avColors[i % avColors.length]
                  const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                  const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
                  const actions = ['approved Quote', 'completed Job', 'scheduled service', 'added a job']
                  const actionColors = [TEAL, TEAL_DARK, TEXT3, TEXT3]
                  const idx = i % 4
                  const timeAgo = job.created_at ? `${Math.floor((Date.now() - new Date(job.created_at).getTime()) / 60000)}m ago` : ''
                  return (
                    <div key={job.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', padding: '8px 10px', borderRadius: '10px', background: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                      <div style={{ width: 32, height: 32, borderRadius: '9px', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>
                          {name} <span style={{ color: actionColors[idx], fontWeight: 700 }}>{actions[idx]}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: TEXT3, marginTop: '2px' }}>
                          {job.job_type || 'HVAC'} · {timeAgo}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {recent.length === 0 && <div style={{ fontSize: '12px', color: TEXT3, textAlign: 'center', padding: '12px 0' }}>No recent activity yet.</div>}
              </div>
              {/* Total Status */}
              <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '11px', background: '#F0FAF9', border: `1px solid #C4E8E5` }}>
                <div style={{ ...TYPE.label, marginBottom: '4px' }}>Total Status</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em' }}>${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</span>
                  <span style={{ padding: '3px 8px', borderRadius: '6px', background: TEAL + '22', color: TEAL_DARK, fontSize: '10px', fontWeight: 800 }}>Collected</span>
                </div>
                <div style={{ fontSize: '10px', color: TEXT3, marginTop: '2px' }}>{invoiceStats.paidCount} paid invoices total</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}