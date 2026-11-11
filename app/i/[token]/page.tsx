'use client'

import React, { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { money } from '@/lib/format'
import { localDate, methodLabel, shortDate, type LineItem } from '@/lib/documents'
import { BankCard, C, LinesTable, LoadingCard, Notice, PrintButton, PublicShell, TotalsBlock, card, label } from '@/components/PublicDoc'

type Data = {
  business: any
  payment: any
  customer: { first_name: string | null; last_name: string | null }
  invoice: {
    invoice_number: string
    status: string
    line_items: LineItem[]
    subtotal: number
    tax_rate: number
    tax_amount: number
    total: number
    amount_paid: number
    notes: string | null
    due_date: string | null
    created_at: string
    paid_at: string | null
  }
  payments: { amount: number; paid_on: string; method: string }[]
}

export default function PublicInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [data, setData] = useState<Data | null>(null)
  const [state, setState] = useState<'loading' | 'missing' | 'ready'>('loading')

  useEffect(() => {
    let alive = true
    supabase.rpc('get_public_invoice', { p_token: token }).then(({ data: res, error }) => {
      if (!alive) return
      if (error || !res) {
        setState('missing')
        return
      }
      setData(res as Data)
      setState('ready')
    })
    return () => {
      alive = false
    }
  }, [token])

  useEffect(() => {
    if (data) document.title = `Invoice ${data.invoice.invoice_number} | ${data.business?.name || ''}`
  }, [data])

  if (state === 'loading') {
    return (
      <PublicShell business={null}>
        <LoadingCard text="Loading your invoice..." />
      </PublicShell>
    )
  }
  if (state === 'missing' || !data) {
    return (
      <PublicShell business={null}>
        <Notice tone="info" title="This invoice isn’t available">
          The link may be incomplete, or the invoice has been withdrawn. Please contact the business that sent it.
        </Notice>
      </PublicShell>
    )
  }

  const { business, payment, customer, invoice: inv, payments } = data
  const total = Number(inv.total) || 0
  const paid = Number(inv.amount_paid) || 0
  const due = Math.max(0, Math.round((total - paid) * 100) / 100)
  const today = new Date()
  const dueDate = localDate(inv.due_date)
  const isPaid = inv.status === 'paid'
  const cancelled = inv.status === 'cancelled'
  const late = !isPaid && !cancelled && (inv.status === 'overdue' || (!!dueDate && dueDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())))
  const name = `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim()
  const terms = Number(payment?.payment_terms) > 0 ? `Payment terms: due within ${payment.payment_terms} days.` : undefined

  return (
    <PublicShell business={business}>
      <style>{`@media print { .no-print { display: none !important; } body { background: #fff !important; } }`}</style>

      {isPaid && (
        <Notice tone="good" title="Paid in full. Thank you">
          {inv.paid_at ? `Payment completed on ${shortDate(inv.paid_at)}.` : 'No payment is needed.'}
        </Notice>
      )}
      {cancelled && <Notice tone="info" title="This invoice was cancelled">No payment is needed. Contact {business?.name} if you have questions.</Notice>}
      {late && <Notice tone="warn" title="This invoice is overdue">{inv.due_date ? `It was due ${shortDate(inv.due_date)}. ` : ''}Please pay as soon as you can, or contact {business?.name} if there is a problem.</Notice>}
      {!isPaid && !cancelled && !late && paid > 0 && <Notice tone="info" title={`Part paid: ${money(due)} still to pay`}>Thank you for the payment of {money(paid)} so far.</Notice>}

      <div style={{ ...card, padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={label}>Invoice for</div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', marginTop: 4 }}>{name || 'You'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{inv.invoice_number}</div>
            <div style={{ fontSize: 13, color: C.text3, marginTop: 3 }}>Issued {shortDate(inv.created_at)}</div>
            {inv.due_date && <div style={{ fontSize: 13, color: late ? C.red : C.text3, fontWeight: late ? 700 : 400, marginTop: 1 }}>Due {shortDate(inv.due_date)}</div>}
          </div>
        </div>

        <LinesTable lines={(inv.line_items || []).map(i => ({ description: i.description, qty: i.qty, unit_price: i.unit_price }))} />

        <TotalsBlock
          rows={[['Subtotal', money(inv.subtotal)], [`GST (${inv.tax_rate}%)`, money(inv.tax_amount)]]}
          total={money(total)}
          foot={[
            ...(paid > 0 ? ([['Paid so far', `-${money(paid)}`]] as [string, string][]) : []),
            [isPaid ? 'Balance' : 'Amount due', money(isPaid ? 0 : due), true],
          ]}
        />

        {payments.length > 0 && (
          <div>
            <div style={{ ...label, marginBottom: 6 }}>Payments received</div>
            {payments.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderTop: `1px solid ${C.line}`, fontSize: 14 }}>
                <span style={{ color: C.text2 }}>
                  {shortDate(p.paid_on)} · {methodLabel(p.method)}
                </span>
                <b>{money(p.amount)}</b>
              </div>
            ))}
          </div>
        )}

        {inv.notes && (
          <div>
            <div style={{ ...label, marginBottom: 6 }}>Notes</div>
            <div style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{inv.notes}</div>
          </div>
        )}
        {payment?.invoice_notes && <div style={{ fontSize: 13, color: C.text3, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{payment.invoice_notes}</div>}
      </div>

      {!isPaid && !cancelled && <BankCard title="How to pay" payment={payment} reference={inv.invoice_number} terms={terms} />}

      <div className="no-print" style={{ display: 'flex', justifyContent: 'center' }}>
        <PrintButton />
      </div>
    </PublicShell>
  )
}
