import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          customer_name: body.customer_name,
          phone_number: body.phone_number,
          address: body.address,
          suburb: body.suburb,
          job_type: body.job_type,
          issue_summary: body.issue_summary,
          preferred_date: body.preferred_date,
          preferred_start_time: body.preferred_start_time,
          status: body.status,
          created_at: body.created_at || new Date().toISOString(),
        }
      ])

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })

  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}