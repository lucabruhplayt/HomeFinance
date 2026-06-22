import { TrendingUp, Receipt, Users } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { CategoryPie, DailyBar } from '../components/Charts'
import DailyReminder from '../components/DailyReminder'

export default function Dashboard() {
  const { state, t, fa } = useFinance()

  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthExpenses = state.expenses.filter(e => e.date.startsWith(month))

  const total = monthExpenses.reduce((s, e) => s + e.amount, 0)
  const avgPerPerson = state.members.length > 0 ? total / state.members.length : 0
  const expenseCount = monthExpenses.length
  const lastMonth = monthExpenses.filter(e => {
    const d = new Date(e.date)
    return d.getDate() > now.getDate() - 7
  }).reduce((s, e) => s + e.amount, 0)

  const stats = [
    { label: t('dashboard.total'), value: fa(total), icon: <Receipt size={22} />, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    { label: t('dashboard.avg'), value: fa(avgPerPerson), icon: <Users size={22} />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { label: t('dashboard.week'), value: fa(lastMonth), icon: <TrendingUp size={22} />, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { label: t('dashboard.count'), value: String(expenseCount), icon: <Receipt size={22} />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  ]

  const catTotals = state.categories.map(c => {
    const t = monthExpenses.filter(e => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0)
    return { ...c, total: t }
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('dashboard.title')}</h2>
        <p style={{ color: '#71717a', fontSize: '0.875rem' }}>
          {month} — {t('dashboard.subtitle')}
        </p>
      </div>

      <DailyReminder />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '1rem',
              background: s.bg, color: s.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {s.icon}
            </div>
            <div>
              <p style={{ color: '#71717a', fontSize: '0.75rem', marginBottom: '0.125rem' }}>{s.label}</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="stat-card">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('dashboard.byCategory')}</h3>
          <CategoryPie expenses={monthExpenses} categories={state.categories} />
        </div>
        <div className="stat-card">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('dashboard.daily')}</h3>
          <DailyBar expenses={monthExpenses} categories={state.categories} />
        </div>
      </div>

      {catTotals.length > 0 && (
        <div className="stat-card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>{t('dashboard.breakdown')}</h3>
          {catTotals.map(c => {
            const pct = total > 0 ? (c.total / total * 100) : 0
            return (
              <div key={c.id} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                  <span>{fa(c.total)} ({pct.toFixed(0)}%)</span>
                </div>
                <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: c.color, borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
