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

export default function ReportsPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return

      const [customersRes, jobsRes] = await Promise.all([
        supabase.from('customers').select('id, created_at').eq('business_id', userData.business_id),
        supabase.from('jobs').select('id, brand, install_date, next_service_date, created_at').eq('business_id', userData.business_id),
      ])

      const today = new Date()
      const jobs = jobsRes.data || []
      const customers = customersRes.data || []

      const jobsThisMonth = jobs.filter(j => {
        const d = new Date(j.created_at)
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
      }).length

      const overdue = jobs.filter(j => j.next_service_date && new Date(j.next_service_date) < today).length
      const dueSoon = jobs.filter(j => {
        if (!j.next_service_date) return false
        const diff = Math.floor((new Date(j.next_service_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return diff >= 0 && diff <= 30
      }).length

      const brandCounts = jobs.reduce((acc: any, j) => {
        acc[j.brand] = (acc[j.brand] || 0) + 1
        return acc
      }, {})
      const sortedBrands: [string, number][] = Object.entries(brandCounts).sort((a: any, b: any) => b[1] - a[1]) as [string, number][]
      const maxBrand = (sortedBrands[0]?.[1] as number) || 1

      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        return { key: `month-${i}`, label: d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) }
      })

      const monthCounts: Record<string, number> = {}
      jobs.forEach(j => {
        const d = new Date(j.created_at)
        const key = d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
        monthCounts[key] = (monthCounts[key] || 0) + 1
      })
      const maxMonth = Math.max(...last6Months.map(m => monthCounts[m.label] || 0), 1)

      setData({
        totalCustomers: customers.length,
        totalJobs: jobs.length,
        jobsThisMonth,
        overdue,
        dueSoon,
        sortedBrands,
        maxBrand,
        last6Months,
        monthCounts,
        maxMonth,
      })
      setLoading(false)
    }
    load()
  }, [router])

  const pad = isMobile ? '16px' : '30px'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/reports" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <div style={{ height: '58px', background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: `0 ${pad}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '17px', fontWeight: '600', color: TEXT }}>Reports</div>
          {!isMobile && (
            <button style={{ height: '36px', padding: '0 18px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT2, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Export PDF
            </button>
          )}
        </div>

        <div style={{ flex: 1, padding: `${isMobile ? '16px' : '24px'} ${pad}`, paddingBottom: isMobile ? '90px' : '24px' }}>
          {loading || !data ? (
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }}>
                {[
                  { label: 'Total customers', value: data.totalCustomers, topBar: A, valColor: TEXT },
                  { label: 'Total units', value: data.totalJobs, topBar: A, valColor: TEXT },
                  { label: 'Jobs this month', value: data.jobsThisMonth, topBar: A, valColor: TEXT },
                  { label: 'Overdue services', value: data.overdue, topBar: data.overdue > 0 ? '#EF4444' : A, valColor: data.overdue > 0 ? '#B91C1C' : TEXT },
                ].map(s => (
                  <div key={s.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ height: '3px', background: s.topBar }} />
                    <div style={{ padding: isMobile ? '12px 14px' : '16px 20px 18px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: TEXT2, marginBottom: '8px' }}>{s.label}</div>
                      <div style={{ fontSize: isMobile ? '26px' : '30px', fontWeight: '600', color: s.valColor, lineHeight: 1 }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px 20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '16px' }}>Jobs by month</div>
                  {data.last6Months.map((month: { key: string, label: string }) => {
                    const count = data.monthCounts[month.label] || 0
                    const pct = Math.round((count / data.maxMonth) * 100)
                    return (
                      <div key={month.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '11px', color: TEXT3, width: '60px', textAlign: 'right', flexShrink: 0 }}>{month.label}</div>
                        <div style={{ flex: 1, height: '8px', background: BG, borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: A, borderRadius: '4px' }} />
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, width: '20px', textAlign: 'right', flexShrink: 0 }}>{count}</div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px 20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '16px' }}>Units by brand</div>
                  {data.sortedBrands.length === 0 ? (
                    <div style={{ fontSize: '13px', color: TEXT3 }}>No data yet</div>
                  ) : data.sortedBrands.map(([brand, count]: [string, number]) => {
                    const pct = Math.round((count / data.maxBrand) * 100)
                    return (
                      <div key={brand} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '11px', color: TEXT3, width: '60px', textAlign: 'right', flexShrink: 0 }}>{brand}</div>
                        <div style={{ flex: 1, height: '8px', background: BG, borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: A, borderRadius: '4px' }} />
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, width: '20px', textAlign: 'right', flexShrink: 0 }}>{count}</div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px 20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '14px' }}>Service compliance</div>
                  {[
                    { label: 'Total units tracked', value: data.totalJobs, color: TEXT },
                    { label: 'Overdue services', value: data.overdue, color: data.overdue > 0 ? '#B91C1C' : TEXT },
                    { label: 'Due within 30 days', value: data.dueSoon, color: data.dueSoon > 0 ? '#92400E' : TEXT },
                    { label: 'Up to date', value: data.totalJobs - data.overdue - data.dueSoon, color: '#065F46' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
                      <span style={{ fontSize: '13px', color: TEXT2 }}>{row.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px 20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '14px' }}>Customer summary</div>
                  {[
                    { label: 'Total customers', value: data.totalCustomers },
                    { label: 'Jobs this month', value: data.jobsThisMonth },
                    { label: 'Total units installed', value: data.totalJobs },
                    { label: 'Avg units per customer', value: data.totalCustomers > 0 ? (data.totalJobs / data.totalCustomers).toFixed(1) : '0' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
                      <span style={{ fontSize: '13px', color: TEXT2 }}>{row.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}