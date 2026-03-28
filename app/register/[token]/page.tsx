'use client'

import React, { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'

const A = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#DEDEDE'
const BG = '#F2F3F3'

interface Platform { id: string; name: string; url: string }

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

      if (error || !data) { setStep('error'); return }
      setJob(data)
      setForm({
        first_name: data.customers?.first_name || '',
        last_name: data.customers?.last_name || '',
        email: data.customers?.email || '',
        phone: data.customers?.phone || '',
      })

      if (data.businesses?.id) {
        const { data: s } = await supabase
          .from('business_settings')
          .select('*')
          .eq('business_id', data.businesses.id)
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
    await supabase.from('customers').update({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
    }).eq('id', job.customer_id)
    await supabase.from('app_registrations').insert({
      job_id: job.id,
      customer_id: job.customer_id,
      device_type: /iPhone|iPad|Android/.test(navigator.userAgent) ? (/Android/.test(navigator.userAgent) ? 'android' : 'ios') : 'web',
    })
    setSubmitting(false)
    setStep('success')
  }

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const input: React.CSSProperties = {
    width: '100%', height: '44px', padding: '0 14px',
    borderRadius: '10px', border: `1px solid ${BORDER}`,
    background: '#fff', color: TEXT, fontFamily: 'inherit', fontSize: '15px', outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '13px', fontWeight: '500', color: TEXT2, marginBottom: '6px', display: 'block',
  }

  const allPlatforms: { name: string; url: string }[] = [
    ...(settings?.google_review_url ? [{ name: 'Google', url: settings.google_review_url }] : []),
    ...(settings?.facebook_review_url ? [{ name: 'Facebook', url: settings.facebook_review_url }] : []),
    ...(settings?.custom_review_platforms || []).filter((p: Platform) => p.name && p.url),
  ]
  const showReviews = settings?.review_discount_enabled && allPlatforms.length > 0
  const discountAmount = settings?.review_discount_amount || 10
  const discountMax = settings?.review_discount_max || 30

  if (step === 'loading') return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ fontSize: '14px', color: TEXT3 }}>Loading…</div>
    </div>
  )

  if (step === 'error') return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, padding: '40px 32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '52px', height: '52px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 7v5M11 15h.01" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round"/><circle cx="11" cy="11" r="9" stroke="#B91C1C" strokeWidth="2"/></svg>
        </div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: TEXT, marginBottom: '10px' }}>QR code not found</div>
        <div style={{ fontSize: '14px', color: TEXT3, lineHeight: 1.6 }}>This QR code is invalid or has expired. Please contact your service provider.</div>
      </div>
    </div>
  )

  if (step === 'success') return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '32px 24px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: '34px', height: '34px', background: A, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M7 2L9.5 5H11.5L9 8.5L10 12L7 10L4 12L5 8.5L2.5 5H4.5L7 2Z" fill="white"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: TEXT }}>{job.businesses?.name || 'TradeLink'}</div>
            <div style={{ fontSize: '12px', color: TEXT3 }}>Service registration</div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, padding: '28px', marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: TEXT, marginBottom: '8px' }}>You're registered</div>
          <div style={{ fontSize: '14px', color: TEXT3, lineHeight: 1.6, marginBottom: '20px' }}>
            Your unit details have been saved. You'll receive service reminders when your next service is due.
          </div>
          <div style={{ background: BG, borderRadius: '10px', padding: '14px 18px', textAlign: 'left' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Your unit</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: TEXT, marginBottom: '4px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} {job.equipment_type?.replace('_', ' ')}</div>
            {job.model && <div style={{ fontSize: '13px', color: TEXT2, marginBottom: '3px' }}>Model: {job.model}</div>}
            <div style={{ fontSize: '13px', color: TEXT2, marginBottom: '3px' }}>Installed: {new Date(job.install_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            {job.next_service_date && <div style={{ fontSize: '13px', color: A, fontWeight: '500' }}>Next service: {new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>}
          </div>
        </div>

        {showReviews && (
          <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ height: '4px', background: '#F59E0B' }} />
            <div style={{ padding: '22px' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: TEXT, marginBottom: '6px' }}>Leave a review & save</div>
              <div style={{ fontSize: '13px', color: TEXT3, lineHeight: 1.6, marginBottom: '18px' }}>
                For each review left below, receive <strong style={{ color: TEXT2 }}>${discountAmount} off</strong> your next service. Up to <strong style={{ color: TEXT2 }}>${discountMax} total.</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allPlatforms.map((p, i) => {
                  const trackUrl = `/track-review?job=${job.id}&customer=${job.customer_id}&business=${job.businesses?.id}&platform=${encodeURIComponent(p.name)}&url=${encodeURIComponent(p.url)}`
                  return (
                    <a key={i} href={trackUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: BG, textDecoration: 'none', color: TEXT }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fff', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                          {p.name.toLowerCase().includes('google') ? '🔍' : p.name.toLowerCase().includes('facebook') ? '👍' : '⭐'}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT }}>{p.name}</div>
                          <div style={{ fontSize: '12px', color: TEXT3 }}>Tap to leave a review</div>
                        </div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke={TEXT3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  )
                })}
              </div>
              <div style={{ fontSize: '11px', color: TEXT3, marginTop: '14px', textAlign: 'center' }}>
                Mention this discount to your technician at your next service booking.
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: '12px', color: TEXT3, textAlign: 'center', lineHeight: 1.6 }}>
          Your details are only shared with {job.businesses?.name || 'your service provider'} and used for service reminders only.
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '32px 24px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: '34px', height: '34px', background: A, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M7 2L9.5 5H11.5L9 8.5L10 12L7 10L4 12L5 8.5L2.5 5H4.5L7 2Z" fill="white"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: TEXT }}>{job.businesses?.name || 'TradeLink'}</div>
            <div style={{ fontSize: '12px', color: TEXT3 }}>Service registration</div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ height: '4px', background: A }} />
          <div style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '10px' }}>Your installed unit</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: TEXT, marginBottom: '6px' }}>
              {job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} {job.equipment_type?.replace('_', ' ')}
            </div>
            {job.model && <div style={{ fontSize: '13px', color: TEXT2, marginBottom: '3px' }}>Model: {job.model}</div>}
            {job.serial_number && <div style={{ fontSize: '13px', color: TEXT2, marginBottom: '3px' }}>Serial: {job.serial_number}</div>}
            <div style={{ fontSize: '13px', color: TEXT2, marginBottom: job.next_service_date ? '10px' : '0' }}>
              Installed: {new Date(job.install_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            {job.next_service_date && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#D1FAE5', color: '#065F46', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#065F46" strokeWidth="1.4"/><path d="M6 3.5v3l1.5 1.5" stroke="#065F46" strokeWidth="1.4" strokeLinecap="round"/></svg>
                Next service: {new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            )}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, padding: '22px', marginBottom: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: TEXT, marginBottom: '6px' }}>Confirm your details</div>
          <div style={{ fontSize: '13px', color: TEXT3, marginBottom: '20px', lineHeight: 1.5 }}>
            We'll send you service reminders so you never miss a scheduled maintenance.
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={labelStyle}>First name *</label><input required style={input} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="James"/></div>
              <div><label style={labelStyle}>Last name *</label><input required style={input} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Moretti"/></div>
            </div>
            <div><label style={labelStyle}>Email address *</label><input required type="email" style={input} value={form.email} onChange={e => set('email', e.target.value)} placeholder="james@email.com"/></div>
            <div><label style={labelStyle}>Phone number *</label><input required type="tel" style={input} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0412 345 678"/></div>
            <button type="submit" disabled={submitting}
              style={{ height: '48px', borderRadius: '10px', border: 'none', background: A, color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px' }}>
              {submitting ? 'Registering…' : 'Confirm registration'}
            </button>
          </form>
        </div>

        <div style={{ fontSize: '12px', color: TEXT3, textAlign: 'center', lineHeight: 1.6 }}>
          Your details are only shared with {job.businesses?.name || 'your service provider'} and used for service reminders only.
        </div>
      </div>
    </div>
  )
}