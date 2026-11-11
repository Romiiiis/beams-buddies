'use client'

import React from 'react'

// Loading placeholders that mirror each page's real layout, so the page doesn't jump when data
// arrives. Layout switches with a CSS media query (not useIsMobile), so phones get the phone
// layout on the very first paint. The shimmer is a soft moving sheen, never a glow, and it stops
// for people who have reduced motion turned on.

// The base .sk block and its shimmer live in app/globals.css, so a lone SkeletonBox works anywhere.
const css = `
  .sk-main { flex: 1; min-width: 0; display: flex; flex-direction: column; background: #FAFAFA; }
  .sk-head {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 16px 24px; border-bottom: 1px solid #E8EDF2; flex-shrink: 0;
  }
  .sk-body { padding: 20px 24px 48px; display: flex; flex-direction: column; gap: 16px; }
  .sk-card { background: #FFFFFF; border: 1px solid #E8EDF2; border-radius: 14px; overflow: hidden; }
  .sk-pad { padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }

  .sk-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .sk-stat { padding: 14px 20px; display: flex; flex-direction: column; gap: 8px; }
  .sk-stat + .sk-stat { border-left: 1px solid #E8EDF2; }

  .sk-row { display: flex; align-items: center; gap: 12px; padding: 12px 6px; }
  .sk-row + .sk-row { border-top: 1px solid #F1F4F7; }
  .sk-grow { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 7px; }

  .sk-dash { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 16px; align-items: start; }
  .sk-col { display: flex; flex-direction: column; gap: 16px; }

  .sk-board { display: flex; gap: 12px; overflow: hidden; }
  .sk-lane { flex: 1 0 230px; background: #F4F6F8; border: 1px solid #E8EDF2; border-radius: 14px; padding: 12px 8px 8px; display: flex; flex-direction: column; gap: 8px; }

  .sk-form { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .sk-hide-mobile { display: block; }
  .sk-note { display: none; }

  @media (max-width: 767px) {
    .sk-head { padding: 14px 14px 12px; }
    .sk-body { padding: 12px 12px calc(var(--tabbar-h) + 24px); }
    .sk-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .sk-stat { padding: 10px 12px; gap: 4px; }
    .sk-note { display: block; }
    .sk-stat:nth-child(odd) { border-left: none; }
    .sk-stat:nth-child(n+3) { border-top: 1px solid #E8EDF2; }
    .sk-dash { grid-template-columns: 1fr; }
    .sk-lane { flex: 0 0 82%; }
    .sk-form { grid-template-columns: 1fr; }
    .sk-hide-mobile { display: none; }
  }
`

type BoxProps = { w?: number | string; h?: number | string; r?: number | string; style?: React.CSSProperties; className?: string }

/** A single shimmering placeholder block. */
export function SkeletonBox({ w = '100%', h = 12, r = 8, style, className }: BoxProps) {
  return <div className={`sk${className ? ` ${className}` : ''}`} style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden="true" />
}

function StatStripSkeleton() {
  return (
    <div className="sk-card sk-stats">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="sk-stat">
          <SkeletonBox w="55%" h={10} />
          <SkeletonBox w="35%" h={20} r={6} />
          <SkeletonBox w="62%" h={9} className="sk-note" />
        </div>
      ))}
    </div>
  )
}

/** Placeholder rows for a list: two lines of text and a status pill. */
export function SkeletonRows({ count = 6 }: { count?: number }) {
  const widths = ['62%', '48%', '70%', '55%', '66%', '44%', '58%', '50%']
  return (
    <div role="status" aria-label="Loading">
      <style>{css}</style>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="sk-row">
          <div className="sk-grow">
            <SkeletonBox w={widths[i % widths.length]} h={11} />
            <SkeletonBox w="32%" h={9} />
          </div>
          <SkeletonBox w={64} h={22} r={999} className="sk-hide-mobile" />
        </div>
      ))}
    </div>
  )
}

function ListCardSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="sk-card">
      <div className="sk-pad" style={{ paddingBottom: 6 }}>
        <SkeletonBox w={140} h={16} r={6} />
        <div style={{ display: 'flex', gap: 8 }}>
          {[70, 84, 64, 76].map((w, i) => <SkeletonBox key={i} w={w} h={28} r={9} />)}
        </div>
      </div>
      <div style={{ padding: '0 14px 14px' }}>
        <SkeletonRows count={rows} />
      </div>
    </div>
  )
}

function BoardSkeleton() {
  return (
    <div className="sk-board">
      {[3, 2, 2, 1].map((cards, i) => (
        <div key={i} className="sk-lane">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 4px' }}>
            <SkeletonBox w={8} h={8} r={999} />
            <SkeletonBox w={80} h={11} />
          </div>
          {Array.from({ length: cards }).map((_, j) => (
            <div key={j} className="sk-card" style={{ borderRadius: 10, padding: '11px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SkeletonBox w="70%" h={11} />
              <SkeletonBox w="45%" h={9} />
              <SkeletonBox w="90%" h={9} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <StatStripSkeleton />
      <div className="sk-dash">
        <div className="sk-col">
          <div className="sk-card sk-pad">
            <SkeletonBox w={130} h={13} />
            <SkeletonRows count={4} />
          </div>
          <div className="sk-card sk-pad">
            <SkeletonBox w={110} h={13} />
            <SkeletonBox h={160} r={10} />
          </div>
        </div>
        <div className="sk-col">
          <div className="sk-card sk-pad">
            <SkeletonBox w={120} h={13} />
            <SkeletonBox w="45%" h={26} r={6} />
            <SkeletonRows count={3} />
          </div>
          <div className="sk-card sk-pad">
            <SkeletonBox w={90} h={13} />
            <SkeletonBox h={120} r={10} />
          </div>
        </div>
      </div>
    </>
  )
}

function DetailSkeleton() {
  return (
    <>
      <div className="sk-card sk-pad" style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <SkeletonBox w={52} h={52} r={14} />
        <div className="sk-grow">
          <SkeletonBox w="40%" h={14} />
          <SkeletonBox w="60%" h={10} />
        </div>
      </div>
      <StatStripSkeleton />
      <div className="sk-card sk-pad">
        <SkeletonBox w={140} h={13} />
        <SkeletonRows count={3} />
      </div>
    </>
  )
}

function FormSkeleton() {
  return (
    <>
      {[4, 2, 3].map((fields, i) => (
        <div key={i} className="sk-card">
          <div className="sk-pad" style={{ borderBottom: '1px solid #E8EDF2' }}>
            <SkeletonBox w={150} h={15} r={6} />
            <SkeletonBox w={240} h={10} style={{ maxWidth: '80%' }} />
          </div>
          <div className="sk-pad">
            <div className="sk-form">
              {Array.from({ length: fields }).map((_, j) => (
                <div key={j} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <SkeletonBox w={90} h={9} />
                  <SkeletonBox h={42} r={12} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

function ReportSkeleton() {
  return (
    <>
      <StatStripSkeleton />
      <div className="sk-card sk-pad">
        <SkeletonBox w={150} h={14} />
        <SkeletonBox h={220} r={10} />
      </div>
      <div className="sk-dash">
        <div className="sk-card sk-pad">
          <SkeletonBox w={120} h={13} />
          <SkeletonRows count={3} />
        </div>
        <div className="sk-card sk-pad">
          <SkeletonBox w={100} h={13} />
          <SkeletonRows count={3} />
        </div>
      </div>
    </>
  )
}

export type PageSkeletonVariant = 'dashboard' | 'list' | 'board' | 'detail' | 'form' | 'report'

/**
 * Full-page loading state shown beside the sidebar while a page fetches its data.
 * `label` is read out by screen readers, e.g. "Loading customers".
 */
export function PageSkeleton({ variant = 'list', label = 'Loading' }: { variant?: PageSkeletonVariant; label?: string }) {
  return (
    <div className="sk-main" role="status" aria-live="polite" aria-label={label}>
      <style>{css}</style>

      <div className="sk-head">
        {variant === 'dashboard' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <SkeletonBox w={48} h={48} r={13} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SkeletonBox w={110} h={9} />
              <SkeletonBox w={190} h={20} r={6} style={{ maxWidth: '45vw' }} />
            </div>
          </div>
        ) : (
          <SkeletonBox w={150} h={22} r={7} style={{ maxWidth: '40vw' }} />
        )}
        <SkeletonBox w={variant === 'form' ? 130 : 210} h={42} r={13} style={{ maxWidth: '42vw' }} />
      </div>

      <div className="sk-body">
        {variant === 'dashboard' && <DashboardSkeleton />}
        {variant === 'list' && (<><StatStripSkeleton /><ListCardSkeleton /></>)}
        {variant === 'board' && (<><StatStripSkeleton /><BoardSkeleton /></>)}
        {variant === 'detail' && <DetailSkeleton />}
        {variant === 'form' && <FormSkeleton />}
        {variant === 'report' && <ReportSkeleton />}
      </div>
    </div>
  )
}
