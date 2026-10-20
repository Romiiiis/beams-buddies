'use client'

import React from 'react'

const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export type ToolbarItem = {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  /** 'primary' is the page's main action. Put it last; use at most one per page. */
  tone?: 'default' | 'primary' | 'danger'
  disabled?: boolean
  /** For submit buttons that belong to a form elsewhere on the page. */
  submitFor?: string
}

// Hover, focus and icon sizing live in CSS so every page's toolbar behaves identically.
const css = `
  .htb {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    max-width: 100%;
    padding: 4px;
    background: #FFFFFF;
    border: 1px solid #E3E8EE;
    border-radius: 14px;
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
    gap: 7px;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .htb-btn:focus-visible { outline: 2px solid #2AA198; outline-offset: 2px; }
  .htb-btn:active:not(:disabled) { transform: translateY(0.5px); }
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
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 1px 2px rgba(31, 133, 124, 0.35), 0 4px 10px -4px rgba(42, 161, 152, 0.55);
  }
  .htb-primary .htb-icon { color: #FFFFFF; }
  .htb-primary:hover:not(:disabled) {
    background: linear-gradient(180deg, #2AA198 0%, #23928A 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 1px 2px rgba(31, 133, 124, 0.4), 0 6px 14px -5px rgba(42, 161, 152, 0.6);
  }

  .htb-divider { width: 1px; height: 18px; background: #E8EDF2; flex-shrink: 0; }

  @media (max-width: 767px) {
    .htb-btn { padding: 0 11px; font-size: 12px; }
    /* Never spill off-screen: scroll sideways if a pair of labels is ever too wide */
    .htb { overflow-x: auto; scrollbar-width: none; min-width: 0; }
    .htb::-webkit-scrollbar { display: none; }
  }
  @media (hover: none) {
    .htb-default:hover:not(:disabled) { background: transparent; color: #1F2937; }
  }
`

/** The grouped action panel in a page header's top right: secondary actions first, the main action last. */
export function HeaderToolbar({ items, isMobile = false }: { items: ToolbarItem[]; isMobile?: boolean }) {
  if (items.length === 0) return null
  // On phones with several actions, labels alone keep the panel on one line
  const showIcons = !(isMobile && items.length > 1)

  return (
    <div className="htb" role="toolbar">
      <style>{css}</style>
      {items.map((item, i) => {
        const tone = item.tone || 'default'
        const prev = items[i - 1]
        // Thin divider between two plain buttons; the primary button's fill separates itself
        const divider = i > 0 && tone !== 'primary' && (prev?.tone || 'default') !== 'primary'
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
