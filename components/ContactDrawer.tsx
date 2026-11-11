'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AppIcon } from '@/components/AppIcon'
import { Select } from '@/components/Select'

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
  const [channel, setChannel] = useState<'call' | 'text' | 'email'>('call')
  const [template, setTemplate] = useState('custom')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')

  useEffect(() => {
    if (isOpen) {
      setChannel(preset?.channel || 'call')
      setTemplate('custom')
      setMessage(preset?.body || '')
      setSubject(preset?.subject || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div style={{ padding: '16px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: '17px', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Contact {customer.first_name}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ width: isMobile ? 36 : 34, height: isMobile ? 36 : 34, flexShrink: 0, borderRadius: isMobile ? 12 : 10, border: `1px solid ${BORDER}`, background: WHITE, color: TEXT3, cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: 0, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '0 20px 16px' }}>
          <div className="jb-chips" role="radiogroup" aria-label="How to contact">
            {([
              { key: 'call' as const,  label: 'Call',  icon: <IconPhone size={14} /> },
              { key: 'text' as const,  label: 'Text',  icon: <IconMessage size={14} /> },
              { key: 'email' as const, label: 'Email', icon: <IconMail size={14} /> },
            ]).map(tab => (
              <button key={tab.key} type="button" role="radio" aria-checked={channel === tab.key} className="jb-chip" onClick={() => setChannel(tab.key)}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
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
              <Select
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
              </Select>
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
