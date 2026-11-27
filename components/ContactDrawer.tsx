'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AppIcon } from '@/components/AppIcon'
import { Select } from '@/components/Select'
import { useBusinessData } from '@/lib/business-context'
import { CONTACT_EMAIL_TEMPLATES, contactEmailBody, type ContactEmailTemplateId } from '@/lib/contact-email'
import { senderFrom } from '@/lib/automation-email'
import { hasPromoOfferPlaceholder, SAMPLE_PROMO_EMAIL, sanitizePromoEmailContent, type PromoEmailContent, type PromoEmailSection } from '@/lib/promo-email'
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
  const [promoEnabled, setPromoEnabled] = useState(false)
  const [promoBusinessId, setPromoBusinessId] = useState('')
  const [promoContent, setPromoContent] = useState<PromoEmailContent>(SAMPLE_PROMO_EMAIL)
  const [promoLoaded, setPromoLoaded] = useState(false)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoSaving, setPromoSaving] = useState(false)
  const [promoSaved, setPromoSaved] = useState(false)

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
      setPromoEnabled(false)
      setPromoBusinessId('')
      setPromoContent(SAMPLE_PROMO_EMAIL)
      setPromoLoaded(false)
      setPromoSaved(false)
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session) return
        setPromoEnabled(String(session.user.email || '').trim().toLowerCase() === 'ramizarib@hotmail.com')
        if (String(session.user.email || '').trim().toLowerCase() !== 'ramizarib@hotmail.com') return
        const { data } = await supabase.from('users').select('business_id').eq('id', session.user.id).maybeSingle()
        if (data?.business_id) setPromoBusinessId(data.business_id)
      }).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || channel !== 'email' || !customer.id || (template === 'promo' && (!promoEnabled || !promoLoaded))) return
    let active = true
    setPreviewLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Your session has expired. Please sign in again.')
        const response = await fetch('/api/contact/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
          body: JSON.stringify({ mode: 'preview', customer_id: customer.id, template, subject, message, ...(template === 'promo' ? { promo_content: promoContent } : {}) }),
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
  }, [isOpen, channel, customer.id, template, subject, message, promoEnabled, promoLoaded, promoContent])

  useEffect(() => {
    if (!isOpen || channel !== 'email' || template !== 'promo' || !promoEnabled || !promoBusinessId || promoLoaded) return
    let active = true
    setPromoLoading(true)
    try {
      const key = `jobyra:promo-email:${promoBusinessId}`
      const savedValue = window.localStorage.getItem(key)
      const saved = savedValue
        ? sanitizePromoEmailContent(JSON.parse(savedValue), promoBusinessId, process.env.NEXT_PUBLIC_SUPABASE_URL || '')
        : null
      if (active) {
        setPromoContent(saved || SAMPLE_PROMO_EMAIL)
        setSubject(saved?.subject || SAMPLE_PROMO_EMAIL.subject)
        setPromoLoaded(true)
        setPromoSaved(Boolean(saved))
        setEmailError('')
      }
    } catch {
      if (active) setEmailError('Could not read the saved campaign in this browser.')
    } finally {
      if (active) setPromoLoading(false)
    }
    return () => { active = false }
  }, [isOpen, channel, template, promoEnabled, promoBusinessId, promoLoaded])

  async function sendEmail() {
    if (!customer.email) {
      setEmailError('This customer has no email address on file.')
      return
    }
    if (!customer.id) {
      setEmailError('This customer could not be identified. Refresh the page and try again.')
      return
    }
    if (template === 'promo' && (!promoEnabled || !promoLoaded || promoLoading || !promoBusinessId)) {
      setEmailError('The promotional campaign is still loading. Please wait a moment and try again.')
      return
    }
    if (template === 'promo' && hasPromoOfferPlaceholder(promoContent)) {
      setEmailError('Replace the bracketed offer amount and date before sending this promotion.')
      return
    }
    if (template !== 'promo' && !message.trim()) {
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
        body: JSON.stringify({ customer_id: customer.id, template, subject, message, ...(template === 'promo' ? { promo_content: promoContent } : {}) }),
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

  async function savePromoCampaign() {
    setPromoSaving(true)
    setEmailError('')
    setPromoSaved(false)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Your session has expired. Please sign in again.')
      if (String(session.user.email || '').trim().toLowerCase() !== 'ramizarib@hotmail.com' || !promoBusinessId) {
        throw new Error('Promotional emails are not enabled for this account.')
      }
      const savedCampaign = sanitizePromoEmailContent(
        { ...promoContent, subject },
        promoBusinessId,
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      )
      if (!savedCampaign) throw new Error('Check that the subject, button links and required campaign text are valid.')
      window.localStorage.setItem(`jobyra:promo-email:${promoBusinessId}`, JSON.stringify(savedCampaign))
      setPromoContent(savedCampaign)
      setPromoSaved(true)
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Could not save the campaign.')
    } finally {
      setPromoSaving(false)
    }
  }

  function updatePromoSection(index: number, updates: Partial<PromoEmailSection>) {
    setPromoContent(previous => ({ ...previous, sections: previous.sections.map((section, i) => i === index ? { ...section, ...updates } : section) }))
    setPromoSaved(false)
    setEmailSent(false)
  }

  async function uploadPromoImage(target: 'hero' | 'section', file?: File, sectionIndex = 0) {
    if (!file) return
    if (!promoBusinessId) {
      setEmailError('Your business could not be identified. Refresh the page and try again.')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setEmailError('Choose a JPG, PNG or WebP image up to 5 MB.')
      return
    }
    setEmailError('')
    try {
      const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp'
      const filePath = `${promoBusinessId}/promo/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error } = await supabase.storage.from('business-logos').upload(filePath, file, {
        cacheControl: '3600', contentType: file.type, upsert: false,
      })
      if (error) throw new Error(error.message || 'Image upload failed.')
      const imageUrl = supabase.storage.from('business-logos').getPublicUrl(filePath).data.publicUrl
      setPromoContent(previous => {
        if (target === 'hero') return { ...previous, heroImage: imageUrl }
        const sections = [...previous.sections]
        const current = sections[sectionIndex] || { kicker: '', headline: '', body: '', background: '#E8F2F7', foreground: '#123C53' }
        sections[sectionIndex] = { ...current, image: imageUrl }
        return { ...previous, sections }
      })
      setPromoSaved(false)
      setEmailSent(false)
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Could not upload that image.')
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

  const emailSendDisabled = sending || emailSent || !customer.email || previewLoading || previewInfo?.can_send === false ||
    (template === 'promo' && (!promoEnabled || !promoLoaded || promoLoading || !promoBusinessId || previewInfo?.can_send !== true || hasPromoOfferPlaceholder(promoContent)))

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
              <button key={tab.key} type="button" role="radio" aria-checked={channel === tab.key} className="jb-chip" onClick={() => { setChannel(tab.key); if (tab.key !== 'email' && template === 'promo') { setTemplate('custom'); setMessage(''); setSubject('') } setEmailError(''); setEmailSent(false) }}>
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
                    setPreviewHtml('')
                    setPreviewInfo(null)
                    if (channel === 'email') {
                      setMessage(key === 'promo' ? '' : contactEmailBody(key, jobType))
                      setSubject(key === 'promo' ? promoContent.subject : '')
                    } else {
                      const bodies: Record<ContactEmailTemplateId, string> = {
                        custom: '',
                        new_quote: 'We have prepared a quote for you. Please let us know if you would like to proceed or if you have any questions.',
                        outstanding: 'This is a friendly reminder that you have an outstanding invoice with us. Please get in touch to arrange payment at your earliest convenience.',
                        service_reminder: 'It is time to schedule your next service for your ' + (jobType || 'system') + '. Give us a call or reply to book in.',
                        follow_up: 'Just following up on our recent visit. Please do not hesitate to reach out if you have any questions.',
                        review: 'Thank you for your business. If you are happy with the service, we would really appreciate a quick review.',
                        promo: '',
                      }
                      setMessage(bodies[key])
                    }
                  }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {CONTACT_EMAIL_TEMPLATES.filter(item => item.id !== 'promo' || (channel === 'email' && promoEnabled)).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                </Select>
              </div>

              {channel === 'email' && (
                <div>
                  <div style={labelStyle}>Subject</div>
                  <input value={subject} onChange={e => { setSubject(e.target.value); if (template === 'promo') setPromoContent(previous => ({ ...previous, subject: e.target.value })); setEmailSent(false); setPromoSaved(false) }} style={inputStyle} placeholder={previewInfo?.subject || 'Subject from selected template'} maxLength={150} />
                </div>
              )}

              {template === 'promo' && channel === 'email' ? (
                <div style={{ border: '1px solid ' + BORDER, borderRadius: 12, padding: 12, background: '#FAFBFC' }}>
                  <div style={{ fontSize: 13, color: TEXT2, fontWeight: 700 }}>Style 6 promotional campaign</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: TEXT3, lineHeight: 1.45 }}>Uses your business name and logo automatically. Save your edits as the default for this browser and device.</div>
                  <details style={{ marginTop: 10 }}>
                    <summary style={{ color: '#176B65', cursor: 'pointer', fontSize: 12, fontWeight: 750 }}>Edit text and images</summary>
                    <div style={{ display: 'grid', gap: 10, paddingTop: 12 }}>
                      <label><span style={labelStyle}>Preheader</span><input value={promoContent.preheader} onChange={e => { setPromoContent(p => ({ ...p, preheader: e.target.value })); setPromoSaved(false) }} maxLength={180} style={inputStyle} /></label>
                      <label><span style={labelStyle}>Eyebrow</span><input value={promoContent.eyebrow} onChange={e => { setPromoContent(p => ({ ...p, eyebrow: e.target.value })); setPromoSaved(false) }} maxLength={90} style={inputStyle} /></label>
                      <label><span style={labelStyle}>Main headline</span><input value={promoContent.headline} onChange={e => { setPromoContent(p => ({ ...p, headline: e.target.value })); setPromoSaved(false) }} maxLength={120} style={inputStyle} /></label>
                      <label><span style={labelStyle}>Introduction</span><textarea value={promoContent.intro} onChange={e => { setPromoContent(p => ({ ...p, intro: e.target.value })); setPromoSaved(false) }} maxLength={1200} style={{ ...textareaStyle, height: 82 }} /></label>
                      <label><span style={labelStyle}>Offer amount or short highlight</span><input value={promoContent.offerValue} onChange={e => { setPromoContent(p => ({ ...p, offerValue: e.target.value })); setPromoSaved(false) }} maxLength={60} style={inputStyle} placeholder="e.g. 10% OFF" /></label>
                      <label><span style={labelStyle}>Offer details and end date</span><input value={promoContent.offerDetails} onChange={e => { setPromoContent(p => ({ ...p, offerDetails: e.target.value })); setPromoSaved(false) }} maxLength={240} style={inputStyle} placeholder="e.g. when you book by 30 November" /></label>
                      <label><span style={labelStyle}>Hero image · JPG, PNG or WebP (max 5 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { void uploadPromoImage('hero', e.target.files?.[0]); e.currentTarget.value = '' }} style={{ ...inputStyle, padding: '8px 10px', height: 42 }} /></label>
                      <label><span style={labelStyle}>Hero image description</span><input value={promoContent.heroImageAlt} onChange={e => { setPromoContent(p => ({ ...p, heroImageAlt: e.target.value })); setPromoSaved(false) }} maxLength={180} style={inputStyle} /></label>
                      {promoContent.sections.map((section, index) => (
                        <div key={index} style={{ borderTop: '1px solid ' + BORDER, paddingTop: 10, display: 'grid', gap: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 750, color: TEXT2 }}>Campaign section {index + 1}</div>
                          <label><span style={labelStyle}>Section label</span><input value={section.kicker} onChange={e => updatePromoSection(index, { kicker: e.target.value })} maxLength={90} style={inputStyle} /></label>
                          <label><span style={labelStyle}>Section headline</span><input value={section.headline} onChange={e => updatePromoSection(index, { headline: e.target.value })} maxLength={120} style={inputStyle} /></label>
                          <label><span style={labelStyle}>Section copy</span><textarea value={section.body} onChange={e => updatePromoSection(index, { body: e.target.value })} maxLength={1200} style={{ ...textareaStyle, height: 82 }} /></label>
                          <label><span style={labelStyle}>Section image · JPG, PNG or WebP (max 5 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { void uploadPromoImage('section', e.target.files?.[0], index); e.currentTarget.value = '' }} style={{ ...inputStyle, padding: '8px 10px', height: 42 }} /></label>
                          <label><span style={labelStyle}>Image description</span><input value={section.imageAlt || ''} onChange={e => updatePromoSection(index, { imageAlt: e.target.value })} maxLength={180} style={inputStyle} /></label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <label><span style={labelStyle}>Section button</span><input value={section.buttonText || ''} onChange={e => updatePromoSection(index, { buttonText: e.target.value, buttonHref: e.target.value ? section.buttonHref || 'tel:' : '' })} maxLength={40} style={inputStyle} /></label>
                            <label><span style={labelStyle}>Section button link</span><input value={section.buttonHref || ''} onChange={e => updatePromoSection(index, { buttonHref: e.target.value, buttonText: e.target.value ? section.buttonText || 'GET IN TOUCH' : '' })} maxLength={500} style={inputStyle} placeholder="tel: or https://…" /></label>
                          </div>
                        </div>
                      ))}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <label><span style={labelStyle}>Button label</span><input value={promoContent.primaryButtonText} onChange={e => { setPromoContent(p => ({ ...p, primaryButtonText: e.target.value })); setPromoSaved(false) }} maxLength={40} style={inputStyle} /></label>
                        <label><span style={labelStyle}>Button link</span><input value={promoContent.primaryButtonHref} onChange={e => { setPromoContent(p => ({ ...p, primaryButtonHref: e.target.value })); setPromoSaved(false) }} maxLength={500} style={inputStyle} placeholder="tel: or https://…" /></label>
                      </div>
                      <label><span style={labelStyle}>Closing headline</span><input value={promoContent.closingHeadline} onChange={e => { setPromoContent(p => ({ ...p, closingHeadline: e.target.value })); setPromoSaved(false) }} maxLength={120} style={inputStyle} /></label>
                      <label><span style={labelStyle}>Closing copy</span><textarea value={promoContent.closing} onChange={e => { setPromoContent(p => ({ ...p, closing: e.target.value })); setPromoSaved(false) }} maxLength={800} style={{ ...textareaStyle, height: 82 }} /></label>
                    </div>
                  </details>
                  {hasPromoOfferPlaceholder(promoContent) && <div role="status" style={{ marginTop: 10, padding: '9px 10px', borderRadius: 9, background: '#FFF7E8', color: '#8A4B08', fontSize: 11, lineHeight: 1.45 }}>Complete the offer amount and end date in “Edit text and images” before sending.</div>}
                  <button type="button" onClick={savePromoCampaign} disabled={promoSaving || promoLoading} style={{ ...actionStyle, height: 38, marginTop: 11, fontSize: 12, opacity: promoSaving ? 0.65 : 1 }}>
                    {promoSaving ? 'Saving campaign…' : promoSaved ? 'Default saved on this device' : 'Save as default on this device'}
                  </button>
                </div>
              ) : (
                <div>
                  <div style={labelStyle}>Message</div>
                  <textarea
                    value={message}
                    onChange={e => { setMessage(e.target.value); setEmailSent(false) }}
                    style={textareaStyle}
                    placeholder={channel === 'text' ? 'Write your message...' : 'Write your email body...'}
                  />
                </div>
              )}

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
                        <span style={{ fontSize: 12, fontWeight: 700, color: TEXT2 }}>{template === 'promo' ? 'Style 6 promotional preview' : 'Classic email preview'}</span>
                        <span style={{ fontSize: 11, color: TEXT3, textAlign: 'right' }}>Scroll inside to read the full email</span>
                      </div>
                      {template === 'promo' && promoLoading ? (
                        <div role="status" style={{ display: 'grid', placeItems: 'center', height: 280, color: TEXT3, fontSize: 13 }}>Loading your saved campaign…</div>
                      ) : previewLoading && !previewHtml ? (
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
                <button type="button" onClick={sendEmail} disabled={emailSendDisabled} className="d-btn d-btn-primary" style={{ ...actionStyle, opacity: emailSendDisabled ? 0.6 : 1, cursor: emailSendDisabled ? 'not-allowed' : 'pointer' }}>
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
