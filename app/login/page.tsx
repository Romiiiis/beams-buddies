'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEXT = '#0F172A'
const TEXT2 = '#334155'
const TEXT3 = '#94A3B8'
const BORDER = '#E2E8F0'
const BG = '#F1F5F9'
const WHITE = '#FFFFFF'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '16px' : '32px' }}>

      {/* Logo / brand mark */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: TEXT, letterSpacing: '-0.4px' }}>Jobyra</div>
        <div style={{ fontSize: '13px', color: TEXT3, marginTop: '4px' }}>Trade CRM</div>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: '400px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 4px 24px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
        <div style={{ height: '3px', background: TEAL }} />

        <div style={{ padding: isMobile ? '24px 20px' : '32px 28px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Welcome back</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: TEXT, letterSpacing: '-0.4px', lineHeight: 1, marginBottom: '6px' }}>Sign in to your account</div>
            <div style={{ fontSize: '13px', color: TEXT3 }}>Access your dashboard, customers, jobs and invoices.</div>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ height: '42px', padding: '0 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: BG, fontSize: '14px', outline: 'none', color: TEXT, fontFamily: FONT, transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ height: '42px', padding: '0 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: BG, fontSize: '14px', outline: 'none', color: TEXT, fontFamily: FONT, transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
            </div>

            {error && (
              <div style={{ fontSize: '13px', color: '#7F1D1D', background: '#FFF9F9', border: '1px solid #FECACA', padding: '10px 12px', borderRadius: '8px', lineHeight: 1.5, fontWeight: '500' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ height: '42px', marginTop: '4px', background: loading ? TEAL_DARK : TEAL, color: WHITE, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: FONT, opacity: loading ? 0.8 : 1, transition: 'background 0.15s' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = TEAL_DARK }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = TEAL }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      <div style={{ marginTop: '24px', fontSize: '12px', color: TEXT3, textAlign: 'center' }}>
        Jobyra · Beam's Marketing · Sydney
      </div>
    </div>
  )
}