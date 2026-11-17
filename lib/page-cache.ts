// Show the last-known data straight away, then refresh it in the background.
//
// Every page loads its data from the database in Tokyo, which costs roughly half a second per trip from Australia. So a
// page keeps a copy of what it last showed on this device and paints that immediately; the fresh data replaces it a
// moment later. The copy is per signed-in user, is wiped on sign-out, and is skipped if it would be too big.
// Row-level security still decides what the fresh fetch returns, so a stale copy can never reveal another business's data.

const PREFIX = 'jobyra_pc_'
const MAX_AGE_MS = 14 * 24 * 3600 * 1000
const MAX_BYTES = 900_000

export function readCache<T>(page: string, userId: string): T | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}${page}:${userId}`)
    if (!raw) return null
    const { t, d } = JSON.parse(raw) as { t: number; d: T }
    return Date.now() - t < MAX_AGE_MS ? d : null
  } catch {
    return null
  }
}

export function writeCache(page: string, userId: string, data: unknown) {
  try {
    const raw = JSON.stringify({ t: Date.now(), d: data })
    if (raw.length > MAX_BYTES) return
    localStorage.setItem(`${PREFIX}${page}:${userId}`, raw)
  } catch {
    // storage full or blocked: pages simply load the normal way
  }
}

export function clearPageCache() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith(PREFIX)) localStorage.removeItem(k)
  } catch {}
}
