'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Select } from '@/components/Select'
import { BTN, BTN_SM, ConfirmDialog, FIELD, FIELD_TEXTAREA, LABEL, Modal, RED, TEXT, TEXT2, TEXT3, useIsPhone, FormError } from '@/components/forms'
import { getEquipmentLabel } from '@/lib/industry-config'
import { describeRule, expandRule, type RepeatRule } from '@/lib/recurrence'
import {
  DURATIONS,
  VISIT_KINDS,
  VISIT_STATUS,
  type StaffMember,
  type TimeOff,
  type Visit,
  type VisitKind,
  type VisitStatus,
  clockLabel,
  clockMinutes,
  customerAddress,
  customerName,
  durationLabel,
  fmtDay,
  fmtRange,
  fromInputs,
  isLate,
  isOnLeave,
  mapsUrl,
  minutesBetween,
  toDateInput,
  toTimeInput,
} from '@/lib/schedule'
import { NO_REPEAT, RepeatFields, ruleFromState, stateFromRule, type RepeatState } from './RepeatFields'
import { FindTime } from './FindTime'
import { VisitChecklists } from './VisitChecklists'

type CustomerOption = { id: string; first_name: string | null; last_name: string | null; suburb: string | null }
type JobOption = { id: string; customer_id: string; brand: string | null; model: string | null; equipment_type: string | null }

export type VisitPrefill = { customerId?: string; jobId?: string; staffId?: string | null; title?: string; kind?: VisitKind; notes?: string; duration?: number; toBookId?: string }
export type SavedInfo = { completed?: Visit }

type Props = {
  businessId: string
  visit: Visit | null
  defaults?: { date: Date; staffId: string | null }
  /** Starting values for a new visit (from the to-be-booked list, or "book the next visit"). */
  prefill?: VisitPrefill
  customers: CustomerOption[]
  jobs: JobOption[]
  staff: StaffMember[]
  timeOff: TimeOff[]
  onClose: () => void
  /** Called after a save or delete, with a short message for the toast. */
  onSaved: (message: string, info?: SavedInfo) => void
}

const note = (tone: 'warn' | 'info'): React.CSSProperties => ({
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.5,
  borderRadius: 10,
  padding: '10px 12px',
  ...(tone === 'warn' ? { color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A' } : { color: TEXT2, background: '#F8FAFC', border: '1px solid #E8EDF2' }),
})

const kindLabelOf = (k: VisitKind) => VISIT_KINDS.find(x => x.value === k)?.label || 'Visit'

export function VisitModal({ businessId, visit, defaults, prefill, customers, jobs, staff, timeOff, onClose, onSaved }: Props) {
  const phone = useIsPhone()
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const initialStart = visit ? new Date(visit.start_at) : defaults?.date ?? new Date()
  const initialDuration = visit ? Math.max(15, minutesBetween(new Date(visit.start_at), new Date(visit.end_at))) : prefill?.duration ?? 60

  const [when, setWhen] = useState<'set' | 'later'>('set')
  const [customerId, setCustomerId] = useState(visit?.customer_id || prefill?.customerId || '')
  const [jobId, setJobId] = useState(visit?.job_id || prefill?.jobId || '')
  const [kind, setKind] = useState<VisitKind>(visit?.kind || prefill?.kind || 'service')
  const [title, setTitle] = useState(visit ? (visit.title !== kindLabelOf(visit.kind) ? visit.title : '') : prefill?.title || '')
  const [staffId, setStaffId] = useState(visit?.staff_id ?? prefill?.staffId ?? defaults?.staffId ?? '')
  const [date, setDate] = useState(toDateInput(initialStart))
  const [time, setTime] = useState(visit || (defaults && (defaults.date.getHours() || defaults.date.getMinutes())) ? toTimeInput(initialStart) : '09:00')
  const [duration, setDuration] = useState(initialDuration)
  const [status, setStatus] = useState<VisitStatus>(visit?.status || 'scheduled')
  const [notes, setNotes] = useState(visit?.notes || prefill?.notes || '')
  const [notify, setNotify] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [checklistCount, setChecklistCount] = useState(0)
  const [conflict, setConflict] = useState('')

  // Repeating visits
  const [repeat, setRepeat] = useState<RepeatState>(NO_REPEAT)
  const [series, setSeries] = useState<{ id: string; rule: RepeatRule } | null>(null)
  const [scope, setScope] = useState<'one' | 'following'>('one')
  const [changeRepeat, setChangeRepeat] = useState(false)

  // Reminder to the customer
  const [lastReminder, setLastReminder] = useState<string | null>(null)
  const [reminding, setReminding] = useState(false)
  const [reminderMsg, setReminderMsg] = useState('')

  const customer = customers.find(c => c.id === customerId)
  const customerJobs = useMemo(() => jobs.filter(j => j.customer_id === customerId), [jobs, customerId])
  const assignable = staff.filter(s => s.active || s.id === visit?.staff_id)
  const tech = staff.find(s => s.id === staffId)
  const durations = Array.from(new Set([...DURATIONS, duration])).sort((a, b) => a - b)

  const start = fromInputs(date, time)
  const end = start ? new Date(start.getTime() + duration * 60000) : null
  const inSeries = !!visit?.series_id

  function pickCustomer(id: string) {
    setCustomerId(id)
    const list = jobs.filter(j => j.customer_id === id)
    setJobId(list.length === 1 ? list[0].id : '')
  }

  // The run this visit belongs to, and the last reminder emailed about it
  useEffect(() => {
    if (!visit) return
    let cancelled = false
    if (visit.series_id) {
      supabase
        .from('visit_series')
        .select('id, rule')
        .eq('id', visit.series_id)
        .single()
        .then(({ data }) => {
          if (!cancelled && data) setSeries(data as { id: string; rule: RepeatRule })
        })
    }
    supabase
      .from('visit_reminders')
      .select('sent_at')
      .eq('visit_id', visit.id)
      .eq('for_start', visit.start_at)
      .order('sent_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!cancelled && data && data[0]) setLastReminder(data[0].sent_at)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visit?.id])

  // Changing how a run repeats starts from the rule it has now
  function startChangeRepeat(on: boolean) {
    setChangeRepeat(on)
    if (on) {
      setScope('following')
      if (series) setRepeat(stateFromRule(series.rule))
    }
  }

  // Warn (but do not block) when the technician already has something at this time
  useEffect(() => {
    setConflict('')
    if (when === 'later' || !staffId || !start || !end) return
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
  }, [staffId, date, time, duration, when])

  // Working days, hours and time off
  const hoursWarning = (() => {
    if (when === 'later' || !tech || !start) return ''
    const first = tech.name.split(' ')[0]
    if (isOnLeave(tech.id, start, timeOff)) return `${first} has time off on that day.`
    if (!(tech.work_days || []).includes(start.getDay())) return `${first} does not usually work on ${start.toLocaleDateString('en-AU', { weekday: 'long' })}s.`
    const s = start.getHours() * 60 + start.getMinutes()
    if (s < clockMinutes(tech.work_start, 0) || s + duration > clockMinutes(tech.work_end, 1440)) return `That is outside ${first}'s usual hours (${clockLabel(tech.work_start)} to ${clockLabel(tech.work_end)}).`
    return ''
  })()

  // Where "find a free time" starts looking: the chosen day if it is ahead, otherwise now. Kept steady between renders.
  const searchFrom = useMemo(() => {
    const d = fromInputs(date, '00:00')
    return d && d.getTime() > Date.now() ? d : new Date()
  }, [date])
  const activeStaff = staff.filter(s => s.active)

  async function notifyTech(visitId: string, first: Date, last: Date, repeatText: string) {
    if (!(notify && tech?.email)) return ''
    const firstName = tech.name.split(' ')[0]
    try {
      const { data: sess } = await supabase.auth.getSession()
      const r = await fetch('/api/visits/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sess.session?.access_token || ''}` },
        body: JSON.stringify({ visit_id: visitId, when: fmtDay(first), time: fmtRange(first, last), ...(repeatText ? { repeat: repeatText } : {}) }),
      })
      return r.ok ? ` and ${firstName} was emailed` : `, but the email to ${firstName} did not send`
    } catch {
      return `, but the email to ${firstName} did not send`
    }
  }

  async function saveToBook() {
    if (!customerId && !title.trim()) {
      setError('Choose a customer or add a title.')
      return
    }
    setSaving(true)
    const { error: err } = await supabase.from('to_book').insert({
      business_id: businessId,
      customer_id: customerId || null,
      job_id: jobId || null,
      staff_id: staffId || null,
      title: title.trim() || kindLabelOf(kind),
      kind,
      duration_minutes: duration,
      notes: notes.trim() || null,
    })
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    onSaved('Added to the to-be-booked list')
  }

  async function save() {
    setError('')
    if (!visit && when === 'later') return saveToBook()
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
    const rule = !visit || changeRepeat ? ruleFromState(repeat) : null
    if (rule?.ends.type === 'date' && !rule.ends.date) {
      setError('Choose the date the repeat stops.')
      return
    }
    const resolvedTitle = title.trim() || kindLabelOf(kind)
    const payload = {
      job_id: jobId || null,
      customer_id: customerId || null,
      staff_id: staffId || null,
      title: resolvedTitle,
      kind,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status,
      notes: notes.trim() || null,
    }
    setSaving(true)

    // ── A new visit, or a new repeating run ──
    if (!visit) {
      let firstId: string | null = null
      let count = 1
      let repeatText = ''
      let firstStart = start

      if (!rule) {
        const res = await supabase.from('job_visits').insert({ ...payload, business_id: businessId }).select('id').single()
        if (res.error || !res.data) {
          setSaving(false)
          setError(res.error?.message || 'Could not save the visit.')
          return
        }
        firstId = res.data.id
      } else {
        const { dates } = expandRule(rule, start)
        if (!dates.length) {
          setSaving(false)
          setError('That repeat makes no visits. Check the days and the end.')
          return
        }
        const ser = await supabase
          .from('visit_series')
          .insert({ business_id: businessId, rule, template: { customer_id: customerId || null, job_id: jobId || null, staff_id: staffId || null, title: resolvedTitle, kind, notes: notes.trim() || null, duration, time } })
          .select('id')
          .single()
        if (ser.error || !ser.data) {
          setSaving(false)
          setError(ser.error?.message || 'Could not save the repeat.')
          return
        }
        const rows = dates.map(d => ({ ...payload, business_id: businessId, series_id: ser.data.id, start_at: d.toISOString(), end_at: new Date(d.getTime() + duration * 60000).toISOString() }))
        let failed: string | null = null
        for (let i = 0; i < rows.length && !failed; i += 100) {
          const ins = await supabase.from('job_visits').insert(rows.slice(i, i + 100)).select('id, start_at').order('start_at')
          if (ins.error || !ins.data) failed = ins.error?.message || 'Could not save the visits.'
          else if (i === 0) firstId = ins.data[0]?.id ?? null
        }
        if (failed) {
          // Leave nothing half made
          await supabase.from('job_visits').delete().eq('series_id', ser.data.id)
          await supabase.from('visit_series').delete().eq('id', ser.data.id)
          setSaving(false)
          setError(failed)
          return
        }
        count = dates.length
        firstStart = dates[0]
        repeatText = describeRule(rule, dates[0])
      }

      if (prefill?.toBookId) await supabase.from('to_book').delete().eq('id', prefill.toBookId)
      let message = count > 1 ? `${count} visits added` : 'Visit added'
      if (firstId && (staffId || null) && tech?.email) {
        message += await notifyTech(firstId, firstStart, new Date(firstStart.getTime() + duration * 60000), repeatText)
      }
      setSaving(false)
      onSaved(message)
      return
    }

    // ── Changing an existing visit ──
    let message = 'Visit saved'
    const original = visit

    if (inSeries && scope === 'following' && !changeRepeat) {
      const rpc = await supabase.rpc('series_update_following', {
        p_visit: original.id,
        p_title: resolvedTitle,
        p_kind: kind,
        p_staff: staffId || null,
        p_notes: notes.trim() || null,
        p_duration: duration,
        p_time: time,
        p_tz: tz,
      })
      if (rpc.error) {
        setSaving(false)
        setError(rpc.error.message)
        return
      }
      message = `Visit saved, and ${rpc.data ?? 0} following visit${rpc.data === 1 ? '' : 's'} updated`
    }

    if (inSeries && changeRepeat && rule && series) {
      const { dates } = expandRule(rule, start)
      if (!dates.length) {
        setSaving(false)
        setError('That repeat makes no visits. Check the days and the end.')
        return
      }
      // Remove the upcoming visits of this run (never finished ones), then lay out the new pattern from this visit on
      const del = await supabase.from('job_visits').delete().eq('series_id', series.id).gt('start_at', original.start_at).eq('status', 'scheduled').neq('id', original.id)
      if (del.error) {
        setSaving(false)
        setError(del.error.message)
        return
      }
      const upd = await supabase.from('job_visits').update({ ...payload, start_at: dates[0].toISOString(), end_at: new Date(dates[0].getTime() + duration * 60000).toISOString() }).eq('id', original.id)
      if (upd.error) {
        setSaving(false)
        setError(upd.error.message)
        return
      }
      const rows = dates.slice(1).map(d => ({ ...payload, business_id: businessId, series_id: series.id, status: 'scheduled' as VisitStatus, start_at: d.toISOString(), end_at: new Date(d.getTime() + duration * 60000).toISOString() }))
      for (let i = 0; i < rows.length; i += 100) {
        const ins = await supabase.from('job_visits').insert(rows.slice(i, i + 100))
        if (ins.error) {
          setSaving(false)
          setError(ins.error.message)
          return
        }
      }
      await supabase.from('visit_series').update({ rule, template: { customer_id: customerId || null, job_id: jobId || null, staff_id: staffId || null, title: resolvedTitle, kind, notes: notes.trim() || null, duration, time } }).eq('id', series.id)
      setSaving(false)
      onSaved(`Repeat changed: ${dates.length} visits from ${fmtDay(dates[0])}`)
      return
    }

    const res = await supabase.from('job_visits').update(payload).eq('id', original.id).select('id').single()
    if (res.error || !res.data) {
      setSaving(false)
      setError(res.error?.message || 'Could not save the visit.')
      return
    }

    // Tell the technician by email if asked, and only when they have an email saved
    const staffChanged = original.staff_id !== (staffId || null)
    if (staffChanged) message += await notifyTech(res.data.id, start, end, '')
    const completedNow = status === 'completed' && original.status !== 'completed'
    setSaving(false)
    onSaved(message, completedNow ? { completed: { ...original, ...payload } as Visit } : undefined)
  }

  async function remove(mode: 'one' | 'following') {
    if (!visit) return
    setSaving(true)
    const q =
      mode === 'following' && visit.series_id
        ? supabase.from('job_visits').delete().eq('series_id', visit.series_id).gte('start_at', visit.start_at).neq('status', 'completed')
        : supabase.from('job_visits').delete().eq('id', visit.id)
    const { error: err } = await q
    setSaving(false)
    setConfirmDelete(false)
    if (err) {
      setError(err.message)
      return
    }
    onSaved(mode === 'following' ? 'This and the following visits were deleted' : 'Visit deleted')
  }

  async function emailReminder() {
    if (!visit) return
    setReminding(true)
    setReminderMsg('')
    try {
      const { data: sess } = await supabase.auth.getSession()
      const s = new Date(visit.start_at)
      const e = new Date(visit.end_at)
      const r = await fetch('/api/visits/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sess.session?.access_token || ''}` },
        body: JSON.stringify({ visit_id: visit.id, when: fmtDay(s), time: fmtRange(s, e) }),
      })
      const body = await r.json().catch(() => ({}))
      if (r.ok) {
        setLastReminder(body.sent_at || new Date().toISOString())
        setReminderMsg(`Reminder emailed to ${body.to}.`)
      } else if (body.error === 'not_configured') {
        setReminderMsg('Email sending is not switched on yet.')
      } else {
        setReminderMsg(body.message || 'The reminder could not be sent.')
      }
    } catch {
      setReminderMsg('Could not reach Jobyra. Check your connection.')
    }
    setReminding(false)
  }

  const address = customerAddress((visit?.customers as any) || (customer as any))
  const customerPhone = visit?.customers?.phone
  const customerEmail = String(visit?.customers?.email || '').trim()
  const late = visit ? isLate({ status: visit.status, end_at: visit.end_at }) : false
  const timeChanged = !!visit && !!start && start.getTime() !== new Date(visit.start_at).getTime()
  const reminderOk = !!visit && !!customerEmail && visit.status !== 'cancelled' && visit.status !== 'completed'

  return (
    <>
      <Modal
        title={visit ? 'Edit visit' : 'New visit'}
        size="lg"
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
              {saving ? 'Saving...' : !visit && when === 'later' ? 'Add to list' : !visit && repeat.preset !== 'none' ? 'Add visits' : 'Save'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!visit && (
            <div className="jb-chips" role="group" aria-label="When">
              <button type="button" className="jb-chip" aria-pressed={when === 'set'} onClick={() => setWhen('set')}>Pick a time</button>
              <button type="button" className="jb-chip" aria-pressed={when === 'later'} onClick={() => setWhen('later')}>Book later</button>
            </div>
          )}
          {!visit && when === 'later' && <div style={note('info')}>This goes on the to-be-booked list on the calendar, so you can give it a time when you are ready.</div>}

          {visit && (customerPhone || address) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {customerPhone && <a href={`tel:${customerPhone}`} style={{ ...BTN.secondary, ...BTN_SM, textDecoration: 'none' }}>Call {customerPhone}</a>}
              {address && <a href={mapsUrl(address)} target="_blank" rel="noreferrer" style={{ ...BTN.secondary, ...BTN_SM, textDecoration: 'none' }}>Directions</a>}
              {visit.customer_id && <a href={`/dashboard/customers/${visit.customer_id}`} style={{ ...BTN.secondary, ...BTN_SM, textDecoration: 'none' }}>Open customer</a>}
            </div>
          )}

          {late && visit?.status === 'scheduled' && <div style={note('warn')}>This visit&apos;s time has passed. Set the status to Completed, or move it to a new time.</div>}

          {inSeries && series && (
            <div style={note('info')}>
              <b style={{ color: TEXT }}>Repeating:</b> {describeRule(series.rule, new Date(visit!.start_at))}.
              <div className="jb-chips" style={{ marginTop: 10 }}>
                <button type="button" className="jb-chip" aria-pressed={scope === 'one'} onClick={() => { setScope('one'); setChangeRepeat(false) }}>Changes apply to this visit</button>
                <button type="button" className="jb-chip" aria-pressed={scope === 'following'} onClick={() => setScope('following')}>This and the following visits</button>
              </div>
              {scope === 'following' && !changeRepeat && <div style={{ marginTop: 8, color: TEXT3 }}>Technician, type, title, notes, length and time of day are copied to the later visits. Their dates stay as they are.</div>}
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

          {!visit && when === 'later' ? (
            <div>
              <label style={LABEL}>Length</label>
              <Select style={FIELD} value={String(duration)} onChange={e => setDuration(Number(e.target.value))}>
                {durations.map(d => <option key={d} value={String(d)}>{durationLabel(d)}</option>)}
              </Select>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: phone ? '1fr 1fr' : '1.3fr 1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: phone ? '1 / -1' : undefined }}>
                  <label style={LABEL}>{!visit || changeRepeat ? 'Date (first visit)' : 'Date'}</label>
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

              <FindTime
                staff={tech ? [tech] : activeStaff}
                timeOff={timeOff}
                durationMin={duration}
                from={searchFrom}
                ignoreVisitId={visit?.id}
                onPick={slot => {
                  setDate(toDateInput(slot.start))
                  setTime(toTimeInput(slot.start))
                  if (!staffId) setStaffId(slot.staffId)
                }}
              />

              {(conflict || hoursWarning) && (
                <div style={note('warn')}>
                  {[conflict, hoursWarning].filter(Boolean).join(' ')} You can still save.
                </div>
              )}

              {!visit && <RepeatFields value={repeat} onChange={setRepeat} start={start} />}

              {inSeries && series && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: TEXT2, cursor: 'pointer' }}>
                    <input type="checkbox" checked={changeRepeat} onChange={e => startChangeRepeat(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2AA198' }} />
                    Change how this repeats
                  </label>
                  {changeRepeat && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <RepeatFields value={repeat} onChange={setRepeat} start={start} allowNone={false} />
                      <div style={note('warn')}>The upcoming visits of this run are replaced by the new pattern. Finished visits stay.</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div>
            <label style={LABEL}>Title (optional)</label>
            <input style={FIELD} value={title} onChange={e => setTitle(e.target.value)} placeholder={`e.g. ${kindLabelOf(kind)} for the upstairs unit`} />
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

          {visit && (customerEmail || lastReminder) && (
            <div style={{ border: '1px solid #E8EDF2', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>Reminder to {visit.customers?.first_name || 'the customer'}</div>
                <div style={{ fontSize: 12, color: TEXT3, marginTop: 2 }}>
                  {lastReminder ? `Emailed ${new Date(lastReminder).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}` : customerEmail ? 'Not sent yet' : ''}
                  {reminderMsg ? ` · ${reminderMsg}` : ''}
                </div>
                {timeChanged && <div style={{ fontSize: 12, color: '#92400E', marginTop: 2 }}>Save the new time first, so the reminder shows it.</div>}
              </div>
              {reminderOk && (
                <button type="button" onClick={emailReminder} disabled={reminding || timeChanged} style={{ ...BTN.secondary, ...BTN_SM, ...(reminding || timeChanged ? BTN.disabled : {}) }}>
                  {reminding ? 'Sending...' : lastReminder ? 'Send again' : 'Email a reminder'}
                </button>
              )}
            </div>
          )}

          {visit && <VisitChecklists businessId={businessId} visit={visit} technician={tech?.name || null} onCount={setChecklistCount} />}

          {tech?.email && (!visit || visit.staff_id !== staffId) && when === 'set' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: TEXT2, cursor: 'pointer' }}>
              <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2AA198' }} />
              Email {tech.name.split(' ')[0]} the details
            </label>
          )}
          {tech && !tech.email && !visit && when === 'set' && (
            <div style={{ fontSize: 12, color: TEXT3 }}>Add an email to {tech.name.split(' ')[0]} in Team to send them the details automatically.</div>
          )}

          {error && <FormError message={error} />}
        </div>
      </Modal>

      {confirmDelete && !inSeries && (
        <ConfirmDialog
          title="Delete this visit?"
          message={checklistCount > 0 ? 'It will be removed from the calendar, along with its checklists and any signatures on them. The customer and job are not affected.' : 'It will be removed from the calendar. The customer and job are not affected.'}
          busy={saving}
          busyLabel="Deleting..."
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => remove('one')}
        />
      )}

      {confirmDelete && inSeries && (
        <Modal
          title="Delete a repeating visit"
          size="sm"
          compact
          layer={450}
          busy={saving}
          onClose={() => setConfirmDelete(false)}
          footer={
            <>
              <button type="button" onClick={() => setConfirmDelete(false)} disabled={saving} style={BTN.secondary}>Keep</button>
              <button type="button" onClick={() => remove('one')} disabled={saving} style={{ ...BTN.danger, ...(saving ? BTN.disabled : {}) }}>Only this visit</button>
              <button type="button" onClick={() => remove('following')} disabled={saving} style={{ ...BTN.dangerSolid, ...(saving ? BTN.disabled : {}) }}>This and following</button>
            </>
          }
        >
          <div style={{ fontSize: 14, lineHeight: 1.6, color: TEXT3 }}>
            This visit is part of a repeating run. Finished visits are always kept.
            {checklistCount > 0 ? ' Checklists on the visits that are deleted go with them.' : ''}
          </div>
        </Modal>
      )}
    </>
  )
}
