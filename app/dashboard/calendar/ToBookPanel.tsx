'use client'

import React from 'react'
import { BTN, BTN_SM, LINE, TEAL_DARK, TEXT, TEXT3, WHITE } from '@/components/forms'
import { type VisitKind, VISIT_KINDS, customerName, durationLabel } from '@/lib/schedule'
import type { VisitPrefill } from './VisitModal'

export type ToBookRow = {
  id: string
  customer_id: string | null
  job_id: string | null
  staff_id: string | null
  title: string
  kind: VisitKind
  duration_minutes: number
  notes: string | null
  customers?: { first_name?: string | null; last_name?: string | null; suburb?: string | null } | null
}

export type DueService = { jobId: string; customerId: string; name: string; equipment: string; days: number }

type Props = {
  items: ToBookRow[]
  due: DueService[]
  onBook: (prefill: VisitPrefill) => void
  onRemove: (row: ToBookRow) => void
}

const kindLabel = (k: VisitKind) => VISIT_KINDS.find(x => x.value === k)?.label || 'Visit'

const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderTop: `1px solid ${LINE}` }

/** Work that needs a time but does not have one yet, plus equipment whose service is due and has no visit booked. */
export function ToBookPanel({ items, due, onBook, onRemove }: Props) {
  const total = items.length + due.length
  if (total === 0) return null
  return (
    <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>To be booked</div>
        <span style={{ fontSize: 12, fontWeight: 800, color: TEAL_DARK, background: '#E3F5F2', borderRadius: 999, padding: '2px 9px' }}>{total}</span>
      </div>
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {items.map(r => {
          const name = customerName(r.customers)
          return (
            <div key={r.id} style={row}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name || r.title}</div>
                <div style={{ fontSize: 12, color: TEXT3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {kindLabel(r.kind)}{name && r.title !== kindLabel(r.kind) ? ` · ${r.title}` : ''} · {durationLabel(r.duration_minutes)}
                </div>
              </div>
              <button type="button" onClick={() => onBook({ customerId: r.customer_id || undefined, jobId: r.job_id || undefined, staffId: r.staff_id, title: r.title === kindLabel(r.kind) ? '' : r.title, kind: r.kind, notes: r.notes || '', duration: r.duration_minutes, toBookId: r.id })} style={{ ...BTN.primary, ...BTN_SM }}>
                Book
              </button>
              <button type="button" onClick={() => onRemove(r)} aria-label="Remove from the list" style={{ ...BTN.secondary, ...BTN_SM, width: 34, padding: 0, color: TEXT3 }}>×</button>
            </div>
          )
        })}
        {due.length > 0 && (
          <div style={{ padding: '10px 16px 6px', borderTop: items.length ? `1px solid ${LINE}` : 'none', fontSize: 11, fontWeight: 800, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Service due, no visit booked</div>
        )}
        {due.map(d => (
          <div key={d.jobId} style={{ ...row, borderTop: 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
              <div style={{ fontSize: 12, color: d.days < 0 ? '#B91C1C' : TEXT3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {d.equipment} · {d.days < 0 ? `${-d.days} day${d.days === -1 ? '' : 's'} overdue` : d.days === 0 ? 'due today' : `due in ${d.days} day${d.days === 1 ? '' : 's'}`}
              </div>
            </div>
            <button type="button" onClick={() => onBook({ customerId: d.customerId, jobId: d.jobId, kind: 'service' })} style={{ ...BTN.secondary, ...BTN_SM }}>
              Book
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
