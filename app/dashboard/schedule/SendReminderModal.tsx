'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type ReminderSender, reminderHtml, reminderSubject, reminderText } from '@/lib/reminder-email'

const TEAL = '#2AA198'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const WHITE = '#FFFFFF'
const RED = '#B91C1C'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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

  return (
    <div
      onClick={() => { if (!sending) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(11,18,32,0.4)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : 20,
        fontFamily: FONT,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-reminder-title"
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: isMobile ? '92svh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: WHITE,
          borderRadius: isMobile ? '18px 18px 0 0' : 16,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div id="send-reminder-title" style={{ fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>Send reminder</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: TEXT3, marginTop: 2 }}>
              {lastSent ? `Last reminder sent ${lastSent}` : 'This is exactly what the customer will receive.'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            aria-label="Close"
            style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, color: TEXT3, fontSize: 20, lineHeight: 1, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '10px 20px', borderBottom: `1px solid ${BORDER}`, fontSize: 13, color: TEXT2, display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', gap: 10, minWidth: 0 }}>
            <span style={{ color: TEXT3, width: 58, flexShrink: 0 }}>From</span>
            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sender.name ? `${sender.name} <${fromAddress}>` : fromAddress}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, minWidth: 0 }}>
            <span style={{ color: TEXT3, width: 58, flexShrink: 0 }}>To</span>
            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{to}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, minWidth: 0 }}>
            <span style={{ color: TEXT3, width: 58, flexShrink: 0 }}>Subject</span>
            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subject}</span>
          </div>
        </div>

        <iframe
          title="Email preview"
          srcDoc={preview}
          sandbox=""
          style={{ flex: 1, minHeight: isMobile ? 360 : 440, width: '100%', border: 'none', background: '#F4F6F8' }}
        />

        {error && (
          <div style={{ margin: '12px 20px 0', fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>
            {error}
          </div>
        )}

        <div
          style={{
            padding: `14px 20px ${isMobile ? 'calc(14px + env(safe-area-inset-bottom))' : '16px'}`,
            borderTop: `1px solid ${BORDER}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            style={{ height: 40, padding: '0 16px', borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={send}
            disabled={sending}
            style={{ height: 40, padding: '0 20px', borderRadius: 10, border: 'none', background: TEAL, color: WHITE, fontSize: 13, fontWeight: 700, cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.7 : 1, fontFamily: FONT, flex: isMobile ? 1 : undefined }}
          >
            {sending ? 'Sending…' : lastSent ? 'Send again' : 'Send reminder'}
          </button>
        </div>
      </div>
    </div>
  )
}
