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

function DashboardImageIcon({
  src,
  alt,
  size = 28,
}: {
  src: string
  alt: string
  size?: number
}) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
  )
}

function IconCollected({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_6128eed6331e4d0188d1bd62ed3e4c89~mv2.png"
      alt="Total collected"
      size={size}
    />
  )
}

function IconOutstanding({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_147eeb738a784ca184267c67f66c1c30~mv2.png"
      alt="Outstanding"
      size={size}
    />
  )
}

function IconOverdue({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_85b27ad4a4ff4fe585436aaf59c63b94~mv2.png"
      alt="Overdue"
      size={size}
    />
  )
}

function IconInvoiced({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_9cbf007dda55411888ac59c3123f8657~mv2.png"
      alt="Total invoiced"
      size={size}
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

function IconArrow({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

  const monthlyRevenue = useMemo(
    () =>
      last6.map(m => {
        const total = invoices
          .filter(i => {
            const d = new Date(i.created_at)
            return d.getMonth() === m.month && d.getFullYear() === m.year
          })
          .reduce((sum, i) => sum + Number(i.total || 0), 0)

        return { ...m, total }
      }),
    [last6, invoices]
  )

  const maxMonthly = Math.max(...monthlyRevenue.map(m => m.total), 1)

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

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    overflow: 'hidden',
  }

  const cardP: React.CSSProperties = {
    ...card,
    padding: '18px',
  }

  const statCard: React.CSSProperties = {
    ...card,
    padding: isMobile ? '14px 14px 13px' : '14px 16px 13px',
    minHeight: isMobile ? 112 : 118,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '16px',
    borderRadius: '16px',
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

  const topCards = [
    {
      label: 'Collected',
      value: `$${totalRevenue.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
      sub: `${paid.length} paid invoice${paid.length === 1 ? '' : 's'}`,
      icon: <IconCollected size={28} />,
      accent: '#166534',
      tag: 'Cash received',
    },
    {
      label: 'Outstanding',
      value: `$${totalOutstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
      sub: 'Awaiting payment',
      icon: <IconOutstanding size={28} />,
      accent: '#1E3A8A',
      tag: 'Open balance',
    },
    {
      label: 'Overdue',
      value: `$${totalOverdue.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
      sub: totalOverdue > 0 ? 'Needs follow-up' : 'All up to date',
      icon: <IconOverdue size={28} />,
      accent: totalOverdue > 0 ? RED : TEXT,
      tag: 'Past due',
    },
    {
      label: 'Total invoiced',
      value: `$${totalInvoiced.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
      sub: `${invoices.length} total invoice${invoices.length === 1 ? '' : 's'}`,
      icon: <IconInvoiced size={28} />,
      accent: TEAL_DARK,
      tag: 'Gross billed',
    },
  ]

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
            padding: isMobile ? '14px' : '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
          }}
        >
          <div
            style={{
              ...card,
              padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
              background: HEADER_BG,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>
              {todayStr}
            </div>

            <div
              style={{
                fontSize: isMobile ? '26px' : '34px',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                fontWeight: 900,
                color: WHITE,
                marginBottom: '8px',
              }}
            >
              Revenue
            </div>

            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.72)',
                maxWidth: '760px',
              }}
            >
              Track collected cash, outstanding balances, overdue invoices, and top-paying customers from one control centre.
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
                  height: '36px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: TEAL,
                  color: WHITE,
                  border: 'none',
                  borderRadius: '10px',
                }}
              >
                <IconSpark size={14} />
                View invoices
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            {topCards.map(item => (
              <div key={item.label} style={statCard}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>{item.tag}</div>
                    <div style={{ ...TYPE.title, fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>{item.label}</div>
                  </div>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                </div>

                <div>
                  <div style={{ ...TYPE.valueLg, fontSize: '26px', color: item.accent }}>{item.value}</div>
                  <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>{item.sub}</div>
                </div>
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
                  <div style={sectionHeaderTitle}>Monthly revenue</div>
                  <div style={{ ...TYPE.bodySm }}>
                    Invoiced revenue over the last 6 months with current collections snapshot.
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                    width: isMobile ? '100%' : 'auto',
                  }}
                >
                  <div
                    style={{
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '10px',
                      border: `1px solid ${BORDER}`,
                      background: WHITE,
                      color: TEXT2,
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Collection rate {collectionRate}%
                  </div>
                </div>
              </div>

              <div style={{ padding: '14px 16px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(6, minmax(0, 1fr))',
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

                    {monthlyRevenue.map(m => {
                      const height = Math.max(16, Math.round((m.total / maxMonthly) * (isMobile ? 136 : 166)))

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
                                background: m.total > 0 ? TEAL : '#E2E8F0',
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

              <div style={sideCard}>
                <div style={{ ...TYPE.label, marginBottom: '8px' }}>Quick actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => router.push('/dashboard/invoices')}
                    style={{
                      width: '100%',
                      height: '34px',
                      background: TEAL,
                      color: WHITE,
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: FONT,
                    }}
                  >
                    View invoices
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/customers')}
                    style={{
                      width: '100%',
                      height: '34px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: FONT,
                      color: TEXT2,
                    }}
                  >
                    View customers
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 340px',
              gap: '14px',
              alignItems: 'start',
            }}
          >
            <div style={card}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Invoice breakdown</div>
                <button
                  onClick={() => router.push('/dashboard/invoices')}
                  style={{
                    height: '28px',
                    padding: '0 9px',
                    background: '#F8FAFC',
                    border: `1px solid ${BORDER}`,
                    borderRadius: '7px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: FONT,
                    color: TEXT2,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  View all <IconArrow size={11} />
                </button>
              </div>

              <div style={{ padding: '14px 18px', display: 'grid', gap: '10px' }}>
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
                      .reduce((sum, i) => sum + (Number(i.total || 0) - Number(i.amount_paid || 0)), 0),
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

            <div style={card}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Revenue health</div>
              </div>

              <div style={{ padding: '14px 18px', display: 'grid', gap: '10px' }}>
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
      </div>
    </div>
  )
}