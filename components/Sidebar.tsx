'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusinessData } from '@/lib/business-context'
import {
  LayoutDashboard,
  Users,
  Target,
  FilePlus,
  FileText,
  Receipt,
  TrendingUp,
  Clock,
  QrCode,
  BarChart2,
  Settings,
} from 'lucide-react'

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
  '/dashboard':          <LayoutDashboard size={18} strokeWidth={1.75}/>,
  '/dashboard/customers':<Users           size={18} strokeWidth={1.75}/>,
  '/dashboard/leads':    <Target          size={18} strokeWidth={1.75}/>,
  '/dashboard/jobs':     <FilePlus        size={18} strokeWidth={1.75}/>,
  '/dashboard/quotes':   <FileText        size={18} strokeWidth={1.75}/>,
  '/dashboard/invoices': <Receipt         size={18} strokeWidth={1.75}/>,
  '/dashboard/revenue':  <TrendingUp      size={18} strokeWidth={1.75}/>,
  '/dashboard/schedule': <Clock           size={18} strokeWidth={1.75}/>,
  '/dashboard/qrcodes':  <QrCode          size={18} strokeWidth={1.75}/>,
  '/dashboard/reports':  <BarChart2       size={18} strokeWidth={1.75}/>,
  '/dashboard/settings': <Settings        size={18} strokeWidth={1.75}/>,
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