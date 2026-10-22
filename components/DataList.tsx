'use client'

import React, { useEffect, useRef, useState } from 'react'

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const WHITE = '#FFFFFF'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export type DataListColumn<T> = {
  key: string
  label: string
  /** CSS grid track, e.g. 'minmax(0,1.4fr)' or '110px' */
  width: string
  render: (row: T) => React.ReactNode
  /** Label shown next to the value in the stacked mobile layout. Omit to show the value alone. */
  mobileLabel?: string
  hideOnMobile?: boolean
  /** Phone: show this column in the top row, beside the name (use for compact status pills). */
  mobileHeader?: boolean
  /** Phone: span the full width of the card, with no label. */
  mobileFull?: boolean
  align?: 'right'
}

export type DataListTab = { value: string; label: string; count?: number }
export type DataListRowAction<T> = { label: string; onClick: (row: T) => void; danger?: boolean }

type Props<T> = {
  /** Custom phone card. Replaces the generic name-plus-fields layout. */
  renderMobile?: (row: T) => React.ReactNode
  title: string
  isMobile: boolean
  rows: T[]
  rowKey: (row: T) => string
  columns: DataListColumn<T>[]
  loading?: boolean
  loadingText?: string
  emptyText?: string
  onRowClick?: (row: T) => void
  rowActions?: (row: T) => DataListRowAction<T>[]
  tabs?: DataListTab[]
  activeTab?: string
  onTabChange?: (value: string) => void
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  /** Extra filter controls, revealed by the filter icon button. */
  filters?: React.ReactNode
  addLabel?: string
  onAdd?: () => void
}

const Svg = ({ children, size = 16 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const SearchIcon = () => (
  <Svg>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Svg>
)
const FilterIcon = () => (
  <Svg>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Svg>
)
const PlusIcon = () => (
  <Svg size={14}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

const iconBtn: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: 'none',
  background: 'transparent',
  color: TEXT3,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'background 0.12s, color 0.12s',
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={e => {
        e.stopPropagation()
        onChange()
      }}
      style={{
        width: 20,
        height: 20,
        borderRadius: 6,
        border: `1.5px solid ${checked ? TEAL : '#CBD5E1'}`,
        background: checked ? TEAL : WHITE,
        cursor: 'pointer',
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: WHITE,
        flexShrink: 0,
      }}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      )}
    </button>
  )
}

function RowMenu<T>({ row, actions }: { row: T; actions: DataListRowAction<T>[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button type="button" aria-label="Row actions" onClick={() => setOpen(o => !o)} style={{ ...iconBtn, width: 32, height: 32, borderRadius: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="12" cy="19" r="1.7" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 36,
            zIndex: 20,
            minWidth: 150,
            background: WHITE,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            boxShadow: '0 10px 28px rgba(15,23,42,0.12)',
            padding: 6,
          }}
        >
          {actions.map(a => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                setOpen(false)
                a.onClick(row)
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '9px 10px',
                border: 'none',
                borderRadius: 8,
                background: 'transparent',
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 700,
                color: a.danger ? '#B91C1C' : TEXT2,
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const AVATAR_TINTS = [
  { bg: '#E6F6F4', fg: '#1F857C' },
  { bg: '#EEF2FF', fg: '#4F46E5' },
  { bg: '#FEF3C7', fg: '#92400E' },
  { bg: '#FCE7F3', fg: '#BE185D' },
  { bg: '#E0F2FE', fg: '#0369A1' },
  { bg: '#F1F5F9', fg: '#475569' },
]

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Avatar + bold name + muted second line, as in the reference's "Client" column. */
export function PersonCell({ name, sub }: { name: string; sub?: string | null }) {
  const tint = AVATAR_TINTS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_TINTS.length]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: tint.bg,
          color: tint.fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {initialsOf(name)}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        {sub ? <div style={{ fontSize: 12, color: TEXT3, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div> : null}
      </div>
    </div>
  )
}

/** Bold title with a muted subtitle, as in the reference's "Task" column. */
export function TitleCell({ title, sub }: { title: string; sub?: string | null }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
      {sub ? <div style={{ fontSize: 12, color: TEXT3, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div> : null}
    </div>
  )
}

export function TextCell({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return <div style={{ fontSize: 13, fontWeight: strong ? 800 : 600, color: strong ? TEXT : TEXT3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</div>
}

const TONES = {
  success: { bg: '#ECFDF5', fg: '#047857' },
  warn: { bg: '#FFF8E1', fg: '#92400E' },
  danger: { bg: '#FEF2F2', fg: '#B91C1C' },
  info: { bg: '#EFF6FF', fg: '#1D4ED8' },
  neutral: { bg: '#F1F5F9', fg: '#475569' },
  brand: { bg: TEAL_LIGHT, fg: TEAL_DARK },
}

export function StatusPill({ label, tone = 'neutral' }: { label: string; tone?: keyof typeof TONES }) {
  const t = TONES[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 11px 5px 9px',
        borderRadius: 8,
        background: t.bg,
        color: t.fg,
        fontSize: 11,
        fontWeight: 800,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.fg, flexShrink: 0 }} />
      {label}
    </span>
  )
}

export function DataList<T>({
  renderMobile,
  title,
  isMobile,
  rows,
  rowKey,
  columns,
  loading,
  loadingText = 'Loading...',
  emptyText = 'Nothing here yet.',
  onRowClick,
  rowActions,
  tabs,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  addLabel,
  onAdd,
}: Props<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [searchOpen, setSearchOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const hasSearch = onSearchChange !== undefined
  const showSearch = searchOpen || !!search
  const visibleKeys = rows.map(rowKey)
  const allSelected = visibleKeys.length > 0 && visibleKeys.every(k => selected.has(k))
  const selectedCount = visibleKeys.filter(k => selected.has(k)).length

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(visibleKeys))
  }
  function toggleOne(k: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  const desktopCols = columns.filter(c => !c.hideOnMobile || !isMobile)
  const gridTemplate = `20px ${columns.map(c => c.width).join(' ')}${rowActions ? ' 32px' : ''}`

  return (
    <div
      style={{
        background: WHITE,
        border: `1px solid ${BORDER}`,
        borderRadius: 20,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        fontFamily: FONT,
      }}
    >
      {/* Title row */}
      <div
        style={{
          padding: isMobile ? '16px 14px 8px' : '20px 24px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: TEXT, letterSpacing: '-0.035em' }}>{title}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          {hasSearch && showSearch && (
            <input
              autoFocus={searchOpen && !search}
              value={search}
              onChange={e => onSearchChange!(e.target.value)}
              onBlur={() => {
                if (!search) setSearchOpen(false)
              }}
              placeholder={searchPlaceholder}
              style={{
                height: 38,
                width: isMobile ? 150 : 240,
                borderRadius: 12,
                border: `1px solid ${BORDER}`,
                padding: '0 12px',
                fontSize: 12,
                fontWeight: 600,
                background: '#F8FAFC',
                color: TEXT,
                fontFamily: FONT,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          )}
          {hasSearch && !showSearch && (
            <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)} style={iconBtn} onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <SearchIcon />
            </button>
          )}
          {filters && (
            <button
              type="button"
              aria-label="Filters"
              aria-pressed={filtersOpen}
              onClick={() => setFiltersOpen(o => !o)}
              style={{ ...iconBtn, background: filtersOpen ? TEAL_LIGHT : 'transparent', color: filtersOpen ? TEAL_DARK : TEXT3 }}
            >
              <FilterIcon />
            </button>
          )}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              style={{
                height: 38,
                padding: '0 18px',
                border: 'none',
                borderRadius: 10,
                background: TEAL,
                color: WHITE,
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                whiteSpace: 'nowrap',
                transition: 'opacity 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.86')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <PlusIcon /> {addLabel || 'Add'}
            </button>
          )}
        </div>
      </div>

      {filters && filtersOpen && (
        <div style={{ padding: isMobile ? '4px 14px 8px' : '4px 24px 8px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>{filters}</div>
      )}

      {/* Pill tabs */}
      {tabs && tabs.length > 0 && (
        <div style={{ padding: isMobile ? '6px 14px' : '8px 24px 6px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {tabs.map(t => {
            const active = t.value === activeTab
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => onTabChange?.(t.value)}
                style={{
                  height: 34,
                  padding: '0 16px',
                  borderRadius: 10,
                  border: `1.5px solid ${active ? TEAL : 'transparent'}`,
                  background: active ? TEAL_LIGHT : 'transparent',
                  color: active ? TEAL_DARK : TEXT2,
                  fontFamily: FONT,
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'background 0.12s, color 0.12s',
                }}
              >
                {t.label}
                {typeof t.count === 'number' && <span style={{ fontSize: 12, fontWeight: 900 }}>{t.count}</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Column headings */}
      {!isMobile && rows.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            columnGap: 16,
            alignItems: 'center',
            padding: '14px 24px 8px 24px',
          }}
        >
          <Checkbox checked={allSelected} onChange={toggleAll} label="Select all" />
          {columns.map(c => (
            <div key={c.key} style={{ fontSize: 12, fontWeight: 700, color: TEXT3, textAlign: c.align }}>
              {c.label}
            </div>
          ))}
          {rowActions && <div />}
        </div>
      )}

      {selectedCount > 0 && (
        <div style={{ padding: isMobile ? '4px 14px' : '2px 24px 6px', fontSize: 12, fontWeight: 700, color: TEAL_DARK, display: 'flex', gap: 10, alignItems: 'center' }}>
          {selectedCount} selected
          <button type="button" onClick={() => setSelected(new Set())} style={{ border: 'none', background: 'transparent', color: TEXT3, fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
            Clear
          </button>
        </div>
      )}

      {/* Rows */}
      <div style={{ padding: isMobile ? '6px 12px 16px' : '4px 14px 18px', display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 6 }}>
        {loading ? (
          <div style={{ padding: '32px 18px', textAlign: 'center', color: TEXT3, fontSize: 13 }}>{loadingText}</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '32px 18px', textAlign: 'center', color: TEXT3, fontSize: 13 }}>{emptyText}</div>
        ) : (
          rows.map(row => {
            const k = rowKey(row)
            const isSel = selected.has(k)
            const actions = rowActions?.(row)
            const rowStyle: React.CSSProperties = {
              border: `1px solid ${isSel ? '#BFE7E3' : 'transparent'}`,
              borderRadius: 14,
              background: isSel ? TEAL_LIGHT : WHITE,
              cursor: onRowClick ? 'pointer' : 'default',
              transition: 'background 0.12s, border-color 0.12s, box-shadow 0.12s',
            }
            const hoverOn = (e: React.MouseEvent<HTMLDivElement>) => {
              if (isSel) return
              e.currentTarget.style.background = '#F8FAFC'
              e.currentTarget.style.borderColor = BORDER
            }
            const hoverOff = (e: React.MouseEvent<HTMLDivElement>) => {
              if (isSel) return
              e.currentTarget.style.background = WHITE
              e.currentTarget.style.borderColor = 'transparent'
            }

            if (isMobile) {
              if (renderMobile) {
                const rowActionsList = actions && actions.length > 0 ? actions : null
                return (
                  <div key={k} onClick={() => onRowClick?.(row)} style={{ ...rowStyle, padding: '14px', border: `1px solid ${isSel ? '#BFE7E3' : BORDER}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>{renderMobile(row)}</div>
                      {rowActionsList && <RowMenu row={row} actions={rowActionsList} />}
                    </div>
                  </div>
                )
              }
              const [first, ...rest] = desktopCols
              const headerCols = rest.filter(c => c.mobileHeader)
              const bodyCols = rest.filter(c => !c.mobileHeader)
              return (
                <div key={k} onClick={() => onRowClick?.(row)} style={{ ...rowStyle, padding: '14px', border: `1px solid ${isSel ? '#BFE7E3' : BORDER}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>{first.render(row)}</div>
                    {headerCols.map(c => (
                      <div key={c.key} style={{ flexShrink: 0 }}>
                        {c.render(row)}
                      </div>
                    ))}
                    {actions && actions.length > 0 && <RowMenu row={row} actions={actions} />}
                  </div>
                  {bodyCols.length > 0 && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '12px 16px',
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: `1px solid ${BORDER}`,
                      }}
                    >
                      {bodyCols.map(c => (
                        <div key={c.key} style={{ minWidth: 0, gridColumn: c.mobileFull ? '1 / -1' : undefined }}>
                          {!c.mobileFull && <div style={{ fontSize: 11, fontWeight: 600, color: TEXT3, marginBottom: 4 }}>{c.mobileLabel || c.label}</div>}
                          {c.render(row)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <div
                key={k}
                onClick={() => onRowClick?.(row)}
                style={{ ...rowStyle, display: 'grid', gridTemplateColumns: gridTemplate, columnGap: 16, alignItems: 'center', padding: '12px 10px 12px 10px' }}
                onMouseEnter={hoverOn}
                onMouseLeave={hoverOff}
              >
                <Checkbox checked={isSel} onChange={() => toggleOne(k)} label="Select row" />
                {columns.map(c => (
                  <div key={c.key} style={{ minWidth: 0, textAlign: c.align }}>
                    {c.render(row)}
                  </div>
                ))}
                {actions && actions.length > 0 ? <RowMenu row={row} actions={actions} /> : rowActions ? <div /> : null}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}


/** Coloured status dropdown: rounded rectangle with the chevron drawn inside the right edge. */
export function StatusSelect({
  value,
  options,
  onChange,
  colors,
  label,
  width = 118,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  colors: { bg: string; fg: string; border: string }
  label: string
  width?: number
}) {
  return (
    <div style={{ position: 'relative', width, display: 'inline-block' }} onClick={e => e.stopPropagation()}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={label}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          width: '100%',
          height: 34,
          padding: '0 30px 0 12px',
          borderRadius: 10,
          border: `1px solid ${colors.border}`,
          background: colors.bg,
          color: colors.fg,
          fontSize: 12,
          fontWeight: 800,
          fontFamily: FONT,
          cursor: 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.fg}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  )
}
