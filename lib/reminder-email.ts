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

/** Short SMS reminder. */
export function reminderSms(job: any, sender: ReminderSender) {
  const f = facts(job, sender)
  return `Hi ${f.first}, it's ${f.business}. Your ${f.what} service ${f.overdue ? 'was due on' : 'is due on'} ${f.when || 'soon'}. Reply here${f.phone ? ` or call ${f.phone}` : ''} to book a time. Thanks!`
}
