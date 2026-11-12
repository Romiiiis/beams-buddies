// Signed "book your service" links. The link carries the job id plus a signature only the server can make, so a
// customer can only ever book their own job and nobody can guess another one. Server-side only.
import { createHmac, timingSafeEqual } from 'crypto'

const secret = () => process.env.BOOKING_SECRET || process.env.CRON_SECRET || ''
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const sig = (jobId: string) => createHmac('sha256', secret()).update(`book:${jobId}`).digest('base64url').slice(0, 24)

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://jobyra.app').replace(/\/$/, '')

export function bookingUrl(jobId: string): string | undefined {
  if (!secret() || !UUID.test(jobId)) return undefined
  return `${SITE_URL}/book/${jobId}.${sig(jobId)}`
}

/** The job id inside a link, or null if the signature does not match. */
export function jobFromToken(token: string): string | null {
  const [jobId, given] = String(token || '').split('.')
  if (!jobId || !given || !UUID.test(jobId) || !secret()) return null
  const want = Buffer.from(sig(jobId))
  const got = Buffer.from(given)
  return want.length === got.length && timingSafeEqual(want, got) ? jobId : null
}
