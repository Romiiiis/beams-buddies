'use client'

import React, { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'

const A = '#1C1C1E'
const TEAL = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#EBEBEB'
const BG = '#FAFAF8'

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
      device_type: /iPhone|iPad|Android/.test(navigator.userAgent)
        ? (/Android/.test(navigator.userAgent) ? 'android' : 'ios')
        : 'web',
    })

    setSubmitting(false)
    setStep('success')
  }

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const input = {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    borderRadius: '8px',
    border: `1px solid ${BORDER}`,
    background: '#fff',
    color: TEXT,
    fontSize: '14px',
    outline: 'none',
  }

  const label = {
    fontSize: '12px',
    fontWeight: '500',
    color: TEXT2,
    marginBottom: '6px',
    display: 'block',
  }

  if (step === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '40px' }}>
          <div style={{ fontSize: '14px', color: TEXT3 }}>Loading…</div>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '32px', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: TEXT, marginBottom: '10px' }}>QR code not found</div>
          <div style={{ fontSize: '14px', color: TEXT3 }}>Invalid or expired link.</div>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: BG, padding: '32px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ height: '3px', background: TEAL }} />
            <div style={{ padding: '28px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: TEXT, marginBottom: '10px' }}>
                You're registered
              </div>
              <div style={{ fontSize: '14px', color: TEXT3 }}>
                You’ll receive service reminders automatically.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '32px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ height: '3px', background: TEAL }} />
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '4px' }}>
              {job.businesses?.name || 'TradeLink'}
            </div>
            <div style={{ fontSize: '12px', color: TEXT3 }}>
              Service registration
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '22px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: TEXT, marginBottom: '6px' }}>
            Confirm your details
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
                height: '38px',
                borderRadius: '8px',
                border: 'none',
                background: A,
                color: '#fff',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {submitting ? 'Registering…' : 'Confirm registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}