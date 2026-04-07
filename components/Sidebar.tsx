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

const SIDEBAR_COLLAPSED = 60
const SIDEBAR_EXPANDED = 224

const navMain = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Customers', href: '/dashboard/customers' },
  { label: 'Leads', href: '/dashboard/leads' },
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
  { label: 'Leads', href: '/dashboard/leads' },
  { label: 'Add job', href: '/dashboard/jobs' },
  { label: 'Settings', href: '/dashboard/settings' },
]

const icons: Record<string, React.ReactElement> = {
  '/dashboard': (
    <svg width="18" height="18" viewBox="-30 -30 60 60" fill="none"
      stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="-26" y="-26" width="22" height="14" rx="4"/>
      <rect x="4"   y="-26" width="22" height="30" rx="4"/>
      <rect x="-26" y="-8"  width="22" height="30" rx="4"/>
      <rect x="4"   y="8"   width="22" height="14" rx="4"/>
    </svg>
  ),
  '/dashboard/customers': (
    <svg width="18" height="18" viewBox="-32 -28 64 42" fill="none"
      stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="0" cy="-18" r="8"/>
      <path d="M-14,6 C-14,-4 14,-4 14,6"/>
      <circle cx="-20" cy="-8" r="6" opacity="0.5"/>
      <path d="M-30,10 C-30,3 -10,3 -10,10" opacity="0.5"/>
      <circle cx="20" cy="-8" r="6" opacity="0.5"/>
      <path d="M10,10 C10,3 30,3 30,10" opacity="0.5"/>
    </svg>
  ),
  '/dashboard/leads': (
    <svg width="18" height="18" viewBox="-30 -30 60 60" fill="none"
      stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="0" cy="0" r="26"/>
      <circle cx="0" cy="0" r="17"/>
      <line x1="0"   y1="-26" x2="0"   y2="-21"/>
      <line x1="0"   y1="21"  x2="0"   y2="26"/>
      <line x1="-26" y1="0"   x2="-21" y2="0"/>
      <line x1="21"  y1="0"   x2="26"  y2="0"/>
      <circle cx="0" cy="-4" r="5"/>
      <path d="M-7,10 C-7,4 7,4 7,10"/>
    </svg>
  ),
  '/dashboard/jobs': (
    <svg width="18" height="18" viewBox="-28 -34 60 60" fill="none"
      stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="-24" y="-30" width="30" height="36" rx="4"/>
      <line x1="-19" y1="-20" x2="-1"  y2="-20"/>
      <line x1="-19" y1="-12" x2="-1"  y2="-12"/>
      <line x1="-19" y1="-4"  x2="-8"  y2="-4"/>
      <circle cx="12" cy="16" r="12"/>
      <line x1="12" y1="9"  x2="12" y2="23"/>
      <line x1="5"  y1="16" x2="19" y2="16"/>
    </svg>
  ),
  '/dashboard/quotes': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M11 1.5H4.5A1.5 1.5 0 003 3v12a1.5 1.5 0 001.5 1.5H13.5A1.5 1.5 0 0015 15V5.5L11 1.5Z" fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M11 1.5V5.5H15" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M6 9.5h6M6 12.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/invoices': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 2h12v13l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L3 15V2Z" fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 5v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 6.5C7 5.7 7.9 5 9 5s2 .7 2 1.5S10.1 8 9 8s-2 .8-2 1.5S7.9 11 9 11s2-.7 2-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  '/dashboard/revenue': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="11" width="4" height="6" rx="1" fill="currentColor" opacity="0.35"/>
      <rect x="7" y="7" width="4" height="10" rx="1" fill="currentColor" opacity="0.6"/>
      <rect x="13" y="3" width="4" height="14" rx="1" fill="currentColor"/>
      <path d="M1.5 10L5 7l3 2 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 4h4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  '/dashboard/schedule': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 5V9.5L12 11.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  '/dashboard/qrcodes': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <rect x="3" y="3" width="2" height="2" fill="currentColor"/>
      <rect x="11" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <rect x="13" y="3" width="2" height="2" fill="currentColor"/>
      <rect x="1" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <rect x="3" y="13" width="2" height="2" fill="currentColor"/>
      <rect x="11" y="11" width="2" height="2" rx="0.5" fill="currentColor"/>
      <rect x="15" y="11" width="2" height="2" rx="0.5" fill="currentColor"/>
      <rect x="11" y="15" width="2" height="2" rx="0.5" fill="currentColor"/>
      <rect x="13" y="13" width="2" height="2" rx="0.5" fill="currentColor" opacity="0.4"/>
      <rect x="15" y="15" width="2" height="2" rx="0.5" fill="currentColor"/>
    </svg>
  ),
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
  '/dashboard/settings': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M9 12a3 3 0 100-6 3 3 0 000 6Z" fill="currentColor"/>
      <path d="M7.2 1.5l-.6 1.8a6 6 0 00-1.8 1L3 3.6 1.5 6.3l1.5 1.2a5.8 5.8 0 000 3L1.5 11.7 3 14.4l1.8-.7a6 6 0 001.8 1l.6 1.8h3.6l.6-1.8a6 6 0 001.8-1l1.8.7 1.5-2.7-1.5-1.2a5.8 5.8 0 000-3l1.5-1.2L15 3.6l-1.8.7a6 6 0 00-1.8-1l-.6-1.8H7.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
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
      <>
        <style>{`
          .mobile-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 4px 8px; cursor: pointer; gap: 4px; }
        `}</style>
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
              <div key={tab.href} onClick={() => router.push(tab.href)} className="mobile-tab"
                style={{ color: isActive ? TEAL : TEXT3 }}>
                <span style={{ display: 'flex', color: isActive ? TEAL : TEXT3 }}>{icons[tab.href]}</span>
                <span style={{ fontSize: '10px', fontWeight: isActive ? '700' : '400' }}>{tab.label}</span>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  const css = `
    .jobyra-sidebar {
      width: ${SIDEBAR_COLLAPSED}px;
      transition: width 0.2s cubic-bezier(0.4,0,0.2,1),
                  box-shadow 0.2s cubic-bezier(0.4,0,0.2,1);
      box-shadow: none;
    }
    .jobyra-sidebar:hover {
      width: ${SIDEBAR_EXPANDED}px;
      box-shadow: 4px 0 24px rgba(0,0,0,0.07);
    }
    .jobyra-sidebar .nav-label {
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      transition: opacity 0.15s ease, max-width 0.2s cubic-bezier(0.4,0,0.2,1);
      white-space: nowrap;
    }
    .jobyra-sidebar:hover .nav-label {
      opacity: 1;
      max-width: 200px;
    }
    .jobyra-sidebar .nav-item {
      padding: 8px 0;
      justify-content: center;
      gap: 0;
      transition: background 0.12s, padding 0.2s cubic-bezier(0.4,0,0.2,1), gap 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    .jobyra-sidebar:hover .nav-item {
      padding: 8px 10px;
      justify-content: flex-start;
      gap: 10px;
    }
    .jobyra-sidebar .nav-item:hover:not(.nav-active) {
      background: ${BG};
    }
    .jobyra-sidebar .section-label {
      padding: 14px 0 5px;
      text-align: center;
      transition: padding 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    .jobyra-sidebar:hover .section-label {
      padding: 14px 10px 5px;
      text-align: left;
    }
    .jobyra-sidebar .section-dot { opacity: 0.4; }
    .jobyra-sidebar .section-text { display: none; }
    .jobyra-sidebar:hover .section-dot { display: none; }
    .jobyra-sidebar:hover .section-text { display: inline; }
    .jobyra-sidebar .header-text {
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      white-space: nowrap;
      transition: opacity 0.15s ease, max-width 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    .jobyra-sidebar:hover .header-text {
      opacity: 1;
      max-width: 160px;
    }
    .jobyra-sidebar .nav-body {
      padding: 6px 6px;
      transition: padding 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    .jobyra-sidebar:hover .nav-body {
      padding: 6px 8px;
    }
    .jobyra-sidebar .footer-row {
      padding: 8px 0;
      justify-content: center;
      gap: 0;
      transition: padding 0.2s cubic-bezier(0.4,0,0.2,1), gap 0.2s cubic-bezier(0.4,0,0.2,1), background 0.12s;
    }
    .jobyra-sidebar:hover .footer-row {
      padding: 8px;
      justify-content: flex-start;
      gap: 10px;
    }
    .jobyra-sidebar .footer-row:hover {
      background: ${BG};
    }
    .jobyra-sidebar .footer-text {
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      white-space: nowrap;
      transition: opacity 0.15s ease, max-width 0.2s cubic-bezier(0.4,0,0.2,1);
      flex: 1;
      min-width: 0;
    }
    .jobyra-sidebar:hover .footer-text {
      opacity: 1;
      max-width: 120px;
    }
    .jobyra-sidebar .signout-btn {
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      transition: opacity 0.15s ease, max-width 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    .jobyra-sidebar:hover .signout-btn {
      opacity: 1;
      max-width: 60px;
    }
  `

  return (
    <>
      <style>{css}</style>
      <div
        className="jobyra-sidebar"
        style={{
          flexShrink: 0,
          background: WHITE,
          borderRight: `1px solid ${BORDER}`,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          zIndex: 50,
        }}
      >
        {/* HEADER */}
        <div style={{
          padding: '18px 10px 16px',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minHeight: '72px',
          overflow: 'hidden',
        }}>
          <img
            src="https://static.wixstatic.com/media/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png/v1/fill/w_200,h_200/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png"
            alt="Jobyra"
            style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
          />
          <div className="header-text">
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

        {/* NAV */}
        <div className="nav-body" style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Overview */}
          <div className="section-label" style={{ fontSize: '10px', fontWeight: '700', color: TEXT3, letterSpacing: '0.8px', textTransform: 'uppercase', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span className="section-dot">·</span>
            <span className="section-text">Overview</span>
          </div>
          {navMain.map(item => {
            const isActive = item.href === active
            return (
              <div key={item.href} onClick={() => router.push(item.href)}
                className={`nav-item${isActive ? ' nav-active' : ''}`}
                title={item.label}
                style={{
                  display: 'flex', alignItems: 'center', borderRadius: '9px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: isActive ? '600' : '500',
                  color: isActive ? WHITE : TEXT2,
                  background: isActive ? TEAL : 'transparent',
                  marginBottom: '1px',
                  boxShadow: isActive ? '0 2px 8px rgba(42,161,152,0.28)' : 'none',
                  overflow: 'hidden', whiteSpace: 'nowrap',
                }}>
                <span style={{ color: isActive ? 'rgba(255,255,255,0.92)' : TEXT3, display: 'flex', flexShrink: 0 }}>{icons[item.href]}</span>
                <span className="nav-label">{item.label}</span>
              </div>
            )
          })}

          {/* Finance */}
          <div className="section-label" style={{ fontSize: '10px', fontWeight: '700', color: TEXT3, letterSpacing: '0.8px', textTransform: 'uppercase', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span className="section-dot">·</span>
            <span className="section-text">Finance</span>
          </div>
          {navFinance.map(item => {
            const isActive = item.href === active
            return (
              <div key={item.href} onClick={() => router.push(item.href)}
                className={`nav-item${isActive ? ' nav-active' : ''}`}
                title={item.label}
                style={{
                  display: 'flex', alignItems: 'center', borderRadius: '9px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: isActive ? '600' : '500',
                  color: isActive ? WHITE : TEXT2,
                  background: isActive ? TEAL : 'transparent',
                  marginBottom: '1px',
                  boxShadow: isActive ? '0 2px 8px rgba(42,161,152,0.28)' : 'none',
                  overflow: 'hidden', whiteSpace: 'nowrap',
                }}>
                <span style={{ color: isActive ? 'rgba(255,255,255,0.92)' : TEXT3, display: 'flex', flexShrink: 0 }}>{icons[item.href]}</span>
                <span className="nav-label">{item.label}</span>
              </div>
            )
          })}

          {/* Manage */}
          <div className="section-label" style={{ fontSize: '10px', fontWeight: '700', color: TEXT3, letterSpacing: '0.8px', textTransform: 'uppercase', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span className="section-dot">·</span>
            <span className="section-text">Manage</span>
          </div>
          {navManage.map(item => {
            const isActive = item.href === active
            return (
              <div key={item.href} onClick={() => router.push(item.href)}
                className={`nav-item${isActive ? ' nav-active' : ''}`}
                title={item.label}
                style={{
                  display: 'flex', alignItems: 'center', borderRadius: '9px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: isActive ? '600' : '500',
                  color: isActive ? WHITE : TEXT2,
                  background: isActive ? TEAL : 'transparent',
                  marginBottom: '1px',
                  boxShadow: isActive ? '0 2px 8px rgba(42,161,152,0.28)' : 'none',
                  overflow: 'hidden', whiteSpace: 'nowrap',
                }}>
                <span style={{ color: isActive ? 'rgba(255,255,255,0.92)' : TEXT3, display: 'flex', flexShrink: 0 }}>{icons[item.href]}</span>
                <span className="nav-label">{item.label}</span>
              </div>
            )
          })}

          <div style={{ flex: 1 }}/>

          {/* USER FOOTER */}
          <div style={{ padding: '8px 2px 4px', borderTop: `1px solid ${BORDER}`, marginTop: '8px' }}>
            <div className="footer-row" style={{ display: 'flex', alignItems: 'center', borderRadius: '10px', cursor: 'pointer', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: BG, flexShrink: 0 }}/>
              ) : (
                <>
                  {business?.logo_url ? (
                    <img src={business.logo_url} alt="Logo" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'contain', flexShrink: 0, border: `1px solid ${BORDER}` }}/>
                  ) : (
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `linear-gradient(135deg, #33B5AC, ${TEAL_DARK})`, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                      {initials}
                    </div>
                  )}
                  <div className="footer-text">
                    <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>{business?.full_name || ''}</div>
                    <div style={{ fontSize: '11px', color: TEXT3, marginTop: '2px', fontWeight: '500' }}>{business?.role_title || 'Owner'}</div>
                  </div>
                  <button
                    className="signout-btn"
                    onClick={e => { e.stopPropagation(); signOut() }}
                    style={{ fontSize: '11px', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', flexShrink: 0, fontWeight: '500', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => e.currentTarget.style.color = TEXT}
                    onMouseLeave={e => e.currentTarget.style.color = TEXT3}
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}