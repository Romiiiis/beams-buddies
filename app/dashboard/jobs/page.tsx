'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { createCustomer, createJob } from '@/lib/queries'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const AMBER = '#92400E'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#475569'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TYPE = {
  label: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.08em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  section: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.14em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  bodySm: {
    fontSize: '11px',
    fontWeight: 500,
    color: TEXT3,
    lineHeight: 1.45,
  },
  body: {
    fontSize: '12px',
    fontWeight: 500,
    color: TEXT2,
    lineHeight: 1.45,
  },
  titleSm: {
    fontSize: '12px',
    fontWeight: 800,
    color: TEXT,
    lineHeight: 1.3,
  },
  title: {
    fontSize: '13px',
    fontWeight: 700,
    color: TEXT2,
    lineHeight: 1.35,
  },
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrowLeft({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AddJobPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    suburb: '',
    postcode: '',
    equipment_type: 'split_system',
    brand: '',
    model: '',
    capacity_kw: '',
    serial_number: '',
    install_location: '',
    warranty_expiry: '',
    install_date: '',
    service_interval_months: '12',
    reminder_lead_days: '14',
    notes: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('business_id')
        .eq('id', session.user.id)
        .single()

      if (!userData) throw new Error('User profile not found.')

      const customer = await createCustomer({
        business_id: userData.business_id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        suburb: form.suburb,
        postcode: form.postcode,
      })

      await createJob({
        business_id: userData.business_id,
        customer_id: customer.id,
        installed_by: session.user.id,
        equipment_type: form.equipment_type,
        brand: form.brand,
        model: form.model,
        capacity_kw: form.capacity_kw ? parseFloat(form.capacity_kw) : null,
        serial_number: form.serial_number,
        install_location: form.install_location,
        warranty_expiry: form.warranty_expiry || null,
        install_date: form.install_date,
        service_interval_months: parseInt(form.service_interval_months),
        reminder_lead_days: parseInt(form.reminder_lead_days),
        notes: form.notes,
      })

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const shellCard: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
    overflow: 'hidden',
  }

  const sectionLabel: React.CSSProperties = {
    ...TYPE.section,
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const sectionDash = (
    <span
      style={{
        width: '12px',
        height: '2px',
        background: TEAL,
        borderRadius: '999px',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  )

  const quickActionStyle: React.CSSProperties = {
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT2,
    borderRadius: '10px',
    height: '38px',
    padding: '0 14px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  }

  const input: React.CSSProperties = {
    height: '40px',
    padding: '0 12px',
    borderRadius: '10px',
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT,
    fontFamily: FONT,
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  }

  const label: React.CSSProperties = {
    ...TYPE.label,
    marginBottom: '6px',
    display: 'block',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: FONT, background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/jobs" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', background: BG }}>
        <div
          style={{
            background: HEADER_BG,
            padding: isMobile ? '18px 16px 16px' : '20px 24px 18px',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '14px',
            alignItems: 'stretch',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                color: 'rgba(255,255,255,0.68)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: FONT,
                marginBottom: '8px',
              }}
            >
              <IconArrowLeft size={14} />
              Dashboard
            </button>

            <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.68)', marginBottom: '5px' }}>
              {todayStr}
            </div>

            <div
              style={{
                fontSize: isMobile ? '28px' : '34px',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                fontWeight: 900,
                color: '#FFFFFF',
                marginBottom: '8px',
              }}
            >
              Add new job
            </div>

            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.72)',
                maxWidth: '760px',
              }}
            >
              Capture customer details, installation information, and service reminders in one clean workflow.
            </div>

            <div
              style={{
                marginTop: '14px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => router.push('/dashboard')}
                style={quickActionStyle}
              >
                Cancel
              </button>

              <button
                form="job-form"
                type="submit"
                disabled={loading}
                style={{
                  ...quickActionStyle,
                  background: TEAL,
                  color: '#FFFFFF',
                  border: 'none',
                }}
              >
                <IconSpark size={16} />
                {loading ? 'Saving...' : isMobile ? 'Save job' : 'Save & generate QR'}
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: isMobile ? '14px' : '16px 24px 20px',
            background: BG,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
          }}
        >
          {error && (
            <div
              style={{
                background: '#FFF9F9',
                color: '#7F1D1D',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                border: '1px solid #FECACA',
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <form id="job-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ ...shellCard, padding: '14px' }}>
              <div style={sectionLabel}>{sectionDash}Step 1 • Customer details</div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={label}>First name *</label>
                  <input required style={input} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="James" />
                </div>

                <div>
                  <label style={label}>Last name *</label>
                  <input required style={input} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Moretti" />
                </div>

                <div>
                  <label style={label}>Email</label>
                  <input type="email" style={input} value={form.email} onChange={e => set('email', e.target.value)} placeholder="james@email.com" />
                </div>

                <div>
                  <label style={label}>Phone</label>
                  <input style={input} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0412 345 678" />
                </div>

                <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                  <label style={label}>Address</label>
                  <input style={input} value={form.address} onChange={e => set('address', e.target.value)} placeholder="14 Blackwood St" />
                </div>

                <div>
                  <label style={label}>Suburb</label>
                  <input style={input} value={form.suburb} onChange={e => set('suburb', e.target.value)} placeholder="Newtown" />
                </div>

                <div>
                  <label style={label}>Postcode</label>
                  <input style={input} value={form.postcode} onChange={e => set('postcode', e.target.value)} placeholder="2042" />
                </div>
              </div>
            </div>

            <div style={{ ...shellCard, padding: '14px' }}>
              <div style={sectionLabel}>{sectionDash}Step 2 • Installation details</div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={label}>Equipment type *</label>
                  <select required style={input} value={form.equipment_type} onChange={e => set('equipment_type', e.target.value)}>
                    <option value="split_system">Split system</option>
                    <option value="ducted">Ducted system</option>
                    <option value="multi_head">Multi-head split</option>
                    <option value="cassette">Cassette unit</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={label}>Brand *</label>
                  <input required style={input} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Daikin" />
                </div>

                <div>
                  <label style={label}>Model</label>
                  <input style={input} value={form.model} onChange={e => set('model', e.target.value)} placeholder="FTXM71WVMA" />
                </div>

                <div>
                  <label style={label}>Capacity (kW)</label>
                  <input style={input} value={form.capacity_kw} onChange={e => set('capacity_kw', e.target.value)} placeholder="7.1" />
                </div>

                <div>
                  <label style={label}>Serial number</label>
                  <input style={input} value={form.serial_number} onChange={e => set('serial_number', e.target.value)} placeholder="DKSP2024XXXXXX" />
                </div>

                <div>
                  <label style={label}>Warranty expiry</label>
                  <input type="date" style={input} value={form.warranty_expiry} onChange={e => set('warranty_expiry', e.target.value)} />
                </div>

                <div>
                  <label style={label}>Installation date *</label>
                  <input required type="date" style={input} value={form.install_date} onChange={e => set('install_date', e.target.value)} />
                </div>

                <div>
                  <label style={label}>Location in property</label>
                  <input style={input} value={form.install_location} onChange={e => set('install_location', e.target.value)} placeholder="Master bedroom" />
                </div>

                <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                  <label style={label}>Job notes</label>
                  <textarea
                    style={{ ...input, height: '88px', padding: '10px 12px', resize: 'none' as const }}
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    placeholder="Any notes about the installation..."
                  />
                </div>
              </div>
            </div>

            <div style={{ ...shellCard, padding: '14px' }}>
              <div style={sectionLabel}>{sectionDash}Step 3 • Service schedule</div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={label}>Service interval</label>
                  <select style={input} value={form.service_interval_months} onChange={e => set('service_interval_months', e.target.value)}>
                    <option value="6">Every 6 months</option>
                    <option value="12">Every 12 months</option>
                    <option value="18">Every 18 months</option>
                    <option value="24">Every 24 months</option>
                  </select>
                </div>

                <div>
                  <label style={label}>Reminder lead time</label>
                  <select style={input} value={form.reminder_lead_days} onChange={e => set('reminder_lead_days', e.target.value)}>
                    <option value="14">2 weeks before</option>
                    <option value="28">4 weeks before</option>
                    <option value="42">6 weeks before</option>
                    <option value="56">8 weeks before</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}