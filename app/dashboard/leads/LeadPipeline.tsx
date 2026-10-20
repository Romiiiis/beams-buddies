'use client'

import React, { useState } from 'react'

const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const WHITE = '#FFFFFF'
const TEAL = '#2AA198'
const TEAL_LIGHT = '#EBFAF7'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export type PipelineStage = {
  key: string
  label: string
  color: string
  bg: string
  border: string
  /** Shown under the column title, e.g. "Need follow-up". */
  hint?: string
}

type Props = {
  leads: any[]
  stages: PipelineStage[]
  isMobile: boolean
  movingId: string | null
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

/** Kanban board of leads by status. Drag between columns on desktop; "Move to" picker on phones. */
export function LeadPipeline({ leads, stages, isMobile, movingId, onOpen, onMove }: Props) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<string | null>(null)

  const known = new Set(stages.map(s => s.key))
  const byStage = (key: string) =>
    leads.filter(l => (known.has(l.status) ? l.status : stages[0].key) === key)

  return (
    <div
      style={{
        display: 'flex',
        gap: isMobile ? 10 : 12,
        overflowX: 'auto',
        // Bleed to the screen edge on phones so columns can be swiped past the padding
        margin: isMobile ? '0 -12px' : 0,
        padding: isMobile ? '0 12px 4px' : '0 0 4px',
        scrollSnapType: isMobile ? 'x mandatory' : undefined,
        WebkitOverflowScrolling: 'touch',
        alignItems: 'flex-start',
      }}
    >
      {stages.map(stage => {
        const items = byStage(stage.key)
        const isOver = overStage === stage.key && dragId !== null
        return (
          <section
            key={stage.key}
            aria-label={`${stage.label} leads`}
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
              if (lead && lead.status !== stage.key) onMove(lead, stage.key)
            }}
            style={{
              flex: isMobile ? '0 0 82%' : '1 0 230px',
              minWidth: isMobile ? undefined : 230,
              scrollSnapAlign: isMobile ? 'start' : undefined,
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
                <div style={{ fontSize: 13, fontWeight: 800, color: TEXT, letterSpacing: '-0.01em' }}>{stage.label}</div>
                {stage.hint && <div style={{ fontSize: 11, fontWeight: 500, color: TEXT3, marginTop: 1 }}>{stage.hint}</div>}
              </div>
              <span
                style={{
                  minWidth: 24,
                  height: 22,
                  padding: '0 7px',
                  borderRadius: 999,
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  fontSize: 11,
                  fontWeight: 800,
                  color: TEXT2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {items.length}
              </span>
            </header>

            <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 72 }}>
              {items.length === 0 && (
                <div
                  style={{
                    border: `1px dashed ${isOver ? TEAL : '#D5DCE4'}`,
                    borderRadius: 10,
                    padding: '18px 12px',
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: 500,
                    color: TEXT3,
                  }}
                >
                  {isMobile ? 'No leads here' : 'Drop a lead here'}
                </div>
              )}

              {items.map(lead => {
                const booking = formatBooking(lead)
                const moving = movingId === lead.id
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
                      borderRadius: 10,
                      padding: '11px 12px',
                      cursor: isMobile ? 'pointer' : 'grab',
                      opacity: dragId === lead.id || moving ? 0.5 : 1,
                      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                      fontFamily: FONT,
                      outline: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 750, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.customer_name || 'Unknown caller'}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: TEXT3, whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(lead.created_at)}</div>
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 500, color: TEXT3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {[lead.phone_number, lead.suburb].filter(Boolean).join(' · ') || 'No contact details'}
                    </div>

                    {lead.issue_summary && (
                      <div
                        style={{
                          fontSize: 12,
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

                    {(lead.job_type || booking) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 9, flexWrap: 'wrap' }}>
                        {lead.job_type && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: TEXT2,
                              background: '#F1F5F9',
                              borderRadius: 6,
                              padding: '3px 7px',
                              textTransform: 'capitalize',
                            }}
                          >
                            {String(lead.job_type).replace(/_/g, ' ')}
                          </span>
                        )}
                        {booking && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: stage.color, background: stage.bg, borderRadius: 6, padding: '3px 7px' }}>
                            {booking}
                          </span>
                        )}
                      </div>
                    )}

                    {isMobile && (
                      <label
                        onClick={e => e.stopPropagation()}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 9, borderTop: `1px solid ${BORDER}` }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 600, color: TEXT3 }}>Move to</span>
                        <select
                          value={known.has(lead.status) ? lead.status : stages[0].key}
                          disabled={moving}
                          onChange={e => onMove(lead, e.target.value)}
                          style={{
                            flex: 1,
                            height: 32,
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
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
