// Checklists: a template is written once; a copy is ticked off on each visit. No imports, so it also runs in Node tests.

export type ChecklistItemType = 'check' | 'text' | 'number'

export type TemplateItem = { id: string; text: string; type: ChecklistItemType; /** For readings: the unit, e.g. "°C" */ unit?: string }
export type FilledItem = TemplateItem & { done: boolean; value: string }

export type Template = { id: string; name: string; items: TemplateItem[]; requires_signature: boolean }

export type VisitChecklist = {
  id: string
  visit_id: string
  template_id: string | null
  title: string
  items: FilledItem[]
  notes: string | null
  requires_signature: boolean
  signed_name: string | null
  signed_at: string | null
  signature: string | null
  created_at: string
}

export const ITEM_TYPES: { value: ChecklistItemType; label: string }[] = [
  { value: 'check', label: 'Tick' },
  { value: 'text', label: 'Answer' },
  { value: 'number', label: 'Reading' },
]

export function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

/** A fresh, unticked copy of a template's items. */
export function fillItems(items: TemplateItem[]): FilledItem[] {
  return items.map(i => ({ ...i, id: i.id || newId(), done: false, value: '' }))
}

/** How many items are done. A tick counts when ticked; an answer or reading counts once something is written. */
export function progress(items: FilledItem[]) {
  const done = items.filter(i => (i.type === 'check' ? i.done : String(i.value || '').trim() !== '')).length
  return { done, total: items.length }
}

export const isSigned = (c: { signed_at: string | null }) => !!c.signed_at

type Example = { name: string; requires_signature: boolean; items: { text: string; type: ChecklistItemType; unit?: string }[] }

/** Starting points offered when a business has no checklists yet. */
export const EXAMPLES: Example[] = [
  {
    name: 'Air conditioner service',
    requires_signature: false,
    items: [
      { text: 'Clean or replace the filters', type: 'check' },
      { text: 'Clean the indoor coil and fan', type: 'check' },
      { text: 'Flush the drain and test drainage', type: 'check' },
      { text: 'Check the outdoor unit and fan', type: 'check' },
      { text: 'Check electrical connections', type: 'check' },
      { text: 'Supply air temperature', type: 'number', unit: '°C' },
      { text: 'Return air temperature', type: 'number', unit: '°C' },
      { text: 'Test heating and cooling', type: 'check' },
      { text: 'Anything to tell the customer', type: 'text' },
    ],
  },
  {
    name: 'Installation sign-off',
    requires_signature: true,
    items: [
      { text: 'Unit mounted level and secure', type: 'check' },
      { text: 'Pipework insulated and sealed', type: 'check' },
      { text: 'Isolator and wiring checked', type: 'check' },
      { text: 'Test run completed', type: 'check' },
      { text: 'Remote and care shown to the customer', type: 'check' },
      { text: 'Site left clean and tidy', type: 'check' },
    ],
  },
  {
    name: 'Job sign-off',
    requires_signature: true,
    items: [
      { text: 'Work completed as quoted', type: 'check' },
      { text: 'Area cleaned up', type: 'check' },
      { text: 'Customer walked through the work', type: 'check' },
      { text: 'Notes', type: 'text' },
    ],
  },
]
