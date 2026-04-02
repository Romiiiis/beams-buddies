'use client'

import React, { useEffect, useState } from 'react'
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

export default function RevenuePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [invoices, setInvoices] = useState<any[]>([])
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

      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
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

  const topCustomers = Object.values(customerRevenue)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  const maxCustomer = topCustomers[0]?.total || 1

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

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
      <Sidebar active="/dashboard/revenue" />

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
              Revenue
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/dashboard/invoices')}
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
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '10px' }}>
                {[
                  {
                    label: 'Total collected',
                    value: `$${totalRevenue.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
                    sub: 'paid invoices',
                    accent: '#10B981',
                    valColor: '#064E3B',
                  },
                  {
                    label: 'Outstanding',
                    value: `$${totalOutstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
                    sub: 'awaiting payment',
                    accent: '#3B82F6',
                    valColor: '#1E3A8A',
                  },
                  {
                    label: 'Overdue',
                    value: `$${totalOverdue.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
                    sub: totalOverdue > 0 ? 'needs follow-up' : 'all up to date',
                    accent: totalOverdue > 0 ? '#EF4444' : TEAL,
                    valColor: totalOverdue > 0 ? '#7F1D1D' : TEXT,
                  },
                  {
                    label: 'Total invoiced',
                    value: `$${totalInvoiced.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
                    sub: 'all invoices',
                    accent: TEAL,
                    valColor: TEXT,
                  },
                ].map(s => (
                  <div key={s.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ height: '3px', background: s.accent }} />
                    <div style={{ padding: isMobile ? '14px' : '16px 20px 18px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: TEXT3, marginBottom: '8px' }}>{s.label}</div>
                      <div
                        style={{
                          fontSize: isMobile ? '24px' : '30px',
                          fontWeight: '700',
                          color: s.valColor,
                          lineHeight: 1,
                          marginBottom: '4px',
                          letterSpacing: '-0.5px',
                        }}
                      >
                        {s.value}
                      </div>
                      <div style={{ fontSize: '11px', color: TEXT3 }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Monthly revenue</div>
                    <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Paid revenue over the last 6 months</div>
                  </div>

                  <div style={{ padding: '18px 22px' }}>
                    {monthlyRevenue.map(m => (
                      <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: TEXT3, width: '72px', textAlign: 'right', flexShrink: 0 }}>{m.label}</div>
                        <div style={{ flex: 1, height: '10px', background: BG, borderRadius: '5px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.round((m.total / maxMonthly) * 100)}%`,
                              height: '100%',
                              background: TEAL,
                              borderRadius: '5px',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, width: '70px', textAlign: 'right', flexShrink: 0 }}>
                          {m.total > 0 ? `$${m.total.toLocaleString('en-AU', { minimumFractionDigits: 0 })}` : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Top customers</div>
                    <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Highest paid revenue by customer</div>
                  </div>

                  <div style={{ padding: '18px 22px' }}>
                    {topCustomers.length === 0 ? (
                      <div style={{ fontSize: '13px', color: TEXT3 }}>No paid invoices yet.</div>
                    ) : (
                      topCustomers.map(c => (
                        <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <div
                            style={{
                              fontSize: '12px',
                              color: TEXT3,
                              width: '100px',
                              flexShrink: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {c.name}
                          </div>
                          <div style={{ flex: 1, height: '10px', background: BG, borderRadius: '5px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.round((c.total / maxCustomer) * 100)}%`,
                                height: '100%',
                                background: TEAL,
                                borderRadius: '5px',
                              }}
                            />
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, width: '70px', textAlign: 'right', flexShrink: 0 }}>
                            ${c.total.toLocaleString('en-AU', { minimumFractionDigits: 0 })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>Invoice breakdown</div>
                  <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Revenue by invoice status</div>
                </div>

                <div style={{ padding: '2px 22px 10px' }}>
                  {[
                    {
                      label: 'Paid invoices',
                      value: paid.length,
                      amount: totalRevenue,
                      color: '#064E3B',
                      bg: '#D1FAE5',
                    },
                    {
                      label: 'Sent / awaiting payment',
                      value: outstanding.filter(i => i.status === 'sent').length,
                      amount: outstanding.filter(i => i.status === 'sent').reduce((s: number, i: any) => s + i.total, 0),
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
                      value: invoices.filter(i => i.status === 'draft').length,
                      amount: invoices.filter(i => i.status === 'draft').reduce((s: number, i: any) => s + i.total, 0),
                      color: '#555',
                      bg: '#F0F0F0',
                    },
                  ].map(row => (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: `1px solid ${BORDER}`,
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <span
                          style={{
                            background: row.bg,
                            color: row.color,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            flexShrink: 0,
                          }}
                        >
                          {row.value}
                        </span>
                        <span style={{ fontSize: '13px', color: TEXT2 }}>{row.label}</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: row.color, flexShrink: 0 }}>
                        ${row.amount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                      </span>
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