// Helpers for the staff calendar: types, labels, date maths and how overlapping visits sit side by side.

export type VisitStatus = 'scheduled' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled'
export type VisitKind = 'service' | 'install' | 'repair' | 'quote' | 'other'

export type StaffMember = {
  id: string
  business_id: string
  name: string
  email: string | null
  phone: string | null
  colour: string
  active: boolean
  calendar_token: string
  /** Working days (0 = Sunday ... 6 = Saturday) and hours ("07:00") */
  work_days: number[]
  work_start: string
  work_end: string
  /** What an hour of their time costs the business (private; used for job costing) */
  hourly_cost?: number | null
}

export type TimeOff = { id: string; staff_id: string; start_date: string; end_date: string; note: string | null }

export type Visit = {
  id: string
  business_id: string
  job_id: string | null
  customer_id: string | null
  staff_id: string | null
  title: string
  kind: VisitKind
  start_at: string
  end_at: string
  status: VisitStatus
  notes: string | null
  /** Set when the visit belongs to a repeating run */
  series_id?: string | null
  customers?: { first_name?: string | null; last_name?: string | null; phone?: string | null; email?: string | null; address?: string | null; suburb?: string | null; state?: string | null; postcode?: string | null } | null
  jobs?: { brand?: string | null; model?: string | null; equipment_type?: string | null } | null
}

/** Colours a technician can be given on the calendar. */
export const STAFF_COLOURS = ['#2AA198', '#4F46E5', '#D97706', '#DB2777', '#0284C7', '#16A34A', '#9333EA', '#DC2626']

export const VISIT_KINDS: { value: VisitKind; label: string }[] = [
  { value: 'service', label: 'Service' },
  { value: 'install', label: 'Installation' },
  { value: 'repair', label: 'Repair' },
  { value: 'quote', label: 'Quote visit' },
  { value: 'other', label: 'Other' },
]

export const VISIT_STATUS: Record<VisitStatus, { label: string; bg: string; fg: string }> = {
  scheduled: { label: 'Scheduled', bg: '#F1F5F9', fg: '#475569' },
  on_the_way: { label: 'On the way', bg: '#E0F2FE', fg: '#0369A1' },
  in_progress: { label: 'In progress', bg: '#FEF3C7', fg: '#92400E' },
  completed: { label: 'Completed', bg: '#EBFAF7', fg: '#1F857C' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', fg: '#B91C1C' },
}

export const DURATIONS = [30, 45, 60, 90, 120, 180, 240, 480]

export function durationLabel(min: number) {
  if (min === 480) return 'All day (8 hr)'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} hr ${m} min` : `${h} hr`
}

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function addDays(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes())
}

/** Weeks start on Monday. */
export function startOfWeek(d: Date) {
  const x = startOfDay(d)
  return addDays(x, -((x.getDay() + 6) % 7))
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const two = (n: number) => String(n).padStart(2, '0')

/** "2026-11-12" for a date box. */
export function toDateInput(d: Date) {
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`
}

/** "09:30" for a time box. */
export function toTimeInput(d: Date) {
  return `${two(d.getHours())}:${two(d.getMinutes())}`
}

export function fromInputs(date: string, time: string): Date | null {
  const [y, m, da] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  if ([y, m, da, h, mi].some(n => Number.isNaN(n))) return null
  return new Date(y, m - 1, da, h, mi, 0, 0)
}

export function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }).replace(' ', '')
}

export function fmtRange(a: Date, b: Date) {
  return `${fmtTime(a)} to ${fmtTime(b)}`
}

export function fmtDay(d: Date, long = false) {
  return d.toLocaleDateString('en-AU', long ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } : { weekday: 'short', day: 'numeric', month: 'short' })
}

export function minutesBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 60000)
}

export function customerName(c?: { first_name?: string | null; last_name?: string | null } | null) {
  return `${c?.first_name || ''} ${c?.last_name || ''}`.trim()
}

export function customerAddress(c?: { address?: string | null; suburb?: string | null; state?: string | null; postcode?: string | null } | null) {
  return [c?.address, c?.suburb, c?.state, c?.postcode].map(x => String(x || '').trim()).filter(Boolean).join(', ')
}

export function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

/**
 * Places overlapping items side by side. Returns each item with its column and how many columns
 * its group of overlapping items needs, so the caller can work out left and width.
 */
export function layoutOverlaps<T extends { start: number; end: number }>(items: T[]): (T & { col: number; cols: number })[] {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end)
  const out: (T & { col: number; cols: number })[] = []
  let cluster: (T & { col: number; cols: number })[] = []
  let clusterEnd = -Infinity

  const flush = () => {
    const cols = cluster.reduce((m, x) => Math.max(m, x.col + 1), 1)
    cluster.forEach(x => {
      x.cols = cols
    })
    out.push(...cluster)
    cluster = []
  }

  for (const item of sorted) {
    if (cluster.length && item.start >= clusterEnd) {
      flush()
      clusterEnd = -Infinity
    }
    const taken = cluster.filter(c => c.end > item.start).map(c => c.col)
    let col = 0
    while (taken.includes(col)) col += 1
    cluster.push({ ...item, col, cols: 1 })
    clusterEnd = Math.max(clusterEnd, item.end)
  }
  if (cluster.length) flush()
  return out
}


// ── Late visits ──

/** A visit that has finished its time but was never marked done or cancelled. */
export function isLate(v: { status: VisitStatus; end_at: string }, now: Date = new Date()) {
  return (v.status === 'scheduled' || v.status === 'on_the_way' || v.status === 'in_progress') && new Date(v.end_at).getTime() < now.getTime()
}

// ── Months ──

export function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

/** The Monday on or before the 1st of the month: where a month grid starts. */
export function monthGridStart(d: Date) {
  return startOfWeek(new Date(d.getFullYear(), d.getMonth(), 1))
}

// ── Working hours, time off and free times ──

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
/** Monday first, the order the calendar uses. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

/** "07:30" or "07:30:00" as minutes after midnight. */
export function clockMinutes(t: string | null | undefined, fallback = 0) {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(t || ''))
  return m ? Number(m[1]) * 60 + Number(m[2]) : fallback
}

export function clockLabel(t: string | null | undefined) {
  const mins = clockMinutes(t)
  return new Date(2000, 0, 1, Math.floor(mins / 60), mins % 60).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }).replace(' ', '')
}

/** "Mon to Fri, 7:00am to 4:00pm" */
export function workSummary(s: Pick<StaffMember, 'work_days' | 'work_start' | 'work_end'>) {
  const days = WEEK_ORDER.filter(d => (s.work_days || []).includes(d))
  let label: string
  if (days.length === 0) label = 'No working days'
  else if (days.length === 7) label = 'Every day'
  else {
    const idx = days.map(d => WEEK_ORDER.indexOf(d))
    const run = idx.every((x, i) => i === 0 || x === idx[i - 1] + 1)
    label = run && days.length > 2 ? `${WEEKDAY_SHORT[days[0]]} to ${WEEKDAY_SHORT[days[days.length - 1]]}` : days.map(d => WEEKDAY_SHORT[d]).join(', ')
  }
  return days.length ? `${label}, ${clockLabel(s.work_start)} to ${clockLabel(s.work_end)}` : label
}

export function isOnLeave(staffId: string, day: Date, timeOff: TimeOff[]) {
  const key = toDateInput(day)
  return timeOff.some(t => t.staff_id === staffId && t.start_date <= key && key <= t.end_date)
}

export type FreeSlot = { start: Date; end: Date; staffId: string }

/**
 * The next free times for a visit of `durationMin` minutes. Only working days and hours count, days off are skipped,
 * and a technician who already has a visit then is not offered. Several technicians free at the same moment give one slot.
 */
export function findFreeSlots(opts: {
  staff: Pick<StaffMember, 'id' | 'work_days' | 'work_start' | 'work_end'>[]
  visits: { staff_id: string | null; start_at: string; end_at: string; status: string }[]
  timeOff: TimeOff[]
  durationMin: number
  from: Date
  days?: number
  limit?: number
  stepMin?: number
}): FreeSlot[] {
  const { staff, visits, timeOff, durationMin, from } = opts
  const days = opts.days ?? 14
  const limit = opts.limit ?? 6
  const step = opts.stepMin ?? 30
  const busy = new Map<string, { s: number; e: number }[]>()
  for (const v of visits) {
    if (!v.staff_id || v.status === 'cancelled') continue
    const list = busy.get(v.staff_id) || []
    list.push({ s: new Date(v.start_at).getTime(), e: new Date(v.end_at).getTime() })
    busy.set(v.staff_id, list)
  }
  const fromMs = from.getTime()
  const found: FreeSlot[] = []
  const seen = new Set<number>()
  for (let d = 0; d < days && found.length < limit; d++) {
    const day = addDays(startOfDay(from), d)
    const weekday = day.getDay()
    const slotsToday: FreeSlot[] = []
    for (const s of staff) {
      if (!(s.work_days || []).includes(weekday) || isOnLeave(s.id, day, timeOff)) continue
      const winStart = clockMinutes(s.work_start, 7 * 60)
      const winEnd = clockMinutes(s.work_end, 16 * 60)
      for (let m = winStart; m + durationMin <= winEnd; m += step) {
        const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(m / 60), m % 60)
        const end = new Date(start.getTime() + durationMin * 60000)
        if (start.getTime() < fromMs) continue
        const clash = (busy.get(s.id) || []).some(b => b.s < end.getTime() && b.e > start.getTime())
        if (!clash) slotsToday.push({ start, end, staffId: s.id })
      }
    }
    slotsToday.sort((a, b) => a.start.getTime() - b.start.getTime())
    for (const slot of slotsToday) {
      if (seen.has(slot.start.getTime())) continue
      seen.add(slot.start.getTime())
      found.push(slot)
      if (found.length >= limit) break
    }
  }
  return found
}
