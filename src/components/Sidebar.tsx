import { LayoutDashboard, Receipt, PiggyBank, Tags, Users, Settings, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import type { Page } from '../types'

const links: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'nav.dashboard', icon: <LayoutDashboard size={20} /> },
  { page: 'expenses', label: 'nav.expenses', icon: <Receipt size={20} /> },
  { page: 'budget', label: 'nav.budget', icon: <PiggyBank size={20} /> },
  { page: 'categories', label: 'nav.categories', icon: <Tags size={20} /> },
  { page: 'members', label: 'nav.members', icon: <Users size={20} /> },
]

interface Props {
  page: Page
  onPageChange: (p: Page) => void
}

export default function Sidebar({ page, onPageChange }: Props) {
  const { saveStatus, t } = useFinance()

  const statusIcon = () => {
    switch (saveStatus) {
      case 'saving': return <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
      case 'saved': return <CheckCircle2 size={14} />
      case 'error': return <AlertCircle size={14} />
      default: return null
    }
  }

  const statusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Se salvează...'
      case 'saved': return 'Salvat'
      case 'error': return 'Eroare la salvare'
      default: return ''
    }
  }

  const statusColor = () => {
    switch (saveStatus) {
      case 'saving': return 'rgba(255,255,255,0.5)'
      case 'saved': return '#4ADE80'
      case 'error': return '#FB7185'
      default: return 'transparent'
    }
  }

  return (
    <aside className="glass-dark" style={{
      position: 'fixed',
      top: '1rem',
      left: '1rem',
      bottom: '1rem',
      width: 'var(--sidebar-width)',
      borderRadius: '1.25rem',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
    }}>
      <div style={{ padding: '0 0.75rem', marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
          {t('app.title')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.125rem' }}>
          {t('app.subtitle')}
        </p>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {links.map(l => {
          const active = page === l.page
          return (
            <button
              key={l.page}
              onClick={() => onPageChange(l.page)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.55)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: active ? 500 : 400,
                transition: 'all 0.2s',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              {l.icon}
              {t(l.label)}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => onPageChange('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: page === 'settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: page === 'settings' ? 'white' : 'rgba(255,255,255,0.45)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: page === 'settings' ? 500 : 400,
            transition: 'all 0.2s',
            width: '100%',
            textAlign: 'left',
          }}
          onMouseEnter={e => { if (page !== 'settings') { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white' } }}
          onMouseLeave={e => { if (page !== 'settings') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' } }}
        >
          <Settings size={20} />
          {t('nav.settings')}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.5rem 0.75rem',
          marginTop: '0.25rem',
          fontSize: '0.6875rem',
          color: statusColor(),
          minHeight: 28,
        }}>
          {statusIcon()}
          <span>{statusText()}</span>
        </div>
      </div>
    </aside>
  )
}
