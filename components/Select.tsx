'use client'

import React from 'react'

// The one dropdown used across the CRM, styled like the Clients filter in Lumyra: a flat field with a hairline
// border and a soft grey chevron. It is a real <select>, so a phone opens its own picker and nothing floats over
// (or shifts) the page. The look lives in globals.css (.jb-select).
//
//   <Select value=... onChange={e => set(e.target.value)}><option value="a">A</option>...</Select>
//
// Handlers receive the same { target: { value } } they always did, so pages did not need to change.

export type SelectOption = { value: string; label: React.ReactNode; /** Shown after the label, e.g. a count. */ hint?: React.ReactNode; disabled?: boolean }

function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (React.isValidElement(node)) return textOf((node.props as { children?: React.ReactNode }).children)
  return ''
}

/** Only layout settings are taken from the style a page passes; colours and shape come from the shared look. */
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

export function Select({ value, onChange, children, options, placeholder, style, required, disabled, id, name, 'aria-label': ariaLabel }: SelectProps) {
  const v = value === null || value === undefined ? '' : String(value)
  const height = typeof style?.height === 'number' ? style.height : parseInt(String(style?.height ?? ''), 10) || 44
  const small = height <= 38

  const layout: React.CSSProperties = {}
  for (const k of LAYOUT_KEYS) if (style && style[k] !== undefined) (layout as Record<string, unknown>)[k] = style[k]
  const wrap: React.CSSProperties = layout.width === undefined ? { display: 'inline-block', minWidth: 150, ...layout } : { display: layout.width === '100%' ? 'block' : 'inline-block', ...layout }

  const hasEmpty = (options || []).some(o => o.value === '')
  return (
    <span className="jb-select-wrap" style={wrap}>
      <select
        id={id}
        name={name}
        value={v}
        required={required}
        disabled={disabled}
        aria-label={ariaLabel}
        data-empty={v === '' ? 'true' : 'false'}
        className={small ? 'jb-select sm' : 'jb-select'}
        style={{ height }}
        onChange={e => onChange?.({ target: { value: e.target.value } })}
      >
        {placeholder && !hasEmpty && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {(options || []).map(o => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {textOf(o.label)}
            {o.hint !== undefined && o.hint !== null ? ` (${textOf(o.hint)})` : ''}
          </option>
        ))}
        {children}
      </select>
      <svg className="jb-select-chev" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  )
}
