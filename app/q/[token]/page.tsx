'use client'

import React, { use, useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { money } from '@/lib/format'
import { calcTotals, localDate, shortDate, type LineItem } from '@/lib/documents'
import { BankCard, C, FONT, LinesTable, LoadingCard, Notice, PrintButton, PublicShell, TotalsBlock, card, label, type DocLine } from '@/components/PublicDoc'

type Data = {
  business: any
  payment: any
  customer: { first_name: string | null; last_name: string | null }
  quote: {
    quote_number: string
    status: string
    line_items: LineItem[]
    subtotal: number
    tax_rate: number
    tax_amount: number
    total: number
    notes: string | null
    valid_until: string | null
    created_at: string
    deposit_percent: number | null
    responded_at: string | null
    responded_name: string | null
    response_message: string | null
    accepted_optional: number[]
  }
}

const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', height: 48, padding: '0 14px', border: `1px solid ${C.field}`, borderRadius: 12, fontSize: 16, fontFamily: FONT, color: C.text, background: C.white, outline: 'none' }

export default function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [data, setData] = useState<Data | null>(null)
  const [state, setState] = useState<'loading' | 'missing' | 'ready'>('loading')
  const [chosen, setChosen] = useState<number[]>([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'idle' | 'question' | 'decline'>('idle')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ action: string } | null>(null)

  const load = useCallback(async () => {
    const { data: res, error: err } = await supabase.rpc('get_public_quote', { p_token: token })
    if (err || !res) {
      setState('missing')
      return
    }
    setData(res as Data)
    setState('ready')
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (data) document.title = `Quote ${data.quote.quote_number} | ${data.business?.name || ''}`
  }, [data])

  async function submit(action: 'accept' | 'decline' | 'question') {
    setError('')
    if (name.trim().length < 2) {
      setError('Please type your full name.')
      return
    }
    if (action === 'question' && !message.trim()) {
      setError('Please type your question.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/public/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action, name: name.trim(), message: message.trim(), optional: chosen }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(body.message || 'Something went wrong. Please try again.')
        if (body.error === 'already_answered' || body.error === 'expired') load()
        setBusy(false)
        return
      }
      setDone({ action })
      setMessage('')
      setMode('idle')
      await load()
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    }
    setBusy(false)
  }

  if (state === 'loading') {
    return (
      <PublicShell business={null}>
        <LoadingCard text="Loading your quote..." />
      </PublicShell>
    )
  }
  if (state === 'missing' || !data) {
    return (
      <PublicShell business={null}>
        <Notice tone="info" title="This quote isn’t available">
          The link may be incomplete, or the quote has been withdrawn. Please contact the business that sent it.
        </Notice>
      </PublicShell>
    )
  }

  const { business, payment, customer, quote: q } = data
  const items = q.line_items || []
  const answered = q.status === 'accepted' || q.status === 'declined'
  const today = new Date()
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const validDate = localDate(q.valid_until)
  const expired = q.status === 'expired' || (q.status === 'sent' && !!validDate && validDate < startToday)
  const open = q.status === 'sent' && !expired
  const hasExtras = items.some(i => i.optional)
  const picked = answered ? q.accepted_optional || [] : chosen
  const t = answered ? { subtotal: Number(q.subtotal), tax_amount: Number(q.tax_amount), total: Number(q.total) } : calcTotals(items, Number(q.tax_rate), chosen)
  const pct = Number(q.deposit_percent) || 0
  const first = customer?.first_name || ''
  const asked = q.status === 'sent' && !!q.response_message

  const lines: DocLine[] = items.map((it, idx) => {
    const isExtra = !!it.optional
    const on = picked.includes(idx)
    return {
      description: it.description,
      qty: it.qty,
      unit_price: it.unit_price,
      badge: isExtra ? (answered ? (on ? 'Chosen extra' : 'Not chosen') : 'Optional extra') : undefined,
      muted: isExtra && answered && !on,
      checked: isExtra ? on : undefined,
      onToggle: isExtra && open ? () => setChosen(prev => (prev.includes(idx) ? prev.filter(n => n !== idx) : [...prev, idx])) : undefined,
    }
  })

  return (
    <PublicShell business={business}>
      <style>{`@media print { .no-print { display: none !important; } body { background: #fff !important; } }`}</style>

      {done?.action === 'accept' && (
        <Notice tone="good" title="Thank you, your quote is accepted">
          {business?.name} has been told and will be in touch to arrange the work.
          {pct > 0 && payment?.bsb ? ' The deposit details are below.' : ''}
        </Notice>
      )}
      {done?.action === 'decline' && (
        <Notice tone="info" title="Quote declined">
          Thanks for letting us know. {business?.name} has been told.
        </Notice>
      )}
      {done?.action === 'question' && (
        <Notice tone="good" title="Question sent">
          {business?.name} has your message and will reply soon.
        </Notice>
      )}
      {!done && q.status === 'accepted' && (
        <Notice tone="good" title="You accepted this quote">
          {q.responded_name ? `Signed by ${q.responded_name}` : 'Accepted'}
          {q.responded_at ? ` on ${shortDate(q.responded_at)}` : ''}. {business?.name} will be in touch to arrange the work.
        </Notice>
      )}
      {!done && q.status === 'declined' && <Notice tone="info" title="This quote was declined">{q.responded_at ? `On ${shortDate(q.responded_at)}.` : ''} If you change your mind, please contact {business?.name}.</Notice>}
      {expired && <Notice tone="warn" title="This quote has expired">Please contact {business?.name} and they will update it for you.</Notice>}
      {!done && asked && <Notice tone="info" title="Your question was sent">{business?.name} will reply soon. You can still accept or decline below.</Notice>}

      <div style={{ ...card, padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={label}>Quote prepared for</div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', marginTop: 4 }}>{`${first} ${customer?.last_name || ''}`.trim() || 'You'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{q.quote_number}</div>
            <div style={{ fontSize: 13, color: C.text3, marginTop: 3 }}>Issued {shortDate(q.created_at)}</div>
            {q.valid_until && <div style={{ fontSize: 13, color: C.text3, marginTop: 1 }}>Valid until {shortDate(q.valid_until)}</div>}
          </div>
        </div>

        {open && hasExtras && <div style={{ fontSize: 14, color: C.text2, lineHeight: 1.5 }}>Tick any optional extras you would like included. The total updates as you choose.</div>}

        <LinesTable lines={lines} />

        <TotalsBlock rows={[['Subtotal', money(t.subtotal)], [`GST (${q.tax_rate}%)`, money(t.tax_amount)]]} total={money(t.total)} />

        {q.notes && (
          <div>
            <div style={{ ...label, marginBottom: 6 }}>Notes</div>
            <div style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{q.notes}</div>
          </div>
        )}
      </div>

      {pct > 0 && (open || q.status === 'accepted') && (
        <div style={{ ...card, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={label}>Deposit to confirm the booking</div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.03em', marginTop: 4 }}>
              {money((t.total * pct) / 100)} <span style={{ fontSize: 14, fontWeight: 600, color: C.text3 }}>({pct}% of the total)</span>
            </div>
            <div style={{ fontSize: 14, color: C.text2, marginTop: 6, lineHeight: 1.5 }}>Pay by bank transfer once you accept, using the quote number as the reference.</div>
          </div>
          <BankCard title="Bank details" payment={payment} reference={q.quote_number} />
        </div>
      )}

      {open && (
        <div className="no-print" style={{ ...card, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Ready to go ahead?</div>
            <div style={{ fontSize: 14, color: C.text3, marginTop: 2 }}>Type your full name to accept. By accepting you agree to the price and work described above.</div>
          </div>

          <div>
            <label htmlFor="q-name" style={{ ...label, display: 'block', marginBottom: 6 }}>Your full name</label>
            <input id="q-name" style={input} value={name} onChange={e => setName(e.target.value)} placeholder="Full name" autoComplete="name" maxLength={120} />
          </div>

          {mode !== 'idle' && (
            <div>
              <label htmlFor="q-msg" style={{ ...label, display: 'block', marginBottom: 6 }}>{mode === 'question' ? 'Your question' : 'Reason (optional)'}</label>
              <textarea id="q-msg" style={{ ...input, height: 110, padding: 14, resize: 'vertical' }} value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} placeholder={mode === 'question' ? 'What would you like to ask?' : 'Let us know why, if you like'} />
            </div>
          )}

          {error && <div role="alert" style={{ fontSize: 14, fontWeight: 600, color: C.red, background: C.redLight, border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>{error}</div>}

          {mode === 'idle' && (
            <button type="button" onClick={() => submit('accept')} disabled={busy} style={{ height: 52, border: 'none', borderRadius: 14, background: C.teal, color: C.white, fontFamily: FONT, fontSize: 16, fontWeight: 800, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
              {busy ? 'Sending...' : `Accept quote · ${money(t.total)}`}
            </button>
          )}
          {mode === 'question' && (
            <button type="button" onClick={() => submit('question')} disabled={busy} style={{ height: 52, border: 'none', borderRadius: 14, background: C.teal, color: C.white, fontFamily: FONT, fontSize: 16, fontWeight: 800, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
              {busy ? 'Sending...' : 'Send question'}
            </button>
          )}
          {mode === 'decline' && (
            <button type="button" onClick={() => submit('decline')} disabled={busy} style={{ height: 52, border: '1px solid #FECACA', borderRadius: 14, background: C.white, color: C.red, fontFamily: FONT, fontSize: 16, fontWeight: 800, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
              {busy ? 'Sending...' : 'Decline this quote'}
            </button>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 22, flexWrap: 'wrap' }}>
            {mode !== 'idle' && (
              <button type="button" onClick={() => { setMode('idle'); setError('') }} style={linkBtn}>Back</button>
            )}
            {mode !== 'question' && (
              <button type="button" onClick={() => { setMode('question'); setError('') }} style={linkBtn}>Ask a question</button>
            )}
            {mode !== 'decline' && (
              <button type="button" onClick={() => { setMode('decline'); setError('') }} style={{ ...linkBtn, color: C.text3 }}>Decline</button>
            )}
          </div>
        </div>
      )}

      <div className="no-print" style={{ display: 'flex', justifyContent: 'center' }}>
        <PrintButton />
      </div>
    </PublicShell>
  )
}

const linkBtn: React.CSSProperties = { background: 'none', border: 'none', fontFamily: FONT, fontSize: 14, fontWeight: 700, color: C.tealDark, cursor: 'pointer', padding: 6 }
