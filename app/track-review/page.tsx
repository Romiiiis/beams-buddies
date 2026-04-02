'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const TEXT3 = '#5A5A5A'
const BORDER = '#EBEBEB'
const BG = '#FAFAF8'

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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
      const customerId = searchParams.get('customer')
      const businessId = searchParams.get('business')

      if (jobId && platform && customerId && businessId) {
        await supabase.from('review_clicks').insert({
          job_id: jobId,
          customer_id: customerId,
          business_id: businessId,
          platform,
        })
      }

      if (url) {
        window.location.href = decodeURIComponent(url)
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