'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { HeaderToolbar } from '@/components/HeaderToolbar'
import { createCustomer, createJob } from '@/lib/queries'
import { useBusinessData } from '@/lib/business-context'
import { getIndustry } from '@/lib/industry-config'
import { AppIcon } from '@/components/AppIcon'

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const RED = '#B91C1C'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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
  title: {
    fontSize: '13px',
    fontWeight: 700,
    color: TEXT2,
    lineHeight: 1.35,
  },
  valueSm: {
    fontSize: '16px',
    fontWeight: 900,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
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

function IconArrowLeft({ size = 15 }: { size?: number }) {
  return <AppIcon name="arrow-left" size={size} />
}

function IconUsers({ size = 18 }: { size?: number }) {
  return <AppIcon name="customers" size={size} />
}

function IconJob({ size = 18 }: { size?: number }) {
  return <AppIcon name="jobs" size={size} />
}

function IconCalendar({ size = 18 }: { size?: number }) {
  return <AppIcon name="calendar" size={size} />
}

type FormState = {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  suburb: string
  postcode: string
  equipment_type: string
  brand: string
  model: string
  capacity_kw: string
  serial_number: string
  install_location: string
  warranty_expiry: string
  install_date: string
  service_interval_months: string
  reminder_lead_days: string
  notes: string
}

export default function AddJobPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { business: bizContext } = useBusinessData()
  const industryConfig = getIndustry(bizContext?.industry)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (industryConfig.equipmentTypes.length > 0) {
      setForm(prev => prev.equipment_type ? prev : { ...prev, equipment_type: industryConfig.equipmentTypes[0].value })
    }
  }, [industryConfig])
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    suburb: '',
    postcode: '',
    equipment_type: '',
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

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
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
        service_interval_months: parseInt(form.service_interval_months, 10),
        reminder_lead_days: parseInt(form.reminder_lead_days, 10),
        notes: form.notes,
      })

      router.push('/dashboard/jobs')
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
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
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }

  const cardP: React.CSSProperties = {
    ...card,
    padding: isMobile ? '16px' : '18px',
  }

  const btnOutline: React.CSSProperties = {
    height: '36px',
    padding: '0 14px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 700,
    color: TEXT3,
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  }

  const btnTeal: React.CSSProperties = {
    height: '36px',
    padding: '0 14px',
    border: 'none',
    borderBottom: '2px solid #2AA198',
    borderRadius: 0,
    fontSize: '12px',
    fontWeight: 800,
    color: TEAL,
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    whiteSpace: 'nowrap',
  }

  const btnMobileSm: React.CSSProperties = {
    height: '36px',
    padding: '0 12px',
    border: '1px solid #E8EDF2',
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: TEXT2,
    background: WHITE,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    whiteSpace: 'nowrap',
    flex: 1,
  }

  const btnMobileTeal: React.CSSProperties = {
    ...btnMobileSm,
    background: TEAL,
    border: `1px solid ${TEAL}`,
    color: WHITE,
  }

  const labelStyle: React.CSSProperties = {
    ...TYPE.label,
    marginBottom: '6px',
    display: 'block',
  }

  const inputStyle: React.CSSProperties = {
    height: '42px',
    padding: '0 12px',
    borderRadius: '12px',
    border: `1px solid ${BORDER}`,
    background: '#F8FAFC',
    color: TEXT,
    fontFamily: FONT,
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontWeight: 600,
  }

  const textareaStyle: React.CSSProperties = {
    minHeight: '96px',
    padding: '12px',
    borderRadius: '12px',
    border: `1px solid ${BORDER}`,
    background: '#F8FAFC',
    color: TEXT,
    fontFamily: FONT,
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    resize: 'vertical',
    lineHeight: 1.5,
    boxSizing: 'border-box',
    fontWeight: 600,
  }

  const stepCard: React.CSSProperties = {
    borderRadius: '14px',
    background: WHITE,
    border: `1px solid ${BORDER}`,
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }

  const stepIconWrap: React.CSSProperties = {
    width: 42,
    height: 42,
    borderRadius: '12px',
    background: WHITE,
    border: `1px solid ${BORDER}`,
    color: TEXT2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  const statChips = [
    { label: 'Customer', value: form.first_name || form.last_name ? '1' : '0' },
    { label: 'Type', value: form.equipment_type ? '1' : '0' },
    { label: industryConfig.fields.brand.label, value: form.brand ? '1' : '0' },
    { label: 'Schedule', value: form.install_date ? '1' : '0' },
  ]

  return (
    <div
      style={{
        display: 'flex',
        fontFamily: FONT,
        background: BG,
        minHeight: '100vh',
      }}
    >
      <Sidebar active="/dashboard/jobs" />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <div
          style={{
            background: BG,
            borderBottom: `1px solid ${BORDER}`,
            padding: isMobile ? '14px 14px 12px' : '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <h1 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0 }}>
            Add new job
          </h1>
          <HeaderToolbar isMobile={isMobile} items={[
            { label: 'Back', icon: <IconArrowLeft size={15} />, onClick: () => router.push('/dashboard/jobs') },
            { label: loading ? 'Saving...' : 'Save job', icon: <AppIcon name="tick" size={15} />, tone: 'primary', submitFor: 'job-form', disabled: loading },
          ]} />
        </div>

        <div className="page-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '12px' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '48px',
            background: BG,
          }}
        >
          <div
            style={{
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: '14px',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
            }}
          >
            {statChips.map((chip, i) => (
              <div
                key={chip.label}
                style={{
                  padding: isMobile ? '10px 8px' : '14px 20px',
                  textAlign: isMobile ? 'center' as const : undefined,
                  borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                }}
              >
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                <div style={{ fontSize: isMobile ? '9px' : '11px', fontWeight: 600, color: TEXT3, marginTop: isMobile ? '3px' : '4px', lineHeight: isMobile ? 1.2 : undefined }}>{chip.label}</div>
              </div>
            ))}
          </div>

          {error && (
            <div
              style={{
                background: '#FFF9F9',
                color: RED,
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                border: '1px solid #FECACA',
                fontWeight: 600,
                margin: isMobile ? '0 12px' : 0,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', alignItems: 'start', padding: isMobile ? '0 12px' : 0 }}>
            <div style={cardP}>
              <div
                style={{
                  paddingBottom: '16px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: 4, alignSelf: 'stretch', minHeight: 22, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em' }}>New job workflow</div>
                  </div>
                </div>

                <div
                  style={{
                    height: '22px',
                    padding: '0 8px',
                    borderRadius: '8px',
                    border: `1px solid #BFE7E3`,
                    background: TEAL_LIGHT,
                    color: TEAL_DARK,
                    fontSize: '10px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  Live form
                </div>
              </div>

              <form id="job-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
                <div style={stepCard}>
                  <div style={{ padding: isMobile ? '14px' : '16px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={stepIconWrap}>
                        <IconUsers size={22} />
                      </div>
                      <div>
                        <div style={{ ...TYPE.label, marginBottom: '4px' }}>Step 1</div>
                        <div style={{ fontSize: '14px', fontWeight: 850, color: TEXT }}>Customer details</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: isMobile ? '14px' : '16px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>First name *</label>
                      <input required style={inputStyle} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="James" />
                    </div>
                    <div>
                      <label style={labelStyle}>Last name *</label>
                      <input required style={inputStyle} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Moretti" />
                    </div>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="james@email.com" />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0412 345 678" />
                    </div>
                    <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                      <label style={labelStyle}>Address</label>
                      <input style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} placeholder="14 Blackwood St" />
                    </div>
                    <div>
                      <label style={labelStyle}>Suburb</label>
                      <input style={inputStyle} value={form.suburb} onChange={e => set('suburb', e.target.value)} placeholder="Newtown" />
                    </div>
                    <div>
                      <label style={labelStyle}>Postcode</label>
                      <input style={inputStyle} value={form.postcode} onChange={e => set('postcode', e.target.value)} placeholder="2042" />
                    </div>
                  </div>
                </div>

                <div style={stepCard}>
                  <div style={{ padding: isMobile ? '14px' : '16px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={stepIconWrap}>
                        <IconJob size={22} />
                      </div>
                      <div>
                        <div style={{ ...TYPE.label, marginBottom: '4px' }}>Step 2</div>
                        <div style={{ fontSize: '14px', fontWeight: 850, color: TEXT }}>Job details</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: isMobile ? '14px' : '16px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>Type *</label>
                      <select required style={inputStyle} value={form.equipment_type} onChange={e => set('equipment_type', e.target.value)}>
                        {industryConfig.equipmentTypes.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>{industryConfig.fields.brand.label} *</label>
                      <input required style={inputStyle} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder={industryConfig.fields.brand.placeholder} />
                    </div>

                    <div>
                      <label style={labelStyle}>{industryConfig.fields.model.label}</label>
                      <input style={inputStyle} value={form.model} onChange={e => set('model', e.target.value)} placeholder={industryConfig.fields.model.placeholder} />
                    </div>

                    {industryConfig.fields.capacityKw.show && (
                      <div>
                        <label style={labelStyle}>{industryConfig.fields.capacityKw.label}</label>
                        <input style={inputStyle} value={form.capacity_kw} onChange={e => set('capacity_kw', e.target.value)} placeholder={industryConfig.fields.capacityKw.placeholder} />
                      </div>
                    )}

                    <div>
                      <label style={labelStyle}>Serial number</label>
                      <input style={inputStyle} value={form.serial_number} onChange={e => set('serial_number', e.target.value)} placeholder="SN-XXXXXX" />
                    </div>

                    <div>
                      <label style={labelStyle}>Warranty expiry</label>
                      <input type="date" style={inputStyle} value={form.warranty_expiry} onChange={e => set('warranty_expiry', e.target.value)} />
                    </div>

                    <div>
                      <label style={labelStyle}>{industryConfig.fields.installDate.label} *</label>
                      <input required type="date" style={inputStyle} value={form.install_date} onChange={e => set('install_date', e.target.value)} />
                    </div>

                    <div>
                      <label style={labelStyle}>{industryConfig.fields.installLocation.label}</label>
                      <input style={inputStyle} value={form.install_location} onChange={e => set('install_location', e.target.value)} placeholder={industryConfig.fields.installLocation.placeholder} />
                    </div>

                    <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                      <label style={labelStyle}>Notes</label>
                      <textarea style={textareaStyle} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder={industryConfig.fields.notes.placeholder} />
                    </div>
                  </div>
                </div>

                <div style={stepCard}>
                  <div style={{ padding: isMobile ? '14px' : '16px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={stepIconWrap}>
                        <IconCalendar size={22} />
                      </div>
                      <div>
                        <div style={{ ...TYPE.label, marginBottom: '4px' }}>Step 3</div>
                        <div style={{ fontSize: '14px', fontWeight: 850, color: TEXT }}>Service schedule</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: isMobile ? '14px' : '16px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>Service interval</label>
                      <select style={inputStyle} value={form.service_interval_months} onChange={e => set('service_interval_months', e.target.value)}>
                        <option value="6">Every 6 months</option>
                        <option value="12">Every 12 months</option>
                        <option value="18">Every 18 months</option>
                        <option value="24">Every 24 months</option>
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Reminder lead time</label>
                      <select style={inputStyle} value={form.reminder_lead_days} onChange={e => set('reminder_lead_days', e.target.value)}>
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
      </div>
    </div>
  )
}