'use client'

import React, { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = { kind: 'quote' | 'invoice'; token: string }

const INK = '#0B1220'
const TEXT = '#334155'
const MUTED = '#64748B'
const LINE = '#E3E8EE'
const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const cardStyle: React.CSSProperties = { background: '#FFFFFF', border: `1px solid ${LINE}`, borderRadius: 16, padding: 20, minWidth: 0 }
const money = (value: unknown) => Number(value || 0).toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })
const shortDate = (value: unknown) => {
  if (!value) return ''
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function PublicDocument({ kind, token }: Props) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [responded, setResponded] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    const rpc = kind === 'quote' ? 'get_public_quote' : 'get_public_invoice'
    const { data: result, error: loadError } = await supabase.rpc(rpc, { p_token: token })
    if (loadError || !result) {
      setData(null)
      setError('This link may have expired or is no longer available. Please contact the business if you need help.')
    } else {
      setData(result)
      setError('')
      const customer = result.customer || {}
      setName([customer.first_name, customer.last_name].filter(Boolean).join(' '))
    }
    setLoading(false)
  }

  useEffect(() => { load() /* eslint-disable-line react-hooks/exhaustive-deps */ }, [kind, token])

  async function respond(action: 'accept' | 'decline' | 'question') {
    if (acting) return
    setActing(true)
    setError('')
    const { data: result, error: responseError } = await supabase.rpc('respond_public_quote', {
      p_token: token,
      p_action: action,
      p_name: name,
      p_message: message || null,
      p_optional: [],
    })
    setActing(false)
    if (responseError || !result?.ok) {
      setError(result?.error === 'expired' ? 'This quote has expired. Please contact the business for an updated quote.' : 'We could not save your response. Check your name and try again.')
      return
    }
    setResponded(action === 'accept' ? 'Thank you. Your acceptance has been recorded.' : action === 'decline' ? 'Your response has been recorded.' : 'Your question has been sent to the business.')
    await load()
  }

  const document = kind === 'quote' ? data?.quote : data?.invoice
  const business = data?.business || {}
  const customer = data?.customer || {}
  const payments = Array.isArray(data?.payments) ? data.payments : []
  const paid = Number(document?.amount_paid || 0)
  const owing = Math.max(0, Number(document?.total || 0) - paid)
  const quoteCanRespond = kind === 'quote' && document?.status === 'sent'

  return (
    <main style={{ minHeight: '100vh', background: '#F4F6F8', padding: '28px 16px 48px', color: TEXT, fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'grid', gap: 16 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44 }}>
          {business.logo_url && <img src={business.logo_url} alt="" style={{ maxWidth: 150, maxHeight: 50, objectFit: 'contain' }} />}
          <div style={{ fontSize: 18, fontWeight: 800, color: INK }}>{business.name || ''}</div>
        </header>

        {loading && <section className="jobyra-email-ui"><div className="d-card d-card-border" style={cardStyle}><div className="d-card-body" style={{ padding: 0, color: MUTED }}>Loading {kind}…</div></div></section>}
        {!loading && error && <section className="jobyra-email-ui"><div role="alert" className="d-card d-card-border" style={cardStyle}><div className="d-card-body" style={{ padding: 0 }}><h1 style={{ margin: 0, color: INK, fontSize: 21 }}>This document is unavailable</h1><p style={{ margin: '8px 0 0', color: MUTED, lineHeight: 1.55 }}>{error}</p></div></div></section>}

        {!loading && document && (
          <section className="jobyra-email-ui" style={{ display: 'grid', gap: 16 }}>
            <article className="d-card d-card-border" style={cardStyle}>
              <div className="d-card-body" style={{ padding: 0, gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                  <div>
                    <div style={{ color: TEAL_DARK, fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{kind}</div>
                    <h1 style={{ margin: '5px 0 0', color: INK, fontSize: 26, letterSpacing: '-0.03em' }}>{document.quote_number || document.invoice_number}</h1>
                  </div>
                  <div style={{ color: MUTED, textAlign: 'right', fontSize: 12, lineHeight: 1.6 }}>
                    {document.created_at && <div>Issued {shortDate(document.created_at)}</div>}
                    {document.valid_until && <div>Valid until {shortDate(document.valid_until)}</div>}
                    {document.due_date && <div>Due {shortDate(document.due_date)}</div>}
                    {kind === 'quote' && <div style={{ textTransform: 'capitalize' }}>{document.status}</div>}
                    {kind === 'invoice' && <div style={{ textTransform: 'capitalize' }}>{document.status}</div>}
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 14, color: MUTED, fontSize: 13 }}>
                  Prepared for <strong style={{ color: TEXT }}>{[customer.first_name, customer.last_name].filter(Boolean).join(' ')}</strong>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
                    <thead><tr style={{ color: MUTED, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>
                      <th style={{ padding: '10px 8px' }}>Description</th><th style={{ padding: '10px 8px', textAlign: 'right' }}>Qty</th><th style={{ padding: '10px 8px', textAlign: 'right' }}>Unit price</th><th style={{ padding: '10px 8px', textAlign: 'right' }}>Amount</th>
                    </tr></thead>
                    <tbody>{(document.line_items || []).map((item: any, index: number) => (
                      <tr key={index} style={{ borderTop: `1px solid ${LINE}`, fontSize: 13 }}>
                        <td style={{ padding: '12px 8px', color: INK }}>{item.description || 'Item'}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>{Number(item.qty || 0)}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>{money(item.unit_price)}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700 }}>{money(Number(item.qty || 0) * Number(item.unit_price || 0))}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div style={{ marginLeft: 'auto', width: 'min(100%, 280px)', display: 'grid', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><strong>{money(document.subtotal)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GST ({Number(document.tax_rate || 0)}%)</span><strong>{money(document.tax_amount)}</strong></div>
                  <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 16, color: INK }}><strong>Total</strong><strong>{money(document.total)}</strong></div>
                  {kind === 'invoice' && paid > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Paid</span><strong>{money(paid)}</strong></div>}
                  {kind === 'invoice' && owing > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: TEAL_DARK }}><strong>Amount due</strong><strong>{money(owing)}</strong></div>}
                </div>
                {(document.notes || data.payment?.invoice_notes) && <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 12, fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-line' }}>{[document.notes, data.payment?.invoice_notes].filter(Boolean).join('\n')}</div>}
              </div>
            </article>

            {kind === 'invoice' && data.payment && Object.values(data.payment).some(Boolean) && (
              <article className="d-card d-card-border" style={cardStyle}>
                <div className="d-card-body" style={{ padding: 0, gap: 8 }}>
                  <h2 style={{ margin: 0, fontSize: 16, color: INK }}>Payment details</h2>
                  {([['Bank', data.payment.bank_name], ['Account name', data.payment.account_name], ['BSB', data.payment.bsb], ['Account number', data.payment.account_number], ['Reference', document.invoice_number], ['Terms', data.payment.payment_terms]] as [string, any][]).filter(([, value]) => value).map(([label, value]) => <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}><span style={{ color: MUTED }}>{label}</span><strong style={{ color: TEXT }}>{value}</strong></div>)}
                </div>
              </article>
            )}

            {kind === 'invoice' && payments.length > 0 && (
              <article className="d-card d-card-border" style={cardStyle}>
                <div className="d-card-body" style={{ padding: 0, gap: 8 }}>
                  <h2 style={{ margin: 0, fontSize: 16, color: INK }}>Payments received</h2>
                  {payments.map((item: any, index: number) => <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}><span style={{ color: MUTED }}>{shortDate(item.paid_on)}{item.method ? ` · ${item.method}` : ''}</span><strong>{money(item.amount)}</strong></div>)}
                </div>
              </article>
            )}

            {quoteCanRespond && (
              <article className="d-card d-card-border" style={cardStyle}>
                <div className="d-card-body" style={{ padding: 0, gap: 12 }}>
                  <h2 style={{ margin: 0, fontSize: 18, color: INK }}>Respond to this quote</h2>
                  <label style={{ display: 'grid', gap: 5, color: MUTED, fontSize: 12, fontWeight: 700 }}>Your name<input className="d-input d-input-bordered" value={name} onChange={event => setName(event.target.value)} placeholder="Full name" /></label>
                  <label style={{ display: 'grid', gap: 5, color: MUTED, fontSize: 12, fontWeight: 700 }}>Message (optional)<textarea className="d-textarea d-textarea-bordered" value={message} onChange={event => setMessage(event.target.value)} placeholder="Add a note for the business" rows={3} /></label>
                  {responded && <div role="status" style={{ color: TEAL_DARK, fontSize: 13 }}>{responded}</div>}
                  {error && <div role="alert" style={{ color: '#B42318', fontSize: 13 }}>{error}</div>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <button type="button" className="d-btn d-btn-primary" style={{ background: TEAL_DARK, borderColor: TEAL_DARK, color: '#FFFFFF' }} disabled={acting || name.trim().length < 2} onClick={() => respond('accept')}>{acting ? 'Saving…' : 'Accept quote'}</button>
                    <button type="button" className="d-btn d-btn-outline" disabled={acting || name.trim().length < 2} onClick={() => respond('decline')}>Decline</button>
                    <button type="button" className="d-btn d-btn-ghost" disabled={acting || name.trim().length < 2 || !message.trim()} onClick={() => respond('question')}>Ask a question</button>
                  </div>
                </div>
              </article>
            )}

            {kind === 'quote' && document.responded_at && <div role="status" style={{ ...cardStyle, fontSize: 13, color: TEAL_DARK }}>Response recorded{document.responded_name ? ` from ${document.responded_name}` : ''}.</div>}
            {error && <div role="alert" style={{ color: '#B42318', fontSize: 13 }}>{error}</div>}
            {(business.phone || business.email) && <footer style={{ textAlign: 'center', color: MUTED, fontSize: 12, lineHeight: 1.6 }}>Questions? Contact {business.name || 'the business'}{business.phone ? ` on ${business.phone}` : ''}{business.email ? ` or ${business.email}` : ''}.</footer>}
          </section>
        )}
      </div>
    </main>
  )
}
