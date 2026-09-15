'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEXT = '#0B1220'
const TEXT3 = '#64748B'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export default function LoginPage() {
  const router = useRouter()
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
          <img
            src="/jobyra-logo.png"
            alt="Jobyra"
            style={{ width: 38, height: 38, objectFit: 'contain', mixBlendMode: 'multiply' }}
          />
          <span style={{ fontSize: 22, fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', marginLeft: -9 }}>
            obyra
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: WHITE,
            border: `1px solid ${BORDER}`,
            borderRadius: '20px',
            padding: '36px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: TEXT,
                letterSpacing: '-0.03em',
                marginBottom: '6px',
              }}
            >
              Sign in
            </div>
            <div style={{ fontSize: '13px', color: TEXT3, fontWeight: 500 }}>
              Access your Jobyra dashboard
            </div>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: TEXT, letterSpacing: '0.01em' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: `1.5px solid ${BORDER}`,
                  background: WHITE,
                  fontSize: '14px',
                  outline: 'none',
                  color: TEXT,
                  fontFamily: FONT,
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = TEAL)}
                onBlur={e => (e.target.style.borderColor = BORDER)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: TEXT, letterSpacing: '0.01em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: `1.5px solid ${BORDER}`,
                  background: WHITE,
                  fontSize: '14px',
                  outline: 'none',
                  color: TEXT,
                  fontFamily: FONT,
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = TEAL)}
                onBlur={e => (e.target.style.borderColor = BORDER)}
              />
            </div>

            {error && (
              <div
                style={{
                  fontSize: '13px',
                  color: '#991B1B',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  padding: '10px 14px',
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
                width: '100%',
                height: '44px',
                marginTop: '4px',
                background: loading ? TEAL_DARK : TEAL,
                color: WHITE,
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: FONT,
                opacity: loading ? 0.75 : 1,
                letterSpacing: '0.01em',
                transition: 'opacity 0.15s, background 0.15s',
                boxSizing: 'border-box',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
