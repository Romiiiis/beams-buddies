// Email templates for the automations.
//
// One content model per email (service reminder, overdue invoice, quote follow-up, review request)
// and five visual styles that render it. Email-safe HTML: tables and inline styles only, system
// fonts, so it holds up in Gmail, Outlook and phone mail apps.
// This file has no imports on purpose, so it also runs in plain Node for previews and tests.

export type EmailKind = 'service' | 'overdue' | 'quote' | 'review' | 'visit'
/** Every kind of message the app can send. The two after 'visit' are one-off messages about a booked visit. */
export type MailKind = EmailKind | 'on_the_way' | 'moved'
export type EmailStyleId = 'classic' | 'banner' | 'letter' | 'summary' | 'bold'
export type Tone = 'neutral' | 'good' | 'warn' | 'danger'

export type EmailSender = { name: string; phone?: string; email?: string; logoUrl?: string }

export type EmailContent = {
  kind: MailKind
  subject: string
  /** Grey preview line next to the subject in the inbox. */
  preheader: string
  /** Small label above the headline, e.g. "Service reminder". */
  label: string
  headline: string
  greeting: string
  /** Paragraphs before the key details. */
  paragraphs: string[]
  /** The one thing that matters most: a date, an amount, a star rating. */
  highlight?: { label: string; value: string; sub?: string; chip?: { text: string; tone: Tone }; stars?: boolean }
  facts?: [string, string][]
  items?: { description: string; detail: string; amount: string }[]
  totals?: { label: string; value: string; strong?: boolean }[]
  pay?: { title: string; rows: [string, string][] }
  /** Paragraphs after the key details. */
  closing: string[]
  button?: { text: string; href: string }
  signoff: string
  /** Replaces the usual "you are a customer of ..." line at the bottom (for emails that are not to customers). */
  footer?: string
}

export const EMAIL_STYLES: { id: EmailStyleId; name: string; blurb: string }[] = [
  { id: 'classic', name: 'Classic', blurb: 'A clean white card with a teal top edge. Familiar and easy to scan.' },
  { id: 'banner', name: 'Letterhead', blurb: 'A teal brand band across the top with your logo, details below.' },
  { id: 'letter', name: 'Personal note', blurb: 'No card and no chrome. Reads like a short email written by you.' },
  { id: 'summary', name: 'Summary', blurb: 'One big number up front: the amount or the date that matters.' },
  { id: 'bold', name: 'Bold', blurb: 'A dark header with a large headline and a full-width action.' },
]

// ---------------------------------------------------------------------------------------------
// Look and feel
// ---------------------------------------------------------------------------------------------

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"

const C = {
  teal: '#2AA198',
  tealDark: '#1F857C',
  tealDeep: '#17706A',
  tealLight: '#EBFAF7',
  tealMid: '#BFEDE7',
  ink: '#0B1220',
  text: '#334155',
  muted: '#64748B',
  line: '#E8EDF2',
  card: '#E3E8EE',
  page: '#F4F6F8',
  panel: '#F8FAFC',
  white: '#FFFFFF',
  amber: '#F5A524',
}

const DOT: Record<Tone, string> = { neutral: '#94A3B8', good: '#2AA198', warn: '#2AA198', danger: '#D64545' }

const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: '#F1F5F9', fg: '#475569' },
  good: { bg: '#EBFAF7', fg: '#1F857C' },
  warn: { bg: '#FEF3C7', fg: '#92400E' },
  danger: { bg: '#FEE2E2', fg: '#B91C1C' },
}

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/** Escapes text and keeps reference numbers such as INV-0012 from breaking across two lines. */
const rich = (s: unknown) => esc(s).replace(/\b([A-Z]{1,4}-\d{2,6})\b/g, '<span style="white-space:nowrap;">$1</span>')

/** Inline text style: size, line height, weight, colour. */
const T = (size: number, lh: number, weight: number, color: string, extra = '') =>
  `font-family:${FONT};font-size:${size}px;line-height:${lh}px;font-weight:${weight};color:${color};${extra}`

const CAPS = 'text-transform:uppercase;letter-spacing:0.08em;'

// ---------------------------------------------------------------------------------------------
// Small helpers the builders and the adapters share
// ---------------------------------------------------------------------------------------------

export function money(n: unknown) {
  return '$' + Number(n || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function dateMid(d: Date | null | undefined) {
  return d ? d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).replace(',', '') : ''
}

export function dateShort(d: Date | null | undefined) {
  return d ? d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

const plural = (n: number, word = 'day') => `${n} ${word}${n === 1 ? '' : 's'}`

function firstName(v: unknown) {
  const f = String(v ?? '').trim()
  return f ? f.charAt(0).toUpperCase() + f.slice(1) : 'there'
}

function replyHref(s: EmailSender, subject: string) {
  if (s.email && s.email.trim()) return `mailto:${s.email.trim()}?subject=${encodeURIComponent(subject)}`
  if (s.phone && s.phone.trim()) return `tel:${s.phone.replace(/[^\d+]/g, '')}`
  return undefined
}

// ---------------------------------------------------------------------------------------------
// Builders: turn clean inputs into an EmailContent
// ---------------------------------------------------------------------------------------------

export type ServiceInput = {
  first: string
  what: string
  due: Date | null
  /** Days until the service is due (negative when overdue). */
  days: number | null
  address?: string
  location?: string
  /** Link to the page where the customer picks a time. Without it the button opens a reply email. */
  bookUrl?: string
}

export function buildService(i: ServiceInput, s: EmailSender): EmailContent {
  const first = firstName(i.first)
  const biz = s.name || 'our team'
  const overdue = i.days !== null && i.days < 0
  const due = dateMid(i.due)
  const chip: { text: string; tone: Tone } | undefined =
    i.days === null
      ? undefined
      : overdue
        ? { text: `${plural(-i.days)} overdue`, tone: 'danger' }
        : i.days === 0
          ? { text: 'Due today', tone: 'warn' }
          : { text: `In ${plural(i.days)}`, tone: i.days <= 7 ? 'warn' : 'good' }
  const facts: [string, string][] = [['Equipment', i.what]]
  if (i.address) facts.push(['Address', i.address])
  if (i.location) facts.push(['Location', i.location])
  const callUs = s.phone ? ` or call us on ${s.phone}` : ''
  const bookHref = i.bookUrl || replyHref(s, `Service booking${i.first ? ` - ${i.first}` : ''}`)
  return {
    kind: 'service',
    subject: overdue
      ? `Service reminder: your ${i.what} is overdue | ${biz}`
      : `Service reminder: your ${i.what}${i.due ? ` is due ${dateShort(i.due)}` : ' is due soon'} | ${biz}`,
    preheader: overdue
      ? `Your ${i.what} is overdue for its regular service. Reply to book a time.`
      : `Your ${i.what} is due for its regular service${i.due ? ` on ${dateShort(i.due)}` : ''}. Reply to book a time.`,
    label: 'Service reminder',
    headline: overdue ? `Hi ${first}, your ${i.what} is overdue for a service` : `Hi ${first}, your ${i.what} is due for a service`,
    greeting: `Hi ${first},`,
    paragraphs: [
      overdue
        ? `This is a friendly reminder from ${biz} that your ${i.what} is now overdue for its regular service.`
        : `This is a friendly reminder from ${biz} that your ${i.what} is due for its regular service.`,
    ],
    highlight: i.due ? { label: overdue ? 'Service was due' : 'Service due', value: due, chip } : undefined,
    facts,
    closing: [
      i.bookUrl
        ? `Regular servicing keeps everything running efficiently and helps avoid unexpected breakdowns. Tap the button below to choose a time that suits you. You can also reply to this email${callUs}.`
        : `Regular servicing keeps everything running efficiently and helps avoid unexpected breakdowns. To book a time, simply reply to this email${callUs}.`,
    ],
    button: bookHref ? { text: i.bookUrl ? 'Choose a time' : 'Book my service', href: bookHref } : undefined,
    signoff: 'Kind regards,',
  }
}

export type LineInput = { description: string; qty: number; unit: number }

export type OverdueInput = {
  first: string
  number: string
  issued: Date | null
  due: Date | null
  /** Whole days past the due date. */
  daysLate: number
  lines: LineInput[]
  total: number
  paid: number
  /** Bank details, already labelled. Leave empty when there are none. */
  payRows: [string, string][]
}

/** "Split system service" or "Split system service and 2 more". */
function summarise(lines: LineInput[]) {
  const first = String(lines[0]?.description || '').trim()
  if (!first) return ''
  return lines.length > 1 ? `${first} and ${lines.length - 1} more` : first
}

export function buildOverdue(i: OverdueInput, s: EmailSender): EmailContent {
  const first = firstName(i.first)
  const biz = s.name || 'us'
  const owing = Math.max(0, Number(i.total) - Number(i.paid || 0))
  const callUs = s.phone ? ` or call us on ${s.phone}` : ''
  const what = summarise(i.lines)
  const facts: [string, string][] = [['Invoice', i.number]]
  if (what) facts.push(['For', what])
  if (i.issued) facts.push(['Issued', dateShort(i.issued)])
  if (i.due) facts.push(['Due', dateShort(i.due)])
  const payRows = i.payRows.filter(([, v]) => v)
  const href = replyHref(s, `Invoice ${i.number}`)
  return {
    kind: 'overdue',
    subject: `Invoice ${i.number} is overdue | ${biz}`,
    preheader: `${money(owing)} was due ${dateShort(i.due)}. Payment details are inside.`,
    label: 'Payment reminder',
    headline: `Hi ${first}, invoice ${i.number} is overdue`,
    greeting: `Hi ${first},`,
    paragraphs: [`A friendly reminder that invoice ${i.number} has passed its due date. If you have already paid, thank you, and please ignore this message.`],
    highlight: {
      label: 'Amount due',
      value: money(owing),
      sub: i.due ? `Was due ${dateMid(i.due)}` : undefined,
      chip: { text: i.daysLate > 0 ? `${plural(i.daysLate)} overdue` : 'Overdue', tone: 'danger' },
    },
    facts,
    pay: payRows.length ? { title: 'How to pay', rows: payRows } : undefined,
    closing: [`Questions about this invoice? Just reply to this email${callUs} and we will sort it out.`],
    button: href ? { text: 'Reply about this invoice', href } : undefined,
    signoff: 'Thank you,',
  }
}

export type QuoteInput = {
  first: string
  number: string
  sent: Date | null
  validUntil: Date | null
  /** Whole days until the quote expires (negative when expired). */
  validDays: number | null
  lines: LineInput[]
  total: number
}

export function buildQuote(i: QuoteInput, s: EmailSender): EmailContent {
  const first = firstName(i.first)
  const biz = s.name || 'us'
  const callUs = s.phone ? ` or call us on ${s.phone}` : ''
  const chip: { text: string; tone: Tone } | undefined =
    i.validDays === null ? undefined : i.validDays < 0 ? { text: 'Expired', tone: 'neutral' } : i.validDays <= 7 ? { text: `${plural(i.validDays)} left`, tone: 'warn' } : { text: `Valid for ${plural(i.validDays)}`, tone: 'good' }
  const what = summarise(i.lines)
  const facts: [string, string][] = [['Quote', i.number]]
  if (what) facts.push(['For', what])
  if (i.sent) facts.push(['Sent', dateShort(i.sent)])
  if (i.validUntil) facts.push(['Valid until', dateShort(i.validUntil)])
  const href = replyHref(s, `Quote ${i.number}`)
  return {
    kind: 'quote',
    subject: `Following up on quote ${i.number} | ${biz}`,
    preheader: `Quote ${i.number} for ${money(i.total)}. Happy to answer any questions.`,
    label: 'Quote follow-up',
    headline: `Hi ${first}, any questions about your quote?`,
    greeting: `Hi ${first},`,
    paragraphs: [`Thanks again for the opportunity to quote. We sent quote ${i.number} recently and wanted to check in. Happy to answer any questions, adjust anything, or book a time that suits you.`],
    highlight: {
      label: 'Quote total',
      value: money(i.total),
      sub: i.validUntil ? `Valid until ${dateMid(i.validUntil)}` : undefined,
      chip,
    },
    facts,
    closing: [`If everything looks good, just reply to this email${callUs} and we will lock in a date.`],
    button: href ? { text: 'Reply to this quote', href } : undefined,
    signoff: 'Kind regards,',
  }
}

export type ReviewInput = { first: string; what: string; url: string }

export function buildReview(i: ReviewInput, s: EmailSender): EmailContent {
  const first = firstName(i.first)
  const biz = s.name || 'us'
  return {
    kind: 'review',
    subject: `How did we do, ${first}? | ${biz}`,
    preheader: 'A quick review helps other customers find a team they can trust.',
    label: 'Thank you',
    headline: `Thanks for choosing ${biz}, ${first}`,
    greeting: `Hi ${first},`,
    paragraphs: [`Thank you for choosing ${biz}${i.what ? ` for your ${i.what}` : ''}. We hope everything is working exactly as it should.`],
    highlight: { label: 'How did we do?', value: '★★★★★', sub: 'It only takes a minute', stars: true },
    closing: [
      'If you were happy with the work, a quick review helps other customers find a team they can trust. If anything was not right, just reply to this email and we will make it right.',
    ],
    button: i.url ? { text: 'Leave a review', href: i.url } : undefined,
    signoff: 'Kind regards,',
  }
}

// ---------------------------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------------------------

function chip(text: string, tone: Tone, onDark = false) {
  const t = TONES[tone]
  return `<span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${onDark ? '#FFFFFF' : t.bg};${T(12, 16, 700, t.fg, 'white-space:nowrap;')}">${esc(text)}</span>`
}

function isImage(u?: string) {
  return !!u && /^(https?:\/\/|data:image\/)/i.test(u)
}

/** Logo if there is one, otherwise the business name. */
function brand(s: EmailSender, o: { h: number; size: number; color: string; tile?: boolean; align?: 'left' | 'center' }) {
  if (isImage(s.logoUrl)) {
    const img = `<img src="${esc(s.logoUrl)}" alt="${esc(s.name)}" height="${o.h}" style="display:block;height:${o.h}px;width:auto;max-width:200px;border:0;outline:none;text-decoration:none;${o.align === 'center' ? 'margin:0 auto;' : ''}">`
    if (o.tile) {
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:12px;padding:4px 6px;">${img}</td></tr></table>`
    }
    return img
  }
  return `<span style="${T(o.size, o.size + 6, 800, o.color, 'letter-spacing:-0.01em;')}">${esc(s.name || 'Your business')}</span>`
}

function button(href: string, text: string, o: { bg: string; fg?: string; radius?: number; size?: number; pad?: string; full?: boolean; arrow?: boolean }) {
  const fg = o.fg || '#FFFFFF'
  const r = o.radius ?? 10
  const a = `<a href="${esc(href)}" target="_blank" style="display:${o.full ? 'block' : 'inline-block'};padding:${o.pad || '15px 22px'};${T(o.size ?? 15, 20, 700, fg, `text-decoration:none;border-radius:${r}px;${o.full ? 'text-align:center;' : ''}`)}">${esc(text)}${o.arrow ? ' &rarr;' : ''}</a>`
  if (o.full) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="${o.bg}" style="background:${o.bg};border-radius:${r}px;">${a}</td></tr></table>`
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${o.bg}" style="background:${o.bg};border-radius:${r}px;">${a}</td></tr></table>`
}

/** Label and value rows. `stacked` puts the label above the value. */
function factsBlock(rows: [string, string][], o: { stacked?: boolean; right?: boolean; line?: string; pad?: number; size?: number } = {}) {
  const line = o.line ?? C.line
  const pad = o.pad ?? 10
  const body = rows
    .map(([k, v]) => {
      const top = `border-top:1px solid ${line};`
      if (o.stacked) {
        return `<tr><td style="padding:${pad}px 0;${top}"><div style="${T(11, 14, 700, C.muted, CAPS)}">${esc(k)}</div><div style="${T(o.size ?? 15, 22, 600, C.ink, 'padding-top:3px;')}">${esc(v)}</div></td></tr>`
      }
      return `<tr><td valign="top" style="padding:${pad}px 12px ${pad}px 0;${top}${T(13, 20, 400, C.muted, 'width:34%;')}">${esc(k)}</td><td valign="top" align="${o.right ? 'right' : 'left'}" style="padding:${pad}px 0;${top}${T(o.size ?? 14, 20, 600, C.ink, o.right ? 'text-align:right;' : '')}">${esc(v)}</td></tr>`
    })
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid ${line};">${body}</table>`
}

function itemsBlock(items: NonNullable<EmailContent['items']>, line = C.line) {
  const rows = items
    .map(
      (it, idx) =>
        `<tr><td valign="top" style="padding:12px 0;${idx === 0 ? '' : `border-top:1px solid ${line};`}"><div style="${T(14, 20, 600, C.ink)}">${esc(it.description)}</div><div style="${T(12, 18, 400, C.muted, 'padding-top:2px;')}">${esc(it.detail)}</div></td><td valign="top" align="right" style="padding:12px 0 12px 14px;${idx === 0 ? '' : `border-top:1px solid ${line};`}${T(14, 20, 700, C.ink, 'white-space:nowrap;text-align:right;')}">${esc(it.amount)}</td></tr>`
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${line};border-bottom:1px solid ${line};">${rows}</table>`
}

function totalsBlock(rows: NonNullable<EmailContent['totals']>, o: { strongColor?: string; line?: string } = {}) {
  const line = o.line ?? C.line
  const body = rows
    .map(r =>
      r.strong
        ? `<tr><td style="padding:12px 0 0 0;border-top:1px solid ${line};${T(15, 22, 800, C.ink)}">${esc(r.label)}</td><td align="right" style="padding:12px 0 0 0;border-top:1px solid ${line};${T(17, 22, 800, o.strongColor || C.ink, 'text-align:right;white-space:nowrap;')}">${esc(r.value)}</td></tr>`
        : `<tr><td style="padding:4px 0;${T(13, 20, 400, C.muted)}">${esc(r.label)}</td><td align="right" style="padding:4px 0;${T(13, 20, 600, C.ink, 'text-align:right;white-space:nowrap;')}">${esc(r.value)}</td></tr>`
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">${body}</table>`
}

function payBlock(pay: NonNullable<EmailContent['pay']>, o: { bg?: string; border?: string; radius?: number } = {}) {
  const rows = pay.rows
    .map(
      ([k, v]) =>
        `<tr><td valign="top" style="padding:4px 12px 4px 0;${T(13, 20, 400, C.muted, 'width:38%;')}">${esc(k)}</td><td valign="top" style="padding:4px 0;${T(14, 20, 700, C.ink, k === 'BSB' || k === 'Account no.' || k === 'Reference' ? `font-family:${MONO};font-size:13px;` : '')}">${esc(v)}</td></tr>`
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${o.bg || C.panel}" style="background:${o.bg || C.panel};border:1px solid ${o.border || C.line};border-radius:${o.radius ?? 12}px;border-collapse:separate;"><tr><td style="padding:16px 18px;"><div style="${T(11, 14, 700, C.muted, CAPS + 'padding-bottom:8px;')}">${esc(pay.title)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table></td></tr></table>`
}

function signature(c: EmailContent, s: EmailSender, o: { align?: 'left' | 'center' } = {}) {
  const contact = [s.phone, s.email].filter(Boolean).map(esc).join(' &middot; ')
  return `<div style="${T(14, 22, 400, C.muted, o.align === 'center' ? 'text-align:center;' : '')}">${esc(c.signoff)}<br><span style="${T(15, 22, 800, C.ink)}">${esc(s.name)}</span>${contact ? `<br>${contact}` : ''}</div>`
}

function footerNote(s: EmailSender, align: 'left' | 'center' = 'left', text?: string) {
  return `<div style="${T(12, 18, 400, '#8A97A8', `text-align:${align};`)}">${esc(text ?? `You are getting this email because you are a customer of ${s.name || 'us'}. If you would rather not receive these, just reply and let us know.`)}</div>`
}

const para = (text: string, o: { size?: number; lh?: number; color?: string; mb?: number; align?: string } = {}) =>
  `<p style="margin:0 0 ${o.mb ?? 14}px 0;${T(o.size ?? 15, o.lh ?? 24, 400, o.color ?? C.text, o.align ? `text-align:${o.align};` : '')}">${rich(text)}</p>`

/** A table row with the shared side padding (shrinks on phones). */
const row = (html: string, pad = '0 28px 18px 28px', extra = '') => `<tr><td class="px" style="padding:${pad};${extra}">${html}</td></tr>`

function shell(c: EmailContent, bg: string, outerPad: string, inner: string) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(c.subject)}</title>
<style>@media only screen and (max-width:480px){.px{padding-left:20px!important;padding-right:20px!important}.outer{padding:14px 8px!important}}</style></head>
<body style="margin:0;padding:0;background:${bg};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">${esc(c.preheader)}${'&nbsp;&zwnj;'.repeat(30)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bg}" style="background:${bg};"><tr><td class="outer" align="center" style="padding:${outerPad};">${inner}</td></tr></table>
</body></html>`
}

function details(c: EmailContent, o: { factsStacked?: boolean; factsRight?: boolean; payBg?: string; strong?: string; pad?: string }, rowFn: (html: string, pad?: string) => string) {
  const out: string[] = []
  const pad = o.pad ?? '0 28px 20px 28px'
  if (c.items && c.items.length) {
    out.push(rowFn(itemsBlock(c.items) + (c.totals ? totalsBlock(c.totals, { strongColor: o.strong }) : ''), pad))
  } else if (c.facts && c.facts.length) {
    out.push(rowFn(factsBlock(c.facts, { stacked: o.factsStacked, right: o.factsRight }), pad))
  }
  if (c.pay) out.push(rowFn(payBlock(c.pay, { bg: o.payBg }), pad))
  return out.join('')
}

// ---------------------------------------------------------------------------------------------
// Style 1: Classic. White card, teal top edge.
// ---------------------------------------------------------------------------------------------

function classic(c: EmailContent, s: EmailSender) {
  const rows: string[] = []
  rows.push(`<tr><td bgcolor="${C.teal}" height="5" style="height:5px;line-height:5px;font-size:0;background:${C.teal};">&nbsp;</td></tr>`)
  rows.push(row(brand(s, { h: 56, size: 17, color: C.ink }), '20px 28px 0 28px'))
  rows.push(
    row(
      `<div style="${T(11, 16, 700, C.tealDark, CAPS + 'padding-bottom:8px;')}">${esc(c.label)}</div><div style="${T(24, 30, 800, C.ink, 'letter-spacing:-0.02em;')}">${rich(c.headline)}</div>`,
      '22px 28px 14px 28px'
    )
  )
  rows.push(row(c.paragraphs.map(p => para(p)).join(''), '0 28px 4px 28px'))
  if (c.highlight) {
    const h = c.highlight
    const tone = h.chip?.tone
    const accent = tone === 'danger' ? '#D64545' : C.teal
    const status = h.chip
      ? `<div style="${T(13, 18, 600, tone === 'danger' ? '#B42318' : C.text, 'padding-top:6px;')}"><span style="font-size:10px;line-height:10px;color:${DOT[h.chip.tone]};">&#9679;</span>&nbsp;&nbsp;${esc(h.chip.text)}</div>`
      : ''
    // A date gets a little calendar tile (month on top, day number below) so it reads at a glance
    const dm = h.stars ? null : /(\d{1,2})\s+([A-Za-z]{3})/.exec(String(h.value))
    if (dm) {
      const tile = `<table role="presentation" width="64" cellpadding="0" cellspacing="0" border="0" style="width:64px;border:1px solid #D5DCE4;border-radius:12px;border-collapse:separate;overflow:hidden;"><tr><td align="center" bgcolor="${accent}" style="background:${accent};padding:5px 0;${T(10, 12, 800, '#FFFFFF', 'letter-spacing:0.1em;text-transform:uppercase;')}">${esc(dm[2])}</td></tr><tr><td align="center" bgcolor="#FFFFFF" style="background:#FFFFFF;padding:6px 0 8px;${T(28, 32, 800, C.ink)}">${esc(dm[1])}</td></tr></table>`
      rows.push(
        row(
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle" width="64" style="width:64px;">${tile}</td><td valign="middle" style="padding-left:16px;"><div style="${T(11, 14, 700, C.muted, CAPS + 'padding-bottom:4px;')}">${esc(h.label)}</div><div style="${T(20, 26, 700, C.ink, 'letter-spacing:-0.01em;')}">${esc(h.value)}</div>${h.sub ? `<div style="${T(13, 18, 400, C.muted, 'padding-top:2px;')}">${esc(h.sub)}</div>` : ''}${status}</td></tr></table>`,
          '8px 28px 20px 28px'
        )
      )
    } else {
      const value = h.stars
        ? `<div style="${T(28, 34, 400, C.amber, 'letter-spacing:4px;')}">${esc(h.value)}</div>`
        : `<div style="${T(21, 27, 700, C.ink, 'letter-spacing:-0.01em;')}">${esc(h.value)}</div>`
      rows.push(
        row(
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${accent}" width="4" style="width:4px;background:${accent};font-size:0;line-height:0;">&nbsp;</td><td bgcolor="${C.panel}" style="background:${C.panel};padding:14px 18px;"><div style="${T(11, 14, 700, C.muted, CAPS + 'padding-bottom:5px;')}">${esc(h.label)}</div>${value}${h.sub ? `<div style="${T(13, 18, 400, C.muted, 'padding-top:3px;')}">${esc(h.sub)}</div>` : ''}${status}</td></tr></table>`,
          '10px 28px 20px 28px'
        )
      )
    }
  }
  rows.push(details(c, {}, row))
  rows.push(row(c.closing.map(p => para(p)).join(''), '0 28px 6px 28px'))
  if (c.button) rows.push(row(button(c.button.href, c.button.text, { bg: C.tealDark, full: true, radius: 10 }), '6px 28px 24px 28px'))
  rows.push(row(signature(c, s), '0 28px 28px 28px'))
  const card = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="max-width:560px;background:#FFFFFF;border:1px solid ${C.card};border-radius:14px;border-collapse:separate;overflow:hidden;">${rows.join('')}</table>`
  const foot = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;"><tr><td style="padding:16px 12px 0 12px;">${footerNote(s, 'center', c.footer)}</td></tr></table>`
  return shell(c, C.page, '28px 12px', card + foot)
}

// ---------------------------------------------------------------------------------------------
// Style 2: Letterhead. Teal brand band, details below.
// ---------------------------------------------------------------------------------------------

function banner(c: EmailContent, s: EmailSender) {
  const rows: string[] = []
  rows.push(
    `<tr><td class="px" bgcolor="${C.tealDeep}" style="background:${C.tealDeep};padding:20px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle">${brand(s, { h: 46, size: 18, color: '#FFFFFF', tile: true })}</td><td align="right" valign="middle" style="${T(11, 14, 700, C.tealMid, CAPS + 'text-align:right;')}">${esc(c.label)}</td></tr></table></td></tr>`
  )
  rows.push(row(`<div style="${T(25, 31, 800, C.ink, 'letter-spacing:-0.02em;')}">${rich(c.headline)}</div>`, '30px 28px 12px 28px'))
  rows.push(row(c.paragraphs.map(p => para(p)).join(''), '0 28px 6px 28px'))
  if (c.highlight) {
    const h = c.highlight
    const value = h.stars
      ? `<div style="${T(28, 34, 400, C.amber, 'letter-spacing:4px;')}">${esc(h.value)}</div>`
      : `<div style="${T(22, 28, 800, C.ink, 'letter-spacing:-0.01em;')}">${esc(h.value)}</div>`
    rows.push(
      row(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.tealLight}" style="background:${C.tealLight};border-radius:12px;border-collapse:separate;"><tr><td width="5" bgcolor="${C.tealDark}" style="width:5px;background:${C.tealDark};border-radius:12px 0 0 12px;font-size:0;line-height:0;">&nbsp;</td><td style="padding:16px 18px;"><div style="${T(12, 16, 600, C.tealDark)}">${esc(h.label)}</div>${value}${h.sub ? `<div style="${T(13, 18, 400, C.muted, 'padding-top:2px;')}">${esc(h.sub)}</div>` : ''}</td>${h.chip ? `<td align="right" valign="middle" style="padding:16px 18px 16px 0;">${chip(h.chip.text, h.chip.tone, true)}</td>` : ''}</tr></table>`,
        '10px 28px 22px 28px'
      )
    )
  }
  rows.push(details(c, { payBg: C.panel }, row))
  rows.push(row(c.closing.map(p => para(p)).join(''), '0 28px 6px 28px'))
  if (c.button) rows.push(row(button(c.button.href, c.button.text, { bg: C.tealDark, full: true, radius: 10 }), '6px 28px 26px 28px'))
  rows.push(row(signature(c, s), '0 28px 28px 28px'))
  rows.push(`<tr><td class="px" bgcolor="#F6F8F9" style="background:#F6F8F9;padding:18px 28px;border-top:1px solid ${C.line};">${footerNote(s, 'left', c.footer)}</td></tr>`)
  const card = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="max-width:560px;background:#FFFFFF;border:1px solid #DCE5E5;border-radius:16px;border-collapse:separate;overflow:hidden;">${rows.join('')}</table>`
  return shell(c, '#EAF0F0', '28px 12px', card)
}

// ---------------------------------------------------------------------------------------------
// Style 3: Personal note. No card, reads like a short email.
// ---------------------------------------------------------------------------------------------

function letter(c: EmailContent, s: EmailSender) {
  const rows: string[] = []
  rows.push(
    `<tr><td style="padding:0 0 26px 0;">${brand(s, { h: 52, size: 17, color: C.ink })}<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${C.teal}" width="34" height="3" style="width:34px;height:3px;line-height:3px;font-size:0;background:${C.teal};">&nbsp;</td></tr></table></td></tr>`
  )
  rows.push(`<tr><td style="padding:0 0 12px 0;${T(17, 26, 700, C.ink)}">${esc(c.greeting)}</td></tr>`)
  rows.push(`<tr><td>${c.paragraphs.map(p => para(p, { size: 16, lh: 26, mb: 16 })).join('')}</td></tr>`)
  if (c.highlight) {
    const h = c.highlight
    const value = h.stars
      ? `<span style="${T(26, 32, 400, C.amber, 'letter-spacing:4px;')}">${esc(h.value)}</span>`
      : `<span style="${T(21, 28, 800, C.ink, 'letter-spacing:-0.01em;')}">${esc(h.value)}</span>`
    rows.push(
      `<tr><td style="padding:2px 0 22px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-left:3px solid ${C.teal};padding:2px 0 2px 16px;"><div style="${T(12, 16, 600, C.muted)}">${esc(h.label)}</div><div style="padding-top:2px;">${value}${h.chip ? `&nbsp;&nbsp;${chip(h.chip.text, h.chip.tone)}` : ''}</div>${h.sub ? `<div style="${T(13, 18, 400, C.muted, 'padding-top:3px;')}">${esc(h.sub)}</div>` : ''}</td></tr></table></td></tr>`
    )
  }
  if (c.items && c.items.length) {
    rows.push(`<tr><td style="padding:0 0 22px 0;">${itemsBlock(c.items)}${c.totals ? totalsBlock(c.totals) : ''}</td></tr>`)
  } else if (c.facts && c.facts.length) {
    rows.push(`<tr><td style="padding:0 0 22px 0;">${factsBlock(c.facts, { line: 'transparent', pad: 4 })}</td></tr>`)
  }
  if (c.pay) rows.push(`<tr><td style="padding:0 0 22px 0;">${payBlock(c.pay, { bg: '#FFFFFF', radius: 10 })}</td></tr>`)
  rows.push(`<tr><td>${c.closing.map(p => para(p, { size: 16, lh: 26, mb: 16 })).join('')}</td></tr>`)
  if (c.button) rows.push(`<tr><td style="padding:4px 0 26px 0;">${button(c.button.href, c.button.text, { bg: C.tealDark, radius: 8, pad: '13px 24px' })}</td></tr>`)
  rows.push(`<tr><td style="padding:0 0 26px 0;">${signature(c, s)}</td></tr>`)
  rows.push(`<tr><td style="padding:16px 0 0 0;border-top:1px solid ${C.line};">${footerNote(s, 'left', c.footer)}</td></tr>`)
  const inner = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">${rows.join('')}</table>`
  return shell(c, '#FFFFFF', '34px 20px', inner)
}

// ---------------------------------------------------------------------------------------------
// Style 4: Summary. One big number up front.
// ---------------------------------------------------------------------------------------------

function summary(c: EmailContent, s: EmailSender) {
  const rows: string[] = []
  rows.push(row(`<div style="text-align:center;">${brand(s, { h: 64, size: 18, color: C.ink, align: 'center' })}</div><div style="${T(11, 16, 700, C.muted, CAPS + 'text-align:center;padding-top:10px;')}">${esc(c.label)}</div>`, '28px 28px 4px 28px'))
  rows.push(row(`<div style="${T(21, 28, 800, C.ink, 'text-align:center;letter-spacing:-0.02em;')}">${rich(c.headline)}</div>`, '14px 28px 16px 28px'))
  if (c.highlight) {
    const h = c.highlight
    const size = h.stars ? 34 : h.value.length <= 9 ? 42 : h.value.length <= 12 ? 36 : 28
    const value = h.stars
      ? `<div style="${T(size, size + 6, 400, C.amber, 'letter-spacing:5px;text-align:center;')}">${esc(h.value)}</div>`
      : `<div style="${T(size, size + 6, 800, C.ink, 'letter-spacing:-0.03em;text-align:center;')}">${esc(h.value)}</div>`
    rows.push(
      row(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F3F8F8" style="background:#F3F8F8;border:1px solid #E1EDEC;border-radius:14px;border-collapse:separate;"><tr><td align="center" style="padding:24px 18px;"><div style="${T(12, 16, 700, C.muted, CAPS + 'text-align:center;padding-bottom:6px;')}">${esc(h.label)}</div>${value}${h.sub ? `<div style="${T(14, 20, 400, C.muted, 'text-align:center;padding-top:4px;')}">${esc(h.sub)}</div>` : ''}${h.chip ? `<div style="text-align:center;padding-top:12px;">${chip(h.chip.text, h.chip.tone)}</div>` : ''}</td></tr></table>`,
        '0 28px 22px 28px'
      )
    )
  }
  rows.push(row(c.paragraphs.map(p => para(p)).join(''), '0 28px 6px 28px'))
  rows.push(details(c, { factsRight: true, strong: C.tealDark }, row))
  rows.push(row(c.closing.map(p => para(p)).join(''), '0 28px 6px 28px'))
  if (c.button) rows.push(row(button(c.button.href, c.button.text, { bg: C.tealDark, full: true, radius: 12 }), '6px 28px 24px 28px'))
  rows.push(row(signature(c, s), '0 28px 26px 28px'))
  rows.push(row(footerNote(s, 'center', c.footer), '16px 28px 22px 28px', `border-top:1px solid ${C.line};`))
  const card = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="max-width:560px;background:#FFFFFF;border:1px solid ${C.card};border-radius:18px;border-collapse:separate;overflow:hidden;">${rows.join('')}</table>`
  return shell(c, '#F1F3F5', '28px 12px', card)
}

// ---------------------------------------------------------------------------------------------
// Style 5: Bold. Dark header, large headline, full-width action.
// ---------------------------------------------------------------------------------------------

function bold(c: EmailContent, s: EmailSender) {
  const rows: string[] = []
  rows.push(
    `<tr><td class="px" bgcolor="${C.ink}" style="background:${C.ink};padding:26px 28px 26px 28px;"><div style="padding-bottom:26px;">${brand(s, { h: 46, size: 16, color: '#FFFFFF', tile: true })}</div><div style="${T(11, 16, 700, '#7FE0D4', CAPS + 'padding-bottom:10px;')}">${esc(c.label)}</div><div style="${T(29, 35, 800, '#FFFFFF', 'letter-spacing:-0.03em;')}">${rich(c.headline)}</div></td></tr>`
  )
  if (c.highlight) {
    const h = c.highlight
    const value = h.stars
      ? `<span style="${T(24, 30, 400, '#FFD36B', 'letter-spacing:4px;')}">${esc(h.value)}</span>`
      : `<span style="${T(21, 28, 800, '#FFFFFF', 'letter-spacing:-0.01em;')}">${esc(h.value)}</span>`
    rows.push(
      `<tr><td class="px" bgcolor="${C.tealDark}" style="background:${C.tealDark};padding:16px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle"><div style="${T(11, 15, 700, C.tealMid, CAPS)}">${esc(h.label)}</div><div style="padding-top:3px;">${value}</div>${h.sub ? `<div style="${T(13, 18, 400, C.tealMid, 'padding-top:2px;')}">${esc(h.sub)}</div>` : ''}</td>${h.chip ? `<td align="right" valign="middle">${chip(h.chip.text, h.chip.tone, true)}</td>` : ''}</tr></table></td></tr>`
    )
  }
  rows.push(row(c.paragraphs.map(p => para(p, { size: 16, lh: 26 })).join(''), '26px 28px 6px 28px'))
  rows.push(details(c, { factsStacked: true, payBg: C.panel, strong: C.tealDark }, row))
  rows.push(row(c.closing.map(p => para(p, { size: 16, lh: 26 })).join(''), '0 28px 8px 28px'))
  if (c.button) rows.push(row(button(c.button.href, c.button.text, { bg: C.ink, full: true, radius: 12, size: 16, pad: '17px 22px', arrow: true }), '6px 28px 26px 28px'))
  rows.push(row(signature(c, s), '0 28px 28px 28px'))
  rows.push(`<tr><td class="px" bgcolor="#F6F8F9" style="background:#F6F8F9;padding:18px 28px;border-top:1px solid ${C.line};">${footerNote(s, 'left', c.footer)}</td></tr>`)
  const card = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="max-width:560px;background:#FFFFFF;border-radius:18px;border-collapse:separate;overflow:hidden;">${rows.join('')}</table>`
  return shell(c, '#E6ECEE', '28px 12px', card)
}

// ---------------------------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------------------------

const STYLES: Record<EmailStyleId, (c: EmailContent, s: EmailSender) => string> = { classic, banner, letter, summary, bold }

export function renderEmail(style: EmailStyleId, c: EmailContent, s: EmailSender): string {
  return (STYLES[style] || classic)(c, s)
}

/** Plain-text twin of the email, sent alongside the HTML. */
export function renderText(c: EmailContent, s: EmailSender): string {
  const L: string[] = [c.greeting, '']
  for (const p of c.paragraphs) L.push(p, '')
  if (c.highlight) {
    const h = c.highlight
    L.push(`${h.label}: ${h.stars ? '' : h.value}${h.chip ? ` (${h.chip.text})` : ''}${h.sub ? ` - ${h.sub}` : ''}`.replace(': -', ':').trim(), '')
  }
  if (c.items && c.items.length) {
    for (const it of c.items) L.push(`- ${it.description}: ${it.detail} = ${it.amount}`)
    L.push('')
    for (const t of c.totals || []) L.push(`${t.label}: ${t.value}`)
    L.push('')
  } else if (c.facts && c.facts.length) {
    for (const [k, v] of c.facts) L.push(`${k}: ${v}`)
    L.push('')
  }
  if (c.pay) {
    L.push(c.pay.title)
    for (const [k, v] of c.pay.rows) L.push(`${k}: ${v}`)
    L.push('')
  }
  for (const p of c.closing) L.push(p, '')
  if (c.button && /^https?:/i.test(c.button.href)) L.push(`${c.button.text}: ${c.button.href}`, '')
  L.push(c.signoff, s.name || '')
  if (s.phone) L.push(s.phone)
  if (s.email) L.push(s.email)
  L.push('', c.footer ?? `You are getting this email because you are a customer of ${s.name || 'us'}. If you would rather not receive these, just reply and let us know.`)
  // \r\n keeps Outlook and Windows Mail from joining lines
  return L.join('\r\n')
}

/** Example content with realistic details, used for previews before any real data exists. */
export type VisitInput = {
  first: string
  /** The day, already worded in the business's own time, e.g. "Tue 17 Nov". */
  when: string
  /** The time, e.g. "9:00am to 10:00am". */
  time: string
  /** How long it takes, e.g. "1 hr". */
  length?: string
  /** "Service", "Repair"... */
  what: string
  equipment?: string
  address?: string
  /** The technician's first name. */
  tech?: string
}

/** Reminder that a visit is booked. The internal notes for the technician are never included. */
export function buildVisit(i: VisitInput, s: EmailSender): EmailContent {
  const first = firstName(i.first)
  const biz = s.name || 'our team'
  const callUs = s.phone ? ` or call us on ${s.phone}` : ''
  const start = i.time.split(' to ')[0]
  const facts: [string, string][] = [['Visit', i.what]]
  if (i.equipment) facts.push(['Equipment', i.equipment])
  if (i.address) facts.push(['Address', i.address])
  if (i.tech) facts.push(['Technician', i.tech])
  const href = replyHref(s, `Change my booking${i.first ? ` - ${i.first}` : ''}`)
  return {
    kind: 'visit',
    subject: `Reminder: your ${i.what.toLowerCase()} on ${i.when} | ${biz}`,
    preheader: `We are booked in on ${i.when} at ${start}.`,
    label: 'Visit reminder',
    headline: `Hi ${first}, we are booked in on ${i.when}`,
    greeting: `Hi ${first},`,
    paragraphs: [`This is a friendly reminder from ${biz} about your upcoming visit. The details are below.`],
    highlight: { label: 'When', value: i.when, sub: i.time, chip: i.length ? { text: i.length, tone: 'neutral' } : undefined },
    facts,
    closing: [`Need to change the time? Just reply to this email${callUs} and we will sort it out.`],
    button: href ? { text: 'Change my booking', href } : undefined,
    signoff: 'Kind regards,',
  }
}

export type OnTheWayInput = {
  first: string
  /** The visit as it was booked, e.g. "Tue 17 Nov" and "9:00am to 10:00am". */
  when: string
  time: string
  what: string
  equipment?: string
  address?: string
  /** The technician's first name. */
  tech?: string
  /** When they expect to arrive, already worded, e.g. "around 9:20am". */
  eta?: string
}

/** "We are on our way", sent when the technician sets off. The internal notes are never included. */
export function buildOnTheWay(i: OnTheWayInput, s: EmailSender): EmailContent {
  const first = firstName(i.first)
  const biz = s.name || 'our team'
  const who = i.tech || 'Our technician'
  const callUs = s.phone ? ` or call us on ${s.phone}` : ''
  const facts: [string, string][] = [['Visit', i.what]]
  if (i.equipment) facts.push(['Equipment', i.equipment])
  if (i.address) facts.push(['Address', i.address])
  if (i.tech) facts.push(['Technician', i.tech])
  return {
    kind: 'on_the_way',
    subject: `${i.tech ? `${i.tech} is` : 'We are'} on the way | ${biz}`,
    preheader: i.eta ? `${who} is heading to you now, arriving ${i.eta}.` : `${who} is heading to you now.`,
    label: 'On the way',
    headline: `Hi ${first}, ${i.tech ? `${i.tech} is` : 'we are'} on the way`,
    greeting: `Hi ${first},`,
    paragraphs: [`${who} from ${biz} has set off for your ${i.what.toLowerCase()} and is on the way to you now.`],
    highlight: i.eta ? { label: 'Arriving', value: i.eta, sub: `Booked for ${i.when}, ${i.time}` } : { label: 'Booked for', value: i.when, sub: i.time },
    facts,
    closing: [`If something has come up, or no one will be home, please reply to this email${callUs} so we can sort it out.`],
    signoff: 'Kind regards,',
  }
}

export type MovedInput = {
  first: string
  /** The new day and time, already worded in the business's own time. */
  when: string
  time: string
  /** The day and time it used to be. */
  wasWhen: string
  wasTime: string
  length?: string
  what: string
  equipment?: string
  address?: string
  tech?: string
}

/** Tells the customer a booked visit has a new time. The earlier reminder no longer applies. */
export function buildMoved(i: MovedInput, s: EmailSender): EmailContent {
  const first = firstName(i.first)
  const biz = s.name || 'our team'
  const callUs = s.phone ? ` or call us on ${s.phone}` : ''
  const facts: [string, string][] = [['Was', `${i.wasWhen}, ${i.wasTime}`], ['Visit', i.what]]
  if (i.equipment) facts.push(['Equipment', i.equipment])
  if (i.address) facts.push(['Address', i.address])
  if (i.tech) facts.push(['Technician', i.tech])
  const href = replyHref(s, `New time for my booking${i.first ? ` - ${i.first}` : ''}`)
  return {
    kind: 'moved',
    subject: `New time for your ${i.what.toLowerCase()}: ${i.when} | ${biz}`,
    preheader: `Your visit is now on ${i.when} at ${i.time.split(' to ')[0]}.`,
    label: 'New time',
    headline: `Hi ${first}, your visit has a new time`,
    greeting: `Hi ${first},`,
    paragraphs: [`The time of your upcoming ${i.what.toLowerCase()} with ${biz} has changed. The new time is below.`],
    highlight: { label: 'New time', value: i.when, sub: i.time, chip: i.length ? { text: i.length, tone: 'neutral' } : undefined },
    facts,
    closing: [`If the new time does not suit you, just reply to this email${callUs} and we will find another.`],
    button: href ? { text: 'Suggest another time', href } : undefined,
    signoff: 'Kind regards,',
  }
}

export function sampleContent(kind: EmailKind, s: EmailSender, today: Date = new Date()): EmailContent {
  const day = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n)
  if (kind === 'visit') {
    return buildVisit({ first: 'Sophie', when: dateMid(day(1)), time: '9:00am to 10:00am', length: '1 hr', what: 'Service', equipment: 'Daikin Cora split system', address: '14 Marlow Street, Parramatta', tech: 'Sam' }, s)
  }
  const lines: LineInput[] = [
    { description: 'Split system service, 2 units', qty: 2, unit: 110 },
    { description: 'Refrigerant top-up', qty: 1, unit: 60 },
  ]
  if (kind === 'service') {
    return buildService({ first: 'Sophie', what: 'Daikin Cora split system', due: day(14), days: 14, address: '14 Marlow Street, Parramatta', location: 'Living room', bookUrl: 'https://jobyra.app/book/preview' }, s)
  }
  if (kind === 'overdue') {
    return buildOverdue(
      {
        first: 'Sophie',
        number: 'INV-0012',
        issued: day(-16),
        due: day(-2),
        daysLate: 2,
        lines,
        total: 308,
        paid: 0,
        payRows: [
          ['Bank', 'NAB'],
          ['Account name', s.name || 'Your business'],
          ['BSB', '082 001'],
          ['Account no.', '1234 5678'],
          ['Reference', 'INV-0012'],
          ['Terms', 'Due within 14 days'],
        ],
      },
      s
    )
  }
  if (kind === 'quote') {
    return buildQuote(
      {
        first: 'Sophie',
        number: 'Q-0007',
        sent: day(-4),
        validUntil: day(21),
        validDays: 21,
        lines: [{ description: 'Daikin Cora 7.1kW split system, supply and install', qty: 1, unit: 1140 }],
        total: 1254,
      },
      s
    )
  }
  return buildReview({ first: 'Sophie', what: 'Daikin Cora split system install', url: 'https://g.page/r/your-review-link' }, s)
}
