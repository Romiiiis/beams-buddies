'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import QRCode from 'qrcode'

const TEAL = '#2AA198'
const TEAL_DARK = '#1E8C84'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#6B7280'
const BORDER = '#E5E7EB'
const BG = '#F4F4F2'
const WHITE = '#FFFFFF'

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

export default function QRCodesPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return
      const { data } = await supabase
        .from('jobs')
        .select('id, qr_code_token, brand, model, capacity_kw, install_date, customers(first_name, last_name, suburb)')
        .eq('business_id', userData.business_id)
        .order('created_at', { ascending: false })
      setJobs(data || [])
      const urls: Record<string, string> = {}
      for (const job of data || []) {
        const url = `${window.location.origin}/register/${job.qr_code_token}`
        urls[job.id] = await QRCode.toDataURL(url, { width: 140, margin: 1 })
      }
      setQrUrls(urls)
      setLoading(false)
    }
    load()
  }, [router])

  async function downloadQR(jobId: string, name: string) {
    const url = qrUrls[jobId]
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${name.replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
  }

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pad = isMobile ? '16px' : '32px'
  const cols = isMobile ? '1fr 1fr' : 'repeat(3, minmax(0, 1fr))'

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/qrcodes" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{
          background: '#33B5AC',
          padding: isMobile ? '24px 16px 22px' : `32px ${pad} 28px`,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '6px', fontWeight: '500' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', color: WHITE, letterSpacing: '-0.8px', lineHeight: 1 }}>QR codes</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '6px', fontWeight: '500' }}>One per unit — scan to register a service request</div>
          </div>
          <button onClick={() => router.push('/dashboard/jobs')}
            style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: 'none', background: WHITE, color: TEAL_DARK, fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke={TEAL_DARK} strokeWidth="2" strokeLinecap="round"/></svg>
            Add job
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: `28px ${pad}`, paddingBottom: isMobile ? '90px' : '40px' }}>

          {/* Section label */}
          <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
            All units — {jobs.length} total
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Generating QR codes…</div>
          ) : jobs.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>
              No jobs yet. <span style={{ color: TEAL, cursor: 'pointer', fontWeight: '600' }} onClick={() => router.push('/dashboard/jobs')}>Add your first job →</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: cols, gap: isMobile ? '10px' : '14px' }}>
              {jobs.map(job => {
                const name = `${job.customers?.first_name} ${job.customers?.last_name}`
                const qrSize = isMobile ? 110 : 140
                return (
                  <div key={job.id} style={card}>
                    <div style={{ height: '3px', background: TEAL }} />
                    <div style={{ padding: isMobile ? '16px 12px' : '22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      {qrUrls[job.id] ? (
                        <div style={{ padding: '8px', background: WHITE, borderRadius: '10px', border: `1px solid ${BORDER}`, marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                          <img src={qrUrls[job.id]} alt="QR code" style={{ width: qrSize, height: qrSize, display: 'block', borderRadius: '4px' }}/>
                        </div>
                      ) : (
                        <div style={{ width: qrSize, height: qrSize, background: BG, borderRadius: '10px', marginBottom: '14px', border: `1px solid ${BORDER}` }}/>
                      )}
                      <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '700', color: TEXT, marginBottom: '2px' }}>{name}</div>
                      <div style={{ fontSize: '12px', color: TEXT3, fontWeight: '500', marginBottom: '2px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                      {job.customers?.suburb && <div style={{ fontSize: '11px', color: TEXT3, marginBottom: '14px' }}>{job.customers.suburb}</div>}
                      <div style={{ display: 'flex', gap: '6px', marginTop: job.customers?.suburb ? '0' : '12px' }}>
                        <button onClick={() => downloadQR(job.id, name)}
                          style={{ height: '32px', padding: '0 14px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = TEAL}
                          onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                          Save
                        </button>
                        <button onClick={() => window.print()}
                          style={{ height: '32px', padding: '0 14px', borderRadius: '8px', border: 'none', background: TEAL, color: WHITE, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
                          onMouseEnter={e => e.currentTarget.style.background = TEAL_DARK}
                          onMouseLeave={e => e.currentTarget.style.background = TEAL}>
                          Print
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Add new tile */}
              <div onClick={() => router.push('/dashboard/jobs')}
                style={{ background: WHITE, border: `1.5px dashed ${BORDER}`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', cursor: 'pointer', minHeight: isMobile ? '180px' : '260px', transition: 'border-color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.background = '#F0FAF9' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = WHITE }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: BG, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: TEXT3 }}>+</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: TEXT2 }}>Add new job</div>
                <div style={{ fontSize: '11px', color: TEXT3, fontWeight: '500' }}>QR auto-generated</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}