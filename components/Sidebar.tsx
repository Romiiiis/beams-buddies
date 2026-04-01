'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusinessData } from '@/lib/business-context'

const A = '#1A6B5C'
const A_LIGHT = '#E8F4F1'
const TEXT = '#111111'
const TEXT2 = '#444444'
const TEXT3 = '#999999'
const BORDER = 'rgba(0,0,0,0.08)'

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
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" fill="currentColor"/>
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/>
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/>
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  '/dashboard/customers': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1.5 13.5c0-2.2 2-3.5 4.5-3.5s4.5 1.3 4.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11 8.5l1.5 1.5 2-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  '/dashboard/jobs': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5.5 3.5V2.5M10.5 3.5V2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M2 7h12" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 10v2.5M6.5 11.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/quotes': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/invoices': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5 12h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/revenue': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5v13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5 5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5-1.3 2.5-3 2.5S5 9 5 10.3s1.3 2.2 3 2.2 3-1 3-2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/schedule': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 5.5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  '/dashboard/qrcodes': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M9 11.5h5.5M11.5 9v5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/reports': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12.5l3.5-4 3 2.5 3-5.5 2.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 14.5h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/settings': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
}

function NavItem({ href, label, active, router }: { href: string; label: string; active: boolean; router: any }) {
  return (
    <div
      onClick={() => router.push(href)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
        fontSize: '13.5px',
        color: active ? A : TEXT2,
        fontWeight: active ? '500' : '400',
        background: active ? A_LIGHT : 'transparent',
        marginBottom: '1px',
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F5F5F2' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ color: active ? A : TEXT3, display: 'flex', flexShrink: 0 }}>{icons[href]}</span>
      {label}
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: '500', color: TEXT3,
      letterSpacing: '0.8px', textTransform: 'uppercase' as const,
      padding: '12px 10px 5px',
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
        background: '#fff', borderTop: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {bottomTabs.map(tab => {
          const isActive = tab.href === active
          return (
            <div key={tab.href} onClick={() => router.push(tab.href)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 4px 8px', cursor: 'pointer', gap: '4px', color: isActive ? A : TEXT3 }}>
              <span style={{ display: 'flex', color: isActive ? A : TEXT3 }}>{icons[tab.href]}</span>
              <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '400' }}>{tab.label}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{
      width: '220px', flexShrink: 0,
      background: '#fff',
      borderRight: `0.5px solid ${BORDER}`,
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: `0.5px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="https://static.wixstatic.com/media/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png/v1/fill/w_200,h_200/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png"
            alt="Jobyra"
            style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: TEXT, letterSpacing: '-0.3px' }}>Jobyra</div>
            {loading ? (
              <div style={{ width: '70px', height: '9px', background: '#F0F0F0', borderRadius: '4px', marginTop: '4px' }} />
            ) : (
              <div style={{ fontSize: '10px', color: TEXT3, marginTop: '1px', letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>
                {business?.name || 'Trade CRM'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '8px 10px', flex: 1, overflowY: 'auto' }}>
        <SectionLabel label="Overview" />
        {navMain.map(item => <NavItem key={item.href} href={item.href} label={item.label} active={item.href === active} router={router} />)}

        <SectionLabel label="Finance" />
        {navFinance.map(item => <NavItem key={item.href} href={item.href} label={item.label} active={item.href === active} router={router} />)}

        <SectionLabel label="Manage" />
        {navManage.map(item => <NavItem key={item.href} href={item.href} label={item.label} active={item.href === active} router={router} />)}
      </div>

      {/* User footer */}
      <div style={{ padding: '12px 10px', borderTop: `0.5px solid ${BORDER}` }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F5F5F2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {loading ? (
            <>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F0F0F0', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ width: '80px', height: '10px', background: '#F0F0F0', borderRadius: '4px' }} />
                <div style={{ width: '50px', height: '9px', background: '#F0F0F0', borderRadius: '4px' }} />
              </div>
            </>
          ) : (
            <>
              {business?.logo_url ? (
                <img src={business.logo_url} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'contain', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: A, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '600', flexShrink: 0,
                }}>{initials}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{business?.full_name || ''}</div>
                <div style={{ fontSize: '11px', color: TEXT3 }}>{business?.role_title || 'Owner'}</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); signOut() }}
                style={{ fontSize: '11px', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = TEXT}
                onMouseLeave={e => e.currentTarget.style.color = TEXT3}
              >
                Out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}