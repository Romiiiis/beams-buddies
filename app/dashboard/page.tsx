'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEXT = '#0F172A'
const TEXT2 = '#334155'
const TEXT3 = '#94A3B8'
const BORDER = '#E2E8F0'
const BG = '#F1F5F9'
const WHITE = '#FFFFFF'

const avColors = [
  { bg: '#F0FDF4', color: '#166534' },
  { bg: '#EFF6FF', color: '#1E3A8A' },
  { bg: '#FFF7ED', color: '#9A3412' },
  { bg: '#F5F3FF', color: '#4C1D95' },
  { bg: '#FFF1F2', color: '#881337' },
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

function StatCard({ label, value, sub, icon, trend }: { label: string; value: string | number; sub: string; icon: React.ReactNode; trend?: { value: string; up: boolean } }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT2 }}>{label}</div>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: TEXT, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: '8px' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {trend && (
          <span style={{ fontSize: '12px', fontWeight: '600', color: trend.up ? '#16A34A' : '#DC2626', display: 'flex', alignItems: 'center', gap: '2px' }}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
        <span style={{ fontSize: '12px', color: TEXT3 }}>{sub}</span>
      </div>
    </div>
  )
}

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
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) { setLoading(false); return }
      const bid = userData.business_id
      const today = new Date()

      const [customersRes, jobsRes, invoicesRes] = await Promise.all([
        supabase.from('customers').select('id').eq('business_id', bid),
        supabase.from('jobs').select('*, customers(first_name, last_name, suburb, phone)').eq('business_id', bid).order('next_service_date', { ascending: true }),
        supabase.from('invoices').select('status, total, amount_paid, created_at').eq('business_id', bid),
      ])

      const jobs = jobsRes.data || []
      const invoices = invoicesRes.data || []
      const overdue = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today)
      const jobsThisMonth = jobs.filter(j => {
        const d = new Date(j.created_at)
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
      }).length

      setStats({ customers: customersRes.data?.length || 0, units: jobs.length, overdue: overdue.length, jobsThisMonth })
      setAllJobs(jobs)
      setUpcoming(jobs.filter(j => j.next_service_date && new Date(j.next_service_date) >= today).slice(0, 6))
      setRecent([...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6))
      setInvoiceStats({
        collected: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total || 0), 0),
        outstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0),
        paidCount: invoices.filter(i => i.status === 'paid').length,
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
    if (days < 0) return { dot: '#EF4444', val: '#B91C1C', label: 'overdue', text: `${Math.abs(days)}d` }
    if (days <= 30) return { dot: '#F59E0B', val: '#92400E', label: 'until due', text: `${days}d` }
    return { dot: '#22C55E', val: '#15803D', label: 'until due', text: `${days}d` }
  }

  function statusPill(nextServiceDate: string | null) {
    if (!nextServiceDate) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }
    const days = getDays(nextServiceDate)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#991B1B' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#92400E' }
    return { label: 'Good', bg: '#DCFCE7', color: '#166534' }
  }

  const dueSoonCount = useMemo(() => allJobs.filter(j => { if (!j.next_service_date) return false; const d = getDays(j.next_service_date); return d >= 0 && d <= 30 }).length, [allJobs])
  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pad = isMobile ? '16px' : '24px'

  const card: React.CSSProperties = {
    background: WHITE, border: `1px solid ${BORDER}`,
    borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
  }

  const cardHeader = (title: string, action?: { label: string; href: string }) => (
    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>{title}</div>
      {action && (
        <button onClick={() => router.push(action.href)}
          style={{ fontSize: '13px', color: TEAL, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {action.label} →
        </button>
      )}
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar active="/dashboard" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: isMobile ? '16px' : `18px ${pad}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '11px', color: TEXT3, marginBottom: '3px', fontWeight: '500' }}>{todayStr}</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: TEXT, letterSpacing: '-0.4px' }}>Dashboard</div>
            <div style={{ fontSize: '13px', color: TEXT3, marginTop: '2px' }}>Track customers, services, invoices and jobs.</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/dashboard/quotes')}
              style={{ height: '36px', padding: '0 14px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              New quote
            </button>
            <button onClick={() => router.push('/dashboard/jobs')}
              style={{ height: '36px', padding: '0 14px', borderRadius: '8px', border: 'none', background: TEAL, color: WHITE, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
              Add job
            </button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: `${isMobile ? '16px' : '20px'} ${pad}`, paddingBottom: isMobile ? '90px' : '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* STAT CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '12px' }}>
            <StatCard
              label="Total customers"
              value={stats.customers}
              sub="registered"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>}
              trend={{ value: `${stats.jobsThisMonth} this month`, up: true }}
            />
            <StatCard
              label="Active units"
              value={stats.units}
              sub="installed"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            />
            <StatCard
              label="Overdue services"
              value={stats.overdue}
              sub={stats.overdue > 0 ? 'need attention' : 'all clear'}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
              trend={stats.overdue > 0 ? { value: `${dueSoonCount} due soon`, up: false } : undefined}
            />
            <StatCard
              label="Revenue collected"
              value={`$${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`}
              sub="paid invoices"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              trend={{ value: `$${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })} outstanding`, up: false }}
            />
          </div>

          {/* PIPELINE OVERVIEW */}
          <div style={card}>
            {cardHeader('Pipeline overview', { label: 'View schedule', href: '/dashboard/schedule' })}
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'Overdue', value: stats.overdue, color: '#EF4444', bg: '#FEF2F2' },
                { label: 'Due in 30 days', value: dueSoonCount, color: '#F59E0B', bg: '#FFFBEB' },
                { label: 'Good standing', value: allJobs.filter(j => j.next_service_date && getDays(j.next_service_date) > 30).length, color: '#22C55E', bg: '#F0FDF4' },
                { label: 'New this month', value: stats.jobsThisMonth, color: TEAL, bg: '#F0FDFA' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '16px', border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: TEXT3, marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: s.color, letterSpacing: '-0.5px', lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: TEXT3 }}>Collection rate</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: TEXT }}>
                  {invoiceStats.collected + invoiceStats.outstanding > 0
                    ? `${Math.round((invoiceStats.collected / (invoiceStats.collected + invoiceStats.outstanding)) * 100)}%`
                    : '—'}
                </span>
              </div>
              <div style={{ height: '6px', background: BORDER, borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: invoiceStats.collected + invoiceStats.outstanding > 0
                    ? `${(invoiceStats.collected / (invoiceStats.collected + invoiceStats.outstanding)) * 100}%`
                    : '0%',
                  background: TEAL,
                  borderRadius: '999px',
                  transition: 'width 0.4s ease',
                }}/>
              </div>
            </div>
          </div>

          {/* MAIN GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: '12px', alignItems: 'start' }}>

            {/* Recent customers */}
            <div style={card}>
              {cardHeader('Recent customers', { label: 'View all', href: '/dashboard/customers' })}
              {recent.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
                  No jobs yet. <span style={{ color: TEAL, cursor: 'pointer', fontWeight: '600' }} onClick={() => router.push('/dashboard/jobs')}>Add your first →</span>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: BG }}>
                      {['#', 'Customer', 'Unit', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: TEXT3, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((job, i) => {
                      const av = avColors[i % avColors.length]
                      const s = statusPill(job.next_service_date)
                      return (
                        <tr key={job.id} style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }}
                          onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                          onMouseEnter={e => e.currentTarget.style.background = BG}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: '600', color: TEXT3 }}>{i + 1}</td>
                          <td style={{ padding: '12px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                                {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                                <div style={{ fontSize: '11px', color: TEXT3 }}>{job.customers?.suburb || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 20px', fontSize: '13px', color: TEXT2 }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</td>
                          <td style={{ padding: '12px 20px' }}>
                            <span style={{ background: s.bg, color: s.color, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>{s.label}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Right col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Upcoming services */}
              <div style={card}>
                {cardHeader('Upcoming services', { label: 'View all', href: '/dashboard/schedule' })}
                {upcoming.length === 0 ? (
                  <div style={{ padding: '28px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No upcoming services.</div>
                ) : (
                  <div>
                    {upcoming.slice(0, 5).map(job => {
                      const days = getDays(job.next_service_date)
                      const u = urgency(days)
                      return (
                        <div key={job.id} style={{ padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                          onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                          onMouseEnter={e => e.currentTarget.style.background = BG}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: u.dot, flexShrink: 0 }}/>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                            <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: u.val }}>{u.text}</div>
                            <div style={{ fontSize: '10px', color: TEXT3 }}>{u.label}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div style={card}>
                {cardHeader('Quick actions')}
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { label: 'Send service reminders', href: '/dashboard/schedule' },
                    { label: 'Create a new invoice', href: '/dashboard/invoices' },
                    { label: 'View revenue', href: '/dashboard/revenue' },
                    { label: 'View QR codes', href: '/dashboard/qrcodes' },
                  ].map(a => (
                    <button key={a.label} onClick={() => router.push(a.href)}
                      style={{ height: '38px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, padding: '0 14px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      onMouseEnter={e => e.currentTarget.style.background = BG}
                      onMouseLeave={e => e.currentTarget.style.background = WHITE}>
                      <span>{a.label}</span>
                      <span style={{ color: TEAL, fontSize: '14px' }}>→</span>
                    </button>
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