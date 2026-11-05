'use client'

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// The one dropdown used across the CRM: a rounded box with a round chevron on the right, and a floating
// panel whose rows have a square tick box (filled teal when chosen).
//
//   <Select value=... onChange={e => set(e.target.value)}><option value="a">A</option>...</Select>
//
// It takes <option> children and calls onChange with { target: { value } }, so it can replace a native
// <select> without touching the handlers. The panel is drawn on top of the page (not inside it), so it is
// never clipped by a modal, card or scrolling list.

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const TEXT = '#0B1220'
const TEXT3 = '#64748B'
const FIELD_BORDER = '#DCE3EA'
const PANEL_BORDER = '#E3E8EE'
const WHITE = '#FFFFFF'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export type SelectOption = { value: string; label: React.ReactNode; /** Small note on the right, e.g. a count. */ hint?: React.ReactNode; disabled?: boolean }

/** Round chevron that sits at the right of every dropdown. */
export function ChevronBadge({ open, size = 24, bg = TEAL_LIGHT, fg = TEAL_DARK }: { open?: boolean; size?: number; bg?: string; fg?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: fg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transform: open ? 'rotate(180deg)' : 'none',
        transition: 'transform 0.15s ease',
      }}
    >
      <svg width={Math.round(size * 0.52)} height={Math.round(size * 0.52)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  )
}

function TickBox({ checked, size }: { checked: boolean; size: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        flexShrink: 0,
        border: `1.5px solid ${checked ? TEAL : '#CBD5E1'}`,
        background: checked ? TEAL : WHITE,
        color: WHITE,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.12s ease, border-color 0.12s ease',
      }}
    >
      {checked && (
        <svg width={Math.round(size * 0.62)} height={Math.round(size * 0.62)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      )}
    </span>
  )
}

export type DropdownTriggerArgs = {
  open: boolean
  current: SelectOption | undefined
  /** Spread these onto the trigger <button>. */
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { ref: React.RefObject<HTMLButtonElement | null> }
}

/** Behaviour shared by every dropdown: open and close, floating panel, keyboard, outside click. */
export function Dropdown({
  options,
  value,
  onChange,
  renderTrigger,
  size = 'md',
  minPanelWidth = 0,
  disabled,
  label,
  wrapperStyle,
}: {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  renderTrigger: (args: DropdownTriggerArgs) => React.ReactNode
  size?: 'md' | 'sm'
  minPanelWidth?: number
  disabled?: boolean
  label?: string
  wrapperStyle?: React.CSSProperties
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; width: number; maxHeight: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const listId = useId()
  const rowH = size === 'sm' ? 38 : 44
  const current = options.find(o => o.value === value)

  const place = useCallback(() => {
    const b = btnRef.current
    if (!b) return
    const r = b.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const width = Math.min(Math.max(r.width, minPanelWidth), vw - 16)
    const left = Math.max(8, Math.min(r.left, vw - width - 8))
    const wanted = Math.min(12 + options.length * rowH, 320)
    const below = vh - r.bottom - 14
    const above = r.top - 14
    if (below >= Math.min(wanted, 220) || below >= above) {
      setPos({ left, top: r.bottom + 6, width, maxHeight: Math.max(120, Math.min(320, below)) })
    } else {
      setPos({ left, bottom: vh - r.top + 6, width, maxHeight: Math.max(120, Math.min(320, above)) })
    }
  }, [minPanelWidth, options.length, rowH])

  const close = useCallback(() => setOpen(false), [])

  function openMenu() {
    if (disabled) return
    const idx = options.findIndex(o => o.value === value)
    setActive(idx >= 0 ? idx : options.findIndex(o => !o.disabled))
    place()
    setOpen(true)
  }

  function choose(idx: number) {
    const o = options[idx]
    if (!o || o.disabled) return
    onChange(o.value)
    setOpen(false)
    btnRef.current?.focus()
  }

  function move(dir: 1 | -1, from = active) {
    if (!options.length) return
    let i = from
    for (let n = 0; n < options.length; n++) {
      i = (i + dir + options.length) % options.length
      if (!options[i].disabled) {
        setActive(i)
        return
      }
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openMenu()
      }
      return
    }
    if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      move(1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      move(-1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      move(1, -1)
    } else if (e.key === 'End') {
      e.preventDefault()
      move(-1, 0)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(active)
    }
  }

  // Keep the panel attached to the trigger while the page scrolls or resizes
  useEffect(() => {
    if (!open) return
    place()
    const update = () => place()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    function onDown(e: MouseEvent | TouchEvent) {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open, place])

  // Show the chosen row when the panel opens, and follow the keyboard
  useLayoutEffect(() => {
    if (!open || !pos) return
    panelRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [open, active, pos])

  return (
    <div style={{ position: 'relative', ...wrapperStyle }} onClick={e => e.stopPropagation()}>
      {renderTrigger({
        open,
        current,
        props: {
          ref: btnRef,
          type: 'button',
          disabled,
          'aria-haspopup': 'listbox',
          'aria-expanded': open,
          'aria-controls': open ? listId : undefined,
          'aria-label': label,
          onClick: () => (open ? close() : openMenu()),
          onKeyDown,
        },
      })}

      {open && pos && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-label={label}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
              width: pos.width,
              maxHeight: pos.maxHeight,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              zIndex: 1200,
              background: WHITE,
              border: `1px solid ${PANEL_BORDER}`,
              borderRadius: 14,
              boxShadow: '0 12px 32px rgba(15,23,42,0.16)',
              padding: 6,
              fontFamily: FONT,
              boxSizing: 'border-box',
            }}
          >
            {options.map((o, i) => {
              const selected = o.value === value
              return (
                <div
                  key={o.value + ':' + i}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={o.disabled || undefined}
                  data-active={i === active}
                  onMouseEnter={() => !o.disabled && setActive(i)}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => choose(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    minHeight: rowH,
                    padding: '6px 12px',
                    borderRadius: 10,
                    background: i === active ? '#EEF8F6' : 'transparent',
                    color: o.disabled ? '#94A3B8' : TEXT,
                    fontSize: size === 'sm' ? 14 : 15,
                    fontWeight: selected ? 650 : 500,
                    lineHeight: 1.3,
                    cursor: o.disabled ? 'not-allowed' : 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <TickBox checked={selected} size={size === 'sm' ? 18 : 20} />
                  <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{o.label}</span>
                  {o.hint != null && <span style={{ fontSize: 13, fontWeight: 700, color: selected ? TEAL_DARK : '#94A3B8' }}>{o.hint}</span>}
                </div>
              )
            })}
          </div>,
          document.body
        )}
    </div>
  )
}

function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (React.isValidElement(node)) return textOf((node.props as { children?: React.ReactNode }).children)
  return ''
}

function collect(children: React.ReactNode, out: SelectOption[]) {
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return
    const p = child.props as { value?: string | number; children?: React.ReactNode; disabled?: boolean }
    if (child.type === React.Fragment) {
      collect(p.children, out)
    } else if (child.type === 'option') {
      out.push({ value: p.value !== undefined ? String(p.value) : textOf(p.children), label: p.children, disabled: p.disabled })
    }
  })
}

/** Only layout settings are taken from the old select styles; colours and shape come from the shared look. */
const LAYOUT_KEYS = ['width', 'minWidth', 'maxWidth', 'flex', 'flexGrow', 'flexShrink', 'alignSelf', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'gridColumn'] as const

export type SelectProps = {
  value?: string | number | null
  onChange?: (e: { target: { value: string } }) => void
  children?: React.ReactNode
  options?: SelectOption[]
  placeholder?: string
  style?: React.CSSProperties
  required?: boolean
  disabled?: boolean
  id?: string
  name?: string
  'aria-label'?: string
}

export function Select({ value, onChange, children, options: optionsProp, placeholder, style, required, disabled, id, name, 'aria-label': ariaLabel }: SelectProps) {
  const options: SelectOption[] = []
  if (optionsProp) options.push(...optionsProp)
  collect(children, options)
  // An empty option worded like "Select customer..." is a hint, not a real choice: show it in the box, not the list
  const hintAt = options.findIndex(o => o.value === '' && /^select\b|\.\.\.$|…$/i.test(textOf(o.label).trim()))
  const hint = hintAt >= 0 ? textOf(options[hintAt].label).trim() : undefined
  if (hintAt >= 0) options.splice(hintAt, 1)
  placeholder = placeholder ?? hint
  const v = value == null ? '' : String(value)

  const height = typeof style?.height === 'number' ? style.height : parseInt(String(style?.height ?? ''), 10) || 44
  const small = height <= 38
  const layout: React.CSSProperties = {}
  for (const k of LAYOUT_KEYS) if (style && style[k] !== undefined) (layout as Record<string, unknown>)[k] = style[k]
  const fontSize = typeof style?.fontSize === 'number' ? style.fontSize : parseInt(String(style?.fontSize ?? ''), 10) || (small ? 14 : 15)

  return (
    <Dropdown
      options={options}
      value={v}
      onChange={nv => onChange?.({ target: { value: nv } })}
      size={small ? 'sm' : 'md'}
      minPanelWidth={190}
      disabled={disabled}
      label={ariaLabel}
      wrapperStyle={layout.width === undefined ? { display: 'inline-block', minWidth: 150, ...layout } : { display: layout.width === '100%' ? 'block' : 'inline-block', ...layout }}
      renderTrigger={({ open, current, props }) => {
        const empty = !current || current.value === ''
        return (
          <>
            <button
              {...props}
              id={id}
              style={{
                width: '100%',
                height,
                padding: small ? '0 8px 0 12px' : '0 10px 0 16px',
                borderRadius: 12,
                border: `1px solid ${open ? TEAL : FIELD_BORDER}`,
                boxShadow: open ? `0 0 0 1px ${TEAL}` : '0 1px 2px rgba(15,23,42,0.04)',
                background: WHITE,
                color: empty ? TEXT3 : TEXT,
                fontFamily: FONT,
                fontSize,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textAlign: 'left',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.55 : 1,
                boxSizing: 'border-box',
                transition: 'border-color 0.12s ease, box-shadow 0.12s ease',
              }}
            >
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current ? current.label : placeholder ?? ''}</span>
              <ChevronBadge open={open} size={small ? 20 : 24} />
            </button>
            {(required || name) && (
              <input
                tabIndex={-1}
                aria-hidden="true"
                required={required}
                name={name}
                value={v}
                onChange={() => {}}
                style={{ position: 'absolute', left: 0, bottom: 0, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
              />
            )}
          </>
        )
      }}
    />
  )
}
