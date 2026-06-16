import { useState, type ReactNode } from 'react'
import { FinanceProvider } from './context/FinanceContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Budget from './pages/Budget'
import Categories from './pages/Categories'
import Members from './pages/Members'
import type { Page } from './types'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')

  const pages: Record<Page, ReactNode> = {
    dashboard: <Dashboard />,
    expenses: <Expenses />,
    budget: <Budget />,
    categories: <Categories />,
    members: <Members />,
  }

  return (
    <FinanceProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar page={page} onPageChange={setPage} />
        <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', padding: '2rem', overflow: 'auto' }}>
          {pages[page]}
        </main>
      </div>
    </FinanceProvider>
  )
}
