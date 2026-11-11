'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Select } from '@/components/Select'
import { LineItemsEditor } from '@/components/LineItemsEditor'
import { BTN, FIELD, LABEL, LINE, Modal, RED, TEAL_DARK, TEXT, TEXT3 } from '@/components/forms'
import { money } from '@/lib/format'
import { type LineItem, type PriceItem, calcTotals, dateInDays, nextNumber, optionalExtras, parseRate } from '@/lib/documents'
import { QUOTE_SELECT, type Quote } from './types'

type Props = {
  businessId: string
  customers: { id: string; first_name: string; last_name: string; suburb: string | null }[]
  products: PriceItem[]
  placeholder: string
  isMobile: boolean
  existingNumbers: string[]
  /** The quote being edited, or null for a new one. */
  quote: Quote | null
  onClose: () => void
  onSaved: (quote: Quote, isNew: boolean) => void
}

const BLANK: LineItem = { description: '', qty: 1, unit_price: 0 }

/** Create or edit a quote. Drafts and sent (unanswered) quotes can be edited. */
export function QuoteForm({ businessId, customers, products, placeholder, isMobile, existingNumbers, quote, onClose, onSaved }: Props) {
  const [customerId, setCustomerId] = useState(quote?.customer_id || '')
  const [validUntil, setValidUntil] = useState(quote ? quote.valid_until || '' : dateInDays(30))
  const [taxRate, setTaxRate] = useState(String(quote?.tax_rate ?? 10))
  const [deposit, setDeposit] = useState(quote?.deposit_percent ? String(quote.deposit_percent) : '')
  const [notes, setNotes] = useState(quote?.notes || '')
  const [items, setItems] = useState<LineItem[]>(quote?.line_items?.length ? quote.line_items : [{ ...BLANK }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const rate = parseRate(taxRate)
  const totals = calcTotals(items, rate)
  const extras = optionalExtras(items)
  const depositPct = parseFloat(deposit)
  const depositOk = Number.isFinite(depositPct) && depositPct > 0 && depositPct <= 100
  const locked = quote && quote.status === 'sent'

  async function save() {
    if (!customerId) return
    const clean = items
      .filter(i => i.description.trim() || i.unit_price)
      .map(i => ({ description: i.description.trim(), qty: i.qty, unit_price: i.unit_price, ...(i.optional ? { optional: true } : {}) }))
    if (!clean.length || clean.every(i => !i.description)) {
      setError('Add at least one line with a description.')
      return
    }
    if (clean.every(i => i.optional)) {
      setError('At least one line needs to be a normal line. Optional extras sit on top of the price.')
      return
    }
    if (deposit.trim() && !depositOk) {
      setError('Deposit should be a percentage between 1 and 100, or left blank.')
      return
    }
    setSaving(true)
    setError('')
    const t = calcTotals(clean, rate)
    const payload = {
      customer_id: customerId,
      line_items: clean,
      subtotal: t.subtotal,
      tax_rate: rate,
      tax_amount: t.tax_amount,
      total: t.total,
      notes: notes.trim() || null,
      valid_until: validUntil || null,
      deposit_percent: depositOk ? depositPct : null,
    }
    const res = quote
      ? await supabase.from('quotes').update(payload).eq('id', quote.id).select(QUOTE_SELECT).single()
      : await supabase
          .from('quotes')
          .insert({ ...payload, business_id: businessId, quote_number: nextNumber(existingNumbers, 'Q-'), status: 'draft' })
          .select(QUOTE_SELECT)
          .single()
    setSaving(false)
    if (res.error || !res.data) {
      setError(res.error?.message || 'The quote could not be saved. Please try again.')
      return
    }
    onSaved(res.data as unknown as Quote, !quote)
  }

  return (
    <Modal
      title={quote ? `Edit ${quote.quote_number}` : 'New quote'}
      size="lg"
      busy={saving}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} style={BTN.secondary}>Cancel</button>
          <button type="button" onClick={save} disabled={saving || !customerId} style={{ ...BTN.primary, ...(saving || !customerId ? BTN.disabled : {}) }}>
            {saving ? 'Saving...' : quote ? 'Save changes' : 'Create quote'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {locked && (
          <div style={{ fontSize: 13, color: TEXT3, background: '#F8FAFC', border: `1px solid ${LINE}`, borderRadius: 10, padding: '10px 12px', lineHeight: 1.5 }}>
            This quote has been sent. The customer’s link will show your changes straight away.
          </div>
        )}

        <div>
          <label style={LABEL}>Customer *</label>
          <Select style={FIELD} value={customerId} onChange={e => setCustomerId(e.target.value)} disabled={!!quote}>
            <option value="">Select customer...</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
                {c.suburb ? ` - ${c.suburb}` : ''}
              </option>
            ))}
          </Select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={LABEL}>Valid until</label>
            <input type="date" style={FIELD} value={validUntil} onChange={e => setValidUntil(e.target.value)} />
          </div>
          <div>
            <label style={LABEL}>GST rate (%)</label>
            <input type="number" style={FIELD} value={taxRate} onChange={e => setTaxRate(e.target.value)} placeholder="10" min="0" max="100" />
          </div>
          <div>
            <label style={LABEL}>Deposit (%)</label>
            <input type="number" style={FIELD} value={deposit} onChange={e => setDeposit(e.target.value)} placeholder="None" min="0" max="100" />
          </div>
        </div>

        <div>
          <label style={LABEL}>Line items</label>
          <LineItemsEditor items={items} onChange={setItems} isMobile={isMobile} placeholder={placeholder} products={products} allowOptional />
          <div style={{ fontSize: 12, color: TEXT3, marginTop: 8, lineHeight: 1.5 }}>
            Tick <b>Extra</b> on a line to make it optional. The customer chooses extras on their quote page and the total updates.
          </div>
        </div>

        <div style={{ background: '#F8FAFC', border: `1px solid ${LINE}`, borderRadius: 12, padding: '16px 18px' }}>
          <Row label="Subtotal" value={money(totals.subtotal)} />
          <Row label={`GST (${rate}%)`} value={money(totals.tax_amount)} />
          {extras > 0 && <Row label="Optional extras, if chosen (ex GST)" value={`+${money(extras)}`} muted />}
          {depositOk && <Row label={`Deposit ${depositPct}% to confirm`} value={money((totals.total * depositPct) / 100)} muted />}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${LINE}`, paddingTop: 10, marginTop: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: TEAL_DARK }}>{money(totals.total)}</span>
          </div>
        </div>

        <div>
          <label style={LABEL}>Notes for the customer</label>
          <textarea
            style={{ ...FIELD, minHeight: 84, height: 84, padding: 12, resize: 'vertical' }}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Scope, what is included, how long the work takes..."
          />
        </div>

        {error && <div style={{ fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>{error}</div>}
      </div>
    </Modal>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: TEXT3, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: muted ? TEXT3 : TEXT, fontWeight: 800, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  )
}
