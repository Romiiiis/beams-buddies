'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
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

function IconPlus({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
}
function IconSearch({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
}
function IconJob({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="6" width="16" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.9" /><path d="M9 6V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
}
function IconCalendar({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9" /><path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
}
function IconFilter({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
}
function IconArrow({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IconUsers({ size = 17 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.9" /></svg>
}
function IconClose({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
}
function IconPhone({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72l.34 2.71a2 2 0 0 1-.57 1.72L7.1 9.9a16 16 0 0 0 7 7l1.75-1.78a2 2 0 0 1 1.72-.57l2.71.34A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" /></svg>
}

function StatImageIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: '30px',
        height: '30px',
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
  )
}

const EQUIPMENT_LABELS: Record<string, string> = {
  split_system: 'Split system',
  ducted: 'Ducted',
  multi_head: 'Multi-head',
  cassette: 'Cassette',
  other: 'Other',
}

function JobDrawer({ job, onClose, isMobile }: { job: any; onClose: () => void; isMobile: boolean }) {
  const router = useRouter()
  const customer = job.customers
  const name = customer ? `${customer.first_name} ${customer.last_name}`.trim() : 'Unknown'

  const fieldBox: React.CSSProperties = {
    background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '12px 14px',
  }

  const days = (() => {
    if (!job.install_date) return null
    const d = new Date(job.install_date)
    d.setMonth(d.getMonth() + job.service_interval_months)
    return Math.ceil((d.getTime() - Date.now()) / 86400000)
  })()

  const isOverdue = days !== null && days < 0
  const isDueSoon = days !== null && days >= 0 && days <= 30
  const serviceColor = isOverdue ? '#B91C1C' : isDueSoon ? '#92400E' : TEAL
  const serviceBg = isOverdue ? '#FEE2E2' : isDueSoon ? '#FEF3C7' : '#E6F6F5'
  const serviceLabel = isOverdue ? `Overdue by ${Math.abs(days!)} days` : isDueSoon ? `Due in ${days} days` : days !== null ? `${days} days away` : '—'

  const nextServiceDate = (() => {
    if (!job.install_date) return '—'
    const d = new Date(job.install_date)
    d.setMonth(d.getMonth() + job.service_interval_months)
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  })()

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(11,18,32,0.35)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: isMobile ? '100vw' : '480px', background: WHITE, zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(11,18,32,0.12)', overflow: 'hidden', animation: 'slideIn 0.22s cubic-bezier(0.22,1,0.36,1)' }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0.6; } to { transform: translateX(0); opacity: 1; } }`}</style>

        <div style={{ padding: '20px 22px 18px', borderBottom: `1px solid ${BORDER}`, background: HEADER_BG, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                {EQUIPMENT_LABELS[job.equipment_type] || job.equipment_type}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: WHITE, lineHeight: 1.2, marginBottom: '4px' }}>{name}</div>
              {customer?.phone && <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>{customer.phone}</div>}
            </div>
            <button onClick={onClose} style={{ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconClose size={16} />
            </button>
          </div>
          <div style={{ marginTop: '14px' }}>
            <span style={{ background: serviceBg, color: serviceColor, padding: '6px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <IconCalendar size={12} /> {serviceLabel}
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

          <div style={{ marginBottom: '22px' }}>
            <div style={{ ...TYPE.label, marginBottom: '10px', display: 'block' }}>Customer</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Name',    value: name },
                { label: 'Phone',   value: customer?.phone || '—' },
                { label: 'Suburb',  value: customer?.suburb || '—' },
                { label: 'Address', value: customer?.address || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={fieldBox}>
                  <div style={{ ...TYPE.label, marginBottom: '5px' }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <div style={{ ...TYPE.label, marginBottom: '10px', display: 'block' }}>Unit</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Brand',         value: job.brand || '—' },
                { label: 'Model',         value: job.model || '—' },
                { label: 'Capacity',      value: job.capacity_kw ? `${job.capacity_kw} kW` : '—' },
                { label: 'Serial number', value: job.serial_number || '—' },
                { label: 'Location',      value: job.install_location || '—' },
                { label: 'Type',          value: EQUIPMENT_LABELS[job.equipment_type] || job.equipment_type },
              ].map(({ label, value }) => (
                <div key={label} style={fieldBox}>
                  <div style={{ ...TYPE.label, marginBottom: '5px' }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <div style={{ ...TYPE.label, marginBottom: '10px', display: 'block' }}>Service schedule</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Installed',       value: job.install_date ? new Date(job.install_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                { label: 'Next service',    value: nextServiceDate },
                { label: 'Interval',        value: job.service_interval_months ? `Every ${job.service_interval_months} months` : '—' },
                { label: 'Reminder',        value: job.reminder_lead_days ? `${job.reminder_lead_days} days before` : '—' },
                { label: 'Warranty expiry', value: job.warranty_expiry ? new Date(job.warranty_expiry).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={fieldBox}>
                  <div style={{ ...TYPE.label, marginBottom: '5px' }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {job.notes && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{ ...TYPE.label, marginBottom: '10px', display: 'block' }}>Notes</div>
              <div style={{ ...fieldBox, fontSize: '13px', fontWeight: 500, color: TEXT2, lineHeight: 1.7 }}>{job.notes}</div>
            </div>
          )}
        </div>

        <div style={{ padding: '14px 22px 20px', borderTop: `1px solid ${BORDER}`, background: WHITE, flexShrink: 0, display: 'grid', gap: '8px' }}>
          <button onClick={() => router.push('/dashboard/jobs/add')} style={{ height: '44px', borderRadius: '12px', border: 'none', background: TEAL, color: WHITE, fontSize: '13px', fontWeight: 800, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 14px rgba(31,158,148,0.20)' }}>
            <IconPlus size={15} /> Add another job
          </button>
          {customer?.phone && (
            <a href={`tel:${customer.phone}`} style={{ height: '44px', borderRadius: '12px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
              <IconPhone size={15} /> Call {customer.first_name}
            </a>
          )}
        </div>
      </div>
    </>
  )
}

export default function JobsPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedJob, setSelectedJob] = useState<any | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) { setLoading(false); return }
      const { data } = await supabase
        .from('jobs')
        .select(`*, customers ( first_name, last_name, phone, suburb, address )`)
        .eq('business_id', userData.business_id)
        .order('install_date', { ascending: false })
      setJobs(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const equipmentTypes = ['all', 'split_system', 'ducted', 'multi_head', 'cassette', 'other']

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const name = `${j.customers?.first_name || ''} ${j.customers?.last_name || ''}`.trim()
      const matchSearch = search
        ? `${name} ${j.brand} ${j.model} ${j.customers?.suburb} ${j.customers?.phone}`.toLowerCase().includes(search.toLowerCase())
        : true
      const matchType = filterType === 'all' ? true : j.equipment_type === filterType
      return matchSearch && matchType
    })
  }, [jobs, search, filterType])

  function daysUntil(installDate: string, intervalMonths: number) {
    if (!installDate) return null
    const d = new Date(installDate)
    d.setMonth(d.getMonth() + intervalMonths)
    return Math.ceil((d.getTime() - Date.now()) / 86400000)
  }

  function nextService(installDate: string, intervalMonths: number) {
    if (!installDate) return null
    const d = new Date(installDate)
    d.setMonth(d.getMonth() + intervalMonths)
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const shellCard: React.CSSProperties = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)', overflow: 'hidden' }
  const panelCard: React.CSSProperties = { ...shellCard, padding: '16px' }
  const sectionLabel: React.CSSProperties = { ...TYPE.title, fontSize: '13px', fontWeight: 800, marginBottom: '12px' }
  const quickActionStyle: React.CSSProperties = { border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, borderRadius: '10px', height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '8px' }

  const overviewCards = [
    {
      label: 'Total jobs',
      value: jobs.length,
      sub: 'All jobs in workspace',
      iconSrc: 'https://static.wixstatic.com/media/48c433_997ef62d91654472ba257f2f31099e0c~mv2.png',
      accent: TEAL,
      tag: 'All time'
    },
    {
      label: 'Due this month',
      value: jobs.filter(j => { const d = daysUntil(j.install_date, j.service_interval_months); return d !== null && d >= 0 && d <= 30 }).length,
      sub: 'Service due within 30 days',
      iconSrc: 'https://static.wixstatic.com/media/48c433_2c9a02e644c84ae6b66da7b917ac9390~mv2.png',
      accent: '#92400E',
      tag: 'Upcoming'
    },
    {
      label: 'Customers',
      value: new Set(jobs.map(j => j.customer_id)).size,
      sub: 'Unique customers with jobs',
      iconSrc: 'https://static.wixstatic.com/media/48c433_eb5f601865a645939154bbe679d8e2a0~mv2.png',
      accent: '#1E3A8A',
      tag: 'Unique'
    },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: FONT, background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/jobs" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: BG }}>
        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: BG, padding: isMobile ? '14px' : '16px', gap: '12px' }}>

          <div style={{ ...shellCard, padding: isMobile ? '18px 16px 16px' : '22px 24px 20px', background: HEADER_BG, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '28px' : '34px', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 900, color: WHITE, marginBottom: '8px' }}>Jobs</div>
            <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', maxWidth: '760px' }}>All installations, service history, and upcoming maintenance in one place.</div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/dashboard/jobs/add')} style={{ ...quickActionStyle, background: TEAL, color: WHITE, border: 'none', boxShadow: '0 6px 14px rgba(31,158,148,0.20)' }}>
                <IconPlus size={16} /> Add new job
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))', gap: '12px' }}>
            {overviewCards.map(item => (
              <div key={item.label} style={{ ...panelCard, gridColumn: isMobile ? 'span 1' : 'span 4', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '8px' }}>{item.tag}</div>
                    <div style={{ ...TYPE.title, fontSize: '14px', fontWeight: 800, marginBottom: '10px' }}>{item.label}</div>
                  </div>
                  <StatImageIcon src={item.iconSrc} alt={item.label} />
                </div>
                <div>
                  <div style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: item.accent }}>{item.value}</div>
                  <div style={{ ...TYPE.bodySm, marginTop: '7px' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))', gap: '12px', alignItems: 'start' }}>
            <div style={{ ...panelCard, gridColumn: isMobile ? 'span 1' : 'span 8' }}>
              <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <div style={sectionLabel}>All jobs</div>
                  <div style={{ ...TYPE.bodySm }}>Click a job to view full details.</div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '999px', background: '#F8FAFC', border: `1px solid ${BORDER}`, color: TEXT3, fontSize: '11px', fontWeight: 800 }}>
                  <IconFilter size={14} /> {filtered.length} shown
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 300px) 1fr', gap: '10px', marginBottom: '14px' }}>
                <div style={{ position: 'relative', height: '40px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: TEXT3, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                    <IconSearch size={14} />
                  </span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, brand, suburb..."
                    style={{ width: '100%', height: '40px', padding: '0 12px 0 34px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: '#FCFCFD', fontSize: '12px', color: TEXT, outline: 'none', fontFamily: FONT, boxSizing: 'border-box', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {equipmentTypes.map(t => (
                    <button key={t} onClick={() => setFilterType(t)} style={{ height: '36px', padding: '0 12px', borderRadius: '999px', border: `1px solid ${filterType === t ? TEAL_DARK : BORDER}`, background: filterType === t ? TEAL : WHITE, color: filterType === t ? WHITE : TEXT2, fontSize: '11px', fontWeight: filterType === t ? 700 : 600, cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap', boxShadow: filterType === t ? '0 4px 10px rgba(31,158,148,0.16)' : 'none' }}>
                      {t === 'all' ? 'All types' : EQUIPMENT_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading jobs...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', borderRadius: '14px', border: `1.5px dashed ${BORDER}`, background: '#FAFBFC' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔧</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: TEXT, marginBottom: '6px' }}>No jobs yet</div>
                  <div style={{ fontSize: '12px', color: TEXT3, marginBottom: '16px' }}>Add your first job or convert a lead to get started.</div>
                  <button onClick={() => router.push('/dashboard/jobs/add')} style={{ height: '38px', padding: '0 18px', borderRadius: '10px', background: TEAL, color: WHITE, border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                    <IconPlus size={14} /> Add new job
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {filtered.map(job => {
                    const customer = job.customers
                    const name = customer ? `${customer.first_name} ${customer.last_name}`.trim() : 'Unknown customer'
                    const days = daysUntil(job.install_date, job.service_interval_months)
                    const next = nextService(job.install_date, job.service_interval_months)
                    const isDueSoon = days !== null && days >= 0 && days <= 30
                    const isOverdue = days !== null && days < 0
                    const serviceColor = isOverdue ? '#B91C1C' : isDueSoon ? '#92400E' : TEAL
                    const serviceBg = isOverdue ? '#FEE2E2' : isDueSoon ? '#FEF3C7' : '#E6F6F5'
                    const serviceLabel = isOverdue ? `Overdue ${Math.abs(days!)} days` : isDueSoon ? `Due in ${days} days` : next ? `Next: ${next}` : '—'

                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        style={{ borderRadius: '14px', border: `1px solid ${BORDER}`, background: WHITE, boxShadow: '0 4px 14px rgba(15,23,42,0.04)', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.12s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(15,23,42,0.09)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(15,23,42,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '6px 1fr' }}>
                          {!isMobile && <div style={{ background: serviceColor }} />}
                          <div style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '12px', flexDirection: isMobile ? 'column' : 'row', paddingBottom: '10px', borderBottom: `1px solid ${BORDER}`, marginBottom: '10px' }}>
                              <div>
                                <div style={{ ...TYPE.label, marginBottom: '5px', color: serviceColor }}>{EQUIPMENT_LABELS[job.equipment_type] || job.equipment_type}</div>
                                <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT, lineHeight: 1.2, marginBottom: '3px' }}>{name}</div>
                                <div style={{ fontSize: '12px', fontWeight: 500, color: TEXT3 }}>{customer?.phone || '—'}{customer?.suburb ? ` · ${customer.suburb}` : ''}</div>
                              </div>
                              <div style={{ background: serviceBg, color: serviceColor, padding: '6px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                <IconCalendar size={12} />{serviceLabel}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT2 }}>🔧 {job.brand}{job.model ? ` ${job.model}` : ''}{job.capacity_kw ? ` · ${job.capacity_kw}kW` : ''}</div>
                              {job.install_date && <div style={{ fontSize: '12px', fontWeight: 500, color: TEXT3 }}>📅 Installed {new Date(job.install_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
                              {job.install_location && <div style={{ fontSize: '12px', fontWeight: 500, color: TEXT3 }}>📍 {job.install_location}</div>}
                              <div style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '11px', fontWeight: 700, color: TEAL, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                View details <IconArrow size={12} />
                              </div>
                            </div>
                            {job.notes && (
                              <div style={{ marginTop: '10px', padding: '10px 12px', background: '#F8FAFC', borderRadius: '10px', border: `1px solid ${BORDER}`, fontSize: '12px', fontWeight: 500, color: TEXT3, lineHeight: 1.6 }}>
                                {job.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'grid', gap: '12px' }}>
              <div style={panelCard}>
                <div style={sectionLabel}>Quick actions</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <button onClick={() => router.push('/dashboard/jobs/add')} style={{ ...quickActionStyle, width: '100%', justifyContent: 'center', background: TEAL, color: WHITE, border: 'none', boxShadow: '0 6px 14px rgba(31,158,148,0.20)' }}>
                    <IconPlus size={15} /> Add new job
                  </button>
                  <button onClick={() => router.push('/dashboard/leads')} style={{ ...quickActionStyle, width: '100%', justifyContent: 'center' }}>View leads</button>
                  <button onClick={() => { setSearch(''); setFilterType('all') }} style={{ ...quickActionStyle, width: '100%', justifyContent: 'center' }}>Reset filters</button>
                </div>
              </div>

              <div style={panelCard}>
                <div style={sectionLabel}>Service status</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[
                    { label: 'Overdue',        value: jobs.filter(j => { const d = daysUntil(j.install_date, j.service_interval_months); return d !== null && d < 0 }).length,             color: '#B91C1C', bg: '#FEE2E2' },
                    { label: 'Due this month', value: jobs.filter(j => { const d = daysUntil(j.install_date, j.service_interval_months); return d !== null && d >= 0 && d <= 30 }).length, color: '#92400E', bg: '#FEF3C7' },
                    { label: 'Up to date',     value: jobs.filter(j => { const d = daysUntil(j.install_date, j.service_interval_months); return d !== null && d > 30 }).length,              color: TEAL,      bg: '#E6F6F5' },
                  ].map(item => (
                    <div key={item.label} style={{ borderRadius: '12px', background: item.bg, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: item.color }}>{item.label}</div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={panelCard}>
                <div style={sectionLabel}>Equipment breakdown</div>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {Object.entries(EQUIPMENT_LABELS).map(([key, label]) => {
                    const count = jobs.filter(j => j.equipment_type === key).length
                    if (count === 0) return null
                    const pct = jobs.length ? Math.round((count / jobs.length) * 100) : 0
                    return (
                      <div key={key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT2 }}>{label}</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: TEXT3 }}>{count}</span>
                        </div>
                        <div style={{ height: '5px', borderRadius: '999px', background: BORDER, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: TEAL, borderRadius: '999px', transition: 'width 0.4s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedJob && (
        <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} isMobile={isMobile} />
      )}
    </div>
  )
}