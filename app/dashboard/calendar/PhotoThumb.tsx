'use client'

import React from 'react'
import { LINE, TEAL_DARK } from '@/components/forms'
import { type PhotoTag, tagLabel } from '@/lib/photos'

/** A square preview of one photo. Tap to open it. */
export function PhotoThumb({ url, tag, size, onClick, label }: { url?: string; tag?: PhotoTag | null; size?: number; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        position: 'relative',
        padding: 0,
        border: `1px solid ${LINE}`,
        borderRadius: 10,
        overflow: 'hidden',
        background: '#F1F5F9',
        cursor: 'pointer',
        aspectRatio: '1 / 1',
        ...(size ? { width: size, height: size, flexShrink: 0 } : { width: '100%' }),
      }}
    >
      {url && <img src={url} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      {tag && (
        <span style={{ position: 'absolute', left: 6, bottom: 6, fontSize: 10, fontWeight: 800, color: TEAL_DARK, background: 'rgba(255,255,255,0.92)', borderRadius: 999, padding: '2px 7px' }}>{tagLabel(tag)}</span>
      )}
    </button>
  )
}
