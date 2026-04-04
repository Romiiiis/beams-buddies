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
  '/dashboard': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" fill="currentColor"/>
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity="0.3"/>
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity="0.3"/>
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity="0.6"/>
    </svg>
  ),
  '/dashboard/customers': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="5.5" cy="4.5" r="2.5" fill="currentColor" opacity="0.9"/>
      <path d="M1 13.5C1 11 3 9.5 5.5 9.5S10 11 10 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="11.5" cy="5" r="2" fill="currentColor" opacity="0.4"/>
      <path d="M10.5 13.5c0-1.5.8-2.7 2-3.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
    </svg>
  ),
  '/dashboard/jobs': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L14.5 7V14.5H1.5V7L8 1.5Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
      <path d="M8 7V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/quotes': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M9.5 1.5H4A1.5 1.5 0 002.5 3v10A1.5 1.5 0 004 14.5h8A1.5 1.5 0 0013.5 13V5.5L9.5 1.5Z" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M9.5 1.5V5.5H13.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M5.5 8.5h5M5.5 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/invoices': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.5 2.5h11v10l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1V2.5Z" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M8 4.5v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6 6c0-.8.9-1.5 2-1.5s2 .7 2 1.5-.9 1.5-2 1.5S6 8.3 6 9s.9 1.5 2 1.5 2-.7 2-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/revenue': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="9.5" width="2.5" height="5" rx="0.75" fill="currentColor" opacity="0.3"/>
      <rect x="6" y="6.5" width="2.5" height="8" rx="0.75" fill="currentColor" opacity="0.6"/>
      <rect x="10.5" y="2.5" width="2.5" height="12" rx="0.75" fill="currentColor"/>
      <path d="M1.5 1.5L5 5l3-2 4-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="1.5" r="1.2" fill="currentColor"/>
    </svg>
  ),
  '/dashboard/schedule': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 4.5V8.5l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="8" r="1" fill="currentColor"/>
    </svg>
  ),
  '/dashboard/qrcodes': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="2.75" y="2.75" width="2.5" height="2.5" rx="0.5" fill="currentColor"/>
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="10.75" y="2.75" width="2.5" height="2.5" rx="0.5" fill="currentColor"/>
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="2.75" y="10.75" width="2.5" height="2.5" rx="0.5" fill="currentColor"/>
      <path d="M9.5 9.5h2M11.5 9.5v2M9.5 11.5h2M11.5 11.5v2.5h2.5v-2.5M9.5 14h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  '/dashboard/reports': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.5 11.5l3-3.5 2.5 2 3-5 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.5 14.5h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="4.5" cy="8" r="1.2" fill="currentColor" opacity="0.4"/>
      <circle cx="7" cy="10" r="1.2" fill="currentColor" opacity="0.4"/>
      <circle cx="10" cy="5" r="1.2" fill="currentColor" opacity="0.4"/>
      <circle cx="13" cy="9" r="1.2" fill="currentColor" opacity="0.4"/>
    </svg>
  ),
  '/dashboard/settings': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6.5 1.5l-.5 1.5a5 5 0 00-1.5.9L3 3.5 1.5 6l1.2 1a4.5 4.5 0 000 2L1.5 10 3 12.5l1.5-.4a5 5 0 001.5.9l.5 1.5h3l.5-1.5a5 5 0 001.5-.9l1.5.4L14 10l-1.2-1a4.5 4.5 0 000-2L14 6l-1.5-2.5-1.5.4a5 5 0 00-1.5-.9L9 1.5H6.5Z" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.9"/>
    </svg>
  ),
}

function NavItem({ href, label, active, router }: { href: string; label: string; active: boolean; router: any }) {
  return (
    <div
      onClick={() => router.push(href)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 10px',
        borderRadius: '9px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: active ? '600' : '500',
        color: active ? WHITE : TEXT2,
        background: active ? TEAL : 'transparent',
        marginBottom: '1px',
        transition: 'background 0.12s, color 0.12s',
        boxShadow: active ? '0 2px 8px rgba(42,161,152,0.25)' : 'none',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = BG }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ color: active ? 'rgba(255,255,255,0.9)' : TEXT3, display: 'flex', flexShrink: 0 }}>
        {icons[href]}
      </span>
      {label}
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: '700', color: TEXT3,
      letterSpacing: '0.8px', textTransform: 'uppercase',
      padding: '14px 10px 5px',
    }}>
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
      width: '224px', flexShrink: 0,
      background: WHITE,
      borderRight: `1px solid ${BORDER}`,
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'sticky', top: 0, height: '100vh',
    }}>

      {/* LOGO HEADER */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 8px', borderRadius: '10px', cursor: 'pointer' }}
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
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '1px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                    {business?.full_name || ''}
                  </div>
                  <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px', lineHeight: 1.2, fontWeight: '500' }}>
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