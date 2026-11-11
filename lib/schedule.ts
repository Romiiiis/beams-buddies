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
}

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
  customers?: { first_name?: string | null; last_name?: string | null; phone?: string | null; address?: string | null; suburb?: string | null; state?: string | null; postcode?: string | null } | null
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
