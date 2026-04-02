'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBusinessData } from '@/lib/business-context'

const A = '#1C1C1E'
const TEAL = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#EBEBEB'
const BG = '#FAFAF8'

const navMain = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Customers', href: '/dashboard/customers' },
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

function NavItem({ href, label, active, router }: any) {
  return (
    <div
      onClick={() => router.push(href)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        color: active ? '#fff' : TEXT2,
        fontWeight: active ? '500' : '500',
        background: active ? A : 'transparent',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.background = '#F2F3F3'
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.background = 'transparent'
      }}
    >
      {label}
    </div>
  )
}

function SectionLabel({ label }: any) {
  return (
    <div
      style={{
        fontSize: '11px',
        fontWeight: '600',
        color: TEXT3,
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        padding: '16px 12px 6px',
      }}
    >
      {label}
    </div>
  )
}

export function Sidebar({ active }: any) {
  const router = useRouter()
  const { business, loading } = useBusinessData()

  const initials = business?.full_name
    ? business.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : ''

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div
      style={{
        width: '240px',
        flexShrink: 0,
        background: '#fff',
        borderRight: `1px solid ${BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: '700', color: TEXT }}>
          Jobyra
        </div>
        <div style={{ fontSize: '12px', color: TEXT3, marginTop: '4px' }}>
          {business?.name || 'Trade CRM'}
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '10px', flex: 1 }}>
        <SectionLabel label="Overview" />
        {navMain.map(i => (
          <NavItem key={i.href} {...i} active={i.href === active} router={router} />
        ))}

        <SectionLabel label="Finance" />
        {navFinance.map(i => (
          <NavItem key={i.href} {...i} active={i.href === active} router={router} />
        ))}

        <SectionLabel label="Manage" />
        {navManage.map(i => (
          <NavItem key={i.href} {...i} active={i.href === active} router={router} />
        ))}
      </div>

      {/* Footer (MATCHES DASHBOARD CARD STYLE) */}
      <div
        style={{
          padding: '16px',
          borderTop: `1px solid ${BORDER}`,
          background: BG,
        }}
      >
        <div
          style={{
            background: '#fff',
            border: `1px solid ${BORDER}`,
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {business?.logo_url ? (
            <img
              src={business.logo_url}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#F0F0F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '12px',
              }}
            >
              {initials}
            </div>
          )}

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT }}>
              {business?.full_name}
            </div>
            <div style={{ fontSize: '11px', color: TEXT3 }}>
              {business?.role_title || 'Owner'}
            </div>
          </div>

          <button
            onClick={signOut}
            style={{
              fontSize: '11px',
              color: TEXT3,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}