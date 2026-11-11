'use client'

import React, { useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Select } from '@/components/Select'
import { BTN, ConfirmDialog, FIELD, LABEL, Modal, RED, TEXT2, TEXT3, useIsPhone } from '@/components/forms'
import { getEquipmentLabel } from '@/lib/industry-config'
import { money } from '@/lib/format'
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory, dateKey, gstInside, parseAmount } from '@/lib/expenses'

export type JobOption = { id: string; brand?: string | null; model?: string | null; equipment_type?: string | null; customers?: { first_name?: string | null; last_name?: string | null } | null }

export const jobLabel = (j: JobOption) => {
  const unit = [j.brand, j.model].filter(Boolean).join(' ') || getEquipmentLabel(j.equipment_type) || 'Job'
  const who = [j.customers?.first_name, j.customers?.last_name].filter(Boolean).join(' ')
  return who ? `${unit} - ${who}` : unit
}

type Props = {
  businessId: string
  /** The expense being changed, or null for a new one */
  expense: Expense | null
  jobs: JobOption[]
  /** A job to attach a new expense to (when added from a job) */
  presetJobId?: string | null
  layer?: number
  onClose: () => void
  onSaved: (e: Expense) => void
  onDeleted?: (id: string) => void
}

const COLUMNS = 'id, business_id, spent_on, description, supplier, category, amount, gst, job_id, created_at'

/** Add or change one expense. Amounts are typed as paid; the GST inside is worked out and kept alongside. */
export function ExpenseModal({ businessId, expense, jobs, presetJobId, layer, onClose, onSaved, onDeleted }: Props) {
  const phone = useIsPhone()
  const [description, setDescription] = useState(expense?.description || '')
  const [supplier, setSupplier] = useState(expense?.supplier || '')
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category || 'materials')
  const [amountText, setAmountText] = useState(expense ? String(expense.amount) : '')
  const [includesGst, setIncludesGst] = useState(expense ? Number(expense.gst) > 0 : true)
  const [spentOn, setSpentOn] = useState(expense?.spent_on || dateKey(new Date()))
  const [jobId, setJobId] = useState(expense?.job_id || presetJobId || '')
  const [saving, setSaving] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [error, setError] = useState('')

  const amount = parseAmount(amountText)
  const gst = amount !== null && includesGst ? gstInside(amount) : null
  const jobOptions = useMemo(() => [...jobs].sort((a, b) => jobLabel(a).localeCompare(jobLabel(b))), [jobs])

  async function save() {
    setError('')
    if (!description.trim()) return setError('Say what it was for.')
    if (amount === null || amount <= 0) return setError('Enter the amount paid.')
    if (!spentOn) return setError('Choose the date.')
    setSaving(true)
    const row = {
      description: description.trim(),
      supplier: supplier.trim() || null,
      category,
      amount,
      gst,
      spent_on: spentOn,
      job_id: jobId || null,
    }
    const res = expense
      ? await supabase.from('expenses').update(row).eq('id', expense.id).select(COLUMNS).single()
      : await supabase.from('expenses').insert({ ...row, business_id: businessId }).select(COLUMNS).single()
    setSaving(false)
    if (res.error || !res.data) {
      setError(res.error?.message || 'Could not save the expense.')
      return
    }
    onSaved(res.data as unknown as Expense)
  }

  async function remove() {
    if (!expense) return
    setSaving(true)
    const { error: err } = await supabase.from('expenses').delete().eq('id', expense.id)
    setSaving(false)
    setConfirmRemove(false)
    if (err) {
      setError(err.message)
      return
    }
    onDeleted?.(expense.id)
  }

  return (
    <>
    <Modal
      title={expense ? 'Edit expense' : 'Add expense'}
      size="md"
      layer={layer}
      busy={saving}
      onClose={onClose}
      footer={
        <>
          <span style={{ marginRight: 'auto', alignSelf: 'center', fontSize: 12, color: RED, minWidth: 0 }}>{error}</span>
          {expense && onDeleted && (
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

        <div>
          <label style={LABEL}>For a job (optional)</label>
          <Select style={FIELD} value={jobId} onChange={e => setJobId(e.target.value)}>
            <option value="">Not for a specific job</option>
            {jobOptions.map(j => (
              <option key={j.id} value={j.id}>{jobLabel(j)}</option>
            ))}
          </Select>
          <div style={{ fontSize: 12, color: TEXT3, marginTop: 6, lineHeight: 1.5 }}>Costs on a job show up in that job&apos;s profit.</div>
        </div>
      </div>
    </Modal>

    {confirmRemove && expense && (
      <ConfirmDialog
        title="Delete this expense?"
        message={`${expense.description} will be removed. This cannot be undone.`}
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
