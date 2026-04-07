'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const RED = '#B91C1C'
const AMBER = '#92400E'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#475569'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TYPE = {
  label: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.08em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  section: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.14em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  bodySm: {
    fontSize: '11px',
    fontWeight: 500,
    color: TEXT3,
    lineHeight: 1.45,
  },
  body: {
    fontSize: '12px',
    fontWeight: 500,
    color: TEXT2,
    lineHeight: 1.45,
  },
  titleSm: {
    fontSize: '12px',
    fontWeight: 800,
    color: TEXT,
    lineHeight: 1.3,
  },
  title: {
    fontSize: '13px',
    fontWeight: 700,
    color: TEXT2,
    lineHeight: 1.35,
  },
  valueLg: {
    fontSize: '28px',
    fontWeight: 900,
    letterSpacing: '-0.05em' as const,
    lineHeight: 1,
  },
  valueMd: {
    fontSize: '20px',
    fontWeight: 900,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
    lineHeight: 1,
  },
}

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

function IconRevenue({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v20M17 6.5c0-1.93-2.24-3.5-5-3.5S7 4.57 7 6.5 9.24 10 12 10s5 1.57 5 3.5S14.76 17 12 17s-5-1.57-5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCalendar({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconInvoice({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3h10a2 2 0 0 1 2 2v16l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
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
      if (!session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('business_id')
        .eq('id', session.user.id)
        .single()

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
  const todayStr = today.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

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
      const total = invoices
        .filter(i => i.status === 'paid' && isSameMonth(i.created_at, monthDate))
        .reduce((sum, i) => sum + (Number(i.total) || 0), 0)
      return { label: monthLabelFromOffset(today, offset), total }
    })

    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.total), 1)

    const suburbCounts: Record<string, number> = {}
    customers.forEach(c => {
      const key = (c.suburb || 'Unknown').trim() || 'Unknown'
      suburbCounts[key] = (suburbCounts[key] || 0) + 1
    })
    const topSuburbs = Object.entries(suburbCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

    const brandCounts: Record<string, number> = {}
    jobs.forEach(j => {
      const key = (j.brand || 'Unknown').trim() || 'Unknown'
      brandCounts[key] = (brandCounts[key] || 0) + 1
    })
    const topBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

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
  }, [customers, invoices, jobs, quotes, today])

  const shellCard: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
    overflow: 'hidden',
  }

  const sectionLabel: React.CSSProperties = {
    ...TYPE.section,
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const sectionDash = (
    <span
      style={{
        width: '12px',
        height: '2px',
        background: TEAL,
        borderRadius: '999px',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  )

  const quickActionStyle: React.CSSProperties = {
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT2,
    borderRadius: '10px',
    height: '38px',
    padding: '0 14px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/reports" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>
          Loading reports...
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: FONT,
        background: BG,
        overflow: 'hidden',
      }}
    >
      <Sidebar active="/dashboard/reports" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', background: BG }}>
        <div
          style={{
            background: HEADER_BG,
            padding: isMobile ? '18px 16px 16px' : '20px 24px 18px',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '14px',
            alignItems: 'stretch',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.68)', marginBottom: '5px' }}>
              {todayStr}
            </div>

            <div
              style={{
                fontSize: isMobile ? '28px' : '34px',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                fontWeight: 900,
                color: '#FFFFFF',
                marginBottom: '8px',
              }}
            >
              Reports
            </div>

            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.72)',
                maxWidth: '760px',
              }}
            >
              Review revenue, activity, service workload, and customer trends from one premium reporting centre.
            </div>

            <div
              style={{
                marginTop: '14px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => window.print()}
                style={quickActionStyle}
              >
                Print report
              </button>

              <button
                onClick={() => router.push('/dashboard/invoices')}
                style={{
                  ...quickActionStyle,
                  background: TEAL,
                  color: '#FFFFFF',
                  border: 'none',
                }}
              >
                <IconSpark size={16} />
                View invoices
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: isMobile ? '14px' : '16px 24px 20px',
            background: BG,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
          }}
        >
          <div>
            <div style={sectionLabel}>{sectionDash}Financial overview</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(12, minmax(0,1fr))',
                gap: '10px',
              }}
            >
              {[
                {
                  label: 'Revenue collected',
                  value: formatMoney(report.revenueCollected),
                  sub: 'Paid invoices',
                  icon: <IconRevenue size={17} />,
                  accent: '#166534',
                  span: 'span 3',
                },
                {
                  label: 'Outstanding',
                  value: formatMoney(report.outstanding),
                  sub: 'Awaiting payment',
                  icon: <IconInvoice size={17} />,
                  accent: '#1E3A8A',
                  span: 'span 3',
                },
                {
                  label: 'Accepted quote value',
                  value: formatMoney(report.quotesAcceptedValue),
                  sub: 'Approved quotes',
                  icon: <IconRevenue size={17} />,
                  accent: TEAL_DARK,
                  span: 'span 3',
                },
                {
                  label: 'Overdue services',
                  value: String(report.overdueServices),
                  sub: report.overdueServices > 0 ? 'Needs action' : 'All clear',
                  icon: <IconCalendar size={17} />,
                  accent: report.overdueServices > 0 ? RED : TEXT,
                  span: 'span 3',
                },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    ...shellCard,
                    padding: isMobile ? '12px' : '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    gridColumn: isMobile ? 'span 1' : item.span,
                    minHeight: '124px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '11px',
                        background: '#F8FAFC',
                        color: item.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${BORDER}`,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>

                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: TEXT3,
                      }}
                    >
                      Live
                    </div>
                  </div>

                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>
                      {item.label}
                    </div>
                    <div style={{ ...TYPE.valueLg, fontSize: isMobile ? '23px' : '26px', color: item.accent, marginBottom: '5px' }}>
                      {item.value}
                    </div>
                    <div style={{ ...TYPE.body, fontSize: '11px' }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0,1fr))',
              gap: '10px',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                ...shellCard,
                padding: '14px',
                gridColumn: isMobile ? 'span 1' : 'span 7',
              }}
            >
              <div style={sectionLabel}>{sectionDash}Revenue trend</div>
              <div style={{ ...TYPE.bodySm, marginBottom: '14px' }}>
                Paid invoice totals across the last 6 months
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: isMobile ? '180px' : '220px' }}>
                {report.monthlyRevenue.map(item => {
                  const height = Math.max(12, Math.round((item.total / report.maxRevenue) * (isMobile ? 140 : 170)))
                  return (
                    <div
                      key={item.label}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '8px',
                      }}
                    >
                      <div style={{ ...TYPE.bodySm, fontWeight: 700 }}>
                        {item.total > 0 ? formatMoney(item.total) : '$0'}
                      </div>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '52px',
                          height: `${height}px`,
                          background: item.total > 0 ? TEAL : '#E5E7EB',
                          borderRadius: '10px 10px 4px 4px',
                        }}
                      />
                      <div style={{ ...TYPE.label }}>
                        {item.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gap: '10px',
                gridColumn: isMobile ? 'span 1' : 'span 5',
              }}
            >
              <div style={{ ...shellCard, padding: '14px' }}>
                <div style={sectionLabel}>{sectionDash}This month</div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {[
                    ['New customers', report.newCustomersThisMonth],
                    ['Jobs created', report.jobsThisMonth],
                    ['Invoices created', report.invoicesThisMonth],
                    ['Quotes created', report.quotesThisMonth],
                    ['Due soon services', report.dueSoonServices],
                  ].map(([label, value]) => (
                    <div
                      key={label as string}
                      style={{
                        borderRadius: '12px',
                        padding: '12px 14px',
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <div style={TYPE.titleSm}>{label}</div>
                        <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>Current month</div>
                      </div>
                      <div style={TYPE.valueMd}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...shellCard, padding: '14px' }}>
                <div style={sectionLabel}>{sectionDash}Quote performance</div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {[
                    ['Accepted quotes', report.acceptedQuotes],
                    ['Sent quotes', report.sentQuotes],
                    ['Acceptance rate', `${report.acceptanceRate}%`],
                  ].map(([label, value]) => (
                    <div
                      key={label as string}
                      style={{
                        borderRadius: '12px',
                        padding: '12px 14px',
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <div style={TYPE.titleSm}>{label}</div>
                        <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>Pipeline status</div>
                      </div>
                      <div style={TYPE.valueMd}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={sectionLabel}>{sectionDash}Breakdown</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '10px',
              }}
            >
              {[
                {
                  title: 'Top suburbs',
                  subtitle: 'Where most of your customers are located',
                  data: report.topSuburbs,
                  avatarBg: '#E8F4F1',
                  avatarColor: '#0A4F4C',
                  empty: 'No suburb data yet.',
                },
                {
                  title: 'Top installed brands',
                  subtitle: 'Most common equipment brands in your records',
                  data: report.topBrands,
                  avatarBg: '#DBEAFE',
                  avatarColor: '#1E3A8A',
                  empty: 'No brand data yet.',
                },
              ].map(section => (
                <div key={section.title} style={{ ...shellCard, padding: '14px' }}>
                  <div style={{ ...TYPE.title, fontSize: '14px', marginBottom: '4px' }}>
                    {section.title}
                  </div>
                  <div style={{ ...TYPE.bodySm, marginBottom: '10px' }}>
                    {section.subtitle}
                  </div>

                  {section.data.length === 0 ? (
                    <div
                      style={{
                        borderRadius: '12px',
                        padding: '20px 14px',
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: TEXT3,
                      }}
                    >
                      {section.empty}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {section.data.map(([name, count], index) => (
                        <div
                          key={name as string}
                          style={{
                            borderRadius: '12px',
                            padding: '12px 14px',
                            background: WHITE,
                            border: `1px solid ${BORDER}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '10px',
                                background: section.avatarBg,
                                color: section.avatarColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {index + 1}
                            </div>
                            <span style={{ ...TYPE.titleSm, fontSize: '13px' }}>{name}</span>
                          </div>
                          <span style={TYPE.valueMd}>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...shellCard, padding: '14px' }}>
            <div style={sectionLabel}>{sectionDash}Summary</div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0,1fr))',
                gap: '10px',
              }}
            >
              {[
                {
                  label: 'Jobs trend',
                  heading: report.jobsThisMonth >= report.jobsLastMonth ? 'Up or steady' : 'Down from last month',
                  sub: `${report.jobsThisMonth} this month vs ${report.jobsLastMonth} last month`,
                  accent: report.jobsThisMonth >= report.jobsLastMonth ? '#10B981' : AMBER,
                },
                {
                  label: 'Service workload',
                  heading: `${report.overdueServices + report.dueSoonServices} upcoming actions`,
                  sub: `${report.overdueServices} overdue • ${report.dueSoonServices} due soon`,
                  accent: report.overdueServices > 0 ? RED : TEAL,
                },
                {
                  label: 'Cash flow snapshot',
                  heading: report.outstanding > 0 ? 'Follow-up recommended' : 'Healthy',
                  sub: `${formatMoney(report.outstanding)} outstanding right now`,
                  accent: report.outstanding > 0 ? AMBER : '#10B981',
                },
              ].map(s => (
                <div
                  key={s.label}
                  style={{
                    background: '#F9FAFB',
                    border: `1px solid ${BORDER}`,
                    borderRadius: '12px',
                    padding: '16px',
                    borderLeft: `3px solid ${s.accent}`,
                  }}
                >
                  <div style={{ ...TYPE.label, marginBottom: '6px' }}>{s.label}</div>
                  <div style={{ ...TYPE.title, fontSize: '14px', marginBottom: '4px' }}>{s.heading}</div>
                  <div style={TYPE.bodySm}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}