'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusinessData } from '@/lib/business-context'
import { AppIcon } from '@/components/AppIcon'

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
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
  { label: 'Home', href: '/dashboard' },
  { label: 'Jobs', href: '/dashboard/jobs' },
  { label: 'Apps', href: 'menu' },
  { label: 'Customers', href: '/dashboard/customers' },
  { label: 'Settings', href: '/dashboard/settings' },
]

const mobileMenuItems = [
  { label: 'Leads', href: '/dashboard/leads' },
  { label: 'Quotes', href: '/dashboard/quotes' },
  { label: 'Invoices', href: '/dashboard/invoices' },
  { label: 'Revenue', href: '/dashboard/revenue' },
  { label: 'Service schedule', href: '/dashboard/schedule' },
  { label: 'QR codes', href: '/dashboard/qrcodes' },
  { label: 'Reports', href: '/dashboard/reports' },
]

function DashboardIcon() {
  return <AppIcon name="dashboard" size={20} />
}

function CustomersIcon() {
  return <AppIcon name="customers" size={20} />
}

function LeadsIcon() {
  return <AppIcon name="leads" size={20} />
}

function JobsIcon() {
  return <AppIcon name="jobs" size={20} />
}

function QuotesIcon() {
  return <AppIcon name="document" size={20} />
}

function InvoicesIcon() {
  return <AppIcon name="invoice" size={20} />
}

function RevenueIcon() {
  return <AppIcon name="dollar" size={20} />
}

function ScheduleIcon() {
  return <AppIcon name="calendar-clock" size={20} />
}

function QrCodesIcon() {
  return <AppIcon name="qrcode" size={20} />
}

function ReportsIcon() {
  return <AppIcon name="reports" size={20} />
}

function SettingsIcon() {
  return <AppIcon name="settings" size={20} />
}

function AppsIcon() {
  return <AppIcon name="menu" size={20} />
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
  menu: <AppsIcon />,
}

function LogoutIcon() {
  return <AppIcon name="logout" size={20} />
}

function CloseIcon() {
  return <AppIcon name="close" size={20} />
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

  useEffect(() => {
    if (!isMobile) return

    const routes = [
      '/dashboard',
      '/dashboard/jobs',
      '/dashboard/customers',
      '/dashboard/settings',
      '/dashboard/leads',
      '/dashboard/quotes',
      '/dashboard/invoices',
      '/dashboard/revenue',
      '/dashboard/schedule',
      '/dashboard/qrcodes',
      '/dashboard/reports',
    ]

    routes.forEach(route => router.prefetch(route))
  }, [isMobile, router])

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
    if (href === active) {
      setIsMobileMenuOpen(false)
      return
    }

    const shouldCollapse = typeof window !== 'undefined' && window.innerWidth < AUTO_COLLAPSE_BREAKPOINT

    if (!isMobile) {
      setIsCollapsed(shouldCollapse)
    } else {
      setIsMobileMenuOpen(false)
    }

    router.prefetch(href)
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
          boxShadow: 'none',
          transition: 'background 0.15s ease, color 0.15s ease',
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
            padding-bottom: calc(88px + env(safe-area-inset-bottom));
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

          .mobile-menu-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .mobile-menu-scroll::-webkit-scrollbar {
            display: none;
          }

          @media (display-mode: standalone) {
            body {
              padding-bottom: calc(96px + env(safe-area-inset-bottom));
            }
          }
        `}</style>

        <>
          {isMobileMenuOpen && (
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.30)',
                backdropFilter: 'blur(2px)',
                zIndex: 109,
              }}
            />
          )}

          <aside
            className="mobile-menu-scroll"
            style={{
              position: 'fixed',
              top: 0,
              left: isMobileMenuOpen ? 0 : '-82vw',
              bottom: 0,
              width: 'min(78vw, 318px)',
              zIndex: 110,
              background: WHITE,
              borderRight: `1px solid ${BORDER}`,
              boxShadow: 'none',
              padding: 'calc(env(safe-area-inset-top) + 22px) 18px calc(106px + env(safe-area-inset-bottom))',
              transition: 'left 0.24s ease',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              overflowX: 'hidden',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
              style={{
                position: 'absolute',
                top: 'calc(env(safe-area-inset-top) + 16px)',
                right: 14,
                width: 36,
                height: 36,
                borderRadius: 12,
                border: `1px solid ${BORDER}`,
                background: WHITE,
                color: TEXT2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                lineHeight: 0,
              }}
            >
              <CloseIcon />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 42px 22px 2px',
              }}
            >
              {loading ? (
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: BG,
                    border: `1px solid ${BORDER}`,
                    flexShrink: 0,
                  }}
                />
              ) : business?.logo_url ? (
                <img
                  src={business.logo_url}
                  alt="Logo"
                  style={{
                    width: 56,
                    height: 56,
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
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: TEAL,
                    color: WHITE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 17,
                    fontWeight: 800,
                    flexShrink: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {initials}
                </div>
              )}

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: TEXT,
                    letterSpacing: '-0.02em',
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
                    fontSize: 12,
                    fontWeight: 600,
                    color: TEXT3,
                    marginTop: 4,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {loading ? '' : business?.role_title || business?.name || 'Jobyra workspace'}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
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
                      gap: 12,
                      width: '100%',
                      minHeight: 48,
                      padding: '10px 12px',
                      borderRadius: 14,
                      border: 'none',
                      background: isActive ? TEAL_SOFT : 'transparent',
                      color: isActive ? TEAL : TEXT2,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease, color 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        lineHeight: 0,
                        color: isActive ? TEAL : TEXT3,
                      }}
                    >
                      {icons[item.href]}
                    </span>

                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: isActive ? 800 : 650,
                        letterSpacing: '-0.01em',
                        lineHeight: 1.2,
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div
              style={{
                marginTop: 18,
                paddingTop: 18,
                borderTop: `1px solid ${BORDER}`,
              }}
            >
              <button
                onClick={signOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  minHeight: 48,
                  padding: '10px 12px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'transparent',
                  color: '#DC2626',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    lineHeight: 0,
                  }}
                >
                  <LogoutIcon />
                </span>

                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}
                >
                  Log out
                </span>
              </button>
            </div>
          </aside>

          <nav
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
              height: 'calc(78px + env(safe-area-inset-bottom))',
              background: WHITE,
              borderTop: `1px solid ${BORDER}`,
              borderLeft: 'none',
              borderRight: 'none',
              borderBottom: 'none',
              borderRadius: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              alignItems: 'center',
              padding: '8px 12px calc(8px + env(safe-area-inset-bottom))',
              boxShadow: 'none',
              overflow: 'hidden',
              overscrollBehavior: 'none',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
            }}
          >
            {mobilePrimaryTabs.map(tab => {
              const isMenuTab = tab.href === 'menu'
              const isActive = isMenuTab ? isMobileMenuOpen : tab.href === active

              return (
                <button
                  key={tab.href}
                  type="button"
                  onClick={() => {
                    if (isMenuTab) {
                      setIsMobileMenuOpen(prev => !prev)
                      return
                    }

                    navigateTo(tab.href)
                  }}
                  style={{
                    height: '100%',
                    minWidth: 0,
                    border: 'none',
                    background: 'transparent',
                    color: isActive ? TEAL : TEXT3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isMenuTab ? 0 : 4,
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'inherit',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span
                    className="mobile-tab-icon"
                    style={{
                      width: isMenuTab ? 46 : 22,
                      height: isMenuTab ? 46 : 22,
                      borderRadius: isMenuTab ? 16 : 0,
                      background: isMenuTab ? TEAL : 'transparent',
                      color: isMenuTab ? WHITE : isActive ? TEAL : TEXT3,
                      boxShadow: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      lineHeight: 0,
                    }}
                  >
                    {icons[tab.href]}
                  </span>

                  {!isMenuTab && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: isActive ? 800 : 650,
                        lineHeight: 1.1,
                        letterSpacing: '-0.01em',
                        textAlign: 'center',
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        whiteSpace: 'nowrap',
                        maxWidth: 72,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {tab.label}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
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

        .sidebar-icon svg {
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
            boxShadow: 'none',
            padding: 12,
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            transition: 'width 0.2s ease',
          }}
        >
          {/* Jobyra branding header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
              padding: '8px 6px 12px',
              borderBottom: `1px solid ${BORDER}`,
              marginBottom: 10,
            }}
          >
            <img
              src="/jobyra-logo.png"
              alt="Jobyra"
              style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0, mixBlendMode: 'multiply' }}
            />
            {!isCollapsed && (
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: TEXT,
                  letterSpacing: '-0.035em',
                  lineHeight: 1,
                  fontFamily: 'Inter, -apple-system, sans-serif',
                  marginLeft: -8,
                }}
              >
                obyra
              </span>
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
                      background: TEAL,
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
                      {loading ? 'Loading...' : business?.name || 'My Business'}
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
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {loading ? '' : [business?.full_name, business?.role_title].filter(Boolean).join(' · ') || 'Owner'}
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
                  boxShadow: 'none',
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