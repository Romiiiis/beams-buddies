'use client'

import React, { useState } from 'react'

const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const WHITE = '#FFFFFF'
const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export type PipelineStage = {
  /** The status a lead gets when it is moved into this column. */
  key: string
  label: string
  color: string
  bg: string
  border: string
  /** Plain-English line under the column title. */
  hint?: string
  /** Other statuses that also live in this column (e.g. "didn't go ahead" covers two). */
  alsoHolds?: string[]
}

type Props = {
  leads: any[]
  stages: PipelineStage[]
  isMobile: boolean
  movingId: string | null
  statusLabels: Record<string, string>
  onOpen: (lead: any) => void
  onMove: (lead: any, status: string) => void
}

function formatBooking(lead: any) {
  if (!lead.preferred_date) return null
  const d = new Date(`${lead.preferred_date}T00:00:00`)
  const date = isNaN(d.getTime())
    ? lead.preferred_date
    : d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = lead.preferred_start_time ? String(lead.preferred_start_time).slice(0, 5) : ''
  return time ? `${date}, ${time}` : date
}

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  if (isNaN(diff)) return ''
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(mins, 1)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

/**
 * Simple board of enquiries: a few plain columns. On a computer, drag a card between columns.
 * On a phone, pick a column from the chips and use "Move to" on a card.
 */
export function LeadPipeline({ leads, stages, isMobile, movingId, statusLabels, onOpen, onMove }: Props) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<string | null>(null)
  const [activeStage, setActiveStage] = useState<string>(stages[0].key)

  const stageOf = (status: string) =>
    stages.find(s => s.key === status || s.alsoHolds?.includes(status))?.key ?? stages[0].key
  const byStage = (key: string) => leads.filter(l => stageOf(l.status) === key)

  function card(lead: any, stage: PipelineStage) {
    const booking = formatBooking(lead)
    const moving = movingId === lead.id
    const otherStatus = lead.status !== stage.key ? statusLabels[lead.status] : null
    return (
      <article
        key={lead.id}
        draggable={!isMobile && !moving}
        onDragStart={e => {
          e.dataTransfer.setData('text/plain', lead.id)
          e.dataTransfer.effectAllowed = 'move'
          setDragId(lead.id)
        }}
        onDragEnd={() => {
          setDragId(null)
          setOverStage(null)
        }}
        onClick={() => onOpen(lead)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen(lead)
          }
        }}
        role="button"
        tabIndex={0}
        style={{
          background: WHITE,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: isMobile ? '14px' : '12px 14px',
          cursor: isMobile ? 'pointer' : 'grab',
          opacity: dragId === lead.id || moving ? 0.5 : 1,
          fontFamily: FONT,
          outline: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: isMobile ? 16 : 14, fontWeight: 800, color: TEXT, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lead.customer_name || 'Unknown caller'}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: TEXT3, whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(lead.created_at)}</div>
        </div>

        {lead.phone_number && (
          <div style={{ marginTop: 3 }}>
            <a
              href={`tel:${lead.phone_number}`}
              onClick={e => e.stopPropagation()}
              style={{ fontSize: isMobile ? 14 : 13, fontWeight: 700, color: TEAL_DARK, textDecoration: 'none' }}
            >
              {lead.phone_number}
            </a>
            {lead.suburb && <span style={{ fontSize: isMobile ? 13 : 12, fontWeight: 500, color: TEXT3 }}> · {lead.suburb}</span>}
          </div>
        )}
        {!lead.phone_number && lead.suburb && <div style={{ fontSize: 12, fontWeight: 500, color: TEXT3, marginTop: 3 }}>{lead.suburb}</div>}

        {lead.issue_summary && (
          <div
            style={{
              fontSize: isMobile ? 14 : 13,
              fontWeight: 500,
              color: TEXT2,
              lineHeight: 1.45,
              marginTop: 8,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {lead.issue_summary}
          </div>
        )}

        {(booking || otherStatus) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {booking && (
              <span style={{ fontSize: 11, fontWeight: 800, color: '#1D4ED8', background: '#EFF6FF', borderRadius: 6, padding: '4px 8px' }}>
                Booked {booking}
              </span>
            )}
            {otherStatus && (
              <span style={{ fontSize: 11, fontWeight: 700, color: TEXT3, background: '#F1F5F9', borderRadius: 6, padding: '4px 8px' }}>{otherStatus}</span>
            )}
          </div>
        )}

        {isMobile && (
          <label
            onClick={e => e.stopPropagation()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${BORDER}` }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT3 }}>Move to</span>
            <select
              value={stageOf(lead.status)}
              disabled={moving}
              onChange={e => onMove(lead, e.target.value)}
              style={{
                flex: 1,
                height: 36,
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                background: WHITE,
                color: TEXT,
                fontSize: 16,
                fontFamily: FONT,
                padding: '0 8px',
              }}
            >
              {stages.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </label>
        )}
      </article>
    )
  }

  // ── Phone: pick a stage, then a plain list ──
  if (isMobile) {
    const stage = stages.find(s => s.key === activeStage) || stages[0]
    const items = byStage(stage.key)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          {stages.map(s => {
            const active = s.key === stage.key
            return (
              <button
                key={s.key}
                onClick={() => setActiveStage(s.key)}
                style={{
                  minWidth: 0,
                  height: 42,
                  padding: '0 12px',
                  borderRadius: 10,
                  border: `1.5px solid ${active ? TEAL : BORDER}`,
                  background: active ? TEAL_LIGHT : WHITE,
                  color: active ? TEAL_DARK : TEXT2,
                  fontFamily: FONT,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                <span style={{ fontWeight: 900 }}>{byStage(s.key).length}</span>
              </button>
            )
          })}
        </div>
        {stage.hint && <div style={{ fontSize: 13, fontWeight: 600, color: TEXT3 }}>{stage.hint}</div>}
        {items.length === 0 ? (
          <div style={{ border: `1px dashed #D5DCE4`, borderRadius: 12, padding: '28px 12px', textAlign: 'center', fontSize: 13, fontWeight: 500, color: TEXT3, background: WHITE }}>
            Nothing here
          </div>
        ) : (
          items.map(lead => card(lead, stage))
        )}
      </div>
    )
  }

  // ── Computer: a few columns, drag between them ──
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))`, gap: 12, alignItems: 'flex-start' }}>
      {stages.map(stage => {
        const items = byStage(stage.key)
        const isOver = overStage === stage.key && dragId !== null
        return (
          <section
            key={stage.key}
            aria-label={stage.label}
            onDragOver={e => {
              if (!dragId) return
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              if (overStage !== stage.key) setOverStage(stage.key)
            }}
            onDragLeave={e => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverStage(null)
            }}
            onDrop={e => {
              e.preventDefault()
              const id = e.dataTransfer.getData('text/plain') || dragId
              const lead = leads.find(l => l.id === id)
              setDragId(null)
              setOverStage(null)
              if (lead && stageOf(lead.status) !== stage.key) onMove(lead, stage.key)
            }}
            style={{
              background: isOver ? TEAL_LIGHT : '#F4F6F8',
              border: `1px solid ${isOver ? TEAL : BORDER}`,
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              transition: 'background 0.12s, border-color 0.12s',
            }}
          >
            <header style={{ padding: '12px 14px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: stage.color, flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, letterSpacing: '-0.01em' }}>{stage.label}</div>
                {stage.hint && <div style={{ fontSize: 12, fontWeight: 500, color: TEXT3, marginTop: 1 }}>{stage.hint}</div>}
              </div>
              <span style={{ minWidth: 26, height: 24, padding: '0 8px', borderRadius: 8, background: WHITE, border: `1px solid ${BORDER}`, fontSize: 12, fontWeight: 800, color: TEXT2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontVariantNumeric: 'tabular-nums' }}>
                {items.length}
              </span>
            </header>

            <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 72 }}>
              {items.length === 0 && (
                <div style={{ border: `1px dashed ${isOver ? TEAL : '#D5DCE4'}`, borderRadius: 10, padding: '18px 12px', textAlign: 'center', fontSize: 12, fontWeight: 500, color: TEXT3 }}>
                  Drop a card here
                </div>
              )}
              {items.map(lead => card(lead, stage))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
