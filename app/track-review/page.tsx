'use client'

import { Suspense } from 'react'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#5A5A5A', fontSize: '14px' }}>
      Redirecting…
    </div>
  )
}

export default function TrackReviewPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#5A5A5A', fontSize: '14px' }}>Loading…</div>}>
      <TrackReviewContent />
    </Suspense>
  )
}