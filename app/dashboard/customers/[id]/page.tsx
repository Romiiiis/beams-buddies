'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/lib/useBusiness'

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
          <img src="https://static.wixstatic.com/media/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png/v1/fill/w_200,h_200/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png" alt="Jobyra" style={{ width: '56px', height: '56px', borderRadius: '9px', objectFit: 'cover', flexShrink: 0 }} />
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
          {logoUrl ? (
                <img src={logoUrl} alt={businessName || 'Logo'} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'contain', background: '#fff', padding: '2px', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#CCEFED', color: '#0A4F4C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}>RA</div>
              )}
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

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const business = useBusiness()
  const [customer, setCustomer] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [reviewClicks, setReviewClicks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(false)
  const [editingJobId, setEditingJobId] = useState<string | null>(null)
  const [customerForm, setCustomerForm] = useState<any>({})
  const [jobForms, setJobForms] = useState<Record<string, any>>({})

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const [customerRes, jobsRes, clicksRes] = await Promise.all([
        supabase.from('customers').select('*').eq('id', id).single(),
        supabase.from('jobs').select('*, service_records(*)').eq('customer_id', id).order('created_at', { ascending: false }),
        supabase.from('review_clicks').select('*').eq('customer_id', id).order('clicked_at', { ascending: false }),
      ])
      setCustomer(customerRes.data)
      setCustomerForm(customerRes.data)
      setJobs(jobsRes.data || [])
      const forms: Record<string, any> = {}
      for (const job of jobsRes.data || []) forms[job.id] = { ...job }
      setJobForms(forms)
      setReviewClicks(clicksRes.data || [])
      setLoading(false)
    }
    load()
  }, [id, router])

  async function saveCustomer() {
    setSaving(true)
    await supabase.from('customers').update({
      first_name: customerForm.first_name, last_name: customerForm.last_name,
      email: customerForm.email, phone: customerForm.phone,
      address: customerForm.address, suburb: customerForm.suburb,
      postcode: customerForm.postcode, notes: customerForm.notes,
    }).eq('id', id)
    setCustomer(customerForm)
    setEditingCustomer(false)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function saveJob(jobId: string) {
    setSaving(true)
    const f = jobForms[jobId]
    await supabase.from('jobs').update({
      brand: f.brand, model: f.model,
      capacity_kw: f.capacity_kw ? parseFloat(f.capacity_kw) : null,
      equipment_type: f.equipment_type, serial_number: f.serial_number,
      install_location: f.install_location, install_date: f.install_date,
      warranty_expiry: f.warranty_expiry || null,
      service_interval_months: parseInt(f.service_interval_months),
      reminder_lead_days: parseInt(f.reminder_lead_days), notes: f.notes,
    }).eq('id', jobId)
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...f } : j))
    setEditingJobId(null)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function setJobField(jobId: string, field: string, value: any) {
    setJobForms(prev => ({ ...prev, [jobId]: { ...prev[jobId], [field]: value } }))
  }

  function getDays(d: string) {
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function statusPill(nextServiceDate: string | null) {
    if (!nextServiceDate) return { label: 'No date', bg: '#EBEBEB', color: '#3A3A3A' }
    const days = getDays(nextServiceDate)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#D1FAE5', color: '#064E3B' }
  }

  async function signOut() { await supabase.auth.signOut(); router.push('/login') }

  const input: React.CSSProperties = {
    width: '100%', height: '36px', padding: '0 10px', borderRadius: '8px',
    border: `1px solid ${BORDER}`, background: '#fff', color: TEXT,
    fontFamily: 'inherit', fontSize: '13px', outline: 'none',
  }
  const label: React.CSSProperties = { fontSize: '11px', color: TEXT3, marginBottom: '4px', display: 'block' }

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <div style={{ width: '232px', flexShrink: 0, background: '#fff', borderRight: `1px solid ${BORDER}` }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
    </div>
  )

  if (!customer) return null
  const initials = (customer.first_name?.[0] || '') + (customer.last_name?.[0] || '')
  const uniquePlatforms = [...new Set(reviewClicks.map(r => r.platform))]

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/customers" router={router} onSignOut={signOut} logoUrl={business?.logo_url || ''} businessName={business?.name || ''} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ height: '58px', background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span onClick={() => router.push('/dashboard/customers')} style={{ fontSize: '13px', color: A, cursor: 'pointer', fontWeight: '500' }}>← Customers</span>
            <span style={{ color: BORDER }}>|</span>
            <span style={{ fontSize: '17px', fontWeight: '600', color: TEXT }}>{customer.first_name} {customer.last_name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {saved && <span style={{ fontSize: '13px', color: '#065F46', fontWeight: '500' }}>✓ Saved</span>}
            <button onClick={() => router.push('/dashboard/jobs')}
              style={{ height: '36px', padding: '0 18px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              + Add job
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 30px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#CCEFED', color: '#0A4F4C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '600' }}>{initials}</div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: TEXT }}>{customer.first_name} {customer.last_name}</div>
                  <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Since {new Date(customer.created_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
              {!editingCustomer ? (
                <>
                  {[
                    { label: 'Email', value: customer.email || '—' },
                    { label: 'Phone', value: customer.phone || '—' },
                    { label: 'Address', value: customer.address || '—' },
                    { label: 'Suburb', value: customer.suburb || '—' },
                    { label: 'Postcode', value: customer.postcode || '—' },
                    { label: 'Notes', value: customer.notes || '—' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 18px', borderBottom: '1px solid #F0F0F0', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: TEXT3, flexShrink: 0 }}>{row.label}</span>
                      <span style={{ fontSize: '13px', color: TEXT, fontWeight: '500', textAlign: 'right' }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ padding: '12px 18px' }}>
                    <button onClick={() => setEditingCustomer(true)}
                      style={{ width: '100%', height: '34px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Edit customer details
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><label style={label}>First name</label><input style={input} value={customerForm.first_name || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, first_name: e.target.value }))}/></div>
                    <div><label style={label}>Last name</label><input style={input} value={customerForm.last_name || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, last_name: e.target.value }))}/></div>
                  </div>
                  <div><label style={label}>Email</label><input style={input} value={customerForm.email || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, email: e.target.value }))}/></div>
                  <div><label style={label}>Phone</label><input style={input} value={customerForm.phone || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, phone: e.target.value }))}/></div>
                  <div><label style={label}>Address</label><input style={input} value={customerForm.address || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, address: e.target.value }))}/></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><label style={label}>Suburb</label><input style={input} value={customerForm.suburb || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, suburb: e.target.value }))}/></div>
                    <div><label style={label}>Postcode</label><input style={input} value={customerForm.postcode || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, postcode: e.target.value }))}/></div>
                  </div>
                  <div><label style={label}>Notes</label><textarea style={{ ...input, height: '60px', padding: '8px 10px', resize: 'none' as const }} value={customerForm.notes || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, notes: e.target.value }))}/></div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setEditingCustomer(false)} style={{ flex: 1, height: '34px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                    <button onClick={saveCustomer} disabled={saving} style={{ flex: 1, height: '34px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>{saving ? 'Saving…' : 'Save'}</button>
                  </div>
                </div>
              )}
            </div>

            {reviewClicks.length > 0 && (
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '13px 20px', borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: TEXT }}>Review activity</span>
                </div>
                <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {uniquePlatforms.map(platform => {
                    const clicks = reviewClicks.filter(r => r.platform === platform)
                    const latest = new Date(clicks[0].clicked_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
                    return (
                      <div key={platform as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                            {(platform as string).toLowerCase().includes('google') ? '🔍' : (platform as string).toLowerCase().includes('facebook') ? '👍' : '⭐'}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>{platform as string}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: TEXT3 }}>{latest}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {jobs.length === 0 ? (
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>No jobs yet for this customer.</div>
            ) : jobs.map(job => {
              const s = statusPill(job.next_service_date)
              const f = jobForms[job.id] || job
              const isEditing = editingJobId === job.id
              return (
                <div key={job.id} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ height: '3px', background: A }} />
                  <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: TEXT }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} {job.equipment_type?.replace('_', ' ')}</div>
                      {job.model && <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Model: {job.model}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: s.bg, color: s.color, padding: '4px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{s.label}</span>
                      {!isEditing && (
                        <button onClick={() => setEditingJobId(job.id)}
                          style={{ height: '32px', padding: '0 14px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {!isEditing ? (
                    <>
                      <div style={{ padding: '14px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div><div style={{ fontSize: '11px', color: TEXT3, marginBottom: '3px' }}>Serial number</div><div style={{ fontSize: '13px', fontWeight: '500', color: TEXT, fontFamily: 'monospace' }}>{job.serial_number || '—'}</div></div>
                        <div><div style={{ fontSize: '11px', color: TEXT3, marginBottom: '3px' }}>Installed</div><div style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>{new Date(job.install_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
                        <div><div style={{ fontSize: '11px', color: TEXT3, marginBottom: '3px' }}>Next service</div><div style={{ fontSize: '13px', fontWeight: '500', color: job.next_service_date && getDays(job.next_service_date) < 0 ? '#B91C1C' : TEXT }}>{job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</div></div>
                        <div><div style={{ fontSize: '11px', color: TEXT3, marginBottom: '3px' }}>Warranty expiry</div><div style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>{job.warranty_expiry ? new Date(job.warranty_expiry).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</div></div>
                        <div><div style={{ fontSize: '11px', color: TEXT3, marginBottom: '3px' }}>Location</div><div style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>{job.install_location || '—'}</div></div>
                        <div><div style={{ fontSize: '11px', color: TEXT3, marginBottom: '3px' }}>Service interval</div><div style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>Every {job.service_interval_months} months</div></div>
                      </div>
                      {job.notes && <div style={{ padding: '0 22px 14px' }}><div style={{ fontSize: '11px', color: TEXT3, marginBottom: '3px' }}>Notes</div><div style={{ fontSize: '13px', color: TEXT2 }}>{job.notes}</div></div>}
                    </>
                  ) : (
                    <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div><label style={label}>Brand</label><input style={input} value={f.brand || ''} onChange={e => setJobField(job.id, 'brand', e.target.value)}/></div>
                        <div><label style={label}>Model</label><input style={input} value={f.model || ''} onChange={e => setJobField(job.id, 'model', e.target.value)}/></div>
                        <div><label style={label}>Capacity (kW)</label><input style={input} value={f.capacity_kw || ''} onChange={e => setJobField(job.id, 'capacity_kw', e.target.value)}/></div>
                        <div><label style={label}>Equipment type</label>
                          <select style={input} value={f.equipment_type || ''} onChange={e => setJobField(job.id, 'equipment_type', e.target.value)}>
                            <option value="split_system">Split system</option>
                            <option value="ducted">Ducted system</option>
                            <option value="multi_head">Multi-head split</option>
                            <option value="cassette">Cassette unit</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div><label style={label}>Serial number</label><input style={input} value={f.serial_number || ''} onChange={e => setJobField(job.id, 'serial_number', e.target.value)}/></div>
                        <div><label style={label}>Location in property</label><input style={input} value={f.install_location || ''} onChange={e => setJobField(job.id, 'install_location', e.target.value)}/></div>
                        <div><label style={label}>Installation date</label><input type="date" style={input} value={f.install_date?.slice(0, 10) || ''} onChange={e => setJobField(job.id, 'install_date', e.target.value)}/></div>
                        <div><label style={label}>Warranty expiry</label><input type="date" style={input} value={f.warranty_expiry?.slice(0, 10) || ''} onChange={e => setJobField(job.id, 'warranty_expiry', e.target.value)}/></div>
                        <div><label style={label}>Service interval</label>
                          <select style={input} value={f.service_interval_months || 12} onChange={e => setJobField(job.id, 'service_interval_months', e.target.value)}>
                            <option value="6">Every 6 months</option>
                            <option value="12">Every 12 months</option>
                            <option value="18">Every 18 months</option>
                            <option value="24">Every 24 months</option>
                          </select>
                        </div>
                        <div><label style={label}>Reminder lead time</label>
                          <select style={input} value={f.reminder_lead_days || 14} onChange={e => setJobField(job.id, 'reminder_lead_days', e.target.value)}>
                            <option value="14">2 weeks before</option>
                            <option value="28">4 weeks before</option>
                            <option value="42">6 weeks before</option>
                            <option value="56">8 weeks before</option>
                          </select>
                        </div>
                      </div>
                      <div><label style={label}>Job notes</label><textarea style={{ ...input, height: '70px', padding: '8px 10px', resize: 'none' as const }} value={f.notes || ''} onChange={e => setJobField(job.id, 'notes', e.target.value)}/></div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setEditingJobId(null)} style={{ flex: 1, height: '36px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={() => saveJob(job.id)} disabled={saving} style={{ flex: 1, height: '36px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>{saving ? 'Saving…' : 'Save changes'}</button>
                      </div>
                    </div>
                  )}

                  {job.service_records?.length > 0 && (
                    <div style={{ borderTop: `1px solid ${BORDER}`, padding: '14px 22px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: TEXT3, marginBottom: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Service history</div>
                      {job.service_records.map((sr: any) => (
                        <div key={sr.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F0F0F0' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>{sr.service_type?.replace('_', ' ')}</div>
                            {sr.notes && <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{sr.notes}</div>}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '12px', color: TEXT2 }}>{new Date(sr.service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            {sr.cost && <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>${sr.cost}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}