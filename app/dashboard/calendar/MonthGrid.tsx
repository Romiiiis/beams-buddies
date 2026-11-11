'use client'

import React from 'react'
import { LINE, TEAL, TEXT, TEXT3, WHITE } from '@/components/forms'
import { type StaffMember, type Visit, WEEKDAY_SHORT, WEEK_ORDER, addDays, customerName, fmtTime, isLate, monthGridStart, sameDay, startOfDay } from '@/lib/schedule'

const UNASSIGNED = '#94A3B8'

type Props = {
  /** Any day in the month to show. */
  anchor: Date
  visits: Visit[]
  staffById: Map<string, StaffMember>
  matches: (v: Visit) => boolean
  /** Phone: day numbers with dots instead of visit names. */
  compact: boolean
  /** Open this day (the day view on a computer, that day's list on a phone). */
  onPickDay: (d: Date) => void
  onOpen: (v: Visit) => void
  onNew: (d: Date) => void
}

/** A month at a glance. Every week has the same height, so nothing moves as visits come and go. */
export function MonthGrid({ anchor, visits, staffById, matches, compact, onPickDay, onOpen, onNew }: Props) {
  const gridStart = monthGridStart(anchor)
  const monthIndex = anchor.getMonth()
  const daysInMonth = new Date(anchor.getFullYear(), monthIndex + 1, 0).getDate()
  const lead = (new Date(anchor.getFullYear(), monthIndex, 1).getDay() + 6) % 7
  const weeks = Math.ceil((lead + daysInMonth) / 7)
  const today = startOfDay(new Date())
  const cellMin = compact ? 58 : 118

  const byDay = new Map<string, Visit[]>()
  for (const v of visits) {
    if (!matches(v)) continue
    const k = startOfDay(new Date(v.start_at)).getTime()
    byDay.set(String(k), [...(byDay.get(String(k)) || []), v])
  }

  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 14, overflow: 'hidden', background: WHITE }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', background: '#F8FAFC', borderBottom: `1px solid ${LINE}` }}>
        {WEEK_ORDER.map(d => (
          <div key={d} style={{ padding: '8px 10px', fontSize: 11, fontWeight: 800, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: compact ? 'center' : 'left' }}>
            {WEEKDAY_SHORT[d]}
          </div>
        ))}
      </div>

      {Array.from({ length: weeks }, (_, w) => (
        <div key={w} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderTop: w === 0 ? 'none' : `1px solid ${LINE}` }}>
          {Array.from({ length: 7 }, (_, i) => {
            const day = addDays(gridStart, w * 7 + i)
            const inMonth = day.getMonth() === monthIndex
            const isToday = sameDay(day, today)
            const list = (byDay.get(String(day.getTime())) || []).sort((a, b) => a.start_at.localeCompare(b.start_at))
            const live = list.filter(v => v.status !== 'cancelled')
            const shown = list.slice(0, 3)
            const number = (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 24, borderRadius: 12, padding: '0 6px', fontSize: 13, fontWeight: 800, background: isToday ? TEAL : 'transparent', color: isToday ? WHITE : inMonth ? TEXT : '#B6C0CC' }}>
                {day.getDate()}
              </span>
            )

            if (compact) {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onPickDay(day)}
                  aria-label={`${day.toDateString()}, ${live.length} visits`}
                  style={{ minHeight: cellMin, border: 'none', borderLeft: i === 0 ? 'none' : `1px solid ${LINE}`, background: inMonth ? WHITE : '#FBFCFD', padding: '6px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
                >
                  {number}
                  <span style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', minHeight: 6 }}>
                    {live.slice(0, 3).map(v => (
                      <span key={v.id} style={{ width: 6, height: 6, borderRadius: '50%', background: (v.staff_id && staffById.get(v.staff_id)?.colour) || UNASSIGNED }} />
                    ))}
                  </span>
                  {live.length > 3 && <span style={{ fontSize: 10, fontWeight: 800, color: TEXT3 }}>+{live.length - 3}</span>}
                </button>
              )
            }

            return (
              <div
                key={i}
                onClick={() => onNew(day)}
                style={{ minHeight: cellMin, borderLeft: i === 0 ? 'none' : `1px solid ${LINE}`, background: inMonth ? WHITE : '#FBFCFD', padding: 6, cursor: 'cell', display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{number}</div>
                {shown.map(v => {
                  const colour = (v.staff_id && staffById.get(v.staff_id)?.colour) || UNASSIGNED
                  const late = isLate({ status: v.status, end_at: v.end_at })
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        onOpen(v)
                      }}
                      title={`${fmtTime(new Date(v.start_at))} ${customerName(v.customers) || v.title}`}
                      style={{ display: 'flex', gap: 5, alignItems: 'baseline', textAlign: 'left', border: 'none', borderLeft: `3px solid ${colour}`, background: `${colour}1F`, borderRadius: 6, padding: '2px 6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: TEXT, minWidth: 0, opacity: v.status === 'cancelled' ? 0.45 : v.status === 'completed' ? 0.7 : 1, textDecoration: v.status === 'cancelled' ? 'line-through' : 'none' }}
                    >
                      <span style={{ fontWeight: 800, color: late ? '#B91C1C' : '#475569', flexShrink: 0 }}>{fmtTime(new Date(v.start_at))}</span>
                      <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customerName(v.customers) || v.title}</span>
                    </button>
                  )
                })}
                {list.length > 3 && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      onPickDay(day)
                    }}
                    style={{ alignSelf: 'flex-start', border: 'none', background: 'none', padding: '0 2px', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 800, color: '#1F857C', cursor: 'pointer' }}
                  >
                    +{list.length - 3} more
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
