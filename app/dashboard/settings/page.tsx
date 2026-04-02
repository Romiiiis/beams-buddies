'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { useBusinessData } from '@/lib/business-context'

const A = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#DEDEDE'
const BG = '#F2F3F3'
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
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
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
        role_title: userData.role_title || ''
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
      }

      setLoading(false)
    }

    load()
  }, [router])

  async function handleLogoUpload(file: File) {
    if (!file || !businessId) return

    setUploadError('')

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a PNG, JPG, WEBP, or SVG image.')
      return
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filePath = `${businessId}/logo-${Date.now()}.${fileExt}`

    setUploadingLogo(true)

    const { error: uploadErr } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadErr) {
      setUploadingLogo(false)
      setUploadError(uploadErr.message || 'Logo upload failed.')
      return
    }

    const { data: publicData } = supabase.storage
      .from(LOGO_BUCKET)
      .getPublicUrl(filePath)

    if (!publicData?.publicUrl) {
      setUploadingLogo(false)
      setUploadError('Could not generate a public logo URL.')
      return
    }

    setBusiness(prev => ({ ...prev, logo_url: publicData.publicUrl }))
    setUploadingLogo(false)
  }

  async function removeLogo() {
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
          email: business.email
        })
        .eq('id', businessId),

      supabase
        .from('users')
        .update({
          full_name: userProfile.full_name,
          role_title: userProfile.role_title
        })
        .eq('id', userId),

      supabase
        .from('business_settings')
        .upsert({
          business_id: businessId,
          google_review_url: form.google_review_url || null,
          facebook_review_url: form.facebook_review_url || null,
          review_discount_amount: parseFloat(form.review_discount_amount) || 10,
          review_discount_max: parseFloat(form.review_discount_max) || 30,
          review_discount_enabled: form.review_discount_enabled,
          custom_review_platforms: platforms,
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
  function addPlatform() { setPlatforms(prev => [...prev, { id: crypto.randomUUID(), name: '', url: '' }]) }
  function updatePlatform(id: string, field: 'name' | 'url', value: string) { setPlatforms(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p)) }
  function removePlatform(id: string) { setPlatforms(prev => prev.filter(p => p.id !== id)) }

  const pad = isMobile ? '16px' : '30px'
  const input: React.CSSProperties = {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    borderRadius: '8px',
    border: `1px solid ${BORDER}`,
    background: BG,
    color: TEXT,
    fontFamily: 'inherit',
    fontSize: '14px',
    outline: 'none'
  }
  const label: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '500',
    color: TEXT2,
    marginBottom: '6px',
    display: 'block'
  }
  const hint: React.CSSProperties = {
    fontSize: '12px',
    color: TEXT3,
    marginTop: '4px'
  }
  const section: React.CSSProperties = {
    background: '#fff',
    border: `1px solid ${BORDER}`,
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '14px'
  }
  const sHead: React.CSSProperties = {
    padding: '14px 22px',
    borderBottom: `1px solid ${BORDER}`,
    fontSize: '14px',
    fontWeight: '600',
    color: TEXT
  }
  const sBody: React.CSSProperties = {
    padding: isMobile ? '16px' : '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }
  const allPlatformCount =
    (form.google_review_url ? 1 : 0) +
    (form.facebook_review_url ? 1 : 0) +
    platforms.filter(p => p.url).length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG }}>
      <Sidebar active="/dashboard/settings" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>

        <div style={{ height: '58px', background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: `0 ${pad}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '17px', fontWeight: '600', color: TEXT }}>Settings</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {saved && <span style={{ fontSize: '13px', color: '#065F46', fontWeight: '500' }}>✓ Saved</span>}
            <button
              form="settings-form"
              type="submit"
              disabled={saving || uploadingLogo}
              style={{ height: '36px', padding: '0 18px', borderRadius: '8px', border: 'none', background: A, color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, padding: `${isMobile ? '16px' : '24px'} ${pad}`, paddingBottom: isMobile ? '90px' : '24px' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
          ) : (
            <form id="settings-form" onSubmit={handleSave}>

              <div style={section}>
                <div style={sHead}>Your profile</div>
                <div style={sBody}>
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

              <div style={section}>
                <div style={sHead}>Business profile</div>
                <div style={sBody}>
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
                    <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                      <label style={label}>Email</label>
                      <input style={input} value={business.email} onChange={e => setBiz('email', e.target.value)} placeholder="hello@yourbusiness.com" />
                    </div>
                  </div>

                  <div>
                    <label style={label}>Business logo</label>

                    <div style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'stretch' : 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      background: BG,
                      borderRadius: '8px',
                      border: `1px solid ${BORDER}`
                    }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: '#fff',
                        border: `1px solid ${BORDER}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {business.logo_url ? (
                          <img
                            src={business.logo_url}
                            alt="Logo preview"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <span style={{ fontSize: '11px', color: TEXT3 }}>No logo</span>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT, marginBottom: '4px' }}>
                          Upload your business logo
                        </div>
                        <div style={{ fontSize: '12px', color: TEXT3, lineHeight: 1.6 }}>
                          This appears in the bottom left of the sidebar next to your name.
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <label
                          htmlFor="logo-upload"
                          style={{
                            height: '38px',
                            padding: '0 16px',
                            borderRadius: '8px',
                            border: `1px solid ${BORDER}`,
                            background: '#fff',
                            color: TEXT2,
                            fontSize: '13px',
                            cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: uploadingLogo ? 0.7 : 1
                          }}
                        >
                          {uploadingLogo ? 'Uploading…' : 'Upload image'}
                        </label>

                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                          style={{ display: 'none' }}
                          disabled={uploadingLogo}
                          onChange={async e => {
                            const file = e.target.files?.[0]
                            if (file) await handleLogoUpload(file)
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
                              background: '#fff',
                              color: '#B91C1C',
                              fontSize: '13px',
                              cursor: 'pointer',
                              fontFamily: 'inherit'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {uploadError && (
                      <p style={{ ...hint, color: '#B91C1C' }}>{uploadError}</p>
                    )}

                    {!uploadError && (
                      <p style={hint}>PNG, JPG, WEBP, or SVG. After uploading, click Save changes.</p>
                    )}
                  </div>
                </div>
              </div>

              <div style={section}>
                <div style={sHead}>Review platforms</div>
                <div style={sBody}>
                  <div style={{ fontSize: '13px', color: TEXT3, lineHeight: 1.6, padding: '12px 14px', background: '#EAF6F5', borderRadius: '8px', border: '1px solid #CCEFED' }}>
                    Add your review page links below. These appear on the customer registration page after each installation, encouraging customers to leave a review in exchange for a service discount.
                  </div>
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
                      <div style={{ fontSize: '13px', fontWeight: '500', color: TEXT2 }}>Additional platforms</div>
                      {platforms.map(p => (
                        <div key={p.id} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr auto' : '1fr 2fr auto', gap: '10px', alignItems: 'center' }}>
                          {!isMobile && <input style={input} value={p.name} onChange={e => updatePlatform(p.id, 'name', e.target.value)} placeholder="Platform name" />}
                          <input style={input} value={p.url} onChange={e => updatePlatform(p.id, 'url', e.target.value)} placeholder="https://…" />
                          <button type="button" onClick={() => removePlatform(p.id)} style={{ height: '42px', width: '42px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: '#B91C1C', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button type="button" onClick={addPlatform} style={{ height: '38px', padding: '0 16px', borderRadius: '8px', border: `1px dashed ${BORDER}`, background: 'transparent', color: TEXT2, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '7px', width: 'fit-content' }}>
                    <span style={{ fontSize: '16px', color: A }}>+</span> Add another platform
                  </button>
                </div>
              </div>

              <div style={section}>
                <div style={sHead}>Review discount</div>
                <div style={sBody}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: BG, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: TEXT, marginBottom: '3px' }}>Enable review discount</div>
                      <div style={{ fontSize: '12px', color: TEXT3 }}>Show the discount offer on the customer registration page</div>
                    </div>
                    <div
                      onClick={() => set('review_discount_enabled', !form.review_discount_enabled)}
                      style={{ width: '44px', height: '24px', borderRadius: '12px', background: form.review_discount_enabled ? A : '#D1D5DB', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
                    >
                      <div style={{ position: 'absolute', top: '3px', left: form.review_discount_enabled ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
                    </div>
                  </div>
                  {form.review_discount_enabled && (
                    <>
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
                      <div style={{ padding: '14px 16px', background: '#F0F9F8', borderRadius: '8px', border: '1px solid #CCEFED' }}>
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
                    </>
                  )}
                </div>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  )
}