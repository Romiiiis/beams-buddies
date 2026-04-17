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

function IconSearch({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
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
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [search, setSearch] = useState('')

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
        .select('id, customer_id, qr_code_token, brand, model, capacity_kw, install_date, created_at, customers(first_name, last_name, suburb)')
        .eq('business_id', userData.business_id)
        .order('created_at', { ascending: false })

      const jobRows = data || []
      setJobs(jobRows)

      if (jobRows.length > 0) {
        setSelectedJobId(jobRows[0].id)
      }

      const urls: Record<string, string> = {}
      for (const job of jobRows) {
        if (!job.qr_code_token) continue
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

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return jobs

    return jobs.filter(job => {
      const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim()
      const haystack = [
        name,
        job.customers?.suburb || '',
        job.brand || '',
        job.model || '',
        job.capacity_kw ? `${job.capacity_kw}` : '',
        job.capacity_kw ? `${job.capacity_kw}kw` : '',
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [jobs, search])

  useEffect(() => {
    if (filteredJobs.length === 0) {
      setSelectedJobId('')
      return
    }

    const stillVisible = filteredJobs.some(job => job.id === selectedJobId)
    if (!stillVisible) {
      setSelectedJobId(filteredJobs[0].id)
    }
  }, [filteredJobs, selectedJobId])

  const selectedJob = useMemo(
    () => filteredJobs.find(job => job.id === selectedJobId) || null,
    [filteredJobs, selectedJobId]
  )

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

  const searchInput: React.CSSProperties = {
    width: '100%',
    height: '40px',
    padding: '0 12px 0 36px',
    borderRadius: '10px',
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT,
    fontFamily: FONT,
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const topCards = [
    {
      label: 'QR codes',
      value: qrCount.toLocaleString('en-AU'),
      sub: 'Jobs with generated QR links',
      icon: <IconQrCodes size={28} />,
      accent: TEXT,
      tag: 'Library total',
    },
    {
      label: 'Ready to save',
      value: readyCount.toLocaleString('en-AU'),
      sub: 'Available after selection',
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
              border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: isMobile ? 0 : '16px',
              marginLeft: isMobile ? '-14px' : 0,
              marginRight: isMobile ? '-14px' : 0,
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
              Select a job first, then save or print its QR code from a cleaner one-at-a-time workspace.
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
              gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, 1fr)',
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
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 380px',
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
                  <div style={sectionHeaderTitle}>Jobs</div>
                  <div style={{ ...TYPE.bodySm }}>
                    Search by customer name or job details, then select a result to reveal its QR code.
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
                  {filteredJobs.length} shown
                </div>
              </div>

              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: `1px solid ${BORDER}`,
                  background: '#FCFCFD',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: TEXT3,
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <IconSearch size={15} />
                  </div>

                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search jobs, names, suburb, brand, model..."
                    style={searchInput}
                  />
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div
                  style={{
                    padding: '32px 18px',
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '13px',
                  }}
                >
                  {jobs.length === 0 ? (
                    <>
                      No jobs yet.{' '}
                      <span
                        style={{ color: TEAL, cursor: 'pointer', fontWeight: 700 }}
                        onClick={() => router.push('/dashboard/jobs')}
                      >
                        Add your first job
                      </span>
                    </>
                  ) : (
                    'No matching jobs found.'
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid' }}>
                  {!isMobile && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr) auto',
                        gap: '12px',
                        padding: '10px 16px',
                        borderBottom: `1px solid ${BORDER}`,
                        background: '#FCFCFD',
                        alignItems: 'center',
                      }}
                    >
                      <div style={TYPE.label}>Customer</div>
                      <div style={TYPE.label}>Job</div>
                      <div style={{ ...TYPE.label, textAlign: 'right' }}>Install date</div>
                    </div>
                  )}

                  {filteredJobs.map(job => {
                    const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                    const isSelected = selectedJobId === job.id

                    return (
                      <button
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          border: 'none',
                          borderBottom: `1px solid ${BORDER}`,
                          background: isSelected ? '#F0FBFA' : WHITE,
                          cursor: 'pointer',
                          padding: 0,
                          fontFamily: FONT,
                        }}
                      >
                        {isMobile ? (
                          <div
                            style={{
                              padding: '14px 16px',
                              display: 'grid',
                              gap: '10px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: '12px',
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: 800,
                                    color: TEXT,
                                    lineHeight: 1.2,
                                    marginBottom: '4px',
                                  }}
                                >
                                  {name}
                                </div>
                                <div style={{ ...TYPE.bodySm, color: TEXT2 }}>
                                  {job.customers?.suburb || 'No suburb'}
                                </div>
                              </div>

                              <span
                                style={{
                                  padding: '5px 9px',
                                  borderRadius: '999px',
                                  background: isSelected ? '#DDF7F5' : '#F8FAFC',
                                  color: isSelected ? TEAL_DARK : TEXT3,
                                  border: `1px solid ${isSelected ? '#B8ECE7' : BORDER}`,
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                }}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </span>
                            </div>

                            <div style={{ ...TYPE.bodySm, color: TEXT2 }}>
                              {job.brand || 'Unknown'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''} {job.model ? `· ${job.model}` : ''}
                            </div>

                            <div style={{ ...TYPE.bodySm }}>
                              Installed {formatDate(job.install_date)}
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr) auto',
                              gap: '12px',
                              alignItems: 'center',
                              padding: '14px 16px',
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  color: TEXT,
                                  lineHeight: 1.2,
                                  marginBottom: '4px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {name}
                              </div>
                              <div style={{ ...TYPE.bodySm, color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {job.customers?.suburb || 'No suburb'}
                              </div>
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: TEXT2,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {job.brand || 'Unknown'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                              </div>
                              <div style={{ ...TYPE.bodySm, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {job.model || 'No model'}
                              </div>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                flexShrink: 0,
                              }}
                            >
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: TEXT }}>
                                  {formatDate(job.install_date)}
                                </div>
                              </div>

                              <span
                                style={{
                                  padding: '5px 9px',
                                  borderRadius: '999px',
                                  background: isSelected ? '#DDF7F5' : '#F8FAFC',
                                  color: isSelected ? TEAL_DARK : TEXT3,
                                  border: `1px solid ${isSelected ? '#B8ECE7' : BORDER}`,
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </span>
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={sideCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ ...TYPE.label }}>Selected QR</div>
                <button onClick={() => router.push('/dashboard/jobs')} style={cardArrowBtn}>
                  <IconExternalLink size={14} />
                </button>
              </div>

              {!selectedJob ? (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '18px',
                    borderRadius: '14px',
                    background: '#F8FAFC',
                    border: `1px solid ${BORDER}`,
                    textAlign: 'center',
                    color: TEXT3,
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  Select a customer job to view its QR code
                </div>
              ) : (
                <div
                  style={{
                    marginTop: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      borderRadius: '16px',
                      border: `1px solid ${BORDER}`,
                      background: '#F8FAFC',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: isMobile ? '190px' : '220px',
                        height: isMobile ? '190px' : '220px',
                        borderRadius: '18px',
                        border: `1px solid ${BORDER}`,
                        background: WHITE,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                      }}
                    >
                      {qrUrls[selectedJob.id] ? (
                        <img
                          src={qrUrls[selectedJob.id]}
                          alt="QR code"
                          style={{
                            width: isMobile ? 160 : 190,
                            height: isMobile ? 160 : 190,
                            display: 'block',
                            borderRadius: '8px',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: isMobile ? 160 : 190,
                            height: isMobile ? 160 : 190,
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
                      borderRadius: '14px',
                      border: `1px solid ${BORDER}`,
                      background: WHITE,
                      padding: '12px',
                      display: 'grid',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ ...TYPE.label, marginBottom: '5px', color: TEAL_DARK }}>Selected customer</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, lineHeight: 1.2 }}>
                        {`${selectedJob.customers?.first_name || ''} ${selectedJob.customers?.last_name || ''}`.trim() || 'Customer'}
                      </div>
                      <div style={{ ...TYPE.bodySm, marginTop: '4px', color: TEXT2 }}>
                        {selectedJob.customers?.suburb || 'No suburb'}
                      </div>
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
                        <div style={{ ...TYPE.label, marginBottom: '5px' }}>Job</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>
                          {selectedJob.brand || 'Unknown'} {selectedJob.capacity_kw ? `${selectedJob.capacity_kw}kW` : ''}
                        </div>
                        <div style={{ ...TYPE.bodySm, marginTop: '5px', fontSize: '11px', wordBreak: 'break-word' }}>
                          {selectedJob.model || 'No model'}
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
                        <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>
                          {formatDate(selectedJob.install_date)}
                        </div>
                        <div style={{ ...TYPE.bodySm, marginTop: '5px', fontSize: '11px' }}>
                          Job linked
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
                        onClick={() =>
                          downloadQR(
                            selectedJob.id,
                            `${selectedJob.customers?.first_name || ''} ${selectedJob.customers?.last_name || ''}`.trim() || 'customer'
                          )
                        }
                        style={{
                          ...quickActionStyle,
                          height: '34px',
                          padding: '0 12px',
                          borderRadius: '10px',
                          flex: '1 1 140px',
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
                          flex: '1 1 140px',
                        }}
                      >
                        <IconPrint size={14} />
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '14px',
              alignItems: 'start',
            }}
          >
            <div style={sideCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ ...TYPE.label }}>Notes</div>
                <button onClick={() => window.print()} style={cardArrowBtn}>
                  <IconExternalLink size={14} />
                </button>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Only jobs are listed in the main library.',
                  'The QR panel updates after selecting a customer job.',
                  'Save downloads only the currently selected QR code.',
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
  )
}