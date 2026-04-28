'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_LIGHT = '#E6F7F6'
const RED = '#B91C1C'
const AMBER = '#92400E'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TYPE = {
  label: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.08em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  bodySm: {
    fontSize: '11px',
    fontWeight: 500,
    color: TEXT3,
    lineHeight: 1.45,
  },
  titleSm: {
    fontSize: '12px',
    fontWeight: 800,
    color: TEXT,
    lineHeight: 1.3,
  },
}

const URGENCY_STYLES = {
  overdue: {
    pillBg: '#FEE2E2',
    pillColor: '#991B1B',
    pillBorder: '#FECACA',
    dot: RED,
    valColor: RED,
    label: 'Overdue',
    accentBar: RED,
  },
  due_soon: {
    pillBg: '#FEF3C7',
    pillColor: '#92400E',
    pillBorder: '#FDE68A',
    dot: '#F59E0B',
    valColor: AMBER,
    label: 'Due soon',
    accentBar: '#F59E0B',
  },
  good: {
    pillBg: TEAL_LIGHT,
    pillColor: TEAL_DARK,
    pillBorder: '#BFE7E3',
    dot: TEAL,
    valColor: TEAL_DARK,
    label: 'On track',
    accentBar: TEAL,
  },
}

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'due_soon', label: 'Due soon' },
  { key: 'good', label: 'On track' },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768)
    }

    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile
}

function IconMail({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSms({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconSpark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrow({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconExternalLink({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UrgencyPill({ status }: { status: 'overdue' | 'due_soon' | 'good' }) {
  const st = URGENCY_STYLES[status]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '6px 9px',
        borderRadius: '999px',
        background: st.pillBg,
        border: `1px solid ${st.pillBorder}`,
        fontSize: '10px',
        fontWeight: 800,
        color: st.pillColor,
        whiteSpace: 'nowrap' as const,
        lineHeight: 1,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block', flexShrink: 0 }} />
      {st.label}
    </span>
  )
}

export default function SchedulePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()

      if (!userData) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('jobs')
        .select('*, customers(first_name, last_name, email, phone, suburb)')
        .eq('business_id', userData.business_id)
        .order('next_service_date', { ascending: true })

      setJobs(data || [])
      setLoading(false)
    }

    load()
  }, [router])

  function getDays(d: string) {
    const target = new Date(d)
    target.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  function getUrgency(d: string) {
    const days = getDays(d)

    if (days < 0) {
      return {
        status: 'overdue' as const,
        ...URGENCY_STYLES.overdue,
        sub: `${Math.abs(days)}d overdue`,
        dateLabel: `Was due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
      }
    }

    if (days <= 30) {
      return {
        status: 'due_soon' as const,
        ...URGENCY_STYLES.due_soon,
        sub: `${days}d until due`,
        dateLabel: `Due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
      }
    }

    return {
      status: 'good' as const,
      ...URGENCY_STYLES.good,
      sub: `${days}d until due`,
      dateLabel: `Due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
    }
  }

  const counts = useMemo(
    () => ({
      all: jobs.length,
      overdue: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length,
      due_soon: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) >= 0 && getDays(j.next_service_date) <= 30).length,
      good: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) > 30).length,
    }),
    [jobs]
  )

  const filtered = useMemo(
    () =>
      jobs.filter(j => {
        if (filter === 'all') return true
        if (!j.next_service_date) return false
        return getUrgency(j.next_service_date).status === filter
      }),
    [jobs, filter]
  )

  const overdueJobs = useMemo(() => jobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0), [jobs])
  const dueSoonJobs = useMemo(() => jobs.filter(j => j.next_service_date && getDays(j.next_service_date) >= 0 && getDays(j.next_service_date) <= 30), [jobs])

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '16px',
  }

  const cardArrowBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: TEXT3,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  }

  const btnOutline: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    border: `1px solid ${BORDER}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: TEXT2,
    background: WHITE,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    transition: 'border-color 0.12s, color 0.12s',
  }

  const btnTeal: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    background: TEAL,
    color: WHITE,
    border: 'none',
    borderRadius: '9px',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.12s',
  }

  const btnMobileSm: React.CSSProperties = {
    height: '36px',
    padding: '0 12px',
    border: `1px solid ${BORDER}`,
    borderRadius: '9px',
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
    flex: 1,
  }

  const btnMobileTeal: React.CSSProperties = {
    ...btnMobileSm,
    background: TEAL,
    border: `1px solid ${TEAL}`,
    color: WHITE,
  }

  const statChips = [
    {
      label: 'Scheduled Units',
      value: counts.all,
      sub: 'With service tracking',
      onClick: () => setFilter('all'),
    },
    {
      label: 'Overdue',
      value: counts.overdue,
      sub: counts.overdue > 0 ? 'Need attention' : 'All clear',
      onClick: () => setFilter('overdue'),
    },
    {
      label: 'Due Soon',
      value: counts.due_soon,
      sub: 'Within 30 days',
      onClick: () => setFilter('due_soon'),
    },
    {
      label: 'On Track',
      value: counts.good,
      sub: 'More than 30 days',
      onClick: () => setFilter('good'),
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/schedule" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>
          Loading schedule...
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard/schedule" />

      <div style={{ flex: 1, minWidth: 0, background: BG }}>
        <div
          style={{
            padding: isMobile ? '0' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
            background: BG,
          }}
        >
          {isMobile ? (
            <div style={{ padding: '20px 12px 4px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: TEXT3,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    marginBottom: '5px',
                  }}
                >
                  {new Date().toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>

                <h1
                  style={{
                    fontSize: '26px',
                    fontWeight: 900,
                    color: TEXT,
                    letterSpacing: '-0.05em',
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  Schedule
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => {}} style={btnMobileTeal}>
                  <IconSpark size={12} /> Send reminders
                </button>
                <button onClick={() => router.push('/dashboard/customers')} style={btnMobileSm}>
                  Customers
                </button>
              </div>

              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderTop: `2px solid ${TEAL}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {statChips.map((chip, i) => (
                  <div
                    key={chip.label}
                    onClick={chip.onClick}
                    style={{
                      padding: '10px 8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = TEAL_LIGHT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: TEXT3, marginTop: '3px', lineHeight: 1.2 }}>{chip.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: TEXT3,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      marginBottom: '5px',
                    }}
                  >
                    {todayStr}
                  </div>

                  <h1
                    style={{
                      fontSize: '28px',
                      fontWeight: 900,
                      color: TEXT,
                      letterSpacing: '-0.05em',
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    Schedule
                  </h1>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => router.push('/dashboard/customers')}
                    style={btnOutline}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = TEXT
                      e.currentTarget.style.color = TEXT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = BORDER
                      e.currentTarget.style.color = TEXT2
                    }}
                  >
                    <IconArrow size={13} /> View customers
                  </button>

                  <button
                    onClick={() => {}}
                    style={btnTeal}
                    onMouseEnter={e => {
                      e.currentTarget.style.opacity = '0.82'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    <IconSpark size={14} /> Send reminders
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderTop: `2px solid ${TEAL}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {statChips.map((chip, i) => (
                  <div
                    key={chip.label}
                    onClick={chip.onClick}
                    style={{
                      padding: '14px 20px',
                      cursor: 'pointer',
                      borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = TEAL_LIGHT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '4px' }}>{chip.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: isMobile ? '0 12px' : 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {overdueJobs.length > 0 && (
              <div style={{ background: WHITE, border: `1px solid #FECACA`, borderRadius: '18px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(15,23,42,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid #FECACA`, gap: '10px', background: '#FFF7F7' }}>
                  <div style={{ width: 4, height: 28, borderRadius: '999px', background: RED, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#991B1B', flex: 1 }}>
                    {overdueJobs.length} overdue service{overdueJobs.length > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setFilter('overdue')}
                    style={{
                      height: '28px',
                      padding: '0 10px',
                      background: WHITE,
                      border: `1px solid #FECACA`,
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: FONT,
                      color: '#991B1B',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    View all <IconArrow size={10} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0,1fr))' }}>
                  {overdueJobs.slice(0, 4).map((job, i, arr) => {
                    const days = Math.abs(getDays(job.next_service_date))
                    const isLast = i >= arr.length - (isMobile ? 1 : 2)

                    return (
                      <div
                        key={job.id}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        style={{
                          padding: '11px 16px',
                          borderBottom: isLast ? 'none' : `1px solid ${BORDER}`,
                          borderRight: !isMobile && i % 2 === 0 ? `1px solid ${BORDER}` : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          background: WHITE,
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#F8FAFC'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = WHITE
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.customers?.first_name} {job.customers?.last_name}
                          </div>
                          <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} · {job.customers?.suburb || '—'}
                          </div>
                        </div>

                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '999px', background: '#FEE2E2', border: '1px solid #FECACA', flexShrink: 0 }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: RED }}>{days}d overdue</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 300px',
                gap: '14px',
                alignItems: 'start',
              }}
            >
              <div style={card}>
                <div
                  style={{
                    padding: isMobile ? '16px 16px 0' : '18px 20px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    background: WHITE,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ width: 4, height: 44, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em' }}>Scheduled services</span>
                        <span
                          style={{
                            height: '22px',
                            padding: '0 8px',
                            borderRadius: '999px',
                            border: `1px solid ${BORDER}`,
                            background: '#F8FAFC',
                            color: TEXT3,
                            fontSize: '10px',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          {filtered.length} shown
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '4px' }}>
                        Track upcoming service timing, customer details, and reminder actions.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
                    {FILTER_TABS.map(tab => {
                      const active = filter === tab.key
                      const count = tab.key === 'all' ? counts.all : tab.key === 'overdue' ? counts.overdue : tab.key === 'due_soon' ? counts.due_soon : counts.good

                      return (
                        <button
                          key={tab.key}
                          onClick={() => setFilter(tab.key)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            height: '34px',
                            padding: '0 12px',
                            borderRadius: '8px 8px 0 0',
                            border: 'none',
                            borderBottom: active ? `2px solid ${TEAL}` : '2px solid transparent',
                            background: 'transparent',
                            color: active ? TEAL : TEXT3,
                            fontSize: '12px',
                            fontWeight: active ? 800 : 600,
                            fontFamily: FONT,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap' as const,
                            flexShrink: 0,
                            transition: 'all 0.12s',
                          }}
                        >
                          {tab.label}
                          {count > 0 && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '1px 5px',
                                borderRadius: '999px',
                                background: active ? TEAL : '#E8EDF3',
                                color: active ? WHITE : TEXT3,
                                lineHeight: 1.4,
                              }}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      )
                    })}
                    <div style={{ flex: 1, borderBottom: `1px solid ${BORDER}` }} />
                  </div>
                </div>

                {!isMobile && filtered.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '28px minmax(0,1.8fr) minmax(0,1.1fr) minmax(0,1fr) 180px',
                      gap: '0',
                      padding: '0 20px',
                      background: '#FCFCFD',
                      borderTop: `1px solid ${BORDER}`,
                      borderBottom: `1px solid ${BORDER}`,
                      alignItems: 'center',
                      height: '38px',
                    }}
                  >
                    <div />
                    <div style={{ ...TYPE.label, paddingRight: '12px' }}>Customer</div>
                    <div style={TYPE.label}>Unit</div>
                    <div style={TYPE.label}>Service timing</div>
                    <div style={{ ...TYPE.label, textAlign: 'right' as const }}>Actions</div>
                  </div>
                )}

                {filtered.length === 0 ? (
                  <div style={{ padding: '56px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '32px', opacity: 0.25 }}>📅</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: TEXT2 }}>No services in this category</div>
                    <div style={{ fontSize: '12px', color: TEXT3 }}>Try a different filter above.</div>
                  </div>
                ) : (
                  <div>
                    {filtered.map(job => {
                      const u = job.next_service_date ? getUrgency(job.next_service_date) : null

                      if (isMobile) {
                        return (
                          <div
                            key={job.id}
                            onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                            style={{ borderTop: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer' }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#FAFBFC'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = WHITE
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: '3px 1fr' }}>
                              <div style={{ background: u?.accentBar || BORDER }} />
                              <div style={{ padding: '14px 14px 14px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, lineHeight: 1.2, marginBottom: '3px' }}>
                                      {job.customers?.first_name} {job.customers?.last_name}
                                    </div>
                                    <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>{job.customers?.suburb || '—'}</div>
                                  </div>
                                  {u && <UrgencyPill status={u.status} />}
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                  <div style={{ flex: 1, background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '9px 11px' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 800, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Unit</div>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT }}>
                                      {job.brand || '—'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                                    </div>
                                    <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>
                                      {job.equipment_type ? String(job.equipment_type).replace('_', ' ') : '—'}
                                    </div>
                                  </div>

                                  <div style={{ flex: 1, background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '9px 11px' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 800, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Timing</div>
                                    <div style={{ fontSize: '12px', fontWeight: 800, color: u?.valColor || TEXT }}>{u?.sub || 'No date'}</div>
                                    <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>{u?.dateLabel || '—'}</div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                                  <button
                                    style={{
                                      flex: 1,
                                      height: '34px',
                                      borderRadius: '9px',
                                      border: `1px solid ${BORDER}`,
                                      background: WHITE,
                                      color: TEXT2,
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      fontFamily: FONT,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                    }}
                                  >
                                    <IconMail size={13} /> Email
                                  </button>

                                  <button
                                    style={{
                                      flex: 1,
                                      height: '34px',
                                      borderRadius: '9px',
                                      border: 'none',
                                      background: TEAL,
                                      color: WHITE,
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      fontFamily: FONT,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                    }}
                                  >
                                    <IconSms size={13} /> SMS
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div
                          key={job.id}
                          onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '28px minmax(0,1.8fr) minmax(0,1.1fr) minmax(0,1fr) 180px',
                            gap: '0',
                            borderTop: `1px solid ${BORDER}`,
                            background: WHITE,
                            cursor: 'pointer',
                            alignItems: 'center',
                            minHeight: '64px',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#F8FAFC'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = WHITE
                          }}
                        >
                          <div style={{ height: '100%', width: '3px', background: u?.accentBar || BORDER, marginLeft: '6px', borderRadius: '2px', alignSelf: 'stretch', minHeight: '64px' }} />

                          <div style={{ padding: '0 12px 0 10px', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {job.customers?.first_name} {job.customers?.last_name}
                              </div>
                              {u && <UrgencyPill status={u.status} />}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.customers?.suburb || '—'}
                              {job.customers?.email || job.customers?.phone ? <span style={{ color: '#C4CCDA' }}> · {job.customers?.email || job.customers?.phone}</span> : ''}
                            </div>
                          </div>

                          <div style={{ padding: '0 12px 0 0', minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.brand || '—'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.equipment_type ? String(job.equipment_type).replace('_', ' ') : 'No type set'}
                            </div>
                          </div>

                          <div style={{ padding: '0 12px 0 0', minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: u?.valColor || TEXT3 }}>{u?.sub || 'No date set'}</div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '3px' }}>{u?.dateLabel || '—'}</div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', paddingRight: '16px' }} onClick={e => e.stopPropagation()}>
                            <button
                              style={{
                                height: '30px',
                                padding: '0 10px',
                                borderRadius: '8px',
                                border: `1px solid ${BORDER}`,
                                background: WHITE,
                                color: TEXT2,
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: FONT,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.1s',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#F1F5F9'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = WHITE
                              }}
                            >
                              <IconMail size={12} /> Email
                            </button>

                            <button
                              style={{
                                height: '30px',
                                padding: '0 10px',
                                borderRadius: '8px',
                                border: 'none',
                                background: TEAL,
                                color: WHITE,
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: FONT,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'opacity 0.1s',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.opacity = '0.85'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.opacity = '1'
                              }}
                            >
                              <IconSms size={12} /> SMS
                            </button>
                          </div>
                        </div>
                      )
                    })}

                    <div style={{ padding: '12px 20px', borderTop: `1px solid ${BORDER}`, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>
                        Showing {filtered.length} of {jobs.length} scheduled units
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: TEXT2 }}>
                        {counts.overdue > 0 && <span style={{ color: RED }}>{counts.overdue} overdue · </span>}
                        {counts.due_soon} due within 30d
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={sideCard}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT, letterSpacing: '-0.025em' }}>Next 5 due</div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>Upcoming service reminders</div>
                      </div>
                    </div>

                    <button onClick={() => setFilter('due_soon')} style={cardArrowBtn}>
                      <IconExternalLink size={14} />
                    </button>
                  </div>

                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em' }}>{dueSoonJobs.length}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT3, marginLeft: 6 }}>inside 30 days</span>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dueSoonJobs.length === 0 ? (
                      <div style={{ padding: '12px', borderRadius: '12px', background: '#F8FAFC', border: `1px solid ${BORDER}`, fontSize: '12px', fontWeight: 600, color: TEXT3, textAlign: 'center' }}>
                        No due soon services
                      </div>
                    ) : (
                      dueSoonJobs.slice(0, 5).map(job => {
                        const u = getUrgency(job.next_service_date)

                        return (
                          <div
                            key={job.id}
                            onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                            style={{ padding: '10px 12px', borderRadius: '12px', background: '#F8FAFC', border: `1px solid ${BORDER}`, cursor: 'pointer' }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#F1F5F9'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#F8FAFC'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '4px' }}>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {job.customers?.first_name} {job.customers?.last_name}
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: u.valColor, flexShrink: 0 }}>{u.sub.replace(' until due', '')}</div>
                            </div>

                            <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} · {u.dateLabel}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div style={sideCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT, letterSpacing: '-0.025em' }}>Reminder status</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>Service workload snapshot</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    {[
                      { label: 'Overdue', value: counts.overdue, bg: '#FEE2E2', border: '#FECACA', color: '#991B1B' },
                      { label: 'Due soon', value: counts.due_soon, bg: '#FEF3C7', border: '#FDE68A', color: AMBER },
                      { label: 'On track', value: counts.good, bg: TEAL_LIGHT, border: '#BFE7E3', color: TEAL_DARK },
                    ].map(item => (
                      <div
                        key={item.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          background: item.bg,
                          border: `1px solid ${item.border}`,
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 700, color: item.color }}>{item.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 900, color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}