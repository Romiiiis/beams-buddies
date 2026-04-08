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

// All icons share identical stroke props — 1.8px, round caps/joins, 24x24 grid
const S = { strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function Ico({ children }: { children: React.ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...S}
      style={{ display: 'block', flexShrink: 0 }}>
      {children}
    </svg>
  )
}

const icons: Record<string, React.ReactElement> = {
  // Dashboard — four-quadrant grid, all same size
  '/dashboard': (
    <Ico>
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </Ico>
  ),
  // Customers — single person silhouette
  '/dashboard/customers': (
    <Ico>
      <circle cx="12" cy="8" r="3.5"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </Ico>
  ),
  // Leads — target / bullseye
  '/dashboard/leads': (
    <Ico>
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="5"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    </Ico>
  ),
  // Add job — plus inside a square
  '/dashboard/jobs': (
    <Ico>
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </Ico>
  ),
  // Quotes — document with speech bubble tail
  '/dashboard/quotes': (
    <Ico>
      <path d="M4 4h16v12H4z" rx="2"/>
      <path d="M8 20l4-4h8"/>
    </Ico>
  ),
  // Invoices — receipt with tear-off bottom
  '/dashboard/invoices': (
    <Ico>
      <path d="M5 2h14v20l-2.5-1.5L14 22l-2-1.5L10 22l-2.5-1.5L5 22z"/>
      <line x1="8" y1="8" x2="16" y2="8"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="8" y1="16" x2="12" y2="16"/>
    </Ico>
  ),
  // Revenue — rising bar chart
  '/dashboard/revenue': (
    <Ico>
      <rect x="3" y="14" width="4" height="7" rx="1"/>
      <rect x="10" y="9" width="4" height="12" rx="1"/>
      <rect x="17" y="4" width="4" height="17" rx="1"/>
      <line x1="2" y1="21" x2="22" y2="21"/>
    </Ico>
  ),
  // Service schedule — calendar with a clock hand
  '/dashboard/schedule': (
    <Ico>
      <rect x="3" y="4" width="18" height="17" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <circle cx="12" cy="15" r="3"/>
      <line x1="12" y1="13.5" x2="12" y2="15"/>
      <line x1="12" y1="15" x2="13.2" y2="15"/>
    </Ico>
  ),
  // QR codes — minimal QR corner marks + center dot
  '/dashboard/qrcodes': (
    <Ico>
      <rect x="3" y="3" width="6" height="6" rx="1"/>
      <rect x="15" y="3" width="6" height="6" rx="1"/>
      <rect x="3" y="15" width="6" height="6" rx="1"/>
      <rect x="4.5" y="4.5" width="3" height="3" rx="0.5" fill="currentColor" stroke="none"/>
      <rect x="16.5" y="4.5" width="3" height="3" rx="0.5" fill="currentColor" stroke="none"/>
      <rect x="4.5" y="16.5" width="3" height="3" rx="0.5" fill="currentColor" stroke="none"/>
      <line x1="15" y1="15" x2="21" y2="15"/>
      <line x1="15" y1="18" x2="18" y2="18"/>
      <line x1="15" y1="21" x2="21" y2="21"/>
      <line x1="21" y1="15" x2="21" y2="21"/>
    </Ico>
  ),
  // Reports — line chart with axis
  '/dashboard/reports': (
    <Ico>
      <line x1="3" y1="21" x2="3" y2="3"/>
      <line x1="3" y1="21" x2="21" y2="21"/>
      <polyline points="6,16 10,10 14,13 20,6"/>
      <circle cx="6" cy="16" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="10" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="14" cy="13" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="20" cy="6" r="1.2" fill="currentColor" stroke="none"/>
    </Ico>
  ),
  // Settings — gear / cog
  '/dashboard/settings': (
    <Ico>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </Ico>
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
          {/* Overview */}
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
                  display: 'flex', alignItems: 'center', borderRadius: '9px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: isActive ? '600' : '500',
                  color: isActive ? WHITE : TEXT2,
                  background: isActive ? TEAL : 'transparent',
                  marginBottom: '1px',
                  boxShadow: isActive ? '0 2px 8px rgba(42,161,152,0.28)' : 'none',
                  overflow: 'hidden', whiteSpace: 'nowrap',
                }}
              >
                <span className="nav-icon" style={{ color: isActive ? 'rgba(255,255,255,0.92)' : TEXT3 }}>
                  {icons[item.href]}
                </span>
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
              <div
                key={item.href}
                onClick={() => router.push(item.href)}
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
                }}
              >
                <span className="nav-icon" style={{ color: isActive ? 'rgba(255,255,255,0.92)' : TEXT3 }}>
                  {icons[item.href]}
                </span>
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
              <div
                key={item.href}
                onClick={() => router.push(item.href)}
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

          {/* Footer */}
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