// When each automation fires. Shared by the daily sender and the Marketing page so the
// "will send to N customers" counts always match what really goes out.
import { daysUntilService, parseDateLocal, startOfDay } from '@/lib/service'

export type AutomationKind = 'service' | 'overdue' | 'quote' | 'review'

export const AUTOMATION_DEFAULT_DAYS: Record<AutomationKind, number> = { service: 14, overdue: 1, quote: 3, review: 2 }

export const AUTOMATION_DAY_OPTIONS: Record<AutomationKind, number[]> = {
  service: [7, 14, 30, 45, 60],
  overdue: [1, 3, 7, 14],
  quote: [2, 3, 5, 7, 10],
  review: [1, 2, 3, 7, 14],
}

/** The sentence that finishes "Sends ..." once the number of days is chosen. */
export const AUTOMATION_WHEN: Record<AutomationKind, { before: string; after: string }> = {
  service: { before: '', after: 'days before a service is due' },
  overdue: { before: '', after: 'days after an invoice is overdue' },
  quote: { before: '', after: 'days after a quote is sent' },
  review: { before: '', after: 'days after the install date' },
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
