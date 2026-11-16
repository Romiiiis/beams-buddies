// A daily cap on emails a business sends by hand (invoices, custom messages), counted in the sent_emails table.
// It stops Jobyra's sending address being used to send mail in bulk if an account is ever misused.
// The client passed in is signed in as the user, so the normal business-only rules apply to every read and write.

export const MANUAL_EMAIL_DAILY_LIMIT = 100

// The app's database client. It is not typed against the tables, so it is accepted as-is.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any

/** True when the business has already sent its daily allowance in the last 24 hours. */
export async function overDailyEmailLimit(supabase: Db, businessId: string): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase.from('sent_emails').select('id', { count: 'exact', head: true }).eq('business_id', businessId).gte('sent_at', since)
  return (count ?? 0) >= MANUAL_EMAIL_DAILY_LIMIT
}

/** Records one sent email so it counts towards the cap. */
export async function logSentEmail(supabase: Db, row: { business_id: string; kind: 'invoice' | 'contact'; ref_id?: string | null; to_email: string; subject: string }) {
  await supabase.from('sent_emails').insert({ ...row, ref_id: row.ref_id ?? null, subject: row.subject.slice(0, 300) })
}
