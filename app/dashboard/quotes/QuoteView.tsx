'use client'

import React from 'react'
import { BTN, BTN_SM, LINE, Modal, TEAL, TEXT, TEXT2, TEXT3, WHITE } from '@/components/forms'
import { money } from '@/lib/format'
import { printElement } from '@/lib/print'

type Item = { description: string; qty: number; unit_price: number }

export type QuoteForView = {
  id: string
  quote_number: string
  status: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes: string | null
  valid_until: string | null
  created_at: string
  line_items: Item[]
  customers: { first_name?: string; last_name?: string; suburb?: string; phone?: string; email?: string; address?: string } | null
}

type Props = {
  quote: QuoteForView
  business: any
  isMobile: boolean
  /** The status dropdown, drawn by the page so it matches the list. */
  statusControl: React.ReactNode
  onClose: () => void
  onDelete: () => void
}

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'
const longDate = (v?: string | null) => {
  if (!v) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v)
  const d = m && v.length === 10 ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(v)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** The quote as a document: who it is for, the lines, the totals and the notes. Same layout as the invoice view. */
export function QuoteView({ quote, business, isMobile, statusControl, onClose, onDelete }: Props) {
  const c = quote.customers
  const items = quote.line_items || []
  const name = `${c?.first_name || ''} ${c?.last_name || ''}`.trim()

  return (
    <Modal
      size="xl"
      flush
      onClose={onClose}
      title={
        <>
          <span style={{ fontSize: 15, fontWeight: 700, color: TEXT, fontFamily: MONO }}>{quote.quote_number}</span>
          {statusControl}
        </>
      }
      headerExtra={
        <>
          <button type="button" onClick={onDelete} style={{ ...BTN.danger, ...BTN_SM }}>Delete</button>
          {!isMobile && (
            <button type="button" onClick={() => printElement('quote-print', quote.quote_number)} style={{ ...BTN.secondary, ...BTN_SM }}>Print</button>
          )}
        </>
      }
    >
      <div style={{ padding: isMobile ? '20px 16px' : '32px 36px' }} id="quote-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? 24 : 36, gap: isMobile ? 16 : 24, flexWrap: 'wrap' }}>
          <div>
            {business?.logo_url && <img src={business.logo_url} alt="Logo" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'contain', marginBottom: 10, border: `1px solid ${LINE}` }} />}
            <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, letterSpacing: '-0.4px' }}>{business?.name || 'Your Business'}</div>
            {business?.abn && <div style={{ fontSize: 13, color: TEXT3, marginTop: 3 }}>ABN {business.abn}</div>}
            {business?.phone && <div style={{ fontSize: 13, color: TEXT3, marginTop: 3 }}>{business.phone}</div>}
            {business?.email && <div style={{ fontSize: 13, color: TEXT3, marginTop: 2 }}>{business.email}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: TEAL, letterSpacing: '-0.6px', marginBottom: 6 }}>QUOTE</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, fontFamily: MONO }}>{quote.quote_number}</div>
            <div style={{ fontSize: 12, color: TEXT3, marginTop: 4 }}>Issued: {longDate(quote.created_at)}</div>
            {quote.valid_until && <div style={{ fontSize: 12, color: TEXT3, marginTop: 2 }}>Valid until: {longDate(quote.valid_until)}</div>}
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Prepared for</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{name || 'Customer'}</div>
          {c?.address && <div style={{ fontSize: 13, color: TEXT2, marginTop: 2 }}>{c.address}</div>}
          {c?.suburb && <div style={{ fontSize: 13, color: TEXT2, marginTop: 1 }}>{c.suburb}</div>}
          {c?.phone && <div style={{ fontSize: 13, color: TEXT3, marginTop: 3 }}>{c.phone}</div>}
          {c?.email && <div style={{ fontSize: 13, color: TEXT3, marginTop: 1 }}>{c.email}</div>}
        </div>

        <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          {isMobile ? (
            items.map((item, idx) => (
              <div key={idx} style={{ padding: '12px 14px', borderTop: idx === 0 ? 'none' : `1px solid ${LINE}` }}>
                <div style={{ fontSize: 14, color: TEXT, fontWeight: 600, overflowWrap: 'anywhere' }}>{item.description}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 13, color: TEXT3 }}>{item.qty} × {money(item.unit_price)}</span>
                  <span style={{ fontSize: 14, color: TEXT, fontWeight: 800 }}>{money(item.qty * item.unit_price)}</span>
                </div>
              </div>
            ))
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 80px 100px 110px', columnGap: 10, background: '#F8FAFC', padding: '10px 16px', borderBottom: `1px solid ${LINE}` }}>
                {['Description', 'Qty', 'Unit price', 'Total'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: h !== 'Description' ? 'right' : 'left' }}>{h}</div>
                ))}
              </div>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 80px 100px 110px', columnGap: 10, padding: '12px 16px', borderTop: idx === 0 ? 'none' : `1px solid ${LINE}`, alignItems: 'center' }}>
                  <div style={{ fontSize: 14, color: TEXT, fontWeight: 500, overflowWrap: 'anywhere' }}>{item.description}</div>
                  <div style={{ fontSize: 13, color: TEXT2, textAlign: 'right' }}>{item.qty}</div>
                  <div style={{ fontSize: 13, color: TEXT2, textAlign: 'right' }}>{money(item.unit_price)}</div>
                  <div style={{ fontSize: 13, color: TEXT, fontWeight: 700, textAlign: 'right' }}>{money(item.qty * item.unit_price)}</div>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
          <div style={{ width: isMobile ? '100%' : 260 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 13, color: TEXT3 }}>Subtotal</span>
              <span style={{ fontSize: 13, color: TEXT, fontWeight: 700 }}>{money(quote.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${LINE}`, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: TEXT3 }}>GST ({quote.tax_rate}%)</span>
              <span style={{ fontSize: 13, color: TEXT, fontWeight: 700 }}>{money(quote.tax_amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', background: TEAL, borderRadius: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: WHITE }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: WHITE }}>{money(quote.total)}</span>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Notes</div>
            <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{quote.notes}</div>
          </div>
        )}
      </div>
    </Modal>
  )
}
