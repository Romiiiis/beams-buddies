// Invoice email + SMS templates. The HTML mirrors the invoice preview in the app (same sections, same order):
// business header, INVOICE + number + dates, Bill to, line items, totals, payment details, notes.
// Email-safe: tables and inline styles only, system fonts, no images.
import { parseDateLocal } from '@/lib/service'

export type InvoiceSender = { name: string; phone: string; email: string }
export type InvoicePayment = {
  bank_name?: string | null
  account_name?: string | null
  bsb?: string | null
  account_number?: string | null
  payment_terms?: string | null
  invoice_notes?: string | null
}

const TEAL = '#2AA198'
const font = "-apple-system, 'Segoe UI', Aptos, Helvetica, Arial, sans-serif"

function clean(v: unknown) {
  return String(v ?? '').trim()
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function money(n: unknown) {
  return `$${Number(n || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function longDate(v?: string | null) {
  const d = parseDateLocal(v)
  return d ? d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
}

function owing(inv: any) {
  return Math.max(0, Number(inv.total || 0) - Number(inv.amount_paid || 0))
}

export function invoiceSubject(inv: any, sender: InvoiceSender) {
  return `Invoice ${clean(inv.invoice_number)} from ${clean(sender.name) || 'us'}`
}

function paymentLines(p: InvoicePayment | null | undefined, ref: string) {
  if (!p) return []
  const rows: [string, string][] = [
    ['Bank', clean(p.bank_name)],
    ['Account name', clean(p.account_name)],
    ['BSB', clean(p.bsb)],
    ['Account no.', clean(p.account_number)],
    ['Reference', clean(ref)],
    ['Terms', clean(p.payment_terms)],
  ]
  const has = rows.some(([k, v]) => v && k !== 'Reference' && k !== 'Terms')
  return has ? rows.filter(([, v]) => v) : []
}

/** Plain-text version (also the fallback draft for a mail app). */
export function invoiceText(inv: any, sender: InvoiceSender, pay?: InvoicePayment | null, link?: string) {
  const first = clean(inv.customers?.first_name) || 'there'
  const name = clean(sender.name) || 'us'
  const due = longDate(inv.due_date)
  const lines = [
    `Hi ${first},`,
    '',
    `Here is invoice ${clean(inv.invoice_number)} from ${name}${due ? `, due ${due}` : ''}.`,
    '',
    ...(inv.line_items || []).map((i: any) => `- ${clean(i.description)}: ${i.qty} x ${money(i.unit_price)} = ${money(Number(i.qty) * Number(i.unit_price))}`),
    '',
    `Subtotal: ${money(inv.subtotal)}`,
    `GST (${inv.tax_rate}%): ${money(inv.tax_amount)}`,
    `Total: ${money(inv.total)}`,
    ...(Number(inv.amount_paid) > 0 ? [`Paid: ${money(inv.amount_paid)}`, `Amount due: ${money(owing(inv))}`] : []),
  ]
  const p = paymentLines(pay, clean(inv.invoice_number))
  if (p.length) lines.push('', 'Payment details', ...p.map(([k, v]) => `${k}: ${v}`))
  if (link) lines.push('', `View your invoice online: ${link}`)
  lines.push('', 'Thank you,', name, ...(clean(sender.phone) ? [clean(sender.phone)] : []), ...(clean(sender.email) ? [clean(sender.email)] : []))
  return lines.join('\r\n')
}

/** Short SMS. */
export function invoiceSms(inv: any, sender: InvoiceSender, pay?: InvoicePayment | null, link?: string) {
  const first = clean(inv.customers?.first_name) || 'there'
  const name = clean(sender.name) || 'us'
  const due = longDate(inv.due_date)
  const bank = pay && (clean(pay.bsb) || clean(pay.account_number)) ? ` Pay to BSB ${clean(pay.bsb)} Acc ${clean(pay.account_number)}, ref ${clean(inv.invoice_number)}.` : ''
  return `Hi ${first}, it's ${name}. Invoice ${clean(inv.invoice_number)} for ${money(owing(inv))}${due ? ` is due ${due}` : ' is ready'}.${bank}${link ? ` View: ${link}` : ''} Thanks!`
}

export function invoiceHtml(inv: any, sender: InvoiceSender, pay?: InvoicePayment | null, link?: string) {
  const c = inv.customers || {}
  const billTo = [
    [clean(c.first_name), clean(c.last_name)].filter(Boolean).join(' '),
    clean(c.address),
    clean(c.suburb),
    clean(c.phone),
    clean(c.email),
  ].filter(Boolean)
  const issued = inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const due = longDate(inv.due_date)
  const items: any[] = inv.line_items || []
  const paid = Number(inv.amount_paid) > 0
  const payRows = paymentLines(pay, clean(inv.invoice_number))
  const notes = [clean(inv.notes), clean(pay?.invoice_notes)].filter(Boolean)
  const contact = [clean(sender.phone), clean(sender.email)].filter(Boolean).map(esc).join(' &middot; ')

  const th = (t: string, align: string) => `<td style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#64748B;background:#F8FAFC;text-align:${align};">${t}</td>`
  const rows = items.map((i, idx) => `<tr>
    <td style="padding:12px;font-size:14px;color:#0B1220;border-top:${idx === 0 ? '0' : '1px solid #E8EDF2'};">${esc(clean(i.description))}</td>
    <td style="padding:12px;font-size:13px;color:#1F2937;text-align:right;border-top:${idx === 0 ? '0' : '1px solid #E8EDF2'};">${esc(String(i.qty))}</td>
    <td style="padding:12px;font-size:13px;color:#1F2937;text-align:right;white-space:nowrap;border-top:${idx === 0 ? '0' : '1px solid #E8EDF2'};">${money(i.unit_price)}</td>
    <td style="padding:12px;font-size:13px;font-weight:700;color:#0B1220;text-align:right;white-space:nowrap;border-top:${idx === 0 ? '0' : '1px solid #E8EDF2'};">${money(Number(i.qty) * Number(i.unit_price))}</td>
  </tr>`).join('')

  const totalRow = (label: string, value: string, extra = '') => `<tr><td style="padding:6px 0;font-size:13px;color:#64748B;${extra}">${label}</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#0B1220;text-align:right;${extra}">${value}</td></tr>`

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;font-family:${font};color:#334155;">
<tr><td style="padding:0 0 28px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
    <tr>
      <td style="vertical-align:top;">
        <div style="font-size:18px;font-weight:800;color:#0B1220;">${esc(clean(sender.name) || 'Your Business')}</div>
        ${clean(sender.phone) ? `<div style="font-size:13px;color:#64748B;margin-top:3px;">${esc(clean(sender.phone))}</div>` : ''}
        ${clean(sender.email) ? `<div style="font-size:13px;color:#64748B;margin-top:2px;">${esc(clean(sender.email))}</div>` : ''}
      </td>
      <td style="vertical-align:top;text-align:right;">
        <div style="font-size:28px;font-weight:800;color:${TEAL};margin-bottom:6px;">INVOICE</div>
        <div style="font-size:14px;font-weight:700;color:#0B1220;font-family:ui-monospace,Menlo,Consolas,monospace;">${esc(clean(inv.invoice_number))}</div>
        ${issued ? `<div style="font-size:12px;color:#64748B;margin-top:4px;">Issued: ${esc(issued)}</div>` : ''}
        ${due ? `<div style="font-size:12px;color:#64748B;margin-top:2px;">Due: ${esc(due)}</div>` : ''}
      </td>
    </tr>
  </table>
</td></tr>
<tr><td style="padding:0 0 24px 0;">
  <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;margin:0 0 8px 0;">Bill to</div>
  ${billTo.map((l, i) => `<div style="font-size:${i === 0 ? '15px' : '13px'};font-weight:${i === 0 ? '700' : '400'};color:${i === 0 ? '#0B1220' : '#1F2937'};margin-top:${i === 0 ? '0' : '2px'};">${esc(l)}</div>`).join('')}
</td></tr>
<tr><td style="padding:0 0 20px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border:1px solid #E8EDF2;border-radius:12px;border-collapse:separate;overflow:hidden;">
    <tr>${th('Description', 'left')}${th('Qty', 'right')}${th('Unit price', 'right')}${th('Total', 'right')}</tr>
    ${rows}
  </table>
</td></tr>
<tr><td style="padding:0 0 24px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right" style="width:260px;max-width:100%;">
    ${totalRow('Subtotal', money(inv.subtotal))}
    ${totalRow(`GST (${esc(String(inv.tax_rate))}%)`, money(inv.tax_amount), 'border-bottom:1px solid #E8EDF2;')}
    <tr><td colspan="2" style="padding:8px 0 0 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${TEAL};border-radius:8px;">
        <tr><td style="padding:9px 14px;font-size:15px;font-weight:700;color:#FFFFFF;">Total</td><td style="padding:9px 14px;font-size:15px;font-weight:800;color:#FFFFFF;text-align:right;">${money(inv.total)}</td></tr>
      </table>
    </td></tr>
    ${paid ? totalRow('Paid', money(inv.amount_paid)) + totalRow('Amount due', money(owing(inv))) : ''}
  </table>
</td></tr>
${link ? `<tr><td style="padding:0 0 22px 0;clear:both;"><a href="${esc(link)}" style="display:inline-block;background:${TEAL};color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:10px;">View invoice online</a></td></tr>` : ''}
${payRows.length ? `<tr><td style="padding:0 0 20px 0;clear:both;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#F8FAFC;border:1px solid #E8EDF2;border-radius:12px;border-collapse:separate;">
    <tr><td style="padding:16px 18px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;margin:0 0 10px 0;">Payment details</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        ${payRows.map(([k, v]) => `<tr><td style="padding:3px 0;font-size:12px;color:#64748B;width:36%;">${esc(k)}</td><td style="padding:3px 0;font-size:13px;font-weight:700;color:#0B1220;">${esc(v)}</td></tr>`).join('')}
      </table>
    </td></tr>
  </table>
</td></tr>` : ''}
${notes.length ? `<tr><td style="padding:0 0 20px 0;font-size:13px;line-height:1.6;color:#64748B;">${notes.map(esc).join('<br>')}</td></tr>` : ''}
<tr><td style="font-size:13.5px;line-height:1.6;color:#475569;">
  Thank you,<br><b style="color:#0B1220;">${esc(clean(sender.name))}</b>${contact ? `<br>${contact}` : ''}
</td></tr>
</table>`
}
