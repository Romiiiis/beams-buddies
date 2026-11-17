'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { readCache, writeCache } from '@/lib/page-cache'

// A bell for the things a business owner should hear about: a customer says they have paid, a quote was answered, a
// customer booked online, a new enquiry. It reads straight from the data (no extra table). What counts as "new" is
// everything since you last looked, remembered on this device.

type Item = { id: string; at: number; title: string; sub: string; href: string; kind: 'paid' | 'quote' | 'booking' | 'lead' }

const TEXT = '#0B1220'
const MUTED = '#64748B'
const LINE = '#E3E8EE'
const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const DAYS = 14

const nm = (c: any) => [c?.first_name, c?.last_name].filter(Boolean).join(' ').trim() || 'A customer'
const money = (n: unknown) => `$${Number(n || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function ago(ms: number) {
  const m = Math.floor((Date.now() - ms) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hr ago`
  const d = Math.floor(h / 24)
  return d === 1 ? 'yesterday' : `${d} days ago`
}

async function loadItems(): Promise<Item[]> {
  const since = Date.now() - DAYS * 86400000
  const [paid, quotes, bookings, leads] = await Promise.all([
    supabase.from('invoices').select('id, invoice_number, total, amount_paid, payment_reported_at, customers(first_name, last_name)').not('payment_reported_at', 'is', null).neq('status', 'paid').order('payment_reported_at', { ascending: false }).limit(15),
    supabase.from('quotes').select('id, quote_number, status, responded_at, responded_name, customers(first_name, last_name)').not('responded_at', 'is', null).order('responded_at', { ascending: false }).limit(10),
    supabase.from('job_visits').select('id, start_at, created_at, customers(first_name, last_name)').eq('notes', 'Booked online by the customer').order('created_at', { ascending: false }).limit(10),
    supabase.from('leads').select('id, customer_name, created_at, job_type').eq('status', 'pending').order('created_at', { ascending: false }).limit(10),
  ])
  const out: Item[] = []
  for (const i of (paid.data as any[]) || []) {
    const at = new Date(i.payment_reported_at).getTime()
    out.push({ id: `paid:${i.id}`, at, kind: 'paid', title: `${nm(i.customers)} says they have paid`, sub: `${i.invoice_number} · ${money(Math.max(0, Number(i.total) - Number(i.amount_paid || 0)))} · ${ago(at)}`, href: '/dashboard/invoices' })
  }
  for (const q of (quotes.data as any[]) || []) {
    const at = new Date(q.responded_at).getTime()
    const verb = q.status === 'accepted' ? 'accepted' : q.status === 'declined' ? 'declined' : 'replied to'
    out.push({ id: `quote:${q.id}:${q.status}`, at, kind: 'quote', title: `${q.responded_name || nm(q.customers)} ${verb} quote ${q.quote_number}`, sub: ago(at), href: '/dashboard/quotes' })
  }
  for (const v of (bookings.data as any[]) || []) {
    const at = new Date(v.created_at).getTime()
    const when = new Date(v.start_at).toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).replace(',', '')
    out.push({ id: `booking:${v.id}`, at, kind: 'booking', title: `${nm(v.customers)} booked online`, sub: `${when} · ${ago(at)}`, href: '/dashboard/calendar' })
  }
  for (const l of (leads.data as any[]) || []) {
    const at = new Date(l.created_at).getTime()
    out.push({ id: `lead:${l.id}`, at, kind: 'lead', title: `New enquiry from ${l.customer_name || 'a caller'}`, sub: `To call back · ${ago(at)}`, href: '/dashboard/leads' })
  }
  return out.filter(x => x.at >= since).sort((a, b) => b.at - a.at)
}

export function NotificationBell() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(0)
  const uid = useRef('')
  const box = useRef<HTMLDivElement>(null)

  const refresh = useCallback(async () => {
    const list = await loadItems().catch(() => null)
    if (!list) return
    setItems(list)
    if (uid.current) writeCache('notifications', uid.current, list)
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      uid.current = session.user.id
      try {
        const raw = localStorage.getItem(`jobyra_notif_seen_${uid.current}`)
        setSeen(raw ? Number(raw) : Date.now() - 3 * 86400000)
      } catch { setSeen(Date.now() - 3 * 86400000) }
      const cached = readCache<Item[]>('notifications', uid.current)
      if (cached) setItems(cached)
      refresh()
      timer = setInterval(() => { if (document.visibilityState === 'visible') refresh() }, 60000)
    })()
    return () => clearInterval(timer)
  }, [refresh])

  const markRead = useCallback(() => {
    const t = Math.max(Date.now(), ...items.map(i => i.at))
    setSeen(t)
    try { localStorage.setItem(`jobyra_notif_seen_${uid.current}`, String(t)) } catch {}
  }, [items])

  const close = useCallback(() => { setOpen(false); markRead() }, [markRead])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent | TouchEvent) => { if (box.current && !box.current.contains(e.target as Node)) close() }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('touchstart', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, close])

  const unread = items.filter(i => i.at > seen).length

  return (
    <div ref={box} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        aria-label={unread ? `Notifications, ${unread} new` : 'Notifications'}
        aria-expanded={open}
        onClick={() => { if (open) close(); else { setOpen(true); refresh() } }}
        style={{ position: 'relative', width: 44, height: 44, borderRadius: 13, border: `1px solid ${LINE}`, background: '#FFFFFF', color: TEXT, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 20px -12px rgba(15, 23, 42, 0.18)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 1112 0c0 5 2 6.5 2 6.5H4S6 14 6 9z" /><path d="M10 19a2 2 0 004 0" /></svg>
        {unread > 0 && (
          <span aria-hidden="true" style={{ position: 'absolute', top: -5, right: -5, minWidth: 19, height: 19, padding: '0 5px', borderRadius: 999, background: TEAL_DARK, color: '#FFFFFF', fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FAFAFA', boxSizing: 'content-box' }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Notifications" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 'min(380px, calc(100vw - 28px))', maxHeight: '70vh', overflowY: 'auto', background: '#FFFFFF', border: `1px solid ${LINE}`, borderRadius: 18, boxShadow: '0 16px 48px rgba(15, 23, 42, 0.16)', zIndex: 300 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', position: 'sticky', top: 0, background: '#FFFFFF', borderBottom: `1px solid ${LINE}` }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>Notifications</div>
            {unread > 0 && <button type="button" onClick={markRead} style={{ border: 'none', background: 'none', color: TEAL_DARK, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Mark all read</button>}
          </div>
          {items.length === 0 ? (
            <div style={{ padding: '26px 16px', textAlign: 'center', color: MUTED, fontSize: 14, lineHeight: 1.5 }}>You are all caught up. New payments, quote replies, online bookings and enquiries will show here.</div>
          ) : (
            items.map(i => (
              <button key={i.id} type="button" onClick={() => { close(); router.push(i.href) }} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', textAlign: 'left', padding: '13px 16px', border: 'none', borderTop: `1px solid ${LINE}`, background: i.at > seen ? '#F6FBFA' : '#FFFFFF', cursor: 'pointer', fontFamily: 'inherit' }}>
                <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: i.at > seen ? TEAL : 'transparent', marginTop: 6, flexShrink: 0 }} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>{i.title}</span>
                  <span style={{ display: 'block', fontSize: 12.5, color: MUTED, marginTop: 2 }}>{i.sub}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
