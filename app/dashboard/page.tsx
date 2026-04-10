'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

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
const METRIC_ICON_BOX = 40
const METRIC_ICON_SIZE = 28

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
  { bg: '#DBEAFE', color: '#1E3A8A' },
  { bg: '#FEF3C7', color: '#78350F' },
  { bg: '#EDE9FE', color: '#4C1D95' },
  { bg: '#FFE4E6', color: '#881337' },
]

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

function IconCustomersImage({ size = METRIC_ICON_SIZE }: { size?: number }) {
  return (
    <img
      src="https://static.wixstatic.com/media/48c433_26bb14532fd9463f8c2b52b5c16a1483~mv2.png"
      alt="Customers icon"
      width={size}
      height={size}
      style={{ display: 'block', width: size, height: size, objectFit: 'contain', objectPosition: 'center' }}
    />
  )
}

function IconMonthlyFlowImage({ size = METRIC_ICON_SIZE }: { size?: number }) {
  return (
    <img
      src="https://static.wixstatic.com/media/48c433_7935079b22ff414ea0f865be42d66955~mv2.png"
      alt="Monthly flow icon"
      width={size}
      height={size}
      style={{ display: 'block', width: size, height: size, objectFit: 'contain', objectPosition: 'center' }}
    />
  )
}

function IconPaidTotalImage({ size = METRIC_ICON_SIZE }: { size?: number }) {
  return (
    <img
      src="https://static.wixstatic.com/media/48c433_c60e43bdd7c54c4a834aad9132d7a0d8~mv2.png"
      alt="Paid total icon"
      width={size}
      height={size}
      style={{ display: 'block', width: size, height: size, objectFit: 'contain', objectPosition: 'center' }}
    />
  )
}

function IconActionNeededImage({ size = METRIC_ICON_SIZE }: { size?: number }) {
  return (
    <img
      src="https://static.wixstatic.com/media/48c433_f55b6ff5cc4141fcbaf6ce460c56c4c3~mv2.png"
      alt="Action needed icon"
      width={size}
      height={size}
      style={{ display: 'block', width: size, height: size, objectFit: 'contain', objectPosition: 'center' }}
    />
  )
}

function IconInvoice({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M7 3h10a2 2 0 0 1 2 2v16l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
function IconRevenue({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 6.5c0-1.93-2.24-3.5-5-3.5S7 4.57 7 6.5 9.24 10 12 10s5 1.57 5 3.5S14.76 17 12 17s-5-1.57-5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

function DonutChart({ segments, size = 220, thickness = 36 }: { segments: { label: string; percent: number; color: string }[]; size?: number; thickness?: number }) {
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
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={thickness} />
        {arcs.map(arc => (
          <circle key={arc.label} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color}
            strokeWidth={hovered === arc.label ? thickness + 6 : thickness}
            strokeDasharray={`${arc.sweep} ${circumference}`}
            strokeDashoffset={-arc.startAngle} strokeLinecap="butt"
            style={{ transition: 'stroke-width 0.18s ease, opacity 0.18s ease', opacity: hovered && hovered !== arc.label ? 0.35 : 1, cursor: 'pointer' }}
            onMouseEnter={() => setHovered(arc.label)} onMouseLeave={() => setHovered(null)} />
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {hoveredSeg ? (
          <>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: hoveredSeg.color, marginBottom: 6 }} />
            <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{hoveredSeg.percent}%</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3, marginTop: 4 }}>{hoveredSeg.label}</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT3, marginBottom: 4 }}>Mix</div>
            <div style={{ color: TEAL_DARK }}><IconRevenue size={22} /></div>
          </>
        )}
      </div>
    </div>
  )
}

function AppointmentsBarChart({ data, stats, dueSoonCount, isMobile }: {
  data: { label: string; total: number; completed: number }[]
  stats: { jobsThisMonth: number; overdue: number; units: number }
  dueSoonCount: number
  isMobile: boolean
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const CHART_H = 140
  const yMax = useMemo(() => Math.max(...data.map(d => d.total), 2), [data])
  const yTop = useMemo(() => Math.ceil(yMax / 2) * 2 || 2, [yMax])
  const yMid = Math.round(yTop / 2)

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Jobs this month', value: stats.jobsThisMonth },
          { label: 'Overdue', value: stats.overdue },
          { label: 'Due soon', value: dueSoonCount },
          { label: 'Units tracked', value: stats.units },
        ].map(item => (
          <div key={item.label} style={{ borderRadius: '12px', background: '#F8FAFC', border: `1px solid ${BORDER}`, padding: '10px 12px' }}>
            <div style={{ ...TYPE.label, marginBottom: '5px' }}>{item.label}</div>
            <div style={{ ...TYPE.valueSm }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ borderRadius: '14px', background: 'linear-gradient(180deg,#FFFFFF 0%,#FAFBFC 100%)', border: `1px solid ${BORDER}`, padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: TEXT3 }}>
            <span style={{ width: 10, height: 10, borderRadius: '3px', background: '#E2E8F0', border: '1px solid #D1D9E0', display: 'inline-block' }} /> Total jobs
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: TEXT3 }}>
            <span style={{ width: 10, height: 10, borderRadius: '3px', background: TEAL, display: 'inline-block' }} /> Completed services
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: CHART_H, width: '18px', flexShrink: 0 }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, lineHeight: 1, textAlign: 'right' }}>{yTop}</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, lineHeight: 1, textAlign: 'right' }}>{yMid}</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, lineHeight: 1, textAlign: 'right' }}>0</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: CHART_H }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: '1px dashed #E8EDF3' }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed #E8EDF3' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: '1px solid #E8EDF3' }} />

              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: '3px', padding: '0 2px' }}>
                {data.map(item => {
                  const isActive = hovered === item.label
                  const totalH = item.total > 0 ? Math.max(4, (item.total / yTop) * CHART_H) : 0
                  const compH  = item.completed > 0 ? Math.max(3, (item.completed / yTop) * CHART_H) : 0
                  return (
                    <div key={item.label} onMouseEnter={() => setHovered(item.label)} onMouseLeave={() => setHovered(null)}
                      style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
                      {isActive && item.total > 0 && (
                        <div style={{ position: 'absolute', bottom: totalH + 6, left: '50%', transform: 'translateX(-50%)', background: '#0B1220', color: WHITE, fontSize: '10px', fontWeight: 800, padding: '3px 6px', borderRadius: '6px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10 }}>
                          {item.total} · {item.completed} done
                        </div>
                      )}
                      <div style={{ width: '100%', height: totalH, borderRadius: '4px 4px 2px 2px', background: isActive ? '#C8D3DF' : '#E2E8F0', position: 'relative', overflow: 'hidden', transition: 'background 0.15s' }}>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: compH, borderRadius: '4px 4px 2px 2px', background: isActive ? '#28C4B5' : TEAL, transition: 'background 0.15s' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '3px', padding: '0 2px', marginTop: '6px' }}>
              {data.map(item => (
                <div key={item.label} style={{ flex: 1, textAlign: 'center', fontSize: '9px', fontWeight: 700, color: hovered === item.label ? TEXT2 : TEXT3 }}>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function RevenueDistributionWidget({ distribution, isMobile }: { distribution: { label: string; value: number; percent: number; color: string }[]; isMobile: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const strongest = [...distribution].sort((a, b) => b.percent - a.percent)[0]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0 0' }}>
        <DonutChart segments={distribution} size={isMobile ? 200 : 210} thickness={34} />
      </div>
      <div style={{ display: 'grid', gap: '6px' }}>
        {distribution.map(item => {
          const isHov = hovered === item.label
          return (
            <div key={item.label} onMouseEnter={() => setHovered(item.label)} onMouseLeave={() => setHovered(null)}
              style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '12px', background: isHov ? '#F4F8FA' : '#FCFCFD', border: `1px solid ${isHov ? '#D0DCE8' : BORDER}`, cursor: 'default', transition: 'background 0.15s ease, border-color 0.15s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                <span style={{ width: 10, height: 10, borderRadius: '3px', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: isHov ? TEXT : TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '48px', height: '4px', borderRadius: '999px', background: '#EEF2F6', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.percent}%`, borderRadius: '999px', background: item.color, transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: TEXT, minWidth: '32px', textAlign: 'right' }}>{item.percent}%</span>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ borderRadius: '12px', background: '#F0FAF9', border: '1px solid #C4E8E5', padding: '10px 13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: 28, height: 28, borderRadius: '8px', background: TEAL, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IconRevenue size={14} />
        </div>
        <div style={{ fontSize: '12px', color: TEXT3, lineHeight: 1.45 }}>
          Strongest workflow: <span style={{ color: TEXT, fontWeight: 800 }}>{strongest?.label || 'Service'}</span> at <span style={{ color: TEAL_DARK, fontWeight: 800 }}>{strongest?.percent || 0}%</span>
        </div>
      </div>
    </div>
  )
}

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
      setUpcoming(jobs.filter(j => j.next_service_date && new Date(j.next_service_date) >= today).slice(0, 3))
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
  function urgency(days: number) {
    if (days < 0) return { val: RED, text: `${Math.abs(days)}d late` }
    if (days <= 30) return { val: AMBER, text: `${days}d left` }
    return { val: TEAL_DARK, text: `${days}d left` }
  }
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

  const monthlyAppointments = useMemo(() => {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const base = names.map((label, i) => ({ label, total: 0, completed: 0, month: i }))
    allJobs.forEach(job => {
      const c = job.created_at ? new Date(job.created_at) : null
      if (c && !isNaN(c.getTime())) base[c.getMonth()].total += 1
      if (job.next_service_date) { const d = new Date(job.next_service_date); if (!isNaN(d.getTime()) && d <= new Date()) base[d.getMonth()].completed += 1 }
    })
    return base
  }, [allJobs])

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
    const colors: Record<string, string> = { Service: '#6EE7B7', Installation: '#93C5FD', Quote: '#C4B5FD', Repair: '#FCD34D', Other: '#E5E7EB' }
    const total = Object.values(b).reduce((s, v) => s + v, 0)
    return Object.entries(b).map(([label, value]) => ({ label, value, percent: Math.round((value / total) * 100), color: colors[label] }))
  }, [allJobs])

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const shellCard: React.CSSProperties = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)', overflow: 'hidden' }
  const panelCard: React.CSSProperties = { ...shellCard, padding: '16px' }
  const sectionLabel: React.CSSProperties = { ...TYPE.title, fontSize: '13px', fontWeight: 800, marginBottom: '12px' }
  const iconWrap = (color: string): React.CSSProperties => ({
    width: `${METRIC_ICON_BOX}px`,
    height: `${METRIC_ICON_BOX}px`,
    borderRadius: '11px',
    background: '#F8FAFC',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${BORDER}`,
    flexShrink: 0,
    overflow: 'hidden',
  })

  const topCards = [
    { label: 'Customers', value: stats.customers.toLocaleString('en-AU'), sub: 'Registered in your CRM', icon: <IconCustomersImage size={METRIC_ICON_SIZE} />, accent: TEXT, tag: 'CRM total' },
    { label: 'New jobs', value: `+${stats.jobsThisMonth.toLocaleString('en-AU')}`, sub: 'Created this month', icon: <IconMonthlyFlowImage size={METRIC_ICON_SIZE} />, accent: TEAL_DARK, tag: 'Monthly flow' },
    { label: 'Revenue', value: `$${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, sub: 'Collected invoices', icon: <IconPaidTotalImage size={METRIC_ICON_SIZE} />, accent: TEXT, tag: 'Paid total' },
    { label: 'Overdue services', value: stats.overdue.toLocaleString('en-AU'), sub: stats.overdue > 0 ? 'Needs attention now' : 'All clear', icon: <IconActionNeededImage size={METRIC_ICON_SIZE} />, accent: stats.overdue > 0 ? RED : TEAL_DARK, tag: 'Action needed' },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard" />

      <div style={{ flex: 1, minWidth: 0, background: BG, ...(isMobile ? {} : { height: '100vh', overflowY: 'scroll' }) }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: isMobile ? '14px' : '16px', gap: '12px', paddingBottom: isMobile ? '100px' : '60px' }}>

          <div style={{ ...shellCard, padding: isMobile ? '18px 16px 16px' : '22px 24px 20px', background: HEADER_BG, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '28px' : '34px', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 900, color: WHITE, marginBottom: '8px' }}>Dashboard</div>
            <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', maxWidth: '760px' }}>
              Track customers, service due dates, invoices, and jobs from one control centre.
            </div>

            {isMobile ? (
              <div style={{ marginTop: '14px', display: 'flex', gap: '6px' }}>
                <button onClick={() => router.push('/dashboard/jobs')} style={{ flex: 1, height: '36px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: TEAL, color: WHITE, border: 'none', borderRadius: '10px', boxShadow: '0 6px 14px rgba(31,158,148,0.20)', whiteSpace: 'nowrap' as const }}>
                  <IconSpark size={13} /> Add job
                </button>
                <button onClick={() => router.push('/dashboard/quotes')} style={{ flex: 1, height: '36px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px', whiteSpace: 'nowrap' as const }}>
                  <IconInvoice size={13} /> Quote
                </button>
                <button onClick={() => router.push('/dashboard/schedule')} style={{ flex: 1, height: '36px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px', whiteSpace: 'nowrap' as const }}>
                  <IconCalendar size={13} /> Schedule
                </button>
              </div>
            ) : (
              <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => router.push('/dashboard/jobs')} style={{ background: TEAL, color: WHITE, borderRadius: '10px', height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '8px', border: 'none', boxShadow: '0 6px 14px rgba(31,158,148,0.20)' }}>
                  <IconSpark size={16} /> Add job
                </button>
                <button onClick={() => router.push('/dashboard/quotes')} style={{ background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px', height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: 'none' }}>
                  <IconInvoice size={16} /> New quote
                </button>
                <button onClick={() => router.push('/dashboard/schedule')} style={{ background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', borderRadius: '10px', height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: 'none' }}>
                  <IconCalendar size={16} /> Service schedule
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '12px' }}>
            {topCards.map(item => (
              <div key={item.label} style={{ ...panelCard, minHeight: isMobile ? 110 : 148, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>{item.tag}</div>
                    <div style={{ fontSize: isMobile ? '11px' : '14px', fontWeight: 800, color: TEXT2, marginBottom: '8px' }}>{item.label}</div>
                  </div>
                  <div style={iconWrap(item.accent)}>{item.icon}</div>
                </div>
                <div>
                  <div style={{ ...TYPE.valueLg, fontSize: isMobile ? '22px' : '30px', color: item.accent }}>{item.value}</div>
                  <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0,1fr))', gap: '12px', alignItems: 'start' }}>
            <div style={{ ...panelCard, gridColumn: isMobile ? 'span 1' : 'span 8' }}>
              <div style={{ marginBottom: '14px' }}>
                <div style={sectionLabel}>Total appointments</div>
                <div style={{ ...TYPE.bodySm }}>Teal bars show completed service events. Grey bars show total job activity by month.</div>
              </div>
              <AppointmentsBarChart data={monthlyAppointments} stats={stats} dueSoonCount={dueSoonCount} isMobile={isMobile} />
            </div>
            <div style={{ ...panelCard, gridColumn: isMobile ? 'span 1' : 'span 4' }}>
              <div style={sectionLabel}>Revenue source distribution</div>
              <RevenueDistributionWidget distribution={revenueDistribution} isMobile={isMobile} />
            </div>
          </div>

          <div style={panelCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
              <div style={sectionLabel}>Upcoming jobs</div>
              <button onClick={() => router.push('/dashboard/schedule')} style={{ height: '34px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '12px', fontWeight: 700, padding: '0 12px', cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                View all <IconArrow size={15} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0,1fr))', gap: '10px' }}>
              {upcoming.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', borderRadius: '12px', padding: '26px 16px', background: WHITE, border: `1px solid ${BORDER}`, textAlign: 'center', color: TEXT3, fontSize: '14px', fontWeight: 500 }}>No upcoming jobs.</div>
              ) : upcoming.map((job, i) => {
                const av = avColors[i % avColors.length]
                const days = job.next_service_date ? getDays(job.next_service_date) : 999
                const u = urgency(days)
                return (
                  <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)} style={{ borderRadius: '14px', padding: '14px', background: WHITE, border: `1px solid ${BORDER}`, cursor: 'pointer', display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                        {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ ...TYPE.titleSm, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                        <div style={{ ...TYPE.bodySm, marginTop: '2px' }}>{job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: TEXT3, fontSize: '11px', fontWeight: 500 }}>
                        <IconCalendar size={14} />
                        <span>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'No scheduled date'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ ...TYPE.bodySm }}>{job.customers?.suburb || 'No suburb'}</div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: u.val }}>{u.text}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={panelCard}>
            <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '10px', marginBottom: '12px' }}>
              <div>
                <div style={sectionLabel}>Recent customers</div>
                <div style={{ ...TYPE.bodySm }}>Most recently added customers and their current service status.</div>
              </div>
              <button onClick={() => router.push('/dashboard/customers')} style={{ height: '34px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '12px', fontWeight: 700, padding: '0 12px', cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                View all <IconArrow size={15} />
              </button>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {recent.length === 0 ? (
                <div style={{ borderRadius: '12px', padding: '26px 16px', background: WHITE, border: `1px solid ${BORDER}`, textAlign: 'center', color: TEXT3, fontSize: '14px', fontWeight: 500 }}>No recent customers yet.</div>
              ) : recent.slice(0, 5).map((job, i) => {
                const av = avColors[(i + 1) % avColors.length]
                const status = statusPill(job.next_service_date)
                return (
                  <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                    style={{ borderRadius: '14px', padding: isMobile ? '14px' : '14px 16px', background: WHITE, border: `1px solid ${BORDER}`, cursor: 'pointer', display: 'grid', gridTemplateColumns: isMobile ? '1fr auto' : 'minmax(0,1.2fr) minmax(0,1fr) minmax(0,0.9fr) auto', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                        {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                        <div style={{ ...TYPE.bodySm, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.customers?.suburb || 'No suburb'}</div>
                      </div>
                    </div>
                    {!isMobile && (
                      <>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ ...TYPE.label, marginBottom: '4px' }}>Unit</div>
                          <div style={{ ...TYPE.body, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ ...TYPE.label, marginBottom: '4px' }}>Next service</div>
                          <div style={{ ...TYPE.body, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not scheduled'}</div>
                        </div>
                      </>
                    )}
                    <div style={{ justifySelf: 'end', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      {!isMobile && job.customers?.phone && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 9px', borderRadius: '999px', background: '#F8FAFC', border: `1px solid ${BORDER}`, color: TEXT3, fontSize: '11px', fontWeight: 700 }}>
                          <IconPhone size={12} /> {job.customers.phone}
                        </span>
                      )}
                      <span style={{ background: status.bg, color: status.color, padding: '7px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{status.label}</span>
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