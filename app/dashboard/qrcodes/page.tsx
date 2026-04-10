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

function DashboardImageIcon({
  src,
  alt,
  size = 28,
}: {
  src: string
  alt: string
  size?: number
}) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
  )
}

function IconQrCodes({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_a063dbe15aa840af9882c0e94b5525fa~mv2.png"
      alt="QR codes"
      size={size}
    />
  )
}

function IconReady({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_e64e818ee96f486cb8bf1c7787435fb9~mv2.png"
      alt="Ready to save"
      size={size}
    />
  )
}

function IconLatest({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_6442d64c1c9e4069ac41a182df951b32~mv2.png"
      alt="Latest install"
      size={size}
    />
  )
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

function IconPlus({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconArrow({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconExternalLink({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

  const qrCount = jobs.length
  const readyCount = jobs.filter(job => !!job.qr_code_token).length
  const latestInstall = useMemo(() => {
    const withDates = jobs.filter(job => job.install_date)
    if (!withDates.length) return 'No date'
    return formatDate(withDates[0].install_date)
  }, [jobs])

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    overflow: 'hidden',
  }

  const statCard: React.CSSProperties = {
    ...card,
    padding: isMobile ? '14px 14px 13px' : '14px 16px 13px',
    minHeight: isMobile ? 112 : 118,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '16px',
    borderRadius: '16px',
  }

  const sectionHeaderTitle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 800,
    color: TEXT,
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  }

  const cardArrowBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: TEXT3,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
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
  }

  const topCards = [
    {
      label: 'QR codes',
      value: qrCount.toLocaleString('en-AU'),
      sub: 'Units with generated QR links',
      icon: <IconQrCodes size={28} />,
      accent: TEXT,
      tag: 'Library total',
    },
    {
      label: 'Ready to save',
      value: readyCount.toLocaleString('en-AU'),
      sub: 'Download or print now',
      icon: <IconReady size={28} />,
      accent: TEAL_DARK,
      tag: 'Actions live',
    },
    {
      label: 'Latest install',
      value: latestInstall,
      sub: 'Most recent install date in the list',
      icon: <IconLatest size={28} />,
      accent: TEXT,
      tag: 'Recent activity',
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/qrcodes" />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: TEXT3,
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Generating QR codes...
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        fontFamily: FONT,
        background: BG,
        minHeight: '100vh',
      }}
    >
      <Sidebar active="/dashboard/qrcodes" />

      <div style={{ flex: 1, minWidth: 0, background: BG }}>
        <div
          style={{
            padding: isMobile ? '14px' : '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
          }}
        >
          <div
            style={{
              ...card,
              padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
              background: HEADER_BG,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>
              {todayStr}
            </div>

            <div
              style={{
                fontSize: isMobile ? '26px' : '34px',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                fontWeight: 900,
                color: WHITE,
                marginBottom: '8px',
              }}
            >
              QR codes
            </div>

            <div
              style={{
                fontSize: '13px',
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
                  height: '36px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: TEAL,
                  color: WHITE,
                  border: 'none',
                  borderRadius: '10px',
                }}
              >
                <IconSpark size={14} />
                Add job
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {topCards.map(item => (
              <div key={item.label} style={statCard}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <div style={{ ...TYPE.label, marginBottom: '6px' }}>{item.tag}</div>
                    <div style={{ ...TYPE.title, fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>{item.label}</div>
                  </div>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      ...TYPE.valueLg,
                      fontSize: item.label === 'Latest install' ? (isMobile ? '20px' : '22px') : '26px',
                      color: item.accent,
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.value}
                  </div>
                  <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 320px',
              gap: '14px',
              alignItems: 'start',
            }}
          >
            <div style={card}>
              <div
                style={{
                  padding: '14px 16px 12px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={sectionHeaderTitle}>All units</div>
                  <div style={{ ...TYPE.bodySm }}>
                    Every saved job has a QR card ready for download or print.
                  </div>
                </div>

                <div
                  style={{
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: `1px solid ${BORDER}`,
                    background: WHITE,
                    color: TEXT2,
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {jobs.length} total
                </div>
              </div>

              {jobs.length === 0 ? (
                <div
                  style={{
                    padding: '32px 18px',
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '13px',
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
                    padding: '14px 16px',
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
                          borderRadius: '16px',
                          border: `1px solid ${BORDER}`,
                          background: WHITE,
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
                              background: '#F8FAFC',
                              borderRight: isMobile ? 'none' : `1px solid ${BORDER}`,
                              borderBottom: isMobile ? `1px solid ${BORDER}` : 'none',
                              padding: isMobile ? '14px 14px 12px' : '14px 12px 12px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                            }}
                          >
                            <div
                              style={{
                                width: isMobile ? '132px' : '136px',
                                height: isMobile ? '132px' : '136px',
                                borderRadius: '16px',
                                border: `1px solid ${BORDER}`,
                                background: WHITE,
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

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>QR workflow</div>
                  <button onClick={() => router.push('/dashboard/jobs')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div style={{ ...TYPE.label, marginBottom: '4px' }}>Step 1</div>
                    <div style={{ ...TYPE.valueSm }}>Create job</div>
                    <div style={{ ...TYPE.bodySm, marginTop: '5px' }}>
                      Each saved unit receives a registration token
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div style={{ ...TYPE.label, marginBottom: '4px' }}>Step 2</div>
                    <div style={{ ...TYPE.valueSm }}>Save or print</div>
                    <div style={{ ...TYPE.bodySm, marginTop: '5px' }}>
                      Use the QR on stickers, cards, or install packs
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div style={{ ...TYPE.label, marginBottom: '4px' }}>Step 3</div>
                    <div style={{ ...TYPE.valueSm }}>Customer scans</div>
                    <div style={{ ...TYPE.bodySm, marginTop: '5px' }}>
                      Registration starts from the embedded unit link
                    </div>
                  </div>
                </div>
              </div>

              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Quick actions</div>
                  <button onClick={() => router.push('/dashboard/jobs')} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                  <button
                    onClick={() => router.push('/dashboard/jobs')}
                    style={{
                      width: '100%',
                      height: '34px',
                      background: TEAL,
                      color: WHITE,
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: FONT,
                    }}
                  >
                    Add job
                  </button>

                  <button
                    onClick={() => window.print()}
                    style={{
                      width: '100%',
                      height: '34px',
                      background: '#F8FAFC',
                      border: `1px solid ${BORDER}`,
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: FONT,
                      color: TEXT2,
                    }}
                  >
                    Print page
                  </button>
                </div>
              </div>

              <div style={sideCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ ...TYPE.label }}>Notes</div>
                  <button onClick={() => window.print()} style={cardArrowBtn}>
                    <IconExternalLink size={14} />
                  </button>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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