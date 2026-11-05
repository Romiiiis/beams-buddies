'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Select } from '@/components/Select'
import { BTN, FIELD, FIELD_TEXTAREA, LABEL, Modal } from '@/components/forms'

const RED = '#B91C1C'

const JOB_TYPES = [
  { value: 'installation', label: 'Installation' },
  { value: 'service', label: 'Service' },
  { value: 'repair', label: 'Repair' },
  { value: 'quote', label: 'Quote' },
  { value: 'site_visit', label: 'Site visit' },
]

type Props = {
  businessId: string
  isMobile: boolean
  onClose: () => void
  onCreated: (lead: any) => void
}

const EMPTY = {
  customer_name: '',
  phone_number: '',
  address: '',
  suburb: '',
  job_type: '',
  issue_summary: '',
  preferred_date: '',
  preferred_start_time: '',
}

export function AddLeadModal({ businessId, isMobile, onClose, onCreated }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof typeof EMPTY, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customer_name.trim()) {
      setError('Add the customer’s name.')
      return
    }
    setSaving(true)
    setError('')

    const { data, error: insertErr } = await supabase
      .from('leads')
      .insert({
        business_id: businessId,
        status: 'pending',
        customer_name: form.customer_name.trim(),
        phone_number: form.phone_number.trim() || null,
        address: form.address.trim() || null,
        suburb: form.suburb.trim() || null,
        job_type: form.job_type || null,
        issue_summary: form.issue_summary.trim() || null,
        preferred_date: form.preferred_date || null,
        preferred_start_time: form.preferred_start_time || null,
      })
      .select()
      .single()

    setSaving(false)
    if (insertErr || !data) {
      setError(insertErr?.message || 'Could not save the lead.')
      return
    }
    onCreated(data)
  }

  return (
    <Modal
      title="Add lead"
      size="md"
      busy={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <button type="button" onClick={onClose} style={BTN.secondary}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...BTN.primary, ...(saving ? BTN.disabled : {}) }}>
            {saving ? 'Saving…' : 'Add lead'}
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={LABEL} htmlFor="lead-name">Customer name *</label>
          <input id="lead-name" style={FIELD} value={form.customer_name} onChange={e => set('customer_name', e.target.value)} autoFocus={!isMobile} placeholder="Jane Smith" />
        </div>
        <div>
          <label style={LABEL} htmlFor="lead-phone">Phone</label>
          <input id="lead-phone" type="tel" style={FIELD} value={form.phone_number} onChange={e => set('phone_number', e.target.value)} placeholder="0400 000 000" />
        </div>
        <div>
          <label style={LABEL} htmlFor="lead-type">Job type</label>
          <Select id="lead-type" style={FIELD} value={form.job_type} onChange={e => set('job_type', e.target.value)}>
            <option value="">Not sure yet</option>
            {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </div>
        <div>
          <label style={LABEL} htmlFor="lead-address">Address</label>
          <input id="lead-address" style={FIELD} value={form.address} onChange={e => set('address', e.target.value)} placeholder="12 Example St" />
        </div>
        <div>
          <label style={LABEL} htmlFor="lead-suburb">Suburb</label>
          <input id="lead-suburb" style={FIELD} value={form.suburb} onChange={e => set('suburb', e.target.value)} placeholder="Parramatta" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={LABEL} htmlFor="lead-summary">What do they need?</label>
          <textarea
            id="lead-summary"
            style={FIELD_TEXTAREA}
            value={form.issue_summary}
            onChange={e => set('issue_summary', e.target.value)}
            placeholder="e.g. Split system not cooling, wants a quote for a replacement"
          />
        </div>
        <div>
          <label style={LABEL} htmlFor="lead-date">Preferred date</label>
          <input id="lead-date" type="date" style={FIELD} value={form.preferred_date} onChange={e => set('preferred_date', e.target.value)} />
        </div>
        <div>
          <label style={LABEL} htmlFor="lead-time">Preferred time</label>
          <input id="lead-time" type="time" style={FIELD} value={form.preferred_start_time} onChange={e => set('preferred_start_time', e.target.value)} />
        </div>

        {error && (
          <div style={{ gridColumn: '1 / -1', fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>
            {error}
          </div>
        )}
      </div>
    </Modal>
  )
}
