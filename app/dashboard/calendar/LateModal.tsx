'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BTN, BTN_SM, LINE, Modal, RED, TEXT, TEXT3 } from '@/components/forms'
import { type StaffMember, type Visit, customerName, fmtDay, fmtRange } from '@/lib/schedule'

type Props = {
  visits: Visit[]
  staffById: Map<string, StaffMember>
  onClose: () => void
  onOpen: (v: Visit) => void
  /** Called after any visit was closed, so the calendar can reload. */
  onChanged: () => void
}

/** Visits whose time has passed without being marked done or cancelled. */
export function LateModal({ visits, staffById, onClose, onOpen, onChanged }: Props) {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const left = visits.filter(v => !done.has(v.id))

  async function mark(v: Visit) {
    setBusy(v.id)
    setError('')
    const { error: err } = await supabase.from('job_visits').update({ status: 'completed' }).eq('id', v.id)
    setBusy(null)
    if (err) {
      setError(err.message)
      return
    }
    setDone(prev => new Set(prev).add(v.id))
    onChanged()
  }

  return (
    <Modal title="Late visits" size="md" fixed onClose={onClose} flush>
      <div style={{ padding: '14px 20px', fontSize: 13, color: TEXT3, lineHeight: 1.5, borderBottom: `1px solid ${LINE}` }}>
        These visits have finished their time but are not marked done or cancelled. Close them off, or open one to move it.
      </div>
      {left.length === 0 ? (
        <div style={{ padding: '28px 20px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: TEXT }}>All caught up</div>
      ) : (
        left.map((v, i) => {
          const s = v.staff_id ? staffById.get(v.staff_id) : undefined
          return (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: i === 0 ? 'none' : `1px solid ${LINE}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customerName(v.customers) || v.title}</div>
                <div style={{ fontSize: 12, color: TEXT3, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span>{fmtDay(new Date(v.start_at))} · {fmtRange(new Date(v.start_at), new Date(v.end_at))}</span>
                  {s && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: s.colour }} />
                      {s.name.split(' ')[0]}
                    </span>
                  )}
                </div>
              </div>
              <button type="button" onClick={() => onOpen(v)} style={{ ...BTN.secondary, ...BTN_SM }}>Open</button>
              <button type="button" onClick={() => mark(v)} disabled={busy === v.id} style={{ ...BTN.primary, ...BTN_SM, ...(busy === v.id ? BTN.disabled : {}) }}>
                {busy === v.id ? '...' : 'Mark done'}
              </button>
            </div>
          )
        })
      )}
      {error && <div style={{ margin: '12px 20px', fontSize: 13, color: RED }}>{error}</div>}
    </Modal>
  )
}
