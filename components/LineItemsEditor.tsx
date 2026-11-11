'use client'

import React from 'react'
import { Select } from '@/components/Select'
import { FIELD, FIELD_LINE, LINE, RED, TEAL, TEXT3, WHITE, FONT } from '@/components/forms'
import { type LineItem, type PriceItem } from '@/lib/documents'

type Props = {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
  isMobile: boolean
  placeholder: string
  /** Price list entries the user can drop in as a new line. */
  products?: PriceItem[]
  /** Quotes only: lets each line be marked as an optional extra the customer can tick. */
  allowOptional?: boolean
}

const HEAD: React.CSSProperties = { fontSize: 11, fontWeight: 800, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.04em' }

/** The line-items table used by both quotes and invoices. */
export function LineItemsEditor({ items, onChange, isMobile, placeholder, products = [], allowOptional = false }: Props) {
  const cols = allowOptional ? '1fr 70px 110px 64px 36px' : '1fr 70px 110px 36px'
  const heads = allowOptional ? ['Description', 'Qty', 'Unit $', 'Extra', ''] : ['Description', 'Qty', 'Unit $', '']
  const active = products.filter(p => p.active)

  function set(idx: number, patch: Partial<LineItem>) {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  function add(line?: LineItem) {
    const blank = items.length === 1 && !items[0].description.trim() && !items[0].unit_price
    onChange(line && blank ? [line] : [...items, line ?? { description: '', qty: 1, unit_price: 0 }])
  }

  function remove(idx: number) {
    onChange(items.length === 1 ? items : items.filter((_, i) => i !== idx))
  }

  function fromPriceList(id: string) {
    const p = active.find(x => x.id === id)
    if (!p) return
    add({ description: p.description ? `${p.name} - ${p.description}` : p.name, qty: 1, unit_price: Number(p.unit_price) || 0 })
  }

  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden', background: WHITE }}>
      {!isMobile && (
        <div style={{ display: 'grid', gridTemplateColumns: cols, background: '#F8FAFC', padding: '10px 12px', borderBottom: `1px solid ${LINE}` }}>
          {heads.map((h, i) => (
            <div key={i} style={{ ...HEAD, textAlign: allowOptional && h === 'Extra' ? 'center' : 'left' }}>{h}</div>
          ))}
        </div>
      )}

      {items.map((item, idx) => {
        const cell: React.CSSProperties = {
          ...FIELD,
          height: isMobile ? 42 : 34,
          border: isMobile ? `1px solid ${FIELD_LINE}` : 'none',
          background: isMobile ? WHITE : 'transparent',
          padding: isMobile ? '0 14px' : '0 8px',
        }
        const mini: React.CSSProperties = { display: isMobile ? 'block' : 'none', ...HEAD, letterSpacing: '0.4px', marginBottom: 4, fontWeight: 700 }
        return (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : cols,
              gap: isMobile ? 10 : 0,
              padding: isMobile ? 12 : '8px 12px',
              borderTop: idx === 0 ? 'none' : `1px solid ${LINE}`,
              alignItems: isMobile ? 'end' : 'center',
              background: item.optional ? '#F8FAFC' : WHITE,
            }}
          >
            <div style={{ gridColumn: isMobile ? '1 / -1' : undefined, minWidth: 0 }}>
              <input style={cell} value={item.description} onChange={e => set(idx, { description: e.target.value })} placeholder={placeholder} aria-label="Description" />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={mini}>Qty</label>
              <input type="number" style={cell} value={item.qty} onChange={e => set(idx, { qty: parseFloat(e.target.value) || 0 })} min="0" placeholder="Qty" aria-label="Quantity" />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={mini}>Unit price ($)</label>
              <input type="number" style={cell} value={item.unit_price} onChange={e => set(idx, { unit_price: parseFloat(e.target.value) || 0 })} placeholder="0.00" aria-label="Unit price" />
            </div>
            {allowOptional && (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center', gap: 8, fontSize: 13, fontWeight: 600, color: TEXT3, cursor: 'pointer', gridColumn: isMobile ? '1 / -1' : undefined, height: isMobile ? 36 : 34 }}>
                <input type="checkbox" checked={!!item.optional} onChange={e => set(idx, { optional: e.target.checked })} style={{ width: 18, height: 18, accentColor: TEAL }} aria-label="Optional extra" />
                {isMobile && 'Optional extra the customer can choose'}
              </label>
            )}
            <button
              type="button"
              onClick={() => remove(idx)}
              aria-label="Remove line"
              style={{ background: 'none', border: isMobile ? `1px solid ${LINE}` : 'none', borderRadius: isMobile ? 10 : 0, cursor: 'pointer', color: RED, fontSize: isMobile ? 14 : 18, fontFamily: FONT, fontWeight: 700, lineHeight: 1, height: isMobile ? 40 : 34, gridColumn: isMobile ? '1 / -1' : undefined }}
            >
              {isMobile ? 'Remove this line' : '×'}
            </button>
          </div>
        )
      })}

      <div style={{ padding: '10px 12px', borderTop: `1px solid ${LINE}`, background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => add()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEAL, fontSize: 13, fontFamily: FONT, fontWeight: 800, padding: 0 }}>
          + Add line
        </button>
        {active.length > 0 && (
          <div style={{ minWidth: 200, maxWidth: '100%' }}>
            <Select value="" onChange={e => fromPriceList(e.target.value)} style={{ ...FIELD, height: 34 }} aria-label="Add from price list">
              <option value="">Add from price list...</option>
              {active.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} · ${Number(p.unit_price).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}
