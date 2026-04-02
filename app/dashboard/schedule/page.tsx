'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const A = '#1C1C1E'
const TEAL = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#EBEBEB'
const BG = '#FAFAF8'

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

export default function SchedulePage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

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
        .from('jobs')
        .select('*, customers(first_name, last_name, email, phone, suburb)')
        .eq('business_id', userData.business_id)
        .order('next_service_date', { ascending: true })

      setJobs(data || [])
      setLoading(false)
    }

    load()
  }, [router])

  function getDays(d: string) {
    return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  function getUrgency(d: string) {
    const days = getDays(d)
    if (days < 0) return {
      status: 'overdue',
      bar: '#EF4444',
      valColor: '#B91C1C',
      label: `${Math.abs(days)}d overdue`,
      dateLabel: `Was due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
    }
    if (days <= 30) return {
      status: 'due_soon',
      bar: '#F59E0B',
      valColor: '#92400E',
      label: `${days}d until due`,
      dateLabel: `Due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
    }
    return {
      status: 'good',
      bar: TEAL,
      valColor: '#0D6E69',
      label: `${days}d until due`,
      dateLabel: `Due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
    }
  }

  const counts = {
    all: jobs.length,
    overdue: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length,
    due_soon: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) <= 30 && getDays(j.next_service_date) >= 0).length,
    good: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) > 30).length,
  }

  const filtered = jobs.filter(j => {
    if (filter === 'all') return true
    if (!j.next_service_date) return false
    return getUrgency(j.next_service_date).status === filter
  })

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const pad = isMobile ? '16px' : '32px'

  const filterTabs = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'overdue', label: `Overdue (${counts.overdue})` },
    { key: 'due_soon', label: `Due soon (${counts.due_soon})` },
    { key: 'good', label: `Upcoming (${counts.good})` },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: BG }}>
      <Sidebar active="/dashboard/schedule" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* DASHBOARD HEADER */}
        <div
          style={{
            background: '#fff',
            borderBottom: `1px solid ${BORDER}`,
            padding: isMobile ? '20px 16px 16px' : `28px ${pad} 20px`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-end',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: TEXT3, marginBottom: '6px', fontWeight: '500' }}>
              {todayStr}
            </div>
            <div style={{ fontSize: '30px', fontWeight: '700', color: TEXT }}>
              Service schedule
            </div>
          </div>

          {!isMobile && (
            <button
              style={{
                height: '38px',
                padding: '0 16px',
                borderRadius: '8px',
                border: 'none',
                background: A,
                color: '#fff',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Send all reminders
            </button>
          )}
        </div>

        {/* CONTENT */}
        <div style={{ padding: `${isMobile ? '16px' : '24px'} ${pad}` }}>

          {/* FILTERS */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
            {filterTabs.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: '20px',
                  border: `1px solid ${filter === f.key ? A : BORDER}`,
                  background: filter === f.key ? A : '#fff',
                  color: filter === f.key ? '#fff' : TEXT2,
                  fontSize: '13px',
                  fontWeight: filter === f.key ? '600' : '500',
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3 }}>Loading…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map(job => {
                const u = job.next_service_date ? getUrgency(job.next_service_date) : null

                return (
                  <div
                    key={job.id}
                    style={{
                      background: '#fff',
                      border: `1px solid ${BORDER}`,
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                    }}
                  >
                    <div style={{ width: '4px', height: '44px', borderRadius: '4px', background: u?.bar || BORDER }} />

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>
                        {job.customers?.first_name} {job.customers?.last_name}
                      </div>
                      <div style={{ fontSize: '13px', color: TEXT2 }}>
                        {job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                      </div>
                      <div style={{ fontSize: '12px', color: TEXT3 }}>
                        {job.customers?.suburb || '—'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: u?.valColor }}>
                        {u?.label}
                      </div>
                      <div style={{ fontSize: '12px', color: TEXT3 }}>
                        {u?.dateLabel}
                      </div>
                    </div>

                    {!isMobile && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: `1px solid ${BORDER}` }}>Email</button>
                        <button style={{ height: '34px', padding: '0 14px', borderRadius: '8px', background: A, color: '#fff', border: 'none' }}>SMS</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}