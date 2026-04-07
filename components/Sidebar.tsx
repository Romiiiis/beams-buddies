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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="2.2"/>
      <rect x="14" y="3" width="7" height="11" rx="2.2"/>
      <rect x="3" y="14" width="7" height="7" rx="2.2"/>
      <rect x="14" y="17" width="7" height="4" rx="2"/>
    </svg>
  ),
  '/dashboard/customers': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.2"/>
      <path d="M6.5 18c.8-2.6 3-4 5.5-4s4.7 1.4 5.5 4"/>
      <circle cx="5.5" cy="9.5" r="2.2" opacity="0.55"/>
      <path d="M2.8 17.3c.45-1.7 1.7-2.8 3.5-3.2" opacity="0.55"/>
      <circle cx="18.5" cy="9.5" r="2.2" opacity="0.55"/>
      <path d="M17.2 14.1c1.8.4 3.05 1.5 3.5 3.2" opacity="0.55"/>
    </svg>
  ),
  '/dashboard/leads': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="7"/>
      <circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2.5" x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="21.5"/>
      <line x1="2.5" y1="12" x2="5" y2="12"/>
      <line x1="19" y1="12" x2="21.5" y2="12"/>
    </svg>
  ),
  '/dashboard/jobs': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/>
      <path d="M14 3v4h4"/>
      <path d="M9 9h6"/>
      <path d="M9 13h4"/>
      <circle cx="17.5" cy="17.5" r="3.5"/>
      <path d="M17.5 15.8v3.4"/>
      <path d="M15.8 17.5h3.4"/>
    </svg>
  ),
  '/dashboard/quotes': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/>
      <path d="M14 3v5h5"/>
      <path d="M9 12h6"/>
      <path d="M9 16h4"/>
    </svg>
  ),
  '/dashboard/invoices': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h10v18l-2-1.4L13 21l-2-1.4L9 21l-2-1.4L5 21V5a2 2 0 0 1 2-2Z"/>
      <path d="M10.5 8.5c0-.9.9-1.5 2-1.5s2 .6 2 1.5-.8 1.4-2 1.7c-1.2.3-2 1-2 1.8 0 .9.9 1.5 2 1.5s2-.6 2-1.5"/>
      <path d="M12.5 6.5v9"/>
    </svg>
  ),
  '/dashboard/revenue': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V11"/>
      <path d="M10 20V7"/>
      <path d="M16 20V13"/>
      <path d="M22 20V4"/>
      <path d="M3.5 9.5 9 5l4 4 7.5-7.5"/>
    </svg>
  ),
  '/dashboard/schedule': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 2v4"/>
      <path d="M8 2v4"/>
      <path d="M3 9h12"/>
      <path d="M5 5h14a2 2 0 0 1 2 2v5.5"/>
      <path d="M11 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2"/>
      <rect x="6.5" y="11.5" width="2.5" height="2.5" rx="0.6"/>
      <rect x="10.75" y="11.5" width="2.5" height="2.5" rx="0.6"/>
      <rect x="6.5" y="15.75" width="2.5" height="2.5" rx="0.6"/>
      <circle cx="17.5" cy="17.5" r="4.5"/>
      <path d="M15.8 17.5l1.2 1.2 2.3-2.5"/>
    </svg>
  ),
  '/dashboard/qrcodes': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="6" height="6" rx="1.2"/>
      <rect x="15" y="3" width="6" height="6" rx="1.2"/>
      <rect x="3" y="15" width="6" height="6" rx="1.2"/>
      <path d="M17 15h1"/>
      <path d="M15 17h1"/>
      <path d="M19 17h2"/>
      <path d="M17 19h1"/>
      <path d="M20 20h1"/>
    </svg>
  ),
  '/dashboard/reports': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16"/>
      <path d="M6 16l4-4 3 3 5-7"/>
      <circle cx="6" cy="16" r="1"/>
      <circle cx="10" cy="12" r="1"/>
      <circle cx="13" cy="15" r="1"/>
      <circle cx="18" cy="8" r="1"/>
    </svg>
  ),
  '/dashboard/settings': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2"/>
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.9 1.9 0 0 1-2.7 2.7l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.9 1.9 0 0 1-3.8 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.9 1.9 0 0 1-2.7-2.7l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.9 1.9 0 0 1 0-3.8h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a1.9 1.9 0 0 1 3.8 0v.2a1 1 0 0 0 .6.9h.1a1 1 0 0 0 1.1-.2l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6h.2a1.9 1.9 0 0 1 0 3.8h-.2a1 1 0 0 0-.9.6Z"/>
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