// Month-by-month totals for the little charts on the stat cards, worked out from rows a page has already loaded
// (no extra queries). The result runs oldest to newest and ends with the current month.

export function monthlyTrend<T>(rows: T[], dateOf: (row: T) => string | null | undefined, valueOf: (row: T) => number = () => 1, months = 6): number[] {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1).getTime()
  const out = new Array<number>(months).fill(0)
  for (const r of rows) {
    const raw = dateOf(r)
    if (!raw) continue
    const d = new Date(raw)
    if (isNaN(d.getTime()) || d.getTime() < first) continue
    const idx = (d.getFullYear() - new Date(first).getFullYear()) * 12 + d.getMonth() - new Date(first).getMonth()
    if (idx >= 0 && idx < months) out[idx] += Number(valueOf(r)) || 0
  }
  return out
}
