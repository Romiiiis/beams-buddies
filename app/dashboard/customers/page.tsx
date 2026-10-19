'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { AppIcon } from '@/components/AppIcon'
import { DataList, PersonCell, TitleCell, TextCell, StatusPill } from '@/components/DataList'

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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
  return <AppIcon name="sparkle" size={size} />
}

function IconPlus({ size = 13 }: { size?: number }) {
  return <AppIcon name="add" size={size} />
}

function IconSearch({ size = 16 }: { size?: number }) {
  return <AppIcon name="search" size={size} />
}

function IconArrow({ size = 15 }: { size?: number }) {
  return <AppIcon name="arrow-right" size={size} />
}

function IconTrendUp({ size = 11 }: { size?: number }) {
  return <AppIcon name="trend-up" size={size} />
}

function IconTrendDown({ size = 11 }: { size?: number }) {
  return <AppIcon name="trend-down" size={size} />
}

export default function CustomersPage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [customers, setCustomers] = useState<any[]>([])
  const [reviewClicks, setReviewClicks] = useState<Record<string, number>>({})
  const [totalPlatforms, setTotalPlatforms] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState('all')
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', phone: '', email: '' })
  const [addSaving, setAddSaving] = useState(false)

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
    if (!jobs?.length) {
      return { label: 'No jobs', bg: '#F1F5F9', color: TEXT3, border: BORDER }
    }

    const datedJobs = [...jobs]
      .filter((j) => j?.next_service_date)
      .sort((a, b) => {
        const ad = parseDateLocal(a.next_service_date)?.getTime() || 0
        const bd = parseDateLocal(b.next_service_date)?.getTime() || 0
        return ad - bd
      })

    const next = datedJobs[0]?.next_service_date || jobs[0]?.next_service_date

    if (!next) {
      return { label: 'No date', bg: '#F1F5F9', color: TEXT3, border: BORDER }
    }

    const days = getDays(next)

    if (days < 0) {
      return { label: 'Overdue', bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' }
    }

    if (days <= 30) {
      return { label: 'Due soon', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' }
    }

    if (days <= 90) {
      return { label: 'Scheduled', bg: TEAL_LIGHT, color: TEAL_DARK, border: '#BFE7E3' }
    }

    return { label: 'Good', bg: '#F1F5F9', color: TEXT3, border: BORDER }
  }

  const STATUS_TONE: Record<string, 'danger' | 'warn' | 'brand' | 'success' | 'neutral'> = {
    Overdue: 'danger',
    'Due soon': 'warn',
    Scheduled: 'brand',
    Good: 'success',
  }

  function nextServiceLabel(jobs: any[]) {
    const next = [...(jobs || [])]
      .filter((j: any) => j?.next_service_date)
      .sort((a: any, b: any) => (parseDateLocal(a.next_service_date)?.getTime() || 0) - (parseDateLocal(b.next_service_date)?.getTime() || 0))[0]
    if (!next) return 'Not set'
    return parseDateLocal(next.next_service_date)?.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) || 'Not set'
  }

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (statusTab !== 'all' && statusPill(c.jobs).label !== statusTab) return false
      if (!search) return true
      return `${c.first_name || ''} ${c.last_name || ''} ${c.email || ''} ${c.phone || ''} ${c.suburb || ''} ${c.address || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    })
  }, [customers, search, statusTab])

  const statusTabs = ['Overdue', 'Due soon', 'Scheduled', 'Good'].reduce(
    (tabs, label) => [...tabs, { value: label, label, count: customers.filter((c) => statusPill(c.jobs).label === label).length }],
    [{ value: 'all', label: 'All customers', count: customers.length }] as { value: string; label: string; count: number }[]
  )

  const stats = useMemo(() => {
    const totalCustomers = customers.length
    const totalUnits = customers.reduce((sum, c) => sum + (c.jobs?.length || 0), 0)
    const dueSoon = customers.filter((c) => statusPill(c.jobs).label === 'Due soon').length
    const overdue = customers.filter((c) => statusPill(c.jobs).label === 'Overdue').length
    const totalReviewClicks = Object.values(reviewClicks).reduce((sum, val) => sum + val, 0)

    return { totalCustomers, totalUnits, dueSoon, overdue, totalReviewClicks }
  }, [customers, reviewClicks])

  const engagedCustomers = useMemo(
    () => Object.values(reviewClicks).filter((v) => v > 0).length,
    [reviewClicks]
  )

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

  const customersDelta = pctChange(newCustomersCurrent, newCustomersPrev)
  const unitsDelta = pctChange(unitsCurrent, unitsPrev)
  const dueSoonDelta = pctChange(stats.dueSoon, Math.max(stats.totalCustomers - stats.dueSoon, 1))
  const reviewDelta = pctChange(stats.totalReviewClicks, Math.max(stats.totalReviewClicks - engagedCustomers, 0))

  const statChips = [
    {
      label: 'Total Customers',
      value: stats.totalCustomers,
      sub: 'in your CRM',
      onClick: () => router.push('/dashboard/customers'),
    },
    {
      label: 'Total Jobs',
      value: stats.totalUnits,
      sub: 'linked to profiles',
      onClick: () => router.push('/dashboard/customers'),
    },
    {
      label: 'Due Soon',
      value: stats.dueSoon,
      sub: 'need attention',
      onClick: () => router.push('/dashboard/jobs'),
    },
    {
      label: 'Review Clicks',
      value: stats.totalReviewClicks,
      sub:
        totalPlatforms > 0
          ? `${totalPlatforms} platform${totalPlatforms === 1 ? '' : 's'}`
          : 'No platforms',
      onClick: () => router.push('/dashboard/customers'),
    },
  ]

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
  }

  const btnTeal: React.CSSProperties = {
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
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  }

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
    <>
    <div style={{ display: 'flex', background: BG, minHeight: '100vh', fontFamily: FONT }}>
      <Sidebar active="/dashboard/customers" />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Unified sticky page header */}
        <div
          style={{
            background: BG,
            borderBottom: `1px solid ${BORDER}`,
            padding: isMobile ? '14px 14px 12px' : '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            gap: '12px',
          }}
        >
          <h1 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0 }}>
            Customers
          </h1>
        </div>

        {/* Scrollable content */}
        <div className="page-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '12px 14px' : '16px 24px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '48px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: BG,
          }}
        >
          {/* Connected stat chips bar */}
          <div
            style={{
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderTop: `2px solid ${TEAL}`,
              borderRadius: '14px',
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              overflow: 'hidden',
            }}
          >
            {statChips.map((chip, i) => (
              <div
                key={chip.label}
                onClick={chip.onClick}
                style={{
                  padding: isMobile ? '10px 10px' : '12px 18px',
                  cursor: 'pointer',
                  borderLeft: (isMobile ? i % 2 === 1 : i > 0) ? `1px solid ${BORDER}` : 'none',
                  borderTop: isMobile && i >= 2 ? `1px solid ${BORDER}` : 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = TEAL_LIGHT
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = WHITE
                }}
              >
                <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 800, color: TEXT2, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {chip.value}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT, marginTop: '3px', lineHeight: 1.2 }}>
                  {chip.label}
                </div>
                {chip.sub && (
                  <div style={{ fontSize: '10px', fontWeight: 500, color: TEXT3, marginTop: '2px', lineHeight: 1.2 }}>{chip.sub}</div>
                )}
              </div>
            ))}
          </div>

          {/* Customer directory card */}
          <DataList<any>
            title="All customers"
            isMobile={isMobile}
            rows={filtered}
            rowKey={c => c.id}
            loading={loading}
            loadingText="Loading customers..."
            emptyText="No matching customers."
            onRowClick={c => router.push(`/dashboard/customers/${c.id}`)}
            rowActions={() => [{ label: 'Open customer', onClick: c => router.push(`/dashboard/customers/${c.id}`) }]}
            tabs={statusTabs}
            activeTab={statusTab}
            onTabChange={setStatusTab}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search customers, contact, suburb..."
            addLabel="New customer"
            onAdd={() => setShowAddCustomer(true)}
            columns={[
              {
                key: 'customer',
                label: 'Customer',
                width: 'minmax(0,1.4fr)',
                render: c => <PersonCell name={`${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unnamed customer'} sub={isMobile ? c.phone || c.email || c.address || c.suburb || 'No contact saved' : c.address || c.suburb || 'No address saved'} />,
              },
              {
                key: 'contact',
                label: 'Contact',
                width: 'minmax(0,1.2fr)',
                hideOnMobile: true,
                render: c => <TitleCell title={c.email || c.phone || 'No contact saved'} sub={c.email && c.phone ? c.phone : ''} />,
              },
              {
                key: 'jobs',
                label: 'Jobs',
                width: 'minmax(0,1fr)',
                render: c => {
                  const n = c.jobs?.length || 0
                  const latest = c.jobs?.[0]
                  const unit = latest?.brand || latest?.model ? `${latest?.brand || ''} ${latest?.model || ''}`.trim() : 'No job details'
                  return <TitleCell title={`${n} job${n === 1 ? '' : 's'}`} sub={unit} />
                },
              },
              {
                key: 'next',
                label: 'Next maintenance',
                width: '130px',
                mobileLabel: 'Next maintenance',
                render: c => <TextCell>{nextServiceLabel(c.jobs)}</TextCell>,
              },
              {
                key: 'reviews',
                label: 'Reviews',
                width: '90px',
                hideOnMobile: true,
                render: c => {
                  const n = reviewClicks[c.id] || 0
                  return <TextCell>{n} click{n === 1 ? '' : 's'}</TextCell>
                },
              },
              {
                key: 'status',
                label: 'Status',
                width: '120px',
                mobileHeader: true,
                render: c => {
                  const label = statusPill(c.jobs).label
                  return <StatusPill label={label} tone={STATUS_TONE[label] || 'neutral'} />
                },
              },
            ]}
          />
        </div>
      </div>
    </div>

      {showAddCustomer && (
        <div
          onClick={() => setShowAddCustomer(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(11,18,32,0.45)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: WHITE, borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', overflow: 'hidden' }}
          >
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>New Customer</span>
              <button onClick={() => setShowAddCustomer(false)} style={{ width: 30, height: 30, borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#F8FAFC', cursor: 'pointer', fontSize: '16px', color: TEXT3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {(['First name *', 'Last name'] as const).map((label) => {
                  const key = label === 'First name *' ? 'firstName' : 'lastName'
                  return (
                    <div key={key}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase' as const, marginBottom: '6px' }}>{label}</div>
                      <input
                        value={addForm[key as keyof typeof addForm]}
                        onChange={e => setAddForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={label.replace(' *', '')}
                        style={{ width: '100%', height: '38px', border: `1px solid ${BORDER}`, borderRadius: '9px', padding: '0 12px', fontSize: '13px', color: TEXT, background: WHITE, outline: 'none', boxSizing: 'border-box' as const }}
                      />
                    </div>
                  )
                })}
              </div>
              {(['phone', 'email'] as const).map((key) => (
                <div key={key}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase' as const, marginBottom: '6px' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                  <input
                    type={key}
                    value={addForm[key]}
                    onChange={e => setAddForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    style={{ width: '100%', height: '38px', border: `1px solid ${BORDER}`, borderRadius: '9px', padding: '0 12px', fontSize: '13px', color: TEXT, background: WHITE, outline: 'none', boxSizing: 'border-box' as const }}
                  />
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddCustomer(false)} style={{ height: '36px', padding: '0 16px', border: `1px solid ${BORDER}`, borderRadius: '9px', fontSize: '13px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer' }}>Cancel</button>
              <button
                disabled={!addForm.firstName.trim() || addSaving}
                onClick={async () => {
                  if (!businessId || !addForm.firstName.trim()) return
                  setAddSaving(true)
                  const { data } = await supabase.from('customers').insert({
                    business_id: businessId,
                    first_name: addForm.firstName.trim(),
                    last_name: addForm.lastName.trim() || null,
                    phone: addForm.phone.trim() || null,
                    email: addForm.email.trim() || null,
                  }).select('id').single()
                  setAddSaving(false)
                  setShowAddCustomer(false)
                  setAddForm({ firstName: '', lastName: '', phone: '', email: '' })
                  if (data?.id) router.push(`/dashboard/customers/${data.id}`)
                }}
                style={{ height: '36px', padding: '0 20px', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 700, color: WHITE, background: addForm.firstName.trim() ? TEAL : '#A0AEC0', cursor: addForm.firstName.trim() ? 'pointer' : 'not-allowed' }}
              >
                {addSaving ? 'Saving...' : 'Create Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
