'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Select } from '@/components/Select'
import { BTN, ConfirmDialog, FIELD, LABEL, Modal, RED, TEXT2, TEXT3, useIsPhone } from '@/components/forms'
import { money } from '@/lib/format'
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory, dateKey, gstInside, parseAmount } from '@/lib/expenses'

type Props = {
  businessId: string
  jobId: string
  /** The cost being changed, or null for a new one */
  cost: Expense | null
  layer?: number
  onClose: () => void
  onSaved: (c: Expense) => void
  onDeleted: (id: string) => void
}

const COLUMNS = 'id, business_id, spent_on, description, supplier, category, amount, gst, job_id, created_at'

/** Add or change one cost on a job. The amount is typed as paid; the GST inside it is worked out and kept alongside. */
export function JobCostModal({ businessId, jobId, cost, layer, onClose, onSaved, onDeleted }: Props) {
  const phone = useIsPhone()
  const [description, setDescription] = useState(cost?.description || '')
  const [supplier, setSupplier] = useState(cost?.supplier || '')
  const [category, setCategory] = useState<ExpenseCategory>(cost?.category || 'materials')
  const [amountText, setAmountText] = useState(cost ? String(cost.amount) : '')
  const [includesGst, setIncludesGst] = useState(cost ? Number(cost.gst) > 0 : true)
  const [spentOn, setSpentOn] = useState(cost?.spent_on || dateKey(new Date()))
  const [saving, setSaving] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [error, setError] = useState('')

  const amount = parseAmount(amountText)
  const gst = amount !== null && includesGst ? gstInside(amount) : null

  async function save() {
    setError('')
    if (!description.trim()) return setError('Say what it was for.')
    if (amount === null || amount <= 0) return setError('Enter the amount paid.')
    if (!spentOn) return setError('Choose the date.')
    setSaving(true)
    const row = { description: description.trim(), supplier: supplier.trim() || null, category, amount, gst, spent_on: spentOn, job_id: jobId }
    const res = cost
      ? await supabase.from('expenses').update(row).eq('id', cost.id).select(COLUMNS).single()
      : await supabase.from('expenses').insert({ ...row, business_id: businessId }).select(COLUMNS).single()
    setSaving(false)
    if (res.error || !res.data) {
      setError(res.error?.message || 'Could not save the cost.')
      return
    }
    onSaved(res.data as unknown as Expense)
  }

  async function remove() {
    if (!cost) return
    setSaving(true)
    const { error: err } = await supabase.from('expenses').delete().eq('id', cost.id)
    setSaving(false)
    setConfirmRemove(false)
    if (err) {
      setError(err.message)
      return
    }
    onDeleted(cost.id)
  }

  return (
    <>
      <Modal
        title={cost ? 'Edit cost' : 'Add a cost'}
        size="md"
        layer={layer}
        busy={saving}
        onClose={onClose}
        footer={
          <>
            <span style={{ marginRight: 'auto', alignSelf: 'center', fontSize: 12, color: RED, minWidth: 0 }}>{error}</span>
            {cost && (
              <button type="button" onClick={() => setConfirmRemove(true)} disabled={saving} style={BTN.danger}>
                Delete
              </button>
            )}
            <button type="button" onClick={onClose} disabled={saving} style={BTN.secondary}>Cancel</button>
            <button type="button" onClick={save} disabled={saving} style={{ ...BTN.primary, ...(saving ? BTN.disabled : {}) }}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={LABEL}>What was it for *</label>
            <input style={FIELD} value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Copper pipe and fittings" maxLength={200} autoFocus={!phone} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL}>Amount paid *</label>
              <input style={FIELD} inputMode="decimal" value={amountText} onChange={e => setAmountText(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label style={LABEL}>Date</label>
              <input type="date" style={FIELD} value={spentOn} onChange={e => setSpentOn(e.target.value)} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: TEXT2, cursor: 'pointer', lineHeight: 1.45 }}>
            <input type="checkbox" checked={includesGst} onChange={e => setIncludesGst(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2AA198', marginTop: 1, flexShrink: 0 }} />
            <span>
              The amount includes GST
              <span style={{ display: 'block', fontSize: 12, color: TEXT3, minHeight: 18 }}>
                {amount === null ? 'GST is one eleventh of the amount paid.' : includesGst && gst !== null ? `${money(gst)} GST, so ${money(amount - gst)} without it.` : 'No GST on this one.'}
              </span>
            </span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: phone ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL}>Category</label>
              <Select style={FIELD} value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)}>
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label style={LABEL}>Supplier (optional)</label>
              <input style={FIELD} value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="e.g. Reece" maxLength={120} />
            </div>
          </div>
        </div>
      </Modal>

      {confirmRemove && cost && (
        <ConfirmDialog
          title="Delete this cost?"
          message={`${cost.description} will be removed from the job. This cannot be undone.`}
          busy={saving}
          busyLabel="Deleting..."
          layer={(layer ?? 400) + 50}
          onCancel={() => setConfirmRemove(false)}
          onConfirm={remove}
        />
      )}
    </>
  )
}
