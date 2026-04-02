'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEXT = '#111111'
const TEXT2 = '#444444'
const TEXT3 = '#999999'
const BORDER = '#EBEBEB'
const BG = '#F7F6F3'

const avColors = [
  { bg: '#E8F4F1', color: '#1A6B5C' },
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
    return { dot: '#1A6B5C', val: '#1A6B5C', label: 'until due', text: `${days}d` }
  }

  function statusPill(d: string | null) {
    if (!d) return { label: 'No date', bg: '#F0F0F0', color: '#777' }
    const days = getDays(d)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#D1FAE5', color: '#064E3B' }
  }

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pad = isMobile ? '20px' : '36px'

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        <div style={{ padding: `32px ${pad}`, paddingBottom: isMobile ? '100px' : '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Page header */}
          <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
            <div>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '600', color: TEXT, letterSpacing: '-0.5px', lineHeight: 1.1 }}>Dashboard</div>
              <div style={{ fontSize: '13px', color: TEXT3, marginTop: '6px' }}>{todayStr}</div>
            </div>
            <button onClick={() => router.push('/dashboard/jobs')}
              style={{ height: '40px', padding: '0 20px', borderRadius: '8px', border: 'none', background: '#1C1C1E', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Add job
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '12px' }}>
            {[
              { label: 'Customers', value: stats.customers, sub: 'registered' },
              { label: 'Active units', value: stats.units, sub: 'installed' },
              { label: 'Overdue', value: stats.overdue, sub: stats.overdue > 0 ? 'need attention' : 'all good', danger: stats.overdue > 0 },
              { label: 'Jobs this month', value: stats.jobsThisMonth, sub: 'new installs' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: '12px', padding: isMobile ? '16px' : '20px 22px' }}>
                <div style={{ fontSize: '12px', color: TEXT3, marginBottom: '10px', fontWeight: '500' }}>{s.label}</div>
                <div style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '600', color: s.danger ? '#B91C1C' : TEXT, lineHeight: 1, letterSpacing: '-1px' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: TEXT3, marginTop: '6px' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '16px' }}>

            {/* Recent customers */}
            <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Recent customers</span>
                <span style={{ fontSize: '13px', color: TEXT3, cursor: 'pointer' }} onClick={() => router.push('/dashboard/customers')}>View all →</span>
              </div>
              {recent.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
                  No jobs yet. <span style={{ color: '#1C1C1E', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => router.push('/dashboard/jobs')}>Add your first →</span>
                </div>
              ) : isMobile ? (
                <div>
                  {recent.map((job, i) => {
                    const av = avColors[i % avColors.length]
                    const s = statusPill(job.next_service_date)
                    return (
                      <div key={job.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
                            {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                            <div style={{ fontSize: '12px', color: TEXT3 }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                          </div>
                        </div>
                        <span style={{ background: s.bg, color: s.color, padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>{s.label}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Customer', 'Unit', 'Next service', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: TEXT3, borderBottom: `1px solid ${BORDER}`, textTransform: 'uppercase' as const, letterSpacing: '0.4px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((job, i) => {
                      const av = avColors[i % avColors.length]
                      const s = statusPill(job.next_service_date)
                      return (
                        <tr key={job.id} style={{ cursor: 'pointer', borderBottom: `1px solid ${BORDER}` }}
                          onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                          onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF8')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <td style={{ padding: '13px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                                {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                                <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px' }}>{job.customers?.suburb || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '13px 22px', fontSize: '13px', color: TEXT2 }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</td>
                          <td style={{ padding: '13px 22px', fontSize: '13px', color: TEXT2 }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) : '—'}</td>
                          <td style={{ padding: '13px 22px' }}>
                            <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{s.label}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Upcoming services */}
            <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Upcoming</span>
                <span style={{ fontSize: '13px', color: TEXT3, cursor: 'pointer' }} onClick={() => router.push('/dashboard/schedule')}>View all →</span>
              </div>
              {upcoming.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No upcoming services.</div>
              ) : upcoming.map(job => {
                const days = getDays(job.next_service_date)
                const u = urgency(days)
                return (
                  <div key={job.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF8')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.dot, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                      <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: u.val }}>{u.text}</div>
                      <div style={{ fontSize: '10px', color: TEXT3, marginTop: '1px' }}>{u.label}</div>
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