'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BTN, LINE, Modal, RED, TEXT2, TEXT3, useIsPhone } from '@/components/forms'
import { invoiceContent, publicInvoiceUrl, renderAutomation } from '@/lib/automation-email'
import type { EmailSender } from '@/lib/email-theme'
import { type InvoicePayment, invoiceSms, type InvoiceSender as SmsSender } from '@/lib/invoice-email'

type Props = {
  invoice: any
  sender: EmailSender
  payment: InvoicePayment | null
  isMobile: boolean
  onClose: () => void
  onSent: (invoiceId: string, status: string, to: string) => void
}

/** Preview of the invoice email (exactly what the customer receives) with Email and Text buttons. */
export function SendInvoiceModal({ invoice, sender, payment, onClose, onSent }: Props) {
  const phone = useIsPhone()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const to = String(invoice.customers?.email || '').trim()
  const tel = String(invoice.customers?.phone || '').trim()
  const rendered = renderAutomation(invoiceContent(invoice, sender, payment, publicInvoiceUrl(invoice.public_token)), sender)
  const subject = rendered.subject
  const preview = rendered.html

  async function send() {
    setSending(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Your session has expired. Please sign in again.')
        return
      }
      const res = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ invoice_id: invoice.id }),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok) {
        onSent(invoice.id, body.status, body.to || to)
        return
      }
      setError(body.message || 'The email could not be sent. Please try again.')
    } catch {
      setError('Could not reach Jobyra. Check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  const smsSender: SmsSender = { name: sender.name, phone: sender.phone || '', email: sender.email || '' }
  const smsHref = tel ? `sms:${tel}?body=${encodeURIComponent(invoiceSms(invoice, smsSender, payment))}` : undefined
  const metaRow: React.CSSProperties = { display: 'flex', gap: 10, minWidth: 0, fontSize: 13, color: TEXT2 }
  const metaLabel: React.CSSProperties = { color: TEXT3, width: 58, flexShrink: 0 }
  const metaValue: React.CSSProperties = { fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }

  return (
    <Modal
      title="Send invoice"
      size="lg"
      layer={450}
      busy={sending}
      flush
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={sending} style={BTN.secondary}>Cancel</button>
          <a
            href={smsHref}
            aria-disabled={!smsHref}
            style={{ ...BTN.secondary, textDecoration: 'none', opacity: smsHref ? 1 : 0.45, pointerEvents: smsHref ? 'auto' : 'none' }}
          >
            Send by text
          </a>
          <button type="button" onClick={send} disabled={sending || !to} style={{ ...BTN.primary, ...(sending || !to ? BTN.disabled : {}) }}>
            {sending && <span className="btn-spinner" aria-hidden="true" />}
            <span aria-live="polite">{sending ? 'Sending…' : 'Send by email'}</span>
          </button>
        </>
      }
    >
      <div style={{ padding: phone ? '12px 16px' : '12px 24px', borderBottom: `1px solid ${LINE}`, display: 'grid', gap: 6 }}>
        <div style={{ fontSize: 12, color: TEXT3, marginBottom: 2 }}>This is exactly what the customer will receive.</div>
        <div style={metaRow}>
          <span style={metaLabel}>To</span>
          <span style={metaValue}>{to || 'No email saved for this customer'}</span>
        </div>
        <div style={metaRow}>
          <span style={metaLabel}>Subject</span>
          <span style={metaValue}>{subject}</span>
        </div>
      </div>

      <iframe title="Invoice email preview" srcDoc={preview} sandbox="" style={{ display: 'block', width: '100%', height: phone ? 380 : 460, border: 'none', background: '#F4F6F8' }} />

      {error && (
        <div style={{ margin: phone ? '12px 16px' : '12px 24px', fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>{error}</div>
      )}
    </Modal>
  )
}
