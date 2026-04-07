'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const RED = '#B91C1C'
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

function IconRevenue({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v20M17 6.5c0-1.93-2.24-3.5-5-3.5S7 4.57 7 6.5 9.24 10 12 10s5 1.57 5 3.5S14.76 17 12 17s-5-1.57-5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
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

export default function RevenuePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

      const { data } = await supabase
        .from('invoices')
        .select('*, customers(first_name, last_name)')
        .eq('business_id', userData.business_id)
        .order('created_at', { ascending: false })

      setInvoices(data || [])
      setLoading(false)
    }

    load()
  }, [router])

  const paid = invoices.filter(i => i.status === 'paid')
  const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue')
  const overdue = invoices.filter(i => i.status === 'overdue')

  const totalRevenue = paid.reduce((s, i) => s + i.total, 0)
  const totalOutstanding = outstanding.reduce((s, i) => s + (i.total - i.amount_paid), 0)
  const totalOverdue = overdue.reduce((s, i) => s + i.total, 0)
  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0)

  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (5 - i))
    return {
      label: d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }),
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
      .reduce((s, i) => s + i.total, 0)
    return { ...m, total }
  })

  const maxMonthly = Math.max(...monthlyRevenue.map(m => m.total), 1)

  const customerRevenue: Record<string, { name: string; total: number; count: number }> = {}
  paid.forEach(inv => {
    const id = inv.customer_id
    const name = `${inv.customers?.first_name || ''} ${inv.customers?.last_name || ''}`.trim() || 'Unknown'
    if (!customerRevenue[id]) customerRevenue[id] = { name, total: 0, count: 0 }
    customerRevenue[id].total += inv.total
    customerRevenue[id].count++
  })

  const topCustomers = Object.values(customerRevenue).sort((a, b) => b.total - a.total).slice(0, 5)
  const maxCustomer = topCustomers[0]?.total || 1

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

  const iconWrap = (color: string): React.CSSProperties => ({
    width: '34px',
    height: '34px',
    borderRadius: '11px',
    background: '#F8FAFC',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${BORDER}`,
    flexShrink: 0,
  })

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: FONT, background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/revenue" />

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
                      label: 'Total collected',
                      value: `$${totalRevenue.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
                      sub: 'Paid invoices',
                      icon: <IconRevenue size={17} />,
                      accent: '#166534',
                      span: 'span 3',
                    },
                    {
                      label: 'Outstanding',
                      value: `$${totalOutstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
                      sub: 'Awaiting payment',
                      icon: <IconInvoice size={17} />,
                      accent: '#1E3A8A',
                      span: 'span 3',
                    },
                    {
                      label: 'Overdue',
                      value: `$${totalOverdue.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
                      sub: totalOverdue > 0 ? 'Needs follow-up' : 'All up to date',
                      icon: <IconInvoice size={17} />,
                      accent: totalOverdue > 0 ? RED : TEXT,
                      span: 'span 3',
                    },
                    {
                      label: 'Total invoiced',
                      value: `$${totalInvoiced.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
                      sub: 'All invoices',
                      icon: <IconRevenue size={17} />,
                      accent: TEAL_DARK,
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
                        <div style={iconWrap(item.accent)}>
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

              <div>
                <div style={sectionLabel}>{sectionDash}Trends</div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '10px',
                  }}
                >
                  <div style={{ ...shellCard, padding: '14px' }}>
                    <div style={{ ...TYPE.title, fontSize: '14px', marginBottom: '4px' }}>
                      Monthly revenue
                    </div>
                    <div style={{ ...TYPE.bodySm, marginBottom: '10px' }}>
                      Paid revenue over the last 6 months
                    </div>

                    <div style={{ display: 'grid', gap: '10px' }}>
                      {monthlyRevenue.map(m => (
                        <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ ...TYPE.bodySm, width: '72px', textAlign: 'right', flexShrink: 0, fontWeight: 700 }}>
                            {m.label}
                          </div>
                          <div style={{ flex: 1, height: '10px', background: '#F3F4F6', borderRadius: '5px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.round((m.total / maxMonthly) * 100)}%`,
                                height: '100%',
                                background: TEAL,
                                borderRadius: '5px',
                              }}
                            />
                          </div>
                          <div style={{ ...TYPE.titleSm, width: '74px', textAlign: 'right', flexShrink: 0 }}>
                            {m.total > 0 ? `$${m.total.toLocaleString('en-AU', { minimumFractionDigits: 0 })}` : '—'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ ...shellCard, padding: '14px' }}>
                    <div style={{ ...TYPE.title, fontSize: '14px', marginBottom: '4px' }}>
                      Top customers
                    </div>
                    <div style={{ ...TYPE.bodySm, marginBottom: '10px' }}>
                      Highest paid revenue by customer
                    </div>

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
                        {topCustomers.map(c => (
                          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ ...TYPE.bodySm, width: '100px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700 }}>
                              {c.name}
                            </div>
                            <div style={{ flex: 1, height: '10px', background: '#F3F4F6', borderRadius: '5px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${Math.round((c.total / maxCustomer) * 100)}%`,
                                  height: '100%',
                                  background: TEAL,
                                  borderRadius: '5px',
                                }}
                              />
                            </div>
                            <div style={{ ...TYPE.titleSm, width: '74px', textAlign: 'right', flexShrink: 0 }}>
                              ${c.total.toLocaleString('en-AU', { minimumFractionDigits: 0 })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div style={sectionLabel}>{sectionDash}Breakdown</div>
                <div style={{ ...shellCard, padding: '14px' }}>
                  <div style={{ ...TYPE.title, fontSize: '14px', marginBottom: '4px' }}>
                    Invoice breakdown
                  </div>
                  <div style={{ ...TYPE.bodySm, marginBottom: '10px' }}>
                    Revenue by invoice status
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    {[
                      { label: 'Paid invoices', value: paid.length, amount: totalRevenue, color: '#166534', bg: '#DCFCE7' },
                      { label: 'Sent / awaiting payment', value: outstanding.filter(i => i.status === 'sent').length, amount: outstanding.filter(i => i.status === 'sent').reduce((s: number, i: any) => s + i.total, 0), color: '#1E3A8A', bg: '#DBEAFE' },
                      { label: 'Overdue', value: overdue.length, amount: totalOverdue, color: '#7F1D1D', bg: '#FEE2E2' },
                      { label: 'Draft', value: invoices.filter(i => i.status === 'draft').length, amount: invoices.filter(i => i.status === 'draft').reduce((s: number, i: any) => s + i.total, 0), color: TEXT3, bg: '#F1F5F9' },
                    ].map(row => (
                      <div
                        key={row.label}
                        style={{
                          borderRadius: '12px',
                          padding: '12px 14px',
                          background: WHITE,
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
                          ${row.amount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
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