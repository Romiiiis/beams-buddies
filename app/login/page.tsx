'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const check = () => setIsMobile(window.innerWidth < 768)
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

function IconAccess({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_6128eed6331e4d0188d1bd62ed3e4c89~mv2.png"
      alt="Access"
      size={size}
    />
  )
}

function IconSecurity({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_147eeb738a784ca184267c67f66c1c30~mv2.png"
      alt="Security"
      size={size}
    />
  )
}

function IconWorkspace({ size = 28 }: { size?: number }) {
  return (
    <DashboardImageIcon
      src="https://static.wixstatic.com/media/48c433_9cbf007dda55411888ac59c3123f8657~mv2.png"
      alt="Workspace"
      size={size}
    />
  )
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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

export default function LoginPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

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

  const sectionHeaderTitle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 800,
    color: TEXT,
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: isMobile ? '14px' : '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          flex: 1,
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
            Secure access
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
            Sign in
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
            Access your CRM dashboard, customers, jobs, invoices, and business settings from one secure login.
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '12px',
          }}
        >
          {[
            {
              label: 'Access',
              value: 'Secure',
              sub: 'Email and password login',
              icon: <IconAccess size={28} />,
              accent: TEXT,
              tag: 'Account',
            },
            {
              label: 'Security',
              value: 'Protected',
              sub: 'Authenticated session required',
              icon: <IconSecurity size={28} />,
              accent: TEAL_DARK,
              tag: 'Session',
            },
            {
              label: 'Workspace',
              value: 'CRM',
              sub: 'Customers, jobs, invoices, settings',
              icon: <IconWorkspace size={28} />,
              accent: TEAL_DARK,
              tag: 'Platform',
            },
          ].map(item => (
            <div key={item.label} style={statCard}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ ...TYPE.label, marginBottom: '6px' }}>{item.tag}</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: TEXT2, marginBottom: '6px', lineHeight: 1.35 }}>
                    {item.label}
                  </div>
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
                <div style={{ ...TYPE.valueLg, fontSize: '26px', color: item.accent }}>{item.value}</div>
                <div style={{ ...TYPE.bodySm, marginTop: '4px' }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 440px) 320px',
            gap: '14px',
            alignItems: 'start',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <div style={card}>
            <div
              style={{
                padding: '14px 16px 12px',
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <div style={sectionHeaderTitle}>Account sign in</div>
              <div style={{ ...TYPE.bodySm }}>
                Enter your login details to open your dashboard.
              </div>
            </div>

            <div style={{ padding: isMobile ? '18px 16px' : '22px 20px' }}>
              <div style={{ marginBottom: '18px' }}>
                <div
                  style={{
                    ...TYPE.label,
                    color: TEAL,
                    marginBottom: '6px',
                  }}
                >
                  Welcome back
                </div>

                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    margin: 0,
                    marginBottom: '6px',
                    color: TEXT,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}
                >
                  TradeLink CRM
                </div>

                <p style={{ ...TYPE.bodySm, margin: 0 }}>
                  Sign in to your account
                </p>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={TYPE.label}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    style={{
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: '10px',
                      border: `1px solid ${BORDER}`,
                      background: WHITE,
                      fontSize: '14px',
                      outline: 'none',
                      color: TEXT,
                      fontFamily: FONT,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={TYPE.label}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: '10px',
                      border: `1px solid ${BORDER}`,
                      background: WHITE,
                      fontSize: '14px',
                      outline: 'none',
                      color: TEXT,
                      fontFamily: FONT,
                    }}
                  />
                </div>

                {error && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#7F1D1D',
                      background: '#FFF9F9',
                      border: '1px solid #FECACA',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      lineHeight: 1.5,
                      fontWeight: 500,
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    height: '40px',
                    marginTop: '4px',
                    background: TEAL,
                    color: WHITE,
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: FONT,
                    opacity: loading ? 0.7 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <IconSpark size={15} />
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            <div
              style={{
                ...card,
                padding: '16px',
              }}
            >
              <div style={{ ...TYPE.label, marginBottom: '8px' }}>Access notes</div>

              <div style={{ display: 'grid', gap: '8px' }}>
                {[
                  'Use the email and password connected to your CRM account.',
                  'Successful login redirects you straight into the dashboard.',
                  'If your details are incorrect, an error message appears below the fields.',
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

            <div
              style={{
                ...card,
                padding: '16px',
              }}
            >
              <div style={{ ...TYPE.label, marginBottom: '8px' }}>Quick access</div>

              <button
                onClick={() => router.push('/dashboard')}
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                Dashboard route <IconArrow size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}