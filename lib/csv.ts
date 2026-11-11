// Small CSV reader and writer (no dependency). Handles quoted fields, doubled quotes, line breaks inside quotes,
// a byte-order mark, and comma, semicolon or tab separators.

export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, '')
  const firstLine = text.split(/\r?\n/, 1)[0] || ''
  const counts: [string, number][] = [',', ';', '\t'].map(d => [d, firstLine.split(d).length - 1])
  const delim = counts.sort((a, b) => b[1] - a[1])[0][1] > 0 ? counts[0][0] : ','

  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else quoted = false
      } else cell += c
    } else if (c === '"') {
      quoted = true
    } else if (c === delim) {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      cell = ''
      rows.push(row)
      row = []
    } else cell += c
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter(r => r.some(v => v.trim() !== ''))
}

type Cell = string | number | null | undefined

/** Text cells that start with = + - @ would run as formulas in a spreadsheet, so they get a leading apostrophe. */
function safe(v: Cell) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'number') return String(v)
  const s = String(v)
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
}

export function toCsv(rows: Cell[][]) {
  return rows
    .map(r =>
      r
        .map(v => {
          const s = safe(v)
          return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
        })
        .join(',')
    )
    .join('\r\n')
}

/** Saves a CSV to the user's computer (with a byte-order mark so Excel reads accents correctly). */
export function downloadCsv(filename: string, rows: Cell[][]) {
  const blob = new Blob(['﻿' + toCsv(rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
