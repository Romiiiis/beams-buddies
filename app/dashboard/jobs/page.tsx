'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_LIGHT = '#E6F7F6'
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

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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

function IconSave({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 21h14a2 2 0 0 0 2-2V7l-4-4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  )
}

function pctChange(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return 0
    return 100
  }
  return Math.round(((current - previous) / previous) * 100)
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
    borderRadius: '14px',
    padding: '12px 14px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
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
  const serviceBg = isOverdue ? '#FEE2E2' : isDueSoon ? '#FEF3C7' : TEAL_LIGHT
  const serviceBorder = isOverdue ? '#FECACA' : isDueSoon ? '#FDE68A' : '#BFE7E3'
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
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            padding: '18px 20px 16px',
            borderBottom: `1px solid ${BORDER}`,
            background: WHITE,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ ...TYPE.label, marginBottom: '6px' }}>
                {EQUIPMENT_LABELS[form.equipment_type] || form.equipment_type}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: TEXT, lineHeight: 1.2, marginBottom: '4px', letterSpacing: '-0.035em' }}>
                {name}
              </div>
              {customer?.phone && <div style={{ fontSize: '13px', fontWeight: 600, color: TEXT3 }}>{customer.phone}</div>}
            </div>

            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                border: `1px solid ${BORDER}`,
                background: WHITE,
                color: TEXT3,
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
                  background: TEAL_LIGHT,
                  color: TEAL_DARK,
                  border: '1px solid #BFE7E3',
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

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'grid', gap: '12px', background: BG }}>
          <div style={fieldBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
              <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT }}>Customer</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                  <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT }}>Unit details</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                  <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT }}>Service schedule</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                  <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT }}>Edit job</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>Brand</div>
                    <input style={inputStyle} value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>Model</div>
                    <input style={inputStyle} value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>Capacity kW</div>
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
                <textarea
                  style={textareaStyle}
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Add notes, service context, access instructions, parts needed..."
                />
              </div>
            </>
          )}
        </div>

        <div
          style={{
            padding: '14px 16px 16px',
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
        ? `${name} ${j.brand || ''} ${j.model || ''} ${j.customers?.suburb || ''} ${j.customers?.phone || ''}`
            .toLowerCase()
            .includes(search.toLowerCase())
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
    const serviceColor = isOverdue ? '#991B1B' : isDueSoon ? AMBER : TEAL_DARK
    const serviceBg = isOverdue ? '#FEE2E2' : isDueSoon ? '#FEF3C7' : TEAL_LIGHT
    const serviceBorder = isOverdue ? '#FECACA' : isDueSoon ? '#FDE68A' : '#BFE7E3'
    const serviceLabel = isOverdue ? `Overdue` : isDueSoon ? `Due soon` : next ? `Scheduled` : 'No date'
    return { days, next, isDueSoon, isOverdue, serviceColor, serviceBg, serviceBorder, serviceLabel }
  }

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const now = new Date()
  const startCurrent30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  const startPrev30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60)

  function inRange(dateStr?: string | null, start?: Date, end?: Date) {
    if (!dateStr) return false
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    return d >= start! && d < end!
  }

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

  const currentJobs = jobs.filter(j => inRange(j.install_date, startCurrent30, now)).length
  const prevJobs = jobs.filter(j => inRange(j.install_date, startPrev30, startCurrent30)).length

  const currentDue = jobs.filter(j => {
    const d = daysUntil(j.install_date, j.service_interval_months)
    return d !== null && d >= 0 && d <= 30 && inRange(j.install_date, startCurrent30, now)
  }).length
  const prevDue = jobs.filter(j => {
    const d = daysUntil(j.install_date, j.service_interval_months)
    return d !== null && d >= 0 && d <= 30 && inRange(j.install_date, startPrev30, startCurrent30)
  }).length

  const currentCustomers = new Set(
    jobs.filter(j => inRange(j.install_date, startCurrent30, now)).map(j => j.customer_id)
  ).size
  const prevCustomers = new Set(
    jobs.filter(j => inRange(j.install_date, startPrev30, startCurrent30)).map(j => j.customer_id)
  ).size

  const jobsDelta = pctChange(currentJobs, prevJobs)
  const dueDelta = pctChange(currentDue, prevDue)
  const customersDelta = pctChange(currentCustomers, prevCustomers)

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '16px',
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

  const btnPrimary: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    border: 'none',
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: WHITE,
    background: TEAL,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.12s',
  }

  const btnMobileSm: React.CSSProperties = {
    height: '36px',
    padding: '0 12px',
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

  const btnMobilePrimary: React.CSSProperties = {
    ...btnMobileSm,
    background: TEAL,
    border: `1px solid ${TEAL}`,
    color: WHITE,
  }

  const statChips = [
    {
      label: 'Total jobs',
      value: jobs.length,
      sub: `${jobsDelta >= 0 ? '+' : ''}${jobsDelta}% last 30 days`,
      onClick: () => setFilterType('all'),
    },
    {
      label: 'Due soon',
      value: dueSoonCount,
      sub: `${dueDelta >= 0 ? '+' : ''}${dueDelta}% last 30 days`,
      onClick: () => setFilterType('all'),
    },
    {
      label: 'Overdue',
      value: overdueCount,
      sub: overdueCount > 0 ? 'Needs attention' : 'All clear',
      onClick: () => setFilterType('all'),
    },
    {
      label: 'Customers',
      value: new Set(jobs.map(j => j.customer_id)).size,
      sub: `${customersDelta >= 0 ? '+' : ''}${customersDelta}% last 30 days`,
      onClick: () => setFilterType('all'),
    },
  ]

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

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '0' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '40px',
            background: BG,
          }}
        >
          {isMobile ? (
            <div style={{ padding: '20px 12px 4px' }}>
              <div style={{ marginBottom: '12px' }}>
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
                  Jobs
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => router.push('/dashboard/jobs/add')} style={btnMobilePrimary}>
                  <IconSpark size={12} /> Add job
                </button>
                <button
                  onClick={() => {
                    setSearch('')
                    setFilterType('all')
                  }}
                  style={btnMobileSm}
                >
                  Reset
                </button>
              </div>

              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderTop: `2px solid ${TEAL}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {statChips.map((chip, i) => (
                  <div
                    key={chip.label}
                    onClick={chip.onClick}
                    style={{
                      padding: '10px 8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = TEAL_LIGHT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: TEXT3, marginTop: '3px', lineHeight: 1.2 }}>{chip.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
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
                    Jobs
                  </h1>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => router.push('/dashboard/jobs/add')}
                    style={btnPrimary}
                    onMouseEnter={e => {
                      e.currentTarget.style.opacity = '0.82'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    <IconSpark size={12} /> Add job
                  </button>

                  <button
                    onClick={() => {
                      setSearch('')
                      setFilterType('all')
                    }}
                    style={btnOutline}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = TEXT
                      e.currentTarget.style.color = TEXT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = BORDER
                      e.currentTarget.style.color = TEXT2
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderTop: `2px solid ${TEAL}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {statChips.map((chip, i) => (
                  <div
                    key={chip.label}
                    onClick={chip.onClick}
                    style={{
                      padding: '14px 20px',
                      cursor: 'pointer',
                      borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = TEAL_LIGHT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '4px' }}>{chip.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 320px',
              gap: '14px',
              alignItems: 'start',
              padding: isMobile ? '0 12px' : 0,
            }}
          >
            <div style={card}>
              <div
                style={{
                  padding: isMobile ? '16px' : '18px 20px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '14px',
                  background: WHITE,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: 4, height: 44, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em' }}>All jobs</span>
                      <span
                        style={{
                          height: '22px',
                          padding: '0 8px',
                          borderRadius: '999px',
                          border: `1px solid ${BORDER}`,
                          background: '#F8FAFC',
                          color: TEXT3,
                          fontSize: '10px',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        {filtered.length} shown
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '4px' }}>
                      View installed units, service timing, and customer details.
                    </div>
                  </div>
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
                      width: isMobile ? '100%' : '320px',
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
                        height: '42px',
                        width: '100%',
                        borderRadius: '12px',
                        border: `1px solid ${BORDER}`,
                        padding: '0 12px 0 38px',
                        fontSize: '12px',
                        background: '#F8FAFC',
                        color: TEXT,
                        fontFamily: FONT,
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    style={{
                      height: '42px',
                      minWidth: isMobile ? '100%' : '180px',
                      width: isMobile ? '100%' : '180px',
                      padding: '0 12px',
                      borderRadius: '12px',
                      border: `1px solid ${BORDER}`,
                      background: '#F8FAFC',
                      color: TEXT2,
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: FONT,
                      outline: 'none',
                    }}
                  >
                    {equipmentTypes.map(t => (
                      <option key={t} value={t}>
                        {t === 'all' ? 'All types' : EQUIPMENT_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!isMobile && filtered.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1.25fr) 140px 120px 28px',
                    gap: '14px',
                    alignItems: 'center',
                    padding: '11px 20px',
                    borderBottom: `1px solid ${BORDER}`,
                    background: '#FCFCFD',
                  }}
                >
                  {['Customer', 'Equipment', 'Next service', 'Status'].map(label => (
                    <div key={label} style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {label}
                    </div>
                  ))}
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
                        display: isMobile ? 'block' : 'grid',
                        gridTemplateColumns: isMobile ? undefined : 'minmax(0,1.55fr) minmax(0,1.25fr) 140px 120px 28px',
                        gap: isMobile ? undefined : '14px',
                        alignItems: isMobile ? undefined : 'center',
                        margin: isMobile ? '0' : '10px 12px',
                        padding: isMobile ? '14px 16px' : '14px 16px',
                        borderBottom: isMobile ? `1px solid ${BORDER}` : undefined,
                        border: isMobile ? 'none' : `1px solid ${BORDER}`,
                        borderRadius: isMobile ? '0' : '14px',
                        background: WHITE,
                        cursor: 'pointer',
                        transition: 'background 0.12s, border-color 0.12s, box-shadow 0.12s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = TEAL_LIGHT
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = WHITE
                      }}
                    >
                      {isMobile ? (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: '12px',
                              background: TEAL_LIGHT,
                              border: `1px solid #BFE7E3`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              color: TEAL_DARK,
                            }}
                          >
                            <IconCalendar size={16} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {name}
                              </div>

                              <span
                                style={{
                                  background: meta.serviceBg,
                                  color: meta.serviceColor,
                                  border: `1px solid ${meta.serviceBorder}`,
                                  padding: '3px 8px',
                                  borderRadius: '999px',
                                  fontSize: '9px',
                                  fontWeight: 800,
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                }}
                              >
                                {meta.serviceLabel}
                              </span>
                            </div>

                            <div style={{ fontSize: '11px', color: TEXT3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                              {customer?.phone || 'No phone saved'}
                              {customer?.suburb ? ` · ${customer.suburb}` : ''}
                            </div>

                            <div style={{ fontSize: '11px', color: TEXT3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '8px' }}>
                              {job.brand || 'TBC'}
                              {job.model ? ` ${job.model}` : ''}
                              {job.capacity_kw ? ` · ${job.capacity_kw}kW` : ''}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: TEXT2 }}>
                                {EQUIPMENT_LABELS[job.equipment_type] || job.equipment_type || 'Other'}
                              </span>
                              <div style={{ width: 1, height: 10, background: BORDER }} />
                              <span style={{ fontSize: '10px', fontWeight: 700, color: meta.next ? TEAL_DARK : TEXT3 }}>
                                {meta.next ? `Next: ${meta.next}` : 'No service date'}
                              </span>
                            </div>
                          </div>

                          <div style={{ color: TEXT3, flexShrink: 0, marginTop: '12px' }}>
                            <IconArrow size={12} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                            <div style={{ width: 4, alignSelf: 'stretch', minHeight: 46, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: 850, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {name}
                              </div>
                              <div style={{ fontSize: '11px', color: TEXT3, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {customer?.phone || 'No phone saved'}
                                {customer?.suburb ? ` · ${customer.suburb}` : ''}
                              </div>
                              <div style={{ fontSize: '10px', fontWeight: 750, color: TEAL_DARK, marginTop: '5px' }}>
                                {EQUIPMENT_LABELS[job.equipment_type] || job.equipment_type || 'Other'}
                              </div>
                            </div>
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 750, color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.brand || 'TBC'}
                              {job.model ? ` ${job.model}` : ''}
                              {job.capacity_kw ? ` · ${job.capacity_kw}kW` : ''}
                            </div>
                            <div style={{ fontSize: '11px', color: TEXT3, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.install_location || 'No install location'}
                            </div>
                          </div>

                          <div style={{ fontSize: '12px', fontWeight: 800, color: TEXT2 }}>
                            {meta.next || '—'}
                          </div>

                          <div>
                            <span
                              style={{
                                background: meta.serviceBg,
                                color: meta.serviceColor,
                                border: `1px solid ${meta.serviceBorder}`,
                                padding: '6px 9px',
                                borderRadius: '999px',
                                fontSize: '10px',
                                fontWeight: 800,
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT, letterSpacing: '-0.025em' }}>Service status</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>Upcoming service health</div>
                    </div>
                  </div>
                  <button onClick={() => router.push('/dashboard/jobs')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT3, padding: 0, display: 'flex', alignItems: 'center' }}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ fontSize: '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', marginBottom: '14px' }}>
                  {overdueCount > 0 ? (
                    <>
                      <span style={{ color: TEXT }}>{overdueCount}</span> overdue
                    </>
                  ) : (
                    <span style={{ color: TEAL_DARK }}>All clear</span>
                  )}
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {[
                    { label: 'Overdue', value: overdueCount, bg: '#FEE2E2', border: '#FECACA' },
                    { label: 'Due soon', value: dueSoonCount, bg: '#FEF3C7', border: '#FDE68A' },
                    { label: 'Up to date', value: upToDateCount, bg: TEAL_LIGHT, border: '#BFE7E3' },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        borderRadius: '12px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT, letterSpacing: '-0.025em' }}>Equipment breakdown</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>Tracked units by type</div>
                  </div>
                </div>

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