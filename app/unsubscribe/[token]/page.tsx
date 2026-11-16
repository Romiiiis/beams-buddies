'use client'

import React, { use, useEffect, useState } from 'react'

// The page a customer reaches from "Unsubscribe" at the bottom of a reminder email. Opening the page changes
// nothing (mail scanners open links on their own); the customer has to press the button.
// Everything is decided by the server (app/api/unsubscribe/route.ts).

const TEAL_DARK = '#1F857C'
const TEXT = '#0B1220'
const TEXT2 = '#334155'
const TEXT3 = '#64748B'
const LINE = '#E3E8EE'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const card: React.CSSProperties = { background: '#FFFFFF', border: `1px solid ${LINE}`, borderRadius: 16, padding: 20, minWidth: 0 }
const heading: React.CSSProperties = { fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', lineHeight: 1.25 }
const body: React.CSSProperties = { fontSize: 14, color: TEXT2, lineHeight: 1.55, margin: '8px 0 0' }

export default function UnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [info, setInfo] = useState<{ business: string; optedOut: boolean } | null>(null)
  const [invalid, setInvalid] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [changed, setChanged] = useState(false)

  const api = `/api/unsubscribe?token=${encodeURIComponent(token)}`

  useEffect(() => {
    let live = true
    fetch(api)
      .then(async res => {
        const data = await res.json().catch(() => ({}))
        if (!live) return
        if (!res.ok) setInvalid(data.message || 'This link is not valid.')
        else setInfo({ business: data.business || '', optedOut: !!data.optedOut })
      })
      .catch(() => live && setInvalid('Could not load this page. Check your connection and try again.'))
    return () => {
      live = false
    }
  }, [api])

  async function change(resubscribe: boolean) {
    if (saving) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resubscribe }) })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setInfo(prev => (prev ? { ...prev, optedOut: !!data.optedOut } : prev))
        setChanged(true)
      } else {
        setError(data.message || 'Sorry, that did not work. Please try again.')
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    }
    setSaving(false)
  }

  const who = info?.business || 'this business'
  const button = (primary: boolean): React.CSSProperties => ({
    height: 48,
    padding: '0 20px',
    borderRadius: 12,
    border: primary ? 'none' : `1.5px solid ${LINE}`,
    background: primary ? TEAL_DARK : '#FFFFFF',
    color: primary ? '#FFFFFF' : TEXT,
    fontSize: 15,
    fontWeight: 800,
    cursor: saving ? 'default' : 'pointer',
    fontFamily: FONT,
    opacity: saving ? 0.7 : 1,
    marginTop: 16,
  })

  return (
    <main style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: FONT, padding: '28px 16px 48px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
        <header style={{ display: 'flex', alignItems: 'center', minHeight: 44 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>{info?.business || ''}</div>
        </header>

        {!info && !invalid && <div style={{ ...card, color: TEXT3, fontSize: 14 }}>Loading...</div>}

        {invalid && (
          <div style={card}>
            <div style={heading}>This link is not working</div>
            <p style={body}>{invalid} To stop these emails, reply to any of them and ask to be taken off the list.</p>
          </div>
        )}

        {info && !info.optedOut && (
          <div style={card}>
            <div style={heading}>{changed ? 'You are back on the list' : 'Stop reminder emails?'}</div>
            <p style={body}>
              {changed
                ? `${who} will send you service reminders and follow-ups again.`
                : `You will no longer get service reminders, review requests or quote follow-ups from ${who}. Emails about a booking you have made or an invoice can still reach you.`}
            </p>
            {error && <div role="alert" style={{ fontSize: 13, fontWeight: 600, color: '#B42318', marginTop: 12 }}>{error}</div>}
            <button type="button" disabled={saving} onClick={() => change(false)} style={button(!changed)}>
              {saving ? 'Saving...' : 'Unsubscribe'}
            </button>
          </div>
        )}

        {info && info.optedOut && (
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEAL_DARK, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Unsubscribed</div>
            <div style={{ ...heading, marginTop: 8 }}>You will not get reminder emails</div>
            <p style={body}>
              {who} will no longer send you service reminders, review requests or quote follow-ups. Emails about a booking you have made or an invoice can still reach you.
            </p>
            {error && <div role="alert" style={{ fontSize: 13, fontWeight: 600, color: '#B42318', marginTop: 12 }}>{error}</div>}
            <button type="button" disabled={saving} onClick={() => change(true)} style={button(false)}>
              {saving ? 'Saving...' : 'Changed your mind? Subscribe again'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
