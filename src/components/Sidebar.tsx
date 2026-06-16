import { useState } from 'react'
import { LayoutDashboard, Receipt, PiggyBank, Tags, Users, Settings } from 'lucide-react'
import type { Page } from '../types'
import SettingsModal from './SettingsModal'

const links: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { page: 'expenses', label: 'Cheltuieli', icon: <Receipt size={20} /> },
  { page: 'budget', label: 'Buget', icon: <PiggyBank size={20} /> },
  { page: 'categories', label: 'Categorii', icon: <Tags size={20} /> },
  { page: 'members', label: 'Membri', icon: <Users size={20} /> },
]

interface Props {
  page: Page
  onPageChange: (p: Page) => void
}

export default function Sidebar({ page, onPageChange }: Props) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
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
            HomeFinance
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.125rem' }}>
            Gestionează-ți casa
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
                {l.label}
              </button>
            )
          })}
        </nav>

        <button
          onClick={() => setShowSettings(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: 'transparent',
            color: 'rgba(255,255,255,0.45)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
            width: '100%',
            textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
        >
          <Settings size={20} />
          Setări
        </button>
      </aside>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}
