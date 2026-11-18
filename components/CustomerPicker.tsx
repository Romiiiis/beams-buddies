'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Select } from '@/components/Select'
import { BTN, FIELD, LABEL } from '@/components/forms'

// The customer chooser used on every "new quote / new invoice" form. The "+ Add new customer" link sits at the top
// right of the field on purpose: if a customer does not exist yet, you can create one right here without leaving the
// form. Keep this component as the single place for it so every form that picks a customer gets it.

const TEXT = '#0B1220'
const BORDER = '#E8EDF2'
const TEAL_DARK = '#1F857C'
const RED = '#B91C1C'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

type Customer = { id: string; first_name: string; last_name?: string | null; suburb?: string | null; [key: string]: unknown }
const EMPTY = { first_name: '', last_name: '', phone: '', email: '', address: '', suburb: '' }

export function CustomerPicker({
  customers,
  value,
  onChange,
  businessId,
  onCreated,
  isMobile,
  disabled,
  onBusy,
}: {
  customers: Customer[]
  value: string
  onChange: (id: string) => void
  businessId: string
  /** Called with the saved customer so the page can add it to its own list. */
  onCreated: (customer: Customer) => void
  isMobile: boolean
  disabled?: boolean
  /** Lets the parent block Save while a new customer is being saved. */
  onBusy?: (busy: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState(EMPTY)
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft(d => ({ ...d, [k]: e.target.value }))

  async function create() {
    if (!businessId || !draft.first_name.trim()) {
      setError('Add the customer’s first name.')
      return
    }
    setSaving(true)
    onBusy?.(true)
    setError('')
    const { data, error: err } = await supabase
      .from('customers')
      .insert({
        business_id: businessId,
        first_name: draft.first_name.trim(),
        last_name: draft.last_name.trim(),
        phone: draft.phone.trim() || null,
        email: draft.email.trim() || null,
        address: draft.address.trim() || null,
        suburb: draft.suburb.trim() || null,
      })
      .select('id, first_name, last_name, suburb')
      .single()
    setSaving(false)
    onBusy?.(false)
    if (err || !data) {
      setError('The customer could not be saved. Check the details and try again.')
      return
    }
    onCreated(data as Customer)
    onChange(data.id)
    setDraft(EMPTY)
    setOpen(false)
  }

  const field = (label: string, k: keyof typeof EMPTY, o: { type?: string; auto?: string; ph?: string } = {}) => (
    <div>
      <label style={LABEL}>{label}</label>
      <input type={o.type || 'text'} autoComplete={o.auto} value={draft[k]} onChange={set(k)} placeholder={o.ph || label} style={FIELD} />
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 7 }}>
        <label style={{ ...LABEL, marginBottom: 0 }}>Customer *</label>
        <button
          type="button"
          onClick={() => { setOpen(o => !o); setError('') }}
          style={{ border: 0, background: 'none', color: TEAL_DARK, font: `700 12px ${FONT}`, cursor: 'pointer', padding: '4px 0', whiteSpace: 'nowrap' }}
        >
          {open ? 'Choose existing' : '+ Add new customer'}
        </button>
      </div>
      <Select style={FIELD} value={value} disabled={disabled} onChange={e => onChange(e.target.value)}>
        <option value="">Select customer...</option>
        {customers.map(c => (
          <option key={c.id} value={c.id}>
            {c.first_name} {c.last_name}
            {c.suburb ? ` - ${c.suburb}` : ''}
          </option>
        ))}
      </Select>
      {open && (
        <div style={{ marginTop: 12, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14, background: '#F8FAFC', display: 'grid', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>New customer details</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            {field('First name *', 'first_name', { auto: 'given-name', ph: 'First name' })}
            {field('Last name', 'last_name', { auto: 'family-name', ph: 'Last name' })}
            {field('Phone', 'phone', { type: 'tel', auto: 'tel', ph: 'Phone number' })}
            {field('Email', 'email', { type: 'email', auto: 'email', ph: 'Email address' })}
            {field('Street address', 'address', { auto: 'street-address', ph: 'Street address' })}
            {field('Suburb', 'suburb', { auto: 'address-level2', ph: 'Suburb' })}
          </div>
          {error && <div role="alert" style={{ color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '9px 11px', fontSize: 12 }}>{error}</div>}
          <button type="button" onClick={create} disabled={saving || !draft.first_name.trim()} style={{ ...BTN.primary, alignSelf: 'start', ...(saving || !draft.first_name.trim() ? BTN.disabled : {}) }}>
            {saving ? 'Saving customer…' : 'Save and select customer'}
          </button>
        </div>
      )}
    </div>
  )
}
