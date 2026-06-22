import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useFinance } from '../context/FinanceContext'
import type { Expense, Category } from '../types'

interface Props {
  expenses: Expense[]
  categories: Category[]
}

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const { name, value, color } = payload[0].payload
  const { fa } = useFinance()
  return (
    <div style={{
      animation: 'scaleIn 0.15s ease both',
      transformOrigin: 'top left',
      background: 'white',
      borderRadius: 12,
      padding: '0.625rem 1rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.625rem',
      border: '1px solid rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }} />
      <div>
        <p style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: 2 }}>{name}</p>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#18181B' }}>{fa(value)}</p>
      </div>
    </div>
  )
}

function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const { fa } = useFinance()
  const sorted = [...payload].sort((a: any, b: any) => b.value - a.value)
  const total = sorted.reduce((s: number, p: any) => s + Number(p.value), 0)
  return (
    <div style={{
      animation: 'scaleIn 0.15s ease both',
      transformOrigin: 'top left',
      background: 'white',
      borderRadius: 12,
      padding: '0.625rem 0.875rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.04)',
      minWidth: 140,
    }}>
      <p style={{ fontSize: '0.7rem', color: '#71717a', marginBottom: 6, fontWeight: 500 }}>Ziua {label}</p>
      {sorted.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 3, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: '#52525b' }}>{p.dataKey}</span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#18181B' }}>{fa(p.value)}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 4, paddingTop: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.7rem', color: '#71717a' }}>Total</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#18181B' }}>{fa(total)}</span>
      </div>
    </div>
  )
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
        <Tooltip content={<CustomPieTooltip />} position={{ x: 12, y: 115 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function DailyBar({ expenses, categories }: { expenses: Expense[]; categories: Category[] }) {
  const catMap = new Map(categories.map(c => [c.id, c]))

  const dayBuckets: Record<string, Record<string, number>> = {}
  expenses.forEach(e => {
    const d = e.date.slice(8, 10)
    if (!dayBuckets[d]) dayBuckets[d] = {}
    dayBuckets[d][e.categoryId] = (dayBuckets[d][e.categoryId] || 0) + e.amount
  })

  const categoryIds = new Set<string>()
  Object.values(dayBuckets).forEach(b => Object.keys(b).forEach(cid => categoryIds.add(cid)))

  const data = Object.entries(dayBuckets)
    .map(([day, cats]) => {
      const entry: Record<string, any> = { day }
      Object.keys(cats).forEach(cid => { entry[catMap.get(cid)?.name || cid] = cats[cid] })
      return entry
    })
    .sort((a, b) => Number(a.day) - Number(b.day))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomBarTooltip />} />
        {Array.from(categoryIds)
          .sort((a, b) => {
            const totalA = expenses.filter(e => e.categoryId === a).reduce((s, e) => s + e.amount, 0)
            const totalB = expenses.filter(e => e.categoryId === b).reduce((s, e) => s + e.amount, 0)
            return totalB - totalA
          })
          .map(cid => {
            const cat = catMap.get(cid)
            return (
              <Bar key={cid} dataKey={cat?.name || cid} stackId="stack" fill={cat?.color || '#6B7280'} radius={[4, 4, 0, 0]} />
            )
          })}
      </BarChart>
    </ResponsiveContainer>
  )
}
