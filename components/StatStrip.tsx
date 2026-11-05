'use client'

import React from 'react'

const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const TEXT = '#0B1220'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const WHITE = '#FFFFFF'
const RED = '#B91C1C'

export type StatItem = {
  label: string
  value: React.ReactNode
  /** Small grey note under the number, e.g. "last 30 days". */
  sub?: string
  /** Change versus the previous period, e.g. "+8%". Shown as a pill. */
  delta?: string
  up?: boolean
  onClick?: () => void
}

function isZero(value: React.ReactNode) {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value.replace(/[^0-9.\-]/g, '')) : NaN
  return !isNaN(n) && n === 0
}

/**
 * Pill colours. Money and performance numbers go green when they rise and red when they fall; overdue and
 * unpaid go the other way. Plain counts (jobs, customers, quotes) only ever go green or stay grey, because
 * fewer new records is not bad news.
 */
function deltaTone(delta: string, up: boolean | undefined, label: string) {
  if (/^[+-]?0+(\.0+)?\s*%?$/.test(delta.trim())) return { bg: '#F1F5F9', fg: TEXT3 }
  const rising = up !== undefined ? up : !delta.trim().startsWith('-')
  const good = { bg: TEAL_LIGHT, fg: TEAL_DARK }
  const bad = { bg: '#FEE2E2', fg: RED }
  const neutral = { bg: '#F1F5F9', fg: TEXT3 }
  if (/overdue|outstanding|unpaid/i.test(label)) return rising ? bad : good
  if (/revenue|paid|income|sales|accepted|booked/i.test(label)) return rising ? good : bad
  return rising ? good : neutral
}

/**
 * Overview strip at the top of a page: label, a large number, then a change pill and a short note.
 * Four cells in one rounded card with thin dividers; two by two on phones.
 */
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
        const danger = /overdue/i.test(item.label) && !isZero(item.value)
        const showLeft = i % cols !== 0
        const showTop = i >= cols
        // Pages may pass "+8% last 30 days" as one string: split it into the pill and the grey note
        const split = !item.delta && item.sub ? item.sub.match(/^([+-]\d+(?:\.\d+)?%)\s*(.*)$/) : null
        const delta = item.delta ?? split?.[1]
        const note = split ? split[2] : item.sub
        const tone = delta ? deltaTone(delta, item.up, item.label) : null
        return (
          <div
            key={item.label}
            onClick={item.onClick}
            style={{
              padding: isMobile ? '14px 16px' : '16px 20px',
              minWidth: 0,
              cursor: item.onClick ? 'pointer' : 'default',
              borderLeft: showLeft ? `1px solid ${BORDER}` : 'none',
              borderTop: showTop ? `1px solid ${BORDER}` : 'none',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => { if (item.onClick) e.currentTarget.style.background = '#F8FAFC' }}
            onMouseLeave={e => { e.currentTarget.style.background = WHITE }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 500, color: TEXT3, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
            <div
              style={{
                marginTop: 2,
                fontSize: isMobile ? 23 : 27,
                fontWeight: 650,
                color: danger ? RED : TEXT,
                letterSpacing: '-0.032em',
                lineHeight: 1.15,
                fontVariantNumeric: 'tabular-nums',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.value}
            </div>
            {(delta || note) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, fontSize: 12, color: TEXT3, minWidth: 0, whiteSpace: 'nowrap' }}>
                {delta && tone && (
                  <span style={{ padding: '1px 7px', borderRadius: 99, background: tone.bg, color: tone.fg, fontSize: 11.5, fontWeight: 650, flexShrink: 0 }}>{delta}</span>
                )}
                {note && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{note}</span>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
