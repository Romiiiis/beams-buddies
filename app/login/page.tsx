'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AuthShell, AuthField, MailIcon, LockIcon } from './AuthShell'

const CONTACT = 'https://mail.google.com/mail/?view=cm&to=hello@beamsmarketing.com.au'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'That email and password don’t match. Please try again.' : error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    // Same message whether or not the email has an account, so accounts can't be probed
    setSent(true)
  }

  if (mode === 'forgot') {
    return (
      <AuthShell title="Reset your password" subtitle="Enter your email and we’ll send you a link to choose a new password.">
        {sent ? (
          <div className="auth-form">
            <div className="auth-msg ok" role="status">
              If <b>{email.trim()}</b> has a Jobyra account, a reset link is on its way. Check your inbox (and spam folder).
            </div>
            <button type="button" className="auth-btn" onClick={() => { setMode('login'); setSent(false) }}>
              Back to log in
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleReset}>
            <AuthField icon={<MailIcon />} type="email" value={email} onChange={setEmail} placeholder="Email Address" autoComplete="email" label="Email address" />
            {error && <div className="auth-msg err" role="alert">{error}</div>}
            <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>
            <div className="auth-note">
              Remembered it? <button type="button" onClick={() => { setMode('login'); setError('') }}>Back to log in</button>
            </div>
          </form>
        )}
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Welcome Back" subtitle="Log in with your email to manage your customers, jobs and service reminders.">
      <form className="auth-form" onSubmit={handleLogin}>
        <AuthField icon={<MailIcon />} type="email" value={email} onChange={setEmail} placeholder="Email Address" autoComplete="email" label="Email address" />
        <AuthField icon={<LockIcon />} type="password" value={password} onChange={setPassword} placeholder="Password" autoComplete="current-password" label="Password" />
        <div className="auth-row">
          <button type="button" className="auth-link" onClick={() => { setMode('forgot'); setError('') }}>Forgot Password</button>
        </div>
        {error && <div className="auth-msg err" role="alert">{error}</div>}
        <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Logging in…' : 'Log In'}</button>
        <div className="auth-note">
          Need an account? <a href={CONTACT} target="_blank" rel="noreferrer">Contact us</a>
        </div>
      </form>
    </AuthShell>
  )
}
