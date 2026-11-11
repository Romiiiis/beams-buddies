'use client'

// Building blocks for the pages a customer opens from an emailed link (quote and invoice).
// They use the same colours and type as the CRM, laid out for a phone first.

import React, { useState } from 'react'
import { money } from '@/lib/format'

export const C = {
  teal: '#2AA198',
  tealDark: '#1F857C',
  tealLight: '#EBFAF7',
  text: '#0B1220',
  text2: '#1F2937',
  text3: '#64748B',
  line: '#E8EDF2',
  field: '#DCE3EA',
  bg: '#FAFAFA',
  white: '#FFFFFF',
  red: '#B91C1C',
  redLight: '#FEF2F2',
  amberLight: '#FFFBEB',
  amber: '#92400E',
}
export const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
export const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

export const card: React.CSSProperties = { background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }
export const label: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }

export function PublicShell({ business, children }: { business: any; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, color: C.text, padding: 'max(16px, env(safe-area-inset-top)) 16px max(40px, env(safe-area-inset-bottom))' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 2px' }}>
          {business?.logo_url && <img src={business.logo_url} alt="" style={{ height: 56, width: 'auto', maxWidth: 140, objectFit: 'contain', flexShrink: 0 }} />}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', overflowWrap: 'anywhere' }}>{business?.name || ''}</div>
            {business?.abn && <div style={{ fontSize: 12, color: C.text3, marginTop: 1 }}>ABN {business.abn}</div>}
          </div>
        </header>
        {children}
        <footer style={{ textAlign: 'center', fontSize: 12, color: C.text3, padding: '8px 0' }}>
          {business?.phone && (
            <div style={{ marginBottom: 4 }}>
              Questions? Call <a href={`tel:${String(business.phone).replace(/\s+/g, '')}`} style={{ color: C.tealDark, fontWeight: 700, textDecoration: 'none' }}>{business.phone}</a>
              {business?.email && <> or email <a href={`mailto:${business.email}`} style={{ color: C.tealDark, fontWeight: 700, textDecoration: 'none' }}>{business.email}</a></>}
            </div>
          )}
          <div>Sent with Jobyra</div>
        </footer>
      </div>
    </div>
  )
}

export function Notice({ tone, title, children }: { tone: 'good' | 'bad' | 'warn' | 'info'; title: string; children?: React.ReactNode }) {
  const t = {
    good: { bg: C.tealLight, bd: '#BFE7E3', fg: C.tealDark },
    bad: { bg: C.redLight, bd: '#FECACA', fg: C.red },
    warn: { bg: C.amberLight, bd: '#FDE68A', fg: C.amber },
    info: { bg: '#F8FAFC', bd: C.line, fg: C.text2 },
  }[tone]
  return (
    <div role="status" style={{ background: t.bg, border: `1px solid ${t.bd}`, borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: t.fg }}>{title}</div>
      {children && <div style={{ fontSize: 14, color: C.text2, marginTop: 4, lineHeight: 1.55, overflowWrap: 'anywhere' }}>{children}</div>}
    </div>
  )
}

export type DocLine = { description: string; qty: number; unit_price: number; badge?: string; muted?: boolean; checked?: boolean; onToggle?: () => void }

export function LinesTable({ lines }: { lines: DocLine[] }) {
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
      {lines.map((l, i) => (
        <div key={i} style={{ padding: '14px 16px', borderTop: i === 0 ? 'none' : `1px solid ${C.line}`, opacity: l.muted ? 0.55 : 1, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {l.onToggle && (
            <input type="checkbox" checked={!!l.checked} onChange={l.onToggle} aria-label={`Include ${l.description}`} style={{ width: 22, height: 22, marginTop: 1, accentColor: C.teal, flexShrink: 0, cursor: 'pointer' }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, overflowWrap: 'anywhere' }}>{l.description}</div>
            {l.badge && (
              <span style={{ display: 'inline-block', marginTop: 5, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: l.checked ? C.tealDark : C.text3, background: l.checked ? C.tealLight : '#F1F5F9', borderRadius: 6, padding: '2px 7px' }}>
                {l.badge}
              </span>
            )}
            <div style={{ fontSize: 13, color: C.text3, marginTop: 3 }}>
              {l.qty} × {money(l.unit_price)}
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, whiteSpace: 'nowrap' }}>{money(Number(l.qty) * Number(l.unit_price))}</div>
        </div>
      ))}
    </div>
  )
}

export function TotalsBlock({ rows, total, totalLabel = 'Total', foot }: { rows: [string, string][]; total: string; totalLabel?: string; foot?: [string, string, boolean?][] }) {
  return (
    <div style={{ marginLeft: 'auto', width: '100%', maxWidth: 320 }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
          <span style={{ color: C.text3 }}>{k}</span>
          <span style={{ fontWeight: 700 }}>{v}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: C.teal, borderRadius: 10, marginTop: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.white }}>{totalLabel}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: C.white }}>{total}</span>
      </div>
      {foot?.map(([k, v, strong]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 2px 0', fontSize: strong ? 16 : 14 }}>
          <span style={{ color: strong ? C.text : C.text3, fontWeight: strong ? 800 : 400 }}>{k}</span>
          <span style={{ fontWeight: strong ? 900 : 700, color: strong ? C.tealDark : C.text }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

export function BankCard({ title, payment, reference, terms }: { title: string; payment: any; reference: string; terms?: string }) {
  const rows: [string, string][] = [
    ['Bank', payment?.bank_name],
    ['Account name', payment?.account_name],
    ['BSB', payment?.bsb],
    ['Account number', payment?.account_number],
    ['Reference', reference],
  ].filter(([, v]) => v) as [string, string][]
  if (!(payment?.bsb || payment?.account_number)) return null
  return (
    <div style={{ background: '#F8FAFC', border: `1px solid ${C.line}`, borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ ...label, marginBottom: 10 }}>{title}</div>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderTop: `1px solid ${C.line}` }}>
          <span style={{ fontSize: 13, color: C.text3 }}>{k}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <b style={{ fontSize: 14, fontFamily: k === 'BSB' || k === 'Account number' || k === 'Reference' ? MONO : undefined, overflowWrap: 'anywhere', textAlign: 'right' }}>{v}</b>
            {(k === 'BSB' || k === 'Account number' || k === 'Reference') && <CopyButton text={String(v)} />}
          </span>
        </div>
      ))}
      {terms && <div style={{ fontSize: 13, color: C.text3, marginTop: 8 }}>{terms}</div>}
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        } catch {
          /* the value is on screen to copy by hand */
        }
      }}
      style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.tealDark, background: C.tealLight, border: '1px solid #BFE7E3', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}
    >
      {done ? 'Copied' : 'Copy'}
    </button>
  )
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.text2, background: C.white, border: `1px solid ${C.field}`, borderRadius: 10, height: 38, padding: '0 16px', cursor: 'pointer', alignSelf: 'center' }}>
      Print or save as PDF
    </button>
  )
}

export function LoadingCard({ text }: { text: string }) {
  return (
    <div style={{ ...card, padding: 28, textAlign: 'center', color: C.text3, fontSize: 14 }}>{text}</div>
  )
}
