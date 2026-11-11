'use client'

import React, { useEffect, useRef, useState } from 'react'
import { BTN, BTN_SM, FONT, RED, TEXT } from '@/components/forms'

export type MenuAction = { label: string; onClick: () => void; danger?: boolean }

/** A "More" button that opens a short list of actions. Looks like the row menus in lists and works inside pop-ups. */
export function ActionMenu({ label = 'More', actions }: { label?: string; actions: MenuAction[] }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    function down(e: MouseEvent) {
      const t = e.target as Node
      if (!btn.current?.contains(t) && !panel.current?.contains(t)) close()
    }
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
      }
    }
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', down)
      document.removeEventListener('keydown', key, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  function toggle() {
    if (!open && btn.current) {
      const r = btn.current.getBoundingClientRect()
      setPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) })
    }
    setOpen(o => !o)
  }

  return (
    <>
      <button ref={btn} type="button" aria-haspopup="menu" aria-expanded={open} onClick={toggle} style={{ ...BTN.secondary, ...BTN_SM }}>
        {label}
      </button>
      {open && pos && (
        <div
          ref={panel}
          role="menu"
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 900, minWidth: 190, maxWidth: 'calc(100vw - 16px)', background: '#FFFFFF', border: '1px solid #E3E8EE', borderRadius: 14, boxShadow: '0 12px 32px rgba(15,23,42,0.16)', padding: 6 }}
        >
          {actions.map(a => (
            <button
              key={a.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                a.onClick()
              }}
              style={{ display: 'block', width: '100%', textAlign: 'left', minHeight: 40, padding: '0 12px', border: 'none', borderRadius: 10, background: 'transparent', fontFamily: FONT, fontSize: 14, fontWeight: 600, color: a.danger ? RED : TEXT, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = a.danger ? '#FEF2F2' : '#EEF8F6')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
