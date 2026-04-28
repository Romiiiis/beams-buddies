'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_LIGHT = '#E6F7F6'
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
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconFilter({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconSearch({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
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

function IconArrow({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
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

function StatusPill({ status }: { status: string }) {
  const st = STATUS_STYLES[status] || STATUS_STYLES.draft
  return (
    <span
      style={{
        background: st.bg,
        color: st.color,
        border: `1px solid ${st.border}`,
        padding: '6px 9px',
        borderRadius: '999px',
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
  const isMobile = useIsMobile()
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
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
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
    transition: 'border-color 0.12s, color 0.12s',
  }

  const btnTeal: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    border: 'none',
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: WHITE,
    background: TEAL,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.12s',
  }

  const btnMobileTeal: React.CSSProperties = {
    height: '36px',
    padding: '0 12px',
    border: `1px solid ${TEAL}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: WHITE,
    background: TEAL,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    flex: 1,
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

      <div style={{ flex: 1, minWidth: 0, background: BG }}>
        <div
          style={{
            padding: isMobile ? '0' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
            background: BG,
          }}
        >
          {isMobile ? (
            <div style={{ padding: '20px 12px 4px' }}>
              <div style={{ marginBottom: '12px' }}>
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
                  Quotes
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => setShowForm(true)} style={btnMobileTeal}>
                  <IconSpark size={12} /> New quote
                </button>
              </div>

              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderTop: `2px solid ${TEAL}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {statChips.map((chip, i) => (
                  <div
                    key={chip.label}
                    onClick={chip.onClick}
                    style={{
                      padding: '10px 8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = TEAL_LIGHT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: TEXT3, marginTop: '3px', lineHeight: 1.2 }}>{chip.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
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
                    Quotes
                  </h1>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setSearch('')
                      setFilterStatus('all')
                    }}
                    style={btnOutline}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = TEXT
                      e.currentTarget.style.color = TEXT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = BORDER
                      e.currentTarget.style.color = TEXT2
                    }}
                  >
                    Reset filters
                  </button>

                  <button
                    onClick={() => setShowForm(true)}
                    style={btnTeal}
                    onMouseEnter={e => {
                      e.currentTarget.style.opacity = '0.82'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    <IconSpark size={14} />
                    New quote
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderTop: `2px solid ${TEAL}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {statChips.map((chip, i) => (
                  <div
                    key={chip.label}
                    onClick={chip.onClick}
                    style={{
                      padding: '14px 20px',
                      cursor: 'pointer',
                      borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = TEAL_LIGHT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '4px' }}>{chip.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 320px',
              gap: '14px',
              alignItems: 'start',
              padding: isMobile ? '0 12px' : 0,
            }}
          >
            <div style={card}>
              <div
                style={{
                  padding: isMobile ? '16px' : '18px 20px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '14px',
                  background: WHITE,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: 4, height: 44, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em' }}>Quote list</span>
                      <span
                        style={{
                          height: '22px',
                          padding: '0 8px',
                          borderRadius: '999px',
                          border: `1px solid ${BORDER}`,
                          background: '#F8FAFC',
                          color: TEXT3,
                          fontSize: '10px',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        {filtered.length} shown
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '4px' }}>
                      Track draft, sent, accepted, declined, and expired quotes.
                    </div>
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
                      position: 'relative',
                      width: isMobile ? '100%' : '300px',
                      maxWidth: '100%',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: TEXT3,
                        display: 'inline-flex',
                      }}
                    >
                      <IconSearch size={15} />
                    </span>

                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search quotes..."
                      style={{
                        height: '42px',
                        width: '100%',
                        borderRadius: '12px',
                        border: `1px solid ${BORDER}`,
                        padding: '0 12px 0 38px',
                        fontSize: '12px',
                        background: '#F8FAFC',
                        color: TEXT,
                        fontFamily: FONT,
                        outline: 'none',
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    style={{
                      minWidth: isMobile ? '100%' : '180px',
                      width: isMobile ? '100%' : '180px',
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: '12px',
                      border: `1px solid ${BORDER}`,
                      background: '#F8FAFC',
                      color: TEXT2,
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: FONT,
                      outline: 'none',
                    }}
                  >
                    <option value="all">All ({quotes.length})</option>
                    <option value="draft">Draft ({statusCounts.draft})</option>
                    <option value="sent">Sent ({statusCounts.sent})</option>
                    <option value="accepted">Accepted ({statusCounts.accepted})</option>
                    <option value="declined">Declined ({statusCounts.declined})</option>
                    <option value="expired">Expired ({statusCounts.expired})</option>
                  </select>
                </div>
              </div>

              {!isMobile && filtered.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1.35fr) 110px 120px 150px 82px',
                    gap: '14px',
                    alignItems: 'center',
                    padding: '11px 20px',
                    borderBottom: `1px solid ${BORDER}`,
                    background: '#FCFCFD',
                  }}
                >
                  {['Customer / Quote', 'Total', 'Valid until', 'Status', 'Delete'].map(label => (
                    <div key={label} style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: label === 'Delete' ? 'right' : 'left' }}>
                      {label}
                    </div>
                  ))}
                </div>
              )}

              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: '32px 18px',
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '13px',
                  }}
                >
                  No quotes found.
                </div>
              ) : (
                filtered.map(q => {
                  const st = STATUS_STYLES[q.status] || STATUS_STYLES.draft

                  return (
                    <div
                      key={q.id}
                      style={{
                        display: isMobile ? 'block' : 'grid',
                        gridTemplateColumns: isMobile ? undefined : 'minmax(0,1.35fr) 110px 120px 150px 82px',
                        gap: isMobile ? undefined : '14px',
                        alignItems: isMobile ? undefined : 'center',
                        margin: isMobile ? '0' : '10px 12px',
                        padding: isMobile ? '14px 16px' : '14px 16px',
                        borderBottom: isMobile ? `1px solid ${BORDER}` : undefined,
                        border: isMobile ? 'none' : `1px solid ${BORDER}`,
                        borderRadius: isMobile ? '0' : '14px',
                        background: WHITE,
                        transition: 'background 0.12s, border-color 0.12s, box-shadow 0.12s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = TEAL_LIGHT
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = WHITE
                      }}
                    >
                      {isMobile ? (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: '12px',
                              background: TEAL_LIGHT,
                              border: `1px solid #BFE7E3`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              color: TEAL_DARK,
                              fontSize: '11px',
                              fontWeight: 900,
                            }}
                          >
                            $
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {q.customers?.first_name} {q.customers?.last_name}
                              </div>
                              <StatusPill status={q.status} />
                            </div>

                            <div style={{ fontSize: '11px', color: TEXT3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                              {q.quote_number} · ${q.total.toFixed(2)}
                            </div>

                            <div style={{ fontSize: '11px', color: TEXT3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '8px' }}>
                              {q.customers?.suburb || 'No suburb'}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: q.valid_until ? TEAL_DARK : TEXT3 }}>
                                {q.valid_until
                                  ? `Valid: ${new Date(q.valid_until).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                  : 'No expiry set'}
                              </span>

                              <button
                                onClick={() => setDeleteTarget(q)}
                                style={{
                                  height: '30px',
                                  padding: '0 10px',
                                  borderRadius: '8px',
                                  border: '1px solid #FECACA',
                                  background: '#FEE2E2',
                                  color: '#7F1D1D',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  fontFamily: FONT,
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                            <div style={{ width: 4, alignSelf: 'stretch', minHeight: 46, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  ...TYPE.label,
                                  marginBottom: '5px',
                                  color: st.color,
                                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                }}
                              >
                                {q.quote_number}
                              </div>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 850,
                                  color: TEXT,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {q.customers?.first_name} {q.customers?.last_name}
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: TEXT3,
                                  marginTop: '3px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {q.customers?.suburb || 'No suburb'}
                                {q.notes ? ` · ${q.notes}` : ''}
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '12px', fontWeight: 800, color: TEXT2 }}>
                            ${q.total.toFixed(2)}
                          </div>

                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: TEXT2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {q.valid_until
                              ? new Date(q.valid_until).toLocaleDateString('en-AU', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Not set'}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <StatusPill status={q.status} />

                            <select
                              value={q.status}
                              onChange={e => updateStatus(q.id, e.target.value)}
                              style={{
                                minWidth: '110px',
                                height: '32px',
                                padding: '0 12px',
                                borderRadius: '999px',
                                border: `1px solid ${st.border}`,
                                background: st.bg,
                                color: st.color,
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontFamily: FONT,
                                outline: 'none',
                              }}
                            >
                              {Object.entries(STATUS_STYLES).map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setDeleteTarget(q)}
                              style={{
                                height: '32px',
                                padding: '0 10px',
                                borderRadius: '8px',
                                border: '1px solid #FECACA',
                                background: '#FEE2E2',
                                color: '#7F1D1D',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontFamily: FONT,
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT, letterSpacing: '-0.025em' }}>Quote summary</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>Current quote pipeline</div>
                    </div>
                  </div>
                  <button onClick={() => setShowForm(true)} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', marginBottom: '14px' }}>
                  <span style={{ color: TEAL_DARK }}>{statusCounts.accepted}</span> accepted
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Total quotes', value: quotes.length, bg: '#F8FAFC', border: BORDER, color: TEXT },
                    { label: 'Accepted value', value: `$${acceptedValue.toFixed(0)}`, bg: TEAL_LIGHT, border: '#BFE7E3', color: TEAL_DARK },
                    { label: 'Total value', value: `$${totalValue.toFixed(0)}`, bg: '#F8FAFC', border: BORDER, color: TEXT },
                    { label: 'Declined', value: statusCounts.declined, bg: '#FEE2E2', border: '#FECACA', color: '#7F1D1D' },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: item.bg,
                        border: `1px solid ${item.border}`,
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: item.color }}>{item.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT, letterSpacing: '-0.025em' }}>Draft preview</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>Current unsaved quote</div>
                    </div>
                  </div>
                  <button onClick={() => setShowForm(true)} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em' }}>
                    ${previewTotals.total.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT3, marginLeft: 6 }}>current draft</span>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Subtotal', value: `$${previewTotals.subtotal.toFixed(2)}`, bg: '#F8FAFC', border: BORDER, color: TEXT },
                    { label: 'GST', value: `$${previewTotals.tax_amount.toFixed(2)}`, bg: '#F8FAFC', border: BORDER, color: TEXT },
                    { label: 'Total', value: `$${previewTotals.total.toFixed(2)}`, bg: TEAL_LIGHT, border: '#BFE7E3', color: TEAL_DARK },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: item.bg,
                        border: `1px solid ${item.border}`,
                      }}
                    >
                      <div style={{ ...TYPE.label, marginBottom: '4px', color: item.color }}>{item.label}</div>
                      <div style={{ ...TYPE.valueSm, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                <div style={{ width: 4, height: 44, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
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
                        placeholder="e.g. Split system install"
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