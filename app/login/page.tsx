'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TEAL = '#1F9E94'
const TEXT = '#0B1220'
const TEXT3 = '#475569'
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
          maxWidth: '420px',
          background: WHITE,
          border: `1px solid ${BORDER}`,
          borderRadius: '18px',
          padding: '28px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ marginBottom: '22px', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 900,
              color: TEXT,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              marginBottom: '8px',
            }}
          >
            Sign in
          </div>

          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: TEXT3,
              lineHeight: 1.5,
            }}
          >
            Access your CRM dashboard
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: TEXT,
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                height: '46px',
                padding: '0 14px',
                borderRadius: '12px',
                border: `1px solid ${BORDER}`,
                background: WHITE,
                fontSize: '14px',
                outline: 'none',
                color: TEXT,
                fontFamily: FONT,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: TEXT,
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                height: '46px',
                padding: '0 14px',
                borderRadius: '12px',
                border: `1px solid ${BORDER}`,
                background: WHITE,
                fontSize: '14px',
                outline: 'none',
                color: TEXT,
                fontFamily: FONT,
                boxSizing: 'border-box',
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
              height: '46px',
              marginTop: '4px',
              background: TEAL,
              color: WHITE,
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: FONT,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}