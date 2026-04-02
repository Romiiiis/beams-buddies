'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const A = '#1C1C1E'
const TEAL = '#2AA198'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#5A5A5A'
const BORDER = '#EBEBEB'
const BG = '#FAFAF8'

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

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  draft:    { bg: '#F0F0F0', color: '#555', label: 'Draft' },
  sent:     { bg: '#DBEAFE', color: '#1E3A8A', label: 'Sent' },
  accepted: { bg: '#D1FAE5', color: '#064E3B', label: 'Accepted' },
  declined: { bg: '#FEE2E2', color: '#7F1D1D', label: 'Declined' },
  expired:  { bg: '#FEF3C7', color: '#78350F', label: 'Expired' },
}

type LineItem = { description: string; qty: number; unit_price: number }

export default function QuotesPage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [quotes, setQuotes] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [businessId, setBusinessId] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [form, setForm] = useState({
    customer_id: '',
    valid_until: '',
    notes: '',
    tax_rate: '10',
    line_items: [{ description: '', qty: 1, unit_price: 0 }] as LineItem[],
  })

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: userData } = await supabase
        .from('users')
        .select('business_id')
        .eq('id', session.user.id)
        .single()

      if (!userData) return
      setBusinessId(userData.business_id)

      const [quotesRes, customersRes] = await Promise.all([
        supabase.from('quotes').select('*, customers(first_name, last_name, suburb, phone, email)').eq('business_id', userData.business_id).order('created_at', { ascending: false }),
        supabase.from('customers').select('id, first_name, last_name, suburb').eq('business_id', userData.business_id),
      ])

      setQuotes(quotesRes.data || [])
      setCustomers(customersRes.data || [])
      setLoading(false)
    }

    load()
  }, [router])

  const todayStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const filtered = filterStatus === 'all' ? quotes : quotes.filter(q => q.status === filterStatus)

  const counts = { draft: 0, sent: 0, accepted: 0, declined: 0 }
  quotes.forEach(q => {
    if (counts[q.status as keyof typeof counts] !== undefined) {
      counts[q.status as keyof typeof counts]++
    }
  })

  const pad = isMobile ? '16px' : '32px'

  return (
    <div style={{ display: 'flex', height: '100vh', background: BG }}>
      <Sidebar active="/dashboard/quotes" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* DASHBOARD HEADER */}
        <div
          style={{
            background: '#fff',
            borderBottom: `1px solid ${BORDER}`,
            padding: isMobile ? '20px 16px 16px' : `28px ${pad} 20px`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: TEXT3, marginBottom: '6px' }}>{todayStr}</div>
            <div style={{ fontSize: '30px', fontWeight: '700', color: TEXT }}>Quotes</div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            style={{
              height: '38px',
              padding: '0 16px',
              borderRadius: '8px',
              border: 'none',
              background: A,
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            New quote
          </button>
        </div>

        <div style={{ padding: `${isMobile ? '16px' : '24px'} ${pad}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: '10px' }}>
            {[
              { label: 'Draft', value: counts.draft, color: '#555' },
              { label: 'Sent', value: counts.sent, color: '#1E3A8A' },
              { label: 'Accepted', value: counts.accepted, color: '#064E3B' },
              { label: 'Declined', value: counts.declined, color: '#7F1D1D' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px' }}>
                <div style={{ height: '3px', background: TEAL }} />
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: TEXT3 }}>{s.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* FILTER */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all','draft','sent','accepted','declined','expired'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: `1px solid ${filterStatus === s ? A : BORDER}`,
                  background: filterStatus === s ? A : '#fff',
                  color: filterStatus === s ? '#fff' : TEXT2,
                  fontSize: '13px',
                }}
              >
                {s === 'all' ? `All (${quotes.length})` : STATUS_STYLES[s]?.label}
              </button>
            ))}
          </div>

          {/* TABLE */}
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>Loading…</div>
            ) : (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr style={{ background: '#FAFAF8' }}>
                    {['Quote #','Customer','Amount','Valid','Status'].map(h => (
                      <th key={h} style={{ padding: '12px', fontSize: '11px', color: TEXT3 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(q => (
                    <tr key={q.id}>
                      <td style={{ padding: '12px' }}>{q.quote_number}</td>
                      <td style={{ padding: '12px' }}>{q.customers?.first_name}</td>
                      <td style={{ padding: '12px' }}>${q.total}</td>
                      <td style={{ padding: '12px' }}>{q.valid_until || '—'}</td>
                      <td style={{ padding: '12px' }}>{STATUS_STYLES[q.status]?.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}