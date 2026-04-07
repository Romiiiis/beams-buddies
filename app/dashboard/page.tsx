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
const BG = '#F0F0EE'
const WHITE = '#FFFFFF'

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

function SectionHeading({ label, sub, action, onAction }: { label: string; sub?: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '3px' }}>{sub || '\u00A0'}</div>
        <div style={{ fontSize: '20px', fontWeight: '800', color: TEXT, letterSpacing: '-0.4px', lineHeight: 1 }}>{label}</div>
      </div>
      {action && (
        <span onClick={onAction} style={{ fontSize: '13px', color: TEXT3, cursor: 'pointer', fontWeight: '500', border: `1px solid ${BORDER}`, borderRadius: '7px', padding: '5px 12px', background: WHITE }}>
          {action}
        </span>
      )}
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
  const [invoiceStats, setInvoiceStats] = useState({ collected: 0, outstanding: 0 })

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
    if (!nextServiceDate) return { label: 'No date', bg: '#F3F4F6', color: '#6B7280' }
    const days = getDays(nextServiceDate)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#D1FAE5', color: '#064E3B' }
  }

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pad = isMobile ? '16px' : '36px'

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  }

  const divider: React.CSSProperties = {
    height: '1px',
    background: '#E2E2E0',
    margin: `${isMobile ? '24px' : '32px'} 0`,
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{
          background: '#33B5AC',
          padding: isMobile ? '24px 16px 22px' : `32px ${pad} 28px`,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', fontWeight: '500' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: WHITE, letterSpacing: '-1px', lineHeight: 1 }}>Dashboard</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/dashboard/quotes')}
              style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.12)', color: WHITE, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
              New quote
            </button>
            <button onClick={() => router.push('/dashboard/jobs')}
              style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: 'none', background: WHITE, color: TEAL_DARK, fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke={TEAL_DARK} strokeWidth="2" strokeLinecap="round"/></svg>
              Add job
            </button>
          </div>
        </div>

        {/* PAGE BODY */}
        <div style={{ padding: `${isMobile ? '24px' : '36px'} ${pad}`, paddingBottom: isMobile ? '90px' : '48px' }}>

          {/* ── SECTION 1: OVERVIEW ── */}
          <SectionHeading label="Business overview" sub="At a glance"/>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '12px' }}>
            {[
              { label: 'Customers', value: stats.customers, sub: 'registered', accent: TEAL, valColor: TEXT },
              { label: 'Active units', value: stats.units, sub: 'installed', accent: TEAL, valColor: TEXT },
              { label: 'Overdue services', value: stats.overdue, sub: stats.overdue > 0 ? 'need attention' : 'all clear', accent: stats.overdue > 0 ? '#EF4444' : TEAL, valColor: stats.overdue > 0 ? '#B91C1C' : TEXT },
              { label: 'Jobs this month', value: stats.jobsThisMonth, sub: 'new installs', accent: '#8B5CF6', valColor: TEXT },
            ].map(s => (
              <div key={s.label} style={card}>
                <div style={{ height: '4px', background: s.accent }} />
                <div style={{ padding: isMobile ? '16px 14px' : '20px 22px 22px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>{s.label}</div>
                  <div style={{ fontSize: isMobile ? '32px' : '40px', fontWeight: '800', color: s.valColor, lineHeight: 1, marginBottom: '6px', letterSpacing: '-1px' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: TEXT3, fontWeight: '500' }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={divider}/>

          {/* ── SECTION 2: FINANCIALS ── */}
          <SectionHeading label="Financial snapshot" sub="Money" action="View invoices →" onAction={() => router.push('/dashboard/invoices')}/>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { href: '/dashboard/revenue', label: 'Revenue collected', value: `$${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, sub: 'from paid invoices', valColor: '#065F46', accent: '#10B981', bg: '#F0FDF4' },
              { href: '/dashboard/invoices', label: 'Outstanding', value: `$${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, sub: 'awaiting payment', valColor: invoiceStats.outstanding > 0 ? '#92400E' : TEXT, accent: invoiceStats.outstanding > 0 ? '#F59E0B' : TEAL, bg: invoiceStats.outstanding > 0 ? '#FFFBEB' : WHITE },
              { href: '/dashboard/schedule', label: 'Due for service', value: String(upcoming.length), sub: 'units upcoming', valColor: upcoming.length > 0 ? '#1E3A8A' : TEXT, accent: upcoming.length > 0 ? '#3B82F6' : TEAL, bg: upcoming.length > 0 ? '#EFF6FF' : WHITE },
            ].map(f => (
              <div key={f.label} onClick={() => router.push(f.href)}
                style={{ ...card, cursor: 'pointer', background: f.bg, transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ height: '4px', background: f.accent }} />
                <div style={{ padding: '20px 22px 22px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>{f.label}</div>
                  <div style={{ fontSize: '30px', fontWeight: '800', color: f.valColor, letterSpacing: '-0.8px', marginBottom: '6px', lineHeight: 1 }}>{f.value}</div>
                  <div style={{ fontSize: '12px', color: TEXT3, fontWeight: '500' }}>{f.sub} →</div>
                </div>
              </div>
            ))}
          </div>

          <div style={divider}/>

          {/* ── SECTION 3: CUSTOMERS + SCHEDULE ── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: '28px', alignItems: 'start' }}>

            {/* Recent customers */}
            <div>
              <SectionHeading label="Recent customers" sub="Activity" action="View all →" onAction={() => router.push('/dashboard/customers')}/>
              <div style={card}>
                {recent.length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
                    No jobs yet. <span style={{ color: TEAL, cursor: 'pointer', fontWeight: '600' }} onClick={() => router.push('/dashboard/jobs')}>Add your first job →</span>
                  </div>
                ) : isMobile ? (
                  <div>
                    {recent.map((job, i) => {
                      const av = avColors[i % avColors.length]
                      const s = statusPill(job.next_service_date)
                      return (
                        <div key={job.id} style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                          onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                              {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                              <div style={{ fontSize: '12px', color: TEXT3, marginTop: '1px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                            </div>
                          </div>
                          <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '8px', flexShrink: 0 }}>{s.label}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F8F8F6' }}>
                        {['Customer', 'Unit', 'Next service', 'Status'].map(h => (
                          <th key={h} style={{ padding: '12px 22px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: TEXT3, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
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
                            onMouseEnter={e => (e.currentTarget.style.background = '#F8F8F6')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <td style={{ padding: '15px 22px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                                  {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                                </div>
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                                  <div style={{ fontSize: '12px', color: TEXT3, marginTop: '1px' }}>{job.customers?.suburb || '—'}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '15px 22px', fontSize: '13px', color: TEXT2, fontWeight: '500' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</td>
                            <td style={{ padding: '15px 22px', fontSize: '13px', color: TEXT2 }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) : '—'}</td>
                            <td style={{ padding: '15px 22px' }}>
                              <span style={{ background: s.bg, color: s.color, padding: '4px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>{s.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Upcoming + Quick actions */}
            {!isMobile && (
              <div>
                <SectionHeading label="Upcoming services" sub="Schedule" action="View all →" onAction={() => router.push('/dashboard/schedule')}/>
                <div style={card}>
                  {upcoming.length === 0 ? (
                    <div style={{ padding: '36px 20px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No upcoming services.</div>
                  ) : upcoming.map(job => {
                    const days = getDays(job.next_service_date)
                    const u = urgency(days)
                    return (
                      <div key={job.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F8F8F6')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: u.dot, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                          <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: u.val }}>{u.text}</div>
                          <div style={{ fontSize: '10px', color: TEXT3, marginTop: '1px' }}>{u.label}</div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Quick actions */}
                  <div style={{ padding: '16px 20px', background: '#F8F8F6', borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '10px' }}>Quick actions</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {[
                        { label: 'Send service reminders', href: '/dashboard/schedule' },
                        { label: 'Create a new invoice', href: '/dashboard/invoices' },
                        { label: 'View QR codes', href: '/dashboard/qrcodes' },
                      ].map(a => (
                        <div key={a.label} onClick={() => router.push(a.href)}
                          style={{ fontSize: '13px', color: TEXT2, cursor: 'pointer', padding: '7px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '500' }}
                          onMouseEnter={e => { e.currentTarget.style.background = TEAL_LIGHT; e.currentTarget.style.color = TEAL_DARK }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT2 }}>
                          {a.label}
                          <span style={{ fontSize: '12px' }}>→</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile upcoming */}
          {isMobile && (
            <div style={{ marginTop: '28px' }}>
              <SectionHeading label="Upcoming services" sub="Schedule" action="View all →" onAction={() => router.push('/dashboard/schedule')}/>
              <div style={card}>
                {upcoming.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>No upcoming services.</div>
                ) : upcoming.map(job => {
                  const days = getDays(job.next_service_date)
                  const u = urgency(days)
                  return (
                    <div key={job.id} style={{ padding: '13px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                      onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.dot, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                        <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: u.val }}>{u.text}</div>
                        <div style={{ fontSize: '11px', color: TEXT3 }}>{u.label}</div>
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
  )
}