'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#475569'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TYPE = {
  label: { fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: TEXT3 },
  title: { fontSize: '13px', fontWeight: 700, color: TEXT2 },
  titleSm: { fontSize: '12px', fontWeight: 800, color: TEXT },
  body: { fontSize: '12px', fontWeight: 500, color: TEXT2 },
  bodySm: { fontSize: '11px', fontWeight: 500, color: TEXT3 },
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
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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

  function getDays(d: string) {
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function statusPill(jobs: any[]) {
    if (!jobs?.length) return { label: 'No units', bg: '#F1F5F9', color: TEXT3 }
    const next = jobs[0]?.next_service_date
    if (!next) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }

    const days = getDays(next)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#DCFCE7', color: '#166534' }
  }

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
  }

  const sectionLabel: React.CSSProperties = {
    ...TYPE.label,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  }

  const sectionDash = (
    <span
      style={{
        width: '12px',
        height: '2px',
        background: TEAL,
        borderRadius: '999px',
      }}
    />
  )

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
  }

  const filtered = useMemo(() => {
    if (!search) return customers
    return customers.filter(c =>
      `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
    )
  }, [customers, search])

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: FONT, background: BG }}>
      <Sidebar active="/dashboard/customers" />

      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <div
          style={{
            background: HEADER_BG,
            padding: isMobile ? '18px 16px 16px' : '20px 24px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'flex-end',
            justifyContent: 'space-between',
            gap: '14px',
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>
              {todayStr}
            </div>
            <div style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
              Customers
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/dashboard/jobs')}
              style={{
                ...quickActionStyle,
                background: TEAL,
                color: '#FFFFFF',
                border: 'none',
              }}
            >
              <IconSpark size={16} />
              Add job
            </button>
          </div>
        </div>

        <div style={{ padding: isMobile ? '14px' : '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customers..."
              style={{
                height: '38px',
                borderRadius: '10px',
                border: `1px solid ${BORDER}`,
                padding: '0 12px',
                fontSize: '12px',
                width: '280px',
                maxWidth: '100%',
                background: WHITE,
                color: TEXT,
                fontFamily: FONT,
                outline: 'none',
              }}
            />
            <div style={TYPE.body}>{filtered.length} total</div>
          </div>

          {loading ? (
            <div style={{ ...shellCard, padding: '40px', textAlign: 'center', color: TEXT3 }}>Loading...</div>
          ) : (
            <div style={shellCard}>
              <div style={{ padding: '14px' }}>
                <div style={sectionLabel}>{sectionDash}Directory</div>

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
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {filtered.map((c, i) => {
                      const av = avColors[i % avColors.length]
                      const s = statusPill(c.jobs)
                      const clicks = reviewClicks[c.id] || 0
                      const hasClicks = clicks > 0

                      return (
                        <div
                          key={c.id}
                          onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                          style={{
                            borderRadius: '12px',
                            border: `1px solid ${BORDER}`,
                            padding: '12px 14px',
                            background: WHITE,
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.2fr) auto auto',
                            gap: '10px',
                            alignItems: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0 }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '12px',
                                background: av.bg,
                                color: av.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '12px',
                                flexShrink: 0,
                              }}
                            >
                              {(c.first_name?.[0] || '') + (c.last_name?.[0] || '')}
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <div style={{ ...TYPE.titleSm, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.first_name} {c.last_name}
                              </div>
                              <div style={{ ...TYPE.bodySm, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.suburb || c.address || 'No suburb'}
                              </div>
                            </div>
                          </div>

                          {!isMobile && (
                            <div style={{ textAlign: 'right' }}>
                              <div style={TYPE.body}>{c.jobs?.length || 0} unit{c.jobs?.length !== 1 ? 's' : ''}</div>
                              {totalPlatforms > 0 && (
                                <div style={{ ...TYPE.bodySm, marginTop: '3px' }}>
                                  {hasClicks ? `${clicks}/${totalPlatforms} review clicks` : 'No review clicks'}
                                </div>
                              )}
                            </div>
                          )}

                          <div style={{ justifySelf: isMobile ? 'start' : 'end' }}>
                            <span
                              style={{
                                background: s.bg,
                                color: s.color,
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '10px',
                                fontWeight: 800,
                                display: 'inline-block',
                                letterSpacing: '0.02em',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {s.label}
                            </span>
                          </div>

                          {isMobile && (
                            <div style={{ ...TYPE.bodySm, paddingLeft: '46px' }}>
                              {c.jobs?.length || 0} unit{c.jobs?.length !== 1 ? 's' : ''}
                              {totalPlatforms > 0 && hasClicks ? ` • ${clicks}/${totalPlatforms} review clicks` : ''}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}