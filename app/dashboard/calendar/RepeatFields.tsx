'use client'

import React from 'react'
import { Select } from '@/components/Select'
import { FIELD, LABEL, TEXT3 } from '@/components/forms'
import { MAX_VISITS, type RepeatRule, describeRule, expandRule } from '@/lib/recurrence'
import { WEEKDAY_SHORT, WEEK_ORDER, fmtDay } from '@/lib/schedule'

export type RepeatState = {
  preset: 'none' | 'w1' | 'w2' | 'm1' | 'm3' | 'm6' | 'y1' | 'custom'
  every: number
  unit: 'week' | 'month' | 'year'
  /** Week rules: chosen days. Empty means the weekday of the first visit. */
  weekdays: number[]
  monthMode: 'date' | 'weekday'
  endsType: 'count' | 'date'
  count: number
  endDate: string
}

export const NO_REPEAT: RepeatState = { preset: 'none', every: 1, unit: 'week', weekdays: [], monthMode: 'date', endsType: 'count', count: 12, endDate: '' }

const PRESETS: Record<string, { unit: 'week' | 'month' | 'year'; every: number }> = {
  w1: { unit: 'week', every: 1 },
  w2: { unit: 'week', every: 2 },
  m1: { unit: 'month', every: 1 },
  m3: { unit: 'month', every: 3 },
  m6: { unit: 'month', every: 6 },
  y1: { unit: 'year', every: 1 },
}

export function ruleFromState(r: RepeatState): RepeatRule | null {
  if (r.preset === 'none') return null
  const base = r.preset === 'custom' ? { unit: r.unit, every: Math.max(1, Math.floor(r.every) || 1) } : PRESETS[r.preset]
  return {
    unit: base.unit,
    every: base.every,
    ...(base.unit === 'week' ? { weekdays: r.weekdays } : {}),
    ...(base.unit === 'month' ? { monthMode: r.monthMode } : {}),
    ends: r.endsType === 'count' ? { type: 'count', count: Math.max(1, Math.floor(r.count) || 1) } : { type: 'date', date: r.endDate },
  }
}

/** Turns a saved rule back into the form's state (used when changing how a run repeats). */
export function stateFromRule(rule: RepeatRule): RepeatState {
  const preset = (Object.entries(PRESETS).find(([, p]) => p.unit === rule.unit && p.every === rule.every)?.[0] || 'custom') as RepeatState['preset']
  return {
    preset,
    every: rule.every,
    unit: rule.unit,
    weekdays: rule.weekdays || [],
    monthMode: rule.monthMode || 'date',
    endsType: rule.ends.type,
    count: rule.ends.type === 'count' ? rule.ends.count : 12,
    endDate: rule.ends.type === 'date' ? rule.ends.date : '',
  }
}

type Props = {
  value: RepeatState
  onChange: (v: RepeatState) => void
  /** The first visit's start, used for the preview and for the default weekday. */
  start: Date | null
  /** Lets the "does not repeat" choice be hidden when editing an existing run. */
  allowNone?: boolean
}

const small: React.CSSProperties = { fontSize: 12, color: TEXT3, lineHeight: 1.5 }

/** Repeat settings for a visit: how often, which days, when it stops, and a preview of what that makes. */
export function RepeatFields({ value, onChange, start, allowNone = true }: Props) {
  const set = (patch: Partial<RepeatState>) => onChange({ ...value, ...patch })
  const rule = ruleFromState(value)
  const unit = value.preset === 'custom' ? value.unit : PRESETS[value.preset]?.unit
  const first = start

  const preview = (() => {
    if (!rule || !first) return null
    if (value.endsType === 'date' && !value.endDate) return { text: 'Choose the date it stops.', warn: true }
    const { dates, truncated } = expandRule(rule, first)
    if (!dates.length) return { text: 'No visits fall before that end date. Pick a later one.', warn: true }
    const last = dates[dates.length - 1]
    return {
      text: `${describeRule(rule, first)}. Makes ${dates.length} visit${dates.length === 1 ? '' : 's'}, the last on ${fmtDay(last, true)}.${truncated ? ` Runs are capped at ${MAX_VISITS} visits or three years.` : ''}`,
      warn: truncated,
    }
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={LABEL}>Repeats</label>
        <Select style={FIELD} value={value.preset} onChange={e => set({ preset: e.target.value as RepeatState['preset'] })}>
          {allowNone && <option value="none">Does not repeat</option>}
          <option value="w1">Every week</option>
          <option value="w2">Every 2 weeks</option>
          <option value="m1">Every month</option>
          <option value="m3">Every 3 months</option>
          <option value="m6">Every 6 months</option>
          <option value="y1">Every year</option>
          <option value="custom">Custom...</option>
        </Select>
      </div>

      {value.preset !== 'none' && (
        <>
          {value.preset === 'custom' && (
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 12 }}>
              <div>
                <label style={LABEL}>Every</label>
                <input type="number" min={1} max={52} style={FIELD} value={value.every} onChange={e => set({ every: Math.max(1, Number(e.target.value) || 1) })} />
              </div>
              <div>
                <label style={LABEL}>Unit</label>
                <Select style={FIELD} value={value.unit} onChange={e => set({ unit: e.target.value as RepeatState['unit'] })}>
                  <option value="week">{value.every === 1 ? 'week' : 'weeks'}</option>
                  <option value="month">{value.every === 1 ? 'month' : 'months'}</option>
                  <option value="year">{value.every === 1 ? 'year' : 'years'}</option>
                </Select>
              </div>
            </div>
          )}

          {unit === 'week' && (
            <div>
              <label style={LABEL}>On these days</label>
              <div className="jb-chips">
                {WEEK_ORDER.map(d => {
                  const on = value.weekdays.includes(d)
                  return (
                    <button key={d} type="button" className="jb-chip" aria-pressed={on} onClick={() => set({ weekdays: on ? value.weekdays.filter(x => x !== d) : [...value.weekdays, d] })}>
                      {WEEKDAY_SHORT[d]}
                    </button>
                  )
                })}
              </div>
              {value.weekdays.length === 0 && first && <div style={{ ...small, marginTop: 6 }}>No days picked, so it repeats on {first.toLocaleDateString('en-AU', { weekday: 'long' })}s.</div>}
            </div>
          )}

          {unit === 'month' && (
            <div>
              <label style={LABEL}>Each month on</label>
              <Select style={FIELD} value={value.monthMode} onChange={e => set({ monthMode: e.target.value as RepeatState['monthMode'] })}>
                <option value="date">{first ? `The same date (the ${first.getDate()})` : 'The same date'}</option>
                <option value="weekday">{first ? `The same weekday (${Math.ceil(first.getDate() / 7) >= 5 ? 'last' : ['first', 'second', 'third', 'fourth'][Math.ceil(first.getDate() / 7) - 1]} ${first.toLocaleDateString('en-AU', { weekday: 'long' })})` : 'The same weekday'}</option>
              </Select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL}>Stops</label>
              <Select style={FIELD} value={value.endsType} onChange={e => set({ endsType: e.target.value as RepeatState['endsType'] })}>
                <option value="count">After a number of visits</option>
                <option value="date">On a date</option>
              </Select>
            </div>
            <div>
              <label style={LABEL}>{value.endsType === 'count' ? 'Visits' : 'Last day'}</label>
              {value.endsType === 'count' ? (
                <input type="number" min={1} max={MAX_VISITS} style={FIELD} value={value.count} onChange={e => set({ count: Math.max(1, Math.min(MAX_VISITS, Number(e.target.value) || 1)) })} />
              ) : (
                <input type="date" style={FIELD} value={value.endDate} onChange={e => set({ endDate: e.target.value })} />
              )}
            </div>
          </div>

          {preview && (
            <div style={{ fontSize: 13, lineHeight: 1.5, color: preview.warn ? '#92400E' : '#475569', background: preview.warn ? '#FFFBEB' : '#F8FAFC', border: `1px solid ${preview.warn ? '#FDE68A' : '#E8EDF2'}`, borderRadius: 10, padding: '10px 12px' }}>
              {preview.text}
            </div>
          )}
        </>
      )}
    </div>
  )
}
