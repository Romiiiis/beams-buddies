'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserRow } from '@/lib/session'
import { Sidebar } from '@/components/Sidebar'
import { PageSkeleton } from '@/components/Skeleton'
import { StatStrip } from '@/components/StatStrip'
import { HeaderToolbar } from '@/components/HeaderToolbar'
import { AppIcon } from '@/components/AppIcon'
import { DataList, PersonCell, TextCell } from '@/components/DataList'
import { Select } from '@/components/Select'
import { money } from '@/lib/format'
import { BTN, ConfirmDialog, FIELD, LABEL, Modal, RED, TEAL, TEXT3, Toast } from '@/components/forms'
import { type PriceItem } from '@/lib/documents'

const BG = '#FAFAFA'
const BORDER = '#E8EDF2'
const TEXT = '#0B1220'
const FONT = 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

type Form = { id: string | null; name: string; description: string; kind: 'service' | 'product'; price: string; cost: string; active: boolean }
const EMPTY: Form = { id: null, name: '', description: '', kind: 'service', price: '', cost: '', active: true }

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

const margin = (p: PriceItem) => (p.unit_cost !== null && Number(p.unit_price) > 0 ? Math.round(((Number(p.unit_price) - Number(p.unit_cost)) / Number(p.unit_price)) * 100) : null)

export default function PriceListPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [items, setItems] = useState<PriceItem[]>([])
  const [businessId, setBusinessId] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [form, setForm] = useState<Form | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<PriceItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data: userData } = await getUserRow(session.user.id)
      if (!userData) {
        setLoading(false)
        return
      }
      setBusinessId(userData.business_id)
      const { data } = await supabase.from('products').select('*').eq('business_id', userData.business_id).order('name')
      setItems((data as PriceItem[]) || [])
      setLoading(false)
    }
    load()
  }, [router])

  function edit(p: PriceItem) {
    setError('')
    setForm({ id: p.id, name: p.name, description: p.description || '', kind: p.kind, price: String(p.unit_price ?? ''), cost: p.unit_cost === null ? '' : String(p.unit_cost), active: p.active })
  }

  async function save() {
    if (!form) return
    const name = form.name.trim()
    const price = parseFloat(form.price)
    const cost = form.cost.trim() === '' ? null : parseFloat(form.cost)
    if (!name) return setError('Give the item a name.')
    if (!Number.isFinite(price) || price < 0) return setError('Enter the price, before GST.')
    if (cost !== null && (!Number.isFinite(cost) || cost < 0)) return setError('Cost should be a number, or left blank.')
    setSaving(true)
    setError('')
    const payload = { name, description: form.description.trim() || null, kind: form.kind, unit_price: price, unit_cost: cost, active: form.active }
    const res = form.id
      ? await supabase.from('products').update(payload).eq('id', form.id).select('*').single()
      : await supabase.from('products').insert({ ...payload, business_id: businessId }).select('*').single()
    setSaving(false)
    if (res.error || !res.data) {
      setError(res.error?.message || 'Could not save. Please try again.')
      return
    }
    const saved = res.data as PriceItem
    setItems(prev => (form.id ? prev.map(i => (i.id === saved.id ? saved : i)) : [...prev, saved]).sort((a, b) => a.name.localeCompare(b.name)))
    setForm(null)
    setNotice(form.id ? 'Item updated.' : 'Item added to the price list.')
  }

  async function toggleActive(p: PriceItem) {
    const { error: err } = await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    if (!err) setItems(prev => prev.map(i => (i.id === p.id ? { ...i, active: !p.active } : i)))
  }

  async function remove(p: PriceItem) {
    setDeleting(true)
    const { error: err } = await supabase.from('products').delete().eq('id', p.id)
    setDeleting(false)
    setDeleteTarget(null)
    if (!err) setItems(prev => prev.filter(i => i.id !== p.id))
  }

  const shown = useMemo(() => {
    const byTab = tab === 'all' ? items : tab === 'inactive' ? items.filter(i => !i.active) : items.filter(i => i.kind === tab && i.active)
    const term = search.trim().toLowerCase()
    return term ? byTab.filter(i => i.name.toLowerCase().includes(term) || (i.description || '').toLowerCase().includes(term)) : byTab
  }, [items, tab, search])

  const active = items.filter(i => i.active)
  const margins = active.map(margin).filter((m): m is number => m !== null)
  const avgMargin = margins.length ? Math.round(margins.reduce((a, b) => a + b, 0) / margins.length) : null

  const stats = [
    { label: 'Items', value: active.length.toLocaleString('en-AU'), sub: 'In your price list', onClick: () => setTab('all') },
    { label: 'Services', value: active.filter(i => i.kind === 'service').length.toLocaleString('en-AU'), sub: 'Labour and call-outs', onClick: () => setTab('service') },
    { label: 'Parts', value: active.filter(i => i.kind === 'product').length.toLocaleString('en-AU'), sub: 'Materials and equipment', onClick: () => setTab('product') },
    { label: 'Average margin', value: avgMargin === null ? '-' : `${avgMargin}%`, sub: margins.length ? `Across ${margins.length} item${margins.length === 1 ? '' : 's'} with a cost` : 'Add costs to see margin' },
  ]

  const tabs = [
    { value: 'all', label: 'All', count: items.length },
    { value: 'service', label: 'Services', count: items.filter(i => i.kind === 'service' && i.active).length },
    { value: 'product', label: 'Parts', count: items.filter(i => i.kind === 'product' && i.active).length },
    { value: 'inactive', label: 'Hidden', count: items.filter(i => !i.active).length },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/products" />
        <PageSkeleton variant="list" label="Loading price list" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard/products" />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <div style={{ background: BG, borderBottom: `1px solid ${BORDER}`, padding: isMobile ? '14px 14px 12px' : '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0 }}>Price list</h1>
          <HeaderToolbar
            isMobile={isMobile}
            search={{ value: search, onChange: setSearch, placeholder: 'Search...' }}
            items={[{ label: 'Add item', icon: <AppIcon name="add" size={15} />, tone: 'primary', onClick: () => { setError(''); setForm(EMPTY) } }]}
          />
        </div>

        <div className="page-content" style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : 48, background: BG }}>
          <StatStrip items={stats} isMobile={isMobile} />

          <DataList<PriceItem>
            title="Items"
            isMobile={isMobile}
            rows={shown}
            rowKey={p => p.id}
            emptyText={items.length ? 'Nothing matches.' : 'Add the jobs and parts you quote most. Then pick them inside any quote or invoice with one tap.'}
            onRowClick={edit}
            rowActions={p => [
              { label: 'Edit', onClick: edit },
              { label: p.active ? 'Hide from pickers' : 'Show in pickers', onClick: toggleActive },
              { label: 'Delete', danger: true, onClick: r => setDeleteTarget(r) },
            ]}
            tabs={tabs}
            activeTab={tab}
            onTabChange={setTab}
            columns={[
              { key: 'item', label: 'Item', width: 'minmax(0,1.6fr)', render: p => <PersonCell name={p.name} sub={p.description || (p.kind === 'service' ? 'Service' : 'Part')} /> },
              { key: 'type', label: 'Type', width: '100px', mobileLabel: 'Type', render: p => <TextCell>{p.kind === 'service' ? 'Service' : 'Part'}</TextCell> },
              { key: 'price', label: 'Price (ex GST)', width: '130px', mobileLabel: 'Price', render: p => <TextCell strong>{money(p.unit_price)}</TextCell> },
              { key: 'cost', label: 'Cost', width: '100px', mobileLabel: 'Cost', render: p => <TextCell>{p.unit_cost === null ? '-' : money(p.unit_cost)}</TextCell> },
              { key: 'margin', label: 'Margin', width: '90px', mobileLabel: 'Margin', render: p => <TextCell>{margin(p) === null ? '-' : `${margin(p)}%`}</TextCell> },
              { key: 'state', label: 'Status', width: '90px', hideOnMobile: true, render: p => <TextCell>{p.active ? 'Shown' : 'Hidden'}</TextCell> },
            ]}
          />
        </div>
      </div>

      {form && (
        <Modal
          title={form.id ? 'Edit item' : 'Add item'}
          size="sm"
          busy={saving}
          onClose={() => setForm(null)}
          footer={
            <>
              <button type="button" onClick={() => setForm(null)} style={BTN.secondary}>Cancel</button>
              <button type="button" onClick={save} disabled={saving} style={{ ...BTN.primary, ...(saving ? BTN.disabled : {}) }}>
                {saving ? 'Saving...' : form.id ? 'Save' : 'Add item'}
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={LABEL}>Name *</label>
              <input style={FIELD} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Split system service" maxLength={120} autoFocus />
            </div>
            <div>
              <label style={LABEL}>Description</label>
              <input style={FIELD} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Clean filters and coils, check gas, test run" maxLength={500} />
            </div>
            <div>
              <label style={LABEL}>Type</label>
              <Select style={FIELD} value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value as 'service' | 'product' })}>
                <option value="service">Service (labour, call-out)</option>
                <option value="product">Part (materials, equipment)</option>
              </Select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={LABEL}>Price ($, ex GST) *</label>
                <input type="number" inputMode="decimal" step="0.01" min="0" style={FIELD} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label style={LABEL}>Your cost ($)</label>
                <input type="number" inputMode="decimal" step="0.01" min="0" style={FIELD} value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="Optional" />
              </div>
            </div>
            <div style={{ fontSize: 12, color: TEXT3, lineHeight: 1.5 }}>Cost is only for you. It never appears on quotes or invoices; it gives the margin on this page.</div>
            {form.id && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: 18, height: 18, accentColor: TEAL }} />
                Show in the “Add from price list” picker
              </label>
            )}
            {error && <div style={{ fontSize: 13, fontWeight: 500, color: RED, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>{error}</div>}
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Delete ${deleteTarget.name}?`}
          message="Quotes and invoices that already use it are not changed."
          busy={deleting}
          busyLabel="Deleting..."
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => remove(deleteTarget)}
        />
      )}

      {notice && <Toast message={notice} onClose={() => setNotice('')} />}
    </div>
  )
}
