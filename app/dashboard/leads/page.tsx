'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { AppIcon } from '@/components/AppIcon'
import { DataList, PersonCell, TitleCell, TextCell, StatusPill } from '@/components/DataList'

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
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
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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
  return <AppIcon name="call" size={size} />
}

function IconSpark({ size = 16 }: { size?: number }) {
  return <AppIcon name="sparkle" size={size} />
}

function IconArrow({ size = 15 }: { size?: number }) {
  return <AppIcon name="arrow-right" size={size} />
}

function IconFilter({ size = 15 }: { size?: number }) {
  return <AppIcon name="filter" size={size} />
}

function IconClose({ size = 18 }: { size?: number }) {
  return <AppIcon name="close" size={size} />
}

function IconEdit({ size = 15 }: { size?: number }) {
  return <AppIcon name="edit" size={size} />
}

function IconCheck({ size = 15 }: { size?: number }) {
  return <AppIcon name="tick" size={size} />
}

function IconSearch({ size = 16 }: { size?: number }) {
  return <AppIcon name="search" size={size} />
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

const LEAD_TONE: Record<string, 'success' | 'warn' | 'neutral' | 'danger' | 'brand'> = {
  booked: 'success',
  pending: 'warn',
  incomplete: 'neutral',
  wrong_number: 'danger',
  converted: 'brand',
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
        borderRadius: '8px',
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
        borderRadius: '8px',
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

        <div className="drawer-content" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'grid', gridAutoRows: 'max-content', alignContent: 'start', gap: '12px', background: BG }}>
          <div
            style={{
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
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
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
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
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
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
                        borderRadius: '8px',
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
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
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

  const statusTabs = [
    { value: 'all', label: 'All leads', count: leads.length },
    ...['pending', 'booked', 'converted', 'incomplete', 'wrong_number'].map(k => ({
      value: k,
      label: STATUS_CONFIG[k].label,
      count: leads.filter(l => l.status === k).length,
    })),
  ]

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
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }

  const btnOutline: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: TEXT2,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  }

  const btnPrimary: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    background: TEAL,
    color: WHITE,
    border: 'none',
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
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
            background: BG,
            borderBottom: `1px solid ${BORDER}`,
            padding: isMobile ? '14px 14px 12px' : '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <h1 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0 }}>Leads</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => router.push('/dashboard/customers')} style={btnOutline}>
              View customers
            </button>
            <button onClick={() => router.push('/dashboard/jobs')} style={btnPrimary}>
              Convert to job
            </button>
          </div>
        </div>

        <div className="page-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '12px' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '48px',
            background: BG,
          }}
        >
          <div
            style={{
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderTop: `2px solid ${TEAL}`,
              borderRadius: '14px',
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
                  padding: isMobile ? '10px 10px' : '12px 18px',
                  cursor: 'pointer',
                  borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = TEAL_LIGHT
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = WHITE
                }}
              >
                <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 800, color: TEXT2, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{chip.value}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT, marginTop: '3px', lineHeight: 1.2 }}>{chip.label}</div>
                {chip.sub && (
                  <div style={{ fontSize: '10px', fontWeight: 500, color: TEXT3, marginTop: '2px', lineHeight: 1.2 }}>{chip.sub}</div>
                )}
              </div>
            ))}
          </div>

          <DataList<any>
            title="Inbound calls"
            isMobile={isMobile}
            rows={filtered}
            rowKey={lead => lead.id}
            emptyText="No leads yet. Calls from Chloe will appear here."
            onRowClick={lead => setSelectedLead(lead)}
            rowActions={() => [{ label: 'View lead', onClick: lead => setSelectedLead(lead) }]}
            tabs={statusTabs}
            activeTab={filterStatus}
            onTabChange={setFilterStatus}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name, phone, suburb..."
            columns={[
              {
                key: 'lead',
                label: 'Lead',
                width: 'minmax(0,1.3fr)',
                render: lead => <PersonCell name={lead.customer_name || 'Unknown caller'} sub={lead.phone_number || 'No phone saved'} />,
              },
              {
                key: 'type',
                label: 'Job type',
                width: '110px',
                render: lead => (lead.job_type ? <JobTypeBadge type={lead.job_type} /> : <TextCell>—</TextCell>),
              },
              {
                key: 'suburb',
                label: 'Suburb',
                width: 'minmax(0,1fr)',
                hideOnMobile: true,
                render: lead => <TitleCell title={lead.suburb || 'Not provided'} sub={lead.address || 'No address saved'} />,
              },
              {
                key: 'booking',
                label: 'Preferred booking',
                width: 'minmax(0,1.1fr)',
                mobileLabel: 'Booking',
                render: lead => (
                  <TextCell strong={!!lead.preferred_date}>
                    {lead.preferred_date ? `${lead.preferred_date}${lead.preferred_start_time ? ` at ${lead.preferred_start_time}` : ''}` : 'Not set'}
                  </TextCell>
                ),
              },
              {
                key: 'summary',
                label: 'Call summary',
                width: 'minmax(0,1.4fr)',
                hideOnMobile: true,
                render: lead => <TextCell>{lead.issue_summary || 'No summary recorded'}</TextCell>,
              },
              {
                key: 'status',
                label: 'Status',
                width: '120px',
                render: lead => <StatusPill label={STATUS_CONFIG[lead.status]?.label || lead.status} tone={LEAD_TONE[lead.status] || 'neutral'} />,
              },
            ]}
          />
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