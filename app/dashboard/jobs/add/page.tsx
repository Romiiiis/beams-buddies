'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { createCustomer, createJob } from '@/lib/queries'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
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
  label: { fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em' as const, textTransform: 'uppercase' as const, color: TEXT3 },
  bodySm: { fontSize: '11px', fontWeight: 500, color: TEXT3, lineHeight: 1.45 },
  title: { fontSize: '13px', fontWeight: 700, color: TEXT2, lineHeight: 1.35 },
  valueSm: { fontSize: '16px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em' as const, lineHeight: 1 },
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrowLeft({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconUsers({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.9" />
      <path d="M20 8.5a3.5 3.5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.35" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconJob({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="6" width="16" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M9 6V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconCalendar({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

type FormState = {
  first_name: string; last_name: string; email: string; phone: string
  address: string; suburb: string; postcode: string; equipment_type: string
  brand: string; model: string; capacity_kw: string; serial_number: string
  install_location: string; warranty_expiry: string; install_date: string
  service_interval_months: string; reminder_lead_days: string; notes: string
}

export default function AddJobPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>({
    first_name: '', last_name: '', email: '', phone: '',
    address: '', suburb: '', postcode: '', equipment_type: 'split_system',
    brand: '', model: '', capacity_kw: '', serial_number: '',
    install_location: '', warranty_expiry: '', install_date: '',
    service_interval_months: '12', reminder_lead_days: '14', notes: '',
  })

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) throw new Error('User profile not found.')
      const customer = await createCustomer({
        business_id: userData.business_id,
        first_name: form.first_name, last_name: form.last_name,
        email: form.email, phone: form.phone, address: form.address,
        suburb: form.suburb, postcode: form.postcode,
      })
      await createJob({
        business_id: userData.business_id, customer_id: customer.id,
        installed_by: session.user.id, equipment_type: form.equipment_type,
        brand: form.brand, model: form.model,
        capacity_kw: form.capacity_kw ? parseFloat(form.capacity_kw) : null,
        serial_number: form.serial_number, install_location: form.install_location,
        warranty_expiry: form.warranty_expiry || null, install_date: form.install_date,
        service_interval_months: parseInt(form.service_interval_months, 10),
        reminder_lead_days: parseInt(form.reminder_lead_days, 10), notes: form.notes,
      })
      router.push('/dashboard/jobs')
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const shellCard: React.CSSProperties = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 6px 18px rgba(15,23,42,0.04)', overflow: 'hidden' }
  const panelCard: React.CSSProperties = { ...shellCard, padding: isMobile ? '16px' : '18px' }
  const sectionLabel: React.CSSProperties = { ...TYPE.title, fontSize: '13px', fontWeight: 800, marginBottom: '12px' }
  const miniStatCard: React.CSSProperties = { borderRadius: '12px', background: '#F8FAFC', border: `1px solid ${BORDER}`, padding: '12px' }
  const quickActionStyle: React.CSSProperties = { border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, borderRadius: '10px', height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '8px' }
  const labelStyle: React.CSSProperties = { ...TYPE.label, marginBottom: '6px', display: 'block' }
  const inputStyle: React.CSSProperties = { height: '42px', padding: '0 12px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: '#FCFCFD', color: TEXT, fontFamily: FONT, fontSize: '13px', outline: 'none', width: '100%', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)' }
  const textareaStyle: React.CSSProperties = { minHeight: '96px', padding: '12px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: '#FCFCFD', color: TEXT, fontFamily: FONT, fontSize: '13px', outline: 'none', width: '100%', resize: 'vertical', lineHeight: 1.5 }
  const iconWrapStep = (color: string): React.CSSProperties => ({ width: '36px', height: '36px', borderRadius: '11px', background: '#F8FAFC', color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${BORDER}`, flexShrink: 0 })
  const stepCard: React.CSSProperties = { borderRadius: '14px', background: WHITE, border: `1px solid ${BORDER}`, padding: isMobile ? '14px' : '16px' }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: FONT, background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/jobs" />
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: BG }}>
        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: BG, padding: isMobile ? '14px' : '16px', gap: '12px' }}>

          <div style={{ ...shellCard, padding: isMobile ? '18px 16px 16px' : '22px 24px 20px', background: HEADER_BG, border: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => router.push('/dashboard/jobs')} style={{ background: 'transparent', border: 'none', padding: 0, color: 'rgba(255,255,255,0.68)', display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT, marginBottom: '8px' }}>
              <IconArrowLeft size={14} /> Back to jobs
            </button>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '28px' : '34px', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 900, color: WHITE, marginBottom: '8px' }}>Add new job</div>
            <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', maxWidth: '760px' }}>
              Capture customer details, installation information, and service reminders in one clean workflow.
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/dashboard/jobs')} style={{ ...quickActionStyle, background: 'rgba(255,255,255,0.06)', color: WHITE, border: '1px solid rgba(255,255,255,0.10)', boxShadow: 'none' }}>Cancel</button>
              <button form="job-form" type="submit" disabled={loading} style={{ ...quickActionStyle, background: TEAL, color: WHITE, border: 'none', boxShadow: '0 6px 14px rgba(31,158,148,0.20)', opacity: loading ? 0.8 : 1 }}>
                <IconSpark size={16} />{loading ? 'Saving...' : 'Save & generate QR'}
              </button>
            </div>
          </div>

          {error && <div style={{ background: '#FFF9F9', color: RED, padding: '12px 16px', borderRadius: '12px', fontSize: '14px', border: '1px solid #FECACA', fontWeight: 600 }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))', gap: '12px', alignItems: 'start' }}>
            <div style={{ ...panelCard, gridColumn: isMobile ? 'span 1' : 'span 8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div>
                  <div style={sectionLabel}>New job workflow</div>
                  <div style={{ ...TYPE.bodySm }}>Add the customer, installation details, and reminder timing in one pass.</div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 10px', borderRadius: '999px', background: '#F8FAFC', border: `1px solid ${BORDER}`, color: TEXT3, fontSize: '11px', fontWeight: 800 }}>Live form</div>
              </div>

              <form id="job-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>

                <div style={stepCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={iconWrapStep(TEAL_DARK)}><IconUsers size={18} /></div>
                    <div><div style={{ ...TYPE.label, marginBottom: '4px' }}>Step 1</div><div style={{ ...TYPE.title, fontSize: '14px', fontWeight: 800 }}>Customer details</div></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                    <div><label style={labelStyle}>First name *</label><input required style={inputStyle} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="James" /></div>
                    <div><label style={labelStyle}>Last name *</label><input required style={inputStyle} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Moretti" /></div>
                    <div><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="james@email.com" /></div>
                    <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0412 345 678" /></div>
                    <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}><label style={labelStyle}>Address</label><input style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} placeholder="14 Blackwood St" /></div>
                    <div><label style={labelStyle}>Suburb</label><input style={inputStyle} value={form.suburb} onChange={e => set('suburb', e.target.value)} placeholder="Newtown" /></div>
                    <div><label style={labelStyle}>Postcode</label><input style={inputStyle} value={form.postcode} onChange={e => set('postcode', e.target.value)} placeholder="2042" /></div>
                  </div>
                </div>

                <div style={stepCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={iconWrapStep(TEXT)}><IconJob size={18} /></div>
                    <div><div style={{ ...TYPE.label, marginBottom: '4px' }}>Step 2</div><div style={{ ...TYPE.title, fontSize: '14px', fontWeight: 800 }}>Installation details</div></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>Equipment type *</label>
                      <select required style={inputStyle} value={form.equipment_type} onChange={e => set('equipment_type', e.target.value)}>
                        <option value="split_system">Split system</option>
                        <option value="ducted">Ducted system</option>
                        <option value="multi_head">Multi-head split</option>
                        <option value="cassette">Cassette unit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div><label style={labelStyle}>Brand *</label><input required style={inputStyle} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Daikin" /></div>
                    <div><label style={labelStyle}>Model</label><input style={inputStyle} value={form.model} onChange={e => set('model', e.target.value)} placeholder="FTXM71WVMA" /></div>
                    <div><label style={labelStyle}>Capacity (kW)</label><input style={inputStyle} value={form.capacity_kw} onChange={e => set('capacity_kw', e.target.value)} placeholder="7.1" /></div>
                    <div><label style={labelStyle}>Serial number</label><input style={inputStyle} value={form.serial_number} onChange={e => set('serial_number', e.target.value)} placeholder="DKSP2024XXXXXX" /></div>
                    <div><label style={labelStyle}>Warranty expiry</label><input type="date" style={inputStyle} value={form.warranty_expiry} onChange={e => set('warranty_expiry', e.target.value)} /></div>
                    <div><label style={labelStyle}>Installation date *</label><input required type="date" style={inputStyle} value={form.install_date} onChange={e => set('install_date', e.target.value)} /></div>
                    <div><label style={labelStyle}>Location in property</label><input style={inputStyle} value={form.install_location} onChange={e => set('install_location', e.target.value)} placeholder="Master bedroom" /></div>
                    <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}><label style={labelStyle}>Job notes</label><textarea style={textareaStyle} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes about the installation..." /></div>
                  </div>
                </div>

                <div style={stepCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={iconWrapStep(TEAL_DARK)}><IconCalendar size={18} /></div>
                    <div><div style={{ ...TYPE.label, marginBottom: '4px' }}>Step 3</div><div style={{ ...TYPE.title, fontSize: '14px', fontWeight: 800 }}>Service schedule</div></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
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

            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'grid', gap: '12px' }}>
              <div style={panelCard}>
                <div style={sectionLabel}>Workflow summary</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={miniStatCard}>
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>Customer</div>
                    <div style={{ ...TYPE.valueSm }}>{form.first_name || form.last_name ? `${form.first_name} ${form.last_name}`.trim() : 'Not added'}</div>
                    <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>{form.phone || form.email || 'Phone or email will appear here'}</div>
                  </div>
                  <div style={miniStatCard}>
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>Unit</div>
                    <div style={{ ...TYPE.valueSm }}>{form.brand || 'Brand'} {form.capacity_kw ? `${form.capacity_kw}kW` : ''}</div>
                    <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>{form.equipment_type.replace('_', ' ')}</div>
                  </div>
                  <div style={miniStatCard}>
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>Schedule</div>
                    <div style={{ ...TYPE.valueSm }}>Every {form.service_interval_months} months</div>
                    <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>Reminder {form.reminder_lead_days} days before</div>
                  </div>
                </div>
              </div>
              <div style={panelCard}>
                <div style={sectionLabel}>Before saving</div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {['Customer name is required', 'Brand and installation date are required', 'Saving creates both the customer and the job'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: TEXT2, fontSize: '12px', fontWeight: 600, lineHeight: 1.5 }}>
                      <span style={{ width: '8px', height: '8px', marginTop: '5px', borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={panelCard}>
                <div style={sectionLabel}>Quick actions</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <button onClick={() => router.push('/dashboard/jobs')} style={{ ...quickActionStyle, width: '100%', justifyContent: 'center' }}>Back to jobs</button>
                  <button form="job-form" type="submit" disabled={loading} style={{ ...quickActionStyle, width: '100%', justifyContent: 'center', background: TEAL, color: WHITE, border: 'none', boxShadow: '0 6px 14px rgba(31,158,148,0.20)', opacity: loading ? 0.8 : 1 }}>
                    <IconSpark size={16} />{loading ? 'Saving...' : 'Save job'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}