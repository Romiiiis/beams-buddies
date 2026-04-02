'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const A = '#1C1C1E'
const TEAL = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#EBEBEB'
const BG = '#FAFAF8'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useState(() => {
    if (typeof window !== 'undefined') {
      const check = () => setIsMobile(window.innerWidth < 768)
      check()
      window.addEventListener('resize', check)
      return () => window.removeEventListener('resize', check)
    }
  })

  return isMobile
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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderBottom: `1px solid ${BORDER}`,
          padding: isMobile ? '20px 16px 16px' : '28px 32px 20px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', color: TEXT3, marginBottom: '6px', fontWeight: '500' }}>
            Secure access
          </div>
          <div style={{ fontSize: isMobile ? '26px' : '30px', fontWeight: '700', color: TEXT, letterSpacing: '-0.6px', lineHeight: 1 }}>
            Sign in
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
            maxWidth: '430px',
            background: '#fff',
            border: `1px solid ${BORDER}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div style={{ height: '3px', background: TEAL }} />

          <div style={{ padding: isMobile ? '22px 18px' : '28px 28px 26px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h1
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  margin: 0,
                  marginBottom: '6px',
                  color: TEXT,
                  letterSpacing: '-0.4px',
                }}
              >
                TradeLink CRM
              </h1>
              <p style={{ fontSize: '13px', color: TEXT3, margin: 0 }}>
                Sign in to your account
              </p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: TEXT2 }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: `1px solid ${BORDER}`,
                    background: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    color: TEXT,
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: TEXT2 }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: `1px solid ${BORDER}`,
                    background: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    color: TEXT,
                    fontFamily: 'inherit',
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
                    borderRadius: '8px',
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: '38px',
                  marginTop: '4px',
                  background: A,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}