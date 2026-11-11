'use client'

import React from 'react'
import { supabase } from '@/lib/supabase'
import { BTN, Modal, TEXT3 } from '@/components/forms'
import { type Visit, customerName, fmtDay } from '@/lib/schedule'

type Props = {
  visit: Visit
  /** The equipment's normal gap between services, when known. */
  intervalMonths?: number | null
  businessId: string
  onBook: (date: Date) => void
  onClose: (message?: string) => void
}

const OPTIONS: { label: string; days?: number; months?: number }[] = [
  { label: 'In 1 week', days: 7 },
  { label: 'In 1 month', months: 1 },
  { label: 'In 3 months', months: 3 },
  { label: 'In 6 months', months: 6 },
  { label: 'In 12 months', months: 12 },
]

function later(from: Date, o: { days?: number; months?: number }) {
  const d = new Date(from)
  if (o.days) d.setDate(d.getDate() + o.days)
  if (o.months) d.setMonth(d.getMonth() + o.months)
  return d
}

/** Shown after a visit is marked completed: book the next one, or park it on the to-be-booked list. */
export function NextVisitPrompt({ visit, intervalMonths, businessId, onBook, onClose }: Props) {
  const name = customerName(visit.customers) || visit.title
  const base = new Date(visit.start_at)
  const suggested = intervalMonths && visit.kind === 'service' ? OPTIONS.find(o => o.months === intervalMonths) : undefined

  async function addToList() {
    const minutes = Math.max(15, Math.round((new Date(visit.end_at).getTime() - new Date(visit.start_at).getTime()) / 60000))
    const { error } = await supabase.from('to_book').insert({
      business_id: businessId,
      customer_id: visit.customer_id,
      job_id: visit.job_id,
      staff_id: visit.staff_id,
      title: visit.title,
      kind: visit.kind,
      duration_minutes: minutes,
      notes: visit.notes,
    })
    onClose(error ? 'Could not add it to the list' : 'Added to the to-be-booked list')
  }

  return (
    <Modal title="Visit done" size="sm" compact onClose={() => onClose()} footer={<button type="button" onClick={() => onClose()} style={BTN.secondary}>Not now</button>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: TEXT3 }}>
          Book the next visit for <b style={{ color: '#0B1220' }}>{name}</b>?{suggested ? ` This unit is normally serviced every ${intervalMonths} months.` : ''}
        </div>
        <div className="jb-chips">
          {OPTIONS.map(o => {
            const d = later(base, o)
            return (
              <button key={o.label} type="button" className="jb-chip" aria-pressed={o === suggested} onClick={() => onBook(d)} title={fmtDay(d, true)}>
                {o.label}
              </button>
            )
          })}
        </div>
        <button type="button" onClick={addToList} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, color: '#1F857C', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Add to the to-be-booked list instead
        </button>
      </div>
    </Modal>
  )
}
