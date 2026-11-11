// When each automation fires. Shared by the daily sender and the Marketing page so the
// "will send to N customers" counts always match what really goes out.
import { daysUntilService, parseDateLocal, startOfDay } from '@/lib/service'

export type AutomationKind = 'service' | 'overdue' | 'quote' | 'review' | 'visit'

export const AUTOMATION_DEFAULT_DAYS: Record<AutomationKind, number> = { service: 14, overdue: 1, quote: 3, review: 2, visit: 1 }

export const AUTOMATION_DAY_OPTIONS: Record<AutomationKind, number[]> = {
  service: [7, 14, 30, 45, 60],
  overdue: [1, 3, 7, 14],
  quote: [2, 3, 5, 7, 10],
  review: [1, 2, 3, 7, 14],
  visit: [1, 2, 3],
}

/** The sentence that finishes "Sends ..." once the number of days is chosen. */
export const AUTOMATION_WHEN: Record<AutomationKind, { before: string; after: string }> = {
  service: { before: '', after: 'days before a service is due' },
  overdue: { before: '', after: 'days after an invoice is overdue' },
  quote: { before: '', after: 'days after a quote is sent' },
  review: { before: '', after: 'days after the install date' },
  visit: { before: '', after: 'days before a booked visit' },
}

export function dayWord(n: number) {
  return `${n} day${n === 1 ? '' : 's'}`
}

export function describeWhen(kind: AutomationKind, days: number) {
  return `${dayWord(days)} ${AUTOMATION_WHEN[kind].after.replace(/^days /, '')}`
}

function daysSince(iso?: string | null) {
  const d = parseDateLocal(iso)
  return d ? Math.round((startOfDay(new Date()).getTime() - d.getTime()) / 86400000) : null
}

/** Service: inside the chosen window, or up to 30 days overdue (older ones are left for you to chase). */
export function serviceDue(job: any, days: number) {
  const d = daysUntilService(job)
  return d !== null && d <= days && d >= -30
}

/** Overdue invoice: unpaid, and at least `days` past due (for up to 30 days after that). */
export function overdueDue(inv: any, days: number) {
  const late = daysSince(inv.due_date)
  const owing = Number(inv.total || 0) - Number(inv.amount_paid || 0)
  return (inv.status === 'sent' || inv.status === 'overdue') && owing > 0 && late !== null && late >= days && late <= days + 30
}

/** Quote follow-up: sent, still unanswered, `days` after it was created. */
export function quoteDue(q: any, days: number) {
  const age = daysSince(q.created_at)
  return q.status === 'sent' && age !== null && age >= days && age <= days + 11
}

/** Review request: `days` after the install date. */
export function reviewDue(job: any, days: number) {
  const since = daysSince(job.install_date)
  return since !== null && since >= days && since <= days + 12
}

/**
 * Visit reminder: a scheduled visit that has not started yet and is at most `days` days away, counted in the
 * business's own calendar days (`today` is that business's today at midnight). Visits booked at short notice are
 * reminded straight away; a visit that is moved gets a fresh reminder for its new time.
 */
export function visitDue(visit: { status: string; start_at: string }, days: number, today: Date, now: Date = new Date(), localDate?: (iso: string) => Date) {
  if (visit.status !== 'scheduled') return false
  if (new Date(visit.start_at).getTime() <= now.getTime()) return false
  const day = localDate ? localDate(visit.start_at) : startOfDay(new Date(visit.start_at))
  const away = Math.round((day.getTime() - today.getTime()) / 86400000)
  return away >= 0 && away <= days
}
