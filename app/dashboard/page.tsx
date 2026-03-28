'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/lib/useBusiness'

const A = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#DEDEDE'
const BG = '#F2F3F3'

const navMain = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Customers', href: '/dashboard/customers' },
  { label: 'Add job', href: '/dashboard/jobs' },
]
const navManage = [
  { label: 'Service schedule', href: '/dashboard/schedule' },
  { label: 'QR codes', href: '/dashboard/qrcodes' },
  { label: 'Reports', href: '/dashboard/reports' },
  { label: 'Settings', href: '/dashboard/settings' },
]
const icons: Record<string, React.ReactElement> = {
  '/dashboard': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor"/><rect x="8.5" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/><rect x="2" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/></svg>,
  '/dashboard/customers': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2 13c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 8l1.5 1.5L15 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  '/dashboard/jobs': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3" width="11" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 3V2M11 3V2M2.5 7h11M8 9.5v3M6.5 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  '/dashboard/schedule': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 6v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  '/dashboard/qrcodes': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M9 11.5h5M11.5 9v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  '/dashboard/reports': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12.5l3.5-4 3 2.5 3-5.5 3 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  '/dashboard/settings': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
}

const avColors = [
  { bg: '#CCEFED', color: '#0A4F4C' },
  { bg: '#DBEAFE', color: '#1E3A8A' },
  { bg: '#FEF3C7', color: '#78350F' },
  { bg: '#EDE9FE', color: '#4C1D95' },
  { bg: '#FFE4E6', color: '#881337' },
]

function Sidebar({ active, router, onSignOut, logoUrl, businessName }: { active: string, router: any, onSignOut: () => void, logoUrl?: string, businessName?: string }) {
  return (
    <div style={{ width: '232px', flexShrink: 0, background: '#fff', borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <img src="https://static.wixstatic.com/media/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png/v1/fill/w_200,h_200/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png" alt="Jobyra" style={{ width: '56px', height: '56px', borderRadius: '9px', objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: TEXT, letterSpacing: '-0.3px' }}>Jobyra</div>
            <div style={{ fontSize: '12px', color: TEXT3, marginTop: '1px' }}>{businessName || 'Trade CRM'}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, letterSpacing: '0.6px', textTransform: 'uppercase' as const, padding: '10px 10px 6px' }}>Main</div>
        {navMain.map(item => {
          const isActive = item.href === active
          return (
            <div key={item.href} onClick={() => router.push(item.href)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: isActive ? '#0A4F4C' : TEXT2, fontWeight: isActive ? '600' : '400', background: isActive ? '#CCEFED' : 'transparent', marginBottom: '2px' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F0F0F0' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
              <span style={{ color: isActive ? A : TEXT3, display: 'flex', flexShrink: 0 }}>{icons[item.href]}</span>
              {item.label}
            </div>
          )
        })}
        <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, letterSpacing: '0.6px', textTransform: 'uppercase' as const, padding: '14px 10px 6px' }}>Manage</div>
        {navManage.map(item => {
          const isActive = item.href === active
          return (
            <div key={item.href} onClick={() => router.push(item.href)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: isActive ? '#0A4F4C' : TEXT2, fontWeight: isActive ? '600' : '400', background: isActive ? '#CCEFED' : 'transparent', marginBottom: '2px' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F0F0F0' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
              <span style={{ color: isActive ? A : TEXT3, display: 'flex', flexShrink: 0 }}>{icons[item.href]}</span>
              {item.label}
            </div>
          )
        })}
      </div>
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {logoUrl ? (
                <img src={logoUrl} alt={businessName || 'Logo'} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'contain', background: '#fff', padding: '2px', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#CCEFED', color: '#0A4F4C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}>RA</div>
              )}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>Ramiz Arib</div>
            <div style={{ fontSize: '11px', color: TEXT3 }}>Owner</div>
          </div>
        </div>
        <button onClick={onSignOut} style={{ fontSize: '12px', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
      </div>
    </div>
  )
}

function SkeletonLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <div style={{ width: '232px', flexShrink: 0, background: '#fff', borderRight: `1px solid ${BORDER}` }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '58px', background: '#fff', borderBottom: `1px solid ${BORDER}` }} />
        <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', height: '100px' }} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '14px' }}>
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', height: '300px' }} />
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', height: '300px' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const business = useBusiness()
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

  async function signOut() { await supabase.auth.signOut(); router.push('/login') }

  if (loading) return <SkeletonLayout />

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard" router={router} onSignOut={signOut} logoUrl={business?.logo_url || ''} businessName={business?.name || ''} userName={business?.full_name || ''} userTitle={business?.role_title || ''} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ height: '58px', background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '600', color: TEXT }}>Dashboard</div>
            <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px' }}>{todayStr}</div>
          </div>
          <button onClick={() => router.push('/dashboard/jobs')}
            style={{ height: '36px', padding: '0 18px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Add job
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }}>
            {[
              { label: 'Total customers', value: stats.customers, sub: 'registered', topBar: A, valColor: TEXT },
              { label: 'Active units', value: stats.units, sub: 'installed', topBar: A, valColor: TEXT },
              { label: 'Overdue services', value: stats.overdue, sub: stats.overdue > 0 ? 'need attention' : 'all up to date', topBar: stats.overdue > 0 ? '#EF4444' : A, valColor: stats.overdue > 0 ? '#B91C1C' : TEXT },
              { label: 'Jobs this month', value: stats.jobsThisMonth, sub: 'new installs', topBar: A, valColor: TEXT },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '3px', background: s.topBar }} />
                <div style={{ padding: '16px 20px 18px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT2, marginBottom: '10px' }}>{s.label}</div>
                  <div style={{ fontSize: '32px', fontWeight: '600', color: s.valColor, lineHeight: 1, marginBottom: '6px' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: TEXT3 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '14px' }}>
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Recent customers</span>
                <span style={{ fontSize: '13px', color: A, cursor: 'pointer', fontWeight: '500' }} onClick={() => router.push('/dashboard/customers')}>View all →</span>
              </div>
              {recent.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
                  No jobs yet. <span style={{ color: A, cursor: 'pointer' }} onClick={() => router.push('/dashboard/jobs')}>Add your first job →</span>
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
                        <tr key={job.id} style={{ cursor: 'pointer', borderBottom: '1px solid #F0F0F0' }}
                          onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                          onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <td style={{ padding: '13px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
                                {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                                <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{job.customers?.suburb || '—'}</div>
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
                    <div key={job.id} style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
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
          </div>
        </div>
      </div>
    </div>
  )
}