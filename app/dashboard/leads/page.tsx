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
  },
  valueMd: {
    fontSize: '20px',
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
        padding: '5px 9px',
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return
      setBusinessId(userData.business_id)

      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })

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
        .insert([{
          business_id: businessId,
          first_name: lead.customer_name?.split(' ')[0] || lead.customer_name,
          last_name: lead.customer_name?.split(' ').slice(1).join(' ') || '',
          phone: lead.phone_number,
          address: lead.address,
          suburb: lead.suburb,
        }])
        .select()
        .single()

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

      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'converted' } : l))
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

  const statuses = ['all', 'booked', 'pending', 'incomplete', 'converted', 'wrong_number']

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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', background: BG }}>
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
            padding: isMobile ? '14px' : '16px 24px 20px',
            background: BG,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
          }}
        >
          <div>
            <div style={sectionLabel}>{sectionDash}Overview</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(12, minmax(0,1fr))',
                gap: '10px',
              }}
            >
              {[
                {
                  label: 'Booked',
                  value: leads.filter(l => l.status === 'booked').length,
                  sub: 'Ready to convert',
                  icon: <IconCalendar size={17} />,
                  accent: '#166534',
                  span: 'span 4',
                },
                {
                  label: 'Pending',
                  value: leads.filter(l => l.status === 'pending').length,
                  sub: 'Need follow-up',
                  icon: <IconPhone size={17} />,
                  accent: AMBER,
                  span: 'span 4',
                },
                {
                  label: 'Converted',
                  value: leads.filter(l => l.status === 'converted').length,
                  sub: 'Moved into jobs',
                  icon: <IconUsers size={17} />,
                  accent: '#1E3A8A',
                  span: 'span 4',
                },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    ...shellCard,
                    padding: isMobile ? '12px' : '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    gridColumn: isMobile ? 'span 1' : item.span,
                    minHeight: '124px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div style={iconWrap(item.accent)}>
                      {item.icon}
                    </div>

                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: TEXT3,
                      }}
                    >
                      Live
                    </div>
                  </div>

                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>
                      {item.label}
                    </div>
                    <div style={{ ...TYPE.valueLg, fontSize: isMobile ? '23px' : '26px', color: item.accent, marginBottom: '5px' }}>
                      {item.value}
                    </div>
                    <div style={{ ...TYPE.body, fontSize: '11px' }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, suburb..."
              style={{
                width: '100%',
                maxWidth: '320px',
                height: '38px',
                padding: '0 12px',
                borderRadius: '10px',
                border: `1px solid ${BORDER}`,
                background: WHITE,
                fontSize: '12px',
                color: TEXT,
                outline: 'none',
                fontFamily: FONT,
              }}
            />

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    height: '34px',
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
                  }}
                >
                  {s === 'all' ? 'All' : s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...shellCard, padding: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexDirection: isMobile ? 'column' : 'row',
                marginBottom: '12px',
              }}
            >
              <div style={sectionLabel}>{sectionDash}Inbound calls</div>

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
                {filtered.length} shown
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
                      : TEXT3

                  return (
                    <div
                      key={lead.id}
                      style={{
                        borderRadius: '14px',
                        border: `1px solid ${BORDER}`,
                        background: WHITE,
                        overflow: 'hidden',
                        boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
                      }}
                    >
                      <div style={{ height: '3px', background: statusAccent }} />

                      <div
                        style={{
                          padding: '14px',
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.2fr) minmax(0,1fr) auto',
                          gap: '14px',
                          alignItems: 'start',
                        }}
                      >
                        <div
                          style={{
                            minWidth: 0,
                            padding: '12px',
                            borderRadius: '12px',
                            background: '#FCFCFD',
                            border: `1px solid ${BORDER}`,
                          }}
                        >
                          <div style={{ ...TYPE.label, marginBottom: '6px' }}>Caller</div>
                          <div style={{ ...TYPE.titleSm, fontSize: '13px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lead.customer_name}
                          </div>
                          <div style={{ ...TYPE.bodySm, fontSize: '12px', color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lead.phone_number}
                          </div>
                        </div>

                        <div
                          style={{
                            minWidth: 0,
                            padding: '12px',
                            borderRadius: '12px',
                            background: '#FCFCFD',
                            border: `1px solid ${BORDER}`,
                          }}
                        >
                          <div style={{ ...TYPE.label, marginBottom: '8px' }}>Call details</div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <JobTypeBadge type={lead.job_type} />
                            <StatusBadge status={lead.status} />
                          </div>

                          <div style={{ ...TYPE.bodySm, color: TEXT2, lineHeight: 1.6 }}>
                            <div><strong style={{ color: TEXT }}>Suburb:</strong> {lead.suburb || 'No suburb'}</div>
                            <div><strong style={{ color: TEXT }}>Date:</strong> {lead.preferred_date || 'No date'}</div>
                            <div><strong style={{ color: TEXT }}>Time:</strong> {lead.preferred_start_time || 'No time'}</div>
                          </div>
                        </div>

                        <div
                          style={{
                            justifySelf: isMobile ? 'stretch' : 'end',
                            display: 'flex',
                            flexDirection: isMobile ? 'row' : 'column',
                            alignItems: isMobile ? 'center' : 'stretch',
                            gap: '8px',
                            flexWrap: 'wrap',
                          }}
                        >
                          {lead.status === 'booked' && (
                            <button
                              onClick={() => convertToJob(lead)}
                              disabled={converting === lead.id}
                              style={{
                                height: '36px',
                                borderRadius: '10px',
                                border: 'none',
                                background: TEAL,
                                color: WHITE,
                                fontSize: '12px',
                                fontWeight: 700,
                                padding: '0 14px',
                                cursor: 'pointer',
                                fontFamily: FONT,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '7px',
                                opacity: converting === lead.id ? 0.6 : 1,
                                width: isMobile ? 'fit-content' : '170px',
                              }}
                            >
                              {converting === lead.id ? 'Converting...' : 'Convert to job'}
                              <IconArrow size={14} />
                            </button>
                          )}

                          {lead.status === 'converted' && (
                            <span
                              style={{
                                height: '36px',
                                borderRadius: '10px',
                                border: `1px solid ${BORDER}`,
                                background: '#F8FAFC',
                                color: TEXT2,
                                fontSize: '12px',
                                fontWeight: 700,
                                padding: '0 14px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: isMobile ? 'fit-content' : '170px',
                              }}
                            >
                              Converted
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            gridColumn: '1 / -1',
                            borderRadius: '12px',
                            background: '#F8FAFC',
                            border: `1px solid ${BORDER}`,
                            padding: '12px 14px',
                          }}
                        >
                          <div style={{ ...TYPE.label, marginBottom: '6px' }}>Call summary</div>
                          <div style={{ ...TYPE.bodySm, fontSize: '12px', color: TEXT2, lineHeight: 1.65 }}>
                            {lead.issue_summary || 'No summary'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}