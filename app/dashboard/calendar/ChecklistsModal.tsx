'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Select } from '@/components/Select'
import { BTN, BTN_SM, ConfirmDialog, FIELD, LABEL, LINE, Modal, RED, TEAL_DARK, TEXT, TEXT2, TEXT3, useIsPhone, FormError } from '@/components/forms'
import { EXAMPLES, ITEM_TYPES, type ChecklistItemType, type Template, type TemplateItem, newId } from '@/lib/checklists'

type Props = {
  businessId: string
  onClose: () => void
}

type Draft = { id: string | null; name: string; requires_signature: boolean; items: TemplateItem[] }

const MAX_STEPS = 60
const COLUMNS = 'id, name, items, requires_signature'

const squareBtn: React.CSSProperties = { ...BTN.secondary, ...BTN_SM, width: 34, padding: 0, flexShrink: 0, fontSize: 16, lineHeight: 1 }

function StepRow({
  item,
  index,
  last,
  phone,
  onChange,
  onMove,
  onRemove,
}: {
  item: TemplateItem
  index: number
  last: boolean
  phone: boolean
  onChange: (patch: Partial<TemplateItem>) => void
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
}) {
  const type = (
    <Select value={item.type} onChange={e => onChange({ type: e.target.value as ChecklistItemType })} style={phone ? { flex: 1, minWidth: 0 } : { width: 116 }} aria-label={`Step ${index + 1} type`}>
      {ITEM_TYPES.map(t => (
        <option key={t.value} value={t.value}>{t.label}</option>
      ))}
    </Select>
  )
  const text = (
    <input
      style={{ ...FIELD, ...(phone ? {} : { flex: 1, minWidth: 0, width: 'auto' }) }}
      value={item.text}
      onChange={e => onChange({ text: e.target.value })}
      placeholder={item.type === 'check' ? 'What needs doing' : item.type === 'number' ? 'What to measure' : item.type === 'photo' ? 'What to photograph' : 'The question to answer'}
      maxLength={200}
      aria-label={`Step ${index + 1}`}
    />
  )
  const unit =
    item.type === 'number' ? (
      <input style={{ ...FIELD, width: 84, flexShrink: 0 }} value={item.unit || ''} onChange={e => onChange({ unit: e.target.value })} placeholder="Unit" maxLength={12} aria-label={`Step ${index + 1} unit`} />
    ) : null
  const buttons = (
    <>
      <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => onMove(-1)} style={{ ...squareBtn, ...(index === 0 ? BTN.disabled : {}) }}>↑</button>
      <button type="button" aria-label="Move down" disabled={last} onClick={() => onMove(1)} style={{ ...squareBtn, ...(last ? BTN.disabled : {}) }}>↓</button>
      <button type="button" aria-label="Remove step" onClick={onRemove} style={{ ...squareBtn, color: RED, borderColor: '#FECACA' }}>×</button>
    </>
  )

  return phone ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, border: `1px solid ${LINE}`, borderRadius: 12 }}>
      {text}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {type}
        {unit}
        {buttons}
      </div>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {type}
      {text}
      {unit}
      {buttons}
    </div>
  )
}

/** Write checklists once (service steps, installation sign-off...) so they can be added to any visit. */
export function ChecklistsModal({ businessId, onClose }: Props) {
  const phone = useIsPhone()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('checklist_templates')
      .select(COLUMNS)
      .order('name')
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) setError(err.message)
        setTemplates((data || []) as Template[])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const newDraft = (): Draft => ({ id: null, name: '', requires_signature: false, items: [{ id: newId(), text: '', type: 'check' }] })
  const draftFromExample = (ex: (typeof EXAMPLES)[number]): Draft => ({
    id: null,
    name: ex.name,
    requires_signature: ex.requires_signature,
    items: ex.items.map(i => ({ id: newId(), text: i.text, type: i.type, ...(i.unit ? { unit: i.unit } : {}) })),
  })

  function patchItem(id: string, patch: Partial<TemplateItem>) {
    setDraft(d => (d ? { ...d, items: d.items.map(i => (i.id === id ? { ...i, ...patch } : i)) } : d))
  }

  function moveItem(index: number, dir: -1 | 1) {
    setDraft(d => {
      if (!d) return d
      const to = index + dir
      if (to < 0 || to >= d.items.length) return d
      const items = [...d.items]
      ;[items[index], items[to]] = [items[to], items[index]]
      return { ...d, items }
    })
  }

  async function save() {
    if (!draft) return
    const name = draft.name.trim()
    if (!name) {
      setError('Give the checklist a name.')
      return
    }
    const items: TemplateItem[] = draft.items
      .map(i => ({ id: i.id, text: i.text.trim(), type: i.type, ...(i.type === 'number' && i.unit?.trim() ? { unit: i.unit.trim() } : {}) }))
      .filter(i => i.text)
    if (items.length === 0) {
      setError('Add at least one step.')
      return
    }
    setSaving(true)
    setError('')
    const row = { name, items, requires_signature: draft.requires_signature }
    const res = draft.id
      ? await supabase.from('checklist_templates').update(row).eq('id', draft.id).select(COLUMNS).single()
      : await supabase.from('checklist_templates').insert({ ...row, business_id: businessId }).select(COLUMNS).single()
    setSaving(false)
    if (res.error || !res.data) {
      setError(res.error?.message || 'Could not save the checklist.')
      return
    }
    const saved = res.data as Template
    setTemplates(prev => (draft.id ? prev.map(t => (t.id === saved.id ? saved : t)) : [...prev, saved]).sort((a, b) => a.name.localeCompare(b.name)))
    setDraft(null)
  }

  async function remove() {
    if (!draft?.id) return
    setSaving(true)
    const { error: err } = await supabase.from('checklist_templates').delete().eq('id', draft.id)
    setSaving(false)
    setConfirmDelete(false)
    if (err) {
      setError(err.message)
      return
    }
    setTemplates(prev => prev.filter(t => t.id !== draft.id))
    setDraft(null)
  }

  const editing = draft !== null

  return (
    <>
      <Modal
        title={editing ? (draft.id ? 'Edit checklist' : 'New checklist') : 'Checklists'}
        size="lg"
        fixed
        busy={saving}
        onClose={onClose}
        footer={
          editing ? (
            <>
              {draft.id && (
                <button type="button" onClick={() => setConfirmDelete(true)} disabled={saving} style={{ ...BTN.danger, marginRight: 'auto' }}>
                  Delete
                </button>
              )}
              <button type="button" onClick={() => { setDraft(null); setError('') }} disabled={saving} style={BTN.secondary}>Back</button>
              <button type="button" onClick={save} disabled={saving} style={{ ...BTN.primary, ...(saving ? BTN.disabled : {}) }}>{saving ? 'Saving...' : 'Save'}</button>
            </>
          ) : (
            <>
              <button type="button" onClick={onClose} style={BTN.secondary}>Done</button>
              <button type="button" onClick={() => { setDraft(newDraft()); setError('') }} style={BTN.primary}>New checklist</button>
            </>
          )
        }
      >
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={LABEL}>Name *</label>
              <input style={FIELD} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Air conditioner service" maxLength={80} />
            </div>

            <div>
              <label style={LABEL}>Steps</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {draft.items.map((it, i) => (
                  <StepRow
                    key={it.id}
                    item={it}
                    index={i}
                    last={i === draft.items.length - 1}
                    phone={phone}
                    onChange={patch => patchItem(it.id, patch)}
                    onMove={dir => moveItem(i, dir)}
                    onRemove={() => setDraft({ ...draft, items: draft.items.filter(x => x.id !== it.id) })}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={draft.items.length >= MAX_STEPS}
                  onClick={() => setDraft({ ...draft, items: [...draft.items, { id: newId(), text: '', type: 'check' }] })}
                  style={{ ...BTN.secondary, ...BTN_SM, ...(draft.items.length >= MAX_STEPS ? BTN.disabled : {}) }}
                >
                  Add a step
                </button>
                <span style={{ fontSize: 12, color: TEXT3 }}>Tick = done or not. Answer = a short written answer. Reading = a number, like a temperature. Photo = pictures taken on site.</span>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: TEXT2, cursor: 'pointer', lineHeight: 1.45 }}>
              <input type="checkbox" checked={draft.requires_signature} onChange={e => setDraft({ ...draft, requires_signature: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#2AA198', marginTop: 1, flexShrink: 0 }} />
              <span>
                The customer signs this off
                <span style={{ display: 'block', fontSize: 12, color: TEXT3 }}>Shows a signature box when the checklist is finished on site.</span>
              </span>
            </label>

            {error && <FormError message={error} />}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontSize: 13, color: TEXT3, lineHeight: 1.5 }}>
              Write a checklist once, then add it to any visit. The technician ticks it off on site, and the customer can sign when it is finished.
            </div>

            {loading ? (
              <div style={{ fontSize: 13, color: TEXT3 }}>Loading...</div>
            ) : (
              templates.length > 0 && (
                <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
                  {templates.map((t, i) => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderTop: i === 0 ? 'none' : `1px solid ${LINE}` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, overflowWrap: 'anywhere' }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: TEXT3, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span>{t.items.length} step{t.items.length === 1 ? '' : 's'}</span>
                          {t.requires_signature && <span style={{ fontSize: 11, fontWeight: 800, color: TEAL_DARK, background: '#E3F5F2', borderRadius: 999, padding: '2px 9px' }}>Customer signs</span>}
                        </div>
                      </div>
                      <button type="button" onClick={() => { setDraft({ id: t.id, name: t.name, requires_signature: t.requires_signature, items: t.items.map(i => ({ ...i })) }); setError('') }} style={{ ...BTN.secondary, ...BTN_SM }}>
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            <div>
              <label style={LABEL}>{templates.length === 0 && !loading ? 'Start from an example' : 'Or start from an example'}</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EXAMPLES.map(ex => (
                  <button key={ex.name} type="button" onClick={() => { setDraft(draftFromExample(ex)); setError('') }} style={{ ...BTN.secondary, ...BTN_SM }}>
                    {ex.name}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: TEXT3, marginTop: 8, lineHeight: 1.5 }}>You can change the steps before saving.</div>
            </div>

            {error && <FormError message={error} />}
          </div>
        )}
      </Modal>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this checklist?"
          message="Visits that already used it keep their own copy, with their ticks and signatures. It just won't be offered for new visits."
          busy={saving}
          busyLabel="Deleting..."
          onCancel={() => setConfirmDelete(false)}
          onConfirm={remove}
        />
      )}
    </>
  )
}
