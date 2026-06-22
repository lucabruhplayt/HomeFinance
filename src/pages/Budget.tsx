import { useState } from 'react'
import { PiggyBank, AlertTriangle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'

export default function Budget() {
  const { state, setBudget, t, fa } = useFinance()
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const monthExpenses = state.expenses.filter(e => e.date.startsWith(month))

  const startEdit = (catId: string, current: number) => {
    setEditing(catId)
    setEditValue(current > 0 ? String(current) : '')
  }

  const saveBudget = (catId: string) => {
    setBudget({ categoryId: catId, amount: Number(editValue) || 0, month })
    setEditing(null)
  }

  const totalBudget = state.budgets
    .filter(b => b.month === month)
    .reduce((s, b) => s + b.amount, 0)
  const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('budget.title')}</h2>
          <p style={{ color: '#71717a', fontSize: '0.875rem' }}>{month}</p>
        </div>
        <input className="input-field" style={{ maxWidth: 160 }} type="month" value={month} onChange={e => setMonth(e.target.value)} />
      </div>

      <div className="stat-card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: 56, height: 56, borderRadius: '1rem', background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PiggyBank size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#71717a', marginBottom: '0.25rem' }}>
            <span>{fa(totalSpent)} {t('budget.spent')}</span>
            <span>{fa(totalBudget)} {t('budget.budget')}</span>
          </div>
          <div style={{ height: 10, background: '#f0f0f0', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{
              width: totalBudget > 0 ? `${Math.min(totalSpent / totalBudget * 100, 100)}%` : '0%',
              height: '100%',
              background: totalSpent > totalBudget ? '#ef4444' : '#10B981',
              borderRadius: 5,
              transition: 'width 0.5s',
            }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: totalSpent > totalBudget ? '#ef4444' : '#10B981', marginTop: '0.25rem' }}>
            {totalBudget > 0
              ? `${(totalSpent / totalBudget * 100).toFixed(0)}% ${t('budget.ofTotal')}`
              : t('budget.noBudget')}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {state.categories.map(cat => {
          const spent = monthExpenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
          const budget = state.budgets.find(b => b.categoryId === cat.id && b.month === month)
          const budgetAmt = budget?.amount || 0
          const pct = budgetAmt > 0 ? (spent / budgetAmt * 100) : 0
          const over = spent > budgetAmt && budgetAmt > 0
          const alertPct = state.settings.budgetAlert && budgetAmt > 0 && pct >= state.settings.budgetAlertPct && pct < 100

          return (
            <div key={cat.id} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: `${cat.color}15`, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                {cat.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    {cat.name}
                    {alertPct && <AlertTriangle size={14} style={{ color: '#f59e0b' }} />}
                    {over && <AlertTriangle size={14} style={{ color: '#ef4444' }} />}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: over ? '#ef4444' : '#52525b' }}>
                    {fa(spent)} / {editing === cat.id ? (
                      <input className="input-field" style={{ width: 80, padding: '0.25rem 0.5rem', display: 'inline' }}
                        type="number" min="0" step="0.01" value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => saveBudget(cat.id)}
                        onKeyDown={e => { if (e.key === 'Enter') saveBudget(cat.id); if (e.key === 'Escape') setEditing(null) }}
                        autoFocus />
                    ) : (
                      <span onClick={() => startEdit(cat.id, budgetAmt)} style={{ cursor: 'pointer', borderBottom: '1px dashed #d4d4d8' }}>
                        {budgetAmt > 0 ? fa(budgetAmt) : t('budget.set')}
                      </span>
                    )}
                  </span>
                </div>
                {budgetAmt > 0 && (
                  <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(pct, 100)}%`,
                      height: '100%',
                      background: over ? '#ef4444' : alertPct ? '#f59e0b' : cat.color,
                      borderRadius: 3,
                      transition: 'width 0.5s',
                    }} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
