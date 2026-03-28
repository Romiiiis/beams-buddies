'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/lib/useBusiness'
import QRCode from 'qrcode'

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

function Sidebar({ active, router, onSignOut, logoUrl, businessName, userName, userTitle }: {
  active: string, router: any, onSignOut: () => void,
  logoUrl?: string, businessName?: string, userName?: string, userTitle?: string
}) {
  const initials = userName ? userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'RA'
  return (
    <div style={{ width: '232px', flexShrink: 0, background: '#fff', borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <img src="https://static.wixstatic.com/media/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png" alt="Jobyra" style={{ width: '56px', height: '56px', borderRadius: '9px', objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: TEXT, letterSpacing: '-0.3px' }}>Jobyra</div>
            <div style={{ fontSize: '12px', color: TEXT3, marginTop: '1px' }}>{businessName || 'Your business'}</div>
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
            <img src={logoUrl} alt={userName || 'Logo'} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'contain', background: '#fff', padding: '2px', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#CCEFED', color: '#0A4F4C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}>{initials}</div>
          )}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>{userName || 'Owner'}</div>
            <div style={{ fontSize: '11px', color: TEXT3 }}>{userTitle || 'Owner'}</div>
          </div>
        </div>
        <button onClick={onSignOut} style={{ fontSize: '12px', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
      </div>
    </div>
  )
}

export default function QRCodesPage() {
  const router = useRouter()
  const business = useBusiness()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return
      const { data } = await supabase.from('jobs').select('id, qr_code_token, brand, model, capacity_kw, install_date, customers(first_name, last_name, suburb)').eq('business_id', userData.business_id).order('created_at', { ascending: false })
      setJobs(data || [])
      const urls: Record<string, string> = {}
      for (const job of data || []) {
        const url = `${window.location.origin}/register/${job.qr_code_token}`
        urls[job.id] = await QRCode.toDataURL(url, { width: 140, margin: 1 })
      }
      setQrUrls(urls)
      setLoading(false)
    }
    load()
  }, [router])

  async function downloadQR(jobId: string, name: string) {
    const url = qrUrls[jobId]
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${name.replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
  }

  async function signOut() { await supabase.auth.signOut(); router.push('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/qrcodes" router={router} onSignOut={signOut}
        logoUrl={business?.logo_url || ''} businessName={business?.name || ''}
        userName={business?.full_name || ''} userTitle={business?.role_title || ''} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ height: '58px', background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '17px', fontWeight: '600', color: TEXT }}>QR codes</div>
          <button onClick={() => router.push('/dashboard/jobs')}
            style={{ height: '36px', padding: '0 18px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Add job
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 30px' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Generating QR codes…</div>
          ) : jobs.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
              No jobs yet. <span style={{ color: A, cursor: 'pointer' }} onClick={() => router.push('/dashboard/jobs')}>Add your first job →</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px' }}>
              {jobs.map(job => {
                const name = `${job.customers?.first_name} ${job.customers?.last_name}`
                return (
                  <div key={job.id} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '24px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    {qrUrls[job.id] ? (
                      <img src={qrUrls[job.id]} alt="QR code" style={{ width: '140px', height: '140px', marginBottom: '16px', borderRadius: '8px' }}/>
                    ) : (
                      <div style={{ width: '140px', height: '140px', background: BG, borderRadius: '8px', marginBottom: '16px' }}/>
                    )}
                    <div style={{ fontSize: '15px', fontWeight: '600', color: TEXT, marginBottom: '4px' }}>{name}</div>
                    <div style={{ fontSize: '13px', color: TEXT2, marginBottom: '4px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} — {job.customers?.suburb || '—'}</div>
                    <div style={{ fontSize: '11px', color: TEXT3, fontFamily: 'monospace', marginBottom: '18px' }}>{job.qr_code_token?.slice(0, 20)}…</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => downloadQR(job.id, name)} style={{ height: '34px', padding: '0 16px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT2, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Download</button>
                      <button onClick={() => window.print()} style={{ height: '34px', padding: '0 16px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Print</button>
                    </div>
                  </div>
                )
              })}
              <div onClick={() => router.push('/dashboard/jobs')}
                style={{ background: '#fff', border: `1px dashed ${BORDER}`, borderRadius: '12px', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '10px', minHeight: '260px' }}
                onMouseEnter={e => (e.currentTarget.style.background = BG)}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: TEXT3 }}>+</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT2 }}>Add new job</div>
                <div style={{ fontSize: '12px', color: TEXT3 }}>QR generated automatically</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}