'use client'

import React, { useEffect, useMemo, useState } from 'react'
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
  valueSm: {
    fontSize: '16px',
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

function formatDate(date?: string | null) {
  if (!date) return 'No date'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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

function IconQr({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.9" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.9" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M14 14h2v2h-2zM18 14h3v3h-3zM14 18h3v3h-3zM19 19h2v2h-2z" fill="currentColor" />
    </svg>
  )
}

function IconGrid({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.9" />
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.9" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.9" />
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

function IconPlus({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
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
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('business_id')
        .eq('id', session.user.id)
        .single()

      if (!userData) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('jobs')
        .select('id, qr_code_token, brand, model, capacity_kw, install_date, customers(first_name, last_name, suburb)')
        .eq('business_id', userData.business_id)
        .order('created_at', { ascending: false })

      const jobRows = data || []
      setJobs(jobRows)

      const urls: Record<string, string> = {}
      for (const job of jobRows) {
        const url = `${window.location.origin}/register/${job.qr_code_token}`
        urls[job.id] = await QRCode.toDataURL(url, { width: 220, margin: 1 })
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

  const panelCard: React.CSSProperties = {
    ...shellCard,
    padding: '16px',
  }

  const sectionLabel: React.CSSProperties = {
    ...TYPE.title,
    fontSize: '13px',
    fontWeight: 800,
    marginBottom: '12px',
  }

  const quickActionStyle: React.CSSProperties = {
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT2,
    borderRadius: '10px',
    height: '36px',
    padding: '0 13px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
  }

  const iconWrap = (color: string): React.CSSProperties => ({
    width: '36px',
    height: '36px',
    borderRadius: '11px',
    background: '#F8FAFC',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${BORDER}`,
    flexShrink: 0,
  })

  const qrCount = jobs.length
  const readyCount = jobs.filter(job => !!job.qr_code_token).length
  const latestInstall = useMemo(() => {
    const withDates = jobs.filter(job => job.install_date)
    if (!withDates.length) return 'No date'
    return formatDate(withDates[0].install_date)
  }, [jobs])

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

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: BG }}>
        <div
          style={{
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: BG,
            padding: isMobile ? '14px' : '16px',
            gap: '12px',
          }}
        >
          <div
            style={{
              ...shellCard,
              padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
              background: HEADER_BG,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.68)',
                  marginBottom: '6px',
                }}
              >
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
                    boxShadow: '0 6px 14px rgba(31,158,148,0.20)',
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
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))',
              gap: '12px',
            }}
          >
            {[
              {
                label: 'QR codes',
                value: qrCount,
                sub: 'Units with generated QR links',
                icon: <IconQr size={18} />,
                accent: TEXT,
                tag: 'Library total',
              },
              {
                label: 'Ready to save',
                value: readyCount,
                sub: 'Download or print now',
                icon: <IconDownload size={18} />,
                accent: TEAL_DARK,
                tag: 'Actions live',
              },
              {
                label: 'Latest install',
                value: latestInstall,
                sub: 'Most recent install date in the list',
                icon: <IconGrid size={18} />,
                accent: TEXT,
                tag: 'Recent activity',
              },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  ...panelCard,
                  gridColumn: isMobile ? 'span 1' : 'span 4',
                  minHeight: 148,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '8px' }}>{item.tag}</div>
                    <div style={{ ...TYPE.title, fontSize: '14px', fontWeight: 800, marginBottom: '10px' }}>
                      {item.label}
                    </div>
                  </div>

                  <div style={iconWrap(item.accent)}>
                    {item.icon}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      ...TYPE.valueLg,
                      fontSize: item.label === 'Latest install' ? (isMobile ? '20px' : '22px') : '30px',
                      color: item.accent,
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.value}
                  </div>
                  <div style={{ ...TYPE.bodySm, marginTop: '7px' }}>
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, minmax(0, 1fr))',
              gap: '12px',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                ...panelCard,
                gridColumn: isMobile ? 'span 1' : 'span 8',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '10px',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <div style={sectionLabel}>All units</div>
                  <div style={{ ...TYPE.bodySm }}>
                    Every saved job has a QR card ready for download or print.
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '999px',
                    background: '#F8FAFC',
                    border: `1px solid ${BORDER}`,
                    color: TEXT3,
                    fontSize: '11px',
                    fontWeight: 800,
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
                  No jobs yet.{' '}
                  <span
                    style={{ color: TEAL, cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => router.push('/dashboard/jobs')}
                  >
                    Add your first job
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                    gap: '12px',
                  }}
                >
                  {jobs.map(job => {
                    const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                    const qrSize = isMobile ? 118 : 126

                    return (
                      <div
                        key={job.id}
                        style={{
                          borderRadius: '18px',
                          border: `1px solid ${BORDER}`,
                          background: WHITE,
                          boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '170px minmax(0, 1fr)',
                            minHeight: '100%',
                          }}
                        >
                          <div
                            style={{
                              background: 'linear-gradient(180deg, #FCFCFD 0%, #F8FAFC 100%)',
                              borderRight: isMobile ? 'none' : `1px solid ${BORDER}`,
                              borderBottom: isMobile ? `1px solid ${BORDER}` : 'none',
                              padding: isMobile ? '14px 14px 12px' : '14px 12px 12px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              position: 'relative',
                            }}
                          >
                            <div
                              style={{
                                position: 'absolute',
                                inset: '10px',
                                borderRadius: '14px',
                                background: 'radial-gradient(circle at top left, rgba(31,158,148,0.05), transparent 45%)',
                                pointerEvents: 'none',
                              }}
                            />

                            <div
                              style={{
                                position: 'relative',
                                width: isMobile ? '132px' : '136px',
                                height: isMobile ? '132px' : '136px',
                                borderRadius: '16px',
                                border: `1px solid ${BORDER}`,
                                background: WHITE,
                                boxShadow: '0 6px 14px rgba(15,23,42,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px',
                              }}
                            >
                              {qrUrls[job.id] ? (
                                <img
                                  src={qrUrls[job.id]}
                                  alt="QR code"
                                  style={{
                                    width: qrSize,
                                    height: qrSize,
                                    display: 'block',
                                    borderRadius: '6px',
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: qrSize,
                                    height: qrSize,
                                    background: BG,
                                    borderRadius: '12px',
                                    border: `1px solid ${BORDER}`,
                                  }}
                                />
                              )}
                            </div>

                            <div
                              style={{
                                position: 'relative',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '5px 9px',
                                borderRadius: '999px',
                                background: '#E8F4F1',
                                border: '1px solid rgba(31,158,148,0.12)',
                                color: '#0A4F4C',
                                fontSize: '10px',
                                fontWeight: 800,
                                letterSpacing: '0.02em',
                              }}
                            >
                              Ready to scan
                            </div>
                          </div>

                          <div
                            style={{
                              padding: '14px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '12px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: '10px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div style={{ ...TYPE.label, marginBottom: '5px', color: TEAL_DARK }}>
                                  Registered unit
                                </div>
                                <div
                                  style={{
                                    fontSize: '14px',
                                    fontWeight: 800,
                                    color: TEXT,
                                    lineHeight: 1.2,
                                    marginBottom: '4px',
                                  }}
                                >
                                  {name}
                                </div>
                                <div style={{ ...TYPE.bodySm, fontSize: '12px', color: TEXT2 }}>
                                  {job.customers?.suburb || 'No suburb'}
                                </div>
                              </div>

                              <span
                                style={{
                                  background: '#F8FAFC',
                                  color: TEXT2,
                                  padding: '5px 9px',
                                  borderRadius: '999px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  whiteSpace: 'nowrap',
                                  display: 'inline-block',
                                  letterSpacing: '0.02em',
                                  border: `1px solid ${BORDER}`,
                                }}
                              >
                                Job linked
                              </span>
                            </div>

                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: '8px',
                              }}
                            >
                              <div
                                style={{
                                  background: '#F8FAFC',
                                  border: `1px solid ${BORDER}`,
                                  borderRadius: '12px',
                                  padding: '10px',
                                  minWidth: 0,
                                }}
                              >
                                <div style={{ ...TYPE.label, marginBottom: '5px' }}>Unit</div>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: TEXT,
                                    lineHeight: 1.35,
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {job.brand || 'Unknown'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                                </div>
                                <div
                                  style={{
                                    ...TYPE.bodySm,
                                    marginTop: '5px',
                                    fontSize: '11px',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {job.model || 'No model'}
                                </div>
                              </div>

                              <div
                                style={{
                                  background: '#F8FAFC',
                                  border: `1px solid ${BORDER}`,
                                  borderRadius: '12px',
                                  padding: '10px',
                                  minWidth: 0,
                                }}
                              >
                                <div style={{ ...TYPE.label, marginBottom: '5px' }}>Install date</div>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: TEXT,
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {formatDate(job.install_date)}
                                </div>
                                <div
                                  style={{
                                    ...TYPE.bodySm,
                                    marginTop: '5px',
                                    fontSize: '11px',
                                    lineHeight: 1.4,
                                  }}
                                >
                                  Customer registration link embedded
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <button
                                onClick={() => downloadQR(job.id, name)}
                                style={{
                                  ...quickActionStyle,
                                  height: '34px',
                                  padding: '0 12px',
                                  borderRadius: '10px',
                                  flex: '0 0 auto',
                                }}
                              >
                                <IconDownload size={14} />
                                Save
                              </button>

                              <button
                                onClick={() => window.print()}
                                style={{
                                  ...quickActionStyle,
                                  height: '34px',
                                  padding: '0 12px',
                                  borderRadius: '10px',
                                  background: TEAL,
                                  color: WHITE,
                                  border: 'none',
                                  boxShadow: '0 6px 14px rgba(31,158,148,0.20)',
                                  flex: '0 0 auto',
                                }}
                              >
                                <IconPrint size={14} />
                                Print
                              </button>
                            </div>
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
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '8px',
                      cursor: 'pointer',
                      minHeight: isMobile ? '180px' : '240px',
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#F8FAFC',
                        border: `1px solid ${BORDER}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: TEXT3,
                      }}
                    >
                      <IconPlus size={18} />
                    </div>

                    <div style={{ ...TYPE.titleSm, fontSize: '13px' }}>Add new job</div>
                    <div style={TYPE.bodySm}>QR auto-generated</div>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                gridColumn: isMobile ? 'span 1' : 'span 4',
                display: 'grid',
                gap: '12px',
              }}
            >
              <div style={panelCard}>
                <div style={sectionLabel}>QR workflow</div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  <div
                    style={{
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                      padding: '12px',
                    }}
                  >
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>Step 1</div>
                    <div style={{ ...TYPE.valueSm }}>Create job</div>
                    <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>
                      Each saved unit receives a registration token
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                      padding: '12px',
                    }}
                  >
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>Step 2</div>
                    <div style={{ ...TYPE.valueSm }}>Save or print</div>
                    <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>
                      Use the QR on stickers, cards, or install packs
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                      padding: '12px',
                    }}
                  >
                    <div style={{ ...TYPE.label, marginBottom: '5px' }}>Step 3</div>
                    <div style={{ ...TYPE.valueSm }}>Customer scans</div>
                    <div style={{ ...TYPE.bodySm, marginTop: '6px' }}>
                      Registration starts from the embedded unit link
                    </div>
                  </div>
                </div>
              </div>

              <div style={panelCard}>
                <div style={sectionLabel}>Quick actions</div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  <button
                    onClick={() => router.push('/dashboard/jobs')}
                    style={{
                      ...quickActionStyle,
                      width: '100%',
                      justifyContent: 'center',
                      background: TEAL,
                      color: '#FFFFFF',
                      border: 'none',
                      boxShadow: '0 6px 14px rgba(31,158,148,0.20)',
                    }}
                  >
                    <IconSpark size={16} />
                    Add job
                  </button>

                  <button
                    onClick={() => window.print()}
                    style={{
                      ...quickActionStyle,
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    <IconPrint size={15} />
                    Print page
                  </button>
                </div>
              </div>

              <div style={panelCard}>
                <div style={sectionLabel}>Notes</div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {[
                    'Each card is tied to a job token and customer unit.',
                    'Save creates a PNG download for the selected unit.',
                    'Print uses the browser print flow for fast output.',
                  ].map(item => (
                    <div
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        color: TEXT2,
                        fontSize: '12px',
                        fontWeight: 600,
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          marginTop: '5px',
                          borderRadius: '999px',
                          background: TEAL,
                          flexShrink: 0,
                        }}
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}