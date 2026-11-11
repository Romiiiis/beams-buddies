'use client'

import React from 'react'
import { BTN, FONT, LINE, TEAL, TEAL_DARK, TEXT, TEXT2, TEXT3, WHITE } from '@/components/forms'
import {
  VISIT_KINDS,
  VISIT_STATUS,
  type StaffMember,
  type Visit,
  addDays,
  customerAddress,
  customerName,
  fmtDay,
  fmtRange,
  initialsOf,
  sameDay,
} from '@/lib/schedule'

const UNASSIGNED = '#94A3B8'
const card: React.CSSProperties = { background: WHITE, border: `1px solid ${LINE}`, borderRadius: 14, overflow: 'hidden' }

type Props = {
  weekStart: Date
  anchor: Date
  onPickDay: (d: Date) => void
  visits: Visit[]
  staffById: Map<string, StaffMember>
  matches: (v: Visit) => boolean
  onOpen: (v: Visit) => void
  onNew: () => void
}

/** Phone view: a strip of the week's days, then that day's visits as cards. */
export function Agenda({ weekStart, anchor, onPickDay, visits, staffById, matches, onOpen, onNew }: Props) {
  const day = visits
    .filter(v => sameDay(new Date(v.start_at), anchor) && matches(v))
    .sort((a, b) => a.start_at.localeCompare(b.start_at))

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(weekStart, i)
          const n = visits.filter(v => sameDay(new Date(v.start_at), d) && matches(v) && v.status !== 'cancelled').length
          const on = sameDay(d, anchor)
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPickDay(d)}
              aria-pressed={on}
              style={{ border: `1px solid ${on ? TEAL : LINE}`, background: on ? TEAL : WHITE, color: on ? WHITE : TEXT, borderRadius: 12, padding: '8px 0', fontFamily: FONT, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, opacity: on ? 0.9 : 0.6 }}>{d.toLocaleDateString('en-AU', { weekday: 'narrow' })}</span>
              <span style={{ fontSize: 16, fontWeight: 800 }}>{d.getDate()}</span>
              <span style={{ height: 6, display: 'flex', gap: 2 }}>
                {Array.from({ length: Math.min(n, 3) }, (_, k) => <span key={k} style={{ width: 5, height: 5, borderRadius: '50%', background: on ? WHITE : TEAL }} />)}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>{fmtDay(anchor, true)}</div>

      {day.length === 0 ? (
        <div style={{ ...card, padding: '28px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>Nothing booked</div>
          <div style={{ fontSize: 13, color: TEXT3, margin: '4px 0 14px' }}>No visits on this day.</div>
          <button type="button" onClick={onNew} style={BTN.primary}>New visit</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {day.map(v => {
            const s = v.staff_id ? staffById.get(v.staff_id) : undefined
            const st = VISIT_STATUS[v.status]
            const addr = customerAddress(v.customers)
            const kindLabel = VISIT_KINDS.find(k => k.value === v.kind)?.label
            const name = customerName(v.customers)
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onOpen(v)}
                style={{ ...card, padding: 0, textAlign: 'left', cursor: 'pointer', fontFamily: FONT, display: 'flex', opacity: v.status === 'cancelled' ? 0.55 : 1 }}
              >
                <span style={{ width: 5, background: s?.colour || UNASSIGNED, flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0, padding: '12px 14px', display: 'block' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: TEAL_DARK }}>{fmtRange(new Date(v.start_at), new Date(v.end_at))}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: st.bg, color: st.fg, whiteSpace: 'nowrap' }}>{st.label}</span>
                  </span>
                  <span style={{ display: 'block', fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', marginTop: 4 }}>{name || v.title}</span>
                  <span style={{ display: 'block', fontSize: 13, color: TEXT2, marginTop: 2 }}>{kindLabel}{name && v.title !== kindLabel ? ` · ${v.title}` : ''}</span>
                  {addr && <span style={{ display: 'block', fontSize: 13, color: TEXT3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{addr}</span>}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 12, fontWeight: 700, color: s ? TEXT2 : TEXT3 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 8, background: s?.colour || '#E2E8F0', color: WHITE, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{s ? initialsOf(s.name) : '?'}</span>
                    {s ? s.name : 'Unassigned'}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
