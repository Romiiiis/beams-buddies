'use client'

import React, { useEffect, useMemo, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const RED = '#B91C1C'
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
  valueLg: {
    fontSize: '28px',
    fontWeight: 900,
    letterSpacing: '-0.05em' as const,
    lineHeight: 1,
    color: TEXT,
  },
  valueMd: {
    fontSize: '20px',
    fontWeight: 900,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
    lineHeight: 1,
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
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrow({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconEdit({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="m16.5 3.5 4 4L7 21l-4 1 1-4L16.5 3.5Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrash({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconMail({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPhone({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72l.34 2.71a2 2 0 0 1-.57 1.72L7.1 9.9a16 16 0 0 0 7 7l1.75-1.78a2 2 0 0 1 1.72-.57l2.71.34A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  )
}

function IconMapPin({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s-6-5.33-6-11a6 6 0 1 1 12 0c0 5.67-6 11-6 11Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

function IconTool({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.86l-6.01 6.01a1.5 1.5 0 1 0 2.12 2.12l6.01-6.01a4 4 0 0 0 5.86-5.4l-2.33 2.33-2.25-.45-.45-2.25 2.45-2.21Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCalendar({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconClock({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.9" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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
      if (!session) {
        router.push('/login')
        return
      }

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
      first_name: customerForm.first_name,
      last_name: customerForm.last_name,
      email: customerForm.email,
      phone: customerForm.phone,
      address: customerForm.address,
      suburb: customerForm.suburb,
      postcode: customerForm.postcode,
      notes: customerForm.notes,
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
      brand: f.brand,
      model: f.model,
      capacity_kw: f.capacity_kw ? parseFloat(f.capacity_kw) : null,
      equipment_type: f.equipment_type,
      serial_number: f.serial_number,
      install_location: f.install_location,
      install_date: f.install_date,
      warranty_expiry: f.warranty_expiry || null,
      service_interval_months: parseInt(f.service_interval_months),
      reminder_lead_days: parseInt(f.reminder_lead_days),
      notes: f.notes,
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
      const { data: jobData, error: jobFetchError } = await supabase
        .from('jobs')
        .select('id')
        .eq('customer_id', id)

      if (jobFetchError) throw new Error(`Fetch jobs: ${jobFetchError.message}`)

      const jobIds = jobData?.map(j => j.id) || []

      if (jobIds.length > 0) {
        const { error: srError } = await supabase
          .from('service_records')
          .delete()
          .in('job_id', jobIds)
        if (srError) throw new Error(`Delete service_records: ${srError.message}`)

        const { error: rcJobError } = await supabase
          .from('review_clicks')
          .delete()
          .in('job_id', jobIds)
        if (rcJobError) throw new Error(`Delete review_clicks (by job): ${rcJobError.message}`)
      }

      const { error: rcError } = await supabase
        .from('review_clicks')
        .delete()
        .eq('customer_id', id)
      if (rcError) throw new Error(`Delete review_clicks (by customer): ${rcError.message}`)

      const { error: invError } = await supabase
        .from('invoices')
        .delete()
        .eq('customer_id', id)
      if (invError) throw new Error(`Delete invoices: ${invError.message}`)

      const { error: quoteError } = await supabase
        .from('quotes')
        .delete()
        .eq('customer_id', id)
      if (quoteError) throw new Error(`Delete quotes: ${quoteError.message}`)

      const { error: jobsError } = await supabase
        .from('jobs')
        .delete()
        .eq('customer_id', id)
      if (jobsError) throw new Error(`Delete jobs: ${jobsError.message}`)

      const { error: customerError } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
      if (customerError) throw new Error(`Delete customer: ${customerError.message}`)

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
    if (!nextServiceDate) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }
    const days = getDays(nextServiceDate)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#DCFCE7', color: '#166534' }
  }

  const totalServiceRecords = useMemo(() => {
    return jobs.reduce((s, j) => s + (j.service_records?.length || 0), 0)
  }, [jobs])

  const uniquePlatforms = [...new Set(reviewClicks.map(r => r.platform))]
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

  const iconWrap = (color: string): React.CSSProperties => ({
    width: '34px',
    height: '34px',
    borderRadius: '11px',
    background: '#F8FAFC',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${BORDER}`,
    flexShrink: 0,
  })

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    borderRadius: '10px',
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT,
    fontFamily: FONT,
    fontSize: '13px',
    outline: 'none',
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    height: '78px',
    padding: '10px 12px',
    resize: 'none',
  }

  const labelStyle: React.CSSProperties = {
    ...TYPE.label,
    marginBottom: '6px',
    display: 'block',
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/customers" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>
          Loading customer...
        </div>
      </div>
    )
  }

  if (!customer) return null

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: FONT,
        background: BG,
        overflow: 'hidden',
      }}
    >
      <Sidebar active="/dashboard/customers" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: BG }}>
        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: BG }}>
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
                onClick={() => router.push('/dashboard/customers')}
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
                Customers
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
                {customer.first_name} {customer.last_name}
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
                Customer since {new Date(customer.created_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
                {customer.suburb ? ` • ${customer.suburb}` : ''}
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
                  onClick={() => router.push('/dashboard/jobs')}
                  style={{
                    ...quickActionStyle,
                    background: TEAL,
                    color: '#FFFFFF',
                    border: 'none',
                  }}
                >
                  <IconSpark size={16} />
                  Add job
                </button>

                <button
                  onClick={() => setEditingCustomer(true)}
                  style={quickActionStyle}
                >
                  <IconEdit size={15} />
                  Edit customer
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    ...quickActionStyle,
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <IconTrash size={15} />
                  Delete customer
                </button>

                {saved && (
                  <div
                    style={{
                      height: '38px',
                      padding: '0 14px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.12)',
                      color: '#FFFFFF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    Saved
                  </div>
                )}
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0,1fr))',
                gap: '10px',
                alignItems: 'start',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gap: '10px',
                  gridColumn: isMobile ? 'span 1' : 'span 4',
                }}
              >
                <div style={{ ...shellCard, padding: '14px' }}>
                  <div style={sectionLabel}>{sectionDash}Profile</div>

                  {!editingCustomer ? (
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {[
                        { label: 'Email', value: customer.email || '—', icon: <IconMail size={16} />, color: TEAL_DARK },
                        { label: 'Phone', value: customer.phone || '—', icon: <IconPhone size={16} />, color: TEXT },
                        { label: 'Address', value: customer.address || '—', icon: <IconMapPin size={16} />, color: AMBER },
                        { label: 'Suburb', value: customer.suburb || '—', icon: <IconMapPin size={16} />, color: TEAL_DARK },
                        { label: 'Postcode', value: customer.postcode || '—', icon: <IconMapPin size={16} />, color: TEXT },
                      ].map(row => (
                        <div
                          key={row.label}
                          style={{
                            borderRadius: '12px',
                            border: `1px solid ${BORDER}`,
                            background: WHITE,
                            padding: '12px 13px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                          }}
                        >
                          <div style={iconWrap(row.color)}>
                            {row.icon}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ ...TYPE.label, marginBottom: '4px' }}>{row.label}</div>
                            <div style={{ ...TYPE.body, wordBreak: 'break-word' }}>{row.value}</div>
                          </div>
                        </div>
                      ))}

                      <div
                        style={{
                          borderRadius: '12px',
                          border: `1px solid ${BORDER}`,
                          background: WHITE,
                          padding: '12px 13px',
                        }}
                      >
                        <div style={{ ...TYPE.label, marginBottom: '5px' }}>Notes</div>
                        <div style={TYPE.body}>{customer.notes || '—'}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={labelStyle}>First name</label>
                          <input style={inputStyle} value={customerForm.first_name || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, first_name: e.target.value }))} />
                        </div>
                        <div>
                          <label style={labelStyle}>Last name</label>
                          <input style={inputStyle} value={customerForm.last_name || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, last_name: e.target.value }))} />
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>Email</label>
                        <input style={inputStyle} value={customerForm.email || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, email: e.target.value }))} />
                      </div>

                      <div>
                        <label style={labelStyle}>Phone</label>
                        <input style={inputStyle} value={customerForm.phone || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, phone: e.target.value }))} />
                      </div>

                      <div>
                        <label style={labelStyle}>Address</label>
                        <input style={inputStyle} value={customerForm.address || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, address: e.target.value }))} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={labelStyle}>Suburb</label>
                          <input style={inputStyle} value={customerForm.suburb || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, suburb: e.target.value }))} />
                        </div>
                        <div>
                          <label style={labelStyle}>Postcode</label>
                          <input style={inputStyle} value={customerForm.postcode || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, postcode: e.target.value }))} />
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>Notes</label>
                        <textarea style={textareaStyle} value={customerForm.notes || ''} onChange={e => setCustomerForm((p: any) => ({ ...p, notes: e.target.value }))} />
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setEditingCustomer(false)}
                          style={{
                            flex: 1,
                            height: '38px',
                            borderRadius: '10px',
                            border: `1px solid ${BORDER}`,
                            background: WHITE,
                            color: TEXT2,
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: FONT,
                          }}
                        >
                          Cancel
                        </button>

                        <button
                          onClick={saveCustomer}
                          disabled={saving}
                          style={{
                            flex: 1,
                            height: '38px',
                            borderRadius: '10px',
                            border: 'none',
                            background: TEAL,
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: FONT,
                          }}
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div style={sectionLabel}>{sectionDash}Overview</div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                    }}
                  >
                    {[
                      {
                        label: 'Units installed',
                        value: jobs.length,
                        sub: 'Tracked on file',
                        icon: <IconTool size={16} />,
                        accent: TEXT,
                      },
                      {
                        label: 'Service records',
                        value: totalServiceRecords,
                        sub: 'Logged visits',
                        icon: <IconClock size={16} />,
                        accent: TEAL_DARK,
                      },
                    ].map(item => (
                      <div
                        key={item.label}
                        style={{
                          ...shellCard,
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          minHeight: '118px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <div style={iconWrap(item.accent)}>
                            {item.icon}
                          </div>
                          <div style={{ ...TYPE.label }}>Live</div>
                        </div>

                        <div>
                          <div style={{ ...TYPE.label, marginBottom: '5px' }}>{item.label}</div>
                          <div style={{ ...TYPE.valueMd, marginBottom: '5px' }}>{item.value}</div>
                          <div style={TYPE.bodySm}>{item.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {reviewClicks.length > 0 && (
                  <div style={{ ...shellCard, padding: '14px' }}>
                    <div style={sectionLabel}>{sectionDash}Review activity</div>

                    <div style={{ display: 'grid', gap: '8px' }}>
                      {uniquePlatforms.map(platform => {
                        const clicks = reviewClicks.filter(r => r.platform === platform)
                        const latest = new Date(clicks[0].clicked_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })

                        return (
                          <div
                            key={platform as string}
                            style={{
                              borderRadius: '12px',
                              border: `1px solid ${BORDER}`,
                              background: WHITE,
                              padding: '12px 13px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '10px',
                            }}
                          >
                            <div>
                              <div style={TYPE.titleSm}>{platform as string}</div>
                              <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>{clicks.length} click{clicks.length !== 1 ? 's' : ''}</div>
                            </div>
                            <div style={{ ...TYPE.bodySm, flexShrink: 0 }}>
                              {latest}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: '10px',
                  gridColumn: isMobile ? 'span 1' : 'span 8',
                }}
              >
                <div style={{ ...shellCard, padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '10px', flexDirection: isMobile ? 'column' : 'row', marginBottom: '10px' }}>
                    <div style={sectionLabel}>{sectionDash}Installed units</div>

                    <div
                      style={{
                        height: '34px',
                        borderRadius: '10px',
                        border: `1px solid ${BORDER}`,
                        background: '#F8FAFC',
                        color: TEXT2,
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '0 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontFamily: FONT,
                      }}
                    >
                      {jobs.length} unit{jobs.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {jobs.length === 0 ? (
                    <div
                      style={{
                        borderRadius: '12px',
                        padding: '26px 16px',
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        textAlign: 'center',
                        color: TEXT3,
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      No jobs yet for this customer.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {jobs.map(job => {
                        const s = statusPill(job.next_service_date)
                        const f = jobForms[job.id] || job
                        const isEditing = editingJobId === job.id
                        const accentColor = s.label === 'Overdue' ? RED : s.label === 'Due soon' ? AMBER : TEAL_DARK

                        return (
                          <div key={job.id} style={{ borderRadius: '14px', border: `1px solid ${BORDER}`, background: WHITE, overflow: 'hidden' }}>
                            <div style={{ height: '3px', background: accentColor }} />

                            <div
                              style={{
                                padding: '14px',
                                display: 'flex',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                justifyContent: 'space-between',
                                gap: '10px',
                                flexDirection: isMobile ? 'column' : 'row',
                                borderBottom: `1px solid ${BORDER}`,
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div style={{ ...TYPE.title, fontSize: '14px' }}>
                                  {job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} {job.equipment_type?.replace('_', ' ') || ''}
                                </div>
                                {job.model && (
                                  <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>
                                    Model: {job.model}
                                  </div>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    background: s.bg,
                                    color: s.color,
                                    padding: '5px 9px',
                                    borderRadius: '999px',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    whiteSpace: 'nowrap',
                                    display: 'inline-block',
                                    letterSpacing: '0.02em',
                                  }}
                                >
                                  {s.label}
                                </span>

                                {!isEditing && (
                                  <button
                                    onClick={() => setEditingJobId(job.id)}
                                    style={{
                                      height: '34px',
                                      borderRadius: '10px',
                                      border: `1px solid ${BORDER}`,
                                      background: '#F8FAFC',
                                      color: TEXT2,
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      padding: '0 12px',
                                      cursor: 'pointer',
                                      fontFamily: FONT,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '7px',
                                    }}
                                  >
                                    <IconEdit size={14} />
                                    Edit
                                  </button>
                                )}
                              </div>
                            </div>

                            {!isEditing ? (
                              <>
                                <div
                                  style={{
                                    padding: '14px',
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, minmax(0,1fr))',
                                    gap: '10px',
                                  }}
                                >
                                  {[
                                    {
                                      label: 'Serial number',
                                      value: job.serial_number || '—',
                                      icon: <IconTool size={15} />,
                                      color: TEXT,
                                      mono: true,
                                    },
                                    {
                                      label: 'Installed',
                                      value: job.install_date
                                        ? new Date(job.install_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : '—',
                                      icon: <IconCalendar size={15} />,
                                      color: TEAL_DARK,
                                    },
                                    {
                                      label: 'Next service',
                                      value: job.next_service_date
                                        ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : '—',
                                      icon: <IconClock size={15} />,
                                      color: job.next_service_date && getDays(job.next_service_date) < 0 ? RED : AMBER,
                                      danger: job.next_service_date && getDays(job.next_service_date) < 0,
                                    },
                                    {
                                      label: 'Warranty expiry',
                                      value: job.warranty_expiry
                                        ? new Date(job.warranty_expiry).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : '—',
                                      icon: <IconCalendar size={15} />,
                                      color: TEXT,
                                    },
                                    {
                                      label: 'Location',
                                      value: job.install_location || '—',
                                      icon: <IconMapPin size={15} />,
                                      color: TEAL_DARK,
                                    },
                                    {
                                      label: 'Service interval',
                                      value: `Every ${job.service_interval_months} months`,
                                      icon: <IconClock size={15} />,
                                      color: AMBER,
                                    },
                                  ].map(row => (
                                    <div
                                      key={row.label}
                                      style={{
                                        borderRadius: '12px',
                                        border: `1px solid ${BORDER}`,
                                        background: '#FCFCFD',
                                        padding: '12px',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                                        <div style={iconWrap(row.color)}>{row.icon}</div>
                                        <div style={TYPE.label}>{row.label}</div>
                                      </div>
                                      <div
                                        style={{
                                          ...TYPE.body,
                                          fontWeight: 700,
                                          color: row.danger ? RED : TEXT,
                                          fontFamily: row.mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : FONT,
                                          wordBreak: 'break-word',
                                        }}
                                      >
                                        {row.value}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {job.notes && (
                                  <div style={{ padding: '0 14px 14px' }}>
                                    <div
                                      style={{
                                        borderRadius: '12px',
                                        border: `1px solid ${BORDER}`,
                                        background: '#FCFCFD',
                                        padding: '12px',
                                      }}
                                    >
                                      <div style={{ ...TYPE.label, marginBottom: '6px' }}>Notes</div>
                                      <div style={TYPE.body}>{job.notes}</div>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div style={{ padding: '14px', display: 'grid', gap: '10px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                                  <div>
                                    <label style={labelStyle}>Brand</label>
                                    <input style={inputStyle} value={f.brand || ''} onChange={e => setJobField(job.id, 'brand', e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Model</label>
                                    <input style={inputStyle} value={f.model || ''} onChange={e => setJobField(job.id, 'model', e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Capacity (kW)</label>
                                    <input style={inputStyle} value={f.capacity_kw || ''} onChange={e => setJobField(job.id, 'capacity_kw', e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Equipment type</label>
                                    <select style={inputStyle} value={f.equipment_type || ''} onChange={e => setJobField(job.id, 'equipment_type', e.target.value)}>
                                      <option value="split_system">Split system</option>
                                      <option value="ducted">Ducted system</option>
                                      <option value="multi_head">Multi-head split</option>
                                      <option value="cassette">Cassette unit</option>
                                      <option value="other">Other</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Serial number</label>
                                    <input style={inputStyle} value={f.serial_number || ''} onChange={e => setJobField(job.id, 'serial_number', e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Location</label>
                                    <input style={inputStyle} value={f.install_location || ''} onChange={e => setJobField(job.id, 'install_location', e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Install date</label>
                                    <input type="date" style={inputStyle} value={f.install_date?.slice(0, 10) || ''} onChange={e => setJobField(job.id, 'install_date', e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Warranty expiry</label>
                                    <input type="date" style={inputStyle} value={f.warranty_expiry?.slice(0, 10) || ''} onChange={e => setJobField(job.id, 'warranty_expiry', e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Service interval</label>
                                    <select style={inputStyle} value={f.service_interval_months || 12} onChange={e => setJobField(job.id, 'service_interval_months', e.target.value)}>
                                      <option value="6">Every 6 months</option>
                                      <option value="12">Every 12 months</option>
                                      <option value="18">Every 18 months</option>
                                      <option value="24">Every 24 months</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Reminder</label>
                                    <select style={inputStyle} value={f.reminder_lead_days || 14} onChange={e => setJobField(job.id, 'reminder_lead_days', e.target.value)}>
                                      <option value="14">2 weeks before</option>
                                      <option value="28">4 weeks before</option>
                                      <option value="42">6 weeks before</option>
                                      <option value="56">8 weeks before</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label style={labelStyle}>Notes</label>
                                  <textarea style={textareaStyle} value={f.notes || ''} onChange={e => setJobField(job.id, 'notes', e.target.value)} />
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => setEditingJobId(null)}
                                    style={{
                                      flex: 1,
                                      height: '38px',
                                      borderRadius: '10px',
                                      border: `1px solid ${BORDER}`,
                                      background: WHITE,
                                      color: TEXT2,
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      fontFamily: FONT,
                                    }}
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    onClick={() => saveJob(job.id)}
                                    disabled={saving}
                                    style={{
                                      flex: 1,
                                      height: '38px',
                                      borderRadius: '10px',
                                      border: 'none',
                                      background: TEAL,
                                      color: '#FFFFFF',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      fontFamily: FONT,
                                    }}
                                  >
                                    {saving ? 'Saving...' : 'Save changes'}
                                  </button>
                                </div>
                              </div>
                            )}

                            {job.service_records?.length > 0 && (
                              <div
                                style={{
                                  borderTop: `1px solid ${BORDER}`,
                                  padding: '14px',
                                  background: '#FAFBFC',
                                }}
                              >
                                <div style={sectionLabel}>{sectionDash}Service history</div>

                                <div style={{ display: 'grid', gap: '8px' }}>
                                  {job.service_records.map((sr: any) => (
                                    <div
                                      key={sr.id}
                                      style={{
                                        borderRadius: '12px',
                                        border: `1px solid ${BORDER}`,
                                        background: WHITE,
                                        padding: '12px 13px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                      }}
                                    >
                                      <div style={{ minWidth: 0 }}>
                                        <div style={TYPE.titleSm}>{sr.service_type?.replace('_', ' ')}</div>
                                        {sr.notes && (
                                          <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>{sr.notes}</div>
                                        )}
                                      </div>

                                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={TYPE.body}>
                                          {new Date(sr.service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        {sr.cost && (
                                          <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>${sr.cost}</div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,10,10,0.45)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: WHITE,
              borderRadius: '16px',
              width: '100%',
              maxWidth: '420px',
              border: `1px solid ${BORDER}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              overflow: 'hidden',
              fontFamily: FONT,
            }}
          >
            <div style={{ height: '4px', background: '#EF4444' }} />

            <div style={{ padding: '24px 24px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                Danger zone
              </div>

              <div style={{ fontSize: '18px', fontWeight: 800, color: TEXT, marginBottom: '10px' }}>
                Delete {customer.first_name} {customer.last_name}?
              </div>

              <div style={{ fontSize: '14px', color: TEXT3, lineHeight: 1.6 }}>
                This will permanently delete this customer and all {jobs.length} associated job{jobs.length !== 1 ? 's' : ''}. This cannot be undone.
              </div>

              {deleteError && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '12px 14px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#B91C1C',
                    fontWeight: 500,
                  }}
                >
                  {deleteError}
                </div>
              )}
            </div>

            <div style={{ padding: '0 24px 24px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteError('') }}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '9px',
                  border: `1px solid ${BORDER}`,
                  background: WHITE,
                  color: TEXT2,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                Cancel
              </button>

              <button
                onClick={deleteCustomer}
                disabled={deleting}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '9px',
                  border: 'none',
                  background: '#EF4444',
                  color: WHITE,
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontFamily: FONT,
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}