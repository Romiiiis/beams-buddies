'use client'

import React, { useEffect, useRef, useState } from 'react'

const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export type ToolbarItem = {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  /** 'primary' is the main action. Put it last; use at most one per toolbar. */
  tone?: 'default' | 'primary' | 'danger'
  disabled?: boolean
  /** For submit buttons that belong to a form elsewhere on the page. */
  submitFor?: string
}

export type ToolbarSearch = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

// Hover, focus and sizing live in CSS so every toolbar in the app behaves identically.
// No glows: shadows stay neutral grey (see design rule: never add glow effects).
const css = `
  .htb {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    max-width: 100%;
    padding: 3px;
    background: #FFFFFF;
    border: 1px solid #E3E8EE;
    border-radius: 13px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 20px -12px rgba(15, 23, 42, 0.18);
  }
  .htb-btn {
    height: 36px;
    padding: 0 14px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: #1F2937;
    font-family: ${FONT};
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: -0.005em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .htb-btn:focus-visible, .htb-search-input:focus-visible { outline: 2px solid #2AA198; outline-offset: 2px; }
  .htb-btn:disabled { cursor: default; opacity: 0.65; }

  .htb-icon { display: inline-flex; color: #1F857C; }
  .htb-icon svg { width: 15px; height: 15px; }

  .htb-default:hover:not(:disabled) { background: #EBFAF7; color: #1F857C; }

  .htb-danger { color: #B91C1C; }
  .htb-danger .htb-icon { color: #B91C1C; }
  .htb-danger:hover:not(:disabled) { background: #FEF2F2; }

  .htb-primary {
    color: #FFFFFF;
    background: linear-gradient(180deg, #31B0A6 0%, #2AA198 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(15, 23, 42, 0.12);
  }
  .htb-primary .htb-icon { color: #FFFFFF; }
  .htb-primary:hover:not(:disabled) { background: linear-gradient(180deg, #2AA198 0%, #23928A 100%); }

  .htb-icon-only { width: 36px; padding: 0; }

  .htb-divider { width: 1px; height: 18px; background: #E8EDF2; flex-shrink: 0; }

  .htb-search { display: inline-flex; align-items: center; position: relative; }
  .htb-search-input {
    height: 36px;
    width: 220px;
    padding: 0 30px 0 34px;
    box-sizing: border-box;
    border: none;
    border-radius: 10px;
    background: #F4F6F8;
    color: #0B1220;
    font-family: ${FONT};
    font-size: 13px;
    font-weight: 600;
    outline: none;
  }
  .htb-search-input::placeholder { color: #94A3B8; font-weight: 500; }
  .htb-search-glyph { position: absolute; left: 10px; display: inline-flex; color: #1F857C; pointer-events: none; }
  .htb-search-glyph svg { width: 15px; height: 15px; }
  .htb-search-clear {
    position: absolute; right: 4px; width: 24px; height: 24px; border: none; border-radius: 7px;
    background: transparent; color: #64748B; font-size: 16px; line-height: 1; cursor: pointer;
  }
  .htb-search-clear:hover { background: #E8EDF2; }

  /* Compact size for actions inside cards and widgets */
  .htb-sm { padding: 2px; border-radius: 11px; }
  .htb-sm .htb-btn { height: 30px; padding: 0 11px; font-size: 12px; border-radius: 9px; gap: 6px; }
  .htb-sm .htb-icon svg { width: 14px; height: 14px; }
  .htb-sm .htb-icon-only { width: 30px; padding: 0; }
  .htb-sm .htb-divider { height: 16px; }

  @media (max-width: 767px) {
    .htb { padding: 2px; border-radius: 12px; }
    .htb-btn { padding: 0 11px; font-size: 12px; }
    .htb-icon-only { padding: 0; }
    .htb-search-input { width: 140px; font-size: 16px; }
    /* Never spill off-screen: scroll sideways if the labels are ever too wide */
    .htb { overflow-x: auto; scrollbar-width: none; min-width: 0; }
    .htb::-webkit-scrollbar { display: none; }
  }
  @media (hover: none) {
    .htb-default:hover:not(:disabled) { background: transparent; color: #1F2937; }
  }
`

const SearchGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

function SearchSegment({ search, open, setOpen }: { search: ToolbarSearch; open: boolean; setOpen: (open: boolean) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const expanded = open || !!search.value

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  if (!expanded) {
    return (
      <button type="button" className="htb-btn htb-default htb-icon-only" aria-label="Search" onClick={() => setOpen(true)}>
        <span className="htb-icon"><SearchGlyph /></span>
      </button>
    )
  }

  return (
    <div className="htb-search">
      <span className="htb-search-glyph"><SearchGlyph /></span>
      <input
        ref={inputRef}
        className="htb-search-input"
        type="search"
        aria-label={search.placeholder || 'Search'}
        value={search.value}
        placeholder={search.placeholder || 'Search...'}
        onChange={e => search.onChange(e.target.value)}
        onBlur={() => { if (!search.value) setOpen(false) }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            search.onChange('')
            setOpen(false)
          }
        }}
      />
      {search.value && (
        <button
          type="button"
          className="htb-search-clear"
          aria-label="Clear search"
          onMouseDown={e => e.preventDefault()}
          onClick={() => {
            search.onChange('')
            inputRef.current?.focus()
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

/**
 * The grouped action panel used across the app: page headers (top right) and, with size="sm",
 * card and widget headers. Optional search comes first, secondary actions next, the main action last.
 */
export function HeaderToolbar({
  items = [],
  isMobile = false,
  size = 'md',
  search,
}: {
  items?: ToolbarItem[]
  isMobile?: boolean
  size?: 'md' | 'sm'
  search?: ToolbarSearch
}) {
  const [searchOpen, setSearchOpen] = useState(!!search?.value)
  if (items.length === 0 && !search) return null

  // On phones, an open search box only shares the panel with the main action
  const searching = !!search && (searchOpen || !!search.value)
  const visible = isMobile && searching ? items.filter(item => item.tone === 'primary') : items
  // On phones with several labelled actions, labels alone keep the panel on one line
  const showIcons = !(isMobile && (visible.length > 1 || searching))

  return (
    <div className={`htb${size === 'sm' ? ' htb-sm' : ''}`} role="toolbar">
      <style>{css}</style>
      {search && <SearchSegment search={search} open={searchOpen} setOpen={setSearchOpen} />}
      {visible.map((item, i) => {
        const tone = item.tone || 'default'
        const prevTone = i === 0 ? (search ? 'default' : null) : visible[i - 1].tone || 'default'
        // Thin divider between two plain buttons; the main action's fill separates itself
        const divider = prevTone !== null && tone !== 'primary' && prevTone !== 'primary'
        return (
          <React.Fragment key={item.label}>
            {divider && <span className="htb-divider" aria-hidden="true" />}
            <button
              type={item.submitFor ? 'submit' : 'button'}
              form={item.submitFor}
              disabled={item.disabled}
              onClick={item.onClick}
              className={`htb-btn htb-${tone}`}
            >
              {showIcons && item.icon && <span className="htb-icon" aria-hidden="true">{item.icon}</span>}
              {item.label}
            </button>
          </React.Fragment>
        )
      })}
    </div>
  )
}
