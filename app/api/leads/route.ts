import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Public endpoint: marks a job's review link as clicked. It uses the public (anon) key and a
// database function that only ever touches the one job named, so it can't be used to read or
// change anything else. (It previously ran with the service-role key, which bypasses all
// database security.)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  try {
    const { job_id, platform } = await request.json()

    if (!job_id || typeof job_id !== 'string' || !UUID.test(job_id)) {
      return NextResponse.json({ error: 'Missing or invalid job_id' }, { status: 400 })
    }

    const { error } = await supabase.rpc('record_review_click', {
      p_job_id: job_id,
      p_platform: typeof platform === 'string' && platform ? platform : 'link',
    })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Could not record click' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
