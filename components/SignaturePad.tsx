'use client'

import React, { useEffect, useRef, useState } from 'react'
import { FONT, LINE, TEXT3 } from '@/components/forms'

type Props = {
  /** Called with a small PNG (as a data address) when something is drawn, or null when cleared. */
  onChange: (dataUrl: string | null) => void
  height?: number
}

// The database accepts up to 100,000 characters for a signature; stay comfortably under it.
const MAX_CHARS = 90000

/** A box to sign in with a finger or mouse. The picture is kept small so it stores cheaply. */
export function SignaturePad({ onChange, height = 150 }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [empty, setEmpty] = useState(true)

  // Size the drawing area to the box, sharper on high-density screens
  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ratio = Math.min(2, window.devicePixelRatio || 1)
    const w = c.clientWidth
    c.width = Math.round(w * ratio)
    c.height = Math.round(height * ratio)
    const ctx = c.getContext('2d')
    if (ctx) {
      ctx.scale(ratio, ratio)
      ctx.lineWidth = 2.4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#0B1220'
    }
  }, [height])

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = point(e)
    const ctx = canvas.current?.getContext('2d')
    if (ctx) {
      // a dot, so a tap leaves a mark
      ctx.beginPath()
      ctx.arc(last.current.x, last.current.y, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !last.current) return
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    const p = point(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    if (empty) setEmpty(false)
  }

  function up() {
    if (!drawing.current) return
    drawing.current = false
    last.current = null
    const c = canvas.current
    if (!c) return
    // Shrink to at most 420 wide before saving. A very busy scribble is shrunk again so it always fits the database limit.
    const shrink = (maxWidth: number) => {
      const scale = Math.min(1, maxWidth / c.width)
      const out = document.createElement('canvas')
      out.width = Math.round(c.width * scale)
      out.height = Math.round(c.height * scale)
      const octx = out.getContext('2d')
      if (!octx) return null
      octx.fillStyle = '#FFFFFF'
      octx.fillRect(0, 0, out.width, out.height)
      octx.drawImage(c, 0, 0, out.width, out.height)
      return out.toDataURL('image/png')
    }
    let url = shrink(420)
    if (url && url.length > MAX_CHARS) url = shrink(280)
    if (!url) return
    setEmpty(false)
    onChange(url.length > MAX_CHARS ? null : url)
  }

  function clear() {
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (c && ctx) {
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.restore()
    }
    setEmpty(true)
    onChange(null)
  }

  return (
    <div>
      <div style={{ position: 'relative', border: `1px solid ${LINE}`, borderRadius: 12, background: '#FFFFFF', overflow: 'hidden' }}>
        <canvas
          ref={canvas}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          style={{ display: 'block', width: '100%', height, touchAction: 'none', cursor: 'crosshair' }}
          aria-label="Signature box"
        />
        {empty && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B6C0CC', fontSize: 14, fontWeight: 600, pointerEvents: 'none' }}>Sign here</div>}
      </div>
      <button type="button" onClick={clear} style={{ marginTop: 6, background: 'none', border: 'none', padding: 0, color: TEXT3, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: FONT }}>
        Clear
      </button>
    </div>
  )
}
