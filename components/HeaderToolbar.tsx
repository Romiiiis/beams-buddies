'use client'

import React from 'react'

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const TEXT2 = '#1F2937'
const BORDER = '#E8EDF2'
const WHITE = '#FFFFFF'
const RED = '#B91C1C'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export type ToolbarItem = {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  /** 'primary' is a solid teal segment for the main action on a page. */
  tone?: 'default' | 'primary' | 'danger'
  disabled?: boolean
  /** For submit buttons that belong to a form elsewhere on the page. */
  submitFor?: string
}

/** The grouped action panel in a page header's top right: one rounded panel, one segment per action. */
export function HeaderToolbar({ items, isMobile = false }: { items: ToolbarItem[]; isMobile?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexShrink: 0,
        padding: 4,
        background: WHITE,
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        maxWidth: '100%',
      }}
    >
      {items.map(item => {
        const tone = item.tone || 'default'
        const base = tone === 'primary' ? { bg: TEAL, fg: WHITE } : tone === 'danger' ? { bg: 'transparent', fg: RED } : { bg: 'transparent', fg: TEXT2 }
        return (
          <button
            key={item.label}
            type={item.submitFor ? 'submit' : 'button'}
            form={item.submitFor}
            disabled={item.disabled}
            onClick={item.onClick}
            style={{
              height: 36,
              padding: isMobile ? '0 10px' : '0 14px',
              border: 'none',
              borderRadius: 10,
              background: base.bg,
              color: base.fg,
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 700,
              cursor: item.disabled ? 'default' : 'pointer',
              opacity: item.disabled ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              whiteSpace: 'nowrap',
              transition: 'background 0.12s, color 0.12s, opacity 0.12s',
            }}
            onMouseEnter={e => {
              if (item.disabled) return
              if (tone === 'primary') e.currentTarget.style.opacity = '0.85'
              else if (tone === 'danger') e.currentTarget.style.background = '#FEF2F2'
              else {
                e.currentTarget.style.background = TEAL_LIGHT
                e.currentTarget.style.color = TEAL_DARK
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = item.disabled ? '0.7' : '1'
              e.currentTarget.style.background = base.bg
              e.currentTarget.style.color = base.fg
            }}
          >
            {!(isMobile && items.length > 1) && item.icon}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
