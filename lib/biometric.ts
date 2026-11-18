// Face ID / Touch ID / fingerprint lock for this device, using the browser's built-in platform authenticator
// (WebAuthn). It is a local lock: the sign-in itself stays remembered by the device, and when the lock is on the app
// asks the phone to recognise you before opening. Nothing biometric ever leaves the phone.

const key = (uid: string) => `jobyra_faceid_${uid}`
const declinedKey = (uid: string) => `jobyra_faceid_declined_${uid}`

const bytes = (n: number) => crypto.getRandomValues(new Uint8Array(n))
const b64 = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b)))
const unb64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0))

export async function faceIdSupported(): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !window.PublicKeyCredential || !navigator.credentials) return false
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

export const faceIdLabel = () => (typeof navigator !== 'undefined' && /iPhone|iPad/.test(navigator.userAgent) ? 'Face ID' : 'fingerprint or face unlock')

export function faceIdEnabled(uid: string): boolean {
  try { return !!localStorage.getItem(key(uid)) } catch { return false }
}

export function faceIdDeclined(uid: string): boolean {
  try { return localStorage.getItem(declinedKey(uid)) === '1' } catch { return false }
}

export function declineFaceId(uid: string) {
  try { localStorage.setItem(declinedKey(uid), '1') } catch {}
}

export function disableFaceId(uid: string) {
  try { localStorage.removeItem(key(uid)) } catch {}
}

/** Creates the device credential. Resolves true only when the phone confirmed it is you. */
export async function enableFaceId(uid: string, email: string): Promise<boolean> {
  try {
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge: bytes(32),
        rp: { name: 'Jobyra', id: window.location.hostname },
        user: { id: new TextEncoder().encode(uid).slice(0, 64), name: email || 'Jobyra', displayName: email || 'Jobyra' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
        timeout: 60000,
      },
    })) as PublicKeyCredential | null
    if (!cred) return false
    localStorage.setItem(key(uid), b64(cred.rawId))
    return true
  } catch {
    return false
  }
}

/** Asks the phone to recognise you. Resolves true only on a successful Face ID / fingerprint check. */
export async function verifyFaceId(uid: string): Promise<boolean> {
  try {
    const id = localStorage.getItem(key(uid))
    if (!id) return false
    const res = await navigator.credentials.get({
      publicKey: {
        challenge: bytes(32),
        rpId: window.location.hostname,
        allowCredentials: [{ type: 'public-key', id: unb64(id), transports: ['internal'] }],
        userVerification: 'required',
        timeout: 60000,
      },
    })
    return !!res
  } catch {
    return false
  }
}
