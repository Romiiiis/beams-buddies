'use client'

import { useEffect } from 'react'

// One loading look for every button in the app: when a button's label turns into "Saving...", "Sending..." and so
// on, the button tightens into a small pill and three dots ripple across it. When the work ends it grows back.
//
// It works from the label itself, so every existing button (and any new one that follows the same "Verb..." label
// habit) gets it without being changed. It only adds attributes and one small decoration to the button; the
// look is in app/globals.css (button[data-busy]).

const BUSY = /^(saving|sending|creating|booking|working|logging in|registering|adding|updating|removing|deleting|converting|uploading|opening|preparing|booking|signing in|loading|confirming|submitting)\b.*(…|\.\.\.)$/i

function isBusyLabel(b: HTMLButtonElement) {
  const text = (b.textContent || '').trim()
  return text.length < 40 && BUSY.test(text)
}

/** Dark text and a pale background (a secondary button) needs dark dots; a filled button needs light ones. */
function isLight(b: HTMLButtonElement) {
  const m = getComputedStyle(b).backgroundColor.match(/[\d.]+/g)
  if (!m) return true
  const [r, g, bl, a = '1'] = m.map(Number)
  if (Number(a) < 0.3) return true
  return (r * 299 + g * 587 + bl * 114) / 1000 > 190
}

function start(b: HTMLButtonElement) {
  if (b.dataset.busy) return
  const width = b.offsetWidth
  const height = b.offsetHeight
  b.dataset.busy = '1'
  b.dataset.tone = isLight(b) ? 'light' : 'dark'
  b.setAttribute('aria-busy', 'true')

  const dots = document.createElement('span')
  dots.className = 'jb-dots'
  dots.setAttribute('aria-hidden', 'true')
  dots.innerHTML = '<i></i><i></i><i></i>'
  b.appendChild(dots)

  // Tighten to a pill. Full-width and already-small buttons keep their width and only swap the label for dots.
  const target = Math.max(height * 1.55, 60)
  if (width > target + 24 && width < 260) {
    b.dataset.w0 = String(width)
    b.style.width = `${width}px`
    b.style.flex = '0 0 auto'
    void b.offsetWidth
    b.style.width = `${Math.round(target)}px`
  }
}

function stop(b: HTMLButtonElement) {
  if (!b.dataset.busy) return
  b.querySelector(':scope > .jb-dots')?.remove()
  const w0 = b.dataset.w0
  delete b.dataset.busy
  delete b.dataset.tone
  delete b.dataset.w0
  b.removeAttribute('aria-busy')
  if (w0) {
    b.style.width = `${w0}px`
    // Let it grow back, then hand the width back to the page's own styles
    window.setTimeout(() => {
      if (!b.dataset.busy) {
        b.style.removeProperty('width')
        b.style.removeProperty('flex')
      }
    }, 320)
  }
}

export function ButtonLoading() {
  useEffect(() => {
    let frame = 0
    const scan = () => {
      frame = 0
      document.querySelectorAll('button').forEach(b => {
        const busy = isBusyLabel(b)
        if (busy && !b.dataset.busy) start(b)
        else if (!busy && b.dataset.busy) stop(b)
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(scan)
    }
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    schedule()
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return null
}
