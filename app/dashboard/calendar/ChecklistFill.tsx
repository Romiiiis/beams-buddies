'use client'

import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { SignaturePad } from '@/components/SignaturePad'
import { BTN, BTN_SM, FIELD, FIELD_TEXTAREA, LABEL, LINE, Modal, RED, TEAL, TEXT, TEXT2, TEXT3, WHITE, FormError } from '@/components/forms'
import { type FilledItem, type VisitChecklist, progress } from '@/lib/checklists'
import { printElement } from '@/lib/print'
import { tagLabel } from '@/lib/photos'
import { PhotoThumb } from './PhotoThumb'
import type { PhotosApi } from './usePhotos'
import { type Visit, customerName, fmtDay, fmtRange, visitAddress } from '@/lib/schedule'

const PhotoViewer = dynamic(() => import('./PhotoViewer').then(m => m.PhotoViewer), { ssr: false })

type Props = {
  businessId: string
  checklist: VisitChecklist
  visit: Pick<Visit, 'start_at' | 'end_at' | 'title' | 'customers' | 'customer_sites'>
  technician?: string | null
  /** The visit's photos, shared with the Photos card so both always agree */
  photos: PhotosApi
  onClose: () => void
  /** Called after every save, so the list behind can show the new progress. */
  onChanged: (c: VisitChecklist) => void
}

const when = (iso: string) => new Date(iso).toLocaleString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })

/** Tick things off, write notes, and get the customer's sign-off. Saves as you go. */
export function ChecklistFill({ businessId, checklist, visit, technician, photos, onClose, onChanged }: Props) {
  const [items, setItems] = useState<FilledItem[]>(checklist.items || [])
  const [notes, setNotes] = useState(checklist.notes || '')
  const [signedName, setSignedName] = useState(checklist.signed_name || '')
  const [sig, setSig] = useState<string | null>(null)
  const [current, setCurrent] = useState(checklist)
  const [state, setState] = useState<'saved' | 'saving' | 'error'>('saved')
  const [error, setError] = useState('')
  const [business, setBusiness] = useState<any>(null)
  const lastSaved = useRef(JSON.stringify({ items: checklist.items, notes: (checklist.notes || '').trim() }))
  const signed = !!current.signed_at

  // Photo steps: the photos taken for each step, with the count kept in the step's value so progress counts them
  const [viewer, setViewer] = useState<string | null>(null)
  const [printUrls, setPrintUrls] = useState<Record<string, string>>({})
  const pickInput = useRef<HTMLInputElement>(null)
  const pickItem = useRef('')
  const photosFor = (itemId: string) => photos.photos.filter(p => p.checklist_id === current.id && p.item_id === itemId)
  const photoCounts = items.filter(i => i.type === 'photo').map(i => `${i.id}:${photosFor(i.id).length}`).join(',')
  useEffect(() => {
    if (signed || photos.loading) return
    setItems(prev => {
      let changed = false
      const next = prev.map(it => {
        if (it.type !== 'photo') return it
        const n = photosFor(it.id).length
        const value = n ? String(n) : ''
        if (value === it.value) return it
        changed = true
        return { ...it, value }
      })
      return changed ? next : prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoCounts, signed, photos.loading])

  // Remember the latest values so a change made a moment before closing is still saved
  const latest = useRef({ id: current.id, items, notes, signed })
  latest.current = { id: current.id, items, notes, signed }
  const onChangedRef = useRef(onChanged)
  onChangedRef.current = onChanged
  useEffect(
    () => () => {
      const l = latest.current
      if (l.signed || JSON.stringify({ items: l.items, notes: l.notes.trim() }) === lastSaved.current) return
      supabase
        .from('visit_checklists')
        .update({ items: l.items, notes: l.notes.trim() || null })
        .eq('id', l.id)
        .select('*')
        .single()
        .then(({ data }) => {
          if (data) onChangedRef.current(data as VisitChecklist)
        })
    },
    []
  )

  useEffect(() => {
    supabase.from('businesses').select('name, phone, email, logo_url, abn').eq('id', businessId).single().then(({ data }) => setBusiness(data))
  }, [businessId])

  async function persist(extra: Record<string, unknown> = {}) {
    setState('saving')
    const { data, error: err } = await supabase
      .from('visit_checklists')
      .update({ items, notes: notes.trim() || null, ...extra })
      .eq('id', current.id)
      .select('*')
      .single()
    if (err || !data) {
      setState('error')
      setError(err?.message || 'Could not save.')
      return null
    }
    lastSaved.current = JSON.stringify({ items, notes: notes.trim() })
    setCurrent(data as VisitChecklist)
    onChanged(data as VisitChecklist)
    setState('saved')
    return data as VisitChecklist
  }

  // Save a moment after the last change
  useEffect(() => {
    if (signed) return
    const snapshot = JSON.stringify({ items, notes: notes.trim() })
    if (snapshot === lastSaved.current) return
    setState('saving')
    const t = setTimeout(() => {
      persist()
    }, 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, notes, signed])

  const setItem = (id: string, patch: Partial<FilledItem>) => setItems(prev => prev.map(i => (i.id === id ? { ...i, ...patch } : i)))

  async function signOff() {
    setError('')
    if (signedName.trim().length < 2) {
      setError('Type the name of the person signing.')
      return
    }
    if (current.requires_signature && !sig) {
      setError('Ask them to sign in the box.')
      return
    }
    const done = await persist({ signed_name: signedName.trim(), signed_at: new Date().toISOString(), signature: sig })
    if (done) setSig(null)
  }

  async function reopen() {
    setError('')
    await persist({ signed_name: null, signed_at: null, signature: null })
    setSig(null)
  }

  async function printReport() {
    const list = items.filter(i => i.type === 'photo').flatMap(i => photosFor(i.id))
    if (list.length) setPrintUrls(await photos.fullUrls(list))
    // let the report draw before it is copied for printing
    await new Promise(r => setTimeout(r, 120))
    printElement('checklist-print', current.title)
  }

  const p = progress(items)
  const viewerPhoto = photos.photos.find(x => x.id === viewer)
  const viewerList = viewerPhoto ? photosFor(viewerPhoto.item_id || '') : []
  const name = customerName(visit.customers)
  const address = visitAddress(visit)
  const s = new Date(visit.start_at)
  const e = new Date(visit.end_at)

  return (
    <Modal
      title={
        <>
          <span>{current.title}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>
            {p.done} of {p.total}
          </span>
        </>
      }
      size="lg"
      fixed
      layer={500}
      onClose={onClose}
      headerExtra={
        <button type="button" onClick={printReport} style={{ ...BTN.secondary, ...BTN_SM }}>
          Print report
        </button>
      }
      footer={
        <>
          <span style={{ marginRight: 'auto', alignSelf: 'center', fontSize: 12, color: state === 'error' ? RED : TEXT3 }}>
            {signed ? 'Signed off and locked' : state === 'saving' ? 'Saving...' : state === 'error' ? 'Not saved' : 'All changes saved'}
          </span>
          <button type="button" onClick={onClose} style={BTN.primary}>Done</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, color: TEXT3, lineHeight: 1.5 }}>
          {name || visit.title}{address ? ` · ${address}` : ''} · {fmtDay(s)} {fmtRange(s, e)}
        </div>

        <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
          {items.map((it, idx) => (
            <div key={it.id} style={{ borderTop: idx === 0 ? 'none' : `1px solid ${LINE}`, padding: '12px 14px' }}>
              {it.type === 'check' ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: signed ? 'default' : 'pointer' }}>
                  <input type="checkbox" checked={it.done} disabled={signed} onChange={ev => setItem(it.id, { done: ev.target.checked })} style={{ width: 22, height: 22, accentColor: TEAL, flexShrink: 0 }} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: it.done ? TEXT3 : TEXT, textDecoration: it.done ? 'line-through' : 'none', overflowWrap: 'anywhere' }}>{it.text}</span>
                </label>
              ) : it.type === 'photo' ? (
                <div>
                  <div style={{ ...LABEL, textTransform: 'none', letterSpacing: 0, fontSize: 13, fontWeight: 700, color: TEXT2 }}>{it.text}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    {photosFor(it.id).map((ph, n) => (
                      <PhotoThumb key={ph.id} url={photos.thumbs[ph.id]} tag={ph.tag} size={64} label={`Open photo ${n + 1} for ${it.text}`} onClick={() => setViewer(ph.id)} />
                    ))}
                    {!signed && (
                      <button
                        type="button"
                        disabled={!!photos.progress}
                        onClick={() => {
                          pickItem.current = it.id
                          pickInput.current?.click()
                        }}
                        style={{ ...BTN.secondary, ...BTN_SM, ...(photos.progress ? BTN.disabled : {}) }}
                      >
                        {photos.progress ? 'Adding...' : photosFor(it.id).length ? 'Add another' : 'Add photo'}
                      </button>
                    )}
                    {signed && photosFor(it.id).length === 0 && <span style={{ fontSize: 13, color: TEXT3 }}>No photos</span>}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ ...LABEL, textTransform: 'none', letterSpacing: 0, fontSize: 13, fontWeight: 700, color: TEXT2 }}>{it.text}</div>
                  {it.type === 'number' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="number" inputMode="decimal" step="any" disabled={signed} style={{ ...FIELD, maxWidth: 160 }} value={it.value} onChange={ev => setItem(it.id, { value: ev.target.value })} />
                      {it.unit && <span style={{ fontSize: 14, fontWeight: 700, color: TEXT3 }}>{it.unit}</span>}
                    </div>
                  ) : (
                    <input style={FIELD} disabled={signed} value={it.value} onChange={ev => setItem(it.id, { value: ev.target.value })} maxLength={500} />
                  )}
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && <div style={{ padding: 16, fontSize: 13, color: TEXT3 }}>This checklist has no items.</div>}
        </div>

        <div>
          <label style={LABEL}>Notes</label>
          <textarea style={FIELD_TEXTAREA} disabled={signed} value={notes} onChange={ev => setNotes(ev.target.value)} placeholder="Anything worth recording about this visit..." maxLength={2000} />
        </div>

        <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>Customer sign-off{current.requires_signature ? '' : ' (optional)'}</div>
          {signed ? (
            <>
              <div style={{ fontSize: 13, color: TEXT2 }}>
                Signed by <b>{current.signed_name}</b> on {when(current.signed_at as string)}.
              </div>
              {current.signature && <img src={current.signature} alt="Signature" style={{ maxWidth: 320, width: '100%', border: `1px solid ${LINE}`, borderRadius: 10, background: WHITE }} />}
              <button type="button" onClick={reopen} style={{ ...BTN.secondary, ...BTN_SM, alignSelf: 'flex-start' }}>Reopen to change</button>
            </>
          ) : (
            <>
              <div>
                <label style={LABEL}>Name of the person signing</label>
                <input style={FIELD} value={signedName} onChange={ev => { setSignedName(ev.target.value); setError('') }} placeholder="Full name" autoComplete="name" maxLength={120} />
              </div>
              <SignaturePad onChange={v => { setSig(v); setError('') }} />
              <button type="button" onClick={signOff} style={{ ...BTN.primary, alignSelf: 'flex-start' }}>Sign off</button>
            </>
          )}
        </div>

        {photos.error && <FormError message={photos.error} />}
        {error && <FormError message={error} />}
      </div>

      <input
        ref={pickInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={ev => {
          const files = Array.from(ev.target.files || [])
          ev.target.value = ''
          if (files.length && pickItem.current) photos.add(files, { checklistId: current.id, itemId: pickItem.current })
        }}
      />
      {viewer && viewerList.length > 0 && <PhotoViewer photos={viewerList} startId={viewer} api={photos} locked={signed} onClose={() => setViewer(null)} />}

      {/* The printed report. Hidden on screen; "Print report" copies just this. */}
      <div style={{ display: 'none' }}>
        <div id="checklist-print" style={{ fontFamily: 'var(--font-sans), sans-serif', color: TEXT, padding: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
            <div>
              {business?.logo_url && <img src={business.logo_url} alt="" style={{ height: 48, marginBottom: 8, objectFit: 'contain' }} />}
              <div style={{ fontSize: 18, fontWeight: 800 }}>{business?.name || ''}</div>
              {business?.abn && <div style={{ fontSize: 12, color: TEXT3 }}>ABN {business.abn}</div>}
              {business?.phone && <div style={{ fontSize: 12, color: TEXT3 }}>{business.phone}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: TEAL }}>{current.title}</div>
              <div style={{ fontSize: 12, color: TEXT3, marginTop: 4 }}>{fmtDay(s, true)}, {fmtRange(s, e)}</div>
              {technician && <div style={{ fontSize: 12, color: TEXT3 }}>Technician: {technician}</div>}
            </div>
          </div>
          <div style={{ fontSize: 13, marginBottom: 14 }}>
            <b>{name || visit.title}</b>{address ? ` · ${address}` : ''}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {items.map(it => (
                <tr key={it.id}>
                  <td style={{ padding: '7px 0', borderBottom: `1px solid ${LINE}`, width: 26 }}>{it.type === 'check' ? (it.done ? '[x]' : '[ ]') : ''}</td>
                  <td style={{ padding: '7px 8px', borderBottom: `1px solid ${LINE}` }}>{it.text}</td>
                  <td style={{ padding: '7px 0', borderBottom: `1px solid ${LINE}`, textAlign: 'right', fontWeight: 700 }}>{it.type === 'check' ? '' : it.type === 'photo' ? (it.value ? `${it.value} photo${it.value === '1' ? '' : 's'}` : 'None') : `${it.value || '-'}${it.type === 'number' && it.value && it.unit ? ` ${it.unit}` : ''}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items
            .filter(i => i.type === 'photo' && photosFor(i.id).length > 0)
            .map(it => (
              <div key={it.id} style={{ marginTop: 14, breakInside: 'avoid' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{it.text}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {photosFor(it.id).map(ph => (
                    <div key={ph.id}>
                      {printUrls[ph.id] && <img src={printUrls[ph.id]} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 4, display: 'block' }} />}
                      {(ph.tag || ph.caption) && (
                        <div style={{ fontSize: 11, marginTop: 3 }}>
                          {ph.tag && <b>{tagLabel(ph.tag)}</b>}
                          {ph.tag && ph.caption ? ' · ' : ''}
                          {ph.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {notes.trim() && (
            <div style={{ marginTop: 14, fontSize: 13 }}>
              <b>Notes</b>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{notes}</div>
            </div>
          )}
          {signed && (
            <div style={{ marginTop: 20, fontSize: 13 }}>
              <b>Signed off by {current.signed_name}</b> on {when(current.signed_at as string)}
              {current.signature && <div><img src={current.signature} alt="Signature" style={{ width: 260, marginTop: 8, border: `1px solid ${LINE}` }} /></div>}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
