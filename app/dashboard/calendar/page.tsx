'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserRow } from '@/lib/session'
import { Sidebar } from '@/components/Sidebar'
import { PageSkeleton } from '@/components/Skeleton'
import { StatStrip } from '@/components/StatStrip'
import { HeaderToolbar } from '@/components/HeaderToolbar'
import { Select } from '@/components/Select'
import { BTN, BTN_SM, FONT, LINE, TEXT, TEXT3, Toast, WHITE } from '@/components/forms'
import {
  VISIT_KINDS,
  VISIT_STATUS,
  type StaffMember,
  type Visit,
  addDays,
  customerAddress,
  customerName,
  fmtDay,
  fmtRange,
  fmtTime,
  initialsOf,
  sameDay,
  startOfDay,
  startOfWeek,
} from '@/lib/schedule'
import { Agenda } from './Agenda'
import { TimeGrid, type GridColumn, type GridVisit } from './TimeGrid'
import { VisitModal } from './VisitModal'
import { TeamModal } from './TeamModal'

const BG = '#FAFAFA'
const UNASSIGNED = '#94A3B8'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

const card: React.CSSProperties = { background: WHITE, border: `1px solid ${LINE}`, borderRadius: 14, overflow: 'hidden' }

export default function CalendarPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState('')
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [counts, setCounts] = useState({ today: 0, week: 0, unassigned: 0 })
  const [view, setView] = useState<'day' | 'week'>('day')
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()))
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState<Visit | null>(null)
  const [creating, setCreating] = useState<{ date: Date; staffId: string | null } | null>(null)
  // Opened from a quote: ?new=1&customer=<id>&title=...&notes=... starts a visit for that customer.
  const [prefill, setPrefill] = useState<{ customerId?: string; title?: string; notes?: string } | undefined>(undefined)
  const [showTeam, setShowTeam] = useState(false)
  const [toast, setToast] = useState('')
  const [tick, setTick] = useState(0)

  // The days on screen: one day, or the week around it (phones always show the week strip)
  const weekStart = startOfWeek(anchor)
  const rangeStart = view === 'week' || isMobile ? weekStart : anchor
  const rangeEnd = view === 'week' || isMobile ? addDays(weekStart, 7) : addDays(anchor, 1)
  const rangeKey = `${rangeStart.getTime()}-${rangeEnd.getTime()}`

  // Who and what we can schedule
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data: u } = await getUserRow(session.user.id)
      if (!u?.business_id) {
        setLoading(false)
        return
      }
      setBusinessId(u.business_id)
      const [st, cu, jb] = await Promise.all([
        supabase.from('staff_members').select('*').eq('business_id', u.business_id).order('created_at'),
        supabase.from('customers').select('id, first_name, last_name, suburb').eq('business_id', u.business_id).order('first_name'),
        supabase.from('jobs').select('id, customer_id, brand, model, equipment_type').eq('business_id', u.business_id),
      ])
      setStaff((st.data as StaffMember[]) || [])
      setCustomers(cu.data || [])
      setJobs(jb.data || [])
      setLoading(false)
      const q = new URLSearchParams(window.location.search)
      if (q.get('team') === '1') setShowTeam(true)
      if (q.get('new') === '1') {
        const customerId = q.get('customer') || undefined
        setPrefill({ customerId: customerId && (cu.data || []).some((c: any) => c.id === customerId) ? customerId : undefined, title: q.get('title') || undefined, notes: q.get('notes') || undefined })
        const when = new Date()
        when.setDate(when.getDate() + 1)
        when.setHours(9, 0, 0, 0)
        setCreating({ date: when, staffId: null })
      }
    }
    init()
  }, [router])

  const reloadStaff = useCallback(async () => {
    if (!businessId) return
    const { data } = await supabase.from('staff_members').select('*').eq('business_id', businessId).order('created_at')
    setStaff((data as StaffMember[]) || [])
  }, [businessId])

  // Visits on screen
  useEffect(() => {
    if (!businessId) return
    let cancelled = false
    supabase
      .from('job_visits')
      .select('*, customers(first_name, last_name, phone, address, suburb, state, postcode), jobs(brand, model, equipment_type)')
      .eq('business_id', businessId)
      .gte('start_at', rangeStart.toISOString())
      .lt('start_at', rangeEnd.toISOString())
      .order('start_at')
      .then(({ data }) => {
        if (!cancelled) setVisits((data as unknown as Visit[]) || [])
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, rangeKey, tick])

  // Numbers for the strip
  useEffect(() => {
    if (!businessId) return
    const today = startOfDay(new Date())
    const head = () => supabase.from('job_visits').select('id', { count: 'exact', head: true }).eq('business_id', businessId).neq('status', 'cancelled')
    Promise.all([
      head().gte('start_at', today.toISOString()).lt('start_at', addDays(today, 1).toISOString()),
      head().gte('start_at', startOfWeek(today).toISOString()).lt('start_at', addDays(startOfWeek(today), 7).toISOString()),
      head().is('staff_id', null).not('status', 'in', '(completed)').gte('start_at', today.toISOString()),
    ]).then(([a, b, c]) => setCounts({ today: a.count || 0, week: b.count || 0, unassigned: c.count || 0 }))
  }, [businessId, tick])

  const activeStaff = staff.filter(s => s.active)
  const staffById = useMemo(() => new Map(staff.map(s => [s.id, s])), [staff])

  const view_: GridVisit[] = useMemo(
    () =>
      visits.map(v => {
        const s = v.staff_id ? staffById.get(v.staff_id) : undefined
        return { v, colour: s?.colour || UNASSIGNED, staffName: s?.name || null, customer: customerName(v.customers) }
      }),
    [visits, staffById]
  )

  const matchesFilter = (v: Visit) => filter === 'all' || (filter === 'unassigned' ? !v.staff_id : v.staff_id === filter)

  function done(message: string) {
    setEditing(null)
    setCreating(null)
    setToast(message)
    setTick(t => t + 1)
  }

  const today = startOfDay(new Date())

  // ── Desktop columns ──
  const columns: GridColumn[] = useMemo(() => {
    if (view === 'week') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = addDays(weekStart, i)
        return {
          key: d.toISOString(),
          title: d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' }),
          subtitle: d.toLocaleDateString('en-AU', { month: 'short' }),
          date: d,
          today: sameDay(d, today),
        }
      })
    }
    const dayVisits = visits.filter(v => sameDay(new Date(v.start_at), anchor))
    const cols: GridColumn[] = []
    const shown = filter === 'all' ? activeStaff : filter === 'unassigned' ? [] : staff.filter(s => s.id === filter)
    shown.forEach(s => cols.push({ key: s.id, title: s.name, subtitle: s.phone || undefined, date: anchor, staffId: s.id, accent: s.colour, today: sameDay(anchor, today) }))
    // Someone who has left may still have visits that day
    if (filter === 'all') {
      const ids = new Set(cols.map(c => c.staffId))
      staff.filter(s => !s.active && !ids.has(s.id) && dayVisits.some(v => v.staff_id === s.id)).forEach(s =>
        cols.push({ key: s.id, title: `${s.name} (left)`, date: anchor, staffId: s.id, accent: s.colour, today: sameDay(anchor, today) })
      )
    }
    if (filter === 'unassigned' || (filter === 'all' && (staff.length === 0 || dayVisits.some(v => !v.staff_id) || cols.length === 0))) {
      cols.push({ key: 'unassigned', title: staff.length === 0 ? 'Everyone' : 'Unassigned', subtitle: staff.length === 0 ? undefined : 'Needs a technician', date: anchor, staffId: null, accent: UNASSIGNED, today: sameDay(anchor, today) })
    }
    return cols
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, anchor, staff, visits, filter])

  const visitsFor = (col: GridColumn): GridVisit[] =>
    view === 'week'
      ? view_.filter(g => sameDay(new Date(g.v.start_at), col.date) && matchesFilter(g.v))
      : view_.filter(g => sameDay(new Date(g.v.start_at), anchor) && (col.staffId === undefined || (col.staffId === null ? !g.v.staff_id : g.v.staff_id === col.staffId)))

  function go(delta: number) {
    setAnchor(a => addDays(a, delta * (isMobile || view === 'week' ? 7 : 1)))
  }

  const weekLabel = `${weekStart.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} to ${addDays(weekStart, 6).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`
  const label = isMobile ? weekLabel : view === 'week' ? weekLabel : fmtDay(anchor, true)

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/calendar" />
        <PageSkeleton variant="list" label="Loading calendar" />
      </div>
    )
  }

  const filterOptions = [
    { value: 'all', label: 'Everyone' },
    ...activeStaff.map(s => ({ value: s.id, label: s.name })),
    { value: 'unassigned', label: 'Unassigned' },
  ]

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard/calendar" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <div style={{ background: BG, borderBottom: `1px solid ${LINE}`, padding: isMobile ? '14px 14px 12px' : '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0 }}>Calendar</h1>
          <HeaderToolbar
            isMobile={isMobile}
            items={[
              { label: 'Team', onClick: () => setShowTeam(true) },
              { label: 'New visit', tone: 'primary', onClick: () => setCreating({ date: anchor, staffId: filter !== 'all' && filter !== 'unassigned' ? filter : null }) },
            ]}
          />
        </div>

        <div
          className="page-content"
          style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : 48 }}
        >
          <StatStrip
            isMobile={isMobile}
            items={[
              { label: 'Today', value: counts.today, sub: counts.today === 1 ? 'visit' : 'visits' },
              { label: 'This week', value: counts.week, sub: 'visits booked' },
              { label: 'Unassigned', value: counts.unassigned, sub: 'need a technician' },
              { label: 'Team', value: activeStaff.length, sub: activeStaff.length === 1 ? 'technician' : 'technicians' },
            ]}
          />

          {staff.length === 0 && (
            <div style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>Add your technicians</div>
                <div style={{ fontSize: 13, color: TEXT3, marginTop: 3, lineHeight: 1.5 }}>Give each visit to the right person and see everyone&apos;s day side by side. Until then, visits show in one column.</div>
              </div>
              <button type="button" onClick={() => setShowTeam(true)} style={BTN.primary}>Add team</button>
            </div>
          )}

          <div style={{ ...card, padding: isMobile ? 12 : '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {!isMobile && (
              <div role="group" aria-label="View" style={{ display: 'inline-flex', padding: 3, gap: 2, background: '#F1F5F9', borderRadius: 10 }}>
                {(['day', 'week'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    onClick={() => setView(v)}
                    style={{ height: 30, padding: '0 14px', border: 'none', borderRadius: 8, background: view === v ? WHITE : 'transparent', color: view === v ? TEXT : TEXT3, fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: view === v ? '0 1px 2px rgba(15,23,42,0.08)' : 'none' }}
                  >
                    {v === 'day' ? 'Day' : 'Week'}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button type="button" aria-label="Previous" onClick={() => go(-1)} style={{ ...BTN.secondary, ...BTN_SM, width: 34, padding: 0 }}>‹</button>
              <button type="button" onClick={() => setAnchor(startOfDay(new Date()))} style={{ ...BTN.secondary, ...BTN_SM }}>Today</button>
              <button type="button" aria-label="Next" onClick={() => go(1)} style={{ ...BTN.secondary, ...BTN_SM, width: 34, padding: 0 }}>›</button>
            </div>
            <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', flex: 1, minWidth: 0 }}>{label}</div>
            <div style={{ width: isMobile ? '100%' : 200 }}>
              <Select value={filter} onChange={e => setFilter(e.target.value)} style={{ height: 36 }} aria-label="Show">
                {filterOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
          </div>

          {!isMobile ? (
            <TimeGrid columns={columns} visitsFor={visitsFor} onOpen={v => setEditing(v)} onCreate={(col, when) => setCreating({ date: when, staffId: col.staffId ?? null })} />
          ) : (
            <Agenda
              weekStart={weekStart}
              anchor={anchor}
              onPickDay={setAnchor}
              visits={visits}
              staffById={staffById}
              matches={matchesFilter}
              onOpen={v => setEditing(v)}
              onNew={() => setCreating({ date: anchor, staffId: filter !== 'all' && filter !== 'unassigned' ? filter : null })}
            />
          )}
        </div>
      </div>

      {(editing || creating) && (
        <VisitModal
          key={editing?.id || 'new'}
          businessId={businessId}
          visit={editing}
          defaults={creating || undefined}
          prefill={editing ? undefined : prefill}
          customers={customers}
          jobs={jobs}
          staff={staff}
          onClose={() => {
            setEditing(null)
            setCreating(null)
            setPrefill(undefined)
          }}
          onSaved={done}
        />
      )}

      {showTeam && (
        <TeamModal
          businessId={businessId}
          staff={staff}
          onClose={() => setShowTeam(false)}
          onChanged={() => {
            reloadStaff()
            setTick(t => t + 1)
          }}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
