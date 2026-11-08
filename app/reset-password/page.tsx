'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AuthShell, AuthField, LockIcon } from '../login/AuthShell'

// Landing page for the "Forgot password?" email link. Supabase signs the user in from the link
// (a short-lived recovery session); they then choose a new password here.
export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState<'checking' | 'ok' | 'expired'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady('ok')
    })
    // The link may already have been processed by the time this runs
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady('ok')
      else window.setTimeout(() => setReady(r => (r === 'checking' ? 'expired' : r)), 2500)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('Use at least 8 characters.')
    if (password !== confirm) return setError('The two passwords don’t match.')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) return setError(error.message)
    setDone(true)
    window.setTimeout(() => router.push('/dashboard'), 1500)
  }

  if (ready === 'expired') {
    return (
      <AuthShell title="Link expired" subtitle="This reset link has expired or was already used. Request a new one from the log in page.">
        <button type="button" className="auth-btn" onClick={() => router.push('/login')}>Back to log in</button>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Pick something you haven’t used before. At least 8 characters.">
      {done ? (
        <div className="auth-msg ok" role="status">Password updated. Taking you to your dashboard…</div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <AuthField icon={<LockIcon />} type="password" value={password} onChange={setPassword} placeholder="New password" autoComplete="new-password" label="New password" />
          <AuthField icon={<LockIcon />} type="password" value={confirm} onChange={setConfirm} placeholder="Confirm new password" autoComplete="new-password" label="Confirm new password" />
          {error && <div className="auth-msg err" role="alert">{error}</div>}
          <button type="submit" className="auth-btn" disabled={loading || ready !== 'ok'}>
            {ready === 'checking' ? 'Checking link…' : loading ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
