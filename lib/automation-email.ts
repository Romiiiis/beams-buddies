// Emails sent by the automations. Same email-safe style as the reminder and invoice emails.
import { invoiceHtml, type InvoicePayment, type InvoiceSender } from '@/lib/invoice-email'

const font = "-apple-system, 'Segoe UI', Aptos, Helvetica, Arial, sans-serif"

function esc(s: string) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function firstName(c: any) {
  const f = String(c?.first_name ?? '').trim()
  return f ? f.charAt(0).toUpperCase() + f.slice(1) : 'there'
}

function wrap(label: string, headline: string, paragraphs: string[], sender: InvoiceSender, button?: { text: string; href: string }, extraHtml = '') {
  const contact = [sender.phone, sender.email].filter(Boolean).map(esc).join(' &middot; ')
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;font-family:${font};color:#334155;">
<tr><td style="padding:8px 0 0 0;">
  <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1F857C;margin:0 0 8px 0;">${esc(label)}</div>
  <div style="font-size:24px;line-height:1.25;font-weight:800;color:#0B1220;margin:0 0 6px 0;">${esc(headline)}</div>
  <div style="font-size:14.5px;color:#64748B;margin:0 0 18px 0;">From ${esc(sender.name || 'us')}</div>
</td></tr>
<tr><td style="font-size:14.5px;line-height:1.65;color:#334155;padding:0 0 16px 0;">${paragraphs.map(p => `<p style="margin:0 0 12px 0;">${esc(p)}</p>`).join('')}</td></tr>
${extraHtml ? `<tr><td style="padding:0 0 16px 0;">${extraHtml}</td></tr>` : ''}
${button ? `<tr><td style="padding:2px 0 18px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td align="center" style="background:#0B1220;border-radius:10px;"><a href="${esc(button.href)}" style="display:block;padding:13px 16px;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;font-family:${font};">${esc(button.text)}</a></td></tr></table></td></tr>` : ''}
<tr><td style="font-size:13.5px;line-height:1.6;color:#475569;">Kind regards,<br><b style="color:#0B1220;">${esc(sender.name)}</b>${contact ? `<br>${contact}` : ''}</td></tr>
</table>`
}

function replyButton(sender: InvoiceSender, subject: string, text: string) {
  if (sender.email) return { text, href: `mailto:${sender.email}?subject=${encodeURIComponent(subject)}` }
  if (sender.phone) return { text: `Call ${sender.phone}`, href: `tel:${sender.phone.replace(/[^\d+]/g, '')}` }
  return undefined
}

export function overdueInvoiceEmail(inv: any, sender: InvoiceSender, pay?: InvoicePayment | null) {
  const subject = `Invoice ${inv.invoice_number} is overdue | ${sender.name || 'Invoice'}`
  const intro = wrap('Payment reminder', `Hi ${firstName(inv.customers)}, invoice ${inv.invoice_number} is overdue`, [
    `A friendly reminder that invoice ${inv.invoice_number} has passed its due date. The full invoice is below. If you have already paid, thank you, and please ignore this message.`,
  ], sender)
  const text = `Hi ${firstName(inv.customers)},\r\n\r\nA friendly reminder that invoice ${inv.invoice_number} has passed its due date. If you have already paid, thank you, and please ignore this message.\r\n\r\n${sender.name}`
  return { subject, html: `${intro}<div style="height:20px"></div>${invoiceHtml(inv, sender, pay)}`, text }
}

export function quoteFollowUpEmail(q: any, sender: InvoiceSender) {
  const subject = `Following up on your quote ${q.quote_number} | ${sender.name || 'Quote'}`
  const total = `$${Number(q.total || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const html = wrap('Quote follow-up', `Hi ${firstName(q.customers)}, any questions about your quote?`, [
    `We sent you quote ${q.quote_number} for ${total} and wanted to check in. Happy to answer any questions or book a time that suits you.`,
  ], sender, replyButton(sender, `Quote ${q.quote_number}`, 'Reply to this quote'))
  const text = `Hi ${firstName(q.customers)},\r\n\r\nWe sent you quote ${q.quote_number} for ${total} and wanted to check in. Happy to answer any questions or book a time that suits you.\r\n\r\n${sender.name}`
  return { subject, html, text }
}

export function reviewRequestEmail(job: any, sender: InvoiceSender, reviewUrl: string) {
  const subject = `How did we go? | ${sender.name || 'Review'}`
  const html = wrap('Thank you', `Hi ${firstName(job.customers)}, thanks for choosing ${sender.name || 'us'}`, [
    'If you were happy with the work, a quick review would mean a lot to our small team. It only takes a minute.',
  ], sender, { text: 'Leave a review', href: reviewUrl })
  const text = `Hi ${firstName(job.customers)},\r\n\r\nThanks for choosing ${sender.name || 'us'}. If you were happy with the work, a quick review would mean a lot: ${reviewUrl}\r\n\r\n${sender.name}`
  return { subject, html, text }
}
