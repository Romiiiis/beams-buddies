'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#2AA198'
const TEAL_DARK = '#1E8C84'
const TEAL_LIGHT = '#E6F5F4'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#6B7280'
const BORDER = '#E5E7EB'
const BG = '#F4F4F2'
const WHITE = '#FFFFFF'

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

export default function SchedulePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return
      const { data } = await supabase.from('jobs').select('*, customers(first_name, last_name, email, phone, suburb)').eq('business_id', userData.business_id).order('next_service_date', { ascending: true })
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
    if (days < 0) return {
      status: 'overdue', dot: '#EF4444', bar: '#EF4444', valColor: '#B91C1C',
      pillBg: '#FEE2E2', pillColor: '#7F1D1D', label: 'Overdue',
      sub: `${Math.abs(days)}d overdue`, dateLabel: `Was due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
    }
    if (days <= 30) return {
      status: 'due_soon', dot: '#F59E0B', bar: '#F59E0B', valColor: '#92400E',
      pillBg: '#FEF3C7', pillColor: '#78350F', label: 'Due soon',
      sub: `${days}d until due`, dateLabel: `Due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
    }
    return {
      status: 'good', dot: TEAL, bar: TEAL, valColor: '#0D6E69',
      pillBg: '#D1FAE5', pillColor: '#064E3B', label: 'Good',
      sub: `${days}d until due`, dateLabel: `Due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
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

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pad = isMobile ? '16px' : '32px'

  const card: React.CSSProperties = {
    background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden',
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px', fontWeight: '700', color: TEAL,
    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px',
  }

  const filterTabs = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'overdue', label: `Overdue (${counts.overdue})` },
    { key: 'due_soon', label: `Due soon (${counts.due_soon})` },
    { key: 'good', label: `Upcoming (${counts.good})` },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/schedule" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{
          background: '#33B5AC',
          padding: isMobile ? '24px 16px 22px' : `32px ${pad} 28px`,
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'space-between', gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '6px', fontWeight: '500' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', color: WHITE, letterSpacing: '-0.8px', lineHeight: 1 }}>Service schedule</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/dashboard/customers')}
              style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.12)', color: WHITE, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
              View customers
            </button>
            <button style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: 'none', background: WHITE, color: TEAL_DARK, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              Send all reminders
            </button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: `28px ${pad}`, paddingBottom: isMobile ? '90px' : '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* STATS */}
          <div>
            <div style={sectionLabel}>Overview</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '12px' }}>
              {[
                { label: 'All scheduled units', value: counts.all, sub: 'with service tracking', accent: TEAL, valColor: TEXT },
                { label: 'Overdue services', value: counts.overdue, sub: counts.overdue > 0 ? 'need attention' : 'all up to date', accent: counts.overdue > 0 ? '#EF4444' : TEAL, valColor: counts.overdue > 0 ? '#B91C1C' : TEXT },
                { label: 'Due soon', value: counts.due_soon, sub: 'within 30 days', accent: '#F59E0B', valColor: '#92400E' },
                { label: 'Upcoming later', value: counts.good, sub: 'more than 30 days', accent: '#3B82F6', valColor: '#1E3A8A' },
              ].map(s => (
                <div key={s.label} style={card}>
                  <div style={{ height: '3px', background: s.accent }} />
                  <div style={{ padding: isMobile ? '14px' : '18px 20px 20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>{s.label}</div>
                    <div style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', color: s.valColor, lineHeight: 1, marginBottom: '6px', letterSpacing: '-0.8px' }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: TEXT3, fontWeight: '500' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OVERDUE ALERT */}
          {overdueJobs.length > 0 && (
            <div style={{ background: '#FFF9F9', border: '1px solid #FECACA', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(239,68,68,0.08)' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#7F1D1D' }}>Overdue services — action required</span>
                </div>
                <span style={{ fontSize: '13px', color: '#EF4444', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }} onClick={() => setFilter('overdue')}>View all →</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}>
                {overdueJobs.slice(0, 4).map((job, i) => {
                  const days = Math.abs(getDays(job.next_service_date))
                  return (
                    <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{ padding: '14px 20px', borderBottom: i < Math.min(overdueJobs.slice(0, 4).length - 1, 3) ? '1px solid #FECACA' : 'none', borderRight: !isMobile && i % 2 === 0 ? '1px solid #FECACA' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#7F1D1D' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                        <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '2px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} · {job.customers?.suburb || '—'}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#B91C1C' }}>{days}d</div>
                        <div style={{ fontSize: '11px', color: '#B91C1C', fontWeight: '500' }}>overdue</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* FILTER TABS */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {filterTabs.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{
                  height: '34px', padding: '0 14px', borderRadius: '20px',
                  border: `1px solid ${filter === f.key ? TEAL_DARK : BORDER}`,
                  background: filter === f.key ? TEAL : WHITE,
                  color: filter === f.key ? WHITE : TEXT2,
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  fontWeight: filter === f.key ? '700' : '500',
                  boxShadow: filter === f.key ? '0 2px 8px rgba(42,161,152,0.25)' : 'none',
                }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* MAIN GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: '14px' }}>

            {/* Scheduled list */}
            <div style={card}>
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Schedule</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>Scheduled services</div>
                </div>
                <span style={{ fontSize: '13px', color: TEXT3, fontWeight: '600' }}>{filtered.length} shown</span>
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
                      <div key={job.id}
                        style={{ padding: isMobile ? '14px 16px' : '16px 22px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '12px', cursor: 'pointer' }}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u?.dot || BORDER, flexShrink: 0, marginTop: isMobile ? '6px' : '0' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                              <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} {job.equipment_type ? `· ${String(job.equipment_type).replace('_', ' ')}` : ''}</div>
                              <div style={{ fontSize: '12px', color: TEXT3, marginTop: '1px' }}>{job.customers?.suburb || '—'}</div>
                            </div>
                            {u && !isMobile && (
                              <span style={{ background: u.pillBg, color: u.pillColor, padding: '4px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}>{u.label}</span>
                            )}
                          </div>
                          <div style={{ marginTop: '10px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: u?.valColor || TEXT3 }}>{u?.sub || 'No date set'}</div>
                              <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px', fontWeight: '500' }}>{u?.dateLabel || '—'}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                              <button onClick={e => e.stopPropagation()}
                                style={{ height: isMobile ? '30px' : '32px', padding: '0 14px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                                Email
                              </button>
                              <button onClick={e => e.stopPropagation()}
                                style={{ height: isMobile ? '30px' : '32px', padding: '0 14px', borderRadius: '8px', border: 'none', background: TEAL, color: WHITE, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
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

            {/* Sidebar */}
            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={card}>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Upcoming</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>Next 5 due</div>
                  </div>
                  {dueSoonJobs.length === 0 ? (
                    <div style={{ padding: '32px 20px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No due soon services.</div>
                  ) : dueSoonJobs.slice(0, 5).map(job => {
                    const u = getUrgency(job.next_service_date)
                    return (
                      <div key={job.id}
                        style={{ padding: '13px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.dot, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                          <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: u.valColor }}>{u.sub.replace(' until due', '')}</div>
                          <div style={{ fontSize: '10px', color: TEXT3, marginTop: '1px', fontWeight: '500' }}>{u.dateLabel}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div style={card}>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Actions</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>Quick actions</div>
                  </div>
                  <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                      { label: 'View all customers', href: '/dashboard/customers' },
                      { label: 'Create a new invoice', href: '/dashboard/invoices' },
                      { label: 'View revenue', href: '/dashboard/revenue' },
                    ].map(a => (
                      <div key={a.label} onClick={() => router.push(a.href)}
                        style={{ fontSize: '13px', color: TEXT2, cursor: 'pointer', padding: '7px 10px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '500' }}
                        onMouseEnter={e => { e.currentTarget.style.background = TEAL_LIGHT; e.currentTarget.style.color = TEAL_DARK }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT2 }}>
                        {a.label}
                        <span style={{ fontSize: '12px' }}>→</span>
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