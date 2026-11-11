'use client'

import React, { useEffect, useRef, useState } from 'react'

// Shared building blocks for forms and pop-ups, so every page looks the same:
// one input size, one label style, one set of buttons and one Modal shell.

export const TEAL = '#2AA198'
export const TEAL_DARK = '#1F857C'
export const TEAL_LIGHT = '#EBFAF7'
export const TEXT = '#0B1220'
export const TEXT2 = '#1F2937'
export const TEXT3 = '#64748B'
export const LINE = '#E8EDF2'
export const FIELD_LINE = '#DCE3EA'
export const WHITE = '#FFFFFF'
export const RED = '#B91C1C'
export const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

/** Text boxes, number boxes, date boxes and dropdown triggers all share this size and shape. */
export const FIELD: React.CSSProperties = {
  width: '100%',
  height: 42,
  padding: '0 14px',
  borderRadius: 12,
  border: `1px solid ${FIELD_LINE}`,
  background: WHITE,
  color: TEXT,
  fontFamily: FONT,
  fontSize: 14,
  fontWeight: 500,
  outline: 'none',
  boxSizing: 'border-box',
}

export const FIELD_TEXTAREA: React.CSSProperties = {
  ...FIELD,
  height: 'auto',
  minHeight: 88,
  padding: '10px 14px',
  lineHeight: 1.5,
  resize: 'vertical',
}

/** Small capital label above a field. */
export const LABEL: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: TEXT3,
  lineHeight: 1.3,
}

const BTN_BASE: React.CSSProperties = {
  height: 40,
  padding: '0 18px',
  borderRadius: 10,
  fontFamily: FONT,
  fontSize: 14,
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  boxSizing: 'border-box',
  transition: 'background 0.12s ease, border-color 0.12s ease, opacity 0.12s ease',
}

/** Button looks. Spread one into a <button style>. */
export const BTN = {
  primary: { ...BTN_BASE, border: 'none', background: TEAL, color: WHITE } as React.CSSProperties,
  secondary: { ...BTN_BASE, border: `1px solid ${FIELD_LINE}`, background: WHITE, color: TEXT2 } as React.CSSProperties,
  danger: { ...BTN_BASE, border: '1px solid #FECACA', background: WHITE, color: RED } as React.CSSProperties,
  dangerSolid: { ...BTN_BASE, border: 'none', background: '#DC2626', color: WHITE } as React.CSSProperties,
  disabled: { opacity: 0.5, cursor: 'not-allowed' } as React.CSSProperties,
}

/** Compact size for buttons that sit in a header or a toolbar. */
export const BTN_SM: React.CSSProperties = { height: 34, padding: '0 14px', fontSize: 13, borderRadius: 10 }

export function useIsPhone() {
  // Read the real width straight away. Starting at "not a phone" made every pop-up open as a desktop card and then
  // jump into a phone sheet a moment later, which looked like the screen moving.
  const [phone, setPhone] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false))
  useEffect(() => {
    const check = () => setPhone(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return phone
}

const SIZES = { sm: 440, md: 560, lg: 680, xl: 760 }
const TOP_GAP = '6dvh'

// The page behind a pop-up must not scroll. Pop-ups can open on top of each other and close in any
// order, so the lock is counted: the page is released only when the last one has closed.
const modalStack: object[] = []
let scrollLocks = 0
let savedOverflow = ''
function lockPageScroll() {
  if (scrollLocks === 0) {
    savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  scrollLocks += 1
}
function unlockPageScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1)
  if (scrollLocks === 0) document.body.style.overflow = savedOverflow
}

/**
 * Pop-up shell: a centred card on a computer, a sheet that rises from the bottom on a phone.
 * Title and close button stay at the top, the body scrolls, the footer (buttons) stays at the bottom.
 */
export function Modal({
  title,
  onClose,
  children,
  footer,
  headerExtra,
  size = 'md',
  layer = 400,
  busy = false,
  flush = false,
  onSubmit,
  id,
  compact = false,
}: {
  title: React.ReactNode
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  /** Extra controls in the header, before the close button (for example Print or Delete). */
  headerExtra?: React.ReactNode
  size?: keyof typeof SIZES
  /** Stacking level. Use a higher one for a pop-up opened from another pop-up. */
  layer?: number
  busy?: boolean
  /** No padding around the body, for content that brings its own (like an invoice page). */
  flush?: boolean
  /** Makes the whole pop-up a form, so a submit button in the footer sends it. */
  onSubmit?: (e: React.FormEvent) => void
  id?: string
  /** Short messages ("Are you sure?"): the pop-up is only as tall as its text. Everything else keeps one fixed size. */
  compact?: boolean
}) {
  const phone = useIsPhone()
  const Card = (onSubmit ? 'form' : 'div') as React.ElementType
  // A fixed height means the pop-up never grows or shrinks as fields, lines or messages change, so it never moves.
  const stable = !compact && (phone || size === 'lg' || size === 'xl')

  // Registered once when the pop-up opens, so the stacking order is the order they were opened in
  const token = useRef({})
  const closeRef = useRef(onClose)
  const busyRef = useRef(busy)
  closeRef.current = onClose
  busyRef.current = busy
  useEffect(() => {
    const me = token.current
    modalStack.push(me)
    // Escape closes only the pop-up on top, not the one underneath it
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busyRef.current && modalStack[modalStack.length - 1] === me) closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    lockPageScroll()
    return () => {
      document.removeEventListener('keydown', onKey)
      const i = modalStack.indexOf(me)
      if (i >= 0) modalStack.splice(i, 1)
      unlockPageScroll()
    }
  }, [])

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (!busy) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: layer,
        background: 'rgba(11,18,32,0.45)',
        display: 'flex',
        // Anchored to the top on a computer, so a change in height only ever extends downwards
        alignItems: phone ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
        padding: phone ? 0 : `${TOP_GAP} 20px 20px`,
        fontFamily: FONT,
      }}
    >
      <Card
        id={id}
        role="dialog"
        aria-modal="true"
        className="modal-card"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        {...(onSubmit ? { onSubmit } : {})}
        style={{
          width: '100%',
          maxWidth: SIZES[size],
          ...(stable ? { height: phone ? '92dvh' : `min(calc(100dvh - ${TOP_GAP} - 20px), 780px)` } : {}),
          maxHeight: phone ? '92dvh' : `calc(100dvh - ${TOP_GAP} - 20px)`,
          touchAction: 'pan-y pinch-zoom',
          display: 'flex',
          flexDirection: 'column',
          background: WHITE,
          borderRadius: phone ? '18px 18px 0 0' : 16,
          border: `1px solid ${LINE}`,
          boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: phone ? '14px 16px' : '16px 24px',
            borderBottom: `1px solid ${LINE}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', lineHeight: 1.25, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', ...(phone && headerExtra ? { width: '100%', order: 3 } : {}) }}>
            {headerExtra}
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close"
              style={{
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: 10,
                border: `1px solid ${LINE}`,
                background: WHITE,
                color: TEXT3,
                fontSize: 20,
                lineHeight: 1,
                cursor: busy ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...(phone && headerExtra ? { marginLeft: 'auto' } : {}),
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: flush ? 0 : phone ? '16px' : '20px 24px', overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', flex: 1, minHeight: 0 }}>
          {children}
        </div>

        {footer && (
          <div
            style={{
              padding: phone ? '12px 16px calc(12px + env(safe-area-inset-bottom))' : '14px 24px',
              borderTop: `1px solid ${LINE}`,
              display: 'flex',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              gap: 8,
              flexShrink: 0,
              background: WHITE,
            }}
          >
            {footer}
          </div>
        )}
      </Card>
    </div>
  )
}

/** "Are you sure?" pop-up used for deletes and other one-way actions. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  busyLabel,
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
  layer = 450,
}: {
  title: React.ReactNode
  message: React.ReactNode
  confirmLabel?: string
  busyLabel?: string
  tone?: 'danger' | 'primary'
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
  layer?: number
}) {
  return (
    <Modal
      title={title}
      size="sm"
      compact
      layer={layer}
      busy={busy}
      onClose={onCancel}
      footer={
        <>
          <button type="button" onClick={onCancel} disabled={busy} style={{ ...BTN.secondary, ...(busy ? BTN.disabled : {}) }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{ ...(tone === 'danger' ? BTN.dangerSolid : BTN.primary), ...(busy ? BTN.disabled : {}) }}
          >
            {busy ? busyLabel || 'Working...' : confirmLabel}
          </button>
        </>
      }
    >
      <div style={{ fontSize: 14, lineHeight: 1.6, color: TEXT3 }}>{message}</div>
    </Modal>
  )
}

/** Small message that appears at the bottom of the screen and fades away on its own. */
export function Toast({ message, onClose, tone = 'dark' }: { message: string; onClose: () => void; tone?: 'dark' | 'error' }) {
  const phone = useIsPhone()
  useEffect(() => {
    const t = setTimeout(onClose, 4500)
    return () => clearTimeout(t)
  }, [message, onClose])
  return (
    <div
      role="status"
      onClick={onClose}
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: phone ? 'calc(var(--tabbar-h) + 18px)' : 24,
        zIndex: 1100,
        background: tone === 'error' ? RED : TEXT,
        color: WHITE,
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: 600,
        padding: '11px 16px',
        borderRadius: 10,
        maxWidth: 'min(92vw, 460px)',
        boxShadow: '0 8px 24px rgba(15,23,42,0.22)',
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      {message}
    </div>
  )
}
