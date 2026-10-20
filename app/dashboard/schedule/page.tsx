'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { StatStrip } from '@/components/StatStrip'
import { HeaderToolbar } from '@/components/HeaderToolbar'
import { useBusinessData } from '@/lib/business-context'
import { formatCapacity, getEquipmentLabel } from '@/lib/industry-config'
import { AppIcon } from '@/components/AppIcon'
import { DataList, PersonCell, TitleCell, StatusPill } from '@/components/DataList'

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const RED = '#B91C1C'
const AMBER = '#92400E'
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
  titleSm: {
    fontSize: '12px',
    fontWeight: 800,
    color: TEXT,
    lineHeight: 1.3,
  },
}

const URGENCY_STYLES = {
  overdue: {
    pillBg: '#FEE2E2',
    pillColor: '#991B1B',
    pillBorder: '#FECACA',
    dot: RED,
    valColor: RED,
    label: 'Overdue',
    accentBar: RED,
  },
  due_soon: {
    pillBg: '#FEF3C7',
    pillColor: '#92400E',
    pillBorder: '#FDE68A',
    dot: '#F59E0B',
    valColor: AMBER,
    label: 'Due soon',
    accentBar: '#F59E0B',
  },
  good: {
    pillBg: TEAL_LIGHT,
    pillColor: TEAL_DARK,
    pillBorder: '#BFE7E3',
    dot: TEAL,
    valColor: TEAL_DARK,
    label: 'On track',
    accentBar: TEAL,
  },
}

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'due_soon', label: 'Due soon' },
  { key: 'good', label: 'On track' },
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

function IconMail({ size = 14 }: { size?: number }) {
  return <AppIcon name="mail" size={size} />
}

function IconSms({ size = 14 }: { size?: number }) {
  return <AppIcon name="sms" size={size} />
}

function IconArrow({ size = 13 }: { size?: number }) {
  return <AppIcon name="arrow-right" size={size} />
}

function UrgencyPill({ status }: { status: 'overdue' | 'due_soon' | 'good' }) {
  const st = URGENCY_STYLES[status]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '6px 9px',
        borderRadius: '8px',
        background: st.pillBg,
        border: `1px solid ${st.pillBorder}`,
        fontSize: '10px',
        fontWeight: 800,
        color: st.pillColor,
        whiteSpace: 'nowrap' as const,
        lineHeight: 1,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block', flexShrink: 0 }} />
      {st.label}
    </span>
  )
}

export default function SchedulePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { business } = useBusinessData()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

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
        .select('*, customers(first_name, last_name, email, phone, suburb)')
        .eq('business_id', userData.business_id)
        .order('next_service_date', { ascending: true })

      setJobs(data || [])
      setLoading(false)
    }

    load()
  }, [router])

  function getDays(d: string) {
    const target = new Date(d)
    target.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  function getUrgency(d: string) {
    const days = getDays(d)

    if (days < 0) {
      return {
        status: 'overdue' as const,
        ...URGENCY_STYLES.overdue,
        sub: `${Math.abs(days)}d overdue`,
        dateLabel: `Was due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
      }
    }

    if (days <= 30) {
      return {
        status: 'due_soon' as const,
        ...URGENCY_STYLES.due_soon,
        sub: `${days}d until due`,
        dateLabel: `Due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
      }
    }

    return {
      status: 'good' as const,
      ...URGENCY_STYLES.good,
      sub: `${days}d until due`,
      dateLabel: `Due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`,
    }
  }

  const counts = useMemo(
    () => ({
      all: jobs.length,
      overdue: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length,
      due_soon: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) >= 0 && getDays(j.next_service_date) <= 30).length,
      good: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) > 30).length,
    }),
    [jobs]
  )

  const filtered = useMemo(
    () =>
      jobs.filter(j => {
        if (filter === 'all') return true
        if (!j.next_service_date) return false
        return getUrgency(j.next_service_date).status === filter
      }),
    [jobs, filter]
  )

  const overdueJobs = useMemo(() => jobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0), [jobs])
  const dueSoonJobs = useMemo(() => jobs.filter(j => j.next_service_date && getDays(j.next_service_date) >= 0 && getDays(j.next_service_date) <= 30), [jobs])

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '16px',
  }

  const cardArrowBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: TEXT3,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  }

  const btnOutline: React.CSSProperties = {
    height: '36px',
    padding: '0 14px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 700,
    color: TEXT3,
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  }

  const btnTeal: React.CSSProperties = {
    height: '36px',
    padding: '0 14px',
    border: 'none',
    borderBottom: '2px solid #2AA198',
    borderRadius: 0,
    fontSize: '12px',
    fontWeight: 800,
    color: TEAL,
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    whiteSpace: 'nowrap',
  }

  const btnMobileSm: React.CSSProperties = {
    height: '36px',
    padding: '0 12px',
    border: '1px solid #E8EDF2',
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
    whiteSpace: 'nowrap',
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
      label: 'Scheduled Jobs',
      value: counts.all,
      sub: 'With service tracking',
      onClick: () => setFilter('all'),
    },
    {
      label: 'Overdue',
      value: counts.overdue,
      sub: counts.overdue > 0 ? 'Need attention' : 'All clear',
      onClick: () => setFilter('overdue'),
    },
    {
      label: 'Due Soon',
      value: counts.due_soon,
      sub: 'Within 30 days',
      onClick: () => setFilter('due_soon'),
    },
    {
      label: 'On Track',
      value: counts.good,
      sub: 'More than 30 days',
      onClick: () => setFilter('good'),
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/schedule" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>
          Loading schedule...
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard/schedule" />

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
          <h1 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0 }}>
            Schedule
          </h1>
          <HeaderToolbar isMobile={isMobile} items={[
            { label: 'Customers', icon: <AppIcon name="customers" size={15} />, onClick: () => router.push('/dashboard/customers') },
            { label: 'Add job', icon: <AppIcon name="add" size={15} />, tone: 'primary', onClick: () => router.push('/dashboard/jobs/add') },
          ]} />
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
          <StatStrip items={statChips} isMobile={isMobile} />

          <div style={{ padding: isMobile ? '0 12px' : 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {overdueJobs.length > 0 && (
              <div style={{ background: WHITE, border: `1px solid #FECACA`, borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '10px', background: '#FFF7F7' }}>
                  <div style={{ width: 4, height: 28, borderRadius: '999px', background: RED, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#991B1B', flex: 1 }}>
                    {overdueJobs.length} overdue service{overdueJobs.length > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setFilter('overdue')}
                    style={{
                      height: '30px',
                      padding: '0 12px',
                      background: WHITE,
                      border: `1px solid #FECACA`,
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: FONT,
                      color: '#991B1B',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    View all <IconArrow size={10} />
                  </button>
                </div>

              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr)',
                gap: '14px',
                alignItems: 'start',
              }}
            >
              <DataList<any>
                title="Scheduled services"
                isMobile={isMobile}
                rows={filtered}
                rowKey={job => job.id}
                loading={loading}
                loadingText="Loading..."
                emptyText="No services in this category."
                onRowClick={job => router.push(`/dashboard/customers/${job.customer_id}`)}
                tabs={FILTER_TABS.map(t => ({
                  value: t.key,
                  label: t.label,
                  count: t.key === 'all' ? counts.all : t.key === 'overdue' ? counts.overdue : t.key === 'due_soon' ? counts.due_soon : counts.good,
                }))}
                activeTab={filter}
                onTabChange={setFilter}
                columns={[
                  {
                    key: 'customer',
                    label: 'Customer',
                    width: 'minmax(0,1.5fr)',
                    render: job => (
                      <PersonCell
                        name={`${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Unknown customer'}
                        sub={[job.customers?.suburb || '—', job.customers?.email || job.customers?.phone].filter(Boolean).join(' · ')}
                      />
                    ),
                  },
                  {
                    key: 'job',
                    label: 'Job',
                    width: 'minmax(0,1.1fr)',
                    hideOnMobile: true,
                    render: job => (
                      <TitleCell
                        title={`${job.brand || '—'} ${formatCapacity(job.capacity_kw, business?.industry)}`.trim()}
                        sub={job.equipment_type ? getEquipmentLabel(job.equipment_type) : 'No type set'}
                      />
                    ),
                  },
                  {
                    key: 'timing',
                    label: 'Service timing',
                    width: 'minmax(0,1fr)',
                    mobileLabel: 'Timing',
                    render: job => {
                      const u = job.next_service_date ? getUrgency(job.next_service_date) : null
                      return (
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: u?.valColor || TEXT3, whiteSpace: 'nowrap' }}>{u?.sub || 'No date set'}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT3, marginTop: 2, whiteSpace: 'nowrap' }}>{u?.dateLabel || '—'}</div>
                        </div>
                      )
                    },
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    width: '110px',
                    mobileHeader: true,
                    render: job => {
                      const u = job.next_service_date ? getUrgency(job.next_service_date) : null
                      if (!u) return <StatusPill label="No date" tone="neutral" />
                      return <StatusPill label={u.status === 'overdue' ? 'Overdue' : u.status === 'due_soon' ? 'Due soon' : 'On track'} tone={u.status === 'overdue' ? 'danger' : u.status === 'due_soon' ? 'warn' : 'success'} />
                    },
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    width: '160px',
                    align: 'right',
                    mobileFull: true,
                    render: () => (
                      <div style={{ display: 'inline-flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                        <button
                          style={{ height: '30px', padding: '0 10px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          <IconMail size={12} /> Email
                        </button>
                        <button
                          style={{ height: '30px', padding: '0 10px', borderRadius: '8px', border: 'none', background: TEAL, color: WHITE, fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          <IconSms size={12} /> SMS
                        </button>
                      </div>
                    ),
                  },
                ]}
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}