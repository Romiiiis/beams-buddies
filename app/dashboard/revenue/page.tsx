'use client'

import React, { useEffect, useState } from 'react'
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

function ImageIcon({ src, size = 30, alt }: { src: string; size?: number; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
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

export default function RevenuePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)

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

  const paid = invoices.filter(i => i.status === 'paid')
  const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue')
  const overdue = invoices.filter(i => i.status === 'overdue')
  const drafts = invoices.filter(i => i.status === 'draft')

  const totalRevenue = paid.reduce((sum, i) => sum + Number(i.total || 0), 0)
  const totalOutstanding = outstanding.reduce(
    (sum, i) => sum + (Number(i.total || 0) - Number(i.amount_paid || 0)),
    0
  )
  const totalOverdue = overdue.reduce((sum, i) => sum + Number(i.total || 0), 0)
  const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.total || 0), 0)

  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (5 - i))
    return {
      label: d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }),
      shortLabel: d.toLocaleDateString('en-AU', { month: 'short' }),
      month: d.getMonth(),
      year: d.getFullYear(),
    }
  })

  const monthlyRevenue = last6.map(m => {
    const total = paid
      .filter(i => {
        const d = new Date(i.paid_at || i.created_at)
        return d.getMonth() === m.month && d.getFullYear() === m.year
      })
      .reduce((sum, i) => sum + Number(i.total || 0), 0)

    return { ...m, total }
  })

  const maxMonthly = Math.max(...monthlyRevenue.map(m => m.total), 1)

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

  const topCustomers = Object.values(customerRevenue)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  const maxCustomer = topCustomers.length ? topCustomers[0].total : 1
  const collectionRate = totalInvoiced > 0 ? Math.round((totalRevenue / totalInvoiced) * 100) : 0

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const shellCard: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
    overflow: 'hidden',
  }

  const panelCard: React.CSSProperties = {
    ...shellCard,
    padding: '16px',
  }

  const sectionLabel: React.CSSProperties = {
    ...TYPE.title,
    fontSize: '13px',
    fontWeight: 800,
    marginBottom: '12px',
  }

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
    boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
  }

  const statIconStyle: React.CSSProperties = {
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
      <Sidebar active="/dashboard/revenue" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: BG }}>
        <div
          style={{
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: BG,
            padding: isMobile ? '14px' : '16px',
            gap: '12px',
          }}
        >
          <div
            style={{
              ...shellCard,
              padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
              background: HEADER_BG,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.68)',
                  marginBottom: '6px',
                }}
              >
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
                Revenue
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
                Track collected cash, outstanding balances, overdue invoices, and top-paying customers from one premium revenue dashboard.
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
                  onClick={() => router.push('/dashboard/invoices')}
                  style={{
                    ...quickActionStyle,
                    background: TEAL,
                    color: '#FFFFFF',
                    border: 'none',
                    boxShadow: '0 6px 14px rgba(31,158,148,0.20)',
                  }}
                >
                  <IconSpark size={16} />
                  View invoices
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div
              style={{
                borderRadius: '12px',
                padding: '26px 16px',
                background: WHITE,
                border: `1px solid ${BORDER}`,
                textAlign: 'center',
                color: TEXT3,
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Loading...
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))',
                  gap: '12px',
                }}
              >
                {[
                  {
                    label: 'Total collected',
                    value: `$${totalRevenue.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
                    sub: 'Paid invoices',
                    icon: (
                      <ImageIcon
                        src="https://static.wixstatic.com/media/48c433_6128eed6331e4d0188d1bd62ed3e4c89~mv2.png"
                        size={30}
                        alt="Total collected"
                      />
                    ),
                    accent: '#166534',
                    tag: 'Cash received',
                  },
                  {
                    label: 'Outstanding',
                    value: `$${totalOutstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
                    sub: 'Awaiting payment',
                    icon: (
                      <ImageIcon
                        src="https://static.wixstatic.com/media/48c433_147eeb738a784ca184267c67f66c1c30~mv2.png"
                        size={30}
                        alt="Outstanding"
                      />
                    ),
                    accent: '#1E3A8A',
                    tag: 'Open balance',
                  },
                  {
                    label: 'Overdue',
                    value: `$${totalOverdue.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
                    sub: totalOverdue > 0 ? 'Needs follow-up' : 'All up to date',
                    icon: (
                      <ImageIcon
                        src="https://static.wixstatic.com/media/48c433_85b27ad4a4ff4fe585436aaf59c63b94~mv2.png"
                        size={30}
                        alt="Overdue"
                      />
                    ),
                    accent: totalOverdue > 0 ? RED : TEXT,
                    tag: 'Past due',
                  },
                  {
                    label: 'Total invoiced',
                    value: `$${totalInvoiced.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
                    sub: 'All invoices',
                    icon: (
                      <ImageIcon
                        src="https://static.wixstatic.com/media/48c433_9cbf007dda55411888ac59c3123f8657~mv2.png"
                        size={30}
                        alt="Total invoiced"
                      />
                    ),
                    accent: TEAL_DARK,
                    tag: 'Gross billed',
                  },
                ].map(item => (
                  <div
                    key={item.label}
                    style={{
                      ...panelCard,
                      gridColumn: isMobile ? 'span 1' : 'span 3',
                      minHeight: 148,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                      <div>
                        <div style={{ ...TYPE.label, marginBottom: '8px' }}>{item.tag}</div>
                        <div style={{ ...TYPE.title, fontSize: '14px', fontWeight: 800, marginBottom: '10px' }}>
                          {item.label}
                        </div>
                      </div>

                      <div style={statIconStyle}>
                        {item.icon}
                      </div>
                    </div>

                    <div>
                      <div style={{ ...TYPE.valueLg, fontSize: isMobile ? '24px' : '30px', color: item.accent }}>
                        {item.value}
                      </div>
                      <div style={{ ...TYPE.bodySm, marginTop: '7px' }}>
                        {item.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0,1fr))',
                  gap: '12px',
                  alignItems: 'start',
                }}
              >
                <div
                  style={{
                    ...panelCard,
                    gridColumn: isMobile ? 'span 1' : 'span 8',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '10px', marginBottom: '14px' }}>
                    <div>
                      <div style={sectionLabel}>Monthly revenue</div>
                      <div style={{ ...TYPE.bodySm }}>
                        Paid revenue over the last 6 months
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '7px 10px',
                        borderRadius: '999px',
                        background: '#F8FAFC',
                        border: `1px solid ${BORDER}`,
                        color: TEXT3,
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      Collection rate {collectionRate}%
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr 1fr 1fr' : 'repeat(6, minmax(0, 1fr))',
                      gap: '10px',
                      marginBottom: '14px',
                    }}
                  >
                    {[
                      { label: 'Paid invoices', value: paid.length },
                      { label: 'Open invoices', value: outstanding.length },
                      { label: 'Overdue count', value: overdue.length },
                      { label: 'Top customers', value: topCustomers.length },
                      { label: 'Collected', value: `$${Math.round(totalRevenue).toLocaleString('en-AU')}` },
                      { label: 'Outstanding', value: `$${Math.round(totalOutstanding).toLocaleString('en-AU')}` },
                    ].map(item => (
                      <div
                        key={item.label}
                        style={{
                          borderRadius: '12px',
                          background: '#F8FAFC',
                          border: `1px solid ${BORDER}`,
                          padding: '10px 12px',
                        }}
                      >
                        <div style={{ ...TYPE.label, marginBottom: '5px' }}>{item.label}</div>
                        <div
                          style={{
                            ...TYPE.valueMd,
                            fontSize: typeof item.value === 'string' && item.value.length > 8 ? '16px' : '20px',
                          }}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      height: isMobile ? 260 : 300,
                      borderRadius: '14px',
                      background: 'linear-gradient(180deg, #FFFFFF 0%, #FCFCFD 100%)',
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
                      {[0, 25, 50, 75, 100].map((top, i) => (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: `${top}%`,
                            borderTop: i === 4 ? 'none' : '1px dashed #E8EDF3',
                            zIndex: 0,
                          }}
                        />
                      ))}

                      {monthlyRevenue.map(m => {
                        const height = Math.max(16, Math.round((m.total / maxMonthly) * (isMobile ? 140 : 170)))

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
                              {m.total > 0 ? `$${Math.round(m.total).toLocaleString('en-AU')}` : '$0'}
                            </div>

                            <div
                              style={{
                                width: '100%',
                                maxWidth: '42px',
                                height: isMobile ? '150px' : '182px',
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
                                  background:
                                    m.total > 0
                                      ? 'linear-gradient(180deg, #28B5A7 0%, #1F9E94 100%)'
                                      : 'linear-gradient(180deg, #EEF2F6 0%, #E2E8F0 100%)',
                                  boxShadow: m.total > 0 ? '0 4px 10px rgba(31,158,148,0.18)' : 'none',
                                }}
                              />
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

                <div
                  style={{
                    gridColumn: isMobile ? 'span 1' : 'span 4',
                    display: 'grid',
                    gap: '12px',
                  }}
                >
                  <div style={panelCard}>
                    <div style={sectionLabel}>Top customers</div>

                    {topCustomers.length === 0 ? (
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
                        No paid invoices yet.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {topCustomers.map((c, index) => (
                          <div
                            key={`${c.name}-${index}`}
                            style={{
                              borderRadius: '12px',
                              padding: '12px 14px',
                              background: '#F8FAFC',
                              border: `1px solid ${BORDER}`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                <div
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '10px',
                                    background: '#E8F4F1',
                                    color: '#0A4F4C',
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
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ ...TYPE.titleSm, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {c.name}
                                  </div>
                                  <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>
                                    {c.count} paid invoice{c.count === 1 ? '' : 's'}
                                  </div>
                                </div>
                              </div>

                              <div style={{ ...TYPE.valueMd, fontSize: '16px' }}>
                                ${Math.round(c.total).toLocaleString('en-AU')}
                              </div>
                            </div>

                            <div style={{ width: '100%', height: '8px', background: '#EAEFF4', borderRadius: '999px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${Math.round((c.total / maxCustomer) * 100)}%`,
                                  height: '100%',
                                  background: TEAL,
                                  borderRadius: '999px',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={panelCard}>
                    <div style={sectionLabel}>Breakdown</div>

                    <div style={{ display: 'grid', gap: '8px' }}>
                      {[
                        {
                          label: 'Paid invoices',
                          value: paid.length,
                          amount: totalRevenue,
                          color: '#166534',
                          bg: '#DCFCE7',
                        },
                        {
                          label: 'Sent / awaiting payment',
                          value: outstanding.filter(i => i.status === 'sent').length,
                          amount: outstanding
                            .filter(i => i.status === 'sent')
                            .reduce((sum, i) => sum + Number(i.total || 0), 0),
                          color: '#1E3A8A',
                          bg: '#DBEAFE',
                        },
                        {
                          label: 'Overdue',
                          value: overdue.length,
                          amount: totalOverdue,
                          color: '#7F1D1D',
                          bg: '#FEE2E2',
                        },
                        {
                          label: 'Draft',
                          value: drafts.length,
                          amount: drafts.reduce((sum, i) => sum + Number(i.total || 0), 0),
                          color: TEXT3,
                          bg: '#F1F5F9',
                        },
                      ].map(row => (
                        <div
                          key={row.label}
                          style={{
                            borderRadius: '12px',
                            padding: '12px 14px',
                            background: '#F8FAFC',
                            border: `1px solid ${BORDER}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <span
                              style={{
                                background: row.bg,
                                color: row.color,
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '10px',
                                fontWeight: 800,
                                flexShrink: 0,
                                letterSpacing: '0.02em',
                              }}
                            >
                              {row.value}
                            </span>
                            <span style={TYPE.titleSm}>{row.label}</span>
                          </div>

                          <span style={{ ...TYPE.titleSm, color: row.color, flexShrink: 0 }}>
                            ${row.amount.toLocaleString('en-AU', { minimumFractionDigits: 0 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={panelCard}>
                    <div style={sectionLabel}>Summary</div>

                    <div style={{ display: 'grid', gap: '8px' }}>
                      {[
                        {
                          label: 'Collections',
                          heading: collectionRate >= 80 ? 'Strong' : 'Needs attention',
                          sub: `${collectionRate}% of invoiced value collected`,
                          accent: collectionRate >= 80 ? '#10B981' : RED,
                        },
                        {
                          label: 'Outstanding load',
                          heading: totalOutstanding > 0 ? 'Follow-up recommended' : 'Clear',
                          sub: `${outstanding.length} invoice${outstanding.length === 1 ? '' : 's'} still open`,
                          accent: totalOutstanding > 0 ? AMBER : '#10B981',
                        },
                        {
                          label: 'Overdue risk',
                          heading: totalOverdue > 0 ? 'Immediate action suggested' : 'Stable',
                          sub: `$${Math.round(totalOverdue).toLocaleString('en-AU')} overdue now`,
                          accent: totalOverdue > 0 ? RED : '#10B981',
                        },
                      ].map(item => (
                        <div
                          key={item.label}
                          style={{
                            background: '#F9FAFB',
                            border: `1px solid ${BORDER}`,
                            borderRadius: '12px',
                            padding: '14px',
                            borderLeft: `3px solid ${item.accent}`,
                          }}
                        >
                          <div style={{ ...TYPE.label, marginBottom: '6px' }}>{item.label}</div>
                          <div style={{ ...TYPE.title, fontSize: '14px', marginBottom: '4px' }}>{item.heading}</div>
                          <div style={TYPE.bodySm}>{item.sub}</div>
                        </div>
                      ))}
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