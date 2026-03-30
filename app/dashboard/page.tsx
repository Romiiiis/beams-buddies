'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const A = '#5FB7B2'
const A2 = '#DDF3F1'
const TEXT = '#182032'
const TEXT2 = '#4E5B6B'
const TEXT3 = '#7E8A98'
const BORDER = 'rgba(255,255,255,0.45)'
const PANEL = 'rgba(255,255,255,0.58)'
const PANEL_SOLID = 'rgba(255,255,255,0.72)'
const SHADOW = '0 18px 50px rgba(73, 98, 122, 0.10)'

const avColors = [
  { bg: '#D8F0EE', color: '#255D59' },
  { bg: '#E4ECFB', color: '#35528A' },
  { bg: '#FDF0D8', color: '#7C5A1D' },
  { bg: '#ECE6FF', color: '#51408C' },
  { bg: '#FFE6EC', color: '#8B3657' },
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
        .select('business_id, full_name')
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
    if (days < 0) return { bg: '#FEE7E7', color: '#B94141', label: `${Math.abs(days)}d overdue` }
    if (days <= 30) return { bg: '#FFF1D7', color: '#A66A00', label: `Due in ${days} day${days === 1 ? '' : 's'}` }
    return { bg: '#DDF3F1', color: '#2B7570', label: `In ${days} days` }
  }

  const pad = isMobile ? '16px' : '28px'

  const shellStyle: React.CSSProperties = {
    flex: 1,
    minHeight: '100vh',
    minWidth: 0,
    position: 'relative',
    overflow: 'hidden',
    background:
      'linear-gradient(180deg, #CFE6EA 0%, #DCEFF1 18%, #EAF4F3 38%, #E7EFF2 62%, #D5E8EC 100%)',
  }

  const hazeTop: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(circle at 15% 18%, rgba(255,255,255,0.80) 0, rgba(255,255,255,0.38) 18%, transparent 35%),
      radial-gradient(circle at 72% 12%, rgba(255,255,255,0.62) 0, rgba(255,255,255,0.20) 16%, transparent 32%),
      radial-gradient(circle at 82% 78%, rgba(255,255,255,0.40) 0, rgba(255,255,255,0.10) 14%, transparent 28%)
    `,
    pointerEvents: 'none',
  }

  const waveBottom: React.CSSProperties = {
    position: 'absolute',
    left: '-8%',
    right: '-8%',
    bottom: isMobile ? '-80px' : '-120px',
    height: isMobile ? '260px' : '340px',
    borderTopLeftRadius: '55% 100%',
    borderTopRightRadius: '45% 100%',
    background: 'linear-gradient(180deg, rgba(188,216,223,0.55), rgba(182,210,218,0.88))',
    filter: 'blur(0.2px)',
    pointerEvents: 'none',
  }

  const waveMid: React.CSSProperties = {
    position: 'absolute',
    left: '18%',
    right: '-10%',
    bottom: isMobile ? '110px' : '120px',
    height: isMobile ? '120px' : '150px',
    borderTopLeftRadius: '45% 100%',
    borderTopRightRadius: '55% 100%',
    background: 'linear-gradient(180deg, rgba(209,232,236,0.20), rgba(201,227,231,0.50))',
    pointerEvents: 'none',
  }

  const appFrame: React.CSSProperties = {
    position: 'relative',
    margin: isMobile ? '0' : '18px',
    minHeight: isMobile ? '100vh' : 'calc(100vh - 36px)',
    borderRadius: isMobile ? '0' : '28px',
    border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.50)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.10))',
    boxShadow: isMobile ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.45)',
    overflow: 'hidden',
    display: 'flex',
  }

  const contentWrap: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  }

  const topBar: React.CSSProperties = {
    padding: `${isMobile ? '16px' : '22px'} ${pad} 0`,
    position: 'relative',
    zIndex: 2,
  }

  const glassBar: React.CSSProperties = {
    height: isMobile ? '56px' : '64px',
    borderRadius: '20px',
    border: `1px solid ${BORDER}`,
    background: PANEL,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    boxShadow: SHADOW,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? '0 14px' : '0 18px',
    gap: '14px',
  }

  const mainContent: React.CSSProperties = {
    flex: 1,
    position: 'relative',
    zIndex: 2,
    padding: `${isMobile ? '16px' : '20px'} ${pad} ${isMobile ? '96px' : '28px'}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }

  const glassPanel: React.CSSProperties = {
    borderRadius: '26px',
    border: `1px solid ${BORDER}`,
    background: PANEL,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    boxShadow: SHADOW,
  }

  const sectionCard: React.CSSProperties = {
    ...glassPanel,
    padding: isMobile ? '18px 16px' : '18px',
  }

  const statShell: React.CSSProperties = {
    ...glassPanel,
    padding: isMobile ? '10px' : '10px',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#DCECEE', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={shellStyle}>
        <div style={hazeTop} />
        <div style={waveMid} />
        <div style={waveBottom} />

        <div style={appFrame}>
          <Sidebar active="/dashboard" />

          <div style={contentWrap}>
            <div style={topBar}>
              <div style={glassBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'linear-gradient(180deg, #DDF3F1, #CFECE9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4E9A95',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2.2a5.8 5.8 0 1 0 5.8 5.8H8V2.2Z" fill="currentColor" />
                      <path d="M9.5 1.8a6.2 6.2 0 0 1 4.7 4.7H9.5V1.8Z" fill="currentColor" opacity="0.45" />
                    </svg>
                  </div>
                  <div style={{ fontSize: isMobile ? '24px' : '18px', fontWeight: 600, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isMobile ? 'Dashboard' : 'Dashboard'}
                  </div>
                </div>

                {!isMobile && (
                  <div
                    style={{
                      width: '230px',
                      height: '46px',
                      borderRadius: '999px',
                      border: '1px solid rgba(94,126,146,0.28)',
                      background: 'rgba(255,255,255,0.62)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '0 16px',
                      color: TEXT3,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <circle cx="7" cy="7" r="4.8" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M10.6 10.6 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: '14px' }}>Search</span>
                  </div>
                )}
              </div>
            </div>

            <div style={mainContent}>
              <div
                style={{
                  ...sectionCard,
                  padding: isMobile ? '22px 18px' : '26px 24px',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.42), rgba(255,255,255,0.26))',
                }}
              >
                <div style={{ maxWidth: '780px' }}>
                  <div style={{ fontSize: isMobile ? '20px' : '15px', color: TEXT3, marginBottom: '8px', fontWeight: 500 }}>
                    {getGreeting()}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? '38px' : '54px',
                      lineHeight: isMobile ? 1.05 : 1,
                      letterSpacing: '-1.6px',
                      fontWeight: 700,
                      color: TEXT,
                      marginBottom: '10px',
                    }}
                  >
                    Welcome back
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? '16px' : '18px',
                      lineHeight: 1.5,
                      color: TEXT2,
                      maxWidth: '700px',
                    }}
                  >
                    Stay on top of customers, units, and jobs from one place.
                  </div>
                </div>
              </div>

              <div style={statShell}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                    gap: '0',
                    overflow: 'hidden',
                    borderRadius: '22px',
                    background: PANEL_SOLID,
                  }}
                >
                  {[
                    { label: 'Total customers', value: stats.customers, accent: '#5FB7B2' },
                    { label: 'Active units', value: stats.units, accent: '#5FB7B2' },
                    { label: 'Overdue services', value: stats.overdue, accent: '#E98989' },
                    { label: 'Jobs this month', value: stats.jobsThisMonth, accent: '#5FB7B2' },
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      style={{
                        padding: isMobile ? '18px 16px' : '22px 24px',
                        borderRight: !isMobile && i !== 3 ? '1px solid rgba(115,135,154,0.12)' : 'none',
                        borderBottom: isMobile && i < 2 ? '1px solid rgba(115,135,154,0.12)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ fontSize: isMobile ? '36px' : '46px', lineHeight: 1, fontWeight: 600, color: TEXT }}>
                          {item.value}
                        </div>
                        {item.label === 'Overdue services' && item.value > 0 && (
                          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: item.accent, opacity: 0.9 }} />
                        )}
                      </div>
                      <div style={{ fontSize: isMobile ? '14px' : '16px', color: TEXT2, fontWeight: 500 }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1fr', gap: '16px' }}>
                <div style={sectionCard}>
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
                        background: A2,
                        color: '#346C69',
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
                              background: 'rgba(255,255,255,0.58)',
                              border: '1px solid rgba(115,135,154,0.10)',
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
                                {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
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

                <div style={sectionCard}>
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
                        background: A2,
                        color: '#346C69',
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
                              background: 'rgba(255,255,255,0.58)',
                              border: '1px solid rgba(115,135,154,0.10)',
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
                                {(job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')}
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

                      <button
                        onClick={() => router.push('/dashboard/customers')}
                        style={{
                          marginTop: '6px',
                          height: '46px',
                          borderRadius: '999px',
                          border: 'none',
                          background: 'linear-gradient(180deg, #6CC4BE, #58ACA7)',
                          color: '#fff',
                          fontSize: '16px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        View
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}