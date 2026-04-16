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

function DashboardImageIcon({
  src,
  alt,
  size = 28,
}: {
  src: string
  alt: string
  size?: number
}) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
  )
}

function IconScheduled({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_2c9a02e644c84ae6b66da7b917ac9390~mv2.png"
      alt="Scheduled units"
      size={size}
    />
  )
}

function IconOverdueServices({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_a21c16c29e1c4cd08ce49e66af3922df~mv2.png"
      alt="Overdue services"
      size={size}
    />
  )
}

function IconDueSoon({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_f55b6ff5cc4141fcbaf6ce460c56c4c3~mv2.png"
      alt="Due soon"
      size={size}
    />
  )
}

function IconUpcomingLater({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_7c5b4b86c5af4656861b5cc302bcab0e~mv2.png"
      alt="Upcoming later"
      size={size}
    />
  )
}

function IconMail({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSms({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconArrow({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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

      const { data: userData } = await supabase
        .from('users')
        .select('business_id')
        .eq('id', session.user.id)
        .single()

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
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function getUrgency(d: string) {
    const days = getDays(d)

    if (days < 0) {
      return {
        status: 'overdue',
        valColor: RED,
        pillBg: '#FEE2E2',
        pillColor: '#7F1D1D',
        label: 'Overdue',
        sub: `${Math.abs(days)}d overdue`,
        dateLabel: `Was due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
      }
    }

    if (days <= 30) {
      return {
        status: 'due_soon',
        valColor: AMBER,
        pillBg: '#FEF3C7',
        pillColor: '#78350F',
        label: 'Due soon',
        sub: `${days}d until due`,
        dateLabel: `Due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
      }
    }

    return {
      status: 'good',
      valColor: TEAL_DARK,
      pillBg: '#DCFCE7',
      pillColor: '#166534',
      label: 'Good',
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

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      if (filter === 'all') return true
      if (!j.next_service_date) return false
      return getUrgency(j.next_service_date).status === filter
    })
  }, [jobs, filter])

  const overdueJobs = useMemo(
    () => jobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0),
    [jobs]
  )

  const dueSoonJobs = useMemo(
    () => jobs.filter(j => j.next_service_date && getDays(j.next_service_date) >= 0 && getDays(j.next_service_date) <= 30),
    [jobs]
  )

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    overflow: 'hidden',
  }

  const statCard: React.CSSProperties = {
    ...card,
    padding: isMobile ? '14px 14px 13px' : '14px 16px 13px',
    minHeight: isMobile ? 112 : 118,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '16px',
    borderRadius: '16px',
  }

  const sectionHeaderTitle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 800,
    color: TEXT,
    marginBottom: '4px',
    letterSpacing: '-0.02em',
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

  const topCards = [
    {
      label: 'Scheduled units',
      value: counts.all.toLocaleString('en-AU'),
      sub: 'With service tracking',
      icon: <IconScheduled size={28} />,
      accent: TEXT,
      tag: 'Service total',
    },
    {
      label: 'Overdue services',
      value: counts.overdue.toLocaleString('en-AU'),
      sub: counts.overdue > 0 ? 'Needs attention now' : 'All clear',
      icon: <IconOverdueServices size={28} />,
      accent: counts.overdue > 0 ? RED : TEXT,
      tag: 'Action needed',
    },
    {
      label: 'Due soon',
      value: counts.due_soon.toLocaleString('en-AU'),
      sub: 'Within 30 days',
      icon: <IconDueSoon size={28} />,
      accent: AMBER,
      tag: 'Next window',
    },
    {
      label: 'Upcoming later',
      value: counts.good.toLocaleString('en-AU'),
      sub: 'More than 30 days',
      icon: <IconUpcomingLater size={28} />,
      accent: BLUE,
      tag: 'On track',
    },
  ]

  const filterTabs = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'overdue', label: `Overdue (${counts.overdue})` },
    { key: 'due_soon', label: `Due soon (${counts.due_soon})` },
    { key: 'good', label: `Upcoming (${counts.good})` },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/schedule" />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: TEXT3,
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Loading schedule...
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        fontFamily: FONT,
        background: BG,
        minHeight: '100vh',
      }}
    >
      <Sidebar active="/dashboard/schedule" />

      <div style={{ flex: 1, minWidth: 0, background: BG }}>
        <div
          style={{
            padding: isMobile ? '14px' : '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
          }}
        >
          <div
            style={{
              ...card,
              padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
              background: HEADER_BG,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>
              {todayStr}
            </div>

            <div
              style={{
                fontSize: isMobile ? '26px' : '34px',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                fontWeight: 900,
                color: WHITE,
                marginBottom: '8px',
              }}
            >
              Service schedule
            </div>

            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.72)',
                maxWidth: '760px',
              }}
            >
              Monitor overdue, due soon, and upcoming services with a clean scheduling view built for fast follow-up.
            </div>

            <div
              style={{
                marginTop: '14px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => router.push('/dashboard/customers')}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: 'rgba(255,255,255,0.06)',
                  color: WHITE,
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '10px',
                }}
              >
                <IconArrow size={13} />
                View customers
              </button>

              <button
                style={{
                  height: '36px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: TEAL,
                  color: WHITE,
                  border: 'none',
                  borderRadius: '10px',
                }}
              >
                <IconSpark size={14} />
                Send all reminders
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            {topCards.map(item => (
              <div key={item.label} style={statCard}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>{item.tag}</div>
                    <div style={{ ...TYPE.title, fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>{item.label}</div>
                  </div>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                </div>

                <div>
                  <div style={{ ...TYPE.valueLg, fontSize: '26px', color: item.accent }}>{item.value}</div>
                  <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {overdueJobs.length > 0 && (
            <div
              style={{
                ...card,
                background: '#FFF9F9',
                border: '1px solid #FECACA',
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #FECACA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#7F1D1D' }}>
                    Overdue services - action required
                  </span>
                </div>

                <button
                  onClick={() => setFilter('overdue')}
                  style={{
                    height: '28px',
                    padding: '0 9px',
                    background: WHITE,
                    border: '1px solid #FECACA',
                    borderRadius: '7px',
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
                  View all <IconArrow size={11} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0,1fr))' }}>
                {overdueJobs.slice(0, 4).map((job, i, arr) => {
                  const days = Math.abs(getDays(job.next_service_date))
                  const isLastRow = i >= arr.length - (isMobile ? 1 : 2)

                  return (
                    <div
                      key={job.id}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{
                        padding: '14px 18px',
                        borderBottom: isLastRow ? 'none' : '1px solid #FECACA',
                        borderRight: !isMobile && i % 2 === 0 ? '1px solid #FECACA' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        background: '#FFF9F9',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#7F1D1D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.customers?.first_name} {job.customers?.last_name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#B91C1C', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} · {job.customers?.suburb || '-'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#B91C1C' }}>{days}d</div>
                        <div style={{ fontSize: '10px', color: '#B91C1C', fontWeight: 600 }}>overdue</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {filterTabs.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: '999px',
                  border: `1px solid ${filter === f.key ? TEAL : BORDER}`,
                  background: filter === f.key ? '#E6F7F6' : WHITE,
                  color: filter === f.key ? TEAL_DARK : TEXT2,
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: FONT,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontWeight: 700,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 320px',
              gap: '14px',
              alignItems: 'start',
            }}
          >
            <div style={card}>
              <div
                style={{
                  padding: '14px 16px 12px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={sectionHeaderTitle}>Scheduled services</div>
                  <div style={{ ...TYPE.bodySm }}>
                    Filter, review, and action every service date from one streamlined list.
                  </div>
                </div>

                <div
                  style={{
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: `1px solid ${BORDER}`,
                    background: WHITE,
                    color: TEXT2,
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {filtered.length} shown
                </div>
              </div>

              {!isMobile && filtered.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1.45fr) minmax(0,1fr) minmax(0,1fr) auto',
                    gap: '12px',
                    padding: '10px 16px',
                    borderBottom: `1px solid ${BORDER}`,
                    background: '#FCFCFD',
                    alignItems: 'center',
                  }}
                >
                  <div style={TYPE.label}>Customer</div>
                  <div style={TYPE.label}>Unit details</div>
                  <div style={TYPE.label}>Service timing</div>
                  <div style={{ ...TYPE.label, textAlign: 'right' }}>Actions</div>
                </div>
              )}

              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: '32px 18px',
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '13px',
                  }}
                >
                  No jobs in this category.
                </div>
              ) : (
                <div style={{ display: 'grid' }}>
                  {filtered.map(job => {
                    const u = job.next_service_date ? getUrgency(job.next_service_date) : null

                    return (
                      <div
                        key={job.id}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        style={{
                          borderBottom: `1px solid ${BORDER}`,
                          cursor: 'pointer',
                          background: WHITE,
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                        onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                      >
                        {isMobile ? (
                          <div
                            style={{
                              padding: '14px 16px',
                              display: 'grid',
                              gap: '12px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: '12px',
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, lineHeight: 1.25 }}>
                                  {job.customers?.first_name} {job.customers?.last_name}
                                </div>
                                <div style={{ ...TYPE.bodySm, marginTop: '4px', color: TEXT2 }}>
                                  {job.customers?.suburb || '-'}
                                </div>
                              </div>

                              {u && (
                                <span
                                  style={{
                                    background: u.pillBg,
                                    color: u.pillColor,
                                    padding: '6px 10px',
                                    borderRadius: '999px',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                  }}
                                >
                                  {u.label}
                                </span>
                              )}
                            </div>

                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '10px',
                              }}
                            >
                              <div
                                style={{
                                  background: '#F8FAFC',
                                  border: `1px solid ${BORDER}`,
                                  borderRadius: '12px',
                                  padding: '10px 12px',
                                }}
                              >
                                <div style={{ ...TYPE.label, marginBottom: '5px' }}>Unit</div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>
                                  {job.brand || '-'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                                </div>
                                <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>
                                  {job.equipment_type ? String(job.equipment_type).replace('_', ' ') : 'No equipment type'}
                                </div>
                              </div>

                              <div
                                style={{
                                  background: '#F8FAFC',
                                  border: `1px solid ${BORDER}`,
                                  borderRadius: '12px',
                                  padding: '10px 12px',
                                }}
                              >
                                <div style={{ ...TYPE.label, marginBottom: '5px' }}>Schedule</div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: u?.valColor || TEXT }}>
                                  {u?.sub || 'No date set'}
                                </div>
                                <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>
                                  {u?.dateLabel || '-'}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                onClick={e => e.stopPropagation()}
                                style={{
                                  flex: 1,
                                  minWidth: '120px',
                                  height: '34px',
                                  padding: '0 12px',
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
                                <IconMail size={14} />
                                Email
                              </button>

                              <button
                                onClick={e => e.stopPropagation()}
                                style={{
                                  flex: 1,
                                  minWidth: '120px',
                                  height: '34px',
                                  padding: '0 12px',
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
                                <IconSms size={14} />
                                SMS
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(0,1.45fr) minmax(0,1fr) minmax(0,1fr) auto',
                              gap: '12px',
                              alignItems: 'center',
                              padding: '14px 16px',
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginBottom: '5px',
                                  flexWrap: 'wrap',
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: 800,
                                    color: TEXT,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%',
                                  }}
                                >
                                  {job.customers?.first_name} {job.customers?.last_name}
                                </div>

                                {u && (
                                  <span
                                    style={{
                                      background: u.pillBg,
                                      color: u.pillColor,
                                      padding: '5px 9px',
                                      borderRadius: '999px',
                                      fontSize: '10px',
                                      fontWeight: 800,
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {u.label}
                                  </span>
                                )}
                              </div>

                              <div style={{ ...TYPE.bodySm, color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {job.customers?.suburb || '-'}
                              </div>
                              <div style={{ ...TYPE.bodySm, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {job.customers?.email || job.customers?.phone || 'No contact details'}
                              </div>
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <div style={{ ...TYPE.label, marginBottom: '6px' }}>Unit</div>
                              <div
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  color: TEXT,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {job.brand || '-'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                              </div>
                              <div style={{ ...TYPE.bodySm, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {job.equipment_type ? String(job.equipment_type).replace('_', ' ') : 'No equipment type'}
                              </div>
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <div style={{ ...TYPE.label, marginBottom: '6px' }}>Service timing</div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: u?.valColor || TEXT3 }}>
                                {u?.sub || 'No date set'}
                              </div>
                              <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>
                                {u?.dateLabel || '-'}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', justifySelf: 'end', flexWrap: 'wrap' }}>
                              <button
                                onClick={e => e.stopPropagation()}
                                style={{
                                  height: '32px',
                                  padding: '0 12px',
                                  borderRadius: '8px',
                                  border: `1px solid ${BORDER}`,
                                  background: WHITE,
                                  color: TEXT2,
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontFamily: FONT,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <IconMail size={14} />
                                Email
                              </button>

                              <button
                                onClick={e => e.stopPropagation()}
                                style={{
                                  height: '32px',
                                  padding: '0 12px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: TEAL,
                                  color: WHITE,
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontFamily: FONT,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <IconSms size={14} />
                                SMS
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Next 5 due</div>
                  <button onClick={() => setFilter('due_soon')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em' }}>
                    {dueSoonJobs.length}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT3, marginLeft: 6 }}>inside 30 days</span>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dueSoonJobs.length === 0 ? (
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: '#F8FAFC',
                        border: `1px solid ${BORDER}`,
                        fontSize: '12px',
                        fontWeight: 600,
                        color: TEXT3,
                        textAlign: 'center',
                      }}
                    >
                      No due soon services
                    </div>
                  ) : (
                    dueSoonJobs.slice(0, 5).map(job => {
                      const u = getUrgency(job.next_service_date)

                      return (
                        <div
                          key={job.id}
                          onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: '#F8FAFC',
                            border: `1px solid ${BORDER}`,
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: TEXT,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {job.customers?.first_name} {job.customers?.last_name}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: u.valColor, flexShrink: 0 }}>
                              {u.sub.replace(' until due', '')}
                            </div>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Quick actions</div>
                  <button onClick={() => router.push('/dashboard/customers')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                  {[
                    { label: 'View all customers', href: '/dashboard/customers' },
                    { label: 'Create a new invoice', href: '/dashboard/invoices' },
                    { label: 'View revenue', href: '/dashboard/revenue' },
                  ].map(a => (
                    <div
                      key={a.label}
                      onClick={() => router.push(a.href)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: '#F8FAFC',
                        border: `1px solid ${BORDER}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={TYPE.titleSm}>{a.label}</span>
                      <span style={{ color: TEXT3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconArrow size={13} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Snapshot</div>
                  <button onClick={() => setFilter('all')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Overdue now', value: counts.overdue, color: counts.overdue > 0 ? RED : TEXT, bg: counts.overdue > 0 ? '#FEF2F2' : '#F8FAFC', borderColor: counts.overdue > 0 ? '#FECACA' : BORDER },
                    { label: 'Due soon', value: counts.due_soon, color: AMBER, bg: '#FFFBEB', borderColor: '#FDE68A' },
                    { label: 'Later upcoming', value: counts.good, color: BLUE, bg: '#EFF6FF', borderColor: '#BFDBFE' },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: item.bg,
                        border: `1px solid ${item.borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>{item.label}</span>
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
  )
}