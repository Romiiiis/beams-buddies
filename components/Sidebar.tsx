'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusinessData } from '@/lib/business-context'
import { AppIcon } from '@/components/AppIcon'
import { SkeletonBox } from '@/components/Skeleton'

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
]

const navManage = [
  { label: 'Calendar', href: '/dashboard/calendar' },
  { label: 'Service schedule', href: '/dashboard/schedule' },
  { label: 'Marketing', href: '/dashboard/marketing' },
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

// The same full list and groups as the desktop sidebar
const mobileMenuGroups: { label?: string; items: { label: string; href: string }[] }[] = [
  { items: navMain },
  { label: 'Finance', items: navFinance },
  { label: 'Manage', items: navManage },
]

// One row height for the phone menu: never below a comfortable tap size, a little taller on tall
// phones so the list fills the panel.
const MENU_ROW_HEIGHT = 'clamp(44px, 5.4dvh, 52px)'

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
  '/dashboard/schedule': <ScheduleIcon />,
  '/dashboard/marketing': <AppIcon name="message" size={20} />,
  '/dashboard/calendar': <AppIcon name="clock" size={20} />,
  '/dashboard/qrcodes': <QrCodesIcon />,
  '/dashboard/reports': <ReportsIcon />,
  '/dashboard/settings': <SettingsIcon />,
  menu: <AppsIcon />,
}

function LogoutIcon() {
  return <AppIcon name="logout" size={20} />
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  )
}

export function Sidebar({ active }: { active: string }) {
  const router = useRouter()
  const { business, loading } = useBusinessData()
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Browser tab and history show which page you are on, e.g. "Invoices · Jobyra"
  useEffect(() => {
    const all = [...navMain, ...navFinance, ...navManage]
    const label = all.find(i => i.href === active)?.label
    document.title = label ? `${label} · Jobyra` : 'Jobyra'
  }, [active])

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
    if (!isMobile) return

    const routes = [
      '/dashboard',
      '/dashboard/jobs',
      '/dashboard/customers',
      '/dashboard/settings',
      '/dashboard/leads',
      '/dashboard/quotes',
      '/dashboard/invoices',
      '/dashboard/schedule',
      '/dashboard/marketing',
      '/dashboard/calendar',
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

          {/* Stops at the tab bar. The header and Log out stay put; only the list between them scrolls on short phones. */}
          <aside
            style={{
              position: 'fixed',
              top: 0,
              left: isMobileMenuOpen ? 0 : '-82vw',
              bottom: 'var(--tabbar-h)',
              width: 'min(78vw, 318px)',
              zIndex: 110,
              background: BG,
              borderRight: `1px solid ${BORDER}`,
              boxShadow: 'none',
              padding: 'calc(env(safe-area-inset-top) + 14px) 12px 0',
              transition: 'left 0.24s ease',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            {/* The logo sits in a fixed slot beside the name, so any logo shape leaves the name and title in place */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 0 14px 12px',
                flexShrink: 0,
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              {!loading && business?.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business?.name || 'Company logo'}
                  style={{
                    display: 'block',
                    width: 72,
                    height: 48,
                    objectFit: 'contain',
                    objectPosition: 'left center',
                    flexShrink: 0,
                  }}
                />
              ) : loading ? (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: BG,
                    border: `1px solid ${BORDER}`,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
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

              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: TEXT,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    overflowWrap: 'anywhere',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {loading ? <SkeletonBox w={110} h={12} /> : business?.full_name || 'Owner'}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: TEXT3,
                    marginTop: 4,
                    lineHeight: 1.2,
                    overflowWrap: 'anywhere',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {loading ? '' : business?.role_title || business?.name || 'Jobyra workspace'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  border: 'none',
                  background: 'transparent',
                  color: TEXT3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 0,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <CloseIcon />
              </button>
            </div>

            <div
              className="mobile-menu-scroll"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                overscrollBehavior: 'contain',
                display: 'flex',
                flexDirection: 'column',
                padding: '6px 0',
              }}
            >
              {mobileMenuGroups.map((group, gi) => (
                <React.Fragment key={group.label || 'main'}>
                  {group.label && (
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.10em',
                        textTransform: 'uppercase',
                        color: TEXT3,
                        padding: '10px 12px 3px',
                        lineHeight: 1.2,
                        flexShrink: 0,
                      }}
                    >
                      {group.label}
                    </div>
                  )}
              {group.items.map(item => {
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
                      height: MENU_ROW_HEIGHT,
                      flexShrink: 0,
                      padding: '0 8px',
                      borderRadius: 12,
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
                </React.Fragment>
              ))}
            </div>

            <div
              style={{
                flexShrink: 0,
                padding: '6px 0 8px',
                borderTop: `1px solid ${BORDER}`,
              }}
            >
              <button
                onClick={signOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  height: MENU_ROW_HEIGHT,
                  padding: '0 8px',
                  borderRadius: 12,
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
              zIndex: 111,
              height: 'var(--tabbar-h)',
              background: WHITE,
              borderTop: `1px solid ${BORDER}`,
              borderLeft: 'none',
              borderRight: 'none',
              borderBottom: 'none',
              borderRadius: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              alignItems: 'center',
              padding: '6px 12px var(--tabbar-bottom)',
              boxShadow: 'none',
              overflow: 'hidden',
              overscrollBehavior: 'none',
              fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
                  aria-label={isMenuTab ? 'Menu' : undefined}
                  aria-expanded={isMenuTab ? isMobileMenuOpen : undefined}
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
                      width: isMenuTab ? 44 : 22,
                      height: isMenuTab ? 44 : 22,
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

      <div className="no-print"
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
            fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
              src="/jobyra-logo.jpg"
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
                  fontFamily: 'var(--font-sans), -apple-system, sans-serif',
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
                      {loading ? <SkeletonBox w={120} h={12} /> : business?.name || 'My Business'}
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