// Service reminder SMS helper. Email content and layout come from lib/email-theme.ts.
import { getEquipmentLabel } from '@/lib/industry-config'
import { nextServiceDate, timingText, formatDate } from '@/lib/service'

export type ReminderSender = { name: string; phone: string; email: string; logoUrl?: string }

type ReminderFacts = {
  first: string
  business: string
  what: string
  when: string | null
  overdue: boolean
  phone: string
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
    business: clean(sender.name) || 'our team',
    what: [job.brand, job.model].map(clean).filter(Boolean).join(' ') || getEquipmentLabel(job.equipment_type) || 'system',
    when: next ? formatDate(next) : null,
    overdue: timingText(job).bucket === 'overdue',
    phone: clean(sender.phone),
  }
}

/** Service reminder text: short blocks, a plain call to action, and a sign-off. */
export function reminderSms(job: any, sender: ReminderSender) {
  const f = facts(job, sender)
  const out: string[] = [
    `Hi ${f.first}, this is ${f.business}.`,
    '',
    `Your ${f.what} service ${f.overdue ? 'was due on' : 'is due on'} ${f.when || 'soon'}.`,
    '',
    f.phone ? `To book a time, reply to this message or call ${f.phone}.` : 'To book a time, just reply to this message.',
    '',
    'Thank you,',
    f.business,
  ]
  return out.join('\n')
}
