import { supabase } from './supabase'

// One shared, remembered lookup of "who is this user and which business are they in".
// Every page used to ask the database this itself before it could fetch anything else, which made
// each page wait for two round trips in a row. Now it is asked once, remembered on this device,
// and refreshed quietly in the background. (Row-level security still decides what data is visible,
// so a stale value can never expose another business's data.)

export type UserRow = { business_id: string; full_name: string | null; role_title: string | null }

const memory = new Map<string, Promise<{ data: UserRow | null }>>()
const key = (id: string) => `jobyra_user_${id}`

function readCache(id: string): UserRow | null {
  try {
    const raw = localStorage.getItem(key(id))
    return raw ? (JSON.parse(raw) as UserRow) : null
  } catch {
    return null
  }
}

function fetchFresh(id: string): Promise<{ data: UserRow | null }> {
  return Promise.resolve(supabase.from('users').select('business_id, full_name, role_title').eq('id', id).single()).then(({ data }) => {
    if (data) {
      try {
        localStorage.setItem(key(id), JSON.stringify(data))
      } catch {}
    }
    return { data: (data as UserRow | null) ?? null }
  })
}

export function getUserRow(userId: string): Promise<{ data: UserRow | null }> {
  const existing = memory.get(userId)
  if (existing) return existing

  const cached = readCache(userId)
  let p: Promise<{ data: UserRow | null }>
  if (cached) {
    p = Promise.resolve({ data: cached })
    fetchFresh(userId).catch(() => {})
  } else {
    p = fetchFresh(userId).then(r => {
      if (!r.data) memory.delete(userId)
      return r
    })
  }
  memory.set(userId, p)
  return p
}
