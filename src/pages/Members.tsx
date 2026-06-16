import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'

const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#D946EF']

export default function Members() {
  const { state, addMember, removeMember } = useFinance()
  const [name, setName] = useState('')

  const handleAdd = () => {
    if (!name.trim()) return
    const idx = state.members.length % COLORS.length
    addMember({ name: name.trim(), color: COLORS[idx], avatar: name.trim()[0].toUpperCase() })
    setName('')
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Membri</h2>

      <div className="stat-card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
        <input className="input-field" placeholder="Nume membru nou"
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd() }} />
        <button className="btn-primary" onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}>
          <Plus size={16} /> Adaugă
        </button>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {state.members.map(m => {
          const paid = state.expenses.filter(e => e.paidBy === m.id).reduce((s, e) => s + e.amount, 0)
          const share = state.expenses.filter(e => e.splitAmong.includes(m.id))
            .reduce((s, e) => s + e.amount / e.splitAmong.length, 0)
          const balance = paid - share
          return (
            <div key={m.id} className="stat-card" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: m.color, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 600,
                }}>
                  {m.avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{m.name}</p>
                  <p style={{ color: '#71717a', fontSize: '0.75rem' }}>
                    A plătit {paid.toFixed(2)} lei &middot; îi revin {share.toFixed(2)} lei
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: balance >= 0 ? '#10B981' : '#EF4444' }}>
                    {balance >= 0 ? '+' : ''}{balance.toFixed(2)} lei
                  </p>
                  <p style={{ color: '#71717a', fontSize: '0.6875rem' }}>
                    {balance >= 0 ? 'de primit' : 'de plătit'}
                  </p>
                </div>
                {state.members.length > 1 && (
                  <button onClick={() => { if (confirm(`Ștergi pe ${m.name}?`)) removeMember(m.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.375rem' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="stat-card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Decontări sugerate</h3>
        {state.members.length < 2 ? (
          <p style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>Adaugă cel puțin 2 membri pentru a vedea decontările</p>
        ) : (
          (() => {
            const balances = state.members.map(m => {
              const paid = state.expenses.filter(e => e.paidBy === m.id).reduce((s, e) => s + e.amount, 0)
              const share = state.expenses.filter(e => e.splitAmong.includes(m.id))
                .reduce((s, e) => s + e.amount / e.splitAmong.length, 0)
              return { id: m.id, name: m.name, balance: paid - share }
            })
            const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance)
            const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance)
            const settlements: { from: string; to: string; amount: number }[] = []
            let i = 0, j = 0
            while (i < debtors.length && j < creditors.length) {
              const amt = Math.min(-debtors[i].balance, creditors[j].balance)
              if (amt > 1) settlements.push({ from: debtors[i].name, to: creditors[j].name, amount: amt })
              debtors[i].balance += amt
              creditors[j].balance -= amt
              if (Math.abs(debtors[i].balance) < 0.01) i++
              if (Math.abs(creditors[j].balance) < 0.01) j++
            }
            return settlements.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {settlements.map((s, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', borderRadius: '0.75rem',
                    background: '#f4f4f5', fontSize: '0.875rem',
                  }}>
                    <span style={{ fontWeight: 500 }}>{s.from}</span>
                    <span style={{ color: '#71717a' }}>plătește</span>
                    <span style={{ fontWeight: 600, color: '#10B981' }}>{s.amount.toFixed(2)} lei</span>
                    <span style={{ color: '#71717a' }}>către</span>
                    <span style={{ fontWeight: 500 }}>{s.to}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: '#10B981', fontSize: '0.875rem' }}>Toate sunt echilibrate! </p>
          })()
        )}
      </div>
    </div>
  )
}
