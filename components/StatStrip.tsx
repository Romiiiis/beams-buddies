'use client'

import React from 'react'

const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const TEXT = '#0B1220'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const WHITE = '#FFFFFF'

export type StatItem = {
  label: string
  value: React.ReactNode
  sub?: string
  /** Change versus the previous period, e.g. "+8%". */
  delta?: string
  up?: boolean
  onClick?: () => void
}

const TONES = {
  default: { bg: TEAL_LIGHT, fg: TEAL_DARK },
  warn: { bg: '#FEF3C7', fg: '#92400E' },
  danger: { bg: '#FEE2E2', fg: '#B91C1C' },
  muted: { bg: '#F1F5F9', fg: '#94A3B8' },
}

function toneFor(label: string, value: React.ReactNode): keyof typeof TONES {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value.replace(/[^0-9.\-]/g, '')) : NaN
  if (!isNaN(n) && n === 0) return 'muted'
  const l = label.toLowerCase()
  if (/overdue/.test(l)) return 'danger'
  if (/due soon|pending|outstanding/.test(l)) return 'warn'
  return 'default'
}

/** Compact overview strip shown at the top of a page: one icon tile, label and number per stat. */
export function StatStrip({ items, isMobile }: { items: StatItem[]; isMobile: boolean }) {
  const cols = isMobile ? 2 : Math.min(items.length, 4)
  return (
    <div
      style={{
        background: WHITE,
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {items.map((item, i) => {
        const tone = TONES[toneFor(item.label, item.value)]
        const valueColor = tone === TONES.danger ? '#B91C1C' : TEXT
        const showLeft = i % cols !== 0
        const showTop = i >= cols
        return (
          <div
            key={item.label}
            onClick={item.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              padding: isMobile ? '12px 14px' : '14px 20px',
              minWidth: 0,
              cursor: item.onClick ? 'pointer' : 'default',
              borderLeft: showLeft ? `1px solid ${BORDER}` : 'none',
              borderTop: showTop ? `1px solid ${BORDER}` : 'none',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
            onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: TEXT3, lineHeight: 1.25, ...(isMobile ? {} : { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }) }}>{item.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 1, minWidth: 0 }}>
                <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: valueColor, letterSpacing: '-0.02em', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{item.value}</span>
                {!isMobile && item.delta && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: item.up === false ? '#C0392B' : TEAL_DARK, whiteSpace: 'nowrap' }}>{item.delta}</span>
                )}
                {!isMobile && item.sub && (
                  <span style={{ fontSize: 11, fontWeight: 500, color: TEXT3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sub}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
