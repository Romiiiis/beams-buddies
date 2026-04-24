'use client'

import React, { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'

const TEAL = '#1F9E94'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#475569'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

interface Platform {
  id: string
  name: string
  url: string
}

const TYPE = {
  label: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.08em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  bodySm: {
    fontSize: '11px',
    fontWeight: 500,
    color: TEXT3,
    lineHeight: 1.45,
  },
  titleSm: {
    fontSize: '12px',
    fontWeight: 800,
    color: TEXT,
    lineHeight: 1.3,
  },
}

export default function RegisterPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [step, setStep] = useState<'loading' | 'found' | 'success' | 'error'>('loading')
  const [job, setJob] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, customers(first_name, last_name, email, phone), businesses(id, name, phone, email)')
        .eq('qr_code_token', token)
        .single()

      if (error || !data) {
        setStep('error')
        return
      }

      setJob(data)
      setForm({
        first_name: data.customers?.first_name || '',
        last_name: data.customers?.last_name || '',
        email: data.customers?.email || '',
        phone: data.customers?.phone || '',
      })

      if (data.business_id) {
        const { data: s } = await supabase
          .from('business_settings')
          .select('*')
          .eq('business_id', data.business_id)
          .single()
        setSettings(s)
      }

      setStep('found')
    }

    load()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    await supabase
      .from('customers')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
      })
      .eq('id', job.customer_id)

    await supabase.from('app_registrations').insert({
      job_id: job.id,
      customer_id: job.customer_id,
      device_type: /iPhone|iPad|Android/.test(navigator.userAgent)
        ? /Android/.test(navigator.userAgent)
          ? 'android'
          : 'ios'
        : 'web',
    })

    setSubmitting(false)
    setStep('success')
  }

  // Open link immediately (required for mobile Safari), then fire API
  async function handleReviewClick(url: string) {
    window.open(url, '_blank', 'noreferrer')
    try {
      await fetch('/api/review-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: job.id }),
      })
    } catch {
      // silent — link already opened
    }
  }

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const input: React.CSSProperties = {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    borderRadius: '10px',
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT,
    fontSize: '14px',
    outline: 'none',
    fontFamily: FONT,
  }

  const label: React.CSSProperties = {
    ...TYPE.label,
    marginBottom: '6px',
    display: 'block',
  }

  const shellCard: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
    overflow: 'hidden',
  }

  if (step === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: FONT }}>
        <div style={{ ...shellCard, padding: '36px 40px', textAlign: 'center', minWidth: '280px' }}>
          <div style={{ ...TYPE.titleSm, fontSize: '14px', marginBottom: '6px' }}>Loading registration</div>
          <div style={TYPE.bodySm}>Please wait a moment…</div>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: HEADER_BG, padding: '20px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.68)', marginBottom: '5px' }}>Service registration</div>
          <div style={{ fontSize: '34px', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px' }}>QR code not found</div>
          <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', maxWidth: '760px' }}>
            This registration link looks invalid or may have expired.
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ ...shellCard, maxWidth: '420px', width: '100%', padding: '28px', textAlign: 'center' }}>
            <div style={{ ...TYPE.titleSm, fontSize: '18px', marginBottom: '10px' }}>Invalid registration link</div>
            <div style={{ fontSize: '14px', color: TEXT3, lineHeight: 1.6 }}>
              Please contact the business directly and ask for a new QR code.
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    const reviewPlatforms: Platform[] = [
      ...(settings?.google_review_url ? [{ id: 'google', name: 'Google', url: settings.google_review_url }] : []),
      ...(settings?.facebook_review_url ? [{ id: 'facebook', name: 'Facebook', url: settings.facebook_review_url }] : []),
      ...((settings?.custom_review_platforms || []).filter((p: Platform) => p?.url)),
    ]

    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: HEADER_BG, padding: '20px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.68)', marginBottom: '5px' }}>
            {job?.businesses?.name || 'TradeLink'}
          </div>
          <div style={{ fontSize: '34px', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px' }}>
            You're registered
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', maxWidth: '760px' }}>
            You'll receive service reminders automatically for this installation.
          </div>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '520px', width: '100%', margin: '0 auto' }}>
          <div style={{ ...shellCard, padding: '24px', textAlign: 'center' }}>
            <div style={{ ...TYPE.label, color: TEAL, marginBottom: '8px' }}>Registration complete</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: TEXT, marginBottom: '8px' }}>
              Thanks, {form.first_name || 'there'}
            </div>
            <div style={{ fontSize: '14px', color: TEXT3, lineHeight: 1.6 }}>
              Your details are confirmed and your service history can now be tracked more easily.
            </div>
          </div>

          {reviewPlatforms.length > 0 && (
            <div style={{ ...shellCard, padding: '24px' }}>
              <div style={{ ...TYPE.label, color: TEAL, marginBottom: '8px' }}>Leave a review</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: TEXT, marginBottom: '6px' }}>
                How was your experience?
              </div>
              <div style={{ fontSize: '13px', color: TEXT3, lineHeight: 1.6, marginBottom: '14px' }}>
                A quick review makes a huge difference — it only takes 30 seconds.
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                {reviewPlatforms.map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => handleReviewClick(platform.url)}
                    style={{
                      height: '44px',
                      borderRadius: '10px',
                      border: `1px solid ${BORDER}`,
                      background: platform.id === 'google' ? TEAL : WHITE,
                      color: platform.id === 'google' ? WHITE : TEXT2,
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: FONT,
                      width: '100%',
                    }}
                  >
                    Leave a review on {platform.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: HEADER_BG, padding: '20px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.68)', marginBottom: '5px' }}>
          {job?.businesses?.name || 'TradeLink'}
        </div>
        <div style={{ fontSize: '34px', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px' }}>
          Service registration
        </div>
        <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', maxWidth: '760px' }}>
          Confirm your details so the business can send you future service reminders and keep your installation on file.
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '520px', width: '100%', margin: '0 auto' }}>
        <div style={{ ...shellCard, padding: '20px' }}>
          <div style={{ ...TYPE.label, color: TEAL, marginBottom: '6px' }}>Registered unit</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: TEXT, marginBottom: '4px' }}>
            {job?.brand || 'Installed unit'} {job?.capacity_kw ? `${job.capacity_kw}kW` : ''}
          </div>
          <div style={TYPE.bodySm}>
            {job?.businesses?.phone || job?.businesses?.email || 'Service registration'}
          </div>
        </div>

        <div style={{ ...shellCard, padding: '22px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: TEXT, marginBottom: '6px' }}>
            Confirm your details
          </div>
          <div style={{ fontSize: '13px', color: TEXT3, marginBottom: '16px', lineHeight: 1.6 }}>
            Make sure these details are correct before completing registration.
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={label}>First name</label>
                <input style={input} value={form.first_name} onChange={e => set('first_name', e.target.value)} />
              </div>
              <div>
                <label style={label}>Last name</label>
                <input style={input} value={form.last_name} onChange={e => set('last_name', e.target.value)} />
              </div>
            </div>

            <div>
              <label style={label}>Email</label>
              <input type="email" style={input} value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            <div>
              <label style={label}>Phone</label>
              <input style={input} value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                height: '40px',
                borderRadius: '10px',
                border: 'none',
                background: TEAL,
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: FONT,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Registering...' : 'Confirm registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}