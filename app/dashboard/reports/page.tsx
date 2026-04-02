'use client'

import React, { useEffect, useMemo, useState } from 'react'
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

type Job = {
  id: string
  created_at: string
  install_date: string | null
  next_service_date: string | null
  brand: string | null
  capacity_kw: number | null
  customer_id: string | null
}

type Invoice = {
  id: string
  created_at: string
  status: string
  total: number
  amount_paid: number
}

type Quote = {
  id: string
  created_at: string
  status: string
  total: number
}

type Customer = {
  id: string
  created_at: string
  suburb: string | null
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

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
  const [businessId, setBusinessId] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

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
      setBusinessId(userData.business_id)

      const [jobsRes, invoicesRes, quotesRes, customersRes] = await Promise.all([
        supabase
          .from('jobs')
          .select('id, created_at, install_date, next_service_date, brand, capacity_kw, customer_id')
          .eq('business_id', userData.business_id)
          .order('created_at', { ascending: false }),

        supabase
          .from('invoices')
          .select('id, created_at, status, total, amount_paid')
          .eq('business_id', userData.business_id)
          .order('created_at', { ascending: false }),

        supabase
          .from('quotes')
          .select('id, created_at, status, total')
          .eq('business_id', userData.business_id)
          .order('created_at', { ascending: false }),

        supabase
          .from('customers')
          .select('id, created_at, suburb')
          .eq('business_id', userData.business_id)
          .order('created_at', { ascending: false }),
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
  const todayStr = today.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const report = useMemo(() => {
    const currentMonth = today
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

    const revenueCollected = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (Number(i.total) || 0), 0)

    const outstanding = invoices
      .filter(i => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + ((Number(i.total) || 0) - (Number(i.amount_paid) || 0)), 0)

    const quotesAcceptedValue = quotes
      .filter(q => q.status === 'accepted')
      .reduce((sum, q) => sum + (Number(q.total) || 0), 0)

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
      const total = invoices
        .filter(i => i.status === 'paid' && isSameMonth(i.created_at, monthDate))
        .reduce((sum, i) => sum + (Number(i.total) || 0), 0)

      return {
        label: monthLabelFromOffset(today, offset),
        total,
      }
    })

    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.total), 1)

    const suburbCounts: Record<string, number> = {}
    customers.forEach(c => {
      const key = (c.suburb || 'Unknown').trim() || 'Unknown'
      suburbCounts[key] = (suburbCounts[key] || 0) + 1
    })

    const topSuburbs = Object.entries(suburbCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const brandCounts: Record<string, number> = {}
    jobs.forEach(j => {
      const key = (j.brand || 'Unknown').trim() || 'Unknown'
      brandCounts[key] = (brandCounts[key] || 0) + 1
    })

    const topBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      revenueCollected,
      outstanding,
      quotesAcceptedValue,
      jobsThisMonth,
      jobsLastMonth,
      newCustomersThisMonth,
      invoicesThisMonth,
      quotesThisMonth,
      overdueServices,
      dueSoonServices,
      acceptedQuotes,
      sentQuotes,
      acceptanceRate,
      monthlyRevenue,
      maxRevenue,
      topSuburbs,
      topBrands,
    }
  }, [customers, invoices, jobs, quotes])

  const pad = isMobile ? '16px' : '32px'

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
      <Sidebar active="/dashboard/reports" />

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
              Reports
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.print()}
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
              Print report
            </button>
            <button
              onClick={() => router.push('/dashboard/invoices')}
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
              View invoices
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
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading reports…</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '10px' }}>
                {[
                  {
                    label: 'Revenue collected',
                    value: formatMoney(report.revenueCollected),
                    sub: 'paid invoices',
                    accent: TEAL,
                    valColor: '#064E3B',
                  },
                  {
                    label: 'Outstanding',
                    value: formatMoney(report.outstanding),
                    sub: 'awaiting payment',
                    accent: '#1E3A8A',
                    valColor: '#1E3A8A',
                  },
                  {
                    label: 'Accepted quote value',
                    value: formatMoney(report.quotesAcceptedValue),
                    sub: 'approved quotes',
                    accent: '#10B981',
                    valColor: '#064E3B',
                  },
                  {
                    label: 'Overdue services',
                    value: String(report.overdueServices),
                    sub: report.overdueServices > 0 ? 'needs action' : 'all clear',
                    accent: report.overdueServices > 0 ? '#EF4444' : TEAL,
                    valColor: report.overdueServices > 0 ? '#B91C1C' : TEXT,
                  },
                ].map(card => (
                  <div key={card.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ height: '3px', background: card.accent }} />
                    <div style={{ padding: isMobile ? '14px' : '16px 20px 18px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: TEXT3, marginBottom: '8px' }}>{card.label}</div>
                      <div
                        style={{
                          fontSize: isMobile ? '24px' : '30px',
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

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', gap: '14px' }}>
                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Revenue trend</div>
                    <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Paid invoice totals across the last 6 months</div>
                  </div>

                  <div style={{ padding: '18px 22px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: isMobile ? '180px' : '220px' }}>
                      {report.monthlyRevenue.map(item => {
                        const height = Math.max(12, Math.round((item.total / report.maxRevenue) * (isMobile ? 140 : 170)))
                        return (
                          <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <div style={{ fontSize: '11px', color: TEXT3, fontWeight: '500' }}>{item.total > 0 ? formatMoney(item.total) : '$0'}</div>
                            <div
                              style={{
                                width: '100%',
                                maxWidth: '52px',
                                height: `${height}px`,
                                background: item.total > 0 ? TEAL : '#E5E7EB',
                                borderRadius: '10px 10px 4px 4px',
                              }}
                            />
                            <div style={{ fontSize: '11px', color: TEXT3, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                              {item.label}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>This month</div>
                    </div>
                    <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        ['New customers', report.newCustomersThisMonth],
                        ['Jobs created', report.jobsThisMonth],
                        ['Invoices created', report.invoicesThisMonth],
                        ['Quotes created', report.quotesThisMonth],
                        ['Due soon services', report.dueSoonServices],
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <span style={{ fontSize: '13px', color: TEXT2 }}>{label}</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: TEXT }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Quote performance</div>
                    </div>
                    <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        ['Accepted quotes', report.acceptedQuotes],
                        ['Sent quotes', report.sentQuotes],
                        ['Acceptance rate', `${report.acceptanceRate}%`],
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <span style={{ fontSize: '13px', color: TEXT2 }}>{label}</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: TEXT }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Top suburbs</div>
                    <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Where most of your customers are located</div>
                  </div>

                  <div>
                    {report.topSuburbs.length === 0 ? (
                      <div style={{ padding: '24px 22px', fontSize: '13px', color: TEXT3 }}>No suburb data yet.</div>
                    ) : (
                      report.topSuburbs.map(([suburb, count], index) => (
                        <div
                          key={suburb}
                          style={{
                            padding: '13px 22px',
                            borderTop: index === 0 ? 'none' : `1px solid ${BORDER}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: '#E8F4F1',
                                color: '#0A4F4C',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '700',
                                flexShrink: 0,
                              }}
                            >
                              {index + 1}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: TEXT }}>{suburb}</span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: TEXT }}>{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Top installed brands</div>
                    <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Most common equipment brands in your records</div>
                  </div>

                  <div>
                    {report.topBrands.length === 0 ? (
                      <div style={{ padding: '24px 22px', fontSize: '13px', color: TEXT3 }}>No brand data yet.</div>
                    ) : (
                      report.topBrands.map(([brand, count], index) => (
                        <div
                          key={brand}
                          style={{
                            padding: '13px 22px',
                            borderTop: index === 0 ? 'none' : `1px solid ${BORDER}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: '#DBEAFE',
                                color: '#1E3A8A',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '700',
                                flexShrink: 0,
                              }}
                            >
                              {index + 1}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: TEXT }}>{brand}</span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: TEXT }}>{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Summary</div>
                </div>

                <div style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '14px' }}>
                  <div style={{ background: '#FAFAF8', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '12px', color: TEXT3, marginBottom: '6px' }}>Jobs trend</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>
                      {report.jobsThisMonth >= report.jobsLastMonth ? 'Up or steady' : 'Down from last month'}
                    </div>
                    <div style={{ fontSize: '12px', color: TEXT3, marginTop: '4px' }}>
                      {report.jobsThisMonth} this month vs {report.jobsLastMonth} last month
                    </div>
                  </div>

                  <div style={{ background: '#FAFAF8', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '12px', color: TEXT3, marginBottom: '6px' }}>Service workload</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>
                      {report.overdueServices + report.dueSoonServices} upcoming actions
                    </div>
                    <div style={{ fontSize: '12px', color: TEXT3, marginTop: '4px' }}>
                      {report.overdueServices} overdue · {report.dueSoonServices} due soon
                    </div>
                  </div>

                  <div style={{ background: '#FAFAF8', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '12px', color: TEXT3, marginBottom: '6px' }}>Cash flow snapshot</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>
                      {report.outstanding > 0 ? 'Follow-up recommended' : 'Healthy'}
                    </div>
                    <div style={{ fontSize: '12px', color: TEXT3, marginTop: '4px' }}>
                      {formatMoney(report.outstanding)} outstanding right now
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}