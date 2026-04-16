'use client'

import React, { useEffect, useMemo, useState } from 'react'
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
  bodySm: {
    fontSize: '11px',
    fontWeight: 500,
    color: TEXT3,
    lineHeight: 1.45,
  },
  title: {
    fontSize: '13px',
    fontWeight: 700,
    color: TEXT2,
    lineHeight: 1.35,
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

function IconPlus({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconSearch({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}
function IconCalendar({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}
function IconFilter({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}
function IconArrow({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconClose({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconPhone({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72l.34 2.71a2 2 0 0 1-.57 1.72L7.1 9.9a16 16 0 0 0 7 7l1.75-1.78a2 2 0 0 1 1.72-.57l2.71.34A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  )
}
function IconExternalLink({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
function IconNote({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 7h8M8 12h8M8 17h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M6 3h9l3 3v15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  )
}
function IconSave({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 21h14a2 2 0 0 0 2-2V7l-4-4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  )
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

function JobDrawer({
  job,
  onClose,
  isMobile,
  onSaved,
}: {
  job: any
  onClose: () => void
  isMobile: boolean
  onSaved: (updatedJob: any) => void
}) {
  const router = useRouter()
  const customer = job.customers
  const name = customer ? `${customer.first_name} ${customer.last_name}`.trim() : 'Unknown'
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    brand: job.brand || '',
    model: job.model || '',
    capacity_kw: job.capacity_kw ?? '',
    equipment_type: job.equipment_type || 'split_system',
    serial_number: job.serial_number || '',
    install_location: job.install_location || '',
    install_date: job.install_date ? String(job.install_date).slice(0, 10) : '',
    warranty_expiry: job.warranty_expiry ? String(job.warranty_expiry).slice(0, 10) : '',
    service_interval_months: job.service_interval_months || 12,
    reminder_lead_days: job.reminder_lead_days || 14,
    notes: job.notes || '',
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
    boxSizing: 'border-box',
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    height: '100px',
    padding: '10px 12px',
    resize: 'none',
  }

  const fieldBox: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '12px',
    padding: '12px 14px',
  }

  const days = (() => {
    if (!form.install_date) return null
    const d = new Date(form.install_date)
    d.setMonth(d.getMonth() + Number(form.service_interval_months || 0))
    return Math.ceil((d.getTime() - Date.now()) / 86400000)
  })()

  const isOverdue = days !== null && days < 0
  const isDueSoon = days !== null && days >= 0 && days <= 30
  const serviceColor = isOverdue ? '#B91C1C' : isDueSoon ? '#92400E' : TEAL_DARK
  const serviceBg = isOverdue ? '#FFF7F7' : isDueSoon ? '#FFFBF2' : '#F7FCFA'
  const serviceBorder = isOverdue ? '#FECACA' : isDueSoon ? '#FDE68A' : '#BBF7D0'
  const serviceLabel = isOverdue ? `Overdue by ${Math.abs(days!)} days` : isDueSoon ? `Due in ${days} days` : days !== null ? `${days} days away` : '—'

  const nextServiceDate = (() => {
    if (!form.install_date) return '—'
    const d = new Date(form.install_date)
    d.setMonth(d.getMonth() + Number(form.service_interval_months || 0))
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  })()

  async function saveJob() {
    setSaving(true)

    const payload = {
      brand: form.brand || null,
      model: form.model || null,
      capacity_kw: form.capacity_kw === '' ? null : parseFloat(String(form.capacity_kw)),
      equipment_type: form.equipment_type || null,
      serial_number: form.serial_number || null,
      install_location: form.install_location || null,
      install_date: form.install_date || null,
      warranty_expiry: form.warranty_expiry || null,
      service_interval_months: Number(form.service_interval_months || 12),
      reminder_lead_days: Number(form.reminder_lead_days || 14),
      notes: form.notes || null,
    }

    const { error } = await supabase.from('jobs').update(payload).eq('id', job.id)

    if (!error) {
      const updated = { ...job, ...payload }
      onSaved(updated)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }

    setSaving(false)
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11,18,32,0.35)',
          zIndex: 200,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: isMobile ? '100vw' : '520px',
          background: WHITE,
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: `1px solid ${BORDER}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '20px 22px 18px',
            borderBottom: `1px solid ${BORDER}`,
            background: HEADER_BG,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '6px',
                }}
              >
                {EQUIPMENT_LABELS[form.equipment_type] || form.equipment_type}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: WHITE, lineHeight: 1.2, marginBottom: '4px' }}>{name}</div>
              {customer?.phone && <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>{customer.phone}</div>}
            </div>

            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconClose size={16} />
            </button>
          </div>

          <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                background: serviceBg,
                color: serviceColor,
                border: `1px solid ${serviceBorder}`,
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <IconCalendar size={12} />
              {serviceLabel}
            </span>

            {saved && (
              <span
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: WHITE,
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                Saved
              </span>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'grid', gap: '14px' }}>
          <div style={fieldBox}>
            <div style={{ ...TYPE.label, marginBottom: '10px' }}>Customer</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Name', value: name },
                { label: 'Phone', value: customer?.phone || '—' },
                { label: 'Suburb', value: customer?.suburb || '—' },
                { label: 'Address', value: customer?.address || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: '#FCFCFD', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ ...TYPE.label, marginBottom: '5px' }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {!editing ? (
            <>
              <div style={fieldBox}>
                <div style={{ ...TYPE.label, marginBottom: '10px' }}>Unit details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'Brand', value: form.brand || '—' },
                    { label: 'Model', value: form.model || '—' },
                    { label: 'Capacity', value: form.capacity_kw ? `${form.capacity_kw} kW` : '—' },
                    { label: 'Serial number', value: form.serial_number || '—' },
                    { label: 'Location', value: form.install_location || '—' },
                    { label: 'Type', value: EQUIPMENT_LABELS[form.equipment_type] || form.equipment_type || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: '#FCFCFD', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ ...TYPE.label, marginBottom: '5px' }}>{label}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={fieldBox}>
                <div style={{ ...TYPE.label, marginBottom: '10px' }}>Service schedule</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    {
                      label: 'Installed',
                      value: form.install_date
                        ? new Date(form.install_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '—',
                    },
                    { label: 'Next service', value: nextServiceDate },
                    { label: 'Interval', value: form.service_interval_months ? `Every ${form.service_interval_months} months` : '—' },
                    { label: 'Reminder', value: form.reminder_lead_days ? `${form.reminder_lead_days} days before` : '—' },
                    {
                      label: 'Warranty expiry',
                      value: form.warranty_expiry
                        ? new Date(form.warranty_expiry).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '—',
                    },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: '#FCFCFD', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ ...TYPE.label, marginBottom: '5px' }}>{label}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={fieldBox}>
                <div style={{ ...TYPE.label, marginBottom: '10px' }}>Notes</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: TEXT2, lineHeight: 1.7 }}>
                  {form.notes || 'No notes yet.'}
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={fieldBox}>
                <div style={{ ...TYPE.label, marginBottom: '10px' }}>Edit job</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>Brand</div>
                    <input style={inputStyle} value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>Model</div>
                    <input style={inputStyle} value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>Capacity (kW)</div>
                    <input style={inputStyle} value={form.capacity_kw} onChange={e => setForm(p => ({ ...p, capacity_kw: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>Equipment type</div>
                    <select style={inputStyle} value={form.equipment_type} onChange={e => setForm(p => ({ ...p, equipment_type: e.target.value }))}>
                      <option value="split_system">Split system</option>
                      <option value="ducted">Ducted</option>
                      <option value="multi_head">Multi-head</option>
                      <option value="cassette">Cassette</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>Serial number</div>
                    <input style={inputStyle} value={form.serial_number} onChange={e => setForm(p => ({ ...p, serial_number: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>Install location</div>
                    <input style={inputStyle} value={form.install_location} onChange={e => setForm(p => ({ ...p, install_location: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>Install date</div>
                    <input type="date" style={inputStyle} value={form.install_date} onChange={e => setForm(p => ({ ...p, install_date: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>Warranty expiry</div>
                    <input type="date" style={inputStyle} value={form.warranty_expiry} onChange={e => setForm(p => ({ ...p, warranty_expiry: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>Service interval</div>
                    <select style={inputStyle} value={form.service_interval_months} onChange={e => setForm(p => ({ ...p, service_interval_months: e.target.value }))}>
                      <option value="6">Every 6 months</option>
                      <option value="12">Every 12 months</option>
                      <option value="18">Every 18 months</option>
                      <option value="24">Every 24 months</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>Reminder lead</div>
                    <select style={inputStyle} value={form.reminder_lead_days} onChange={e => setForm(p => ({ ...p, reminder_lead_days: e.target.value }))}>
                      <option value="14">14 days before</option>
                      <option value="28">28 days before</option>
                      <option value="42">42 days before</option>
                      <option value="56">56 days before</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={fieldBox}>
                <div style={{ ...TYPE.label, marginBottom: '10px' }}>Job notes</div>
                <textarea style={textareaStyle} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Add notes, service context, access instructions, parts needed..." />
              </div>
            </>
          )}
        </div>

        <div
          style={{
            padding: '14px 18px 18px',
            borderTop: `1px solid ${BORDER}`,
            background: WHITE,
            flexShrink: 0,
            display: 'grid',
            gap: '8px',
          }}
        >
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                style={{
                  height: '44px',
                  borderRadius: '12px',
                  border: 'none',
                  background: TEAL,
                  color: WHITE,
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <IconEdit size={15} /> Edit job
              </button>

              <button
                onClick={() => router.push('/dashboard/jobs/add')}
                style={{
                  height: '44px',
                  borderRadius: '12px',
                  border: `1px solid ${BORDER}`,
                  background: WHITE,
                  color: TEXT2,
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <IconPlus size={15} /> Add another job
              </button>

              {customer?.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  style={{
                    height: '44px',
                    borderRadius: '12px',
                    border: `1px solid ${BORDER}`,
                    background: WHITE,
                    color: TEXT2,
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                  }}
                >
                  <IconPhone size={15} /> Call {customer.first_name}
                </a>
              )}
            </>
          ) : (
            <>
              <button
                onClick={saveJob}
                disabled={saving}
                style={{
                  height: '44px',
                  borderRadius: '12px',
                  border: 'none',
                  background: TEAL,
                  color: WHITE,
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <IconSave size={15} /> {saving ? 'Saving...' : 'Save changes'}
              </button>

              <button
                onClick={() => setEditing(false)}
                style={{
                  height: '44px',
                  borderRadius: '12px',
                  border: `1px solid ${BORDER}`,
                  background: WHITE,
                  color: TEXT2,
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                Cancel
              </button>
            </>
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
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) {
        setLoading(false)
        return
      }
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

  function serviceMeta(job: any) {
    const days = daysUntil(job.install_date, job.service_interval_months)
    const next = nextService(job.install_date, job.service_interval_months)
    const isDueSoon = days !== null && days >= 0 && days <= 30
    const isOverdue = days !== null && days < 0
    const serviceColor = isOverdue ? '#7F1D1D' : isDueSoon ? '#78350F' : TEAL_DARK
    const serviceBg = isOverdue ? '#FFF7F7' : isDueSoon ? '#FFFBF2' : '#F7FCFA'
    const serviceBorder = isOverdue ? '#FECACA' : isDueSoon ? '#FDE68A' : '#BBF7D0'
    const serviceLabel = isOverdue ? `Overdue ${Math.abs(days!)} days` : isDueSoon ? `Due in ${days} days` : next ? `Next: ${next}` : '—'
    return { days, next, isDueSoon, isOverdue, serviceColor, serviceBg, serviceBorder, serviceLabel }
  }

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    overflow: 'hidden',
  }

  const statCard: React.CSSProperties = {
    ...card,
    padding: isMobile ? '14px 14px 13px' : '14px 16px 13px',
    minHeight: isMobile ? 112 : 118,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '16px',
    borderRadius: '16px',
  }

  const sectionHeaderTitle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 800,
    color: TEXT,
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  }

  const cardArrowBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: TEXT3,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  }

  const overviewCards = [
    {
      label: 'Total jobs',
      value: jobs.length,
      sub: 'All jobs in workspace',
      iconSrc: 'https://static.wixstatic.com/media/48c433_997ef62d91654472ba257f2f31099e0c~mv2.png',
      accent: TEXT,
      tag: 'All time',
    },
    {
      label: 'Due this month',
      value: jobs.filter(j => {
        const d = daysUntil(j.install_date, j.service_interval_months)
        return d !== null && d >= 0 && d <= 30
      }).length,
      sub: 'Service due within 30 days',
      iconSrc: 'https://static.wixstatic.com/media/48c433_2c9a02e644c84ae6b66da7b917ac9390~mv2.png',
      accent: AMBER,
      tag: 'Upcoming',
    },
    {
      label: 'Customers',
      value: new Set(jobs.map(j => j.customer_id)).size,
      sub: 'Unique customers with jobs',
      iconSrc: 'https://static.wixstatic.com/media/48c433_eb5f601865a645939154bbe679d8e2a0~mv2.png',
      accent: TEAL_DARK,
      tag: 'Unique',
    },
  ]

  const overdueCount = jobs.filter(j => {
    const d = daysUntil(j.install_date, j.service_interval_months)
    return d !== null && d < 0
  }).length

  const dueSoonCount = jobs.filter(j => {
    const d = daysUntil(j.install_date, j.service_interval_months)
    return d !== null && d >= 0 && d <= 30
  }).length

  const upToDateCount = jobs.filter(j => {
    const d = daysUntil(j.install_date, j.service_interval_months)
    return d !== null && d > 30
  }).length

  function updateJobInList(updatedJob: any) {
    setJobs(prev => prev.map(j => (j.id === updatedJob.id ? { ...j, ...updatedJob } : j)))
    setSelectedJob((prev: any) => (prev && prev.id === updatedJob.id ? { ...prev, ...updatedJob } : prev))
  }

  return (
    <div
      style={{
        display: 'flex',
        fontFamily: FONT,
        background: BG,
        minHeight: '100vh',
      }}
    >
      <Sidebar active="/dashboard/jobs" />

      <div style={{ flex: 1, minWidth: 0, background: BG }}>
        <div
          style={{
            padding: isMobile ? '14px' : '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
          }}
        >
          <div
            style={{
              ...card,
              padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
              background: HEADER_BG,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>{todayStr}</div>
            <div
              style={{
                fontSize: isMobile ? '26px' : '34px',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                fontWeight: 900,
                color: WHITE,
                marginBottom: '8px',
              }}
            >
              Jobs
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.72)',
                maxWidth: '760px',
              }}
            >
              All installations, service history, and upcoming maintenance in one place.
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
                onClick={() => router.push('/dashboard/jobs/add')}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: TEAL,
                  color: WHITE,
                  border: 'none',
                  borderRadius: '10px',
                }}
              >
                <IconPlus size={16} /> Add new job
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {overviewCards.map(item => (
              <div key={item.label} style={statCard}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>{item.tag}</div>
                    <div style={{ ...TYPE.title, fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>{item.label}</div>
                  </div>
                  <StatImageIcon src={item.iconSrc} alt={item.label} />
                </div>

                <div>
                  <div style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: item.accent }}>
                    {item.value}
                  </div>
                  <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 320px',
              gap: '14px',
              alignItems: 'start',
            }}
          >
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
                  <div style={sectionHeaderTitle}>All jobs</div>
                  <div style={{ ...TYPE.bodySm }}>Click a job to update details, add notes, and manage the service schedule.</div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                    width: isMobile ? '100%' : 'auto',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: isMobile ? '100%' : '300px',
                      maxWidth: '100%',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: TEXT3,
                        display: 'inline-flex',
                      }}
                    >
                      <IconSearch size={14} />
                    </span>
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by name, brand, suburb..."
                      style={{
                        height: '40px',
                        width: '100%',
                        borderRadius: '11px',
                        border: `1px solid ${BORDER}`,
                        padding: '0 12px 0 36px',
                        fontSize: '12px',
                        background: WHITE,
                        color: TEXT,
                        fontFamily: FONT,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '10px',
                      border: `1px solid ${BORDER}`,
                      background: WHITE,
                      color: TEXT2,
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      whiteSpace: 'nowrap',
                      gap: '6px',
                    }}
                  >
                    <IconFilter size={14} /> {filtered.length} shown
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                }}
              >
                {equipmentTypes.map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    style={{
                      height: '34px',
                      padding: '0 13px',
                      borderRadius: '999px',
                      border: `1px solid ${filterType === t ? TEAL_DARK : BORDER}`,
                      background: filterType === t ? TEAL : WHITE,
                      color: filterType === t ? WHITE : TEXT2,
                      fontSize: '11px',
                      fontWeight: filterType === t ? 700 : 600,
                      cursor: 'pointer',
                      fontFamily: FONT,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t === 'all' ? 'All types' : EQUIPMENT_LABELS[t]}
                  </button>
                ))}
              </div>

              {!isMobile && filtered.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1.2fr) 150px 140px 24px',
                    gap: '10px',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderBottom: `1px solid ${BORDER}`,
                    background: '#FCFCFD',
                  }}
                >
                  <div style={{ ...TYPE.label }}>Customer</div>
                  <div style={{ ...TYPE.label }}>Equipment</div>
                  <div style={{ ...TYPE.label }}>Next service</div>
                  <div style={{ ...TYPE.label }}>Status</div>
                  <div />
                </div>
              )}

              {loading ? (
                <div style={{ padding: '32px 18px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>Loading jobs...</div>
              ) : filtered.length === 0 ? (
                <div
                  style={{
                    padding: '32px 18px',
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '13px',
                  }}
                >
                  No jobs yet. Add your first job or convert a lead to get started.
                </div>
              ) : (
                filtered.map(job => {
                  const customer = job.customers
                  const name = customer ? `${customer.first_name} ${customer.last_name}`.trim() : 'Unknown customer'
                  const meta = serviceMeta(job)

                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.5fr) minmax(0,1.2fr) 150px 140px 24px',
                        gap: '10px',
                        alignItems: 'center',
                        padding: '14px 16px',
                        borderBottom: `1px solid ${BORDER}`,
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                    >
                      {isMobile ? (
                        <div style={{ display: 'grid', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ ...TYPE.label, marginBottom: '5px', color: meta.serviceColor }}>
                                {EQUIPMENT_LABELS[job.equipment_type] || job.equipment_type}
                              </div>
                              <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT, lineHeight: 1.2, marginBottom: '4px' }}>{name}</div>
                              <div style={{ fontSize: '12px', fontWeight: 500, color: TEXT3 }}>
                                {customer?.phone || '—'}
                                {customer?.suburb ? ` · ${customer.suburb}` : ''}
                              </div>
                            </div>

                            <div style={{ color: TEXT3, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                              <IconArrow size={12} />
                            </div>
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '8px',
                            }}
                          >
                            <div
                              style={{
                                padding: '10px 11px',
                                borderRadius: '10px',
                                background: '#FCFCFD',
                                border: `1px solid ${BORDER}`,
                              }}
                            >
                              <div style={{ ...TYPE.label, marginBottom: '4px' }}>Equipment</div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>
                                {job.brand}
                                {job.model ? ` ${job.model}` : ''}
                                {job.capacity_kw ? ` · ${job.capacity_kw}kW` : ''}
                              </div>
                            </div>

                            <div
                              style={{
                                padding: '10px 11px',
                                borderRadius: '10px',
                                background: '#FCFCFD',
                                border: `1px solid ${BORDER}`,
                              }}
                            >
                              <div style={{ ...TYPE.label, marginBottom: '4px' }}>Next service</div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>{meta.next || '—'}</div>
                            </div>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span
                              style={{
                                background: meta.serviceBg,
                                color: meta.serviceColor,
                                border: `1px solid ${meta.serviceBorder}`,
                                padding: '6px 12px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 800,
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <IconCalendar size={12} />
                              {meta.serviceLabel}
                            </span>

                            <span style={{ fontSize: '11px', fontWeight: 700, color: TEAL_DARK }}>
                              Open job
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ ...TYPE.label, marginBottom: '5px', color: meta.serviceColor }}>
                              {EQUIPMENT_LABELS[job.equipment_type] || job.equipment_type}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, lineHeight: 1.2, marginBottom: '4px' }}>{name}</div>
                            <div style={{ fontSize: '12px', fontWeight: 500, color: TEXT3 }}>
                              {customer?.phone || '—'}
                              {customer?.suburb ? ` · ${customer.suburb}` : ''}
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: TEXT2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {job.brand}
                            {job.model ? ` ${job.model}` : ''}
                            {job.capacity_kw ? ` · ${job.capacity_kw}kW` : ''}
                          </div>

                          <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>
                            {meta.next || '—'}
                          </div>

                          <div>
                            <span
                              style={{
                                background: meta.serviceBg,
                                color: meta.serviceColor,
                                border: `1px solid ${meta.serviceBorder}`,
                                padding: '6px 12px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 800,
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <IconCalendar size={12} />
                              {meta.serviceLabel}
                            </span>
                          </div>

                          <div style={{ color: TEXT3, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <IconArrow size={12} />
                          </div>
                        </>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Quick actions</div>
                  <button onClick={() => router.push('/dashboard/jobs/add')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', marginBottom: '14px' }}>
                  <span style={{ color: TEAL_DARK }}>{jobs.length}</span> Total jobs
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  <button
                    onClick={() => router.push('/dashboard/jobs/add')}
                    style={{
                      width: '100%',
                      height: '34px',
                      background: TEAL,
                      color: WHITE,
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: FONT,
                    }}
                  >
                    Add new job
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/leads')}
                    style={{
                      width: '100%',
                      height: '34px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: FONT,
                      color: TEXT2,
                    }}
                  >
                    View leads
                  </button>

                  <button
                    onClick={() => {
                      setSearch('')
                      setFilterType('all')
                    }}
                    style={{
                      width: '100%',
                      height: '34px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: FONT,
                      color: TEXT2,
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              </div>

              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Service status</div>
                  <button onClick={() => router.push('/dashboard/jobs')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', marginBottom: '14px' }}>
                  {overdueCount > 0 ? (
                    <>
                      <span style={{ color: TEXT }}>{overdueCount}</span> Overdue job{overdueCount !== 1 ? 's' : ''}
                    </>
                  ) : (
                    <span style={{ color: TEAL_DARK }}>All clear</span>
                  )}
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {[
                    {
                      label: 'Overdue',
                      value: overdueCount,
                      bg: '#FFF9F9',
                      border: '#F3D4D4',
                    },
                    {
                      label: 'Due this month',
                      value: dueSoonCount,
                      bg: '#FFFDF7',
                      border: '#F4E5B8',
                    },
                    {
                      label: 'Up to date',
                      value: upToDateCount,
                      bg: '#FAFCFB',
                      border: '#D9ECE6',
                    },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        borderRadius: '10px',
                        background: item.bg,
                        border: `1px solid ${item.border}`,
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>{item.label}</div>
                      <div style={{ fontSize: '13px', fontWeight: 900, color: TEXT }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={sideCard}>
                <div style={{ ...TYPE.label, marginBottom: '8px' }}>Equipment breakdown</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {Object.entries(EQUIPMENT_LABELS).map(([key, label]) => {
                    const count = jobs.filter(j => j.equipment_type === key).length
                    if (count === 0) return null
                    const pct = jobs.length ? Math.round((count / jobs.length) * 100) : 0
                    return (
                      <div key={key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT2 }}>{label}</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: TEXT3 }}>{count}</span>
                        </div>
                        <div style={{ height: '6px', borderRadius: '999px', background: BORDER, overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${pct}%`,
                              background: TEAL,
                              borderRadius: '999px',
                              transition: 'width 0.4s',
                            }}
                          />
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
        <JobDrawer
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          isMobile={isMobile}
          onSaved={updateJobInList}
        />
      )}
    </div>
  )
}