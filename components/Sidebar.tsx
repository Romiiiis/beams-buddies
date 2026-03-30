'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const A = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#DEDEDE'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile
}

export function Sidebar({ active }: { active: string }) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const mainItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Customers', href: '/dashboard/customers' },
    { label: 'Schedule', href: '/dashboard/schedule' },
    { label: 'Jobs', href: '/dashboard/jobs' },
  ]

  const menuItems = [
    { label: 'Reports', href: '/dashboard/reports' },
    { label: 'QR Codes', href: '/dashboard/qrcodes' },
    { label: 'Settings', href: '/dashboard/settings' },
  ]

  const isMenuActive = menuItems.some(item => item.href === active)

  if (isMobile) {
    return (
      <>
        <div style={{ height: '74px', flexShrink: 0 }} />

        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            height: '74px',
            background: '#fff',
            borderTop: `1px solid ${BORDER}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            zIndex: 1000,
          }}
        >
          {mainItems.map(item => {
            const activeItem = active === item.href
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  color: activeItem ? A : TEXT3,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {/* KEEP YOUR EXISTING ICON HERE */}
                <span style={{ fontSize: '11px', fontWeight: activeItem ? '600' : '500' }}>{item.label}</span>
              </button>
            )
          })}

          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                color: isMenuActive || menuOpen ? A : TEXT3,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              {/* KEEP YOUR ORIGINAL SETTINGS ICON HERE */}
              <span style={{ fontSize: '11px', fontWeight: isMenuActive || menuOpen ? '600' : '500' }}>Menu</span>
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: '8px',
                  bottom: '82px',
                  width: '180px',
                  background: '#fff',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                }}
              >
                {menuItems.map((item, index) => {
                  const activeItem = active === item.href
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        setMenuOpen(false)
                        router.push(item.href)
                      }}
                      style={{
                        width: '100%',
                        height: '44px',
                        border: 'none',
                        borderBottom: index !== menuItems.length - 1 ? `1px solid ${BORDER}` : 'none',
                        background: activeItem ? '#F0F9F8' : '#fff',
                        color: activeItem ? A : TEXT2,
                        fontSize: '13px',
                        fontWeight: activeItem ? '600' : '500',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                        padding: '0 14px',
                        cursor: 'pointer',
                      }}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  return (
    <div
      style={{
        width: '240px',
        minHeight: '100vh',
        background: '#fff',
        borderRight: `1px solid ${BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: TEXT }}>Jobyra</div>
        <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>CRM dashboard</div>
      </div>

      <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {mainItems.map(item => {
          const activeItem = active === item.href
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                height: '42px',
                border: 'none',
                borderRadius: '10px',
                background: activeItem ? '#F0F9F8' : 'transparent',
                color: activeItem ? A : TEXT2,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 12px',
                fontSize: '14px',
                fontWeight: activeItem ? '600' : '500',
                fontFamily: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {/* KEEP YOUR EXISTING ICON HERE */}
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      <div ref={menuRef} style={{ padding: '12px', borderTop: `1px solid ${BORDER}`, position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          style={{
            width: '100%',
            height: '42px',
            border: 'none',
            borderRadius: '10px',
            background: isMenuActive || menuOpen ? '#F0F9F8' : 'transparent',
            color: isMenuActive || menuOpen ? A : TEXT2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            fontSize: '14px',
            fontWeight: isMenuActive || menuOpen ? '600' : '500',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* KEEP YOUR ORIGINAL SETTINGS ICON HERE */}
            <span>Menu</span>
          </div>
          <span style={{ fontSize: '12px' }}>{menuOpen ? '▲' : '▼'}</span>
        </button>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              right: '12px',
              bottom: '60px',
              background: '#fff',
              border: `1px solid ${BORDER}`,
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            {menuItems.map((item, index) => {
              const activeItem = active === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    setMenuOpen(false)
                    router.push(item.href)
                  }}
                  style={{
                    width: '100%',
                    height: '42px',
                    border: 'none',
                    borderBottom: index !== menuItems.length - 1 ? `1px solid ${BORDER}` : 'none',
                    background: activeItem ? '#F0F9F8' : '#fff',
                    color: activeItem ? A : TEXT2,
                    fontSize: '13px',
                    fontWeight: activeItem ? '600' : '500',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    padding: '0 12px',
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}