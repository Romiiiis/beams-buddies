'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

const TEAL = '#2AA198'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const WHITE = '#FFFFFF'
const RED = '#B91C1C'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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

  const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: TEXT2, marginBottom: 6, display: 'block' }
  const input: React.CSSProperties = {
    width: '100%',
    height: 42,
    padding: '0 12px',
    borderRadius: 10,
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT,
    fontSize: 16,
    fontFamily: FONT,
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(11,18,32,0.4)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : 20,
        fontFamily: FONT,
      }}
    >
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-lead-title"
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: isMobile ? '92svh' : '90vh',
          overflowY: 'auto',
          background: WHITE,
          borderRadius: isMobile ? '18px 18px 0 0' : 16,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div id="add-lead-title" style={{ fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>Add lead</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: TEXT3, marginTop: 2 }}>It starts in Pending on the pipeline.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, color: TEXT3, fontSize: 20, lineHeight: 1, cursor: 'pointer', fontFamily: FONT }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label} htmlFor="lead-name">Customer name *</label>
            <input id="lead-name" style={input} value={form.customer_name} onChange={e => set('customer_name', e.target.value)} autoFocus={!isMobile} placeholder="Jane Smith" />
          </div>
          <div>
            <label style={label} htmlFor="lead-phone">Phone</label>
            <input id="lead-phone" type="tel" style={input} value={form.phone_number} onChange={e => set('phone_number', e.target.value)} placeholder="0400 000 000" />
          </div>
          <div>
            <label style={label} htmlFor="lead-type">Job type</label>
            <select id="lead-type" style={{ ...input, appearance: 'none' }} value={form.job_type} onChange={e => set('job_type', e.target.value)}>
              <option value="">Not sure yet</option>
              {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={label} htmlFor="lead-address">Address</label>
            <input id="lead-address" style={input} value={form.address} onChange={e => set('address', e.target.value)} placeholder="12 Example St" />
          </div>
          <div>
            <label style={label} htmlFor="lead-suburb">Suburb</label>
            <input id="lead-suburb" style={input} value={form.suburb} onChange={e => set('suburb', e.target.value)} placeholder="Parramatta" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label} htmlFor="lead-summary">What do they need?</label>
            <textarea
              id="lead-summary"
              style={{ ...input, height: 84, padding: '10px 12px', resize: 'vertical', lineHeight: 1.5 }}
              value={form.issue_summary}
              onChange={e => set('issue_summary', e.target.value)}
              placeholder="e.g. Split system not cooling, wants a quote for a replacement"
            />
          </div>
          <div>
            <label style={label} htmlFor="lead-date">Preferred date</label>
            <input id="lead-date" type="date" style={input} value={form.preferred_date} onChange={e => set('preferred_date', e.target.value)} />
          </div>
          <div>
            <label style={label} htmlFor="lead-time">Preferred time</label>
            <input id="lead-time" type="time" style={input} value={form.preferred_start_time} onChange={e => set('preferred_start_time', e.target.value)} />
          </div>

          {error && (
            <div style={{ gridColumn: '1 / -1', fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>
              {error}
            </div>
          )}
        </div>

        <div
          style={{
            padding: `14px 20px ${isMobile ? 'calc(14px + env(safe-area-inset-bottom))' : '16px'}`,
            borderTop: `1px solid ${BORDER}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            marginTop: 'auto',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{ height: 40, padding: '0 16px', borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ height: 40, padding: '0 18px', borderRadius: 10, border: 'none', background: TEAL, color: WHITE, fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: FONT, flex: isMobile ? 1 : undefined }}
          >
            {saving ? 'Saving…' : 'Add lead'}
          </button>
        </div>
      </form>
    </div>
  )
}
