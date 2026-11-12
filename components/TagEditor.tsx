'use client'

import React, { useState } from 'react'

const LINE = '#E8EDF2'
const TEXT3 = '#64748B'

export const MAX_TAGS = 10

/** Trim, drop empties and repeats (ignoring case), cap the length and count. */
export function cleanTags(list: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of list) {
    const t = raw.trim().replace(/\s+/g, ' ').slice(0, 30)
    const k = t.toLowerCase()
    if (!t || seen.has(k)) continue
    seen.add(k)
    out.push(t)
    if (out.length >= MAX_TAGS) break
  }
  return out
}

/** Small chips for showing tags (plain grey, no colour). */
export function TagList({ tags }: { tags?: string[] | null }) {
  if (!tags || tags.length === 0) return <span style={{ color: TEXT3 }}>—</span>
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {tags.map(t => (
        <span key={t} style={{ fontSize: 12, fontWeight: 600, color: '#475569', background: '#F1F5F9', borderRadius: 8, padding: '3px 9px' }}>{t}</span>
      ))}
    </div>
  )
}

/** Type a tag and press Enter or comma to add it; tap × on a tag to remove it. */
export function TagEditor({ tags, onChange, inputStyle }: { tags: string[]; onChange: (tags: string[]) => void; inputStyle: React.CSSProperties }) {
  const [text, setText] = useState('')
  const add = () => {
    if (!text.trim()) return
    onChange(cleanTags([...tags, ...text.split(',')]))
    setText('')
  }
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tags.map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#475569', background: '#F1F5F9', borderRadius: 8, padding: '3px 4px 3px 9px' }}>
              {t}
              <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(tags.filter(x => x !== t))} style={{ border: 'none', background: 'transparent', color: TEXT3, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }}>×</button>
            </span>
          ))}
        </div>
      )}
      <input
        style={{ ...inputStyle, borderColor: LINE }}
        value={text}
        placeholder={tags.length >= MAX_TAGS ? 'Tag limit reached' : 'Add a tag, like landlord or commercial'}
        disabled={tags.length >= MAX_TAGS}
        onChange={e => setText(e.target.value)}
        onBlur={add}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add()
          }
        }}
      />
    </div>
  )
}
