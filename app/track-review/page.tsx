'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const BG = '#FAFAFA'

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

function TrackReviewContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    async function track() {
      const jobId = searchParams.get('job')
      const platform = searchParams.get('platform')
      const url = searchParams.get('url')

      // The database looks up the customer and business from the job itself,
      // so a crafted link can't record clicks against another business.
      if (jobId && platform) {
        await supabase.rpc('record_review_click', { p_job_id: jobId, p_platform: platform })
      }

      // Only follow normal web links (blocks javascript: and other schemes).
      if (url) {
        try {
          const target = new URL(decodeURIComponent(url))
          if (target.protocol === 'https:' || target.protocol === 'http:') {
            window.location.href = target.toString()
          }
        } catch {}
      }
    }

    track()
  }, [searchParams])

  return <CenterState text="Redirecting…" />
}

export default function TrackReviewPage() {
  return (
    <Suspense fallback={<CenterState text="Loading…" />}>
      <TrackReviewContent />
    </Suspense>
  )
}