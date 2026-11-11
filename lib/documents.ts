// Shared maths and helpers for quotes and invoices.

export type LineItem = { description: string; qty: number; unit_price: number; /** Quotes only: an extra the customer can choose. */ optional?: boolean }

const r2 = (n: number) => Math.round(n * 100) / 100

export const lineTotal = (i: { qty: number; unit_price: number }) => (Number(i.qty) || 0) * (Number(i.unit_price) || 0)

/** GST rate typed into a form. Empty or invalid means the standard 10%; a typed 0 stays 0 (GST-free work). */
export function parseRate(v: string | number | null | undefined) {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : 10
}

/**
 * Totals for the items that make up the price. Optional extras are left out unless their position is in `chosen`
 * (the customer ticked them). Rounded to the cent so stored totals never carry floating-point crumbs.
 */
export function calcTotals(items: LineItem[], taxRate: number, chosen: number[] = []) {
  const subtotal = r2(items.reduce((s, it, idx) => (!it.optional || chosen.includes(idx) ? s + lineTotal(it) : s), 0))
  const tax_amount = r2(subtotal * (taxRate / 100))
  return { subtotal, tax_amount, total: r2(subtotal + tax_amount) }
}

/** What the optional extras add up to before GST. */
export const optionalExtras = (items: LineItem[]) => r2(items.filter(i => i.optional).reduce((s, i) => s + lineTotal(i), 0))

/** Items that become invoice lines: everything that is not optional, plus the extras the customer chose. */
export function acceptedItems(items: LineItem[], chosen: number[] = []) {
  return items
    .map((it, idx) => ({ it, idx }))
    .filter(({ it, idx }) => !it.optional || chosen.includes(idx))
    .map(({ it }) => ({ description: it.description, qty: it.qty, unit_price: it.unit_price }))
}

/** Highest existing number plus one, so deleting a document never causes a repeated number. */
export function nextNumber(existing: (string | null | undefined)[], prefix: string) {
  let max = 0
  for (const n of existing) {
    const m = String(n || '').match(/(\d+)\s*$/)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`
}

/** yyyy-mm-dd in the browser's own time zone, `days` from `from`. */
export function dateInDays(days: number, from: Date = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** A yyyy-mm-dd string as a local date (no time-zone shift). */
export function localDate(v?: string | null) {
  if (!v) return null
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null
}

export function shortDate(v?: string | null) {
  const d = v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? localDate(v) : v ? new Date(v) : null
  return d && !isNaN(d.getTime()) ? d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

export const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'card', label: 'Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
] as const

export const methodLabel = (v: string) => PAYMENT_METHODS.find(m => m.value === v)?.label || 'Other'

export type PriceItem = { id: string; name: string; description: string | null; kind: 'service' | 'product'; unit_price: number; unit_cost: number | null; active: boolean }
