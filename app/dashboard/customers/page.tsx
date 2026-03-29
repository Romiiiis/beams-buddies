'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusinessData } from '@/app/dashboard/layout'

const A = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#DEDEDE'
const BG = '#F2F3F3'

const navMain = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Customers', href: '/dashboard/customers' },
  { label: 'Add job', href: '/dashboard/jobs' },
]
const navManage = [
  { label: 'Service schedule', href: '/dashboard/schedule' },
  { label: 'QR codes', href: '/dashboard/qrcodes' },
  { label: 'Reports', href: '/dashboard/reports' },
  { label: 'Settings', href: '/dashboard/settings' },
]
const icons: Record<string, React.ReactElement> = {
  '/dashboard': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor"/><rect x="8.5" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/><rect x="2" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/></svg>,
  '/dashboard/customers': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2 13c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 8l1.5 1.5L15 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  '/dashboard/jobs': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3" width="11" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 3V2M11 3V2M2.5 7h11M8 9.5v3M6.5 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  '/dashboard/schedule': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 6v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  '/dashboard/qrcodes': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M9 11.5h5M11.5 9v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  '/dashboard/reports': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12.5l3.5-4 3 2.5 3-5.5 3 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  '/dashboard/settings': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
}

const avColors = [
  { bg: '#CCEFED', color: '#0A4F4C' },
  { bg: '#DBEAFE', color: '#1E3A8A' },
  { bg: '#FEF3C7', color: '#78350F' },
  { bg: '#EDE9FE', color: '#4C1D95' },
  { bg: '#FFE4E6', color: '#881337' },
]

function Sidebar({ active, router, onSignOut, logoUrl, businessName, userName, userTitle }: { active: string, router: any, onSignOut: () => void, logoUrl?: string, businessName?: string, userName?: string, userTitle?: string }) {
  const initials = userName ? userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'RA'
  return (
    <div style={{ width: '232px', flexShrink: 0, background: '#fff', borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <img src="https://static.wixstatic.com/media/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png/v1/fill/w_200,h_200/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png" alt="Jobyra" style={{ width: '56px', height: '56px', borderRadius: '9px', objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: TEXT, letterSpacing: '-0.3px' }}>Jobyra</div>
            <div style={{ fontSize: '12px', color: TEXT3, marginTop: '1px' }}>{businessName || 'Trade CRM'}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, letterSpacing: '0.6px', textTransform: 'uppercase' as const, padding: '10px 10px 6px' }}>Main</div>
        {navMain.map(item => {
          const isActive = item.href === active
          return (
            <div key={item.href} onClick={() => router.push(item.href)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: isActive ? '#0A4F4C' : TEXT2, fontWeight: isActive ? '600' : '400', background: isActive ? '#CCEFED' : 'transparent', marginBottom: '2px' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F0F0F0' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
              <span style={{ color: isActive ? A : TEXT3, display: 'flex', flexShrink: 0 }}>{icons[item.href]}</span>
              {item.label}
            </div>
          )
        })}
        <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, letterSpacing: '0.6px', textTransform: 'uppercase' as const, padding: '14px 10px 6px' }}>Manage</div>
        {navManage.map(item => {
          const isActive = item.href === active
          return (
            <div key={item.href} onClick={() => router.push(item.href)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: isActive ? '#0A4F4C' : TEXT2, fontWeight: isActive ? '600' : '400', background: isActive ? '#CCEFED' : 'transparent', marginBottom: '2px' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F0F0F0' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
              <span style={{ color: isActive ? A : TEXT3, display: 'flex', flexShrink: 0 }}>{icons[item.href]}</span>
              {item.label}
            </div>
          )
        })}
      </div>
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {logoUrl ? (
                <img src={logoUrl} alt={businessName || 'Logo'} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'contain', background: '#fff', padding: '2px', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#CCEFED', color: '#0A4F4C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}>{initials}</div>
              )}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>{userName || ''}</div>
            <div style={{ fontSize: '11px', color: TEXT3 }}>{userTitle || ''}</div>
          </div>
        </div>
        <button onClick={onSignOut} style={{ fontSize: '12px', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const router = useRouter()
  const business = useBusinessData()
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
    if (!jobs?.length) return { label: 'No units', bg: '#EBEBEB', color: '#3A3A3A' }
    const next = jobs[0]?.next_service_date
    if (!next) return { label: 'No date', bg: '#EBEBEB', color: '#3A3A3A' }
    const days = getDays(next)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#D1FAE5', color: '#064E3B' }
  }

  async function signOut() { await supabase.auth.signOut(); router.push('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/customers" router={router} onSignOut={signOut} logoUrl={business?.logo_url || ''} businessName={business?.name || ''} userName={business?.full_name || ''} userTitle={business?.role_title || ''} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ height: '58px', background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '17px', fontWeight: '600', color: TEXT }}>Customers</div>
          <button onClick={() => router.push('/dashboard/jobs')}
            style={{ height: '36px', padding: '0 18px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Add job
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 30px' }}>
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 22px', borderBottom: `1px solid ${BORDER}` }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
                style={{ width: '100%', height: '36px', padding: '0 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: BG, fontSize: '14px', color: TEXT, outline: 'none', fontFamily: 'inherit' }}/>
            </div>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
            ) : customers.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
                No customers yet. <span style={{ color: A, cursor: 'pointer' }} onClick={() => router.push('/dashboard/jobs')}>Add your first job →</span>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8F8F8' }}>
                    {['Customer', 'Phone', 'Units', 'Next service', 'Reviews', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: TEXT3, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>{h}</th>
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
                      <tr key={c.id} style={{ borderBottom: '1px solid #F0F0F0', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
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
                        <td style={{ padding: '13px 22px', fontSize: '14px', color: TEXT2 }}>{c.phone || '—'}</td>
                        <td style={{ padding: '13px 22px', fontSize: '14px', color: TEXT2, textAlign: 'center' }}>{c.jobs?.length || 0}</td>
                        <td style={{ padding: '13px 22px', fontSize: '14px', color: TEXT2 }}>{c.jobs?.[0]?.next_service_date ? new Date(c.jobs[0].next_service_date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) : '—'}</td>
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
                          <span style={{ color: A, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }} onClick={() => router.push(`/dashboard/customers/${c.id}`)}>View →</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}