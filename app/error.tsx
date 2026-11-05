'use client'

import { useEffect } from 'react'

const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#FAFAFA', fontFamily: FONT }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#FFFFFF', border: '1px solid #E8EDF2', borderRadius: 16, padding: '36px 28px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.035em', color: '#0B1220', margin: '0 0 8px' }}>Something went wrong</h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#64748B', margin: '0 0 24px' }}>
          Sorry about that. Try again, and if it keeps happening, refresh the page or sign in again.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={reset}
            style={{ height: 42, padding: '0 22px', borderRadius: 10, border: 'none', background: '#2AA198', color: '#FFFFFF', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Try again
          </button>
          <a
            href="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 22px', borderRadius: 10, border: '1px solid #DCE3EA', background: '#FFFFFF', color: '#1F2937', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
