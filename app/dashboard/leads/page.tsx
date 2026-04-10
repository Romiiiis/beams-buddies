'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_LIGHT = '#E6F6F5'
const RED = '#B91C1C'
const AMBER = '#92400E'
const BLUE = '#1E3A8A'
const GREEN = '#166534'
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
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function IconUsers({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.9" />
      <path d="M20 8.5a3.5 3.5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.35" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconPhone({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72l.34 2.71a2 2 0 0 1-.57 1.72L7.1 9.9a16 16 0 0 0 7 7l1.75-1.78a2 2 0 0 1 1.72-.57l2.71.34A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  )
}

function IconCalendar({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
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

function IconArrow({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
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

function IconClose({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconEdit({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCheck({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconNote({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function StatImageIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: '34px',
        height: '34px',
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
  )
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  booked:       { bg: '#DCFCE7', color: '#166534', label: 'Booked' },
  pending:      { bg: '#FEF3C7', color: '#78350F', label: 'Pending' },
  incomplete:   { bg: '#F1F5F9', color: TEXT3,     label: 'Incomplete' },
  wrong_number: { bg: '#FEE2E2', color: '#7F1D1D', label: 'Wrong number' },
  converted:    { bg: '#DBEAFE', color: '#1E3A8A', label: 'Converted' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status] || { bg: '#F1F5F9', color: TEXT3, label: status }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '6px 10px', borderRadius: '999px',
      fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap',
      display: 'inline-block', letterSpacing: '0.02em',
    }}>
      {s.label}
    </span>
  )
}

const JOB_TYPE_CONFIG: Record<string, { bg: string; color: string }> = {
  installation: { bg: '#EDE9FE', color: '#4C1D95' },
  service:      { bg: '#E8F4F1', color: '#0A4F4C' },
  repair:       { bg: '#FFE4E6', color: '#881337' },
  quote:        { bg: '#FEF3C7', color: '#78350F' },
  site_visit:   { bg: '#DBEAFE', color: '#1E3A8A' },
}

function JobTypeBadge({ type }: { type: string }) {
  const s = JOB_TYPE_CONFIG[type] || { bg: '#F1F5F9', color: TEXT3 }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '6px 10px', borderRadius: '999px',
      fontSize: '10px', fontWeight: 800,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
      display: 'inline-block', letterSpacing: '0.02em',
    }}>
      {type?.replace('_', ' ')}
    </span>
  )
}

// ─── Lead Detail Drawer ───────────────────────────────────────────────────────

interface LeadDrawerProps {
  lead: any
  onClose: () => void
  onUpdate: (updated: any) => void
  onConvert: (lead: any) => void
  converting: boolean
  isMobile: boolean
}

function LeadDrawer({ lead, onClose, onUpdate, onConvert, converting, isMobile }: LeadDrawerProps) {
  const [status, setStatus]           = useState(lead.status)
  const [preferredDate, setPreferredDate] = useState(lead.preferred_date || '')
  const [preferredTime, setPreferredTime] = useState(lead.preferred_start_time || '')
  const [followUpNote, setFollowUpNote]   = useState(lead.follow_up_note || '')
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)

  const statusAccent =
    status === 'booked'       ? GREEN  :
    status === 'pending'      ? AMBER  :
    status === 'converted'    ? BLUE   :
    status === 'wrong_number' ? RED    : TEXT3

  async function save() {
    setSaving(true)
    const updates: any = {
      status,
      preferred_date: preferredDate || null,
      preferred_start_time: preferredTime || null,
      follow_up_note: followUpNote || null,
    }
    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', lead.id)

    if (!error) {
      onUpdate({ ...lead, ...updates })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: `1px solid ${BORDER}`,
    background: '#FCFCFD',
    fontSize: '13px',
    fontWeight: 500,
    color: TEXT,
    fontFamily: FONT,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    ...TYPE.label,
    marginBottom: '7px',
    display: 'block',
  }

  const fieldBox: React.CSSProperties = {
    background: '#F8FAFC',
    border: `1px solid ${BORDER}`,
    borderRadius: '12px',
    padding: '12px 14px',
  }

  const drawerWidth = isMobile ? '100vw' : '480px'

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(11,18,32,0.35)',
          zIndex: 200,
          backdropFilter: 'blur(2px)',
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: drawerWidth,
          background: WHITE,
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(11,18,32,0.12)',
          overflow: 'hidden',
          animation: 'slideIn 0.22s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0.6; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        <div style={{
          padding: '20px 22px 18px',
          borderBottom: `1px solid ${BORDER}`,
          background: HEADER_BG,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ ...TYPE.label, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Inbound call</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: WHITE, lineHeight: 1.2, marginBottom: '4px' }}>
                {lead.customer_name}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>
                {lead.phone_number}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '34px', height: '34px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconClose size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            <JobTypeBadge type={lead.job_type} />
            <StatusBadge status={status} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

          <div style={{ marginBottom: '22px' }}>
            <div style={labelStyle}>Call summary</div>
            <div style={{ ...fieldBox, ...TYPE.body, fontSize: '13px', lineHeight: 1.7 }}>
              {lead.issue_summary || 'No summary recorded.'}
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <div style={labelStyle}>Call details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Suburb',  value: lead.suburb        || '—' },
                { label: 'Address', value: lead.address       || '—' },
                { label: 'Received', value: lead.created_at
                    ? new Date(lead.created_at).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : '—' },
                { label: 'Job type', value: lead.job_type?.replace('_', ' ') || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={fieldBox}>
                  <div style={{ ...TYPE.label, marginBottom: '5px' }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT, textTransform: 'capitalize' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            borderRadius: '14px',
            border: `1.5px solid ${BORDER}`,
            background: '#FAFBFC',
            overflow: 'hidden',
            marginBottom: '22px',
          }}>
            <div style={{
              padding: '12px 14px',
              borderBottom: `1px solid ${BORDER}`,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <IconEdit size={14} />
              <span style={{ ...TYPE.titleSm }}>Update this lead</span>
            </div>

            <div style={{ padding: '16px 14px', display: 'grid', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Status</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setStatus(key)}
                      style={{
                        height: '32px',
                        padding: '0 12px',
                        borderRadius: '999px',
                        border: status === key ? 'none' : `1px solid ${BORDER}`,
                        background: status === key ? cfg.color : WHITE,
                        color: status === key ? WHITE : TEXT2,
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: FONT,
                        textTransform: 'capitalize',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.12s',
                      }}
                    >
                      {status === key && <IconCheck size={12} />}
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>Booking date</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={e => setPreferredDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Booking time</label>
                  <input
                    type="time"
                    value={preferredTime}
                    onChange={e => setPreferredTime(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Follow-up note</label>
                <textarea
                  value={followUpNote}
                  onChange={e => setFollowUpNote(e.target.value)}
                  placeholder="Add a note for yourself or your team..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    lineHeight: 1.6,
                  }}
                />
              </div>
            </div>
          </div>

          {lead.follow_up_note && lead.follow_up_note !== followUpNote && (
            <div style={{ ...fieldBox, marginBottom: '22px' }}>
              <div style={{ ...TYPE.label, marginBottom: '6px' }}>Previous note</div>
              <div style={{ ...TYPE.body, fontSize: '12px', lineHeight: 1.7, color: TEXT3 }}>
                {lead.follow_up_note}
              </div>
            </div>
          )}

        </div>

        <div style={{
          padding: '14px 22px 20px',
          borderTop: `1px solid ${BORDER}`,
          background: WHITE,
          flexShrink: 0,
          display: 'grid',
          gap: '8px',
        }}>
          <button
            onClick={save}
            disabled={saving}
            style={{
              height: '44px',
              borderRadius: '12px',
              border: 'none',
              background: saved ? '#166534' : TEAL,
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
              transition: 'background 0.2s',
              boxShadow: '0 6px 14px rgba(31,158,148,0.20)',
            }}
          >
            {saved ? <><IconCheck size={16} /> Saved</> : saving ? 'Saving...' : 'Save changes'}
          </button>

          {status === 'booked' && lead.status !== 'converted' && (
            <button
              onClick={() => onConvert(lead)}
              disabled={converting}
              style={{
                height: '44px',
                borderRadius: '12px',
                border: `1.5px solid ${TEAL_DARK}`,
                background: TEAL_LIGHT,
                color: TEAL_DARK,
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: FONT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: converting ? 0.6 : 1,
              }}
            >
              {converting ? 'Converting...' : 'Convert to job'}
              <IconArrow size={14} />
            </button>
          )}

          {lead.status === 'converted' && (
            <div style={{
              height: '44px',
              borderRadius: '12px',
              border: `1px solid ${BORDER}`,
              background: '#F8FAFC',
              color: TEXT3,
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
            }}>
              <IconCheck size={14} /> Already converted to job
            </div>
          )}

          {lead.phone_number && (
            <a
              href={`tel:${lead.phone_number}`}
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
                boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
              }}
            >
              <IconPhone size={15} /> Call {lead.customer_name?.split(' ')[0]}
            </a>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [leads, setLeads]           = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [converting, setConverting] = useState<string | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedLead, setSelectedLead] = useState<any | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: userData } = await supabase
        .from('users').select('business_id').eq('id', session.user.id).single()

      if (!userData) { setLoading(false); return }
      setBusinessId(userData.business_id)

      const { data } = await supabase
        .from('leads').select('*').order('created_at', { ascending: false })

      setLeads(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = search
        ? `${l.customer_name} ${l.phone_number} ${l.suburb} ${l.job_type}`.toLowerCase().includes(search.toLowerCase())
        : true
      const matchStatus = filterStatus === 'all' ? true : l.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [leads, search, filterStatus])

  const handleUpdate = useCallback((updated: any) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))
    setSelectedLead(updated)
  }, [])

  async function convertToJob(lead: any) {
    if (!businessId) return
    setConverting(lead.id)
    try {
      const { data: customer, error: custErr } = await supabase
        .from('customers')
        .insert([{
          business_id: businessId,
          first_name: lead.customer_name?.split(' ')[0] || lead.customer_name,
          last_name: lead.customer_name?.split(' ').slice(1).join(' ') || '',
          phone: lead.phone_number,
          address: lead.address,
          suburb: lead.suburb,
        }])
        .select().single()

      if (custErr) throw custErr

      const { error: jobErr } = await supabase
        .from('jobs')
        .insert([{
          business_id: businessId,
          customer_id: customer.id,
          equipment_type: 'other',
          brand: 'TBC',
          install_date: lead.preferred_date || new Date().toISOString().split('T')[0],
          notes: `${lead.job_type} — ${lead.issue_summary}. Booked: ${lead.preferred_date} at ${lead.preferred_start_time}.`,
        }])

      if (jobErr) throw jobErr

      await supabase.from('leads').update({ status: 'converted' }).eq('id', lead.id)
      const updated = { ...lead, status: 'converted' }
      setLeads(prev => prev.map(l => l.id === lead.id ? updated : l))
      setSelectedLead(updated)
    } catch (err) {
      console.error('Convert error:', err)
      alert('Failed to convert lead. Check console.')
    }
    setConverting(null)
  }

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const shellCard: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
    overflow: 'hidden',
  }
  const panelCard: React.CSSProperties = { ...shellCard, padding: '16px' }
  const sectionLabel: React.CSSProperties = { ...TYPE.title, fontSize: '13px', fontWeight: 800, marginBottom: '12px' }
  const quickActionStyle: React.CSSProperties = {
    border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2,
    borderRadius: '10px', height: '38px', padding: '0 14px',
    fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
  }

  const statuses = ['all', 'booked', 'pending', 'incomplete', 'converted', 'wrong_number']
  const overviewCards = [
    {
      label: 'Booked',
      value: leads.filter(l => l.status === 'booked').length,
      sub: 'Ready to convert',
      iconSrc: 'https://static.wixstatic.com/media/48c433_2c9a02e644c84ae6b66da7b917ac9390~mv2.png',
      accent: GREEN,
      tag: 'Live pipeline',
    },
    {
      label: 'Pending',
      value: leads.filter(l => l.status === 'pending').length,
      sub: 'Need follow-up',
      iconSrc: 'https://static.wixstatic.com/media/48c433_bc1fa329d29143c0903d4d61a44a8c5e~mv2.png',
      accent: AMBER,
      tag: 'Needs action',
    },
    {
      label: 'Converted',
      value: leads.filter(l => l.status === 'converted').length,
      sub: 'Moved into jobs',
      iconSrc: 'https://static.wixstatic.com/media/48c433_a7bee743bd61424d9d0ae825cb76bc58~mv2.png',
      accent: BLUE,
      tag: 'Completed flow',
    },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: FONT, background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/leads" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: BG }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: BG, padding: isMobile ? '14px' : '16px', gap: '12px',
        }}>

          <div style={{
            ...shellCard,
            padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
            background: HEADER_BG, border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '28px' : '34px', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 900, color: WHITE, marginBottom: '8px' }}>Leads</div>
            <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', maxWidth: '760px' }}>
              Track inbound calls from Chloe and move qualified bookings into live jobs.
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/dashboard/jobs')}
                style={{ ...quickActionStyle, background: TEAL, color: WHITE, border: 'none', boxShadow: '0 6px 14px rgba(31,158,148,0.20)' }}
              >
                <IconSpark size={16} /> Open jobs
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))', gap: '12px' }}>
            {overviewCards.map(item => (
              <div
                key={item.label}
                style={{
                  ...panelCard,
                  gridColumn: isMobile ? 'span 1' : 'span 4',
                  minHeight: 148,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '8px' }}>{item.tag}</div>
                    <div style={{ ...TYPE.title, fontSize: '14px', fontWeight: 800, marginBottom: '10px' }}>{item.label}</div>
                  </div>
                  <StatImageIcon src={item.iconSrc} alt={item.label} />
                </div>
                <div>
                  <div style={{ ...TYPE.valueLg, fontSize: '30px', color: item.accent }}>{item.value}</div>
                  <div style={{ ...TYPE.bodySm, marginTop: '7px' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))', gap: '12px', alignItems: 'start' }}>

            <div style={{ ...panelCard, gridColumn: isMobile ? 'span 1' : 'span 8' }}>
              <div style={{
                display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row',
                gap: '10px', marginBottom: '14px',
              }}>
                <div>
                  <div style={sectionLabel}>Inbound calls</div>
                  <div style={{ ...TYPE.bodySm }}>Click any lead to follow up, update status, or book.</div>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '7px 10px', borderRadius: '999px',
                  background: '#F8FAFC', border: `1px solid ${BORDER}`,
                  color: TEXT3, fontSize: '11px', fontWeight: 800,
                }}>
                  <IconFilter size={14} /> {filtered.length} shown
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 320px) 1fr',
                gap: '10px', marginBottom: '14px',
              }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, phone, suburb..."
                  style={{
                    width: '100%', height: '40px', padding: '0 12px',
                    borderRadius: '10px', border: `1px solid ${BORDER}`,
                    background: '#FCFCFD', fontSize: '12px', color: TEXT,
                    outline: 'none', fontFamily: FONT,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                  }}
                />
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {statuses.map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      style={{
                        height: '36px', padding: '0 14px',
                        borderRadius: '999px',
                        border: `1px solid ${filterStatus === s ? TEAL_DARK : BORDER}`,
                        background: filterStatus === s ? TEAL : WHITE,
                        color: filterStatus === s ? WHITE : TEXT2,
                        fontSize: '12px', fontWeight: filterStatus === s ? 700 : 600,
                        cursor: 'pointer', fontFamily: FONT, textTransform: 'capitalize',
                        boxShadow: filterStatus === s ? '0 6px 14px rgba(31,158,148,0.16)' : 'none',
                      }}
                    >
                      {s === 'all' ? 'All' : s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div style={{ borderRadius: '12px', padding: '26px 16px', background: WHITE, border: `1px solid ${BORDER}`, textAlign: 'center', color: TEXT3, fontSize: '14px', fontWeight: 500 }}>
                  Loading...
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ borderRadius: '12px', padding: '26px 16px', background: WHITE, border: `1px solid ${BORDER}`, textAlign: 'center', color: TEXT3, fontSize: '14px', fontWeight: 500 }}>
                  No leads yet. Calls from Chloe will appear here.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {filtered.map(lead => {
                    const statusAccent =
                      lead.status === 'booked'       ? GREEN  :
                      lead.status === 'pending'       ? AMBER  :
                      lead.status === 'converted'     ? BLUE   :
                      lead.status === 'wrong_number'  ? RED    : TEXT3

                    return (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        style={{
                          borderRadius: '14px',
                          border: `1px solid ${BORDER}`,
                          background: WHITE,
                          boxShadow: '0 4px 14px rgba(15,23,42,0.04)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'box-shadow 0.15s, transform 0.12s',
                        }}
                        onMouseEnter={e => {
                          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(15,23,42,0.09)'
                          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={e => {
                          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(15,23,42,0.04)'
                          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '6px 1fr' }}>
                          {!isMobile && <div style={{ background: statusAccent }} />}

                          <div style={{ padding: '14px 16px' }}>
                            <div style={{
                              display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
                              justifyContent: 'space-between', gap: '12px',
                              flexDirection: isMobile ? 'column' : 'row',
                              paddingBottom: '10px', borderBottom: `1px solid ${BORDER}`,
                              marginBottom: '10px',
                            }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ ...TYPE.label, marginBottom: '5px', color: statusAccent }}>Inbound call</div>
                                <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT, lineHeight: 1.2, marginBottom: '3px' }}>
                                  {lead.customer_name}
                                </div>
                                <div style={{ ...TYPE.bodySm, fontSize: '12px', color: TEXT2 }}>{lead.phone_number}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <JobTypeBadge type={lead.job_type} />
                                <StatusBadge status={lead.status} />
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                              {lead.suburb && (
                                <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT3 }}>
                                  📍 {lead.suburb}
                                </div>
                              )}
                              {lead.preferred_date && (
                                <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT3 }}>
                                  📅 {lead.preferred_date}{lead.preferred_start_time ? ` at ${lead.preferred_start_time}` : ''}
                                </div>
                              )}
                              {lead.issue_summary && (
                                <div style={{ fontSize: '12px', fontWeight: 500, color: TEXT3, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {lead.issue_summary}
                                </div>
                              )}
                              <div style={{
                                marginLeft: 'auto', flexShrink: 0,
                                fontSize: '11px', fontWeight: 700, color: TEAL,
                                display: 'flex', alignItems: 'center', gap: '4px',
                              }}>
                                View & manage <IconArrow size={12} />
                              </div>
                            </div>
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
                <div style={sectionLabel}>Pipeline summary</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[
                    { label: 'Total leads',       value: leads.length,                                          sub: 'All inbound leads in this workspace' },
                    { label: 'Shown now',         value: filtered.length,                                       sub: 'Based on your current search and filter' },
                    { label: 'Booked to convert', value: leads.filter(l => l.status === 'booked').length,       sub: 'Ready to move into active jobs' },
                  ].map(item => (
                    <div key={item.label} style={{ borderRadius: '12px', background: '#F8FAFC', border: `1px solid ${BORDER}`, padding: '12px' }}>
                      <div style={{ ...TYPE.label, marginBottom: '5px' }}>{item.label}</div>
                      <div style={{ ...TYPE.valueSm }}>{item.value}</div>
                      <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={panelCard}>
                <div style={sectionLabel}>Actions</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <button
                    onClick={() => router.push('/dashboard/jobs')}
                    style={{ ...quickActionStyle, width: '100%', justifyContent: 'center', background: TEAL, color: WHITE, border: 'none', boxShadow: '0 6px 14px rgba(31,158,148,0.20)' }}
                  >
                    <IconSpark size={16} /> Open jobs
                  </button>
                  <button
                    onClick={() => { setSearch(''); setFilterStatus('all') }}
                    style={{ ...quickActionStyle, width: '100%', justifyContent: 'center' }}
                  >
                    Reset filters
                  </button>
                </div>
              </div>

              <div style={panelCard}>
                <div style={sectionLabel}>How it works</div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {[
                    'Click any lead card to open the detail drawer.',
                    'Update status, booking date/time, and add a follow-up note.',
                    'Mark as Booked then convert directly into a job.',
                    'Converted leads stay visible for tracking history.',
                  ].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: TEXT2, fontSize: '12px', fontWeight: 600, lineHeight: 1.5 }}>
                      <span style={{ width: '8px', height: '8px', marginTop: '5px', borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdate}
          onConvert={convertToJob}
          converting={converting === selectedLead.id}
          isMobile={isMobile}
        />
      )}
    </div>
  )
}