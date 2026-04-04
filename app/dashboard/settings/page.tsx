'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cropper from 'react-easy-crop'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { useBusinessData } from '@/lib/business-context'

const TEAL = '#2AA198'
const TEAL_DARK = '#1E8C84'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#6B7280'
const BORDER = '#E5E7EB'
const BG = '#F4F4F2'
const WHITE = '#FFFFFF'
const LOGO_BUCKET = 'business-logos'

interface Platform { id: string; name: string; url: string }

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
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

async function getCroppedImg(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) { reject(new Error('Canvas is empty')); return }
      resolve(blob)
    }, 'image/png')
  })
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
  const [business, setBusiness] = useState({ name: '', email: '', phone: '', logo_url: '' })
  const [userProfile, setUserProfile] = useState({ full_name: '', role_title: '' })
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
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)

      const { data: userData } = await supabase.from('users').select('business_id, full_name, role_title').eq('id', session.user.id).single()
      if (!userData) { setLoading(false); return }

      setBusinessId(userData.business_id)
      setUserProfile({ full_name: userData.full_name || '', role_title: userData.role_title || '' })

      const [businessRes, settingsRes] = await Promise.all([
        supabase.from('businesses').select('*').eq('id', userData.business_id).single(),
        supabase.from('business_settings').select('*').eq('business_id', userData.business_id).single(),
      ])

      if (businessRes.data) {
        setBusiness({ name: businessRes.data.name || '', email: businessRes.data.email || '', phone: businessRes.data.phone || '', logo_url: businessRes.data.logo_url || '' })
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
      const { error: uploadErr } = await supabase.storage.from(LOGO_BUCKET).upload(filePath, croppedBlob, { cacheControl: '3600', upsert: true, contentType: 'image/png' })
      if (uploadErr) { setUploadError(uploadErr.message || 'Logo upload failed.'); setUploadingLogo(false); return }
      const { data: publicData } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(filePath)
      if (!publicData?.publicUrl) { setUploadError('Could not generate a public logo URL.'); setUploadingLogo(false); return }
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

  function removeLogo() { setBusiness(prev => ({ ...prev, logo_url: '' })); setUploadError('') }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    await Promise.all([
      supabase.from('businesses').update({ name: business.name, logo_url: business.logo_url || null, phone: business.phone, email: business.email }).eq('id', businessId),
      supabase.from('users').update({ full_name: userProfile.full_name, role_title: userProfile.role_title }).eq('id', userId),
      supabase.from('business_settings').upsert({
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
      }, { onConflict: 'business_id' }),
    ])

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    refresh()
  }

  function set(field: string, value: any) { setForm(prev => ({ ...prev, [field]: value })) }
  function setBiz(field: string, value: any) { setBusiness(prev => ({ ...prev, [field]: value })) }
  function setUser(field: string, value: string) { setUserProfile(prev => ({ ...prev, [field]: value })) }
  function setBank(field: string, value: string) { setBankDetails(prev => ({ ...prev, [field]: value })) }
  function addPlatform() { setPlatforms(prev => [...prev, { id: crypto.randomUUID(), name: '', url: '' }]) }
  function updatePlatform(id: string, field: 'name' | 'url', value: string) { setPlatforms(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p)) }
  function removePlatform(id: string) { setPlatforms(prev => prev.filter(p => p.id !== id)) }

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pad = isMobile ? '16px' : '32px'
  const allPlatformCount = (form.google_review_url ? 1 : 0) + (form.facebook_review_url ? 1 : 0) + platforms.filter(p => p.url).length

  const input: React.CSSProperties = {
    width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px',
    border: `1px solid ${BORDER}`, background: WHITE, color: TEXT,
    fontFamily: 'inherit', fontSize: '14px', outline: 'none',
  }

  const label: React.CSSProperties = { fontSize: '13px', fontWeight: '500', color: TEXT2, marginBottom: '6px', display: 'block' }
  const hint: React.CSSProperties = { fontSize: '12px', color: TEXT3, marginTop: '4px', lineHeight: 1.5 }

  const card: React.CSSProperties = {
    background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden',
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px', fontWeight: '700', color: TEAL,
    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px',
  }

  const sHead = (label: string, sub: string) => (
    <div style={{ padding: isMobile ? '14px 16px' : '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>{sub}</div>
    </div>
  )

  const sBody: React.CSSProperties = { padding: isMobile ? '16px' : '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/settings" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{
          background: '#33B5AC',
          padding: isMobile ? '24px 16px 22px' : `32px ${pad} 28px`,
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'space-between', gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '6px', fontWeight: '500' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', color: WHITE, letterSpacing: '-0.8px', lineHeight: 1 }}>Settings</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {saved && (
              <span style={{ fontSize: '12px', color: WHITE, fontWeight: '600', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px' }}>✓ Saved</span>
            )}
            <button form="settings-form" type="submit" disabled={saving || uploadingLogo}
              style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: 'none', background: WHITE, color: TEAL_DARK, fontSize: '13px', fontWeight: '700', cursor: saving || uploadingLogo ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', opacity: saving || uploadingLogo ? 0.7 : 1 }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: `28px ${pad}`, paddingBottom: isMobile ? '90px' : '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading ? (
            <div style={{ ...card, padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
          ) : (
            <form id="settings-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* YOUR PROFILE */}
              <div>
                <div style={sectionLabel}>Account</div>
                <div style={card}>
                  {sHead('Profile', 'Your profile')}
                  <div style={sBody}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={label}>Your name</label>
                        <input style={input} value={userProfile.full_name} onChange={e => setUser('full_name', e.target.value)} placeholder="Ramiz Arib"/>
                        <p style={hint}>Shown in the bottom left of the sidebar</p>
                      </div>
                      <div>
                        <label style={label}>Your title</label>
                        <input style={input} value={userProfile.role_title} onChange={e => setUser('role_title', e.target.value)} placeholder="Owner"/>
                        <p style={hint}>Shown below your name in the sidebar</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BUSINESS PROFILE */}
              <div>
                <div style={sectionLabel}>Business</div>
                <div style={card}>
                  {sHead('Branding', 'Business profile')}
                  <div style={sBody}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={label}>Business name</label>
                        <input style={input} value={business.name} onChange={e => setBiz('name', e.target.value)} placeholder="Your business name"/>
                        <p style={hint}>Shown as subtitle under Jobyra in the sidebar</p>
                      </div>
                      <div>
                        <label style={label}>Phone</label>
                        <input style={input} value={business.phone} onChange={e => setBiz('phone', e.target.value)} placeholder="0400 000 000"/>
                      </div>
                      <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                        <label style={label}>Email</label>
                        <input style={input} value={business.email} onChange={e => setBiz('email', e.target.value)} placeholder="hello@yourbusiness.com"/>
                      </div>
                    </div>

                    {/* Logo upload */}
                    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ height: '3px', background: TEAL }} />
                      <div style={{ padding: isMobile ? '16px' : '18px 20px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '14px' }}>
                        <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: WHITE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          {business.logo_url ? (
                            <img src={business.logo_url} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                          ) : (
                            <span style={{ fontSize: '11px', color: TEXT3 }}>No logo</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT, marginBottom: '4px' }}>Business logo</div>
                          <div style={{ fontSize: '12px', color: TEXT3, lineHeight: 1.6 }}>Appears in the sidebar next to your name.</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <label htmlFor="logo-upload" style={{ height: '38px', padding: '0 16px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: '13px', cursor: uploadingLogo ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: uploadingLogo ? 0.7 : 1 }}>
                            {uploadingLogo ? 'Uploading…' : 'Upload image'}
                          </label>
                          <input id="logo-upload" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" style={{ display: 'none' }} disabled={uploadingLogo}
                            onChange={async e => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              setUploadError('')
                              setSelectedFileName(file.name)
                              const reader = new FileReader()
                              reader.onload = () => { setSelectedImage(reader.result as string); setCrop({ x: 0, y: 0 }); setZoom(1); setShowCropper(true) }
                              reader.readAsDataURL(file)
                              e.currentTarget.value = ''
                            }}
                          />
                          {business.logo_url && (
                            <button type="button" onClick={removeLogo} style={{ height: '38px', padding: '0 16px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: '#B91C1C', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Remove</button>
                          )}
                        </div>
                      </div>
                    </div>
                    {uploadError ? <p style={{ ...hint, color: '#B91C1C' }}>{uploadError}</p> : <p style={hint}>PNG, JPG, WEBP, or SVG. You can crop before saving.</p>}
                  </div>
                </div>
              </div>

              {/* BANK DETAILS */}
              <div>
                <div style={sectionLabel}>Invoicing</div>
                <div style={card}>
                  {sHead('Bank details', 'Payment & bank details')}
                  <div style={sBody}>
                    <div style={{ padding: '14px 16px', background: '#F0F9F8', borderRadius: '10px', border: '1px solid #CCEFED', fontSize: '13px', color: TEXT2, lineHeight: 1.6 }}>
                      These details are printed on invoices sent to customers. Keep them accurate so payments land correctly.
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={label}>Bank name</label>
                        <input style={input} value={bankDetails.bank_name} onChange={e => setBank('bank_name', e.target.value)} placeholder="e.g. Commonwealth Bank"/>
                      </div>
                      <div>
                        <label style={label}>Account name</label>
                        <input style={input} value={bankDetails.account_name} onChange={e => setBank('account_name', e.target.value)} placeholder="e.g. Romis Arib Pty Ltd"/>
                      </div>
                      <div>
                        <label style={label}>BSB</label>
                        <input style={input} value={bankDetails.bsb} onChange={e => setBank('bsb', e.target.value)} placeholder="062-000"/>
                        <p style={hint}>6 digits, format: XXX-XXX</p>
                      </div>
                      <div>
                        <label style={label}>Account number</label>
                        <input style={input} value={bankDetails.account_number} onChange={e => setBank('account_number', e.target.value)} placeholder="12345678"/>
                      </div>
                      <div>
                        <label style={label}>Payment terms (days)</label>
                        <select style={input} value={bankDetails.payment_terms} onChange={e => setBank('payment_terms', e.target.value)}>
                          <option value="7">7 days</option>
                          <option value="14">14 days</option>
                          <option value="21">21 days</option>
                          <option value="30">30 days</option>
                        </select>
                        <p style={hint}>Shown on invoice as "Due within X days"</p>
                      </div>
                    </div>
                    <div>
                      <label style={label}>Default invoice notes</label>
                      <textarea style={{ ...input, height: '80px', padding: '10px 12px', resize: 'none' as const }} value={bankDetails.invoice_notes} onChange={e => setBank('invoice_notes', e.target.value)} placeholder="e.g. Please include invoice number as reference. Thank you for your business!"/>
                      <p style={hint}>Printed at the bottom of every invoice</p>
                    </div>

                    {/* Preview */}
                    {(bankDetails.bsb || bankDetails.account_number) && (
                      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ height: '3px', background: TEAL }} />
                        <div style={{ padding: '16px 18px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#0A4F4C', marginBottom: '10px' }}>Preview — invoice payment section</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {bankDetails.bank_name && <div style={{ display: 'flex', gap: '12px' }}><span style={{ fontSize: '12px', color: TEXT3, width: '100px', flexShrink: 0 }}>Bank</span><span style={{ fontSize: '12px', color: TEXT, fontWeight: '600' }}>{bankDetails.bank_name}</span></div>}
                            {bankDetails.account_name && <div style={{ display: 'flex', gap: '12px' }}><span style={{ fontSize: '12px', color: TEXT3, width: '100px', flexShrink: 0 }}>Account name</span><span style={{ fontSize: '12px', color: TEXT, fontWeight: '600' }}>{bankDetails.account_name}</span></div>}
                            {bankDetails.bsb && <div style={{ display: 'flex', gap: '12px' }}><span style={{ fontSize: '12px', color: TEXT3, width: '100px', flexShrink: 0 }}>BSB</span><span style={{ fontSize: '12px', color: TEXT, fontWeight: '600', fontFamily: 'monospace' }}>{bankDetails.bsb}</span></div>}
                            {bankDetails.account_number && <div style={{ display: 'flex', gap: '12px' }}><span style={{ fontSize: '12px', color: TEXT3, width: '100px', flexShrink: 0 }}>Account no.</span><span style={{ fontSize: '12px', color: TEXT, fontWeight: '600', fontFamily: 'monospace' }}>{bankDetails.account_number}</span></div>}
                            {bankDetails.payment_terms && <div style={{ display: 'flex', gap: '12px' }}><span style={{ fontSize: '12px', color: TEXT3, width: '100px', flexShrink: 0 }}>Terms</span><span style={{ fontSize: '12px', color: TEXT, fontWeight: '600' }}>Due within {bankDetails.payment_terms} days</span></div>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* REVIEW PLATFORMS */}
              <div>
                <div style={sectionLabel}>Reviews</div>
                <div style={card}>
                  {sHead('Platforms', 'Review platforms')}
                  <div style={sBody}>
                    <div style={{ fontSize: '13px', color: TEXT2, lineHeight: 1.6, padding: '14px 16px', background: '#F0F9F8', borderRadius: '10px', border: '1px solid #CCEFED' }}>
                      Add your review page links below. These appear on the customer registration page after each installation.
                    </div>
                    <div>
                      <label style={label}>Google review link</label>
                      <input style={input} value={form.google_review_url} onChange={e => set('google_review_url', e.target.value)} placeholder="https://g.page/r/your-business/review"/>
                      <p style={hint}>Find this in your Google Business Profile → Get more reviews</p>
                    </div>
                    <div>
                      <label style={label}>Facebook review link</label>
                      <input style={input} value={form.facebook_review_url} onChange={e => set('facebook_review_url', e.target.value)} placeholder="https://www.facebook.com/your-page/reviews"/>
                      <p style={hint}>Go to your Facebook page → Reviews tab → copy the URL</p>
                    </div>

                    {platforms.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: TEXT2 }}>Additional platforms</div>
                        {platforms.map(p => (
                          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr auto' : '1fr 2fr auto', gap: '10px', alignItems: 'center', padding: '12px', background: '#F9FAFB', border: `1px solid ${BORDER}`, borderRadius: '10px' }}>
                            {!isMobile && <input style={input} value={p.name} onChange={e => updatePlatform(p.id, 'name', e.target.value)} placeholder="Platform name"/>}
                            <input style={input} value={p.url} onChange={e => updatePlatform(p.id, 'url', e.target.value)} placeholder="https://…"/>
                            <button type="button" onClick={() => removePlatform(p.id)} style={{ height: '42px', width: '42px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: '#B91C1C', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button type="button" onClick={addPlatform} style={{ height: '38px', padding: '0 16px', borderRadius: '8px', border: `1px dashed ${BORDER}`, background: 'transparent', color: TEXT2, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '7px', width: 'fit-content' }}>
                      <span style={{ fontSize: '16px' }}>+</span> Add another platform
                    </button>
                  </div>
                </div>
              </div>

              {/* REVIEW DISCOUNT */}
              <div style={card}>
                {sHead('Discount', 'Review discount')}
                <div style={sBody}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '16px', background: '#F9FAFB', borderRadius: '10px', border: `1px solid ${BORDER}` }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '3px' }}>Enable review discount</div>
                      <div style={{ fontSize: '12px', color: TEXT3 }}>Show the discount offer on the customer registration page</div>
                    </div>
                    <div onClick={() => set('review_discount_enabled', !form.review_discount_enabled)}
                      style={{ width: '44px', height: '24px', borderRadius: '12px', background: form.review_discount_enabled ? TEAL : '#D1D5DB', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: '3px', left: form.review_discount_enabled ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: WHITE, transition: 'left 0.15s' }}/>
                    </div>
                  </div>

                  {form.review_discount_enabled && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={label}>Discount per review ($)</label>
                          <input type="number" min="1" style={input} value={form.review_discount_amount} onChange={e => set('review_discount_amount', e.target.value)} placeholder="10"/>
                          <p style={hint}>Amount off their next service per review left</p>
                        </div>
                        <div>
                          <label style={label}>Maximum discount ($)</label>
                          <input type="number" min="1" style={input} value={form.review_discount_max} onChange={e => set('review_discount_max', e.target.value)} placeholder="30"/>
                          <p style={hint}>Cap on total discount across all platforms</p>
                        </div>
                      </div>

                      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ height: '3px', background: TEAL }} />
                        <div style={{ padding: '16px 18px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#0A4F4C', marginBottom: '6px' }}>Preview — what customers will see</div>
                          <div style={{ fontSize: '13px', color: TEXT2, lineHeight: 1.7 }}>
                            For each review left below, receive <strong>${form.review_discount_amount || '10'} off</strong> your next service. Up to <strong>${form.review_discount_max || '30'} total</strong>.
                          </div>
                          {allPlatformCount > 0 && (
                            <div style={{ marginTop: '10px', fontSize: '12px', color: TEXT3 }}>
                              {allPlatformCount} platform{allPlatformCount !== 1 ? 's' : ''} configured · max discount = ${Math.min(allPlatformCount * parseFloat(form.review_discount_amount || '10'), parseFloat(form.review_discount_max || '30'))} if all reviews left
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </form>
          )}
        </div>
      </div>

      {/* CROP MODAL */}
      {showCropper && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '520px', background: WHITE, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Upload</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>Adjust logo</div>
              <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{selectedFileName}</div>
            </div>
            <div style={{ padding: '18px' }}>
              <div style={{ position: 'relative', width: '100%', height: '320px', background: '#111', borderRadius: '12px', overflow: 'hidden' }}>
                <Cropper image={selectedImage} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} restrictPosition={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}/>
              </div>
              <div style={{ marginTop: '16px' }}>
                <label style={{ ...label, marginBottom: '8px' }}>Zoom</label>
                <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: '100%' }}/>
              </div>
              <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => { setShowCropper(false); setSelectedImage(''); setSelectedFileName('logo.png'); setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedAreaPixels(null) }}
                  style={{ height: '38px', padding: '0 16px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                  Cancel
                </button>
                <button type="button" onClick={handleCropAndUpload} disabled={uploadingLogo}
                  style={{ height: '38px', padding: '0 18px', borderRadius: '8px', border: 'none', background: TEAL, color: WHITE, cursor: uploadingLogo ? 'not-allowed' : 'pointer', opacity: uploadingLogo ? 0.7 : 1, fontFamily: 'inherit', fontWeight: '700' }}>
                  {uploadingLogo ? 'Saving…' : 'Save image'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}