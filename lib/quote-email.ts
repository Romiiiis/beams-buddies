// The email that carries a quote to the customer, with a button to the private quote page.
// Used by the Send window (live preview) and by the server route that actually sends it, so both always match.
import { type EmailContent, type EmailSender, type Tone, dateShort, money } from '@/lib/email-theme'
import { parseDateLocal } from '@/lib/service'
import { type LineItem, optionalExtras } from '@/lib/documents'

const clean = (v: unknown) => String(v ?? '').trim()

export function quoteSubject(q: any, s: EmailSender) {
  return `Quote ${clean(q?.quote_number)} from ${clean(s.name) || 'us'}`
}

export function quoteSendContent(q: any, s: EmailSender, link: string, note?: string): EmailContent {
  const first = clean(q?.customers?.first_name) || 'there'
  const biz = clean(s.name) || 'us'
  const items: LineItem[] = Array.isArray(q?.line_items) ? q.line_items : []
  const required = items.filter(i => !i.optional && clean(i.description))
  const extras = items.filter(i => i.optional)
  const total = Number(q?.total) || 0
  const valid = parseDateLocal(q?.valid_until)
  const today = new Date()
  const days = valid ? Math.round((valid.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000) : null
  const chip: { text: string; tone: Tone } | undefined =
    days === null ? undefined : days < 0 ? { text: 'Expired', tone: 'neutral' } : days <= 7 ? { text: `${days} day${days === 1 ? '' : 's'} left`, tone: 'warn' } : { text: `Valid for ${days} days`, tone: 'good' }

  const what = required.length ? clean(required[0].description) + (required.length > 1 ? ` + ${required.length - 1} more` : '') : ''
  const facts: [string, string][] = [['Quote', clean(q?.quote_number)]]
  if (what) facts.push(['For', what])
  if (valid) facts.push(['Valid until', dateShort(valid)])
  if (extras.length) facts.push(['Optional extras', `${extras.length} you can add (${money(optionalExtras(items))} + GST)`])
  const pct = Number(q?.deposit_percent) || 0
  if (pct > 0) facts.push(['Deposit', `${pct}% (${money((total * pct) / 100)}) to confirm the booking`])

  const personal = clean(note)
  const callUs = clean(s.phone) ? ` or call us on ${clean(s.phone)}` : ''

  return {
    kind: 'quote',
    subject: quoteSubject(q, s),
    preheader: `Your quote for ${money(total)}. Look it over and accept online.`,
    label: 'Your quote',
    headline: `${first}, your quote is ready`,
    greeting: `Hi ${first},`,
    paragraphs: [
      ...(personal ? [personal] : []),
      `Thanks for the opportunity to quote. You can look over the details, choose any optional extras, and accept online. If you have a question, you can ask it on the same page.`,
    ],
    highlight: { label: 'Quote total', value: money(total), sub: valid ? `Valid until ${dateShort(valid)}` : undefined, chip },
    facts,
    closing: [`Prefer to talk it through? Reply to this email${callUs}.`],
    button: { text: 'View and accept quote', href: link },
    signoff: 'Kind regards,',
  }
}
