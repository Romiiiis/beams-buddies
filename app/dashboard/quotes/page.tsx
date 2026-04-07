'use client'

import React, { useEffect, useState } from 'react'
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

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: '#F1F5F9', color: TEXT3, label: 'Draft' },
  sent: { bg: '#DBEAFE', color: '#1E3A8A', label: 'Sent' },
  accepted: { bg: '#DCFCE7', color: '#166534', label: 'Accepted' },
  declined: { bg: '#FEE2E2', color: '#7F1D1D', label: 'Declined' },
  expired: { bg: '#FEF3C7', color: '#78350F', label: 'Expired' },
}

type LineItem = { description: string; qty: number; unit_price: number }
type Quote = {
  id: string
  quote_number: string
  status: string
  total: number
  subtotal: number
  tax_rate: number
  tax_amount: number
  notes: string
  valid_until: string
  created_at: string
  line_items: LineItem[]
  customers: { first_name: string; last_name: string; suburb: string; phone: string; email: string }
}

function IconQuote({ size = 18 }: { size?: number }) {
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

export default function QuotesPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [businessId, setBusinessId] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [form, setForm] = useState({
    customer_id: '',
    valid_until: '',
    notes: '',
    tax_rate: '10',
    line_items: [{ description: '', qty: 1, unit_price: 0 }] as LineItem[],
  })

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

      setBusinessId(userData.business_id)

      const [quotesRes, customersRes] = await Promise.all([
        supabase
          .from('quotes')
          .select('*, customers(first_name, last_name, suburb, phone, email)')
          .eq('business_id', userData.business_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('customers')
          .select('id, first_name, last_name, suburb')
          .eq('business_id', userData.business_id)
          .order('first_name'),
      ])

      setQuotes(quotesRes.data || [])
      setCustomers(customersRes.data || [])
      setLoading(false)
    }

    load()
  }, [router])

  function calcTotals(items: LineItem[], taxRate: number) {
    const subtotal = items.reduce((s, i) => s + i.qty * i.unit_price, 0)
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
    const quote_number = `Q-${String(quotes.length + 1).padStart(4, '0')}`

    const { data } = await supabase
      .from('quotes')
      .insert({
        business_id: businessId,
        customer_id: form.customer_id,
        quote_number,
        status: 'draft',
        line_items: form.line_items,
        subtotal,
        tax_rate: taxRate,
        tax_amount,
        total,
        notes: form.notes,
        valid_until: form.valid_until || null,
      })
      .select('*, customers(first_name, last_name, suburb, phone, email)')
      .single()

    if (data) setQuotes(prev => [data, ...prev])

    setShowForm(false)
    setForm({
      customer_id: '',
      valid_until: '',
      notes: '',
      tax_rate: '10',
      line_items: [{ description: '', qty: 1, unit_price: 0 }],
    })
    setSaving(false)
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('quotes').update({ status }).eq('id', id)
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q))
  }

  const filtered = filterStatus === 'all' ? quotes : quotes.filter(q => q.status === filterStatus)
  const counts = { draft: 0, sent: 0, accepted: 0, declined: 0 }
  quotes.forEach(q => {
    if (counts[q.status as keyof typeof counts] !== undefined) counts[q.status as keyof typeof counts]++
  })

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

  const inp: React.CSSProperties = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    borderRadius: '10px',
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT,
    fontFamily: FONT,
    fontSize: '13px',
    outline: 'none',
  }

  const lbl: React.CSSProperties = {
    ...TYPE.label,
    marginBottom: '6px',
    display: 'block',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: FONT, background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/quotes" />

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
              Quotes
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
              Create, track, and update quotes from one clean pipeline built for fast approvals and follow-up.
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
                onClick={() => setShowForm(true)}
                style={{
                  ...quickActionStyle,
                  background: TEAL,
                  color: '#FFFFFF',
                  border: 'none',
                }}
              >
                <IconSpark size={16} />
                New quote
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
            <div style={sectionLabel}>{sectionDash}Overview</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(12, minmax(0,1fr))',
                gap: '10px',
              }}
            >
              {[
                {
                  label: 'Draft',
                  value: counts.draft,
                  sub: 'Not sent yet',
                  icon: <IconQuote size={17} />,
                  accent: TEXT,
                  span: 'span 3',
                },
                {
                  label: 'Sent',
                  value: counts.sent,
                  sub: 'Awaiting response',
                  icon: <IconQuote size={17} />,
                  accent: '#1E3A8A',
                  span: 'span 3',
                },
                {
                  label: 'Accepted',
                  value: counts.accepted,
                  sub: 'Approved quotes',
                  icon: <IconQuote size={17} />,
                  accent: '#166534',
                  span: 'span 3',
                },
                {
                  label: 'Declined',
                  value: counts.declined,
                  sub: 'Not proceeding',
                  icon: <IconQuote size={17} />,
                  accent: RED,
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

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {['all', 'draft', 'sent', 'accepted', 'declined', 'expired'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: '999px',
                  border: `1px solid ${filterStatus === s ? TEAL_DARK : BORDER}`,
                  background: filterStatus === s ? TEAL : WHITE,
                  color: filterStatus === s ? WHITE : TEXT2,
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: FONT,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontWeight: filterStatus === s ? 700 : 600,
                  boxShadow: filterStatus === s ? '0 2px 8px rgba(31,158,148,0.18)' : 'none',
                }}
              >
                {s === 'all' ? `All (${quotes.length})` : STATUS_STYLES[s]?.label}
              </button>
            ))}
          </div>

          <div style={{ ...shellCard, padding: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexDirection: isMobile ? 'column' : 'row',
                marginBottom: '10px',
              }}
            >
              <div style={sectionLabel}>{sectionDash}Quote list</div>

              <div
                style={{
                  height: '34px',
                  borderRadius: '10px',
                  border: `1px solid ${BORDER}`,
                  background: '#F8FAFC',
                  color: TEXT2,
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: FONT,
                }}
              >
                {filtered.length} shown
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
            ) : filtered.length === 0 ? (
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
                No quotes yet. <span style={{ color: TEAL, cursor: 'pointer', fontWeight: 700 }} onClick={() => setShowForm(true)}>Create your first</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '8px' }}>
                {filtered.map(q => {
                  const st = STATUS_STYLES[q.status] || STATUS_STYLES.draft

                  return (
                    <div
                      key={q.id}
                      style={{
                        borderRadius: '12px',
                        border: `1px solid ${BORDER}`,
                        background: WHITE,
                        padding: '12px 14px',
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.1fr) minmax(0,0.9fr) auto',
                        gap: '10px',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ ...TYPE.titleSm, marginBottom: '3px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                          {q.quote_number}
                        </div>
                        <div style={{ ...TYPE.body, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {q.customers?.first_name} {q.customers?.last_name}
                        </div>
                        <div style={{ ...TYPE.bodySm, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {q.customers?.suburb || 'No suburb'}
                        </div>
                      </div>

                      {!isMobile && (
                        <div style={{ minWidth: 0 }}>
                          <div style={{ ...TYPE.title, fontWeight: 800 }}>
                            ${q.total.toFixed(2)}
                          </div>
                          <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>
                            Valid until {q.valid_until ? new Date(q.valid_until).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </div>
                        </div>
                      )}

                      <div style={{ justifySelf: isMobile ? 'start' : 'end', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <select
                          value={q.status}
                          onChange={e => updateStatus(q.id, e.target.value)}
                          style={{
                            padding: '5px 9px',
                            borderRadius: '999px',
                            fontSize: '10px',
                            fontWeight: 800,
                            border: 'none',
                            background: st.bg,
                            color: st.color,
                            cursor: 'pointer',
                            fontFamily: FONT,
                            outline: 'none',
                          }}
                        >
                          {Object.entries(STATUS_STYLES).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </div>

                      {isMobile && (
                        <div style={{ gridColumn: '1 / -1', ...TYPE.bodySm }}>
                          ${q.total.toFixed(2)} • Valid until {q.valid_until ? new Date(q.valid_until).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: WHITE, borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflow: 'auto', border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', fontFamily: FONT }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ ...TYPE.section, color: TEAL, marginBottom: '2px' }}>Create</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>New quote</div>
                <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Create a draft quote and save it to your records.</div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '8px', width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer', color: TEXT3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={lbl}>Customer *</label>
                <select style={inp} value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
                  <option value="">Select customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}{c.suburb ? ` • ${c.suburb}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Valid until</label>
                  <input type="date" style={inp} value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>GST rate (%)</label>
                  <input type="number" style={inp} value={form.tax_rate} onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))} placeholder="10" />
                </div>
              </div>

              <div>
                <label style={lbl}>Line items</label>
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 32px', background: '#F8FAFC', padding: '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
                    {['Description', 'Qty', 'Unit $', ''].map(h => (
                      <div key={h} style={{ fontSize: '11px', fontWeight: '700', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</div>
                    ))}
                  </div>

                  {form.line_items.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 32px', padding: '8px 12px', borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}`, alignItems: 'center' }}>
                      <input style={{ ...inp, height: '32px', border: 'none', background: 'transparent', padding: '0 8px' }} value={item.description} onChange={e => setLine(idx, 'description', e.target.value)} placeholder="e.g. Split system install" />
                      <input type="number" style={{ ...inp, height: '32px', border: 'none', background: 'transparent', padding: '0 8px' }} value={item.qty} onChange={e => setLine(idx, 'qty', e.target.value)} min="1" />
                      <input type="number" style={{ ...inp, height: '32px', border: 'none', background: 'transparent', padding: '0 8px' }} value={item.unit_price} onChange={e => setLine(idx, 'unit_price', e.target.value)} placeholder="0.00" />
                      <button onClick={() => removeLine(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: RED, fontSize: '18px', lineHeight: 1 }}>
                        ×
                      </button>
                    </div>
                  ))}

                  <div style={{ padding: '10px 12px', borderTop: `1px solid ${BORDER}`, background: WHITE }}>
                    <button onClick={addLine} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEAL, fontSize: '13px', fontFamily: FONT, fontWeight: '700' }}>
                      + Add line
                    </button>
                  </div>
                </div>
              </div>

              {(() => {
                const taxRate = parseFloat(form.tax_rate) || 10
                const { subtotal, tax_amount, total } = calcTotals(form.line_items, taxRate)

                return (
                  <div style={{ background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '16px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: TEXT3, fontWeight: '500' }}>Subtotal</span>
                      <span style={{ fontSize: '13px', color: TEXT, fontWeight: '700' }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', color: TEXT3, fontWeight: '500' }}>GST ({taxRate}%)</span>
                      <span style={{ fontSize: '13px', color: TEXT, fontWeight: '700' }}>${tax_amount.toFixed(2)}</span>
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
                <textarea
                  style={{ ...inp, height: '76px', padding: '10px 12px', resize: 'none' as const }}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any additional notes for the customer..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ flex: 1, height: '42px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '14px', cursor: 'pointer', fontFamily: FONT, fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.customer_id}
                  style={{ flex: 2, height: '42px', borderRadius: '10px', border: 'none', background: TEAL, color: WHITE, fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: FONT, opacity: !form.customer_id ? 0.5 : 1 }}
                >
                  {saving ? 'Saving...' : 'Create quote'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}