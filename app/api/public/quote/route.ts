import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { renderEmail, renderText, money, type EmailContent, type EmailSender } from '@/lib/email-theme'
import { SITE_URL } from '@/lib/site'

// A customer answers a quote from its private page: accept, decline, or ask a question.
//
// Security: this is public, but it can only ever act on the one quote whose private link the caller holds.
// The database function (respond_public_quote) does the real work and works out the accepted total itself from the
// saved line items; nothing the browser sends can change a price. The business is then told by email.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/
const NOTIFY_FROM = 'Jobyra <notifications@mail.jobyra.app>'

const MESSAGES: Record<string, string> = {
  not_found: 'This quote link is not valid any more.',
  bad_action: 'Something went wrong. Please refresh the page and try again.',
  name_required: 'Please type your full name.',
  message_required: 'Please type your question.',
  already_answered: 'This quote has already been answered.',
  expired: 'This quote has expired. Please contact us and we will update it for you.',
  slow_down: 'Your last message was just sent. Please wait a couple of minutes before sending another.',
}

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status })
}

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return json({ error: 'bad_request', message: 'Invalid request.' }, 400)
  }
  const token = body?.token
  const action = body?.action
  if (typeof token !== 'string' || !UUID.test(token)) return json({ error: 'not_found', message: MESSAGES.not_found }, 404)
  if (action !== 'accept' && action !== 'decline' && action !== 'question') return json({ error: 'bad_action', message: MESSAGES.bad_action }, 400)

  const optional: number[] = Array.isArray(body?.optional) ? body.optional.filter((n: unknown) => Number.isInteger(n) && (n as number) >= 0 && (n as number) < 200) : []

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.rpc('respond_public_quote', {
    p_token: token,
    p_action: action,
    p_name: String(body?.name ?? '').slice(0, 200),
    p_message: body?.message ? String(body.message).slice(0, 2000) : null,
    p_optional: optional,
  })
  if (error || !data) {
    console.error('respond_public_quote error:', error)
    return json({ error: 'failed', message: 'Something went wrong. Please try again.' }, 500)
  }
  if (!data.ok) {
    const code = String(data.error || 'failed')
    return json({ error: code, message: MESSAGES[code] || 'Something went wrong. Please try again.', status: data.status }, code === 'not_found' ? 404 : 400)
  }

  // Tell the business. The customer's answer is already saved, so a failed email never fails the request.
  const apiKey = process.env.RESEND_API_KEY
  const n = data.notify || {}
  const to = String(n.business_email || '').trim()
  if (apiKey && EMAIL.test(to)) {
    try {
      const who = String(n.customer_name || n.signed_name || 'Your customer')
      const num = String(n.quote_number || '')
      const verb = action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'asked a question about'
      const next =
        action === 'accept'
          ? 'Next step: book the visit or create the invoice from the quote in Jobyra.'
          : action === 'decline'
            ? 'You may want to follow up with a call.'
            : 'Reply to the customer to answer, then update the quote if the price changes.'
      const content: EmailContent = {
        kind: 'quote',
        subject: `${who} ${verb} quote ${num}`,
        preheader: action === 'accept' ? `${who} accepted quote ${num} for ${money(data.total)}.` : `${who} ${verb} quote ${num}.`,
        label: action === 'accept' ? 'Quote accepted' : action === 'decline' ? 'Quote declined' : 'Customer question',
        headline: `${who} ${verb} quote ${num}`,
        greeting: `Hi ${String(n.business_name || 'there')},`,
        paragraphs: [next],
        highlight: action === 'question' ? undefined : { label: action === 'accept' ? 'Accepted total' : 'Quote total', value: money(data.total), chip: { text: action === 'accept' ? 'Accepted' : 'Declined', tone: action === 'accept' ? 'good' : 'danger' } },
        facts: [
          ['Quote', num],
          ['Customer', who],
          ...(n.signed_name ? ([[action === 'accept' ? 'Signed as' : 'Name given', String(n.signed_name)]] as [string, string][]) : []),
          ...(n.message ? ([['Message', String(n.message)]] as [string, string][]) : []),
        ],
        closing: [],
        button: { text: 'Open quotes', href: `${SITE_URL}/dashboard/quotes` },
        signoff: 'Jobyra',
        footer: 'You are getting this because a customer answered a quote you sent from Jobyra.',
      }
      const sender: EmailSender = { name: 'Jobyra' }
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: NOTIFY_FROM, to: [to], subject: content.subject, html: renderEmail('classic', content, sender), text: renderText(content, sender) }),
      })
    } catch (e) {
      console.error('Quote answer email failed:', e)
    }
  }

  return json({ ok: true, status: data.status, total: data.total }, 200)
}
