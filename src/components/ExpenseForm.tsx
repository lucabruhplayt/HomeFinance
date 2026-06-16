import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import type { Expense } from '../types'

interface Props {
  onClose: () => void
  editExpense?: Expense | null
}

export default function ExpenseForm({ onClose, editExpense }: Props) {
  const { state, addExpense, updateExpense } = useFinance()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(state.categories[0]?.id || '')
  const [paidBy, setPaidBy] = useState(state.members[0]?.id || '')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [splitAmong, setSplitAmong] = useState<string[]>(state.members.map(m => m.id))

  useEffect(() => {
    if (editExpense) {
      setAmount(String(editExpense.amount))
      setDescription(editExpense.description)
      setCategoryId(editExpense.categoryId)
      setPaidBy(editExpense.paidBy)
      setDate(editExpense.date)
      setSplitAmong(editExpense.splitAmong)
    }
  }, [editExpense])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { amount: Number(amount), description, categoryId, paidBy, date, splitAmong }

    if (editExpense) {
      updateExpense({ ...data, id: editExpense.id })
    } else {
      addExpense(data)
    }
    onClose()
  }

  const toggleSplit = (id: string) => {
    setSplitAmong(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {editExpense ? 'Editează cheltuiala' : 'Adaugă cheltuială'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Suma (lei)</label>
            <input className="input-field" type="number" step="0.01" min="0" required
              value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Descriere</label>
            <input className="input-field" type="text" required
              value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Cumpărături săptămânale" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label>Categoria</label>
              <select className="input-field" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label>Plătit de</label>
              <select className="input-field" value={paidBy} onChange={e => setPaidBy(e.target.value)}>
                {state.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Data</label>
            <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>Împarte la</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
              {state.members.map(m => {
                const selected = splitAmong.includes(m.id)
                return (
                  <button key={m.id} type="button" onClick={() => toggleSplit(m.id)}
                    style={{
                      padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1px solid',
                      borderColor: selected ? m.color : '#e4e4e7',
                      background: selected ? `${m.color}15` : 'white',
                      color: selected ? m.color : '#71717a',
                      cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
                      transition: 'all 0.2s',
                    }}>
                    {m.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Anulează</button>
            <button type="submit" className="btn-primary">
              {editExpense ? 'Salvează' : 'Adaugă'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
