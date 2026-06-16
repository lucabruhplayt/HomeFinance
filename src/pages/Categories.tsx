import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'

const COLORS = ['#F97316', '#EAB308', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#14B8A6', '#6B7280', '#84CC16', '#06B6D4', '#D946EF', '#F43F5E']
const ICONS = ['ShoppingCart', 'Home', 'Car', 'Heart', 'BookOpen', 'Film', 'Zap', 'MoreHorizontal', 'Coffee', 'Gift', 'Wifi', 'Shirt']

export default function Categories() {
  const { state, addCategory, removeCategory } = useFinance()
  const [name, setName] = useState('')

  const handleAdd = () => {
    if (!name.trim()) return
    const idx = state.categories.length % COLORS.length
    addCategory({ name: name.trim(), icon: ICONS[idx], color: COLORS[idx] })
    setName('')
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Categorii</h2>

      <div className="stat-card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
        <input className="input-field" placeholder="Nume categorie nouă"
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd() }} />
        <button className="btn-primary" onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}>
          <Plus size={16} /> Adaugă
        </button>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {state.categories.map(cat => (
          <div key={cat.id} className="stat-card" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '0.75rem',
                background: `${cat.color}15`, color: cat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 600,
              }}>
                {cat.name[0]}
              </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{cat.name}</p>
                <p style={{ color: '#71717a', fontSize: '0.75rem' }}>
                  {state.expenses.filter(e => e.categoryId === cat.id).length} cheltuieli
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => {
                    const { name, icon } = state.categories.find(x => x.id === cat.id)!
                    removeCategory(cat.id)
                    addCategory({ name, icon, color: c })
                  }}
                    style={{
                      width: 20, height: 20, borderRadius: '50%', border: cat.color === c ? '2px solid #18181B' : '1px solid #e4e4e7',
                      background: c, cursor: 'pointer', padding: 0,
                    }} />
                ))}
              </div>
              <button onClick={() => { if (confirm('Ștergi această categorie?')) removeCategory(cat.id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.375rem' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
