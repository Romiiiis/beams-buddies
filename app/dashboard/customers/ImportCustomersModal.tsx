'use client'

import React, { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Select } from '@/components/Select'
import { BTN, LINE, Modal, RED, TEAL_DARK, TEXT, TEXT2, TEXT3 } from '@/components/forms'
import { downloadCsv, parseCsv } from '@/lib/csv'

type Props = {
  businessId: string
  existing: { email?: string | null; phone?: string | null }[]
  onClose: () => void
  onDone: (imported: number) => void
}

type Field = 'first_name' | 'last_name' | 'name' | 'email' | 'phone' | 'address' | 'suburb' | 'state' | 'postcode' | 'notes'

const FIELDS: { value: '' | Field; label: string }[] = [
  { value: '', label: 'Do not import' },
  { value: 'first_name', label: 'First name' },
  { value: 'last_name', label: 'Last name' },
  { value: 'name', label: 'Full name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'address', label: 'Street address' },
  { value: 'suburb', label: 'Suburb / city' },
  { value: 'state', label: 'State' },
  { value: 'postcode', label: 'Postcode' },
  { value: 'notes', label: 'Notes' },
]

// Header names that other tools use, matched after lower-casing and removing spaces and punctuation.
const ALIASES: Record<Field, string[]> = {
  first_name: ['firstname', 'first', 'givenname', 'forename'],
  last_name: ['lastname', 'last', 'surname', 'familyname'],
  name: ['name', 'fullname', 'clientname', 'customername', 'client', 'customer', 'contactname', 'displayname', 'contact'],
  email: ['email', 'emailaddress', 'mail', 'primaryemail', 'email1'],
  phone: ['phone', 'mobile', 'phonenumber', 'mobilephone', 'cell', 'cellphone', 'telephone', 'contactnumber', 'primaryphone', 'phone1', 'mobilenumber'],
  address: ['address', 'streetaddress', 'street', 'address1', 'addressline1', 'street1', 'propertyaddress', 'siteaddress', 'billingaddress'],
  suburb: ['suburb', 'city', 'town', 'locality'],
  state: ['state', 'province', 'region'],
  postcode: ['postcode', 'zip', 'zipcode', 'postalcode', 'postal', 'pcode'],
  notes: ['notes', 'note', 'comments', 'comment', 'memo'],
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/
const digits = (s: string) => s.replace(/\D/g, '')

function guess(headers: string[]): (Field | '')[] {
  const taken = new Set<Field>()
  const out = headers.map(h => {
    const n = norm(h)
    const hit = (Object.keys(ALIASES) as Field[]).find(f => !taken.has(f) && ALIASES[f].includes(n))
    if (hit) taken.add(hit)
    return hit || ''
  })
  return out
}

type Rec = { first_name: string; last_name: string; email: string | null; phone: string | null; address: string | null; suburb: string | null; state?: string; postcode: string | null; notes: string | null }

function build(rows: string[][], map: (Field | '')[]) {
  const col = (f: Field) => map.indexOf(f)
  const get = (r: string[], f: Field) => (col(f) >= 0 ? (r[col(f)] || '').trim() : '')
  const hasSplit = col('first_name') >= 0 || col('last_name') >= 0
  const recs: Rec[] = []
  let noName = 0
  for (const r of rows) {
    let first = get(r, 'first_name')
    let last = get(r, 'last_name')
    if (!hasSplit) {
      const parts = get(r, 'name').split(/\s+/).filter(Boolean)
      first = parts[0] || ''
      last = parts.slice(1).join(' ')
    }
    if (!first && !last) {
      noName++
      continue
    }
    const email = get(r, 'email').toLowerCase()
    const state = get(r, 'state')
    recs.push({
      first_name: first || last,
      last_name: first ? last : '',
      email: EMAIL.test(email) ? email : null,
      phone: get(r, 'phone') || null,
      address: get(r, 'address') || null,
      suburb: get(r, 'suburb') || null,
      ...(state ? { state: state.length <= 3 ? state.toUpperCase() : state } : {}),
      postcode: get(r, 'postcode') || null,
      notes: get(r, 'notes') || null,
    })
  }
  return { recs, noName }
}

export function ImportCustomersModal({ businessId, existing, onClose, onDone }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [map, setMap] = useState<(Field | '')[]>([])
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function pick(file: File | undefined) {
    if (!file) return
    setError('')
    if (file.size > 5 * 1024 * 1024) {
      setError('That file is over 5 MB. Split it into smaller files and import them one at a time.')
      return
    }
    const parsed = parseCsv(await file.text())
    if (parsed.length < 2) {
      setError('That file has no customers in it. Export your clients as a CSV with a header row and try again.')
      return
    }
    if (parsed.length - 1 > 5000) {
      setError('That file has more than 5,000 rows. Split it and import in parts.')
      return
    }
    setFileName(file.name)
    setHeaders(parsed[0].map(h => h.trim()))
    setRows(parsed.slice(1))
    setMap(guess(parsed[0]))
  }

  const { recs, noName } = rows.length ? build(rows, map) : { recs: [] as Rec[], noName: 0 }

  // Customers already in Jobyra (or earlier in this file) are skipped, matched by email or phone number.
  const seenEmail = new Set(existing.map(e => (e.email || '').trim().toLowerCase()).filter(Boolean))
  const seenPhone = new Set(existing.map(e => digits(e.phone || '').slice(-9)).filter(d => d.length >= 8))
  const fresh: Rec[] = []
  let dupes = 0
  for (const r of recs) {
    const pk = digits(r.phone || '').slice(-9)
    if ((r.email && seenEmail.has(r.email)) || (pk.length >= 8 && seenPhone.has(pk))) {
      dupes++
      continue
    }
    if (r.email) seenEmail.add(r.email)
    if (pk.length >= 8) seenPhone.add(pk)
    fresh.push(r)
  }

  const mappedNames = map.includes('name') || map.includes('first_name') || map.includes('last_name')

  async function run() {
    setBusy(true)
    setError('')
    let done = 0
    for (let i = 0; i < fresh.length; i += 200) {
      const chunk = fresh.slice(i, i + 200).map(r => ({ ...r, business_id: businessId }))
      const { error: err } = await supabase.from('customers').insert(chunk)
      if (err) {
        setError(`Imported ${done} customers, then hit a problem: ${err.message}`)
        setBusy(false)
        if (done) onDone(done)
        return
      }
      done += chunk.length
    }
    setBusy(false)
    onDone(done)
  }

  const template = () =>
    downloadCsv('jobyra-customers-template.csv', [
      ['First name', 'Last name', 'Email', 'Phone', 'Address', 'Suburb', 'State', 'Postcode', 'Notes'],
      ['Sophie', 'Nguyen', 'sophie@example.com', '0412 345 678', '14 Marlow Street', 'Parramatta', 'NSW', '2150', 'Gate code 1234'],
    ])

  return (
    <Modal
      title="Import customers"
      size="lg"
      busy={busy}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} style={BTN.secondary}>Cancel</button>
          {rows.length > 0 && (
            <button type="button" onClick={run} disabled={busy || !fresh.length || !mappedNames} style={{ ...BTN.primary, ...(busy || !fresh.length || !mappedNames ? BTN.disabled : {}) }}>
              {busy ? 'Importing...' : `Import ${fresh.length} customer${fresh.length === 1 ? '' : 's'}`}
            </button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!rows.length ? (
          <>
            <div style={{ fontSize: 14, color: TEXT2, lineHeight: 1.6 }}>
              Moving from another tool? Export your clients from ServiceM8, Tradify, Jobber, Xero or a spreadsheet as a <b>CSV</b>, then choose the file. You can check how the columns line up before anything is added.
            </div>
            <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain" onChange={e => pick(e.target.files?.[0])} style={{ display: 'none' }} id="customer-csv" />
            <button type="button" onClick={() => fileRef.current?.click()} style={{ ...BTN.secondary, height: 96, flexDirection: 'column', gap: 4, borderStyle: 'dashed' }}>
              <span style={{ fontWeight: 800, color: TEXT }}>Choose a CSV file</span>
              <span style={{ fontSize: 12, color: TEXT3, fontWeight: 500 }}>Up to 5,000 customers</span>
            </button>
            <button type="button" onClick={template} style={{ background: 'none', border: 'none', color: TEAL_DARK, fontWeight: 700, fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start', padding: 0 }}>
              Download a blank template
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: TEXT2 }}>
              <b>{fileName}</b> · {rows.length.toLocaleString('en-AU')} rows. Check each column goes where you expect.
            </div>

            <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
              {headers.map((h, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12, alignItems: 'center', padding: '10px 12px', borderTop: i === 0 ? 'none' : `1px solid ${LINE}` }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h || `Column ${i + 1}`}</div>
                    <div style={{ fontSize: 12, color: TEXT3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rows[0]?.[i] || '-'}</div>
                  </div>
                  <Select
                    value={map[i] || ''}
                    onChange={e => setMap(prev => prev.map((m, j) => (j === i ? (e.target.value as Field | '') : m)))}
                    aria-label={`Where ${h} goes`}
                  >
                    {FIELDS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>

            {!mappedNames && <div style={{ fontSize: 13, color: RED }}>Choose which column holds the customer’s name.</div>}

            <div style={{ background: '#F8FAFC', border: `1px solid ${LINE}`, borderRadius: 12, padding: '12px 14px', fontSize: 13, color: TEXT2, lineHeight: 1.7 }}>
              <b style={{ color: TEAL_DARK }}>{fresh.length}</b> new customer{fresh.length === 1 ? '' : 's'} will be added.
              {dupes > 0 && <> {dupes} already in Jobyra (same email or phone) will be skipped.</>}
              {noName > 0 && <> {noName} row{noName === 1 ? ' has' : 's have'} no name and will be skipped.</>}
            </div>

            <button type="button" onClick={() => { setRows([]); setHeaders([]); setMap([]); setFileName(''); if (fileRef.current) fileRef.current.value = '' }} style={{ background: 'none', border: 'none', color: TEXT3, fontWeight: 700, fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start', padding: 0 }}>
              Choose a different file
            </button>
          </>
        )}

        {error && <div style={{ fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>{error}</div>}
      </div>
    </Modal>
  )
}
