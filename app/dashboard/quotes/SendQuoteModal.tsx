'use client'

import React, { useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BTN, FIELD, LABEL, LINE, Modal, RED, TEXT2, TEXT3, useIsPhone } from '@/components/forms'
import { renderEmail, renderText, type EmailSender } from '@/lib/email-theme'
import { quoteSendContent, quoteSubject } from '@/lib/quote-email'
import { quoteLink } from '@/lib/site'
import { money } from '@/lib/format'
import { type Quote } from './types'

type Props = {
  quote: Quote
  sender: EmailSender
  onClose: () => void
  /** Called after the email went out, or after the user marked it as sent by hand. */
  onSent: (quoteId: string, status: string, sentAt: string, to: string | null) => void
  onNotice: (msg: string) => void
}

/** Preview of the quote email (exactly what the customer receives), an optional personal note, and a Send button. */
export function SendQuoteModal({ quote, sender, onClose, onSent, onNotice }: Props) {
  const phone = useIsPhone()
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const to = String(quote.customers?.email || '').trim()
  const link = quoteLink(quote.public_token)
  const subject = quoteSubject(quote, sender)

  // renderEmail already returns a complete HTML document.
  const preview = useMemo(() => renderEmail('classic', quoteSendContent(quote, sender, link, note), sender), [quote, sender, link, note])

  async function send() {
    setSending(true)
    setError('')
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setError('Your session has expired. Please sign in again.')
        setSending(false)
        return
      }
      const res = await fetch('/api/quotes/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ quote_id: quote.id, note }),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok) {
        onSent(quote.id, body.status, body.sent_at, body.to || to)
        return
      }
      if (body.error === 'not_configured') {
        onNotice('Email sending isn’t switched on yet, so a plain draft opened in your mail app.')
        const text = renderText(quoteSendContent(quote, sender, link, note), sender)
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
        onClose()
        return
      }
      setError(body.message || 'The email could not be sent. Please try again.')
    } catch {
      setError('Could not reach Jobyra. Check your connection and try again.')
    }
    setSending(false)
  }

  // For a customer with no email: copy the link to paste into a text, then mark the quote as sent.
  async function copyAndMark() {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      /* the link is shown below to copy by hand */
    }
    const sentAt = new Date().toISOString()
    const patch: Record<string, unknown> = { sent_at: sentAt }
    if (quote.status === 'draft') patch.status = 'sent'
    const { error: err } = await supabase.from('quotes').update(patch).eq('id', quote.id)
    if (err) {
      setError(err.message)
      return
    }
    onNotice('Link copied. Paste it into a text or message to your customer.')
    onSent(quote.id, quote.status === 'draft' ? 'sent' : quote.status, sentAt, null)
  }

  const tel = String(quote.customers?.phone || '').trim()
  const smsBody = `Hi ${quote.customers?.first_name || 'there'}, it's ${sender.name || 'us'}. Your quote ${quote.quote_number} for ${money(quote.total)} is ready: ${link}`
  const smsHref = tel ? `sms:${tel}?body=${encodeURIComponent(smsBody)}` : undefined

  // The quote page only works once the quote is not a draft, so sending by text marks it as sent.
  async function markSentByText() {
    const sentAt = new Date().toISOString()
    const patch: Record<string, unknown> = { sent_at: sentAt }
    if (quote.status === 'draft') patch.status = 'sent'
    const { error: err } = await supabase.from('quotes').update(patch).eq('id', quote.id)
    if (!err) onSent(quote.id, quote.status === 'draft' ? 'sent' : quote.status, sentAt, null)
  }

  return (
    <Modal
      title={`Send ${quote.quote_number}`}
      size="lg"
      layer={500}
      busy={sending}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} style={BTN.secondary}>Cancel</button>
          {smsHref && (
            <a href={smsHref} onClick={markSentByText} style={{ ...BTN.secondary, textDecoration: 'none' }}>
              Send by text
            </a>
          )}
          {to ? (
            <button type="button" onClick={send} disabled={sending} style={{ ...BTN.primary, ...(sending ? BTN.disabled : {}) }}>
              {sending ? 'Sending...' : 'Send quote'}
            </button>
          ) : (
            <button type="button" onClick={copyAndMark} style={BTN.primary}>Copy link and mark as sent</button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.5 }}>
          {to ? (
            <>
              To <b>{to}</b>. They get a button to a private page where they can look it over, choose extras, accept, or ask a question.
            </>
          ) : (
            <span style={{ color: RED }}>This customer has no email address saved. Copy the link instead and send it by text or message.</span>
          )}
        </div>

        <div>
          <label style={LABEL}>Personal note (optional)</label>
          <textarea
            style={{ ...FIELD, minHeight: 72, height: 72, padding: 12, resize: 'vertical' }}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Thanks for having us out today. Here is the quote we talked about."
            maxLength={1000}
          />
        </div>

        <iframe title="Quote email preview" srcDoc={preview} sandbox="" style={{ width: '100%', height: phone ? 420 : 460, border: `1px solid ${LINE}`, borderRadius: 12, background: '#fff' }} />

        <div style={{ fontSize: 12, color: TEXT3, wordBreak: 'break-all' }}>Quote page: {link}</div>
        {error && <div style={{ fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>{error}</div>}
      </div>
    </Modal>
  )
}
