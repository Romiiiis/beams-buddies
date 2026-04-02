'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const A = '#1C1C1E'
const TEAL = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#EBEBEB'
const BG = '#FAFAF8'

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
      pillBg: '#D1FAE5',
      pillColor: '#064E3B',
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

  const pad = isMobile ? '16px' : '32px'

  const filterTabs = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'overdue', label: `Overdue (${counts.overdue})` },
    { key: 'due_soon', label: `Due soon (${counts.due_soon})` },
    { key: 'good', label: `Upcoming (${counts.good})` },
  ]

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: BG,
        overflow: 'hidden',
      }}
    >
      <Sidebar active="/dashboard/schedule" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        <div
          style={{
            background: '#fff',
            borderBottom: `1px solid ${BORDER}`,
            padding: isMobile ? '20px 16px 16px' : `28px ${pad} 20px`,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'flex-end',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: TEXT3, marginBottom: '6px', fontWeight: '500' }}>{todayStr}</div>
            <div
              style={{
                fontSize: isMobile ? '26px' : '30px',
                fontWeight: '700',
                color: TEXT,
                letterSpacing: '-0.6px',
                lineHeight: 1,
              }}
            >
              Service schedule
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/dashboard/customers')}
              style={{
                height: '38px',
                padding: '0 16px',
                borderRadius: '8px',
                border: `1px solid ${BORDER}`,
                background: '#fff',
                color: TEXT2,
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              View customers
            </button>
            <button
              style={{
                height: '38px',
                padding: '0 16px',
                borderRadius: '8px',
                border: 'none',
                background: A,
                color: '#fff',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Send all reminders
            </button>
          </div>
        </div>

        <div
          style={{
            padding: `${isMobile ? '16px' : '24px'} ${pad}`,
            paddingBottom: isMobile ? '90px' : '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '10px' }}>
            {[
              {
                label: 'All scheduled units',
                value: counts.all,
                sub: 'with service tracking',
                accent: TEAL,
                valColor: TEXT,
              },
              {
                label: 'Overdue services',
                value: counts.overdue,
                sub: counts.overdue > 0 ? 'need attention' : 'all up to date',
                accent: counts.overdue > 0 ? '#EF4444' : TEAL,
                valColor: counts.overdue > 0 ? '#B91C1C' : TEXT,
              },
              {
                label: 'Due soon',
                value: counts.due_soon,
                sub: 'within 30 days',
                accent: '#F59E0B',
                valColor: '#92400E',
              },
              {
                label: 'Upcoming later',
                value: counts.good,
                sub: 'more than 30 days',
                accent: '#1E3A8A',
                valColor: '#1E3A8A',
              },
            ].map(card => (
              <div key={card.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '3px', background: card.accent }} />
                <div style={{ padding: isMobile ? '14px' : '16px 20px 18px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: TEXT3, marginBottom: '8px' }}>{card.label}</div>
                  <div
                    style={{
                      fontSize: isMobile ? '28px' : '32px',
                      fontWeight: '700',
                      color: card.valColor,
                      lineHeight: 1,
                      marginBottom: '4px',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {card.value}
                  </div>
                  <div style={{ fontSize: '11px', color: TEXT3 }}>{card.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {overdueJobs.length > 0 && (
            <div style={{ background: '#FFF9F9', border: '1px solid #FECACA', borderRadius: '12px', overflow: 'hidden' }}>
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid #FECACA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#7F1D1D' }}>
                    Overdue services — action required
                  </span>
                </div>
                <span
                  style={{ fontSize: '13px', color: '#EF4444', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap' }}
                  onClick={() => setFilter('overdue')}
                >
                  View overdue →
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}>
                {overdueJobs.slice(0, 4).map((job, i) => {
                  const days = Math.abs(getDays(job.next_service_date))
                  return (
                    <div
                      key={job.id}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{
                        padding: '14px 20px',
                        borderBottom: i < Math.min(overdueJobs.slice(0, 4).length - 1, 3) ? '1px solid #FECACA' : 'none',
                        borderRight: !isMobile && i % 2 === 0 ? '1px solid #FECACA' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#7F1D1D' }}>
                          {job.customers?.first_name} {job.customers?.last_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '2px' }}>
                          {job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} · {job.customers?.suburb || '—'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#B91C1C' }}>{days}d</div>
                        <div style={{ fontSize: '11px', color: '#B91C1C' }}>overdue</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {filterTabs.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: '20px',
                  border: `1px solid ${filter === f.key ? A : BORDER}`,
                  background: filter === f.key ? A : '#fff',
                  color: filter === f.key ? '#fff' : TEXT2,
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontWeight: filter === f.key ? '600' : '500',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: '14px' }}>
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div
                style={{
                  padding: '16px 22px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Scheduled services</span>
                <span style={{ fontSize: '13px', color: TEXT3 }}>{filtered.length} shown</span>
              </div>

              {loading ? (
                <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>No jobs in this category.</div>
              ) : (
                <div>
                  {filtered.map(job => {
                    const u = job.next_service_date ? getUrgency(job.next_service_date) : null
                    return (
                      <div
                        key={job.id}
                        style={{
                          padding: isMobile ? '14px 16px' : '14px 20px',
                          borderBottom: `1px solid ${BORDER}`,
                          display: 'flex',
                          alignItems: isMobile ? 'flex-start' : 'center',
                          gap: '12px',
                          cursor: 'pointer',
                        }}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF8')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u?.dot || BORDER, flexShrink: 0, marginTop: isMobile ? '6px' : '0' }} />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {job.customers?.first_name} {job.customers?.last_name}
                              </div>
                              <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>
                                {job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} {job.equipment_type ? `· ${String(job.equipment_type).replace('_', ' ')}` : ''}
                              </div>
                              <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>
                                {job.customers?.suburb || '—'}
                              </div>
                            </div>

                            {u && !isMobile && (
                              <span
                                style={{
                                  background: u.pillBg,
                                  color: u.pillColor,
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: '600',
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
                              marginTop: '10px',
                              display: 'flex',
                              alignItems: isMobile ? 'flex-start' : 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              flexDirection: isMobile ? 'column' : 'row',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: u?.valColor || TEXT3 }}>{u?.sub || 'No date set'}</div>
                              <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px' }}>{u?.dateLabel || '—'}</div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                              <button
                                onClick={e => e.stopPropagation()}
                                style={{
                                  height: isMobile ? '30px' : '34px',
                                  padding: isMobile ? '0 12px' : '0 14px',
                                  borderRadius: '8px',
                                  border: `1px solid ${BORDER}`,
                                  background: '#fff',
                                  color: TEXT2,
                                  fontSize: isMobile ? '12px' : '13px',
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                }}
                              >
                                Email
                              </button>
                              <button
                                onClick={e => e.stopPropagation()}
                                style={{
                                  height: isMobile ? '30px' : '34px',
                                  padding: isMobile ? '0 12px' : '0 14px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: A,
                                  color: '#fff',
                                  fontSize: isMobile ? '12px' : '13px',
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                }}
                              >
                                SMS
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Next 5 upcoming</span>
                  </div>

                  {dueSoonJobs.length === 0 ? (
                    <div style={{ padding: '32px 20px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No due soon services.</div>
                  ) : (
                    dueSoonJobs.slice(0, 5).map(job => {
                      const u = getUrgency(job.next_service_date)
                      return (
                        <div
                          key={job.id}
                          style={{
                            padding: '13px 20px',
                            borderBottom: `1px solid ${BORDER}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                          }}
                          onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                          onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF8')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.dot, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {job.customers?.first_name} {job.customers?.last_name}
                            </div>
                            <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px' }}>
                              {job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: u.valColor }}>{u.sub.replace(' until due', '')}</div>
                            <div style={{ fontSize: '10px', color: TEXT3, marginTop: '1px' }}>{u.dateLabel}</div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Quick actions</span>
                  </div>

                  <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { label: 'View all customers', href: '/dashboard/customers' },
                      { label: 'Create a new invoice', href: '/dashboard/invoices' },
                      { label: 'View revenue', href: '/dashboard/revenue' },
                    ].map(a => (
                      <div
                        key={a.label}
                        onClick={() => router.push(a.href)}
                        style={{
                          fontSize: '13px',
                          color: TEXT2,
                          cursor: 'pointer',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F0F0EE')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {a.label}
                        <span style={{ color: TEXT3 }}>→</span>
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