'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const A = '#69B8B2'
const A_SOFT = '#E7F5F4'
const TEXT = '#1D2736'
const TEXT2 = '#556070'
const TEXT3 = '#8A93A3'
const BORDER = '#E8ECEF'
const BG = '#F6F8F9'
const CARD = '#FFFFFF'
const SHADOW = '0 10px 30px rgba(18, 32, 52, 0.06)'

const avColors = [
  { bg: '#DDF3F1', color: '#2F6F6A' },
  { bg: '#E7EEFB', color: '#35528A' },
  { bg: '#FCEFD9', color: '#7C5A1D' },
  { bg: '#EEE8FF', color: '#56438C' },
  { bg: '#FFE8EE', color: '#8B3657' },
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

export default function DashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
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

      const bid = userData.business_id
      const today = new Date()

      const [customersRes, jobsRes] = await Promise.all([
        supabase.from('customers').select('id').eq('business_id', bid),
        supabase
          .from('jobs')
          .select('*, customers(first_name, last_name, suburb)')
          .eq('business_id', bid)
          .order('next_service_date', { ascending: true }),
      ])

      const jobs = jobsRes.data || []
      const overdue = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today).length
      const jobsThisMonth = jobs.filter(j => {
        const d = new Date(j.created_at)
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
      }).length

      setStats({
        customers: customersRes.data?.length || 0,
        units: jobs.length,
        overdue,
        jobsThisMonth,
      })

      setUpcoming(jobs.filter(j => j.next_service_date).slice(0, 4))
      setRecent([...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3))
      setLoading(false)
    }

    load()
  }, [router])

  function getDays(d: string) {
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  function urgency(days: number) {
    if (days < 0) return { bg: '#FDE9E7', color: '#BC4C43', label: `${Math.abs(days)}d overdue` }
    if (days <= 30) return { bg: '#FFF3DD', color: '#A56B10', label: `Due in ${days} day${days === 1 ? '' : 's'}` }
    return { bg: '#E7F5F4', color: '#2F6F6A', label: `In ${days} days` }
  }

  function getInitials(first?: string, last?: string) {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase()
  }

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const pad = isMobile ? '16px' : '28px'

  const panelStyle: React.CSSProperties = {
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: '24px',
    boxShadow: SHADOW,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar active="/dashboard" />

      <div style={{ flex: 1, minWidth: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: `${isMobile ? '16px' : '22px'} ${pad} ${isMobile ? '96px' : '28px'}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              ...panelStyle,
              padding: isMobile ? '22px 18px' : '26px 28px',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFCFC 100%)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 12px',
                    borderRadius: '999px',
                    background: A_SOFT,
                    color: '#2F6F6A',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: '14px',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: A, display: 'inline-block' }} />
                  Overview
                </div>

                <div style={{ fontSize: isMobile ? '34px' : '46px', lineHeight: 1.02, letterSpacing: '-1.4px', fontWeight: 700, color: TEXT, marginBottom: '10px' }}>
                  {getGreeting()}
                </div>

                <div style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: 1.5, color: TEXT2, marginBottom: '10px', maxWidth: '720px' }}>
                  Track customers, units, services, and recent activity from one place.
                </div>

                <div style={{ fontSize: '13px', color: TEXT3 }}>
                  {todayStr}
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard/jobs')}
                style={{
                  height: isMobile ? '46px' : '48px',
                  padding: '0 18px',
                  borderRadius: '14px',
                  border: 'none',
                  background: A,
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'inherit',
                  boxShadow: '0 10px 22px rgba(105,184,178,0.22)',
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                New job
              </button>
            </div>
          </div>

          <div
            style={{
              ...panelStyle,
              padding: isMobile ? '10px' : '12px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { label: 'Total customers', value: stats.customers, tone: '#69B8B2' },
                { label: 'Active units', value: stats.units, tone: '#69B8B2' },
                { label: 'Overdue services', value: stats.overdue, tone: '#E68A84' },
                { label: 'Jobs this month', value: stats.jobsThisMonth, tone: '#69B8B2' },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    borderRadius: '18px',
                    background: '#FCFDFD',
                    border: `1px solid ${BORDER}`,
                    padding: isMobile ? '18px 16px' : '20px 18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ fontSize: isMobile ? '34px' : '42px', lineHeight: 1, fontWeight: 700, color: TEXT }}>
                      {item.value}
                    </div>
                    {item.label === 'Overdue services' && item.value > 0 && (
                      <div style={{ width: '13px', height: '13px', borderRadius: '50%', background: item.tone, opacity: 0.95 }} />
                    )}
                  </div>
                  <div style={{ fontSize: isMobile ? '14px' : '15px', color: TEXT2, fontWeight: 500 }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1fr', gap: '16px' }}>
            <div style={{ ...panelStyle, padding: isMobile ? '18px 16px' : '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                <div style={{ fontSize: isMobile ? '20px' : '18px', fontWeight: 700, color: TEXT }}>
                  Upcoming Services
                </div>
                <button
                  onClick={() => router.push('/dashboard/schedule')}
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    borderRadius: '999px',
                    border: 'none',
                    background: A_SOFT,
                    color: '#2F6F6A',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  View All
                </button>
              </div>

              {loading ? (
                <div style={{ padding: '40px 10px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
              ) : upcoming.length === 0 ? (
                <div style={{ padding: '40px 10px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>No upcoming services.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {upcoming.map((job, i) => {
                    const av = avColors[i % avColors.length]
                    const u = urgency(getDays(job.next_service_date))
                    return (
                      <div
                        key={job.id}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        style={{
                          background: '#FFFFFF',
                          border: `1px solid ${BORDER}`,
                          borderRadius: '18px',
                          padding: isMobile ? '14px' : '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              background: av.bg,
                              color: av.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(job.customers?.first_name, job.customers?.last_name)}
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: isMobile ? '18px' : '16px', fontWeight: 600, color: TEXT, marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.customers?.first_name} {job.customers?.last_name}
                            </div>
                            <div style={{ fontSize: '14px', color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.brand} {job.capacity_kw ? `· ${job.capacity_kw}kW` : ''}
                            </div>
                            {!isMobile && (
                              <div style={{ fontSize: '13px', color: TEXT3, marginTop: '3px' }}>
                                {job.customers?.suburb || 'Customer record'}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px 12px',
                              borderRadius: '999px',
                              background: u.bg,
                              color: u.color,
                              fontSize: '13px',
                              fontWeight: 600,
                              marginBottom: '6px',
                            }}
                          >
                            {u.label}
                          </div>
                          {!isMobile && (
                            <div style={{ fontSize: '13px', color: TEXT3 }}>
                              {new Date(job.next_service_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ ...panelStyle, padding: isMobile ? '18px 16px' : '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                <div style={{ fontSize: isMobile ? '20px' : '18px', fontWeight: 700, color: TEXT }}>
                  Recent Customers
                </div>
                <button
                  onClick={() => router.push('/dashboard/customers')}
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    borderRadius: '999px',
                    border: 'none',
                    background: A_SOFT,
                    color: '#2F6F6A',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  View All
                </button>
              </div>

              {loading ? (
                <div style={{ padding: '40px 10px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
              ) : recent.length === 0 ? (
                <div style={{ padding: '40px 10px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>No recent customers.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recent.map((job, i) => {
                    const av = avColors[i % avColors.length]
                    return (
                      <div
                        key={job.id}
                        onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                        style={{
                          background: '#FFFFFF',
                          border: `1px solid ${BORDER}`,
                          borderRadius: '18px',
                          padding: isMobile ? '14px' : '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: av.bg,
                              color: av.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(job.customers?.first_name, job.customers?.last_name)}
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: isMobile ? '18px' : '16px', fontWeight: 600, color: TEXT, marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.customers?.first_name} {job.customers?.last_name}
                            </div>
                            <div style={{ fontSize: '14px', color: TEXT2 }}>
                              {job.customers?.suburb || 'Customer'}
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: '13px', color: TEXT3, flexShrink: 0 }}>
                          {Math.max(1, Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)))}d ago
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
    </div>
  )
}