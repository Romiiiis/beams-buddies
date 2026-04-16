'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const RED = '#B91C1C'
const BLUE = '#1E3A8A'
const GREEN = '#166534'
const AMBER = '#78350F'
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
  valueSm: {
    fontSize: '16px',
    fontWeight: 900,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
    lineHeight: 1,
  },
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string; border: string }> = {
  draft: { bg: '#F1F5F9', color: TEXT3, label: 'Draft', border: BORDER },
  sent: { bg: '#E8F0FF', color: BLUE, label: 'Sent', border: '#BFDBFE' },
  accepted: { bg: '#E8F7EE', color: GREEN, label: 'Accepted', border: '#BBF7D0' },
  declined: { bg: '#FEECEC', color: '#7F1D1D', label: 'Declined', border: '#FECACA' },
  expired: { bg: '#FEF3C7', color: AMBER, label: 'Expired', border: '#FDE68A' },
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

function IconDraft({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_27c4de2991b14ff19e7b2c6e4713e8e0~mv2.png"
      alt="Draft"
      size={size}
    />
  )
}

function IconSent({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_4d059321b22e4619b468f9a3f76285f4~mv2.png"
      alt="Sent"
      size={size}
    />
  )
}

function IconAccepted({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_e8f3ef41771e44beae80121758693d4a~mv2.png"
      alt="Accepted"
      size={size}
    />
  )
}

function IconDeclined({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_a9564822636344f699c5d3dc69d4c4d6~mv2.png"
      alt="Declined"
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

function StatusPill({ status }: { status: string }) {
  const st = STATUS_STYLES[status] || STATUS_STYLES.draft
  return (
    <span
      style={{
        background: st.bg,
        color: st.color,
        border: `1px solid ${st.border}`,
        padding: '6px 10px',
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 800,
        whiteSpace: 'nowrap',
        display: 'inline-block',
        letterSpacing: '0.02em',
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

  const draftValue = useMemo(
    () => quotes.filter(q => q.status === 'draft').reduce((sum, q) => sum + Number(q.total || 0), 0),
    [quotes]
  )

  const totalValue = useMemo(
    () => quotes.reduce((sum, q) => sum + Number(q.total || 0), 0),
    [quotes]
  )

  const acceptedValue = useMemo(
    () => quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + Number(q.total || 0), 0),
    [quotes]
  )

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    overflow: 'hidden',
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

  const inp: React.CSSProperties = {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    borderRadius: '10px',
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT,
    fontFamily: FONT,
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const lbl: React.CSSProperties = {
    ...TYPE.label,
    marginBottom: '6px',
    display: 'block',
  }

  const topCards = [
    {
      label: 'Draft',
      value: statusCounts.draft.toLocaleString('en-AU'),
      sub: 'Not sent yet',
      icon: <IconDraft size={28} />,
      accent: TEXT,
      tag: 'Pipeline',
    },
    {
      label: 'Sent',
      value: statusCounts.sent.toLocaleString('en-AU'),
      sub: 'Awaiting response',
      icon: <IconSent size={28} />,
      accent: BLUE,
      tag: 'In progress',
    },
    {
      label: 'Accepted',
      value: statusCounts.accepted.toLocaleString('en-AU'),
      sub: 'Approved quotes',
      icon: <IconAccepted size={28} />,
      accent: GREEN,
      tag: 'Won',
    },
    {
      label: 'Declined',
      value: statusCounts.declined.toLocaleString('en-AU'),
      sub: 'Not proceeding',
      icon: <IconDeclined size={28} />,
      accent: RED,
      tag: 'Lost',
    },
  ]

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
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>{todayStr}</div>

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
              Quotes
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
                New quote
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
                  <div style={sectionHeaderTitle}>Quote list</div>
                  <div style={{ ...TYPE.bodySm }}>Filter quotes by status and update each one directly from the list.</div>
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
                      width: isMobile ? '100%' : '260px',
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
                        height: '40px',
                        width: '100%',
                        borderRadius: '11px',
                        border: `1px solid ${BORDER}`,
                        padding: '0 12px 0 38px',
                        fontSize: '12px',
                        background: WHITE,
                        color: TEXT,
                        fontFamily: FONT,
                        outline: 'none',
                      }}
                    />
                  </div>

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
                      gap: '6px',
                    }}
                  >
                    <IconFilter size={14} />
                    {filtered.length} shown
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                }}
              >
                {['all', 'draft', 'sent', 'accepted', 'declined', 'expired'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    style={{
                      height: '34px',
                      padding: '0 13px',
                      borderRadius: '999px',
                      border: `1px solid ${filterStatus === s ? TEAL : BORDER}`,
                      background: filterStatus === s ? '#E6F7F6' : WHITE,
                      color: filterStatus === s ? TEAL_DARK : TEXT2,
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontFamily: FONT,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      fontWeight: 700,
                    }}
                  >
                    {s === 'all' ? `All (${quotes.length})` : `${STATUS_STYLES[s]?.label} (${statusCounts[s as keyof typeof statusCounts] ?? 0})`}
                  </button>
                ))}
              </div>

              {!isMobile && filtered.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1.2fr) 100px 120px 150px 82px',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderBottom: `1px solid ${BORDER}`,
                    background: '#FCFCFD',
                  }}
                >
                  <div style={{ ...TYPE.label }}>Customer / Quote</div>
                  <div style={{ ...TYPE.label }}>Total</div>
                  <div style={{ ...TYPE.label }}>Valid until</div>
                  <div style={{ ...TYPE.label }}>Status</div>
                  <div style={{ ...TYPE.label, textAlign: 'right' }}>Delete</div>
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
                <div style={{ display: 'grid' }}>
                  {filtered.map(q => {
                    const st = STATUS_STYLES[q.status] || STATUS_STYLES.draft

                    return (
                      <div
                        key={q.id}
                        style={{
                          borderBottom: `1px solid ${BORDER}`,
                          padding: isMobile ? '14px 14px 13px' : '14px 16px',
                        }}
                      >
                        {isMobile ? (
                          <div style={{ display: 'grid', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                              <div style={{ minWidth: 0 }}>
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
                                    fontWeight: 700,
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
                                    marginTop: '1px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {q.customers?.suburb || 'No suburb'}
                                </div>
                              </div>

                              <span
                                style={{
                                  background: '#F8FAFC',
                                  color: TEXT3,
                                  padding: '6px 9px',
                                  borderRadius: '999px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  border: `1px solid ${BORDER}`,
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                }}
                              >
                                ${q.total.toFixed(2)}
                              </span>
                            </div>

                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px',
                              }}
                            >
                              <div
                                style={{
                                  padding: '10px 11px',
                                  borderRadius: '10px',
                                  background: '#FCFCFD',
                                  border: `1px solid ${BORDER}`,
                                }}
                              >
                                <div style={{ ...TYPE.label, marginBottom: '4px' }}>Valid until</div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>
                                  {q.valid_until
                                    ? new Date(q.valid_until).toLocaleDateString('en-AU', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    : 'Not set'}
                                </div>
                              </div>

                              <div
                                style={{
                                  padding: '10px 11px',
                                  borderRadius: '10px',
                                  background: '#FCFCFD',
                                  border: `1px solid ${BORDER}`,
                                }}
                              >
                                <div style={{ ...TYPE.label, marginBottom: '4px' }}>Items</div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>
                                  {(q.line_items?.length || 0)} item{q.line_items?.length === 1 ? '' : 's'}
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <StatusPill status={q.status} />

                                <select
                                  value={q.status}
                                  onChange={e => updateStatus(q.id, e.target.value)}
                                  style={{
                                    height: '34px',
                                    padding: '0 10px',
                                    borderRadius: '8px',
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

                              <button
                                onClick={() => setDeleteTarget(q)}
                                style={{
                                  height: '34px',
                                  padding: '0 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #FECACA',
                                  background: '#FEECEC',
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

                            {q.notes && (
                              <div
                                style={{
                                  padding: '10px 12px',
                                  background: '#FCFCFD',
                                  borderRadius: '10px',
                                  border: `1px solid ${BORDER}`,
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: TEXT3,
                                  lineHeight: 1.6,
                                }}
                              >
                                {q.notes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(0,1.2fr) 100px 120px 150px 82px',
                              gap: '12px',
                              alignItems: 'center',
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
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
                                  fontWeight: 700,
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
                                  marginTop: '1px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {q.customers?.suburb || 'No suburb'}
                                {q.notes ? ` · ${q.notes}` : ''}
                              </div>
                            </div>

                            <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>
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
                                  height: '32px',
                                  padding: '0 10px',
                                  borderRadius: '8px',
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
                                  background: '#FEECEC',
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
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Quote summary</div>
                  <button onClick={() => setShowForm(true)} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', marginBottom: '14px' }}>
                  <span style={{ color: GREEN }}>{statusCounts.accepted}</span> Accepted quote{statusCounts.accepted !== 1 ? 's' : ''}
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
                      background: '#FCFCFD',
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>Total quotes</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: TEXT }}>{quotes.length}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#E8F7EE',
                      border: '1px solid #BBF7D0',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: GREEN }}>Accepted value</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: GREEN }}>${acceptedValue.toFixed(0)}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#EAF3FF',
                      border: '1px solid #BFDBFE',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: BLUE }}>Total value</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: BLUE }}>${totalValue.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Quick actions</div>
                  <button onClick={() => setShowForm(true)} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                  <button
                    onClick={() => setShowForm(true)}
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
                    New quote
                  </button>

                  <button
                    onClick={() => setFilterStatus('all')}
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
                    Reset filter
                  </button>
                </div>
              </div>

              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Draft preview</div>
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
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#FCFCFD',
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div style={{ ...TYPE.label, marginBottom: '4px' }}>Subtotal</div>
                    <div style={{ ...TYPE.valueSm }}>${previewTotals.subtotal.toFixed(2)}</div>
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#FEF3C7',
                      border: '1px solid #FDE68A',
                    }}
                  >
                    <div style={{ ...TYPE.label, marginBottom: '4px', color: AMBER }}>GST</div>
                    <div style={{ ...TYPE.valueSm, color: AMBER }}>${previewTotals.tax_amount.toFixed(2)}</div>
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#E6F7F6',
                      border: '1px solid #C4E8E5',
                    }}
                  >
                    <div style={{ ...TYPE.label, marginBottom: '4px', color: TEAL_DARK }}>Total</div>
                    <div style={{ ...TYPE.valueSm, color: TEAL_DARK }}>${previewTotals.total.toFixed(2)}</div>
                  </div>
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
              <div>
                <div style={{ ...TYPE.label, color: TEAL, marginBottom: '4px' }}>Create</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: TEXT }}>New quote</div>
                <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Create a draft quote and save it to your records.</div>
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
                      {c.suburb ? ` • ${c.suburb}` : ''}
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
                          background: isMobile ? WHITE : 'transparent',
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
                          background: isMobile ? WHITE : 'transparent',
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
                          background: isMobile ? WHITE : 'transparent',
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
                  <span style={{ fontSize: '15px', fontWeight: 900, color: TEXT }}>${previewTotals.total.toFixed(2)}</span>
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
                    borderRadius: '10px',
                    border: `1px solid ${BORDER}`,
                    background: WHITE,
                    color: TEXT2,
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: FONT,
                    fontWeight: 700,
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
                    borderRadius: '10px',
                    border: 'none',
                    background: TEAL,
                    color: WHITE,
                    fontSize: '14px',
                    fontWeight: 800,
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