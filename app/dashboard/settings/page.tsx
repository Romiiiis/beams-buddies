'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cropper from 'react-easy-crop'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { useBusinessData } from '@/lib/business-context'

const TEAL = '#1F9E94'
const TEAL_DARK = '#177A72'
const RED = '#B91C1C'
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
  body: {
    fontSize: '12px',
    fontWeight: 500,
    color: TEXT2,
    lineHeight: 1.45,
  },
  titleSm: {
    fontSize: '12px',
    fontWeight: 800,
    color: TEXT,
    lineHeight: 1.3,
  },
  title: {
    fontSize: '13px',
    fontWeight: 700,
    color: TEXT2,
    lineHeight: 1.35,
  },
  valueLg: {
    fontSize: '28px',
    fontWeight: 900,
    letterSpacing: '-0.05em' as const,
    lineHeight: 1,
  },
  valueMd: {
    fontSize: '20px',
    fontWeight: 900,
    color: TEXT,
    letterSpacing: '-0.04em' as const,
    lineHeight: 1,
  },
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768)
    }
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
        reject(new Error('Canvas is empty'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })
}

function IconSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconPercent({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m19 5-14 14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="17" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.9" />
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

  const [form, setForm] = useState({
    google_review_url: '',
    facebook_review_url: '',
    review_discount_amount: '10',
    review_discount_max: '30',
    review_discount_enabled: true,
  })

  const [bankDetails, setBankDetails] = useState({
    bank_name: '',
    account_name: '',
    bsb: '',
    account_number: '',
    payment_terms: '14',
    invoice_notes: '',
  })

  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('logo.png')
  const [showCropper, setShowCropper] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
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

      if (!userData) {
        setLoading(false)
        return
      }

      setBusinessId(userData.business_id)
      setUserProfile({
        full_name: userData.full_name || '',
        role_title: userData.role_title || '',
      })

      const [businessRes, settingsRes] = await Promise.all([
        supabase.from('businesses').select('*').eq('id', userData.business_id).single(),
        supabase.from('business_settings').select('*').eq('business_id', userData.business_id).single(),
      ])

      if (businessRes.data) {
        setBusiness({
          name: businessRes.data.name || '',
          email: businessRes.data.email || '',
          phone: businessRes.data.phone || '',
          logo_url: businessRes.data.logo_url || '',
        })
      }

      if (settingsRes.data) {
        setForm({
          google_review_url: settingsRes.data.google_review_url || '',
          facebook_review_url: settingsRes.data.facebook_review_url || '',
          review_discount_amount: settingsRes.data.review_discount_amount?.toString() || '10',
          review_discount_max: settingsRes.data.review_discount_max?.toString() || '30',
          review_discount_enabled: settingsRes.data.review_discount_enabled ?? true,
        })

        setPlatforms(settingsRes.data.custom_review_platforms || [])

        setBankDetails({
          bank_name: settingsRes.data.bank_name || '',
          account_name: settingsRes.data.account_name || '',
          bsb: settingsRes.data.bsb || '',
          account_number: settingsRes.data.account_number || '',
          payment_terms: settingsRes.data.payment_terms?.toString() || '14',
          invoice_notes: settingsRes.data.invoice_notes || '',
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
      setUploadError('')

      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels)
      const filePath = `${businessId}/logo-${Date.now()}.png`

      const { error: uploadErr } = await supabase.storage
        .from(LOGO_BUCKET)
        .upload(filePath, croppedBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/png',
        })

      if (uploadErr) {
        setUploadError(uploadErr.message || 'Logo upload failed.')
        setUploadingLogo(false)
        return
      }

      const { data: publicData } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(filePath)

      if (!publicData?.publicUrl) {
        setUploadError('Could not generate a public logo URL.')
        setUploadingLogo(false)
        return
      }

      setBusiness(prev => ({ ...prev, logo_url: publicData.publicUrl }))
      setShowCropper(false)
      setSelectedImage('')
      setSelectedFileName('logo.png')
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      setUploadingLogo(false)
    } catch (err: any) {
      setUploadError(err?.message || 'Could not crop and upload image.')
      setUploadingLogo(false)
    }
  }

  function removeLogo() {
    setBusiness(prev => ({ ...prev, logo_url: '' }))
    setUploadError('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    await Promise.all([
      supabase
        .from('businesses')
        .update({
          name: business.name,
          logo_url: business.logo_url || null,
          phone: business.phone,
          email: business.email,
        })
        .eq('id', businessId),

      supabase
        .from('users')
        .update({
          full_name: userProfile.full_name,
          role_title: userProfile.role_title,
        })
        .eq('id', userId),

      supabase.from('business_settings').upsert(
        {
          business_id: businessId,
          google_review_url: form.google_review_url || null,
          facebook_review_url: form.facebook_review_url || null,
          review_discount_amount: parseFloat(form.review_discount_amount) || 10,
          review_discount_max: parseFloat(form.review_discount_max) || 30,
          review_discount_enabled: form.review_discount_enabled,
          custom_review_platforms: platforms,
          bank_name: bankDetails.bank_name || null,
          account_name: bankDetails.account_name || null,
          bsb: bankDetails.bsb || null,
          account_number: bankDetails.account_number || null,
          payment_terms: parseInt(bankDetails.payment_terms) || 14,
          invoice_notes: bankDetails.invoice_notes || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'business_id' }
      ),
    ])

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    refresh()
  }

  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function setBiz(field: string, value: any) {
    setBusiness(prev => ({ ...prev, [field]: value }))
  }

  function setUser(field: string, value: string) {
    setUserProfile(prev => ({ ...prev, [field]: value }))
  }

  function setBank(field: string, value: string) {
    setBankDetails(prev => ({ ...prev, [field]: value }))
  }

  function addPlatform() {
    setPlatforms(prev => [...prev, { id: crypto.randomUUID(), name: '', url: '' }])
  }

  function updatePlatform(id: string, field: 'name' | 'url', value: string) {
    setPlatforms(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)))
  }

  function removePlatform(id: string) {
    setPlatforms(prev => prev.filter(p => p.id !== id))
  }

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const input: React.CSSProperties = {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    borderRadius: '10px',
    border: `1px solid ${BORDER}`,
    background: WHITE,
    color: TEXT,
    fontFamily: FONT,
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const textArea: React.CSSProperties = {
    ...input,
    height: '88px',
    padding: '10px 12px',
    resize: 'none',
  }

  const selectStyle: React.CSSProperties = {
    ...input,
    appearance: 'none',
  }

  const label: React.CSSProperties = {
    ...TYPE.label,
    marginBottom: '6px',
    display: 'block',
  }

  const hint: React.CSSProperties = {
    ...TYPE.bodySm,
    marginTop: '4px',
  }

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    overflow: 'hidden',
  }

  const sideCard: React.CSSProperties = {
    ...card,
    padding: '16px',
    borderRadius: '16px',
  }

  const sectionHeaderTitle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 800,
    color: TEXT,
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  }

  function SectionHeader({
    title,
    description,
    action,
  }: {
    title: string
    description: string
    action?: React.ReactNode
  }) {
    return (
      <div
        style={{
          padding: '14px 16px 12px',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '10px',
        }}
      >
        <div>
          <div style={sectionHeaderTitle}>{title}</div>
          <div style={{ ...TYPE.bodySm }}>{description}</div>
        </div>
        {action}
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/settings" />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: TEXT3,
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Loading settings...
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        fontFamily: FONT,
        background: BG,
        minHeight: '100vh',
      }}
    >
      <Sidebar active="/dashboard/settings" />

      <div style={{ flex: 1, minWidth: 0, background: BG }}>
        <div
          style={{
            padding: isMobile ? '14px' : '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '60px',
          }}
        >
          <div
            style={{
              ...card,
              padding: isMobile ? '18px 16px 16px' : '22px 24px 20px',
              background: HEADER_BG,
              border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: isMobile ? 0 : '16px',
              marginLeft: isMobile ? '-14px' : 0,
              marginRight: isMobile ? '-14px' : 0,
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.68)', marginBottom: '6px' }}>
              {todayStr}
            </div>

            <div
              style={{
                fontSize: isMobile ? '26px' : '34px',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                fontWeight: 900,
                color: WHITE,
                marginBottom: '8px',
              }}
            >
              Settings
            </div>

            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.72)',
                maxWidth: '760px',
              }}
            >
              Manage your profile, business branding, invoicing details, and review settings from one premium admin page.
            </div>

            <div
              style={{
                marginTop: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              {saved && (
                <span
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.12)',
                    color: WHITE,
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  Saved
                </span>
              )}

              <button
                form="settings-form"
                type="submit"
                disabled={saving || uploadingLogo}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: saving || uploadingLogo ? 'not-allowed' : 'pointer',
                  fontFamily: FONT,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: TEAL,
                  color: WHITE,
                  border: 'none',
                  borderRadius: '10px',
                  opacity: saving || uploadingLogo ? 0.7 : 1,
                }}
              >
                <IconSpark size={14} />
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>

          <form id="settings-form" onSubmit={handleSave} style={{ display: 'grid', gap: '14px' }}>
            <div style={card}>
              <SectionHeader
                title="Your profile"
                description="Update the details shown on your account and sidebar."
              />

              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={label}>Your name</label>
                    <input style={input} value={userProfile.full_name} onChange={e => setUser('full_name', e.target.value)} placeholder="Ramiz Arib" />
                    <p style={hint}>Shown in the bottom left of the sidebar</p>
                  </div>

                  <div>
                    <label style={label}>Your title</label>
                    <input style={input} value={userProfile.role_title} onChange={e => setUser('role_title', e.target.value)} placeholder="Owner" />
                    <p style={hint}>Shown below your name in the sidebar</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={card}>
              <SectionHeader
                title="Business profile"
                description="Set your core business details and brand identity."
              />

              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={label}>Business name</label>
                    <input style={input} value={business.name} onChange={e => setBiz('name', e.target.value)} placeholder="Your business name" />
                    <p style={hint}>Shown as subtitle under Jobyra in the sidebar</p>
                  </div>

                  <div>
                    <label style={label}>Phone</label>
                    <input style={input} value={business.phone} onChange={e => setBiz('phone', e.target.value)} placeholder="0400 000 000" />
                  </div>

                  <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                    <label style={label}>Email</label>
                    <input style={input} value={business.email} onChange={e => setBiz('email', e.target.value)} placeholder="hello@yourbusiness.com" />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '16px',
                    borderRadius: '12px',
                    background: '#F8FAFC',
                    border: `1px solid ${BORDER}`,
                    padding: isMobile ? '14px' : '16px',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: WHITE,
                      border: `1px solid ${BORDER}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {business.logo_url ? (
                      <img src={business.logo_url} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '11px', color: TEXT3 }}>No logo</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...TYPE.title, fontSize: '14px', marginBottom: '4px' }}>Business logo</div>
                    <div style={TYPE.bodySm}>Appears in the sidebar next to your name.</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <label
                      htmlFor="logo-upload"
                      style={{
                        height: '38px',
                        padding: '0 16px',
                        borderRadius: '8px',
                        border: `1px solid ${BORDER}`,
                        background: WHITE,
                        color: TEXT2,
                        fontSize: '12px',
                        cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                        fontFamily: FONT,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: uploadingLogo ? 0.7 : 1,
                        fontWeight: 700,
                      }}
                    >
                      {uploadingLogo ? 'Uploading...' : 'Upload image'}
                    </label>

                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      style={{ display: 'none' }}
                      disabled={uploadingLogo}
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploadError('')
                        setSelectedFileName(file.name)
                        const reader = new FileReader()
                        reader.onload = () => {
                          setSelectedImage(reader.result as string)
                          setCrop({ x: 0, y: 0 })
                          setZoom(1)
                          setShowCropper(true)
                        }
                        reader.readAsDataURL(file)
                        e.currentTarget.value = ''
                      }}
                    />

                    {business.logo_url && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        style={{
                          height: '38px',
                          padding: '0 16px',
                          borderRadius: '8px',
                          border: `1px solid ${BORDER}`,
                          background: WHITE,
                          color: RED,
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontFamily: FONT,
                          fontWeight: 700,
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {uploadError ? <p style={{ ...hint, color: RED }}>{uploadError}</p> : <p style={hint}>PNG, JPG, WEBP, or SVG. You can crop before saving.</p>}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 320px',
                gap: '14px',
                alignItems: 'start',
              }}
            >
              <div style={card}>
                <SectionHeader
                  title="Payment & bank details"
                  description="These details are printed on invoices sent to customers."
                />

                <div style={{ padding: '14px 16px' }}>
                  <div
                    style={{
                      padding: '14px 16px',
                      background: '#F0F9F8',
                      borderRadius: '10px',
                      border: '1px solid #CCEFED',
                      fontSize: '13px',
                      color: TEXT2,
                      lineHeight: 1.6,
                      marginBottom: '16px',
                    }}
                  >
                    Keep these accurate so payments land correctly and invoice terms stay clear.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={label}>Bank name</label>
                      <input style={input} value={bankDetails.bank_name} onChange={e => setBank('bank_name', e.target.value)} placeholder="e.g. Commonwealth Bank" />
                    </div>

                    <div>
                      <label style={label}>Account name</label>
                      <input style={input} value={bankDetails.account_name} onChange={e => setBank('account_name', e.target.value)} placeholder="e.g. Ramiz Arib Pty Ltd" />
                    </div>

                    <div>
                      <label style={label}>BSB</label>
                      <input style={input} value={bankDetails.bsb} onChange={e => setBank('bsb', e.target.value)} placeholder="062-000" />
                      <p style={hint}>6 digits, format: XXX-XXX</p>
                    </div>

                    <div>
                      <label style={label}>Account number</label>
                      <input style={input} value={bankDetails.account_number} onChange={e => setBank('account_number', e.target.value)} placeholder="12345678" />
                    </div>

                    <div>
                      <label style={label}>Payment terms (days)</label>
                      <select style={selectStyle} value={bankDetails.payment_terms} onChange={e => setBank('payment_terms', e.target.value)}>
                        <option value="7">7 days</option>
                        <option value="14">14 days</option>
                        <option value="21">21 days</option>
                        <option value="30">30 days</option>
                      </select>
                      <p style={hint}>Shown on invoice as "Due within X days"</p>
                    </div>

                    <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                      <label style={label}>Default invoice notes</label>
                      <textarea
                        style={textArea}
                        value={bankDetails.invoice_notes}
                        onChange={e => setBank('invoice_notes', e.target.value)}
                        placeholder="e.g. Please include invoice number as reference. Thank you for your business!"
                      />
                      <p style={hint}>Printed at the bottom of every invoice</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={sideCard}>
                  <div style={{ ...TYPE.label, marginBottom: '4px' }}>Invoice preview</div>

                  {(bankDetails.bsb || bankDetails.account_number || bankDetails.bank_name || bankDetails.account_name) ? (
                    <div style={{ marginTop: '14px', display: 'grid', gap: '8px' }}>
                      {bankDetails.bank_name ? (
                        <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                          <div style={{ ...TYPE.label, marginBottom: '4px' }}>Bank</div>
                          <div style={{ ...TYPE.valueMd, fontSize: '16px' }}>{bankDetails.bank_name}</div>
                        </div>
                      ) : null}

                      {bankDetails.account_name ? (
                        <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                          <div style={{ ...TYPE.label, marginBottom: '4px' }}>Account name</div>
                          <div style={{ ...TYPE.valueMd, fontSize: '16px' }}>{bankDetails.account_name}</div>
                        </div>
                      ) : null}

                      {bankDetails.bsb ? (
                        <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                          <div style={{ ...TYPE.label, marginBottom: '4px' }}>BSB</div>
                          <div style={{ ...TYPE.valueMd, fontSize: '16px', fontFamily: 'monospace' }}>{bankDetails.bsb}</div>
                        </div>
                      ) : null}

                      {bankDetails.account_number ? (
                        <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                          <div style={{ ...TYPE.label, marginBottom: '4px' }}>Account no.</div>
                          <div style={{ ...TYPE.valueMd, fontSize: '16px', fontFamily: 'monospace' }}>{bankDetails.account_number}</div>
                        </div>
                      ) : null}

                      <div
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: '#E6F7F6',
                          border: '1px solid #C4E8E5',
                        }}
                      >
                        <div style={{ ...TYPE.label, marginBottom: '4px', color: TEAL_DARK }}>Terms</div>
                        <div style={{ ...TYPE.valueMd, fontSize: '16px', color: TEAL_DARK }}>
                          Due within {bankDetails.payment_terms} days
                        </div>
                      </div>

                      {bankDetails.invoice_notes ? (
                        <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                          <div style={{ ...TYPE.label, marginBottom: '4px' }}>Notes</div>
                          <div style={TYPE.bodySm}>{bankDetails.invoice_notes}</div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: '14px',
                        padding: '20px 14px',
                        borderRadius: '10px',
                        background: '#F8FAFC',
                        border: `1px solid ${BORDER}`,
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: TEXT3,
                      }}
                    >
                      Add bank details to preview your invoice payment section.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={card}>
              <SectionHeader
                title="Review platforms"
                description="Add the links shown to customers after each installation."
              />

              <div style={{ padding: '14px 16px' }}>
                <div
                  style={{
                    fontSize: '13px',
                    color: TEXT2,
                    lineHeight: 1.6,
                    padding: '14px 16px',
                    background: '#F0F9F8',
                    borderRadius: '10px',
                    border: '1px solid #CCEFED',
                    marginBottom: '16px',
                  }}
                >
                  Add your review page links below. These appear on the customer registration page after each installation.
                </div>

                <div style={{ display: 'grid', gap: '14px' }}>
                  <div>
                    <label style={label}>Google review link</label>
                    <input style={input} value={form.google_review_url} onChange={e => set('google_review_url', e.target.value)} placeholder="https://g.page/r/your-business/review" />
                    <p style={hint}>Find this in your Google Business Profile → Get more reviews</p>
                  </div>

                  <div>
                    <label style={label}>Facebook review link</label>
                    <input style={input} value={form.facebook_review_url} onChange={e => set('facebook_review_url', e.target.value)} placeholder="https://www.facebook.com/your-page/reviews" />
                    <p style={hint}>Go to your Facebook page → Reviews tab → copy the URL</p>
                  </div>

                  {platforms.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ ...TYPE.title, fontSize: '13px' }}>Additional platforms</div>
                      {platforms.map(p => (
                        <div
                          key={p.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr auto',
                            gap: '10px',
                            alignItems: 'center',
                            padding: '12px',
                            background: '#F8FAFC',
                            border: `1px solid ${BORDER}`,
                            borderRadius: '10px',
                          }}
                        >
                          {!isMobile && (
                            <input style={input} value={p.name} onChange={e => updatePlatform(p.id, 'name', e.target.value)} placeholder="Platform name" />
                          )}
                          <input style={input} value={p.url} onChange={e => updatePlatform(p.id, 'url', e.target.value)} placeholder="https://..." />
                          <button
                            type="button"
                            onClick={() => removePlatform(p.id)}
                            style={{
                              height: '42px',
                              width: '42px',
                              borderRadius: '8px',
                              border: `1px solid ${BORDER}`,
                              background: WHITE,
                              color: RED,
                              cursor: 'pointer',
                              fontSize: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addPlatform}
                    style={{
                      height: '38px',
                      padding: '0 16px',
                      borderRadius: '8px',
                      border: `1px dashed ${BORDER}`,
                      background: 'transparent',
                      color: TEXT2,
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily: FONT,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      width: 'fit-content',
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>+</span> Add another platform
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 320px',
                gap: '14px',
                alignItems: 'start',
              }}
            >
              <div style={card}>
                <SectionHeader
                  title="Review discount"
                  description="Control the offer shown after customers leave reviews."
                />

                <div style={{ padding: '14px 16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      padding: '16px',
                      background: '#F8FAFC',
                      borderRadius: '10px',
                      border: `1px solid ${BORDER}`,
                      marginBottom: '14px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: TEXT, marginBottom: '3px' }}>Enable review discount</div>
                      <div style={{ fontSize: '12px', color: TEXT3 }}>Show the discount offer on the customer registration page</div>
                    </div>

                    <div
                      onClick={() => set('review_discount_enabled', !form.review_discount_enabled)}
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        background: form.review_discount_enabled ? TEAL : '#D1D5DB',
                        cursor: 'pointer',
                        position: 'relative',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '3px',
                          left: form.review_discount_enabled ? '23px' : '3px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: WHITE,
                          transition: 'left 0.15s',
                        }}
                      />
                    </div>
                  </div>

                  {form.review_discount_enabled && (
                    <div style={{ display: 'grid', gap: '14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={label}>Discount per review ($)</label>
                          <input type="number" min="1" style={input} value={form.review_discount_amount} onChange={e => set('review_discount_amount', e.target.value)} placeholder="10" />
                          <p style={hint}>Amount off their next service per review left</p>
                        </div>

                        <div>
                          <label style={label}>Maximum discount ($)</label>
                          <input type="number" min="1" style={input} value={form.review_discount_max} onChange={e => set('review_discount_max', e.target.value)} placeholder="30" />
                          <p style={hint}>Cap on total discount across all platforms</p>
                        </div>
                      </div>

                      <div
                        style={{
                          borderRadius: '12px',
                          background: '#F8FAFC',
                          border: `1px solid ${BORDER}`,
                          padding: '14px 16px',
                        }}
                      >
                        <div style={{ ...TYPE.title, color: TEAL_DARK, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <IconPercent size={16} />
                          Customer preview
                        </div>
                        <div style={{ fontSize: '13px', color: TEXT2, lineHeight: 1.7 }}>
                          For each review left below, receive <strong>${form.review_discount_amount || '10'} off</strong> your next service. Up to <strong>${form.review_discount_max || '30'} total</strong>.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={sideCard}>
                  <div style={{ ...TYPE.label, marginBottom: '4px' }}>Quick actions</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                    <button
                      form="settings-form"
                      type="submit"
                      disabled={saving || uploadingLogo}
                      style={{
                        width: '100%',
                        height: '34px',
                        background: TEAL,
                        color: WHITE,
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: saving || uploadingLogo ? 'not-allowed' : 'pointer',
                        fontFamily: FONT,
                        opacity: saving || uploadingLogo ? 0.7 : 1,
                      }}
                    >
                      {saving ? 'Saving...' : 'Save changes'}
                    </button>

                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      style={{
                        width: '100%',
                        height: '34px',
                        background: '#F8FAFC',
                        border: `1px solid ${BORDER}`,
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: FONT,
                        color: TEXT2,
                      }}
                    >
                      Reset view
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {showCropper && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: WHITE,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              border: `1px solid ${BORDER}`,
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ ...TYPE.label, color: TEAL, marginBottom: '4px' }}>Upload</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: TEXT }}>Adjust logo</div>
              <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{selectedFileName}</div>
            </div>

            <div style={{ padding: '18px' }}>
              <div style={{ position: 'relative', width: '100%', height: '320px', background: '#111', borderRadius: '12px', overflow: 'hidden' }}>
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  restrictPosition={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                />
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ ...label, marginBottom: '8px' }}>Zoom</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCropper(false)
                    setSelectedImage('')
                    setSelectedFileName('logo.png')
                    setCrop({ x: 0, y: 0 })
                    setZoom(1)
                    setCroppedAreaPixels(null)
                  }}
                  style={{
                    height: '38px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    border: `1px solid ${BORDER}`,
                    background: WHITE,
                    color: TEXT2,
                    cursor: 'pointer',
                    fontFamily: FONT,
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCropAndUpload}
                  disabled={uploadingLogo}
                  style={{
                    height: '38px',
                    padding: '0 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: TEAL,
                    color: WHITE,
                    cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                    opacity: uploadingLogo ? 0.7 : 1,
                    fontFamily: FONT,
                    fontWeight: 700,
                  }}
                >
                  {uploadingLogo ? 'Saving...' : 'Save image'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}