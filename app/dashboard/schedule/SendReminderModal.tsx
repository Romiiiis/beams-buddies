'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type ReminderSender } from '@/lib/reminder-email'
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
export function SendReminderModal({ job, sender, isMobile, onClose, onSent, fromAddress }: Props) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState('')
  const [subject, setSubject] = useState('Loading preview…')
  const to = String(job.customers?.email || '').trim()
  const lastSent = formatSent(job.last_reminder_at)

  // Ask the server for the same signed booking link and renderer used by send and automations.
  useEffect(() => {
    let active = true
    async function loadPreview() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Please sign in again to load the preview.')
        const res = await fetch('/api/reminders/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ job_id: job.id, mode: 'preview' }),
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body.message || 'Could not load the email preview.')
        if (active) {
          setPreview(body.html || '')
          setSubject(body.subject || '')
        }
      } catch (previewError) {
        if (active) setError(previewError instanceof Error ? previewError.message : 'Could not load the email preview.')
      }
    }
    loadPreview()
    return () => { active = false }
  }, [job.id])

  async function send() {
    setSending(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Your session has expired. Please sign in again.')
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
      setError(body.message || 'The email could not be sent. Please try again.')
    } catch {
      setError('Could not reach Jobyra. Check your connection and try again.')
    } finally {
      setSending(false)
    }
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
            <span aria-live="polite">{sending ? 'Sending…' : lastSent ? 'Send again' : 'Send reminder'}</span>
          </button>
        </>
      }
    >
      <div className="jobyra-email-ui">
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

      <div className="d-card d-card-border" style={{ margin: phone ? '12px 16px 16px' : '12px 24px 16px', overflow: 'hidden', borderRadius: 12, background: '#FFFFFF' }}>
        <div className="d-card-body" style={{ padding: 0, gap: 0 }}>
          <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: `1px solid ${LINE}` }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT2 }}>Email preview</span>
            <span style={{ fontSize: 11, color: TEXT3, textAlign: 'right' }}>Scroll inside to read the full email</span>
          </div>
          {preview ? (
            <iframe title="Email preview — scroll inside to see the full message" srcDoc={preview} sandbox="" scrolling="yes" style={{ display: 'block', width: '100%', height: 'min(48dvh, 520px)', minHeight: 260, border: 'none', background: '#F4F6F8' }} />
          ) : (
            <div role="status" style={{ display: 'grid', placeItems: 'center', height: 280, color: TEXT3, fontSize: 13 }}>Preparing email preview…</div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ margin: phone ? '12px 16px' : '12px 24px', fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>
          {error}
        </div>
      )}
      </div>
    </Modal>
  )
}
