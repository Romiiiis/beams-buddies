// Free times a customer can book themselves. Works in the business's own time zone (the server runs in UTC),
// only offers working days and hours, skips days off, and never double-books a technician.

export type SlotStaff = { id: string; work_days: number[] | null; work_start: string | null; work_end: string | null }
export type SlotTimeOff = { staff_id: string; start_date: string; end_date: string }
export type SlotVisit = { staff_id: string | null; start_at: string; end_at: string; status: string }
export type Slot = { startMs: number; endMs: number; staffId: string | null }

/** How far a time zone is ahead of UTC at a moment, in milliseconds. */
export function tzOffsetMs(at: Date, tz: string): number {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const p: Record<string, string> = {}
  for (const x of f.formatToParts(at)) p[x.type] = x.value
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(at.getTime() / 1000) * 1000
}

/** The moment that is `minutes` after midnight on a calendar day in that time zone. */
export function zonedDate(y: number, m: number, d: number, minutes: number, tz: string): Date {
  const guess = Date.UTC(y, m, d, Math.floor(minutes / 60), minutes % 60)
  let t = guess - tzOffsetMs(new Date(guess), tz)
  t = guess - tzOffsetMs(new Date(t), tz)
  return new Date(t)
}

export function safeZone(tz?: string | null) {
  try {
    new Intl.DateTimeFormat('en-AU', { timeZone: tz || 'Australia/Sydney' })
    return tz || 'Australia/Sydney'
  } catch {
    return 'Australia/Sydney'
  }
}

const clock = (t: string | null | undefined, fallback: number) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(t || ''))
  return m ? +m[1] * 60 + +m[2] : fallback
}

const pad = (n: number) => String(n).padStart(2, '0')

export function computeSlots(o: {
  tz: string
  now: Date
  staff: SlotStaff[]
  timeOff: SlotTimeOff[]
  visits: SlotVisit[]
  durationMin: number
  days?: number
  minNoticeHours?: number
  stepMin?: number
}): Slot[] {
  const { tz, now, durationMin } = o
  const days = o.days ?? 14
  const step = o.stepMin ?? 60
  const earliest = now.getTime() + (o.minNoticeHours ?? 12) * 3600000
  const live = o.visits.filter(v => v.status !== 'cancelled').map(v => ({ staff: v.staff_id, s: new Date(v.start_at).getTime(), e: new Date(v.end_at).getTime() }))
  // Today's date in the business's time zone
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now).split('-').map(Number)
  const resources: SlotStaff[] = o.staff.length ? o.staff : [{ id: '', work_days: [1, 2, 3, 4, 5], work_start: '07:00', work_end: '16:00' }]
  // For every start time: who is free, and how many visits at that time have no technician yet
  const found = new Map<number, { endMs: number; free: string[]; unassigned: number }>()
  for (let i = 0; i < days; i++) {
    const day = new Date(Date.UTC(f[0], f[1] - 1, f[2] + i))
    const y = day.getUTCFullYear(), m = day.getUTCMonth(), d = day.getUTCDate()
    const ymd = `${y}-${pad(m + 1)}-${pad(d)}`
    const weekday = day.getUTCDay()
    for (const r of resources) {
      if (!(r.work_days || []).includes(weekday)) continue
      if (r.id && o.timeOff.some(t => t.staff_id === r.id && t.start_date <= ymd && ymd <= t.end_date)) continue
      const winStart = clock(r.work_start, 7 * 60)
      const winEnd = clock(r.work_end, 16 * 60)
      for (let mins = winStart; mins + durationMin <= winEnd; mins += step) {
        const start = zonedDate(y, m, d, mins, tz)
        const end = new Date(start.getTime() + durationMin * 60000)
        if (start.getTime() < earliest) continue
        const clash = live.filter(v => v.s < end.getTime() && v.e > start.getTime())
        // With no team, any visit at all blocks the time
        if (r.id ? clash.some(v => v.staff === r.id) : clash.length > 0) continue
        const key = start.getTime()
        const entry = found.get(key) || { endMs: end.getTime(), free: [], unassigned: r.id ? clash.filter(v => !v.staff).length : 0 }
        entry.free.push(r.id)
        found.set(key, entry)
      }
    }
  }
  // Visits with no technician each use up one of the people who are free then
  return [...found.entries()]
    .filter(([, e]) => e.free.length > e.unassigned)
    .sort((a, b) => a[0] - b[0])
    .map(([startMs, e]) => ({ startMs, endMs: e.endMs, staffId: e.free[0] || null }))
}
