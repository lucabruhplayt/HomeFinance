export interface Member {
  id: string
  name: string
  color: string
  avatar: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export interface Expense {
  id: string
  amount: number
  description: string
  categoryId: string
  paidBy: string
  date: string
  splitAmong: string[]
}

export interface Budget {
  categoryId: string
  amount: number
  month: string
}

export type Page = 'dashboard' | 'expenses' | 'budget' | 'categories' | 'members'
