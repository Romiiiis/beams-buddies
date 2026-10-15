import Link from 'next/link'

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEXT = '#0B1220'
const TEXT2 = '#334155'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: FONT, background: WHITE }}>

      {/* Left panel */}
      <div style={{
        flex: '0 0 420px',
        background: TEAL,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 44px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
            <div style={{ width: 96, height: 96, background: TEAL, borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}>
              <img src="/jobyra-logo.png" alt="Jobyra" style={{ width: 96, height: 96, objectFit: 'cover', mixBlendMode: 'multiply' }} />
            </div>
            <span style={{ fontSize: 54, fontWeight: 800, color: WHITE, letterSpacing: '-0.03em', marginLeft: -24 }}>obyra</span>
          </div>

          <div style={{ fontSize: 32, fontWeight: 800, color: WHITE, letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: 16 }}>
            The CRM built for trade businesses
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
            Manage customers, jobs, and service reminders in one place.
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          © 2025 Jobyra
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', marginBottom: 8 }}>
              Welcome back
            </div>
            <div style={{ fontSize: 14, color: TEXT3 }}>
              Sign in to your Jobyra account
            </div>
          </div>

          <Link
            href="/login"
            style={{
              display: 'block',
              height: '46px',
              lineHeight: '46px',
              background: TEAL,
              color: WHITE,
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Sign in
          </Link>

          <div style={{ marginTop: 24, fontSize: 12, color: TEXT3, textAlign: 'center' }}>
            New to Jobyra?{' '}
            <a href="https://mail.google.com/mail/?view=cm&to=hello@beamsmarketing.com.au" target="_blank" rel="noreferrer" style={{ color: TEAL, fontWeight: 600, textDecoration: 'none' }}>Contact us to get started</a>
          </div>
        </div>
      </div>

    </div>
  )
}
