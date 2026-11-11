'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Select } from '@/components/Select'
import { money } from '@/lib/format'
import { BTN, BTN_SM, LINE, RED, TEAL, TEAL_DARK, TEXT, TEXT2, TEXT3, WHITE } from '@/components/forms'
import { type Expense, categoryLabel, exGst } from '@/lib/expenses'
import { BILLED_STATUSES, jobCosting } from '@/lib/job-costing'
import { JobCostModal } from './JobCostModal'

type Inv = { id: string; invoice_number: string; status: string; subtotal: number; total: number }
type VisitRow = { start_at: string; end_at: string; status: string; staff_id: string | null }

const COLUMNS = 'id, business_id, spent_on, description, supplier, category, amount, gst, job_id, created_at'
const INV_COLUMNS = 'id, invoice_number, status, subtotal, total'
const STATUS_WORD: Record<string, string> = { draft: 'Draft', sent: 'Sent', paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled' }

const tile: React.CSSProperties = { background: '#FCFCFD', border: `1px solid ${LINE}`, borderRadius: 10, padding: '10px 12px', minWidth: 0 }
const tileLabel: React.CSSProperties = { fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT3, marginBottom: 5 }
const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13 }
const dayText = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

/**
 * "Did this job make money?" Billed invoices (without GST), less what was spent on it and the time of the
 * technicians who worked on it. Sits in the job panel; nothing about invoices themselves changes.
 */
export function JobCosts({ job, isMobile }: { job: any; isMobile: boolean }) {
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Inv[]>([])
  const [spare, setSpare] = useState<Inv[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [visits, setVisits] = useState<VisitRow[]>([])
  const [rates, setRates] = useState<Map<string, number>>(new Map())
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      supabase.from('invoices').select(INV_COLUMNS).eq('job_id', job.id).order('created_at'),
      job.customer_id
        ? supabase.from('invoices').select(INV_COLUMNS).eq('customer_id', job.customer_id).is('job_id', null).neq('status', 'cancelled').order('created_at', { ascending: false })
        : Promise.resolve({ data: [] as Inv[], error: null }),
      supabase.from('expenses').select(COLUMNS).eq('job_id', job.id).order('spent_on', { ascending: false }),
      supabase.from('job_visits').select('start_at, end_at, status, staff_id').eq('job_id', job.id).eq('status', 'completed'),
      supabase.from('staff_members').select('id, hourly_cost').eq('business_id', job.business_id),
    ]).then(([inv, sp, ex, vi, st]) => {
      if (cancelled) return
      if (inv.error || ex.error) setError('Some figures could not be loaded.')
      setInvoices((inv.data as unknown as Inv[]) || [])
      setSpare((sp.data as unknown as Inv[]) || [])
      setExpenses((ex.data as unknown as Expense[]) || [])
      setVisits((vi.data as unknown as VisitRow[]) || [])
      setRates(new Map(((st.data as { id: string; hourly_cost: number | null }[]) || []).filter(s => Number(s.hourly_cost) > 0).map(s => [s.id, Number(s.hourly_cost)])))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [job.id, job.customer_id, job.business_id])

  const result = useMemo(() => jobCosting({ invoices, expenses, visits, hourlyCost: rates }), [invoices, expenses, visits, rates])

  async function link(id: string) {
    const inv = spare.find(i => i.id === id)
    if (!inv) return
    setBusy(true)
    setError('')
    const { error: err } = await supabase.from('invoices').update({ job_id: job.id }).eq('id', id)
    setBusy(false)
    if (err) return setError('Could not add that invoice to the job.')
    setSpare(prev => prev.filter(i => i.id !== id))
    setInvoices(prev => [...prev, inv])
  }

  async function unlink(inv: Inv) {
    setBusy(true)
    setError('')
    const { error: err } = await supabase.from('invoices').update({ job_id: null }).eq('id', inv.id)
    setBusy(false)
    if (err) return setError('Could not take that invoice off the job.')
    setInvoices(prev => prev.filter(i => i.id !== inv.id))
    setSpare(prev => [inv, ...prev])
  }

  function saved(e: Expense) {
    setExpenses(prev => {
      const rest = prev.filter(x => x.id !== e.id)
      return e.job_id === job.id ? [e, ...rest].sort((a, b) => (a.spent_on < b.spent_on ? 1 : -1)) : rest
    })
    setAdding(false)
    setEditing(null)
  }

  const profitColour = result.profit < 0 ? RED : TEAL_DARK
  const empty = invoices.length === 0 && expenses.length === 0 && visits.length === 0

  return (
    <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 14, overflow: 'hidden', padding: 16, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 4, height: 34, borderRadius: 999, background: TEAL, flexShrink: 0 }} />
        <div style={{ fontSize: 14, fontWeight: 900, color: TEXT, flex: 1 }}>Job profit</div>
        <button type="button" onClick={() => setAdding(true)} style={{ ...BTN.secondary, ...BTN_SM }}>Add a cost</button>
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: TEXT3 }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={tile}>
              <div style={tileLabel}>Profit</div>
              <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 900, letterSpacing: '-0.04em', color: empty ? TEXT3 : profitColour }}>{money(result.profit)}</div>
            </div>
            <div style={tile}>
              <div style={tileLabel}>Margin</div>
              <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 900, letterSpacing: '-0.04em', color: result.margin === null ? TEXT3 : profitColour }}>{result.margin === null ? '-' : `${result.margin}%`}</div>
            </div>
          </div>

          {empty && <div style={{ fontSize: 12, color: TEXT3, lineHeight: 1.5 }}>Nothing billed or spent on this job yet. Add a cost, and add the invoices you sent for it, to see if it made money.</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={rowStyle}>
              <span style={{ fontWeight: 800, color: TEXT }}>Billed, without GST</span>
              <span style={{ fontWeight: 800, color: TEXT }}>{money(result.income)}</span>
            </div>
            {invoices.map(inv => {
              const counts = BILLED_STATUSES.includes(inv.status)
              return (
                <div key={inv.id} style={{ ...rowStyle, color: counts ? TEXT2 : TEXT3, paddingLeft: 10, alignItems: 'flex-start' }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', overflowWrap: 'anywhere' }}>
                      {inv.invoice_number} · {STATUS_WORD[inv.status] || inv.status}
                    </span>
                    {!counts && <span style={{ display: 'block', fontSize: 11, color: TEXT3, marginTop: 1 }}>Not counted until it is sent</span>}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {money(inv.subtotal)}
                    <button type="button" onClick={() => unlink(inv)} disabled={busy} style={{ background: 'none', border: 'none', padding: 0, color: TEXT3, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Take off
                    </button>
                  </span>
                </div>
              )
            })}
            {spare.length > 0 && (
              <Select value="" onChange={e => e.target.value && link(e.target.value)} disabled={busy} style={{ height: 36, width: '100%' }} aria-label="Add an invoice to this job">
                <option value="">Add an invoice to this job...</option>
                {spare.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.invoice_number} · {money(i.total)} · {STATUS_WORD[i.status] || i.status}
                  </option>
                ))}
              </Select>
            )}
            {invoices.length === 0 && spare.length === 0 && <div style={{ fontSize: 12, color: TEXT3, paddingLeft: 10 }}>No invoices for this customer to add yet.</div>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={rowStyle}>
              <span style={{ fontWeight: 800, color: TEXT }}>Costs, without GST</span>
              <span style={{ fontWeight: 800, color: TEXT }}>{money(result.cost)}</span>
            </div>
            <div style={{ ...rowStyle, color: TEXT2, paddingLeft: 10 }}>
              <span>Materials and other</span>
              <span>{money(result.expenses)}</span>
            </div>
            <div style={{ ...rowStyle, color: TEXT2, paddingLeft: 10 }}>
              <span>Labour{result.hours > 0 ? ` · ${result.hours} h on finished visits` : ''}</span>
              <span>{money(result.labour)}</span>
            </div>
            {result.unvaluedHours > 0 && (
              <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5, paddingLeft: 10 }}>
                {result.unvaluedHours} h were not counted because no cost per hour is set for the technician. Add it under Team on the Calendar page.
              </div>
            )}
          </div>

          {expenses.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ ...tileLabel, marginBottom: 4 }}>Spent on this job</div>
              {expenses.map(e => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setEditing(e)}
                  style={{ ...rowStyle, width: '100%', textAlign: 'left', background: '#FCFCFD', border: `1px solid ${LINE}`, borderRadius: 10, padding: '9px 12px', cursor: 'pointer', fontFamily: 'inherit', color: TEXT2 }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</span>
                    <span style={{ display: 'block', fontSize: 12, color: TEXT3, marginTop: 1 }}>
                      {dayText(e.spent_on)} · {categoryLabel(e.category)}
                    </span>
                  </span>
                  <span style={{ fontWeight: 800, color: TEXT, flexShrink: 0 }}>{money(exGst(e))}</span>
                </button>
              ))}
              <div style={{ fontSize: 11, color: TEXT3, lineHeight: 1.5 }}>Shown without GST. Tap one to change it.</div>
            </div>
          )}

          {error && <div style={{ fontSize: 12, color: RED }}>{error}</div>}
        </div>
      )}

      {(adding || editing) && (
        <JobCostModal
          key={editing?.id || 'new'}
          businessId={job.business_id}
          jobId={job.id}
          cost={editing}
          layer={400}
          onClose={() => {
            setAdding(false)
            setEditing(null)
          }}
          onSaved={saved}
          onDeleted={id => {
            setExpenses(prev => prev.filter(x => x.id !== id))
            setAdding(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
