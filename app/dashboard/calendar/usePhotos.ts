'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { compressPhoto } from '@/lib/photo-client'
import { MAX_PHOTOS_PER_VISIT, PHOTO_BUCKET, type PhotoTag, type VisitPhoto, acceptFiles, photoPaths } from '@/lib/photos'

const COLUMNS = 'id, business_id, visit_id, checklist_id, item_id, path, thumb_path, caption, tag, width, height, created_at'
// Signed addresses stop working after this long; the page asks again when it needs a picture
const URL_SECONDS = 3600

export type PhotosApi = ReturnType<typeof usePhotos>

/**
 * The photos of one visit: loads them, adds new ones (shrinking each first), changes captions and tags, deletes.
 * Previews come first and the full pictures are only asked for when one is opened or printed.
 */
export function usePhotos(businessId: string, visitId: string | undefined) {
  const [photos, setPhotos] = useState<VisitPhoto[]>([])
  const [thumbs, setThumbs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(!!visitId)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState('')
  const photosRef = useRef<VisitPhoto[]>([])
  photosRef.current = photos

  const sign = useCallback(async (paths: string[]) => {
    const out: Record<string, string> = {}
    if (paths.length === 0) return out
    const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, URL_SECONDS)
    for (const r of data || []) if (r.path && r.signedUrl) out[r.path] = r.signedUrl
    return out
  }, [])

  const signThumbs = useCallback(
    async (rows: VisitPhoto[]) => {
      const urls = await sign(rows.map(r => r.thumb_path))
      const mapped: Record<string, string> = {}
      for (const r of rows) if (urls[r.thumb_path]) mapped[r.id] = urls[r.thumb_path]
      setThumbs(prev => ({ ...prev, ...mapped }))
    },
    [sign]
  )

  useEffect(() => {
    if (!visitId) return
    let cancelled = false
    setLoading(true)
    supabase
      .from('visit_photos')
      .select(COLUMNS)
      .eq('visit_id', visitId)
      .order('created_at')
      .then(async ({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          setError('Photos could not be loaded.')
          setLoading(false)
          return
        }
        const rows = (data || []) as VisitPhoto[]
        setPhotos(rows)
        setLoading(false)
        await signThumbs(rows)
      })
    return () => {
      cancelled = true
    }
  }, [visitId, signThumbs])

  /** Adds pictures one after another. Returns the ones that were saved. */
  const add = useCallback(
    async (files: File[], opts: { checklistId?: string; itemId?: string; tag?: PhotoTag } = {}) => {
      if (!visitId) return []
      setError('')
      const { use, skippedNotPictures, skippedOverLimit } = acceptFiles(files, photosRef.current.length)
      const added: VisitPhoto[] = []
      let failed = ''
      setProgress({ done: 0, total: use.length })
      for (let i = 0; i < use.length; i++) {
        try {
          const { full, thumb, width, height } = await compressPhoto(use[i])
          const id = crypto.randomUUID()
          const names = photoPaths(businessId, visitId, id)
          const bucket = supabase.storage.from(PHOTO_BUCKET)
          const up1 = await bucket.upload(names.path, full, { contentType: 'image/jpeg', upsert: false })
          if (up1.error) throw new Error(up1.error.message)
          const up2 = await bucket.upload(names.thumb, thumb, { contentType: 'image/jpeg', upsert: false })
          if (up2.error) {
            await bucket.remove([names.path])
            throw new Error(up2.error.message)
          }
          const ins = await supabase
            .from('visit_photos')
            .insert({ id, business_id: businessId, visit_id: visitId, checklist_id: opts.checklistId || null, item_id: opts.itemId || null, path: names.path, thumb_path: names.thumb, tag: opts.tag || null, width, height })
            .select(COLUMNS)
            .single()
          if (ins.error || !ins.data) {
            await bucket.remove([names.path, names.thumb])
            throw new Error(ins.error?.message || 'Could not save the photo.')
          }
          const row = ins.data as unknown as VisitPhoto
          added.push(row)
          setPhotos(prev => [...prev, row])
          void signThumbs([row])
        } catch (e) {
          failed = e instanceof Error ? e.message : 'A photo could not be saved.'
        }
        setProgress({ done: i + 1, total: use.length })
      }
      setProgress(null)
      const notes: string[] = []
      if (skippedNotPictures) notes.push(`${skippedNotPictures} file${skippedNotPictures === 1 ? ' was' : 's were'} not a picture.`)
      if (skippedOverLimit) notes.push(`A visit can hold up to ${MAX_PHOTOS_PER_VISIT} photos.`)
      const message = [failed, ...notes].filter(Boolean).join(' ')
      if (message) setError(message)
      return added
    },
    [businessId, visitId, signThumbs]
  )

  const update = useCallback(async (id: string, patch: { caption?: string | null; tag?: PhotoTag | null }) => {
    setPhotos(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)))
    const { error: err } = await supabase.from('visit_photos').update(patch).eq('id', id)
    if (err) setError('That change could not be saved.')
  }, [])

  const remove = useCallback(async (id: string) => {
    const p = photosRef.current.find(x => x.id === id)
    if (!p) return false
    const { error: err } = await supabase.from('visit_photos').delete().eq('id', id)
    if (err) {
      setError('The photo could not be deleted.')
      return false
    }
    setPhotos(prev => prev.filter(x => x.id !== id))
    try {
      await supabase.storage.from(PHOTO_BUCKET).remove([p.path, p.thumb_path])
    } catch {
      // the row is gone, so the picture can no longer be reached from the app
    }
    return true
  }, [])

  /** Addresses for the full-size pictures, keyed by photo. */
  const fullUrls = useCallback(
    async (list: VisitPhoto[]) => {
      const urls = await sign(list.map(p => p.path))
      const out: Record<string, string> = {}
      for (const p of list) if (urls[p.path]) out[p.id] = urls[p.path]
      return out
    },
    [sign]
  )

  return { photos, thumbs, loading, progress, error, setError, add, update, remove, fullUrls, visitId }
}
