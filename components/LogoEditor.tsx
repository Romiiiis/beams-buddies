'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'

export type PixelCrop = { x: number; y: number; width: number; height: number }

const TEAL = '#2AA198'
const TEAL_DARK = '#1F857C'
const TEXT = '#0B1220'
const TEXT2 = '#1F2937'
const TEXT3 = '#64748B'
const BORDER = '#E8EDF2'
const WHITE = '#FFFFFF'
const BG = '#FAFAFA'

// Light checkerboard so transparent parts of a logo are visible while editing
const CHECKER = 'repeating-conic-gradient(#E9EDF1 0% 25%, #FFFFFF 0% 50%) 50% / 18px 18px'

type Shape = 'original' | 'wide' | 'square' | 'round'
const SHAPES: { key: Shape; label: string }[] = [
  { key: 'original', label: 'Original' },
  { key: 'wide', label: 'Wide' },
  { key: 'square', label: 'Square' },
  { key: 'round', label: 'Round' },
]

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Draws the chosen area to a canvas. The area may extend past the image (zoomed out / moved
 * freely), which becomes transparent space, so nothing is ever cut off unexpectedly.
 * Long side is capped (default 800px) so wide logos stay crisp but files stay small.
 */
export async function renderLogo(src: string, area: PixelCrop, maxSide = 800, round = false): Promise<HTMLCanvasElement> {
  const img = await loadImage(src)
  const scale = Math.min(1, maxSide / Math.max(area.width, area.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(area.width * scale))
  canvas.height = Math.max(1, Math.round(area.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not available')
  ctx.imageSmoothingQuality = 'high'
  if (round) {
    ctx.beginPath()
    ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2, 0, 0, Math.PI * 2)
    ctx.clip()
  }
  ctx.drawImage(img, -area.x * scale, -area.y * scale, img.naturalWidth * scale, img.naturalHeight * scale)
  return canvas
}

type Props = {
  image: string
  businessName: string
  personName: string
  /** Called whenever the chosen area changes (after each drag / zoom). */
  onChange: (area: PixelCrop | null, round: boolean) => void
}

/** Logo adjuster: free move and zoom, choice of shape, and a live preview of how it will look in Jobyra. */
export function LogoEditor({ image, businessName, personName, onChange }: Props) {
  const [shape, setShape] = useState<Shape>('original')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [naturalAspect, setNaturalAspect] = useState(1)
  const [preview, setPreview] = useState('')
  const areaRef = useRef<PixelCrop | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    loadImage(image).then(img => setNaturalAspect(img.naturalWidth / Math.max(1, img.naturalHeight))).catch(() => {})
  }, [image])

  const aspect = shape === 'original' ? naturalAspect : shape === 'wide' ? 2.5 : 1
  const round = shape === 'round'

  const refreshPreview = useCallback((area: PixelCrop) => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      try {
        const canvas = await renderLogo(image, area, 400, round)
        setPreview(canvas.toDataURL('image/png'))
      } catch {}
    }, 120)
  }, [image, round])

  // Keep the latest callback without re-running effects when the parent re-renders
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Re-render the preview when the shape changes
  useEffect(() => {
    if (areaRef.current) {
      refreshPreview(areaRef.current)
      onChangeRef.current(areaRef.current, round)
    }
  }, [round, refreshPreview])

  function reset() {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const pill = (active: boolean): React.CSSProperties => ({
    height: 32,
    padding: '0 12px',
    borderRadius: 9,
    border: 'none',
    background: active ? TEAL : 'transparent',
    color: active ? WHITE : TEXT2,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  })

  const greeting = (() => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  })()
  const firstName = personName.trim().split(/\s+/)[0] || ''

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Shape + reset */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div role="radiogroup" aria-label="Logo shape" style={{ display: 'inline-flex', padding: 3, background: WHITE, border: `1px solid #E3E8EE`, borderRadius: 12, gap: 2 }}>
          {SHAPES.map(s => (
            <button key={s.key} type="button" role="radio" aria-checked={shape === s.key} onClick={() => setShape(s.key)} style={pill(shape === s.key)}>
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={reset}
          style={{ height: 32, padding: '0 12px', borderRadius: 9, border: `1px solid ${BORDER}`, background: WHITE, color: TEXT2, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Reset
        </button>
      </div>

      {/* Editing area */}
      <div style={{ position: 'relative', width: '100%', height: 300, background: CHECKER, borderRadius: 14, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          minZoom={0.1}
          maxZoom={10}
          zoomSpeed={0.15}
          aspect={aspect}
          cropShape={round ? 'round' : 'rect'}
          objectFit="contain"
          showGrid={false}
          restrictPosition={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => {
            areaRef.current = pixels
            onChangeRef.current(pixels, round)
            refreshPreview(pixels)
          }}
          style={{ containerStyle: { background: 'transparent' } }}
        />
      </div>

      {/* Zoom */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <label htmlFor="logo-zoom" style={{ fontSize: 12, fontWeight: 700, color: TEXT2 }}>Size</label>
          <span style={{ fontSize: 12, fontWeight: 600, color: TEXT3, fontVariantNumeric: 'tabular-nums' }}>{Math.round(zoom * 100)}%</span>
        </div>
        <input
          id="logo-zoom"
          type="range"
          min="0.1"
          max="10"
          step="0.01"
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          style={{ width: '100%', accentColor: TEAL }}
        />
        <div style={{ fontSize: 11.5, color: TEXT3, marginTop: 6, lineHeight: 1.5 }}>
          Drag the logo to move it, and scroll or pinch to resize. Zoom out to add space around it; transparent areas stay transparent.
        </div>
      </div>

      {/* Live preview */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT2, marginBottom: 8 }}>Preview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {/* Desktop dashboard header */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, background: BG, padding: '14px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Dashboard (computer)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{ width: 64, height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {preview && <img src={preview} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Today</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {greeting}{firstName ? `, ${firstName}` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Phone menu header */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, background: WHITE, padding: '14px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: TEXT3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Phone menu</div>
            <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
              {preview && <img src={preview} alt="" style={{ height: 40, width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />}
            </div>
            <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 800, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {personName || businessName || 'Owner'}
            </div>
          </div>
        </div>
        {!preview && <div style={{ fontSize: 11.5, color: TEAL_DARK, marginTop: 8 }}>Move or resize the logo to see the preview.</div>}
      </div>
    </div>
  )
}
