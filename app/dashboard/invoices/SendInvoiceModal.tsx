'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BTN, LINE, Modal, RED, TEXT2, TEXT3, useIsPhone } from '@/components/forms'
import { type InvoicePayment, type InvoiceSender, invoiceHtml, invoiceSms, invoiceSubject, invoiceText } from '@/lib/invoice-email'
import { invoiceLink } from '@/lib/site'

type Props = {
  invoice: any
  sender: InvoiceSender
  payment: InvoicePayment | null
  isMobile: boolean
  onClose: () => void
  onSent: (invoiceId: string, status: string, to: string) => void
  onNotice: (msg: string) => void
}

/** Preview of the invoice email (exactly what the customer receives) with Email and Text buttons. */
export function SendInvoiceModal({ invoice, sender, payment, onClose, onSent, onNotice }: Props) {
  const phone = useIsPhone()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const to = String(invoice.customers?.email || '').trim()
  const tel = String(invoice.customers?.phone || '').trim()
  const subject = invoiceSubject(invoice, sender)
  const link = invoice.public_token ? invoiceLink(invoice.public_token) : undefined

  const preview = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:22px 20px;background:#FFFFFF;">${invoiceHtml(invoice, sender, payment, link)}</body></html>`

  async function send() {
    setSending(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Your session has expired. Please sign in again.')
        setSending(false)
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
      if (body.error === 'not_configured') {
        onNotice('Email sending isn’t switched on yet, so a plain draft opened in your mail app.')
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(invoiceText(invoice, sender, payment, link))}`
        onClose()
        return
      }
      setError(body.message || 'The email could not be sent. Please try again.')
    } catch {
      setError('Could not reach Jobyra. Check your connection and try again.')
    }
    setSending(false)
  }

  const smsHref = tel ? `sms:${tel}?body=${encodeURIComponent(invoiceSms(invoice, sender, payment, link))}` : undefined
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
            {sending ? 'Sending…' : 'Send by email'}
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
