import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, ArrowUpDown, Search, Download } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import ExpenseForm from '../components/ExpenseForm'
import type { Expense } from '../types'

type SortKey = 'date' | 'amount' | 'description'
type SortDir = 'asc' | 'desc'

export default function Expenses() {
  const { state, removeExpense, getCategory, getMember } = useFinance()
  const [showForm, setShowForm] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterMember, setFilterMember] = useState('')
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const filtered = useMemo(() => {
    let list = state.expenses.filter(e => e.date.startsWith(month))
    if (search) list = list.filter(e => e.description.toLowerCase().includes(search.toLowerCase()))
    if (filterCategory) list = list.filter(e => e.categoryId === filterCategory)
    if (filterMember) list = list.filter(e => e.paidBy === filterMember)
    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'date') cmp = a.date.localeCompare(b.date)
      else if (sortKey === 'amount') cmp = a.amount - b.amount
      else cmp = a.description.localeCompare(b.description)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [state.expenses, month, search, filterCategory, filterMember, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const exportCSV = () => {
    const rows = [['Data', 'Descriere', 'Categorie', 'Plătit de', 'Suma', 'Împărțit la']]
    filtered.forEach(e => {
      const cat = getCategory(e.categoryId)?.name || '-'
      const member = getMember(e.paidBy)?.name || '-'
      const names = e.splitAmong.map(id => getMember(id)?.name || '-').join('; ')
      rows.push([e.date, e.description, cat, member, e.amount.toFixed(2), names])
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Cheltuieli</h2>
          <p style={{ color: '#71717a', fontSize: '0.875rem' }}>{filtered.length} tranzacții — {total.toFixed(2)} lei total</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn-primary" onClick={() => { setEditExpense(null); setShowForm(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Plus size={16} /> Adaugă
          </button>
        </div>
      </div>

      <div className="stat-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
            <input className="input-field" style={{ paddingLeft: '2.25rem' }}
              placeholder="Caută după descriere..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input className="input-field" style={{ maxWidth: 160 }} type="month"
            value={month} onChange={e => setMonth(e.target.value)} />
          <select className="input-field" style={{ maxWidth: 160 }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">Toate categoriile</option>
            {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input-field" style={{ maxWidth: 160 }} value={filterMember} onChange={e => setFilterMember(e.target.value)}>
            <option value="">Toți membrii</option>
            {state.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                {(['date', 'description', 'amount'] as SortKey[]).map(key => (
                  <th key={key} onClick={() => toggleSort(key)}
                    style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#71717a', fontWeight: 500, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {key === 'date' ? 'Data' : key === 'description' ? 'Descriere' : 'Suma'}
                      <ArrowUpDown size={14} />
                    </span>
                  </th>
                ))}
                <th style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#71717a', fontWeight: 500, whiteSpace: 'nowrap' }}>Categorie</th>
                <th style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#71717a', fontWeight: 500, whiteSpace: 'nowrap' }}>Plătit de</th>
                <th style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#71717a', fontWeight: 500, whiteSpace: 'nowrap' }}>Împărțit la</th>
                <th style={{ padding: '0.875rem 1rem', width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#a1a1aa' }}>Nicio cheltuială găsită</td></tr>
              ) : filtered.map(e => {
                const cat = getCategory(e.categoryId)
                const member = getMember(e.paidBy)
                const perPerson = e.splitAmong.length > 0 ? e.amount / e.splitAmong.length : e.amount
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                    <td style={{ padding: '0.875rem 1rem', color: '#52525b', whiteSpace: 'nowrap' }}>{e.date}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 500 }}>{e.description}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{e.amount.toFixed(2)} lei</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {cat && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', background: `${cat.color}15`, color: cat.color }}>{cat.name}</span>}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      {member && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: member.color, color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 600 }}>{member.avatar}</span>
                        {member.name}
                      </span>}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#71717a', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {e.splitAmong.length} pers. &middot; {perPerson.toFixed(2)} lei/pers
                    </td>
                    <td style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
                      <button onClick={() => { setEditExpense(e); setShowForm(true) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: '0.25rem' }}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => { if (confirm('Ștergi această cheltuială?')) removeExpense(e.id) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <ExpenseForm onClose={() => { setShowForm(false); setEditExpense(null) }} editExpense={editExpense} />}
    </div>
  )
}
