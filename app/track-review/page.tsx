'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const BG = '#FAFAFA'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function CenterState({ text }: { text: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          background: '#fff',
          border: `1px solid ${BORDER}`,
          borderRadius: '12px',
          padding: '28px 32px',
          fontSize: '14px',
          color: TEXT3,
          textAlign: 'center',
          minWidth: '220px',
        }}
      >
        {text}
      </div>
    </div>
  )
}

/** The same link written slightly differently (capital letters in the host, a trailing slash) still counts as the same. */
function sameLink(a: string, b: string) {
  try {
    const x = new URL(a)
    const y = new URL(b)
    const path = (u: URL) => u.pathname.replace(/\/+$/, '')
    return x.protocol === y.protocol && x.host.toLowerCase() === y.host.toLowerCase() && path(x) === path(y) && x.search === y.search
  } catch {
    return false
  }
}

function TrackReviewContent() {
  const searchParams = useSearchParams()
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    async function track() {
      const jobId = searchParams.get('job') || ''
      const platform = searchParams.get('platform') || ''
      const url = searchParams.get('url') || ''

      // The database records the click and answers with the review links that business has saved.
      // A visitor is only ever sent on to one of those, so this page cannot be used to bounce
      // people to some other website from a jobyra.app address.
      let allowed: string[] = []
      if (UUID.test(jobId)) {
        const { data } = await supabase.rpc('record_review_click', { p_job_id: jobId, p_platform: platform || null })
        if (Array.isArray(data)) allowed = (data as unknown[]).filter((u: unknown): u is string => typeof u === 'string' && /^https?:\/\//i.test(u))
      }

      let wanted = ''
      try {
        wanted = url ? new URL(decodeURIComponent(url)).toString() : ''
      } catch {}
      const target = allowed.find(u => wanted && sameLink(u, wanted)) || (allowed.length === 1 && !wanted ? allowed[0] : '')

      if (target) window.location.href = target
      else setInvalid(true)
    }

    track()
  }, [searchParams])

  return <CenterState text={invalid ? 'This review link is no longer valid.' : 'Redirecting…'} />
}

export default function TrackReviewPage() {
  return (
    <Suspense fallback={<CenterState text="Loading…" />}>
      <TrackReviewContent />
    </Suspense>
  )
}
