// A business's own wording for an automation email. Empty fields keep the standard wording.
// {first} is the customer's first name, {business} the business name and {phone} its phone number.
import type { EmailContent, EmailSender } from '@/lib/email-theme'

export type EmailCopy = { subject?: string | null; intro?: string | null; closing?: string | null }

export const COPY_LIMITS = { subject: 150, intro: 1000, closing: 1000 }

function fill(text: string, vars: Record<string, string>) {
  return text.replace(/\{(first|business|phone)\}/gi, (_m, k: string) => vars[k.toLowerCase()] ?? '')
}

const paragraphs = (text: string) => text.split(/\n{2,}/).map(p => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean)

/** Swaps in the business's own subject, opening paragraph(s) and closing paragraph(s), when they wrote any. */
export function applyCopy(c: EmailContent, s: EmailSender, copy?: EmailCopy | null): EmailContent {
  if (!copy) return c
  const vars = { first: c.greeting.match(/^Hi (.+),$/)?.[1] || 'there', business: s.name || 'our team', phone: s.phone || '' }
  const out = { ...c }
  const subject = copy.subject?.replace(/\s+/g, ' ').trim()
  if (subject) out.subject = fill(subject, vars).slice(0, COPY_LIMITS.subject)
  const intro = copy.intro ? paragraphs(fill(copy.intro, vars)) : []
  if (intro.length) out.paragraphs = intro
  const closing = copy.closing ? paragraphs(fill(copy.closing, vars)) : []
  if (closing.length) out.closing = closing
  return out
}
