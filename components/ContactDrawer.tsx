'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AppIcon } from '@/components/AppIcon'
import { Select } from '@/components/Select'
import { useBusinessData } from '@/lib/business-context'
import { CONTACT_EMAIL_TEMPLATES, contactEmailBody, type ContactEmailTemplateId } from '@/lib/contact-email'
import { senderFrom } from '@/lib/automation-email'
import { supabase } from '@/lib/supabase'

const TEAL = '#2AA198'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const WHITE = '#FFFFFF'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

function IconPhone({ size = 15 }: { size?: number }) {
  return <AppIcon name="call" size={size} />
}

function IconMessage({ size = 15 }: { size?: number }) {
  return <AppIcon name="message" size={size} />
}

function IconMail({ size = 15 }: { size?: number }) {
  return <AppIcon name="mail" size={size} />
}

export interface ContactCustomer {
  id?: string
  first_name?: string
  last_name?: string
  phone?: string
  email?: string
}

interface Props {
  customer: ContactCustomer
  jobType?: string
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
  /** Optional prefilled message (e.g. an invoice) and the channel to open on */
  preset?: { channel?: 'call' | 'text' | 'email'; subject?: string; body?: string }
}

export function ContactDrawer({ customer, jobType, isOpen, onClose, isMobile, preset }: Props) {
  const { business } = useBusinessData()
  const [channel, setChannel] = useState<'call' | 'text' | 'email'>('call')
  const [template, setTemplate] = useState<ContactEmailTemplateId>('custom')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [sending, setSending] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewInfo, setPreviewInfo] = useState<{ subject?: string; can_send?: boolean; needs_resource?: boolean; create_url?: string } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const sender = useMemo(() => senderFrom(business), [business])

  useEffect(() => {
    if (isOpen) {
      setChannel(preset?.channel || 'call')
      setTemplate('custom')
      setMessage(preset?.body || '')
      setSubject(preset?.subject || '')
      setSending(false)
      setEmailError('')
      setEmailSent(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || channel !== 'email' || !customer.id) return
    let active = true
    setPreviewLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Your session has expired. Please sign in again.')
        const response = await fetch('/api/contact/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
          body: JSON.stringify({ mode: 'preview', customer_id: customer.id, template, subject, message }),
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.message || 'Could not load the email preview.')
        if (active) {
          setPreviewHtml(result.html || '')
          setPreviewInfo(result)
          setEmailError('')
        }
      } catch (error) {
        if (active) {
          setPreviewHtml('')
          setPreviewInfo(null)
          setEmailError(error instanceof Error ? error.message : 'Could not load the email preview.')
        }
      } finally {
        if (active) setPreviewLoading(false)
      }
    }, 250)
    return () => { active = false; window.clearTimeout(timer) }
  }, [isOpen, channel, customer.id, template, subject, message])

  async function sendEmail() {
    if (!customer.email) {
      setEmailError('This customer has no email address on file.')
      return
    }
    if (!customer.id) {
      setEmailError('This customer could not be identified. Refresh the page and try again.')
      return
    }
    if (!message.trim()) {
      setEmailError('Write a message before sending.')
      return
    }

    setSending(true)
    setEmailError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setEmailError('Your session has expired. Please sign in again.')
        return
      }
      const response = await fetch('/api/contact/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({ customer_id: customer.id, template, subject, message }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        setEmailError(result.message || 'The email could not be sent. Please try again.')
      } else {
        setEmailSent(true)
      }
    } catch {
      setEmailError('Could not reach Jobyra. Check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    borderRadius: '10px',
    border: '1px solid ' + BORDER,
    background: WHITE,
    color: TEXT,
    fontFamily: FONT,
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    height: '110px',
    padding: '10px 12px',
    resize: 'vertical',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: TEXT3,
    marginBottom: '6px',
    display: 'block',
  }

  const actionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    height: '44px',
    background: TEAL,
    color: WHITE,
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 700,
    textDecoration: 'none',
    fontFamily: FONT,
    cursor: 'pointer',
    width: '100%',
  }

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,10,10,0.45)',
        zIndex: 400,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : '20px',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={'Contact ' + (customer.first_name || 'customer')}
        onClick={e => e.stopPropagation()}
        style={{
          background: WHITE,
          borderRadius: isMobile ? '20px 20px 0 0' : '16px',
          width: '100%',
          maxWidth: isMobile ? '100%' : '560px',
          maxHeight: isMobile ? '92dvh' : '90dvh',
          minHeight: isMobile ? 'min(62dvh, 480px)' : 0,
          border: '1px solid ' + BORDER,
          overflow: 'hidden',
          fontFamily: FONT,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '16px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div style={{ fontSize: '17px', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Contact {customer.first_name}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ width: isMobile ? 36 : 34, height: isMobile ? 36 : 34, flexShrink: 0, borderRadius: isMobile ? 12 : 10, border: '1px solid ' + BORDER, background: WHITE, color: TEXT3, cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: 0, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '0 20px 14px', flexShrink: 0 }}>
          <div className="jb-chips" role="radiogroup" aria-label="How to contact">
            {([
              { key: 'call' as const, label: 'Call', icon: <IconPhone size={14} /> },
              { key: 'text' as const, label: 'Text', icon: <IconMessage size={14} /> },
              { key: 'email' as const, label: 'Email', icon: <IconMail size={14} /> },
            ]).map(tab => (
              <button key={tab.key} type="button" role="radio" aria-checked={channel === tab.key} className="jb-chip" onClick={() => { setChannel(tab.key); setEmailError(''); setEmailSent(false) }}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>

        {channel === 'call' ? (
          <div style={{ padding: '0 20px 24px', overflowY: 'auto' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: TEXT3, marginBottom: '14px' }}>
              {customer.phone ? 'Will dial ' + customer.phone : 'No phone number on file'}
            </div>
            <a
              href={customer.phone ? 'tel:' + customer.phone : undefined}
              style={{ ...actionStyle, background: customer.phone ? TEAL : '#E2E8F0', color: customer.phone ? WHITE : TEXT3, cursor: customer.phone ? 'pointer' : 'default' }}
            >
              <IconPhone size={15} />
              {customer.phone ? 'Call ' + customer.first_name : 'No phone number on file'}
            </a>
          </div>
        ) : (
          <>
            <div style={{ padding: '0 20px 12px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>
              <div>
                <div style={labelStyle}>Template</div>
                <Select
                  value={template}
                  onChange={e => {
                    const key = e.target.value as ContactEmailTemplateId
                    setTemplate(key)
                    setEmailError('')
                    setEmailSent(false)
                    if (channel === 'email') {
                      setMessage(contactEmailBody(key, jobType))
                    setSubject('')
                    } else {
                      const bodies: Record<ContactEmailTemplateId, string> = {
                        custom: '',
                        new_quote: 'We have prepared a quote for you. Please let us know if you would like to proceed or if you have any questions.',
                        outstanding: 'This is a friendly reminder that you have an outstanding invoice with us. Please get in touch to arrange payment at your earliest convenience.',
                        service_reminder: 'It is time to schedule your next service for your ' + (jobType || 'system') + '. Give us a call or reply to book in.',
                        follow_up: 'Just following up on our recent visit. Please do not hesitate to reach out if you have any questions.',
                        review: 'Thank you for your business. If you are happy with the service, we would really appreciate a quick review.',
                      }
                      setMessage(bodies[key])
                    }
                  }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {CONTACT_EMAIL_TEMPLATES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                </Select>
              </div>

              {channel === 'email' && (
                <div>
                  <div style={labelStyle}>Subject</div>
                  <input value={subject} onChange={e => { setSubject(e.target.value); setEmailSent(false) }} style={inputStyle} placeholder={previewInfo?.subject || 'Subject from selected template'} maxLength={150} />
                </div>
              )}

              <div>
                <div style={labelStyle}>Message</div>
                <textarea
                  value={message}
                  onChange={e => { setMessage(e.target.value); setEmailSent(false) }}
                  style={textareaStyle}
                  placeholder={channel === 'text' ? 'Write your message...' : 'Write your email body...'}
                />
              </div>

              {channel === 'text' ? (
                <a
                  href={customer.phone ? 'sms:' + customer.phone + (message ? '?body=' + encodeURIComponent(message) : '') : undefined}
                  style={{ ...actionStyle, background: customer.phone ? TEAL : '#E2E8F0', color: customer.phone ? WHITE : TEXT3, cursor: customer.phone ? 'pointer' : 'default' }}
                >
                  <IconMessage size={15} />
                  {customer.phone ? 'Open Messages' : 'No phone number on file'}
                </a>
              ) : (
                <div className="jobyra-email-ui">
                  {previewInfo?.needs_resource && (
                    <div role="status" style={{ marginBottom: 8, border: '1px solid #F2D59B', background: '#FFFAEB', color: '#7A4B00', borderRadius: 10, padding: '10px 12px', fontSize: 12, lineHeight: 1.45 }}>
                      {template === 'new_quote' ? 'There is no sent quote for this customer yet.' : template === 'outstanding' ? 'There is no outstanding invoice for this customer yet.' : 'There is no service record for this customer yet.'}
                      {previewInfo.create_url && <a href={previewInfo.create_url} style={{ display: 'inline-block', marginLeft: 6, color: '#176B65', fontWeight: 700 }}>Create one</a>}
                    </div>
                  )}
                  <div className="d-card d-card-border" style={{ overflow: 'hidden', borderRadius: 12, background: '#FFFFFF' }}>
                    <div className="d-card-body" style={{ padding: 0, gap: 0 }}>
                      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid ' + BORDER }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: TEXT2 }}>Classic email preview</span>
                        <span style={{ fontSize: 11, color: TEXT3, textAlign: 'right' }}>Scroll inside to read the full email</span>
                      </div>
                      {previewLoading && !previewHtml ? (
                        <div role="status" style={{ display: 'grid', placeItems: 'center', height: 280, color: TEXT3, fontSize: 13 }}>Preparing email preview…</div>
                      ) : previewHtml ? (
                        <iframe title="Email preview — scroll inside to see the full message" srcDoc={previewHtml} sandbox="" scrolling="yes" style={{ display: 'block', width: '100%', height: 'min(42dvh, 420px)', minHeight: 260, border: 'none', background: '#F4F6F8' }} />
                      ) : (
                        <div role="status" style={{ display: 'grid', placeItems: 'center', height: 280, color: TEXT3, fontSize: 13 }}>The preview is unavailable.</div>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: TEXT3, overflowWrap: 'anywhere' }}>
                    To: {customer.email || 'No email address on file'} · From: {sender.name || 'Your business'}
                  </div>
                </div>
              )}
            </div>

            {channel === 'email' && (
              <div style={{ padding: '12px 20px calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid ' + BORDER, flexShrink: 0, background: WHITE }}>
                {emailError && <div role="alert" style={{ marginBottom: 10, fontSize: 12, color: '#B42318', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '8px 10px' }}>{emailError}</div>}
                {emailSent && <div role="status" style={{ marginBottom: 10, fontSize: 12, color: '#17706A' }}>Email sent to {customer.email}.</div>}
                <button type="button" onClick={sendEmail} disabled={sending || emailSent || !customer.email || previewLoading || previewInfo?.can_send === false} className="d-btn d-btn-primary" style={{ ...actionStyle, opacity: sending || emailSent || !customer.email || previewLoading || previewInfo?.can_send === false ? 0.6 : 1, cursor: sending || emailSent || !customer.email || previewLoading || previewInfo?.can_send === false ? 'not-allowed' : 'pointer' }}>
                  <IconMail size={15} />
                  {sending ? 'Sending…' : emailSent ? 'Email sent' : customer.email ? 'Send email' : 'No email address on file'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
