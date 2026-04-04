'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#2AA198'
const TEAL_DARK = '#1E8C84'
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

type Job = { id: string; created_at: string; install_date: string | null; next_service_date: string | null; brand: string | null; capacity_kw: number | null; customer_id: string | null }
type Invoice = { id: string; created_at: string; status: string; total: number; amount_paid: number }
type Quote = { id: string; created_at: string; status: string; total: number }
type Customer = { id: string; created_at: string; suburb: string | null }

function isSameMonth(dateStr: string | null | undefined, base: Date) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return d.getMonth() === base.getMonth() && d.getFullYear() === base.getFullYear()
}

function formatMoney(value: number) {
  return `$${value.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`
}

function monthLabelFromOffset(base: Date, offset: number) {
  const d = new Date(base.getFullYear(), base.getMonth() + offset, 1)
  return d.toLocaleDateString('en-AU', { month: 'short' })
}

export default function ReportsPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return
      const [jobsRes, invoicesRes, quotesRes, customersRes] = await Promise.all([
        supabase.from('jobs').select('id, created_at, install_date, next_service_date, brand, capacity_kw, customer_id').eq('business_id', userData.business_id).order('created_at', { ascending: false }),
        supabase.from('invoices').select('id, created_at, status, total, amount_paid').eq('business_id', userData.business_id).order('created_at', { ascending: false }),
        supabase.from('quotes').select('id, created_at, status, total').eq('business_id', userData.business_id).order('created_at', { ascending: false }),
        supabase.from('customers').select('id, created_at, suburb').eq('business_id', userData.business_id).order('created_at', { ascending: false }),
      ])
      setJobs((jobsRes.data || []) as Job[])
      setInvoices((invoicesRes.data || []) as Invoice[])
      setQuotes((quotesRes.data || []) as Quote[])
      setCustomers((customersRes.data || []) as Customer[])
      setLoading(false)
    }
    load()
  }, [router])

  const today = new Date()
  const todayStr = today.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const report = useMemo(() => {
    const currentMonth = today
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

    const revenueCollected = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (Number(i.total) || 0), 0)
    const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + ((Number(i.total) || 0) - (Number(i.amount_paid) || 0)), 0)
    const quotesAcceptedValue = quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + (Number(q.total) || 0), 0)
    const jobsThisMonth = jobs.filter(j => isSameMonth(j.created_at, currentMonth)).length
    const jobsLastMonth = jobs.filter(j => isSameMonth(j.created_at, previousMonth)).length
    const newCustomersThisMonth = customers.filter(c => isSameMonth(c.created_at, currentMonth)).length
    const invoicesThisMonth = invoices.filter(i => isSameMonth(i.created_at, currentMonth)).length
    const quotesThisMonth = quotes.filter(q => isSameMonth(q.created_at, currentMonth)).length
    const overdueServices = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today).length
    const dueSoonServices = jobs.filter(j => {
      if (!j.next_service_date) return false
      const diff = Math.floor((new Date(j.next_service_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diff >= 0 && diff <= 30
    }).length
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length
    const sentQuotes = quotes.filter(q => q.status === 'sent').length
    const acceptanceRate = quotes.length > 0 ? Math.round((acceptedQuotes / quotes.length) * 100) : 0

    const monthlyRevenue = [-5, -4, -3, -2, -1, 0].map(offset => {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + offset, 1)
      const total = invoices.filter(i => i.status === 'paid' && isSameMonth(i.created_at, monthDate)).reduce((sum, i) => sum + (Number(i.total) || 0), 0)
      return { label: monthLabelFromOffset(today, offset), total }
    })

    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.total), 1)

    const suburbCounts: Record<string, number> = {}
    customers.forEach(c => { const key = (c.suburb || 'Unknown').trim() || 'Unknown'; suburbCounts[key] = (suburbCounts[key] || 0) + 1 })
    const topSuburbs = Object.entries(suburbCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

    const brandCounts: Record<string, number> = {}
    jobs.forEach(j => { const key = (j.brand || 'Unknown').trim() || 'Unknown'; brandCounts[key] = (brandCounts[key] || 0) + 1 })
    const topBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

    return { revenueCollected, outstanding, quotesAcceptedValue, jobsThisMonth, jobsLastMonth, newCustomersThisMonth, invoicesThisMonth, quotesThisMonth, overdueServices, dueSoonServices, acceptedQuotes, sentQuotes, acceptanceRate, monthlyRevenue, maxRevenue, topSuburbs, topBrands }
  }, [customers, invoices, jobs, quotes])

  const pad = isMobile ? '16px' : '32px'

  const card: React.CSSProperties = {
    background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden',
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px', fontWeight: '700', color: TEAL,
    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/reports" />
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
            <div style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', color: WHITE, letterSpacing: '-0.8px', lineHeight: 1 }}>Reports</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => window.print()}
              style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.12)', color: WHITE, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
              Print report
            </button>
            <button onClick={() => router.push('/dashboard/invoices')}
              style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: 'none', background: WHITE, color: TEAL_DARK, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              View invoices
            </button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: `28px ${pad}`, paddingBottom: isMobile ? '90px' : '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading reports…</div>
          ) : (
            <>
              {/* KPI STATS */}
              <div>
                <div style={sectionLabel}>Financial overview</div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '12px' }}>
                  {[
                    { label: 'Revenue collected', value: formatMoney(report.revenueCollected), sub: 'paid invoices', accent: '#10B981', valColor: '#064E3B' },
                    { label: 'Outstanding', value: formatMoney(report.outstanding), sub: 'awaiting payment', accent: '#3B82F6', valColor: '#1E3A8A' },
                    { label: 'Accepted quote value', value: formatMoney(report.quotesAcceptedValue), sub: 'approved quotes', accent: TEAL, valColor: '#064E3B' },
                    { label: 'Overdue services', value: String(report.overdueServices), sub: report.overdueServices > 0 ? 'needs action' : 'all clear', accent: report.overdueServices > 0 ? '#EF4444' : TEAL, valColor: report.overdueServices > 0 ? '#B91C1C' : TEXT },
                  ].map(s => (
                    <div key={s.label} style={card}>
                      <div style={{ height: '3px', background: s.accent }} />
                      <div style={{ padding: isMobile ? '14px' : '18px 20px 20px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>{s.label}</div>
                        <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: s.valColor, lineHeight: 1, marginBottom: '6px', letterSpacing: '-0.6px' }}>{s.value}</div>
                        <div style={{ fontSize: '12px', color: TEXT3, fontWeight: '500' }}>{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVENUE TREND + THIS MONTH */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', gap: '14px' }}>
                <div style={card}>
                  <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Trend</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>Revenue trend</div>
                    <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Paid invoice totals across the last 6 months</div>
                  </div>
                  <div style={{ padding: '20px 22px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: isMobile ? '180px' : '220px' }}>
                      {report.monthlyRevenue.map(item => {
                        const height = Math.max(12, Math.round((item.total / report.maxRevenue) * (isMobile ? 140 : 170)))
                        return (
                          <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <div style={{ fontSize: '11px', color: TEXT3, fontWeight: '600' }}>{item.total > 0 ? formatMoney(item.total) : '$0'}</div>
                            <div style={{ width: '100%', maxWidth: '52px', height: `${height}px`, background: item.total > 0 ? TEAL : '#E5E7EB', borderRadius: '10px 10px 4px 4px', transition: 'background 0.2s' }}/>
                            <div style={{ fontSize: '11px', color: TEXT3, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{item.label}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={card}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Activity</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>This month</div>
                    </div>
                    <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        ['New customers', report.newCustomersThisMonth],
                        ['Jobs created', report.jobsThisMonth],
                        ['Invoices created', report.invoicesThisMonth],
                        ['Quotes created', report.quotesThisMonth],
                        ['Due soon services', report.dueSoonServices],
                      ].map(([label, value]) => (
                        <div key={label as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <span style={{ fontSize: '13px', color: TEXT2, fontWeight: '500' }}>{label}</span>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: TEXT }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={card}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Quotes</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>Performance</div>
                    </div>
                    <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        ['Accepted quotes', report.acceptedQuotes],
                        ['Sent quotes', report.sentQuotes],
                        ['Acceptance rate', `${report.acceptanceRate}%`],
                      ].map(([label, value]) => (
                        <div key={label as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <span style={{ fontSize: '13px', color: TEXT2, fontWeight: '500' }}>{label}</span>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: TEXT }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* TOP SUBURBS + BRANDS */}
              <div>
                <div style={sectionLabel}>Breakdown</div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  {[
                    { title: 'Top suburbs', subtitle: 'Where most of your customers are located', data: report.topSuburbs, avatarBg: '#E8F4F1', avatarColor: '#0A4F4C', empty: 'No suburb data yet.' },
                    { title: 'Top installed brands', subtitle: 'Most common equipment brands in your records', data: report.topBrands, avatarBg: '#DBEAFE', avatarColor: '#1E3A8A', empty: 'No brand data yet.' },
                  ].map(section => (
                    <div key={section.title} style={card}>
                      <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>{section.title}</div>
                        <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{section.subtitle}</div>
                      </div>
                      <div>
                        {section.data.length === 0 ? (
                          <div style={{ padding: '24px 22px', fontSize: '13px', color: TEXT3 }}>{section.empty}</div>
                        ) : section.data.map(([name, count], index) => (
                          <div key={name as string} style={{ padding: '13px 22px', borderTop: index === 0 ? 'none' : `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: section.avatarBg, color: section.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                                {index + 1}
                              </div>
                              <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>{name}</span>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: TEXT }}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SUMMARY */}
              <div style={card}>
                <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Snapshot</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>Summary</div>
                </div>
                <div style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '14px' }}>
                  {[
                    {
                      label: 'Jobs trend',
                      heading: report.jobsThisMonth >= report.jobsLastMonth ? 'Up or steady' : 'Down from last month',
                      sub: `${report.jobsThisMonth} this month vs ${report.jobsLastMonth} last month`,
                      accent: report.jobsThisMonth >= report.jobsLastMonth ? '#10B981' : '#F59E0B',
                    },
                    {
                      label: 'Service workload',
                      heading: `${report.overdueServices + report.dueSoonServices} upcoming actions`,
                      sub: `${report.overdueServices} overdue · ${report.dueSoonServices} due soon`,
                      accent: report.overdueServices > 0 ? '#EF4444' : TEAL,
                    },
                    {
                      label: 'Cash flow snapshot',
                      heading: report.outstanding > 0 ? 'Follow-up recommended' : 'Healthy',
                      sub: `${formatMoney(report.outstanding)} outstanding right now`,
                      accent: report.outstanding > 0 ? '#F59E0B' : '#10B981',
                    },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#F9FAFB', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '16px', borderLeft: `3px solid ${s.accent}` }}>
                      <div style={{ fontSize: '11px', color: TEXT3, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: TEXT, marginBottom: '4px' }}>{s.heading}</div>
                      <div style={{ fontSize: '12px', color: TEXT3, fontWeight: '500' }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}