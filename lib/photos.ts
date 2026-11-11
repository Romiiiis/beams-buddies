// Photos on visits: shared names, sizes and types. No imports, so it also runs in Node tests.

export const PHOTO_BUCKET = 'visit-photos'
export const MAX_PHOTOS_PER_VISIT = 40
/** Longest side of the saved picture, and of the small preview shown in lists. */
export const FULL_MAX = 1600
export const THUMB_MAX = 360

export type PhotoTag = 'before' | 'after'
export const TAGS: { value: PhotoTag; label: string }[] = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
]

export type VisitPhoto = {
  id: string
  business_id?: string
  visit_id: string
  /** Set when the photo was taken for a step of a checklist */
  checklist_id: string | null
  item_id: string | null
  path: string
  thumb_path: string
  caption: string | null
  tag: PhotoTag | null
  width: number | null
  height: number | null
  created_at: string
}

/** The size a picture shrinks to so its longest side is at most `max`. Pictures already smaller are left alone. */
export function fitWithin(width: number, height: number, max: number) {
  const longest = Math.max(width, height, 1)
  const scale = Math.min(1, max / longest)
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

/** Where a photo and its small preview are kept. The business and visit come first, which is what the access rules check. */
export function photoPaths(businessId: string, visitId: string, photoId: string) {
  const base = `${businessId}/${visitId}/${photoId}`
  return { path: `${base}.jpg`, thumb: `${base}_t.jpg` }
}

/** Files in a pick that look like pictures, and how many of them still fit on the visit. */
export function acceptFiles<T extends { type: string; name: string }>(files: T[], already: number) {
  const pictures = files.filter(f => /^image\//i.test(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name))
  const room = Math.max(0, MAX_PHOTOS_PER_VISIT - already)
  return { use: pictures.slice(0, room), skippedNotPictures: files.length - pictures.length, skippedOverLimit: Math.max(0, pictures.length - room) }
}

export const tagLabel = (t: PhotoTag | null | undefined) => TAGS.find(x => x.value === t)?.label || ''
