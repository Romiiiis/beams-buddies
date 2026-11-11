'use client'

import React from 'react'
import { AppIcon } from '@/components/AppIcon'

// The heading of a slide-over detail panel (a job, a lead). On a phone the panel fills the screen, so it gets a back
// arrow, the name and one quiet line beneath it, with its actions to the right. On a computer it keeps the small
// label, name and phone number with the actions and a close button to the right.

const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const LINE = '#E8EDF2'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const squareBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  flexShrink: 0,
  padding: 0,
  borderRadius: 12,
  border: `1px solid ${LINE}`,
  background: '#FFFFFF',
  color: TEXT2,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontFamily: FONT,
}

export function DrawerHeader({
  title,
  eyebrow,
  detail,
  meta,
  actions,
  onClose,
  isMobile,
  closeLabel = 'Close',
}: {
  title: React.ReactNode
  /** Small label above the name. Computer only. */
  eyebrow?: React.ReactNode
  /** A line under the name, such as a phone number. Computer only. */
  detail?: React.ReactNode
  /** The quiet status line (a dot and a few words). Shown on both. */
  meta?: React.ReactNode
  /** Buttons that sit at the right (for example Contact). */
  actions?: React.ReactNode
  onClose: () => void
  isMobile: boolean
  /** What the back arrow does, read out by screen readers. */
  closeLabel?: string
}) {
  if (isMobile) {
    return (
      <div style={{ padding: '10px 14px 12px', borderBottom: `1px solid ${LINE}`, background: '#FFFFFF', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" onClick={onClose} aria-label={closeLabel} style={squareBtn}>
          <AppIcon name="arrow-left" size={16} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          {meta && <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 13, color: TEXT3, fontWeight: 600 }}>{meta}</div>}
        </div>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>{actions}</div>}
      </div>
    )
  }

  return (
    <div style={{ padding: '18px 20px 16px', borderBottom: `1px solid ${LINE}`, background: '#FFFFFF', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          {eyebrow && <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT3, marginBottom: 6 }}>{eyebrow}</div>}
          <div style={{ fontSize: 18, fontWeight: 900, color: TEXT, lineHeight: 1.2, marginBottom: detail ? 4 : 0, letterSpacing: '-0.035em', overflowWrap: 'anywhere' }}>{title}</div>
          {detail && <div style={{ fontSize: 13, fontWeight: 600, color: TEXT3 }}>{detail}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {actions}
          <button type="button" onClick={onClose} aria-label="Close" style={{ ...squareBtn, width: 34, height: 34, borderRadius: 10, color: TEXT3, fontSize: 20, lineHeight: 1 }}>
            ×
          </button>
        </div>
      </div>
      {meta && <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>{meta}</div>}
    </div>
  )
}
