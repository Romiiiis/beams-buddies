'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/lib/useBusiness'

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

function Sidebar({ active, router, onSignOut, logoUrl, businessName }: { active: string, router: any, onSignOut: () => void, logoUrl?: string, businessName?: string }) {
  return (
    <div style={{ width: '232px', flexShrink: 0, background: '#fff', borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <img src="https://static.wixstatic.com/media/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png" alt="Jobyra" style={{ width: '56px', height: '56px', borderRadius: '9px', objectFit: 'cover', flexShrink: 0 }} />
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
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#CCEFED', color: '#0A4F4C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}>RA</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>Ramiz Arib</div>
            <div style={{ fontSize: '11px', color: TEXT3 }}>Owner</div>
          </div>
        </div>
        <button onClick={onSignOut} style={{ fontSize: '12px', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const router = useRouter()
  const business = useBusiness()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return

      const [customersRes, jobsRes] = await Promise.all([
        supabase.from('customers').select('id, created_at').eq('business_id', userData.business_id),
        supabase.from('jobs').select('id, brand, install_date, next_service_date, created_at').eq('business_id', userData.business_id),
      ])

      const today = new Date()
      const jobs = jobsRes.data || []
      const customers = customersRes.data || []

      const jobsThisMonth = jobs.filter(j => {
        const d = new Date(j.created_at)
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
      }).length

      const overdue = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today).length
      const dueSoon = jobs.filter(j => {
        if (!j.next_service_date) return false
        const diff = Math.floor((new Date(j.next_service_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return diff >= 0 && diff <= 30
      }).length

      const brandCounts = jobs.reduce((acc: any, j) => { acc[j.brand] = (acc[j.brand] || 0) + 1; return acc }, {})
      const sortedBrands: [string, number][] = Object.entries(brandCounts).sort((a: any, b: any) => b[1] - a[1]) as [string, number][]
      const maxBrand = (sortedBrands[0]?.[1] as number) || 1

      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        return { key: `month-${i}`, label: d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) }
      })

      const monthCounts: Record<string, number> = {}
      jobs.forEach(j => {
        const d = new Date(j.created_at)
        const key = d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
        monthCounts[key] = (monthCounts[key] || 0) + 1
      })
      const maxMonth = Math.max(...last6Months.map(m => monthCounts[m.label] || 0), 1)

      setData({ totalCustomers: customers.length, totalJobs: jobs.length, jobsThisMonth, overdue, dueSoon, sortedBrands, maxBrand, last6Months, monthCounts, maxMonth })
      setLoading(false)
    }
    load()
  }, [router])

  async function signOut() { await supabase.auth.signOut(); router.push('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/reports" router={router} onSignOut={signOut} logoUrl={business?.logo_url || ''} businessName={business?.name || ''} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ height: '58px', background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '17px', fontWeight: '600', color: TEXT }}>Reports</div>
          <button style={{ height: '36px', padding: '0 18px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT2, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>Export PDF</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 30px' }}>
          {loading || !data ? (
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Total customers', value: data.totalCustomers, topBar: A, valColor: TEXT },
                  { label: 'Total units', value: data.totalJobs, topBar: A, valColor: TEXT },
                  { label: 'Jobs this month', value: data.jobsThisMonth, topBar: A, valColor: TEXT },
                  { label: 'Overdue services', value: data.overdue, topBar: data.overdue > 0 ? '#EF4444' : A, valColor: data.overdue > 0 ? '#B91C1C' : TEXT },
                ].map(s => (
                  <div key={s.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ height: '3px', background: s.topBar }} />
                    <div style={{ padding: '16px 20px 18px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT2, marginBottom: '10px' }}>{s.label}</div>
                      <div style={{ fontSize: '30px', fontWeight: '600', color: s.valColor, lineHeight: 1, marginBottom: '6px' }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px 22px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '18px' }}>Jobs by month</div>
                  {data.last6Months.map((month: { key: string, label: string }) => {
                    const count = data.monthCounts[month.label] || 0
                    const pct = Math.round((count / data.maxMonth) * 100)
                    return (
                      <div key={month.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '12px', color: TEXT3, width: '68px', textAlign: 'right', flexShrink: 0 }}>{month.label}</div>
                        <div style={{ flex: 1, height: '8px', background: BG, borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: A, borderRadius: '4px' }}/>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, width: '24px', textAlign: 'right', flexShrink: 0 }}>{count}</div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px 22px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '18px' }}>Units by brand</div>
                  {data.sortedBrands.length === 0 ? (
                    <div style={{ fontSize: '13px', color: TEXT3 }}>No data yet</div>
                  ) : data.sortedBrands.map(([brand, count]: [string, number]) => {
                    const pct = Math.round((count / data.maxBrand) * 100)
                    return (
                      <div key={brand} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '12px', color: TEXT3, width: '68px', textAlign: 'right', flexShrink: 0 }}>{brand}</div>
                        <div style={{ flex: 1, height: '8px', background: BG, borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: A, borderRadius: '4px' }}/>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, width: '24px', textAlign: 'right', flexShrink: 0 }}>{count}</div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px 22px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '16px' }}>Service compliance</div>
                  {[
                    { label: 'Total units tracked', value: data.totalJobs, color: TEXT },
                    { label: 'Overdue services', value: data.overdue, color: data.overdue > 0 ? '#B91C1C' : TEXT },
                    { label: 'Due within 30 days', value: data.dueSoon, color: data.dueSoon > 0 ? '#92400E' : TEXT },
                    { label: 'Up to date', value: data.totalJobs - data.overdue - data.dueSoon, color: '#065F46' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
                      <span style={{ fontSize: '13px', color: TEXT2 }}>{row.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px 22px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '16px' }}>Customer summary</div>
                  {[
                    { label: 'Total customers', value: data.totalCustomers },
                    { label: 'Jobs this month', value: data.jobsThisMonth },
                    { label: 'Total units installed', value: data.totalJobs },
                    { label: 'Avg units per customer', value: data.totalCustomers > 0 ? (data.totalJobs / data.totalCustomers).toFixed(1) : '0' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
                      <span style={{ fontSize: '13px', color: TEXT2 }}>{row.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}