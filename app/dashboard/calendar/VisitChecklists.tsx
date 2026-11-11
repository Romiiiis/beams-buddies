'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { Select } from '@/components/Select'
import { Status } from '@/components/Status'
import { BTN, BTN_SM, ConfirmDialog, LINE, RED, TEXT, TEXT3 } from '@/components/forms'
import { type Template, type VisitChecklist, fillItems, isSigned, progress } from '@/lib/checklists'
import type { Visit } from '@/lib/schedule'
import type { PhotosApi } from './usePhotos'

// The on-site checklist screen (with the signature box and photo viewer) is only needed when one is opened
const ChecklistFill = dynamic(() => import('./ChecklistFill').then(m => m.ChecklistFill), { ssr: false })

type Props = {
  businessId: string
  visit: Visit
  technician?: string | null
  /** Tells the visit pop-up how many checklists there are, so deleting the visit can warn about them. */
  onCount?: (n: number) => void
  photos: PhotosApi
}


/** The checklists on one visit: add one from a template, tick it off on site, get it signed. */
export function VisitChecklists({ businessId, visit, technician, onCount, photos }: Props) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [lists, setLists] = useState<VisitChecklist[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)
  const [removeTarget, setRemoveTarget] = useState<VisitChecklist | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      supabase.from('checklist_templates').select('id, name, items, requires_signature').order('name'),
      supabase.from('visit_checklists').select('*').eq('visit_id', visit.id).order('created_at'),
    ]).then(([t, l]) => {
      if (cancelled) return
      setTemplates((t.data || []) as Template[])
      setLists((l.data || []) as VisitChecklist[])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [visit.id])

  async function add(templateId: string) {
    const t = templates.find(x => x.id === templateId)
    if (!t) return
    setBusy(true)
    setError('')
    const { data, error: err } = await supabase
      .from('visit_checklists')
      .insert({ business_id: businessId, visit_id: visit.id, template_id: t.id, title: t.name, items: fillItems(t.items), requires_signature: t.requires_signature })
      .select('*')
      .single()
    setBusy(false)
    if (err || !data) {
      setError(err?.message || 'Could not add the checklist.')
      return
    }
    setLists(prev => [...prev, data as VisitChecklist])
    setOpenId((data as VisitChecklist).id)
  }

  async function remove(c: VisitChecklist) {
    setBusy(true)
    setError('')
    const { error: err } = await supabase.from('visit_checklists').delete().eq('id', c.id)
    setBusy(false)
    if (err) {
      setError(err.message)
      setRemoveTarget(null)
      return
    }
    setLists(prev => prev.filter(x => x.id !== c.id))
    setRemoveTarget(null)
  }

  useEffect(() => {
    onCount?.(lists.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lists.length])

  const opened = lists.find(l => l.id === openId) || null

  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '12px 14px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>Checklists</div>
          <div style={{ fontSize: 12, color: TEXT3, marginTop: 2 }}>Steps to tick off on site, with the customer&apos;s sign-off.</div>
        </div>
        {templates.length > 0 && (
          <Select value="" onChange={e => e.target.value && add(e.target.value)} disabled={busy} style={{ height: 36, minWidth: 190 }} aria-label="Add a checklist">
            <option value="">Add a checklist...</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${LINE}`, fontSize: 13, color: TEXT3 }}>Loading...</div>
      ) : lists.length === 0 ? (
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${LINE}`, fontSize: 13, color: TEXT3, lineHeight: 1.5 }}>
          {templates.length === 0 ? 'Write your first checklist with the Checklists button above the calendar, then add it to visits here.' : 'None on this visit yet.'}
        </div>
      ) : (
        lists.map(c => {
          const p = progress(c.items || [])
          const signed = isSigned(c)
          return (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: `1px solid ${LINE}`, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, overflowWrap: 'anywhere' }}>{c.title}</div>
                <div style={{ fontSize: 12, color: TEXT3, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span>{p.done} of {p.total} done</span>
                  {signed ? <Status label={`Signed by ${c.signed_name}`} tone="success" size={12} /> : c.requires_signature ? <Status label="Needs sign-off" tone="warn" size={12} /> : null}
                </div>
              </div>
              <button type="button" onClick={() => setOpenId(c.id)} style={{ ...BTN.secondary, ...BTN_SM }}>Open</button>
              <button type="button" onClick={() => setRemoveTarget(c)} disabled={busy} style={{ ...BTN.danger, ...BTN_SM }}>Remove</button>
            </div>
          )
        })
      )}

      {error && <div style={{ padding: '10px 14px', borderTop: `1px solid ${LINE}`, fontSize: 13, color: RED }}>{error}</div>}

      {opened && (
        <ChecklistFill
          businessId={businessId}
          checklist={opened}
          visit={visit}
          technician={technician}
          photos={photos}
          onClose={() => setOpenId(null)}
          onChanged={c => setLists(prev => prev.map(x => (x.id === c.id ? c : x)))}
        />
      )}

      {removeTarget && (
        <ConfirmDialog
          title="Remove this checklist?"
          message={`"${removeTarget.title}" is taken off this visit, with ${isSigned(removeTarget) ? 'its ticks, notes and signature' : 'its ticks and notes'}. The template stays${removeTarget.items.some(i => i.type === 'photo' && i.value) ? ', and its photos stay on the visit' : ''}.`}
          confirmLabel="Remove"
          busyLabel="Removing..."
          busy={busy}
          layer={550}
          onCancel={() => setRemoveTarget(null)}
          onConfirm={() => remove(removeTarget)}
        />
      )}
    </div>
  )
}
