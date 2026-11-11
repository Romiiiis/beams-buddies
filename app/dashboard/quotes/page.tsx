'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserRow } from '@/lib/session'
import { Sidebar } from '@/components/Sidebar'
import { PageSkeleton } from '@/components/Skeleton'
import { StatStrip } from '@/components/StatStrip'
import { HeaderToolbar } from '@/components/HeaderToolbar'
import { useBusinessData } from '@/lib/business-context'
import { getLineItemPlaceholder } from '@/lib/industry-config'
import { AppIcon } from '@/components/AppIcon'
import { DataList, PersonCell, TextCell, StatusSelect } from '@/components/DataList'
import { money } from '@/lib/format'
import { ConfirmDialog, Toast } from '@/components/forms'
import { downloadCsv } from '@/lib/csv'
import { acceptedItems, calcTotals, dateInDays, nextNumber, type PriceItem } from '@/lib/documents'
import { quoteLink } from '@/lib/site'
import { QUOTE_SELECT, QUOTE_STATUS as STATUS_STYLES, customerName, type Quote } from './types'
import { QuoteForm } from './QuoteForm'
import { QuoteView } from './QuoteView'
import { SendQuoteModal } from './SendQuoteModal'

const BG = '#FAFAFA'
const BORDER = '#E8EDF2'
const TEXT = '#0B1220'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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

function pctChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100
  return Math.round(((current - previous) / previous) * 100)
}

export default function QuotesPage() {
  const router = useRouter()
  const { business } = useBusinessData()
  const isMobile = useIsMobile()
  const lineItemPlaceholder = getLineItemPlaceholder(business?.industry)

  const [quotes, setQuotes] = useState<Quote[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<PriceItem[]>([])
  const [businessInfo, setBusinessInfo] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [invoiceByQuote, setInvoiceByQuote] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Quote | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Quote | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')
  const [noticeTone, setNoticeTone] = useState<'dark' | 'error'>('dark')

  const viewing = quotes.find(q => q.id === viewingId) || null
  const sending = quotes.find(q => q.id === sendingId) || null

  function say(msg: string, tone: 'dark' | 'error' = 'dark') {
    setNoticeTone(tone)
    setNotice(msg)
  }

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data: userData } = await getUserRow(session.user.id)
      if (!userData) {
        setLoading(false)
        return
      }
      const bid = userData.business_id
      setBusinessId(bid)

      const [quotesRes, customersRes, productsRes, bizRes, settingsRes, invRes] = await Promise.all([
        supabase.from('quotes').select(QUOTE_SELECT).eq('business_id', bid).order('created_at', { ascending: false }),
        supabase.from('customers').select('id, first_name, last_name, suburb').eq('business_id', bid).order('first_name'),
        supabase.from('products').select('*').eq('business_id', bid).eq('active', true).order('name'),
        supabase.from('businesses').select('*').eq('id', bid).single(),
        supabase.from('business_settings').select('*').eq('business_id', bid).maybeSingle(),
        supabase.from('invoices').select('id, quote_id').eq('business_id', bid).not('quote_id', 'is', null),
      ])

      setQuotes((quotesRes.data as unknown as Quote[]) || [])
      setCustomers(customersRes.data || [])
      setProducts((productsRes.data as PriceItem[]) || [])
      setBusinessInfo(bizRes.data)
      setSettings(settingsRes.data)
      setInvoiceByQuote(Object.fromEntries((invRes.data || []).map((i: any) => [i.quote_id, i.id])))
      setLoading(false)

      // Opened from a link: ?open=<quote id> shows that quote.
      const params = new URLSearchParams(window.location.search)
      const openId = params.get('open')
      if (openId && (quotesRes.data || []).some((q: any) => q.id === openId)) setViewingId(openId)
    }
    load()
  }, [router])

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('quotes').update({ status }).eq('id', id)
    if (error) {
      say('The status could not be changed. Please try again.', 'error')
      return
    }
    setQuotes(prev => prev.map(q => (q.id === id ? { ...q, status } : q)))
  }

  async function deleteQuote(id: string) {
    setDeleting(true)
    const { error } = await supabase.from('quotes').delete().eq('id', id)
    setDeleting(false)
    if (error) {
      // A quote that already has an invoice cannot be deleted from here without orphaning it.
      say(/foreign key|violates/i.test(error.message) ? 'This quote has an invoice, so it cannot be deleted. Delete the invoice first.' : 'The quote could not be deleted.', 'error')
      setDeleteTarget(null)
      return
    }
    setQuotes(prev => prev.filter(q => q.id !== id))
    if (viewingId === id) setViewingId(null)
    setDeleteTarget(null)
  }

  async function copyLink(q: Quote) {
    try {
      await navigator.clipboard.writeText(quoteLink(q.public_token))
      say('Customer link copied.')
    } catch {
      say(quoteLink(q.public_token))
    }
  }

  function scheduleVisit(q: Quote) {
    const what = q.line_items.find(i => !i.optional && i.description.trim())?.description.trim() || 'Job'
    const params = new URLSearchParams({ new: '1', customer: q.customer_id, title: what.slice(0, 100), notes: `From quote ${q.quote_number}` })
    router.push(`/dashboard/calendar?${params.toString()}`)
  }

  // Turns the quote into a draft invoice (accepted extras included, unchosen extras left out) and opens it.
  async function createInvoice(q: Quote) {
    const existing = invoiceByQuote[q.id]
    if (existing) {
      router.push(`/dashboard/invoices?open=${existing}`)
      return
    }
    const { data: nums } = await supabase.from('invoices').select('invoice_number').eq('business_id', businessId)
    const items = acceptedItems(q.line_items, q.accepted_optional || [])
    const t = calcTotals(items, Number(q.tax_rate) || 0)
    const terms = Number(settings?.payment_terms) || 0
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        business_id: businessId,
        customer_id: q.customer_id,
        job_id: q.job_id,
        quote_id: q.id,
        invoice_number: nextNumber((nums || []).map((n: any) => n.invoice_number), 'INV-'),
        status: 'draft',
        line_items: items,
        subtotal: t.subtotal,
        tax_rate: Number(q.tax_rate) || 0,
        tax_amount: t.tax_amount,
        total: t.total,
        amount_paid: 0,
        notes: `From quote ${q.quote_number}.`,
        due_date: terms > 0 ? dateInDays(terms) : null,
      })
      .select('id')
      .single()
    if (error || !data) {
      say('The invoice could not be created. Please try again.', 'error')
      return
    }
    router.push(`/dashboard/invoices?open=${data.id}`)
  }

  function exportCsv() {
    downloadCsv('quotes.csv', [
      ['Quote', 'Customer', 'Status', 'Created', 'Sent', 'Valid until', 'Subtotal', 'GST', 'Total'],
      ...quotes.map(q => [
        q.quote_number,
        customerName(q.customers),
        STATUS_STYLES[q.status]?.label || q.status,
        q.created_at?.slice(0, 10),
        q.sent_at?.slice(0, 10) || '',
        q.valid_until || '',
        q.subtotal,
        q.tax_amount,
        q.total,
      ]),
    ])
  }

  const statusCounts = useMemo(() => {
    const counts = { draft: 0, sent: 0, accepted: 0, declined: 0, expired: 0 }
    quotes.forEach(q => {
      if (counts[q.status as keyof typeof counts] !== undefined) counts[q.status as keyof typeof counts]++
    })
    return counts
  }, [quotes])

  const quoteTabs = [
    { value: 'all', label: 'All quotes', count: quotes.length },
    ...(['draft', 'sent', 'accepted', 'declined', 'expired'] as const).map(k => ({ value: k, label: STATUS_STYLES[k].label, count: statusCounts[k] })),
  ]

  const filtered = useMemo(() => {
    const byStatus = filterStatus === 'all' ? quotes : quotes.filter(q => q.status === filterStatus)
    if (!search.trim()) return byStatus
    const term = search.toLowerCase()
    return byStatus.filter(q => {
      const name = customerName(q.customers).toLowerCase()
      return name.includes(term) || (q.customers?.suburb || '').toLowerCase().includes(term) || (q.quote_number || '').toLowerCase().includes(term) || (q.notes || '').toLowerCase().includes(term)
    })
  }, [quotes, filterStatus, search])

  const now = new Date()
  const startCurrent30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  const startPrev30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60)
  function inRange(dateStr: string | null | undefined, start: Date, end: Date) {
    if (!dateStr) return false
    const d = new Date(dateStr)
    return !isNaN(d.getTime()) && d >= start && d < end
  }
  const count30 = (status?: string) => quotes.filter(q => (!status || q.status === status) && inRange(q.created_at, startCurrent30, now)).length
  const countPrev = (status?: string) => quotes.filter(q => (!status || q.status === status) && inRange(q.created_at, startPrev30, startCurrent30)).length
  const delta = (status?: string) => {
    const d = pctChange(count30(status), countPrev(status))
    return `${d >= 0 ? '+' : ''}${d}% last 30 days`
  }

  const statChips = [
    { label: 'Quotes', value: quotes.length.toLocaleString('en-AU'), sub: delta(), onClick: () => setFilterStatus('all') },
    { label: 'Accepted', value: statusCounts.accepted.toLocaleString('en-AU'), sub: delta('accepted'), onClick: () => setFilterStatus('accepted') },
    { label: 'Sent', value: statusCounts.sent.toLocaleString('en-AU'), sub: delta('sent'), onClick: () => setFilterStatus('sent') },
    { label: 'Draft', value: statusCounts.draft.toLocaleString('en-AU'), sub: delta('draft'), onClick: () => setFilterStatus('draft') },
  ]

  const sender = { name: businessInfo?.name || '', phone: businessInfo?.phone || '', email: businessInfo?.email || '', logoUrl: businessInfo?.logo_url || undefined }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/quotes" />
        <PageSkeleton variant="list" label="Loading quotes" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
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
          <HeaderToolbar
            isMobile={isMobile}
            search={{ value: search, onChange: setSearch, placeholder: 'Search...' }}
            items={[
              ...(!isMobile ? [{ label: 'Export', icon: <AppIcon name="download" size={15} />, onClick: exportCsv }] : []),
              { label: 'New quote', icon: <AppIcon name="add" size={15} />, tone: 'primary' as const, onClick: () => { setEditing(null); setFormOpen(true) } },
            ]}
          />
        </div>

        <div
          className="page-content"
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

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '14px', alignItems: 'start' }}>
            <DataList<Quote>
              title="Quote list"
              isMobile={isMobile}
              rows={filtered}
              rowKey={q => q.id}
              emptyText="No quotes found."
              onRowClick={q => setViewingId(q.id)}
              rowActions={q => [
                { label: 'Open quote', onClick: r => setViewingId(r.id) },
                ...(q.status === 'draft' ? [{ label: 'Send to customer', onClick: (r: Quote) => setSendingId(r.id) }] : []),
                ...(q.status === 'accepted' || q.status === 'sent' ? [{ label: invoiceByQuote[q.id] ? 'Open invoice' : 'Create invoice', onClick: (r: Quote) => createInvoice(r) }] : []),
                ...(q.status !== 'draft' ? [{ label: 'Copy customer link', onClick: (r: Quote) => copyLink(r) }] : []),
                ...(q.status === 'draft' || q.status === 'sent' ? [{ label: 'Edit quote', onClick: (r: Quote) => { setEditing(r); setFormOpen(true) } }] : []),
                { label: 'Delete quote', danger: true, onClick: r => setDeleteTarget(r) },
              ]}
              tabs={quoteTabs}
              activeTab={filterStatus}
              onTabChange={setFilterStatus}
              columns={[
                {
                  key: 'customer',
                  label: 'Customer / Quote',
                  width: 'minmax(0,1.5fr)',
                  render: q => <PersonCell name={customerName(q.customers) || 'Unknown customer'} sub={[q.quote_number, q.customers?.suburb || 'No suburb'].filter(Boolean).join(' · ')} />,
                },
                { key: 'total', label: 'Total', width: '100px', mobileLabel: 'Total', render: q => <TextCell strong>{money(Number(q.total || 0))}</TextCell> },
                {
                  key: 'valid',
                  label: 'Valid until',
                  width: '120px',
                  mobileLabel: 'Valid until',
                  render: q => <TextCell>{q.valid_until ? new Date(q.valid_until).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'}</TextCell>,
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

      {formOpen && (
        <QuoteForm
          businessId={businessId}
          customers={customers}
          products={products}
          placeholder={lineItemPlaceholder}
          isMobile={isMobile}
          existingNumbers={quotes.map(q => q.quote_number)}
          quote={editing}
          onClose={() => setFormOpen(false)}
          onSaved={(saved, isNew) => {
            setQuotes(prev => (isNew ? [saved, ...prev] : prev.map(q => (q.id === saved.id ? saved : q))))
            setFormOpen(false)
            setEditing(null)
            if (isNew) setViewingId(saved.id)
            say(isNew ? `${saved.quote_number} created as a draft.` : 'Quote updated.')
          }}
        />
      )}

      {viewing && (
        <QuoteView
          quote={viewing}
          business={businessInfo}
          settings={settings}
          isMobile={isMobile}
          hasInvoice={!!invoiceByQuote[viewing.id]}
          onClose={() => setViewingId(null)}
          onStatus={s => updateStatus(viewing.id, s)}
          onSend={() => setSendingId(viewing.id)}
          onEdit={() => { setEditing(viewing); setFormOpen(true) }}
          onDelete={() => setDeleteTarget(viewing)}
          onCreateInvoice={() => createInvoice(viewing)}
          onScheduleVisit={() => scheduleVisit(viewing)}
          onCopyLink={() => copyLink(viewing)}
        />
      )}

      {sending && (
        <SendQuoteModal
          quote={sending}
          sender={sender}
          onClose={() => setSendingId(null)}
          onNotice={say}
          onSent={(id, status, sentAt, to) => {
            setQuotes(prev => prev.map(q => (q.id === id ? { ...q, status, sent_at: sentAt } : q)))
            setSendingId(null)
            if (to) say(`Quote sent to ${to}.`)
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Delete ${deleteTarget.quote_number}?`}
          message={<>This will permanently delete the quote for {deleteTarget.customers?.first_name} {deleteTarget.customers?.last_name}. This cannot be undone.</>}
          busy={deleting}
          busyLabel="Deleting..."
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteQuote(deleteTarget.id)}
        />
      )}

      {notice && <Toast message={notice} tone={noticeTone} onClose={() => setNotice('')} />}
    </div>
  )
}
