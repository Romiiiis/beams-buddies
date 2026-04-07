'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TEAL = '#1F9E94'
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

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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
            Secure access
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
            Sign in
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
            Access your CRM dashboard, customers, jobs, invoices, and business settings from one secure login.
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '16px' : '32px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            background: WHITE,
            border: `1px solid ${BORDER}`,
            borderRadius: '16px',
            boxShadow: '0 6px 18px rgba(15,23,42,0.04), 0 1px 4px rgba(15,23,42,0.03)',
            overflow: 'hidden',
          }}
        >
          <div style={{ height: '3px', background: TEAL }} />

          <div style={{ padding: isMobile ? '22px 18px' : '28px 28px 26px' }}>
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  ...TYPE.label,
                  color: TEAL,
                  marginBottom: '6px',
                }}
              >
                Welcome back
              </div>

              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  margin: 0,
                  marginBottom: '6px',
                  color: TEXT,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                }}
              >
                TradeLink CRM
              </h1>

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
                  color: '#fff',
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
      </div>
    </div>
  )
}