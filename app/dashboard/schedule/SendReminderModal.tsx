'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type ReminderSender, reminderHtml, reminderSubject, reminderText } from '@/lib/reminder-email'
import { BTN, LINE, Modal, RED, TEXT2, TEXT3, useIsPhone } from '@/components/forms'

type Props = {
  job: any
  sender: ReminderSender
  isMobile: boolean
  onClose: () => void
  onSent: (jobId: string, sentAt: string, to: string) => void
  onNotice: (msg: string) => void
  /** Address the email is sent from, e.g. reminders@avalancheair.com.au */
  fromAddress: string
}

function formatSent(iso?: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Preview of the reminder email (exactly what the customer receives) with a one-tap Send. */
export function SendReminderModal({ job, sender, isMobile, onClose, onSent, onNotice, fromAddress }: Props) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const to = String(job.customers?.email || '').trim()
  const subject = reminderSubject(job, sender)
  const lastSent = formatSent(job.last_reminder_at)

  // Rendered in a sandboxed frame so the email looks exactly as it will in the inbox
  const preview = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:22px 20px;background:#FFFFFF;">${reminderHtml(job, sender)}</body></html>`

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
      const res = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ job_id: job.id }),
      })
      const body = await res.json().catch(() => ({}))

      if (res.ok) {
        onSent(job.id, body.sent_at, body.to || to)
        return
      }
      if (body.error === 'not_configured') {
        // Sending isn't switched on yet: open a plain-text draft in the user's mail app instead
        onNotice('Email sending isn’t switched on yet, so a plain draft opened in your mail app.')
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(reminderText(job, sender))}`
        onClose()
        return
      }
      setError(body.message || 'The email could not be sent. Please try again.')
    } catch {
      setError('Could not reach Jobyra. Check your connection and try again.')
    }
    setSending(false)
  }

  const phone = useIsPhone()
  const metaRow: React.CSSProperties = { display: 'flex', gap: 10, minWidth: 0, fontSize: 13, color: TEXT2 }
  const metaLabel: React.CSSProperties = { color: TEXT3, width: 58, flexShrink: 0 }
  const metaValue: React.CSSProperties = { fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }

  return (
    <Modal
      title="Send reminder"
      size="lg"
      layer={450}
      busy={sending}
      flush
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={sending} style={BTN.secondary}>Cancel</button>
          <button type="button" onClick={send} disabled={sending} style={{ ...BTN.primary, ...(sending ? BTN.disabled : {}) }}>
            {sending ? 'Sending…' : lastSent ? 'Send again' : 'Send reminder'}
          </button>
        </>
      }
    >
      <div style={{ padding: phone ? '12px 16px' : '12px 24px', borderBottom: `1px solid ${LINE}`, display: 'grid', gap: 6 }}>
        <div style={{ fontSize: 12, color: TEXT3, marginBottom: 2 }}>{lastSent ? `Last reminder sent ${lastSent}` : 'This is exactly what the customer will receive.'}</div>
        <div style={metaRow}>
          <span style={metaLabel}>From</span>
          <span style={metaValue}>{sender.name ? `${sender.name} <${fromAddress}>` : fromAddress}</span>
        </div>
        <div style={metaRow}>
          <span style={metaLabel}>To</span>
          <span style={metaValue}>{to}</span>
        </div>
        <div style={metaRow}>
          <span style={metaLabel}>Subject</span>
          <span style={metaValue}>{subject}</span>
        </div>
      </div>

      <iframe title="Email preview" srcDoc={preview} sandbox="" style={{ display: 'block', width: '100%', height: phone ? 380 : 460, border: 'none', background: '#F4F6F8' }} />

      {error && (
        <div style={{ margin: phone ? '12px 16px' : '12px 24px', fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>
          {error}
        </div>
      )}
    </Modal>
  )
}
