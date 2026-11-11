'use client'

import React, { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { BTN, BTN_SM, LINE, RED, TEXT, TEXT3 } from '@/components/forms'
import { printElement } from '@/lib/print'
import { MAX_PHOTOS_PER_VISIT, tagLabel } from '@/lib/photos'
import { type Visit, customerName, fmtDay, fmtRange, visitAddress } from '@/lib/schedule'
import { PhotoThumb } from './PhotoThumb'
import type { PhotosApi } from './usePhotos'

const PhotoViewer = dynamic(() => import('./PhotoViewer').then(m => m.PhotoViewer), { ssr: false })

type Props = {
  businessId: string
  visit: Visit
  api: PhotosApi
  technician?: string | null
}

/** Before and after photos for a visit: add from the camera or library, tap to open, print as a sheet. */
export function VisitPhotos({ businessId, visit, api, technician }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [printing, setPrinting] = useState(false)
  const [printUrls, setPrintUrls] = useState<Record<string, string>>({})
  const [business, setBusiness] = useState<any>(null)
  const { photos, thumbs, loading, progress, error } = api
  const busy = !!progress

  async function printSheet() {
    setPrinting(true)
    const [urls, biz] = await Promise.all([api.fullUrls(photos), business ? Promise.resolve({ data: business }) : supabase.from('businesses').select('name, phone, abn, logo_url').eq('id', businessId).single()])
    setBusiness(biz.data)
    setPrintUrls(urls)
    // let the sheet draw before it is copied for printing
    await new Promise(r => setTimeout(r, 120))
    printElement('visit-photos-print', 'Visit photos')
    setPrinting(false)
  }

  const s = new Date(visit.start_at)
  const e = new Date(visit.end_at)
  const who = customerName(visit.customers)
  const where = visitAddress(visit)

  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '12px 14px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>
            Photos{photos.length > 0 ? <span style={{ fontWeight: 700, color: TEXT3 }}> · {photos.length}</span> : null}
          </div>
          <div style={{ fontSize: 12, color: TEXT3, marginTop: 2 }}>{busy ? `Adding ${Math.min(progress!.done + 1, progress!.total)} of ${progress!.total}...` : 'Before and after pictures from the job.'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {photos.length > 0 && (
            <button type="button" onClick={printSheet} disabled={printing || busy} style={{ ...BTN.secondary, ...BTN_SM, ...(printing || busy ? BTN.disabled : {}) }}>
              {printing ? 'Preparing...' : 'Print'}
            </button>
          )}
          <button type="button" onClick={() => input.current?.click()} disabled={busy || photos.length >= MAX_PHOTOS_PER_VISIT} style={{ ...BTN.primary, ...BTN_SM, ...(busy || photos.length >= MAX_PHOTOS_PER_VISIT ? BTN.disabled : {}) }}>
            Add photos
          </button>
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={ev => {
              const files = Array.from(ev.target.files || [])
              ev.target.value = ''
              if (files.length) api.add(files)
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${LINE}`, fontSize: 13, color: TEXT3 }}>Loading...</div>
      ) : photos.length > 0 ? (
        <div style={{ padding: 12, borderTop: `1px solid ${LINE}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: 8 }}>
          {photos.map((p, i) => (
            <PhotoThumb key={p.id} url={thumbs[p.id]} tag={p.tag} label={`Open photo ${i + 1}`} onClick={() => setOpen(p.id)} />
          ))}
        </div>
      ) : (
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${LINE}`, fontSize: 13, color: TEXT3, lineHeight: 1.5 }}>No photos yet. Tap Add photos to take one or pick from your library.</div>
      )}

      {error && <div role="alert" style={{ padding: '10px 14px', borderTop: `1px solid ${LINE}`, fontSize: 13, color: RED }}>{error}</div>}

      {open && <PhotoViewer photos={photos} startId={open} api={api} onClose={() => setOpen(null)} />}

      {/* The printed sheet. Hidden on screen; "Print" copies just this. */}
      <div style={{ display: 'none' }}>
        <div id="visit-photos-print" style={{ fontFamily: 'var(--font-sans), sans-serif', color: TEXT, padding: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
            <div>
              {business?.logo_url && <img src={business.logo_url} alt="" style={{ height: 44, marginBottom: 6, objectFit: 'contain' }} />}
              <div style={{ fontSize: 17, fontWeight: 800 }}>{business?.name || ''}</div>
              {business?.abn && <div style={{ fontSize: 12, color: TEXT3 }}>ABN {business.abn}</div>}
              {business?.phone && <div style={{ fontSize: 12, color: TEXT3 }}>{business.phone}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>Visit photos</div>
              <div style={{ fontSize: 12, color: TEXT3, marginTop: 4 }}>{fmtDay(s, true)}, {fmtRange(s, e)}</div>
              {technician && <div style={{ fontSize: 12, color: TEXT3 }}>Technician: {technician}</div>}
            </div>
          </div>
          <div style={{ fontSize: 13, marginBottom: 14 }}>
            <b>{who || visit.title}</b>
            {where ? ` · ${where}` : ''}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {photos.map(p => (
              <div key={p.id} style={{ breakInside: 'avoid' }}>
                {printUrls[p.id] && <img src={printUrls[p.id]} alt="" style={{ width: '100%', maxHeight: 330, objectFit: 'contain', background: '#F1F5F9', borderRadius: 6, display: 'block' }} />}
                <div style={{ fontSize: 12, marginTop: 5, color: TEXT }}>
                  {p.tag && <b>{tagLabel(p.tag)}</b>}
                  {p.tag && p.caption ? ' · ' : ''}
                  {p.caption}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
