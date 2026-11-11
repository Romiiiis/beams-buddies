import { createClient } from '@supabase/supabase-js'
import { buildIcs, type Feed } from '@/lib/ics'

// A technician's private calendar link. Phones subscribe to it and refresh on their own.
//
// Security: the link's token is the only key. It reads through a database function that returns just that
// technician's visits (nothing else is readable by an anonymous visitor), and the business can replace the
// token at any time from the Team screen.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(_request: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params
  const id = token.replace(/\.ics$/i, '')
  if (!UUID.test(id)) return new Response('Not found', { status: 404 })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.rpc('staff_calendar_feed', { p_token: id })
  if (error || !data) return new Response('Not found', { status: 404 })

  return new Response(buildIcs(data as Feed), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="jobs.ics"',
      'Cache-Control': 'private, max-age=300',
    },
  })
}
