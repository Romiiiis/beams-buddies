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

const iconBase = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  style: {
    display: 'block',
    flexShrink: 0,
    overflow: 'visible',
    vectorEffect: 'non-scaling-stroke' as const,
  },
}

const icons: Record<string, React.ReactElement> = {
  '/dashboard': (
    <svg {...iconBase}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  '/dashboard/customers': (
    <svg {...iconBase}>
      <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
      <circle cx="12" cy="9" r="3" />
      <path d="M6 19c0-1.5.7-2.8 1.8-3.7" />
      <path d="M18 19c0-1.5-.7-2.8-1.8-3.7" />
    </svg>
  ),
  '/dashboard/leads': (
    <svg {...iconBase}>
      <circle cx="11" cy="11" r="6.5" />
      <circle cx="11" cy="11" r="2.5" />
      <path d="M16 16l4 4" />
    </svg>
  ),
  '/dashboard/jobs': (
    <svg {...iconBase}>
      <rect x="4" y="7" width="16" height="12" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M4 12h16" />
      <path d="M12 10v4" />
      <path d="M10 12h4" />
    </svg>
  ),
  '/dashboard/quotes': (
    <svg {...iconBase}>
      <path d="M8 4.5H17l3 3V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z" />
      <path d="M17 4.5V7.5h3" />
      <path d="M9.5 11h5" />
      <path d="M9.5 15h5" />
      <path d="M9.5 19h3.5" />
    </svg>
  ),
  '/dashboard/invoices': (
    <svg {...iconBase}>
      <path d="M7 3h10v18l-2-1.4L13 21l-2-1.4L9 21l-2-1.4L5 21V5a2 2 0 0 1 2-2Z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </svg>
  ),
  '/dashboard/revenue': (
    <svg {...iconBase}>
      <path d="M4 19h16" />
      <path d="M7 15V11" />
      <path d="M12 15V8" />
      <path d="M17 15V5" />
      <path d="M6 8.5l3.5-3.5 3 2.5 5-5" />
    </svg>
  ),
  '/dashboard/schedule': (
    <svg {...iconBase}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  ),
  '/dashboard/qrcodes': (
    <svg {...iconBase}>
      <rect x="3" y="3" width="6" height="6" rx="1.2" />
      <rect x="15" y="3" width="6" height="6" rx="1.2" />
      <rect x="3" y="15" width="6" height="6" rx="1.2" />
      <path d="M15 15h2v2h-2z" />
      <path d="M19 15h2v2h-2z" />
      <path d="M15 19h2v2h-2z" />
      <path d="M19 19h2v2h-2z" />
      <path d="M17 9v3" />
      <path d="M21 11h-3" />
    </svg>
  ),
  '/dashboard/reports': (
    <svg {...iconBase}>
      <path d="M4 19h16" />
      <path d="M7 16v-3" />
      <path d="M12 16V9" />
      <path d="M17 16V6" />
      <path d="M6 10l4-3 3 2 5-4" />
    </svg>
  ),
  '/dashboard/settings': (
    <svg {...iconBase}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 0 1 0 2.5 1.8 1.8 0 0 1-2.5 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.8 1.8 0 0 1-1.8 1.8h-.8A1.8 1.8 0 0 1 11 20v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.8 1.8 0 0 1-2.5 0 1.8 1.8 0 0 1 0-2.5l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H5.8A1.8 1.8 0 0 1 4 13.6v-.8A1.8 1.8 0 0 1 5.8 11H6a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.8 1.8 0 0 1 0-2.5 1.8 1.8 0 0 1 2.5 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4.8A1.8 1.8 0 0 1 12.8 3h.8A1.8 1.8 0 0 1 15.4 4.8V5a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.8 1.8 0 0 1 2.5 0 1.8 1.8 0 0 1 0 2.5l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2A1.8 1.8 0 0 1 22 12.8v.8A1.8 1.8 0 0 1 20.2 15H20a1 1 0 0 0-.6.0Z" />
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
          .mobile-tab {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px 4px 8px;
            cursor: pointer;
            gap: 4px;
          }
          .mobile-tab-icon {
            width: 20px;
            height: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            line-height: 0;
          }
          .mobile-tab-icon svg {
            display: block;
            width: 20px;
            height: 20px;
          }
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
              <div
                key={tab.href}
                onClick={() => router.push(tab.href)}
                className="mobile-tab"
                style={{ color: isActive ? TEAL : TEXT3 }}
              >
                <span className="mobile-tab-icon" style={{ color: isActive ? TEAL : TEXT3 }}>
                  {icons[tab.href]}
                </span>
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
    .jobyra-sidebar .nav-icon {
      width: 20px;
      height: 20px;
      min-width: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      line-height: 0;
    }
    .jobyra-sidebar .nav-icon svg {
      display: block;
      width: 20px;
      height: 20px;
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

        <div className="nav-body" style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div className="section-label" style={{ fontSize: '10px', fontWeight: '700', color: TEXT3, letterSpacing: '0.8px', textTransform: 'uppercase', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span className="section-dot">·</span>
            <span className="section-text">Overview</span>
          </div>
          {navMain.map(item => {
            const isActive = item.href === active
            return (
              <div
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`nav-item${isActive ? ' nav-active' : ''}`}
                title={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? WHITE : TEXT2,
                  background: isActive ? TEAL : 'transparent',
                  marginBottom: '1px',
                  boxShadow: isActive ? '0 2px 8px rgba(42,161,152,0.28)' : 'none',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className="nav-icon" style={{ color: isActive ? 'rgba(255,255,255,0.92)' : TEXT3 }}>
                  {icons[item.href]}
                </span>
                <span className="nav-label">{item.label}</span>
              </div>
            )
          })}

          <div className="section-label" style={{ fontSize: '10px', fontWeight: '700', color: TEXT3, letterSpacing: '0.8px', textTransform: 'uppercase', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span className="section-dot">·</span>
            <span className="section-text">Finance</span>
          </div>
          {navFinance.map(item => {
            const isActive = item.href === active
            return (
              <div
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`nav-item${isActive ? ' nav-active' : ''}`}
                title={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? WHITE : TEXT2,
                  background: isActive ? TEAL : 'transparent',
                  marginBottom: '1px',
                  boxShadow: isActive ? '0 2px 8px rgba(42,161,152,0.28)' : 'none',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className="nav-icon" style={{ color: isActive ? 'rgba(255,255,255,0.92)' : TEXT3 }}>
                  {icons[item.href]}
                </span>
                <span className="nav-label">{item.label}</span>
              </div>
            )
          })}

          <div className="section-label" style={{ fontSize: '10px', fontWeight: '700', color: TEXT3, letterSpacing: '0.8px', textTransform: 'uppercase', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span className="section-dot">·</span>
            <span className="section-text">Manage</span>
          </div>
          {navManage.map(item => {
            const isActive = item.href === active
            return (
              <div
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`nav-item${isActive ? ' nav-active' : ''}`}
                title={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? WHITE : TEXT2,
                  background: isActive ? TEAL : 'transparent',
                  marginBottom: '1px',
                  boxShadow: isActive ? '0 2px 8px rgba(42,161,152,0.28)' : 'none',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className="nav-icon" style={{ color: isActive ? 'rgba(255,255,255,0.92)' : TEXT3 }}>
                  {icons[item.href]}
                </span>
                <span className="nav-label">{item.label}</span>
              </div>
            )
          })}

          <div style={{ flex: 1 }}/>

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