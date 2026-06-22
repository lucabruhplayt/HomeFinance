import { useState, useEffect, type ReactNode } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LocaleProvider, useLocale } from './context/LocaleContext'
import { FinanceProvider, useFinance } from './context/FinanceContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Budget from './pages/Budget'
import Categories from './pages/Categories'
import Members from './pages/Members'
import Settings from './pages/Settings'
import Landing from './pages/Landing'
import Login from './pages/Login'
import { useMediaQuery } from './utils/useMediaQuery'
import type { Page } from './types'

type AuthScreen = 'landing' | 'login' | 'register'

function AppContent() {
  const [page, setPage] = useState<Page>('dashboard')
  const { state } = useFinance()
  const isMobile = useMediaQuery('(max-width: 767px)')

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
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Sidebar page={page} onPageChange={setPage} isMobile={isMobile} />
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 'var(--sidebar-width)',
        marginBottom: isMobile ? 72 : 0,
        padding: isMobile ? '1rem' : '2rem',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {pages[page]}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <FinanceProvider>
          <Main />
        </FinanceProvider>
      </AuthProvider>
    </LocaleProvider>
  )
}

function Main() {
  const { user, loading } = useAuth()
  const { t, ready: localeReady } = useLocale()
  const [authScreen, setAuthScreen] = useState<AuthScreen>('landing')

  if (loading || !localeReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A1A' }}>
        <p style={{ color: '#71717a', fontSize: '0.9375rem' }}>{t('auth.loading')}</p>
      </div>
    )
  }

  if (!user) {
    if (authScreen === 'landing') {
      return (
        <Landing
          onLogin={() => setAuthScreen('login')}
          onRegister={() => setAuthScreen('register')}
        />
      )
    }
    return (
      <Login
        onBack={() => setAuthScreen('landing')}
        initialRegister={authScreen === 'register'}
      />
    )
  }

  return <AppContent />
}
