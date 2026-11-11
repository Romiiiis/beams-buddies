'use client'

import React, { useEffect, useRef } from 'react'
import { AppIcon } from '@/components/AppIcon'
import { type Visit, fmtTime, isLate, layoutOverlaps, startOfDay } from '@/lib/schedule'

export const START_HOUR = 6
export const END_HOUR = 20
const HOUR_PX = 56
const GUTTER = 58

export type GridVisit = { v: Visit; colour: string; staffName: string | null; customer: string }

export type GridColumn = {
  key: string
  title: React.ReactNode
  subtitle?: string
  date: Date
  /** The technician this column belongs to (day view). null is the unassigned column, undefined means any. */
  staffId?: string | null
  accent?: string
  today?: boolean
  /** Day view: this technician's working hours (minutes after midnight), or why the day is off. Shown as shading. */
  hours?: { start: number; end: number } | { off: string }
}

type Props = {
  columns: GridColumn[]
  visitsFor: (col: GridColumn) => GridVisit[]
  onCreate: (col: GridColumn, when: Date) => void
  onOpen: (v: Visit) => void
}

const TEXT = '#0B1220'
const TEXT3 = '#64748B'
const LINE = '#E8EDF2'

function hourLabel(h: number) {
  const d = new Date(2000, 0, 1, h)
  return d.toLocaleTimeString('en-AU', { hour: 'numeric' }).replace(' ', '')
}

/** Time grid for a computer: hours down the side, one column per technician (day) or per day (week). */
export function TimeGrid({ columns, visitsFor, onCreate, onOpen }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const totalPx = (END_HOUR - START_HOUR) * HOUR_PX
  const now = new Date()
  const minWidth = GUTTER + columns.length * 150

  // Open scrolled to the first visit, or to the morning
  const firstHour = (() => {
    const hours = columns.flatMap(c => visitsFor(c)).map(g => new Date(g.v.start_at).getHours())
    return hours.length ? Math.max(START_HOUR, Math.min(...hours) - 1) : 7
  })()
  const signature = columns.map(c => c.key).join('|') + firstHour
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = Math.max(0, (firstHour - START_HOUR) * HOUR_PX)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  const template = `${GUTTER}px repeat(${columns.length}, minmax(150px, 1fr))`

  return (
    <div ref={scroller} style={{ overflow: 'auto', maxHeight: 'calc(100vh - 360px)', minHeight: 420, border: `1px solid ${LINE}`, borderRadius: 14, background: '#fff' }}>
      <div style={{ minWidth }}>
        <div style={{ display: 'grid', gridTemplateColumns: template, position: 'sticky', top: 0, zIndex: 3, background: '#fff', borderBottom: `1px solid ${LINE}` }}>
          <div />
          {columns.map(col => (
            <div key={col.key} style={{ padding: '10px 12px', borderLeft: `1px solid ${LINE}`, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                {col.accent && <span style={{ width: 10, height: 10, borderRadius: '50%', background: col.accent, flexShrink: 0 }} />}
                <div style={{ fontSize: 13, fontWeight: 800, color: col.today && !col.accent ? '#1F857C' : TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col.title}</div>
              </div>
              {col.subtitle && <div style={{ fontSize: 12, color: TEXT3, marginTop: 2 }}>{col.subtitle}</div>}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: template, height: totalPx, position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
              <div key={i} style={{ position: 'absolute', top: i * HOUR_PX - 7, right: 8, fontSize: 11, fontWeight: 600, color: TEXT3, display: i === 0 ? 'none' : 'block' }}>
                {hourLabel(START_HOUR + i)}
              </div>
            ))}
          </div>

          {columns.map(col => {
            const items = visitsFor(col).map(g => {
              const s = new Date(g.v.start_at)
              const e = new Date(g.v.end_at)
              const top = Math.max(0, ((s.getHours() + s.getMinutes() / 60) - START_HOUR) * HOUR_PX)
              const bottom = Math.min(totalPx, ((e.getHours() + e.getMinutes() / 60) - START_HOUR) * HOUR_PX)
              return { ...g, start: top, end: Math.max(bottom, top + 26), s }
            })
            const laid = layoutOverlaps(items)
            const nowTop = col.today ? ((now.getHours() + now.getMinutes() / 60) - START_HOUR) * HOUR_PX : -1

            return (
              <div
                key={col.key}
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const y = e.clientY - rect.top
                  const mins = Math.round(((y / HOUR_PX) * 60) / 30) * 30
                  const when = new Date(startOfDay(col.date).getTime() + (START_HOUR * 60 + mins) * 60000)
                  onCreate(col, when)
                }}
                style={{
                  position: 'relative',
                  borderLeft: `1px solid ${LINE}`,
                  cursor: 'cell',
                  backgroundImage: `linear-gradient(to bottom, ${LINE} 1px, transparent 1px), linear-gradient(to bottom, #F5F7FA 1px, transparent 1px)`,
                  backgroundSize: `100% ${HOUR_PX}px, 100% ${HOUR_PX / 2}px`,
                  backgroundColor: col.today ? '#FBFEFD' : '#fff',
                }}
              >
                {col.hours && 'off' in col.hours && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.045)', pointerEvents: 'none' }}>
                    <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 11, fontWeight: 700, color: TEXT3 }}>{col.hours.off}</span>
                  </div>
                )}
                {col.hours && 'start' in col.hours && (
                  <>
                    {col.hours.start / 60 > START_HOUR && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: Math.min(totalPx, (col.hours.start / 60 - START_HOUR) * HOUR_PX), background: 'rgba(15,23,42,0.045)', pointerEvents: 'none' }} />}
                    {col.hours.end / 60 < END_HOUR && <div style={{ position: 'absolute', left: 0, right: 0, top: Math.max(0, (col.hours.end / 60 - START_HOUR) * HOUR_PX), bottom: 0, background: 'rgba(15,23,42,0.045)', pointerEvents: 'none' }} />}
                  </>
                )}
                {laid.map(it => {
                  const late = isLate({ status: it.v.status, end_at: it.v.end_at })
                  const done = it.v.status === 'completed'
                  const cancelled = it.v.status === 'cancelled'
                  return (
                    <button
                      key={it.v.id}
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        onOpen(it.v)
                      }}
                      title={`${fmtTime(it.s)} ${it.customer || it.v.title}`}
                      style={{
                        position: 'absolute',
                        top: it.start,
                        height: it.end - it.start - 2,
                        left: `calc(${(it.col / it.cols) * 100}% + 3px)`,
                        width: `calc(${100 / it.cols}% - 6px)`,
                        background: `${it.colour}24`,
                        borderLeft: `3px solid ${it.colour}`,
                        borderTop: 'none',
                        borderRight: 'none',
                        borderBottom: 'none',
                        borderRadius: 8,
                        padding: '4px 7px',
                        textAlign: 'left',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        opacity: cancelled ? 0.45 : done ? 0.7 : 1,
                        textDecoration: cancelled ? 'line-through' : 'none',
                        fontFamily: 'inherit',
                        display: 'block',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span>{fmtTime(it.s)}{done ? ' · Done' : ''}</span>
                        {late && <span style={{ color: '#B91C1C' }}>Late</span>}
                        {it.v.series_id && <AppIcon name="repeat" size={11} />}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: TEXT, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.customer || it.v.title}</div>
                      {it.end - it.start > 52 && <div style={{ fontSize: 11.5, color: '#475569', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.customer ? it.v.title : ''}{it.staffName ? `${it.customer ? ' · ' : ''}${it.staffName.split(' ')[0]}` : ''}</div>}
                    </button>
                  )
                })}
                {nowTop >= 0 && nowTop <= totalPx && (
                  <div style={{ position: 'absolute', left: 0, right: 0, top: nowTop, height: 2, background: '#EF4444', zIndex: 2, pointerEvents: 'none' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
