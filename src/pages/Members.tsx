import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import MemberForm from '../components/MemberForm'

export default function Members() {
  const { state, removeMember, t, fa } = useFinance()
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{t('members.title')}</h2>
        <button type="button" className="btn-primary" onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Plus size={16} /> {t('members.add')}
        </button>
      </div>

      {showForm && <MemberForm onClose={() => setShowForm(false)} />}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {state.members.map(m => {
          const paid = state.expenses.filter(e => e.paidBy === m.id).reduce((s, e) => s + e.amount, 0)
          return (
            <div key={m.id} className="stat-card" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {m.photo ? (
                  <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={m.photo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                ) : (
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: m.color, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 600, flexShrink: 0,
                  }}>
                    {m.avatar}
                  </div>
                )}
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{m.name}</p>
                  <p style={{ color: '#71717a', fontSize: '0.75rem' }}>
                    {t('members.paid')} {fa(paid)}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {state.members.length > 1 && (
                  <button onClick={() => { if (confirm(t('delete.member', { name: m.name }))) removeMember(m.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.375rem' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
