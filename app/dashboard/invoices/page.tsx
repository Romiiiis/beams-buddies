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

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  draft:     { bg: '#F0F0F0', color: '#555', label: 'Draft' },
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
  customers: { first_name: string; last_name: string; suburb: string; phone: string; email: string }
}

export default function InvoicesPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [businessId, setBusinessId] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

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
      const [invoicesRes, customersRes] = await Promise.all([
        supabase.from('invoices').select('*, customers(first_name, last_name, suburb, phone, email)').eq('business_id', userData.business_id).order('created_at', { ascending: false }),
        supabase.from('customers').select('id, first_name, last_name, suburb').eq('business_id', userData.business_id).order('first_name'),
      ])
      setInvoices(invoicesRes.data || [])
      setCustomers(customersRes.data || [])
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

  function addLine() { setForm(f => ({ ...f, line_items: [...f.line_items, { description: '', qty: 1, unit_price: 0 }] })) }
  function removeLine(idx: number) { setForm(f => ({ ...f, line_items: f.line_items.filter((_, i) => i !== idx) })) }

  async function handleSave() {
    if (!form.customer_id) return
    setSaving(true)
    const taxRate = parseFloat(form.tax_rate) || 10
    const { subtotal, tax_amount, total } = calcTotals(form.line_items, taxRate)
    const invoice_number = `INV-${String(invoices.length + 1).padStart(4, '0')}`
    const { data } = await supabase.from('invoices').insert({
      business_id: businessId, customer_id: form.customer_id,
      invoice_number, status: 'draft', line_items: form.line_items,
      subtotal, tax_rate: taxRate, tax_amount, total, amount_paid: 0,
      notes: form.notes, due_date: form.due_date || null,
    }).select('*, customers(first_name, last_name, suburb, phone, email)').single()
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
  }

  const filtered = filterStatus === 'all' ? invoices : invoices.filter(inv => inv.status === filterStatus)
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const totalOutstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (i.total - i.amount_paid), 0)
  const totalOverdue = invoices.filter(i => i.status === 'overdue').length

  const inp: React.CSSProperties = { width: '100%', height: '38px', padding: '0 10px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT, fontFamily: 'inherit', fontSize: '13px', outline: 'none' }
  const lbl: React.CSSProperties = { fontSize: '12px', color: TEXT3, marginBottom: '4px', display: 'block' }
  const pad = isMobile ? '16px' : '30px'

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/invoices" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        <div style={{ height: '58px', background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: `0 ${pad}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '17px', fontWeight: '600', color: TEXT }}>Invoices</div>
          <button onClick={() => setShowForm(true)}
            style={{ height: '36px', padding: '0 18px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
            New invoice
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: `${isMobile ? '16px' : '24px'} ${pad}`, paddingBottom: isMobile ? '90px' : '24px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0,1fr))', gap: '10px', marginBottom: '20px' }}>
            {[
              { label: 'Total invoices', value: String(invoices.length), color: TEXT },
              { label: 'Revenue collected', value: `$${totalRevenue.toFixed(0)}`, color: '#064E3B' },
              { label: 'Outstanding', value: `$${totalOutstanding.toFixed(0)}`, color: '#1E3A8A' },
              { label: 'Overdue', value: String(totalOverdue), color: totalOverdue > 0 ? '#7F1D1D' : TEXT },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ fontSize: '12px', color: TEXT3, marginBottom: '6px' }}>{s.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
            {['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{ height: '32px', padding: '0 14px', borderRadius: '20px', border: `1px solid ${filterStatus === s ? A : BORDER}`, background: filterStatus === s ? A : '#fff', color: filterStatus === s ? '#fff' : TEXT2, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: filterStatus === s ? '600' : '400' }}>
                {s === 'all' ? `All (${invoices.length})` : STATUS_STYLES[s]?.label}
              </button>
            ))}
          </div>

          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: TEXT3 }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: TEXT3 }}>
                No invoices yet. <span style={{ color: A, cursor: 'pointer' }} onClick={() => setShowForm(true)}>Create your first →</span>
              </div>
            ) : isMobile ? (
              <div>
                {filtered.map(inv => {
                  const st = STATUS_STYLES[inv.status] || STATUS_STYLES.draft
                  const isOverdue = inv.status === 'sent' && inv.due_date && new Date(inv.due_date) < new Date()
                  return (
                    <div key={inv.id} style={{ padding: '14px 16px', borderBottom: '1px solid #F0F0F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, fontFamily: 'monospace' }}>{inv.invoice_number}</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT, marginTop: '2px' }}>{inv.customers?.first_name} {inv.customers?.last_name}</div>
                          <div style={{ fontSize: '12px', color: TEXT3 }}>{inv.customers?.suburb || '—'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: TEXT }}>${inv.total.toFixed(2)}</div>
                          <select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value)}
                            style={{ marginTop: '4px', padding: '2px 7px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', border: 'none', background: st.bg, color: st.color, cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
                            {Object.entries(STATUS_STYLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                        </div>
                      </div>
                      {inv.due_date && (
                        <div style={{ fontSize: '11px', color: isOverdue ? '#B91C1C' : TEXT3, fontWeight: isOverdue ? '600' : '400' }}>
                          Due {new Date(inv.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8F8F8' }}>
                    {['Invoice #', 'Customer', 'Amount', 'Due date', 'Status', 'Created'].map(h => (
                      <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: TEXT3, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => {
                    const st = STATUS_STYLES[inv.status] || STATUS_STYLES.draft
                    const isOverdue = inv.status === 'sent' && inv.due_date && new Date(inv.due_date) < new Date()
                    return (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #F0F0F0' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '13px 20px', fontWeight: '600', fontSize: '13px', color: TEXT, fontFamily: 'monospace' }}>{inv.invoice_number}</td>
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT }}>{inv.customers?.first_name} {inv.customers?.last_name}</div>
                          <div style={{ fontSize: '12px', color: TEXT3 }}>{inv.customers?.suburb || '—'}</div>
                        </td>
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>${inv.total.toFixed(2)}</div>
                          {inv.amount_paid > 0 && inv.amount_paid < inv.total && (
                            <div style={{ fontSize: '11px', color: TEXT3 }}>${(inv.total - inv.amount_paid).toFixed(2)} remaining</div>
                          )}
                        </td>
                        <td style={{ padding: '13px 20px', fontSize: '13px', color: isOverdue ? '#B91C1C' : TEXT2, fontWeight: isOverdue ? '600' : '400' }}>
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '13px 20px' }}>
                          <select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value)}
                            style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: 'none', background: st.bg, color: st.color, cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
                            {Object.entries(STATUS_STYLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '13px 20px', fontSize: '12px', color: TEXT3 }}>{new Date(inv.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: TEXT }}>New invoice</div>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: TEXT3, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={lbl}>Customer *</label>
                <select style={inp} value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
                  <option value="">Select customer…</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}{c.suburb ? ` — ${c.suburb}` : ''}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 32px', background: '#F8F8F8', padding: '8px 12px' }}>
                    {['Description', 'Qty', 'Unit $', ''].map(h => <div key={h} style={{ fontSize: '11px', fontWeight: '600', color: TEXT3 }}>{h}</div>)}
                  </div>
                  {form.line_items.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 32px', padding: '6px 12px', borderTop: `1px solid ${BORDER}`, alignItems: 'center' }}>
                      <input style={{ ...inp, height: '32px', border: 'none', background: 'transparent' }} value={item.description} onChange={e => setLine(idx, 'description', e.target.value)} placeholder="e.g. Split system installation"/>
                      <input type="number" style={{ ...inp, height: '32px', border: 'none', background: 'transparent' }} value={item.qty} onChange={e => setLine(idx, 'qty', e.target.value)} min="1"/>
                      <input type="number" style={{ ...inp, height: '32px', border: 'none', background: 'transparent' }} value={item.unit_price} onChange={e => setLine(idx, 'unit_price', e.target.value)} placeholder="0.00"/>
                      <button onClick={() => removeLine(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C', fontSize: '18px', lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                  <div style={{ padding: '8px 12px', borderTop: `1px solid ${BORDER}` }}>
                    <button onClick={addLine} style={{ background: 'none', border: 'none', cursor: 'pointer', color: A, fontSize: '13px', fontFamily: 'inherit' }}>+ Add line</button>
                  </div>
                </div>
              </div>
              {(() => {
                const taxRate = parseFloat(form.tax_rate) || 10
                const { subtotal, tax_amount, total } = calcTotals(form.line_items, taxRate)
                return (
                  <div style={{ background: BG, borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: TEXT3 }}>Subtotal</span>
                      <span style={{ fontSize: '13px', color: TEXT }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: TEXT3 }}>GST ({taxRate}%)</span>
                      <span style={{ fontSize: '13px', color: TEXT }}>${tax_amount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${BORDER}`, paddingTop: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: TEXT }}>Total</span>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: TEXT }}>${total.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })()}
              <div>
                <label style={lbl}>Notes</label>
                <textarea style={{ ...inp, height: '70px', padding: '8px 10px', resize: 'none' as const }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Payment terms, bank details, etc."/>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, height: '40px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT2, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.customer_id}
                  style={{ flex: 2, height: '40px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', opacity: !form.customer_id ? 0.5 : 1 }}>
                  {saving ? 'Saving…' : 'Create invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}