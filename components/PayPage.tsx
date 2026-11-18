'use client'

import React, { useState } from 'react'

// The page a customer reaches from "Pay now" in an invoice email or text: a single card with who it is from, the
// invoice and the amount, a choice of how to pay, and one clear action. Flat, bone-white, brand teal.

const INK = '#0B1220'
const TEXT = '#334155'
const MUTED = '#64748B'
const LINE = '#E3E8EE'
const SOFT = '#F4F6F8'
const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TINT = '#EBFAF7'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const money = (v: unknown) => Number(v || 0).toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })
const longDate = (v: unknown) => {
  const d = v ? new Date(String(v)) : null
  return d && !isNaN(d.getTime()) ? d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
}

const Svg = ({ children, size = 18 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>{children}</svg>
)
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>

// The page is white with slightly grey sections; on a bigger screen the card floats
const PAY_CSS = `
.pay-sec { background: #F3F5F7 !important; border-color: transparent !important; }
@media (max-width: 520px) {
  .pay-shell { padding: 0 !important; display: block !important; }
  .pay-card { border-radius: 0 !important; box-shadow: none !important; min-height: 100vh; align-content: start; padding: 22px 14px 0 !important; }
  .pay-cta { margin: 0 -14px 0 !important; padding: 12px 18px calc(18px + env(safe-area-inset-bottom)) !important; border-radius: 0 !important; }
}`

const contactBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 16, border: `1px solid ${LINE}`, background: '#fff', color: TEAL_DARK, fontSize: 15, fontWeight: 700, textDecoration: 'none' }

const pill: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${LINE}`, borderRadius: 999, padding: '6px 12px', fontSize: 13, color: MUTED, fontWeight: 500, whiteSpace: 'nowrap' }

export function PayPage({ data, token, onReloaded }: { data: any; token: string; onReloaded?: () => void }) {
  const business = data.business || {}
  const customer = data.customer || {}
  const doc = data.invoice || {}
  const pay = data.payment || {}
  const payments: any[] = Array.isArray(data.payments) ? data.payments : []
  const paid = Number(doc.amount_paid || 0)
  const total = Number(doc.total || 0)
  const owing = Math.max(0, total - paid)
  const settled = doc.status === 'paid' || owing <= 0
  const mode: string = pay.mode || 'bank'

  const bankRows: [string, string][] = ([['Account name', pay.account_name], ['BSB', pay.bsb], ['Account number', pay.account_number], ['PayID', pay.payid], ['Bank', pay.bank_name]] as [string, any][])
    .filter(([, v]) => v)
    .map(([k, v]) => [k, String(v)])
  const hasBank = mode !== 'card' && mode !== 'off' && bankRows.length > 0
  const cardUrl: string | null = pay.card_link && (mode === 'card' || mode === 'both') ? String(pay.card_link).replace(/\{amount\}/gi, owing.toFixed(2)).replace(/\{invoice\}/gi, encodeURIComponent(String(doc.invoice_number || ''))) : null
  const stripeCard = !!pay.card_stripe && (mode === 'card' || mode === 'both')
  const methods = [hasBank && 'bank', (stripeCard || cardUrl) && 'card'].filter(Boolean) as ('bank' | 'card')[]

  const [method, setMethod] = useState<'bank' | 'card'>(methods[0] || 'bank')
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState('')
  const [busy, setBusy] = useState(false)
  const [reported, setReported] = useState(!!doc.payment_reported_at)
  const [error, setError] = useState('')
  const current = methods.includes(method) ? method : methods[0]

  const items: any[] = doc.line_items || []
  const summary = items[0]?.description ? `${items[0].description}${items.length > 1 ? ` + ${items.length - 1} more` : ''}` : ''
  const due = longDate(doc.due_date)
  const days = doc.due_date ? Math.round((new Date(String(doc.due_date).slice(0, 10) + 'T00:00:00').getTime() - new Date(new Date().toDateString()).getTime()) / 86400000) : null
  const dueNote = days === null ? null : days < 0 ? { text: `${-days} day${days === -1 ? '' : 's'} overdue`, bad: true } : days === 0 ? { text: 'Due today', bad: false } : { text: `${days} day${days === 1 ? '' : 's'} left`, bad: false }
  const dollars = Math.floor(owing)
  const cents = String(Math.round((owing - dollars) * 100)).padStart(2, '0')
  const initial = (business.name || '?').trim().charAt(0).toUpperCase()

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      setTimeout(() => setCopied(''), 1500)
    } catch {}
  }

  const justPaid = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('paid') === '1'

  async function payByCard() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/invoices/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      const body = await res.json().catch(() => ({}))
      if (res.ok && body.url) { window.location.href = body.url; return }
      setError(body.message || 'Sorry, the card page did not open. Please try again.')
    } catch {
      setError('Sorry, the card page did not open. Please try again.')
    }
    setBusy(false)
  }

  async function report() {
    if (busy) return
    setBusy(true)
    setError('')
    const res = await fetch('/api/invoices/reported', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
    setBusy(false)
    if (res.ok) {
      setReported(true)
      onReloaded?.()
    } else setError('Sorry, we could not send that. Please contact the business to confirm your payment.')
  }

  function download() {
    setOpen(true)
    setTimeout(() => window.print(), 250)
  }

  const contactBlock = (
    (business.phone || business.email || business.abn) ? (
      <section className="pay-sec" style={{ border: `1px solid ${LINE}`, borderRadius: 22, padding: 18, display: 'grid', gap: 12, minWidth: 0 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>Questions about this invoice?</div>
          <div style={{ fontSize: 13.5, color: MUTED, marginTop: 2 }}>Get in touch with {business.name || 'the business'}.</div>
        </div>
        {(business.phone || business.email) && (
          <div style={{ display: 'grid', gridTemplateColumns: business.phone && business.email ? '1fr 1fr' : '1fr', gap: 10 }}>
            {business.phone && <a href={`tel:${String(business.phone).replace(/[^0-9+]/g, '')}`} style={contactBtn}>Call</a>}
            {business.email && <a href={`mailto:${business.email}?subject=${encodeURIComponent('Invoice ' + (doc.invoice_number || ''))}`} style={contactBtn}>Email</a>}
          </div>
        )}
        {business.abn && <div style={{ fontSize: 12.5, color: MUTED }}>ABN {business.abn}</div>}
      </section>
    ) : null
  )

  return (
    <main className="pay-shell" style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: FONT, color: TEXT, padding: '24px 14px 48px', display: 'flex', justifyContent: 'center' }}>
      <style>{PAY_CSS}</style>
      <div style={{ width: '100%', maxWidth: 480, minWidth: 0, animation: 'jbFade 0.25s ease-out both' }}>
        <div className="pay-card" style={{ background: '#FFFFFF', borderRadius: 28, boxShadow: '0 2px 24px rgba(15, 23, 42, 0.07), 0 0 0 1px rgba(15, 23, 42, 0.04)', padding: 20, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 18 }}>
          {/* Who it is from */}
          <header style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {business.logo_url ? (
              <img src={business.logo_url} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'contain', border: `1px solid ${LINE}`, background: '#fff', flexShrink: 0 }} />
            ) : (
              <span style={{ width: 52, height: 52, borderRadius: '50%', background: TINT, color: TEAL_DARK, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, flexShrink: 0 }}>{initial}</span>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: INK, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{business.name}</div>
              <div style={{ fontSize: 13, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{business.email || business.phone || ''}</div>
            </div>
          </header>

          {/* The invoice */}
          <section className="pay-sec" style={{ border: `1px solid ${LINE}`, borderRadius: 22, padding: 18, display: 'grid', gap: 14, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: INK }}>Invoice</span>
                <span style={{ fontSize: 14, color: MUTED, fontWeight: 600 }}>{doc.invoice_number}</span>
              </div>
              <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ border: 'none', background: 'none', padding: 0, color: TEAL_DARK, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                {open ? 'Hide details' : 'View details'}
              </button>
            </div>

            <div>
              {settled ? (
                <div style={{ fontSize: 40, fontWeight: 800, color: TEAL_DARK, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Paid in full</div>
              ) : (
                <div style={{ fontSize: 44, fontWeight: 800, color: INK, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                  ${dollars.toLocaleString('en-AU')}<span style={{ fontSize: 22, color: '#94A3B8', fontWeight: 700 }}>.{cents}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8, color: MUTED, fontSize: 14 }}>
                <span>For {[customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'you'}{summary ? ` · ${summary}` : ''}</span>
              </div>
            </div>

            {open && (
              <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 12, display: 'grid', gap: 8, fontSize: 13 }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ color: INK, minWidth: 0, overflowWrap: 'anywhere' }}>{item.description || 'Item'}<span style={{ color: MUTED }}> × {Number(item.qty || 0)}</span></span>
                    <strong style={{ color: INK, whiteSpace: 'nowrap' }}>{money(Number(item.qty || 0) * Number(item.unit_price || 0))}</strong>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 8, display: 'grid', gap: 5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: MUTED }}>Subtotal</span><span>{money(doc.subtotal)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: MUTED }}>GST ({Number(doc.tax_rate || 0)}%)</span><span>{money(doc.tax_amount)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: INK }}><span>Total</span><span>{money(total)}</span></div>
                  {payments.map((p, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: TEAL_DARK }}><span>Paid {longDate(p.paid_on)}</span><span>−{money(p.amount)}</span></div>)}
                </div>
                {[doc.notes, pay.invoice_notes].filter(Boolean).length > 0 && <div style={{ color: MUTED, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{[doc.notes, pay.invoice_notes].filter(Boolean).join('\n')}</div>}
              </div>
            )}

            <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 12, display: 'grid', gap: 8, fontSize: 14 }}>
              {due && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ color: MUTED }}>Due</span>
                  <span style={{ color: INK, fontWeight: 600, textAlign: 'right' }}>
                    {due}
                    {!settled && dueNote && <span style={{ color: dueNote.bad ? '#B42318' : MUTED, fontWeight: dueNote.bad ? 700 : 500 }}> · {dueNote.text}</span>}
                  </span>
                </div>
              )}
              <div>
                <button type="button" onClick={download} style={{ border: 'none', background: 'none', padding: 0, color: TEAL_DARK, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Download invoice</button>
              </div>
            </div>
          </section>

          {/* How to pay */}
          {!settled && methods.length > 0 && (
            <>
              <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>Payment method</div>
              {methods.length >= 1 && (
                <div role="radiogroup" aria-label="Payment method" style={{ display: 'grid', gridTemplateColumns: methods.length > 1 ? '1fr 1fr' : '1fr', gap: 12 }}>
                  {methods.map(m => {
                    const on = current === m
                    return (
                      <button key={m} type="button" role="radio" aria-checked={on} onClick={() => setMethod(m)} style={{ textAlign: 'left', fontFamily: FONT, cursor: 'pointer', borderRadius: 20, padding: 14, background: on ? '#F6FBFA' : '#F3F5F7', border: `${on ? 2 : 1}px solid ${on ? TEAL : 'transparent'}`, display: 'grid', gap: 6, minWidth: 0, position: 'relative' }}>
                        <span>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 15, fontWeight: 700, color: INK }}>{m === 'bank' ? 'Bank transfer' : 'Card'}{on && <span style={{ width: 22, height: 22, borderRadius: '50%', background: TEAL, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CheckIcon /></span>}</span>
                          <span style={{ display: 'block', fontSize: 12.5, color: MUTED, marginTop: 2, lineHeight: 1.4 }}>{m === 'bank' ? 'Straight to their bank account' : 'Debit or credit card'}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {current === 'bank' && (
                <div className="pay-sec" style={{ border: `1px solid ${LINE}`, borderRadius: 20, overflow: 'hidden' }}>
                  {[...bankRows, ['Reference', String(doc.invoice_number || '')] as [string, string]].map(([label, value], i) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '9px 14px', borderTop: i === 0 ? 'none' : `1px solid ${LINE}` }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: MUTED }}>{label}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: INK, overflowWrap: 'anywhere' }}>{value}</div>
                      </div>
                      {label !== 'Bank' && (
                        <button type="button" onClick={() => copy(label, value)} style={{ ...pill, padding: '5px 12px', fontSize: 12.5, color: TEAL_DARK, fontWeight: 700, background: '#fff', cursor: 'pointer', fontFamily: FONT }}>{copied === label ? 'Copied' : 'Copy'}</button>
                      )}
                    </div>
                  ))}
                  <div style={{ padding: '10px 16px', background: '#E9EDF1', fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>Please use <strong style={{ color: INK }}>{doc.invoice_number}</strong> as the reference so the payment can be matched. Transfers usually arrive within 1 to 2 business days.</div>
                </div>
              )}

              {current === 'card' && (
                <div className="pay-sec" style={{ background: SOFT, borderRadius: 20, padding: '14px 16px', fontSize: 13.5, color: TEXT, lineHeight: 1.55 }}>
                  {stripeCard ? <>You will go to a secure payment page run by Stripe to pay {money(owing)}. Apple Pay and Google Pay show there if your phone has them.</> : <>You will go to a secure payment page run by {business.name || 'the business'}&rsquo;s card provider to pay {money(owing)}.</>}
                </div>
              )}

              {contactBlock}

              <div className="pay-cta" style={{ position: 'sticky', bottom: 0, background: '#fff', margin: '0 -20px -20px', padding: '12px 20px 20px', borderRadius: '0 0 28px 28px', display: 'grid', gap: 10, boxShadow: '0 -10px 14px -10px rgba(15,23,42,0.08)' }}>
                {reported && !(current === 'card' && stripeCard) ? (
                  <div role="status" style={{ background: TINT, color: TEAL_DARK, borderRadius: 16, padding: '13px 16px', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
                    Thanks. We have let {business.name || 'the business'} know you have paid. They will confirm once it arrives.
                  </div>
                ) : current === 'card' && stripeCard ? (
                  <>
                    {reported && <div style={{ textAlign: 'center', color: MUTED, fontSize: 13, lineHeight: 1.5 }}>You have already told {business.name || 'the business'} you paid. Only pay by card if that is not right.</div>}
                  <button type="button" onClick={payByCard} disabled={busy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 18, border: 'none', background: TEAL_DARK, color: '#fff', fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, opacity: busy ? 0.7 : 1 }}>{busy ? 'Opening...' : `Pay ${money(owing)} by card`}</button>
                  </>
                ) : current === 'card' && cardUrl ? (
                  <>
                    <a href={cardUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, borderRadius: 18, background: TEAL_DARK, color: '#fff', fontSize: 17, fontWeight: 700, textDecoration: 'none' }}>Pay {money(owing)} by card</a>
                    <button type="button" onClick={report} disabled={busy} style={{ border: 'none', background: 'none', color: MUTED, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, textDecoration: 'underline', textUnderlineOffset: 3 }}>{busy ? 'Sending...' : 'I have already paid'}</button>
                  </>
                ) : (
                  <button type="button" onClick={report} disabled={busy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, borderRadius: 18, border: 'none', background: TEAL_DARK, color: '#fff', fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, opacity: busy ? 0.7 : 1 }}>
                    {busy ? 'Sending...' : 'I have paid'}
                  </button>
                )}
                {error && <div role="alert" style={{ color: '#B42318', fontSize: 13, textAlign: 'center' }}>{error}</div>}
                <div style={{ textAlign: 'center', color: MUTED, fontSize: 12.5 }}>Payments go straight to {business.name || 'the business'}</div>
              </div>
            </>
          )}

          {!settled && methods.length === 0 && (
            <div className="pay-sec" style={{ background: SOFT, borderRadius: 20, padding: '16px', fontSize: 14, color: TEXT, lineHeight: 1.55 }}>
              {mode === 'off' ? 'This invoice is ready for you.' : 'Please contact'} {business.name || 'the business'}{business.phone ? ` on ${business.phone}` : ''}{mode === 'off' ? '' : ' to arrange payment.'}
            </div>
          )}

          {!settled && justPaid && (
            <div role="status" style={{ background: TINT, color: TEAL_DARK, borderRadius: 16, padding: '13px 16px', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
              Thanks. Your card payment is being confirmed. This page will show it as paid in a moment.
            </div>
          )}

          {settled && (
            <div role="status" style={{ background: TINT, color: TEAL_DARK, borderRadius: 16, padding: '13px 16px', fontSize: 14, fontWeight: 600 }}>
              Thank you. This invoice has been paid{doc.paid_at ? ` on ${longDate(doc.paid_at)}` : ''}.
            </div>
          )}

          {(settled || methods.length === 0) && contactBlock}
        </div>
      </div>
    </main>
  )
}

const shell: React.CSSProperties = { minHeight: '100vh', background: '#FFFFFF', fontFamily: FONT, padding: '24px 14px 48px', display: 'flex', justifyContent: 'center' }
const cardBox: React.CSSProperties = { background: '#FFFFFF', borderRadius: 28, boxShadow: '0 2px 24px rgba(15, 23, 42, 0.07), 0 0 0 1px rgba(15, 23, 42, 0.04)', padding: 20, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 18 }

/** What shows while the invoice loads: the same card, with placeholders, fading in only if it takes a moment. */
export function PayLoading() {
  const bar = (w: string | number, h: number, r = 8) => <div className="sk" style={{ width: w, height: h, borderRadius: r }} />
  return (
    <main className="pay-shell" style={shell} aria-busy="true" aria-label="Loading invoice">
      <style>{PAY_CSS}</style>
      <div style={{ width: '100%', maxWidth: 480, minWidth: 0, animation: 'jbFade 0.25s ease-out 0.2s both' }}>
        <div className="pay-card" style={cardBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{bar(52, 52, 999)}<div style={{ display: 'grid', gap: 8 }}>{bar(150, 16)}{bar(110, 11)}</div></div>
          <div style={{ border: `1px solid ${LINE}`, borderRadius: 22, padding: 18, display: 'grid', gap: 14 }}>{bar(110, 16)}{bar(190, 40, 10)}{bar('70%', 12)}{bar('55%', 30, 999)}</div>
          {bar(150, 16)}
          <div style={{ border: `1px solid ${LINE}`, borderRadius: 20, padding: 14, display: 'grid', gap: 10 }}>{bar(40, 40, 12)}{bar(120, 14)}{bar('60%', 11)}</div>
          {bar('100%', 56, 18)}
        </div>
      </div>
    </main>
  )
}

/** A friendly message in the same card (invoice not found, or the link has expired). */
export function PayMessage({ title, text }: { title: string; text: string }) {
  return (
    <main className="pay-shell" style={shell}>
      <style>{PAY_CSS}</style>
      <div style={{ width: '100%', maxWidth: 480, animation: 'jbFade 0.25s ease-out both' }}>
        <div className="pay-card" style={{ ...cardBox, textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>{title}</div>
          <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.55 }}>{text}</div>
        </div>
      </div>
    </main>
  )
}
