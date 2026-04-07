'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#2AA198'
const TEAL_DARK = '#1E8C84'
const TEAL_LIGHT = '#E6F5F4'
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

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  draft:     { bg: '#F3F4F6', color: '#6B7280', label: 'Draft' },
  sent:      { bg: '#DBEAFE', color: '#1E3A8A', label: 'Sent' },
  paid:      { bg: '#D1FAE5', color: '#064E3B', label: 'Paid' },
  overdue:   { bg: '#FEE2E2', color: '#7F1D1D', label: 'Overdue' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280', label: 'Cancelled' },
}

type LineItem = { description: string; qty: number; unit_price: number }
type Invoice = {
  id: string
  invoice_number: string
  status: string
  total: number
  subtotal: number
  tax_rate: number
  tax_amount: number
  amount_paid: number
  notes: string
  due_date: string
  paid_at: string
  created_at: string
  line_items: LineItem[]
  customers: { first_name: string; last_name: string; suburb: string; phone: string; email: string; address?: string }
}

export default function InvoicesPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
  const [saving, setSaving] = useState(false)
  const [businessId, setBusinessId] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [businessSettings, setBusinessSettings] = useState<any>(null)
  const [businessInfo, setBusinessInfo] = useState<any>(null)

  const [form, setForm] = useState({
    customer_id: '',
    due_date: '',
    notes: '',
    tax_rate: '10',
    line_items: [{ description: '', qty: 1, unit_price: 0 }] as LineItem[],
  })

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return
      setBusinessId(userData.business_id)
      const [invoicesRes, customersRes, settingsRes, businessRes] = await Promise.all([
        supabase.from('invoices').select('*, customers(first_name, last_name, suburb, phone, email, address)').eq('business_id', userData.business_id).order('created_at', { ascending: false }),
        supabase.from('customers').select('id, first_name, last_name, suburb').eq('business_id', userData.business_id).order('first_name'),
        supabase.from('business_settings').select('*').eq('business_id', userData.business_id).single(),
        supabase.from('businesses').select('*').eq('id', userData.business_id).single(),
      ])
      setInvoices(invoicesRes.data || [])
      setCustomers(customersRes.data || [])
      setBusinessSettings(settingsRes.data)
      setBusinessInfo(businessRes.data)
      setLoading(false)
    }
    load()
  }, [router])

  function calcTotals(items: LineItem[], taxRate: number) {
    const subtotal = items.reduce((s, i) => s + (i.qty * i.unit_price), 0)
    const tax_amount = subtotal * (taxRate / 100)
    return { subtotal, tax_amount, total: subtotal + tax_amount }
  }

  function setLine(idx: number, field: keyof LineItem, value: any) {
    const items = [...form.line_items]
    items[idx] = { ...items[idx], [field]: field === 'description' ? value : parseFloat(value) || 0 }
    setForm(f => ({ ...f, line_items: items }))
  }

  function addLine() {
    setForm(f => ({ ...f, line_items: [...f.line_items, { description: '', qty: 1, unit_price: 0 }] }))
  }

  function removeLine(idx: number) {
    setForm(f => ({ ...f, line_items: f.line_items.filter((_, i) => i !== idx) }))
  }

  async function handleSave() {
    if (!form.customer_id) return
    setSaving(true)
    const taxRate = parseFloat(form.tax_rate) || 10
    const { subtotal, tax_amount, total } = calcTotals(form.line_items, taxRate)
    const invoice_number = `INV-${String(invoices.length + 1).padStart(4, '0')}`
    const { data } = await supabase.from('invoices').insert({
      business_id: businessId,
      customer_id: form.customer_id,
      invoice_number,
      status: 'draft',
      line_items: form.line_items,
      subtotal,
      tax_rate: taxRate,
      tax_amount,
      total,
      amount_paid: 0,
      notes: form.notes,
      due_date: form.due_date || null,
    }).select('*, customers(first_name, last_name, suburb, phone, email, address)').single()
    if (data) setInvoices(prev => [data, ...prev])
    setShowForm(false)
    setForm({ customer_id: '', due_date: '', notes: '', tax_rate: '10', line_items: [{ description: '', qty: 1, unit_price: 0 }] })
    setSaving(false)
  }

  async function updateStatus(id: string, status: string) {
    const update: any = { status }
    if (status === 'paid') update.paid_at = new Date().toISOString()
    await supabase.from('invoices').update(update).eq('id', id)
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...update } : inv))
    if (viewingInvoice?.id === id) setViewingInvoice(prev => prev ? { ...prev, ...update } : prev)
  }

  const filtered = filterStatus === 'all' ? invoices : invoices.filter(inv => inv.status === filterStatus)
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const totalOutstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (i.total - i.amount_paid), 0)
  const totalOverdue = invoices.filter(i => i.status === 'overdue').length

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const inp: React.CSSProperties = {
    width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px',
    border: `1px solid ${BORDER}`, background: WHITE, color: TEXT,
    fontFamily: 'inherit', fontSize: '14px', outline: 'none',
  }
  const lbl: React.CSSProperties = { fontSize: '12px', color: TEXT3, marginBottom: '4px', display: 'block', fontWeight: '500' }
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
      <Sidebar active="/dashboard/invoices" />
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
            <div style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', color: WHITE, letterSpacing: '-0.8px', lineHeight: 1 }}>Invoices</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/dashboard/revenue')}
              style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.12)', color: WHITE, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
              View revenue
            </button>
            <button onClick={() => setShowForm(true)}
              style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: 'none', background: WHITE, color: TEAL_DARK, fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke={TEAL_DARK} strokeWidth="2" strokeLinecap="round"/></svg>
              New invoice
            </button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: `28px ${pad}`, paddingBottom: isMobile ? '90px' : '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* STATS */}
          <div>
            <div style={sectionLabel}>Overview</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '12px' }}>
              {[
                { label: 'Total invoices', value: String(invoices.length), sub: 'all records', accent: TEAL, valColor: TEXT },
                { label: 'Revenue collected', value: `$${totalRevenue.toFixed(0)}`, sub: 'paid invoices', accent: '#10B981', valColor: '#064E3B' },
                { label: 'Outstanding', value: `$${totalOutstanding.toFixed(0)}`, sub: 'awaiting payment', accent: '#3B82F6', valColor: '#1E3A8A' },
                { label: 'Overdue', value: String(totalOverdue), sub: totalOverdue > 0 ? 'need follow-up' : 'all up to date', accent: totalOverdue > 0 ? '#EF4444' : TEAL, valColor: totalOverdue > 0 ? '#B91C1C' : TEXT },
              ].map(s => (
                <div key={s.label} style={card}>
                  <div style={{ height: '3px', background: s.accent }} />
                  <div style={{ padding: isMobile ? '14px' : '18px 20px 20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>{s.label}</div>
                    <div style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', color: s.valColor, lineHeight: 1, marginBottom: '6px', letterSpacing: '-0.8px' }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: TEXT3, fontWeight: '500' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FILTER TABS */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{
                  height: '34px', padding: '0 14px', borderRadius: '20px',
                  border: `1px solid ${filterStatus === s ? TEAL_DARK : BORDER}`,
                  background: filterStatus === s ? TEAL : WHITE,
                  color: filterStatus === s ? WHITE : TEXT2,
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  fontWeight: filterStatus === s ? '700' : '500',
                  boxShadow: filterStatus === s ? '0 2px 8px rgba(42,161,152,0.25)' : 'none',
                }}>
                {s === 'all' ? `All (${invoices.length})` : STATUS_STYLES[s]?.label}
              </button>
            ))}
          </div>

          {/* INVOICE LIST */}
          <div style={card}>
            <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Records</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>Invoice list</div>
              </div>
              <span style={{ fontSize: '13px', color: TEXT3, fontWeight: '600' }}>{filtered.length} shown</span>
            </div>

            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
                No invoices yet. <span style={{ color: TEAL, cursor: 'pointer', fontWeight: '600' }} onClick={() => setShowForm(true)}>Create your first →</span>
              </div>
            ) : isMobile ? (
              <div>
                {filtered.map(inv => {
                  const st = STATUS_STYLES[inv.status] || STATUS_STYLES.draft
                  const isOverdue = inv.status === 'sent' && inv.due_date && new Date(inv.due_date) < new Date()
                  return (
                    <div key={inv.id} style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }}
                      onClick={() => setViewingInvoice(inv)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: TEXT, fontFamily: 'monospace' }}>{inv.invoice_number}</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginTop: '2px' }}>{inv.customers?.first_name} {inv.customers?.last_name}</div>
                          <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{inv.customers?.suburb || '—'}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: TEXT, lineHeight: 1.1 }}>${inv.total.toFixed(2)}</div>
                          <span style={{ display: 'inline-block', marginTop: '6px', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: st.bg, color: st.color }}>{st.label}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: isOverdue ? '#B91C1C' : TEXT3, fontWeight: isOverdue ? '700' : '500' }}>
                        Due {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Invoice #', 'Customer', 'Amount', 'Due date', 'Status', 'Created', ''].map(h => (
                      <th key={h} style={{ padding: '11px 22px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: TEXT3, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => {
                    const st = STATUS_STYLES[inv.status] || STATUS_STYLES.draft
                    const isOverdue = inv.status === 'sent' && inv.due_date && new Date(inv.due_date) < new Date()
                    return (
                      <tr key={inv.id} style={{ cursor: 'pointer', borderBottom: `1px solid ${BORDER}` }}
                        onClick={() => setViewingInvoice(inv)}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '14px 22px', fontWeight: '700', fontSize: '13px', color: TEXT, fontFamily: 'monospace' }}>{inv.invoice_number}</td>
                        <td style={{ padding: '14px 22px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>{inv.customers?.first_name} {inv.customers?.last_name}</div>
                          <div style={{ fontSize: '12px', color: TEXT3, marginTop: '1px' }}>{inv.customers?.suburb || '—'}</div>
                        </td>
                        <td style={{ padding: '14px 22px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: TEXT }}>${inv.total.toFixed(2)}</div>
                          {inv.amount_paid > 0 && inv.amount_paid < inv.total && (
                            <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px' }}>${(inv.total - inv.amount_paid).toFixed(2)} remaining</div>
                          )}
                        </td>
                        <td style={{ padding: '14px 22px', fontSize: '13px', color: isOverdue ? '#B91C1C' : TEXT2, fontWeight: isOverdue ? '700' : '500' }}>
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '14px 22px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: st.bg, color: st.color }}>{st.label}</span>
                        </td>
                        <td style={{ padding: '14px 22px', fontSize: '12px', color: TEXT3, fontWeight: '500' }}>
                          {new Date(inv.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                        </td>
                        <td style={{ padding: '14px 22px' }}>
                          <span style={{ fontSize: '13px', color: TEAL, fontWeight: '600' }}>View →</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: WHITE, borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflow: 'auto', border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Create</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>New invoice</div>
                <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Create a draft invoice and save it to your records.</div>
              </div>
              <button onClick={() => setShowForm(false)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '8px', width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer', color: TEXT3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ×
              </button>
            </div>
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={lbl}>Customer *</label>
                <select style={inp} value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
                  <option value="">Select customer…</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}{c.suburb ? ` — ${c.suburb}` : ''}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Due date</label>
                  <input type="date" style={inp} value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}/>
                </div>
                <div>
                  <label style={lbl}>GST rate (%)</label>
                  <input type="number" style={inp} value={form.tax_rate} onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))} placeholder="10"/>
                </div>
              </div>
              <div>
                <label style={lbl}>Line items</label>
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 32px', background: '#F9FAFB', padding: '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
                    {['Description', 'Qty', 'Unit $', ''].map(h => (
                      <div key={h} style={{ fontSize: '11px', fontWeight: '700', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</div>
                    ))}
                  </div>
                  {form.line_items.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 32px', padding: '8px 12px', borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}`, alignItems: 'center' }}>
                      <input style={{ ...inp, height: '32px', border: 'none', background: 'transparent', padding: '0 8px' }} value={item.description} onChange={e => setLine(idx, 'description', e.target.value)} placeholder="e.g. Split system installation"/>
                      <input type="number" style={{ ...inp, height: '32px', border: 'none', background: 'transparent', padding: '0 8px' }} value={item.qty} onChange={e => setLine(idx, 'qty', e.target.value)} min="1"/>
                      <input type="number" style={{ ...inp, height: '32px', border: 'none', background: 'transparent', padding: '0 8px' }} value={item.unit_price} onChange={e => setLine(idx, 'unit_price', e.target.value)} placeholder="0.00"/>
                      <button onClick={() => removeLine(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C', fontSize: '18px', lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                  <div style={{ padding: '10px 12px', borderTop: `1px solid ${BORDER}`, background: WHITE }}>
                    <button onClick={addLine} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEAL, fontSize: '13px', fontFamily: 'inherit', fontWeight: '600' }}>+ Add line</button>
                  </div>
                </div>
              </div>
              {(() => {
                const taxRate = parseFloat(form.tax_rate) || 10
                const { subtotal, tax_amount, total } = calcTotals(form.line_items, taxRate)
                return (
                  <div style={{ background: '#F9FAFB', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '16px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: TEXT3, fontWeight: '500' }}>Subtotal</span>
                      <span style={{ fontSize: '13px', color: TEXT, fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', color: TEXT3, fontWeight: '500' }}>GST ({taxRate}%)</span>
                      <span style={{ fontSize: '13px', color: TEXT, fontWeight: '600' }}>${tax_amount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${BORDER}`, paddingTop: '10px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: TEXT }}>Total</span>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: TEXT }}>${total.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })()}
              <div>
                <label style={lbl}>Notes</label>
                <textarea style={{ ...inp, height: '76px', padding: '10px', resize: 'none' as const }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Payment terms, bank details, etc."/>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowForm(false)}
                  style={{ flex: 1, height: '42px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || !form.customer_id}
                  style={{ flex: 2, height: '42px', borderRadius: '8px', border: 'none', background: TEAL, color: WHITE, fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: !form.customer_id ? 0.5 : 1 }}>
                  {saving ? 'Saving…' : 'Create invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW INVOICE MODAL */}
      {viewingInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: WHITE, borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '92vh', overflow: 'auto', border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

            {/* Modal header */}
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: TEXT, fontFamily: 'monospace' }}>{viewingInvoice.invoice_number}</div>
                <select value={viewingInvoice.status} onChange={e => updateStatus(viewingInvoice.id, e.target.value)}
                  style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: 'none', background: STATUS_STYLES[viewingInvoice.status]?.bg, color: STATUS_STYLES[viewingInvoice.status]?.color, cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
                  {Object.entries(STATUS_STYLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => window.print()}
                  style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Print
                </button>
                <button onClick={() => setViewingInvoice(null)}
                  style={{ background: '#F3F4F6', border: 'none', borderRadius: '8px', width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer', color: TEXT3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ×
                </button>
              </div>
            </div>

            {/* Invoice document */}
            <div style={{ padding: '32px 36px' }} id="invoice-print">

              {/* Business + invoice header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  {businessInfo?.logo_url && (
                    <img src={businessInfo.logo_url} alt="Logo" style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'contain', marginBottom: '10px', border: `1px solid ${BORDER}` }}/>
                  )}
                  <div style={{ fontSize: '18px', fontWeight: '800', color: TEXT, letterSpacing: '-0.4px' }}>{businessInfo?.name || 'Your Business'}</div>
                  {businessInfo?.phone && <div style={{ fontSize: '13px', color: TEXT3, marginTop: '3px' }}>{businessInfo.phone}</div>}
                  {businessInfo?.email && <div style={{ fontSize: '13px', color: TEXT3, marginTop: '2px' }}>{businessInfo.email}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: TEAL, letterSpacing: '-0.6px', marginBottom: '6px' }}>INVOICE</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: TEXT, fontFamily: 'monospace' }}>{viewingInvoice.invoice_number}</div>
                  <div style={{ fontSize: '12px', color: TEXT3, marginTop: '4px' }}>
                    Issued: {new Date(viewingInvoice.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  {viewingInvoice.due_date && (
                    <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>
                      Due: {new Date(viewingInvoice.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>

              {/* Bill to */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Bill to</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: TEXT }}>{viewingInvoice.customers?.first_name} {viewingInvoice.customers?.last_name}</div>
                {viewingInvoice.customers?.address && <div style={{ fontSize: '13px', color: TEXT2, marginTop: '2px' }}>{viewingInvoice.customers.address}</div>}
                {viewingInvoice.customers?.suburb && <div style={{ fontSize: '13px', color: TEXT2, marginTop: '1px' }}>{viewingInvoice.customers.suburb}</div>}
                {viewingInvoice.customers?.phone && <div style={{ fontSize: '13px', color: TEXT3, marginTop: '3px' }}>{viewingInvoice.customers.phone}</div>}
                {viewingInvoice.customers?.email && <div style={{ fontSize: '13px', color: TEXT3, marginTop: '1px' }}>{viewingInvoice.customers.email}</div>}
              </div>

              {/* Line items */}
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px', background: '#F9FAFB', padding: '10px 16px', borderBottom: `1px solid ${BORDER}` }}>
                  {['Description', 'Qty', 'Unit price', 'Total'].map(h => (
                    <div key={h} style={{ fontSize: '11px', fontWeight: '700', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: h !== 'Description' ? 'right' : 'left' }}>{h}</div>
                  ))}
                </div>
                {viewingInvoice.line_items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px', padding: '12px 16px', borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}`, alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', color: TEXT, fontWeight: '500' }}>{item.description}</div>
                    <div style={{ fontSize: '13px', color: TEXT2, textAlign: 'right' }}>{item.qty}</div>
                    <div style={{ fontSize: '13px', color: TEXT2, textAlign: 'right' }}>${item.unit_price.toFixed(2)}</div>
                    <div style={{ fontSize: '13px', color: TEXT, fontWeight: '600', textAlign: 'right' }}>${(item.qty * item.unit_price).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
                <div style={{ width: '260px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ fontSize: '13px', color: TEXT3 }}>Subtotal</span>
                    <span style={{ fontSize: '13px', color: TEXT, fontWeight: '600' }}>${viewingInvoice.subtotal?.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${BORDER}`, marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: TEXT3 }}>GST ({viewingInvoice.tax_rate}%)</span>
                    <span style={{ fontSize: '13px', color: TEXT, fontWeight: '600' }}>${viewingInvoice.tax_amount?.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', background: TEAL, borderRadius: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: WHITE }}>Total</span>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: WHITE }}>${viewingInvoice.total?.toFixed(2)}</span>
                  </div>
                  {viewingInvoice.status === 'paid' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', marginTop: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#064E3B', fontWeight: '600' }}>✓ Paid</span>
                      {viewingInvoice.paid_at && <span style={{ fontSize: '12px', color: TEXT3 }}>{new Date(viewingInvoice.paid_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Bank details */}
              {(businessSettings?.bank_name || businessSettings?.bsb || businessSettings?.account_number) && (
                <div style={{ background: '#F9FAFB', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px 20px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>Payment details</div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
                    {businessSettings.bank_name && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: TEXT3, fontWeight: '500', width: '100px', flexShrink: 0 }}>Bank</span>
                        <span style={{ fontSize: '13px', color: TEXT, fontWeight: '600' }}>{businessSettings.bank_name}</span>
                      </div>
                    )}
                    {businessSettings.account_name && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: TEXT3, fontWeight: '500', width: '100px', flexShrink: 0 }}>Account name</span>
                        <span style={{ fontSize: '13px', color: TEXT, fontWeight: '600' }}>{businessSettings.account_name}</span>
                      </div>
                    )}
                    {businessSettings.bsb && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: TEXT3, fontWeight: '500', width: '100px', flexShrink: 0 }}>BSB</span>
                        <span style={{ fontSize: '13px', color: TEXT, fontWeight: '600', fontFamily: 'monospace' }}>{businessSettings.bsb}</span>
                      </div>
                    )}
                    {businessSettings.account_number && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: TEXT3, fontWeight: '500', width: '100px', flexShrink: 0 }}>Account no.</span>
                        <span style={{ fontSize: '13px', color: TEXT, fontWeight: '600', fontFamily: 'monospace' }}>{businessSettings.account_number}</span>
                      </div>
                    )}
                    {businessSettings.payment_terms && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: TEXT3, fontWeight: '500', width: '100px', flexShrink: 0 }}>Terms</span>
                        <span style={{ fontSize: '13px', color: TEXT, fontWeight: '600' }}>Due within {businessSettings.payment_terms} days</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {(viewingInvoice.notes || businessSettings?.invoice_notes) && (
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '18px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Notes</div>
                  {viewingInvoice.notes && <div style={{ fontSize: '13px', color: TEXT2, lineHeight: 1.6, marginBottom: '6px' }}>{viewingInvoice.notes}</div>}
                  {businessSettings?.invoice_notes && <div style={{ fontSize: '13px', color: TEXT3, lineHeight: 1.6 }}>{businessSettings.invoice_notes}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}