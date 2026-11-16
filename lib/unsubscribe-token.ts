// Signed "unsubscribe" links. The link carries the customer's id plus a signature only the server can make, so a
// link can only ever unsubscribe the customer it was sent to and nobody can guess another one. Server-side only.
import { createHmac, timingSafeEqual } from 'crypto'
import { SITE_URL } from '@/lib/booking-token'

const secret = () => process.env.BOOKING_SECRET || process.env.CRON_SECRET || ''
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const sig = (customerId: string) => createHmac('sha256', secret()).update(`unsubscribe:${customerId}`).digest('base64url').slice(0, 24)

function token(customerId: string): string | undefined {
  if (!secret() || !UUID.test(customerId)) return undefined
  return `${customerId}.${sig(customerId)}`
}

/** The page a customer opens from the link at the bottom of an email. */
export function unsubscribeUrl(customerId: string): string | undefined {
  const t = token(customerId)
  return t ? `${SITE_URL}/unsubscribe/${t}` : undefined
}

/** The address mail apps call for their own "Unsubscribe" button (one click, no page). */
export function unsubscribeApiUrl(customerId: string): string | undefined {
  const t = token(customerId)
  return t ? `${SITE_URL}/api/unsubscribe?token=${t}` : undefined
}

/** The customer id inside a link, or null if the signature does not match. */
export function customerFromToken(value: string): string | null {
  const [customerId, given] = String(value || '').split('.')
  if (!customerId || !given || !UUID.test(customerId) || !secret()) return null
  const want = Buffer.from(sig(customerId))
  const got = Buffer.from(given)
  return want.length === got.length && timingSafeEqual(want, got) ? customerId : null
}
