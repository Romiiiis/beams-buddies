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
  { label: 'Jobs', href: '/dashboard/jobs' },
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

const mobilePrimaryTabs = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Service schedule', href: '/dashboard/schedule' },
  { label: 'Add job', href: '/dashboard/jobs' },
]

const mobileMenuItems = [
  { label: 'Customers', href: '/dashboard/customers' },
  { label: 'Leads', href: '/dashboard/leads' },
  { label: 'Quotes', href: '/dashboard/quotes' },
  { label: 'Invoices', href: '/dashboard/invoices' },
  { label: 'Revenue', href: '/dashboard/revenue' },
  { label: 'QR codes', href: '/dashboard/qrcodes' },
  { label: 'Reports', href: '/dashboard/reports' },
  { label: 'Settings', href: '/dashboard/settings' },
]

const iconBase = {
  width: 20,
  height: 20,
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

function DashboardIcon() {
  return (
    <svg {...iconBase}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.2" />
      <path d="M8 15.5V11" />
      <path d="M12 15.5V7.5" />
      <path d="M16 15.5v-5" />
    </svg>
  )
}

function CustomersIcon() {
  return (
    <svg {...iconBase}>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function LeadsIcon() {
  return (
    <svg {...iconBase}>
      <path d="M12 20s-6.5-3.9-8.3-7.8A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8.3 5.2C18.5 16.1 12 20 12 20Z" />
    </svg>
  )
}

function JobsIcon() {
  return (
    <svg {...iconBase}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 9h8" />
      <path d="M8 12h8" />
      <path d="M8 15h5" />
    </svg>
  )
}

function QuotesIcon() {
  return (
    <svg {...iconBase}>
      <path d="M4 20h4.2l9.9-9.9a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L4 15.8V20Z" />
      <path d="m12.6 7.4 4 4" />
    </svg>
  )
}

function InvoicesIcon() {
  return (
    <svg {...iconBase}>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="M3.5 10h17" />
      <path d="M7 14h3" />
    </svg>
  )
}

function RevenueIcon() {
  return (
    <svg {...iconBase}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.7 9.3c0-1.2-1.2-2-2.8-2-1.5 0-2.6.8-2.6 1.9 0 1 .6 1.6 2.4 2l1.5.3c1.8.4 2.7 1.1 2.7 2.4 0 1.5-1.4 2.7-3.5 2.7-2 0-3.4-1-3.6-2.6" />
      <path d="M12 6.5v11" />
    </svg>
  )
}

function ScheduleIcon() {
  return (
    <svg {...iconBase}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M8 3.8v2.7" />
      <path d="M16 3.8v2.7" />
      <path d="M3.5 9.5h17" />
    </svg>
  )
}

function QrCodesIcon() {
  return (
    <svg {...iconBase}>
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <path d="M14 14h2" />
      <path d="M18 14h2" />
      <path d="M14 18h2" />
      <path d="M18 16v4" />
    </svg>
  )
}

function ReportsIcon() {
  return (
    <svg {...iconBase}>
      <path d="M6 7h12" />
      <path d="M6 12h12" />
      <path d="M6 17h8" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg {...iconBase}>
      <circle cx="12" cy="12" r="3.25" />
      <path d="M12 2.75v2.1" />
      <path d="M12 19.15v2.1" />
      <path d="M21.25 12h-2.1" />
      <path d="M4.85 12h-2.1" />
      <path d="m18.54 5.46-1.48 1.48" />
      <path d="m6.94 17.06-1.48 1.48" />
      <path d="m18.54 18.54-1.48-1.48" />
      <path d="m6.94 6.94-1.48-1.48" />
    </svg>
  )
}

const icons: Record<string, React.ReactElement> = {
  '/dashboard': <DashboardIcon />,
  '/dashboard/customers': <CustomersIcon />,
  '/dashboard/leads': <LeadsIcon />,
  '/dashboard/jobs': <JobsIcon />,
  '/dashboard/quotes': <QuotesIcon />,
  '/dashboard/invoices': <InvoicesIcon />,
  '/dashboard/revenue': <RevenueIcon />,
  '/dashboard/schedule': <ScheduleIcon />,
  '/dashboard/qrcodes': <QrCodesIcon />,
  '/dashboard/reports': <ReportsIcon />,
  '/dashboard/settings': <SettingsIcon />,
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

function MenuIcon() {
  return (
    <svg {...iconBase}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

export function Sidebar({ active }: { active: string }) {
  const router = useRouter()
  const { business, loading } = useBusinessData()
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 768
      const collapsed = window.innerWidth < AUTO_COLLAPSE_BREAKPOINT

      setIsMobile(mobile)
      setIsCollapsed(!mobile && collapsed)

      if (!mobile) {
        setIsMobileMenuOpen(false)
      }
    }

    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!isMobileMenuOpen) return

    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = original
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const html = document.documentElement
    const body = document.body

    const prevHtmlOverscroll = html.style.overscrollBehaviorY
    const prevHtmlOverflowX = html.style.overflowX
    const prevBodyOverscroll = body.style.overscrollBehaviorY
    const prevBodyOverflowX = body.style.overflowX
    const prevBodyMinHeight = body.style.minHeight
    const prevBodyPosition = body.style.position
    const prevBodyWidth = body.style.width

    if (isMobile) {
      html.style.overscrollBehaviorY = 'none'
      html.style.overflowX = 'hidden'
      body.style.overscrollBehaviorY = 'none'
      body.style.overflowX = 'hidden'
      body.style.minHeight = '100svh'
      body.style.position = 'relative'
      body.style.width = '100%'
    }

    return () => {
      html.style.overscrollBehaviorY = prevHtmlOverscroll
      html.style.overflowX = prevHtmlOverflowX
      body.style.overscrollBehaviorY = prevBodyOverscroll
      body.style.overflowX = prevBodyOverflowX
      body.style.minHeight = prevBodyMinHeight
      body.style.position = prevBodyPosition
      body.style.width = prevBodyWidth
    }
  }, [isMobile])

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
    } else {
      setIsMobileMenuOpen(false)
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
          transition: 'background 0.15s ease, box-shadow 0.15s ease, color 0.15s ease',
        }}
        onMouseEnter={e => {
          if (!isActive) e.currentTarget.style.background = '#F8FAFC'
        }}
        onMouseLeave={e => {
          if (!isActive) e.currentTarget.style.background = 'transparent'
        }}
      >
        <span
          className="sidebar-icon"
          style={{
            width: 30,
            height: 30,
            minWidth: 30,
            borderRadius: 10,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            color: isActive ? TEAL : TEXT3,
            border: 'none',
            boxShadow: 'none',
            lineHeight: 0,
          }}
        >
          {icons[item.href]}
        </span>

        {!isCollapsed && (
          <span
            style={{
              fontSize: 13,
              fontWeight: isActive ? 700 : 600,
              letterSpacing: '-0.01em',
              lineHeight: '18px',
              color: isActive ? TEAL : TEXT2,
              whiteSpace: 'nowrap',
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
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
          html, body {
            overscroll-behavior-y: none;
            overflow-x: hidden;
          }

          body {
            min-height: 100svh;
          }

          .mobile-tab {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px 4px 8px;
            cursor: pointer;
            gap: 4px;
            font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            -webkit-tap-highlight-color: transparent;
          }

          .mobile-tab-icon {
            width: 22px;
            height: 22px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            line-height: 0;
          }

          .mobile-tab-icon svg {
            display: block;
            width: 22px;
            height: 22px;
          }
        `}</style>

        <>
          {isMobileMenuOpen && (
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.32)',
                zIndex: 109,
              }}
            />
          )}

          <div
            style={{
              position: 'fixed',
              top: 'max(14px, calc(env(safe-area-inset-top) + 8px))',
              right: isMobileMenuOpen ? 12 : -320,
              bottom: 'calc(98px + env(safe-area-inset-bottom))',
              width: 268,
              maxHeight: 'calc(100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 112px)',
              zIndex: 110,
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: 20,
              boxShadow: '0 20px 60px rgba(15,23,42,0.18), 0 6px 20px rgba(15,23,42,0.08)',
              padding: 12,
              transition: 'right 0.22s ease',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              overflowX: 'hidden',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: TEXT3,
                padding: '2px 6px 10px',
              }}
            >
              Menu
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {mobileMenuItems.map(item => {
                const isActive = item.href === active
                return (
                  <button
                    key={item.href}
                    onClick={() => navigateTo(item.href)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      minHeight: 48,
                      padding: '10px 12px',
                      borderRadius: 14,
                      border: isActive ? `1px solid ${TEAL}` : `1px solid ${BORDER}`,
                      background: isActive ? TEAL_SOFT : '#F8FAFC',
                      color: isActive ? TEAL : TEXT2,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        lineHeight: 0,
                      }}
                    >
                      {icons[item.href]}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '-0.01em',
                        lineHeight: 1.2,
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              })}

              <button
                onClick={signOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  minHeight: 48,
                  padding: '10px 12px',
                  borderRadius: 14,
                  border: `1px solid ${BORDER}`,
                  background: '#F8FAFC',
                  color: TEXT2,
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: 4,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    lineHeight: 0,
                    color: TEXT3,
                  }}
                >
                  <LogoutIcon />
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}
                >
                  Sign out
                </span>
              </button>
            </div>
          </div>

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
              overscrollBehavior: 'none',
            }}
          >
            {mobilePrimaryTabs.map(tab => {
              const isActive = tab.href === active

              return (
                <div
                  key={tab.href}
                  onClick={() => navigateTo(tab.href)}
                  className="mobile-tab"
                  style={{ color: isActive ? TEAL : TEXT3 }}
                >
                  <span className="mobile-tab-icon" style={{ color: isActive ? TEAL : TEXT3 }}>
                    {icons[tab.href]}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: isActive ? 700 : 600,
                      lineHeight: 1.1,
                      letterSpacing: '-0.01em',
                      textAlign: 'center',
                      textRendering: 'optimizeLegibility',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                    }}
                  >
                    {tab.label}
                  </span>
                </div>
              )
            })}

            <div
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="mobile-tab"
              style={{ color: isMobileMenuOpen ? TEAL : TEXT3 }}
            >
              <span className="mobile-tab-icon" style={{ color: isMobileMenuOpen ? TEAL : TEXT3 }}>
                <MenuIcon />
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isMobileMenuOpen ? 700 : 600,
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                  textAlign: 'center',
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                }}
              >
                Menu
              </span>
            </div>
          </div>
        </>
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

        .sidebar-icon svg,
        .mobile-tab-icon svg {
          display: block;
          width: 20px;
          height: 20px;
          shape-rendering: geometricPrecision;
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
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
                    fontWeight: 800,
                    color: TEXT,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    textRendering: 'optimizeLegibility',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                  }}
                >
                  Jobyra
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: TEXT3,
                    marginTop: 3,
                    lineHeight: 1.2,
                    textRendering: 'optimizeLegibility',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
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
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: TEXT3,
                  padding: '12px 10px 5px',
                  lineHeight: 1.2,
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
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
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: TEXT3,
                  padding: '12px 10px 5px',
                  lineHeight: 1.2,
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
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
                background: WHITE,
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
                      fontWeight: 700,
                      flexShrink: 0,
                      letterSpacing: '-0.01em',
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
                        fontWeight: 700,
                        color: TEXT,
                        lineHeight: 1.15,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        letterSpacing: '-0.01em',
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
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
                        lineHeight: 1.2,
                        letterSpacing: '-0.01em',
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
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
                  lineHeight: 0,
                }}
              >
                <span className="sidebar-icon">
                  <LogoutIcon />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}