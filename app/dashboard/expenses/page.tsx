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
import { ConfirmDialog, FONT, LINE, TEXT, Toast, useIsPhone } from '@/components/forms'
import { money, moneyWhole } from '@/lib/format'
import { EXPENSE_CATEGORIES, type Expense, categoryLabel, dateKey, financialYearStart, sumExpenses } from '@/lib/expenses'
import { ExpenseModal, jobLabel, type JobOption } from './ExpenseModal'

const BG = '#FAFAFA'

const COLUMNS = 'id, business_id, spent_on, description, supplier, category, amount, gst, job_id, created_at'

const dayText = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

const newestFirst = (a: Expense, b: Expense) => (a.spent_on === b.spent_on ? (a.created_at < b.created_at ? 1 : -1) : a.spent_on < b.spent_on ? 1 : -1)

export default function ExpensesPage() {
  const router = useRouter()
  const isMobile = useIsPhone()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [jobs, setJobs] = useState<JobOption[]>([])
  const [businessId, setBusinessId] = useState('')
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Expense | null>(null)
  const [adding, setAdding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState<{ text: string; tone: 'dark' | 'error' } | null>(null)

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
      const [ex, jb] = await Promise.all([
        supabase.from('expenses').select(COLUMNS).eq('business_id', userData.business_id).order('spent_on', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('jobs').select('id, brand, model, equipment_type, customers(first_name, last_name)').eq('business_id', userData.business_id),
      ])
      if (ex.error) setNotice({ text: 'Expenses could not be loaded. Please refresh.', tone: 'error' })
      setExpenses((ex.data as unknown as Expense[]) || [])
      setJobs((jb.data as unknown as JobOption[]) || [])
      setLoading(false)
    }
    load()
  }, [router])

  const jobById = useMemo(() => new Map(jobs.map(j => [j.id, j])), [jobs])
  const jobText = (e: Expense) => (e.job_id && jobById.get(e.job_id) ? jobLabel(jobById.get(e.job_id) as JobOption) : '')

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    expenses.forEach(e => {
      c[e.category] = (c[e.category] || 0) + 1
    })
    return c
  }, [expenses])

  const rows = useMemo(() => {
    const byCategory = category === 'all' ? expenses : expenses.filter(e => e.category === category)
    const term = search.trim().toLowerCase()
    if (!term) return byCategory
    return byCategory.filter(e => [e.description, e.supplier, categoryLabel(e.category), jobText(e)].some(t => String(t || '').toLowerCase().includes(term)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, category, search, jobById])

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const fyStart = financialYearStart(now)
  const between = (e: Expense, from: Date, to?: Date) => e.spent_on >= dateKey(from) && (!to || e.spent_on < dateKey(to))
  const thisMonth = sumExpenses(expenses.filter(e => between(e, monthStart)))
  const lastMonth = sumExpenses(expenses.filter(e => between(e, lastMonthStart, monthStart)))
  const thisYear = sumExpenses(expenses.filter(e => between(e, fyStart)))
  const plural = (n: number) => `${n} expense${n === 1 ? '' : 's'}`

  const strip = [
    { label: 'This month', value: moneyWhole(thisMonth.amount), sub: plural(thisMonth.count) },
    { label: 'Last month', value: moneyWhole(lastMonth.amount), sub: plural(lastMonth.count) },
    { label: 'Financial year', value: moneyWhole(thisYear.amount), sub: `since 1 Jul ${fyStart.getFullYear()}` },
    { label: 'GST in costs', value: moneyWhole(thisYear.gst), sub: 'this financial year' },
  ]

  const tabs = [{ value: 'all', label: 'All', count: expenses.length }, ...EXPENSE_CATEGORIES.map(c => ({ value: c.value as string, label: c.label, count: counts[c.value] || 0 }))]

  function saved(e: Expense) {
    setExpenses(prev => (prev.some(x => x.id === e.id) ? prev.map(x => (x.id === e.id ? e : x)) : [e, ...prev]).sort(newestFirst))
    setNotice({ text: editing ? 'Expense saved' : 'Expense added', tone: 'dark' })
    setEditing(null)
    setAdding(false)
  }

  async function remove(e: Expense) {
    setDeleting(true)
    const { error } = await supabase.from('expenses').delete().eq('id', e.id)
    setDeleting(false)
    setDeleteTarget(null)
    if (error) {
      setNotice({ text: 'Could not delete the expense. Please try again.', tone: 'error' })
      return
    }
    setExpenses(prev => prev.filter(x => x.id !== e.id))
    setEditing(null)
    setNotice({ text: 'Expense deleted', tone: 'dark' })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Sidebar active="/dashboard/expenses" />
        <PageSkeleton variant="list" label="Loading expenses" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', fontFamily: FONT, background: BG, minHeight: '100vh' }}>
      <Sidebar active="/dashboard/expenses" />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: BG }}>
        <div
          style={{
            background: BG,
            borderBottom: `1px solid ${LINE}`,
            padding: isMobile ? '14px 14px 12px' : '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', margin: 0 }}>Expenses</h1>
          <HeaderToolbar
            isMobile={isMobile}
            search={{ value: search, onChange: setSearch, placeholder: 'Search...' }}
            items={[{ label: 'Add expense', icon: <AppIcon name="add" size={15} />, tone: 'primary', onClick: () => setAdding(true) }]}
          />
        </div>

        <div
          className="page-content"
          style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : 48, background: BG }}
        >
          <StatStrip items={strip} isMobile={isMobile} />

          <DataList<Expense>
            title="Expense list"
            isMobile={isMobile}
            rows={rows}
            rowKey={e => e.id}
            emptyText={expenses.length === 0 ? 'No expenses yet. Add what you spend on materials, fuel and tools to see what each job really earns.' : 'No expenses match.'}
            onRowClick={e => setEditing(e)}
            rowActions={() => [
              { label: 'Edit expense', onClick: e => setEditing(e) },
              { label: 'Delete expense', danger: true, onClick: e => setDeleteTarget(e) },
            ]}
            tabs={tabs}
            activeTab={category}
            onTabChange={setCategory}
            columns={[
              {
                key: 'what',
                label: 'Expense',
                width: 'minmax(0,1.6fr)',
                render: e => <PersonCell name={e.description} sub={[e.supplier, jobText(e)].filter(Boolean).join(' · ') || categoryLabel(e.category)} />,
              },
              { key: 'date', label: 'Date', width: '112px', mobileLabel: 'Date', render: e => <TextCell>{dayText(e.spent_on)}</TextCell> },
              { key: 'category', label: 'Category', width: '124px', mobileLabel: 'Category', render: e => <TextCell>{categoryLabel(e.category)}</TextCell> },
              { key: 'amount', label: 'Amount', width: '104px', mobileLabel: 'Amount', render: e => <TextCell strong>{money(e.amount)}</TextCell> },
              { key: 'gst', label: 'GST', width: '86px', hideOnMobile: true, render: e => <TextCell>{Number(e.gst) > 0 ? money(e.gst) : '-'}</TextCell> },
            ]}
          />
        </div>
      </div>

      {(adding || editing) && (
        <ExpenseModal
          key={editing?.id || 'new'}
          businessId={businessId}
          expense={editing}
          jobs={jobs}
          onClose={() => {
            setAdding(false)
            setEditing(null)
          }}
          onSaved={saved}
          onDeleted={id => {
            const target = expenses.find(x => x.id === id)
            setExpenses(prev => prev.filter(x => x.id !== id))
            setEditing(null)
            setAdding(false)
            if (target) setNotice({ text: 'Expense deleted', tone: 'dark' })
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this expense?"
          message={
            <>
              {deleteTarget.description} ({money(deleteTarget.amount)}) will be removed{deleteTarget.job_id ? ", and the job's profit goes up by that cost" : ''}. This cannot be undone.
            </>
          }
          busy={deleting}
          busyLabel="Deleting..."
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => remove(deleteTarget)}
        />
      )}

      {notice && <Toast message={notice.text} tone={notice.tone} onClose={() => setNotice(null)} />}
    </div>
  )
}
