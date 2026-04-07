'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import QRCode from 'qrcode'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#475569'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TYPE = {
  label: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.08em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  section: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.14em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  bodySm: {
    fontSize: '11px',
    fontWeight: 500,
    color: TEXT3,
    lineHeight: 1.45,
  },
  body: {
    fontSize: '12px',
    fontWeight: 500,
    color: TEXT2,
    lineHeight: 1.45,
  },
  titleSm: {
    fontSize: '12px',
    fontWeight: 800,
    color: TEXT,
    lineHeight: 1.3,
  },
  title: {
    fontSize: '13px',
    fontWeight: 700,
    color: TEXT2,
    lineHeight: 1.35,
  },
  valueLg: {
    fontSize: '28px',
    fontWeight: 900,
    letterSpacing: '-0.05em' as const,
    lineHeight: 1,
  },
  valueMd: {
    fontSize: '20px',
    fontWeight: 900,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
    lineHeight: 1,
  },
}

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

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconQr({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.9" />
      <rect x="15" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.9" />
      <rect x="3" y="15" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M15 15h2v2h-2zM19 15h2v6h-2M15 19h4M11 11h2v2h-2z" fill="currentColor" />
    </svg>
  )
}

function IconDownload({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPrint({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <rect x="7" y="14" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

function IconArrow({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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
      if (!session) {
        router.push('/login')
        return
      }

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

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const shellCard: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
    overflow: 'hidden',
  }

  const sectionLabel: React.CSSProperties = {
    ...TYPE.section,
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const sectionDash = (
    <span
      style={{
        width: '12px',
        height: '2px',
        background: TEAL,
        borderRadius: '999px',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  )

  const quickActionStyle: React.CSSProperties = {
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT2,
    borderRadius: '10px',
    height: '38px',
    padding: '0 14px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  }

  const iconWrap = (color: string): React.CSSProperties => ({
    width: '34px',
    height: '34px',
    borderRadius: '11px',
    background: '#F8FAFC',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${BORDER}`,
    flexShrink: 0,
  })

  const cols = isMobile ? '1fr 1fr' : 'repeat(3, minmax(0, 1fr))'

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: FONT,
        background: BG,
        overflow: 'hidden',
      }}
    >
      <Sidebar active="/dashboard/qrcodes" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', background: BG }}>
        <div
          style={{
            background: HEADER_BG,
            padding: isMobile ? '18px 16px 16px' : '20px 24px 18px',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '14px',
            alignItems: 'stretch',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.68)', marginBottom: '5px' }}>
              {todayStr}
            </div>

            <div
              style={{
                fontSize: isMobile ? '28px' : '34px',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                fontWeight: 900,
                color: '#FFFFFF',
                marginBottom: '8px',
              }}
            >
              QR codes
            </div>

            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.72)',
                maxWidth: '760px',
              }}
            >
              Generate and save one QR code per installed unit so customers can register service requests instantly.
            </div>

            <div
              style={{
                marginTop: '14px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => router.push('/dashboard/jobs')}
                style={{
                  ...quickActionStyle,
                  background: TEAL,
                  color: '#FFFFFF',
                  border: 'none',
                }}
              >
                <IconSpark size={16} />
                Add job
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: isMobile ? '14px' : '16px 24px 20px',
            background: BG,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
          }}
        >
          <div>
            <div style={sectionLabel}>{sectionDash}Overview</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(12, minmax(0,1fr))',
                gap: '10px',
              }}
            >
              {[
                {
                  label: 'All units',
                  value: jobs.length,
                  sub: 'QR codes generated',
                  icon: <IconQr size={17} />,
                  accent: TEXT,
                  span: 'span 4',
                },
                {
                  label: 'Ready to save',
                  value: Object.keys(qrUrls).length,
                  sub: 'Available for download',
                  icon: <IconDownload size={17} />,
                  accent: TEAL_DARK,
                  span: 'span 4',
                },
                {
                  label: 'Service access',
                  value: loading ? '...' : 'Live',
                  sub: 'Registration links active',
                  icon: <IconPrint size={17} />,
                  accent: '#1E3A8A',
                  span: 'span 4',
                },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    ...shellCard,
                    padding: isMobile ? '12px' : '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    gridColumn: isMobile ? 'span 1' : item.span,
                    minHeight: '124px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div style={iconWrap(item.accent)}>
                      {item.icon}
                    </div>

                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: TEXT3,
                      }}
                    >
                      Live
                    </div>
                  </div>

                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>
                      {item.label}
                    </div>
                    <div style={{ ...TYPE.valueLg, fontSize: isMobile ? '23px' : '26px', color: item.accent, marginBottom: '5px' }}>
                      {item.value}
                    </div>
                    <div style={{ ...TYPE.body, fontSize: '11px' }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...shellCard, padding: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexDirection: isMobile ? 'column' : 'row',
                marginBottom: '10px',
              }}
            >
              <div style={sectionLabel}>{sectionDash}All units</div>

              <div
                style={{
                  height: '34px',
                  borderRadius: '10px',
                  border: `1px solid ${BORDER}`,
                  background: '#F8FAFC',
                  color: TEXT2,
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: FONT,
                }}
              >
                {jobs.length} total
              </div>
            </div>

            {loading ? (
              <div
                style={{
                  borderRadius: '12px',
                  padding: '26px 16px',
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  textAlign: 'center',
                  color: TEXT3,
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Generating QR codes...
              </div>
            ) : jobs.length === 0 ? (
              <div
                style={{
                  borderRadius: '12px',
                  padding: '26px 16px',
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  textAlign: 'center',
                  color: TEXT3,
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                No jobs yet. <span style={{ color: TEAL, cursor: 'pointer', fontWeight: 700 }} onClick={() => router.push('/dashboard/jobs')}>Add your first job</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: cols, gap: isMobile ? '10px' : '14px' }}>
                {jobs.map(job => {
                  const name = `${job.customers?.first_name} ${job.customers?.last_name}`
                  const qrSize = isMobile ? 110 : 140

                  return (
                    <div key={job.id} style={{ borderRadius: '14px', border: `1px solid ${BORDER}`, background: WHITE, overflow: 'hidden' }}>
                      <div style={{ height: '3px', background: TEAL }} />

                      <div style={{ padding: isMobile ? '14px 12px' : '18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        {qrUrls[job.id] ? (
                          <div
                            style={{
                              padding: '8px',
                              background: WHITE,
                              borderRadius: '10px',
                              border: `1px solid ${BORDER}`,
                              marginBottom: '14px',
                              boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
                            }}
                          >
                            <img
                              src={qrUrls[job.id]}
                              alt="QR code"
                              style={{ width: qrSize, height: qrSize, display: 'block', borderRadius: '4px' }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: qrSize,
                              height: qrSize,
                              background: BG,
                              borderRadius: '10px',
                              marginBottom: '14px',
                              border: `1px solid ${BORDER}`,
                            }}
                          />
                        )}

                        <div style={{ ...TYPE.titleSm, fontSize: isMobile ? '13px' : '14px', marginBottom: '2px' }}>
                          {name}
                        </div>

                        <div style={{ ...TYPE.bodySm, fontSize: '12px', marginBottom: '2px' }}>
                          {job.brand} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                        </div>

                        {job.customers?.suburb && (
                          <div style={{ ...TYPE.bodySm, marginBottom: '14px' }}>
                            {job.customers.suburb}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '6px', marginTop: job.customers?.suburb ? '0' : '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <button
                            onClick={() => downloadQR(job.id, name)}
                            style={{
                              height: '32px',
                              padding: '0 12px',
                              borderRadius: '8px',
                              border: `1px solid ${BORDER}`,
                              background: WHITE,
                              color: TEXT2,
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: FONT,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <IconDownload size={14} />
                            Save
                          </button>

                          <button
                            onClick={() => window.print()}
                            style={{
                              height: '32px',
                              padding: '0 12px',
                              borderRadius: '8px',
                              border: 'none',
                              background: TEAL,
                              color: WHITE,
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: FONT,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <IconPrint size={14} />
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
                    background: WHITE,
                    border: `1.5px dashed ${BORDER}`,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer',
                    minHeight: isMobile ? '180px' : '260px',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: BG,
                      border: `1px solid ${BORDER}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: TEXT3,
                    }}
                  >
                    <IconArrow size={16} />
                  </div>
                  <div style={{ ...TYPE.titleSm, fontSize: '13px' }}>Add new job</div>
                  <div style={TYPE.bodySm}>QR auto-generated</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}