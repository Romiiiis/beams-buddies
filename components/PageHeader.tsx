'use client'

import React, { useEffect, useRef } from 'react'

/**
 * The title bar at the top of every dashboard page.
 *
 * On a computer it is a plain bar. On a phone the page scrolls as one document and the bar stays pinned to the top:
 * as you scroll it shrinks (smaller title, tighter padding, smaller buttons) and turns a little see-through with a soft
 * blur, so the content slides underneath. The look is all CSS (see ".pg-head" in app/globals.css) driven by one
 * variable, --p: 0 at the top of the page, 1 after about 56px of scrolling. It is written straight onto the element,
 * so scrolling never re-renders React.
 */
const RANGE = 56

export function PageHeader({
  title,
  eyebrow,
  leading,
  roomy,
  children,
}: {
  title: React.ReactNode
  /** A small line above the title (such as today's date). Fades away as the page scrolls on a phone. */
  eyebrow?: React.ReactNode
  /** Something in front of the title (a logo or a back button). */
  leading?: React.ReactNode
  /** A little more height, used by the Dashboard greeting. */
  roomy?: boolean
  /** The right-hand side: normally a HeaderToolbar. */
  children?: React.ReactNode
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const phone = window.matchMedia('(max-width: 767px)')
    let frame = 0
    const update = () => {
      frame = 0
      const p = phone.matches ? Math.min(1, Math.max(0, window.scrollY / RANGE)) : 0
      el.style.setProperty('--p', p.toFixed(3))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    phone.addEventListener('change', update)
    return () => {
      window.removeEventListener('scroll', onScroll)
      phone.removeEventListener('change', update)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header ref={ref} className={`pg-head${roomy ? ' roomy' : ''}`}>
      <div className="pg-left">
        {leading}
        <div className="pg-titles">
          {eyebrow && <div className="pg-eyebrow">{eyebrow}</div>}
          <h1 className="pg-title">{title}</h1>
        </div>
      </div>
      {children && <div className="pg-right">{children}</div>}
    </header>
  )
}
