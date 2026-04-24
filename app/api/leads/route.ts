import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { job_id } = await request.json()

    if (!job_id) {
      return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })
    }

    const { error } = await supabase
      .from('jobs')
      .update({ review_link_clicked: true })
      .eq('id', job_id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}