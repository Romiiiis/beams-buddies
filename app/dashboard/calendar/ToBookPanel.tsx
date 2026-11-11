'use client'

import React, { useMemo, useState } from 'react'
import { BTN, BTN_SM, TEAL_DARK } from '@/components/forms'
import { DataList, PersonCell, StatusPill, TextCell } from '@/components/DataList'
import { type VisitKind, VISIT_KINDS, customerName, durationLabel } from '@/lib/schedule'
import type { VisitPrefill } from './VisitModal'

export type ToBookRow = {
  id: string
  customer_id: string | null
  job_id: string | null
  staff_id: string | null
  title: string
  kind: VisitKind
  duration_minutes: number
  notes: string | null
  customers?: { first_name?: string | null; last_name?: string | null; suburb?: string | null } | null
}

export type DueService = { jobId: string; customerId: string; name: string; equipment: string; days: number }

type Props = {
  items: ToBookRow[]
  due: DueService[]
  isMobile: boolean
  onBook: (prefill: VisitPrefill) => void
  onRemove: (row: ToBookRow) => void
}

type Row = {
  id: string
  source: 'waiting' | 'due'
  name: string
  sub: string
  type: string
  length: string
  status: { label: string; tone: 'neutral' | 'warn' | 'danger' }
  book: () => void
  remove?: () => void
}

const kindLabel = (k: VisitKind) => VISIT_KINDS.find(x => x.value === k)?.label || 'Visit'
const FIRST_SHOWN = 5

/** Work that needs a time but does not have one yet, plus equipment whose service is due and has no visit booked. */
export function ToBookPanel({ items, due, isMobile, onBook, onRemove }: Props) {
  const [tab, setTab] = useState('all')
  const [showAll, setShowAll] = useState(false)

  const rows = useMemo<Row[]>(() => {
    const waiting: Row[] = items.map(r => {
      const label = kindLabel(r.kind)
      return {
        id: `w:${r.id}`,
        source: 'waiting',
        name: customerName(r.customers) || r.title,
        sub: [r.title !== label ? r.title : '', r.customers?.suburb || ''].filter(Boolean).join(' · ') || 'Waiting for a time',
        type: label,
        length: durationLabel(r.duration_minutes),
        status: { label: 'Needs a time', tone: 'neutral' },
        book: () => onBook({ customerId: r.customer_id || undefined, jobId: r.job_id || undefined, staffId: r.staff_id, title: r.title === label ? '' : r.title, kind: r.kind, notes: r.notes || '', duration: r.duration_minutes, toBookId: r.id }),
        remove: () => onRemove(r),
      }
    })
    const service: Row[] = due.map(d => ({
      id: `d:${d.jobId}`,
      source: 'due',
      name: d.name,
      sub: d.equipment,
      type: 'Service',
      length: '-',
      status: d.days < 0 ? { label: `${-d.days} day${d.days === -1 ? '' : 's'} overdue`, tone: 'danger' } : d.days === 0 ? { label: 'Due today', tone: 'warn' } : { label: `Due in ${d.days} day${d.days === 1 ? '' : 's'}`, tone: 'warn' },
      book: () => onBook({ customerId: d.customerId, jobId: d.jobId, kind: 'service' }),
    }))
    return [...waiting, ...service]
  }, [items, due, onBook, onRemove])

  if (rows.length === 0) return null

  const filtered = tab === 'all' ? rows : rows.filter(r => r.source === tab)
  const shown = showAll ? filtered : filtered.slice(0, FIRST_SHOWN)
  const tabs = [
    { value: 'all', label: 'All', count: rows.length },
    { value: 'waiting', label: 'Needs a time', count: items.length },
    { value: 'due', label: 'Service due', count: due.length },
  ]

  return (
    <>
      <DataList<Row>
        title="To be booked"
        isMobile={isMobile}
        rows={shown}
        rowKey={r => r.id}
        emptyText="Nothing to book."
        onRowClick={r => r.book()}
        rowActions={r => (r.remove ? [{ label: 'Remove from the list', danger: true, onClick: row => row.remove?.() }] : [])}
        tabs={tabs}
        activeTab={tab}
        onTabChange={t => {
          setTab(t)
          setShowAll(false)
        }}
        columns={[
          { key: 'who', label: 'Customer', width: 'minmax(0,1.5fr)', render: r => <PersonCell name={r.name} sub={r.sub} /> },
          { key: 'type', label: 'Type', width: '120px', mobileLabel: 'Type', render: r => <TextCell>{r.type}</TextCell> },
          { key: 'length', label: 'Length', width: '90px', mobileLabel: 'Length', render: r => <TextCell>{r.length}</TextCell> },
          { key: 'status', label: 'Status', width: '150px', mobileHeader: true, render: r => <StatusPill label={r.status.label} tone={r.status.tone} /> },
          {
            key: 'book',
            label: '',
            width: '84px',
            mobileFull: true,
            render: r => (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  r.book()
                }}
                style={{ ...BTN.primary, ...BTN_SM, ...(isMobile ? { width: '100%' } : {}) }}
              >
                Book
              </button>
            ),
          },
        ]}
      />
      {filtered.length > FIRST_SHOWN && (
        <button type="button" onClick={() => setShowAll(s => !s)} style={{ alignSelf: 'center', background: 'none', border: 'none', color: TEAL_DARK, fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer', padding: 6, marginTop: -6 }}>
          {showAll ? 'Show fewer' : `Show all ${filtered.length}`}
        </button>
      )}
    </>
  )
}
