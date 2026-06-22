import { useState } from 'react'
import { Plus, Trash2, Pencil, Palette, X, PiggyBank } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import type { Category } from '../types'

const COLORS = ['#F97316', '#EAB308', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#14B8A6', '#84CC16', '#D946EF', '#06B6D4', '#F43F5E', '#6B7280']
const EMOJIS = ['🍕', '🚗', '🏠', '⚡', '🎬', '💊', '📚', '🛍️', '🎁', '👕', '🛠️', '💡', '🐾', '✈️', '🎮', '☕']

export default function Categories() {
  const { state, addCategory, updateCategory, setBudget, removeCategory, t, fa } = useFinance()
  const [showForm, setShowForm] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [color, setColor] = useState(COLORS[0])
  const [budgetAmount, setBudgetAmount] = useState('')
  const [month] = useState(new Date().toISOString().slice(0, 7))
  const [editingBudget, setEditingBudget] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const isEditing = editingCat !== null

  const openAdd = () => {
    setEditingCat(null)
    setName('')
    setEmoji(EMOJIS[0])
    setColor(COLORS[0])
    setBudgetAmount('')
    setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setEditingCat(cat)
    setName(cat.name)
    setEmoji(cat.icon && EMOJIS.includes(cat.icon) ? cat.icon : EMOJIS[0])
    setColor(cat.color)
    const budget = state.budgets.find(b => b.categoryId === cat.id && b.month === month)
    setBudgetAmount(budget?.amount ? String(budget.amount) : '')
    setShowForm(true)
  }

  const handleSave = () => {
    if (!name.trim()) return
    if (isEditing && editingCat) {
      updateCategory({ ...editingCat, name: name.trim(), icon: emoji, color })
      if (budgetAmount && Number(budgetAmount) > 0) {
        setBudget({ categoryId: editingCat.id, amount: Number(budgetAmount), month })
      }
    } else {
      const catId = addCategory({ name: name.trim(), icon: emoji, color })
      if (budgetAmount && Number(budgetAmount) > 0) {
        setBudget({ categoryId: catId, amount: Number(budgetAmount), month })
      }
    }
    setName('')
    setEmoji(EMOJIS[0])
    setColor(COLORS[0])
    setBudgetAmount('')
    setEditingCat(null)
    setShowForm(false)
  }

  const handleClose = () => {
    setEditingCat(null)
    setShowForm(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('categories.title')}</h2>
          <p style={{ color: '#71717a', fontSize: '0.875rem' }}>{state.categories.length} {t('common.categories')}</p>
        </div>
        <button type="button" className="btn-primary" onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Plus size={16} /> {t('categories.add')}
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                {isEditing ? 'Editează categoria' : t('categories.add')}
              </h3>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label>Nume categorie</label>
              <input className="input-field" type="text" required autoFocus
                value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Mâncare" />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label>Emoji / Pictogramă</label>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                {EMOJIS.map(e => (
                  <button key={e} type="button" onClick={() => setEmoji(e)}
                    style={{
                      width: 36, height: 36, borderRadius: '0.5rem', border: '2px solid',
                      borderColor: e === emoji ? color : 'transparent',
                      background: e === emoji ? `${color}20` : '#f4f4f5',
                      cursor: 'pointer', fontSize: '1.125rem',
                      transition: 'all 0.2s',
                    }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Palette size={14} /> Culoare
              </label>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', border: '2px solid',
                      borderColor: c === color ? c : 'transparent',
                      background: c, cursor: 'pointer',
                      outline: c === color ? `3px solid ${c}40` : 'none',
                      transition: 'all 0.2s',
                    }} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <PiggyBank size={14} /> Buget lunar
              </label>
              <input className="input-field" type="number" step="0.01" min="0"
                value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)}
                placeholder="Ex: 1000" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '0.75rem',
                background: `${color}20`, color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem',
              }}>
                {emoji}
              </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{name || 'Nume'}</p>
                <p style={{ fontSize: '0.75rem', color: '#71717a' }}>Previzualizare</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={handleClose}>Anulează</button>
              <button type="button" className="btn-primary" onClick={handleSave} disabled={!name.trim()}>
                {isEditing ? 'Salvează' : 'Adaugă'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.625rem' }}>
        {state.categories.map((cat, i) => {
          const budget = state.budgets.find(b => b.categoryId === cat.id && b.month === month)
          const budgetAmt = budget?.amount || 0
          const displayIcon = cat.icon && EMOJIS.includes(cat.icon) ? cat.icon : cat.name[0]
          return (
            <div key={cat.id} className="stat-card" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              animation: `slideUp 0.25s ease ${i * 0.03}s both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '0.75rem',
                  background: `${cat.color}20`, color: cat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.125rem',
                }}>
                  {displayIcon}
                </div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{cat.name}</p>
                  <p style={{ color: '#71717a', fontSize: '0.75rem' }}>
                    <span>{state.expenses.filter(e => e.categoryId === cat.id).length} {t('categories.expenses')}</span>
                    {(budgetAmt > 0 || editingBudget === cat.id) && (
                      <span> &middot; Buget: {editingBudget === cat.id ? (
                        <input className="input-field" style={{ width: 72, padding: '0.125rem 0.375rem', display: 'inline', fontSize: '0.75rem' }}
                          type="number" min="0" step="0.01" value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => { setBudget({ categoryId: cat.id, amount: Number(editValue) || 0, month }); setEditingBudget(null) }}
                          onKeyDown={e => { if (e.key === 'Enter') { setBudget({ categoryId: cat.id, amount: Number(editValue) || 0, month }); setEditingBudget(null) }; if (e.key === 'Escape') setEditingBudget(null) }}
                          autoFocus />
                      ) : (
                        <span onClick={() => { setEditingBudget(cat.id); setEditValue(budgetAmt > 0 ? String(budgetAmt) : '') }}
                          style={{ cursor: 'pointer', borderBottom: '1px dashed #d4d4d8' }}>
                          {fa(budgetAmt)}
                        </span>
                      )}</span>
                    )}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <button onClick={() => openEdit(cat)}
                  className="icon-btn" style={{ color: '#3B82F6' }}>
                  <Pencil size={15} />
                </button>
                <button onClick={() => { if (budgetAmt > 0) { setEditingBudget(cat.id); setEditValue(String(budgetAmt)) } else { setEditingBudget(cat.id); setEditValue('') } }}
                  className="icon-btn" style={{ color: '#10B981' }}>
                  <PiggyBank size={15} />
                </button>
                <button onClick={() => { if (confirm(t('delete.category'))) removeCategory(cat.id) }}
                  className="icon-btn" style={{ color: '#ef4444' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
