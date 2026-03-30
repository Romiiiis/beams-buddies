'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const A = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#DEDEDE'
const BG = '#F2F3F3'

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
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return
      const { data } = await supabase.from('jobs').select('*, customers(first_name, last_name, email, phone, suburb)').eq('business_id', userData.business_id).order('next_service_date', { ascending: true })
      setJobs(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  function getDays(d: string) { return Math.floor((new Date(d).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) }

  function getUrgency(d: string) {
    const days = getDays(d)
    if (days < 0) return { status: 'overdue', bar: '#EF4444', valColor: '#B91C1C', label: `${Math.abs(days)}d overdue`, dateLabel: `Was due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}` }
    if (days <= 30) return { status: 'due_soon', bar: '#F59E0B', valColor: '#92400E', label: `${days}d until due`, dateLabel: `Due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}` }
    return { status: 'good', bar: A, valColor: '#0D6E69', label: `${days}d until due`, dateLabel: `Due ${new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}` }
  }

  const counts = {
    all: jobs.length,
    overdue: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) < 0).length,
    due_soon: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) >= 0 && getDays(j.next_service_date) <= 30).length,
    good: jobs.filter(j => j.next_service_date && getDays(j.next_service_date) > 30).length,
  }

  const filtered = jobs.filter(j => {
    if (filter === 'all') return true
    if (!j.next_service_date) return false
    return getUrgency(j.next_service_date).status === filter
  })

  const pad = isMobile ? '16px' : '30px'

  const filterTabs = [
    { key: 'all', label: isMobile ? `All (${counts.all})` : `All (${counts.all})` },
    { key: 'overdue', label: isMobile ? `Overdue (${counts.overdue})` : `Overdue (${counts.overdue})` },
    { key: 'due_soon', label: isMobile ? `Soon (${counts.due_soon})` : `Due soon (${counts.due_soon})` },
    { key: 'good', label: isMobile ? `Good (${counts.good})` : `Upcoming (${counts.good})` },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/schedule" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <div style={{ height: '58px', background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: `0 ${pad}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '17px', fontWeight: '600', color: TEXT }}>Service schedule</div>
          {!isMobile && (
            <button style={{ height: '36px', padding: '0 18px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              Send all reminders
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: `${isMobile ? '16px' : '24px'} ${pad}`, paddingBottom: isMobile ? '90px' : '24px' }}>

          {/* Filter tabs — scrollable on mobile */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {filterTabs.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{ height: '34px', padding: '0 14px', borderRadius: '20px', border: `1px solid ${filter === f.key ? A : BORDER}`, background: filter === f.key ? A : '#fff', color: filter === f.key ? '#fff' : TEXT2, fontSize: '13px', fontWeight: filter === f.key ? '600' : '400', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>No jobs in this category.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map(job => {
                const u = job.next_service_date ? getUrgency(job.next_service_date) : null
                return (
                  <div key={job.id} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: isMobile ? '14px' : '16px 20px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '12px' }}>
                    <div style={{ width: '4px', height: isMobile ? '100%' : '44px', minHeight: '44px', borderRadius: '4px', background: u?.bar || BORDER, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '3px' }}>
                        {job.customers?.first_name} {job.customers?.last_name}
                      </div>
                      <div style={{ fontSize: '13px', color: TEXT2, marginBottom: '2px' }}>
                        {job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} {job.equipment_type.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: '12px', color: TEXT3 }}>{job.customers?.suburb || '—'}</div>
                      {isMobile && (
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: u?.valColor || TEXT3 }}>{u?.label || 'No date set'}</div>
                            <div style={{ fontSize: '11px', color: TEXT3 }}>{u?.dateLabel || '—'}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button style={{ height: '30px', padding: '0 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT2, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>Email</button>
                            <button style={{ height: '30px', padding: '0 12px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>SMS</button>
                          </div>
                        </div>
                      )}
                    </div>
                    {!isMobile && (
                      <>
                        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '140px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: u?.valColor || TEXT3 }}>{u?.label || 'No date set'}</div>
                          <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{u?.dateLabel || '—'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT2, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Email</button>
                          <button style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>SMS</button>
                        </div>
                      </>
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