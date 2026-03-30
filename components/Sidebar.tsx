'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const A = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#DEDEDE'
const BG = '#F2F3F3'

type SidebarProps = {
  active?: string
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7V11h-7v9Zm0-16v5h7V4h-7Z" fill="currentColor" />
    </svg>
  )},
  { label: 'Customers', href: '/dashboard/customers', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M16 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM8 13a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 0c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4ZM8 11c2.21 0 4-1.79 4-4S10.21 3 8 3 4 4.79 4 7s1.79 4 4 4Z" fill="currentColor" />
    </svg>
  )},
  { label: 'Jobs', href: '/dashboard/jobs', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M10 4H4v16h16V8h-6l-4-4Zm1 2.5L13.5 9H18v9H6V6h5Z" fill="currentColor" />
    </svg>
  )},
  { label: 'Schedule', href: '/dashboard/schedule', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm11 8H6v10h12V10Z" fill="currentColor" />
    </svg>
  )},
  { label: 'Settings', href: '/dashboard/settings', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.51.4 1.05.71 1.63.94l.36 2.54a.5.5 0 0 0 .49.42h3.8a.5.5 0 0 0 .49-.42l.36-2.54c.58-.23 1.12-.54 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z" fill="currentColor" />
    </svg>
  )},
]

export function Sidebar({ active = '/dashboard' }: SidebarProps) {
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      style={{
        width: '276px',
        minHeight: '100vh',
        background: '#FFFFFF',
        borderRight: `1px solid ${BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px 14px 14px',
        boxSizing: 'border-box',
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 8px 18px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '14px',
              background: 'linear-gradient(180deg, #DDF6F4 0%, #F8FFFE 100%)',
              border: '1px solid #D6EEEC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0A4F4C',
              fontSize: '15px',
              fontWeight: '800',
              letterSpacing: '-0.3px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
              flexShrink: 0,
            }}
          >
            BM
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: TEXT,
                lineHeight: 1.1,
                letterSpacing: '-0.2px',
              }}
            >
              Beam CRM
            </div>
            <div
              style={{
                fontSize: '12px',
                color: TEXT3,
                marginTop: '4px',
                lineHeight: 1.2,
              }}
            >
              Service dashboard
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map(item => {
            const isActive = active === item.href
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  width: '100%',
                  border: 'none',
                  background: isActive ? '#F0F9F8' : 'transparent',
                  color: isActive ? '#0A4F4C' : TEXT2,
                  borderRadius: '12px',
                  padding: '12px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  transition: '0.18s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = '#F7F7F7'
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Redesigned bottom left owner/sign out area */}
      <div
        style={{
          marginTop: '18px',
          paddingTop: '14px',
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <div
          style={{
            background: '#FAFAFA',
            border: `1px solid ${BORDER}`,
            borderRadius: '16px',
            padding: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '16px',
                background: 'linear-gradient(180deg, #CCEFED 0%, #FFFFFF 100%)',
                border: '1px solid #D6EEEC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0A4F4C',
                fontSize: '15px',
                fontWeight: '800',
                letterSpacing: '-0.3px',
                flexShrink: 0,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)',
              }}
            >
              RA
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: TEXT,
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                Ramiz Arib
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: TEXT3,
                  marginTop: '3px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                Owner
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '12px',
              border: '1px solid #E7E7E7',
              background: '#FFFFFF',
              color: TEXT2,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#F7F7F7'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#FFFFFF'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M10 17l1.41-1.41L8.83 13H20v-2H8.83l2.58-2.59L10 7l-5 5 5 5Zm10 4H12v-2h8V5h-8V3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2Z" fill="currentColor" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}