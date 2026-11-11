'use client'

import React from 'react'

// One quiet way to show a status everywhere: a small coloured dot and plain dark text, with no tinted background.
// Colour is kept for what matters: teal for good, amber for "look at this", red for a problem, slate for "waiting",
// pale grey for inactive.

export type StatusTone = 'success' | 'brand' | 'warn' | 'danger' | 'neutral' | 'info' | 'muted'

export const STATUS_DOT: Record<StatusTone, string> = {
  success: '#2AA198',
  brand: '#2AA198',
  warn: '#D98E04',
  danger: '#D64545',
  neutral: '#64748B',
  info: '#64748B',
  muted: '#B6C0CC',
}

const TEXT = '#1F2937'
const DANGER_TEXT = '#B42318'

export function Status({ label, tone = 'neutral', size = 13, strong = false }: { label: React.ReactNode; tone?: StatusTone; size?: number; strong?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: size, fontWeight: strong ? 700 : 600, color: tone === 'danger' ? DANGER_TEXT : TEXT, whiteSpace: 'nowrap', lineHeight: 1.25, minWidth: 0 }}>
      <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_DOT[tone], flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </span>
  )
}
