'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const A = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#DEDEDE'
const BG = '#F2F3F3'

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

export default function RevenuePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return
      const { data } = await supabase.from('invoices')
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
    return { label: d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }), month: d.getMonth(), year: d.getFullYear() }
  })

  const monthlyRevenue = last6.map(m => {
    const total = paid.filter(i => {
      const d = new Date(i.paid_at || i.created_at)
      return d.getMonth() === m.month && d.getFullYear() === m.year
    }).reduce((s, i) => s + i.total, 0)
    return { ...m, total }
  })
  const maxMonthly = Math.max(...monthlyRevenue.map(m => m.total), 1)

  const customerRevenue: Record<string, { name: string; total: number; count: number }> = {}
  paid.forEach(inv => {
    const id = inv.customer_id
    const name = `${inv.customers?.first_name} ${inv.customers?.last_name}`
    if (!customerRevenue[id]) customerRevenue[id] = { name, total: 0, count: 0 }
    customerRevenue[id].total += inv.total
    customerRevenue[id].count++
  })
  const topCustomers = Object.values(customerRevenue).sort((a, b) => b.total - a.total).slice(0, 5)
  const maxCustomer = topCustomers[0]?.total || 1

  const pad = isMobile ? '16px' : '30px'

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/revenue" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        <div style={{ height: '58px', background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: `0 ${pad}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '17px', fontWeight: '600', color: TEXT }}>Revenue</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: `${isMobile ? '16px' : '24px'} ${pad}`, paddingBottom: isMobile ? '90px' : '24px' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3 }}>Loading…</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Total collected', value: `$${totalRevenue.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, color: '#064E3B', topBar: '#10B981' },
                  { label: 'Outstanding', value: `$${totalOutstanding.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, color: '#1E3A8A', topBar: '#3B82F6' },
                  { label: 'Overdue', value: `$${totalOverdue.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, color: totalOverdue > 0 ? '#7F1D1D' : TEXT, topBar: totalOverdue > 0 ? '#EF4444' : BORDER },
                  { label: 'Total invoiced', value: `$${totalInvoiced.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, color: TEXT, topBar: A },
                ].map(s => (
                  <div key={s.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ height: '3px', background: s.topBar }} />
                    <div style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '12px', color: TEXT3, marginBottom: '6px' }}>{s.label}</div>
                      <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '600', color: s.color, lineHeight: 1 }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px 22px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '20px' }}>Monthly revenue</div>
                  {monthlyRevenue.map(m => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: TEXT3, width: '72px', textAlign: 'right', flexShrink: 0 }}>{m.label}</div>
                      <div style={{ flex: 1, height: '10px', background: BG, borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((m.total / maxMonthly) * 100)}%`, height: '100%', background: A, borderRadius: '5px' }}/>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, width: '70px', textAlign: 'right', flexShrink: 0 }}>
                        {m.total > 0 ? `$${m.total.toLocaleString('en-AU', { minimumFractionDigits: 0 })}` : '—'}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px 22px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '20px' }}>Top customers</div>
                  {topCustomers.length === 0 ? (
                    <div style={{ fontSize: '13px', color: TEXT3 }}>No paid invoices yet.</div>
                  ) : topCustomers.map(c => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: TEXT3, width: '100px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                      <div style={{ flex: 1, height: '10px', background: BG, borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((c.total / maxCustomer) * 100)}%`, height: '100%', background: A, borderRadius: '5px' }}/>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, width: '70px', textAlign: 'right', flexShrink: 0 }}>
                        ${c.total.toLocaleString('en-AU', { minimumFractionDigits: 0 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px 22px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '16px' }}>Invoice breakdown</div>
                {[
                  { label: 'Paid invoices', value: paid.length, amount: totalRevenue, color: '#064E3B', bg: '#D1FAE5' },
                  { label: 'Sent / awaiting payment', value: outstanding.filter(i => i.status === 'sent').length, amount: outstanding.filter(i => i.status === 'sent').reduce((s: number, i: any) => s + i.total, 0), color: '#1E3A8A', bg: '#DBEAFE' },
                  { label: 'Overdue', value: overdue.length, amount: totalOverdue, color: '#7F1D1D', bg: '#FEE2E2' },
                  { label: 'Draft', value: invoices.filter(i => i.status === 'draft').length, amount: invoices.filter(i => i.status === 'draft').reduce((s: number, i: any) => s + i.total, 0), color: '#555', bg: '#F0F0F0' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F0F0F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: row.bg, color: row.color, padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{row.value}</span>
                      <span style={{ fontSize: '13px', color: TEXT2 }}>{row.label}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: row.color }}>${row.amount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}