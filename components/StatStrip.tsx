'use client'

import React from 'react'
import { AppIcon, type AppIconName } from './AppIcon'

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

/** Words (a name, a date, "Not added") read better a little smaller than figures; "Not ..." is quieter still. */
function isTextValue(value: React.ReactNode) {
  return typeof value === 'string' && /[A-Za-z]{2,}/.test(value) && !/^[\s$+\-]*[\d,.]+\s*[%kKmM]?$/.test(value)
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

/** A small icon that suits the figure, picked from its label. */
function iconFor(label: string): AppIconName {
  const l = label.toLowerCase()
  if (/overdue|late/.test(l)) return 'clock'
  if (/outstanding|unpaid|owing|revenue|paid|collected|invoiced|earn|income|sales/.test(l)) return 'dollar'
  if (/invoice/.test(l)) return 'invoice'
  if (/quote/.test(l)) return 'document'
  if (/qr|token/.test(l)) return 'qrcode'
  if (/review/.test(l)) return 'tick'
  if (/customer|client|team|technician|reachable/.test(l)) return 'customers'
  if (/lead|call|enquir|booked in|follow/.test(l)) return 'leads'
  if (/visit|week|today|calendar|install|unassigned/.test(l)) return 'calendar-clock'
  if (/due|service|maintenance|reminder|next/.test(l)) return 'clock'
  if (/job|equipment|unit|brand|library|ready|shown|record/.test(l)) return 'jobs'
  return 'stats'
}

/**
 * The figures at the top of a page: four separate rounded cards, each with an icon in a soft circle, a small grey
 * label and a bold number, with the change and a short note underneath. Four across on a computer, two by two on
 * a phone. On a phone the cards are compact; pass variant="full" for the roomier size (Reports does).
 */
export function StatStrip({ items, isMobile, variant = 'compact' }: { items: StatItem[]; isMobile: boolean; variant?: 'compact' | 'full' }) {
  const cols = isMobile ? 2 : Math.min(items.length, 4)
  const compact = isMobile && variant === 'compact'
  const icon = compact ? 34 : 44
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: isMobile ? 10 : 14 }}>
      {items.map(item => {
        const danger = /overdue/i.test(item.label) && !isZero(item.value)
        const text = isTextValue(item.value)
        const empty = text && /^not /i.test(String(item.value))
        // Pages may pass "+8% last 30 days" as one string: split it into the change and the grey note
        const split = !item.delta && item.sub ? item.sub.match(/^([+-]\d+(?:\.\d+)?%)\s*(.*)$/) : null
        const delta = item.delta ?? split?.[1]
        const note = split ? split[2] : item.sub
        const tone = delta ? deltaTone(delta, item.up, item.label) : null
        return (
          <div
            key={item.label}
            onClick={item.onClick}
            style={{
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: compact ? 14 : 16,
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              padding: compact ? '10px 12px' : isMobile ? '14px 14px' : '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: compact ? 10 : 14,
              minWidth: 0,
              cursor: item.onClick ? 'pointer' : 'default',
              transition: 'box-shadow 0.12s',
            }}
            onMouseEnter={e => { if (item.onClick) e.currentTarget.style.boxShadow = '0 4px 14px rgba(15, 23, 42, 0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.04)' }}
          >
            <span
              aria-hidden="true"
              style={{ width: icon, height: icon, borderRadius: '50%', background: danger ? '#FDECEC' : TEAL_LIGHT, color: danger ? RED : TEAL_DARK, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <AppIcon name={iconFor(item.label)} size={compact ? 17 : 21} />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: compact ? 11.5 : 12.5, fontWeight: 500, color: TEXT3, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
              <div
                style={{
                  marginTop: 1,
                  fontSize: text ? (compact ? 14 : isMobile ? 17 : 19) : compact ? 19 : isMobile ? 23 : 25,
                  fontWeight: text ? 600 : 700,
                  color: danger ? RED : empty ? TEXT3 : TEXT,
                  letterSpacing: '-0.03em',
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
                <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 6, marginTop: 2, fontSize: compact ? 11 : 12, lineHeight: 1.25, color: TEXT3, minWidth: 0 }}>
                  {delta && tone && <span style={{ color: tone.fg, fontWeight: 650, flexShrink: 0 }}>{delta}</span>}
                  {note && <span style={{ minWidth: 0 }}>{note}</span>}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
