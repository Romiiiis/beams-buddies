'use client'

import React, { useState } from 'react'

// Shared look for the sign-in and password pages: soft tinted backdrop, centred column,
// rounded white fields with icons, and a full-width rounded button. Flat colours, no glow.

export const AUTH = {
  TEAL: '#2AA198',
  TEAL_DARK: '#1F857C',
  TEXT: '#0B1220',
  TEXT2: '#334155',
  TEXT3: '#64748B',
  RED: '#B91C1C',
}

const css = `
  .auth-page {
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: calc(env(safe-area-inset-top) + 40px) 20px calc(env(safe-area-inset-bottom) + 24px);
    background:
      radial-gradient(1100px 520px at 100% -10%, #DDF5F2 0%, rgba(221,245,242,0) 60%),
      radial-gradient(900px 480px at -10% 110%, #F4F6EA 0%, rgba(244,246,234,0) 60%),
      #F7F8F8;
    font-family: var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: ${AUTH.TEXT};
  }
  .auth-col { width: 100%; max-width: 400px; margin: auto 0; }
  .auth-brand { display: flex; align-items: center; justify-content: center; margin-bottom: 28px; }
  .auth-brand img { height: 40px; width: auto; mix-blend-mode: multiply; }
  .auth-word { font-size: 23px; font-weight: 900; letter-spacing: -0.04em; color: ${AUTH.TEXT}; margin-left: -9px; }
  .auth-title { font-size: 28px; font-weight: 700; letter-spacing: -0.03em; text-align: center; margin: 0 0 8px; }
  .auth-sub { font-size: 14.5px; line-height: 1.55; color: ${AUTH.TEXT3}; text-align: center; margin: 0 auto 28px; max-width: 320px; }
  .auth-form { display: flex; flex-direction: column; gap: 12px; }
  .auth-field { position: relative; }
  .auth-field input {
    width: 100%; height: 54px; box-sizing: border-box;
    padding: 0 48px 0 46px;
    border-radius: 16px;
    border: 1px solid #E6EAEE;
    background: #FFFFFF;
    font-size: 15px; color: ${AUTH.TEXT};
    font-family: inherit;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    transition: border-color 0.15s;
  }
  .auth-field input::placeholder { color: #94A3B8; }
  .auth-field input:focus { outline: none; border-color: ${AUTH.TEAL} !important; box-shadow: 0 0 0 1px ${AUTH.TEAL} !important; }
  .auth-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748B; display: inline-flex; pointer-events: none; }
  .auth-eye {
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    width: 38px; height: 38px; border: none; border-radius: 12px; background: transparent;
    color: #64748B; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
  }
  .auth-eye:hover { background: #F1F5F9; }
  .auth-eye:focus-visible, .auth-link:focus-visible, .auth-btn:focus-visible { outline: 2px solid ${AUTH.TEAL}; outline-offset: 2px; }
  .auth-row { display: flex; justify-content: flex-end; margin-top: -2px; }
  .auth-link { background: none; border: none; padding: 4px 2px; font: inherit; font-size: 13px; font-weight: 600; color: ${AUTH.TEAL_DARK}; cursor: pointer; text-decoration: none; }
  .auth-link:hover { text-decoration: underline; }
  .auth-btn {
    width: 100%; height: 54px; margin-top: 8px;
    border: none; border-radius: 16px;
    background: ${AUTH.TEAL}; color: #FFFFFF;
    font: inherit; font-size: 15px; font-weight: 700;
    cursor: pointer; transition: background 0.15s, opacity 0.15s;
  }
  .auth-btn:hover:not(:disabled) { background: ${AUTH.TEAL_DARK}; }
  .auth-btn:disabled { opacity: 0.7; cursor: default; }
  .auth-note { margin-top: 18px; text-align: center; font-size: 13.5px; color: ${AUTH.TEXT3}; }
  .auth-note a, .auth-note button { color: ${AUTH.TEXT}; font-weight: 700; text-decoration: none; background: none; border: none; font: inherit; cursor: pointer; padding: 0; }
  .auth-note a:hover, .auth-note button:hover { text-decoration: underline; }
  .auth-msg { font-size: 13.5px; line-height: 1.5; border-radius: 12px; padding: 11px 14px; }
  .auth-msg.err { color: #991B1B; background: #FEF2F2; border: 1px solid #FECACA; }
  .auth-msg.ok { color: #14532D; background: #F0FDF4; border: 1px solid #BBF7D0; }
  .auth-foot { margin-top: 28px; text-align: center; font-size: 12px; line-height: 1.6; color: #94A3B8; }
  @media (max-width: 767px) {
    .auth-page { padding-top: calc(env(safe-area-inset-top) + 28px); }
    .auth-title { font-size: 26px; }
  }
`

export const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </svg>
)

export const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
)

const EyeIcon = ({ off }: { off?: boolean }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
)

/** Rounded field with a leading icon; password fields get a show/hide toggle. */
export function AuthField({
  icon, type = 'text', value, onChange, placeholder, autoComplete, required = true, label,
}: {
  icon: React.ReactNode
  type?: 'text' | 'email' | 'password'
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoComplete?: string
  required?: boolean
  label: string
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="auth-field">
      <span className="auth-icon">{icon}</span>
      <input
        type={isPassword && show ? 'text' : type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-label={label}
        style={isPassword ? undefined : { paddingRight: 16 }}
      />
      {isPassword && (
        <button type="button" className="auth-eye" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
          <EyeIcon off={show} />
        </button>
      )}
    </div>
  )
}

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="auth-page">
      <style>{css}</style>
      <div className="auth-col">
        <div className="auth-brand" aria-label="Jobyra">
          <img src="/jobyra-logo.jpg" alt="" />
          <span className="auth-word">obyra</span>
        </div>
        <h1 className="auth-title">{title}</h1>
        <p className="auth-sub">{subtitle}</p>
        {children}
        <div className="auth-foot">{footer ?? `© ${new Date().getFullYear()} Jobyra · Job and customer management for trades`}</div>
      </div>
    </div>
  )
}
