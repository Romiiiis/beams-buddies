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
  valueSm: {
    fontSize: '16px',
    fontWeight: 900,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
    lineHeight: 1,
  },
}

const avColors = [
  { bg: '#E8F4F1', color: '#0A4F4C' },
  { bg: '#DBEAFE', color: '#1E3A8A' },
  { bg: '#FEF3C7', color: '#78350F' },
  { bg: '#EDE9FE', color: '#4C1D95' },
  { bg: '#FFE4E6', color: '#881337' },
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

function DashboardImageIcon({
  src,
  alt,
  size = 28,
}: {
  src: string
  alt: string
  size?: number
}) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
  )
}

function IconCustomers({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_eb5f601865a645939154bbe679d8e2a0~mv2.png"
      alt="Customers"
      size={size}
    />
  )
}

function IconJobs({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_97fb2a3aacb64329967cc40ebc8e5d0e~mv2.png"
      alt="Jobs"
      size={size}
    />
  )
}

function IconService({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_d9f72d8508bd42149766cc5310f1880e~mv2.png"
      alt="Service"
      size={size}
    />
  )
}

function IconReports({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_bded5cf8a9bc45fd9ef7fff40d3ccbc8~mv2.png"
      alt="Reports"
      size={size}
    />
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

function IconSearch({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
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

export default function CustomersPage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [customers, setCustomers] = useState<any[]>([])
  const [reviewClicks, setReviewClicks] = useState<Record<string, number>>({})
  const [totalPlatforms, setTotalPlatforms] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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

      const [customersRes, clicksRes, settingsRes] = await Promise.all([
        supabase
          .from('customers')
          .select('*, jobs(id, brand, model, capacity_kw, next_service_date)')
          .eq('business_id', userData.business_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('review_clicks')
          .select('customer_id, platform')
          .eq('business_id', userData.business_id),
        supabase
          .from('business_settings')
          .select('google_review_url, facebook_review_url, custom_review_platforms')
          .eq('business_id', userData.business_id)
          .single(),
      ])

      setCustomers(customersRes.data || [])

      const uniqueClicks: Record<string, Set<string>> = {}
      for (const click of clicksRes.data || []) {
        if (!uniqueClicks[click.customer_id]) uniqueClicks[click.customer_id] = new Set()
        uniqueClicks[click.customer_id].add(click.platform)
      }

      const clicks: Record<string, number> = {}
      for (const [cid, platforms] of Object.entries(uniqueClicks)) {
        clicks[cid] = platforms.size
      }
      setReviewClicks(clicks)

      const s = settingsRes.data
      setTotalPlatforms(
        (s?.google_review_url ? 1 : 0) +
          (s?.facebook_review_url ? 1 : 0) +
          ((s?.custom_review_platforms || []).filter((p: any) => p.url).length)
      )

      setLoading(false)
    }

    load()
  }, [router])

  function getDays(d: string) {
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function statusPill(jobs: any[]) {
    if (!jobs?.length) return { label: 'No units', bg: '#F1F5F9', color: TEXT3 }
    const datedJobs = [...jobs]
      .filter(j => j?.next_service_date)
      .sort((a, b) => new Date(a.next_service_date).getTime() - new Date(b.next_service_date).getTime())

    const next = datedJobs[0]?.next_service_date || jobs[0]?.next_service_date
    if (!next) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }

    const days = getDays(next)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#DCFCE7', color: '#166534' }
  }

  const filtered = useMemo(() => {
    if (!search) return customers
    return customers.filter(c =>
      `${c.first_name || ''} ${c.last_name || ''} ${c.email || ''} ${c.phone || ''} ${c.suburb || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [customers, search])

  const stats = useMemo(() => {
    const totalCustomers = customers.length
    const totalUnits = customers.reduce((sum, c) => sum + (c.jobs?.length || 0), 0)

    const dueSoon = customers.filter(c => {
      const s = statusPill(c.jobs)
      return s.label === 'Due soon'
    }).length

    const overdue = customers.filter(c => {
      const s = statusPill(c.jobs)
      return s.label === 'Overdue'
    }).length

    const totalReviewClicks = Object.values(reviewClicks).reduce((sum, val) => sum + val, 0)

    return {
      totalCustomers,
      totalUnits,
      dueSoon,
      overdue,
      totalReviewClicks,
    }
  }, [customers, reviewClicks])

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
    width: '44px',
    height: '44px',
    borderRadius: '0px',
    background: 'transparent',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    flexShrink: 0,
    boxShadow: 'none',
  })

  const topCards = [
    {
      label: 'Customers',
      value: stats.totalCustomers.toLocaleString('en-AU'),
      sub: 'Stored in your CRM',
      icon: <IconCustomers size={28} />,
      accent: TEXT,
      tag: 'Directory total',
    },
    {
      label: 'Tracked units',
      value: stats.totalUnits.toLocaleString('en-AU'),
      sub: 'Linked to customer profiles',
      icon: <IconJobs size={28} />,
      accent: TEAL_DARK,
      tag: 'Equipment count',
    },
    {
      label: 'Due soon',
      value: stats.dueSoon.toLocaleString('en-AU'),
      sub: 'Customers needing attention soon',
      icon: <IconService size={28} />,
      accent: AMBER,
      tag: 'Service watch',
    },
    {
      label: 'Review clicks',
      value: stats.totalReviewClicks.toLocaleString('en-AU'),
      sub: totalPlatforms > 0 ? `Across ${totalPlatforms} active platform${totalPlatforms === 1 ? '' : 's'}` : 'No review platforms connected',
      icon: <IconReports size={28} />,
      accent: stats.totalReviewClicks > 0 ? TEAL_DARK : TEXT,
      tag: 'Engagement',
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/customers" />
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
          Loading customers...
        </div>
      </div>
    )
  }

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
                Customers
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
                View customer records, unit counts, service status, and review activity from one premium control centre.
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
                  Add job
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
            {topCards.map(item => (
              <div
                key={item.label}
                style={{
                  ...panelCard,
                  gridColumn: isMobile ? 'span 1' : 'span 3',
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

                  <div style={iconWrap(item.accent)}>{item.icon}</div>
                </div>

                <div>
                  <div style={{ ...TYPE.valueLg, fontSize: '30px', color: item.accent }}>{item.value}</div>
                  <div style={{ ...TYPE.bodySm, marginTop: '7px' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              ...panelCard,
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
                <div style={sectionLabel}>Customer directory</div>
                <div style={{ ...TYPE.bodySm }}>
                  Browse every customer profile with service status, linked units, and review engagement.
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
                    <IconSearch size={15} />
                  </span>

                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search customers..."
                    style={{
                      height: '40px',
                      width: '100%',
                      borderRadius: '11px',
                      border: `1px solid ${BORDER}`,
                      padding: '0 12px 0 38px',
                      fontSize: '12px',
                      background: WHITE,
                      color: TEXT,
                      fontFamily: FONT,
                      outline: 'none',
                      boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
                    }}
                  />
                </div>

                <div
                  style={{
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: `1px solid ${BORDER}`,
                    background: '#FFFFFF',
                    color: TEXT2,
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {filtered.length} total
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
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
                No matching customers.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {filtered.map((c, i) => {
                  const av = avColors[i % avColors.length]
                  const s = statusPill(c.jobs)
                  const clicks = reviewClicks[c.id] || 0

                  return (
                    <div
                      key={c.id}
                      onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                      style={{
                        borderRadius: '14px',
                        padding: isMobile ? '14px' : '14px 16px',
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        cursor: 'pointer',
                        display: 'grid',
                        gridTemplateColumns: isMobile
                          ? '1fr'
                          : 'minmax(0,1.3fr) minmax(0,0.8fr) minmax(0,0.9fr) auto',
                        gap: '12px',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '13px',
                            background: av.bg,
                            color: av.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {(c.first_name?.[0] || '') + (c.last_name?.[0] || '')}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              ...TYPE.titleSm,
                              fontSize: '13px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {c.first_name} {c.last_name}
                          </div>
                          <div
                            style={{
                              ...TYPE.bodySm,
                              marginTop: '3px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {c.suburb || c.address || 'No suburb'}
                          </div>
                        </div>
                      </div>

                      {!isMobile && (
                        <div style={{ minWidth: 0 }}>
                          <div style={{ ...TYPE.label, marginBottom: '4px' }}>Units</div>
                          <div style={{ ...TYPE.body, fontWeight: 700 }}>
                            {c.jobs?.length || 0} unit{c.jobs?.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      )}

                      {!isMobile && (
                        <div style={{ minWidth: 0 }}>
                          <div style={{ ...TYPE.label, marginBottom: '4px' }}>Review activity</div>
                          <div
                            style={{
                              ...TYPE.body,
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {totalPlatforms > 0
                              ? clicks > 0
                                ? `${clicks}/${totalPlatforms} platform clicks`
                                : 'No review clicks'
                              : 'No platforms connected'}
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          justifySelf: isMobile ? 'start' : 'end',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            background: '#F8FAFC',
                            color: TEXT3,
                            padding: '7px 10px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            border: `1px solid ${BORDER}`,
                            whiteSpace: 'nowrap',
                            display: isMobile ? 'inline-block' : 'none',
                          }}
                        >
                          {c.jobs?.length || 0} unit{c.jobs?.length !== 1 ? 's' : ''}
                        </span>

                        <span
                          style={{
                            background: s.bg,
                            color: s.color,
                            padding: '7px 10px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            display: 'inline-block',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {s.label}
                        </span>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 9px',
                            borderRadius: '999px',
                            background: '#F8FAFC',
                            border: `1px solid ${BORDER}`,
                            color: TEXT3,
                            fontSize: '11px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <IconArrow size={12} />
                          Open
                        </span>
                      </div>

                      {isMobile && (
                        <div style={{ ...TYPE.bodySm, paddingLeft: '56px', marginTop: '-2px' }}>
                          {totalPlatforms > 0
                            ? clicks > 0
                              ? `${clicks}/${totalPlatforms} review clicks`
                              : 'No review clicks'
                            : 'No review platforms connected'}
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
  )
}