'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/lib/useBusiness'
import { createCustomer, createJob } from '@/lib/queries'

const A = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#DEDEDE'
const BG = '#F2F3F3'

const navMain = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Customers', href: '/dashboard/customers' },
  { label: 'Add job', href: '/dashboard/jobs' },
]
const navManage = [
  { label: 'Service schedule', href: '/dashboard/schedule' },
  { label: 'QR codes', href: '/dashboard/qrcodes' },
  { label: 'Reports', href: '/dashboard/reports' },
  { label: 'Settings', href: '/dashboard/settings' },
]
const icons: Record<string, React.ReactElement> = {
  '/dashboard': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor"/><rect x="8.5" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/><rect x="2" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/></svg>,
  '/dashboard/customers': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2 13c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 8l1.5 1.5L15 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  '/dashboard/jobs': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3" width="11" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 3V2M11 3V2M2.5 7h11M8 9.5v3M6.5 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  '/dashboard/schedule': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 6v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  '/dashboard/qrcodes': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M9 11.5h5M11.5 9v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  '/dashboard/reports': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12.5l3.5-4 3 2.5 3-5.5 3 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  '/dashboard/settings': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
}

function Sidebar({ active, router, onSignOut, logoUrl, businessName }: { active: string, router: any, onSignOut: () => void, logoUrl?: string, businessName?: string }) {
  return (
    <div style={{ width: '232px', flexShrink: 0, background: '#fff', borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <img src="https://static.wixstatic.com/media/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png" alt="Jobyra" style={{ width: '56px', height: '56px', borderRadius: '9px', objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: TEXT, letterSpacing: '-0.3px' }}>Jobyra</div>
            <div style={{ fontSize: '12px', color: TEXT3, marginTop: '1px' }}>{businessName || 'Trade CRM'}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, letterSpacing: '0.6px', textTransform: 'uppercase' as const, padding: '10px 10px 6px' }}>Main</div>
        {navMain.map(item => {
          const isActive = item.href === active
          return (
            <div key={item.href} onClick={() => router.push(item.href)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: isActive ? '#0A4F4C' : TEXT2, fontWeight: isActive ? '600' : '400', background: isActive ? '#CCEFED' : 'transparent', marginBottom: '2px' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F0F0F0' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
              <span style={{ color: isActive ? A : TEXT3, display: 'flex', flexShrink: 0 }}>{icons[item.href]}</span>
              {item.label}
            </div>
          )
        })}
        <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, letterSpacing: '0.6px', textTransform: 'uppercase' as const, padding: '14px 10px 6px' }}>Manage</div>
        {navManage.map(item => {
          const isActive = item.href === active
          return (
            <div key={item.href} onClick={() => router.push(item.href)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: isActive ? '#0A4F4C' : TEXT2, fontWeight: isActive ? '600' : '400', background: isActive ? '#CCEFED' : 'transparent', marginBottom: '2px' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F0F0F0' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
              <span style={{ color: isActive ? A : TEXT3, display: 'flex', flexShrink: 0 }}>{icons[item.href]}</span>
              {item.label}
            </div>
          )
        })}
      </div>
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#CCEFED', color: '#0A4F4C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}>RA</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>Ramiz Arib</div>
            <div style={{ fontSize: '11px', color: TEXT3 }}>Owner</div>
          </div>
        </div>
        <button onClick={onSignOut} style={{ fontSize: '12px', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
      </div>
    </div>
  )
}

export default function AddJobPage() {
  const router = useRouter()
  const business = useBusiness()
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

  const input: React.CSSProperties = {
    height: '38px', padding: '0 12px', borderRadius: '8px', border: `1px solid ${BORDER}`,
    background: BG, color: TEXT, fontFamily: 'inherit', fontSize: '14px', outline: 'none', width: '100%',
  }
  const label: React.CSSProperties = { fontSize: '13px', fontWeight: '500', color: TEXT2, marginBottom: '6px', display: 'block' }
  const section: React.CSSProperties = { background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }
  const sHead: React.CSSProperties = { padding: '14px 22px', borderBottom: `1px solid ${BORDER}`, fontSize: '14px', fontWeight: '600', color: TEXT }
  const sBody: React.CSSProperties = { padding: '20px 22px', display: 'grid', gap: '16px' }

  async function signOut() { await supabase.auth.signOut(); router.push('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/jobs" router={router} onSignOut={signOut} logoUrl={business?.logo_url || ''} businessName={business?.name || ''} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ height: '58px', background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '17px', fontWeight: '600', color: TEXT }}>Add new job</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => router.push('/dashboard')} style={{ height: '36px', padding: '0 16px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT2, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button form="job-form" type="submit" disabled={loading} style={{ height: '36px', padding: '0 18px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Saving…' : 'Save & generate QR →'}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 30px' }}>
          {error && <div style={{ background: '#FEE2E2', color: '#7F1D1D', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #FECACA' }}>{error}</div>}
          <form id="job-form" onSubmit={handleSubmit}>
            <div style={section}>
              <div style={sHead}>Customer details</div>
              <div style={{ ...sBody, gridTemplateColumns: '1fr 1fr' }}>
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
              <div style={{ ...sBody, gridTemplateColumns: '1fr 1fr' }}>
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
                <div><label style={label}>Location in property</label><input style={input} value={form.install_location} onChange={e => set('install_location', e.target.value)} placeholder="Master bedroom, north wall"/></div>
                <div style={{ gridColumn: 'span 2' }}><label style={label}>Job notes</label><textarea style={{ ...input, height: '80px', padding: '10px 12px', resize: 'none' as const }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes about the installation…"/></div>
              </div>
            </div>
            <div style={section}>
              <div style={sHead}>Service schedule</div>
              <div style={{ ...sBody, gridTemplateColumns: '1fr 1fr 1fr' }}>
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