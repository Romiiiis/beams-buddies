// Works out the dates of a repeating visit. Times are in the browser's own time zone, so a 9:00am visit stays 9:00am
// through daylight saving. Pure functions with no imports, so they also run in plain Node for testing.

export type RepeatRule = {
  unit: 'week' | 'month' | 'year'
  /** Every 1, 2, 3... weeks, months or years. */
  every: number
  /** Week rules: which days (0 = Sunday ... 6 = Saturday). Empty means the weekday of the first visit. */
  weekdays?: number[]
  /** Month rules: the same date each month (15th), or the same weekday (first Friday). */
  monthMode?: 'date' | 'weekday'
  ends: { type: 'count'; count: number } | { type: 'date'; date: string }
}

/** No run is longer than this many visits, or three years, whichever comes first. */
export const MAX_VISITS = 156
const MAX_YEARS = 3

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const ORDINAL = ['first', 'second', 'third', 'fourth']

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()

export function parseYmd(s: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null
}

/** The n-th (1 to 4) or last (-1) given weekday of a month, as a date at midnight. */
export function nthWeekday(year: number, month: number, weekday: number, n: number) {
  if (n === -1) {
    const last = new Date(year, month, daysInMonth(year, month))
    return addDays(last, -((last.getDay() - weekday + 7) % 7))
  }
  const first = new Date(year, month, 1)
  return addDays(first, ((weekday - first.getDay() + 7) % 7) + (n - 1) * 7)
}

/**
 * The start times of every visit in the run. The first is the first matching day on or after `first`.
 * `truncated` is true when the rule asked for more than the limits allow.
 */
export function expandRule(rule: RepeatRule, first: Date): { dates: Date[]; truncated: boolean } {
  const h = first.getHours()
  const mi = first.getMinutes()
  const startDay = startOfDay(first)
  const limitDay = new Date(startDay.getFullYear() + MAX_YEARS, startDay.getMonth(), startDay.getDate())
  const endDay = rule.ends.type === 'date' ? parseYmd(rule.ends.date) : null
  const wanted = rule.ends.type === 'count' ? Math.max(1, Math.floor(rule.ends.count) || 1) : MAX_VISITS
  const maxCount = Math.min(wanted, MAX_VISITS)
  const every = Math.max(1, Math.floor(rule.every) || 1)
  const out: Date[] = []
  let truncated = rule.ends.type === 'count' && wanted > MAX_VISITS

  // Returns false when the run is over
  function add(day: Date) {
    if (day < startDay) return true
    if (endDay && day > endDay) return false
    if (day > limitDay) {
      truncated = true
      return false
    }
    if (out.length >= maxCount) {
      if (rule.ends.type === 'date') truncated = true
      return false
    }
    out.push(new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, mi, 0, 0))
    return out.length < maxCount || rule.ends.type === 'date'
  }

  if (rule.unit === 'week') {
    const days = (rule.weekdays && rule.weekdays.length ? [...rule.weekdays] : [first.getDay()]).sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
    const monday = addDays(startDay, -((startDay.getDay() + 6) % 7))
    outer: for (let w = 0; w < 1000; w++) {
      const weekStart = addDays(monday, 7 * every * w)
      if (weekStart > limitDay) {
        truncated = true
        break
      }
      for (const wd of days) {
        if (!add(addDays(weekStart, (wd + 6) % 7))) break outer
      }
    }
  } else if (rule.unit === 'month') {
    const weekdayMode = rule.monthMode === 'weekday'
    const n = Math.ceil(first.getDate() / 7)
    for (let k = 0; k < 1000; k++) {
      const ym = new Date(first.getFullYear(), first.getMonth() + every * k, 1)
      const day = weekdayMode
        ? nthWeekday(ym.getFullYear(), ym.getMonth(), first.getDay(), n >= 5 ? -1 : n)
        : new Date(ym.getFullYear(), ym.getMonth(), Math.min(first.getDate(), daysInMonth(ym.getFullYear(), ym.getMonth())))
      if (!add(day)) break
    }
  } else {
    for (let k = 0; k < 100; k++) {
      const y = first.getFullYear() + every * k
      if (!add(new Date(y, first.getMonth(), Math.min(first.getDate(), daysInMonth(y, first.getMonth()))))) break
    }
  }
  return { dates: out, truncated }
}

const ordinalDay = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/** "Every 2 weeks on Mon and Wed, 12 visits" */
export function describeRule(rule: RepeatRule, first?: Date) {
  const every = Math.max(1, Math.floor(rule.every) || 1)
  const unitWord = rule.unit === 'week' ? 'week' : rule.unit === 'month' ? 'month' : 'year'
  let text = every === 1 ? `Every ${unitWord}` : `Every ${every} ${unitWord}s`
  if (rule.unit === 'week') {
    const days = rule.weekdays && rule.weekdays.length ? [...rule.weekdays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)) : first ? [first.getDay()] : []
    if (days.length) text += ` on ${days.map(d => WEEKDAYS[d]).join(days.length > 2 ? ', ' : ' and ')}`
  } else if (rule.unit === 'month' && first) {
    if (rule.monthMode === 'weekday') {
      const n = Math.ceil(first.getDate() / 7)
      text += ` on the ${n >= 5 ? 'last' : ORDINAL[n - 1]} ${WEEKDAYS[first.getDay()]}`
    } else {
      text += ` on the ${ordinalDay(first.getDate())}`
    }
  } else if (rule.unit === 'year' && first) {
    text += ` on ${first.getDate()} ${MONTHS[first.getMonth()]}`
  }
  if (rule.ends.type === 'count') text += `, ${rule.ends.count} visit${rule.ends.count === 1 ? '' : 's'}`
  else {
    const d = parseYmd(rule.ends.date)
    if (d) text += `, until ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  }
  return text
}
