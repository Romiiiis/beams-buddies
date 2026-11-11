// Works out whether a job made money: what was billed, less what it cost. No imports, so it also runs in Node tests.
//
// Everything is counted without GST: GST charged to customers is passed on to the tax office, and GST paid on costs
// is claimed back, so neither is the business's money.

import { exGst, round2 } from './expenses'

type InvoiceLike = { subtotal: number | string | null; status: string }
type ExpenseLike = { amount: number | string; gst: number | string | null }
type VisitLike = { start_at: string; end_at: string; status: string; staff_id: string | null }

/** Invoices that count as money billed. Drafts are not sent yet and cancelled ones were withdrawn. */
export const BILLED_STATUSES = ['sent', 'paid', 'overdue']

export type JobCosting = {
  /** Billed to the customer, GST not included */
  income: number
  /** Materials and other costs recorded against the job, GST not included */
  expenses: number
  /** Time of finished visits, valued at each technician's cost per hour */
  labour: number
  /** Hours of finished visits */
  hours: number
  /** Hours done by someone with no cost per hour set, so they are not valued */
  unvaluedHours: number
  cost: number
  profit: number
  /** Profit as a share of what was billed; null before anything is billed */
  margin: number | null
}

export const hoursBetween = (startIso: string, endIso: string) => {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime()
  return Number.isFinite(ms) && ms > 0 ? ms / 3_600_000 : 0
}

export function jobCosting(opts: {
  invoices: InvoiceLike[]
  expenses: ExpenseLike[]
  visits: VisitLike[]
  /** Cost of one hour for each technician, by their id */
  hourlyCost: Map<string, number> | Record<string, number>
}): JobCosting {
  const rate = (id: string | null) => {
    if (!id) return undefined
    const r = opts.hourlyCost instanceof Map ? opts.hourlyCost.get(id) : opts.hourlyCost[id]
    return typeof r === 'number' && r > 0 ? r : undefined
  }

  const income = round2(opts.invoices.filter(i => BILLED_STATUSES.includes(i.status)).reduce((s, i) => s + (Number(i.subtotal) || 0), 0))
  const expenses = round2(opts.expenses.reduce((s, e) => s + exGst(e), 0))

  let labour = 0
  let hours = 0
  let unvaluedHours = 0
  for (const v of opts.visits) {
    if (v.status !== 'completed') continue
    const h = hoursBetween(v.start_at, v.end_at)
    hours += h
    const r = rate(v.staff_id)
    if (r === undefined) unvaluedHours += h
    else labour += h * r
  }
  labour = round2(labour)

  const cost = round2(expenses + labour)
  const profit = round2(income - cost)
  return { income, expenses, labour, hours: round2(hours), unvaluedHours: round2(unvaluedHours), cost, profit, margin: income > 0 ? Math.round((profit / income) * 1000) / 10 : null }
}
