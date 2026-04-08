'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cropper from 'react-easy-crop'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { useBusinessData } from '@/lib/business-context'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#475569'
const BORDER = '#E2E8F0'
const BG = '#FAFAFA'
const WHITE = '#FFFFFF'
const HEADER_BG = '#111111'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const LOGO_BUCKET = 'business-logos'

interface Platform {
  id: string
  name: string
  url: string
}

const TYPE = {
  label: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.08em' as const,
    textTransform: 'uppercase' as const,
    color: TEXT3,
  },
  bodySm: {
    fontSize: '11px',
    fontWeight: 500,
    color: TEXT3,
    lineHeight: 1.45,
  },
  title: {
    fontSize: '13px',
    fontWeight: 700,
    color: TEXT2,
    lineHeight: 1.35,
  },
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile
}

async function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', error => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Canvas empty'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { refresh } = useBusinessData()
  const isMobile = useIsMobile()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [businessId, setBusinessId] = useState('')
  const [userId, setUserId] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('logo.png')
  const [showCropper, setShowCropper] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const [business, setBusiness] = useState({
    name: '',
    email: '',
    phone: '',
    logo_url: '',
  })

  const [userProfile, setUserProfile] = useState({
    full_name: '',
    role_title: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setUserId(session.user.id)

      const { data: userData } = await supabase
        .from('users')
        .select('business_id, full_name, role_title')
        .eq('id', session.user.id)
        .single()

      if (!userData) return

      setBusinessId(userData.business_id)

      setUserProfile({
        full_name: userData.full_name || '',
        role_title: userData.role_title || '',
      })

      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', userData.business_id)
        .single()

      if (businessData) {
        setBusiness({
          name: businessData.name || '',
          email: businessData.email || '',
          phone: businessData.phone || '',
          logo_url: businessData.logo_url || '',
        })
      }

      setLoading(false)
    }

    load()
  }, [router])

  async function handleCropAndUpload() {
    if (!selectedImage || !croppedAreaPixels || !businessId) return

    try {
      setUploadingLogo(true)

      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels)
      const filePath = `${businessId}/logo-${Date.now()}.png`

      await supabase.storage.from(LOGO_BUCKET).upload(filePath, croppedBlob, {
        upsert: true,
        contentType: 'image/png',
      })

      const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(filePath)

      setBusiness(prev => ({ ...prev, logo_url: data.publicUrl }))

      setShowCropper(false)
      setSelectedImage('')
      setZoom(1)
      setCrop({ x: 0, y: 0 })

      setUploadingLogo(false)
    } catch {
      setUploadError('Upload failed.')
      setUploadingLogo(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    setSaving(true)

    await Promise.all([
      supabase.from('businesses').update({
        name: business.name,
        email: business.email,
        phone: business.phone,
        logo_url: business.logo_url,
      }).eq('id', businessId),

      supabase.from('users').update({
        full_name: userProfile.full_name,
        role_title: userProfile.role_title,
      }).eq('id', userId),
    ])

    refresh()

    setSaving(false)
    setSaved(true)

    setTimeout(() => setSaved(false), 3000)
  }

  const shellCard: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
    overflow: 'hidden',
  }

  const input: React.CSSProperties = {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    borderRadius: '10px',
    border: `1px solid ${BORDER}`,
    background: WHITE,
    fontSize: '13px',
  }

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: BG }}>
      <Sidebar active="/dashboard/settings" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{
          ...shellCard,
          padding: '22px 24px',
          background: HEADER_BG,
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.68)' }}>{todayStr}</div>

          <div style={{
            fontSize: '34px',
            fontWeight: 900,
            color: WHITE,
            marginTop: '8px',
          }}>
            Settings
          </div>

          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.72)',
            marginTop: '8px',
          }}>
            Manage your profile, business branding, and account settings.
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            {saved && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)',
                color: WHITE,
                fontSize: '12px',
              }}>
                Saved
              </div>
            )}

            <button
              form="settings-form"
              type="submit"
              style={{
                background: TEAL,
                color: WHITE,
                border: 'none',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              <IconSpark /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <form id="settings-form" onSubmit={handleSave}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ ...shellCard, padding: '20px' }}>
              <div style={{ ...TYPE.title, marginBottom: '14px' }}>Profile</div>

              <div style={{ display: 'grid', gap: '14px' }}>
                <input style={input} value={userProfile.full_name} onChange={e => setUserProfile(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Your Name" />
                <input style={input} value={userProfile.role_title} onChange={e => setUserProfile(prev => ({ ...prev, role_title: e.target.value }))} placeholder="Role Title" />
              </div>
            </div>

            <div style={{ ...shellCard, padding: '20px' }}>
              <div style={{ ...TYPE.title, marginBottom: '14px' }}>Business</div>

              <div style={{ display: 'grid', gap: '14px' }}>
                <input style={input} value={business.name} onChange={e => setBusiness(prev => ({ ...prev, name: e.target.value }))} placeholder="Business Name" />
                <input style={input} value={business.phone} onChange={e => setBusiness(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone" />
                <input style={input} value={business.email} onChange={e => setBusiness(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" />
              </div>
            </div>
          </div>
        </form>
      </div>

      {showCropper && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{ background: WHITE, padding: '20px', borderRadius: '16px', width: '500px' }}>
            <Cropper
              image={selectedImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
            />

            <button onClick={handleCropAndUpload}>Save Image</button>
          </div>
        </div>
      )}
    </div>
  )
}