'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#2AA198'
const TEAL_DARK = '#1E8C84'
const TEAL_LIGHT = '#E6F5F4'
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

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const isMobile = useIsMobile()
  const [customer, setCustomer] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [reviewClicks, setReviewClicks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')
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

  async function deleteCustomer() {
    setDeleting(true)
    setDeleteError('')

    try {
      // Step 1: get all job IDs
      const { data: jobData, error: jobFetchError } = await supabase
        .from('jobs').select('id').eq('customer_id', id)
      
      if (jobFetchError) throw new Error(`Fetch jobs: ${jobFetchError.message}`)
      
      const jobIds = jobData?.map(j => j.id) || []

      // Step 2: delete service_records for those jobs
      if (jobIds.length > 0) {
        const { error: srError } = await supabase
          .from('service_records').delete().in('job_id', jobIds)
        if (srError) throw new Error(`Delete service_records: ${srError.message}`)

        const { error: rcJobError } = await supabase
          .from('review_clicks').delete().in('job_id', jobIds)
        if (rcJobError) throw new Error(`Delete review_clicks (job): ${rcJobError.message}`)
      }

      // Step 3: delete review_clicks by customer_id
      const { error: rcError } = await supabase
        .from('review_clicks').delete().eq('customer_id', id)
      if (rcError) throw new Error(`Delete review_clicks (customer): ${rcError.message}`)

      // Step 4: delete jobs
      const { error: jobsError } = await supabase
        .from('jobs').delete().eq('customer_id', id)
      if (jobsError) throw new Error(`Delete jobs: ${jobsError.message}`)

      // Step 5: delete customer
      const { error: customerError } = await supabase
        .from('customers').delete().eq('id', id)
      if (customerError) throw new Error(`Delete customer: ${customerError.message}`)

      // Success — navigate away
      router.push('/dashboard/customers')

    } catch (err: any) {
      console.error('Delete failed:', err.message)
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  function setJobField(jobId: string, field: string, value: any) {
    setJobForms(prev => ({ ...prev, [jobId]: { ...prev[jobId], [field]: value } }))
  }

  function getDays(d: string) {
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function statusPill(nextServiceDate: string | null) {
    if (!nextServiceDate) return { label: 'No date', bg: '#F3F4F6', color: '#6B7280' }
    const days = getDays(nextServiceDate)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#D1FAE5', color: '#064E3B' }
  }

  const inp: React.CSSProperties = {
    width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px',
    border: `1px solid ${BORDER}`, background: WHITE, color: TEXT,
    fontFamily: 'inherit', fontSize: '14px', outline: 'none',
  }
  const lbl: React.CSSProperties = { fontSize: '12px', color: TEXT3, marginBottom: '4px', display: 'block', fontWeight: '500' }
  const pad = isMobile ? '16px' : '32px'

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  }

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/customers" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
    </div>
  )

  if (!customer) return null
  const uniquePlatforms = [...new Set(reviewClicks.map(r => r.platform))]

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/customers" />
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
            <div style={{ marginBottom: '8px' }}>
              <span onClick={() => router.push('/dashboard/customers')}
                style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontWeight: '500' }}>
                ← Customers
              </span>
            </div>
            <div style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: '800', color: WHITE, letterSpacing: '-0.6px', lineHeight: 1 }}>
              {customer.first_name} {customer.last_name}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '6px', fontWeight: '500' }}>
              Customer since {new Date(customer.created_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
              {customer.suburb ? ` · ${customer.suburb}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
            {saved && (
              <span style={{ fontSize: '12px', color: WHITE, fontWeight: '600', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px' }}>✓ Saved</span>
            )}
            <button onClick={() => setShowDeleteConfirm(true)}
              style={{ height: '38px', padding: '0 16px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(239,68,68,0.15)', color: WHITE, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.32)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}>
              Delete customer
            </button>
            <button onClick={() => router.push('/dashboard/jobs')}
              style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: 'none', background: WHITE, color: TEAL_DARK, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '7px' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke={TEAL_DARK} strokeWidth="2" strokeLinecap="round"/></svg>
              Add job
            </button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: `28px ${pad}`, paddingBottom: isMobile ? '90px' : '40px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', alignItems: 'flex-start' }}>

          {/* LEFT PANEL */}
          <div style={{ width: isMobile ? '100%' : '268px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>

            <div style={card}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Profile</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: TEXT }}>Contact details</div>
                </div>
                {!editingCustomer && (
                  <button onClick={() => setEditingCustomer(true)}
                    style={{ fontSize: '12px', color: TEXT3, background: 'none', border: `1px solid ${BORDER}`, borderRadius: '6px', cursor: 'pointer', padding: '4px 10px', fontFamily: 'inherit', fontWeight: '500' }}>
                    Edit
                  </button>
                )}
              </div>

              {!editingCustomer ? (
                <div>
                  {[
                    { label: 'Email', value: customer.email || '—' },
                    { label: 'Phone', value: customer.phone || '—' },
                    { label: 'Address', value: customer.address || '—' },
                    { label: 'Suburb', value: customer.suburb || '—' },
                    { label: 'Postcode', value: customer.postcode || '—' },
                    { label: 'Notes', value: customer.notes || '—' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 18px', borderBottom: `1px solid ${BORDER}`, gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: TEXT3, flexShrink: 0, fontWeight: '500' }}>{row.label}</span>
                      <span style={{ fontSize: '13px', color: TEXT, fontWeight: '600', textAlign: 'right' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div><label style={lbl}>First name</label><input style={inp} value={customerForm.first_name || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, first_name: e.target.value }))}/></div>
                    <div><label style={lbl}>Last name</label><input style={inp} value={customerForm.last_name || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, last_name: e.target.value }))}/></div>
                  </div>
                  <div><label style={lbl}>Email</label><input style={inp} value={customerForm.email || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, email: e.target.value }))}/></div>
                  <div><label style={lbl}>Phone</label><input style={inp} value={customerForm.phone || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, phone: e.target.value }))}/></div>
                  <div><label style={lbl}>Address</label><input style={inp} value={customerForm.address || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, address: e.target.value }))}/></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div><label style={lbl}>Suburb</label><input style={inp} value={customerForm.suburb || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, suburb: e.target.value }))}/></div>
                    <div><label style={lbl}>Postcode</label><input style={inp} value={customerForm.postcode || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, postcode: e.target.value }))}/></div>
                  </div>
                  <div><label style={lbl}>Notes</label><textarea style={{ ...inp, height: '60px', padding: '8px 10px', resize: 'none' as const }} value={customerForm.notes || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, notes: e.target.value }))}/></div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setEditingCustomer(false)} style={{ flex: 1, height: '36px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                    <button onClick={saveCustomer} disabled={saving} style={{ flex: 1, height: '36px', borderRadius: '8px', border: 'none', background: TEAL, color: WHITE, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>{saving ? 'Saving…' : 'Save'}</button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Units installed', value: jobs.length },
                { label: 'Service records', value: jobs.reduce((s, j) => s + (j.service_records?.length || 0), 0) },
              ].map(s => (
                <div key={s.label} style={{ ...card, padding: '16px' }}>
                  <div style={{ height: '3px', background: TEAL, borderRadius: '2px', marginBottom: '12px' }} />
                  <div style={{ fontSize: '26px', fontWeight: '800', color: TEXT, letterSpacing: '-0.6px' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: TEXT3, marginTop: '4px', fontWeight: '500' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {reviewClicks.length > 0 && (
              <div style={card}>
                <div style={{ padding: '13px 18px', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Engagement</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: TEXT }}>Review activity</div>
                </div>
                <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {uniquePlatforms.map(platform => {
                    const clicks = reviewClicks.filter(r => r.platform === platform)
                    const latest = new Date(clicks[0].clicked_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
                    return (
                      <div key={platform as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: TEXT }}>{platform as string}</span>
                        <span style={{ fontSize: '11px', color: TEXT3, background: '#F3F4F6', padding: '2px 8px', borderRadius: '6px' }}>{latest}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* JOBS */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {jobs.length} Unit{jobs.length !== 1 ? 's' : ''} installed
            </div>

            {jobs.length === 0 ? (
              <div style={{ ...card, padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
                No jobs yet for this customer.
              </div>
            ) : jobs.map(job => {
              const s = statusPill(job.next_service_date)
              const f = jobForms[job.id] || job
              const isEditing = editingJobId === job.id
              const accentColor = s.label === 'Overdue' ? '#EF4444' : s.label === 'Due soon' ? '#F59E0B' : TEAL
              return (
                <div key={job.id} style={card}>
                  <div style={{ height: '3px', background: accentColor }} />
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: TEXT }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} {job.equipment_type?.replace('_', ' ')}</div>
                      {job.model && <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px', fontWeight: '500' }}>Model: {job.model}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ background: s.bg, color: s.color, padding: '4px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{s.label}</span>
                      {!isEditing && (
                        <button onClick={() => setEditingJobId(job.id)}
                          style={{ height: '30px', padding: '0 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {!isEditing ? (
                    <>
                      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
                        {[
                          { label: 'Serial number', value: job.serial_number || '—', mono: true },
                          { label: 'Installed', value: new Date(job.install_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) },
                          { label: 'Next service', value: job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—', danger: job.next_service_date && getDays(job.next_service_date) < 0 },
                          { label: 'Warranty expiry', value: job.warranty_expiry ? new Date(job.warranty_expiry).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                          { label: 'Location', value: job.install_location || '—' },
                          { label: 'Service interval', value: `Every ${job.service_interval_months} months` },
                        ].map(row => (
                          <div key={row.label}>
                            <div style={{ fontSize: '11px', color: TEXT3, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{row.label}</div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: row.danger ? '#B91C1C' : TEXT, fontFamily: row.mono ? 'monospace' : 'inherit' }}>{row.value}</div>
                          </div>
                        ))}
                      </div>
                      {job.notes && (
                        <div style={{ padding: '0 20px 16px' }}>
                          <div style={{ fontSize: '11px', color: TEXT3, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Notes</div>
                          <div style={{ fontSize: '13px', color: TEXT2 }}>{job.notes}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                        <div><label style={lbl}>Brand</label><input style={inp} value={f.brand || ''} onChange={e => setJobField(job.id, 'brand', e.target.value)}/></div>
                        <div><label style={lbl}>Model</label><input style={inp} value={f.model || ''} onChange={e => setJobField(job.id, 'model', e.target.value)}/></div>
                        <div><label style={lbl}>Capacity (kW)</label><input style={inp} value={f.capacity_kw || ''} onChange={e => setJobField(job.id, 'capacity_kw', e.target.value)}/></div>
                        <div><label style={lbl}>Equipment type</label>
                          <select style={inp} value={f.equipment_type || ''} onChange={e => setJobField(job.id, 'equipment_type', e.target.value)}>
                            <option value="split_system">Split system</option>
                            <option value="ducted">Ducted system</option>
                            <option value="multi_head">Multi-head split</option>
                            <option value="cassette">Cassette unit</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div><label style={lbl}>Serial number</label><input style={inp} value={f.serial_number || ''} onChange={e => setJobField(job.id, 'serial_number', e.target.value)}/></div>
                        <div><label style={lbl}>Location</label><input style={inp} value={f.install_location || ''} onChange={e => setJobField(job.id, 'install_location', e.target.value)}/></div>
                        <div><label style={lbl}>Install date</label><input type="date" style={inp} value={f.install_date?.slice(0, 10) || ''} onChange={e => setJobField(job.id, 'install_date', e.target.value)}/></div>
                        <div><label style={lbl}>Warranty expiry</label><input type="date" style={inp} value={f.warranty_expiry?.slice(0, 10) || ''} onChange={e => setJobField(job.id, 'warranty_expiry', e.target.value)}/></div>
                        <div><label style={lbl}>Service interval</label>
                          <select style={inp} value={f.service_interval_months || 12} onChange={e => setJobField(job.id, 'service_interval_months', e.target.value)}>
                            <option value="6">Every 6 months</option>
                            <option value="12">Every 12 months</option>
                            <option value="18">Every 18 months</option>
                            <option value="24">Every 24 months</option>
                          </select>
                        </div>
                        <div><label style={lbl}>Reminder</label>
                          <select style={inp} value={f.reminder_lead_days || 14} onChange={e => setJobField(job.id, 'reminder_lead_days', e.target.value)}>
                            <option value="14">2 weeks before</option>
                            <option value="28">4 weeks before</option>
                            <option value="42">6 weeks before</option>
                            <option value="56">8 weeks before</option>
                          </select>
                        </div>
                      </div>
                      <div><label style={lbl}>Notes</label><textarea style={{ ...inp, height: '70px', padding: '8px 10px', resize: 'none' as const }} value={f.notes || ''} onChange={e => setJobField(job.id, 'notes', e.target.value)}/></div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setEditingJobId(null)} style={{ flex: 1, height: '36px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={() => saveJob(job.id)} disabled={saving} style={{ flex: 1, height: '36px', borderRadius: '8px', border: 'none', background: TEAL, color: WHITE, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>{saving ? 'Saving…' : 'Save changes'}</button>
                      </div>
                    </div>
                  )}

                  {job.service_records?.length > 0 && (
                    <div style={{ borderTop: `1px solid ${BORDER}`, padding: '16px 20px', background: '#FAFAFA' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Service history</div>
                      {job.service_records.map((sr: any) => (
                        <div key={sr.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${BORDER}`, gap: '10px' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT }}>{sr.service_type?.replace('_', ' ')}</div>
                            {sr.notes && <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{sr.notes}</div>}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '12px', color: TEXT2, fontWeight: '500' }}>{new Date(sr.service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
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

      {/* DELETE CONFIRM MODAL */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: WHITE, borderRadius: '16px', width: '100%', maxWidth: '420px', border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
            <div style={{ height: '4px', background: '#EF4444' }} />
            <div style={{ padding: '24px 24px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Danger zone</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: TEXT, marginBottom: '10px' }}>
                Delete {customer.first_name} {customer.last_name}?
              </div>
              <div style={{ fontSize: '14px', color: TEXT3, lineHeight: 1.6 }}>
                This will permanently delete this customer and all {jobs.length} associated job{jobs.length !== 1 ? 's' : ''}. This cannot be undone.
              </div>
              {deleteError && (
                <div style={{ marginTop: '12px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', color: '#B91C1C' }}>
                  {deleteError}
                </div>
              )}
            </div>
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteError('') }}
                style={{ flex: 1, height: '42px', borderRadius: '9px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={deleteCustomer} disabled={deleting}
                style={{ flex: 1, height: '42px', borderRadius: '9px', border: 'none', background: '#EF4444', color: WHITE, fontSize: '14px', fontWeight: '700', cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}