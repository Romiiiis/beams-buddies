// Money the business spends (materials, fuel, tools...). No imports, so it also runs in Node tests.
// Amounts are stored as paid, GST included. The GST part is stored beside it so costs can be shown without it.

export type ExpenseCategory = 'materials' | 'equipment' | 'subcontractor' | 'fuel' | 'tools' | 'vehicle' | 'other'

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'materials', label: 'Materials' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'tools', label: 'Tools' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'other', label: 'Other' },
]

export const categoryLabel = (c: string) => EXPENSE_CATEGORIES.find(x => x.value === c)?.label || 'Other'

export type Expense = {
  id: string
  business_id: string
  /** yyyy-mm-dd */
  spent_on: string
  description: string
  supplier: string | null
  category: ExpenseCategory
  /** What was paid, GST included */
  amount: number
  /** The GST inside that amount; null when none was charged */
  gst: number | null
  job_id: string | null
  created_at: string
}

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/** The GST inside a price that already includes it. At 10% that is one eleventh of the price. */
export function gstInside(amountIncGst: number, ratePercent = 10) {
  const rate = ratePercent / 100
  return round2((Number(amountIncGst) || 0) * (rate / (1 + rate)))
}

/** What an expense really cost: the amount paid less the GST in it. With no GST recorded, the whole amount counts. */
export function exGst(e: { amount: number | string; gst: number | string | null }) {
  return Math.max(0, round2((Number(e.amount) || 0) - (Number(e.gst) || 0)))
}

/** Reads an amount typed by a person ("$1,200.50", "45") into a number, or null when it is not one. */
export function parseAmount(text: string): number | null {
  const cleaned = String(text ?? '').replace(/[$,\s]/g, '')
  if (cleaned === '' || !/^\d*\.?\d+$|^\d+\.$/.test(cleaned)) return null
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? round2(n) : null
}

/** yyyy-mm-dd for a date, in the computer's own timezone (so "today" is the person's today). */
export function dateKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Start of the Australian financial year (1 July) that a date falls in. */
export function financialYearStart(d: Date) {
  return new Date(d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1, 6, 1)
}

/** Totals for a set of expenses. */
export function sumExpenses(list: { amount: number | string; gst: number | string | null }[]) {
  let amount = 0
  let gst = 0
  for (const e of list) {
    amount += Number(e.amount) || 0
    gst += Number(e.gst) || 0
  }
  return { count: list.length, amount: round2(amount), gst: round2(gst), exGst: round2(amount - gst) }
}
