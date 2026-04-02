'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const A = '#1C1C1E'
const TEAL = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#EBEBEB'
const BG = '#FAFAF8'

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
    if (!nextServiceDate) return { label: 'No date', bg: '#F0F0F0', color: '#555' }
    const days = getDays(nextServiceDate)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#D1FAE5', color: '#064E3B' }
  }

  const inp: React.CSSProperties = { width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT, fontFamily: 'inherit', fontSize: '14px', outline: 'none' }
  const lbl: React.CSSProperties = { fontSize: '12px', color: TEXT3, marginBottom: '4px', display: 'block' }
  const pad = isMobile ? '16px' : '32px'

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/customers" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
    </div>
  )

  if (!customer) return null
  const initials = (customer.first_name?.[0] || '') + (customer.last_name?.[0] || '')
  const uniquePlatforms = [...new Set(reviewClicks.map(r => r.platform))]

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/customers" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* Flush header */}
        <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: isMobile ? '20px 16px 16px' : `24px ${pad} 20px`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span onClick={() => router.push('/dashboard/customers')}
                style={{ fontSize: '12px', color: TEXT3, cursor: 'pointer', fontWeight: '500' }}>
                ← Customers
              </span>
            </div>
            <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: TEXT, letterSpacing: '-0.5px', lineHeight: 1 }}>
              {customer.first_name} {customer.last_name}
            </div>
            <div style={{ fontSize: '13px', color: TEXT3, marginTop: '5px' }}>
              Customer since {new Date(customer.created_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
              {customer.suburb ? ` · ${customer.suburb}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {saved && <span style={{ fontSize: '12px', color: '#065F46', fontWeight: '500' }}>✓ Saved</span>}
            <button onClick={() => router.push('/dashboard/jobs')}
              style={{ height: '38px', padding: '0 16px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              + Add job
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: `24px ${pad}`, paddingBottom: isMobile ? '90px' : '32px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', alignItems: 'flex-start' }}>

          {/* Left panel */}
          <div style={{ width: isMobile ? '100%' : '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Customer details */}
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: TEXT }}>Contact details</span>
                {!editingCustomer && (
                  <button onClick={() => setEditingCustomer(true)}
                    style={{ fontSize: '12px', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
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
                      <span style={{ fontSize: '12px', color: TEXT3, flexShrink: 0 }}>{row.label}</span>
                      <span style={{ fontSize: '13px', color: TEXT, fontWeight: '500', textAlign: 'right' }}>{row.value}</span>
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
                    <button onClick={saveCustomer} disabled={saving} style={{ flex: 1, height: '36px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>{saving ? 'Saving…' : 'Save'}</button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Units installed', value: jobs.length },
                { label: 'Service records', value: jobs.reduce((s, j) => s + (j.service_records?.length || 0), 0) },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: TEXT, letterSpacing: '-0.5px' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: TEXT3, marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Review activity */}
            {reviewClicks.length > 0 && (
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '13px 18px', borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: TEXT }}>Review activity</span>
                </div>
                <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {uniquePlatforms.map(platform => {
                    const clicks = reviewClicks.filter(r => r.platform === platform)
                    const latest = new Date(clicks[0].clicked_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
                    return (
                      <div key={platform as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>{platform as string}</span>
                        <span style={{ fontSize: '11px', color: TEXT3 }}>{latest}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Jobs */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT3, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
              {jobs.length} Unit{jobs.length !== 1 ? 's' : ''} installed
            </div>

            {jobs.length === 0 ? (
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
                No jobs yet for this customer.
              </div>
            ) : jobs.map(job => {
              const s = statusPill(job.next_service_date)
              const f = jobForms[job.id] || job
              const isEditing = editingJobId === job.id
              return (
                <div key={job.id} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ height: '3px', background: s.label === 'Overdue' ? '#EF4444' : s.label === 'Due soon' ? '#F59E0B' : TEAL }} />
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: TEXT }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} {job.equipment_type?.replace('_', ' ')}</div>
                      {job.model && <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>Model: {job.model}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ background: s.bg, color: s.color, padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{s.label}</span>
                      {!isEditing && (
                        <button onClick={() => setEditingJobId(job.id)}
                          style={{ height: '30px', padding: '0 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {!isEditing ? (
                    <>
                      <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '14px' }}>
                        {[
                          { label: 'Serial number', value: job.serial_number || '—', mono: true },
                          { label: 'Installed', value: new Date(job.install_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) },
                          { label: 'Next service', value: job.next_service_date ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—', danger: job.next_service_date && getDays(job.next_service_date) < 0 },
                          { label: 'Warranty expiry', value: job.warranty_expiry ? new Date(job.warranty_expiry).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                          { label: 'Location', value: job.install_location || '—' },
                          { label: 'Service interval', value: `Every ${job.service_interval_months} months` },
                        ].map(row => (
                          <div key={row.label}>
                            <div style={{ fontSize: '11px', color: TEXT3, marginBottom: '3px' }}>{row.label}</div>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: row.danger ? '#B91C1C' : TEXT, fontFamily: row.mono ? 'monospace' : 'inherit' }}>{row.value}</div>
                          </div>
                        ))}
                      </div>
                      {job.notes && (
                        <div style={{ padding: '0 18px 14px' }}>
                          <div style={{ fontSize: '11px', color: TEXT3, marginBottom: '3px' }}>Notes</div>
                          <div style={{ fontSize: '13px', color: TEXT2 }}>{job.notes}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                        <button onClick={() => saveJob(job.id)} disabled={saving} style={{ flex: 1, height: '36px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>{saving ? 'Saving…' : 'Save changes'}</button>
                      </div>
                    </div>
                  )}

                  {job.service_records?.length > 0 && (
                    <div style={{ borderTop: `1px solid ${BORDER}`, padding: '14px 18px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, marginBottom: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Service history</div>
                      {job.service_records.map((sr: any) => (
                        <div key={sr.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${BORDER}`, gap: '10px' }}>
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