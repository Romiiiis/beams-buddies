// The numbers behind the Reports page: which dates a period covers, how it is cut into points for the chart, the four
// figures at the top of each view, the rankings, and who owes money. No imports, so it also runs in plain Node tests.
//
// Money here is what the page has always shown: invoice and quote totals with GST included.

export type ReportView = 'revenue' | 'jobs' | 'quotes' | 'services'
export type Period = '1m' | '3m' | '6m' | '12m' | 'all'
export type RevenueMetric = 'invoiced' | 'collected' | 'outstanding' | 'overdue'

export const VIEWS: { value: ReportView; label: string }[] = [
  { value: 'revenue', label: 'Revenue' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'quotes', label: 'Quotes' },
  { value: 'services', label: 'Services' },
]

export const PERIODS: { value: Period; label: string; words: string }[] = [
  { value: '1m', label: '1 month', words: 'last 30 days' },
  { value: '3m', label: '3 months', words: 'last 3 months' },
  { value: '6m', label: '6 months', words: 'last 6 months' },
  { value: '12m', label: '12 months', words: 'last 12 months' },
  { value: 'all', label: 'All time', words: 'all time' },
]

export const METRICS: { value: RevenueMetric; label: string }[] = [
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'collected', label: 'Collected' },
  { value: 'outstanding', label: 'Outstanding' },
  { value: 'overdue', label: 'Overdue' },
]

export type RInvoice = {
  id: string
  created_at: string
  status: string
  total: number | string
  amount_paid?: number | string | null
  customer_id?: string | null
  due_date?: string | null
  invoice_number?: string | null
}
export type RQuote = { id: string; created_at: string; status: string; total: number | string; customer_id?: string | null }
export type RJob = { id: string; created_at: string; next_service_date?: string | null; brand?: string | null; customer_id?: string | null }
export type RCustomer = { id: string; created_at: string; suburb?: string | null; first_name?: string | null; last_name?: string | null }
export type RLine = { description?: string | null; qty?: number | string | null; unit_price?: number | string | null }

export type ReportData = { invoices: RInvoice[]; quotes: RQuote[]; jobs: RJob[]; customers: RCustomer[] }

const DAY = 86_400_000
const num = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)

/** A stored date ("2026-11-12" or a full timestamp) as milliseconds. A plain date is read as that local day. */
export function toTime(v: string | null | undefined): number | null {
  if (!v) return null
  const s = String(v)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  const t = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime() : new Date(s).getTime()
  return Number.isFinite(t) ? t : null
}

const within = (iso: string | null | undefined, from: number, to: number) => {
  const t = toTime(iso)
  return t !== null && t >= from && t < to
}

export const formatMoney = (n: number) => '$' + Math.round(n).toLocaleString('en-AU')

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Periods and chart points
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** `end` is the start of tomorrow, so everything up to the end of today counts. */
export type Window = { start: Date; end: Date; prevStart: Date | null; prevEnd: Date | null }

export function periodWindow(period: Period, now: Date, earliest?: Date | null): Window {
  const end = addDays(startOfDay(now), 1)
  if (period === '1m') {
    const start = addDays(end, -30)
    return { start, end, prevStart: addDays(start, -30), prevEnd: start }
  }
  if (period === 'all') {
    const from = earliest && earliest.getTime() < end.getTime() ? earliest : now
    return { start: new Date(from.getFullYear(), from.getMonth(), 1), end, prevStart: null, prevEnd: null }
  }
  const months = period === '3m' ? 3 : period === '6m' ? 6 : 12
  const start = addMonths(now, -(months - 1))
  return { start, end, prevStart: addMonths(now, -(2 * months - 1)), prevEnd: start }
}

export type Bucket = { start: Date; end: Date; label: string; tip: string }

const dayLabel = (d: Date) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })

/** One point per day for a month, per week for three months, per calendar month beyond that. */
export function makeBuckets(period: Period, win: Window): Bucket[] {
  const out: Bucket[] = []
  const endMs = win.end.getTime()
  if (period === '1m') {
    for (let d = win.start; d.getTime() < endMs; d = addDays(d, 1)) {
      out.push({ start: d, end: addDays(d, 1), label: dayLabel(d), tip: d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }) })
    }
  } else if (period === '3m') {
    for (let d = win.start; d.getTime() < endMs; d = addDays(d, 7)) {
      const e = addDays(d, 7)
      out.push({ start: d, end: e.getTime() > endMs ? win.end : e, label: dayLabel(d), tip: `Week of ${dayLabel(d)}` })
    }
  } else {
    const spanMonths = (win.end.getFullYear() - win.start.getFullYear()) * 12 + (win.end.getMonth() - win.start.getMonth())
    const withYear = spanMonths > 11
    for (let d = win.start; d.getTime() < endMs; d = addMonths(d, 1)) {
      const next = addMonths(d, 1)
      out.push({
        start: d,
        end: next.getTime() > endMs ? win.end : next,
        label: d.toLocaleDateString('en-AU', withYear ? { month: 'short', year: '2-digit' } : { month: 'short' }),
        tip: d.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' }),
      })
    }
  }
  return out
}

export type SeriesPoint = { label: string; tip: string; total: number; count: number }

/** Adds each row's value to the point whose dates hold it. A point includes its start day and leaves out its end. */
export function sumInto<T>(rows: T[], buckets: Bucket[], dateOf: (r: T) => string | null | undefined, valueOf: (r: T) => number): SeriesPoint[] {
  const totals = buckets.map(() => 0)
  const counts = buckets.map(() => 0)
  const starts = buckets.map(b => b.start.getTime())
  const ends = buckets.map(b => b.end.getTime())
  for (const r of rows) {
    const t = toTime(dateOf(r))
    if (t === null) continue
    for (let i = 0; i < buckets.length; i++) {
      if (t >= starts[i] && t < ends[i]) {
        totals[i] += valueOf(r)
        counts[i] += 1
        break
      }
    }
  }
  return buckets.map((b, i) => ({ label: b.label, tip: b.tip, total: round2(totals[i]), count: counts[i] }))
}

/** The oldest date in the data, so "All time" starts where the business does. */
export function earliestDate(d: ReportData): Date | null {
  let min = Infinity
  const take = (iso?: string | null) => {
    const t = toTime(iso)
    if (t !== null && t < min) min = t
  }
  d.invoices.forEach(r => take(r.created_at))
  d.quotes.forEach(r => take(r.created_at))
  d.jobs.forEach(r => take(r.created_at))
  d.customers.forEach(r => take(r.created_at))
  return Number.isFinite(min) ? new Date(min) : null
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Invoices
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** Drafts are not sent yet and cancelled invoices were withdrawn, so neither counts as invoiced. */
export const isInvoiced = (i: RInvoice) => i.status === 'sent' || i.status === 'paid' || i.status === 'overdue'
export const owing = (i: RInvoice) => Math.max(0, num(i.total) - num(i.amount_paid))

/** Unpaid and past its due date (a "sent" invoice becomes overdue the day after it is due). */
export function isOverdue(i: RInvoice, now: Date) {
  if (i.status === 'overdue') return true
  if (i.status !== 'sent') return false
  const due = toTime(i.due_date)
  return due !== null && due < startOfDay(now).getTime()
}

export function metricInvoices(metric: RevenueMetric, list: RInvoice[], now: Date): RInvoice[] {
  switch (metric) {
    case 'invoiced':
      return list.filter(isInvoiced)
    case 'collected':
      return list.filter(i => i.status === 'paid')
    case 'outstanding':
      return list.filter(i => (i.status === 'sent' || i.status === 'overdue') && owing(i) > 0)
    case 'overdue':
      return list.filter(i => isOverdue(i, now) && owing(i) > 0)
  }
}

/** What an invoice adds to a figure: its whole total for invoiced and collected, what is still owed for the rest. */
export const metricValue = (metric: RevenueMetric, i: RInvoice) => (metric === 'invoiced' || metric === 'collected' ? num(i.total) : owing(i))

// ─────────────────────────────────────────────────────────────────────────────────────────────
// The four figures at the top
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type Cell = { label: string; value: string; sub?: string; delta?: string; up?: boolean }

/** "+12%" or "-5%", or nothing when there is no earlier figure to compare with. */
export function pctChange(current: number, previous: number | null): string | undefined {
  if (previous === null || !(previous > 0)) return undefined
  const p = Math.round(((current - previous) / previous) * 100)
  return `${p > 0 ? '+' : ''}${p}%`
}

const countBetween = <T,>(rows: T[], dateOf: (r: T) => string | null | undefined, s: Date | null, e: Date | null) => (s && e ? rows.filter(r => within(dateOf(r), s.getTime(), e.getTime())).length : null)

export function stripFor(view: ReportView, data: ReportData, win: Window, words: string, now: Date): Cell[] {
  const s = win.start
  const e = win.end
  const ps = win.prevStart
  const pe = win.prevEnd
  const today = startOfDay(now).getTime()

  if (view === 'revenue') {
    const figures = (from: Date, to: Date) => {
      const list = data.invoices.filter(i => within(i.created_at, from.getTime(), to.getTime()))
      const sum = (m: RevenueMetric) => metricInvoices(m, list, now).reduce((a, i) => a + metricValue(m, i), 0)
      return { collected: sum('collected'), outstanding: sum('outstanding'), overdue: sum('overdue'), invoiced: sum('invoiced') }
    }
    const cur = figures(s, e)
    const prev = ps && pe ? figures(ps, pe) : null
    return [
      { label: 'Collected', value: formatMoney(cur.collected), sub: `paid, ${words}`, delta: pctChange(cur.collected, prev ? prev.collected : null) },
      { label: 'Outstanding', value: formatMoney(cur.outstanding), sub: 'still to be paid', delta: pctChange(cur.outstanding, prev ? prev.outstanding : null) },
      { label: 'Overdue', value: formatMoney(cur.overdue), sub: 'past the due date', delta: pctChange(cur.overdue, prev ? prev.overdue : null) },
      { label: 'Invoiced', value: formatMoney(cur.invoiced), sub: words, delta: pctChange(cur.invoiced, prev ? prev.invoiced : null) },
    ]
  }

  if (view === 'jobs') {
    const jobs = data.jobs.filter(j => within(j.created_at, s.getTime(), e.getTime())).length
    const customers = data.customers.filter(c => within(c.created_at, s.getTime(), e.getTime())).length
    const dueSoon = data.jobs.filter(j => {
      const t = toTime(j.next_service_date)
      return t !== null && t >= today && t <= today + 30 * DAY
    }).length
    const overdue = data.jobs.filter(j => {
      const t = toTime(j.next_service_date)
      return t !== null && t < today
    }).length
    return [
      { label: 'Jobs added', value: String(jobs), sub: words, delta: pctChange(jobs, countBetween(data.jobs, j => j.created_at, ps, pe)) },
      { label: 'New customers', value: String(customers), sub: words, delta: pctChange(customers, countBetween(data.customers, c => c.created_at, ps, pe)) },
      { label: 'Services due soon', value: String(dueSoon), sub: 'next 30 days' },
      { label: 'Services overdue', value: String(overdue), sub: 'service date has passed' },
    ]
  }

  if (view === 'quotes') {
    const inRange = data.quotes.filter(q => within(q.created_at, s.getTime(), e.getTime()))
    const accepted = inRange.filter(q => q.status === 'accepted')
    const acceptedValue = accepted.reduce((a, q) => a + num(q.total), 0)
    const prevQuotes = countBetween(data.quotes, q => q.created_at, ps, pe)
    const rate = inRange.length > 0 ? Math.round((accepted.length / inRange.length) * 100) : 0
    return [
      { label: 'Quotes', value: String(inRange.length), sub: words, delta: pctChange(inRange.length, prevQuotes) },
      { label: 'Accepted', value: String(accepted.length), sub: 'of those quotes' },
      { label: 'Acceptance rate', value: `${rate}%`, sub: 'accepted of all quotes' },
      { label: 'Accepted value', value: formatMoney(acceptedValue), sub: words },
    ]
  }

  const withDate = data.jobs.filter(j => toTime(j.next_service_date) !== null)
  const dueSoon = withDate.filter(j => {
    const t = toTime(j.next_service_date) as number
    return t >= today && t <= today + 30 * DAY
  }).length
  const overdue = withDate.filter(j => (toTime(j.next_service_date) as number) < today).length
  const inPeriod = withDate.filter(j => within(j.next_service_date, s.getTime(), e.getTime())).length
  return [
    { label: 'Services overdue', value: String(overdue), sub: 'service date has passed' },
    { label: 'Services due soon', value: String(dueSoon), sub: 'next 30 days' },
    { label: 'Due in this period', value: String(inPeriod), sub: words, delta: pctChange(inPeriod, countBetween(withDate, j => j.next_service_date, ps, pe)) },
    { label: 'Equipment tracked', value: String(withDate.length), sub: 'with a service date' },
  ]
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// The chart
// ─────────────────────────────────────────────────────────────────────────────────────────────

export function seriesFor(view: ReportView, metric: RevenueMetric, data: ReportData, buckets: Bucket[], now: Date): SeriesPoint[] {
  if (view === 'revenue') return sumInto(metricInvoices(metric, data.invoices, now), buckets, i => i.created_at, i => metricValue(metric, i))
  if (view === 'jobs') return sumInto(data.jobs, buckets, j => j.created_at, () => 1)
  if (view === 'quotes') return sumInto(data.quotes, buckets, q => q.created_at, q => num(q.total))
  return sumInto(data.jobs.filter(j => toTime(j.next_service_date) !== null), buckets, j => j.next_service_date, () => 1)
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Rankings: top suburbs and top products
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type Ranked = { name: string; value: number }

export type Rankings = {
  suburbs: Ranked[]
  /** null while the line items are still loading */
  products: Ranked[] | null
  /** Amounts of money (invoices, quotes) or plain counts (jobs, services) */
  money: boolean
  productsKind: 'items' | 'brands'
}

const clean = (s: unknown) => String(s ?? '').replace(/\s+/g, ' ').trim()

function topN(map: Map<string, { name: string; value: number }>, limit: number): Ranked[] {
  return [...map.values()]
    .filter(r => r.value > 0)
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(r => ({ name: r.name, value: round2(r.value) }))
}

function add(map: Map<string, { name: string; value: number }>, rawName: string, value: number) {
  const name = clean(rawName) || 'Unknown'
  const key = name.toLowerCase()
  const cur = map.get(key)
  if (cur) cur.value += value
  else map.set(key, { name, value })
}

/** Spreads a document's amount over its lines in proportion to what each line is worth. */
function spread(map: Map<string, { name: string; value: number }>, lines: RLine[] | undefined, amount: number) {
  if (!lines || lines.length === 0 || !(amount > 0)) return
  const worth = lines.map(l => Math.max(0, num(l.qty) * num(l.unit_price)))
  const sum = worth.reduce((a, b) => a + b, 0)
  lines.forEach((l, i) => {
    const share = sum > 0 ? worth[i] / sum : 1 / lines.length
    add(map, clean(l.description) || 'Other items', amount * share)
  })
}

export function rankingsFor(view: ReportView, metric: RevenueMetric, data: ReportData, win: Window, now: Date, lines: Record<string, RLine[]> | null, limit = 5): Rankings {
  const s = win.start.getTime()
  const e = win.end.getTime()
  const suburbOf = new Map(data.customers.map(c => [c.id, clean(c.suburb) || 'Unknown']))
  const suburb = (id?: string | null) => (id && suburbOf.get(id)) || 'Unknown'
  const suburbs = new Map<string, { name: string; value: number }>()
  const products = new Map<string, { name: string; value: number }>()

  if (view === 'revenue') {
    const list = metricInvoices(metric, data.invoices.filter(i => within(i.created_at, s, e)), now)
    for (const i of list) {
      const v = metricValue(metric, i)
      add(suburbs, suburb(i.customer_id), v)
      if (lines) spread(products, lines[i.id], v)
    }
    return { suburbs: topN(suburbs, limit), products: lines ? topN(products, limit) : null, money: true, productsKind: 'items' }
  }

  if (view === 'quotes') {
    const list = data.quotes.filter(q => within(q.created_at, s, e))
    for (const q of list) {
      const v = num(q.total)
      add(suburbs, suburb(q.customer_id), v)
      if (lines) spread(products, lines[q.id], v)
    }
    return { suburbs: topN(suburbs, limit), products: lines ? topN(products, limit) : null, money: true, productsKind: 'items' }
  }

  const list = view === 'jobs' ? data.jobs.filter(j => within(j.created_at, s, e)) : data.jobs.filter(j => within(j.next_service_date, s, e))
  for (const j of list) {
    add(suburbs, suburb(j.customer_id), 1)
    add(products, clean(j.brand) || 'Unknown', 1)
  }
  return { suburbs: topN(suburbs, limit), products: topN(products, limit), money: false, productsKind: 'brands' }
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Who owes you
// ─────────────────────────────────────────────────────────────────────────────────────────────

export const AGE_LABELS = ['Not due yet', '1-30 days late', '31-60 days late', '61+ days late'] as const

export type OwingRow = { customerId: string | null; name: string; invoices: number; buckets: [number, number, number, number]; total: number }

/** Which column an unpaid invoice falls in, by how many days past its due date it is. No due date counts as not due yet. */
export function ageBucket(i: RInvoice, now: Date): 0 | 1 | 2 | 3 {
  const due = toTime(i.due_date)
  const late = due === null ? 0 : Math.floor((startOfDay(now).getTime() - due) / DAY)
  if (late <= 0) return i.status === 'overdue' ? 1 : 0
  if (late <= 30) return 1
  if (late <= 60) return 2
  return 3
}

export function agedReceivables(invoices: RInvoice[], nameOf: (id: string | null | undefined) => string, now: Date): { rows: OwingRow[]; totals: [number, number, number, number]; total: number } {
  const byCustomer = new Map<string, OwingRow>()
  const totals: [number, number, number, number] = [0, 0, 0, 0]
  for (const i of invoices) {
    if ((i.status !== 'sent' && i.status !== 'overdue') || owing(i) <= 0) continue
    const key = i.customer_id || 'none'
    let row = byCustomer.get(key)
    if (!row) {
      row = { customerId: i.customer_id || null, name: nameOf(i.customer_id) || 'Unknown customer', invoices: 0, buckets: [0, 0, 0, 0], total: 0 }
      byCustomer.set(key, row)
    }
    const b = ageBucket(i, now)
    const v = owing(i)
    row.buckets[b] += v
    row.total += v
    row.invoices += 1
    totals[b] += v
  }
  const rows = [...byCustomer.values()]
    .map(r => ({ ...r, buckets: r.buckets.map(round2) as OwingRow['buckets'], total: round2(r.total) }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
  return { rows, totals: totals.map(round2) as typeof totals, total: round2(totals.reduce((a, b) => a + b, 0)) }
}
