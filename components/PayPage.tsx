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
const BankIcon = () => <Svg><path d="M3 10l9-6 9 6" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" /><path d="M3 20h18" /></Svg>
const CardIcon = () => <Svg><rect x="3" y="5.5" width="18" height="13" rx="3" /><path d="M3 10h18M7 15h3" /></Svg>
const CalIcon = () => <Svg size={16}><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></Svg>
const ClockIcon = () => <Svg size={15}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
const DownIcon = () => <Svg size={16}><path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14" /></Svg>
const DocIcon = () => <Svg size={16}><path d="M7 3.5h7l4 4V20H7z" /><path d="M14 3.5V8h4M9.5 12h5M9.5 15.5h5" /></Svg>
const LockIcon = () => <Svg size={15}><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" /><path d="M8 10.5V8a4 4 0 018 0v2.5" /></Svg>
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>

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
  const methods = [hasBank && 'bank', cardUrl && 'card'].filter(Boolean) as ('bank' | 'card')[]

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

  return (
    <main style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: FONT, color: TEXT, padding: '24px 14px 48px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480, minWidth: 0, animation: 'jbFade 0.25s ease-out both' }}>
        <div style={{ background: '#FFFFFF', borderRadius: 28, boxShadow: '0 2px 24px rgba(15, 23, 42, 0.07), 0 0 0 1px rgba(15, 23, 42, 0.04)', padding: 20, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 18 }}>
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
          <section style={{ border: `1px solid ${LINE}`, borderRadius: 22, padding: 18, display: 'grid', gap: 14, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: INK }}>Invoice</span>
                <span style={{ ...pill, padding: '3px 10px', fontSize: 12 }}>{doc.invoice_number}</span>
              </div>
              <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ ...pill, background: '#fff', cursor: 'pointer', fontFamily: FONT }}>
                <DocIcon /> {open ? 'Hide details' : 'View details'}
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
                <span>For {[customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'you'}</span>
                {summary && <span style={{ ...pill, padding: '3px 10px', fontSize: 12 }}>{summary}</span>}
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

            <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              {due ? <span style={pill}><CalIcon /> Due {due}</span> : <span />}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {!settled && dueNote && (
                  <span style={{ ...pill, color: dueNote.bad ? '#B42318' : TEAL_DARK, borderColor: dueNote.bad ? '#F4C7C3' : '#BFE7E3', padding: '6px 11px', fontSize: 12.5 }}><ClockIcon /> {dueNote.text}</span>
                )}
                <button type="button" onClick={download} style={{ ...pill, background: SOFT, color: INK, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}><DownIcon /> Download</button>
              </span>
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
                      <button key={m} type="button" role="radio" aria-checked={on} onClick={() => setMethod(m)} style={{ textAlign: 'left', fontFamily: FONT, cursor: 'pointer', borderRadius: 20, padding: 14, background: on ? '#F6FBFA' : '#fff', border: `${on ? 2 : 1}px solid ${on ? TEAL : LINE}`, display: 'grid', gap: 10, minWidth: 0, position: 'relative' }}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ width: 40, height: 40, borderRadius: 12, background: on ? '#DDF3EF' : SOFT, color: on ? TEAL_DARK : MUTED, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{m === 'bank' ? <BankIcon /> : <CardIcon />}</span>
                          {on && <span style={{ width: 22, height: 22, borderRadius: '50%', background: TEAL, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon /></span>}
                        </span>
                        <span>
                          <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: INK }}>{m === 'bank' ? 'Bank transfer' : 'Card'}</span>
                          <span style={{ display: 'block', fontSize: 12.5, color: MUTED, marginTop: 2, lineHeight: 1.4 }}>{m === 'bank' ? 'Straight to their bank account' : 'Debit or credit card'}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {current === 'bank' && (
                <div style={{ border: `1px solid ${LINE}`, borderRadius: 20, overflow: 'hidden' }}>
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
                  <div style={{ padding: '10px 16px', background: SOFT, fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>Please use <strong style={{ color: INK }}>{doc.invoice_number}</strong> as the reference so the payment can be matched. Transfers usually arrive within 1 to 2 business days.</div>
                </div>
              )}

              {current === 'card' && (
                <div style={{ background: SOFT, borderRadius: 20, padding: '14px 16px', fontSize: 13.5, color: TEXT, lineHeight: 1.55 }}>
                  You will go to a secure payment page run by {business.name || 'the business'}&rsquo;s card provider to pay {money(owing)}.
                </div>
              )}

              <div style={{ position: 'sticky', bottom: 0, background: '#fff', margin: '0 -20px -20px', padding: '12px 20px 20px', borderRadius: '0 0 28px 28px', display: 'grid', gap: 10, boxShadow: '0 -10px 14px -10px rgba(15,23,42,0.08)' }}>
                {reported ? (
                  <div role="status" style={{ background: TINT, color: TEAL_DARK, borderRadius: 16, padding: '13px 16px', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
                    Thanks. We have let {business.name || 'the business'} know you have paid. They will confirm once it arrives.
                  </div>
                ) : current === 'card' && cardUrl ? (
                  <>
                    <a href={cardUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, borderRadius: 18, background: TEAL_DARK, color: '#fff', fontSize: 17, fontWeight: 700, textDecoration: 'none' }}><LockIcon /> Pay {money(owing)} by card</a>
                    <button type="button" onClick={report} disabled={busy} style={{ border: 'none', background: 'none', color: MUTED, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, textDecoration: 'underline', textUnderlineOffset: 3 }}>{busy ? 'Sending...' : 'I have already paid'}</button>
                  </>
                ) : (
                  <button type="button" onClick={report} disabled={busy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, borderRadius: 18, border: 'none', background: TEAL_DARK, color: '#fff', fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, opacity: busy ? 0.7 : 1 }}>
                    <CheckIcon /> {busy ? 'Sending...' : 'I have paid'}
                  </button>
                )}
                {error && <div role="alert" style={{ color: '#B42318', fontSize: 13, textAlign: 'center' }}>{error}</div>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: MUTED, fontSize: 12.5 }}><LockIcon /> Payments go straight to {business.name || 'the business'}</div>
              </div>
            </>
          )}

          {!settled && methods.length === 0 && (
            <div style={{ background: SOFT, borderRadius: 20, padding: '16px', fontSize: 14, color: TEXT, lineHeight: 1.55 }}>
              {mode === 'off' ? 'This invoice is ready for you.' : 'Please contact'} {business.name || 'the business'}{business.phone ? ` on ${business.phone}` : ''}{mode === 'off' ? '' : ' to arrange payment.'}
            </div>
          )}

          {settled && (
            <div role="status" style={{ background: TINT, color: TEAL_DARK, borderRadius: 16, padding: '13px 16px', fontSize: 14, fontWeight: 600 }}>
              Thank you. This invoice has been paid{doc.paid_at ? ` on ${longDate(doc.paid_at)}` : ''}.
            </div>
          )}
        </div>

        {(business.phone || business.email || business.abn) && (
          <p style={{ textAlign: 'center', color: MUTED, fontSize: 12.5, lineHeight: 1.6, marginTop: 14 }}>
            Questions? Contact {business.name || 'the business'}{business.phone ? ` on ${business.phone}` : ''}{business.email ? ` or ${business.email}` : ''}.{business.abn ? <><br />ABN {business.abn}</> : null}
          </p>
        )}
      </div>
    </main>
  )
}

const shell: React.CSSProperties = { minHeight: '100vh', background: '#FAFAFA', fontFamily: FONT, padding: '24px 14px 48px', display: 'flex', justifyContent: 'center' }
const cardBox: React.CSSProperties = { background: '#FFFFFF', borderRadius: 28, boxShadow: '0 2px 24px rgba(15, 23, 42, 0.07), 0 0 0 1px rgba(15, 23, 42, 0.04)', padding: 20, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 18 }

/** What shows while the invoice loads: the same card, with placeholders, fading in only if it takes a moment. */
export function PayLoading() {
  const bar = (w: string | number, h: number, r = 8) => <div className="sk" style={{ width: w, height: h, borderRadius: r }} />
  return (
    <main style={shell} aria-busy="true" aria-label="Loading invoice">
      <div style={{ width: '100%', maxWidth: 480, minWidth: 0, animation: 'jbFade 0.25s ease-out 0.2s both' }}>
        <div style={cardBox}>
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
    <main style={shell}>
      <div style={{ width: '100%', maxWidth: 480, animation: 'jbFade 0.25s ease-out both' }}>
        <div style={{ ...cardBox, textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>{title}</div>
          <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.55 }}>{text}</div>
        </div>
      </div>
    </main>
  )
}
