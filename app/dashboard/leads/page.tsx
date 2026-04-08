'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const RED = '#B91C1C'
const AMBER = '#92400E'
const BLUE = '#1E3A8A'
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
    function check() {
      setIsMobile(window.innerWidth < 768)
    }
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    booked: { bg: '#DCFCE7', color: '#166534', label: 'Booked' },
    pending: { bg: '#FEF3C7', color: '#78350F', label: 'Pending' },
    incomplete: { bg: '#F1F5F9', color: TEXT3, label: 'Incomplete' },
    wrong_number: { bg: '#FEE2E2', color: '#7F1D1D', label: 'Wrong number' },
    converted: { bg: '#DBEAFE', color: '#1E3A8A', label: 'Converted' },
  }

  const s = map[status] || { bg: '#F1F5F9', color: TEXT3, label: status }

  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: '6px 10px',
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
  )
}

function JobTypeBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    installation: { bg: '#EDE9FE', color: '#4C1D95' },
    service: { bg: '#E8F4F1', color: '#0A4F4C' },
    repair: { bg: '#FFE4E6', color: '#881337' },
    quote: { bg: '#FEF3C7', color: '#78350F' },
    site_visit: { bg: '#DBEAFE', color: '#1E3A8A' },
  }

  const s = map[type] || { bg: '#F1F5F9', color: TEXT3 }

  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: '6px 10px',
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 800,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
        display: 'inline-block',
        letterSpacing: '0.02em',
      }}
    >
      {type?.replace('_', ' ')}
    </span>
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
        ? `${l.customer_name} ${l.phone_number} ${l.suburb} ${l.job_type}`.toLowerCase().includes(search.toLowerCase())
        : true

      const matchStatus = filterStatus === 'all' ? true : l.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [leads, search, filterStatus])

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

      const { error: jobErr } = await supabase
        .from('jobs')
        .insert([
          {
            business_id: businessId,
            customer_id: customer.id,
            equipment_type: 'other',
            brand: 'TBC',
            install_date: lead.preferred_date || new Date().toISOString().split('T')[0],
            notes: `${lead.job_type} — ${lead.issue_summary}. Booked: ${lead.preferred_date} at ${lead.preferred_start_time}.`,
          },
        ])

      if (jobErr) throw jobErr

      await supabase.from('leads').update({ status: 'converted' }).eq('id', lead.id)

      setLeads(prev => prev.map(l => (l.id === lead.id ? { ...l, status: 'converted' } : l)))
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

  const shellCard: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
    overflow: 'hidden',
  }

  const panelCard: React.CSSProperties = {
    ...shellCard,
    padding: '16px',
  }

  const sectionLabel: React.CSSProperties = {
    ...TYPE.title,
    fontSize: '13px',
    fontWeight: 800,
    marginBottom: '12px',
  }

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
    boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
  }

  const iconWrap = (color: string): React.CSSProperties => ({
    width: '36px',
    height: '36px',
    borderRadius: '11px',
    background: '#F8FAFC',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${BORDER}`,
    flexShrink: 0,
  })

  const statuses = ['all', 'booked', 'pending', 'incomplete', 'converted', 'wrong_number']

  const overviewCards = [
    {
      label: 'Booked',
      value: leads.filter(l => l.status === 'booked').length,
      sub: 'Ready to convert',
      icon: <IconCalendar size={18} />,
      accent: '#166534',
      tag: 'Live pipeline',
    },
    {
      label: 'Pending',
      value: leads.filter(l => l.status === 'pending').length,
      sub: 'Need follow-up',
      icon: <IconPhone size={18} />,
      accent: AMBER,
      tag: 'Needs action',
    },
    {
      label: 'Converted',
      value: leads.filter(l => l.status === 'converted').length,
      sub: 'Moved into jobs',
      icon: <IconUsers size={18} />,
      accent: BLUE,
      tag: 'Completed flow',
    },
  ]

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
      <Sidebar active="/dashboard/leads" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: BG }}>
        <div
          style={{
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: BG,
            padding: isMobile ? '14px' : '16px',
            gap: '12px',
          }}
        >
          <div
            style={{
              ...shellCard,
              padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
              background: HEADER_BG,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.68)',
                  marginBottom: '6px',
                }}
              >
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
                Leads
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
                Track inbound calls from Chloe and move qualified bookings into live jobs.
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
                    boxShadow: '0 6px 14px rgba(31,158,148,0.20)',
                  }}
                >
                  <IconSpark size={16} />
                  Open jobs
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))',
              gap: '12px',
            }}
          >
            {overviewCards.map(item => (
              <div
                key={item.label}
                style={{
                  ...panelCard,
                  gridColumn: isMobile ? 'span 1' : 'span 4',
                  minHeight: 148,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '8px' }}>{item.tag}</div>
                    <div style={{ ...TYPE.title, fontSize: '14px', fontWeight: 800, marginBottom: '10px' }}>
                      {item.label}
                    </div>
                  </div>

                  <div style={iconWrap(item.accent)}>
                    {item.icon}
                  </div>
                </div>

                <div>
                  <div style={{ ...TYPE.valueLg, fontSize: '30px', color: item.accent }}>
                    {item.value}
                  </div>
                  <div style={{ ...TYPE.bodySm, marginTop: '7px' }}>
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))',
              gap: '12px',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                ...panelCard,
                gridColumn: isMobile ? 'span 1' : 'span 8',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '10px',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <div style={sectionLabel}>Inbound calls</div>
                  <div style={{ ...TYPE.bodySm }}>
                    Search, filter, and convert qualified leads into jobs.
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '999px',
                    background: '#F8FAFC',
                    border: `1px solid ${BORDER}`,
                    color: TEXT3,
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  <IconFilter size={14} />
                  {filtered.length} shown
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 320px) 1fr',
                  gap: '10px',
                  marginBottom: '14px',
                }}
              >
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, phone, suburb..."
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: `1px solid ${BORDER}`,
                    background: '#FCFCFD',
                    fontSize: '12px',
                    color: TEXT,
                    outline: 'none',
                    fontFamily: FONT,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                  }}
                />

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {statuses.map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      style={{
                        height: '36px',
                        padding: '0 14px',
                        borderRadius: '999px',
                        border: `1px solid ${filterStatus === s ? TEAL_DARK : BORDER}`,
                        background: filterStatus === s ? TEAL : WHITE,
                        color: filterStatus === s ? WHITE : TEXT2,
                        fontSize: '12px',
                        fontWeight: filterStatus === s ? 700 : 600,
                        cursor: 'pointer',
                        fontFamily: FONT,
                        textTransform: 'capitalize',
                        boxShadow: filterStatus === s ? '0 6px 14px rgba(31,158,148,0.16)' : 'none',
                      }}
                    >
                      {s === 'all' ? 'All' : s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
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
                  Loading...
                </div>
              ) : filtered.length === 0 ? (
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
                  No leads yet. Calls from Chloe will appear here.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {filtered.map(lead => {
                    const statusAccent =
                      lead.status === 'booked'
                        ? '#166534'
                        : lead.status === 'pending'
                        ? '#92400E'
                        : lead.status === 'converted'
                        ? '#1E3A8A'
                        : lead.status === 'wrong_number'
                        ? '#B91C1C'
                        : '#64748B'

                    return (
                      <div
                        key={lead.id}
                        style={{
                          borderRadius: '16px',
                          border: `1px solid ${BORDER}`,
                          background: WHITE,
                          boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '6px 1fr',
                            minHeight: isMobile ? 'auto' : '100%',
                          }}
                        >
                          {!isMobile && (
                            <div
                              style={{
                                background: statusAccent,
                              }}
                            />
                          )}

                          <div style={{ padding: '16px' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                flexDirection: isMobile ? 'column' : 'row',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${BORDER}`,
                                marginBottom: '14px',
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div style={{ ...TYPE.label, marginBottom: '6px', color: statusAccent }}>
                                  Inbound call
                                </div>
                                <div
                                  style={{
                                    fontSize: '15px',
                                    fontWeight: 800,
                                    color: TEXT,
                                    lineHeight: 1.2,
                                    marginBottom: '4px',
                                  }}
                                >
                                  {lead.customer_name}
                                </div>
                                <div style={{ ...TYPE.bodySm, fontSize: '12px', color: TEXT2 }}>
                                  {lead.phone_number}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <JobTypeBadge type={lead.job_type} />
                                <StatusBadge status={lead.status} />
                              </div>
                            </div>

                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))',
                                gap: '10px',
                                alignItems: 'stretch',
                              }}
                            >
                              <div
                                style={{
                                  gridColumn: isMobile ? 'span 1' : 'span 3',
                                  background: '#F8FAFC',
                                  border: `1px solid ${BORDER}`,
                                  borderRadius: '12px',
                                  padding: '12px',
                                }}
                              >
                                <div style={{ ...TYPE.label, marginBottom: '6px' }}>Suburb</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>
                                  {lead.suburb || 'No suburb'}
                                </div>
                              </div>

                              <div
                                style={{
                                  gridColumn: isMobile ? 'span 1' : 'span 3',
                                  background: '#F8FAFC',
                                  border: `1px solid ${BORDER}`,
                                  borderRadius: '12px',
                                  padding: '12px',
                                }}
                              >
                                <div style={{ ...TYPE.label, marginBottom: '6px' }}>Preferred date</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>
                                  {lead.preferred_date || 'No date'}
                                </div>
                              </div>

                              <div
                                style={{
                                  gridColumn: isMobile ? 'span 1' : 'span 3',
                                  background: '#F8FAFC',
                                  border: `1px solid ${BORDER}`,
                                  borderRadius: '12px',
                                  padding: '12px',
                                }}
                              >
                                <div style={{ ...TYPE.label, marginBottom: '6px' }}>Preferred time</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>
                                  {lead.preferred_start_time || 'No time'}
                                </div>
                              </div>

                              <div
                                style={{
                                  gridColumn: isMobile ? 'span 1' : 'span 3',
                                  display: 'flex',
                                  flexDirection: isMobile ? 'row' : 'column',
                                  alignItems: isMobile ? 'center' : 'stretch',
                                  gap: '8px',
                                  justifyContent: 'center',
                                }}
                              >
                                {lead.status === 'booked' && (
                                  <button
                                    onClick={() => convertToJob(lead)}
                                    disabled={converting === lead.id}
                                    style={{
                                      height: '40px',
                                      borderRadius: '10px',
                                      border: 'none',
                                      background: TEAL,
                                      color: WHITE,
                                      fontSize: '12px',
                                      fontWeight: 800,
                                      padding: '0 14px',
                                      cursor: 'pointer',
                                      fontFamily: FONT,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '7px',
                                      opacity: converting === lead.id ? 0.6 : 1,
                                      width: '100%',
                                      boxShadow: '0 6px 14px rgba(31,158,148,0.20)',
                                    }}
                                  >
                                    {converting === lead.id ? 'Converting...' : 'Convert to job'}
                                    <IconArrow size={14} />
                                  </button>
                                )}

                                {lead.status === 'converted' && (
                                  <span
                                    style={{
                                      height: '40px',
                                      borderRadius: '10px',
                                      border: `1px solid ${BORDER}`,
                                      background: '#F8FAFC',
                                      color: TEXT2,
                                      fontSize: '12px',
                                      fontWeight: 800,
                                      padding: '0 14px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '100%',
                                    }}
                                  >
                                    Converted
                                  </span>
                                )}
                              </div>
                            </div>

                            <div
                              style={{
                                marginTop: '14px',
                                background: '#FCFCFD',
                                border: `1px solid ${BORDER}`,
                                borderRadius: '12px',
                                padding: '13px 14px',
                              }}
                            >
                              <div style={{ ...TYPE.label, marginBottom: '6px' }}>Call summary</div>
                              <div style={{ ...TYPE.bodySm, fontSize: '12px', color: TEXT2, lineHeight: 1.7 }}>
                                {lead.issue_summary || 'No summary'}
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

            <div
              style={{
                gridColumn: isMobile ? 'span 1' : 'span 4',
                display: 'grid',
                gap: '12px',
              }}
            >
              <div style={panelCard}>
                <div style={sectionLabel}>Pipeline summary</div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  <div
                    style={{
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                      padding: '12px',
                    }}
                  >
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>Total leads</div>
                    <div style={{ ...TYPE.valueSm }}>{leads.length}</div>
                    <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>
                      All inbound leads in this workspace
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                      padding: '12px',
                    }}
                  >
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>Shown now</div>
                    <div style={{ ...TYPE.valueSm }}>{filtered.length}</div>
                    <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>
                      Based on your current search and filter
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                      padding: '12px',
                    }}
                  >
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>Booked to convert</div>
                    <div style={{ ...TYPE.valueSm }}>{leads.filter(l => l.status === 'booked').length}</div>
                    <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>
                      Ready to move into active jobs
                    </div>
                  </div>
                </div>
              </div>

              <div style={panelCard}>
                <div style={sectionLabel}>Actions</div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  <button
                    onClick={() => router.push('/dashboard/jobs')}
                    style={{
                      ...quickActionStyle,
                      width: '100%',
                      justifyContent: 'center',
                      background: TEAL,
                      color: '#FFFFFF',
                      border: 'none',
                      boxShadow: '0 6px 14px rgba(31,158,148,0.20)',
                    }}
                  >
                    <IconSpark size={16} />
                    Open jobs
                  </button>

                  <button
                    onClick={() => {
                      setSearch('')
                      setFilterStatus('all')
                    }}
                    style={{
                      ...quickActionStyle,
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              </div>

              <div style={panelCard}>
                <div style={sectionLabel}>Notes</div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {[
                    'Booked leads can be converted directly into jobs.',
                    'Converted leads stay visible for tracking history.',
                    'Search checks customer name, phone, suburb, and job type.',
                  ].map(item => (
                    <div
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        color: TEXT2,
                        fontSize: '12px',
                        fontWeight: 600,
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          marginTop: '5px',
                          borderRadius: '999px',
                          background: TEAL,
                          flexShrink: 0,
                        }}
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}