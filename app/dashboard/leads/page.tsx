'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_LIGHT = '#E6F7F6'
const RED = '#B91C1C'
const AMBER = '#92400E'
const BLUE = '#1E3A8A'
const GREEN = '#166534'
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

function IconPhone({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72l.34 2.71a2 2 0 0 1-.57 1.72L7.1 9.9a16 16 0 0 0 7 7l1.75-1.78a2 2 0 0 1 1.72-.57l2.71.34A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconArrow({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
      <path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function IconSearch({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
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

const STATUS_CONFIG: Record<string, { bg: string; color: string; border: string; label: string }> = {
  booked: { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0', label: 'Booked' },
  pending: { bg: '#FEF3C7', color: '#78350F', border: '#FDE68A', label: 'Pending' },
  incomplete: { bg: '#F1F5F9', color: TEXT3, border: BORDER, label: 'Incomplete' },
  wrong_number: { bg: '#FEE2E2', color: '#7F1D1D', border: '#FECACA', label: 'Wrong number' },
  converted: { bg: TEAL_LIGHT, color: TEAL_DARK, border: '#BFE7E3', label: 'Converted' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status] || { bg: '#F1F5F9', color: TEXT3, border: BORDER, label: status }
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        padding: '6px 10px',
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 800,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        letterSpacing: '0.02em',
      }}
    >
      {s.label}
    </span>
  )
}

const JOB_TYPE_CONFIG: Record<string, { bg: string; color: string; border: string }> = {
  installation: { bg: '#EDE9FE', color: '#4C1D95', border: '#DDD6FE' },
  service: { bg: '#E8F4F1', color: '#0A4F4C', border: '#CBE7E1' },
  repair: { bg: '#FFE4E6', color: '#881337', border: '#FECDD3' },
  quote: { bg: '#FEF3C7', color: '#78350F', border: '#FDE68A' },
  site_visit: { bg: '#DBEAFE', color: '#1E3A8A', border: '#BFDBFE' },
}

function JobTypeBadge({ type }: { type: string }) {
  const s = JOB_TYPE_CONFIG[type] || { bg: '#F1F5F9', color: TEXT3, border: BORDER }
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        padding: '6px 10px',
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 800,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        letterSpacing: '0.02em',
      }}
    >
      {type?.replace('_', ' ')}
    </span>
  )
}

interface LeadDrawerProps {
  lead: any
  onClose: () => void
  onUpdate: (updated: any) => void
  onConvert: (lead: any) => void
  converting: boolean
  isMobile: boolean
}

function LeadDrawer({ lead, onClose, onUpdate, onConvert, converting, isMobile }: LeadDrawerProps) {
  const [status, setStatus] = useState(lead.status)
  const [preferredDate, setPreferredDate] = useState(lead.preferred_date || '')
  const [preferredTime, setPreferredTime] = useState(lead.preferred_start_time || '')
  const [followUpNote, setFollowUpNote] = useState(lead.follow_up_note || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    const updates: any = {
      status,
      preferred_date: preferredDate || null,
      preferred_start_time: preferredTime || null,
      follow_up_note: followUpNote || null,
    }
    const { error } = await supabase.from('leads').update(updates).eq('id', lead.id)

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
    background: WHITE,
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

  const drawerWidth = isMobile ? '100vw' : '460px'

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
          width: drawerWidth,
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
            <div style={{ minWidth: 0 }}>
              <div style={{ ...TYPE.label, marginBottom: '6px' }}>Inbound call</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: TEXT, lineHeight: 1.2, marginBottom: '4px', letterSpacing: '-0.035em' }}>
                {lead.customer_name}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: TEXT3 }}>{lead.phone_number}</div>
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

          <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            <JobTypeBadge type={lead.job_type} />
            <StatusBadge status={status} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'grid', gap: '12px', background: BG }}>
          <div
            style={{
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
              <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT }}>Call summary</div>
            </div>
            <div style={{ padding: '14px 16px', ...TYPE.body, fontSize: '13px', lineHeight: 1.7 }}>
              {lead.issue_summary || 'No summary recorded.'}
            </div>
          </div>

          <div
            style={{
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
              <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT }}>Call details</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
              {[
                { label: 'Suburb', value: lead.suburb || '—' },
                { label: 'Address', value: lead.address || '—' },
                {
                  label: 'Received',
                  value: lead.created_at
                    ? new Date(lead.created_at).toLocaleString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—',
                },
                { label: 'Job type', value: lead.job_type?.replace('_', ' ') || '—' },
              ].map((item, index) => (
                <div
                  key={item.label}
                  style={{
                    padding: '12px 16px',
                    borderTop: index > (isMobile ? 0 : 1) ? `1px solid ${BORDER}` : 'none',
                    borderLeft: !isMobile && index % 2 === 1 ? `1px solid ${BORDER}` : 'none',
                  }}
                >
                  <div style={{ ...TYPE.label, marginBottom: '5px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT, textTransform: 'capitalize' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
              <span style={{ fontSize: '14px', fontWeight: 900, color: TEXT }}>Update this lead</span>
            </div>

            <div style={{ padding: '16px', display: 'grid', gap: '16px' }}>
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
                        border: status === key ? `1px solid ${TEAL}` : `1px solid ${BORDER}`,
                        background: status === key ? TEAL : WHITE,
                        color: status === key ? WHITE : TEXT2,
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: FONT,
                        textTransform: 'capitalize',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      {status === key && <IconCheck size={12} />}
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>Booking date</label>
                  <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Booking time</label>
                  <input type="time" value={preferredTime} onChange={e => setPreferredTime(e.target.value)} style={inputStyle} />
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
            <div
              style={{
                background: WHITE,
                border: `1px solid ${BORDER}`,
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
              }}
            >
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Previous note</div>
              </div>
              <div style={{ padding: '14px 16px', ...TYPE.body, fontSize: '12px', lineHeight: 1.7, color: TEXT3 }}>
                {lead.follow_up_note}
              </div>
            </div>
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
          <button
            onClick={save}
            disabled={saving}
            style={{
              height: '44px',
              borderRadius: '12px',
              border: 'none',
              background: saved ? TEAL_DARK : TEAL,
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
            {saved ? (
              <>
                <IconCheck size={16} /> Saved
              </>
            ) : saving ? (
              'Saving...'
            ) : (
              'Save changes'
            )}
          </button>

          {status === 'booked' && lead.status !== 'converted' && (
            <button
              onClick={() => onConvert(lead)}
              disabled={converting}
              style={{
                height: '44px',
                borderRadius: '12px',
                border: `1px solid ${TEAL_DARK}`,
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
            <div
              style={{
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
              }}
            >
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

export default function LeadsPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [converting, setConverting] = useState<string | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedLead, setSelectedLead] = useState<any | null>(null)

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('business_id')
        .eq('id', session.user.id)
        .single()

      if (!userData) {
        setLoading(false)
        return
      }

      setBusinessId(userData.business_id)

      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      setLeads(data || [])
      setLoading(false)
    }

    load()
  }, [router])

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = search
        ? `${l.customer_name || ''} ${l.phone_number || ''} ${l.suburb || ''} ${l.job_type || ''}`
            .toLowerCase()
            .includes(search.toLowerCase())
        : true
      const matchStatus = filterStatus === 'all' ? true : l.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [leads, search, filterStatus])

  const handleUpdate = useCallback((updated: any) => {
    setLeads(prev => prev.map(l => (l.id === updated.id ? updated : l)))
    setSelectedLead(updated)
  }, [])

  async function convertToJob(lead: any) {
    if (!businessId) return
    setConverting(lead.id)

    try {
      const { data: customer, error: custErr } = await supabase
        .from('customers')
        .insert([
          {
            business_id: businessId,
            first_name: lead.customer_name?.split(' ')[0] || lead.customer_name,
            last_name: lead.customer_name?.split(' ').slice(1).join(' ') || '',
            phone: lead.phone_number,
            address: lead.address,
            suburb: lead.suburb,
          },
        ])
        .select()
        .single()

      if (custErr) throw custErr

      const { error: jobErr } = await supabase.from('jobs').insert([
        {
          business_id: businessId,
          customer_id: customer.id,
          equipment_type: 'other',
          brand: 'TBC',
          install_date: lead.preferred_date || new Date().toISOString().split('T')[0],
          notes: `${lead.job_type} - ${lead.issue_summary}. Booked: ${lead.preferred_date} at ${lead.preferred_start_time}.`,
        },
      ])

      if (jobErr) throw jobErr

      await supabase.from('leads').update({ status: 'converted' }).eq('id', lead.id)

      const updated = { ...lead, status: 'converted' }
      setLeads(prev => prev.map(l => (l.id === lead.id ? updated : l)))
      setSelectedLead(updated)
    } catch (err) {
      console.error('Convert error:', err)
      alert('Failed to convert lead. Check console.')
    }

    setConverting(null)
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

  const totalLeads = leads.length
  const bookedCount = leads.filter(l => l.status === 'booked').length
  const convertedCount = leads.filter(l => l.status === 'converted').length
  const pendingCount = leads.filter(l => l.status === 'pending').length

  const currentLeads = leads.filter(l => inRange(l.created_at, startCurrent30, now)).length
  const prevLeads = leads.filter(l => inRange(l.created_at, startPrev30, startCurrent30)).length

  const currentBooked = leads.filter(
    l => l.status === 'booked' && inRange(l.created_at, startCurrent30, now)
  ).length
  const prevBooked = leads.filter(
    l => l.status === 'booked' && inRange(l.created_at, startPrev30, startCurrent30)
  ).length

  const currentConverted = leads.filter(
    l => l.status === 'converted' && inRange(l.created_at, startCurrent30, now)
  ).length
  const prevConverted = leads.filter(
    l => l.status === 'converted' && inRange(l.created_at, startPrev30, startCurrent30)
  ).length

  const leadsDelta = pctChange(currentLeads, prevLeads)
  const bookedDelta = pctChange(currentBooked, prevBooked)
  const convertedDelta = pctChange(currentConverted, prevConverted)

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
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

  const btnTeal: React.CSSProperties = {
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

  const btnMobileTeal: React.CSSProperties = {
    ...btnMobileSm,
    background: TEAL,
    border: `1px solid ${TEAL}`,
    color: WHITE,
  }

  const statChips = [
    {
      label: 'Leads',
      value: totalLeads,
      sub: `${leadsDelta >= 0 ? '+' : ''}${leadsDelta}% last 30 days`,
      onClick: () => setFilterStatus('all'),
    },
    {
      label: 'Booked',
      value: bookedCount,
      sub: `${bookedDelta >= 0 ? '+' : ''}${bookedDelta}% last 30 days`,
      onClick: () => setFilterStatus('booked'),
    },
    {
      label: 'Pending',
      value: pendingCount,
      sub: 'Need follow-up',
      onClick: () => setFilterStatus('pending'),
    },
    {
      label: 'Converted',
      value: convertedCount,
      sub: `${convertedDelta >= 0 ? '+' : ''}${convertedDelta}% last 30 days`,
      onClick: () => setFilterStatus('converted'),
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/leads" />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: TEXT3,
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Loading leads...
        </div>
      </div>
    )
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
      <Sidebar active="/dashboard/leads" />

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
                  {new Date().toLocaleDateString('en-AU', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
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
                  Leads
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => router.push('/dashboard/jobs')} style={btnMobileSm}>
                  <IconSpark size={12} /> Open Jobs
                </button>
                <button
                  onClick={() => {
                    setSearch('')
                    setFilterStatus('all')
                  }}
                  style={btnMobileTeal}
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
                    Leads
                  </h1>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => router.push('/dashboard/jobs')}
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
                    <IconSpark size={12} /> Open Jobs
                  </button>

                  <button
                    onClick={() => {
                      setSearch('')
                      setFilterStatus('all')
                    }}
                    style={btnTeal}
                    onMouseEnter={e => {
                      e.currentTarget.style.opacity = '0.82'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    Reset Filters
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

          <div style={{ padding: isMobile ? '0 12px' : 0 }}>
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
                      <span style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em' }}>Inbound calls</span>
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
                      Calls captured from Chloe, ready for follow-up and job conversion.
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
                      width: isMobile ? '100%' : '320px',
                      maxWidth: '100%',
                      position: 'relative',
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
                      <IconSearch size={15} />
                    </span>

                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by name, phone, suburb..."
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
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    style={{
                      height: '42px',
                      minWidth: isMobile ? '100%' : '190px',
                      width: isMobile ? '100%' : 'auto',
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
                    <option value="all">All</option>
                    <option value="booked">Booked</option>
                    <option value="pending">Pending</option>
                    <option value="incomplete">Incomplete</option>
                    <option value="converted">Converted</option>
                    <option value="wrong_number">Wrong number</option>
                  </select>
                </div>
              </div>

              {!isMobile && filtered.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr) minmax(0,1.15fr) minmax(0,1.45fr) 120px',
                    gap: '14px',
                    alignItems: 'center',
                    padding: '11px 20px',
                    borderBottom: `1px solid ${BORDER}`,
                    background: '#FCFCFD',
                  }}
                >
                  {['Lead', 'Suburb', 'Preferred booking', 'Call summary', 'Status'].map(label => (
                    <div key={label} style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {label}
                    </div>
                  ))}
                </div>
              )}

              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: '32px 18px',
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '13px',
                  }}
                >
                  No leads yet. Calls from Chloe will appear here.
                </div>
              ) : (
                filtered.map(lead => {
                  const preferredBooking = lead.preferred_date
                    ? `${lead.preferred_date}${lead.preferred_start_time ? ` at ${lead.preferred_start_time}` : ''}`
                    : 'Not set'

                  return (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      style={{
                        display: isMobile ? 'block' : 'grid',
                        gridTemplateColumns: isMobile ? undefined : 'minmax(0,1.35fr) minmax(0,1fr) minmax(0,1.15fr) minmax(0,1.45fr) 120px',
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
                            <IconPhone size={16} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                              <div
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 800,
                                  color: TEXT,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {lead.customer_name}
                              </div>
                              <StatusBadge status={lead.status} />
                            </div>

                            <div style={{ fontSize: '11px', color: TEXT3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                              {lead.phone_number || 'No phone saved'}
                            </div>

                            <div style={{ fontSize: '11px', color: TEXT3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '8px' }}>
                              {lead.suburb || 'No suburb saved'}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <JobTypeBadge type={lead.job_type} />
                              <span style={{ fontSize: '10px', fontWeight: 700, color: preferredBooking === 'Not set' ? TEXT3 : TEAL_DARK }}>
                                {preferredBooking === 'Not set' ? 'No booking set' : preferredBooking}
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
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 850,
                                  color: TEXT,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {lead.customer_name}
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: TEXT3,
                                  marginTop: '3px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {lead.phone_number || 'No phone saved'}
                              </div>
                              <div style={{ marginTop: '6px' }}>
                                <JobTypeBadge type={lead.job_type} />
                              </div>
                            </div>
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: 750,
                                color: TEXT2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {lead.suburb || 'Not provided'}
                            </div>
                            <div
                              style={{
                                fontSize: '11px',
                                color: TEXT3,
                                marginTop: '3px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {lead.address || 'No address saved'}
                            </div>
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: preferredBooking === 'Not set' ? TEXT3 : TEXT2 }}>{preferredBooking}</div>
                            <div style={{ fontSize: '11px', color: TEXT3, marginTop: '3px' }}>Preferred time</div>
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: TEXT3,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {lead.issue_summary || 'No summary recorded'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <StatusBadge status={lead.status} />
                            <span style={{ color: TEXT3, display: 'inline-flex', alignItems: 'center' }}>
                              <IconArrow size={12} />
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })
              )}
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