import type { EmailContent, EmailSender } from '@/lib/email-theme'

export type ContactEmailTemplateId = 'custom' | 'new_quote' | 'outstanding' | 'service_reminder' | 'follow_up' | 'review'

type ContactEmailTemplate = {
  id: ContactEmailTemplateId
  label: string
  subject: string
  headline: string
  kind: EmailContent['kind']
}

export const CONTACT_EMAIL_TEMPLATES: ContactEmailTemplate[] = [
  { id: 'custom', label: 'Custom', subject: '', headline: '', kind: 'visit' },
  { id: 'new_quote', label: 'New quote', subject: 'Your Quote', headline: 'Your quote is ready', kind: 'quote' },
  { id: 'outstanding', label: 'Outstanding invoice', subject: 'Outstanding Invoice Reminder', headline: 'A quick reminder about your invoice', kind: 'overdue' },
  { id: 'service_reminder', label: 'Service reminder', subject: 'Service Reminder', headline: 'Time to schedule your next service', kind: 'service' },
  { id: 'follow_up', label: 'Follow-up', subject: 'Following Up', headline: 'Following up', kind: 'visit' },
  { id: 'review', label: 'Review request', subject: 'How Did We Do?', headline: 'We would love your feedback', kind: 'review' },
]

const EMAIL_ACTIONS: Record<ContactEmailTemplateId, string> = {
  custom: 'Call us',
  new_quote: 'Discuss your quote',
  outstanding: 'Call about your invoice',
  service_reminder: 'Call to book',
  follow_up: 'Call us back',
  review: 'Talk with us',
}

function contactAction(template: ContactEmailTemplateId, sender: EmailSender) {
  const action = EMAIL_ACTIONS[template]
  const phone = String(sender.phone || '').replace(/[^\d+]/g, '')
  if (/^\+?\d{6,15}$/.test(phone)) return { text: action, href: 'tel:' + phone }
  return undefined
}

export function isContactEmailTemplate(value: unknown): value is ContactEmailTemplateId {
  return typeof value === 'string' && CONTACT_EMAIL_TEMPLATES.some(template => template.id === value)
}

export function contactEmailBody(template: ContactEmailTemplateId, jobType?: string) {
  const type = String(jobType || 'system').trim()
  switch (template) {
    case 'new_quote':
      return 'We have prepared a quote for you. Please let us know if you would like to proceed or if you have any questions.'
    case 'outstanding':
      return 'This is a friendly reminder that you have an outstanding invoice with us. Please get in touch to arrange payment at your earliest convenience.'
    case 'service_reminder':
      return 'It is time to schedule your next service for your ' + type + '. Give us a call or reply to book in.'
    case 'follow_up':
      return 'Just following up on our recent visit. Please do not hesitate to reach out if you have any questions.'
    case 'review':
      return 'Thank you for your business. If you are happy with the service, we would really appreciate a quick review.'
    default:
      return ''
  }
}

export function contactEmailContent(
  draft: { template: ContactEmailTemplateId; firstName?: string | null; subject?: string | null; message?: string | null },
  sender: EmailSender,
  baseContent?: EmailContent
): EmailContent {
  const template = CONTACT_EMAIL_TEMPLATES.find(item => item.id === draft.template) || CONTACT_EMAIL_TEMPLATES[0]
  const first = String(draft.firstName || '').trim() || 'there'
  const business = String(sender.name || '').trim() || 'our team'
  const subject = String(draft.subject || '').trim() || template.subject || 'A message from ' + business
  const rawMessage = String(draft.message || '').trim()
  const paragraphs = rawMessage
    ? rawMessage.split(/\n{2,}/).map(p => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean)
    : ['Your message will appear here once you start typing.']
  if (baseContent) {
    return {
      ...baseContent,
      subject: String(draft.subject || '').trim() || baseContent.subject,
      preheader: rawMessage ? paragraphs[0] : baseContent.preheader,
      paragraphs: rawMessage ? paragraphs : baseContent.paragraphs,
    }
  }
  return {
    kind: template.kind,
    subject,
    preheader: paragraphs[0],
    label: template.label,
    headline: template.headline || 'A message from ' + business,
    greeting: 'Hi ' + first + ',',
    paragraphs,
    closing: [],
    button: contactAction(draft.template, sender),
    signoff: 'Kind regards,',
  }
}
