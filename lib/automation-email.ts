// Turns database rows into the emails the automations send, in the style the business uses (Classic).
// The wording and layout live in lib/email-theme.ts; this file only prepares the facts.
import { getEquipmentLabel } from '@/lib/industry-config'
import {
  buildOverdue,
  buildQuote,
  buildReview,
  buildVisit,
  buildService,
  renderEmail,
  renderText,
  type EmailContent,
  type EmailSender,
  type EmailStyleId,
} from '@/lib/email-theme'
import { daysUntilService, nextServiceDate, parseDateLocal, startOfDay } from '@/lib/service'

/** The look every automation email uses. Change this one value to restyle them all. */
export const EMAIL_STYLE: EmailStyleId = 'classic'

const DAY = 86400000

function clean(v: unknown) {
  return String(v ?? '').trim()
}

/**
 * Emails should not pull a full-size logo (a typical upload is over 1MB). Logos stored in Supabase
 * Storage are served as a small 160px copy instead. SVGs are skipped because mail apps cannot show them.
 */
export function emailLogoUrl(url?: string | null): string | undefined {
  const u = clean(url)
  if (!/^https:\/\//i.test(u) || /\.svg(\?|$)/i.test(u)) return undefined
  const m = u.match(/^(https:\/\/[^/]+\.supabase\.co)\/storage\/v1\/object\/public\/([^?]+)/)
  return m ? `${m[1]}/storage/v1/render/image/public/${m[2]}?width=160&height=160&resize=contain` : u
}

/** Australian numbers read better spaced out: 0434 946 801, 02 9876 5432, 1300 123 456. Anything else is left as typed. */
export function formatPhone(v: unknown) {
  const raw = clean(v)
  const d = raw.replace(/[\s()-]/g, '')
  if (/^04\d{8}$/.test(d) || /^1[38]00\d{6}$/.test(d)) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`
  if (/^0[2378]\d{8}$/.test(d)) return `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}`
  return raw
}

export function senderFrom(b: { name?: string | null; phone?: string | null; email?: string | null; logo_url?: string | null } | null | undefined): EmailSender {
  return { name: clean(b?.name), phone: formatPhone(b?.phone), email: clean(b?.email), logoUrl: emailLogoUrl(b?.logo_url) }
}

function equipment(job: any) {
  return [job?.brand, job?.model].map(clean).filter(Boolean).join(' ') || getEquipmentLabel(job?.equipment_type) || 'system'
}

function lines(items: any): { description: string; qty: number; unit: number }[] {
  return (Array.isArray(items) ? items : []).map(i => ({ description: clean(i?.description), qty: Number(i?.qty) || 0, unit: Number(i?.unit_price) || 0 }))
}

const daysFromToday = (d: Date | null) => (d ? Math.round((d.getTime() - startOfDay(new Date()).getTime()) / DAY) : null)

export function serviceContent(job: any, s: EmailSender): EmailContent {
  return buildService(
    {
      first: clean(job?.customers?.first_name),
      what: equipment(job),
      due: nextServiceDate(job),
      days: daysUntilService(job),
      address: [job?.customers?.address, job?.customers?.suburb].map(clean).filter(Boolean).join(', '),
      location: clean(job?.install_location),
    },
    s
  )
}

export function overdueContent(inv: any, s: EmailSender, settings?: any): EmailContent {
  const due = parseDateLocal(inv?.due_date)
  const late = daysFromToday(due)
  const bank: [string, string][] = [
    ['Bank', clean(settings?.bank_name)],
    ['Account name', clean(settings?.account_name)],
    ['BSB', clean(settings?.bsb)],
    ['Account no.', clean(settings?.account_number)],
  ]
  // Only show a payment box when there are real bank details to put in it
  const payRows: [string, string][] = bank.some(([, v]) => v)
    ? [...bank, ['Reference', clean(inv?.invoice_number)], ['Terms', clean(settings?.payment_terms)]]
    : []
  return buildOverdue(
    {
      first: clean(inv?.customers?.first_name),
      number: clean(inv?.invoice_number),
      issued: parseDateLocal(inv?.created_at),
      due,
      daysLate: late === null ? 0 : Math.max(0, -late),
      lines: lines(inv?.line_items),
      total: Number(inv?.total) || 0,
      paid: Number(inv?.amount_paid) || 0,
      payRows,
    },
    s
  )
}

export function quoteContent(q: any, s: EmailSender): EmailContent {
  const valid = parseDateLocal(q?.valid_until)
  return buildQuote(
    {
      first: clean(q?.customers?.first_name),
      number: clean(q?.quote_number),
      sent: parseDateLocal(q?.created_at),
      validUntil: valid,
      validDays: daysFromToday(valid),
      lines: lines(q?.line_items),
      total: Number(q?.total) || 0,
    },
    s
  )
}

export function reviewContent(job: any, s: EmailSender, url: string): EmailContent {
  return buildReview({ first: clean(job?.customers?.first_name), what: equipment(job), url }, s)
}

export type RenderedEmail = { subject: string; html: string; text: string }

/** Final subject, HTML and plain text, ready to send. */
export function renderAutomation(c: EmailContent, s: EmailSender, style: EmailStyleId = EMAIL_STYLE): RenderedEmail {
  return { subject: c.subject, html: renderEmail(style, c, s), text: renderText(c, s) }
}

/** The reminder for a booked visit. Times are worded in the business's own time zone. */
export function visitContent(v: any, s: EmailSender, timeZone: string): EmailContent {
  const start = new Date(v?.start_at)
  const end = new Date(v?.end_at)
  const fmt = (opts: Intl.DateTimeFormatOptions) => {
    try {
      return new Intl.DateTimeFormat('en-AU', { timeZone, ...opts })
    } catch {
      return new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', ...opts })
    }
  }
  const day = fmt({ weekday: 'short', day: 'numeric', month: 'short' }).format(start).replace(',', '')
  const clock = (d: Date) => fmt({ hour: 'numeric', minute: '2-digit', hour12: true }).format(d).replace(/\s/g, '').toLowerCase()
  const mins = Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000))
  const length = mins < 60 ? `${mins} min` : mins % 60 ? `${Math.floor(mins / 60)} hr ${mins % 60} min` : `${mins / 60} hr`
  const c = v?.customers || {}
  const address = [c.address, c.suburb, c.state, c.postcode].map((x: unknown) => clean(x)).filter(Boolean).join(', ')
  const kinds: Record<string, string> = { service: 'Service', install: 'Installation', repair: 'Repair', quote: 'Quote visit', other: 'Visit' }
  const tech = clean(v?.staff_members?.name).split(/\s+/)[0]
  return buildVisit(
    { first: clean(c.first_name), when: day, time: `${clock(start)} to ${clock(end)}`, length, what: kinds[v?.kind] || 'Visit', equipment: [v?.jobs?.brand, v?.jobs?.model].map(clean).filter(Boolean).join(' ') || undefined, address: address || undefined, tech: tech || undefined },
    s
  )
}
