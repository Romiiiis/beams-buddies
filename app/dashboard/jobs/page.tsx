'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { createCustomer, createJob } from '@/lib/queries'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const BLUE = '#2563EB'
const RED = '#B91C1C'
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
  title: {
    fontSize: '13px',
    fontWeight: 700,
    color: TEXT2,
    lineHeight: 1.35,
  },
  valueLg: {
    fontSize: '28px',
    fontWeight: 900,
    letterSpacing: '-0.05em' as const,
    lineHeight: 1,
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

function IconArrowLeft({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

function IconUser({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.9" />
      <path d="M4 21c1.8-4 5-6 8-6s6.2 2 8 6" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

function IconTool({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M14 7l3-3 3 3-3 3-3-3Z" stroke="currentColor" strokeWidth="1.9" />
      <path d="M3 21l8-8" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

function IconCalendar({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.9" />
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

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
  }

  const input: React.CSSProperties = {
    width: '100%',
    height: '42px',
    padding: '0 14px',
    borderRadius: '12px',
    border: `1px solid ${BORDER}`,
    fontSize: '13px',
    fontFamily: FONT,
    outline: 'none',
    background: WHITE,
  }

  const label: React.CSSProperties = {
    ...TYPE.label,
    marginBottom: '6px',
    display: 'block',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: BG }}>
      <Sidebar active="/dashboard/jobs" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ ...card, background: HEADER_BG, padding: '24px', border: 'none' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,.7)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
              cursor: 'pointer',
            }}
          >
            <IconArrowLeft /> Dashboard
          </button>

          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.65)', marginBottom: '6px' }}>{todayStr}</div>

          <div style={{ fontSize: '34px', fontWeight: 900, color: WHITE, marginBottom: '10px' }}>
            Add New Job
          </div>

          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,.7)', maxWidth: '700px' }}>
            Capture customer, installation and service scheduling information in one premium workflow.
          </div>
        </div>

        {error && (
          <div style={{
            padding: '14px',
            borderRadius: '14px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: RED,
            fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
          <div style={{ ...card, padding: '18px' }}>
            <div style={{ ...TYPE.title, marginBottom: '14px' }}>Customer Details</div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              {[
                ['First Name', 'first_name'],
                ['Last Name', 'last_name'],
                ['Email', 'email'],
                ['Phone', 'phone'],
                ['Address', 'address'],
                ['Suburb', 'suburb'],
                ['Postcode', 'postcode'],
              ].map(([title, field]) => (
                <div key={field}>
                  <label style={label}>{title}</label>
                  <input
                    style={input}
                    value={(form as any)[field]}
                    onChange={e => set(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: '18px' }}>
            <div style={{ ...TYPE.title, marginBottom: '14px' }}>Installation Details</div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              {[
                ['Brand', 'brand'],
                ['Model', 'model'],
                ['Capacity', 'capacity_kw'],
                ['Serial Number', 'serial_number'],
                ['Install Location', 'install_location'],
              ].map(([title, field]) => (
                <div key={field}>
                  <label style={label}>{title}</label>
                  <input
                    style={input}
                    value={(form as any)[field]}
                    onChange={e => set(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: '18px' }}>
            <div style={{ ...TYPE.title, marginBottom: '14px' }}>Service Schedule</div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={label}>Install Date</label>
                <input type="date" style={input} value={form.install_date} onChange={e => set('install_date', e.target.value)} />
              </div>

              <div>
                <label style={label}>Warranty Expiry</label>
                <input type="date" style={input} value={form.warranty_expiry} onChange={e => set('warranty_expiry', e.target.value)} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              height: '46px',
              border: 'none',
              borderRadius: '14px',
              background: TEAL,
              color: WHITE,
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Saving...' : 'Save Job'}
          </button>
        </form>
      </div>
    </div>
  )
}