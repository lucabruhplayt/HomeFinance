import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'

const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#D946EF']

interface Props {
  onClose: () => void
}

export default function SettingsModal({ onClose }: Props) {
  const { state, addMember, removeMember } = useFinance()
  const [name, setName] = useState('')

  const handleAdd = () => {
    if (!name.trim()) return
    const idx = state.members.length % COLORS.length
    addMember({ name: name.trim(), color: COLORS[idx], avatar: name.trim()[0].toUpperCase() })
    setName('')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Setări</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Gestionare membri</label>
          <p style={{ color: '#71717a', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
            Adaugă sau elimină membri ai gospodăriei
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input className="input-field" placeholder="Nume membru nou"
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd() }} />
            <button className="btn-primary" onClick={handleAdd}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}>
              <Plus size={16} /> Adaugă
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {state.members.map(m => {
            const paid = state.expenses.filter(e => e.paidBy === m.id).reduce((s, e) => s + e.amount, 0)
            const share = state.expenses.filter(e => e.splitAmong.includes(m.id))
              .reduce((s, e) => s + e.amount / e.splitAmong.length, 0)
            const balance = paid - share
            return (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem', borderRadius: '0.75rem',
                background: '#f4f4f5',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: m.color, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8125rem', fontWeight: 600,
                  }}>
                    {m.avatar}
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{m.name}</p>
                    <p style={{ color: '#71717a', fontSize: '0.6875rem' }}>
                      {balance >= 0 ? '+' : ''}{balance.toFixed(2)} lei
                    </p>
                  </div>
                </div>
                {state.members.length > 1 && (
                  <button onClick={() => { if (confirm(`Ștergi pe ${m.name}?`)) removeMember(m.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.375rem' }}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e4e4e7' }}>
          <p style={{ color: '#a1a1aa', fontSize: '0.75rem', textAlign: 'center' }}>
            HomeFinance v1.0 &mdash; Datele sunt salvate local
          </p>
        </div>
      </div>
    </div>
  )
}
