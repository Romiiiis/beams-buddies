'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusinessData } from '@/lib/business-context'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_SOFT = '#E8F7F5'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#475569'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'

const SIDEBAR_WIDTH = 248
const SIDEBAR_COLLAPSED_WIDTH = 88
const SIDEBAR_SHELL_WIDTH = 272
const SIDEBAR_SHELL_COLLAPSED_WIDTH = 112
const AUTO_COLLAPSE_BREAKPOINT = 1200

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
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.9,
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
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.7-3 4.3-4.8 7-4.8s5.3 1.8 7 4.8" />
    </svg>
  ),
  '/dashboard/leads': (
    <svg {...iconBase}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  '/dashboard/jobs': (
    <svg {...iconBase}>
      <rect x="4" y="6" width="16" height="13" rx="2.5" />
      <path d="M9 6V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V6" />
    </svg>
  ),
  '/dashboard/quotes': (
    <svg {...iconBase}>
      <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" />
      <path d="M14 3.5V8h4" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </svg>
  ),
  '/dashboard/invoices': (
    <svg {...iconBase}>
      <path d="M7 2.8h10v18.4l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V2.8Z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </svg>
  ),
  '/dashboard/revenue': (
    <svg {...iconBase}>
      <path d="M4 20V12" />
      <path d="M10 20V8" />
      <path d="M16 20V14" />
      <path d="M22 20V5" />
    </svg>
  ),
  '/dashboard/schedule': (
    <svg {...iconBase}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
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
    </svg>
  ),
  '/dashboard/reports': (
    <svg {...iconBase}>
      <path d="M4 19.5h16" />
      <path d="M7 16V10" />
      <path d="M12 16V6" />
      <path d="M17 16v-3" />
    </svg>
  ),
  '/dashboard/settings': (
    <svg {...iconBase}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.2-1.7l2-1.5-2-3.5-2.4 1a7 7 0 0 0-2.9-1.7L13 2h-2l-.5 2.6a7 7 0 0 0-2.9 1.7l-2.4-1-2 3.5 2 1.5A7 7 0 0 0 5 12c0 .6.1 1.2.2 1.7l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 2.9 1.7L11 22h2l.5-2.6a7 7 0 0 0 2.9-1.7l2.4 1 2-3.5-2-1.5c.1-.5.2-1.1.2-1.7z" />
    </svg>
  ),
}

function LogoutIcon() {
  return (
    <svg {...iconBase}>
      <path d="M10 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" />
      <path d="M14 16l4-4-4-4" />
      <path d="M18 12H9" />
    </svg>
  )
}

export function Sidebar({ active }: { active: string }) {
  const router = useRouter()
  const { business, loading } = useBusinessData()
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 768
      const collapsed = window.innerWidth < AUTO_COLLAPSE_BREAKPOINT

      setIsMobile(mobile)
      setIsCollapsed(!mobile && collapsed)
    }

    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const initials = business?.full_name
    ? business.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'J'

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function navigateTo(href: string) {
    const shouldCollapse = typeof window !== 'undefined' && window.innerWidth < AUTO_COLLAPSE_BREAKPOINT
    if (!isMobile) {
      setIsCollapsed(shouldCollapse)
    }
    router.push(href)
  }

  function renderNavItem(item: { label: string; href: string }) {
    const isActive = item.href === active

    return (
      <button
        key={item.href}
        onClick={() => navigateTo(item.href)}
        title={item.label}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: isCollapsed ? 0 : 10,
          border: 'none',
          background: isActive ? TEAL_SOFT : 'transparent',
          color: isActive ? TEAL : TEXT2,
          borderRadius: 12,
          padding: isCollapsed ? '6px' : '6px 10px',
          minHeight: isCollapsed ? 44 : 42,
          cursor: 'pointer',
          textAlign: 'left',
          boxShadow: isActive ? `inset 0 0 0 1px ${TEAL}` : 'none',
          transition: 'background 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={e => {
          if (!isActive) e.currentTarget.style.background = '#F8FAFC'
        }}
        onMouseLeave={e => {
          if (!isActive) e.currentTarget.style.background = 'transparent'
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            minWidth: 30,
            borderRadius: 10,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isActive ? TEAL : WHITE,
            color: isActive ? WHITE : TEXT3,
            border: isActive ? 'none' : `1px solid ${BORDER}`,
            boxShadow: isActive ? '0 6px 14px rgba(31,158,148,0.20)' : 'none',
          }}
        >
          {icons[item.href]}
        </span>

        {!isCollapsed && (
          <span
            style={{
              fontSize: 13,
              fontWeight: isActive ? 800 : 700,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: isActive ? TEAL : undefined,
            }}
          >
            {item.label}
          </span>
        )}
      </button>
    )
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

        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: WHITE,
            borderTop: `1px solid ${BORDER}`,
            display: 'flex',
            alignItems: 'stretch',
            paddingBottom: 'env(safe-area-inset-bottom)',
            boxShadow: '0 -4px 20px rgba(15,23,42,0.06)',
          }}
        >
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
                <span style={{ fontSize: 10, fontWeight: isActive ? 800 : 600 }}>{tab.label}</span>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  const shellWidth = isCollapsed ? SIDEBAR_SHELL_COLLAPSED_WIDTH : SIDEBAR_SHELL_WIDTH
  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <>
      <style>{`
        .sidebar-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        .sidebar-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>

      <div
        style={{
          width: shellWidth,
          minWidth: shellWidth,
          position: 'relative',
          flexShrink: 0,
          background: BG,
          transition: 'width 0.2s ease, min-width 0.2s ease',
        }}
      >
        <div
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            width: sidebarWidth,
            height: 'calc(100vh - 32px)',
            background: WHITE,
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
            padding: 12,
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            transition: 'width 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: 12,
              padding: '8px 8px 12px',
              borderBottom: `1px solid ${BORDER}`,
              marginBottom: 10,
            }}
          >
            <img
              src="https://static.wixstatic.com/media/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png/v1/fill/w_200,h_200/48c433_c590b541a9f246f7bd6d0d9861627f55~mv2.png"
              alt="Jobyra"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                objectFit: 'cover',
                background: WHITE,
                border: `1px solid ${BORDER}`,
                flexShrink: 0,
              }}
            />

            {!isCollapsed && (
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: TEXT,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.1,
                  }}
                >
                  Jobyra
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: TEXT3,
                    marginTop: 3,
                  }}
                >
                  {loading ? 'Loading...' : business?.name || 'Trade CRM'}
                </div>
              </div>
            )}
          </div>

          <div
            className="sidebar-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '0 2px',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {navMain.map(renderNavItem)}

            {!isCollapsed && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: TEXT3,
                  padding: '12px 10px 5px',
                }}
              >
                Finance
              </div>
            )}

            {navFinance.map(renderNavItem)}

            {!isCollapsed && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: TEXT3,
                  padding: '12px 10px 5px',
                }}
              >
                Manage
              </div>
            )}

            {navManage.map(renderNavItem)}

            <div style={{ flex: 1 }} />
          </div>

          <div
            style={{
              marginTop: 10,
              borderTop: `1px solid ${BORDER}`,
              paddingTop: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: isCollapsed ? 'column' : 'row',
                alignItems: 'center',
                gap: isCollapsed ? 10 : 10,
                justifyContent: isCollapsed ? 'center' : 'space-between',
                padding: isCollapsed ? '12px 8px' : '10px 12px',
                background: '#F8FAFC',
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isCollapsed ? 0 : 10,
                  minWidth: 0,
                  width: isCollapsed ? '100%' : 'auto',
                  flex: isCollapsed ? '0 0 auto' : 1,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
              >
                {loading ? (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: BG,
                      flexShrink: 0,
                    }}
                  />
                ) : business?.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt="Logo"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      objectFit: 'contain',
                      background: WHITE,
                      border: `1px solid ${BORDER}`,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                      color: WHITE,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                )}

                {!isCollapsed && (
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: TEXT,
                        lineHeight: 1.15,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {loading ? 'Loading...' : business?.full_name || 'Owner'}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: TEXT3,
                        marginTop: 3,
                        fontWeight: 600,
                      }}
                    >
                      {loading ? '' : business?.role_title || 'Owner'}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={signOut}
                title="Sign out"
                style={{
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  borderRadius: 10,
                  border: `1px solid ${BORDER}`,
                  background: WHITE,
                  color: TEXT3,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
                  marginLeft: 0,
                }}
              >
                <LogoutIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}