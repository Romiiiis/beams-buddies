'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const RED = '#B91C1C'
const BLUE = '#2563EB'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#475569'
const BORDER = '#E2E8F0'
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
  valueSm: {
    fontSize: '16px',
    fontWeight: 900,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
    lineHeight: 1,
  },
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string; accent: string; border: string }> = {
  draft: { bg: '#F1F5F9', color: TEXT3, label: 'Draft', accent: TEXT3, border: BORDER },
  sent: { bg: '#DBEAFE', color: '#1E3A8A', label: 'Sent', accent: BLUE, border: '#BFDBFE' },
  paid: { bg: '#DCFCE7', color: '#166534', label: 'Paid', accent: '#166534', border: '#BBF7D0' },
  overdue: { bg: '#FEE2E2', color: '#7F1D1D', label: 'Overdue', accent: RED, border: '#FECACA' },
  cancelled: { bg: '#F1F5F9', color: TEXT3, label: 'Cancelled', accent: TEXT3, border: BORDER },
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
  customers: {
    first_name: string
    last_name: string
    suburb: string
    phone: string
    email: string
    address?: string
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

function IconRevenue({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2v20M17 6.5c0-1.93-2.24-3.5-5-3.5S7 4.57 7 6.5 9.24 10 12 10s5 1.57 5 3.5S14.76 17 12 17s-5-1.57-5-3.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function IconTrash({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M6 7l1 11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-11" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrendUp({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 7l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrendDown({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 17l-8-8-4 4-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
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

function formatDelta(n: number) {
  return `${n >= 0 ? '+' : ''}${n}%`
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
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null)
  const [businessId, setBusinessId] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [businessSettings, setBusinessSettings] = useState<any>(null)
  const [businessInfo, setBusinessInfo] = useState<any>(null)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    customer_id: '',
    due_date: '',
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

      if (!userData) return

      setBusinessId(userData.business_id)

      const [invoicesRes, customersRes, settingsRes, businessRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('*, customers(first_name, last_name, suburb, phone, email, address)')
          .eq('business_id', userData.business_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('customers')
          .select('id, first_name, last_name, suburb')
          .eq('business_id', userData.business_id)
          .order('first_name'),
        supabase.from('business_settings').select('*').eq('business_id', userData.business_id).single(),
        supabase.from('businesses').select('*').eq('id', userData.business_id).single(),
      ])

      setInvoices((invoicesRes.data as Invoice[]) || [])
      setCustomers(customersRes.data || [])
      setBusinessSettings(settingsRes.data)
      setBusinessInfo(businessRes.data)
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
    const invoice_number = `INV-${String(invoices.length + 1).padStart(4, '0')}`

    const { data } = await supabase
      .from('invoices')
      .insert({
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
      })
      .select('*, customers(first_name, last_name, suburb, phone, email, address)')
      .single()

    if (data) setInvoices(prev => [data as Invoice, ...prev])

    setShowForm(false)
    setForm({
      customer_id: '',
      due_date: '',
      notes: '',
      tax_rate: '10',
      line_items: [{ description: '', qty: 1, unit_price: 0 }],
    })
    setSaving(false)
  }

  async function updateStatus(id: string, status: string) {
    const update: any = { status }
    if (status === 'paid') update.paid_at = new Date().toISOString()

    await supabase.from('invoices').update(update).eq('id', id)

    setInvoices(prev => prev.map(inv => (inv.id === id ? { ...inv, ...update } : inv)))
    if (viewingInvoice?.id === id) setViewingInvoice(prev => (prev ? { ...prev, ...update } : prev))
  }

  async function handleDeleteInvoice(id: string) {
    const confirmed = window.confirm('Delete this invoice? This cannot be undone.')
    if (!confirmed) return

    setDeletingInvoiceId(id)

    const { error } = await supabase.from('invoices').delete().eq('id', id)

    if (!error) {
      setInvoices(prev => prev.filter(inv => inv.id !== id))
      if (viewingInvoice?.id === id) setViewingInvoice(null)
    }

    setDeletingInvoiceId(null)
  }

  const searched = invoices.filter(inv => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    const customer = `${inv.customers?.first_name || ''} ${inv.customers?.last_name || ''}`.toLowerCase()
    const number = (inv.invoice_number || '').toLowerCase()
    const suburb = (inv.customers?.suburb || '').toLowerCase()
    const notes = (inv.notes || '').toLowerCase()
    return customer.includes(term) || number.includes(term) || suburb.includes(term) || notes.includes(term)
  })

  const filtered = filterStatus === 'all' ? searched : searched.filter(inv => inv.status === filterStatus)
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const totalOutstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (i.total - i.amount_paid), 0)
  const totalOverdue = invoices.filter(i => i.status === 'overdue').length

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const now = new Date()
  const startCurrent30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  const startPrev30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60)

  function inRange(dateStr?: string | null, start?: Date, end?: Date) {
    if (!dateStr) return false
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    return d >= start! && d < end!
  }

  const currentTotalInvoices = invoices.filter(i => inRange(i.created_at, startCurrent30, now)).length
  const prevTotalInvoices = invoices.filter(i => inRange(i.created_at, startPrev30, startCurrent30)).length
  const currentRevenue = invoices
    .filter(i => i.status === 'paid' && inRange(i.created_at, startCurrent30, now))
    .reduce((s, i) => s + i.total, 0)
  const prevRevenue = invoices
    .filter(i => i.status === 'paid' && inRange(i.created_at, startPrev30, startCurrent30))
    .reduce((s, i) => s + i.total, 0)
  const currentOutstanding = invoices
    .filter(i => (i.status === 'sent' || i.status === 'overdue') && inRange(i.created_at, startCurrent30, now))
    .reduce((s, i) => s + (i.total - i.amount_paid), 0)
  const prevOutstanding = invoices
    .filter(i => (i.status === 'sent' || i.status === 'overdue') && inRange(i.created_at, startPrev30, startCurrent30))
    .reduce((s, i) => s + (i.total - i.amount_paid), 0)
  const currentOverdue = invoices.filter(i => i.status === 'overdue' && inRange(i.created_at, startCurrent30, now)).length
  const prevOverdue = invoices.filter(i => i.status === 'overdue' && inRange(i.created_at, startPrev30, startCurrent30)).length

  const topCards = [
    {
      label: 'Total invoices',
      value: invoices.length.toLocaleString('en-AU'),
      delta: formatDelta(pctChange(currentTotalInvoices, prevTotalInvoices)),
      up: pctChange(currentTotalInvoices, prevTotalInvoices) >= 0,
    },
    {
      label: 'Revenue collected',
      value: `$${totalRevenue.toFixed(0)}`,
      delta: formatDelta(pctChange(currentRevenue, prevRevenue)),
      up: pctChange(currentRevenue, prevRevenue) >= 0,
    },
    {
      label: 'Outstanding',
      value: `$${totalOutstanding.toFixed(0)}`,
      delta: formatDelta(pctChange(currentOutstanding, prevOutstanding)),
      up: pctChange(currentOutstanding, prevOutstanding) >= 0,
    },
    {
      label: 'Overdue',
      value: totalOverdue.toLocaleString('en-AU'),
      delta: formatDelta(pctChange(currentOverdue, prevOverdue)),
      up: pctChange(currentOverdue, prevOverdue) >= 0,
    },
  ]

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
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
  }

  const btnMobileSm: React.CSSProperties = {
    height: '36px',
    padding: '0 10px',
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
    gap: '5px',
    flex: 1,
  }

  const btnMobileDark: React.CSSProperties = {
    ...btnMobileSm,
    background: TEXT,
    border: `1px solid ${TEXT}`,
    color: WHITE,
  }

  const sectionHeaderTitle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 800,
    color: TEXT,
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  }

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
    boxSizing: 'border-box',
  }

  const lbl: React.CSSProperties = {
    ...TYPE.label,
    marginBottom: '6px',
    display: 'block',
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
      <Sidebar active="/dashboard/invoices" />

      <div style={{ flex: 1, minWidth: 0, background: BG }}>
        <div
          style={{
            padding: isMobile ? '12px' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
          }}
        >
          {isMobile ? (
            <div style={{ margin: '-12px -12px 0', overflow: 'hidden', background: WHITE }}>
              <div
                style={{
                  background: WHITE,
                  padding: '16px 16px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ flexShrink: 0, minWidth: 0 }}>
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
                    Invoices
                  </h1>
                </div>
              </div>

              <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', gap: '8px', padding: '0 16px 16px' }}>
                  <button onClick={() => setShowForm(true)} style={btnMobileDark}>
                    <IconSpark size={12} /> New invoice
                  </button>
                  <button onClick={() => router.push('/dashboard/revenue')} style={btnMobileSm}>
                    <IconRevenue size={12} /> Revenue
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', gap: 0 }}>
                <div style={{ width: 4, background: TEAL, alignSelf: 'stretch', borderRadius: 0, flexShrink: 0, marginRight: 20 }} />

                <div style={{ flexShrink: 0, minWidth: 0 }}>
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
                    Invoices
                  </h1>
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => router.push('/dashboard/revenue')} style={btnOutline}>
                    <IconRevenue size={14} />
                    View revenue
                  </button>

                  <button
                    onClick={() => setShowForm(true)}
                    style={{
                      height: '34px',
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
                      borderRadius: '9px',
                    }}
                  >
                    <IconSpark size={14} />
                    New invoice
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            {topCards.map(item => (
              <div
                key={item.label}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '14px',
                  padding: isMobile ? '10px 10px' : '10px 14px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  minHeight: isMobile ? '70px' : '68px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {isMobile ? (
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: TEXT3,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {item.label}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                        {item.value}
                      </div>

                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          padding: '3px 7px',
                          borderRadius: '999px',
                          background: item.up ? '#E6F7F6' : '#FFF0EE',
                          color: item.up ? TEAL_DARK : '#C0392B',
                          fontSize: '9px',
                          fontWeight: 800,
                          flexShrink: 0,
                          alignSelf: 'flex-end',
                          marginTop: '2px',
                        }}
                      >
                        {item.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}
                        {item.delta}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: TEXT3,
                          marginBottom: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.label}
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                        {item.value}
                      </div>
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        padding: '3px 7px',
                        borderRadius: '999px',
                        background: item.up ? '#E6F7F6' : '#FFF0EE',
                        color: item.up ? TEAL_DARK : '#C0392B',
                        fontSize: '9px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {item.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}
                      {item.delta}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', alignItems: 'start' }}>
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
                  <div style={sectionHeaderTitle}>Invoice list</div>
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
                      placeholder="Search invoices..."
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
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
                        gap: '6px',
                        flexShrink: 0,
                      }}
                    >
                      <IconFilter size={14} />
                      {filtered.length} shown
                    </div>

                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      style={{
                        flex: isMobile ? 1 : 'unset',
                        minWidth: isMobile ? 0 : '180px',
                        width: isMobile ? '100%' : '180px',
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '10px',
                        border: `1px solid ${BORDER}`,
                        background: WHITE,
                        color: TEXT2,
                        fontSize: '12px',
                        fontWeight: 700,
                        fontFamily: FONT,
                        outline: 'none',
                      }}
                    >
                      <option value="all">All ({invoices.length})</option>
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {!loading && filtered.length > 0 && !isMobile ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 2.1fr) minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.25fr) 96px',
                    gap: '12px',
                    padding: '12px 18px',
                    background: '#FCFCFD',
                    borderBottom: `1px solid ${BORDER}`,
                    alignItems: 'center',
                  }}
                >
                  <div style={TYPE.label}>Customer</div>
                  <div style={TYPE.label}>Invoice</div>
                  <div style={TYPE.label}>Created</div>
                  <div style={TYPE.label}>Due date</div>
                  <div style={TYPE.label}>Status update</div>
                  <div style={{ ...TYPE.label, textAlign: 'right' }}>Total</div>
                </div>
              ) : null}

              {loading ? (
                <div
                  style={{
                    padding: '32px 18px',
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '13px',
                  }}
                >
                  Loading...
                </div>
              ) : filtered.length === 0 ? (
                <div
                  style={{
                    padding: '32px 18px',
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '13px',
                  }}
                >
                  No invoices yet.{' '}
                  <span
                    style={{ color: TEAL, cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => setShowForm(true)}
                  >
                    Create your first
                  </span>
                </div>
              ) : (
                <div style={{ display: 'grid' }}>
                  {filtered.map(inv => {
                    const isAutoOverdue = inv.status === 'sent' && inv.due_date && new Date(inv.due_date) < new Date()
                    const statusKey = isAutoOverdue ? 'overdue' : inv.status
                    const st = STATUS_STYLES[statusKey] || STATUS_STYLES.draft

                    if (isMobile) {
                      return (
                        <div
                          key={inv.id}
                          onClick={() => setViewingInvoice(inv)}
                          style={{
                            borderTop: `1px solid ${BORDER}`,
                            cursor: 'pointer',
                            background: WHITE,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                          onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                        >
                          <div style={{ padding: '14px 16px' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '12px',
                                marginBottom: '12px',
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    ...TYPE.label,
                                    marginBottom: '6px',
                                    color: st.color,
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                  }}
                                >
                                  {inv.invoice_number}
                                </div>
                                <div
                                  style={{
                                    fontSize: '15px',
                                    fontWeight: 800,
                                    color: TEXT,
                                    lineHeight: 1.2,
                                    marginBottom: '4px',
                                  }}
                                >
                                  {inv.customers?.first_name} {inv.customers?.last_name}
                                </div>
                                <div style={{ ...TYPE.bodySm, fontSize: '12px', color: TEXT2 }}>
                                  {inv.customers?.suburb || 'No suburb'}
                                </div>
                              </div>

                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  handleDeleteInvoice(inv.id)
                                }}
                                disabled={deletingInvoiceId === inv.id}
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '10px',
                                  border: `1px solid ${BORDER}`,
                                  background: WHITE,
                                  color: RED,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  opacity: deletingInvoiceId === inv.id ? 0.6 : 1,
                                }}
                              >
                                <IconTrash size={14} />
                              </button>
                            </div>

                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '10px',
                              }}
                            >
                              <div
                                style={{
                                  background: '#F8FAFC',
                                  border: `1px solid ${BORDER}`,
                                  borderRadius: '12px',
                                  padding: '12px',
                                }}
                              >
                                <div style={{ ...TYPE.label, marginBottom: '6px' }}>Total</div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>${inv.total.toFixed(2)}</div>
                              </div>

                              <div
                                style={{
                                  background: '#F8FAFC',
                                  border: `1px solid ${BORDER}`,
                                  borderRadius: '12px',
                                  padding: '12px',
                                }}
                              >
                                <div style={{ ...TYPE.label, marginBottom: '6px' }}>Due date</div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: isAutoOverdue ? RED : TEXT }}>
                                  {inv.due_date
                                    ? new Date(inv.due_date).toLocaleDateString('en-AU', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    : '—'}
                                </div>
                              </div>

                              <div
                                style={{
                                  background: '#F8FAFC',
                                  border: `1px solid ${BORDER}`,
                                  borderRadius: '12px',
                                  padding: '12px',
                                  gridColumn: 'span 2',
                                }}
                              >
                                <div style={{ ...TYPE.label, marginBottom: '6px' }}>Status update</div>
                                <select
                                  value={inv.status}
                                  onClick={e => e.stopPropagation()}
                                  onChange={e => updateStatus(inv.id, e.target.value)}
                                  style={{
                                    width: '100%',
                                    height: '34px',
                                    padding: '0 10px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: st.bg,
                                    color: st.color,
                                    fontSize: '12px',
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
                            </div>

                            {inv.notes ? (
                              <div
                                style={{
                                  marginTop: '12px',
                                  background: '#FCFCFD',
                                  border: `1px solid ${BORDER}`,
                                  borderRadius: '12px',
                                  padding: '13px 14px',
                                }}
                              >
                                <div style={{ ...TYPE.label, marginBottom: '6px' }}>Notes</div>
                                <div style={{ ...TYPE.bodySm, fontSize: '12px', color: TEXT2, lineHeight: 1.7 }}>{inv.notes}</div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={inv.id}
                        onClick={() => setViewingInvoice(inv)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '6px minmax(0, 1fr)',
                          borderTop: `1px solid ${BORDER}`,
                          cursor: 'pointer',
                          background: WHITE,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                        onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                      >
                        <div style={{ background: st.accent }} />

                        <div style={{ padding: '0 18px' }}>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(0, 2.1fr) minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.25fr) 96px',
                              gap: '12px',
                              alignItems: 'center',
                              minHeight: inv.notes ? '90px' : '74px',
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, lineHeight: 1.2, marginBottom: '4px' }}>
                                {inv.customers?.first_name} {inv.customers?.last_name}
                              </div>
                              <div style={{ ...TYPE.bodySm, fontSize: '12px', color: TEXT2, marginBottom: '3px' }}>
                                {inv.customers?.suburb || 'No suburb'}
                              </div>
                              {inv.notes ? (
                                <div
                                  style={{
                                    fontSize: '11px',
                                    color: TEXT3,
                                    lineHeight: 1.45,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%',
                                  }}
                                >
                                  {inv.notes}
                                </div>
                              ) : null}
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  ...TYPE.label,
                                  marginBottom: '5px',
                                  color: st.color,
                                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                }}
                              >
                                {inv.invoice_number}
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>{st.label}</div>
                            </div>

                            <div>
                              <div style={{ ...TYPE.label, marginBottom: '5px' }}>Created</div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>
                                {new Date(inv.created_at).toLocaleDateString('en-AU', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                            </div>

                            <div>
                              <div style={{ ...TYPE.label, marginBottom: '5px' }}>Due date</div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: isAutoOverdue ? RED : TEXT2 }}>
                                {inv.due_date
                                  ? new Date(inv.due_date).toLocaleDateString('en-AU', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : '—'}
                              </div>
                            </div>

                            <div onClick={e => e.stopPropagation()}>
                              <select
                                value={inv.status}
                                onChange={e => updateStatus(inv.id, e.target.value)}
                                style={{
                                  width: '100%',
                                  height: '36px',
                                  padding: '0 10px',
                                  borderRadius: '10px',
                                  border: 'none',
                                  background: st.bg,
                                  color: st.color,
                                  fontSize: '12px',
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

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ ...TYPE.label, marginBottom: '5px' }}>Total</div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>${inv.total.toFixed(2)}</div>
                              </div>

                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  handleDeleteInvoice(inv.id)
                                }}
                                disabled={deletingInvoiceId === inv.id}
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '10px',
                                  border: `1px solid ${BORDER}`,
                                  background: WHITE,
                                  color: RED,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  opacity: deletingInvoiceId === inv.id ? 0.6 : 1,
                                }}
                              >
                                <IconTrash size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
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
              maxWidth: '680px',
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
                <div style={{ ...TYPE.section, color: TEAL, marginBottom: '2px' }}>Create</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: TEXT }}>New invoice</div>
                <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Create a draft invoice and save it to your records.</div>
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

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Due date</label>
                  <input type="date" style={inp} value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>GST rate (%)</label>
                  <input type="number" style={inp} value={form.tax_rate} onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))} placeholder="10" />
                </div>
              </div>

              <div>
                <label style={lbl}>Line items</label>
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 60px 90px 32px',
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
                          fontWeight: 700,
                          color: TEXT3,
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                        }}
                      >
                        {h}
                      </div>
                    ))}
                  </div>

                  {form.line_items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 60px 90px 32px',
                        padding: '8px 12px',
                        borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}`,
                        alignItems: 'center',
                      }}
                    >
                      <input
                        style={{ ...inp, height: '32px', border: 'none', background: 'transparent', padding: '0 8px' }}
                        value={item.description}
                        onChange={e => setLine(idx, 'description', e.target.value)}
                        placeholder="e.g. Split system installation"
                      />
                      <input
                        type="number"
                        style={{ ...inp, height: '32px', border: 'none', background: 'transparent', padding: '0 8px' }}
                        value={item.qty}
                        onChange={e => setLine(idx, 'qty', e.target.value)}
                        min="1"
                      />
                      <input
                        type="number"
                        style={{ ...inp, height: '32px', border: 'none', background: 'transparent', padding: '0 8px' }}
                        value={item.unit_price}
                        onChange={e => setLine(idx, 'unit_price', e.target.value)}
                        placeholder="0.00"
                      />
                      <button
                        onClick={() => removeLine(idx)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: RED, fontSize: '18px', lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <div style={{ padding: '10px 12px', borderTop: `1px solid ${BORDER}`, background: WHITE }}>
                    <button
                      onClick={addLine}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEAL, fontSize: '13px', fontFamily: FONT, fontWeight: 700 }}
                    >
                      + Add line
                    </button>
                  </div>
                </div>
              </div>

              {(() => {
                const taxRate = parseFloat(form.tax_rate) || 10
                const { subtotal, tax_amount, total } = calcTotals(form.line_items, taxRate)

                return (
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
                      <span style={{ fontSize: '13px', color: TEXT, fontWeight: 700 }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', color: TEXT3, fontWeight: 500 }}>GST ({taxRate}%)</span>
                      <span style={{ fontSize: '13px', color: TEXT, fontWeight: 700 }}>${tax_amount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${BORDER}`, paddingTop: '10px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: TEXT }}>Total</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: TEXT }}>${total.toFixed(2)}</span>
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
                  placeholder="Payment terms, bank details, etc."
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
                    fontWeight: 600,
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
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: FONT,
                    opacity: !form.customer_id ? 0.5 : 1,
                  }}
                >
                  {saving ? 'Saving...' : 'Create invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingInvoice && (
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
              maxWidth: '720px',
              maxHeight: '92vh',
              overflow: 'auto',
              border: `1px solid ${BORDER}`,
              fontFamily: FONT,
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: TEXT,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  {viewingInvoice.invoice_number}
                </div>

                <select
                  value={viewingInvoice.status}
                  onChange={e => updateStatus(viewingInvoice.id, e.target.value)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    background: STATUS_STYLES[viewingInvoice.status]?.bg,
                    color: STATUS_STYLES[viewingInvoice.status]?.color,
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleDeleteInvoice(viewingInvoice.id)
                  }}
                  disabled={deletingInvoiceId === viewingInvoice.id}
                  style={{
                    height: '34px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: `1px solid ${BORDER}`,
                    background: WHITE,
                    color: RED,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: FONT,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    opacity: deletingInvoiceId === viewingInvoice.id ? 0.6 : 1,
                  }}
                >
                  <IconTrash size={14} />
                  Delete
                </button>

                <button
                  onClick={() => window.print()}
                  style={{
                    height: '34px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: `1px solid ${BORDER}`,
                    background: WHITE,
                    color: TEXT2,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: FONT,
                  }}
                >
                  Print
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
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
            </div>

            <div style={{ padding: '32px 36px' }} id="invoice-print">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '36px',
                  gap: '24px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  {businessInfo?.logo_url && (
                    <img
                      src={businessInfo.logo_url}
                      alt="Logo"
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '10px',
                        objectFit: 'contain',
                        marginBottom: '10px',
                        border: `1px solid ${BORDER}`,
                      }}
                    />
                  )}
                  <div style={{ fontSize: '18px', fontWeight: 800, color: TEXT, letterSpacing: '-0.4px' }}>
                    {businessInfo?.name || 'Your Business'}
                  </div>
                  {businessInfo?.phone && <div style={{ fontSize: '13px', color: TEXT3, marginTop: '3px' }}>{businessInfo.phone}</div>}
                  {businessInfo?.email && <div style={{ fontSize: '13px', color: TEXT3, marginTop: '2px' }}>{businessInfo.email}</div>}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: TEAL, letterSpacing: '-0.6px', marginBottom: '6px' }}>INVOICE</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: TEXT, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    {viewingInvoice.invoice_number}
                  </div>
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

              <div style={{ marginBottom: '28px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: TEXT3,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginBottom: '8px',
                  }}
                >
                  Bill to
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: TEXT }}>
                  {viewingInvoice.customers?.first_name} {viewingInvoice.customers?.last_name}
                </div>
                {viewingInvoice.customers?.address && <div style={{ fontSize: '13px', color: TEXT2, marginTop: '2px' }}>{viewingInvoice.customers.address}</div>}
                {viewingInvoice.customers?.suburb && <div style={{ fontSize: '13px', color: TEXT2, marginTop: '1px' }}>{viewingInvoice.customers.suburb}</div>}
                {viewingInvoice.customers?.phone && <div style={{ fontSize: '13px', color: TEXT3, marginTop: '3px' }}>{viewingInvoice.customers.phone}</div>}
                {viewingInvoice.customers?.email && <div style={{ fontSize: '13px', color: TEXT3, marginTop: '1px' }}>{viewingInvoice.customers.email}</div>}
              </div>

              <div style={{ border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 100px 100px',
                    background: '#F8FAFC',
                    padding: '10px 16px',
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                >
                  {['Description', 'Qty', 'Unit price', 'Total'].map(h => (
                    <div
                      key={h}
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: TEXT3,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        textAlign: h !== 'Description' ? 'right' : 'left',
                      }}
                    >
                      {h}
                    </div>
                  ))}
                </div>

                {viewingInvoice.line_items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 80px 100px 100px',
                      padding: '12px 16px',
                      borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}`,
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ fontSize: '14px', color: TEXT, fontWeight: 500 }}>{item.description}</div>
                    <div style={{ fontSize: '13px', color: TEXT2, textAlign: 'right' }}>{item.qty}</div>
                    <div style={{ fontSize: '13px', color: TEXT2, textAlign: 'right' }}>${item.unit_price.toFixed(2)}</div>
                    <div style={{ fontSize: '13px', color: TEXT, fontWeight: 700, textAlign: 'right' }}>
                      ${(item.qty * item.unit_price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
                <div style={{ width: '260px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ fontSize: '13px', color: TEXT3 }}>Subtotal</span>
                    <span style={{ fontSize: '13px', color: TEXT, fontWeight: 700 }}>${viewingInvoice.subtotal?.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${BORDER}`, marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: TEXT3 }}>GST ({viewingInvoice.tax_rate}%)</span>
                    <span style={{ fontSize: '13px', color: TEXT, fontWeight: 700 }}>${viewingInvoice.tax_amount?.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', background: TEAL, borderRadius: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: WHITE }}>Total</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: WHITE }}>${viewingInvoice.total?.toFixed(2)}</span>
                  </div>
                  {viewingInvoice.status === 'paid' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', marginTop: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#166534', fontWeight: 700 }}>Paid</span>
                      {viewingInvoice.paid_at && (
                        <span style={{ fontSize: '12px', color: TEXT3 }}>
                          {new Date(viewingInvoice.paid_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {(businessSettings?.bank_name || businessSettings?.bsb || businessSettings?.account_number) && (
                <div
                  style={{
                    background: '#F8FAFC',
                    border: `1px solid ${BORDER}`,
                    borderRadius: '12px',
                    padding: '18px 20px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: TEXT3,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      marginBottom: '12px',
                    }}
                  >
                    Payment details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
                    {businessSettings.bank_name && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: TEXT3, fontWeight: 500, width: '100px', flexShrink: 0 }}>Bank</span>
                        <span style={{ fontSize: '13px', color: TEXT, fontWeight: 700 }}>{businessSettings.bank_name}</span>
                      </div>
                    )}
                    {businessSettings.account_name && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: TEXT3, fontWeight: 500, width: '100px', flexShrink: 0 }}>Account name</span>
                        <span style={{ fontSize: '13px', color: TEXT, fontWeight: 700 }}>{businessSettings.account_name}</span>
                      </div>
                    )}
                    {businessSettings.bsb && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: TEXT3, fontWeight: 500, width: '100px', flexShrink: 0 }}>BSB</span>
                        <span style={{ fontSize: '13px', color: TEXT, fontWeight: 700, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                          {businessSettings.bsb}
                        </span>
                      </div>
                    )}
                    {businessSettings.account_number && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: TEXT3, fontWeight: 500, width: '100px', flexShrink: 0 }}>Account no.</span>
                        <span style={{ fontSize: '13px', color: TEXT, fontWeight: 700, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                          {businessSettings.account_number}
                        </span>
                      </div>
                    )}
                    {businessSettings.payment_terms && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: TEXT3, fontWeight: 500, width: '100px', flexShrink: 0 }}>Terms</span>
                        <span style={{ fontSize: '13px', color: TEXT, fontWeight: 700 }}>Due within {businessSettings.payment_terms} days</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(viewingInvoice.notes || businessSettings?.invoice_notes) && (
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '18px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: TEXT3,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      marginBottom: '8px',
                    }}
                  >
                    Notes
                  </div>
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