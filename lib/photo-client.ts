// Browser-only photo work: reading a picture from the phone's camera or library and shrinking it before it is saved,
// so each photo is a few hundred kilobytes instead of several megabytes.

import { supabase } from '@/lib/supabase'
import { FULL_MAX, PHOTO_BUCKET, THUMB_MAX, fitWithin } from '@/lib/photos'

type Decoded = { source: CanvasImageSource; width: number; height: number; close: () => void }

async function decode(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') {
    try {
      // Honours the way the camera was held, so portrait photos are not saved on their side
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() }
    } catch {
      // fall through to the slower way
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) }
  } catch {
    URL.revokeObjectURL(url)
    throw new Error('That photo could not be read. Try a JPEG or PNG picture.')
  }
}

function draw(source: CanvasImageSource, from: { width: number; height: number }, to: { width: number; height: number }) {
  const canvas = document.createElement('canvas')
  canvas.width = to.width
  canvas.height = to.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('This browser cannot prepare photos.')
  // Pictures with a see-through background would turn black as a JPEG
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, to.width, to.height)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, from.width, from.height, 0, 0, to.width, to.height)
  return canvas
}

const toBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not prepare the photo.'))), 'image/jpeg', quality))

/** The picture shrunk to at most 1600 pixels across, plus a small preview. */
export async function compressPhoto(file: File): Promise<{ full: Blob; thumb: Blob; width: number; height: number }> {
  const d = await decode(file)
  try {
    const size = fitWithin(d.width, d.height, FULL_MAX)
    const fullCanvas = draw(d.source, d, size)
    const small = fitWithin(size.width, size.height, THUMB_MAX)
    const thumbCanvas = draw(fullCanvas, size, small)
    const [full, thumb] = await Promise.all([toBlob(fullCanvas, 0.82), toBlob(thumbCanvas, 0.7)])
    return { full, thumb, width: size.width, height: size.height }
  } finally {
    d.close()
  }
}

/** Removes the stored pictures for these visits. Best effort: it never stops the visit from being deleted. */
export async function removeFilesForVisits(visitIds: string[]) {
  try {
    if (visitIds.length === 0) return
    const { data } = await supabase.from('visit_photos').select('path, thumb_path').in('visit_id', visitIds)
    const paths = (data || []).flatMap((r: { path: string; thumb_path: string }) => [r.path, r.thumb_path])
    for (let i = 0; i < paths.length; i += 100) await supabase.storage.from(PHOTO_BUCKET).remove(paths.slice(i, i + 100))
  } catch {
    // leave any files behind rather than block the delete
  }
}
