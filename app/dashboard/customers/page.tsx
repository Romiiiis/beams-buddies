'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#1F9E94'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#475569'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TYPE = {
  label: { fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT3 },
  title: { fontSize: '13px', fontWeight: 700, color: TEXT2 },
  titleSm: { fontSize: '12px', fontWeight: 800, color: TEXT },
  body: { fontSize: '12px', fontWeight: 500, color: TEXT2 },
  bodySm: { fontSize: '11px', fontWeight: 500, color: TEXT3 },
}

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
    const check = () => setIsMobile(window.innerWidth < 768)
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

      const { data: userData } = await supabase
        .from('users')
        .select('business_id')
        .eq('id', session.user.id)
        .single()

      if (!userData) return

      const { data } = await supabase
        .from('customers')
        .select('*, jobs(id, brand, capacity_kw, next_service_date)')
        .eq('business_id', userData.business_id)
        .order('created_at', { ascending: false })

      setCustomers(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  function getDays(d: string) {
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function statusPill(jobs: any[]) {
    if (!jobs?.length) return { label: 'No units', bg: '#F1F5F9', color: TEXT3 }
    const next = jobs[0]?.next_service_date
    if (!next) return { label: 'No date', bg: '#F1F5F9', color: TEXT3 }

    const days = getDays(next)
    if (days < 0) return { label: 'Overdue', bg: '#FEE2E2', color: '#7F1D1D' }
    if (days <= 30) return { label: 'Due soon', bg: '#FEF3C7', color: '#78350F' }
    return { label: 'Good', bg: '#DCFCE7', color: '#166534' }
  }

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const shellCard = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
  }

  const sectionLabel = {
    ...TYPE.label,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  }

  const sectionDash = (
    <span style={{
      width: '12px',
      height: '2px',
      background: TEAL,
      borderRadius: '999px'
    }} />
  )

  const filtered = useMemo(() => {
    if (!search) return customers
    return customers.filter(c =>
      `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
    )
  }, [customers, search])

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: FONT, background: BG }}>
      <Sidebar active="/dashboard/customers" />

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{
          background: HEADER_BG,
          padding: isMobile ? '18px 16px' : '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{todayStr}</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginTop: '6px' }}>
            Customers
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: isMobile ? '14px' : '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* SEARCH */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customers..."
              style={{
                height: '38px',
                borderRadius: '10px',
                border: `1px solid ${BORDER}`,
                padding: '0 12px',
                fontSize: '12px',
                width: '280px'
              }}
            />
            <div style={{ ...TYPE.body }}>{filtered.length} total</div>
          </div>

          {/* LIST */}
          <div style={shellCard}>
            <div style={{ padding: '14px' }}>
              <div style={sectionLabel}>{sectionDash}Directory</div>

              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: TEXT3 }}>Loading...</div>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {filtered.map((c, i) => {
                    const av = avColors[i % avColors.length]
                    const s = statusPill(c.jobs)

                    return (
                      <div
                        key={c.id}
                        onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                        style={{
                          borderRadius: '12px',
                          border: `1px solid ${BORDER}`,
                          padding: '12px 14px',
                          background: WHITE,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '12px',
                            background: av.bg,
                            color: av.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '12px'
                          }}>
                            {(c.first_name?.[0] || '') + (c.last_name?.[0] || '')}
                          </div>

                          <div>
                            <div style={TYPE.titleSm}>{c.first_name} {c.last_name}</div>
                            <div style={TYPE.bodySm}>{c.suburb || 'No suburb'}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            background: s.bg,
                            color: s.color,
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '10px',
                            fontWeight: 800
                          }}>
                            {s.label}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}