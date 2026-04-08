'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

// ─── Tokens (original preserved + a few additions) ────────────────────────────
const TEAL      = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_LIGHT= '#E6F7F6'
const RED       = '#B91C1C'
const RED_LIGHT = '#FEF2F2'
const AMBER     = '#92400E'
const AMB_LIGHT = '#FFFBEB'
const GREEN     = '#15803D'
const GRN_LIGHT = '#F0FDF4'
const BLUE      = '#2563EB'
const TEXT      = '#0B1220'
const TEXT2     = '#1F2937'
const TEXT3     = '#475569'
const TEXT4     = '#94A3B8'
const BORDER    = '#E2E8F0'
const BORDER2   = '#F1F5F9'
const BG        = '#F6F7F9'
const WHITE     = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT      = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TYPE = {
  label: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.09em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT4,
  },
  bodySm: {
    fontSize: '11px',
    fontWeight: 500,
    color: TEXT3,
    lineHeight: 1.5,
  },
  body: {
    fontSize: '12px',
    fontWeight: 500,
    color: TEXT2,
    lineHeight: 1.5,
  },
  titleSm: {
    fontSize: '13px',
    fontWeight: 700,
    color: TEXT,
    lineHeight: 1.3,
  },
  valueLg: {
    fontSize: '30px',
    fontWeight: 900,
    letterSpacing: '-0.05em' as const,
    lineHeight: 1,
  },
  valueSm: {
    fontSize: '18px',
    fontWeight: 800,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
    lineHeight: 1,
  },
}

const avColors = [
  { bg: '#E0F2F1', color: '#00695C' },
  { bg: '#DBEAFE', color: '#1D4ED8' },
  { bg: '#FEF3C7', color: '#92400E' },
  { bg: '#EDE9FE', color: '#5B21B6' },
  { bg: '#FCE7F3', color: '#9D174D' },
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

// ─────────────────────────────────────────────────────────────────────────────
// ICON SYSTEM — unified 20×20 viewBox, 1.75 stroke, round caps
// ─────────────────────────────────────────────────────────────────────────────
const S = { strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function Ico({ size = 16, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
      {children}
    </svg>
  )
}

function IconUsers({ size = 16 }: { size?: number }) {
  return <Ico size={size}>
    <path d="M13.5 17v-1.5a3 3 0 0 0-3-3H5.5a3 3 0 0 0-3 3V17" stroke="currentColor" {...S}/>
    <circle cx="8" cy="6.5" r="3" stroke="currentColor" {...S}/>
    <path d="M17 17v-1.5a3 3 0 0 0-2.25-2.9M12.25 3.6a3 3 0 0 1 0 5.8" stroke="currentColor" {...S}/>
  </Ico>
}

function IconBriefcase({ size = 16 }: { size?: number }) {
  return <Ico size={size}>
    <rect x="2" y="6" width="16" height="11" rx="2" stroke="currentColor" {...S}/>
    <path d="M7 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1M2 11h16" stroke="currentColor" {...S}/>
  </Ico>
}

function IconDollar({ size = 16 }: { size?: number }) {
  return <Ico size={size}>
    <path d="M10 2v16M13.5 5.5C13.5 4.12 11.93 3 10 3S6.5 4.12 6.5 5.5 8.07 8 10 8s3.5 1.12 3.5 2.5S12.07 14 10 14s-3.5-1.12-3.5-2.5" stroke="currentColor" {...S}/>
  </Ico>
}

function IconAlert({ size = 16 }: { size?: number }) {
  return <Ico size={size}>
    <path d="M8.68 3.45 1.93 15a1.5 1.5 0 0 0 1.32 2.25h13.5A1.5 1.5 0 0 0 18.07 15L11.32 3.45a1.5 1.5 0 0 0-2.64 0Z" stroke="currentColor" {...S}/>
    <path d="M10 8v3.5" stroke="currentColor" {...S}/>
    <circle cx="10" cy="14.5" r="0.75" fill="currentColor"/>
  </Ico>
}

function IconCalendar({ size = 16 }: { size?: number }) {
  return <Ico size={size}>
    <rect x="2.5" y="3.5" width="15" height="14" rx="2" stroke="currentColor" {...S}/>
    <path d="M13.5 2v3M6.5 2v3M2.5 9h15" stroke="currentColor" {...S}/>
  </Ico>
}

function IconReceipt({ size = 16 }: { size?: number }) {
  return <Ico size={size}>
    <path d="M5.5 2.5h9a1.5 1.5 0 0 1 1.5 1.5v14l-2-1.25L12 18l-2-1.25L8 18l-2-1.25L4 18V4a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" {...S}/>
    <path d="M7 7.5h6M7 11h6M7 14.5h4" stroke="currentColor" {...S}/>
  </Ico>
}

function IconArrow({ size = 14 }: { size?: number }) {
  return <Ico size={size}>
    <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" {...S}/>
  </Ico>
}

function IconPlus({ size = 14 }: { size?: number }) {
  return <Ico size={size}>
    <path d="M10 4v12M4 10h12" stroke="currentColor" {...S}/>
  </Ico>
}

function IconPhone({ size = 14 }: { size?: number }) {
  return <Ico size={size}>
    <path d="M17.5 14.4v2.1a1.4 1.4 0 0 1-1.5 1.4 13.9 13.9 0 0 1-6-2.1 13.6 13.6 0 0 1-4.2-4.2 13.9 13.9 0 0 1-2.1-6.1 1.4 1.4 0 0 1 1.4-1.5h2.1a1.4 1.4 0 0 1 1.4 1.2l.35 2.1a1.4 1.4 0 0 1-.4 1.25l-.9.9a11.2 11.2 0 0 0 4.2 4.2l.9-.9a1.4 1.4 0 0 1 1.25-.4l2.1.35a1.4 1.4 0 0 1 1.2 1.4Z" stroke="currentColor" {...S}/>
  </Ico>
}

function IconSpark({ size = 16 }: { size?: number }) {
  return <Ico size={size}>
    <path d="m10 2 1.35 3.65L15 7l-3.65 1.35L10 12l-1.35-3.65L5 7l3.65-1.35L10 2Z" stroke="currentColor" {...S}/>
    <path d="m16 12.5.65 1.85L18.5 15l-1.85.65L16 17.5l-.65-1.85L13.5 15l1.85-.65L16 12.5ZM4 12l.65 1.85L6.5 14.5l-1.85.65L4 17l-.65-1.85L1.5 14.5l1.85-.65L4 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </Ico>
}

function IconTrend({ size = 14 }: { size?: number }) {
  return <Ico size={size}>
    <path d="M2 14l5-5 3.5 3.5L17 5" stroke="currentColor" {...S}/>
    <path d="M13 5h4v4" stroke="currentColor" {...S}/>
  </Ico>
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const cardBase: React.CSSProperties = {
  background: WHITE,
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
  boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03)',
}

function IconBadge({ children, color, bg, size = 36 }: { children: React.ReactNode; color: string; bg: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 10, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {children}
    </div>
  )
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      height: 32, padding: '0 12px', borderRadius: 8,
      border: `1px solid ${BORDER}`, background: WHITE,
      color: TEXT2, fontSize: 12, fontWeight: 600,
      cursor: 'pointer', fontFamily: FONT,
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 210, thickness = 32 }: {
  segments: { label: string; percent: number; color: string }[]
  size?: number
  thickness?: number
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const cx = size / 2, cy = size / 2
  const r  = (size - thickness) / 2 - 2
  const C  = 2 * Math.PI * r

  let cum = 0
  const arcs = segments.map(seg => {
    const start = cum
    const sweep = (seg.percent / 100) * C
    cum += sweep
    return { ...seg, start, sweep }
  })

  const hov = segments.find(s => s.label === hovered)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={BORDER2} strokeWidth={thickness}/>
        {arcs.map(arc => (
          <circle key={arc.label} cx={cx} cy={cy} r={r} fill="none"
            stroke={arc.color}
            strokeWidth={hovered === arc.label ? thickness + 5 : thickness}
            strokeDasharray={`${arc.sweep} ${C}`}
            strokeDashoffset={-arc.start}
            strokeLinecap="butt"
            style={{ transition: 'stroke-width 0.18s ease, opacity 0.18s ease', opacity: hovered && hovered !== arc.label ? 0.3 : 1, cursor: 'pointer' }}
            onMouseEnter={() => setHovered(arc.label)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {hov ? (
          <>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: hov.color, marginBottom: 6 }}/>
            <div style={{ fontSize: 22, fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{hov.percent}%</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: TEXT3, marginTop: 5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{hov.label}</div>
          </>
        ) : (
          <>
            <div style={{ color: TEAL_DARK }}><IconDollar size={18}/></div>
            <div style={{ fontSize: 10, fontWeight: 700, color: TEXT3, marginTop: 5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mix</div>
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BAR CHART
// ─────────────────────────────────────────────────────────────────────────────
function AppointmentsBarChart({ data, stats, dueSoonCount, isMobile }: {
  data: { label: string; total: number; completed: number }[]
  stats: { jobsThisMonth: number; overdue: number; units: number }
  dueSoonCount: number
  isMobile: boolean
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const CHART_H = 152
  const chartMax = useMemo(() => Math.max(...data.map(d => Math.max(d.total, d.completed)), 1), [data])
  const ticks = useMemo(() => { const t = Math.max(4, chartMax); return [t, Math.round(t * 0.5), 0] }, [chartMax])

  const pills = [
    { label: 'Jobs this month', value: stats.jobsThisMonth, color: TEAL },
    { label: 'Overdue',         value: stats.overdue,       color: RED },
    { label: 'Due soon',        value: dueSoonCount,        color: AMBER },
    { label: 'Units tracked',   value: stats.units,         color: TEXT2 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Mini stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 8 }}>
        {pills.map(p => (
          <div key={p.label} style={{ borderRadius: 12, background: BG, border: `1px solid ${BORDER}`, padding: '10px 14px' }}>
            <div style={{ ...TYPE.label, marginBottom: 6 }}>{p.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: p.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{p.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ borderRadius: 14, background: WHITE, border: `1px solid ${BORDER}`, padding: '16px 16px 14px' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          {[{ label: 'Total jobs', color: '#E2E8F0' }, { label: 'Completed', color: TEAL }].map(l => (
            <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: TEXT3 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }}/>
              {l.label}
            </span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: CHART_H }}>
            {ticks.map((t, i) => (
              <span key={i} style={{ fontSize: 9, fontWeight: 700, color: TEXT4, lineHeight: 1, textAlign: 'right', display: 'block' }}>{t}</span>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            {[0, 50, 100].map((pct, i) => (
              <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${pct}%`, borderTop: `1px ${i === 2 ? 'solid' : 'dashed'} ${BORDER}`, zIndex: 0 }}/>
            ))}
            <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gap: 5, height: CHART_H, alignItems: 'end' }}>
              {data.map(item => {
                const totalH = Math.max(item.total > 0 ? 5 : 0, (item.total / chartMax) * CHART_H)
                const compH  = Math.max(item.completed > 0 ? 3 : 0, (item.completed / chartMax) * CHART_H)
                const isHov  = hovered === item.label
                return (
                  <div key={item.label}
                    onMouseEnter={() => setHovered(item.label)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, height: '100%', position: 'relative' }}
                  >
                    {isHov && item.total > 0 && (
                      <div style={{
                        position: 'absolute', bottom: CHART_H + 4, left: '50%', transform: 'translateX(-50%)',
                        background: TEXT, color: WHITE, fontSize: 10, fontWeight: 700,
                        padding: '4px 8px', borderRadius: 6, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}>
                        {item.total} · {item.completed} done
                      </div>
                    )}
                    <div style={{
                      width: '100%', height: totalH, position: 'relative',
                      borderRadius: '5px 5px 3px 3px',
                      background: isHov ? '#CBD5E1' : '#E2E8F0',
                      transition: 'background 0.15s', overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: compH,
                        borderRadius: '5px 5px 3px 3px',
                        background: `linear-gradient(180deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`,
                        boxShadow: isHov ? `0 2px 8px ${TEAL}44` : 'none',
                        transition: 'box-shadow 0.15s',
                      }}/>
                    </div>
                    <div style={{ fontSize: 9, fontWeight: isHov ? 800 : 600, color: isHov ? TEXT2 : TEXT4, transition: 'color 0.15s', marginTop: 2 }}>
                      {item.label}
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

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE DISTRIBUTION
// ─────────────────────────────────────────────────────────────────────────────
function RevenueDistributionWidget({ distribution, isMobile }: {
  distribution: { label: string; value: number; percent: number; color: string }[]
  isMobile: boolean
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const strongest = [...distribution].sort((a, b) => b.percent - a.percent)[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 2px' }}>
        <DonutChart segments={distribution} size={isMobile ? 190 : 200} thickness={30}/>
      </div>

      <div style={{ display: 'grid', gap: 4 }}>
        {distribution.map(item => {
          const isHov = hovered === item.label
          return (
            <div key={item.label}
              onMouseEnter={() => setHovered(item.label)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 10,
                background: isHov ? BORDER2 : 'transparent',
                border: `1px solid ${isHov ? BORDER : 'transparent'}`,
                cursor: 'default', transition: 'all 0.15s',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0, boxShadow: isHov ? `0 0 0 3px ${item.color}33` : 'none', transition: 'box-shadow 0.15s' }}/>
              <span style={{ fontSize: 12, fontWeight: 600, color: isHov ? TEXT : TEXT2, flex: 1, transition: 'color 0.15s' }}>{item.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 44, height: 3, borderRadius: 999, background: BORDER2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.percent}%`, background: item.color, borderRadius: 999, transition: 'width 0.3s' }}/>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: TEXT, minWidth: 30, textAlign: 'right' }}>{item.percent}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ borderRadius: 10, background: TEAL_LIGHT, border: `1px solid #B2E0DC`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ color: TEAL_DARK, flexShrink: 0 }}><IconTrend size={15}/></div>
        <div style={{ fontSize: 12, color: TEXT3, lineHeight: 1.5 }}>
          Top workflow:{' '}
          <span style={{ color: TEAL_DARK, fontWeight: 700 }}>{strongest?.label || 'Service'}</span>
          {' '}at <span style={{ color: TEAL_DARK, fontWeight: 700 }}>{strongest?.percent || 0}%</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router   = useRouter()
  const isMobile = useIsMobile()

  const [loading, setLoading]           = useState(true)
  const [stats, setStats]               = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0 })
  const [upcoming, setUpcoming]         = useState<any[]>([])
  const [recent, setRecent]             = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState({ collected: 0, outstanding: 0, paidCount: 0, overdueCount: 0 })
  const [allJobs, setAllJobs]           = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: userData } = await supabase
        .from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) { setLoading(false); return }

      const bid   = userData.business_id
      const today = new Date()

      const [customersRes, jobsRes, invoicesRes] = await Promise.all([
        supabase.from('customers').select('id').eq('business_id', bid),
        supabase.from('jobs')
          .select('*, customers(first_name, last_name, suburb, phone)')
          .eq('business_id', bid)
          .order('next_service_date', { ascending: true }),
        supabase.from('invoices').select('status, total, amount_paid, created_at').eq('business_id', bid),
      ])

      const jobs     = jobsRes.data || []
      const invoices = invoicesRes.data || []
      const overdue  = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today)
      const jobsThisMonth = jobs.filter(j => {
        const d = new Date(j.created_at)
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
      }).length

      setStats({ customers: customersRes.data?.length || 0, units: jobs.length, overdue: overdue.length, jobsThisMonth })
      setAllJobs(jobs)
      setUpcoming(jobs.filter(j => j.next_service_date && new Date(j.next_service_date) >= today).slice(0, 3))
      setRecent([...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6))
      setInvoiceStats({
        collected:    invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total || 0), 0),
        outstanding:  invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0),
        paidCount:    invoices.filter(i => i.status === 'paid').length,
        overdueCount: invoices.filter(i => i.status === 'overdue').length,
      })
      setLoading(false)
    }
    load()
  }, [router])

  function getDays(d: string) {
    return Math.floor((new Date(d).getTime() - Date.now()) / 86400000)
  }

  function urgency(days: number) {
    if (days < 0)   return { val: RED,       text: `${Math.abs(days)}d late` }
    if (days <= 30) return { val: AMBER,     text: `${days}d left` }
    return              { val: TEAL_DARK, text: `${days}d left` }
  }

  function statusPill(d: string | null) {
    if (!d) return { label: 'No date',  bg: BORDER2,    color: TEXT3 }
    const days = getDays(d)
    if (days < 0)   return { label: 'Overdue',  bg: RED_LIGHT,  color: RED }
    if (days <= 30) return { label: 'Due soon', bg: AMB_LIGHT,  color: AMBER }
    return              { label: 'Good',     bg: GRN_LIGHT, color: GREEN }
  }

  const dueSoonCount = useMemo(
    () => allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) >= 0 && getDays(j.next_service_date) <= 30).length,
    [allJobs]
  )

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const monthlyAppointments = useMemo(() => {
    const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const base  = names.map((label, month) => ({ label, total: 0, completed: 0, month }))
    allJobs.forEach(job => {
      const c = job.created_at ? new Date(job.created_at) : null
      if (c && !isNaN(c.getTime())) base[c.getMonth()].total += 1
      if (job.next_service_date) {
        const d = new Date(job.next_service_date)
        if (!isNaN(d.getTime()) && d <= new Date()) base[d.getMonth()].completed += 1
      }
    })
    return base
  }, [allJobs])

  const revenueDistribution = useMemo(() => {
    const buckets = { Service: 0, Installation: 0, Quote: 0, Repair: 0, Other: 0 }
    allJobs.forEach(job => {
      const t = String(job.job_type || '').toLowerCase()
      if (t.includes('service'))      buckets.Service      += 1
      else if (t.includes('install')) buckets.Installation += 1
      else if (t.includes('quote'))   buckets.Quote        += 1
      else if (t.includes('repair'))  buckets.Repair       += 1
      else                            buckets.Other        += 1
    })
    if (Object.values(buckets).every(v => v === 0)) Object.assign(buckets, { Service: 4, Installation: 3, Quote: 2, Repair: 2, Other: 1 })
    const COLORS: Record<string,string> = { Service: '#34D399', Installation: '#60A5FA', Quote: '#A78BFA', Repair: '#FBBF24', Other: '#D1D5DB' }
    const total = Object.values(buckets).reduce((s, v) => s + v, 0)
    return Object.entries(buckets).map(([label, value]) => ({ label, value, percent: Math.round((value / total) * 100), color: COLORS[label] }))
  }, [allJobs])

  const topCards = [
    {
      tag: 'CRM total',     label: 'Customers',
      value: stats.customers.toLocaleString('en-AU'),
      sub: 'Registered contacts',
      icon: <IconUsers size={18}/>,
      iconColor: TEXT2,     iconBg: BORDER2,
      valueColor: TEXT,
    },
    {
      tag: 'Monthly',       label: 'New jobs',
      value: `+${stats.jobsThisMonth}`,
      sub: 'Created this month',
      icon: <IconBriefcase size={18}/>,
      iconColor: TEAL_DARK, iconBg: TEAL_LIGHT,
      valueColor: TEAL_DARK,
    },
    {
      tag: 'Paid total',    label: 'Revenue',
      value: `$${invoiceStats.collected.toLocaleString('en-AU')}`,
      sub: 'Collected invoices',
      icon: <IconDollar size={18}/>,
      iconColor: GREEN,     iconBg: GRN_LIGHT,
      valueColor: TEXT,
    },
    {
      tag: 'Action needed', label: 'Overdue',
      value: stats.overdue.toLocaleString('en-AU'),
      sub: stats.overdue > 0 ? 'Needs attention' : 'All clear',
      icon: <IconAlert size={18}/>,
      iconColor: stats.overdue > 0 ? RED : GREEN,
      iconBg:    stats.overdue > 0 ? RED_LIGHT : GRN_LIGHT,
      valueColor: stats.overdue > 0 ? RED : GREEN,
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard"/>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: 13, fontWeight: 600 }}>
          Loading dashboard...
        </div>
      </div>
    )
  }

  // Original header quick-action style — UNCHANGED
  const quickActionStyle: React.CSSProperties = {
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT2,
    borderRadius: '10px',
    height: '38px',
    padding: '0 14px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: FONT, background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard"/>

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: BG }}>
        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: isMobile ? 14 : 18, gap: 14 }}>

          {/* ══════════════════════════════════════════════════════════════════
              HEADER — PIXEL-IDENTICAL TO ORIGINAL
          ══════════════════════════════════════════════════════════════════ */}
          <div style={{
            background: HEADER_BG,
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
            overflow: 'hidden',
            padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>
              {todayStr}
            </div>
            <div style={{ fontSize: isMobile ? '28px' : '34px', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px' }}>
              Dashboard
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', maxWidth: '760px' }}>
              Track customers, service due dates, invoices, and jobs from one premium control centre built for fast daily decisions.
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/dashboard/jobs')}
                style={{ ...quickActionStyle, background: TEAL, color: '#FFFFFF', border: 'none', boxShadow: '0 6px 14px rgba(31,158,148,0.20)' }}
              >
                <IconSpark size={16}/> Add job
              </button>
              <button
                onClick={() => router.push('/dashboard/quotes')}
                style={{ ...quickActionStyle, background: 'rgba(255,255,255,0.06)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.10)', boxShadow: 'none' }}
              >
                <IconReceipt size={16}/> New quote
              </button>
              <button
                onClick={() => router.push('/dashboard/schedule')}
                style={{ ...quickActionStyle, background: 'rgba(255,255,255,0.06)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.10)', boxShadow: 'none' }}
              >
                <IconCalendar size={16}/> Service schedule
              </button>
            </div>
          </div>

          {/* ── Stat cards ──────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 10 }}>
            {topCards.map(c => (
              <div key={c.label} style={{ ...cardBase, padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 132 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: 5 }}>{c.tag}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT2 }}>{c.label}</div>
                  </div>
                  <IconBadge color={c.iconColor} bg={c.iconBg} size={34}>{c.icon}</IconBadge>
                </div>
                <div>
                  <div style={{ ...TYPE.valueLg, fontSize: isMobile ? 24 : 28, color: c.valueColor }}>{c.value}</div>
                  <div style={{ ...TYPE.bodySm, marginTop: 5, fontSize: 11 }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Charts row ──────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 316px', gap: 14, alignItems: 'start' }}>
            <div style={{ ...cardBase, padding: '18px 20px 20px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 3 }}>Total appointments</div>
                <div style={{ ...TYPE.bodySm }}>Teal = completed services · Grey = total job activity</div>
              </div>
              <AppointmentsBarChart data={monthlyAppointments} stats={stats} dueSoonCount={dueSoonCount} isMobile={isMobile}/>
            </div>
            <div style={{ ...cardBase, padding: '18px 20px 20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 14 }}>Job type mix</div>
              <RevenueDistributionWidget distribution={revenueDistribution} isMobile={isMobile}/>
            </div>
          </div>

          {/* ── Upcoming jobs ────────────────────────────────────────────────── */}
          <div style={{ ...cardBase, padding: '18px 20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Upcoming jobs</div>
              <GhostBtn onClick={() => router.push('/dashboard/schedule')}>View all <IconArrow size={13}/></GhostBtn>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 10 }}>
              {upcoming.length === 0 ? (
                <div style={{ gridColumn: '1/-1', borderRadius: 12, padding: '28px 16px', border: `1px dashed ${BORDER}`, textAlign: 'center', color: TEXT3, fontSize: 13 }}>
                  No upcoming jobs scheduled.
                </div>
              ) : upcoming.map((job, i) => {
                const av   = avColors[i % avColors.length]
                const days = job.next_service_date ? getDays(job.next_service_date) : 999
                const u    = urgency(days)
                return (
                  <div key={job.id}
                    onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                    style={{
                      borderRadius: 14, padding: 16,
                      border: `1px solid ${BORDER}`, background: WHITE,
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14,
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => {
                      ;(e.currentTarget as HTMLDivElement).style.borderColor = TEAL
                      ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 16px ${TEAL}1A`
                    }}
                    onMouseLeave={e => {
                      ;(e.currentTarget as HTMLDivElement).style.borderColor = BORDER
                      ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, letterSpacing: '0.03em' }}>
                        {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ ...TYPE.titleSm, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.customers?.first_name} {job.customers?.last_name}
                        </div>
                        <div style={{ ...TYPE.bodySm, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.brand || 'Unit'}{job.capacity_kw ? ` · ${job.capacity_kw}kW` : ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: TEXT3, fontSize: 11, fontWeight: 500 }}>
                        <span style={{ color: TEXT4 }}><IconCalendar size={13}/></span>
                        {job.next_service_date
                          ? new Date(job.next_service_date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                          : 'No scheduled date'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ ...TYPE.bodySm, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.customers?.suburb || 'No suburb'}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: u.val, flexShrink: 0 }}>{u.text}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Recent customers ─────────────────────────────────────────────── */}
          <div style={{ ...cardBase, padding: '18px 20px 20px' }}>
            <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: 10, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 2 }}>Recent customers</div>
                <div style={{ ...TYPE.bodySm }}>Most recently added and their current service status.</div>
              </div>
              <GhostBtn onClick={() => router.push('/dashboard/customers')}>View all <IconArrow size={13}/></GhostBtn>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recent.length === 0 ? (
                <div style={{ borderRadius: 12, padding: '28px 16px', border: `1px dashed ${BORDER}`, textAlign: 'center', color: TEXT3, fontSize: 13 }}>
                  No recent customers yet.
                </div>
              ) : recent.slice(0, 5).map((job, i) => {
                const av     = avColors[(i + 1) % avColors.length]
                const status = statusPill(job.next_service_date)
                return (
                  <div key={job.id}
                    onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                    style={{
                      borderRadius: 12, padding: isMobile ? '14px' : '11px 14px',
                      border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer',
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 136px 148px auto',
                      gap: 12, alignItems: 'center',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = BG }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = WHITE }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0, letterSpacing: '0.04em' }}>
                        {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.customers?.first_name} {job.customers?.last_name}
                        </div>
                        <div style={{ ...TYPE.bodySm, fontSize: 11, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.customers?.suburb || 'No suburb'}
                        </div>
                      </div>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ ...TYPE.label, marginBottom: 4 }}>Unit</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {job.brand || 'Unit'}{job.capacity_kw ? ` ${job.capacity_kw}kW` : ''}
                      </div>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ ...TYPE.label, marginBottom: 4 }}>Next service</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {job.next_service_date
                          ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'Not scheduled'}
                      </div>
                    </div>

                    <div style={{ justifySelf: isMobile ? 'start' : 'end', display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {job.customers?.phone && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: BORDER2, border: `1px solid ${BORDER}`, color: TEXT3, fontSize: 11, fontWeight: 600 }}>
                          <IconPhone size={12}/>{job.customers.phone}
                        </span>
                      )}
                      <span style={{ background: status.bg, color: status.color, padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                        {status.label}
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