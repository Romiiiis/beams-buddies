'use client'

import React from 'react'

const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const TEXT = '#0B1220'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const WHITE = '#FFFFFF'
const RED = '#B91C1C'
const RED_SOLID = '#D64545'
const TEAL = '#2AA198'

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

type Glyph = 'people' | 'bars' | 'coin' | 'doc' | 'calendar' | 'clock' | 'check' | 'grid'

/** Which simple shape suits the figure, picked from its label. */
function glyphFor(label: string): Glyph {
  const l = label.toLowerCase()
  if (/overdue|late|due|service|maintenance|reminder|next/.test(l) && !/invoice|quote/.test(l)) return 'clock'
  if (/outstanding|unpaid|owing|revenue|paid|collected|invoiced|earn|income|sales/.test(l)) return 'coin'
  if (/invoice|quote/.test(l)) return 'doc'
  if (/qr|token/.test(l)) return 'grid'
  if (/review/.test(l)) return 'check'
  if (/customer|client|team|technician|reachable|lead|call|enquir|follow/.test(l)) return 'people'
  if (/visit|week|today|calendar|install|unassigned|booked/.test(l)) return 'calendar'
  return 'bars'
}

/** Plain filled shapes (not an icon set): `ink` is the shape, `knock` the colour of the circle behind it. */
function GlyphIcon({ name, ink, knock, size }: { name: Glyph; ink: string; knock: string; size: number }) {
  const k = { fill: 'none', stroke: knock, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <g fill={ink}>
        {name === 'people' && (<><circle cx="9" cy="8" r="3.4" /><circle cx="17.2" cy="9.2" r="2.6" /><path d="M2.5 19.5c0-3.4 2.9-5.7 6.5-5.7s6.5 2.3 6.5 5.7z" /><path d="M16 14.1c2.8.1 5.5 1.7 5.5 4.7v.7h-4.3c0-2-.4-3.7-1.2-5.4z" /></>)}
        {name === 'bars' && (<><rect x="3.5" y="12" width="4.5" height="8.5" rx="2.25" /><rect x="9.75" y="4" width="4.5" height="16.5" rx="2.25" /><rect x="16" y="8.5" width="4.5" height="12" rx="2.25" /></>)}
        {name === 'coin' && <circle cx="12" cy="12" r="9.5" />}
        {name === 'doc' && <rect x="4.5" y="2.5" width="15" height="19" rx="3.5" />}
        {name === 'calendar' && <rect x="3" y="4.5" width="18" height="17" rx="4" />}
        {name === 'clock' && <circle cx="12" cy="12" r="9.5" />}
        {name === 'check' && <circle cx="12" cy="12" r="9.5" />}
        {name === 'grid' && (<><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" /><rect x="13" y="3.5" width="7.5" height="7.5" rx="2" /><rect x="3.5" y="13" width="7.5" height="7.5" rx="2" /><rect x="13" y="13" width="7.5" height="7.5" rx="2" /></>)}
      </g>
      {name === 'coin' && <text x="12" y="16.6" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={knock} style={{ fontFamily: 'Arial, sans-serif' }}>$</text>}
      {name === 'doc' && <path d="M8.5 9h7M8.5 13h7M8.5 17h4" {...k} />}
      {name === 'calendar' && <path d="M8 2.5v4M16 2.5v4M3 10h18" {...k} />}
      {name === 'clock' && <path d="M12 7v5.2l3.2 2" {...k} />}
      {name === 'check' && <path d="M8 12.4l2.8 2.8L16.2 9.5" {...k} />}
    </svg>
  )
}

/** Decorative mini charts for computer widths (not data): five bars, or a soft curve. */
function Deco({ kind }: { kind: 'bars' | 'curve' }) {
  if (kind === 'bars') {
    return (
      <span className="ss-deco" aria-hidden="true" style={{ alignItems: 'flex-end', gap: 4, height: 46, flexShrink: 0 }}>
        {[58, 88, 66, 100, 34].map((h, i) => (
          <span key={i} style={{ position: 'relative', width: 6, height: '100%', borderRadius: 3, background: '#E9EDF3', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${h}%`, borderRadius: 3, background: TEAL }} />
          </span>
        ))}
      </span>
    )
  }
  return (
    <svg className="ss-deco" width="58" height="30" viewBox="0 0 58 30" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M2 24C12 25 14 8 26 12s16-9 30-7" stroke="#9AD8D1" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

/**
 * The figures at the top of a page: four separate rounded cards, each with an icon in a soft circle, a small grey
 * label and a bold number, with the change and a short note underneath. Four across on a computer, two by two on
 * a phone. On a phone the cards are compact; pass variant="full" for the roomier size (Reports does).
 */
export function StatStrip({ items, isMobile, variant = 'compact' }: { items: StatItem[]; isMobile: boolean; variant?: 'compact' | 'full' }) {
  const cols = isMobile ? 2 : Math.min(items.length, 4)
  const compact = isMobile && variant === 'compact'
  const icon = compact ? 36 : 46
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: isMobile ? 10 : 16 }}>
      {items.map((item, i) => {
        const danger = /overdue/i.test(item.label) && !isZero(item.value)
        const text = isTextValue(item.value)
        const empty = text && /^not /i.test(String(item.value))
        // Pages may pass "+8% last 30 days" as one string: split it into the change and the grey note
        const split = !item.delta && item.sub ? item.sub.match(/^([+-]\d+(?:\.\d+)?%)\s*(.*)$/) : null
        const delta = item.delta ?? split?.[1]
        const note = split ? split[2] : item.sub
        const tone = delta ? deltaTone(delta, item.up, item.label) : null
        // Each card in the row gets its own treatment, like a dashboard: bars, a solid circle with a curve, a pale circle, a solid circle.
        // On a phone every card has a circle (solid and pale alternating) and no chart.
        const pos = i % 4
        const solid = danger || (isMobile ? pos % 2 === 1 : pos === 1 || pos === 3)
        const showCircle = isMobile || pos !== 0
        const deco: 'bars' | 'curve' | null = isMobile ? null : pos === 0 ? 'bars' : pos === 1 ? 'curve' : null
        const circleBg = danger ? RED_SOLID : solid ? TEAL : '#EEF2F6'
        const ink = solid ? '#FFFFFF' : TEAL_DARK
        return (
          <div
            key={item.label}
            onClick={item.onClick}
            style={{
              background: WHITE,
              borderRadius: compact ? 16 : 20,
              boxShadow: '0 2px 12px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(15, 23, 42, 0.03)',
              padding: compact ? '10px 12px' : isMobile ? '14px' : '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: compact ? 10 : 14,
              minWidth: 0,
              cursor: item.onClick ? 'pointer' : 'default',
              transition: 'box-shadow 0.12s',
            }}
            onMouseEnter={e => { if (item.onClick) e.currentTarget.style.boxShadow = '0 6px 18px rgba(15, 23, 42, 0.09), 0 0 0 1px rgba(15, 23, 42, 0.03)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(15, 23, 42, 0.03)' }}
          >
            {showCircle && (
              <span aria-hidden="true" style={{ width: icon, height: icon, borderRadius: '50%', background: circleBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GlyphIcon name={glyphFor(item.label)} ink={ink} knock={circleBg} size={compact ? 17 : 22} />
              </span>
            )}
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
            {deco && <Deco kind={deco} />}
          </div>
        )
      })}
    </div>
  )
}
