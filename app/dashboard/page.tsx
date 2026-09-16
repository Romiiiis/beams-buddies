'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL       = '#1F9E94'
const TEAL_DARK  = '#177A72'
const TEAL_LIGHT = '#E6F7F6'
const TEXT       = '#0B1220'
const TEXT2      = '#1F2937'
const TEXT3      = '#64748B'
const BORDER     = '#E2E8F0'
const BG         = '#FAFAFA'
const WHITE      = '#FFFFFF'
const FONT       = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const RED        = '#DC2626'
const RED_LIGHT  = '#FEE2E2'
const AMBER_DARK = '#92400E'
const AMBER_LIGHT = '#FEF3C7'
const GREEN_DARK = '#065F46'
const GREEN_LIGHT = '#D1FAE5'

function parseDateLocal(raw: string | null | undefined): Date | null {
  if (!raw) return null
  const s = String(raw).slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function startOfDay(d: Date): Date {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function IconPlus({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
}

function IconCalendar({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.9"/><path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}

function IconArrow({ size = 11 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function IconDownload({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function pctChange(curr: number, prev: number) {
  if (prev === 0) return curr === 0 ? 0 : 100
  return Math.round(((curr - prev) / prev) * 100)
}

// ── Week Strip ────────────────────────────────────────────────────────────────

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function WeekStrip({ allJobs, onDayClick, isMobile }: {
  allJobs: any[]
  onDayClick: (date: Date, jobs: any[]) => void
  isMobile: boolean
}) {
  const today = startOfDay(new Date())
  const todayKey = toYMD(today)

  // Build Mon–Sun of current week (Mon = start)
  const dayOfWeek = today.getDay() // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + mondayOffset + i)
    return d
  })

  const jobsByDate = useMemo(() => {
    const map: Record<string, any[]> = {}
    allJobs.forEach(job => {
      const key = String(job.next_service_date || '').slice(0, 10)
      if (!key) return
      if (!map[key]) map[key] = []
      map[key].push(job)
    })
    return map
  }, [allJobs])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: isMobile ? '4px' : '6px',
      padding: isMobile ? '12px 14px' : '14px 20px',
    }}>
      {weekDays.map((day) => {
        const key = toYMD(day)
        const jobs = jobsByDate[key] || []
        const isToday = key === todayKey
        const isPast = day < today

        return (
          <div
            key={key}
            onClick={() => jobs.length > 0 && onDayClick(day, jobs)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              cursor: jobs.length > 0 ? 'pointer' : 'default',
            }}
          >
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              color: isToday ? TEAL_DARK : TEXT3,
              letterSpacing: '0.05em',
            }}>
              {DAY_LABELS[day.getDay()]}
            </div>
            <div style={{
              width: 28, height: 28,
              borderRadius: '7px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px',
              fontWeight: isToday ? 800 : 600,
              color: isToday ? WHITE : isPast ? TEXT3 : TEXT2,
              background: isToday ? TEAL : 'transparent',
              opacity: isPast && !isToday ? 0.5 : 1,
            }}>
              {day.getDate()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', minHeight: 14 }}>
              {Array.from({ length: Math.min(jobs.length, 4) }).map((_, i) => (
                <span key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: isPast ? TEXT3 : TEAL,
                  opacity: isPast ? 0.3 : 1,
                }} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Job Day Popup ─────────────────────────────────────────────────────────────

function JobDayPopup({ date, jobs, onClose, onJobClick }: {
  date: Date
  jobs: any[]
  onClose: () => void
  onJobClick: (job: any) => void
}) {
  const dayLabel = date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,18,32,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: WHITE, borderRadius: '18px', width: '100%', maxWidth: '420px', margin: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden', fontFamily: FONT }}
      >
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>Scheduled Jobs</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: TEXT }}>{dayLabel}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '4px 10px', borderRadius: '20px', background: TEAL_LIGHT, color: TEAL_DARK, fontSize: '11px', fontWeight: 800 }}>{jobs.length} job{jobs.length !== 1 ? 's' : ''}</span>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#F8FAFC', cursor: 'pointer', fontFamily: FONT, fontSize: '16px', color: TEXT3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        </div>
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {jobs.map((job, i) => {
            const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
            const initials = (job.customers?.first_name?.[0] || '') + (job.customers?.last_name?.[0] || '')
            const jobLabel = (job.job_type || job.equipment_type || 'Service').replace(/_/g, ' ')
            return (
              <div
                key={job.id}
                onClick={() => onJobClick(job)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = TEAL_LIGHT)}
                onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
              >
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: TEAL_LIGHT, color: TEAL_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>{initials || '?'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{name}</div>
                  <div style={{ fontSize: '11px', color: TEXT3, marginTop: '1px', textTransform: 'capitalize' }}>{jobLabel}{job.customers?.suburb ? ` · ${job.customers.suburb}` : ''}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: TEAL_DARK }}>View</span>
              </div>
            )
          })}
        </div>
        <div style={{ padding: '12px 20px' }}>
          <button onClick={onClose} style={{ width: '100%', height: '36px', background: TEXT, color: WHITE, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Dashboard Page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [popupDate, setPopupDate] = useState<Date | null>(null)
  const [popupJobs, setPopupJobs] = useState<any[]>([])
  const [stats, setStats] = useState({ customers: 0, units: 0, overdue: 0, jobsThisMonth: 0, jobsToday: 0 })
  const [invoiceStats, setInvoiceStats] = useState({ outstanding: 0, overdueCount: 0, allInvoices: [] as any[] })
  const [allJobs, setAllJobs] = useState<any[]>([])
  const [allInvoices, setAllInvoices] = useState<any[]>([])
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: userData } = await supabase
        .from('users')
        .select('business_id, full_name')
        .eq('id', session.user.id)
        .single()

      if (!userData) { setLoading(false); return }

      const bid = userData.business_id
      const rawName = (userData as any).full_name || session.user.email?.split('@')[0] || ''
      setUserName(rawName.split(' ')[0])

      const todayLocal = startOfDay(new Date())
      const todayKey = toYMD(todayLocal)
      const todayMs = todayLocal.getTime()
      const nowMonth = todayLocal.getMonth()
      const nowYear = todayLocal.getFullYear()

      const [customersRes, jobsRes, invoicesRes] = await Promise.all([
        supabase.from('customers').select('id').eq('business_id', bid),
        supabase.from('jobs').select('*, customers(first_name, last_name, suburb, phone)').eq('business_id', bid).order('next_service_date', { ascending: true }),
        supabase.from('invoices').select('*, customers(first_name, last_name)').eq('business_id', bid).order('created_at', { ascending: false }),
      ])

      const jobs: any[] = jobsRes.data || []
      const invoices: any[] = invoicesRes.data || []

      const overdue = jobs.filter(j => {
        const d = parseDateLocal(j.next_service_date)
        return d && startOfDay(d).getTime() < todayMs
      })

      const jobsToday = jobs.filter(j => String(j.next_service_date || '').slice(0, 10) === todayKey).length

      const jobsThisMonth = jobs.filter(j => {
        const d = parseDateLocal(j.created_at)
        return d && d.getMonth() === nowMonth && d.getFullYear() === nowYear
      }).length

      setStats({
        customers: customersRes.data?.length || 0,
        units: jobs.length,
        overdue: overdue.length,
        jobsThisMonth,
        jobsToday,
      })

      setAllJobs(jobs)
      setAllInvoices(invoices)
      setInvoiceStats({
        outstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + Math.max(0, Number(i.total || 0) - Number(i.amount_paid || 0)), 0),
        overdueCount: invoices.filter(i => i.status === 'overdue').length,
        allInvoices: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').slice(0, 4),
      })

      setLoading(false)
    }
    load()
  }, [router])

  const now = new Date()
  const startCurrMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  function inRange(raw: string | null | undefined, from: Date, to: Date) {
    const d = parseDateLocal(raw)
    return d ? d >= from && d < to : false
  }

  const revThisMonth = useMemo(() =>
    allInvoices.filter(i => i.status === 'paid' && inRange(i.created_at, startCurrMonth, startNextMonth))
      .reduce((s, i) => s + Number(i.total || 0), 0),
    [allInvoices]
  )

  const revPrevMonth = useMemo(() =>
    allInvoices.filter(i => i.status === 'paid' && inRange(i.created_at, startPrevMonth, startCurrMonth))
      .reduce((s, i) => s + Number(i.total || 0), 0),
    [allInvoices]
  )

  const revDelta = pctChange(revThisMonth, revPrevMonth)

  const todayKey = toYMD(startOfDay(new Date()))

  const todayJobs = useMemo(() =>
    allJobs.filter(j => String(j.next_service_date || '').slice(0, 10) === todayKey),
    [allJobs, todayKey]
  )

  const scheduledCount = useMemo(() => {
    const todayMs = startOfDay(new Date()).getTime()
    return allJobs.filter(j => {
      const d = parseDateLocal(j.next_service_date)
      return d && startOfDay(d).getTime() >= todayMs
    }).length
  }, [allJobs])

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
      <Sidebar active="/dashboard" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>Loading dashboard...</div>
    </div>
  )

  // KPI strip data
  const kpis = [
    {
      label: 'Jobs Today',
      value: stats.jobsToday,
      sub: stats.jobsToday === 0 ? 'Nothing scheduled' : `${scheduledCount} upcoming total`,
      accentColor: TEAL,
      valueColor: TEAL_DARK,
      chip: null,
      onClick: () => router.push('/dashboard/schedule'),
    },
    {
      label: 'Outstanding',
      value: `$${invoiceStats.outstanding.toLocaleString('en-AU')}`,
      sub: `${invoiceStats.allInvoices.length} invoice${invoiceStats.allInvoices.length !== 1 ? 's' : ''} unpaid`,
      accentColor: invoiceStats.outstanding > 0 ? RED : TEAL,
      valueColor: invoiceStats.outstanding > 0 ? RED : TEXT,
      chip: invoiceStats.overdueCount > 0 ? { label: `${invoiceStats.overdueCount} overdue`, bg: RED_LIGHT, color: RED } : null,
      onClick: () => router.push('/dashboard/invoices'),
    },
    {
      label: 'Overdue Jobs',
      value: stats.overdue,
      sub: stats.overdue === 0 ? 'All up to date' : 'Need rescheduling',
      accentColor: stats.overdue > 0 ? RED : TEAL,
      valueColor: stats.overdue > 0 ? RED : TEXT,
      chip: stats.overdue > 0 ? { label: 'Needs attention', bg: RED_LIGHT, color: RED } : { label: 'All clear', bg: GREEN_LIGHT, color: GREEN_DARK },
      onClick: () => router.push('/dashboard/jobs'),
    },
    {
      label: 'Revenue This Month',
      value: `$${revThisMonth.toLocaleString('en-AU')}`,
      sub: revPrevMonth > 0 ? `${revDelta >= 0 ? '+' : ''}${revDelta}% vs last month` : 'No prior month data',
      accentColor: '#43A047',
      valueColor: GREEN_DARK,
      chip: revDelta !== 0 && revPrevMonth > 0 ? { label: `${revDelta >= 0 ? '+' : ''}${revDelta}%`, bg: revDelta >= 0 ? GREEN_LIGHT : RED_LIGHT, color: revDelta >= 0 ? GREEN_DARK : RED } : null,
      onClick: () => router.push('/dashboard/revenue'),
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
    height: '34px', padding: '0 13px',
    border: `1px solid ${BORDER}`, borderRadius: '8px',
    fontSize: '12px', fontWeight: 700, fontFamily: FONT,
    background: WHITE, color: TEXT2,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px',
  }

  const btnPrimary: React.CSSProperties = {
    ...btnOutline,
    background: TEAL, borderColor: TEAL, color: WHITE,
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard" />

      {popupDate && (
        <JobDayPopup
          date={popupDate}
          jobs={popupJobs}
          onClose={() => { setPopupDate(null); setPopupJobs([]) }}
          onJobClick={job => { setPopupDate(null); setPopupJobs([]); router.push(`/dashboard/customers/${job.customer_id}`) }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG, overflowY: 'auto' }}>

        {/* ── Page Header ── */}
        <div style={{
          padding: isMobile ? '16px 14px 12px' : '18px 26px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: BG, borderBottom: `1px solid ${BORDER}`,
          gap: '14px', flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
              {getGreeting()}{userName ? `, ${userName}` : ''}
            </h1>
            <p style={{ fontSize: '12px', color: TEXT3, fontWeight: 500, margin: '4px 0 0' }}>
              {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {!isMobile && (
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => router.push('/dashboard/jobs')} style={btnOutline}><IconPlus size={12} /> Add Job</button>
              <button onClick={() => router.push('/dashboard/invoices')} style={btnOutline}><IconDownload size={12} /> Invoice</button>
              <button onClick={() => router.push('/dashboard/customers')} style={btnPrimary}><IconPlus size={12} /> Customer</button>
            </div>
          )}
        </div>

        {/* ── KPI Strip ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          borderBottom: `1px solid ${BORDER}`,
          background: WHITE,
          flexShrink: 0,
        }}>
          {kpis.map((kpi, i) => (
            <div
              key={kpi.label}
              onClick={kpi.onClick}
              style={{
                padding: isMobile ? '14px 14px 12px' : '16px 22px 14px',
                borderRight: isMobile ? (i % 2 === 0 ? `1px solid ${BORDER}` : 'none') : (i < 3 ? `1px solid ${BORDER}` : 'none'),
                borderBottom: isMobile && i < 2 ? `1px solid ${BORDER}` : 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = TEAL_LIGHT)}
              onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
            >
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: kpi.accentColor }} />
              <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 900, color: kpi.valueColor, letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {kpi.value}
              </div>
              {kpi.chip ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: '6px', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, background: kpi.chip.bg, color: kpi.chip.color }}>
                  {kpi.chip.label}
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: TEXT3, fontWeight: 500, marginTop: '5px' }}>{kpi.sub}</div>
              )}
            </div>
          ))}
        </div>

        {/* ── Content Grid ── */}
        <div style={{
          padding: isMobile ? '14px' : '20px 26px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 290px',
          gap: '16px',
          alignItems: 'start',
          paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '40px',
        }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Today's Schedule */}
            <div style={card}>
              <div style={{
                padding: '13px 18px',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: TEAL, color: WHITE,
                    padding: '4px 10px 4px 8px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.03em',
                  }}>
                    <span style={{
                      width: 7, height: 7, background: 'rgba(255,255,255,0.85)', borderRadius: '50%',
                      animation: 'pulse 2s ease-in-out infinite',
                    }} />
                    TODAY
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>Schedule</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: TEXT3 }}>
                    {todayJobs.length} job{todayJobs.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => router.push('/dashboard/schedule')}
                    style={{ fontSize: '11px', fontWeight: 700, color: TEAL, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT, padding: 0 }}
                  >
                    Full calendar →
                  </button>
                </div>
              </div>

              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.25} }`}</style>

              {todayJobs.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT2 }}>No jobs scheduled today</div>
                  <div style={{ fontSize: '11px', color: TEXT3, marginTop: '4px' }}>
                    <button onClick={() => router.push('/dashboard/jobs')} style={{ color: TEAL, fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: '11px' }}>
                      + Add a job
                    </button>
                  </div>
                </div>
              ) : todayJobs.map((job, i) => {
                const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                const jobLabel = (job.job_type || job.equipment_type || 'Service').replace(/_/g, ' ')
                const timeStr = job.start_time || job.time || null
                const isFirst = i === 0
                const isLast = i === todayJobs.length - 1

                return (
                  <div
                    key={job.id}
                    onClick={() => router.push(`/dashboard/customers/${job.customer_id}`)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: timeStr ? '68px 18px 1fr auto' : '18px 1fr auto',
                      alignItems: 'stretch',
                      padding: '0 18px',
                      cursor: 'pointer',
                      minHeight: '68px',
                      borderBottom: isLast ? 'none' : `1px solid ${BORDER}`,
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = TEAL_LIGHT)}
                    onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                  >
                    {timeStr && (
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right', padding: '14px 8px 14px 0' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                          {timeStr.split(' ')[0]}
                        </div>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: TEXT3, marginTop: '2px', letterSpacing: '0.04em' }}>
                          {timeStr.split(' ')[1] || ''}
                        </div>
                      </div>
                    )}

                    {/* Timeline line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 18 }}>
                      <div style={{ width: 2, flex: 1, background: isFirst ? 'transparent' : BORDER }} />
                      <div style={{
                        width: i === 0 ? 13 : 10,
                        height: i === 0 ? 13 : 10,
                        borderRadius: '50%',
                        background: i === 0 ? TEAL : BORDER,
                        border: `2px solid ${WHITE}`,
                        flexShrink: 0,
                        zIndex: 1,
                        marginLeft: i === 0 ? '-1.5px' : 0,
                        boxShadow: i === 0 ? `0 0 0 4px ${TEAL_LIGHT}` : 'none',
                      }} />
                      <div style={{ width: 2, flex: 1, background: isLast ? 'transparent' : BORDER }} />
                    </div>

                    {/* Job info */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '14px 0 14px 14px', minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {name}
                      </div>
                      <div style={{ fontSize: '11px', color: TEXT3, fontWeight: 500, marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        <span style={{ textTransform: 'capitalize' }}>{jobLabel}</span>
                        {job.customers?.suburb && <><span style={{ color: BORDER }}>·</span><span>{job.customers.suburb}</span></>}
                        {job.customers?.phone && <><span style={{ color: BORDER }}>·</span><span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '10px' }}>{job.customers.phone}</span></>}
                      </div>
                    </div>

                    {/* Status */}
                    <div style={{ alignSelf: 'center' }}>
                      <span style={{
                        display: 'inline-flex', padding: '4px 10px', borderRadius: '6px',
                        fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap',
                        background: i === 0 ? TEAL_LIGHT : BORDER,
                        color: i === 0 ? TEAL_DARK : TEXT3,
                      }}>
                        {i === 0 ? 'Next up' : 'Scheduled'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* This Week */}
            <div style={card}>
              <div style={{
                padding: '13px 18px',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>This Week</span>
                <button
                  onClick={() => router.push('/dashboard/schedule')}
                  style={{ fontSize: '11px', fontWeight: 700, color: TEAL, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT, padding: 0 }}
                >
                  View schedule →
                </button>
              </div>
              <WeekStrip
                allJobs={allJobs}
                isMobile={isMobile}
                onDayClick={(date, jobs) => { setPopupDate(date); setPopupJobs(jobs) }}
              />
            </div>

          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Unpaid Invoices */}
            <div style={card}>
              <div style={{
                padding: '13px 16px',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>Unpaid Invoices</span>
                <button onClick={() => router.push('/dashboard/invoices')} style={{ fontSize: '11px', fontWeight: 700, color: TEAL, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT, padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  All <IconArrow size={10} />
                </button>
              </div>

              {/* Total */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '22px', fontWeight: 900, color: invoiceStats.outstanding > 0 ? RED : TEXT, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                  ${invoiceStats.outstanding.toLocaleString('en-AU')}
                </span>
                <span style={{ fontSize: '11px', color: TEXT3, fontWeight: 500 }}>
                  · {invoiceStats.overdueCount} overdue
                </span>
              </div>

              {invoiceStats.allInvoices.length === 0 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', marginBottom: 4 }}>✓</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT3 }}>All invoices paid</div>
                </div>
              ) : invoiceStats.allInvoices.map((inv, i) => {
                const name = `${inv.customers?.first_name || ''} ${inv.customers?.last_name || ''}`.trim() || 'Customer'
                const isOverdue = inv.status === 'overdue'
                const amt = Math.max(0, Number(inv.total || 0) - Number(inv.amount_paid || 0))
                const dueDate = parseDateLocal(inv.due_date || inv.created_at)
                const dueDays = dueDate ? Math.round((dueDate.getTime() - startOfDay(new Date()).getTime()) / 86400000) : null

                return (
                  <div
                    key={inv.id || i}
                    onClick={() => router.push('/dashboard/invoices')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 16px',
                      borderBottom: i < invoiceStats.allInvoices.length - 1 ? `1px solid ${BORDER}` : 'none',
                      cursor: 'pointer', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = TEAL_LIGHT)}
                    onMouseLeave={e => (e.currentTarget.style.background = WHITE)}
                  >
                    <div style={{
                      width: 4, height: 36, borderRadius: '2px', flexShrink: 0,
                      background: isOverdue ? RED : (dueDays !== null && dueDays <= 3 ? '#D97706' : BORDER),
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                      <div style={{ fontSize: '10px', color: TEXT3, marginTop: '2px' }}>
                        {isOverdue ? 'Overdue' : dueDays !== null ? (dueDays <= 0 ? 'Due today' : `Due in ${dueDays}d`) : 'Sent'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: isOverdue ? RED : TEXT, fontVariantNumeric: 'tabular-nums' }}>
                        ${amt.toLocaleString('en-AU')}
                      </div>
                      <span style={{
                        display: 'block', textAlign: 'right', fontSize: '9px', fontWeight: 700,
                        padding: '1px 5px', borderRadius: '3px', marginTop: '2px',
                        background: isOverdue ? RED_LIGHT : AMBER_LIGHT,
                        color: isOverdue ? RED : AMBER_DARK,
                      }}>
                        {isOverdue ? 'OVERDUE' : 'SENT'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div style={card}>
              <div style={{ padding: '13px 16px', borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>Quick actions</span>
              </div>
              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {[
                  { label: '+ New job', onClick: () => router.push('/dashboard/jobs/add'), primary: true },
                  { label: '+ Create invoice', onClick: () => router.push('/dashboard/invoices') },
                  { label: '+ Add customer', onClick: () => router.push('/dashboard/customers') },
                  { label: '📅 Open schedule', onClick: () => router.push('/dashboard/schedule') },
                ].map(action => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    style={{
                      width: '100%', height: '34px',
                      border: `1px solid ${action.primary ? TEAL : BORDER}`,
                      borderRadius: '8px',
                      fontSize: '12px', fontWeight: 700, fontFamily: FONT,
                      background: action.primary ? TEAL : WHITE,
                      color: action.primary ? WHITE : TEXT2,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
