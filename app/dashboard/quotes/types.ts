import { type LineItem } from '@/lib/documents'

export type QuoteCustomer = {
  first_name: string
  last_name: string
  suburb: string | null
  phone: string | null
  email: string | null
  address: string | null
}

export type Quote = {
  id: string
  customer_id: string
  job_id: string | null
  quote_number: string
  status: string
  total: number
  subtotal: number
  tax_rate: number
  tax_amount: number
  notes: string | null
  valid_until: string | null
  created_at: string
  line_items: LineItem[]
  public_token: string
  sent_at: string | null
  viewed_at: string | null
  responded_at: string | null
  responded_name: string | null
  response_message: string | null
  deposit_percent: number | null
  accepted_optional: number[]
  customers: QuoteCustomer | null
}

export const QUOTE_SELECT = '*, customers(first_name, last_name, suburb, phone, email, address)'

const BORDER = '#E8EDF2'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'

export const QUOTE_STATUS: Record<string, { bg: string; color: string; label: string; border: string }> = {
  draft: { bg: '#F8FAFC', color: TEXT3, label: 'Draft', border: BORDER },
  sent: { bg: '#F8FAFC', color: TEXT2, label: 'Sent', border: BORDER },
  accepted: { bg: '#EBFAF7', color: '#1F857C', label: 'Accepted', border: '#BFE7E3' },
  declined: { bg: '#FEE2E2', color: '#7F1D1D', label: 'Declined', border: '#FECACA' },
  expired: { bg: '#F1F5F9', color: TEXT3, label: 'Expired', border: BORDER },
}

export const customerName = (c: QuoteCustomer | null | undefined) => `${c?.first_name || ''} ${c?.last_name || ''}`.trim()
