// Builds a standard calendar file (.ics) for one technician, so their jobs can show in the phone's Calendar app.
// No imports on purpose: it also runs in plain Node for testing.

export type FeedVisit = {
  id: string
  title: string
  kind: string
  status: string
  start_at: string
  end_at: string
  notes: string | null
  customer_name: string | null
  customer_phone: string | null
  address: string | null
}

export type Feed = {
  staff: { name: string }
  business: { name: string; phone: string | null }
  visits: FeedVisit[]
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 20261112T090000Z */
function stamp(iso: string) {
  const d = new Date(iso)
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

/** Text values must escape backslashes, semicolons, commas and line breaks. */
const BACKSLASH = String.fromCharCode(92)

function esc(s: string) {
  return s
    .split(BACKSLASH).join(BACKSLASH + BACKSLASH)
    .split(';').join(BACKSLASH + ';')
    .split(',').join(BACKSLASH + ',')
    .replace(/\r?\n/g, BACKSLASH + 'n')
}

/** Lines are limited to 75 bytes; longer ones continue on the next line after a space. */
function fold(line: string) {
  const out: string[] = []
  let cur = ''
  let bytes = 0
  for (const ch of line) {
    const b = new TextEncoder().encode(ch).length
    if (bytes + b > 74) {
      out.push(cur)
      cur = ' '
      bytes = 1
    }
    cur += ch
    bytes += b
  }
  out.push(cur)
  return out.join('\r\n')
}

const KIND: Record<string, string> = { service: 'Service', install: 'Installation', repair: 'Repair', quote: 'Quote visit', other: 'Visit' }

export function buildIcs(feed: Feed, now: Date = new Date()): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jobyra//Staff calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(`${feed.staff.name} - ${feed.business.name}`)}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
  ]

  for (const v of feed.visits) {
    const who = v.customer_name || ''
    const summary = who ? `${v.title} - ${who}` : v.title
    const desc: string[] = [KIND[v.kind] || 'Visit']
    if (who) desc.push(`Customer: ${who}`)
    if (v.customer_phone) desc.push(`Phone: ${v.customer_phone}`)
    if (v.address) desc.push(`Address: ${v.address}`)
    if (v.notes) desc.push(`Notes: ${v.notes}`)
    if (v.status === 'completed') desc.push('Status: Completed')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${v.id}@jobyra.app`,
      `DTSTAMP:${stamp(now.toISOString())}`,
      `DTSTART:${stamp(v.start_at)}`,
      `DTEND:${stamp(v.end_at)}`,
      `SUMMARY:${esc(summary)}`,
      ...(v.address ? [`LOCATION:${esc(v.address)}`] : []),
      `DESCRIPTION:${esc(desc.join('\n'))}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    )
  }

  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}
