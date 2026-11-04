'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type InvoicePayment, type InvoiceSender, invoiceHtml, invoiceSms, invoiceSubject, invoiceText } from '@/lib/invoice-email'

const TEAL = '#2AA198'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const WHITE = '#FFFFFF'
const RED = '#B91C1C'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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
export function SendInvoiceModal({ invoice, sender, payment, isMobile, onClose, onSent, onNotice }: Props) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const to = String(invoice.customers?.email || '').trim()
  const phone = String(invoice.customers?.phone || '').trim()
  const subject = invoiceSubject(invoice, sender)

  const preview = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:22px 20px;background:#FFFFFF;">${invoiceHtml(invoice, sender, payment)}</body></html>`

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
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(invoiceText(invoice, sender, payment))}`
        onClose()
        return
      }
      setError(body.message || 'The email could not be sent. Please try again.')
    } catch {
      setError('Could not reach Jobyra. Check your connection and try again.')
    }
    setSending(false)
  }

  const smsHref = phone ? `sms:${phone}?body=${encodeURIComponent(invoiceSms(invoice, sender, payment))}` : undefined
  const btn: React.CSSProperties = { height: 40, padding: '0 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }

  return (
    <div
      onClick={() => { if (!sending) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 450, background: 'rgba(11,18,32,0.4)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 20, fontFamily: FONT }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ width: '100%', maxWidth: 680, maxHeight: isMobile ? '92svh' : '90vh', display: 'flex', flexDirection: 'column', background: WHITE, borderRadius: isMobile ? '18px 18px 0 0' : 16, border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px rgba(15,23,42,0.18)', overflow: 'hidden' }}
      >
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>Send invoice</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: TEXT3, marginTop: 2 }}>This is exactly what the customer will receive.</div>
          </div>
          <button type="button" onClick={onClose} disabled={sending} aria-label="Close" style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, color: TEXT3, fontSize: 20, lineHeight: 1, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ padding: '10px 20px', borderBottom: `1px solid ${BORDER}`, fontSize: 13, color: TEXT2, display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', gap: 10, minWidth: 0 }}>
            <span style={{ color: TEXT3, width: 58, flexShrink: 0 }}>To</span>
            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{to || 'No email saved for this customer'}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, minWidth: 0 }}>
            <span style={{ color: TEXT3, width: 58, flexShrink: 0 }}>Subject</span>
            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subject}</span>
          </div>
        </div>

        <iframe title="Invoice email preview" srcDoc={preview} sandbox="" style={{ flex: 1, minHeight: isMobile ? 360 : 440, width: '100%', border: 'none', background: '#F4F6F8' }} />

        {error && (
          <div style={{ margin: '12px 20px 0', fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>{error}</div>
        )}

        <div style={{ padding: `14px 20px ${isMobile ? 'calc(14px + env(safe-area-inset-bottom))' : '16px'}`, borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" onClick={onClose} disabled={sending} style={{ ...btn, border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, cursor: 'pointer' }}>Cancel</button>
          <a
            href={smsHref}
            aria-disabled={!smsHref}
            style={{ ...btn, border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, opacity: smsHref ? 1 : 0.45, pointerEvents: smsHref ? 'auto' : 'none' }}
          >
            Send by text
          </a>
          <button
            type="button"
            onClick={send}
            disabled={sending || !to}
            style={{ ...btn, border: 'none', background: TEAL, color: WHITE, cursor: sending || !to ? 'default' : 'pointer', opacity: sending || !to ? 0.55 : 1 }}
          >
            {sending ? 'Sending…' : 'Send by email'}
          </button>
        </div>
      </div>
    </div>
  )
}
