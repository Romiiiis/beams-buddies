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
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
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
    lineHeight: 1.5,
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
}

const avColors = [
  { bg: '#E8F4F1', color: '#0A4F4C' },
  { bg: '#EEF2F6', color: '#334155' },
  { bg: '#E6F7F6', color: '#177A72' },
  { bg: '#F1F5F9', color: '#475569' },
  { bg: '#E8F4F1', color: '#1F9E94' },
]

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

function parseDateLocal(raw: string | null | undefined): Date | null {
  if (!raw) return null
  const s = String(raw).slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function startOfDay(d: Date) {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function IconArrowLeft({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
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
      const {
        data: { session },
      } = await supabase.auth.getSession()

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
      for (const job of jobsRes.data || []) {
        forms[job.id] = { ...job }
      }
      setJobForms(forms)

      setReviewClicks(clicksRes.data || [])
      setLoading(false)
    }

    load()
  }, [id, router])

  async function saveCustomer() {
    setSaving(true)

    await supabase
      .from('customers')
      .update({
        first_name: customerForm.first_name,
        last_name: customerForm.last_name,
        email: customerForm.email,
        phone: customerForm.phone,
        address: customerForm.address,
        suburb: customerForm.suburb,
        postcode: customerForm.postcode,
        notes: customerForm.notes,
      })
      .eq('id', id)

    setCustomer(customerForm)
    setEditingCustomer(false)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function saveJob(jobId: string) {
    setSaving(true)
    const f = jobForms[jobId]

    await supabase
      .from('jobs')
      .update({
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
      })
      .eq('id', jobId)

    setJobs(prev => prev.map(j => (j.id === jobId ? { ...j, ...f } : j)))
    setEditingJobId(null)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function deleteCustomer() {
    setDeleting(true)
    setDeleteError('')

    try {
      const { data: jobData, error: jobFetchError } = await supabase.from('jobs').select('id').eq('customer_id', id)
      if (jobFetchError) throw new Error(`Fetch jobs: ${jobFetchError.message}`)

      const jobIds = jobData?.map(j => j.id) || []

      if (jobIds.length > 0) {
        const { error: srError } = await supabase.from('service_records').delete().in('job_id', jobIds)
        if (srError) throw new Error(`Delete service_records: ${srError.message}`)

        const { error: rcJobError } = await supabase.from('review_clicks').delete().in('job_id', jobIds)
        if (rcJobError) throw new Error(`Delete review_clicks (by job): ${rcJobError.message}`)
      }

      const { error: rcError } = await supabase.from('review_clicks').delete().eq('customer_id', id)
      if (rcError) throw new Error(`Delete review_clicks (by customer): ${rcError.message}`)

      const { error: invError } = await supabase.from('invoices').delete().eq('customer_id', id)
      if (invError) throw new Error(`Delete invoices: ${invError.message}`)

      const { error: quoteError } = await supabase.from('quotes').delete().eq('customer_id', id)
      if (quoteError) throw new Error(`Delete quotes: ${quoteError.message}`)

      const { error: jobsError } = await supabase.from('jobs').delete().eq('customer_id', id)
      if (jobsError) throw new Error(`Delete jobs: ${jobsError.message}`)

      const { error: customerError } = await supabase.from('customers').delete().eq('id', id)
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
    const target = parseDateLocal(d)
    if (!target) return 0
    return Math.floor((startOfDay(target).getTime() - startOfDay(new Date()).getTime()) / 86400000)
  }

  function statusPill(nextServiceDate: string | null) {
    if (!nextServiceDate) return { label: 'No date', bg: '#F1F5F9', color: TEXT3, border: BORDER }
    const days = getDays(nextServiceDate)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: AMBER, border: '#FDE68A' }
    return { label: 'Scheduled', bg: '#F1F5F9', color: TEXT3, border: BORDER }
  }

  const totalServiceRecords = useMemo(() => {
    return jobs.reduce((s, j) => s + (j.service_records?.length || 0), 0)
  }, [jobs])

  const uniquePlatforms = [...new Set(reviewClicks.map(r => r.platform))]
  const stats = useMemo(() => {
    const overdue = jobs.filter(j => statusPill(j.next_service_date).label === 'Overdue').length
    const dueSoon = jobs.filter(j => statusPill(j.next_service_date).label === 'Due soon').length
    const scheduled = jobs.filter(j => statusPill(j.next_service_date).label === 'Scheduled').length
    return {
      jobs: jobs.length,
      serviceRecords: totalServiceRecords,
      reviewClicks: reviewClicks.length,
      dueSoon,
      overdue,
      scheduled,
    }
  }, [jobs, totalServiceRecords, reviewClicks])

  const reviewRate = stats.jobs > 0 ? Math.round((stats.reviewClicks / stats.jobs) * 100) : 0

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
    height: '88px',
    padding: '10px 12px',
    resize: 'none',
  }

  const labelStyle: React.CSSProperties = {
    ...TYPE.label,
    marginBottom: '6px',
    display: 'block',
  }

  const sectionHeaderTitle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 800,
    color: TEXT,
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  }

  const btnOutline: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    border: `1px solid ${BORDER}`,
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
    gap: '6px',
    whiteSpace: 'nowrap',
    transition: 'border-color 0.12s, color 0.12s',
  }

  const btnDark: React.CSSProperties = {
    height: '34px',
    padding: '0 16px',
    border: `1px solid ${TEXT}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: WHITE,
    background: TEXT,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.12s',
  }

  const btnMobileSm: React.CSSProperties = {
    height: '36px',
    padding: '0 10px',
    border: `1px solid ${BORDER}`,
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
    flex: 1,
  }

  const btnMobileDark: React.CSSProperties = {
    ...btnMobileSm,
    background: TEXT,
    border: `1px solid ${TEXT}`,
    color: WHITE,
  }

  const statCards = [
    {
      label: 'Units installed',
      value: stats.jobs.toLocaleString('en-AU'),
      sub: 'Tracked on this customer',
      accent: TEXT,
      up: stats.jobs > 0,
      delta: `${stats.jobs} total`,
    },
    {
      label: 'Service records',
      value: stats.serviceRecords.toLocaleString('en-AU'),
      sub: 'Logged visit history',
      accent: TEAL_DARK,
      up: stats.serviceRecords > 0,
      delta: `${stats.serviceRecords} logged`,
    },
    {
      label: 'Due soon',
      value: stats.dueSoon.toLocaleString('en-AU'),
      sub: 'Units needing attention soon',
      accent: AMBER,
      up: stats.dueSoon === 0,
      delta: stats.dueSoon === 0 ? 'All clear' : `${stats.dueSoon} pending`,
    },
    {
      label: 'Review clicks',
      value: stats.reviewClicks.toLocaleString('en-AU'),
      sub: uniquePlatforms.length > 0 ? `Across ${uniquePlatforms.length} platform${uniquePlatforms.length === 1 ? '' : 's'}` : 'No review activity yet',
      accent: stats.reviewClicks > 0 ? TEAL_DARK : TEXT,
      up: stats.reviewClicks > 0,
      delta: `${reviewRate}% of units`,
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
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
        fontFamily: FONT,
        background: BG,
        minHeight: '100vh',
      }}
    >
      <Sidebar active="/dashboard/customers" />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '12px' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
          }}
        >
          {isMobile ? (
            <div style={{ margin: '-12px -12px 0', background: WHITE }}>
              <div
                style={{
                  padding: '16px 16px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ flexShrink: 0, minWidth: 0 }}>
                  <button
                    onClick={() => router.push('/dashboard/customers')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      color: TEXT3,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: FONT,
                      marginBottom: '6px',
                    }}
                  >
                    <IconArrowLeft size={13} />
                    Customers
                  </button>

                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: TEXT3,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      marginBottom: '5px',
                    }}
                  >
                    {new Date().toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>

                  <h1
                    style={{
                      fontSize: '26px',
                      fontWeight: 900,
                      color: TEXT,
                      letterSpacing: '-0.05em',
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {customer.first_name} {customer.last_name}
                  </h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {([
                    ['Units', stats.jobs],
                    ['History', stats.serviceRecords],
                    ['Due soon', stats.dueSoon],
                  ] as [string, number][]).map(([label, val], i) => (
                    <React.Fragment key={label}>
                      {i > 0 && <div style={{ width: 1, height: 30, background: BORDER }} />}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>{label}</div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', gap: '8px', padding: '0 16px 16px' }}>
                  <button onClick={() => router.push('/dashboard/jobs')} style={btnMobileSm}>
                    <IconSpark size={12} />
                    Add Job
                  </button>
                  <button onClick={() => setEditingCustomer(true)} style={btnMobileSm}>
                    <IconEdit size={12} />
                    Edit
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)} style={btnMobileDark}>
                    <IconTrash size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', gap: 0 }}>
                <div style={{ width: 4, background: TEAL, alignSelf: 'stretch', flexShrink: 0, marginRight: 20 }} />

                <div style={{ flexShrink: 0, minWidth: 0 }}>
                  <button
                    onClick={() => router.push('/dashboard/customers')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      color: TEXT3,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: FONT,
                      marginBottom: '6px',
                    }}
                  >
                    <IconArrowLeft size={13} />
                    Customers
                  </button>

                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: TEXT3,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      marginBottom: '5px',
                    }}
                  >
                    {todayStr}
                  </div>

                  <h1
                    style={{
                      fontSize: '28px',
                      fontWeight: 900,
                      color: TEXT,
                      letterSpacing: '-0.05em',
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {customer.first_name} {customer.last_name}
                  </h1>
                </div>

                <div style={{ width: 1, background: BORDER, alignSelf: 'stretch', margin: '0 22px', flexShrink: 0 }} />

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {([
                    ['Units', stats.jobs],
                    ['History', stats.serviceRecords],
                    ['Due soon', stats.dueSoon],
                  ] as [string, number][]).map(([label, val], i) => (
                    <React.Fragment key={label}>
                      {i > 0 && <div style={{ width: 1, height: 28, background: BORDER, flexShrink: 0 }} />}
                      <div style={{ textAlign: 'center', padding: '0 18px' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '3px' }}>{label}</div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    onClick={() => router.push('/dashboard/jobs')}
                    style={btnOutline}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = TEXT
                      e.currentTarget.style.color = TEXT
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = BORDER
                      e.currentTarget.style.color = TEXT2
                    }}
                  >
                    <IconSpark size={12} />
                    Add Job
                  </button>

                  <button
                    onClick={() => setEditingCustomer(true)}
                    style={btnOutline}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = TEXT
                      e.currentTarget.style.color = TEXT
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = BORDER
                      e.currentTarget.style.color = TEXT2
                    }}
                  >
                    <IconEdit size={12} />
                    Edit customer
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={btnDark}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.82'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    <IconTrash size={12} />
                    Delete customer
                  </button>
                </div>
              </div>
            </div>
          )}

          {saved && (
            <div
              style={{
                background: WHITE,
                border: `1px solid ${BORDER}`,
                borderRadius: '12px',
                padding: '12px 14px',
                color: TEAL_DARK,
                fontSize: '12px',
                fontWeight: 700,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              Changes saved successfully.
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            {statCards.map(item => (
              <div
                key={item.label}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '14px',
                  padding: isMobile ? '14px 14px 12px' : '16px 16px 14px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  minHeight: isMobile ? '122px' : '132px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT3, marginBottom: '10px' }}>{item.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: item.accent, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {item.value}
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      background: item.up ? '#E6F7F6' : '#FFF0EE',
                      color: item.up ? TEAL_DARK : '#C0392B',
                      fontSize: '10px',
                      fontWeight: 800,
                    }}
                  >
                    {item.delta}
                  </span>
                  <div style={{ fontSize: '10px', color: TEXT3, fontWeight: 500, marginTop: '7px', lineHeight: 1.35 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
              gap: '16px',
              alignItems: 'start',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={card}>
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${BORDER}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Customer profile</div>
                    <div style={{ fontSize: '11px', color: TEXT3, fontWeight: 500, marginTop: '2px' }}>Contact details, address, and internal notes.</div>
                  </div>

                  {!editingCustomer && (
                    <button
                      onClick={() => setEditingCustomer(true)}
                      style={{
                        height: '34px',
                        padding: '0 12px',
                        borderRadius: '10px',
                        border: `1px solid ${BORDER}`,
                        background: WHITE,
                        color: TEXT2,
                        fontSize: '12px',
                        fontWeight: 700,
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

                {!editingCustomer ? (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                    {[
                      { label: 'Email', value: customer.email || '—', icon: <IconMail size={15} /> },
                      { label: 'Phone', value: customer.phone || '—', icon: <IconPhone size={15} /> },
                      { label: 'Address', value: customer.address || '—', icon: <IconMapPin size={15} /> },
                      { label: 'Suburb', value: customer.suburb || '—', icon: <IconMapPin size={15} /> },
                      { label: 'Postcode', value: customer.postcode || '—', icon: <IconMapPin size={15} /> },
                      {
                        label: 'Customer since',
                        value: customer.created_at
                          ? new Date(customer.created_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
                          : '—',
                        icon: <IconClock size={15} />,
                      },
                    ].map((row, index) => (
                      <div
                        key={row.label}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '14px 18px',
                          borderBottom: index >= 4 && isMobile ? 'none' : `1px solid ${BORDER}`,
                          borderRight: !isMobile && index % 2 === 0 ? `1px solid ${BORDER}` : 'none',
                        }}
                      >
                        <div style={{ color: TEXT3, marginTop: '1px', flexShrink: 0 }}>{row.icon}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ ...TYPE.label, marginBottom: '4px' }}>{row.label}</div>
                          <div style={{ ...TYPE.body, wordBreak: 'break-word' }}>{row.value}</div>
                        </div>
                      </div>
                    ))}

                    <div style={{ padding: '14px 18px', gridColumn: '1 / -1' }}>
                      <div style={{ ...TYPE.label, marginBottom: '6px' }}>Notes</div>
                      <div style={TYPE.body}>{customer.notes || '—'}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '18px', display: 'grid', gap: '10px' }}>
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
                          color: WHITE,
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

              <div style={card}>
                <div
                  style={{
                    padding: '14px 16px 12px',
                    borderBottom: `1px solid ${BORDER}`,
                    display: 'flex',
                    alignItems: isMobile ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={sectionHeaderTitle}>Installed units</div>
                    <div style={{ ...TYPE.bodySm }}>View equipment details, service timing, and history for this customer.</div>
                  </div>

                  <div
                    style={{
                      height: '34px',
                      borderRadius: '10px',
                      border: `1px solid ${BORDER}`,
                      background: WHITE,
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
                      padding: '32px 18px',
                      textAlign: 'center',
                      color: TEXT3,
                      fontSize: '13px',
                    }}
                  >
                    No jobs yet for this customer.
                  </div>
                ) : (
                  <div style={{ display: 'grid' }}>
                    {jobs.map((job, idx) => {
                      const s = statusPill(job.next_service_date)
                      const f = jobForms[job.id] || job
                      const isEditing = editingJobId === job.id

                      return (
                        <div key={job.id} style={{ borderBottom: idx === jobs.length - 1 ? 'none' : `1px solid ${BORDER}` }}>
                          <div
                            style={{
                              padding: '14px 18px',
                              display: 'flex',
                              alignItems: isMobile ? 'flex-start' : 'center',
                              justifyContent: 'space-between',
                              gap: '10px',
                              flexDirection: isMobile ? 'column' : 'row',
                              borderBottom: !isEditing ? `1px solid ${BORDER}` : 'none',
                              background: WHITE,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                              <div
                                style={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: '10px',
                                  background: avColors[idx % avColors.length].bg,
                                  color: avColors[idx % avColors.length].color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  flexShrink: 0,
                                }}
                              >
                                {String(job.brand || 'U').slice(0, 1).toUpperCase()}
                              </div>

                              <div style={{ minWidth: 0 }}>
                                <div style={{ ...TYPE.title, fontSize: '14px', fontWeight: 800 }}>
                                  {job.brand || 'Unit'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} {job.equipment_type?.replace('_', ' ') || ''}
                                </div>
                                {job.model && <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>Model: {job.model}</div>}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  background: s.bg,
                                  color: s.color,
                                  border: `1px solid ${s.border}`,
                                  padding: '6px 9px',
                                  borderRadius: '999px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  whiteSpace: 'nowrap',
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
                                    background: WHITE,
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
                                  padding: '14px 18px',
                                  display: 'grid',
                                  gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, minmax(0,1fr))',
                                  gap: '10px',
                                }}
                              >
                                {[
                                  {
                                    label: 'Serial number',
                                    value: job.serial_number || '—',
                                    mono: true,
                                    icon: <IconArrowLeft size={12} />,
                                  },
                                  {
                                    label: 'Installed',
                                    value: job.install_date
                                      ? new Date(job.install_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                                      : '—',
                                    icon: <IconClock size={14} />,
                                  },
                                  {
                                    label: 'Next service',
                                    value: job.next_service_date
                                      ? new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                                      : '—',
                                    danger: job.next_service_date && getDays(job.next_service_date) < 0,
                                    icon: <IconClock size={14} />,
                                  },
                                  {
                                    label: 'Warranty expiry',
                                    value: job.warranty_expiry
                                      ? new Date(job.warranty_expiry).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                                      : '—',
                                    icon: <IconClock size={14} />,
                                  },
                                  {
                                    label: 'Location',
                                    value: job.install_location || '—',
                                    icon: <IconMapPin size={14} />,
                                  },
                                  {
                                    label: 'Service interval',
                                    value: `Every ${job.service_interval_months} months`,
                                    icon: <IconClock size={14} />,
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px', color: TEXT3 }}>
                                      {row.icon}
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
                                <div style={{ padding: '0 18px 14px' }}>
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
                            <div style={{ padding: '18px', display: 'grid', gap: '10px', borderTop: `1px solid ${BORDER}` }}>
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
                                    color: WHITE,
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
                            <div style={{ borderTop: `1px solid ${BORDER}`, background: '#FAFBFC' }}>
                              <div style={{ padding: '14px 18px 10px', ...TYPE.label }}>Service history</div>

                              <div style={{ display: 'grid' }}>
                                {job.service_records.map((sr: any, srIndex: number) => (
                                  <div
                                    key={sr.id}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'flex-start',
                                      gap: '12px',
                                      padding: '12px 18px',
                                      borderTop: srIndex === 0 ? 'none' : `1px solid ${BORDER}`,
                                      background: WHITE,
                                    }}
                                  >
                                    <div style={{ minWidth: 0 }}>
                                      <div style={TYPE.titleSm}>{sr.service_type?.replace('_', ' ')}</div>
                                      {sr.notes && <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>{sr.notes}</div>}
                                    </div>

                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                      <div style={TYPE.body}>
                                        {new Date(sr.service_date).toLocaleDateString('en-AU', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                        })}
                                      </div>
                                      {sr.cost && <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>${sr.cost}</div>}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviewClicks.length > 0 && (
                <div style={card}>
                  <div
                    style={{
                      padding: '14px 18px',
                      borderBottom: `1px solid ${BORDER}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Review activity</div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3 }}>
                      {uniquePlatforms.length} platform{uniquePlatforms.length === 1 ? '' : 's'}
                    </div>
                  </div>

                  <div style={{ display: 'grid' }}>
                    {uniquePlatforms.map((platform, index) => {
                      const clicks = reviewClicks.filter(r => r.platform === platform)
                      const latest = new Date(clicks[0].clicked_at).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })

                      return (
                        <div
                          key={platform as string}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px',
                            padding: '12px 18px',
                            borderBottom: index === uniquePlatforms.length - 1 ? 'none' : `1px solid ${BORDER}`,
                          }}
                        >
                          <div>
                            <div style={TYPE.titleSm}>{platform as string}</div>
                            <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>
                              {clicks.length} click{clicks.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div style={{ ...TYPE.bodySm, fontWeight: 700 }}>{latest}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
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
              overflow: 'hidden',
              fontFamily: FONT,
            }}
          >
            <div style={{ height: '4px', background: '#EF4444' }} />

            <div style={{ padding: '24px 24px 20px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#EF4444',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: '6px',
                }}
              >
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
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteError('')
                }}
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