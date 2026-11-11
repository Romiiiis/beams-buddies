'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Select } from '@/components/Select'
import { BTN, FIELD, LABEL, LINE, Modal, RED, TEXT2, TEXT3 } from '@/components/forms'
import { money } from '@/lib/format'
import { PAYMENT_METHODS, dateInDays } from '@/lib/documents'

type Props = {
  businessId: string
  invoice: { id: string; invoice_number: string; total: number; amount_paid: number }
  onClose: () => void
  onSaved: () => void
}

/** Records a payment (full or part) against an invoice. The invoice's paid amount and status follow automatically. */
export function RecordPaymentModal({ businessId, invoice, onClose, onSaved }: Props) {
  const balance = Math.max(0, Math.round((Number(invoice.total) - Number(invoice.amount_paid || 0)) * 100) / 100)
  const [amount, setAmount] = useState(balance ? String(balance) : '')
  const [paidOn, setPaidOn] = useState(dateInDays(0))
  const [method, setMethod] = useState('bank_transfer')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const value = parseFloat(amount)
  const valid = Number.isFinite(value) && value > 0

  async function save() {
    if (!valid) {
      setError('Enter the amount received.')
      return
    }
    if (value > balance + 0.005 && balance > 0) {
      setError(`That is more than the ${money(balance)} still owing. Enter ${money(balance)} or less.`)
      return
    }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('invoice_payments').insert({
      business_id: businessId,
      invoice_id: invoice.id,
      amount: Math.round(value * 100) / 100,
      paid_on: paidOn || dateInDays(0),
      method,
      note: note.trim() || null,
    })
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    onSaved()
  }

  return (
    <Modal
      title={`Record payment · ${invoice.invoice_number}`}
      size="sm"
      layer={500}
      busy={saving}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} style={BTN.secondary}>Cancel</button>
          <button type="button" onClick={save} disabled={saving || !valid} style={{ ...BTN.primary, ...(saving || !valid ? BTN.disabled : {}) }}>
            {saving ? 'Saving...' : 'Record payment'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: TEXT2, background: '#F8FAFC', border: `1px solid ${LINE}`, borderRadius: 10, padding: '10px 12px' }}>
          <span>Still owing</span>
          <b>{money(balance)}</b>
        </div>

        <div>
          <label style={LABEL}>Amount received ($) *</label>
          <input type="number" inputMode="decimal" step="0.01" min="0" style={FIELD} value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
          {balance > 0 && value > 0 && value < balance - 0.005 && <div style={{ fontSize: 12, color: TEXT3, marginTop: 6 }}>Part payment. {money(balance - value)} will still be owing.</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={LABEL}>Date received</label>
            <input type="date" style={FIELD} value={paidOn} onChange={e => setPaidOn(e.target.value)} />
          </div>
          <div>
            <label style={LABEL}>Paid by</label>
            <Select style={FIELD} value={method} onChange={e => setMethod(e.target.value)}>
              {PAYMENT_METHODS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <label style={LABEL}>Note (optional)</label>
          <input style={FIELD} value={note} onChange={e => setNote(e.target.value)} placeholder="Receipt number, deposit, etc." maxLength={300} />
        </div>

        {error && <div style={{ fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>{error}</div>}
      </div>
    </Modal>
  )
}
