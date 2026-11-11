// Quote numbers are random (for example Q-4829173), so they do not reveal how many quotes a business has made,
// and no two quotes ever share one. The database also refuses a repeated number for the same business.

function randomDigits(length: number) {
  const out: string[] = []
  const buf = new Uint32Array(length)
  crypto.getRandomValues(buf)
  for (let i = 0; i < length; i++) {
    // first digit 1 to 9 so every number has the same length
    out.push(String(i === 0 ? 1 + (buf[i] % 9) : buf[i] % 10))
  }
  return out.join('')
}

/** A new random quote number that is not in `existing`. */
export function randomQuoteNumber(existing: Iterable<string | null | undefined> = []) {
  const taken = new Set<string>()
  for (const n of existing) if (n) taken.add(n)
  for (let i = 0; i < 60; i++) {
    const n = `Q-${randomDigits(7)}`
    if (!taken.has(n)) return n
  }
  return `Q-${randomDigits(9)}`
}
