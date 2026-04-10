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
    <img
      src="https://static.wixstatic.com/media/48c433_275af6b2cf654876ac6b4d488595e94c~mv2.png"
      alt="Dashboard"
      style={{ width: 18, height: 18, objectFit: 'contain' }}
    />
  ),

  '/dashboard/customers': (
    <img
      src="https://static.wixstatic.com/media/48c433_eb5f601865a645939154bbe679d8e2a0~mv2.png"
      alt="Customers"
      style={{ width: 18, height: 18, objectFit: 'contain' }}
    />
  ),

  '/dashboard/leads': (
    <img
      src="https://static.wixstatic.com/media/48c433_e4537a2002634cba9871fbdc2b886b8a~mv2.png"
      alt="Leads"
      style={{ width: 18, height: 18, objectFit: 'contain' }}
    />
  ),

  '/dashboard/jobs': (
    <img
      src="https://static.wixstatic.com/media/48c433_97fb2a3aacb64329967cc40ebc8e5d0e~mv2.png"
      alt="Jobs"
      style={{ width: 18, height: 18, objectFit: 'contain' }}
    />
  ),

  '/dashboard/quotes': (
    <img
      src="https://static.wixstatic.com/media/48c433_8c9ea7223694496293ac015c7a34c1d0~mv2.png"
      alt="Quotes"
      style={{ width: 18, height: 18, objectFit: 'contain' }}
    />
  ),

  '/dashboard/invoices': (
    <img
      src="https://static.wixstatic.com/media/48c433_7f2ee3fe8f84466a82117a774ec03d55~mv2.png"
      alt="Invoices"
      style={{ width: 18, height: 18, objectFit: 'contain' }}
    />
  ),

  '/dashboard/revenue': (
    <img
      src="https://static.wixstatic.com/media/48c433_c60e43bdd7c54c4a834aad9132d7a0d8~mv2.png"
      alt="Revenue"
      style={{ width: 18, height: 18, objectFit: 'contain' }}
    />
  ),

  '/dashboard/schedule': (
    <img
      src="https://static.wixstatic.com/media/48c433_d9f72d8508bd42149766cc5310f1880e~mv2.png"
      alt="Service"
      style={{ width: 18, height: 18, objectFit: 'contain' }}
    />
  ),

  '/dashboard/qrcodes': (
    <img
      src="https://static.wixstatic.com/media/48c433_85c788cea5d94da097d1bbc631c25044~mv2.png"
      alt="QR Code"
      style={{ width: 18, height: 18, objectFit: 'contain' }}
    />
  ),

  '/dashboard/reports': (
    <img
      src="https://static.wixstatic.com/media/48c433_bded5cf8a9bc45fd9ef7fff40d3ccbc8~mv2.png"
      alt="Reports"
      style={{ width: 18, height: 18, objectFit: 'contain' }}
    />
  ),

  '/dashboard/settings': (
    <img
      src="https://static.wixstatic.com/media/48c433_a8bdb8a29ac64e40af9caba6d21fd86b~mv2.png"
      alt="Settings"
      style={{ width: 18, height: 18, objectFit: 'contain' }}
    />
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
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 600,
                    lineHeight: 1.1,
                    letterSpacing: '-0.01em',
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

        .sidebar-icon svg {
          display: block;
          width: 18px;
          height: 18px;
          stroke-width: 1.9;
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