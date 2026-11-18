// Turns database rows into the emails the automations send, in the style the business uses (Classic).
// The wording and layout live in lib/email-theme.ts; this file only prepares the facts.
import { getEquipmentLabel } from '@/lib/industry-config'
import {
  buildOverdue,
  buildInvoice,
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
export const EMAIL_STYLE: EmailStyleId = 'split'

const DAY = 86400000
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://jobyra.app').replace(/\/$/, '')

export function publicQuoteUrl(token: unknown): string | undefined {
  const value = clean(token)
  return UUID.test(value) ? `${siteUrl()}/quote/${value}` : undefined
}

export function publicInvoiceUrl(token: unknown): string | undefined {
  const value = clean(token)
  return UUID.test(value) ? `${siteUrl()}/invoice/${value}` : undefined
}

function clean(v: unknown) {
  return String(v ?? '').trim()
}

/** The logo address for emails. SVGs are skipped because mail apps cannot show them. */
export function emailLogoUrl(url?: string | null): string | undefined {
  const u = clean(url)
  if (!/^https:\/\//i.test(u) || /\.svg(\?|$)/i.test(u)) return undefined
  // The logo is used as uploaded. (Supabase's image-resizing endpoint is not enabled on this project and answers 403,
  // which showed up as a broken image in emails.) The email sets the display height, so a big file just scales down.
  return u
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

export function serviceContent(job: any, s: EmailSender, bookUrl?: string): EmailContent {
  return buildService(
    {
      first: clean(job?.customers?.first_name),
      what: equipment(job),
      due: nextServiceDate(job),
      days: daysUntilService(job),
      // The property the unit is at, or the customer's own address
      address: [(job?.customer_sites || job?.customers)?.address, (job?.customer_sites || job?.customers)?.suburb].map(clean).filter(Boolean).join(', '),
      location: clean(job?.install_location),
      bookUrl,
    },
    s
  )
}

export function overdueContent(inv: any, s: EmailSender, settings?: any, invoiceUrl?: string): EmailContent {
  const due = parseDateLocal(inv?.due_date)
  const late = daysFromToday(due)
  const bank: [string, string][] = [
    ['Bank', clean(settings?.bank_name)],
    ['Account name', clean(settings?.account_name)],
    ['BSB', clean(settings?.bsb)],
    ['Account no.', clean(settings?.account_number)],
  ]
  // Only show a payment box when there are real bank details to put in it
  const cardOnly = settings?.payment_mode === 'card'
  const payRows: [string, string][] = bank.some(([, v]) => v) && !cardOnly
    ? [...bank, ['Reference', clean(inv?.invoice_number)], ['Terms', clean(settings?.payment_terms)]]
    : []
  const owingNow = Math.max(0, (Number(inv?.total) || 0) - (Number(inv?.amount_paid) || 0))
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
      invoiceUrl,
      payNow: !!invoiceUrl && owingNow > 0 && settings?.payment_mode !== 'off',
    },
    s
  )
}

export function quoteContent(q: any, s: EmailSender, quoteUrl?: string): EmailContent {
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
      quoteUrl,
    },
    s
  )
}

/** The shared Classic invoice template used for the in-app preview and email send. */
export function invoiceContent(inv: any, s: EmailSender, settings?: any, invoiceUrl?: string): EmailContent {
  const bank: [string, string][] = [
    ['Bank', clean(settings?.bank_name)],
    ['Account name', clean(settings?.account_name)],
    ['BSB', clean(settings?.bsb)],
    ['Account no.', clean(settings?.account_number)],
    ['Reference', clean(inv?.invoice_number)],
    ['Terms', clean(settings?.payment_terms)],
  ]
  const hasBankDetails = bank.slice(0, 4).some(([, value]) => value) && settings?.payment_mode !== 'card'
  const owingNow = Math.max(0, (Number(inv?.total) || 0) - (Number(inv?.amount_paid) || 0))
  const notes = [inv?.notes, settings?.invoice_notes]
    .map(value => clean(value))
    .filter(Boolean)
    .flatMap(value => value.split(/\r?\n/).map(line => line.trim()).filter(Boolean))
  return buildInvoice({
    first: clean(inv?.customers?.first_name),
    number: clean(inv?.invoice_number),
    due: parseDateLocal(inv?.due_date),
    lines: lines(inv?.line_items),
    subtotal: Number(inv?.subtotal) || 0,
    taxRate: Number(inv?.tax_rate) || 0,
    tax: Number(inv?.tax_amount) || 0,
    total: Number(inv?.total) || 0,
    paid: Number(inv?.amount_paid) || 0,
    payRows: hasBankDetails ? bank.filter(([, value]) => value) : [],
    notes,
    invoiceUrl,
    payNow: !!invoiceUrl && owingNow > 0 && settings?.payment_mode !== 'off',
  }, s)
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
  const place = v?.customer_sites && [v.customer_sites.address, v.customer_sites.suburb, v.customer_sites.state, v.customer_sites.postcode].some(Boolean) ? v.customer_sites : c
  const address = [place.address, place.suburb, place.state, place.postcode].map((x: unknown) => clean(x)).filter(Boolean).join(', ')
  const kinds: Record<string, string> = { service: 'Service', install: 'Installation', repair: 'Repair', quote: 'Quote visit', other: 'Visit' }
  const tech = clean(v?.staff_members?.name).split(/\s+/)[0]
  return buildVisit(
    { first: clean(c.first_name), when: day, time: `${clock(start)} to ${clock(end)}`, length, what: kinds[v?.kind] || 'Visit', equipment: [v?.jobs?.brand, v?.jobs?.model].map(clean).filter(Boolean).join(' ') || undefined, address: address || undefined, tech: tech || undefined },
    s
  )
}
