'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TEXT3 } from '@/components/forms'
import { type FreeSlot, type StaffMember, type TimeOff, addDays, findFreeSlots, fmtDay, fmtTime } from '@/lib/schedule'

type Props = {
  /** The technicians to look at: the one chosen, or everyone who is on the team. */
  staff: StaffMember[]
  timeOff: TimeOff[]
  durationMin: number
  /** Earliest moment to offer (the chosen date, or now if that is in the past). */
  from: Date
  /** When editing, the visit itself should not block its own time. */
  ignoreVisitId?: string
  onPick: (slot: FreeSlot) => void
}

/** "Find a free time": the next open slots, from working hours, days off and what is already booked. */
export function FindTime({ staff, timeOff, durationMin, from, ignoreVisitId, onPick }: Props) {
  const [open, setOpen] = useState(false)
  const [slots, setSlots] = useState<FreeSlot[] | null>(null)
  const [more, setMore] = useState(false)
  const ids = staff.map(s => s.id).join(',')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setSlots(null)
    ;(async () => {
      let visits: { staff_id: string | null; start_at: string; end_at: string; status: string; id?: string }[] = []
      if (staff.length) {
        const { data } = await supabase
          .from('job_visits')
          .select('id, staff_id, start_at, end_at, status')
          .in('staff_id', staff.map(s => s.id))
          .neq('status', 'cancelled')
          .lt('start_at', addDays(from, 15).toISOString())
          .gt('end_at', from.toISOString())
        visits = (data || []).filter(v => v.id !== ignoreVisitId)
      }
      if (cancelled) return
      setSlots(findFreeSlots({ staff, visits, timeOff, durationMin, from, days: 14, limit: more ? 14 : 6 }))
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ids, durationMin, from.getTime(), more, timeOff.length, ignoreVisitId])

  const named = staff.length > 1
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button type="button" onClick={() => setOpen(!open)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, color: '#1F857C', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
        {open ? 'Hide free times' : 'Find a free time'}
      </button>
      {open && (
        <div>
          {slots === null ? (
            <div style={{ fontSize: 13, color: TEXT3 }}>Looking...</div>
          ) : slots.length === 0 ? (
            <div style={{ fontSize: 13, color: TEXT3, lineHeight: 1.5 }}>
              {staff.length === 0 ? 'Add a technician in Team first.' : 'Nothing free in the next two weeks. Check working days and time off in Team.'}
            </div>
          ) : (
            <>
              <div className="jb-chips">
                {slots.map(s => (
                  <button key={s.start.getTime() + s.staffId} type="button" className="jb-chip" onClick={() => onPick(s)}>
                    {fmtDay(s.start)} · {fmtTime(s.start)}
                    {named && <span className="count">{staff.find(x => x.id === s.staffId)?.name.split(' ')[0]}</span>}
                  </button>
                ))}
              </div>
              {!more && slots.length >= 6 && (
                <button type="button" onClick={() => setMore(true)} style={{ marginTop: 8, background: 'none', border: 'none', padding: 0, color: TEXT3, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Show more
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
