'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Select } from '@/components/Select'
import { BTN, ConfirmDialog, FIELD, LABEL, Modal, RED, TEXT3, useIsPhone } from '@/components/forms'
import type { Site } from '@/lib/schedule'

type Props = {
  businessId: string
  customerId: string
  /** The property being changed, or null for a new one */
  site: Site | null
  /** Units installed at this property, so the delete warning can say what stays */
  unitCount?: number
  onClose: () => void
  onSaved: (site: Site) => void
  onDeleted: (id: string) => void
}

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']
const COLUMNS = 'id, customer_id, label, address, suburb, state, postcode, notes'

/** Add or change one of a customer's extra properties (a rental, a second home, a shop). */
export function PropertyModal({ businessId, customerId, site, unitCount = 0, onClose, onSaved, onDeleted }: Props) {
  const phone = useIsPhone()
  const [label, setLabel] = useState(site?.label || '')
  const [address, setAddress] = useState(site?.address || '')
  const [suburb, setSuburb] = useState(site?.suburb || '')
  const [state, setState] = useState(site?.state || '')
  const [postcode, setPostcode] = useState(site?.postcode || '')
  const [notes, setNotes] = useState(site?.notes || '')
  const [saving, setSaving] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setError('')
    if (!label.trim()) return setError('Give the property a name, like "Rental - Unit 3".')
    if (!address.trim()) return setError('Add the street address.')
    setSaving(true)
    const row = { label: label.trim(), address: address.trim(), suburb: suburb.trim() || null, state: state || null, postcode: postcode.trim() || null, notes: notes.trim() || null }
    const res = site
      ? await supabase.from('customer_sites').update(row).eq('id', site.id).select(COLUMNS).single()
      : await supabase.from('customer_sites').insert({ ...row, business_id: businessId, customer_id: customerId }).select(COLUMNS).single()
    setSaving(false)
    if (res.error || !res.data) {
      setError(res.error?.message || 'Could not save the property.')
      return
    }
    onSaved(res.data as unknown as Site)
  }

  async function remove() {
    if (!site) return
    setSaving(true)
    const { error: err } = await supabase.from('customer_sites').delete().eq('id', site.id)
    setSaving(false)
    setConfirmRemove(false)
    if (err) {
      setError(err.message)
      return
    }
    onDeleted(site.id)
  }

  return (
    <>
      <Modal
        title={site ? 'Edit property' : 'Add a property'}
        size="md"
        busy={saving}
        onClose={onClose}
        footer={
          <>
            <span style={{ marginRight: 'auto', alignSelf: 'center', fontSize: 12, color: RED, minWidth: 0 }}>{error}</span>
            {site && (
              <button type="button" onClick={() => setConfirmRemove(true)} disabled={saving} style={BTN.danger}>
                Delete
              </button>
            )}
            <button type="button" onClick={onClose} disabled={saving} style={BTN.secondary}>Cancel</button>
            <button type="button" onClick={save} disabled={saving} style={{ ...BTN.primary, ...(saving ? BTN.disabled : {}) }}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={LABEL}>Name *</label>
            <input style={FIELD} value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Rental - Unit 3" maxLength={80} autoFocus={!phone} />
          </div>
          <div>
            <label style={LABEL}>Street address *</label>
            <input style={FIELD} value={address} onChange={e => setAddress(e.target.value)} placeholder="3/20 Beach Rd" maxLength={200} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: phone ? '1fr' : '1.4fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL}>Suburb</label>
              <input style={FIELD} value={suburb} onChange={e => setSuburb(e.target.value)} maxLength={80} />
            </div>
            <div>
              <label style={LABEL}>State</label>
              <Select style={FIELD} value={state} onChange={e => setState(e.target.value)}>
                <option value="">Not set</option>
                {STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div>
              <label style={LABEL}>Postcode</label>
              <input style={FIELD} inputMode="numeric" value={postcode} onChange={e => setPostcode(e.target.value)} maxLength={12} />
            </div>
          </div>
          <div>
            <label style={LABEL}>Notes (optional)</label>
            <input style={FIELD} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Gate code, parking, tenant's name..." maxLength={1000} />
          </div>
          <div style={{ fontSize: 12, color: TEXT3, lineHeight: 1.5 }}>Visits and equipment can be set to this property. Quotes and invoices still use the customer&apos;s own address.</div>
        </div>
      </Modal>

      {confirmRemove && site && (
        <ConfirmDialog
          title="Delete this property?"
          message={`${site.label} will be removed.${unitCount > 0 ? (unitCount === 1 ? ' The unit there stays on the customer and goes back to the main address.' : ` The ${unitCount} units there stay on the customer and go back to the main address.`) : ''} Visits already booked there go back to the main address too.`}
          busy={saving}
          busyLabel="Deleting..."
          layer={450}
          onCancel={() => setConfirmRemove(false)}
          onConfirm={remove}
        />
      )}
    </>
  )
}
