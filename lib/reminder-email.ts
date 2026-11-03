// Service reminder email + SMS templates.
// Shared by the Schedule page's Email/SMS buttons (copy & paste into the user's own mail app)
// and, later, by Jobyra sending reminders itself, so both use the same design ("design C").
import { getEquipmentLabel } from '@/lib/industry-config'
import { nextServiceDate, timingText, formatDate } from '@/lib/service'

export type ReminderSender = { name: string; phone: string; email: string }

type ReminderFacts = {
  first: string
  fullName: string
  business: string
  what: string
  when: string | null
  overdue: boolean
  address: string
  location: string
  phone: string
  email: string
}

function clean(v: unknown) {
  return String(v ?? '').trim()
}

function facts(job: any, sender: ReminderSender): ReminderFacts {
  const rawFirst = clean(job.customers?.first_name)
  const first = rawFirst ? rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1) : 'there'
  const next = nextServiceDate(job)
  return {
    first,
    fullName: [clean(job.customers?.first_name), clean(job.customers?.last_name)].filter(Boolean).join(' '),
    business: clean(sender.name) || 'our team',
    what: [job.brand, job.model].map(clean).filter(Boolean).join(' ') || getEquipmentLabel(job.equipment_type) || 'system',
    when: next ? formatDate(next) : null,
    overdue: timingText(job).bucket === 'overdue',
    address: [job.customers?.address, job.customers?.suburb].map(clean).filter(Boolean).join(', '),
    location: clean(job.install_location),
    phone: clean(sender.phone),
    email: clean(sender.email),
  }
}

export function reminderSubject(job: any, sender: ReminderSender) {
  const f = facts(job, sender)
  return f.overdue
    ? `Service reminder: your ${f.what} is overdue | ${f.business}`
    : `Service reminder: your ${f.what}${f.when ? ` is due ${f.when}` : ''} | ${f.business}`
}

/** Plain-text email: used as the fallback draft body and as the text part of the copied email. */
export function reminderText(job: any, sender: ReminderSender) {
  const f = facts(job, sender)
  const lines = [
    `Hi ${f.first},`,
    '',
    f.overdue
      ? `This is a friendly reminder from ${f.business} that your ${f.what} is now overdue for its regular service${f.when ? ` (it was due on ${f.when})` : ''}.`
      : `This is a friendly reminder from ${f.business} that your ${f.what} is due for its regular service${f.when ? ` on ${f.when}` : ' soon'}.`,
    '',
    'Service details',
    `- Equipment: ${f.what}`,
    ...(f.address ? [`- Address: ${f.address}`] : []),
    ...(f.location ? [`- Location: ${f.location}`] : []),
    ...(f.when ? [`- Service due: ${f.when}${f.overdue ? ' (overdue)' : ''}`] : []),
    '',
    'Regular servicing keeps everything running efficiently and helps avoid unexpected breakdowns.',
    '',
    f.phone
      ? `To book a time, simply reply to this email or call us on ${f.phone}.`
      : 'To book a time, simply reply to this email and we will find a time that suits you.',
    '',
    'Kind regards,',
    '',
    f.business,
    ...(f.phone ? [f.phone] : []),
    ...(f.email ? [f.email] : []),
  ]
  // \r\n keeps Outlook and Windows Mail from joining lines
  return lines.join('\r\n')
}

/** Short SMS reminder. */
export function reminderSms(job: any, sender: ReminderSender) {
  const f = facts(job, sender)
  return `Hi ${f.first}, it's ${f.business}. Your ${f.what} service ${f.overdue ? 'was due on' : 'is due on'} ${f.when || 'soon'}. Reply here${f.phone ? ` or call ${f.phone}` : ''} to book a time. Thanks!`
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/**
 * Formatted email ("design C: minimal summary"). Email-safe HTML: tables and inline styles only,
 * system fonts, no images, so it survives being pasted into Outlook, Gmail or a phone's mail app.
 */
export function reminderHtml(job: any, sender: ReminderSender) {
  const f = facts(job, sender)
  const font = "-apple-system, 'Segoe UI', Aptos, Helvetica, Arial, sans-serif"
  const headline = f.overdue ? `Hi ${f.first}, your ${f.what} is overdue for a service` : `Hi ${f.first}, your ${f.what} is due for a service`
  const dateLabel = f.overdue ? 'Service was due' : 'Service due'
  const status = f.overdue
    ? `<span style="font-size:12px;font-weight:700;color:#B91C1C;">Overdue</span>`
    : `<span style="font-size:12px;font-weight:700;color:#1F857C;">Coming up</span>`

  // "Book my service" goes to the business: reply by email if there is one, otherwise call
  const bookHref = f.email
    ? `mailto:${f.email}?subject=${encodeURIComponent(`Service booking${f.fullName ? ` - ${f.fullName}` : ''}`)}`
    : f.phone
      ? `tel:${f.phone.replace(/[^\d+]/g, '')}`
      : null

  const details = [
    ['Equipment', f.what],
    ...(f.address ? [['Address', f.address]] : []),
    ...(f.location ? [['Location', f.location]] : []),
  ]

  const contact = [f.phone, f.email].filter(Boolean).map(esc).join(' &middot; ')

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:520px;font-family:${font};color:#334155;">
<tr><td style="padding:8px 0 0 0;">
  <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1F857C;margin:0 0 8px 0;">Service reminder</div>
  <div style="font-size:24px;line-height:1.25;font-weight:800;color:#0B1220;margin:0 0 6px 0;">${esc(headline)}</div>
  <div style="font-size:14.5px;color:#64748B;margin:0 0 20px 0;">From ${esc(f.business)}</div>
</td></tr>
${f.when ? `<tr><td style="padding:0 0 18px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border:1px solid #E3E8EE;border-radius:12px;">
    <tr>
      <td style="padding:16px 18px;">
        <div style="font-size:12px;color:#64748B;margin:0 0 3px 0;">${dateLabel}</div>
        <div style="font-size:18px;font-weight:700;color:#0B1220;">${esc(f.when)}</div>
      </td>
      <td style="padding:16px 18px;text-align:right;vertical-align:middle;">${status}</td>
    </tr>
  </table>
</td></tr>` : ''}
<tr><td style="padding:0 0 14px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;font-size:14px;">
    ${details.map(([k, v]) => `<tr><td style="padding:6px 0;color:#64748B;width:38%;">${esc(k)}</td><td style="padding:6px 0;font-weight:700;color:#0B1220;">${esc(v)}</td></tr>`).join('')}
  </table>
</td></tr>
<tr><td style="font-size:14.5px;line-height:1.65;color:#334155;padding:0 0 4px 0;">
  Regular servicing keeps everything running efficiently and helps avoid unexpected breakdowns.
  ${f.phone ? `To book a time, reply to this email or call us on <b style="color:#0B1220;">${esc(f.phone)}</b>.` : 'To book a time, simply reply to this email.'}
</td></tr>
${bookHref ? `<tr><td style="padding:18px 0 16px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
    <tr><td align="center" style="background:#0B1220;border-radius:10px;">
      <a href="${esc(bookHref)}" style="display:block;padding:13px 16px;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;font-family:${font};">Book my service</a>
    </td></tr>
  </table>
</td></tr>` : ''}
<tr><td style="font-size:13.5px;line-height:1.6;color:#475569;padding:${bookHref ? '0' : '16px'} 0 0 0;">
  Kind regards,<br><b style="color:#0B1220;">${esc(f.business)}</b>${contact ? `<br>${contact}` : ''}
</td></tr>
</table>`
}
