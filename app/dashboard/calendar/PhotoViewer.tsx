'use client'

import React, { useEffect, useState } from 'react'
import { BTN, BTN_SM, ConfirmDialog, FIELD, LABEL, LINE, Modal, TEXT3, useIsPhone } from '@/components/forms'
import { TAGS, type PhotoTag, type VisitPhoto } from '@/lib/photos'
import type { PhotosApi } from './usePhotos'

type Props = {
  /** The photos to flip through, oldest first */
  photos: VisitPhoto[]
  startId: string
  api: PhotosApi
  /** Photos on a signed-off checklist cannot be changed or deleted */
  locked?: boolean
  onClose: () => void
}

const arrow: React.CSSProperties = { ...BTN.secondary, ...BTN_SM, width: 38, height: 38, padding: 0, fontSize: 18, lineHeight: 1, background: 'rgba(255,255,255,0.92)', flexShrink: 0 }

/** One photo, large, with its caption and Before / After tag. Arrow keys and the buttons move between photos. */
export function PhotoViewer({ photos, startId, api, locked = false, onClose }: Props) {
  const phone = useIsPhone()
  const [id, setId] = useState(startId)
  const [full, setFull] = useState<Record<string, string>>({})
  const [caption, setCaption] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)

  const index = Math.max(0, photos.findIndex(p => p.id === id))
  const photo = photos[index]

  // Show the small preview straight away, then swap in the full picture
  useEffect(() => {
    if (!photo || full[photo.id]) return
    let cancelled = false
    api.fullUrls([photo]).then(urls => {
      if (!cancelled && urls[photo.id]) setFull(prev => ({ ...prev, [photo.id]: urls[photo.id] }))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo?.id])

  useEffect(() => {
    setCaption(photo?.caption || '')
  }, [photo?.id, photo?.caption])

  const go = (step: number) => {
    if (photos.length < 2) return
    setId(photos[(index + step + photos.length) % photos.length].id)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, photos.length])

  // The last photo was deleted: close
  useEffect(() => {
    if (!photo) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo])
  if (!photo) return null

  const saveCaption = () => {
    const next = caption.trim() || null
    if (next !== (photo.caption || null)) api.update(photo.id, { caption: next })
  }

  async function remove() {
    setBusy(true)
    const next = photos[index + 1] || photos[index - 1]
    const ok = await api.remove(photo.id)
    setBusy(false)
    setConfirm(false)
    if (ok) {
      if (next) setId(next.id)
      else onClose()
    }
  }

  return (
    <>
      <Modal
        title={`Photo ${index + 1} of ${photos.length}`}
        size="lg"
        fixed
        flush
        layer={600}
        onClose={onClose}
        footer={
          <>
            {!locked && (
              <button type="button" onClick={() => setConfirm(true)} style={{ ...BTN.danger, marginRight: 'auto' }}>
                Delete
              </button>
            )}
            <button type="button" onClick={onClose} style={BTN.primary}>Done</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ position: 'relative', flex: 1, minHeight: 200, background: '#0B1220', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(full[photo.id] || api.thumbs[photo.id]) && (
              <img src={full[photo.id] || api.thumbs[photo.id]} alt={photo.caption || 'Photo'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
            )}
            {photos.length > 1 && (
              <>
                <button type="button" aria-label="Previous photo" onClick={() => go(-1)} style={{ ...arrow, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>‹</button>
                <button type="button" aria-label="Next photo" onClick={() => go(1)} style={{ ...arrow, position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>›</button>
              </>
            )}
          </div>

          <div style={{ padding: phone ? '14px 16px' : '16px 24px', borderTop: `1px solid ${LINE}`, display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div className="jb-chips" role="group" aria-label="Before or after">
                {TAGS.map(t => (
                  <button key={t.value} type="button" className="jb-chip" disabled={locked} aria-pressed={photo.tag === t.value} onClick={() => api.update(photo.id, { tag: photo.tag === t.value ? null : (t.value as PhotoTag) })}>
                    {t.label}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 12, color: TEXT3 }}>{new Date(photo.created_at).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
            </div>
            <div>
              <label style={LABEL}>Caption (optional)</label>
              <input
                style={FIELD}
                value={caption}
                disabled={locked}
                maxLength={200}
                placeholder="e.g. Corroded drain pipe"
                onChange={e => setCaption(e.target.value)}
                onBlur={saveCaption}
                onKeyDown={e => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                }}
              />
            </div>
          </div>
        </div>
      </Modal>

      {confirm && (
        <ConfirmDialog title="Delete this photo?" message="It is removed from the visit for good." busy={busy} busyLabel="Deleting..." layer={650} onCancel={() => setConfirm(false)} onConfirm={remove} />
      )}
    </>
  )
}
