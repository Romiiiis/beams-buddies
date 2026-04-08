'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const RED = '#B91C1C'
const AMBER = '#92400E'
const BLUE = '#2563EB'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#475569'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TYPE = {
  label: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.08em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  section: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.14em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  bodySm: {
    fontSize: '11px',
    fontWeight: 500,
    color: TEXT3,
    lineHeight: 1.45,
  },
  body: {
    fontSize: '12px',
    fontWeight: 500,
    color: TEXT2,
    lineHeight: 1.45,
  },
  titleSm: {
    fontSize: '12px',
    fontWeight: 800,
    color: TEXT,
    lineHeight: 1.3,
  },
  title: {
    fontSize: '13px',
    fontWeight: 700,
    color: TEXT2,
    lineHeight: 1.35,
  },
  valueLg: {
    fontSize: '28px',
    fontWeight: 900,
    letterSpacing: '-0.05em' as const,
    lineHeight: 1,
  },
  valueMd: {
    fontSize: '20px',
    fontWeight: 900,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
    lineHeight: 1,
  },
  valueSm: {
    fontSize: '16px',
    fontWeight: 900,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
    lineHeight: 1,
  },
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

// ─────────────────────────────────────────────────────────────────────────────
// ICONS — cleaner, slightly heavier stroke weight for better legibility at sm
// ─────────────────────────────────────────────────────────────────────────────
function IconUsers({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconTool({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.86l-6.01 6.01a1.5 1.5 0 1 0 2.12 2.12l6.01-6.01a4 4 0 0 0 5.86-5.4l-2.33 2.33-2.25-.45-.45-2.25 2.45-2.21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconAlert({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 9v4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"/>
      <circle cx="12" cy="16.5" r="0.9" fill="currentColor"/>
      <path d="M10.29 3.86 1.82 18A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconInvoice({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3h10a2 2 0 0 1 2 2v16l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconRevenue({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v20M17 6.5c0-1.93-2.24-3.5-5-3.5S7 4.57 7 6.5 9.24 10 12 10s5 1.57 5 3.5S14.76 17 12 17s-5-1.57-5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconCalendar({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconArrow({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
}

function IconJob({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="16" height="13" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M9 6V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 11v4M10 13h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function IconPhone({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.4 19.4 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.2 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.8 9.8a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5A2 2 0 0 1 22 16.9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconLocation({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  )
}

function IconClock({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Donut Chart
// ─────────────────────────────────────────────────────────────────────────────
function DonutChart({
  segments,
  size = 220,
  thickness = 36,
}: {
  segments: { label: string; percent: number; color: string }[]
  size?: number
  thickness?: number
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const cx = size / 2
  const cy = size / 2
  const r = (size - thickness) / 2 - 4
  const circumference = 2 * Math.PI * r

  let cumulative = 0
  const arcs = segments.map((seg) => {
    const startAngle = cumulative
    const sweep = (seg.percent / 100) * circumference
    cumulative += sweep
    return { ...seg, startAngle, sweep }
  })

  const isHovered = (label: string) => hovered === label
  const hoveredSeg = segments.find(s => s.label === hovered)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block', transform: 'rotate(-90deg)' }}
      >
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={thickness} />
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={isHovered(arc.label) ? thickness + 6 : thickness}
            strokeDasharray={`${arc.sweep} ${circumference}`}
            strokeDashoffset={-arc.startAngle}
            strokeLinecap="butt"
            style={{
              transition: 'stroke-width 0.18s ease, opacity 0.18s ease',
              opacity: hovered && !isHovered(arc.label) ? 0.35 : 1,
              cursor: 'pointer',
            }}
            onMouseEnter={() => setHovered(arc.label)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {hoveredSeg ? (
          <>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: hoveredSeg.color, marginBottom: 6 }} />
            <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {hoveredSeg.percent}%
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3, marginTop: 4, letterSpacing: '0.02em' }}>
              {hoveredSeg.label}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT3, marginBottom: 4 }}>
              Mix
            </div>
            <div style={{ color: TEAL_DARK }}><IconRevenue size={22} /></div>
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Bar Chart
// ─────────────────────────────────────────────────────────────────────────────
function AppointmentsBarChart({
  data,
  stats,
  dueSoonCount,
  isMobile,
}: {
  data: { label: string; total: number; completed: number }[]
  stats: { jobsThisMonth: number; overdue: number; units: number }
  dueSoonCount: number
  isMobile: boolean
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const chartMax = useMemo(() => Math.max(...data.map(d => Math.max(d.total, d.completed)), 1), [data])
  const CHART_H = 160
  const ticks = useMemo(() => {
    const top = Math.max(4, chartMax)
    return [top, Math.round(top * 0.5), 0]
  }, [chartMax])

  const miniStats = [
    { label: 'Jobs this month', value: stats.jobsThisMonth, accent: TEAL },
    { label: 'Overdue',         value: stats.overdue,       accent: '#EF4444' },
    { label: 'Due soon',        value: dueSoonCount,        accent: '#F59E0B' },
    { label: 'Units tracked',   value: stats.units,         accent: TEXT3 },
  ]

  return (
    <>
      {/* Mini stat pills */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        {miniStats.map(item => (
          <div
            key={item.label}
            style={{
              borderRadius: '12px',
              background: '#F8FAFC',
              border: `1px solid ${BORDER}`,
              padding: '11px 13px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Left accent stripe */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: item.accent, borderRadius: '3px 0 0 3px' }} />
            <div style={{ ...TYPE.label, marginBottom: '6px', paddingLeft: '2px' }}>{item.label}</div>
            <div style={{ ...TYPE.valueSm, color: item.accent }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div
        style={{
          borderRadius: '14px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)',
          border: `1px solid ${BORDER}`,
          padding: '16px 16px 12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
          {[
            { color: '#E2E8F0', border: '#D1D9E0', label: 'Total jobs' },
            { color: TEAL, border: 'none', label: 'Completed services' },
          ].map(l => (
            <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: TEXT3 }}>
              <span style={{ width: 10, height: 10, borderRadius: '3px', background: l.color, border: l.border ? `1px solid ${l.border}` : 'none', display: 'inline-block' }} />
              {l.label}
            </span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: '8px', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: CHART_H, paddingBottom: '2px' }}>
            {ticks.map((t, i) => (
              <span key={i} style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, lineHeight: 1, textAlign: 'right' }}>{t}</span>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            {[0, 50, 100].map((pct, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute', left: 0, right: 0, top: `${pct}%`,
                  borderTop: `1px ${i === 2 ? 'solid' : 'dashed'} #E8EDF3`, zIndex: 0,
                }}
              />
            ))}
            <div
              style={{
                position: 'relative', zIndex: 1,
                display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0,1fr))',
                gap: '6px', height: CHART_H, alignItems: 'end',
              }}
            >
              {data.map((item) => {
                const totalH = Math.max(item.total > 0 ? 6 : 0, (item.total / chartMax) * CHART_H)
                const compH  = Math.max(item.completed > 0 ? 4 : 0, (item.completed / chartMax) * CHART_H)
                const isActive = hovered === item.label
                return (
                  <div
                    key={item.label}
                    onMouseEnter={() => setHovered(item.label)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', height: '100%', position: 'relative' }}
                  >
                    {isActive && item.total > 0 && (
                      <div
                        style={{
                          position: 'absolute', bottom: CHART_H - 4, left: '50%', transform: 'translateX(-50%)',
                          background: '#0B1220', color: '#FFFFFF', fontSize: '10px', fontWeight: 800,
                          padding: '4px 7px', borderRadius: '7px', whiteSpace: 'nowrap',
                          pointerEvents: 'none', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                        }}
                      >
                        {item.total} jobs · {item.completed} done
                      </div>
                    )}
                    <div
                      style={{
                        width: '100%', height: totalH, position: 'relative',
                        borderRadius: '6px 6px 3px 3px',
                        background: isActive ? 'linear-gradient(180deg,#D4DCE6 0%,#C8D3DF 100%)' : 'linear-gradient(180deg,#EEF2F6 0%,#E2E8F0 100%)',
                        transition: 'background 0.15s ease', overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0, height: compH,
                          borderRadius: '6px 6px 3px 3px',
                          background: isActive ? 'linear-gradient(180deg,#28C4B5 0%,#1F9E94 100%)' : 'linear-gradient(180deg,#2BBDB0 0%,#1F9E94 100%)',
                          boxShadow: isActive ? '0 2px 10px rgba(31,158,148,0.30)' : '0 2px 6px rgba(31,158,148,0.15)',
                          transition: 'background 0.15s ease',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: isActive ? 800 : 700, color: isActive ? TEXT2 : TEXT3, transition: 'color 0.15s ease', marginTop: '4px' }}>
                      {item.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Revenue Distribution Widget
// ─────────────────────────────────────────────────────────────────────────────
function RevenueDistributionWidget({
  distribution,
  isMobile,
}: {
  distribution: { label: string; value: number; percent: number; color: string }[]
  isMobile: boolean
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const strongest = [...distribution].sort((a, b) => b.percent - a.percent)[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0 0' }}>
        <DonutChart segments={distribution} size={isMobile ? 200 : 210} thickness={34} />
      </div>
      <div style={{ display: 'grid', gap: '6px' }}>
        {distribution.map((item) => {
          const isHov = hovered === item.label
          return (
            <div
              key={item.label}
              onMouseEnter={() => setHovered(item.label)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center',
                gap: '10px', padding: '9px 12px', borderRadius: '12px',
                background: isHov ? '#F4F8FA' : '#FCFCFD',
                border: `1px solid ${isHov ? '#D0DCE8' : BORDER}`,
                cursor: 'default', transition: 'background 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                <span
                  style={{
                    width: 10, height: 10, borderRadius: '3px', background: item.color, flexShrink: 0,
                    boxShadow: isHov ? `0 0 0 2px ${item.color}44` : 'none', transition: 'box-shadow 0.15s ease',
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: 700, color: isHov ? TEXT : TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.15s ease' }}>
                  {item.label}
                </span>
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
      <div
        style={{
          borderRadius: '12px', background: '#F0FAF9', border: `1px solid #C4E8E5`,
          padding: '10px 13px', display: 'flex', alignItems: 'center', gap: '10px',
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: '8px', background: TEAL, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IconRevenue size={14} />
        </div>
        <div style={{ fontSize: '12px', color: TEXT3, lineHeight: 1.45 }}>
          Strongest workflow:{' '}
          <span style={{ color: TEXT, fontWeight: 800 }}>{strongest?.label || 'Service'}</span>{' '}at{' '}
          <span style={{ color: TEAL_DARK, fontWeight: 800 }}>{strongest?.percent || 0}%</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Header with ruled left bar
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '3px', height: sub ? '32px' : '20px', borderRadius: '99px', background: TEAL, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT, lineHeight: 1.2 }}>{title}</div>
        {sub && <div style={{ ...TYPE.bodySm, marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
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

      const { data: userData } = await supabase
        .from('users').select('business_id').eq('id', session.user.id).single()

      if (!userData) { setLoading(false); return }

      const bid = userData.business_id
      const today = new Date()

      const [customersRes, jobsRes, invoicesRes] = await Promise.all([
        supabase.from('customers').select('id').eq('business_id', bid),
        supabase.from('jobs').select('*, customers(first_name, last_name, suburb, phone)').eq('business_id', bid).order('next_service_date', { ascending: true }),
        supabase.from('invoices').select('status, total, amount_paid, created_at').eq('business_id', bid),
      ])

      const jobs     = jobsRes.data || []
      const invoices = invoicesRes.data || []

      const overdue       = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today)
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
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function urgency(days: number) {
    if (days < 0)   return { dot: '#EF4444', val: RED,       label: 'Overdue',  text: `${Math.abs(days)}d overdue`, borderColor: '#FEE2E2', bg: '#FFF5F5' }
    if (days <= 30) return { dot: '#F59E0B', val: AMBER,     label: 'Due soon', text: `${days}d left`,              borderColor: '#FEF3C7', bg: '#FFFBF0' }
    return              { dot: TEAL,         val: TEAL_DARK, label: 'On track', text: `${days}d left`,              borderColor: '#D1FAE5', bg: '#F0FDF9' }
  }

  function statusPill(nextServiceDate: string | null) {
    if (!nextServiceDate) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }
    const days = getDays(nextServiceDate)
    if (days < 0)   return { label: 'Overdue',  bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#DCFCE7', color: '#166534' }
  }

  const dueSoonCount = useMemo(() => {
    return allJobs.filter(j => {
      if (!j.next_service_date) return false
      const days = getDays(j.next_service_date)
      return days >= 0 && days <= 30
    }).length
  }, [allJobs])

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const shellCard: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
    overflow: 'hidden',
  }
  const panelCard: React.CSSProperties = { ...shellCard, padding: '20px' }

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

  // ── top cards config ──────────────────────────────────────────────────────
  const topCards = [
    {
      label: 'Customers',
      value: stats.customers.toLocaleString('en-AU'),
      sub: 'Registered in CRM',
      icon: <IconUsers size={17} />,
      accent: '#2563EB',
      iconBg: '#EFF6FF',
      iconColor: '#1D4ED8',
      tag: 'CRM total',
    },
    {
      label: 'New jobs',
      value: `+${stats.jobsThisMonth.toLocaleString('en-AU')}`,
      sub: 'Created this month',
      icon: <IconJob size={17} />,
      accent: TEAL_DARK,
      iconBg: '#E8F7F6',
      iconColor: TEAL_DARK,
      tag: 'Monthly flow',
    },
    {
      label: 'Revenue',
      value: `$${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
      sub: 'Collected invoices',
      icon: <IconRevenue size={17} />,
      accent: '#7C3AED',
      iconBg: '#F5F3FF',
      iconColor: '#6D28D9',
      tag: 'Paid total',
    },
    {
      label: 'Overdue services',
      value: stats.overdue.toLocaleString('en-AU'),
      sub: stats.overdue > 0 ? 'Needs attention' : 'All clear',
      icon: <IconAlert size={17} />,
      accent: stats.overdue > 0 ? '#DC2626' : TEAL_DARK,
      iconBg: stats.overdue > 0 ? '#FEF2F2' : '#E8F7F6',
      iconColor: stats.overdue > 0 ? '#B91C1C' : TEAL_DARK,
      tag: 'Action needed',
    },
  ]

  // ── chart data ────────────────────────────────────────────────────────────
  const monthlyAppointments = useMemo(() => {
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const base = monthNames.map((label, i) => ({ label, total: 0, completed: 0, month: i }))
    allJobs.forEach(job => {
      const created = job.created_at ? new Date(job.created_at) : null
      if (created && !Number.isNaN(created.getTime())) base[created.getMonth()].total += 1
      if (job.next_service_date) {
        const due = new Date(job.next_service_date)
        if (!Number.isNaN(due.getTime()) && due <= new Date()) base[due.getMonth()].completed += 1
      }
    })
    return base
  }, [allJobs])

  const revenueDistribution = useMemo(() => {
    const buckets = { Service: 0, Installation: 0, Quote: 0, Repair: 0, Other: 0 }
    allJobs.forEach(job => {
      const type = String(job.job_type || '').toLowerCase()
      if (type.includes('service'))      buckets.Service      += 1
      else if (type.includes('install')) buckets.Installation += 1
      else if (type.includes('quote'))   buckets.Quote        += 1
      else if (type.includes('repair'))  buckets.Repair       += 1
      else                               buckets.Other        += 1
    })
    if (Object.values(buckets).every(v => v === 0)) {
      buckets.Service = 4; buckets.Installation = 3; buckets.Quote = 2; buckets.Repair = 2; buckets.Other = 1
    }
    const colors: Record<string, string> = { Service: '#6EE7B7', Installation: '#93C5FD', Quote: '#C4B5FD', Repair: '#FCD34D', Other: '#E5E7EB' }
    const total = Object.values(buckets).reduce((s, v) => s + v, 0)
    return Object.entries(buckets).map(([label, value]) => ({
      label, value,
      percent: Math.round((value / total) * 100),
      color: colors[label],
    }))
  }, [allJobs])

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: FONT, background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: BG }}>
        <div
          style={{
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: BG,
            padding: isMobile ? '14px' : '16px',
            gap: '12px',
          }}
        >
          {/* ── Header card ──────────────────────────────────────────────── */}
          <div
            style={{
              ...shellCard,
              padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
              background: HEADER_BG,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
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
                <IconSpark size={16} /> Add job
              </button>
              <button
                onClick={() => router.push('/dashboard/quotes')}
                style={{ ...quickActionStyle, background: 'rgba(255,255,255,0.06)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.10)', boxShadow: 'none' }}
              >
                <IconInvoice size={16} /> New quote
              </button>
              <button
                onClick={() => router.push('/dashboard/schedule')}
                style={{ ...quickActionStyle, background: 'rgba(255,255,255,0.06)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.10)', boxShadow: 'none' }}
              >
                <IconCalendar size={16} /> Service schedule
              </button>
            </div>
          </div>

          {/* ── Top stat cards ─────────────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))',
              gap: '10px',
            }}
          >
            {topCards.map(item => (
              <div
                key={item.label}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top row: icon + tag */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '11px',
                      background: item.iconBg,
                      color: item.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: item.accent,
                      background: `${item.iconBg}`,
                      border: `1px solid ${item.iconBg === '#E8F7F6' ? '#C4E8E5' : item.iconBg === '#FEF2F2' ? '#FEE2E2' : item.iconBg === '#EFF6FF' ? '#BFDBFE' : '#EDE9FE'}`,
                      padding: '3px 8px',
                      borderRadius: '99px',
                    }}
                  >
                    {item.tag}
                  </span>
                </div>

                {/* Value + label */}
                <div>
                  <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 900, letterSpacing: '-0.04em', color: item.accent, lineHeight: 1 }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT, marginTop: '6px' }}>{item.label}</div>
                  <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Charts row ─────────────────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))',
              gap: '12px',
              alignItems: 'start',
            }}
          >
            {/* Appointments chart */}
            <div style={{ ...panelCard, gridColumn: isMobile ? 'span 1' : 'span 8' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '6px',
                  marginBottom: '18px',
                }}
              >
                <SectionHeading
                  title="Total appointments"
                  sub="Teal bars show completed service events. Grey bars show total job activity."
                />
              </div>
              <AppointmentsBarChart
                data={monthlyAppointments}
                stats={stats}
                dueSoonCount={dueSoonCount}
                isMobile={isMobile}
              />
            </div>

            {/* Revenue distribution */}
            <div style={{ ...panelCard, gridColumn: isMobile ? 'span 1' : 'span 4' }}>
              <div style={{ marginBottom: '18px' }}>
                <SectionHeading title="Revenue distribution" />
              </div>
              <RevenueDistributionWidget distribution={revenueDistribution} isMobile={isMobile} />
            </div>
          </div>

          {/* ── Upcoming jobs ───────────────────────────────────────────────── */}
          <div style={{ ...panelCard }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '18px' }}>
              <SectionHeading title="Upcoming jobs" />
              <button
                onClick={() => router.push('/dashboard/schedule')}
                style={{
                  height: '34px', borderRadius: '10px', border: `1px solid ${BORDER}`,
                  background: WHITE, color: TEXT2, fontSize: '12px', fontWeight: 700,
                  padding: '0 12px', cursor: 'pointer', fontFamily: FONT,
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
                }}
              >
                View all <IconArrow size={14} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
              {upcoming.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', borderRadius: '12px', padding: '26px 16px', background: WHITE, border: `1px solid ${BORDER}`, textAlign: 'center', color: TEXT3, fontSize: '14px', fontWeight: 500 }}>
                  No upcoming jobs.
                </div>
              ) : (
                upcoming.map((job, i) => {
                  const av = avColors[i % avColors.length]
                  const days = job.next_service_date ? getDays(job.next_service_date) : 999
                  const u = urgency(days)
                  return (
                    <div
                      key={job.id}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{
                        borderRadius: '14px',
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Urgency strip header */}
                      <div
                        style={{
                          background: u.bg,
                          borderBottom: `1px solid ${u.borderColor}`,
                          padding: '8px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: u.val }}>
                          <IconClock size={12} />
                          {u.label}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: u.val }}>{u.text}</span>
                      </div>

                      {/* Card body */}
                      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '40px', height: '40px', borderRadius: '12px',
                              background: av.bg, color: av.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: 800, flexShrink: 0,
                            }}
                          >
                            {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ ...TYPE.titleSm, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.customers?.first_name} {job.customers?.last_name}
                            </div>
                            <div style={{ ...TYPE.bodySm, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: TEXT3, fontSize: '11px', fontWeight: 600 }}>
                            <IconCalendar size={13} />
                            <span>
                              {job.next_service_date
                                ? new Date(job.next_service_date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                                : 'No scheduled date'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: TEXT3, fontSize: '11px', fontWeight: 600 }}>
                            <IconLocation size={13} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {job.customers?.suburb || 'No suburb'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* ── Recent customers ────────────────────────────────────────────── */}
          <div style={{ ...panelCard }}>
            <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '10px', marginBottom: '18px' }}>
              <SectionHeading
                title="Recent customers"
                sub="Most recently added with current service status."
              />
              <button
                onClick={() => router.push('/dashboard/customers')}
                style={{
                  height: '34px', borderRadius: '10px', border: `1px solid ${BORDER}`,
                  background: WHITE, color: TEXT2, fontSize: '12px', fontWeight: 700,
                  padding: '0 12px', cursor: 'pointer', fontFamily: FONT,
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
                }}
              >
                View all <IconArrow size={14} />
              </button>
            </div>

            {/* Column headers — desktop only */}
            {!isMobile && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,0.9fr) minmax(0,0.9fr) auto',
                  gap: '12px',
                  padding: '0 14px 8px',
                  borderBottom: `1px solid ${BORDER}`,
                  marginBottom: '6px',
                }}
              >
                {['Customer', 'Unit', 'Next service', 'Status'].map(col => (
                  <div key={col} style={{ ...TYPE.label }}>{col}</div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gap: '6px' }}>
              {recent.length === 0 ? (
                <div style={{ borderRadius: '12px', padding: '26px 16px', background: WHITE, border: `1px solid ${BORDER}`, textAlign: 'center', color: TEXT3, fontSize: '14px', fontWeight: 500 }}>
                  No recent customers yet.
                </div>
              ) : (
                recent.slice(0, 5).map((job, i) => {
                  const av = avColors[(i + 1) % avColors.length]
                  const status = statusPill(job.next_service_date)
                  return (
                    <div
                      key={job.id}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{
                        borderRadius: '12px',
                        padding: isMobile ? '13px' : '11px 14px',
                        background: '#FCFCFD',
                        border: `1px solid ${BORDER}`,
                        cursor: 'pointer',
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.4fr) minmax(0,0.9fr) minmax(0,0.9fr) auto',
                        gap: '12px',
                        alignItems: 'center',
                        transition: 'background 0.12s ease, border-color 0.12s ease',
                      }}
                      onMouseEnter={e => {
                        ;(e.currentTarget as HTMLDivElement).style.background = '#F4F7FB'
                        ;(e.currentTarget as HTMLDivElement).style.borderColor = '#D4DCE8'
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget as HTMLDivElement).style.background = '#FCFCFD'
                        ;(e.currentTarget as HTMLDivElement).style.borderColor = BORDER
                      }}
                    >
                      {/* Customer */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '38px', height: '38px', borderRadius: '11px',
                            background: av.bg, color: av.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 800, flexShrink: 0,
                          }}
                        >
                          {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.customers?.first_name} {job.customers?.last_name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px', color: TEXT3, fontSize: '11px', fontWeight: 500 }}>
                            <IconLocation size={11} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {job.customers?.suburb || 'No suburb'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Unit */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                        </div>
                      </div>

                      {/* Next service */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.next_service_date
                            ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Not scheduled'}
                        </div>
                      </div>

                      {/* Status + phone */}
                      <div style={{ justifySelf: isMobile ? 'start' : 'end', display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {job.customers?.phone ? (
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '5px 9px', borderRadius: '999px',
                              background: '#F8FAFC', border: `1px solid ${BORDER}`,
                              color: TEXT3, fontSize: '11px', fontWeight: 700,
                            }}
                          >
                            <IconPhone size={12} /> {job.customers.phone}
                          </span>
                        ) : null}
                        <span
                          style={{
                            background: status.bg, color: status.color,
                            padding: '5px 11px', borderRadius: '999px',
                            fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap',
                            display: 'inline-block', letterSpacing: '0.02em',
                          }}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}