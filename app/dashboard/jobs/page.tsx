'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { createCustomer, createJob } from '@/lib/queries'

const A = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#DEDEDE'
const BG = '#F2F3F3'

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
    first_name: '', last_name: '', email: '', phone: '', address: '', suburb: '', postcode: '',
    equipment_type: 'split_system', brand: '', model: '', capacity_kw: '', serial_number: '',
    install_location: '', warranty_expiry: '', install_date: '', service_interval_months: '12',
    reminder_lead_days: '14', notes: '',
  })

  function set(field: string, value: string) { setForm(prev => ({ ...prev, [field]: value })) }

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

  const pad = isMobile ? '16px' : '30px'
  const input: React.CSSProperties = {
    height: '42px', padding: '0 12px', borderRadius: '8px', border: `1px solid ${BORDER}`,
    background: BG, color: TEXT, fontFamily: 'inherit', fontSize: '14px', outline: 'none', width: '100%',
  }
  const label: React.CSSProperties = { fontSize: '13px', fontWeight: '500', color: TEXT2, marginBottom: '6px', display: 'block' }
  const section: React.CSSProperties = { background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }
  const sHead: React.CSSProperties = { padding: '14px 22px', borderBottom: `1px solid ${BORDER}`, fontSize: '14px', fontWeight: '600', color: TEXT }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/jobs" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <div style={{ height: '58px', background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: `0 ${pad}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '17px', fontWeight: '600', color: TEXT }}>Add new job</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => router.push('/dashboard')} style={{ height: '36px', padding: '0 14px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT2, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button form="job-form" type="submit" disabled={loading} style={{ height: '36px', padding: '0 14px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Saving…' : isMobile ? 'Save →' : 'Save & generate QR →'}
            </button>
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: `${isMobile ? '16px' : '24px'} ${pad}`, paddingBottom: isMobile ? '90px' : '24px' }}>
          {error && <div style={{ background: '#FEE2E2', color: '#7F1D1D', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #FECACA' }}>{error}</div>}
          <form id="job-form" onSubmit={handleSubmit}>

            <div style={section}>
              <div style={sHead}>Customer details</div>
              <div style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={label}>First name *</label><input required style={input} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="James"/></div>
                <div><label style={label}>Last name *</label><input required style={input} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Moretti"/></div>
                <div><label style={label}>Email</label><input type="email" style={input} value={form.email} onChange={e => set('email', e.target.value)} placeholder="james@email.com"/></div>
                <div><label style={label}>Phone</label><input style={input} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0412 345 678"/></div>
                <div style={{ gridColumn: 'span 2' }}><label style={label}>Address</label><input style={input} value={form.address} onChange={e => set('address', e.target.value)} placeholder="14 Blackwood St"/></div>
                <div><label style={label}>Suburb</label><input style={input} value={form.suburb} onChange={e => set('suburb', e.target.value)} placeholder="Newtown"/></div>
                <div><label style={label}>Postcode</label><input style={input} value={form.postcode} onChange={e => set('postcode', e.target.value)} placeholder="2042"/></div>
              </div>
            </div>

            <div style={section}>
              <div style={sHead}>Installation details</div>
              <div style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={label}>Equipment type *</label>
                  <select required style={input} value={form.equipment_type} onChange={e => set('equipment_type', e.target.value)}>
                    <option value="split_system">Split system</option>
                    <option value="ducted">Ducted system</option>
                    <option value="multi_head">Multi-head split</option>
                    <option value="cassette">Cassette unit</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div><label style={label}>Brand *</label><input required style={input} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Daikin"/></div>
                <div><label style={label}>Model</label><input style={input} value={form.model} onChange={e => set('model', e.target.value)} placeholder="FTXM71WVMA"/></div>
                <div><label style={label}>Capacity (kW)</label><input style={input} value={form.capacity_kw} onChange={e => set('capacity_kw', e.target.value)} placeholder="7.1"/></div>
                <div><label style={label}>Serial number</label><input style={input} value={form.serial_number} onChange={e => set('serial_number', e.target.value)} placeholder="DKSP2024XXXXXX"/></div>
                <div><label style={label}>Warranty expiry</label><input type="date" style={input} value={form.warranty_expiry} onChange={e => set('warranty_expiry', e.target.value)}/></div>
                <div><label style={label}>Installation date *</label><input required type="date" style={input} value={form.install_date} onChange={e => set('install_date', e.target.value)}/></div>
                <div><label style={label}>Location in property</label><input style={input} value={form.install_location} onChange={e => set('install_location', e.target.value)} placeholder="Master bedroom"/></div>
                <div style={{ gridColumn: 'span 2' }}><label style={label}>Job notes</label><textarea style={{ ...input, height: '80px', padding: '10px 12px', resize: 'none' as const }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes about the installation…"/></div>
              </div>
            </div>

            <div style={section}>
              <div style={sHead}>Service schedule</div>
              <div style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div><label style={label}>Service interval</label>
                  <select style={input} value={form.service_interval_months} onChange={e => set('service_interval_months', e.target.value)}>
                    <option value="6">Every 6 months</option>
                    <option value="12">Every 12 months</option>
                    <option value="18">Every 18 months</option>
                    <option value="24">Every 24 months</option>
                  </select>
                </div>
                <div><label style={label}>Reminder lead time</label>
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