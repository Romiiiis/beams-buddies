import Link from 'next/link'

const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#FAFAFA', fontFamily: FONT }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#FFFFFF', border: '1px solid #E8EDF2', borderRadius: 16, padding: '36px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1F857C', marginBottom: 10 }}>404</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.035em', color: '#0B1220', margin: '0 0 8px' }}>Page not found</h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#64748B', margin: '0 0 24px' }}>
          This page doesn’t exist or has moved. Head back to your dashboard to carry on.
        </p>
        <Link
          href="/dashboard"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 22px', borderRadius: 10, background: '#2AA198', color: '#FFFFFF', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
