'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BTN, BTN_SM, FIELD, LABEL, LINE, Modal, RED, TEAL_DARK, TEXT, TEXT2, TEXT3 } from '@/components/forms'
import { STAFF_COLOURS, type StaffMember, initialsOf } from '@/lib/schedule'

type Props = {
  businessId: string
  staff: StaffMember[]
  onClose: () => void
  /** Called after anything is saved so the calendar can reload. */
  onChanged: () => void
}

type FormState = { id: string | null; name: string; phone: string; email: string; colour: string; active: boolean }

const EMPTY = (colour: string): FormState => ({ id: null, name: '', phone: '', email: '', colour, active: true })

function feedUrl(token: string) {
  return `${typeof window !== 'undefined' ? window.location.origin : ''}/api/calendar/${token}`
}

export function TeamModal({ businessId, staff, onClose, onChanged }: Props) {
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  const editing = form ? staff.find(s => s.id === form.id) : undefined
  const nextColour = STAFF_COLOURS[staff.length % STAFF_COLOURS.length]

  async function save() {
    if (!form) return
    if (!form.name.trim()) {
      setError('Add a name.')
      return
    }
    setSaving(true)
    setError('')
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      colour: form.colour,
      active: form.active,
    }
    const { error: err } = form.id
      ? await supabase.from('staff_members').update(payload).eq('id', form.id)
      : await supabase.from('staff_members').insert({ ...payload, business_id: businessId })
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setForm(null)
    onChanged()
  }

  async function newLink() {
    if (!form?.id) return
    const { error: err } = await supabase.from('staff_members').update({ calendar_token: crypto.randomUUID() }).eq('id', form.id)
    if (err) setError(err.message)
    else onChanged()
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(''), 2000)
    } catch {
      setError('Could not copy. Select the link and copy it by hand.')
    }
  }

  // ── Add / edit form ──
  if (form) {
    return (
      <Modal
        title={form.id ? 'Edit team member' : 'Add team member'}
        size="sm"
        busy={saving}
        onClose={() => {
          setForm(null)
          setError('')
        }}
        footer={
          <>
            <button type="button" onClick={() => { setForm(null); setError('') }} style={BTN.secondary}>Cancel</button>
            <button type="button" onClick={save} disabled={saving} style={{ ...BTN.primary, ...(saving ? BTN.disabled : {}) }}>
              {saving ? 'Saving...' : form.id ? 'Save' : 'Add'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={LABEL}>Name *</label>
            <input style={FIELD} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Sam Taylor" autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL}>Phone</label>
              <input style={FIELD} type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0400 000 000" />
            </div>
            <div>
              <label style={LABEL}>Email</label>
              <input style={FIELD} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="sam@example.com" />
            </div>
          </div>
          <div>
            <label style={LABEL}>Calendar colour</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STAFF_COLOURS.map(c => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Colour ${c}`}
                  aria-pressed={form.colour === c}
                  onClick={() => setForm({ ...form, colour: c })}
                  style={{ width: 32, height: 32, borderRadius: 10, border: form.colour === c ? `2px solid ${TEXT}` : `2px solid transparent`, background: c, cursor: 'pointer', boxShadow: form.colour === c ? '0 0 0 2px #fff inset' : 'none' }}
                />
              ))}
            </div>
          </div>

          {form.id && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: TEXT2, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#2AA198' }} />
              On the team (untick if they have left; their past visits stay)
            </label>
          )}

          {editing && (
            <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: 14, background: '#F8FAFC' }}>
              <div style={{ ...LABEL, marginBottom: 8 }}>Their phone calendar</div>
              <div style={{ fontSize: 13, color: TEXT3, lineHeight: 1.5, marginBottom: 10 }}>
                Open this link on {editing.name.split(' ')[0] || 'their'} phone to add their jobs to the Calendar app. New jobs appear on their own. Anyone with the link can see these jobs, so only send it to them.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href={feedUrl(editing.calendar_token).replace(/^https?:/, 'webcal:')} style={{ ...BTN.secondary, ...BTN_SM, textDecoration: 'none' }}>Add to calendar</a>
                <button type="button" onClick={() => copy(feedUrl(editing.calendar_token), 'link')} style={{ ...BTN.secondary, ...BTN_SM }}>
                  {copied === 'link' ? 'Copied' : 'Copy link'}
                </button>
                <button type="button" onClick={newLink} style={{ ...BTN.secondary, ...BTN_SM, color: TEXT3 }}>Make a new link</button>
              </div>
            </div>
          )}

          {error && <div style={{ fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>{error}</div>}
        </div>
      </Modal>
    )
  }

  // ── Team list ──
  return (
    <Modal
      title="Team"
      size="sm"
      onClose={onClose}
      flush
      footer={
        <button type="button" onClick={() => setForm(EMPTY(nextColour))} style={BTN.primary}>
          Add team member
        </button>
      }
    >
      {staff.length === 0 ? (
        <div style={{ padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: TEXT, marginBottom: 6 }}>No team members yet</div>
          <div style={{ fontSize: 13, color: TEXT3, lineHeight: 1.6 }}>Add your technicians, then give each visit to the right person on the calendar.</div>
        </div>
      ) : (
        staff.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: i === 0 ? 'none' : `1px solid ${LINE}`, opacity: s.active ? 1 : 0.55 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: s.colour, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{initialsOf(s.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {s.name}
                {!s.active && <span style={{ fontSize: 11, fontWeight: 700, color: TEXT3, background: '#F1F5F9', borderRadius: 6, padding: '2px 7px' }}>Left</span>}
              </div>
              <div style={{ fontSize: 12, color: TEXT3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{[s.phone, s.email].filter(Boolean).join(' · ') || 'No contact details'}</div>
            </div>
            <button type="button" onClick={() => setForm({ id: s.id, name: s.name, phone: s.phone || '', email: s.email || '', colour: s.colour, active: s.active })} style={{ ...BTN.secondary, ...BTN_SM, color: TEAL_DARK }}>
              Edit
            </button>
          </div>
        ))
      )}
    </Modal>
  )
}
