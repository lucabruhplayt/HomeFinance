import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, Search, Download } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import ExpenseForm from '../components/ExpenseForm'
import { useMediaQuery } from '../utils/useMediaQuery'
import type { Expense } from '../types'

export default function Expenses() {
  const { state, removeExpense, getCategory, getMember, t, fa, fd } = useFinance()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [showForm, setShowForm] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterMember, setFilterMember] = useState('')
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const prevLenRef = useRef(0)

  useEffect(() => {
    if (prevLenRef.current > 0 && state.expenses.length > prevLenRef.current) {
      setHighlightedId(state.expenses[state.expenses.length - 1].id)
      setTimeout(() => setHighlightedId(null), 2500)
    }
    prevLenRef.current = state.expenses.length
  }, [state.expenses.length])

  const filtered = useMemo(() => {
    let list = state.expenses.filter(e => e.date.startsWith(month))
    if (search) list = list.filter(e => e.description.toLowerCase().includes(search.toLowerCase()))
    if (filterCategory) list = list.filter(e => e.categoryId === filterCategory)
    if (filterMember) list = list.filter(e => e.paidBy === filterMember)
    list.sort((a, b) => b.date.localeCompare(a.date))
    return list
  }, [state.expenses, month, search, filterCategory, filterMember])

  const exportCSV = () => {
    const rows = [[t('expenses.date'), t('expenses.description'), t('expenses.category'), t('expenses.paidBy'), t('expenses.amount')]]
    filtered.forEach(e => {
      const cat = getCategory(e.categoryId)?.name || '-'
      const member = getMember(e.paidBy)?.name || '-'
      rows.push([e.date, e.description, cat, member, e.amount.toFixed(2)])
    })
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `cheltuieli_${month}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const total = filtered.reduce((s, e) => s + e.amount, 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '1.5rem', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0.75rem' : 0 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('expenses.title')}</h2>
          <p style={{ color: '#71717a', fontSize: '0.875rem' }}>{filtered.length} {t('common.transactions')} — {fa(total)} {t('common.total')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Download size={16} /> {t('expenses.export')}
          </button>
          <button className="btn-primary" onClick={() => { setEditExpense(null); setShowForm(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Plus size={16} /> {t('expenses.add')}
          </button>
        </div>
      </div>

      <div className="stat-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? 0 : 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
            <input className="input-field" style={{ paddingLeft: '2.25rem' }}
              placeholder={t('expenses.search')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input className="input-field" style={{ maxWidth: isMobile ? '100%' : 160, flex: isMobile ? '1 1 100%' : undefined }} type="month"
            value={month} onChange={e => setMonth(e.target.value)} />
          <select className="input-field" style={{ maxWidth: isMobile ? '100%' : 160, flex: isMobile ? '1 1 100%' : undefined }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">{t('expenses.allCategories')}</option>
            {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input-field" style={{ maxWidth: isMobile ? '100%' : 160, flex: isMobile ? '1 1 100%' : undefined }} value={filterMember} onChange={e => setFilterMember(e.target.value)}>
            <option value="">{t('expenses.allMembers')}</option>
            {state.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.625rem' }}>
        {filtered.length === 0 ? (
          <div className="stat-card" style={{ padding: '2rem', textAlign: 'center', color: '#a1a1aa', fontSize: '0.875rem' }}>{t('expenses.noResults')}</div>
        ) : filtered.map((e, i) => {
          const cat = getCategory(e.categoryId)
          const member = getMember(e.paidBy)
          const isNew = e.id === highlightedId
          return (
            <div key={e.id} className="expense-row" style={{
              display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '0.75rem',
              padding: isMobile ? '0.75rem 1rem' : '0.875rem 1.25rem',
              borderRadius: '0.875rem',
              background: isNew ? 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.03))' : 'var(--glass-bg)',
              border: isNew ? '1px solid rgba(37,99,235,0.2)' : '1px solid var(--glass-border)',
              boxShadow: isNew ? '0 0 24px rgba(37,99,235,0.12)' : 'var(--glass-shadow)',
              animation: `${isNew ? 'highlightPulse 2.5s ease forwards' : `slideUp 0.35s ease ${i * 0.05}s both`}`,
              transition: 'all 0.25s',
              cursor: 'default',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
            }}>
              <div style={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.125rem' }}>{e.description}</p>
                  <p style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>{fd(e.date)}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{fa(e.amount)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: isMobile ? '1 1 auto' : undefined, justifyContent: isMobile ? 'flex-start' : undefined }}>
                {cat && <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.6875rem', fontWeight: 500,
                  background: `${cat.color}15`, color: cat.color, whiteSpace: 'nowrap',
                }}>{cat.name}</span>}
                {member && <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  fontSize: '0.75rem', color: '#52525b',
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', background: member.color, color: 'white',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.625rem', fontWeight: 600, flexShrink: 0,
                  }}>{member.avatar}</span>
                  <span className="member-label">{member.name}</span>
                </span>}
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0, alignSelf: isMobile ? 'flex-end' : 'center' }}>
                <button onClick={() => { setEditExpense(e); setShowForm(true) }}
                  className="icon-btn" style={{ color: '#71717a' }}>
                  <Pencil size={15} />
                </button>
                <button onClick={() => { if (confirm(t('delete.confirm'))) removeExpense(e.id) }}
                  className="icon-btn" style={{ color: '#ef4444' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {showForm && <ExpenseForm onClose={() => { setShowForm(false); setEditExpense(null) }} editExpense={editExpense} />}
    </div>
  )
}
