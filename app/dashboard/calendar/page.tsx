'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { getUserRow } from '@/lib/session'
import { daysUntilService } from '@/lib/service'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { PageSkeleton } from '@/components/Skeleton'
import { StatStrip } from '@/components/StatStrip'
import { HeaderToolbar } from '@/components/HeaderToolbar'
import { Select } from '@/components/Select'
import { BTN, BTN_SM, ConfirmDialog, FONT, LINE, TEXT, TEXT3, Toast, WHITE } from '@/components/forms'
import { VISIT_KINDS, type StaffMember, type TimeOff, type Visit, addDays, addMonths, clockMinutes, customerName, fmtDay, isLate, isOnLeave, monthGridStart, sameDay, startOfDay, startOfWeek, type Site } from '@/lib/schedule'
import { Agenda } from './Agenda'
import { TimeGrid, type GridColumn, type GridVisit } from './TimeGrid'
import { MonthGrid } from './MonthGrid'
import type { SavedInfo, VisitPrefill } from './VisitModal'
import { ToBookPanel, type DueService, type ToBookRow } from './ToBookPanel'

// The pop-ups are only needed after a click, so they are not part of the page's first download
const VisitModal = dynamic(() => import('./VisitModal').then(m => m.VisitModal), { ssr: false })
const TeamModal = dynamic(() => import('./TeamModal').then(m => m.TeamModal), { ssr: false })
const LateModal = dynamic(() => import('./LateModal').then(m => m.LateModal), { ssr: false })
const ChecklistsModal = dynamic(() => import('./ChecklistsModal').then(m => m.ChecklistsModal), { ssr: false })
const NextVisitPrompt = dynamic(() => import('./NextVisitPrompt').then(m => m.NextVisitPrompt), { ssr: false })

const BG = '#FAFAFA'
const UNASSIGNED = '#94A3B8'

type Mode = 'day' | 'week' | 'month'

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
const VISIT_SELECT = '*, customers(first_name, last_name, phone, email, address, suburb, state, postcode), jobs(brand, model, equipment_type), customer_sites(label, address, suburb, state, postcode)'

export default function CalendarPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState('')
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [timeOff, setTimeOff] = useState<TimeOff[]>([])
  const [toBook, setToBook] = useState<ToBookRow[]>([])
  const [bookedJobIds, setBookedJobIds] = useState<Set<string>>(new Set())
  const [lateVisits, setLateVisits] = useState<Visit[]>([])
  const [counts, setCounts] = useState({ today: 0, week: 0, unassigned: 0 })
  const [view, setView] = useState<Mode>('day')
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()))
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState<Visit | null>(null)
  const [creating, setCreating] = useState<{ date: Date; staffId: string | null } | null>(null)
  const [prefill, setPrefill] = useState<VisitPrefill | undefined>(undefined)
  const [showTeam, setShowTeam] = useState(false)
  const [showLate, setShowLate] = useState(false)
  const [showChecklists, setShowChecklists] = useState(false)
  const [nextPrompt, setNextPrompt] = useState<Visit | null>(null)
  const [removeTarget, setRemoveTarget] = useState<ToBookRow | null>(null)
  const [toast, setToast] = useState('')
  const [tick, setTick] = useState(0)

  // A phone has no separate day view: its week strip already shows one day at a time
  const mode: Mode = isMobile && view === 'day' ? 'week' : view
  const weekStart = startOfWeek(anchor)
  const gridStart = monthGridStart(anchor)
  const rangeStart = mode === 'month' ? gridStart : mode === 'week' ? weekStart : anchor
  const rangeEnd = mode === 'month' ? addDays(gridStart, 42) : mode === 'week' ? addDays(weekStart, 7) : addDays(anchor, 1)
  const rangeKey = `${rangeStart.getTime()}-${rangeEnd.getTime()}`

  // Once the page is up, fetch the visit pop-up quietly so the first click opens it straight away
  useEffect(() => {
    if (loading) return
    const t = setTimeout(() => {
      void import('./VisitModal')
    }, 1500)
    return () => clearTimeout(t)
  }, [loading])

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
      const [st, cu, jb, si] = await Promise.all([
        supabase.from('staff_members').select('*').eq('business_id', u.business_id).order('created_at'),
        supabase.from('customers').select('id, first_name, last_name, suburb').eq('business_id', u.business_id).order('first_name'),
        supabase.from('jobs').select('id, customer_id, site_id, brand, model, equipment_type, next_service_date, install_date, service_interval_months').eq('business_id', u.business_id),
        supabase.from('customer_sites').select('id, customer_id, label, address, suburb, state, postcode').eq('business_id', u.business_id),
      ])
      setStaff((st.data as StaffMember[]) || [])
      setCustomers(cu.data || [])
      setJobs(jb.data || [])
      setSites((si.data as Site[]) || [])
      setLoading(false)
      if (new URLSearchParams(window.location.search).get('team') === '1') setShowTeam(true)

      // Automatic emails word times in the business's own time zone, so keep it the same as this device's
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const { data: biz } = await supabase.from('businesses').select('timezone').eq('id', u.business_id).single()
      if (biz && tz && biz.timezone !== tz) await supabase.from('businesses').update({ timezone: tz }).eq('id', u.business_id)
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
      .select(VISIT_SELECT)
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

  // Numbers for the strip, late visits, days off, the to-be-booked list, and which equipment already has a visit coming
  useEffect(() => {
    if (!businessId) return
    const today = startOfDay(new Date())
    const nowIso = new Date().toISOString()
    const head = () => supabase.from('job_visits').select('id', { count: 'exact', head: true }).eq('business_id', businessId).neq('status', 'cancelled')
    Promise.all([
      head().gte('start_at', today.toISOString()).lt('start_at', addDays(today, 1).toISOString()),
      head().gte('start_at', startOfWeek(today).toISOString()).lt('start_at', addDays(startOfWeek(today), 7).toISOString()),
      head().is('staff_id', null).not('status', 'in', '(completed)').gte('start_at', today.toISOString()),
    ]).then(([a, b, c]) => setCounts({ today: a.count || 0, week: b.count || 0, unassigned: c.count || 0 }))

    supabase
      .from('job_visits')
      .select(VISIT_SELECT)
      .eq('business_id', businessId)
      .in('status', ['scheduled', 'on_the_way', 'in_progress'])
      .lt('end_at', nowIso)
      .gte('end_at', addDays(today, -60).toISOString())
      .order('start_at', { ascending: false })
      .limit(100)
      .then(({ data }) => setLateVisits(((data as unknown as Visit[]) || []).filter(v => isLate(v))))

    supabase
      .from('staff_time_off')
      .select('*')
      .eq('business_id', businessId)
      .gte('end_date', addDays(today, -30).toISOString().slice(0, 10))
      .order('start_date')
      .then(({ data }) => setTimeOff((data as TimeOff[]) || []))

    supabase
      .from('to_book')
      .select('*, customers(first_name, last_name, suburb)')
      .eq('business_id', businessId)
      .order('created_at')
      .then(({ data }) => setToBook((data as unknown as ToBookRow[]) || []))

    supabase
      .from('job_visits')
      .select('job_id')
      .eq('business_id', businessId)
      .not('job_id', 'is', null)
      .in('status', ['scheduled', 'on_the_way', 'in_progress'])
      .gte('end_at', nowIso)
      .then(({ data }) => setBookedJobIds(new Set((data || []).map((r: any) => r.job_id as string))))
  }, [businessId, tick])

  const activeStaff = staff.filter(s => s.active)
  const staffById = useMemo(() => new Map(staff.map(s => [s.id, s])), [staff])
  const customerById = useMemo(() => new Map(customers.map((c: any) => [c.id, c])), [customers])

  // Equipment whose service is due within 30 days (or overdue), with no visit booked and nothing waiting already
  const dueServices: DueService[] = useMemo(() => {
    const waiting = new Set(toBook.map(t => t.job_id).filter(Boolean) as string[])
    return jobs
      .map(j => ({ j, days: daysUntilService(j) }))
      .filter(({ j, days }) => days !== null && days <= 30 && !bookedJobIds.has(j.id) && !waiting.has(j.id) && customerById.has(j.customer_id))
      .sort((a, b) => (a.days as number) - (b.days as number))
      .slice(0, 12)
      .map(({ j, days }) => ({ jobId: j.id, customerId: j.customer_id, name: customerName(customerById.get(j.customer_id)) || 'Customer', equipment: [j.brand, j.model].filter(Boolean).join(' ') || 'Equipment', days: days as number }))
  }, [jobs, bookedJobIds, toBook, customerById])

  const view_: GridVisit[] = useMemo(
    () =>
      visits.map(v => {
        const s = v.staff_id ? staffById.get(v.staff_id) : undefined
        return { v, colour: s?.colour || UNASSIGNED, staffName: s?.name || null, customer: customerName(v.customers) }
      }),
    [visits, staffById]
  )

  const matchesFilter = (v: Visit) => filter === 'all' || (filter === 'unassigned' ? !v.staff_id : v.staff_id === filter)
  const filterStaff = filter !== 'all' && filter !== 'unassigned' ? filter : null

  function done(message: string, info?: SavedInfo) {
    setEditing(null)
    setCreating(null)
    setPrefill(undefined)
    setToast(message)
    setTick(t => t + 1)
    if (info?.completed) setNextPrompt(info.completed)
  }

  function startVisit(date: Date, staffId: string | null, p?: VisitPrefill) {
    setPrefill(p)
    setCreating({ date, staffId })
  }

  // A sensible first guess for a time: the day on screen (or today) at 9am
  function guessDate() {
    const d = new Date(Math.max(anchor.getTime(), startOfDay(new Date()).getTime()))
    d.setHours(9, 0, 0, 0)
    return d
  }

  const today = startOfDay(new Date())

  const hoursFor = (s: StaffMember, day: Date): GridColumn['hours'] => {
    if (isOnLeave(s.id, day, timeOff)) return { off: 'Time off' }
    if (!(s.work_days || []).includes(day.getDay())) return { off: 'Day off' }
    return { start: clockMinutes(s.work_start, 420), end: clockMinutes(s.work_end, 960) }
  }

  // ── Desktop columns ──
  const columns: GridColumn[] = useMemo(() => {
    if (mode === 'week') {
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
    shown.forEach(s => cols.push({ key: s.id, title: s.name, subtitle: s.phone || undefined, date: anchor, staffId: s.id, accent: s.colour, today: sameDay(anchor, today), hours: hoursFor(s, anchor) }))
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
  }, [mode, anchor, staff, visits, filter, timeOff])

  const visitsFor = (col: GridColumn): GridVisit[] =>
    mode === 'week'
      ? view_.filter(g => sameDay(new Date(g.v.start_at), col.date) && matchesFilter(g.v))
      : view_.filter(g => sameDay(new Date(g.v.start_at), anchor) && (col.staffId === undefined || (col.staffId === null ? !g.v.staff_id : g.v.staff_id === col.staffId)))

  function go(delta: number) {
    setAnchor(a => (mode === 'month' ? addMonths(a, delta) : addDays(a, delta * (mode === 'week' ? 7 : 1))))
  }

  function pickDay(d: Date) {
    setAnchor(d)
    setView(isMobile ? 'week' : 'day')
  }

  async function removeToBook(row: ToBookRow) {
    await supabase.from('to_book').delete().eq('id', row.id)
    setRemoveTarget(null)
    setTick(t => t + 1)
  }

  const weekLabel = `${weekStart.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} to ${addDays(weekStart, 6).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`
  const label = mode === 'month' ? anchor.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' }) : mode === 'week' ? weekLabel : fmtDay(anchor, true)

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
  const modes: { value: Mode; label: string }[] = isMobile
    ? [{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]
    : [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]

  const strip = [
    ...(lateVisits.length > 0 ? [{ label: 'Late', value: lateVisits.length, sub: lateVisits.length === 1 ? 'visit to close' : 'visits to close', onClick: () => setShowLate(true) }] : []),
    { label: 'Today', value: counts.today, sub: counts.today === 1 ? 'visit' : 'visits' },
    { label: 'This week', value: counts.week, sub: 'visits booked' },
    { label: 'Unassigned', value: counts.unassigned, sub: 'need a technician' },
    { label: 'Team', value: activeStaff.length, sub: activeStaff.length === 1 ? 'technician' : 'technicians' },
  ].slice(0, 4)

  const nextJob = nextPrompt?.job_id ? jobs.find(j => j.id === nextPrompt.job_id) : null

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard/calendar" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <PageHeader title="Calendar">
          <HeaderToolbar
            isMobile={isMobile}
            items={[
              { label: 'Team', onClick: () => setShowTeam(true) },
              { label: 'Checklists', onClick: () => setShowChecklists(true) },
              { label: 'New visit', tone: 'primary', onClick: () => startVisit(anchor, filterStaff) },
            ]}
          />
        </PageHeader>

        <div
          className="page-content"
          style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : 48 }}
        >
          <StatStrip isMobile={isMobile} items={strip} />

          {staff.length === 0 && (
            <div style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>Add your technicians</div>
                <div style={{ fontSize: 13, color: TEXT3, marginTop: 3, lineHeight: 1.5 }}>Give each visit to the right person and see everyone&apos;s day side by side. Until then, visits show in one column.</div>
              </div>
              <button type="button" onClick={() => setShowTeam(true)} style={BTN.primary}>Add team</button>
            </div>
          )}

          <ToBookPanel items={toBook} due={dueServices} isMobile={isMobile} onBook={p => startVisit(guessDate(), p.staffId ?? null, p)} onRemove={setRemoveTarget} />

          <div style={{ ...card, padding: isMobile ? 12 : '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="jb-chips" role="group" aria-label="View">
              {modes.map(m => (
                <button key={m.value} type="button" className="jb-chip" aria-pressed={mode === m.value} onClick={() => setView(m.value)}>
                  {m.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button type="button" aria-label="Previous" onClick={() => go(-1)} style={{ ...BTN.secondary, ...BTN_SM, width: 34, padding: 0 }}>‹</button>
              <button type="button" onClick={() => setAnchor(startOfDay(new Date()))} style={{ ...BTN.secondary, ...BTN_SM }}>Today</button>
              <button type="button" aria-label="Next" onClick={() => go(1)} style={{ ...BTN.secondary, ...BTN_SM, width: 34, padding: 0 }}>›</button>
            </div>
            <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', flex: '1 1 150px', minWidth: 0 }}>{label}</div>
            <div style={{ width: isMobile ? '100%' : 200 }}>
              <Select value={filter} onChange={e => setFilter(e.target.value)} style={{ height: 36 }} aria-label="Show">
                {filterOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
          </div>

          {mode === 'month' ? (
            <MonthGrid
              anchor={anchor}
              visits={visits}
              staffById={staffById}
              matches={matchesFilter}
              compact={isMobile}
              onPickDay={pickDay}
              onOpen={v => setEditing(v)}
              onNew={d => {
                const when = new Date(d)
                when.setHours(9, 0, 0, 0)
                startVisit(when, filterStaff)
              }}
            />
          ) : !isMobile ? (
            <TimeGrid columns={columns} visitsFor={visitsFor} onOpen={v => setEditing(v)} onCreate={(col, when) => startVisit(when, col.staffId ?? null)} />
          ) : (
            <Agenda
              weekStart={weekStart}
              anchor={anchor}
              onPickDay={setAnchor}
              visits={visits}
              staffById={staffById}
              matches={matchesFilter}
              onOpen={v => setEditing(v)}
              onNew={() => startVisit(anchor, filterStaff)}
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
          sites={sites}
          staff={staff}
          timeOff={timeOff}
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

      {showChecklists && <ChecklistsModal businessId={businessId} onClose={() => setShowChecklists(false)} />}

      {showLate && (
        <LateModal
          visits={lateVisits}
          staffById={staffById}
          onClose={() => setShowLate(false)}
          onOpen={v => {
            setShowLate(false)
            setEditing(v)
          }}
          onChanged={() => setTick(t => t + 1)}
        />
      )}

      {nextPrompt && (
        <NextVisitPrompt
          visit={nextPrompt}
          businessId={businessId}
          intervalMonths={nextJob?.service_interval_months ?? null}
          onBook={date => {
            const v = nextPrompt
            const minutes = Math.max(15, Math.round((new Date(v.end_at).getTime() - new Date(v.start_at).getTime()) / 60000))
            setNextPrompt(null)
            startVisit(date, v.staff_id, {
              customerId: v.customer_id || undefined,
              jobId: v.job_id || undefined,
              staffId: v.staff_id,
              title: v.title === VISIT_KINDS.find(k => k.value === v.kind)?.label ? '' : v.title,
              kind: v.kind,
              notes: v.notes || '',
              duration: minutes,
            })
          }}
          onClose={message => {
            setNextPrompt(null)
            if (message) {
              setToast(message)
              setTick(t => t + 1)
            }
          }}
        />
      )}

      {removeTarget && (
        <ConfirmDialog
          title="Remove from the list?"
          message="This only takes it off the to-be-booked list. The customer is not affected."
          confirmLabel="Remove"
          busyLabel="Removing..."
          onCancel={() => setRemoveTarget(null)}
          onConfirm={() => removeToBook(removeTarget)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
