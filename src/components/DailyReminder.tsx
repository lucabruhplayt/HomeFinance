import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'

export default function DailyReminder() {
  const { state, t } = useFinance()
  const today = new Date().toISOString().slice(0, 10)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(`reminder_${today}`) === '1')

  const hasExpensesToday = state.expenses.some(e => e.date === today)
  if (hasExpensesToday || dismissed || !state.settings.dailyReminder) return null

  const handleDismiss = () => {
    localStorage.setItem(`reminder_${today}`, '1')
    setDismissed(true)
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: '0.75rem',
      background: '#EFF6FF',
      border: '1px solid #BFDBFE',
      marginBottom: '1.5rem',
    }}>
      <Bell size={20} style={{ color: '#3B82F6', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E40AF', marginBottom: '0.125rem' }}>
          {t('reminder.title')}
        </p>
        <p style={{ fontSize: '0.8125rem', color: '#3B82F6' }}>
          {t('reminder.desc')}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#60A5FA',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.375rem',
          flexShrink: 0,
        }}
        title={t('reminder.dismiss')}
      >
        <X size={18} />
      </button>
    </div>
  )
}
