import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { Expense, Category } from '../types'

interface Props {
  expenses: Expense[]
  categories: Category[]
}

export function CategoryPie({ expenses, categories }: Props) {
  const data = categories.map(c => {
    const total = expenses.filter(e => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0)
    return { name: c.name, value: total, color: c.color }
  }).filter(d => d.value > 0)

  if (data.length === 0) return <p style={{ color: '#a1a1aa', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>Nicio cheltuială în această lună</p>

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
          {data.map((e, i) => <Cell key={i} fill={e.color} />)}
        </Pie>
        <Tooltip formatter={(v: unknown) => `${Number(v).toFixed(2)} lei`} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function DailyBar({ expenses }: { expenses: Expense[] }) {
  const days: Record<string, number> = {}
  expenses.forEach(e => {
    const d = e.date.slice(8, 10)
    days[d] = (days[d] || 0) + e.amount
  })
  const data = Object.entries(days).map(([day, total]) => ({ day, total })).sort((a, b) => Number(a.day) - Number(b.day))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v: unknown) => `${Number(v).toFixed(2)} lei`} />
        <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
