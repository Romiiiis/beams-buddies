'use client'

import React, { use, useEffect, useState } from 'react'

// The page a customer reaches from "Book my service" in their reminder email: pick one of the free times and confirm.
// Everything is decided by the server (app/api/book/route.ts); this page only shows the choices.

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEXT = '#0B1220'
const TEXT2 = '#334155'
const TEXT3 = '#64748B'
const LINE = '#E3E8EE'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

type Day = { date: string; label: string; times: { start: string; label: string }[] }
type Info = {
  business: { name: string; phone: string; logoUrl: string | null }
  first: string
  unit: string
  address: string
  minutes: number
  booked?: { when: string; time: string }
  days?: Day[]
}

const card: React.CSSProperties = { background: '#FFFFFF', border: `1px solid ${LINE}`, borderRadius: 16, padding: 20, minWidth: 0 }

export default function BookPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [info, setInfo] = useState<Info | null>(null)
  const [error, setError] = useState('')
  const [day, setDay] = useState('')
  const [start, setStart] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState<{ when: string; time: string } | null>(null)

  async function load() {
    const res = await fetch(`/api/book?token=${encodeURIComponent(token)}`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.message || 'This booking link is not valid.')
      return
    }
    setInfo(data)
    setDay(data.days?.[0]?.date || '')
    setStart('')
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function confirm() {
    if (!start || saving) return
    setSaving(true)
    setError('')
    const res = await fetch('/api/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, start }) })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (res.ok) {
      setDone({ when: data.when, time: data.time })
      return
    }
    setError(data.message || 'Sorry, we could not book that.')
    if (res.status === 409) await load()
  }

  const selected = info?.days?.find(d => d.date === day)
  const chosen = selected?.times.find(t => t.start === start)

  return (
    <main style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: FONT, padding: '28px 16px 48px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44 }}>
          {info?.business.logoUrl && <img src={info.business.logoUrl} alt="" style={{ height: 44, width: 'auto', maxWidth: 140, objectFit: 'contain' }} />}
          <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>{info?.business.name || ''}</div>
        </header>

        {!info && !error && <div style={{ ...card, color: TEXT3, fontSize: 14 }}>Loading...</div>}
        {!info && error && (
          <div style={card}>
            <div style={{ fontSize: 17, fontWeight: 800, color: TEXT }}>This link is not working</div>
            <p style={{ fontSize: 14, color: TEXT2, lineHeight: 1.5, margin: '8px 0 0' }}>{error} Please reply to your reminder email and we will book you in.</p>
          </div>
        )}

        {info && done && (
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEAL_DARK, letterSpacing: '0.06em', textTransform: 'uppercase' }}>You are booked in</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', margin: '8px 0 4px' }}>{done.when}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: TEXT2 }}>{done.time}</div>
            <p style={{ fontSize: 14, color: TEXT3, lineHeight: 1.5, margin: '14px 0 0' }}>
              We have emailed you the details and will send a reminder the day before.
              {info.business.phone ? ` To change the time, call us on ${info.business.phone}.` : ' To change the time, reply to the email.'}
            </p>
          </div>
        )}

        {info && !done && info.booked && (
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEAL_DARK, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Already booked</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', margin: '8px 0 4px' }}>{info.booked.when}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: TEXT2 }}>{info.booked.time}</div>
            <p style={{ fontSize: 14, color: TEXT3, lineHeight: 1.5, margin: '14px 0 0' }}>
              Your {info.unit} service is already booked in.{info.business.phone ? ` To change it, call us on ${info.business.phone}.` : ' To change it, reply to your reminder email.'}
            </p>
          </div>
        )}

        {info && !done && !info.booked && (
          <>
            <div style={card}>
              <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>{info.first ? `Hi ${info.first.charAt(0).toUpperCase()}${info.first.slice(1)}, ` : ''}book your service</div>
              <div style={{ fontSize: 14, color: TEXT3, marginTop: 6, lineHeight: 1.5 }}>
                {info.unit}{info.address ? ` · ${info.address}` : ''}
                <br />
                Takes about {info.minutes >= 60 ? `${info.minutes / 60} hour${info.minutes === 60 ? '' : 's'}` : `${info.minutes} minutes`}.
              </div>
            </div>

            {!info.days || info.days.length === 0 ? (
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>No times are free online right now</div>
                <p style={{ fontSize: 14, color: TEXT2, lineHeight: 1.5, margin: '6px 0 0' }}>{info.business.phone ? `Please call us on ${info.business.phone}` : 'Please reply to your reminder email'} and we will find a time that suits you.</p>
              </div>
            ) : (
              <div style={{ ...card, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TEXT3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Choose a day</div>
                  <div role="radiogroup" aria-label="Day" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
                    {info.days.map(d => {
                      const on = d.date === day
                      const [wd, ...rest] = d.label.split(' ')
                      return (
                        <button key={d.date} type="button" role="radio" aria-checked={on} onClick={() => { setDay(d.date); setStart('') }} style={{ padding: '10px 6px', borderRadius: 12, border: `1.5px solid ${on ? TEAL : LINE}`, background: on ? '#FFFFFF' : '#FAFAFA', color: TEXT, cursor: 'pointer', fontFamily: FONT, textAlign: 'center', boxShadow: on ? `0 0 0 1px ${TEAL}` : 'none' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: on ? TEAL_DARK : TEXT3 }}>{wd}</div>
                          <div style={{ fontSize: 15, fontWeight: 800 }}>{rest.join(' ')}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TEXT3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Choose a time</div>
                  <div role="radiogroup" aria-label="Time" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: 8 }}>
                    {(selected?.times || []).map(t => {
                      const on = t.start === start
                      return (
                        <button key={t.start} type="button" role="radio" aria-checked={on} onClick={() => setStart(t.start)} style={{ height: 44, borderRadius: 12, border: `1.5px solid ${on ? TEAL : LINE}`, background: on ? TEAL : '#FFFFFF', color: on ? '#FFFFFF' : TEXT, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                          {t.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {error && <div role="alert" style={{ fontSize: 13, fontWeight: 600, color: '#B42318' }}>{error}</div>}

                <button type="button" disabled={!start || saving} onClick={confirm} style={{ height: 50, borderRadius: 12, border: 'none', background: start ? TEAL_DARK : '#CBD5E1', color: '#FFFFFF', fontSize: 16, fontWeight: 800, cursor: start ? 'pointer' : 'not-allowed', fontFamily: FONT, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Booking...' : chosen && selected ? `Confirm ${selected.label}, ${chosen.label}` : 'Choose a time to continue'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
