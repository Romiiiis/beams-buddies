'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusinessData } from '@/lib/business-context'

const TEAL = '#2AA198'
const TEAL_DARK = '#1E8C84'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#6B7280'
const BORDER = '#E5E7EB'
const BG = '#F4F4F2'
const WHITE = '#FFFFFF'

const navMain = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Customers', href: '/dashboard/customers' },
  { label: 'Add job', href: '/dashboard/jobs' },
]

const navFinance = [
  { label: 'Quotes', href: '/dashboard/quotes' },
  { label: 'Invoices', href: '/dashboard/invoices' },
  { label: 'Revenue', href: '/dashboard/revenue' },
]

const navManage = [
  { label: 'Service schedule', href: '/dashboard/schedule' },
  { label: 'QR codes', href: '/dashboard/qrcodes' },
  { label: 'Reports', href: '/dashboard/reports' },
  { label: 'Settings', href: '/dashboard/settings' },
]

const bottomTabs = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Customers', href: '/dashboard/customers' },
  { label: 'Add job', href: '/dashboard/jobs' },
  { label: 'Schedule', href: '/dashboard/schedule' },
  { label: 'Settings', href: '/dashboard/settings' },
]

const icons: Record<string, React.ReactElement> = {
  // Dashboard — bold 2x2 grid, top-left filled
  '/dashboard': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="10" y="1" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.35"/>
      <rect x="1" y="10" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.35"/>
      <rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6"/>
    </svg>
  ),

  // Customers — solid person + smaller second person
  '/dashboard/customers': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7" cy="5" r="3" fill="currentColor"/>
      <path d="M1 16c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="14" cy="6" r="2" fill="currentColor" opacity="0.45"/>
      <path d="M14 11.5c1.7.5 3 1.8 3 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.45"/>
    </svg>
  ),

  // Add job — bold house with plus
  '/dashboard/jobs': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 8.5L9 2l7 6.5V16.5H2V8.5Z" fill="currentColor" opacity="0.2"/>
      <path d="M2 8.5L9 2l7 6.5V16.5H2V8.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M9 10v4M7 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Quotes — doc with folded corner + lines
  '/dashboard/quotes': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M11 1.5H4.5A1.5 1.5 0 003 3v12a1.5 1.5 0 001.5 1.5H13.5A1.5 1.5 0 0015 15V5.5L11 1.5Z" fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M11 1.5V5.5H15" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M6 9.5h6M6 12.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),

  // Invoices — receipt with dollar
  '/dashboard/invoices': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 2h12v13l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L3 15V2Z" fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 5v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 6.5C7 5.7 7.9 5 9 5s2 .7 2 1.5S10.1 8 9 8s-2 .8-2 1.5S7.9 11 9 11s2-.7 2-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),

  // Revenue — 3 bars rising + trend arrow
  '/dashboard/revenue': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="11" width="4" height="6" rx="1" fill="currentColor" opacity="0.35"/>
      <rect x="7" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.6"/>
      <rect x="13" y="3" width="4" height="14" rx="1" fill="currentColor"/>
      <path d="M1.5 10L5 7l3 2 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 4h4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Schedule — clock, bold hands
  '/dashboard/schedule': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 5V9.5L12 11.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // QR codes — classic QR finder pattern
  '/dashboard/qrcodes': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      {/* top-left finder */}
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <rect x="3" y="3" width="2" height="2" fill="currentColor"/>
      {/* top-right finder */}
      <rect x="11" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <rect x="13" y="3" width="2" height="2" fill="currentColor"/>
      {/* bottom-left finder */}
      <rect x="1" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <rect x="3" y="13" width="2" height="2" fill="currentColor"/>
      {/* bottom-right data dots */}
      <rect x="11" y="11" width="2" height="2" rx="0.5" fill="currentColor"/>
      <rect x="15" y="11" width="2" height="2" rx="0.5" fill="currentColor"/>
      <rect x="11" y="15" width="2" height="2" rx="0.5" fill="currentColor"/>
      <rect x="13" y="13" width="2" height="2" rx="0.5" fill="currentColor" opacity="0.4"/>
      <rect x="15" y="15" width="2" height="2" rx="0.5" fill="currentColor"/>
    </svg>
  ),

  // Reports — line chart with dots
  '/dashboard/reports': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M2 13l3.5-4 3 3 4-6 3 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="5.5" cy="9" r="1.5" fill="currentColor"/>
      <circle cx="8.5" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="12.5" cy="6" r="1.5" fill="currentColor"/>
      <circle cx="15.5" cy="10" r="1.5" fill="currentColor"/>
    </svg>
  ),

  // Settings — bold gear
  '/dashboard/settings': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M9 12a3 3 0 100-6 3 3 0 000 6Z" fill="currentColor"/>
      <path d="M7.2 1.5l-.6 1.8a6 6 0 00-1.8 1L3 3.6 1.5 6.3l1.5 1.2a5.8 5.8 0 000 3L1.5 11.7 3 14.4l1.8-.7a6 6 0 001.8 1l.6 1.8h3.6l.6-1.8a6 6 0 001.8-1l1.8.7 1.5-2.7-1.5-1.2a5.8 5.8 0 000-3l1.5-1.2L15 3.6l-1.8.7a6 6 0 00-1.8-1l-.6-1.8H7.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
}

function NavItem({ href, label, active, router }: { href: string; label: string; active: boolean; router: any }) {
  return (
    <div
      onClick={() => router.push(href)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 10px', borderRadius: '9px', cursor: 'pointer',
        fontSize: '13px', fontWeight: active ? '600' : '500',
        color: active ? WHITE : TEXT2,
        background: active ? TEAL : 'transparent',
        marginBottom: '1px',
        boxShadow: active ? '0 2px 8px rgba(42,161,152,0.28)' : 'none',
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = BG }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ color: active ? 'rgba(255,255,255,0.92)' : TEXT3, display: 'flex', flexShrink: 0 }}>
        {icons[href]}
      </span>
      {label}
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: '700', color: TEXT3, letterSpacing: '0.8px', textTransform: 'uppercase', padding: '14px 10px 5px' }}>
      {label}
    </div>
  )
}

export function Sidebar({ active }: { active: string }) {
  const router = useRouter()
  const { business, loading } = useBusinessData()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const initials = business?.full_name
    ? business.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : ''

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: WHITE, borderTop: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}>
        {bottomTabs.map(tab => {
          const isActive = tab.href === active
          return (
            <div key={tab.href} onClick={() => router.push(tab.href)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 4px 8px', cursor: 'pointer', gap: '4px', color: isActive ? TEAL : TEXT3 }}>
              <span style={{ display: 'flex', color: isActive ? TEAL : TEXT3 }}>{icons[tab.href]}</span>
              <span style={{ fontSize: '10px', fontWeight: isActive ? '700' : '400' }}>{tab.label}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{
      width: '224px', flexShrink: 0, background: WHITE,
      borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'sticky', top: 0, height: '100vh',
    }}>

      {/* HEADER */}
      <div style={{ padding: '18px 16px 16px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="https://static.wixstatic.com/media/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png/v1/fill/w_200,h_200/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png"
            alt="Jobyra"
            style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: TEXT, letterSpacing: '-0.3px' }}>Jobyra</div>
            {loading ? (
              <div style={{ width: '70px', height: '9px', background: BG, borderRadius: '4px', marginTop: '4px' }}/>
            ) : (
              <div style={{ fontSize: '10px', color: TEXT3, marginTop: '2px', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: '600' }}>
                {business?.name || 'Trade CRM'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={{ padding: '6px 8px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <SectionLabel label="Overview"/>
        {navMain.map(item => <NavItem key={item.href} href={item.href} label={item.label} active={item.href === active} router={router}/>)}

        <SectionLabel label="Finance"/>
        {navFinance.map(item => <NavItem key={item.href} href={item.href} label={item.label} active={item.href === active} router={router}/>)}

        <SectionLabel label="Manage"/>
        {navManage.map(item => <NavItem key={item.href} href={item.href} label={item.label} active={item.href === active} router={router}/>)}

        <div style={{ flex: 1 }}/>

        {/* USER FOOTER */}
        <div style={{ padding: '8px 2px 4px', borderTop: `1px solid ${BORDER}`, marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = BG}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {loading ? (
              <>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: BG, flexShrink: 0 }}/>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ width: '90px', height: '10px', background: BG, borderRadius: '4px' }}/>
                  <div style={{ width: '58px', height: '9px', background: BG, borderRadius: '4px' }}/>
                </div>
              </>
            ) : (
              <>
                {business?.logo_url ? (
                  <img src={business.logo_url} alt="Logo" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'contain', flexShrink: 0, border: `1px solid ${BORDER}` }}/>
                ) : (
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `linear-gradient(135deg, #33B5AC, ${TEAL_DARK})`, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                    {initials}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                    {business?.full_name || ''}
                  </div>
                  <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px', fontWeight: '500' }}>
                    {business?.role_title || 'Owner'}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); signOut() }}
                  style={{ fontSize: '11px', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', flexShrink: 0, fontWeight: '500' }}
                  onMouseEnter={e => e.currentTarget.style.color = TEXT}
                  onMouseLeave={e => e.currentTarget.style.color = TEXT3}>
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}