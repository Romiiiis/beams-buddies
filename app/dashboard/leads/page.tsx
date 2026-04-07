'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'

const TEAL = '#33B5AC'
const TEAL_DARK = '#1E8C84'
const TEXT = '#0A0A0A'
const TEXT2 = '#2D2D2D'
const TEXT3 = '#6B7280'
const BORDER = '#E5E7EB'
const BG = '#F4F4F2'
const WHITE = '#FFFFFF'

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    booked:       { bg: '#D1FAE5', color: '#064E3B', label: 'Booked' },
    pending:      { bg: '#FEF3C7', color: '#78350F', label: 'Pending' },
    incomplete:   { bg: '#F3F4F6', color: '#6B7280', label: 'Incomplete' },
    wrong_number: { bg: '#FEE2E2', color: '#7F1D1D', label: 'Wrong number' },
    converted:    { bg: '#DBEAFE', color: '#1E3A8A', label: 'Converted' },
  }
  const s = map[status] || { bg: '#F3F4F6', color: '#6B7280', label: status }
  return (
    <span style={{ background: s.bg, color: s.color, padding: '4px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

function JobTypeBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    installation: { bg: '#EDE9FE', color: '#4C1D95' },
    service:      { bg: '#E6F5F4', color: '#0A4F4C' },
    repair:       { bg: '#FFE4E6', color: '#881337' },
    quote:        { bg: '#FEF3C7', color: '#78350F' },
    site_visit:   { bg: '#DBEAFE', color: '#1E3A8A' },
  }
  const s = map[type] || { bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {type?.replace('_', ' ')}
    </span>
  )
}

export default function LeadsPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [converting, setConverting] = useState<string | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return
      setBusinessId(userData.business_id)

      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      setLeads(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const filtered = leads.filter(l => {
    const matchSearch = search
      ? `${l.customer_name} ${l.phone_number} ${l.suburb} ${l.job_type}`.toLowerCase().includes(search.toLowerCase())
      : true
    const matchStatus = filterStatus === 'all' ? true : l.status === filterStatus
    return matchSearch && matchStatus
  })

  async function convertToJob(lead: any) {
    if (!businessId) return
    setConverting(lead.id)
    try {
      // 1. Create customer
      const { data: customer, error: custErr } = await supabase
        .from('customers')
        .insert([{
          business_id: businessId,
          first_name: lead.customer_name?.split(' ')[0] || lead.customer_name,
          last_name: lead.customer_name?.split(' ').slice(1).join(' ') || '',
          phone: lead.phone_number,
          address: lead.address,
          suburb: lead.suburb,
        }])
        .select()
        .single()

      if (custErr) throw custErr

      // 2. Create job
      const { error: jobErr } = await supabase
        .from('jobs')
        .insert([{
          business_id: businessId,
          customer_id: customer.id,
          notes: `${lead.job_type} — ${lead.issue_summary}. Booked: ${lead.preferred_date} at ${lead.preferred_start_time}.`,
        }])

      if (jobErr) throw jobErr

      // 3. Mark lead as converted
      await supabase.from('leads').update({ status: 'converted' }).eq('id', lead.id)

      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'converted' } : l))
    } catch (err) {
      console.error('Convert error:', err)
      alert('Failed to convert lead. Check console.')
    }
    setConverting(null)
  }

  const todayStr = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pad = isMobile ? '16px' : '32px'

  const card: React.CSSProperties = {
    background: WHITE,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  }

  const statuses = ['all', 'booked', 'pending', 'incomplete', 'converted', 'wrong_number']

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, overflow: 'hidden' }}>
      <Sidebar active="/dashboard/leads" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{
          background: TEAL,
          padding: isMobile ? '24px 16px 22px' : `32px ${pad} 28px`,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.2px' }}>{todayStr}</div>
            <div style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '800', color: WHITE, letterSpacing: '-0.8px', lineHeight: 1 }}>Leads</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '6px' }}>Inbound calls from Chloe</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: WHITE, lineHeight: 1 }}>{leads.filter(l => l.status === 'booked').length}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>Booked</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: WHITE, lineHeight: 1 }}>{leads.filter(l => l.status === 'pending').length}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>Pending</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: WHITE, lineHeight: 1 }}>{leads.filter(l => l.status === 'converted').length}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>Converted</div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: `28px ${pad}`, paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, suburb…"
              style={{ width: '100%', maxWidth: '320px', height: '40px', padding: '0 14px', borderRadius: '9px', border: `1px solid ${BORDER}`, background: WHITE, fontSize: '13px', color: TEXT, outline: 'none', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {statuses.map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: `1px solid ${filterStatus === s ? TEAL : BORDER}`, background: filterStatus === s ? TEAL : WHITE, color: filterStatus === s ? WHITE : TEXT3, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                  {s === 'all' ? 'All' : s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center', color: TEXT3, fontSize: '14px' }}>No leads yet. Calls from Chloe will appear here.</div>
          ) : isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map(lead => (
                <div key={lead.id} style={{ ...card, padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: TEXT }}>{lead.customer_name}</div>
                      <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{lead.phone_number}</div>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <JobTypeBadge type={lead.job_type} />
                    <span style={{ fontSize: '12px', color: TEXT3, alignSelf: 'center' }}>{lead.suburb}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: TEXT2, marginBottom: '10px' }}>{lead.issue_summary}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: TEXT3 }}>{lead.preferred_date} · {lead.preferred_start_time}</span>
                    {lead.status === 'booked' && (
                      <button onClick={() => convertToJob(lead)} disabled={converting === lead.id}
                        style={{ height: '32px', padding: '0 14px', borderRadius: '7px', border: 'none', background: TEAL, color: WHITE, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: converting === lead.id ? 0.6 : 1 }}>
                        {converting === lead.id ? 'Converting…' : 'Convert to job'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={card}>
              <div style={{ padding: '14px 22px', borderBottom: `1px solid ${BORDER}`, background: '#FAFAFA' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Inbound calls</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>All leads · {filtered.length}</div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Customer', 'Phone', 'Job type', 'Address', 'Date & time', 'Summary', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: TEXT3, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(lead => (
                    <tr key={lead.id} style={{ borderBottom: `1px solid ${BORDER}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>{lead.customer_name}</div>
                        <div style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{lead.suburb}</div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: TEXT2, fontWeight: '500', whiteSpace: 'nowrap' }}>{lead.phone_number}</td>
                      <td style={{ padding: '14px 18px' }}><JobTypeBadge type={lead.job_type} /></td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: TEXT2, maxWidth: '180px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.address}</div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: TEXT2, whiteSpace: 'nowrap' }}>
                        <div>{lead.preferred_date}</div>
                        <div style={{ color: TEXT3, fontSize: '12px' }}>{lead.preferred_start_time}</div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: TEXT2, maxWidth: '200px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.issue_summary}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}><StatusBadge status={lead.status} /></td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {lead.status === 'booked' && (
                          <button onClick={() => convertToJob(lead)} disabled={converting === lead.id}
                            style={{ height: '32px', padding: '0 14px', borderRadius: '7px', border: `1px solid ${TEAL}`, background: WHITE, color: TEAL_DARK, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: converting === lead.id ? 0.6 : 1 }}
                            onMouseEnter={e => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = WHITE }}
                            onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.color = TEAL_DARK }}>
                            {converting === lead.id ? 'Converting…' : 'Convert to job →'}
                          </button>
                        )}
                        {lead.status === 'converted' && (
                          <span style={{ fontSize: '12px', color: TEXT3, fontWeight: '600' }}>Converted ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}