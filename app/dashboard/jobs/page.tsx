'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { createCustomer, createJob } from '@/lib/queries'

const TEAL = '#2AA198'
const TEAL_DARK = '#1E8C84'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#6B7280'
const BORDER = '#E5E7EB'
const BG = '#F4F4F2'
const WHITE = '#FFFFFF'

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

export default function AddJobPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    address: '', suburb: '', postcode: '',
    equipment_type: 'split_system', brand: '', model: '',
    capacity_kw: '', serial_number: '', install_location: '',
    warranty_expiry: '', install_date: '',
    service_interval_months: '12', reminder_lead_days: '14', notes: '',
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
        service_interval_months: parseInt(form.service_interval_months),
        reminder_lead_days: parseInt(form.reminder_lead_days), notes: form.notes,
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pad = isMobile ? '16px' : '32px'

  const input: React.CSSProperties = {
    height: '40px', padding: '0 12px', borderRadius: '8px',
    border: `1px solid ${BORDER}`, background: WHITE, color: TEXT,
    fontFamily: 'inherit', fontSize: '14px', outline: 'none', width: '100%',
  }

  const label: React.CSSProperties = {
    fontSize: '12px', color: TEXT3, marginBottom: '4px', display: 'block', fontWeight: '500',
  }

  const card: React.CSSProperties = {
    background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden',
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px', fontWeight: '700', color: TEAL,
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/jobs" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{
          background: '#33B5AC',
          padding: isMobile ? '24px 16px 22px' : `32px ${pad} 28px`,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '6px', fontWeight: '500' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', color: WHITE, letterSpacing: '-0.8px', lineHeight: 1 }}>Add new job</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/dashboard')}
              style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.12)', color: WHITE, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
              Cancel
            </button>
            <button form="job-form" type="submit" disabled={loading}
              style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: 'none', background: WHITE, color: TEAL_DARK, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke={TEAL_DARK} strokeWidth="2" strokeLinecap="round"/></svg>
              {loading ? 'Saving…' : isMobile ? 'Save job' : 'Save & generate QR'}
            </button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: `28px ${pad}`, paddingBottom: isMobile ? '90px' : '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && (
            <div style={{ background: '#FFF9F9', color: '#7F1D1D', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', border: '1px solid #FECACA', fontWeight: '500' }}>
              {error}
            </div>
          )}

          <form id="job-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* CUSTOMER DETAILS */}
            <div style={card}>
              <div style={{ height: '3px', background: TEAL }} />
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={sectionLabel}>Step 1</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>Customer details</div>
              </div>
              <div style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={label}>First name *</label>
                  <input required style={input} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="James"/>
                </div>
                <div>
                  <label style={label}>Last name *</label>
                  <input required style={input} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Moretti"/>
                </div>
                <div>
                  <label style={label}>Email</label>
                  <input type="email" style={input} value={form.email} onChange={e => set('email', e.target.value)} placeholder="james@email.com"/>
                </div>
                <div>
                  <label style={label}>Phone</label>
                  <input style={input} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0412 345 678"/>
                </div>
                <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                  <label style={label}>Address</label>
                  <input style={input} value={form.address} onChange={e => set('address', e.target.value)} placeholder="14 Blackwood St"/>
                </div>
                <div>
                  <label style={label}>Suburb</label>
                  <input style={input} value={form.suburb} onChange={e => set('suburb', e.target.value)} placeholder="Newtown"/>
                </div>
                <div>
                  <label style={label}>Postcode</label>
                  <input style={input} value={form.postcode} onChange={e => set('postcode', e.target.value)} placeholder="2042"/>
                </div>
              </div>
            </div>

            {/* INSTALLATION DETAILS */}
            <div style={card}>
              <div style={{ height: '3px', background: TEAL }} />
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={sectionLabel}>Step 2</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>Installation details</div>
              </div>
              <div style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
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
                  <input required style={input} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Daikin"/>
                </div>
                <div>
                  <label style={label}>Model</label>
                  <input style={input} value={form.model} onChange={e => set('model', e.target.value)} placeholder="FTXM71WVMA"/>
                </div>
                <div>
                  <label style={label}>Capacity (kW)</label>
                  <input style={input} value={form.capacity_kw} onChange={e => set('capacity_kw', e.target.value)} placeholder="7.1"/>
                </div>
                <div>
                  <label style={label}>Serial number</label>
                  <input style={input} value={form.serial_number} onChange={e => set('serial_number', e.target.value)} placeholder="DKSP2024XXXXXX"/>
                </div>
                <div>
                  <label style={label}>Warranty expiry</label>
                  <input type="date" style={input} value={form.warranty_expiry} onChange={e => set('warranty_expiry', e.target.value)}/>
                </div>
                <div>
                  <label style={label}>Installation date *</label>
                  <input required type="date" style={input} value={form.install_date} onChange={e => set('install_date', e.target.value)}/>
                </div>
                <div>
                  <label style={label}>Location in property</label>
                  <input style={input} value={form.install_location} onChange={e => set('install_location', e.target.value)} placeholder="Master bedroom"/>
                </div>
                <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                  <label style={label}>Job notes</label>
                  <textarea style={{ ...input, height: '88px', padding: '10px 12px', resize: 'none' as const }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes about the installation…"/>
                </div>
              </div>
            </div>

            {/* SERVICE SCHEDULE */}
            <div style={card}>
              <div style={{ height: '3px', background: TEAL }} />
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={sectionLabel}>Step 3</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>Service schedule</div>
              </div>
              <div style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
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