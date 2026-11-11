'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserRow } from '@/lib/session'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { PageSkeleton } from '@/components/Skeleton'
import { StatStrip } from '@/components/StatStrip'
import { HeaderToolbar } from '@/components/HeaderToolbar'
import { AppIcon, type AppIconName } from '@/components/AppIcon'
import { Select } from '@/components/Select'
import { DataList, PersonCell, TextCell } from '@/components/DataList'
import { useIsPhone } from '@/components/forms'
import { money } from '@/lib/format'
import {
  AGE_LABELS,
  METRICS,
  PERIODS,
  VIEWS,
  agedReceivables,
  earliestDate,
  formatMoney,
  makeBuckets,
  periodWindow,
  rankingsFor,
  seriesFor,
  stripFor,
  type OwingRow,
  type Period,
  type RLine,
  type Ranked,
  type ReportData,
  type ReportView,
  type RevenueMetric,
  type SeriesPoint,
} from '@/lib/report-data'

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEAL_LIGHT = '#EBFAF7'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

// Rank badges on the "Top ..." cards: 1st solid teal, 2nd soft teal, 3rd soft grey, the rest plain
const RANK_STYLES: Record<number | 'rest', React.CSSProperties> = {
  0: { background: TEAL, color: '#FFFFFF' },
  1: { background: TEAL_LIGHT, color: TEAL_DARK, boxShadow: 'inset 0 0 0 1px #BFE7E3' },
  2: { background: '#F1F4F7', color: TEXT2, boxShadow: `inset 0 0 0 1px ${BORDER}` },
  rest: { background: 'transparent', color: TEXT3 },
}

const card: React.CSSProperties = { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

const VIEW_ICON: Record<ReportView, AppIconName> = { revenue: 'dollar', jobs: 'jobs', quotes: 'document', services: 'calendar-clock' }
const TREND_TITLE: Record<ReportView, string> = { revenue: 'Revenue trend', jobs: 'Jobs trend', quotes: 'Quote trend', services: 'Service trend' }
const SERIES_LABEL: Record<ReportView, string> = { revenue: 'Revenue', jobs: 'Jobs added', quotes: 'Quote value', services: 'Service dates' }
const STRIP_LINK: Record<ReportView, string> = { revenue: '/dashboard/invoices', jobs: '/dashboard/jobs', quotes: '/dashboard/quotes', services: '/dashboard/schedule' }

function AreaChart({ series, maxVal, height = 240, isMobile = false, formatValue }: { series: SeriesPoint[]; maxVal: number; height?: number; isMobile?: boolean; formatValue: (v: number) => string }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [svgWidth, setSvgWidth] = useState(600)

  useEffect(() => {
    function measure() {
      if (svgRef.current) setSvgWidth(svgRef.current.getBoundingClientRect().width)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const PAD_L = isMobile ? 8 : 12
  const PAD_R = isMobile ? 8 : 12
  const PAD_T = 28
  const PAD_B = 34
  const chartW = svgWidth - PAD_L - PAD_R
  const chartH = height - PAD_T - PAD_B
  const n = series.length

  function xOf(i: number) {
    return PAD_L + (i / Math.max(n - 1, 1)) * chartW
  }
  function yOf(v: number) {
    const pct = maxVal > 0 ? v / maxVal : 0
    return PAD_T + chartH - pct * chartH
  }

  const points = series.map((s, i) => ({ x: xOf(i), y: yOf(s.total), ...s }))

  function smoothPath(pts: { x: number; y: number }[]) {
    if (pts.length < 2) return ''
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]
      const curr = pts[i]
      const cpx = (prev.x + curr.x) / 2
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
    }
    return d
  }

  const linePath = smoothPath(points)
  const areaPath = linePath ? `${linePath} L ${points[n - 1].x} ${PAD_T + chartH} L ${points[0].x} ${PAD_T + chartH} Z` : ''

  // Skip repeated labels (an empty chart would otherwise read $0, $0, $1, $1, $1)
  const yTicks = [0, 0.25, 0.5, 0.75, 1]
    .map(f => ({ y: PAD_T + chartH - f * chartH, val: Math.round(maxVal * f) }))
    .filter((t, i, arr) => arr.findIndex(x => x.val === t.val) === i)

  // With many points, label every few; the newest point is always labelled
  const every = Math.max(1, Math.ceil(n / (isMobile ? 6 : 14)))

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} width="100%" height={height} style={{ display: 'block', overflow: 'visible' }} onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id="reportsAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TEAL} stopOpacity="0.18" />
            <stop offset="100%" stopColor={TEAL} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={PAD_L + chartW} y1={t.y} y2={t.y} stroke={i === 0 ? BORDER : '#EEF2F7'} strokeWidth={i === 0 ? 1 : 0.8} strokeDasharray={i === 0 ? '0' : '4 3'} />
            <text x={PAD_L - 6} y={t.y + 3.5} textAnchor="end" fontSize="9" fontWeight="700" fill={TEXT3} fontFamily={FONT}>
              {formatValue(t.val)}
            </text>
          </g>
        ))}

        {points.map((p, i) => (
          <line key={`vl-${i}`} x1={p.x} x2={p.x} y1={PAD_T} y2={PAD_T + chartH} stroke={hovered === i ? '#CBD5E1' : 'transparent'} strokeWidth="1" strokeDasharray="3 2" />
        ))}

        {areaPath && <path d={areaPath} fill="url(#reportsAreaGrad)" />}
        {linePath && <path d={linePath} fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}

        {points.map((p, i) => (
          <g key={`dot-${i}`}>
            {(n <= 40 || hovered === i) && (
              <circle cx={p.x} cy={p.y} r={hovered === i ? 5 : n > 20 ? 2.5 : 3.5} fill={hovered === i ? TEAL : WHITE} stroke={TEAL} strokeWidth={hovered === i ? 2.5 : 1.8} style={{ transition: 'r 0.15s, fill 0.15s' }} />
            )}
            <rect x={p.x - chartW / n / 2} y={PAD_T} width={chartW / n} height={chartH} fill="transparent" style={{ cursor: 'crosshair' }} onMouseEnter={() => setHovered(i)} />
          </g>
        ))}

        {points.map((p, i) =>
          (n - 1 - i) % every === 0 ? (
            <text key={`xl-${i}`} x={p.x} y={PAD_T + chartH + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill={hovered === i ? TEXT : TEXT3} fontFamily={FONT}>
              {p.label}
            </text>
          ) : null
        )}

        {hovered !== null &&
          (() => {
            const p = points[hovered]
            const tw = 104
            const th = 38
            let tx = p.x - tw / 2
            if (tx < PAD_L) tx = PAD_L
            if (tx + tw > PAD_L + chartW) tx = PAD_L + chartW - tw
            const ty = Math.max(PAD_T - 2, p.y - th - 10)
            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={tx} y={ty} width={tw} height={th} rx="8" fill={TEXT} />
                <text x={tx + tw / 2} y={ty + 13} textAnchor="middle" fontSize="9" fontWeight="700" fill="#94A3B8" fontFamily={FONT}>
                  {p.tip}
                </text>
                <text x={tx + tw / 2} y={ty + 27} textAnchor="middle" fontSize="12" fontWeight="900" fill={WHITE} fontFamily={FONT}>
                  {formatValue(p.total)}
                </text>
              </g>
            )
          })()}
      </svg>
    </div>
  )
}

export default function ReportsPage() {
  const router = useRouter()
  const isMobile = useIsPhone()
  const [loading, setLoading] = useState(true)
  const [bizId, setBizId] = useState('')
  const [data, setData] = useState<ReportData>({ invoices: [], quotes: [], jobs: [], customers: [] })
  const [view, setView] = useState<ReportView>('revenue')
  const [period, setPeriod] = useState<Period>('6m')
  const [metric, setMetric] = useState<RevenueMetric>('invoiced')
  const [owingTab, setOwingTab] = useState('all')
  const [showAllOwing, setShowAllOwing] = useState(false)
  // Line items (what was sold) are only needed for the "Top products" card, so they arrive after the page is up
  const [lines, setLines] = useState<Record<string, RLine[]>>({})
  const [linesFrom, setLinesFrom] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data: userData } = await getUserRow(session.user.id)
      if (!userData) {
        setLoading(false)
        return
      }
      const bid = userData.business_id as string
      setBizId(bid)

      const [jobsRes, invoicesRes, quotesRes, customersRes] = await Promise.all([
        supabase.from('jobs').select('id, created_at, next_service_date, brand, customer_id').eq('business_id', bid),
        supabase.from('invoices').select('id, created_at, status, total, amount_paid, customer_id, due_date, invoice_number').eq('business_id', bid),
        supabase.from('quotes').select('id, created_at, status, total, customer_id').eq('business_id', bid),
        supabase.from('customers').select('id, created_at, suburb, first_name, last_name').eq('business_id', bid),
      ])

      setData({
        jobs: (jobsRes.data || []) as ReportData['jobs'],
        invoices: (invoicesRes.data || []) as ReportData['invoices'],
        quotes: (quotesRes.data || []) as ReportData['quotes'],
        customers: (customersRes.data || []) as ReportData['customers'],
      })
      setLoading(false)
    }
    load()
  }, [router])

  const now = useMemo(() => new Date(), [])
  const earliest = useMemo(() => earliestDate(data), [data])
  const win = useMemo(() => periodWindow(period, now, earliest), [period, now, earliest])
  const words = PERIODS.find(p => p.value === period)?.words || ''
  const isMoney = view === 'revenue' || view === 'quotes'

  const cells = useMemo(() => stripFor(view, data, win, words, now), [view, data, win, words, now])
  const buckets = useMemo(() => makeBuckets(period, win), [period, win])
  const series = useMemo(() => seriesFor(view, metric, data, buckets, now), [view, metric, data, buckets, now])
  const maxVal = Math.max(...series.map(p => p.total), 1)
  const fmt = (v: number) => (isMoney ? formatMoney(v) : String(Math.round(v)))

  // Fetch line items for the dates being looked at, once, and again only if the period reaches further back
  const needFrom = win.start.getTime()
  useEffect(() => {
    if (loading || !bizId || (view !== 'revenue' && view !== 'quotes')) return
    if (linesFrom !== null && linesFrom <= needFrom) return
    let cancelled = false
    const since = new Date(needFrom).toISOString()
    Promise.all([
      supabase.from('invoices').select('id, line_items').eq('business_id', bizId).gte('created_at', since),
      supabase.from('quotes').select('id, line_items').eq('business_id', bizId).gte('created_at', since),
    ]).then(([inv, quo]) => {
      if (cancelled) return
      const next: Record<string, RLine[]> = {}
      for (const r of [...((inv.data as { id: string; line_items: RLine[] | null }[]) || []), ...((quo.data as { id: string; line_items: RLine[] | null }[]) || [])]) {
        next[r.id] = Array.isArray(r.line_items) ? r.line_items : []
      }
      setLines(prev => ({ ...prev, ...next }))
      setLinesFrom(needFrom)
    })
    return () => {
      cancelled = true
    }
  }, [loading, bizId, view, needFrom, linesFrom])

  const linesReady = linesFrom !== null && linesFrom <= needFrom
  const rankings = useMemo(() => rankingsFor(view, metric, data, win, now, linesReady ? lines : null), [view, metric, data, win, now, lines, linesReady])

  const customerName = useMemo(() => {
    const m = new Map(data.customers.map(c => [c.id, [c.first_name, c.last_name].filter(Boolean).join(' ').trim()]))
    return (id?: string | null) => (id ? m.get(id) || '' : '')
  }, [data.customers])
  const aged = useMemo(() => agedReceivables(data.invoices, customerName, now), [data.invoices, customerName, now])
  const owingRows = useMemo(() => {
    const tab = owingTab === 'all' ? null : Number(owingTab)
    return aged.rows.filter(r => tab === null || r.buckets[tab] > 0)
  }, [aged.rows, owingTab])

  function renderRankingCard({ title, subtitle, items, empty, route }: { title: string; subtitle: string; items: Ranked[] | null; empty: string; route: string }) {
    const maxValue = Math.max(...(items || []).map(i => i.value), 1)
    const totalValue = (items || []).reduce((s, i) => s + i.value, 0)
    const show = (v: number) => (rankings.money ? formatMoney(v) : String(v))

    return (
      <div style={card}>
        <div style={{ padding: isMobile ? '16px' : '18px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, background: WHITE }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
            <div style={{ width: 4, alignSelf: 'stretch', minHeight: 22, borderRadius: 999, background: TEAL, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: TEXT, letterSpacing: '-0.035em' }}>{title}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: TEXT3, marginTop: 3, lineHeight: 1.4 }}>{subtitle}</div>
            </div>
          </div>
          <button type="button" onClick={() => router.push(route)} aria-label={`Open ${title}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT3, padding: 0, width: 36, height: 36, margin: '-8px -8px -8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AppIcon name="external-link" size={14} />
          </button>
        </div>

        <div style={{ padding: isMobile ? 14 : 16 }}>
          {items === null ? (
            <div style={{ padding: '22px 14px', borderRadius: 12, background: '#F8FAFC', border: `1px solid ${BORDER}`, textAlign: 'center', fontSize: 12, fontWeight: 600, color: TEXT3 }}>Loading...</div>
          ) : items.length === 0 ? (
            <div style={{ padding: '22px 14px', borderRadius: 12, background: '#F8FAFC', border: `1px solid ${BORDER}`, textAlign: 'center', fontSize: 12, fontWeight: 600, color: TEXT3 }}>{empty}</div>
          ) : (
            <div style={{ display: 'grid', gap: 9 }}>
              {items.map((item, index) => {
                const width = Math.max(8, Math.round((item.value / maxValue) * 100))
                return (
                  <div key={item.name} style={{ padding: 12, borderRadius: 12, background: WHITE, border: `1px solid ${BORDER}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 9 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div aria-label={`Rank ${index + 1}`} style={{ width: 28, height: 28, borderRadius: 999, ...(RANK_STYLES[index] || RANK_STYLES.rest), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', flexShrink: 0 }}>
                          {index + 1}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: TEXT3, marginTop: 2 }}>{Math.round((item.value / Math.max(totalValue, 1)) * 100)}% of the top {items.length}</div>
                        </div>
                      </div>
                      <div style={{ minWidth: 34, height: 28, padding: '0 9px', borderRadius: 8, background: '#F8FAFC', border: `1px solid ${BORDER}`, color: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{show(item.value)}</div>
                    </div>
                    <div style={{ width: '100%', height: 8, borderRadius: 999, background: '#EAEFF4', overflow: 'hidden' }}>
                      <div style={{ width: `${width}%`, height: '100%', borderRadius: 999, background: TEAL }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/reports" />
        <PageSkeleton variant="report" label="Loading reports" />
      </div>
    )
  }

  const metricLabel = METRICS.find(m => m.value === metric)?.label.toLowerCase() || ''
  const basis = view === 'revenue' ? `${metricLabel} invoices, ${words}` : view === 'quotes' ? `quoted value, ${words}` : view === 'jobs' ? `jobs added, ${words}` : `service dates, ${words}`
  const stripItems = cells.map(c => ({ label: c.label, value: c.value, sub: c.sub, delta: c.delta, up: c.up, onClick: () => router.push(STRIP_LINK[view]) }))

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard/reports" />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <PageHeader title="Reports">
          <HeaderToolbar
            isMobile={isMobile}
            items={[
              { label: 'Print', icon: <AppIcon name="print" size={15} />, onClick: () => window.print() },
              { label: 'View invoices', icon: <AppIcon name="invoice" size={15} />, onClick: () => router.push('/dashboard/invoices') },
            ]}
          />
        </PageHeader>

        <div className="page-content" style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : 48, background: BG }}>
          {/* One pair of controls drives everything below: the four figures, the chart and both rankings */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div className="jb-chips" role="group" aria-label="Report">
              {VIEWS.map(v => (
                <button key={v.value} type="button" className="jb-chip" aria-pressed={view === v.value} onClick={() => setView(v.value)}>
                  {!isMobile && <AppIcon name={VIEW_ICON[v.value]} size={16} />}
                  {v.label}
                </button>
              ))}
            </div>
            <Select value={period} onChange={e => setPeriod(e.target.value as Period)} style={{ height: isMobile ? 40 : 36, width: isMobile ? '100%' : 150 }} aria-label="Period">
              {PERIODS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </div>

          <StatStrip items={stripItems} isMobile={isMobile} variant="full" />

          <div style={card}>
            <div style={{ padding: isMobile ? '16px 16px 0' : '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{ width: 4, alignSelf: 'stretch', minHeight: 22, borderRadius: 999, background: TEAL, flexShrink: 0 }} />
                <div style={{ fontSize: 17, fontWeight: 900, color: TEXT, letterSpacing: '-0.035em', lineHeight: 1.2 }}>{TREND_TITLE[view]}</div>
              </div>

              {view === 'revenue' && (
                <div className="jb-chips" role="group" aria-label="Show">
                  {METRICS.map(m => (
                    <button key={m.value} type="button" className="jb-chip" aria-pressed={metric === m.value} onClick={() => setMetric(m.value)}>
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: isMobile ? '16px 12px 12px 44px' : '20px 24px 16px' }}>
              <AreaChart series={series} maxVal={maxVal} height={isMobile ? 210 : 240} isMobile={isMobile} formatValue={fmt} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: isMobile ? 0 : 52, marginTop: 6, gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 16, height: 2, background: TEAL, borderRadius: 1 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: TEXT3 }}>{view === 'revenue' ? `${METRICS.find(m => m.value === metric)?.label} value` : SERIES_LABEL[view]}</span>
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: TEXT3 }}>{words.charAt(0).toUpperCase() + words.slice(1)}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, alignItems: 'start' }}>
            {renderRankingCard({
              title: 'Top suburbs',
              subtitle: view === 'revenue' || view === 'quotes' ? `By amount: ${basis}` : `By number of customers' ${basis}`,
              items: rankings.suburbs,
              empty: 'Nothing in this period yet.',
              route: '/dashboard/customers',
            })}
            {renderRankingCard({
              title: rankings.productsKind === 'items' ? 'Top products & services' : 'Top brands & products',
              subtitle: rankings.productsKind === 'items' ? `By the amount on invoice and quote lines: ${basis}` : `By number of units: ${basis}`,
              items: rankings.products,
              empty: 'Nothing in this period yet.',
              route: view === 'quotes' ? '/dashboard/quotes' : view === 'revenue' ? '/dashboard/invoices' : '/dashboard/jobs',
            })}
          </div>

          {view === 'revenue' && (
            <>
              <DataList<OwingRow>
                title={`Who owes you · ${money(aged.total)}`}
                isMobile={isMobile}
                rows={showAllOwing ? owingRows : owingRows.slice(0, 10)}
                rowKey={r => r.customerId || r.name}
                emptyText="Nobody owes you anything right now."
                onRowClick={r => {
                  if (r.customerId) router.push(`/dashboard/customers/${r.customerId}`)
                }}
                tabs={[{ value: 'all', label: 'Everyone', count: aged.rows.length }, ...AGE_LABELS.map((l, i) => ({ value: String(i), label: l, count: aged.rows.filter(r => r.buckets[i] > 0).length }))]}
                activeTab={owingTab}
                onTabChange={setOwingTab}
                columns={[
                  { key: 'who', label: 'Customer', width: 'minmax(0,1.5fr)', render: r => <PersonCell name={r.name} sub={`${r.invoices} unpaid invoice${r.invoices === 1 ? '' : 's'}`} /> },
                  ...AGE_LABELS.map((l, i) => ({ key: `age${i}`, label: l, width: '112px', mobileLabel: l, render: (r: OwingRow) => <TextCell>{r.buckets[i] > 0 ? money(r.buckets[i]) : '-'}</TextCell> })),
                  { key: 'total', label: 'Total owing', width: '104px', mobileHeader: true, render: (r: OwingRow) => <TextCell strong>{money(r.total)}</TextCell> },
                ]}
              />
              {owingRows.length > 10 && (
                <button type="button" onClick={() => setShowAllOwing(s => !s)} style={{ alignSelf: 'center', background: 'none', border: 'none', color: TEAL_DARK, fontFamily: FONT, fontSize: 13, fontWeight: 800, cursor: 'pointer', padding: 6 }}>
                  {showAllOwing ? 'Show fewer' : `Show all ${owingRows.length} customers`}
                </button>
              )}
              <div style={{ fontSize: 12, color: TEXT3, lineHeight: 1.5, marginTop: -6 }}>Counts invoices that are sent or overdue and not fully paid. An invoice with no due date counts as not due yet. This list is as of today and does not change with the period.</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
