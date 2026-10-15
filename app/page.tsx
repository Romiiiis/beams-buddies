import Link from 'next/link'

const TEAL = '#2AA198'
const TEXT = '#0B1220'
const TEXT3 = '#64748B'
const WHITE = '#FFFFFF'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

// Layout lives in CSS (not inline styles) so phones get a stacked layout from the very
// first paint; this page is server-rendered, so there's no useIsMobile hook to rely on.
const css = `
  .home {
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    font-family: ${FONT};
    background: ${WHITE};
  }
  .home-brand {
    flex: 0 0 420px;
    background: ${TEAL};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 44px;
  }
  .home-logo { display: flex; align-items: center; margin-bottom: 32px; }
  .home-logo-mark { width: 96px; height: 96px; background: ${TEAL}; border-radius: 16px; overflow: hidden; flex-shrink: 0; }
  .home-logo-mark img { width: 100%; height: 100%; object-fit: cover; mix-blend-mode: multiply; display: block; }
  .home-logo-word { font-size: 54px; font-weight: 800; color: ${WHITE}; letter-spacing: -0.03em; margin-left: -24px; }
  .home-headline { font-size: 32px; font-weight: 800; color: ${WHITE}; letter-spacing: -0.04em; line-height: 1.2; margin-bottom: 16px; }
  .home-tagline { font-size: 14px; color: rgba(255,255,255,0.75); line-height: 1.7; }
  .home-copyright { font-size: 12px; color: rgba(255,255,255,0.45); }
  .home-copyright-mobile { display: none; }
  .home-panel {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
  }
  .home-card { width: 100%; max-width: 360px; }

  @media (max-width: 767px) {
    .home { flex-direction: column; }
    .home-brand {
      flex: none;
      padding: calc(env(safe-area-inset-top) + 32px) 24px 32px;
    }
    .home-logo { margin-bottom: 20px; }
    .home-logo-mark { width: 64px; height: 64px; border-radius: 12px; }
    .home-logo-word { font-size: 36px; margin-left: -16px; }
    .home-headline { font-size: 26px; margin-bottom: 10px; }
    .home-copyright { display: none; }
    .home-copyright-mobile { display: block; margin-top: 32px; font-size: 12px; color: ${TEXT3}; text-align: center; }
    .home-panel {
      align-items: flex-start;
      padding: 32px 24px calc(32px + env(safe-area-inset-bottom));
    }
    .home-card { max-width: none; }
  }
`

export default function Home() {
  return (
    <div className="home">
      <style>{css}</style>

      <div className="home-brand">
        <div>
          <div className="home-logo">
            <div className="home-logo-mark">
              <img src="/jobyra-logo.png" alt="Jobyra" />
            </div>
            <span className="home-logo-word">obyra</span>
          </div>

          <div className="home-headline">The CRM built for trade businesses</div>
          <div className="home-tagline">Manage customers, jobs, and service reminders in one place.</div>
        </div>

        <div className="home-copyright">© 2025 Jobyra</div>
      </div>

      <div className="home-panel">
        <div className="home-card">
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
              height: '48px',
              lineHeight: '48px',
              background: TEAL,
              color: WHITE,
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Sign in
          </Link>

          <div style={{ marginTop: 24, fontSize: 13, color: TEXT3, textAlign: 'center', lineHeight: 1.6 }}>
            New to Jobyra?{' '}
            <a href="https://mail.google.com/mail/?view=cm&to=hello@beamsmarketing.com.au" target="_blank" rel="noreferrer" style={{ color: TEAL, fontWeight: 600, textDecoration: 'none' }}>Contact us to get started</a>
          </div>

          <div className="home-copyright-mobile">© 2025 Jobyra</div>
        </div>
      </div>
    </div>
  )
}
