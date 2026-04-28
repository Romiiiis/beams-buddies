'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import QRCode from 'qrcode'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEAL_LIGHT = '#E6F7F6'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
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
  titleSm: {
    fontSize: '12px',
    fontWeight: 800,
    color: TEXT,
    lineHeight: 1.3,
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
  if (!date) return '—'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function IconSearch({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

function IconSpark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconDownload({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPrint({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <rect x="7" y="14" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.9" />
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

function IconCheckCircle({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClock({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()

      if (!userData) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('jobs')
        .select('id, customer_id, qr_code_token, brand, model, capacity_kw, install_date, created_at, review_link_clicked, customers(first_name, last_name, suburb)')
        .eq('business_id', userData.business_id)
        .order('install_date', { ascending: false, nullsFirst: false })

      const jobRows = data || []
      setJobs(jobRows)
      if (jobRows.length > 0) setSelectedJobId(jobRows[0].id)

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
      return [name, job.customers?.suburb || '', job.brand || '', job.model || '', job.capacity_kw ? `${job.capacity_kw}kw` : ''].join(' ').toLowerCase().includes(q)
    })
  }, [jobs, search])

  useEffect(() => {
    if (filteredJobs.length === 0) {
      setSelectedJobId('')
      return
    }

    if (!filteredJobs.some(j => j.id === selectedJobId)) setSelectedJobId(filteredJobs[0].id)
  }, [filteredJobs, selectedJobId])

  const selectedJob = useMemo(() => filteredJobs.find(j => j.id === selectedJobId) || null, [filteredJobs, selectedJobId])

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const qrCount = jobs.length
  const readyCount = jobs.filter(j => !!j.qr_code_token).length
  const reviewClickedCount = jobs.filter(j => !!j.review_link_clicked).length

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '16px',
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

  const btnOutline: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    border: `1px solid ${BORDER}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: TEXT2,
    background: WHITE,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    transition: 'border-color 0.12s, color 0.12s',
  }

  const btnTeal: React.CSSProperties = {
    height: '34px',
    padding: '0 14px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    background: TEAL,
    color: WHITE,
    border: 'none',
    borderRadius: '9px',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.12s',
  }

  const btnMobileSm: React.CSSProperties = {
    height: '36px',
    padding: '0 12px',
    border: `1px solid ${BORDER}`,
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 700,
    color: TEXT2,
    background: WHITE,
    cursor: 'pointer',
    fontFamily: FONT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    flex: 1,
  }

  const btnMobileTeal: React.CSSProperties = {
    ...btnMobileSm,
    background: TEAL,
    border: `1px solid ${TEAL}`,
    color: WHITE,
  }

  const statChips = [
    {
      label: 'QR Codes',
      value: qrCount,
      sub: 'Jobs in library',
      onClick: () => router.push('/dashboard/qrcodes'),
    },
    {
      label: 'Ready to Save',
      value: readyCount,
      sub: 'Tokens generated',
      onClick: () => router.push('/dashboard/qrcodes'),
    },
    {
      label: 'Reviews Clicked',
      value: reviewClickedCount,
      sub: 'Customers left a review',
      onClick: () => router.push('/dashboard/qrcodes'),
    },
    {
      label: 'Jobs Shown',
      value: filteredJobs.length,
      sub: 'Current view',
      onClick: () => router.push('/dashboard/jobs'),
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/qrcodes" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT3, fontSize: '14px', fontWeight: 600 }}>
          Generating QR codes...
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard/qrcodes" />

      <div style={{ flex: 1, minWidth: 0, background: BG }}>
        <div
          style={{
            padding: isMobile ? '0' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
            background: BG,
          }}
        >
          {isMobile ? (
            <div style={{ padding: '20px 12px 4px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' }}>
                  {new Date().toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>QR Codes</h1>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => router.push('/dashboard/jobs')} style={btnMobileTeal}>
                  <IconSpark size={12} /> Add Job
                </button>
                <button onClick={() => router.push('/dashboard/customers')} style={btnMobileSm}>
                  Customers
                </button>
              </div>

              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderTop: `2px solid ${TEAL}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {statChips.map((chip, i) => (
                  <div
                    key={chip.label}
                    onClick={chip.onClick}
                    style={{
                      padding: '10px 8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = TEAL_LIGHT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: TEXT3, marginTop: '3px', lineHeight: 1.2 }}>{chip.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: TEXT3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' }}>{todayStr}</div>
                  <h1 style={{ fontSize: '28px', fontWeight: 900, color: TEXT, letterSpacing: '-0.05em', margin: 0, lineHeight: 1 }}>QR Codes</h1>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => router.push('/dashboard/customers')}
                    style={btnOutline}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = TEXT
                      e.currentTarget.style.color = TEXT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = BORDER
                      e.currentTarget.style.color = TEXT2
                    }}
                  >
                    View customers
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/jobs')}
                    style={btnTeal}
                    onMouseEnter={e => {
                      e.currentTarget.style.opacity = '0.82'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    <IconSpark size={14} /> Add Job
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderTop: `2px solid ${TEAL}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {statChips.map((chip, i) => (
                  <div
                    key={chip.label}
                    onClick={chip.onClick}
                    style={{
                      padding: '14px 20px',
                      cursor: 'pointer',
                      borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = TEAL_LIGHT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{chip.value}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '4px' }}>{chip.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: isMobile ? '0 12px' : 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 360px', gap: '14px', alignItems: 'start' }}>
              <div style={card}>
                <div
                  style={{
                    padding: isMobile ? '16px' : '18px 20px',
                    borderBottom: `1px solid ${BORDER}`,
                    display: 'flex',
                    alignItems: isMobile ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: '14px',
                    background: WHITE,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ width: 4, height: 44, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '17px', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em' }}>QR job library</span>
                        <span
                          style={{
                            height: '22px',
                            padding: '0 8px',
                            borderRadius: '999px',
                            border: `1px solid ${BORDER}`,
                            background: '#F8FAFC',
                            color: TEXT3,
                            fontSize: '10px',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          {filteredJobs.length} shown
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '4px' }}>
                        Select a job to preview, save, or print its customer registration QR code.
                      </div>
                    </div>
                  </div>

                  <div style={{ position: 'relative', width: isMobile ? '100%' : '300px', maxWidth: '100%' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: TEXT3, display: 'inline-flex', pointerEvents: 'none' }}>
                      <IconSearch size={15} />
                    </span>
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search customer, suburb, unit..."
                      style={{
                        height: '42px',
                        width: '100%',
                        borderRadius: '12px',
                        border: `1px solid ${BORDER}`,
                        padding: '0 12px 0 38px',
                        fontSize: '12px',
                        background: '#F8FAFC',
                        color: TEXT,
                        fontFamily: FONT,
                        outline: 'none',
                        fontWeight: 600,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {!isMobile && filteredJobs.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '28px minmax(0,1.6fr) minmax(0,1fr) 110px 100px 90px',
                      gap: '0',
                      padding: '0 20px 0 0',
                      background: '#FCFCFD',
                      borderBottom: `1px solid ${BORDER}`,
                      alignItems: 'center',
                      height: '38px',
                    }}
                  >
                    <div />
                    <div style={{ ...TYPE.label, paddingRight: '12px', paddingLeft: '10px' }}>Customer</div>
                    <div style={TYPE.label}>Unit</div>
                    <div style={TYPE.label}>Installed</div>
                    <div style={TYPE.label}>Review</div>
                    <div style={{ ...TYPE.label, textAlign: 'right' as const }}>QR</div>
                  </div>
                )}

                {filteredJobs.length === 0 ? (
                  <div style={{ padding: '56px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '32px', opacity: 0.25 }}>📷</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: TEXT2 }}>{jobs.length === 0 ? 'No jobs yet' : 'No matching jobs'}</div>
                    <div style={{ fontSize: '12px', color: TEXT3 }}>{jobs.length === 0 ? 'Add your first job to generate a QR code.' : `No results for "${search}"`}</div>
                    {jobs.length === 0 && (
                      <button
                        onClick={() => router.push('/dashboard/jobs')}
                        style={{ marginTop: '4px', height: '36px', padding: '0 16px', background: TEAL, color: WHITE, border: 'none', borderRadius: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
                      >
                        Add job
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    {filteredJobs.map(job => {
                      const name = `${job.customers?.first_name || ''} ${job.customers?.last_name || ''}`.trim() || 'Customer'
                      const isSelected = selectedJobId === job.id
                      const hasQR = !!job.qr_code_token
                      const reviewClicked = !!job.review_link_clicked

                      if (isMobile) {
                        return (
                          <button
                            key={job.id}
                            onClick={() => setSelectedJobId(job.id)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              border: 'none',
                              borderTop: `1px solid ${BORDER}`,
                              background: isSelected ? '#F0FBFA' : WHITE,
                              cursor: 'pointer',
                              padding: 0,
                              fontFamily: FONT,
                              display: 'block',
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: '3px 1fr' }}>
                              <div style={{ background: isSelected ? TEAL : 'transparent' }} />
                              <div style={{ padding: '13px 14px 13px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                                    <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>{job.customers?.suburb || '—'}</div>
                                  </div>

                                  <div style={{ display: 'flex', gap: '5px', flexShrink: 0, alignItems: 'center' }}>
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 8px',
                                        borderRadius: '999px',
                                        background: reviewClicked ? '#F0FDF9' : '#FFF7ED',
                                        border: `1px solid ${reviewClicked ? '#BBF7D0' : '#FDE68A'}`,
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        color: reviewClicked ? '#15803D' : '#B45309',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {reviewClicked ? <IconCheckCircle size={9} /> : <IconClock size={9} />}
                                      {reviewClicked ? 'Reviewed' : 'Pending'}
                                    </span>

                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '4px 9px',
                                        borderRadius: '999px',
                                        background: isSelected ? '#DDF7F5' : '#F1F5F9',
                                        border: `1px solid ${isSelected ? '#B8ECE7' : BORDER}`,
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        color: isSelected ? TEAL_DARK : TEXT3,
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {isSelected ? 'Selected' : 'Select'}
                                    </span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <div style={{ flex: 1, background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '9px', padding: '8px 10px' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 800, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>Unit</div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT }}>{job.brand || '—'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}</div>
                                  </div>

                                  <div style={{ flex: 1, background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '9px', padding: '8px 10px' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 800, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>Installed</div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT }}>{formatDate(job.install_date)}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      }

                      return (
                        <button
                          key={job.id}
                          onClick={() => setSelectedJobId(job.id)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            borderTop: `1px solid ${BORDER}`,
                            background: isSelected ? '#F0FBFA' : WHITE,
                            cursor: 'pointer',
                            padding: 0,
                            fontFamily: FONT,
                            display: 'block',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => {
                            if (!isSelected) e.currentTarget.style.background = '#F8FAFC'
                          }}
                          onMouseLeave={e => {
                            if (!isSelected) e.currentTarget.style.background = WHITE
                          }}
                        >
                          <div style={{ display: 'grid', gridTemplateColumns: '28px minmax(0,1.6fr) minmax(0,1fr) 110px 100px 90px', gap: '0', alignItems: 'center', minHeight: '60px', paddingRight: '0' }}>
                            <div style={{ height: '100%', width: '3px', background: isSelected ? TEAL : 'transparent', marginLeft: '6px', borderRadius: '2px', alignSelf: 'stretch', minHeight: '60px', transition: 'background 0.1s' }} />

                            <div style={{ padding: '0 12px 0 10px', minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT, marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                              <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.customers?.suburb || '—'}</div>
                            </div>

                            <div style={{ padding: '0 12px 0 0', minWidth: 0 }}>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {job.brand || '—'} {job.capacity_kw ? `${job.capacity_kw}kW` : ''}
                              </div>
                              <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.model || '—'}</div>
                            </div>

                            <div style={{ padding: '0 12px 0 0' }}>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT2 }}>{formatDate(job.install_date)}</div>
                            </div>

                            <div style={{ padding: '0 12px 0 0' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '4px 9px',
                                  borderRadius: '999px',
                                  background: reviewClicked ? '#F0FDF9' : '#FFF7ED',
                                  border: `1px solid ${reviewClicked ? '#BBF7D0' : '#FDE68A'}`,
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  color: reviewClicked ? '#15803D' : '#B45309',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {reviewClicked ? <IconCheckCircle size={10} /> : <IconClock size={10} />}
                                {reviewClicked ? 'Reviewed' : 'Pending'}
                              </span>
                            </div>

                            <div style={{ paddingRight: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '4px 9px',
                                  borderRadius: '999px',
                                  background: isSelected ? '#DDF7F5' : hasQR ? '#F0FDF9' : '#F1F5F9',
                                  border: `1px solid ${isSelected ? '#B8ECE7' : hasQR ? '#BBF7D0' : BORDER}`,
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  color: isSelected ? TEAL_DARK : hasQR ? '#15803D' : TEXT3,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {isSelected ? 'Selected' : hasQR ? 'Ready' : 'No token'}
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    })}

                    <div style={{ padding: '12px 20px', borderTop: `1px solid ${BORDER}`, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: TEXT3 }}>
                        Showing {filteredJobs.length} of {jobs.length} jobs
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: TEXT2 }}>
                        {reviewClickedCount} reviewed
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={sideCard}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 4, height: 34, borderRadius: '999px', background: TEAL, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: TEXT, letterSpacing: '-0.025em' }}>Selected QR</div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>Preview and export</div>
                      </div>
                    </div>

                    <button onClick={() => router.push('/dashboard/jobs')} style={cardArrowBtn}>
                      <IconExternalLink size={14} />
                    </button>
                  </div>

                  {!selectedJob ? (
                    <div style={{ padding: '24px', borderRadius: '12px', background: '#F8FAFC', border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', opacity: 0.2, marginBottom: '8px' }}>📷</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT2, marginBottom: '4px' }}>No job selected</div>
                      <div style={{ fontSize: '11px', color: TEXT3 }}>Select a job from the list to view its QR code.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ borderRadius: '14px', border: `1px solid ${BORDER}`, background: '#F8FAFC', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '200px', height: '200px', borderRadius: '16px', border: `1px solid ${BORDER}`, background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                          {qrUrls[selectedJob.id] ? (
                            <img src={qrUrls[selectedJob.id]} alt="QR code" style={{ width: 180, height: 180, display: 'block', borderRadius: '6px' }} />
                          ) : (
                            <div style={{ width: 180, height: 180, background: BG, borderRadius: '10px', border: `1px solid ${BORDER}` }} />
                          )}
                        </div>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            background: '#F0FDF9',
                            border: '1px solid #BBF7D0',
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#15803D',
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                          Ready to scan
                        </span>
                      </div>

                      <div style={{ borderRadius: '12px', border: `1px solid ${BORDER}`, background: WHITE, padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: TEXT3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '4px' }}>Customer</div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: TEXT, lineHeight: 1.2 }}>
                              {`${selectedJob.customers?.first_name || ''} ${selectedJob.customers?.last_name || ''}`.trim() || 'Customer'}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: TEXT3, marginTop: '3px' }}>{selectedJob.customers?.suburb || '—'}</div>
                          </div>

                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              flexShrink: 0,
                              background: selectedJob.review_link_clicked ? '#F0FDF9' : '#FFF7ED',
                              border: `1px solid ${selectedJob.review_link_clicked ? '#BBF7D0' : '#FDE68A'}`,
                              fontSize: '10px',
                              fontWeight: 800,
                              color: selectedJob.review_link_clicked ? '#15803D' : '#B45309',
                            }}
                          >
                            {selectedJob.review_link_clicked ? <IconCheckCircle size={10} /> : <IconClock size={10} />}
                            {selectedJob.review_link_clicked ? 'Reviewed' : 'Review pending'}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div style={{ background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '9px 11px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Unit</div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT }}>{selectedJob.brand || '—'} {selectedJob.capacity_kw ? `${selectedJob.capacity_kw}kW` : ''}</div>
                            <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>{selectedJob.model || '—'}</div>
                          </div>

                          <div style={{ background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '9px 11px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Installed</div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT }}>{formatDate(selectedJob.install_date)}</div>
                            <div style={{ fontSize: '10px', fontWeight: 600, color: TEXT3, marginTop: '2px' }}>Job linked</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => downloadQR(selectedJob.id, `${selectedJob.customers?.first_name || ''} ${selectedJob.customers?.last_name || ''}`.trim() || 'customer')}
                            style={{
                              flex: 1,
                              height: '36px',
                              borderRadius: '9px',
                              border: `1px solid ${BORDER}`,
                              background: WHITE,
                              color: TEXT2,
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: FONT,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <IconDownload size={13} /> Save
                          </button>

                          <button
                            onClick={() => window.print()}
                            style={{
                              flex: 1,
                              height: '36px',
                              borderRadius: '9px',
                              border: 'none',
                              background: TEAL,
                              color: WHITE,
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: FONT,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <IconPrint size={13} /> Print
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}