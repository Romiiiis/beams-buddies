'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const A = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#DEDEDE'
const BG = '#F2F3F3'

const avColors = [
  { bg: '#CCEFED', color: '#0A4F4C' },
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

export default function DashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) { setLoading(false); return }
      const bid = userData.business_id
      const today = new Date()
      const [customersRes, jobsRes] = await Promise.all([
        supabase.from('customers').select('id').eq('business_id', bid),
        supabase.from('jobs').select('*, customers(first_name, last_name, suburb)').eq('business_id', bid).order('next_service_date', { ascending: true }),
      ])
      const jobs = jobsRes.data || []
      const overdue = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today).length
      const jobsThisMonth = jobs.filter(j => {
        const d = new Date(j.created_at)
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
      }).length
      setStats({ customers: customersRes.data?.length || 0, units: jobs.length, overdue, jobsThisMonth })
      setUpcoming(jobs.filter(j => j.next_service_date).slice(0, 5))
      setRecent([...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5))
      setLoading(false)
    }
    load()
  }, [router])

  function getDays(d: string) {
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function urgency(days: number) {
    if (days < 0) return { dot: '#EF4444', val: '#B91C1C', label: 'overdue', text: `${Math.abs(days)}d` }
    if (days <= 30) return { dot: '#F59E0B', val: '#92400E', label: 'until due', text: `${days}d` }
    return { dot: A, val: '#0D6E69', label: 'until due', text: `${days}d` }
  }

  function statusPill(nextServiceDate: string | null) {
    if (!nextServiceDate) return { label: 'No date', bg: '#EBEBEB', color: '#3A3A3A' }
    const days = getDays(nextServiceDate)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#D1FAE5', color: '#064E3B' }
  }

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pad = isMobile ? '16px' : '30px'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>

        <div style={{ flex: 1, padding: `${isMobile ? '16px' : '24px'} ${pad}`, paddingBottom: isMobile ? '90px' : '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* New header */}
          <div style={{
            background: '#fff',
            border: `1px solid ${BORDER}`,
            borderRadius: '16px',
            padding: isMobile ? '18px 16px' : '22px 22px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: '14px',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: '999px',
                background: '#F0F9F8',
                color: '#0A4F4C',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '12px',
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: A, display: 'inline-block' }} />
                Overview
              </div>

              <div style={{
                fontSize: isMobile ? '28px' : '32px',
                lineHeight: 1,
                fontWeight: '700',
                color: TEXT,
                letterSpacing: '-0.8px',
                marginBottom: '8px',
              }}>
                Dashboard
              </div>

              <div style={{
                fontSize: isMobile ? '13px' : '14px',
                color: TEXT3,
                lineHeight: 1.5,
              }}>
                Track customers, units, overdue services, and recent activity from one place.
              </div>

              <div style={{
                fontSize: '12px',
                color: TEXT3,
                marginTop: '10px',
              }}>
                {todayStr}
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/jobs')}
              style={{
                height: isMobile ? '42px' : '44px',
                padding: '0 18px',
                borderRadius: '10px',
                border: 'none',
                background: A,
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'inherit',
                boxShadow: '0 8px 20px rgba(42,161,152,0.18)',
                flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Add job
            </button>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
            {[
              { label: 'Total customers', value: stats.customers, sub: 'registered', topBar: A, valColor: TEXT },
              { label: 'Active units', value: stats.units, sub: 'installed', topBar: A, valColor: TEXT },
              { label: 'Overdue services', value: stats.overdue, sub: stats.overdue > 0 ? 'need attention' : 'all up to date', topBar: stats.overdue > 0 ? '#EF4444' : A, valColor: stats.overdue > 0 ? '#B91C1C' : TEXT },
              { label: 'Jobs this month', value: stats.jobsThisMonth, sub: 'new installs', topBar: A, valColor: TEXT },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '3px', background: s.topBar }} />
                <div style={{ padding: isMobile ? '12px 14px 14px' : '16px 20px 18px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: TEXT2, marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: '600', color: s.valColor, lineHeight: 1, marginBottom: '4px' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: TEXT3 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: '14px' }}>

            {isMobile && (
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Upcoming services</span>
                  <span style={{ fontSize: '13px', color: A, cursor: 'pointer', fontWeight: '500' }} onClick={() => router.push('/dashboard/schedule')}>View all →</span>
                </div>
                <div>
                  {upcoming.length === 0 ? (
                    <div style={{ padding: '28px 16px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>No upcoming services.</div>
                  ) : upcoming.map(job => {
                    const days = getDays(job.next_service_date)
                    const u = urgency(days)
                    return (
                      <div
                        key={job.id}
                        style={{ padding: '12px 16px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      >
                        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: u.dot, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                          <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: u.val }}>{u.text}</div>
                          <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px' }}>{u.label}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: isMobile ? '14px 16px' : '16px 22px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Recent customers</span>
                <span style={{ fontSize: '13px', color: A, cursor: 'pointer', fontWeight: '500' }} onClick={() => router.push('/dashboard/customers')}>View all →</span>
              </div>
              {recent.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
                  No jobs yet. <span style={{ color: A, cursor: 'pointer' }} onClick={() => router.push('/dashboard/jobs')}>Add your first job →</span>
                </div>
              ) : isMobile ? (
                <div>
                  {recent.map((job, i) => {
                    const av = avColors[i % avColors.length]
                    const s = statusPill(job.next_service_date)
                    return (
                      <div
                        key={job.id}
                        style={{ padding: '12px 16px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '12px',
                              background: `linear-gradient(180deg, ${av.bg} 0%, #FFFFFF 100%)`,
                              color: av.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '700',
                              flexShrink: 0,
                              border: '1px solid rgba(0,0,0,0.05)',
                            }}
                          >
                            {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {job.customers?.first_name} {job.customers?.last_name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', minWidth: 0 }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  maxWidth: '100%',
                                  padding: '4px 8px',
                                  borderRadius: '999px',
                                  background: '#F7F7F7',
                                  border: '1px solid #ECECEC',
                                  color: TEXT3,
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: A, flexShrink: 0 }} />
                                {job.customers?.suburb || 'No suburb'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span style={{ background: s.bg, color: s.color, padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '8px', flexShrink: 0 }}>{s.label}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8F8F8' }}>
                      {['Customer', 'Unit', 'Next service', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: TEXT3, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((job, i) => {
                      const av = avColors[i % avColors.length]
                      const s = statusPill(job.next_service_date)
                      return (
                        <tr
                          key={job.id}
                          style={{ cursor: 'pointer', borderBottom: '1px solid #F0F0F0' }}
                          onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                          onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '13px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '14px',
                                  background: `linear-gradient(180deg, ${av.bg} 0%, #FFFFFF 100%)`,
                                  color: av.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '13px',
                                  fontWeight: '700',
                                  flexShrink: 0,
                                  border: '1px solid rgba(0,0,0,0.05)',
                                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                                }}
                              >
                                {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, lineHeight: 1.2 }}>
                                  {job.customers?.first_name} {job.customers?.last_name}
                                </div>
                                <div style={{ marginTop: '6px' }}>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '4px 9px',
                                      borderRadius: '999px',
                                      background: '#F7F7F7',
                                      border: '1px solid #ECECEC',
                                      color: TEXT3,
                                      fontSize: '11px',
                                      fontWeight: '500',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: A, display: 'inline-block' }} />
                                    {job.customers?.suburb || 'No suburb'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '13px 22px', fontSize: '14px', color: TEXT2 }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</td>
                          <td style={{ padding: '13px 22px', fontSize: '14px', color: TEXT2 }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) : '—'}</td>
                          <td style={{ padding: '13px 22px' }}>
                            <span style={{ background: s.bg, color: s.color, padding: '4px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>{s.label}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {!isMobile && (
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Upcoming services</span>
                  <span style={{ fontSize: '13px', color: A, cursor: 'pointer', fontWeight: '500' }} onClick={() => router.push('/dashboard/schedule')}>View all →</span>
                </div>
                <div>
                  {upcoming.length === 0 ? (
                    <div style={{ padding: '36px 20px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>No upcoming services.</div>
                  ) : upcoming.map(job => {
                    const days = getDays(job.next_service_date)
                    const u = urgency(days)
                    return (
                      <div
                        key={job.id}
                        style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: u.dot, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                          <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: u.val }}>{u.text}</div>
                          <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px' }}>{u.label}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}