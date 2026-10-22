// One place that decides when a job is next due and whether it is overdue, due soon or on track.
// Every page (Jobs, Customers, Schedule, Dashboard) uses these so the numbers always agree.

export type ServiceBucket = 'overdue' | 'due_soon' | 'on_track' | 'none'

export const SERVICE_LABEL: Record<ServiceBucket, string> = {
  overdue: 'Overdue',
  due_soon: 'Due soon',
  on_track: 'On track',
  none: 'No date',
}

/** Days ahead that count as "due soon". */
export const DUE_SOON_DAYS = 30

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** Parse "YYYY-MM-DD" (or an ISO timestamp) as a local calendar date, so timezones can't shift it a day. */
export function parseDateLocal(value?: string | null): Date | null {
  if (!value) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value))
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : startOfDay(d)
}

export function toYMD(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** The database's next_service_date wins (it moves forward after a service is logged). Falls back to install date + interval. */
export function nextServiceDate(job: any): Date | null {
  const stored = parseDateLocal(job?.next_service_date)
  if (stored) return stored
  const install = parseDateLocal(job?.install_date)
  if (!install) return null
  const months = Number(job?.service_interval_months)
  if (!months) return null
  const d = new Date(install)
  d.setMonth(d.getMonth() + months)
  return d
}

export function daysUntilService(job: any): number | null {
  const next = nextServiceDate(job)
  if (!next) return null
  return Math.round((next.getTime() - startOfDay(new Date()).getTime()) / 86400000)
}

export function bucketForDays(days: number | null): ServiceBucket {
  if (days === null) return 'none'
  if (days < 0) return 'overdue'
  if (days <= DUE_SOON_DAYS) return 'due_soon'
  return 'on_track'
}

export function serviceBucket(job: any): ServiceBucket {
  return bucketForDays(daysUntilService(job))
}

/** Worst bucket across a customer's jobs: overdue beats due soon beats on track. */
export function worstBucket(jobs: any[] | null | undefined): ServiceBucket {
  const order: ServiceBucket[] = ['overdue', 'due_soon', 'on_track', 'none']
  let best: ServiceBucket = 'none'
  for (const j of jobs || []) {
    const b = serviceBucket(j)
    if (order.indexOf(b) < order.indexOf(best)) best = b
  }
  return best
}

/** The job with the soonest service date (including overdue ones). */
export function soonestJob(jobs: any[] | null | undefined): any | null {
  let best: any = null
  let bestTime = Infinity
  for (const j of jobs || []) {
    const d = nextServiceDate(j)
    if (d && d.getTime() < bestTime) {
      best = j
      bestTime = d.getTime()
    }
  }
  return best
}

export function formatDate(d: Date | null, withYear = true) {
  if (!d) return '—'
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) })
}

/** Plain-English timing, e.g. "437 days overdue" / "Due in 12 days" / "Due today". */
export function timingText(job: any): { headline: string; sub: string; bucket: ServiceBucket } {
  const days = daysUntilService(job)
  const next = nextServiceDate(job)
  const bucket = bucketForDays(days)
  if (days === null || !next) return { headline: 'No date set', sub: '', bucket }
  const plural = (n: number) => `${n} day${n === 1 ? '' : 's'}`
  if (days < 0) return { headline: `${plural(Math.abs(days))} overdue`, sub: `Was due ${formatDate(next, false)}`, bucket }
  if (days === 0) return { headline: 'Due today', sub: formatDate(next), bucket }
  return { headline: `Due in ${plural(days)}`, sub: formatDate(next), bucket }
}
