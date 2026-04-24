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
    function check() { setIsMobile(window.innerWidth < 768) }
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
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x
}

function isBetween(dateStr: string | null | undefined, start: Date, end: Date) {
  if (!dateStr) return false
  const d = parseDateLocal(dateStr)
  if (!d || isNaN(d.getTime())) return false
  return d >= start && d < end
}

function pctChange(current: number, previous: number) {
  if (previous === 0) { if (current === 0) return 0; return 100 }
  return Math.round(((current - previous) / previous) * 100)
}

function formatDelta(n: number) { return `${n >= 0 ? '+' : ''}${n}%` }

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/>
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  )
}

function IconSearch({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9"/>
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
  )
}

function IconArrow({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconTrendUp({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 7l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconTrendDown({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 17l-8-8-4 4-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) { setLoading(false); return }

      const [customersRes, clicksRes, settingsRes] = await Promise.all([
        supabase.from('customers').select('*, jobs(id, brand, model, capacity_kw, next_service_date, created_at)').eq('business_id', userData.business_id).order('created_at', { ascending: false }),
        supabase.from('review_clicks').select('customer_id, platform').eq('business_id', userData.business_id),
        supabase.from('business_settings').select('google_review_url, facebook_review_url, custom_review_platforms').eq('business_id', userData.business_id).single(),
      ])

      setCustomers(customersRes.data || [])

      const uniqueClicks: Record<string, Set<string>> = {}
      for (const click of clicksRes.data || []) {
        if (!uniqueClicks[click.customer_id]) uniqueClicks[click.customer_id] = new Set()
        uniqueClicks[click.customer_id].add(click.platform)
      }
      const clicks: Record<string, number> = {}
      for (const [cid, platforms] of Object.entries(uniqueClicks)) clicks[cid] = platforms.size
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
    const datedJobs = [...jobs].filter((j) => j?.next_service_date).sort((a, b) => {
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
      `${c.first_name || ''} ${c.last_name || ''} ${c.email || ''} ${c.phone || ''} ${c.suburb || ''} ${c.address || ''}`.toLowerCase().includes(search.toLowerCase())
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

  const engagedCustomers = useMemo(() => Object.values(reviewClicks).filter((v) => v > 0).length, [reviewClicks])

  const now = new Date()
  const todayStr = now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const startCurrent30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  const startPrev30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60)

  const newCustomersCurrent = useMemo(() => customers.filter((c) => isBetween(c.created_at, startCurrentMonth, startNextMonth)).length, [customers])
  const newCustomersPrev = useMemo(() => customers.filter((c) => isBetween(c.created_at, startPrevMonth, startCurrentMonth)).length, [customers])
  const unitsCurrent = useMemo(() => customers.filter((c) => isBetween(c.created_at, startCurrent30, now)).reduce((sum, c) => sum + (c.jobs?.length || 0), 0), [customers])
  const unitsPrev = useMemo(() => customers.filter((c) => isBetween(c.created_at, startPrev30, startCurrent30)).reduce((sum, c) => sum + (c.jobs?.length || 0), 0), [customers])

  const customersDelta = pctChange(newCustomersCurrent, newCustomersPrev)
  const unitsDelta = pctChange(unitsCurrent, unitsPrev)
  const dueSoonDelta = pctChange(stats.dueSoon, Math.max(stats.totalCustomers - stats.dueSoon, 1))
  const reviewDelta = pctChange(stats.totalReviewClicks, Math.max(stats.totalReviewClicks - engagedCustomers, 0))

  // ── Unified stat chips (dashboard style) ────────────────────────────────
  const statChips = [
    { label: 'Total Customers', value: stats.totalCustomers, sub: 'in your CRM',      onClick: () => router.push('/dashboard/customers') },
    { label: 'Tracked Units',   value: stats.totalUnits,     sub: 'linked to profiles', onClick: () => router.push('/dashboard/customers') },
    { label: 'Due Soon',        value: stats.dueSoon,         sub: 'need attention',   onClick: () => router.push('/dashboard/jobs') },
    { label: 'Review Clicks',   value: stats.totalReviewClicks, sub: totalPlatforms > 0 ? `${totalPlatforms} platform${totalPlatforms === 1 ? '' : 's'}` : 'No platforms', onClick: () => router.push('/dashboard/customers') },
  ]

  const card: React.CSSProperties = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

  const btnOutline: React.CSSProperties = {
    height: '34px', padding: '0 14px', border: `1px solid ${BORDER}`, borderRadius: '9px',
    fontSize: '12px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer',
    fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '6px', whiteSpace: 'nowrap', transition: 'border-color 0.12s, color 0.12s',
  }
  const btnTeal: React.CSSProperties = {
    height: '34px', padding: '0 14px', border: 'none', borderRadius: '9px',
    fontSize: '12px', fontWeight: 700, color: WHITE, background: TEAL, cursor: 'pointer',
    fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '7px', whiteSpace: 'nowrap', transition: 'opacity 0.12s',
  }
  const btnMobileSm: React.CSSProperties = {
    height: '36px', padding: '0 12px', border: `1px solid ${BORDER}`, borderRadius: '9px',
    fontSize: '12px', fontWeight: 700, color: TEXT2, background: WHITE, cursor: 'pointer',
    fontFamily: FONT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '5px', flex: 1,
  }
  const btnMobileTeal: React.CSSProperties = { ...btnMobileSm, background: TEAL, border: `1px solid ${TEAL}`, color: WHITE }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/customers" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>Loading customers...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard/customers" />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '0' : '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '40px', background: BG }}>

          {/* ── Header ── */}
          {isMobile ? (
            <div style={{ padding: '20px 12px 4px' }}>
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    {new Date().toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                  <h1 style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>Customers</h1>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginTop: '2px' }}>
                  <button onClick={() => router.push('/dashboard/jobs')} style={btnMobileSm}><IconSpark size={12} /> Add Job</button>
                  <button onClick={() => router.push('/dashboard/jobs')} style={btnMobileTeal}>View Jobs</button>
                </div>
              </div>
              {/* Stat chips — unified card */}
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `2px solid ${TEAL}`, borderRadius: '12px', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {statChips.map((chip, i) => (
                  <div key={chip.label} onClick={chip.onClick}
                    style={{ padding: '10px 8px', cursor: 'pointer', textAlign: 'center', borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none', transition: 'background 0.12s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = TEAL_LIGHT }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: TEXT3, marginTop: '3px', lineHeight: 1.2 }}>{chip.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' }}>{todayStr}</div>
                  <h1 style={{ fontSize: '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>Customers</h1>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => router.push('/dashboard/jobs')} style={btnOutline}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = TEXT; e.currentTarget.style.color = TEXT }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT2 }}
                  ><IconSpark size={12} /> Add Job</button>
                  <button onClick={() => router.push('/dashboard/jobs')} style={btnTeal}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.82' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                  >View Jobs</button>
                </div>
              </div>
              {/* Stat chips — unified card */}
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `2px solid ${TEAL}`, borderRadius: '12px', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {statChips.map((chip, i) => (
                  <div key={chip.label} onClick={chip.onClick}
                    style={{ padding: '14px 20px', cursor: 'pointer', borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none', transition: 'background 0.12s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = TEAL_LIGHT }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '4px' }}>{chip.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Customer Directory ── */}
          <div style={{ ...card, borderRadius: '18px', border: `1px solid ${BORDER}`, boxShadow: '0 8px 24px rgba(15,23,42,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: isMobile ? '16px' : '18px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: '14px', background: WHITE }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{ width: 4, height: 44, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em' }}>Customer Directory</span>
                    <span style={{ height: '22px', padding: '0 8px', borderRadius: '999px', border: `1px solid ${BORDER}`, background: '#F8FAFC', color: TEXT3, fontSize: '10px', fontWeight: 800, display: 'inline-flex', alignItems: 'center' }}>{filtered.length} shown</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '4px' }}>Detailed customer records with contact details, address, units, service timing, and review activity.</div>
                </div>
              </div>
              <div style={{ width: isMobile ? '100%' : '340px', maxWidth: '100%', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: TEXT3, display: 'inline-flex' }}><IconSearch size={15} /></span>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers, contact, suburb..."
                  style={{ height: '42px', width: '100%', borderRadius: '12px', border: `1px solid ${BORDER}`, padding: '0 12px 0 38px', fontSize: '12px', background: '#F8FAFC', color: TEXT, fontFamily: FONT, outline: 'none', fontWeight: 600 }}
                />
              </div>
            </div>

            {!isMobile && filtered.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1.3fr) 128px 128px 112px 28px', gap: '14px', alignItems: 'center', padding: '11px 20px', borderBottom: `1px solid ${BORDER}`, background: '#FCFCFD' }}>
                {['Customer', 'Contact', 'Units', 'Next service', 'Status'].map((label) => (
                  <div key={label} style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
                ))}
                <div />
              </div>
            )}

            {filtered.length === 0 ? (
              <div style={{ padding: '32px 18px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>No matching customers.</div>
            ) : (
              filtered.map((c) => {
                const s = statusPill(c.jobs)
                const nextJob = [...(c.jobs || [])].filter((j: any) => j?.next_service_date).sort((a: any, b: any) => {
                  const ad = parseDateLocal(a.next_service_date)?.getTime() || 0
                  const bd = parseDateLocal(b.next_service_date)?.getTime() || 0
                  return ad - bd
                })[0]
                const unitCount = c.jobs?.length || 0
                const latestUnit = c.jobs?.[0]
                const reviewCount = reviewClicks[c.id] || 0
                const contactLine = c.email || c.phone || 'No contact saved'
                const secondaryContact = c.email && c.phone ? c.phone : ''
                const addressLine = c.address || c.suburb || 'No address saved'
                const unitLine = latestUnit?.brand || latestUnit?.model ? `${latestUnit?.brand || ''} ${latestUnit?.model || ''}`.trim() : 'No unit details'
                const serviceDate = nextJob?.next_service_date ? parseDateLocal(nextJob.next_service_date)?.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : 'Not set'

                return (
                  <div key={c.id} onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                    style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.55fr) minmax(0,1.3fr) 128px 128px 112px 28px', gap: isMobile ? '12px' : '14px', alignItems: isMobile ? 'stretch' : 'center', margin: '10px 12px', padding: isMobile ? '14px' : '14px 16px', border: `1px solid ${BORDER}`, borderRadius: '14px', background: WHITE, cursor: 'pointer', transition: 'background 0.12s, border-color 0.12s, box-shadow 0.12s, transform 0.12s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FCFCFD'; e.currentTarget.style.borderColor = '#D5E6E4'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(15,23,42,0.07)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    {isMobile ? (
                      <div style={{ display: 'grid', gap: '11px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                          <div style={{ width: 4, alignSelf: 'stretch', minHeight: 54, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 850, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.first_name} {c.last_name}</div>
                            <div style={{ fontSize: '11px', color: TEXT3, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contactLine}</div>
                            {secondaryContact && <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px' }}>{secondaryContact}</div>}
                            <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{addressLine}</div>
                          </div>
                          <span style={{ color: TEXT3, display: 'inline-flex', alignItems: 'center', flexShrink: 0, marginTop: 2 }}><IconArrow size={12} /></span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div style={{ padding: '10px 11px', borderRadius: '12px', border: `1px solid ${BORDER}`, background: '#F8FAFC' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>Units</div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: TEXT2 }}>{unitCount} unit{unitCount === 1 ? '' : 's'}</div>
                            <div style={{ fontSize: '10px', color: TEXT3, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{unitLine}</div>
                          </div>
                          <div style={{ padding: '10px 11px', borderRadius: '12px', border: `1px solid ${BORDER}`, background: '#F8FAFC' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>Next service</div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: TEXT2 }}>{serviceDate}</div>
                            <div style={{ fontSize: '10px', color: TEXT3, marginTop: '3px' }}>{reviewCount} review click{reviewCount === 1 ? '' : 's'}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '6px 9px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap' }}>{s.label}</span>
                          <span style={{ fontSize: '11px', fontWeight: 750, color: TEAL_DARK }}>Open customer profile</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                          <div style={{ width: 4, alignSelf: 'stretch', minHeight: 46, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 850, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.first_name} {c.last_name}</div>
                            <div style={{ fontSize: '11px', color: TEXT3, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{addressLine}</div>
                            <div style={{ fontSize: '10px', fontWeight: 750, color: TEAL_DARK, marginTop: '5px' }}>{reviewCount} review click{reviewCount === 1 ? '' : 's'}</div>
                          </div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: 750, color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contactLine}</div>
                          {secondaryContact && <div style={{ fontSize: '11px', color: TEXT3, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{secondaryContact}</div>}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: TEXT2 }}>{unitCount} unit{unitCount === 1 ? '' : 's'}</div>
                          <div style={{ fontSize: '11px', color: TEXT3, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{unitLine}</div>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: TEXT2 }}>{serviceDate}</div>
                        <div>
                          <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '6px 9px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>{s.label}</span>
                        </div>
                        <div style={{ color: TEXT3, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end' }}><IconArrow size={12} /></div>
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}