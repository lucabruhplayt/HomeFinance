export interface Member {
  id: string
  name: string
  color: string
  avatar: string
  photo?: string
  photoId?: string
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
}

export interface Budget {
  categoryId: string
  amount: number
  month: string
}

export type Page = 'dashboard' | 'expenses' | 'budget' | 'categories' | 'members' | 'settings'

export interface AppSettings {
  currency: string
  dateFormat: string
  theme: 'light' | 'dark'
  compactView: boolean
  weekStart: 'monday' | 'sunday'
  lang: 'ro' | 'en'
  budgetAlert: boolean
  budgetAlertPct: number
  dailyReminder: boolean
  primaryColor: string
  accentColor: string
}
