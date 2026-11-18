import crypto from 'crypto'

// A small Stripe client over plain fetch (no SDK): Stripe's API takes form-encoded bodies with bracketed keys.
// STRIPE_SECRET_KEY is the platform (Jobyra) key; businesses are connected accounts we act on with Stripe-Account.

function flatten(value: unknown, prefix: string, out: [string, string][]) {
  if (value === undefined || value === null) return
  if (Array.isArray(value)) value.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out))
  else if (typeof value === 'object') for (const [k, v] of Object.entries(value as Record<string, unknown>)) flatten(v, prefix ? `${prefix}[${k}]` : k, out)
  else out.push([prefix, String(value)])
}

export const stripeConfigured = () => !!process.env.STRIPE_SECRET_KEY

export async function stripeApi<T = any>(method: 'GET' | 'POST', path: string, params?: Record<string, unknown>, account?: string): Promise<{ ok: boolean; data: T; status: number }> {
  const key = process.env.STRIPE_SECRET_KEY || ''
  const pairs: [string, string][] = []
  if (params) flatten(params, '', pairs)
  const body = new URLSearchParams(pairs).toString()
  const headers: Record<string, string> = { Authorization: `Bearer ${key}` }
  if (account) headers['Stripe-Account'] = account
  if (method === 'POST') headers['Content-Type'] = 'application/x-www-form-urlencoded'
  const res = await fetch(`https://api.stripe.com/v1${path}${method === 'GET' && body ? `?${body}` : ''}`, { method, headers, body: method === 'POST' ? body : undefined, cache: 'no-store' })
  const data = (await res.json().catch(() => ({}))) as T
  return { ok: res.ok, data, status: res.status }
}

// Checks the Stripe-Signature header on a webhook (HMAC-SHA256 of "timestamp.body", five minute tolerance).
export function verifyStripeSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header || !secret) return false
  const parts = header.split(',').map(p => p.trim().split('='))
  const t = parts.find(p => p[0] === 't')?.[1]
  const sigs = parts.filter(p => p[0] === 'v1').map(p => p[1])
  if (!t || sigs.length === 0) return false
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex')
  return sigs.some(s => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)))
}
