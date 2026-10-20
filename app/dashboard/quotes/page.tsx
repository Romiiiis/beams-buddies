'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { StatStrip } from '@/components/StatStrip'
import { useBusinessData } from '@/lib/business-context'
import { getLineItemPlaceholder } from '@/lib/industry-config'
import { AppIcon } from '@/components/AppIcon'
import { DataList, PersonCell, TextCell, StatusSelect } from '@/components/DataList'

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const RED = '#B91C1C'
const BLUE = '#1E3A8A'
const GREEN = '#166534'
const AMBER = '#78350F'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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
  valueSm: {
    fontSize: '16px',
    fontWeight: 900,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
    lineHeight: 1,
  },
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string; border: string }> = {
  draft: { bg: '#F8FAFC', color: TEXT3, label: 'Draft', border: BORDER },
  sent: { bg: '#F8FAFC', color: TEXT2, label: 'Sent', border: BORDER },
  accepted: { bg: TEAL_LIGHT, color: TEAL_DARK, label: 'Accepted', border: '#BFE7E3' },
  declined: { bg: '#FEE2E2', color: '#7F1D1D', label: 'Declined', border: '#FECACA' },
  expired: { bg: '#F1F5F9', color: TEXT3, label: 'Expired', border: BORDER },
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
  customers: {
    first_name: string
    last_name: string
    suburb: string
    phone: string
    email: string
  }
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
  return <AppIcon name="sparkle" size={size} />
}

function IconPlus({ size = 13 }: { size?: number }) {
  return <AppIcon name="add" size={size} />
}

function IconFilter({ size = 15 }: { size?: number }) {
  return <AppIcon name="filter" size={size} />
}

function IconSearch({ size = 15 }: { size?: number }) {
  return <AppIcon name="search" size={size} />
}

function IconExternalLink({ size = 14 }: { size?: number }) {
  return <AppIcon name="external-link" size={size} />
}

function IconArrow({ size = 14 }: { size?: number }) {
  return <AppIcon name="arrow-right" size={size} />
}

function pctChange(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return 0
    return 100
  }
  return Math.round(((current - previous) / previous) * 100)
}

function StatusPill({ status }: { status: string }) {
  const st = STATUS_STYLES[status] || STATUS_STYLES.draft
  return (
    <span
      style={{
        background: st.bg,
        color: st.color,
        border: `1px solid ${st.border}`,
        padding: '6px 9px',
        borderRadius: '8px',
        fontSize: '10px',
        fontWeight: 800,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {st.label}
    </span>
  )
}

export default function QuotesPage() {
  const router = useRouter()
  const { business } = useBusinessData()
  const isMobile = useIsMobile()
  const lineItemPlaceholder = getLineItemPlaceholder(business?.industry)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [businessId, setBusinessId] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Quote | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    customer_id: '',
    valid_until: '',
    notes: '',
    tax_rate: '10',
    line_items: [{ description: '', qty: 1, unit_price: 0 }] as LineItem[],
  })

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

      if (!userData) {
        setLoading(false)
        return
      }

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

      setQuotes((quotesRes.data as Quote[]) || [])
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
    setForm(f => ({
      ...f,
      line_items: f.line_items.length === 1 ? f.line_items : f.line_items.filter((_, i) => i !== idx),
    }))
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

    if (data) {
      setQuotes(prev => [data as Quote, ...prev])
    }

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
    setQuotes(prev => prev.map(q => (q.id === id ? { ...q, status } : q)))
  }

  async function deleteQuote(id: string) {
    setDeleting(true)
    const { error } = await supabase.from('quotes').delete().eq('id', id)
    if (!error) {
      setQuotes(prev => prev.filter(q => q.id !== id))
      setDeleteTarget(null)
    }
    setDeleting(false)
  }

  const statusCounts = useMemo(() => {
    const counts = { draft: 0, sent: 0, accepted: 0, declined: 0, expired: 0 }
    quotes.forEach(q => {
      if (counts[q.status as keyof typeof counts] !== undefined) {
        counts[q.status as keyof typeof counts]++
      }
    })
    return counts
  }, [quotes])

  const quoteTabs = [
    { value: 'all', label: 'All quotes', count: quotes.length },
    ...(['draft', 'sent', 'accepted', 'declined', 'expired'] as const).map(k => ({
      value: k,
      label: STATUS_STYLES[k].label,
      count: statusCounts[k],
    })),
  ]

  const filtered = useMemo(() => {
    const byStatus = filterStatus === 'all' ? quotes : quotes.filter(q => q.status === filterStatus)
    if (!search.trim()) return byStatus

    const term = search.toLowerCase()
    return byStatus.filter(q => {
      const name = `${q.customers?.first_name || ''} ${q.customers?.last_name || ''}`.toLowerCase()
      const suburb = (q.customers?.suburb || '').toLowerCase()
      const number = (q.quote_number || '').toLowerCase()
      const notes = (q.notes || '').toLowerCase()
      return name.includes(term) || suburb.includes(term) || number.includes(term) || notes.includes(term)
    })
  }, [quotes, filterStatus, search])

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const taxRatePreview = parseFloat(form.tax_rate) || 10
  const previewTotals = calcTotals(form.line_items, taxRatePreview)

  const totalValue = useMemo(() => quotes.reduce((sum, q) => sum + Number(q.total || 0), 0), [quotes])
  const acceptedValue = useMemo(() => quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + Number(q.total || 0), 0), [quotes])

  const now = new Date()
  const startCurrent30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  const startPrev30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60)

  function inRange(dateStr?: string | null, start?: Date, end?: Date) {
    if (!dateStr) return false
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    return d >= start! && d < end!
  }

  const currentQuotes = quotes.filter(q => inRange(q.created_at, startCurrent30, now)).length
  const prevQuotes = quotes.filter(q => inRange(q.created_at, startPrev30, startCurrent30)).length

  const currentAccepted = quotes.filter(q => q.status === 'accepted' && inRange(q.created_at, startCurrent30, now)).length
  const prevAccepted = quotes.filter(q => q.status === 'accepted' && inRange(q.created_at, startPrev30, startCurrent30)).length

  const currentSent = quotes.filter(q => q.status === 'sent' && inRange(q.created_at, startCurrent30, now)).length
  const prevSent = quotes.filter(q => q.status === 'sent' && inRange(q.created_at, startPrev30, startCurrent30)).length

  const currentDrafts = quotes.filter(q => q.status === 'draft' && inRange(q.created_at, startCurrent30, now)).length
  const prevDrafts = quotes.filter(q => q.status === 'draft' && inRange(q.created_at, startPrev30, startCurrent30)).length

  const quotesDelta = pctChange(currentQuotes, prevQuotes)
  const acceptedDelta = pctChange(currentAccepted, prevAccepted)
  const sentDelta = pctChange(currentSent, prevSent)
  const draftDelta = pctChange(currentDrafts, prevDrafts)

  const statChips = [
    {
      label: 'Quotes',
      value: quotes.length.toLocaleString('en-AU'),
      sub: `${quotesDelta >= 0 ? '+' : ''}${quotesDelta}% last 30 days`,
      onClick: () => setFilterStatus('all'),
    },
    {
      label: 'Accepted',
      value: statusCounts.accepted.toLocaleString('en-AU'),
      sub: `${acceptedDelta >= 0 ? '+' : ''}${acceptedDelta}% last 30 days`,
      onClick: () => setFilterStatus('accepted'),
    },
    {
      label: 'Sent',
      value: statusCounts.sent.toLocaleString('en-AU'),
      sub: `${sentDelta >= 0 ? '+' : ''}${sentDelta}% last 30 days`,
      onClick: () => setFilterStatus('sent'),
    },
    {
      label: 'Draft',
      value: statusCounts.draft.toLocaleString('en-AU'),
      sub: `${draftDelta >= 0 ? '+' : ''}${draftDelta}% last 30 days`,
      onClick: () => setFilterStatus('draft'),
    },
  ]

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

  const cardArrowBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: TEXT3,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  }

  const inp: React.CSSProperties = {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    borderRadius: '12px',
    border: `1px solid ${BORDER}`,
    background: '#F8FAFC',
    color: TEXT,
    fontFamily: FONT,
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    fontWeight: 600,
  }

  const lbl: React.CSSProperties = {
    ...TYPE.label,
    marginBottom: '6px',
    display: 'block',
  }

  const btnOutline: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: TEXT2,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  }

  const btnPrimary: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    background: TEAL,
    color: WHITE,
    border: 'none',
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/quotes" />
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
          Loading quotes...
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
      <Sidebar active="/dashboard/quotes" />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <div
          style={{
            background: BG,
            borderBottom: `1px solid ${BORDER}`,
            padding: isMobile ? '14px 14px 12px' : '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <h1 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0 }}>Quotes</h1>
        </div>

        <div className="page-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '12px' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '48px',
            background: BG,
          }}
        >
          <StatStrip items={statChips} isMobile={isMobile} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr)',
              gap: '14px',
              alignItems: 'start',
            }}
          >
            <DataList<Quote>
              title="Quote list"
              isMobile={isMobile}
              rows={filtered}
              rowKey={q => q.id}
              emptyText="No quotes found."
              rowActions={() => [{ label: 'Delete quote', danger: true, onClick: q => setDeleteTarget(q) }]}
              tabs={quoteTabs}
              activeTab={filterStatus}
              onTabChange={setFilterStatus}
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search quotes..."
              addLabel="New quote"
              onAdd={() => setShowForm(true)}
              columns={[
                {
                  key: 'customer',
                  label: 'Customer / Quote',
                  width: 'minmax(0,1.5fr)',
                  render: q => (
                    <PersonCell
                      name={`${q.customers?.first_name || ''} ${q.customers?.last_name || ''}`.trim() || 'Unknown customer'}
                      sub={[q.quote_number, q.customers?.suburb || 'No suburb'].filter(Boolean).join(' · ')}
                    />
                  ),
                },
                {
                  key: 'total',
                  label: 'Total',
                  width: '100px',
                  mobileLabel: 'Total',
                  render: q => <TextCell strong>${Number(q.total || 0).toFixed(2)}</TextCell>,
                },
                {
                  key: 'valid',
                  label: 'Valid until',
                  width: '120px',
                  mobileLabel: 'Valid until',
                  render: q => (
                    <TextCell>
                      {q.valid_until ? new Date(q.valid_until).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'}
                    </TextCell>
                  ),
                },
                {
                  key: 'status',
                  label: 'Status',
                  width: '130px',
                  render: q => {
                    const st = STATUS_STYLES[q.status] || STATUS_STYLES.draft
                    return (
                      <StatusSelect
                        value={q.status}
                        options={Object.entries(STATUS_STYLES).map(([k, v]) => ({ value: k, label: v.label }))}
                        onChange={v => updateStatus(q.id, v)}
                        colors={{ bg: st.bg, fg: st.color, border: st.border }}
                        label="Quote status"
                      />
                    )
                  },
                },
              ]}
            />
          </div>
        </div>
      </div>

      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,10,10,0.4)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: WHITE,
              borderRadius: '16px',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflow: 'auto',
              border: `1px solid ${BORDER}`,
              fontFamily: FONT,
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 4, alignSelf: 'stretch', minHeight: 22, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                <div>
                  <div style={{ ...TYPE.label, color: TEAL_DARK, marginBottom: '4px' }}>Create</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em' }}>New quote</div>
                  <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px', fontWeight: 600 }}>Create a draft quote and save it to your records.</div>
                </div>
              </div>

              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: TEXT3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
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
                      {c.first_name} {c.last_name}
                      {c.suburb ? ` - ${c.suburb}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px',
                }}
              >
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

                <div
                  style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: WHITE,
                  }}
                >
                  {!isMobile ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 70px 110px 40px',
                        background: '#F8FAFC',
                        padding: '10px 12px',
                        borderBottom: `1px solid ${BORDER}`,
                      }}
                    >
                      {['Description', 'Qty', 'Unit $', ''].map(h => (
                        <div
                          key={h}
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: TEXT3,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {h}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {form.line_items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 70px 110px 40px',
                        gap: isMobile ? '8px' : '0',
                        padding: '10px 12px',
                        borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}`,
                        alignItems: 'center',
                      }}
                    >
                      <input
                        style={{
                          ...inp,
                          height: '34px',
                          border: isMobile ? `1px solid ${BORDER}` : 'none',
                          background: isMobile ? '#F8FAFC' : 'transparent',
                          padding: '0 8px',
                        }}
                        value={item.description}
                        onChange={e => setLine(idx, 'description', e.target.value)}
                        placeholder={lineItemPlaceholder}
                      />

                      <input
                        type="number"
                        style={{
                          ...inp,
                          height: '34px',
                          border: isMobile ? `1px solid ${BORDER}` : 'none',
                          background: isMobile ? '#F8FAFC' : 'transparent',
                          padding: '0 8px',
                        }}
                        value={item.qty}
                        onChange={e => setLine(idx, 'qty', e.target.value)}
                        min="1"
                        placeholder={isMobile ? 'Qty' : ''}
                      />

                      <input
                        type="number"
                        style={{
                          ...inp,
                          height: '34px',
                          border: isMobile ? `1px solid ${BORDER}` : 'none',
                          background: isMobile ? '#F8FAFC' : 'transparent',
                          padding: '0 8px',
                        }}
                        value={item.unit_price}
                        onChange={e => setLine(idx, 'unit_price', e.target.value)}
                        placeholder={isMobile ? 'Unit price' : '0.00'}
                      />

                      <button
                        onClick={() => removeLine(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: RED,
                          fontSize: '18px',
                          lineHeight: 1,
                          height: '34px',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <div
                    style={{
                      padding: '10px 12px',
                      borderTop: `1px solid ${BORDER}`,
                      background: WHITE,
                    }}
                  >
                    <button
                      onClick={addLine}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: TEAL,
                        fontSize: '13px',
                        fontFamily: FONT,
                        fontWeight: 800,
                      }}
                    >
                      + Add line
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#F8FAFC',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '12px',
                  padding: '16px 18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: TEXT3, fontWeight: 500 }}>Subtotal</span>
                  <span style={{ fontSize: '13px', color: TEXT, fontWeight: 800 }}>${previewTotals.subtotal.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: TEXT3, fontWeight: 500 }}>GST ({taxRatePreview}%)</span>
                  <span style={{ fontSize: '13px', color: TEXT, fontWeight: 800 }}>${previewTotals.tax_amount.toFixed(2)}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: `1px solid ${BORDER}`,
                    paddingTop: '10px',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 800, color: TEXT }}>Total</span>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: TEAL_DARK }}>${previewTotals.total.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label style={lbl}>Notes</label>
                <textarea
                  style={{
                    ...inp,
                    minHeight: '84px',
                    height: '84px',
                    padding: '12px',
                    resize: 'vertical',
                  }}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any additional notes for the customer..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '9px',
                    border: `1px solid ${BORDER}`,
                    background: WHITE,
                    color: TEXT2,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: FONT,
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving || !form.customer_id}
                  style={{
                    flex: 2,
                    height: '42px',
                    borderRadius: '9px',
                    border: 'none',
                    background: TEAL,
                    color: WHITE,
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: FONT,
                    opacity: !form.customer_id ? 0.5 : 1,
                  }}
                >
                  {saving ? 'Saving...' : 'Create quote'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,10,10,0.4)',
            zIndex: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: WHITE,
              borderRadius: '16px',
              width: '100%',
              maxWidth: '420px',
              border: `1px solid ${BORDER}`,
              overflow: 'hidden',
              fontFamily: FONT,
            }}
          >
            <div style={{ height: '4px', background: '#EF4444' }} />

            <div style={{ padding: '24px 24px 20px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#EF4444',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: '6px',
                }}
              >
                Delete quote
              </div>

              <div style={{ fontSize: '18px', fontWeight: 800, color: TEXT, marginBottom: '10px' }}>
                Delete {deleteTarget.quote_number}?
              </div>

              <div style={{ fontSize: '14px', color: TEXT3, lineHeight: 1.6 }}>
                This will permanently delete the quote for {deleteTarget.customers?.first_name} {deleteTarget.customers?.last_name}. This cannot be undone.
              </div>
            </div>

            <div style={{ padding: '0 24px 24px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '9px',
                  border: `1px solid ${BORDER}`,
                  background: WHITE,
                  color: TEXT2,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => deleteQuote(deleteTarget.id)}
                disabled={deleting}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '9px',
                  border: 'none',
                  background: '#EF4444',
                  color: WHITE,
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontFamily: FONT,
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
