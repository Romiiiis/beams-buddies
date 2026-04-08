'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
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

function IconCalendar({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconMail({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconSms({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth="1.9" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

type JobRow = {
  id: string
  customer_id: string
  brand?: string
  capacity_kw?: string
  equipment_type?: string
  next_service_date?: string
  customers?: {
    first_name?: string
    last_name?: string
    suburb?: string
  }
}

export default function SchedulePage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [jobs, setJobs] = useState<JobRow[]>([])
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

      const { data: userData } = await supabase
        .from('users')
        .select('business_id')
        .eq('id', session.user.id)
        .single()

      if (!userData) return

      const { data } = await supabase
        .from('jobs')
        .select('*, customers(first_name,last_name,suburb)')
        .eq('business_id', userData.business_id)
        .order('next_service_date', { ascending: true })

      setJobs((data || []) as JobRow[])
      setLoading(false)
    }

    load()
  }, [router])

  function getDays(date: string) {
    return Math.floor(
      (new Date(date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
  }

  function getUrgency(date: string) {
    const days = getDays(date)

    if (days < 0) {
      return {
        status: 'overdue',
        label: 'Overdue',
        color: '#B91C1C',
        bg: '#FEE2E2',
        sub: `${Math.abs(days)}d overdue`,
      }
    }

    if (days <= 30) {
      return {
        status: 'due_soon',
        label: 'Due Soon',
        color: '#92400E',
        bg: '#FEF3C7',
        sub: `${days}d remaining`,
      }
    }

    return {
      status: 'good',
      label: 'Upcoming',
      color: TEAL,
      bg: '#DCFCE7',
      sub: `${days}d remaining`,
    }
  }

  const filtered = jobs.filter(job => {
    if (filter === 'all') return true
    if (!job.next_service_date) return false
    return getUrgency(job.next_service_date).status === filter
  })

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: BG,
        fontFamily: FONT,
      }}
    >
      <Sidebar active="/dashboard/schedule" />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isMobile ? '14px' : '18px',
        }}
      >
        <div
          style={{
            background: HEADER_BG,
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '18px',
          }}
        >
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
            {todayStr}
          </div>

          <div
            style={{
              fontSize: '34px',
              fontWeight: 900,
              color: WHITE,
              marginTop: '8px',
            }}
          >
            Service Schedule
          </div>

          <div
            style={{
              color: 'rgba(255,255,255,0.7)',
              marginTop: '8px',
              fontSize: '14px',
            }}
          >
            Track upcoming, overdue, and scheduled maintenance services.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '18px',
            flexWrap: 'wrap',
          }}
        >
          {['all', 'overdue', 'due_soon', 'good'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: filter === tab ? TEAL : WHITE,
                color: filter === tab ? WHITE : TEXT2,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '12px',
            }}
          >
            {filtered.map(job => {
              const urgency = job.next_service_date
                ? getUrgency(job.next_service_date)
                : null

              return (
                <div
                  key={job.id}
                  onClick={() =>
                    router.push(`/dashboard/customers/${job.customer_id}`)
                  }
                  style={{
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={TYPE.titleSm}>
                        {job.customers?.first_name} {job.customers?.last_name}
                      </div>

                      <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>
                        {job.brand} {job.capacity_kw}kW •{' '}
                        {job.customers?.suburb}
                      </div>
                    </div>

                    {urgency && (
                      <div
                        style={{
                          padding: '6px 10px',
                          borderRadius: '999px',
                          background: urgency.bg,
                          color: urgency.color,
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        {urgency.label}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: '14px',
                      display: 'flex',
                      gap: '8px',
                    }}
                  >
                    <button
                      onClick={e => e.stopPropagation()}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${BORDER}`,
                        background: WHITE,
                        cursor: 'pointer',
                      }}
                    >
                      <IconMail />
                    </button>

                    <button
                      onClick={e => e.stopPropagation()}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: TEAL,
                        color: WHITE,
                        cursor: 'pointer',
                      }}
                    >
                      <IconSms />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}