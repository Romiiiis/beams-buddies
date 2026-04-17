'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_LIGHT = '#E6F7F6'
const AMBER_BG = '#FEF3C7'
const AMBER_TEXT = '#92400E'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const BG = '#F4F6F9'
const WHITE = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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
function IconExternalLink({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 17L17 7M17 7H7M17 7v10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
function IconInfo({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.9" />
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function IconTrendUp({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 7l-8 8-4-4-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SparkBars({
  data,
  color,
  width = 52,
  height = 34,
}: {
  data: number[]
  color: string
  width?: number
  height?: number
}) {
  const max = Math.max(...data, 1)
  const barW = Math.floor(width / data.length) - 2

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {data.map((v, i) => {
        const h = Math.max(3, (v / max) * (height - 4))
        const x = i * (barW + 2)
        return (
          <rect
            key={i}
            x={x}
            y={height - h}
            width={barW}
            height={h}
            rx="2"
            fill={color}
            opacity={i === data.length - 1 ? 1 : 0.35 + (i / data.length) * 0.55}
          />
        )
      })}
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
          .select('*, jobs(id, brand, model, capacity_kw, next_service_date, created_at)')
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
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const target = new Date(d)
    target.setHours(0, 0, 0, 0)

    return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  function statusPill(jobs: any[]) {
    if (!jobs?.length) return { label: 'No units', bg: '#F1F5F9', color: TEXT3, border: BORDER }

    const datedJobs = [...jobs]
      .filter((j) => j?.next_service_date)
      .sort(
        (a, b) =>
          new Date(a.next_service_date).getTime() - new Date(b.next_service_date).getTime()
      )

    const next = datedJobs[0]?.next_service_date || jobs[0]?.next_service_date

    if (!next) return { label: 'No date', bg: '#F1F5F9', color: TEXT3, border: BORDER }

    const days = getDays(next)

    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' }
    if (days <= 30) return { label: 'Due soon', bg: AMBER_BG, color: AMBER_TEXT, border: '#FDE68A' }
    if (days <= 90) return { label: 'Scheduled', bg: TEAL_LIGHT, color: TEAL_DARK, border: '#BFE7E3' }

    return { label: 'Good', bg: '#F1F5F9', color: TEXT3, border: BORDER }
  }

  const filtered = useMemo(() => {
    if (!search) return customers
    return customers.filter((c) =>
      `${c.first_name || ''} ${c.last_name || ''} ${c.email || ''} ${c.phone || ''} ${c.suburb || ''} ${c.address || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [customers, search])

  const stats = useMemo(() => {
    const totalCustomers = customers.length
    const totalUnits = customers.reduce((sum, c) => sum + (c.jobs?.length || 0), 0)
    const dueSoon = customers.filter((c) => statusPill(c.jobs).label === 'Due soon').length
    const overdue = customers.filter((c) => statusPill(c.jobs).label === 'Overdue').length
    const totalReviewClicks = Object.values(reviewClicks).reduce((sum, val) => sum + val, 0)

    return { totalCustomers, totalUnits, dueSoon, overdue, totalReviewClicks }
  }, [customers, reviewClicks])

  const sparkData = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0, 0]
    customers.forEach((customer) => {
      const createdAt = new Date(customer.created_at || Date.now())
      const monthIndex = createdAt.getMonth()
      buckets[monthIndex % 6] += 1
    })
    return buckets.some((v) => v > 0) ? buckets : [1, 2, 2, 3, 4, 3]
  }, [customers])

  const engagedCustomers = useMemo(
    () => Object.values(reviewClicks).filter((v) => v > 0).length,
    [reviewClicks]
  )

  const healthyCount = Math.max(stats.totalCustomers - stats.overdue - stats.dueSoon, 0)

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const avColors = [
    { bg: '#E8F4F1', color: '#0A4F4C' },
    { bg: '#EEF2F6', color: '#334155' },
    { bg: '#E6F7F6', color: '#177A72' },
    { bg: '#F1F5F9', color: '#475569' },
    { bg: '#E8F4F1', color: '#1F9E94' },
  ]

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    overflow: 'hidden',
  }

  const cardP: React.CSSProperties = {
    ...card,
    padding: '20px',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '18px 18px 16px',
  }

  const statCardBase: React.CSSProperties = {
    ...card,
    padding: '18px 20px 14px',
    cursor: 'default',
    minHeight: isMobile ? 132 : 148,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }

  const statCards = [
    {
      label: 'Customers',
      value: stats.totalCustomers.toLocaleString('en-AU'),
      delta: '+8%',
      sub: 'Stored in your CRM',
      sparkColor: TEAL,
    },
    {
      label: 'Tracked Units',
      value: stats.totalUnits.toLocaleString('en-AU'),
      delta: '+6%',
      sub: 'Linked to profiles',
      sparkColor: '#43A047',
    },
    {
      label: 'Due Soon',
      value: stats.dueSoon.toLocaleString('en-AU'),
      delta: '+4%',
      sub: 'Need attention soon',
      sparkColor: '#FF7043',
    },
    {
      label: 'Review Clicks',
      value: stats.totalReviewClicks.toLocaleString('en-AU'),
      delta: engagedCustomers > 0 ? '+11%' : '+0%',
      sub: totalPlatforms > 0 ? `${totalPlatforms} platform${totalPlatforms === 1 ? '' : 's'}` : 'No platforms',
      sparkColor: '#9C27B0',
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
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
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard/customers" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            padding: isMobile ? '14px' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
          }}
        >
          <div
            style={{
              background: HEADER_BG,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: isMobile ? 0 : '16px',
              padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
              ...(isMobile ? { marginLeft: '-14px', marginRight: '-14px' } : {}),
            }}
          >
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
                fontSize: isMobile ? '26px' : '34px',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                fontWeight: 900,
                color: WHITE,
                marginBottom: '8px',
              }}
            >
              Customers
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
              View customer records, unit counts, service status, and review activity from one control centre.
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/dashboard/jobs')}
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
                <IconSpark size={14} /> Add job
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            {statCards.map((sc) => (
              <div key={sc.label} style={statCardBase}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: TEXT3 }}>{sc.label}</span>
                  <span style={{ color: TEXT3, opacity: 0.5 }}>
                    <IconInfo size={12} />
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: isMobile ? '22px' : '24px',
                        fontWeight: 900,
                        color: TEXT,
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                      }}
                    >
                      {sc.value}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          padding: '2px 6px',
                          borderRadius: '12px',
                          background: TEAL_LIGHT,
                          color: TEAL_DARK,
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        <IconTrendUp size={9} />
                        {sc.delta}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: 500, color: TEXT3 }}>
                        vs last month
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SparkBars data={sparkData} color={sc.sparkColor} width={52} height={34} />
                  </div>
                </div>

                <div
                  style={{
                    borderTop: `1px solid ${BORDER}`,
                    paddingTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>{sc.sub}</span>
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
                  padding: '16px 20px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Customer Directory</span>
                    <span style={{ color: TEXT3, opacity: 0.5 }}>
                      <IconInfo size={13} />
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>
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
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search customers..."
                      style={{
                        height: '40px',
                        width: '100%',
                        borderRadius: '10px',
                        border: `1px solid ${BORDER}`,
                        padding: '0 12px 0 38px',
                        fontSize: '12px',
                        background: WHITE,
                        color: TEXT,
                        fontFamily: FONT,
                        outline: 'none',
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
                    }}
                  >
                    {filtered.length} total
                  </div>
                </div>
              </div>

              {!isMobile && filtered.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1.8fr) 90px 130px minmax(0,1.2fr) 92px 24px',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '10px 20px',
                    borderBottom: `1px solid ${BORDER}`,
                    background: '#FCFCFD',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Customer
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Units
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Next service
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Review activity
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Status
                  </div>
                  <div />
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
                  No matching customers.
                </div>
              ) : (
                filtered.map((c, i) => {
                  const av = avColors[i % avColors.length]
                  const s = statusPill(c.jobs)
                  const clicks = reviewClicks[c.id] || 0
                  const nextJob = [...(c.jobs || [])]
                    .filter((j: any) => j?.next_service_date)
                    .sort(
                      (a: any, b: any) =>
                        new Date(a.next_service_date).getTime() -
                        new Date(b.next_service_date).getTime()
                    )[0]

                  return (
                    <div
                      key={c.id}
                      onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile
                          ? '1fr'
                          : 'minmax(0,1.8fr) 90px 130px minmax(0,1.2fr) 92px 24px',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '14px 20px',
                        borderBottom: `1px solid ${BORDER}`,
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = WHITE)}
                    >
                      {isMobile ? (
                        <div style={{ display: 'grid', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: '11px',
                                background: av.bg,
                                color: av.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {(c.first_name?.[0] || '') + (c.last_name?.[0] || '')}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  color: TEXT,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {c.first_name} {c.last_name}
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: TEXT3,
                                  marginTop: '2px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {c.suburb || c.address || 'No suburb'}
                              </div>
                            </div>
                            <span style={{ color: TEXT3, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                              <IconArrow size={12} />
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div
                              style={{
                                padding: '10px 11px',
                                borderRadius: '12px',
                                border: `1px solid ${BORDER}`,
                                background: '#FCFCFD',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  color: TEXT3,
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                  marginBottom: '4px',
                                }}
                              >
                                Units
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>
                                {c.jobs?.length || 0} unit{c.jobs?.length !== 1 ? 's' : ''}
                              </div>
                            </div>

                            <div
                              style={{
                                padding: '10px 11px',
                                borderRadius: '12px',
                                border: `1px solid ${BORDER}`,
                                background: '#FCFCFD',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  color: TEXT3,
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                  marginBottom: '4px',
                                }}
                              >
                                Next service
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>
                                {nextJob?.next_service_date
                                  ? new Date(nextJob.next_service_date).toLocaleDateString('en-AU', {
                                      day: 'numeric',
                                      month: 'short',
                                    })
                                  : 'Not set'}
                              </div>
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
                            <div style={{ fontSize: '11px', color: TEXT3 }}>
                              {totalPlatforms > 0
                                ? clicks > 0
                                  ? `${clicks}/${totalPlatforms} review clicks`
                                  : 'No review clicks'
                                : 'No review platforms connected'}
                            </div>
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
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: '10px',
                                background: av.bg,
                                color: av.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {(c.first_name?.[0] || '') + (c.last_name?.[0] || '')}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  color: TEXT,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {c.first_name} {c.last_name}
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: TEXT3,
                                  marginTop: '2px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {c.suburb || c.address || 'No suburb'}
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>
                            {c.jobs?.length || 0}
                          </div>

                          <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>
                            {nextJob?.next_service_date
                              ? new Date(nextJob.next_service_date).toLocaleDateString('en-AU', {
                                  day: 'numeric',
                                  month: 'short',
                                })
                              : 'Not set'}
                          </div>

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
                            {totalPlatforms > 0
                              ? clicks > 0
                                ? `${clicks}/${totalPlatforms} platform clicks`
                                : 'No review clicks'
                              : 'No platforms connected'}
                          </div>

                          <div>
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
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              {s.label}
                            </span>
                          </div>

                          <div
                            style={{
                              color: TEXT3,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <IconArrow size={12} />
                          </div>
                        </>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={sideCard}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Service Status</span>
                    <span style={{ color: TEXT3, opacity: 0.5 }}>
                      <IconInfo size={12} />
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/jobs')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: TEXT3,
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 900,
                      color: TEXT,
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                    }}
                  >
                    {stats.overdue > 0 ? stats.overdue : healthyCount}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        background: stats.overdue > 0 ? '#FEE2E2' : TEAL_LIGHT,
                        color: stats.overdue > 0 ? '#991B1B' : TEAL_DARK,
                        fontSize: '10px',
                        fontWeight: 800,
                      }}
                    >
                      <IconTrendUp size={9} />
                      {stats.overdue > 0 ? 'Needs review' : 'Healthy base'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Overdue', val: stats.overdue, bg: '#FFF7F7', border: '#FECACA' },
                    { label: 'Due soon', val: stats.dueSoon, bg: '#FFFBF2', border: '#FDE68A' },
                    { label: 'Healthy', val: healthyCount, bg: '#F7FCFA', border: '#BFE7E3' },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: row.bg,
                        border: `1px solid ${row.border}`,
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: TEXT2 }}>{row.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: TEXT }}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={sideCard}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Review Stats</span>
                    <span style={{ color: TEXT3, opacity: 0.5 }}>
                      <IconInfo size={12} />
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/customers')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: TEXT3,
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 900,
                      color: TEXT,
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                    }}
                  >
                    {stats.totalReviewClicks.toLocaleString('en-AU')}
                  </div>
                  <div style={{ fontSize: '10px', color: TEXT3, marginTop: '4px' }}>total clicks across customer profiles</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#FCFCFD',
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: TEXT3,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                      }}
                    >
                      Active platforms
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: TEXT }}>{totalPlatforms}</div>
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#FAFCFB',
                      border: '1px solid #D9ECE6',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: TEXT3,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                      }}
                    >
                      Customers engaged
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: TEXT }}>{engagedCustomers}</div>
                  </div>
                </div>
              </div>

              <div style={cardP}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '12px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, color: TEXT }}>Quick Actions</span>
                  <span style={{ color: TEXT3, opacity: 0.5 }}>
                    <IconInfo size={12} />
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => router.push('/dashboard/jobs')}
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
                    Add job
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/customers')}
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
                    View customers
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}