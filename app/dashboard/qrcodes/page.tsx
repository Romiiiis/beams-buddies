'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import QRCode from 'qrcode'

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

      const { data: userData } = await supabase
        .from('users')
        .select('business_id')
        .eq('id', session.user.id)
        .single()

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

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const pad = isMobile ? '16px' : '32px'
  const cols = isMobile ? '1fr 1fr' : 'repeat(3, minmax(0, 1fr))'

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/qrcodes" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* DASHBOARD HEADER */}
        <div
          style={{
            background: '#fff',
            borderBottom: `1px solid ${BORDER}`,
            padding: isMobile ? '20px 16px 16px' : `28px ${pad} 20px`,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'flex-end',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: TEXT3, marginBottom: '6px', fontWeight: '500' }}>
              {todayStr}
            </div>
            <div style={{ fontSize: isMobile ? '26px' : '30px', fontWeight: '700', color: TEXT, letterSpacing: '-0.6px', lineHeight: 1 }}>
              QR codes
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard/jobs')}
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
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              fontFamily: 'inherit',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Add job
          </button>
        </div>

        {/* CONTENT */}
        <div style={{ padding: `${isMobile ? '16px' : '24px'} ${pad}`, paddingBottom: isMobile ? '90px' : '32px' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3 }}>Generating QR codes…</div>
          ) : jobs.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3 }}>
              No jobs yet. <span style={{ color: TEAL, cursor: 'pointer' }} onClick={() => router.push('/dashboard/jobs')}>Add your first job →</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: cols, gap: isMobile ? '10px' : '14px' }}>
              {jobs.map(job => {
                const name = `${job.customers?.first_name} ${job.customers?.last_name}`
                const qrSize = isMobile ? 110 : 140

                return (
                  <div key={job.id} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ height: '3px', background: TEAL }} />

                    <div style={{ padding: isMobile ? '16px 12px' : '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      {qrUrls[job.id] ? (
                        <img src={qrUrls[job.id]} alt="QR code" style={{ width: qrSize, height: qrSize, marginBottom: '12px', borderRadius: '8px' }} />
                      ) : (
                        <div style={{ width: qrSize, height: qrSize, background: BG, borderRadius: '8px', marginBottom: '12px' }} />
                      )}

                      <div style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: '600', color: TEXT }}>{name}</div>
                      <div style={{ fontSize: '12px', color: TEXT2, marginTop: '2px' }}>{job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                        <button
                          onClick={() => downloadQR(job.id, name)}
                          style={{ height: '32px', padding: '0 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT2, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => window.print()}
                          style={{ height: '32px', padding: '0 12px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          Print
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div
                onClick={() => router.push('/dashboard/jobs')}
                style={{
                  background: '#fff',
                  border: `1px dashed ${BORDER}`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '8px',
                  cursor: 'pointer',
                  minHeight: isMobile ? '180px' : '260px',
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: TEXT3 }}>+</div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT2 }}>Add new job</div>
                <div style={{ fontSize: '11px', color: TEXT3 }}>QR auto-generated</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}