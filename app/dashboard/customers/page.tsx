'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_LIGHT = '#E6F7F6'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
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

function parseDateLocal(dateStr?: string | null): Date | null {
  if (!dateStr) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) return null
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function isBetween(dateStr: string | null | undefined, start: Date, end: Date) {
  if (!dateStr) return false
  const d = parseDateLocal(dateStr)
  if (!d || isNaN(d.getTime())) return false
  return d >= start && d < end
}

function pctChange(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return 0
    return 100
  }
  return Math.round(((current - previous) / previous) * 100)
}

function formatDelta(n: number) {
  return `${n >= 0 ? '+' : ''}${n}%`
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

function IconTrendDown({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 17l-8-8-4 4-6-6"
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
  width = 58,
  height = 40,
}: {
  data: number[]
  color: string
  width?: number
  height?: number
}) {
  const safeData = data.length ? data : [0]
  const max = Math.max(...safeData, 1)
  const count = safeData.length
  const barW = Math.max(3, Math.floor((width - (count - 1) * 2) / count))

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {safeData.map((v, i) => {
        const h = Math.max(4, (v / max) * (height - 2))
        const x = i * (barW + 2)
        const opacity = count === 1 ? 1 : 0.3 + (i / Math.max(count - 1, 1)) * 0.7

        return (
          <rect
            key={i}
            x={x}
            y={height - h}
            width={barW}
            height={h}
            rx="3"
            fill={color}
            opacity={i === count - 1 ? 1 : opacity}
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

  function getDays(d?: string | null) {
    const today = startOfDay(new Date()).getTime()
    const target = parseDateLocal(d || '')
    if (!target) return 0
    return Math.floor((startOfDay(target).getTime() - today) / (1000 * 60 * 60 * 24))
  }

  function statusPill(jobs: any[]) {
    if (!jobs?.length) return { label: 'No units', bg: '#F1F5F9', color: TEXT3, border: BORDER }

    const datedJobs = [...jobs]
      .filter((j) => j?.next_service_date)
      .sort((a, b) => {
        const ad = parseDateLocal(a.next_service_date)?.getTime() || 0
        const bd = parseDateLocal(b.next_service_date)?.getTime() || 0
        return ad - bd
      })

    const next = datedJobs[0]?.next_service_date || jobs[0]?.next_service_date
    if (!next) return { label: 'No date', bg: '#F1F5F9', color: TEXT3, border: BORDER }

    const days = getDays(next)

    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' }
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
    const scheduled = customers.filter((c) => statusPill(c.jobs).label === 'Scheduled').length
    const totalReviewClicks = Object.values(reviewClicks).reduce((sum, val) => sum + val, 0)

    return { totalCustomers, totalUnits, dueSoon, overdue, scheduled, totalReviewClicks }
  }, [customers, reviewClicks])

  const sparkData = useMemo(() => {
    const base = Array(12).fill(0)
    customers.forEach((customer) => {
      if (!customer.created_at) return
      const d = parseDateLocal(customer.created_at)
      if (!d) return
      if (d.getFullYear() === new Date().getFullYear()) base[d.getMonth()] += 1
    })
    return base
  }, [customers])

  const engagedCustomers = useMemo(
    () => Object.values(reviewClicks).filter((v) => v > 0).length,
    [reviewClicks]
  )

  const healthyCount = Math.max(stats.totalCustomers - stats.overdue - stats.dueSoon, 0)

  const now = new Date()
  const todayStr = now.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const startCurrent30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  const startPrev30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60)

  const newCustomersCurrent = useMemo(
    () => customers.filter((c) => isBetween(c.created_at, startCurrentMonth, startNextMonth)).length,
    [customers]
  )
  const newCustomersPrev = useMemo(
    () => customers.filter((c) => isBetween(c.created_at, startPrevMonth, startCurrentMonth)).length,
    [customers]
  )
  const unitsCurrent = useMemo(
    () =>
      customers
        .filter((c) => isBetween(c.created_at, startCurrent30, now))
        .reduce((sum, c) => sum + (c.jobs?.length || 0), 0),
    [customers]
  )
  const unitsPrev = useMemo(
    () =>
      customers
        .filter((c) => isBetween(c.created_at, startPrev30, startCurrent30))
        .reduce((sum, c) => sum + (c.jobs?.length || 0), 0),
    [customers]
  )
  const dueSoonDelta = pctChange(
    stats.dueSoon,
    Math.max(
      customers.filter((c) => {
        const s = statusPill(c.jobs).label
        return s === 'Scheduled'
      }).length,
      1
    )
  )
  const reviewDelta = pctChange(
    stats.totalReviewClicks,
    Math.max(stats.totalReviewClicks - engagedCustomers, 0)
  )
  const customersDelta = pctChange(newCustomersCurrent, newCustomersPrev)
  const unitsDelta = pctChange(unitsCurrent, unitsPrev)

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
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }

  const cardP: React.CSSProperties = {
    ...card,
    padding: '20px',
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

  const btnDark: React.CSSProperties = {
    height: '34px',
    padding: '0 16px',
    border: `1px solid ${TEXT}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: WHITE,
    background: TEXT,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.12s',
  }

  const btnMobileSm: React.CSSProperties = {
    height: '36px',
    padding: '0 10px',
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

  const btnMobileDark: React.CSSProperties = {
    ...btnMobileSm,
    background: TEXT,
    border: `1px solid ${TEXT}`,
    color: WHITE,
  }

  const statCards = [
    {
      label: 'Customers',
      value: stats.totalCustomers.toLocaleString('en-AU'),
      delta: formatDelta(customersDelta),
      up: customersDelta >= 0,
      color: TEAL,
      sub: 'Stored in your CRM',
      onClick: () => router.push('/dashboard/customers'),
    },
    {
      label: 'Tracked Units',
      value: stats.totalUnits.toLocaleString('en-AU'),
      delta: formatDelta(unitsDelta),
      up: unitsDelta >= 0,
      color: '#43A047',
      sub: 'Linked to profiles',
      onClick: () => router.push('/dashboard/customers'),
    },
    {
      label: 'Due Soon',
      value: stats.dueSoon.toLocaleString('en-AU'),
      delta: formatDelta(dueSoonDelta),
      up: dueSoonDelta >= 0,
      color: '#FF7043',
      sub: 'Need attention soon',
      onClick: () => router.push('/dashboard/jobs'),
    },
    {
      label: 'Review Clicks',
      value: stats.totalReviewClicks.toLocaleString('en-AU'),
      delta: formatDelta(reviewDelta),
      up: reviewDelta >= 0,
      color: '#9C27B0',
      sub: totalPlatforms > 0 ? `${totalPlatforms} platform${totalPlatforms === 1 ? '' : 's'}` : 'No platforms',
      onClick: () => router.push('/dashboard/customers'),
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

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '12px' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '40px',
            background: BG,
          }}
        >
          {isMobile ? (
            <div style={{ margin: '-12px -12px 0', overflow: 'hidden', background: WHITE }}>
              <div
                style={{
                  background: WHITE,
                  padding: '16px 16px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ flexShrink: 0 }}>
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
                    Customers
                  </h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {stats.totalCustomers}
                    </div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>
                      Customers
                    </div>
                  </div>
                  <div style={{ width: 1, height: 30, background: BORDER }} />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {stats.totalUnits}
                    </div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>
                      Units
                    </div>
                  </div>
                  <div style={{ width: 1, height: 30, background: BORDER }} />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {stats.overdue}
                    </div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>
                      Overdue
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', gap: '8px', padding: '0 16px 16px' }}>
                  <button onClick={() => router.push('/dashboard/jobs')} style={btnMobileSm}>
                    <IconSpark size={12} /> Add Job
                  </button>
                  <button onClick={() => router.push('/dashboard/customers')} style={btnMobileSm}>
                    <IconSearch size={12} /> Search
                  </button>
                  <button onClick={() => router.push('/dashboard/customers')} style={btnMobileDark}>
                    View Customers
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', gap: 0 }}>
                <div style={{ width: 4, background: TEAL, alignSelf: 'stretch', borderRadius: 0, flexShrink: 0, marginRight: 20 }} />
                <div style={{ flexShrink: 0 }}>
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
                    Customers
                  </h1>
                </div>

                <div style={{ width: 1, background: BORDER, alignSelf: 'stretch', margin: '0 22px', flexShrink: 0 }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center', padding: '0 18px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {stats.totalCustomers}
                    </div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '3px' }}>
                      Customers
                    </div>
                  </div>
                  <div style={{ width: 1, height: 28, background: BORDER, flexShrink: 0 }} />
                  <div style={{ textAlign: 'center', padding: '0 18px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {stats.totalUnits}
                    </div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '3px' }}>
                      Units
                    </div>
                  </div>
                  <div style={{ width: 1, height: 28, background: BORDER, flexShrink: 0 }} />
                  <div style={{ textAlign: 'center', padding: '0 18px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {stats.overdue}
                    </div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '3px' }}>
                      Overdue
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    onClick={() => router.push('/dashboard/jobs')}
                    style={btnOutline}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = TEXT
                      e.currentTarget.style.color = TEXT
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = BORDER
                      e.currentTarget.style.color = TEXT2
                    }}
                  >
                    <IconSpark size={12} /> Add Job
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/customers')}
                    style={btnOutline}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = TEXT
                      e.currentTarget.style.color = TEXT
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = BORDER
                      e.currentTarget.style.color = TEXT2
                    }}
                  >
                    <IconSearch size={12} /> Search
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/customers')}
                    style={btnDark}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.82'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    View Customers
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            {statCards.map((sc, idx) => (
              <div
                key={sc.label}
                onClick={sc.onClick}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '14px',
                  padding: '18px 20px 0',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: TEXT3 }}>{sc.label}</span>
                  <span style={{ color: TEXT3, opacity: 0.45 }}>
                    <IconInfo size={13} />
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                      {sc.value}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          padding: '2px 7px',
                          borderRadius: '12px',
                          background: sc.up ? '#E6F7F6' : '#FFF0EE',
                          color: sc.up ? TEAL_DARK : '#C0392B',
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        {sc.up ? <IconTrendUp size={9} /> : <IconTrendDown size={9} />}
                        {sc.delta}
                      </span>
                      <span style={{ fontSize: '10px', color: TEXT3, fontWeight: 500 }}>vs prev</span>
                    </div>
                  </div>

                  <SparkBars
                    data={sparkData.slice(Math.max(0, idx * 2), Math.max(0, idx * 2) + 8).filter((n) => typeof n === 'number').length
                      ? sparkData.slice(Math.max(0, idx * 2), Math.max(0, idx * 2) + 8)
                      : sparkData.slice(-8)}
                    color={sc.color}
                    width={58}
                    height={40}
                  />
                </div>

                <div
                  style={{
                    borderTop: `1px solid ${BORDER}`,
                    marginTop: '14px',
                    padding: '10px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: TEXT3,
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>{sc.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 300px',
              gap: '16px',
              alignItems: 'start',
            }}
          >
            <div style={card}>
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Customer Directory</span>
                    <span style={{ color: TEXT3, opacity: 0.5 }}>
                      <IconInfo size={13} />
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: isMobile ? '100%' : 'auto',
                    flexWrap: 'wrap',
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {filtered.length}
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '1px' }}>Shown</div>
                    </div>
                    <div style={{ width: 1, height: 28, background: BORDER }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {engagedCustomers}
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '1px' }}>Engaged</div>
                    </div>
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
                    .sort((a: any, b: any) => {
                      const ad = parseDateLocal(a.next_service_date)?.getTime() || 0
                      const bd = parseDateLocal(b.next_service_date)?.getTime() || 0
                      return ad - bd
                    })[0]

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
                                  ? parseDateLocal(nextJob.next_service_date)?.toLocaleDateString('en-AU', {
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
                              ? parseDateLocal(nextJob.next_service_date)?.toLocaleDateString('en-AU', {
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={card}>
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: `1px solid ${BORDER}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Service Status</span>
                    <span style={{ color: TEXT3, opacity: 0.5 }}>
                      <IconInfo size={13} />
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

                <div style={{ padding: '18px 20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {stats.overdue > 0 ? stats.overdue : healthyCount}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          padding: '2px 7px',
                          borderRadius: '12px',
                          background: stats.overdue > 0 ? '#FEE2E2' : '#E6F7F6',
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
                      { label: 'Scheduled', val: stats.scheduled, bg: '#F7FCFA', border: '#BFE7E3' },
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
              </div>

              <div style={card}>
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: `1px solid ${BORDER}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>Review Stats</span>
                    <span style={{ color: TEXT3, opacity: 0.5 }}>
                      <IconInfo size={13} />
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

                <div style={{ padding: '18px 20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {stats.totalReviewClicks.toLocaleString('en-AU')}
                    </div>
                    <div style={{ fontSize: '10px', color: TEXT3, marginTop: '4px' }}>
                      total clicks across customer profiles
                    </div>
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
              </div>

              <div style={cardP}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
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