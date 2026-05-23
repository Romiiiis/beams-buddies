'use client'

import React, { useEffect, useMemo, useState } from 'react'

const TEAL = '#1F9E94'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const WHITE = '#FFFFFF'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

function IconPhone({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91A16 16 0 0015.1 17.9l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

function IconMessage({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

function IconMail({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

export interface ContactCustomer {
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
}

export function ContactDrawer({ customer, jobType, isOpen, onClose, isMobile }: Props) {
  const [channel, setChannel] = useState<'call' | 'text' | 'email'>('call')
  const [template, setTemplate] = useState('custom')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')

  useEffect(() => {
    if (isOpen) {
      setChannel('call')
      setTemplate('custom')
      setMessage('')
      setSubject('')
    }
  }, [isOpen])

  const templates = useMemo(() => {
    const firstName = customer?.first_name || 'there'
    const type = jobType || 'your system'
    return {
      custom:           { label: 'Custom',               subject: '',                              body: '' },
      new_quote:        { label: 'New quote',            subject: 'Your Quote',                    body: `Hi ${firstName},\n\nWe've prepared a quote for you. Please let us know if you'd like to proceed or if you have any questions.\n\nThanks,\nThe team` },
      outstanding:      { label: 'Outstanding invoice',  subject: 'Outstanding Invoice Reminder',  body: `Hi ${firstName},\n\nThis is a friendly reminder that you have an outstanding invoice with us. Please get in touch to arrange payment at your earliest convenience.\n\nThanks,\nThe team` },
      service_reminder: { label: 'Service reminder',     subject: 'Service Reminder',              body: `Hi ${firstName},\n\nIt's time to schedule your next service for your ${type}. Give us a call or reply to book in.\n\nThanks,\nThe team` },
      follow_up:        { label: 'Follow-up',            subject: 'Following Up',                  body: `Hi ${firstName},\n\nJust following up on our recent visit. Please don't hesitate to reach out if you have any questions.\n\nThanks,\nThe team` },
      review:           { label: 'Review request',       subject: 'How Did We Do?',                body: `Hi ${firstName},\n\nThank you for your business! If you're happy with the service, we'd really appreciate a quick review.\n\nThanks,\nThe team` },
    }
  }, [customer, jobType])

  if (!isOpen) return null

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    borderRadius: '10px',
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT,
    fontFamily: FONT,
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    height: '130px',
    padding: '10px 12px',
    resize: 'none' as const,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: TEXT3,
    marginBottom: '6px',
    display: 'block',
  }

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
        onClick={e => e.stopPropagation()}
        style={{
          background: WHITE,
          borderRadius: isMobile ? '20px 20px 0 0' : '16px',
          width: '100%',
          maxWidth: isMobile ? '100%' : '480px',
          border: `1px solid ${BORDER}`,
          overflow: 'hidden',
          fontFamily: FONT,
        }}
      >
        <div style={{ height: '4px', background: TEAL }} />

        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '17px', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em' }}>
            Contact {customer.first_name}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: TEXT3, fontSize: '22px', lineHeight: 1, padding: '0 4px', fontFamily: FONT }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px', padding: '0 20px 16px' }}>
          {([
            { key: 'call' as const,  label: 'Call',  icon: <IconPhone size={13} /> },
            { key: 'text' as const,  label: 'Text',  icon: <IconMessage size={13} /> },
            { key: 'email' as const, label: 'Email', icon: <IconMail size={13} /> },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setChannel(tab.key)}
              style={{
                height: '34px',
                padding: '0 14px',
                borderRadius: '9px',
                border: channel === tab.key ? 'none' : `1px solid ${BORDER}`,
                background: channel === tab.key ? TEAL : WHITE,
                color: channel === tab.key ? WHITE : TEXT2,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: FONT,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {channel === 'call' ? (
          <div style={{ padding: '0 20px 24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: TEXT3, marginBottom: '14px' }}>
              {customer.phone ? `Will dial ${customer.phone}` : 'No phone number on file'}
            </div>
            <a
              href={customer.phone ? `tel:${customer.phone}` : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                height: '44px',
                background: customer.phone ? TEAL : '#E2E8F0',
                color: customer.phone ? WHITE : TEXT3,
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                fontFamily: FONT,
                cursor: customer.phone ? 'pointer' : 'default',
              }}
            >
              <IconPhone size={15} />
              {customer.phone ? `Call ${customer.first_name}` : 'No phone number on file'}
            </a>
          </div>
        ) : (
          <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={labelStyle}>Template</div>
              <select
                value={template}
                onChange={e => {
                  const key = e.target.value
                  setTemplate(key)
                  const tpl = templates[key as keyof typeof templates]
                  if (key !== 'custom' && tpl) {
                    setMessage(tpl.body)
                    setSubject(tpl.subject)
                  } else {
                    setMessage('')
                    setSubject('')
                  }
                }}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {Object.entries(templates).map(([key, tpl]) => (
                  <option key={key} value={key}>{tpl.label}</option>
                ))}
              </select>
            </div>

            {channel === 'email' && (
              <div>
                <div style={labelStyle}>Subject</div>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  style={inputStyle}
                  placeholder="Email subject"
                />
              </div>
            )}

            <div>
              <div style={labelStyle}>Message</div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={textareaStyle}
                placeholder={channel === 'text' ? 'Write your message...' : 'Write your email body...'}
              />
            </div>

            {channel === 'text' ? (
              <a
                href={customer.phone ? `sms:${customer.phone}${message ? `?body=${encodeURIComponent(message)}` : ''}` : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  height: '44px',
                  background: customer.phone ? TEAL : '#E2E8F0',
                  color: customer.phone ? WHITE : TEXT3,
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontFamily: FONT,
                  cursor: customer.phone ? 'pointer' : 'default',
                }}
              >
                <IconMessage size={15} />
                {customer.phone ? 'Open Messages' : 'No phone number on file'}
              </a>
            ) : (
              <a
                href={customer.email ? `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}` : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  height: '44px',
                  background: customer.email ? TEAL : '#E2E8F0',
                  color: customer.email ? WHITE : TEXT3,
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontFamily: FONT,
                  cursor: customer.email ? 'pointer' : 'default',
                }}
              >
                <IconMail size={15} />
                {customer.email ? 'Open Email' : 'No email address on file'}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
