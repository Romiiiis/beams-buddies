'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#2AA198'
const TEAL_DARK = '#1E8C84'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#6B7280'
const BORDER = '#E5E7EB'
const BG = '#F4F4F2'
const WHITE = '#FFFFFF'

const avColors = [
  { bg: '#E8F4F1', color: '#0A4F4C' },
  { bg: '#DBEAFE', color: '#1E3A8A' },
  { bg: '#FEF3C7', color: '#78350F' },
  { bg: '#EDE9FE', color: '#4C1D95' },
  { bg: '#FFE4E6', color: '#881337' },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function CustomersPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return

      const { data } = await supabase
        .from('customers')
        .select('*, jobs(next_service_date)')
        .eq('business_id', userData.business_id)
        .order('created_at', { ascending: false })

      let filtered = data || []
      if (search) {
        filtered = filtered.filter((c: any) =>
          `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
        )
      }

      setCustomers(filtered)
      setLoading(false)
    }

    load()
  }, [search, router])

  function getDays(d: string) {
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function statusPill(jobs: any[]) {
    if (!jobs?.length) return { label: 'No units', bg: '#F3F4F6', color: '#6B7280' }
    const next = jobs[0]?.next_service_date
    if (!next) return { label: 'No date', bg: '#F3F4F6', color: '#6B7280' }

    const days = getDays(next)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#D1FAE5', color: '#064E3B' }
  }

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const pad = isMobile ? '16px' : '32px'

  const card = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/customers" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* HEADER — EXACT MATCH */}
        <div style={{
          background: '#33B5AC',
          padding: isMobile ? '24px 16px 22px' : `32px ${pad} 28px`,
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '6px', fontWeight: '500' }}>
            {todayStr}
          </div>
          <div style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', color: '#fff', letterSpacing: '-0.8px' }}>
            Customers
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: `${isMobile ? '20px' : '28px'} ${pad}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* SEARCH */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{
                width: '100%',
                maxWidth: '360px',
                height: '40px',
                padding: '0 14px',
                borderRadius: '10px',
                border: `1px solid ${BORDER}`,
                background: '#fff',
                fontSize: '13px',
              }}
            />
            <div style={{ fontSize: '13px', color: TEXT3 }}>{customers.length} total</div>
          </div>

          {/* TABLE CARD */}
          <div style={card}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Customer', 'Phone', 'Units', 'Next service', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '12px 22px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: TEXT3,
                      borderBottom: `1px solid ${BORDER}`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {customers.map((c, i) => {
                  const av = avColors[i % avColors.length]
                  const s = statusPill(c.jobs)

                  return (
                    <tr key={c.id}
                      onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                      style={{ cursor: 'pointer', borderBottom: `1px solid ${BORDER}` }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: av.bg,
                            color: av.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '700',
                          }}>
                            {(c.first_name?.[0] || '') + (c.last_name?.[0] || '')}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>
                              {c.first_name} {c.last_name}
                            </div>
                            <div style={{ fontSize: '12px', color: TEXT3 }}>
                              {c.suburb || c.address || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 22px', fontSize: '13px', color: TEXT2 }}>{c.phone || '—'}</td>
                      <td style={{ padding: '14px 22px', fontSize: '13px', color: TEXT2 }}>{c.jobs?.length || 0}</td>

                      <td style={{ padding: '14px 22px', fontSize: '13px', color: TEXT2 }}>
                        {c.jobs?.[0]?.next_service_date
                          ? new Date(c.jobs[0].next_service_date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
                          : '—'}
                      </td>

                      <td style={{ padding: '14px 22px' }}>
                        <span style={{
                          background: s.bg,
                          color: s.color,
                          padding: '4px 11px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}