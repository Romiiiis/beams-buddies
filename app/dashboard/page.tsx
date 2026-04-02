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

export default function DashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState({ collected: 0, outstanding: 0 })
  const [overdueJobs, setOverdueJobs] = useState<any[]>([])

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
        supabase.from('invoices').select('status, total, amount_paid').eq('business_id', bid),
      ])

      const jobs = jobsRes.data || []
      const overdue = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today)
      const jobsThisMonth = jobs.filter(j => {
        const d = new Date(j.created_at)
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
      }).length

      setStats({ customers: customersRes.data?.length || 0, units: jobs.length, overdue: overdue.length, jobsThisMonth })
      setUpcoming(jobs.filter(j => j.next_service_date && new Date(j.next_service_date) >= today).slice(0, 5))
      setOverdueJobs(overdue.slice(0, 4))
      setRecent([...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5))

      const invoices = invoicesRes.data || []
      setInvoiceStats({
        collected: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
        outstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (i.total - i.amount_paid), 0),
      })

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
    return { dot: TEAL, val: '#0D6E69', label: 'until due', text: `${days}d` }
  }

  function statusPill(nextServiceDate: string | null) {
    if (!nextServiceDate) return { label: 'No date', bg: '#F0F0F0', color: '#555' }
    const days = getDays(nextServiceDate)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#D1FAE5', color: '#064E3B' }
  }

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pad = isMobile ? '16px' : '32px'

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* Flush top header */}
        <div style={{
          background: '#fff',
          borderBottom: `1px solid ${BORDER}`,
          padding: isMobile ? '20px 16px 16px' : `28px ${pad} 20px`,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: TEXT3, marginBottom: '6px', fontWeight: '500' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '26px' : '30px', fontWeight: '700', color: TEXT, letterSpacing: '-0.6px', lineHeight: 1 }}>Dashboard</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/dashboard/quotes')}
              style={{ height: '38px', padding: '0 16px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT2, fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              New quote
            </button>
            <button onClick={() => router.push('/dashboard/jobs')}
              style={{ height: '38px', padding: '0 16px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Add job
            </button>
          </div>
        </div>

        {/* Page body */}
        <div style={{ padding: `${isMobile ? '16px' : '24px'} ${pad}`, paddingBottom: isMobile ? '90px' : '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '10px' }}>
            {[
              { label: 'Total customers', value: stats.customers, sub: 'registered', accent: TEAL, valColor: TEXT },
              { label: 'Active units', value: stats.units, sub: 'installed', accent: TEAL, valColor: TEXT },
              { label: 'Overdue services', value: stats.overdue, sub: stats.overdue > 0 ? 'need attention' : 'all up to date', accent: stats.overdue > 0 ? '#EF4444' : TEAL, valColor: stats.overdue > 0 ? '#B91C1C' : TEXT },
              { label: 'Jobs this month', value: stats.jobsThisMonth, sub: 'new installs', accent: TEAL, valColor: TEXT },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '3px', background: s.accent }} />
                <div style={{ padding: isMobile ? '14px' : '16px 20px 18px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: TEXT3, marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '700', color: s.valColor, lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.5px' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: TEXT3 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Finance snapshot */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '10px' }}>
            <div onClick={() => router.push('/dashboard/revenue')} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px 20px', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#C8C8C8'}
              onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
              <div style={{ fontSize: '11px', color: TEXT3, fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Revenue collected</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#064E3B', letterSpacing: '-0.5px' }}>${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</div>
              <div style={{ fontSize: '11px', color: TEXT3, marginTop: '4px' }}>from paid invoices →</div>
            </div>
            <div onClick={() => router.push('/dashboard/invoices')} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px 20px', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#C8C8C8'}
              onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
              <div style={{ fontSize: '11px', color: TEXT3, fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Outstanding</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: invoiceStats.outstanding > 0 ? '#92400E' : TEXT, letterSpacing: '-0.5px' }}>${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</div>
              <div style={{ fontSize: '11px', color: TEXT3, marginTop: '4px' }}>awaiting payment →</div>
            </div>
            <div onClick={() => router.push('/dashboard/schedule')} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px 20px', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#C8C8C8'}
              onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
              <div style={{ fontSize: '11px', color: TEXT3, fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Due for service</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: upcoming.length > 0 ? '#1E3A8A' : TEXT, letterSpacing: '-0.5px' }}>{upcoming.length}</div>
              <div style={{ fontSize: '11px', color: TEXT3, marginTop: '4px' }}>units upcoming →</div>
            </div>
          </div>

          {/* Overdue alert — only show if there are overdue */}
          {overdueJobs.length > 0 && (
            <div style={{ background: '#FFF9F9', border: '1px solid #FECACA', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#7F1D1D' }}>Overdue services — action required</span>
                </div>
                <span style={{ fontSize: '13px', color: '#EF4444', cursor: 'pointer', fontWeight: '500' }} onClick={() => router.push('/dashboard/schedule')}>View all →</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}>
                {overdueJobs.map((job, i) => {
                  const days = Math.abs(getDays(job.next_service_date))
                  return (
                    <div key={job.id} onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      style={{ padding: '14px 20px', borderBottom: i < overdueJobs.length - 1 ? '1px solid #FECACA' : 'none', borderRight: !isMobile && i % 2 === 0 ? '1px solid #FECACA' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#7F1D1D' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                        <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '2px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} · {job.customers?.suburb || '—'}</div>
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

          {/* Recent customers + Upcoming */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '14px' }}>

            {isMobile && (
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Upcoming services</span>
                  <span style={{ fontSize: '13px', color: TEAL, cursor: 'pointer', fontWeight: '500' }} onClick={() => router.push('/dashboard/schedule')}>View all →</span>
                </div>
                {upcoming.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>No upcoming services.</div>
                ) : upcoming.map(job => {
                  const days = getDays(job.next_service_date)
                  const u = urgency(days)
                  return (
                    <div key={job.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.dot, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                        <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: u.val }}>{u.text}</div>
                        <div style={{ fontSize: '11px', color: TEXT3 }}>{u.label}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Recent customers table */}
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Recent customers</span>
                <span style={{ fontSize: '13px', color: TEXT3, cursor: 'pointer' }} onClick={() => router.push('/dashboard/customers')}>View all →</span>
              </div>
              {recent.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
                  No jobs yet. <span style={{ color: TEAL, cursor: 'pointer' }} onClick={() => router.push('/dashboard/jobs')}>Add your first job →</span>
                </div>
              ) : isMobile ? (
                <div>
                  {recent.map((job, i) => {
                    const av = avColors[i % avColors.length]
                    const s = statusPill(job.next_service_date)
                    return (
                      <div key={job.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
                            {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                            <div style={{ fontSize: '12px', color: TEXT3 }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
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
                    <tr style={{ background: '#FAFAF8' }}>
                      {['Customer', 'Unit', 'Next service', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: TEXT3, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap', textTransform: 'uppercase' as const, letterSpacing: '0.4px' }}>{h}</th>
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
                                <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                                <div style={{ fontSize: '12px', color: TEXT3, marginTop: '1px' }}>{job.customers?.suburb || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '13px 22px', fontSize: '13px', color: TEXT2 }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</td>
                          <td style={{ padding: '13px 22px', fontSize: '13px', color: TEXT2 }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) : '—'}</td>
                          <td style={{ padding: '13px 22px' }}>
                            <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>{s.label}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Upcoming services sidebar */}
            {!isMobile && (
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Upcoming services</span>
                  <span style={{ fontSize: '13px', color: TEXT3, cursor: 'pointer' }} onClick={() => router.push('/dashboard/schedule')}>View all →</span>
                </div>
                {upcoming.length === 0 ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No upcoming services.</div>
                ) : upcoming.map(job => {
                  const days = getDays(job.next_service_date)
                  const u = urgency(days)
                  return (
                    <div key={job.id} style={{ padding: '13px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
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

                {/* Quick actions */}
                <div style={{ padding: '14px 20px', borderTop: `1px solid ${BORDER}`, background: '#FAFAF8' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '10px' }}>Quick actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { label: 'Send service reminders', href: '/dashboard/schedule' },
                      { label: 'Create a new invoice', href: '/dashboard/invoices' },
                      { label: 'View QR codes', href: '/dashboard/qrcodes' },
                    ].map(a => (
                      <div key={a.label} onClick={() => router.push(a.href)}
                        style={{ fontSize: '13px', color: TEXT2, cursor: 'pointer', padding: '6px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F0F0EE'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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