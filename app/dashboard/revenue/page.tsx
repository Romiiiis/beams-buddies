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
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TYPE = {
  label: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.08em' as const,
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

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconExternalLink({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrendUp({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 7l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrendDown({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 17l-8-8-4 4-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function pctChange(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return 0
    return 100
  }
  return Math.round(((current - previous) / previous) * 100)
}

function formatDelta(n: number) {
  return `${n >= 0 ? '+' : ''}${n}%`
}

type InvoiceRow = {
  id: string
  status: string
  total: number | null
  amount_paid: number | null
  created_at: string
  paid_at?: string | null
  customer_id?: string | null
  customers?: {
    first_name?: string | null
    last_name?: string | null
  } | null
}

type TopCustomer = {
  name: string
  total: number
  count: number
}

type MetricMode = 'invoiced' | 'collected' | 'outstanding' | 'overdue'

export default function RevenuePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [metricMode, setMetricMode] = useState<MetricMode>('invoiced')

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('business_id')
        .eq('id', session.user.id)
        .single()

      if (!userData) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('invoices')
        .select('*, customers(first_name, last_name)')
        .eq('business_id', userData.business_id)
        .order('created_at', { ascending: false })

      setInvoices((data || []) as InvoiceRow[])
      setLoading(false)
    }

    load()
  }, [router])

  const paid = useMemo(() => invoices.filter(i => i.status === 'paid'), [invoices])
  const outstanding = useMemo(() => invoices.filter(i => i.status === 'sent' || i.status === 'overdue'), [invoices])
  const overdue = useMemo(() => invoices.filter(i => i.status === 'overdue'), [invoices])
  const drafts = useMemo(() => invoices.filter(i => i.status === 'draft'), [invoices])

  const totalRevenue = useMemo(
    () => paid.reduce((sum, i) => sum + Number(i.total || 0), 0),
    [paid]
  )

  const totalOutstanding = useMemo(
    () =>
      outstanding.reduce(
        (sum, i) => sum + (Number(i.total || 0) - Number(i.amount_paid || 0)),
        0
      ),
    [outstanding]
  )

  const totalOverdue = useMemo(
    () => overdue.reduce((sum, i) => sum + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0),
    [overdue]
  )

  const totalInvoiced = useMemo(
    () => invoices.reduce((sum, i) => sum + Number(i.total || 0), 0),
    [invoices]
  )

  const last6 = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setDate(1)
        d.setMonth(d.getMonth() - (5 - i))
        return {
          label: d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }),
          shortLabel: d.toLocaleDateString('en-AU', { month: 'short' }),
          month: d.getMonth(),
          year: d.getFullYear(),
        }
      }),
    []
  )

  const monthlyStats = useMemo(
    () =>
      last6.map(m => {
        const monthInvoices = invoices.filter(i => {
          const d = new Date(i.created_at)
          return d.getMonth() === m.month && d.getFullYear() === m.year
        })

        const invoiced = monthInvoices.reduce((sum, i) => sum + Number(i.total || 0), 0)
        const collected = monthInvoices
          .filter(i => i.status === 'paid')
          .reduce((sum, i) => sum + Number(i.total || 0), 0)
        const open = monthInvoices.filter(i => i.status === 'sent' || i.status === 'overdue')
        const outstandingValue = open.reduce(
          (sum, i) => sum + (Number(i.total || 0) - Number(i.amount_paid || 0)),
          0
        )
        const overdueValue = monthInvoices
          .filter(i => i.status === 'overdue')
          .reduce((sum, i) => sum + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0)

        return {
          ...m,
          invoiced,
          collected,
          outstanding: outstandingValue,
          overdue: overdueValue,
          invoiceCount: monthInvoices.length,
          paidCount: monthInvoices.filter(i => i.status === 'paid').length,
          openCount: open.length,
          overdueCount: monthInvoices.filter(i => i.status === 'overdue').length,
        }
      }),
    [last6, invoices]
  )

  const chartSeries = useMemo(() => {
    return monthlyStats.map(m => ({
      label: m.label,
      shortLabel: m.shortLabel,
      value:
        metricMode === 'invoiced'
          ? m.invoiced
          : metricMode === 'collected'
          ? m.collected
          : metricMode === 'outstanding'
          ? m.outstanding
          : m.overdue,
      count:
        metricMode === 'invoiced'
          ? m.invoiceCount
          : metricMode === 'collected'
          ? m.paidCount
          : metricMode === 'outstanding'
          ? m.openCount
          : m.overdueCount,
    }))
  }, [monthlyStats, metricMode])

  const maxMonthly = Math.max(...chartSeries.map(m => m.value), 1)

  const topCustomers = useMemo(() => {
    const customerRevenue: Record<string, TopCustomer> = {}

    paid.forEach(inv => {
      const id = inv.customer_id || 'unknown'
      const first = inv.customers?.first_name || ''
      const last = inv.customers?.last_name || ''
      const name = `${first} ${last}`.trim() || 'Unknown'

      if (!customerRevenue[id]) {
        customerRevenue[id] = { name, total: 0, count: 0 }
      }

      customerRevenue[id].total += Number(inv.total || 0)
      customerRevenue[id].count += 1
    })

    return Object.values(customerRevenue)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [paid])

  const maxCustomer = topCustomers.length ? topCustomers[0].total : 1
  const collectionRate = totalInvoiced > 0 ? Math.round((totalRevenue / totalInvoiced) * 100) : 0

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const now = new Date()
  const startCurrent30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  const startPrev30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60)

  function inRange(dateStr?: string | null, start?: Date, end?: Date) {
    if (!dateStr) return false
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    return d >= start! && d < end!
  }

  const currentCollected = invoices
    .filter(i => i.status === 'paid' && inRange(i.created_at, startCurrent30, now))
    .reduce((s, i) => s + Number(i.total || 0), 0)
  const prevCollected = invoices
    .filter(i => i.status === 'paid' && inRange(i.created_at, startPrev30, startCurrent30))
    .reduce((s, i) => s + Number(i.total || 0), 0)

  const currentOutstanding = invoices
    .filter(i => (i.status === 'sent' || i.status === 'overdue') && inRange(i.created_at, startCurrent30, now))
    .reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0)
  const prevOutstanding = invoices
    .filter(i => (i.status === 'sent' || i.status === 'overdue') && inRange(i.created_at, startPrev30, startCurrent30))
    .reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0)

  const currentOverdue = invoices
    .filter(i => i.status === 'overdue' && inRange(i.created_at, startCurrent30, now))
    .reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0)
  const prevOverdue = invoices
    .filter(i => i.status === 'overdue' && inRange(i.created_at, startPrev30, startCurrent30))
    .reduce((s, i) => s + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0)

  const currentInvoiced = invoices
    .filter(i => inRange(i.created_at, startCurrent30, now))
    .reduce((s, i) => s + Number(i.total || 0), 0)
  const prevInvoiced = invoices
    .filter(i => inRange(i.created_at, startPrev30, startCurrent30))
    .reduce((s, i) => s + Number(i.total || 0), 0)

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '16px',
  }

  const sectionHeaderTitle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 800,
    color: TEXT,
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  }

  const cardArrowBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: TEXT3,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  }

  const btnOutline: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    border: `1px solid ${BORDER}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: TEXT2,
    background: WHITE,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  }

  const btnDark: React.CSSProperties = {
    height: '34px',
    padding: '0 16px',
    border: `1px solid ${TEXT}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: WHITE,
    background: TEXT,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  }

  const btnMobileSm: React.CSSProperties = {
    height: '36px',
    padding: '0 10px',
    border: `1px solid ${BORDER}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: TEXT2,
    background: WHITE,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    flex: 1,
  }

  const btnMobileDark: React.CSSProperties = {
    ...btnMobileSm,
    background: TEXT,
    border: `1px solid ${TEXT}`,
    color: WHITE,
  }

  const topCards = [
    {
      label: 'Collected',
      value: `$${Math.round(totalRevenue).toLocaleString('en-AU')}`,
      delta: formatDelta(pctChange(currentCollected, prevCollected)),
      up: pctChange(currentCollected, prevCollected) >= 0,
    },
    {
      label: 'Outstanding',
      value: `$${Math.round(totalOutstanding).toLocaleString('en-AU')}`,
      delta: formatDelta(pctChange(currentOutstanding, prevOutstanding)),
      up: pctChange(currentOutstanding, prevOutstanding) >= 0,
    },
    {
      label: 'Overdue',
      value: `$${Math.round(totalOverdue).toLocaleString('en-AU')}`,
      delta: formatDelta(pctChange(currentOverdue, prevOverdue)),
      up: pctChange(currentOverdue, prevOverdue) >= 0,
    },
    {
      label: 'Total invoiced',
      value: `$${Math.round(totalInvoiced).toLocaleString('en-AU')}`,
      delta: formatDelta(pctChange(currentInvoiced, prevInvoiced)),
      up: pctChange(currentInvoiced, prevInvoiced) >= 0,
    },
  ]

  const selectedMetricLabel =
    metricMode === 'invoiced'
      ? 'Invoiced value'
      : metricMode === 'collected'
      ? 'Collected value'
      : metricMode === 'outstanding'
      ? 'Outstanding value'
      : 'Overdue value'

  const selectedMetricTotal =
    metricMode === 'invoiced'
      ? totalInvoiced
      : metricMode === 'collected'
      ? totalRevenue
      : metricMode === 'outstanding'
      ? totalOutstanding
      : totalOverdue

  const selectedMetricCount =
    metricMode === 'invoiced'
      ? invoices.length
      : metricMode === 'collected'
      ? paid.length
      : metricMode === 'outstanding'
      ? outstanding.length
      : overdue.length

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/revenue" />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: TEXT3,
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Loading revenue...
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        fontFamily: FONT,
        background: BG,
        minHeight: '100vh',
      }}
    >
      <Sidebar active="/dashboard/revenue" />

      <div style={{ flex: 1, minWidth: 0, background: BG }}>
        <div
          style={{
            padding: isMobile ? '12px' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
          }}
        >
          {isMobile ? (
            <div style={{ margin: '-12px -12px 0', overflow: 'hidden', background: WHITE }}>
              <div
                style={{
                  background: WHITE,
                  padding: '16px 16px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ flexShrink: 0, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: TEXT3,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      marginBottom: '5px',
                    }}
                  >
                    {new Date().toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>

                  <h1
                    style={{
                      fontSize: '26px',
                      fontWeight: 900,
                      color: TEXT,
                      letterSpacing: '-0.05em',
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    Revenue
                  </h1>
                </div>
              </div>

              <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', gap: '8px', padding: '0 16px 16px' }}>
                  <button onClick={() => router.push('/dashboard/invoices')} style={btnMobileDark}>
                    <IconSpark size={12} /> View invoices
                  </button>
                  <button onClick={() => router.push('/dashboard/customers')} style={btnMobileSm}>
                    Customers
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', gap: 0 }}>
                <div style={{ width: 4, background: TEAL, alignSelf: 'stretch', borderRadius: 0, flexShrink: 0, marginRight: 20 }} />

                <div style={{ flexShrink: 0, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: TEXT3,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      marginBottom: '5px',
                    }}
                  >
                    {todayStr}
                  </div>

                  <h1
                    style={{
                      fontSize: '28px',
                      fontWeight: 900,
                      color: TEXT,
                      letterSpacing: '-0.05em',
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    Revenue
                  </h1>
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => router.push('/dashboard/customers')} style={btnOutline}>
                    View customers
                  </button>

                  <button onClick={() => router.push('/dashboard/invoices')} style={btnDark}>
                    <IconSpark size={14} />
                    View invoices
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            {topCards.map(item => (
              <div
                key={item.label}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '14px',
                  padding: isMobile ? '10px 10px' : '10px 14px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  minHeight: isMobile ? '70px' : '68px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {isMobile ? (
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: TEXT3,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {item.label}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                        {item.value}
                      </div>

                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          padding: '3px 7px',
                          borderRadius: '999px',
                          background: item.up ? '#E6F7F6' : '#FFF0EE',
                          color: item.up ? TEAL_DARK : '#C0392B',
                          fontSize: '9px',
                          fontWeight: 800,
                          flexShrink: 0,
                          alignSelf: 'flex-end',
                          marginTop: '2px',
                        }}
                      >
                        {item.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}
                        {item.delta}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: TEXT3,
                          marginBottom: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.label}
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                        {item.value}
                      </div>
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        padding: '3px 7px',
                        borderRadius: '999px',
                        background: item.up ? '#E6F7F6' : '#FFF0EE',
                        color: item.up ? TEAL_DARK : '#C0392B',
                        fontSize: '9px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {item.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}
                      {item.delta}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 320px',
              gap: '14px',
              alignItems: 'start',
            }}
          >
            <div style={card}>
              <div
                style={{
                  padding: '14px 16px 12px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={sectionHeaderTitle}>Monthly performance</div>
                  <div style={{ ...TYPE.bodySm }}>
                    Switch the view below to compare invoiced, collected, outstanding, or overdue movement.
                  </div>
                </div>

                <select
                  value={metricMode}
                  onChange={e => setMetricMode(e.target.value as MetricMode)}
                  style={{
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: `1px solid ${BORDER}`,
                    background: WHITE,
                    color: TEXT2,
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: FONT,
                    outline: 'none',
                    width: isMobile ? '100%' : '180px',
                  }}
                >
                  <option value="invoiced">Invoiced</option>
                  <option value="collected">Collected</option>
                  <option value="outstanding">Outstanding</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div style={{ padding: '14px 16px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))',
                    gap: '10px',
                    marginBottom: '14px',
                  }}
                >
                  {[
                    { label: 'Current view', value: selectedMetricLabel },
                    { label: 'Total value', value: `$${Math.round(selectedMetricTotal).toLocaleString('en-AU')}` },
                    { label: 'Related invoices', value: selectedMetricCount },
                    { label: 'Collection rate', value: `${collectionRate}%` },
                    { label: 'Paid invoices', value: paid.length },
                    { label: 'Open invoices', value: outstanding.length },
                    { label: 'Overdue count', value: overdue.length },
                    { label: 'Top customers', value: topCustomers.length },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        minWidth: 0,
                        minHeight: isMobile ? '64px' : '68px',
                        borderRadius: '12px',
                        background: '#F8FAFC',
                        border: `1px solid ${BORDER}`,
                        padding: isMobile ? '8px 10px' : '9px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '5px',
                      }}
                    >
                      <div
                        style={{
                          ...TYPE.label,
                          marginBottom: 0,
                          lineHeight: 1.2,
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.label}
                      </div>

                      <div
                        style={{
                          fontSize:
                            typeof item.value === 'string' && String(item.value).length > 12 ? '15px' : '20px',
                          fontWeight: 900,
                          color: TEXT,
                          letterSpacing: '-0.04em',
                          lineHeight: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={String(item.value)}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    height: isMobile ? 250 : 290,
                    borderRadius: '14px',
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    padding: '16px 16px 14px',
                    display: 'grid',
                    gridTemplateColumns: '42px 1fr',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      fontSize: '11px',
                      color: TEXT3,
                      paddingTop: '4px',
                      paddingBottom: '24px',
                      fontWeight: 700,
                    }}
                  >
                    {[100, 75, 50, 25, 0].map(tick => (
                      <span key={tick}>
                        ${Math.round((maxMonthly * tick) / 100).toLocaleString('en-AU')}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      position: 'relative',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                      gap: '10px',
                      alignItems: 'end',
                      paddingTop: '6px',
                    }}
                  >
                    {[0, 25, 50, 75].map((top, i) => (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: `${top}%`,
                          borderTop: '1px dashed #E8EDF3',
                          zIndex: 0,
                        }}
                      />
                    ))}

                    {chartSeries.map(m => {
                      const height = Math.max(16, Math.round((m.value / maxMonthly) * (isMobile ? 136 : 166)))

                      return (
                        <div
                          key={m.label}
                          style={{
                            position: 'relative',
                            zIndex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '8px',
                            height: '100%',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              color: TEXT3,
                              minHeight: '14px',
                              textAlign: 'center',
                            }}
                          >
                            {m.value > 0 ? `$${Math.round(m.value).toLocaleString('en-AU')}` : '$0'}
                          </div>

                          <div
                            style={{
                              width: '100%',
                              maxWidth: '42px',
                              height: isMobile ? '146px' : '178px',
                              display: 'flex',
                              alignItems: 'flex-end',
                              justifyContent: 'center',
                            }}
                          >
                            <div
                              style={{
                                width: '30px',
                                height: `${height}px`,
                                borderRadius: '999px',
                                background: m.value > 0 ? TEAL : '#E2E8F0',
                              }}
                            />
                          </div>

                          <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, textAlign: 'center' }}>
                            {m.count}
                          </div>

                          <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3, textAlign: 'center' }}>
                            {m.shortLabel}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Revenue summary</div>
                  <button onClick={() => router.push('/dashboard/invoices')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', marginBottom: '14px' }}>
                  {collectionRate >= 80 ? (
                    <span style={{ color: TEAL }}>Collections Strong</span>
                  ) : (
                    <>
                      <span style={{ color: RED }}>{collectionRate}%</span> Collection Rate
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: totalOverdue > 0 ? '#FEF2F2' : '#F8FAFC',
                      border: `1px solid ${totalOverdue > 0 ? '#FECACA' : BORDER}`,
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: totalOverdue > 0 ? '#7F1D1D' : TEXT2 }}>Overdue</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: totalOverdue > 0 ? '#991B1B' : TEXT }}>
                      ${Math.round(totalOverdue).toLocaleString('en-AU')}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: totalOutstanding > 0 ? '#FFFBEB' : '#F8FAFC',
                      border: `1px solid ${totalOutstanding > 0 ? '#FDE68A' : BORDER}`,
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: totalOutstanding > 0 ? '#92400E' : TEXT2 }}>Outstanding</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: totalOutstanding > 0 ? '#92400E' : TEXT }}>
                      ${Math.round(totalOutstanding).toLocaleString('en-AU')}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>Drafts</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: TEXT }}>
                      {drafts.length}
                    </span>
                  </div>
                </div>
              </div>

              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Top customers</div>
                  <button onClick={() => router.push('/dashboard/customers')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em' }}>
                    {topCustomers.length}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT3, marginLeft: 6 }}>active revenue accounts</span>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {topCustomers.length === 0 ? (
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: '#F8FAFC',
                        border: `1px solid ${BORDER}`,
                        fontSize: '12px',
                        fontWeight: 600,
                        color: TEXT3,
                        textAlign: 'center',
                      }}
                    >
                      No paid invoices yet
                    </div>
                  ) : (
                    topCustomers.slice(0, 4).map((customer, index) => (
                      <div
                        key={`${customer.name}-${index}`}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: '#F8FAFC',
                          border: `1px solid ${BORDER}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '7px' }}>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: TEXT,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {customer.name}
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>
                              {customer.count} paid invoice{customer.count === 1 ? '' : 's'}
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: TEXT2, flexShrink: 0 }}>
                            ${Math.round(customer.total).toLocaleString('en-AU')}
                          </div>
                        </div>

                        <div style={{ width: '100%', height: '8px', background: '#EAEFF4', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.max(10, Math.round((customer.total / maxCustomer) * 100))}%`,
                              height: '100%',
                              background: TEAL,
                              borderRadius: '999px',
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}