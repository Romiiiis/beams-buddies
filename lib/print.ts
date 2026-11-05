// Print just one part of the page (for example an invoice) instead of the whole screen.
// The element is copied into a hidden frame together with the page's styles, so fonts and colours match.

export function printElement(id: string, title = 'Print') {
  const el = document.getElementById(id)
  if (!el) {
    window.print()
    return
  }
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;'
  document.body.appendChild(frame)
  const doc = frame.contentDocument
  const win = frame.contentWindow
  if (!doc || !win) {
    frame.remove()
    window.print()
    return
  }
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(n => n.outerHTML).join('\n')
  doc.open()
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title.replace(/[<>&]/g, '')}</title>${styles}` +
      `<style>html,body{height:auto!important;overflow:visible!important;background:#fff!important}body{margin:0;padding:24px;font-family:var(--font-sans),-apple-system,'Segoe UI',sans-serif}` +
      `@page{margin:12mm}</style></head><body>${el.outerHTML}</body></html>`
  )
  doc.close()
  let done = false
  const run = () => {
    if (done) return
    done = true
    win.focus()
    win.print()
    setTimeout(() => frame.remove(), 1500)
  }
  frame.onload = () => setTimeout(run, 200)
  setTimeout(run, 1200)
}
