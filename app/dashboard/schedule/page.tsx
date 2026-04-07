'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
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

function IconCalendar({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconUsers({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.9" />
      <path d="M20 8.5a3.5 3.5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.35" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
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

export default function SchedulePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return
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
        dot: '#EF4444',
        bar: '#EF4444',
        valColor: '#B91C1C',
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
        dot: '#F59E0B',
        bar: '#F59E0B',
        valColor: '#92400E',
        pillBg: '#FEF3C7',
        pillColor: '#78350F',
        label: 'Due soon',
        sub: `${days}d until due`,
        dateLabel: `Due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
      }
    }
    return {
      status: 'good',
      dot: TEAL,
      bar: TEAL,
      valColor: '#0D6E69',
      pillBg: '#DCFCE7',
      pillColor: '#166534',
      label: 'Good',
      sub: `${days}d until due`,
      dateLabel: `Due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
    }
  }

  const counts = {
    all: jobs.length,
    overdue: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length,
    due_soon: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) >= 0 && getDays(j.next_service_date) <= 30).length,
    good: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) > 30).length,
  }

  const filtered = jobs.filter(j => {
    if (filter === 'all') return true
    if (!j.next_service_date) return false
    return getUrgency(j.next_service_date).status === filter
  })

  const overdueJobs = jobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0)
  const dueSoonJobs = jobs.filter(j => j.next_service_date && getDays(j.next_service_date) >= 0 && getDays(j.next_service_date) <= 30)

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const shellCard: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
    overflow: 'hidden',
  }

  const sectionLabel: React.CSSProperties = {
    ...TYPE.section,
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const sectionDash = (
    <span
      style={{
        width: '12px',
        height: '2px',
        background: TEAL,
        borderRadius: '999px',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  )

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
  }

  const iconWrap = (color: string): React.CSSProperties => ({
    width: '34px',
    height: '34px',
    borderRadius: '11px',
    background: '#F8FAFC',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${BORDER}`,
    flexShrink: 0,
  })

  const filterTabs = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'overdue', label: `Overdue (${counts.overdue})` },
    { key: 'due_soon', label: `Due soon (${counts.due_soon})` },
    { key: 'good', label: `Upcoming (${counts.good})` },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: FONT, background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/schedule" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', background: BG }}>
        <div
          style={{
            background: HEADER_BG,
            padding: isMobile ? '18px 16px 16px' : '20px 24px 18px',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '14px',
            alignItems: 'stretch',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.68)', marginBottom: '5px' }}>
              {todayStr}
            </div>

            <div
              style={{
                fontSize: isMobile ? '28px' : '34px',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                fontWeight: 900,
                color: '#FFFFFF',
                marginBottom: '8px',
              }}
            >
              Service schedule
            </div>

            <div
              style={{
                fontSize: '14px',
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
                style={quickActionStyle}
              >
                View customers
              </button>

              <button
                style={{
                  ...quickActionStyle,
                  background: TEAL,
                  color: '#FFFFFF',
                  border: 'none',
                }}
              >
                Send all reminders
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: isMobile ? '14px' : '16px 24px 20px',
            background: BG,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
          }}
        >
          <div>
            <div style={sectionLabel}>{sectionDash}Overview</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(12, minmax(0,1fr))',
                gap: '10px',
              }}
            >
              {[
                {
                  label: 'All scheduled units',
                  value: counts.all,
                  sub: 'With service tracking',
                  icon: <IconCalendar size={17} />,
                  accent: TEXT,
                  span: 'span 3',
                },
                {
                  label: 'Overdue services',
                  value: counts.overdue,
                  sub: counts.overdue > 0 ? 'Need attention' : 'All up to date',
                  icon: <IconCalendar size={17} />,
                  accent: counts.overdue > 0 ? '#B91C1C' : TEXT,
                  span: 'span 3',
                },
                {
                  label: 'Due soon',
                  value: counts.due_soon,
                  sub: 'Within 30 days',
                  icon: <IconCalendar size={17} />,
                  accent: '#92400E',
                  span: 'span 3',
                },
                {
                  label: 'Upcoming later',
                  value: counts.good,
                  sub: 'More than 30 days',
                  icon: <IconCalendar size={17} />,
                  accent: '#1E3A8A',
                  span: 'span 3',
                },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    ...shellCard,
                    padding: isMobile ? '12px' : '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    gridColumn: isMobile ? 'span 1' : item.span,
                    minHeight: '124px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div style={iconWrap(item.accent)}>
                      {item.icon}
                    </div>

                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: TEXT3,
                      }}
                    >
                      Live
                    </div>
                  </div>

                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>
                      {item.label}
                    </div>
                    <div style={{ ...TYPE.valueLg, fontSize: isMobile ? '23px' : '26px', color: item.accent, marginBottom: '5px' }}>
                      {item.value}
                    </div>
                    <div style={{ ...TYPE.body, fontSize: '11px' }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {overdueJobs.length > 0 && (
            <div
              style={{
                background: '#FFF9F9',
                border: '1px solid #FECACA',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 6px 18px rgba(239,68,68,0.06), 0 1px 4px rgba(239,68,68,0.04)',
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
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#7F1D1D' }}>
                    Overdue services — action required
                  </span>
                </div>

                <span
                  style={{ fontSize: '12px', color: '#B91C1C', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}
                  onClick={() => setFilter('overdue')}
                >
                  View all
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0,1fr))' }}>
                {overdueJobs.slice(0, 4).map((job, i) => {
                  const days = Math.abs(getDays(job.next_service_date))
                  return (
                    <div
                      key={job.id}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{
                        padding: '14px 18px',
                        borderBottom: i < Math.min(overdueJobs.slice(0, 4).length - 1, 3) ? '1px solid #FECACA' : 'none',
                        borderRight: !isMobile && i % 2 === 0 ? '1px solid #FECACA' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#7F1D1D' }}>
                          {job.customers?.first_name} {job.customers?.last_name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#B91C1C', marginTop: '3px' }}>
                          {job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} • {job.customers?.suburb || '—'}
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
                  border: `1px solid ${filter === f.key ? TEAL_DARK : BORDER}`,
                  background: filter === f.key ? TEAL : WHITE,
                  color: filter === f.key ? WHITE : TEXT2,
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: FONT,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontWeight: filter === f.key ? 700 : 600,
                  boxShadow: filter === f.key ? '0 2px 8px rgba(31,158,148,0.18)' : 'none',
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
              gap: '10px',
              alignItems: 'start',
            }}
          >
            <div style={{ ...shellCard, padding: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexDirection: isMobile ? 'column' : 'row',
                  marginBottom: '10px',
                }}
              >
                <div style={sectionLabel}>{sectionDash}Scheduled services</div>

                <div
                  style={{
                    height: '34px',
                    borderRadius: '10px',
                    border: `1px solid ${BORDER}`,
                    background: '#F8FAFC',
                    color: TEXT2,
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '0 12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: FONT,
                  }}
                >
                  {filtered.length} shown
                </div>
              </div>

              {loading ? (
                <div
                  style={{
                    borderRadius: '12px',
                    padding: '26px 16px',
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Loading...
                </div>
              ) : filtered.length === 0 ? (
                <div
                  style={{
                    borderRadius: '12px',
                    padding: '26px 16px',
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  No jobs in this category.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {filtered.map(job => {
                    const u = job.next_service_date ? getUrgency(job.next_service_date) : null
                    return (
                      <div
                        key={job.id}
                        style={{
                          borderRadius: '12px',
                          border: `1px solid ${BORDER}`,
                          background: WHITE,
                          padding: '12px 14px',
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.2fr) auto auto',
                          gap: '10px',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                            <div style={{ ...TYPE.titleSm, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                                  display: 'inline-block',
                                  letterSpacing: '0.02em',
                                }}
                              >
                                {u.label}
                              </span>
                            )}
                          </div>

                          <div style={{ ...TYPE.bodySm, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} {job.equipment_type ? `• ${String(job.equipment_type).replace('_', ' ')}` : ''}
                          </div>
                          <div style={{ ...TYPE.bodySm, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.customers?.suburb || '—'}
                          </div>
                        </div>

                        {!isMobile && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ ...TYPE.title, fontWeight: 800, color: u?.valColor || TEXT3 }}>
                              {u?.sub || 'No date set'}
                            </div>
                            <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>
                              {u?.dateLabel || '—'}
                            </div>
                          </div>
                        )}

                        <div style={{ justifySelf: isMobile ? 'start' : 'end', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

                        {isMobile && (
                          <div style={{ gridColumn: '1 / -1', ...TYPE.bodySm }}>
                            {u?.sub || 'No date set'} • {u?.dateLabel || '—'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {!isMobile && (
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ ...shellCard, padding: '14px' }}>
                  <div style={sectionLabel}>{sectionDash}Next 5 due</div>

                  {dueSoonJobs.length === 0 ? (
                    <div
                      style={{
                        borderRadius: '12px',
                        padding: '20px 14px',
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: TEXT3,
                      }}
                    >
                      No due soon services.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {dueSoonJobs.slice(0, 5).map(job => {
                        const u = getUrgency(job.next_service_date)
                        return (
                          <div
                            key={job.id}
                            style={{
                              borderRadius: '12px',
                              padding: '12px 14px',
                              background: WHITE,
                              border: `1px solid ${BORDER}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px',
                              cursor: 'pointer',
                            }}
                            onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                          >
                            <div>
                              <div style={TYPE.titleSm}>
                                {job.customers?.first_name} {job.customers?.last_name}
                              </div>
                              <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>
                                {job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ ...TYPE.titleSm, color: u.valColor }}>
                                {u.sub.replace(' until due', '')}
                              </div>
                              <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>
                                {u.dateLabel}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div style={{ ...shellCard, padding: '14px' }}>
                  <div style={sectionLabel}>{sectionDash}Quick actions</div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    {[
                      { label: 'View all customers', href: '/dashboard/customers' },
                      { label: 'Create a new invoice', href: '/dashboard/invoices' },
                      { label: 'View revenue', href: '/dashboard/revenue' },
                    ].map(a => (
                      <div
                        key={a.label}
                        onClick={() => router.push(a.href)}
                        style={{
                          borderRadius: '12px',
                          padding: '12px 14px',
                          background: WHITE,
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
                          <IconArrow size={14} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...shellCard, padding: '14px' }}>
                  <div style={sectionLabel}>{sectionDash}Snapshot</div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {[
                      { label: 'Overdue now', value: counts.overdue, color: counts.overdue > 0 ? '#B91C1C' : TEXT },
                      { label: 'Due soon', value: counts.due_soon, color: '#92400E' },
                      { label: 'Later upcoming', value: counts.good, color: '#1E3A8A' },
                    ].map(item => (
                      <div
                        key={item.label}
                        style={{
                          borderRadius: '12px',
                          padding: '12px 14px',
                          background: WHITE,
                          border: `1px solid ${BORDER}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <span style={TYPE.titleSm}>{item.label}</span>
                        <span style={{ ...TYPE.valueMd, color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}