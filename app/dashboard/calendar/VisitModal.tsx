'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Select } from '@/components/Select'
import { BTN, BTN_SM, ConfirmDialog, FIELD, FIELD_TEXTAREA, LABEL, Modal, RED, TEXT2, TEXT3, useIsPhone } from '@/components/forms'
import { getEquipmentLabel } from '@/lib/industry-config'
import {
  DURATIONS,
  VISIT_KINDS,
  VISIT_STATUS,
  type StaffMember,
  type Visit,
  type VisitKind,
  type VisitStatus,
  customerAddress,
  customerName,
  durationLabel,
  fmtDay,
  fmtRange,
  fromInputs,
  mapsUrl,
  minutesBetween,
  toDateInput,
  toTimeInput,
} from '@/lib/schedule'

type CustomerOption = { id: string; first_name: string | null; last_name: string | null; suburb: string | null }
type JobOption = { id: string; customer_id: string; brand: string | null; model: string | null; equipment_type: string | null }

type Props = {
  businessId: string
  visit: Visit | null
  defaults?: { date: Date; staffId: string | null }
  /** Starting values for a new visit (for example from an accepted quote). */
  prefill?: { customerId?: string; title?: string; notes?: string }
  customers: CustomerOption[]
  jobs: JobOption[]
  staff: StaffMember[]
  onClose: () => void
  /** Called after a save or delete, with a short message for the toast. */
  onSaved: (message: string) => void
}

export function VisitModal({ businessId, visit, defaults, prefill, customers, jobs, staff, onClose, onSaved }: Props) {
  const phone = useIsPhone()
  const initialStart = visit ? new Date(visit.start_at) : defaults?.date ?? new Date()
  const initialDuration = visit ? Math.max(15, minutesBetween(new Date(visit.start_at), new Date(visit.end_at))) : 60

  const [customerId, setCustomerId] = useState(visit?.customer_id || prefill?.customerId || '')
  const [jobId, setJobId] = useState(visit?.job_id || '')
  const [kind, setKind] = useState<VisitKind>(visit?.kind || 'service')
  const [title, setTitle] = useState(visit ? (visit.title !== VISIT_KINDS.find(k => k.value === visit.kind)?.label ? visit.title : '') : prefill?.title || '')
  const [staffId, setStaffId] = useState(visit?.staff_id ?? defaults?.staffId ?? '')
  const [date, setDate] = useState(toDateInput(initialStart))
  const [time, setTime] = useState(visit || (defaults && (defaults.date.getHours() || defaults.date.getMinutes())) ? toTimeInput(initialStart) : '09:00')
  const [duration, setDuration] = useState(initialDuration)
  const [status, setStatus] = useState<VisitStatus>(visit?.status || 'scheduled')
  const [notes, setNotes] = useState(visit?.notes || prefill?.notes || '')
  const [notify, setNotify] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [conflict, setConflict] = useState('')

  const customer = customers.find(c => c.id === customerId)
  const customerJobs = useMemo(() => jobs.filter(j => j.customer_id === customerId), [jobs, customerId])
  const assignable = staff.filter(s => s.active || s.id === visit?.staff_id)
  const tech = staff.find(s => s.id === staffId)
  const durations = Array.from(new Set([...DURATIONS, duration])).sort((a, b) => a - b)

  const start = fromInputs(date, time)
  const end = start ? new Date(start.getTime() + duration * 60000) : null

  function pickCustomer(id: string) {
    setCustomerId(id)
    const list = jobs.filter(j => j.customer_id === id)
    setJobId(list.length === 1 ? list[0].id : '')
  }

  // Warn (but do not block) when the technician already has something at this time
  useEffect(() => {
    setConflict('')
    if (!staffId || !start || !end) return
    let cancelled = false
    const t = setTimeout(async () => {
      let q = supabase
        .from('job_visits')
        .select('id, title, start_at, end_at, customers(first_name, last_name)')
        .eq('staff_id', staffId)
        .neq('status', 'cancelled')
        .lt('start_at', end.toISOString())
        .gt('end_at', start.toISOString())
        .limit(1)
      if (visit) q = q.neq('id', visit.id)
      const { data } = await q
      if (cancelled || !data || data.length === 0) return
      const c: any = data[0]
      const who = customerName(c.customers) || c.title
      setConflict(`${tech?.name || 'This technician'} already has ${who} from ${fmtRange(new Date(c.start_at), new Date(c.end_at))}.`)
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId, date, time, duration])

  async function save() {
    setError('')
    if (!start || !end) {
      setError('Pick a date and a start time.')
      return
    }
    if (!customerId && kind !== 'other') {
      setError('Choose the customer for this visit.')
      return
    }
    if (!customerId && !title.trim()) {
      setError('Add a title for this visit.')
      return
    }
    setSaving(true)
    const kindLabel = VISIT_KINDS.find(k => k.value === kind)?.label || 'Visit'
    const payload = {
      job_id: jobId || null,
      customer_id: customerId || null,
      staff_id: staffId || null,
      title: title.trim() || kindLabel,
      kind,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status,
      notes: notes.trim() || null,
    }
    const res = visit
      ? await supabase.from('job_visits').update(payload).eq('id', visit.id).select('id').single()
      : await supabase.from('job_visits').insert({ ...payload, business_id: businessId }).select('id').single()
    if (res.error || !res.data) {
      setSaving(false)
      setError(res.error?.message || 'Could not save the visit.')
      return
    }

    let message = visit ? 'Visit saved' : 'Visit added'
    // Tell the technician by email if asked, and only when they have an email saved
    const staffChanged = !visit || visit.staff_id !== (staffId || null)
    if (notify && tech?.email && staffChanged) {
      try {
        const { data: sess } = await supabase.auth.getSession()
        const r = await fetch('/api/visits/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sess.session?.access_token || ''}` },
          body: JSON.stringify({ visit_id: res.data.id, when: fmtDay(start), time: fmtRange(start, end) }),
        })
        message = r.ok ? `${message} and ${tech.name.split(' ')[0]} was emailed` : `${message}, but the email to ${tech.name.split(' ')[0]} did not send`
      } catch {
        message = `${message}, but the email to ${tech.name.split(' ')[0]} did not send`
      }
    }
    setSaving(false)
    onSaved(message)
  }

  async function remove() {
    if (!visit) return
    setSaving(true)
    const { error: err } = await supabase.from('job_visits').delete().eq('id', visit.id)
    setSaving(false)
    setConfirmDelete(false)
    if (err) {
      setError(err.message)
      return
    }
    onSaved('Visit deleted')
  }

  const address = customerAddress((visit?.customers as any) || (customer as any))
  const customerPhone = visit?.customers?.phone

  return (
    <>
      <Modal
        title={visit ? 'Edit visit' : 'New visit'}
        size="md"
        busy={saving}
        onClose={onClose}
        footer={
          <>
            {visit && (
              <button type="button" onClick={() => setConfirmDelete(true)} disabled={saving} style={{ ...BTN.danger, marginRight: 'auto' }}>
                Delete
              </button>
            )}
            <button type="button" onClick={onClose} disabled={saving} style={BTN.secondary}>Cancel</button>
            <button type="button" onClick={save} disabled={saving} style={{ ...BTN.primary, ...(saving ? BTN.disabled : {}) }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visit && (customerPhone || address) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {customerPhone && <a href={`tel:${customerPhone}`} style={{ ...BTN.secondary, ...BTN_SM, textDecoration: 'none' }}>Call {customerPhone}</a>}
              {address && <a href={mapsUrl(address)} target="_blank" rel="noreferrer" style={{ ...BTN.secondary, ...BTN_SM, textDecoration: 'none' }}>Directions</a>}
              {visit.customer_id && <a href={`/dashboard/customers/${visit.customer_id}`} style={{ ...BTN.secondary, ...BTN_SM, textDecoration: 'none' }}>Open customer</a>}
            </div>
          )}

          <div>
            <label style={LABEL}>Customer {kind !== 'other' ? '*' : ''}</label>
            <Select style={FIELD} value={customerId} onChange={e => pickCustomer(e.target.value)}>
              <option value="">{kind === 'other' ? 'No customer' : 'Select customer...'}</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {customerName(c) || 'Unnamed'}{c.suburb ? ` - ${c.suburb}` : ''}
                </option>
              ))}
            </Select>
          </div>

          {customerId && customerJobs.length > 0 && (
            <div>
              <label style={LABEL}>Equipment</label>
              <Select style={FIELD} value={jobId} onChange={e => setJobId(e.target.value)}>
                <option value="">Not for a specific unit</option>
                {customerJobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {[j.brand, j.model].filter(Boolean).join(' ') || 'Unit'} · {getEquipmentLabel(j.equipment_type) || 'Equipment'}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: phone ? '1fr' : '1fr 1fr', gap: 16 }}>
            <div>
              <label style={LABEL}>Type</label>
              <Select style={FIELD} value={kind} onChange={e => setKind(e.target.value as VisitKind)}>
                {VISIT_KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
              </Select>
            </div>
            <div>
              <label style={LABEL}>Technician</label>
              <Select style={FIELD} value={staffId} onChange={e => setStaffId(e.target.value)}>
                <option value="">Unassigned</option>
                {assignable.map(s => <option key={s.id} value={s.id}>{s.name}{s.active ? '' : ' (left)'}</option>)}
              </Select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: phone ? '1fr 1fr' : '1.3fr 1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: phone ? '1 / -1' : undefined }}>
              <label style={LABEL}>Date</label>
              <input type="date" style={FIELD} value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label style={LABEL}>Starts</label>
              <input type="time" style={FIELD} value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div>
              <label style={LABEL}>Length</label>
              <Select style={FIELD} value={String(duration)} onChange={e => setDuration(Number(e.target.value))}>
                {durations.map(d => <option key={d} value={String(d)}>{durationLabel(d)}</option>)}
              </Select>
            </div>
          </div>

          {conflict && (
            <div style={{ fontSize: 13, fontWeight: 500, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 12px' }}>
              {conflict} You can still save.
            </div>
          )}

          <div>
            <label style={LABEL}>Title (optional)</label>
            <input style={FIELD} value={title} onChange={e => setTitle(e.target.value)} placeholder={`e.g. ${VISIT_KINDS.find(k => k.value === kind)?.label || 'Visit'} for the upstairs unit`} />
          </div>

          {visit && (
            <div>
              <label style={LABEL}>Status</label>
              <Select style={FIELD} value={status} onChange={e => setStatus(e.target.value as VisitStatus)}>
                {(Object.keys(VISIT_STATUS) as VisitStatus[]).map(s => <option key={s} value={s}>{VISIT_STATUS[s].label}</option>)}
              </Select>
            </div>
          )}

          <div>
            <label style={LABEL}>Notes for the technician</label>
            <textarea style={FIELD_TEXTAREA} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Gate code, parking, what to bring..." />
          </div>

          {tech?.email && (!visit || visit.staff_id !== staffId) && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: TEXT2, cursor: 'pointer' }}>
              <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2AA198' }} />
              Email {tech.name.split(' ')[0]} the details
            </label>
          )}
          {tech && !tech.email && !visit && (
            <div style={{ fontSize: 12, color: TEXT3 }}>Add an email to {tech.name.split(' ')[0]} in Team to send them the details automatically.</div>
          )}

          {error && <div style={{ fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>{error}</div>}
        </div>
      </Modal>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this visit?"
          message="It will be removed from the calendar. The customer and job are not affected."
          busy={saving}
          busyLabel="Deleting..."
          onCancel={() => setConfirmDelete(false)}
          onConfirm={remove}
        />
      )}
    </>
  )
}
