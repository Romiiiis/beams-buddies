'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_LIGHT = '#E0F2F0'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#6B7280'
const BORDER = '#E8E4DF'
const BG = '#F5F2EE'
const WHITE = '#FDFBF8'
const ACCENT = '#C8C4BE'

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
    return { dot: TEAL, val: TEAL_DARK, label: 'until due', text: `${days}d` }
  }

  function statusPill(nextServiceDate: string | null) {
    if (!nextServiceDate) return { label: 'No date', bg: '#F3F4F6', color: '#6B7280' }
    const days = getDays(nextServiceDate)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#D1FAE5', color: '#064E3B' }
  }

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pad = isMobile ? '16px' : '32px'

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: '700',
    color: TEXT3,
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: `2px solid ${BORDER}`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const sectionDash = (
    <span style={{ width: '14px', height: '2px', background: TEAL, borderRadius: '2px', display: 'inline-block', flexShrink: 0 }}/>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{
          background: '#1A8F86',
          padding: isMobile ? '22px 16px 20px' : `28px ${pad} 24px`,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '5px', fontWeight: '500' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.8px', lineHeight: 1 }}>Dashboard</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/dashboard/quotes')}
              style={{ height: '36px', padding: '0 16px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
              New quote
            </button>
            <button onClick={() => router.push('/dashboard/jobs')}
              style={{ height: '36px', padding: '0 16px', borderRadius: '8px', border: 'none', background: '#FFFFFF', color: TEAL_DARK, fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke={TEAL_DARK} strokeWidth="2" strokeLinecap="round"/></svg>
              Add job
            </button>
          </div>
        </div>

        {/* PAGE BODY */}
        <div style={{ padding: `${isMobile ? '20px' : '28px'} ${pad}`, paddingBottom: isMobile ? '90px' : '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* STATS */}
          <div>
            <div style={sectionLabel}>{sectionDash}Overview</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '10px' }}>
              {[
                { label: 'Customers', value: stats.customers, sub: 'registered', valColor: TEXT },
                { label: 'Active units', value: stats.units, sub: 'installed', valColor: TEXT },
                { label: 'Overdue services', value: stats.overdue, sub: stats.overdue > 0 ? 'need attention' : 'all clear', valColor: stats.overdue > 0 ? '#B91C1C' : TEXT },
                { label: 'Jobs this month', value: stats.jobsThisMonth, sub: 'new installs', valColor: TEXT },
              ].map(s => (
                <div key={s.label} style={card}>
                  <div style={{ height: '3px', background: s.valColor }} />
                  <div style={{ padding: isMobile ? '12px' : '14px 18px 16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{s.label}</div>
                    <div style={{ fontSize: isMobile ? '26px' : '30px', fontWeight: '800', color: s.valColor, lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.6px' }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: TEXT3, fontWeight: '500' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FINANCIALS */}
          <div>
            <div style={sectionLabel}>{sectionDash}Financials</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { href: '/dashboard/revenue', label: 'Revenue collected', value: `$${invoiceStats.collected.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, sub: 'from paid invoices →', valColor: '#065F46' },
                { href: '/dashboard/invoices', label: 'Outstanding', value: `$${invoiceStats.outstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, sub: 'awaiting payment →', valColor: invoiceStats.outstanding > 0 ? '#92400E' : TEXT },
                { href: '/dashboard/schedule', label: 'Due for service', value: `${upcoming.length}`, sub: 'units upcoming →', valColor: upcoming.length > 0 ? '#1E3A8A' : TEXT },
              ].map(f => (
                <div key={f.label} onClick={() => router.push(f.href)}
                  style={{ ...card, cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)' }}>
                  <div style={{ height: '3px', background: f.valColor }} />
                  <div style={{ padding: '14px 18px 16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{f.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: f.valColor, letterSpacing: '-0.5px', marginBottom: '4px', lineHeight: 1 }}>{f.value}</div>
                    <div style={{ fontSize: '11px', color: TEXT3, fontWeight: '500' }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT + UPCOMING */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '16px', alignItems: 'start' }}>

            {/* Recent customers */}
            <div>
              <div style={sectionLabel}>{sectionDash}Recent customers</div>
              <div style={card}>
                {recent.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
                    No jobs yet. <span style={{ color: TEAL, cursor: 'pointer', fontWeight: '600' }} onClick={() => router.push('/dashboard/jobs')}>Add your first job →</span>
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
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                              {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                              <div style={{ fontSize: '12px', color: TEXT3 }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                            </div>
                          </div>
                          <span style={{ background: s.bg, color: s.color, padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '8px', flexShrink: 0 }}>{s.label}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F7F4F0' }}>
                        {['Customer', 'Unit', 'Next service', 'Status'].map(h => (
                          <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: TEXT3, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
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
                            onMouseEnter={e => (e.currentTarget.style.background = '#F7F4F0')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <td style={{ padding: '12px 20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                                  {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
                                </div>
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                                  <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px' }}>{job.customers?.suburb || '—'}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 20px', fontSize: '13px', color: TEXT2, fontWeight: '500' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</td>
                            <td style={{ padding: '12px 20px', fontSize: '13px', color: TEXT2 }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) : '—'}</td>
                            <td style={{ padding: '12px 20px' }}>
                              <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>{s.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Upcoming sidebar */}
            {!isMobile && (
              <div>
                <div style={sectionLabel}>{sectionDash}Upcoming services</div>
                <div style={card}>
                  {upcoming.length === 0 ? (
                    <div style={{ padding: '32px 20px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No upcoming services.</div>
                  ) : upcoming.map(job => {
                    const days = getDays(job.next_service_date)
                    const u = urgency(days)
                    return (
                      <div key={job.id} style={{ padding: '11px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F7F4F0')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.dot, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.customers?.first_name} {job.customers?.last_name}</div>
                          <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: u.val }}>{u.text}</div>
                          <div style={{ fontSize: '10px', color: TEXT3, marginTop: '1px' }}>{u.label}</div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Quick actions */}
                  <div style={{ padding: '12px 18px', borderTop: `1px solid ${BORDER}`, background: '#F7F4F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Quick actions</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {[
                        { label: 'Send service reminders', href: '/dashboard/schedule' },
                        { label: 'Create a new invoice', href: '/dashboard/invoices' },
                        { label: 'View QR codes', href: '/dashboard/qrcodes' },
                      ].map(a => (
                        <div key={a.label} onClick={() => router.push(a.href)}
                          style={{ fontSize: '13px', color: TEXT2, cursor: 'pointer', padding: '6px 8px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '500' }}
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
            <div>
              <div style={sectionLabel}>{sectionDash}Upcoming services</div>
              <div style={card}>
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