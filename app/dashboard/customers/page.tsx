'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const A = '#1C1C1E'
const TEAL = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#EBEBEB'
const BG = '#FAFAF8'

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
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
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
      if (!userData) return

      const [customersRes, clicksRes, settingsRes] = await Promise.all([
        supabase.from('customers').select('*, jobs(id, brand, model, capacity_kw, next_service_date)').eq('business_id', userData.business_id).order('created_at', { ascending: false }),
        supabase.from('review_clicks').select('customer_id, platform').eq('business_id', userData.business_id),
        supabase.from('business_settings').select('google_review_url, facebook_review_url, custom_review_platforms').eq('business_id', userData.business_id).single(),
      ])

      let data = customersRes.data || []
      if (search) {
        data = data.filter((c: any) => `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase()))
      }
      setCustomers(data)

      const uniqueClicks: Record<string, Set<string>> = {}
      for (const click of clicksRes.data || []) {
        if (!uniqueClicks[click.customer_id]) uniqueClicks[click.customer_id] = new Set()
        uniqueClicks[click.customer_id].add(click.platform)
      }
      const clicks: Record<string, number> = {}
      for (const [cid, platforms] of Object.entries(uniqueClicks)) clicks[cid] = platforms.size
      setReviewClicks(clicks)

      const s = settingsRes.data
      setTotalPlatforms((s?.google_review_url ? 1 : 0) + (s?.facebook_review_url ? 1 : 0) + ((s?.custom_review_platforms || []).filter((p: any) => p.url).length))
      setLoading(false)
    }
    load()
  }, [search, router])

  function getDays(d: string) {
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function statusPill(jobs: any[]) {
    if (!jobs?.length) return { label: 'No units', bg: '#F0F0F0', color: '#555' }
    const next = jobs[0]?.next_service_date
    if (!next) return { label: 'No date', bg: '#F0F0F0', color: '#555' }
    const days = getDays(next)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#D1FAE5', color: '#064E3B' }
  }

  const pad = isMobile ? '16px' : '32px'

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/customers" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* Flush header */}
        <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: isMobile ? '20px 16px 16px' : `24px ${pad} 20px` }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: TEXT, letterSpacing: '-0.5px', lineHeight: 1 }}>Customers</div>
              <div style={{ fontSize: '13px', color: TEXT3, marginTop: '5px' }}>{customers.length} total</div>
            </div>
            <button onClick={() => router.push('/dashboard/jobs')}
              style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Add job
            </button>
          </div>

          {/* Search */}
          <div style={{ marginTop: '16px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
              style={{ width: '100%', maxWidth: '360px', height: '38px', padding: '0 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: BG, fontSize: '13px', color: TEXT, outline: 'none', fontFamily: 'inherit' }}/>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: `24px ${pad}`, paddingBottom: isMobile ? '90px' : '32px' }}>
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
          ) : customers.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
              No customers yet. <span style={{ color: TEAL, cursor: 'pointer' }} onClick={() => router.push('/dashboard/jobs')}>Add your first job →</span>
            </div>
          ) : isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {customers.map((c, i) => {
                const av = avColors[i % avColors.length]
                const s = statusPill(c.jobs)
                const clicks = reviewClicks[c.id] || 0
                const hasClicks = clicks > 0
                return (
                  <div key={c.id} onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                    style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '14px 16px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
                          {(c.first_name?.[0] || '') + (c.last_name?.[0] || '')}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>{c.first_name} {c.last_name}</div>
                          <div style={{ fontSize: '12px', color: TEXT3, marginTop: '1px' }}>{c.suburb || c.address || '—'}</div>
                        </div>
                      </div>
                      <span style={{ background: s.bg, color: s.color, padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{s.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', paddingLeft: '46px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: TEXT3 }}>{c.phone || '—'}</span>
                      <span style={{ fontSize: '12px', color: TEXT3 }}>{c.jobs?.length || 0} unit{c.jobs?.length !== 1 ? 's' : ''}</span>
                      {totalPlatforms > 0 && hasClicks && <span style={{ fontSize: '12px', color: '#92400E' }}>⭐ {clicks}/{totalPlatforms}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FAFAF8' }}>
                    {['Customer', 'Phone', 'Units', 'Next service', 'Reviews', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '11px 22px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: TEXT3, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap', textTransform: 'uppercase' as const, letterSpacing: '0.4px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => {
                    const av = avColors[i % avColors.length]
                    const s = statusPill(c.jobs)
                    const clicks = reviewClicks[c.id] || 0
                    const hasClicks = clicks > 0
                    return (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }}
                        onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                        onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF8')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '13px 22px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
                              {(c.first_name?.[0] || '') + (c.last_name?.[0] || '')}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT }}>{c.first_name} {c.last_name}</div>
                              <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{c.suburb || c.address || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '13px 22px', fontSize: '13px', color: TEXT2 }}>{c.phone || '—'}</td>
                        <td style={{ padding: '13px 22px', fontSize: '13px', color: TEXT2, textAlign: 'center' }}>{c.jobs?.length || 0}</td>
                        <td style={{ padding: '13px 22px', fontSize: '13px', color: TEXT2 }}>{c.jobs?.[0]?.next_service_date ? new Date(c.jobs[0].next_service_date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) : '—'}</td>
                        <td style={{ padding: '13px 22px' }}>
                          {totalPlatforms > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: hasClicks ? '#FEF3C7' : '#F5F5F5', padding: '3px 9px', borderRadius: '20px', border: `1px solid ${hasClicks ? '#FDE68A' : BORDER}` }}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l1.4 2.8 3.1.5-2.2 2.2.5 3.1L6 8.2 3.2 9.6l.5-3.1L1.5 4.3l3.1-.5L6 1z" fill={hasClicks ? '#F59E0B' : '#D1D5DB'} stroke={hasClicks ? '#D97706' : '#9CA3AF'} strokeWidth="0.5"/></svg>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: hasClicks ? '#92400E' : '#9CA3AF' }}>{clicks}/{totalPlatforms}</span>
                              </div>
                              {hasClicks && <span style={{ fontSize: '11px', color: TEXT3 }}>clicked</span>}
                            </div>
                          ) : <span style={{ fontSize: '12px', color: TEXT3 }}>—</span>}
                        </td>
                        <td style={{ padding: '13px 22px' }}>
                          <span style={{ background: s.bg, color: s.color, padding: '4px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{s.label}</span>
                        </td>
                        <td style={{ padding: '13px 22px', textAlign: 'right' }}>
                          <span style={{ color: TEXT3, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>View →</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}