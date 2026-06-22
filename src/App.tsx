import { useState, useEffect, type ReactNode } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FinanceProvider, useFinance } from './context/FinanceContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Budget from './pages/Budget'
import Categories from './pages/Categories'
import Members from './pages/Members'
import Settings from './pages/Settings'
import Login from './pages/Login'
import type { Page } from './types'

function AppContent() {
  const [page, setPage] = useState<Page>('dashboard')
  const { state } = useFinance()

  useEffect(() => {
    document.body.classList.toggle('dark', state.settings.theme === 'dark')
    document.body.classList.toggle('compact', state.settings.compactView)
    document.documentElement.style.setProperty('--primary', state.settings.primaryColor)
    document.documentElement.style.setProperty('--cta', state.settings.accentColor)
  }, [state.settings.theme, state.settings.compactView, state.settings.primaryColor, state.settings.accentColor])

  const pages: Record<Page, ReactNode> = {
    dashboard: <Dashboard />,
    expenses: <Expenses />,
    budget: <Budget />,
    categories: <Categories />,
    members: <Members />,
    settings: <Settings />,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar page={page} onPageChange={setPage} />
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', padding: '2rem', overflow: 'auto' }}>
        {pages[page]}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <Main />
      </FinanceProvider>
    </AuthProvider>
  )
}

function Main() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <p style={{ color: '#71717a', fontSize: '0.9375rem' }}>Se încarcă...</p>
      </div>
    )
  }

  if (!user) return <Login />
  return <AppContent />
}
