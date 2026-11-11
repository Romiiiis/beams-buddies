'use client'

import React from 'react'
import { Modal, BTN, BTN_SM, LINE, TEAL, TEAL_DARK, TEAL_LIGHT, TEXT, TEXT2, TEXT3, WHITE } from '@/components/forms'
import { StatusSelect } from '@/components/DataList'
import { ActionMenu } from '@/components/ActionMenu'
import { money } from '@/lib/format'
import { optionalExtras, shortDate } from '@/lib/documents'
import { printElement } from '@/lib/print'
import { QUOTE_STATUS, customerName, type Quote } from './types'

type Props = {
  quote: Quote
  business: any
  settings: any
  isMobile: boolean
  hasInvoice: boolean
  onClose: () => void
  onStatus: (status: string) => void
  onSend: () => void
  onEdit: () => void
  onDelete: () => void
  onCreateInvoice: () => void
  onScheduleVisit: () => void
  onCopyLink: () => void
}

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'
const stamp = (v?: string | null) => (v ? new Date(v).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '')

/** The quote as a document, plus what the customer has done with it, and the actions for the next step. */
export function QuoteView({ quote, business, settings, isMobile, hasInvoice, onClose, onStatus, onSend, onEdit, onDelete, onCreateInvoice, onScheduleVisit, onCopyLink }: Props) {
  const st = QUOTE_STATUS[quote.status] || QUOTE_STATUS.draft
  const c = quote.customers
  const items = quote.line_items || []
  const chosen = quote.accepted_optional || []
  const answered = quote.status === 'accepted' || quote.status === 'declined'
  const asked = quote.status === 'sent' && !!quote.response_message
  const extras = optionalExtras(items)
  const pct = Number(quote.deposit_percent) || 0
  const depositAmount = (Number(quote.total) * pct) / 100
  const hasBank = !!(settings?.bsb || settings?.account_number)
  const canEdit = quote.status === 'draft' || quote.status === 'sent'
  const live = quote.status !== 'draft'

  const primary =
    quote.status === 'accepted'
      ? { label: hasInvoice ? 'Open invoice' : 'Create invoice', run: onCreateInvoice }
      : quote.status === 'draft'
        ? { label: 'Send', run: onSend }
        : null

  const menu: { value: string; label: string; run: () => void }[] = [
    ...(quote.status === 'sent' || quote.status === 'declined' || quote.status === 'expired' ? [{ value: 'send', label: quote.status === 'sent' ? 'Resend email' : 'Send again', run: onSend }] : []),
    ...(quote.status === 'accepted' ? [{ value: 'send', label: 'Resend email', run: onSend }] : []),
    ...(live ? [{ value: 'visit', label: 'Schedule a visit', run: onScheduleVisit }] : []),
    ...(quote.status === 'sent' ? [{ value: 'invoice', label: hasInvoice ? 'Open invoice' : 'Create invoice', run: onCreateInvoice }] : []),
    ...(live ? [{ value: 'link', label: 'Copy customer link', run: onCopyLink }] : []),
    ...(!isMobile ? [{ value: 'print', label: 'Print', run: () => printElement('quote-print', quote.quote_number) }] : []),
    ...(canEdit ? [{ value: 'edit', label: 'Edit quote', run: onEdit }] : []),
    { value: 'delete', label: 'Delete quote', run: onDelete },
  ]

  const activity: { text: React.ReactNode; tone: 'good' | 'bad' | 'info' | 'quiet' }[] = []
  if (quote.sent_at) activity.push({ text: `Sent to the customer on ${stamp(quote.sent_at)}`, tone: 'quiet' })
  if (quote.viewed_at) activity.push({ text: `Opened by the customer on ${stamp(quote.viewed_at)}`, tone: 'info' })
  if (quote.status === 'accepted' && quote.responded_at) activity.push({ text: <>Accepted by <b>{quote.responded_name}</b> on {stamp(quote.responded_at)}</>, tone: 'good' })
  if (quote.status === 'declined' && quote.responded_at) activity.push({ text: <>Declined by <b>{quote.responded_name}</b> on {stamp(quote.responded_at)}</>, tone: 'bad' })
  if (asked) activity.push({ text: <><b>{quote.responded_name}</b> asked a question on {stamp(quote.responded_at)}</>, tone: 'info' })

  const toneColour = { good: TEAL, bad: '#DC2626', info: '#4338CA', quiet: '#94A3B8' }

  return (
    <Modal
      size="xl"
      flush
      onClose={onClose}
      title={
        <>
          <span style={{ fontSize: 15, fontWeight: 700, color: TEXT, fontFamily: MONO }}>{quote.quote_number}</span>
          <StatusSelect
            value={quote.status}
            onChange={onStatus}
            options={Object.entries(QUOTE_STATUS).map(([k, v]) => ({ value: k, label: v.label }))}
            colors={{ bg: st.bg, fg: st.color, border: st.border }}
            label="Quote status"
          />
        </>
      }
      headerExtra={
        <>
          {primary && (
            <button type="button" onClick={primary.run} style={{ ...BTN.primary, ...BTN_SM }}>
              {primary.label}
            </button>
          )}
          <ActionMenu actions={menu.map(m => ({ label: m.label, onClick: m.run, danger: m.value === 'delete' }))} />
        </>
      }
    >
      <div style={{ padding: isMobile ? '16px' : '24px 36px 0' }}>
        {activity.length > 0 && (
          <div style={{ border: `1px solid ${LINE}`, background: '#F8FAFC', borderRadius: 12, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activity.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: TEXT2, lineHeight: 1.45 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: toneColour[a.tone], marginTop: 6, flexShrink: 0 }} />
                <span>{a.text}</span>
              </div>
            ))}
            {(answered || asked) && quote.response_message && (
              <div style={{ marginLeft: 18, fontSize: 13, color: TEXT, background: WHITE, border: `1px solid ${LINE}`, borderRadius: 10, padding: '10px 12px', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>“{quote.response_message}”</div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: isMobile ? '20px 16px' : '28px 36px 32px' }} id="quote-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? 24 : 32, gap: 20, flexWrap: 'wrap' }}>
          <div>
            {business?.logo_url && <img src={business.logo_url} alt="Logo" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'contain', marginBottom: 10, border: `1px solid ${LINE}` }} />}
            <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, letterSpacing: '-0.4px' }}>{business?.name || 'Your Business'}</div>
            {business?.abn && <div style={{ fontSize: 13, color: TEXT3, marginTop: 3 }}>ABN {business.abn}</div>}
            {business?.phone && <div style={{ fontSize: 13, color: TEXT3, marginTop: 2 }}>{business.phone}</div>}
            {business?.email && <div style={{ fontSize: 13, color: TEXT3, marginTop: 2 }}>{business.email}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: TEAL, letterSpacing: '-0.6px', marginBottom: 6 }}>QUOTE</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, fontFamily: MONO }}>{quote.quote_number}</div>
            <div style={{ fontSize: 12, color: TEXT3, marginTop: 4 }}>Issued: {shortDate(quote.created_at)}</div>
            {quote.valid_until && <div style={{ fontSize: 12, color: TEXT3, marginTop: 2 }}>Valid until: {shortDate(quote.valid_until)}</div>}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Prepared for</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{customerName(c) || 'Customer'}</div>
          {c?.address && <div style={{ fontSize: 13, color: TEXT2, marginTop: 2 }}>{c.address}</div>}
          {c?.suburb && <div style={{ fontSize: 13, color: TEXT2, marginTop: 1 }}>{c.suburb}</div>}
          {c?.phone && <div style={{ fontSize: 13, color: TEXT3, marginTop: 3 }}>{c.phone}</div>}
          {c?.email && <div style={{ fontSize: 13, color: TEXT3, marginTop: 1 }}>{c.email}</div>}
        </div>

        <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          {!isMobile && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 70px 100px 110px', columnGap: 10, background: '#F8FAFC', padding: '10px 16px', borderBottom: `1px solid ${LINE}` }}>
              {['Description', 'Qty', 'Unit price', 'Total'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: h === 'Description' ? 'left' : 'right' }}>{h}</div>
              ))}
            </div>
          )}
          {items.map((it, idx) => {
            const isExtra = !!it.optional
            const picked = chosen.includes(idx)
            const dim = isExtra && quote.status === 'accepted' && !picked
            const tag = isExtra ? (quote.status === 'accepted' ? (picked ? 'Chosen extra' : 'Not chosen') : 'Optional extra') : null
            const lineAmt = money(Number(it.qty) * Number(it.unit_price))
            return isMobile ? (
              <div key={idx} style={{ padding: '12px 14px', borderTop: idx === 0 ? 'none' : `1px solid ${LINE}`, opacity: dim ? 0.5 : 1 }}>
                <div style={{ fontSize: 14, color: TEXT, fontWeight: 600, overflowWrap: 'anywhere' }}>{it.description}</div>
                {tag && <Tag text={tag} on={picked} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 13, color: TEXT3 }}>{it.qty} × {money(it.unit_price)}</span>
                  <span style={{ fontSize: 14, color: TEXT, fontWeight: 800 }}>{lineAmt}</span>
                </div>
              </div>
            ) : (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 70px 100px 110px', columnGap: 10, padding: '12px 16px', borderTop: idx === 0 ? 'none' : `1px solid ${LINE}`, alignItems: 'center', opacity: dim ? 0.5 : 1, background: isExtra ? '#FCFDFD' : WHITE }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: TEXT, fontWeight: 500, overflowWrap: 'anywhere' }}>{it.description}</div>
                  {tag && <Tag text={tag} on={picked} />}
                </div>
                <div style={{ fontSize: 13, color: TEXT2, textAlign: 'right' }}>{it.qty}</div>
                <div style={{ fontSize: 13, color: TEXT2, textAlign: 'right' }}>{money(it.unit_price)}</div>
                <div style={{ fontSize: 13, color: TEXT, fontWeight: 700, textAlign: 'right' }}>{lineAmt}</div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <div style={{ width: isMobile ? '100%' : 280 }}>
            <TotalRow label="Subtotal" value={money(quote.subtotal)} />
            <TotalRow label={`GST (${quote.tax_rate}%)`} value={money(quote.tax_amount)} rule />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', background: TEAL, borderRadius: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: WHITE }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: WHITE }}>{money(quote.total)}</span>
            </div>
            {quote.status !== 'accepted' && extras > 0 && <div style={{ fontSize: 12, color: TEXT3, marginTop: 8, textAlign: 'right' }}>Optional extras the customer can add: +{money(extras)} + GST</div>}
          </div>
        </div>

        {pct > 0 && (
          <div style={{ background: TEAL_LIGHT, border: '1px solid #BFE7E3', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEAL_DARK, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Deposit to confirm the booking</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: TEXT }}>
              {money(depositAmount)} <span style={{ fontSize: 13, fontWeight: 600, color: TEXT3 }}>({pct}% of the total)</span>
            </div>
            {hasBank && (
              <div style={{ fontSize: 13, color: TEXT2, marginTop: 8, lineHeight: 1.6 }}>
                {settings.account_name && <>{settings.account_name} · </>}BSB <b style={{ fontFamily: MONO }}>{settings.bsb}</b> · Account <b style={{ fontFamily: MONO }}>{settings.account_number}</b> · Reference <b style={{ fontFamily: MONO }}>{quote.quote_number}</b>
              </div>
            )}
          </div>
        )}

        {quote.notes && (
          <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Notes</div>
            <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{quote.notes}</div>
          </div>
        )}
      </div>
    </Modal>
  )
}

function Tag({ text, on }: { text: string; on: boolean }) {
  return (
    <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: on ? TEAL_DARK : TEXT3, background: on ? TEAL_LIGHT : '#F1F5F9', borderRadius: 6, padding: '2px 7px' }}>
      {text}
    </span>
  )
}

function TotalRow({ label, value, rule }: { label: string; value: string; rule?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: rule ? `1px solid ${LINE}` : 'none', marginBottom: rule ? 8 : 0 }}>
      <span style={{ fontSize: 13, color: TEXT3 }}>{label}</span>
      <span style={{ fontSize: 13, color: TEXT, fontWeight: 700 }}>{value}</span>
    </div>
  )
}
