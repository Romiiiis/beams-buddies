'use client'

import React, { useState } from 'react'

// Shared look for the sign-in and password pages (chosen design: option 10, Geist font):
// centred form, original Jobyra logo, rounded fields with icons, dark navy button. No glow.

export const AUTH = {
  TEAL: '#2AA198',
  TEAL_DARK: '#1F857C',
  TEXT: '#0B1220',
  TEXT2: '#334155',
  TEXT3: '#64748B',
  RED: '#B91C1C',
}

// Chosen design: option 10 (Geist) - plain light background, original Jobyra logo,
// thin-bordered rounded fields, teal links, dark navy button. Flat, no glow.
const css = `
  .auth-page {
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: calc(env(safe-area-inset-top) + 32px) 20px calc(env(safe-area-inset-bottom) + 20px);
    background: #F6F7F7;
    font-family: var(--font-auth), var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: ${AUTH.TEXT};
  }
  .auth-col { width: 100%; max-width: 380px; flex: 1; display: flex; flex-direction: column; }
  .auth-main { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  /* Original Jobyra logo, unchanged: 38px J mark + "obyra" in the app font (Inter 900) */
  .auth-brand { display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
  .auth-brand img { width: 38px; height: 38px; object-fit: contain; mix-blend-mode: multiply; }
  .auth-word { font-family: var(--font-sans), -apple-system, sans-serif; font-size: 22px; font-weight: 900; letter-spacing: -0.04em; color: ${AUTH.TEXT}; margin-left: -9px; }
  .auth-title { font-size: 26px; font-weight: 600; letter-spacing: -0.02em; text-align: center; margin: 0 0 8px; }
  .auth-sub { font-size: 14px; line-height: 1.55; color: ${AUTH.TEXT3}; text-align: center; margin: 0 auto 26px; max-width: 300px; }
  .auth-form { display: flex; flex-direction: column; gap: 12px; }
  .auth-field { position: relative; }
  .auth-field input {
    width: 100%; height: 50px; box-sizing: border-box;
    padding: 0 48px 0 44px;
    border-radius: 12px;
    border: 1px solid #E3E8EC;
    background: #FFFFFF;
    font-size: 15px; color: ${AUTH.TEXT};
    font-family: inherit;
    transition: border-color 0.15s;
  }
  .auth-field input::placeholder { color: #8A94A6; }
  .auth-field input:focus { outline: none; border-color: ${AUTH.TEAL} !important; box-shadow: 0 0 0 1px ${AUTH.TEAL} !important; }
  .auth-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #475569; display: inline-flex; pointer-events: none; }
  .auth-eye {
    position: absolute; right: 7px; top: 50%; transform: translateY(-50%);
    width: 36px; height: 36px; border: none; border-radius: 10px; background: transparent;
    color: #475569; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
  }
  .auth-eye:hover { background: #F1F5F9; }
  .auth-eye:focus-visible, .auth-link:focus-visible, .auth-btn:focus-visible { outline: 2px solid ${AUTH.TEAL}; outline-offset: 2px; }
  .auth-row { display: flex; justify-content: flex-end; margin-top: -2px; }
  .auth-link { background: none; border: none; padding: 4px 2px; font: inherit; font-size: 13px; font-weight: 600; color: ${AUTH.TEAL_DARK}; cursor: pointer; text-decoration: none; }
  .auth-link:hover { text-decoration: underline; }
  .auth-btn {
    width: 100%; height: 50px; margin-top: 6px;
    border: none; border-radius: 12px;
    background: #0B1220; color: #FFFFFF;
    font: inherit; font-size: 15px; font-weight: 600;
    cursor: pointer; transition: background 0.15s, opacity 0.15s;
  }
  .auth-btn:hover:not(:disabled) { background: #1F2937; }
  .auth-btn:disabled { opacity: 0.7; cursor: default; }
  .auth-note { margin-top: 16px; text-align: center; font-size: 13.5px; color: ${AUTH.TEXT3}; }
  .auth-note a, .auth-note button { color: ${AUTH.TEXT}; font-weight: 600; text-decoration: none; background: none; border: none; font: inherit; cursor: pointer; padding: 0; }
  .auth-note a:hover, .auth-note button:hover { text-decoration: underline; }
  .auth-msg { font-size: 13.5px; line-height: 1.5; border-radius: 12px; padding: 11px 14px; }
  .auth-msg.err { color: #991B1B; background: #FEF2F2; border: 1px solid #FECACA; }
  .auth-msg.ok { color: #14532D; background: #F0FDF4; border: 1px solid #BBF7D0; }
  .auth-foot { margin-top: 28px; text-align: center; font-size: 12px; line-height: 1.6; color: ${AUTH.TEXT3}; }
  .auth-foot b { color: ${AUTH.TEXT}; font-weight: 600; }
  @media (max-width: 767px) {
    .auth-title { font-size: 24px; }
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
        <div className="auth-main">
          <div className="auth-brand" aria-label="Jobyra">
            <img src="/jobyra-logo.jpg" alt="" />
            <span className="auth-word">obyra</span>
          </div>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
        </div>
        <div className="auth-foot">
          {footer ?? (
            <>
              By continuing to use Jobyra, you agree to our
              <br />
              <b>Terms of Service</b> and <b>Privacy Policy</b>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
