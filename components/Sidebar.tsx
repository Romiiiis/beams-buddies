'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusinessData } from '@/lib/business-context'

const A = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#DEDEDE'

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

const bottomTabs = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Customers', href: '/dashboard/customers' },
  { label: 'Add job', href: '/dashboard/jobs' },
  { label: 'Schedule', href: '/dashboard/schedule' },
  { label: 'Menu', href: 'menu' },
]

const menuTabs = [
  { label: 'Reports', href: '/dashboard/reports' },
  { label: 'QR codes', href: '/dashboard/qrcodes' },
  { label: 'Settings', href: '/dashboard/settings' },
]

const icons: Record<string, React.ReactElement> = {
  '/dashboard': (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor"/>
      <rect x="8.5" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/>
      <rect x="2" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/>
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  '/dashboard/customers': (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M2 13c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11 8l1.5 1.5L15 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  '/dashboard/jobs': (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="3" width="11" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 3V2M11 3V2M2.5 7h11M8 9.5v3M6.5 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/schedule': (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 6v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/qrcodes': (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M9 11.5h5M11.5 9v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/reports': (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <path d="M2 12.5l3.5-4 3 2.5 3-5.5 3 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  '/dashboard/settings': (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
}

function UserSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#F0F0F0', flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ width: '90px', height: '11px', background: '#F0F0F0', borderRadius: '4px' }} />
        <div style={{ width: '60px', height: '10px', background: '#F0F0F0', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

export function Sidebar({ active }: { active: string }) {
  const router = useRouter()
  const { business, loading } = useBusinessData()
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
    const menuActive = menuTabs.some(tab => tab.href === active)

    return (
      <>
        {menuOpen && (
          <>
            <div
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.18)',
                zIndex: 120,
              }}
            />
            <div
              style={{
                position: 'fixed',
                left: '12px',
                right: '12px',
                bottom: '82px',
                background: '#fff',
                border: `1px solid ${BORDER}`,
                borderRadius: '18px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.14)',
                overflow: 'hidden',
                zIndex: 121,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '10px 0 4px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '4px',
                    borderRadius: '999px',
                    background: '#D8D8D8',
                  }}
                />
              </div>

              <div
                style={{
                  padding: '8px 16px 6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: TEXT3,
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                Menu
              </div>

              {menuTabs.map((item, index) => {
                const itemActive = item.href === active
                return (
                  <div
                    key={item.href}
                    onClick={() => {
                      setMenuOpen(false)
                      router.push(item.href)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      background: itemActive ? '#F0F9F8' : '#fff',
                      borderTop: index === 0 ? `1px solid ${BORDER}` : 'none',
                      borderBottom: index !== menuTabs.length - 1 ? `1px solid ${BORDER}` : 'none',
                    }}
                  >
                    <span style={{ display: 'flex', color: itemActive ? A : TEXT3 }}>
                      {icons[item.href]}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: itemActive ? '600' : '500', color: itemActive ? '#0A4F4C' : TEXT2 }}>
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 122,
          background: '#fff',
          borderTop: `1px solid ${BORDER}`,
          display: 'flex',
          alignItems: 'stretch',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {bottomTabs.map(tab => {
            const isMenu = tab.href === 'menu'
            const isActive = isMenu ? menuActive || menuOpen : tab.href === active

            return (
              <div
                key={tab.href}
                onClick={() => {
                  if (isMenu) {
                    setMenuOpen(prev => !prev)
                  } else {
                    setMenuOpen(false)
                    router.push(tab.href)
                  }
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px 8px',
                  cursor: 'pointer',
                  gap: '4px',
                  color: isActive ? A : TEXT3,
                }}
              >
                <span style={{ display: 'flex', color: isActive ? A : TEXT3 }}>
                  {isMenu ? icons['/dashboard/settings'] : icons[tab.href]}
                </span>
                <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '400', letterSpacing: '0.2px' }}>
                  {tab.label}
                </span>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <div style={{
      width: '232px',
      flexShrink: 0,
      background: '#fff',
      borderRight: `1px solid ${BORDER}`,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <img
            src="https://static.wixstatic.com/media/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png/v1/fill/w_200,h_200/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png"
            alt="Jobyra"
            style={{ width: '56px', height: '56px', borderRadius: '9px', objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: TEXT, letterSpacing: '-0.3px' }}>Jobyra</div>
            {loading ? (
              <div style={{ width: '80px', height: '10px', background: '#F0F0F0', borderRadius: '4px', marginTop: '5px' }} />
            ) : (
              <div style={{ fontSize: '12px', color: TEXT3, marginTop: '1px' }}>{business?.name || ''}</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '10px 10px 6px' }}>Main</div>
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

        <div style={{ fontSize: '11px', fontWeight: '600', color: TEXT3, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '14px 10px 6px' }}>Manage</div>
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
        {loading ? <UserSkeleton /> : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {business?.logo_url ? (
              <img src={business.logo_url} alt={business?.name || 'Logo'} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'contain', background: '#fff', padding: '2px', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#CCEFED', color: '#0A4F4C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>{initials}</div>
            )}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT }}>{business?.full_name || ''}</div>
              <div style={{ fontSize: '11px', color: TEXT3 }}>{business?.role_title || ''}</div>
            </div>
          </div>
        )}
        <button onClick={signOut} style={{ fontSize: '12px', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
      </div>
    </div>
  )
}