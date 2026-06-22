import { createContext, useContext, useReducer, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Member, Category, Expense, Budget, AppSettings } from '../types'
import { formatAmount as fmtAmount, formatDate as fmtDate } from '../utils/format'
import { t as translate } from '../utils/i18n'
import { databases, storage, ID, Query, APPWRITE_DB_ID, APPWRITE_BUCKET_ID } from '../lib/appwrite'
import { useAuth } from './AuthContext'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

let _id = Date.now()
function uid(): string {
  return (++_id).toString(36)
}

interface State {
  members: Member[]
  categories: Category[]
  expenses: Expense[]
  budgets: Budget[]
  settings: AppSettings
}

type Action =
  | { type: 'ADD_MEMBER'; payload: Member }
  | { type: 'REMOVE_MEMBER'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'REMOVE_CATEGORY'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'REMOVE_EXPENSE'; payload: string }
  | { type: 'SET_BUDGET'; payload: Budget }
  | { type: 'REMOVE_BUDGET'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_STATE'; payload: State }
  | { type: 'RESET_ALL' }

const defaultSettings: AppSettings = {
  currency: 'lei',
  dateFormat: 'YYYY-MM-DD',
  theme: 'light',
  compactView: false,
  weekStart: 'monday',
  lang: 'ro',
  budgetAlert: true,
  budgetAlertPct: 80,
  dailyReminder: true,
  primaryColor: '#18181B',
  accentColor: '#2563EB',
}

const defaultMembers: Member[] = [
  { id: 'm1', name: 'Andrei', color: '#3B82F6', avatar: 'A' },
  { id: 'm2', name: 'Maria', color: '#EC4899', avatar: 'M' },
]

const defaultCategories: Category[] = [
  { id: 'c1', name: 'Mâncare', icon: '🍕', color: '#F97316' },
  { id: 'c2', name: 'Utilități', icon: '⚡', color: '#EAB308' },
  { id: 'c3', name: 'Chirie', icon: '🏠', color: '#3B82F6' },
  { id: 'c4', name: 'Transport', icon: '🚗', color: '#8B5CF6' },
  { id: 'c5', name: 'Divertisment', icon: '🎬', color: '#EC4899' },
  { id: 'c6', name: 'Sănătate', icon: '💊', color: '#EF4444' },
  { id: 'c7', name: 'Învățământ', icon: '📚', color: '#14B8A6' },
  { id: 'c8', name: 'Cumpărături', icon: '🛍️', color: '#84CC16' },
  { id: 'c9', name: 'Cadouri', icon: '🎁', color: '#D946EF' },
  { id: 'c10', name: 'Îmbrăcăminte', icon: '👕', color: '#06B6D4' },
  { id: 'c11', name: 'Altele', icon: '☕', color: '#6B7280' },
]

const savedData = localStorage.getItem('homefinance_data')
const savedSettings = localStorage.getItem('homefinance_settings')

function loadInitialState(): State {
  const base = { members: defaultMembers, categories: defaultCategories, expenses: [] as Expense[], budgets: [] as Budget[] }
  try {
    const data = savedData ? { ...base, ...JSON.parse(savedData) } : base
    return {
      ...data,
      settings: savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings,
    }
  } catch {
    return { ...base, settings: defaultSettings }
  }
}

const initialState: State = loadInitialState()

function persist(state: State) {
  try {
    const { settings, ...data } = state
    localStorage.setItem('homefinance_data', JSON.stringify(data))
    localStorage.setItem('homefinance_settings', JSON.stringify(settings))
  } catch {
    /* localStorage may be full or unavailable */
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.payload] }
    case 'REMOVE_MEMBER':
      return { ...state, members: state.members.filter(m => m.id !== action.payload) }
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'REMOVE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) }
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] }
    case 'UPDATE_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) }
    case 'REMOVE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) }
    case 'SET_BUDGET': {
      const exist = state.budgets.findIndex(b => b.categoryId === action.payload.categoryId && b.month === action.payload.month)
      const budgets = exist >= 0
        ? state.budgets.map((b, i) => i === exist ? action.payload : b)
        : [...state.budgets, action.payload]
      return { ...state, budgets }
    }
    case 'REMOVE_BUDGET':
      return { ...state, budgets: state.budgets.filter(b => b.categoryId !== action.payload) }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case 'SET_STATE':
      return { ...action.payload }
    case 'RESET_ALL':
      return { members: defaultMembers, categories: defaultCategories, expenses: [], budgets: [], settings: defaultSettings }
    default:
      return state
  }
}

interface ContextType {
  state: State
  saveStatus: SaveStatus
  addMember: (m: Omit<Member, 'id'>) => void
  removeMember: (id: string) => void
  addCategory: (c: Omit<Category, 'id'>) => string
  updateCategory: (c: Category) => void
  removeCategory: (id: string) => void
  addExpense: (e: Omit<Expense, 'id'>) => void
  updateExpense: (e: Expense) => void
  removeExpense: (id: string) => void
  setBudget: (b: Budget) => void
  removeBudget: (categoryId: string) => void
  updateSettings: (s: Partial<AppSettings>) => void
  saveSettings: () => void
  resetAll: () => void
  getCategory: (id: string) => Category | undefined
  getMember: (id: string) => Member | undefined
  monthExpenses: (month: string) => Expense[]
  categoryTotal: (categoryId: string, month: string) => number
  t: (key: string, vars?: Record<string, string>) => string
  fa: (amount: number) => string
  fd: (date: string) => string
}

const FinanceContext = createContext<ContextType | null>(null)

async function loadFromAppwrite(userId: string): Promise<State | null> {
  try {
    const [membersRes, categoriesRes, expensesRes, budgetsRes, settingsRes] = await Promise.all([
      databases.listDocuments(APPWRITE_DB_ID, 'members', [Query.equal('userId', userId)]),
      databases.listDocuments(APPWRITE_DB_ID, 'categories', [Query.equal('userId', userId)]),
      databases.listDocuments(APPWRITE_DB_ID, 'expenses', [Query.equal('userId', userId)]),
      databases.listDocuments(APPWRITE_DB_ID, 'budgets', [Query.equal('userId', userId)]),
      databases.listDocuments(APPWRITE_DB_ID, 'settings', [Query.equal('userId', userId)]),
    ])

    if (membersRes.total === 0 && categoriesRes.total === 0 && expensesRes.total === 0) {
      return null
    }

    const members: Member[] = membersRes.documents.map(doc => ({
      id: doc.$id,
      name: doc.name,
      color: doc.color,
      avatar: doc.avatar,
      photo: doc.photoId ? storage.getFileView(APPWRITE_BUCKET_ID, doc.photoId).toString() : undefined,
    }))

    const categories: Category[] = categoriesRes.documents.map(doc => ({
      id: doc.$id,
      name: doc.name,
      icon: doc.icon,
      color: doc.color,
    }))

    const expenses: Expense[] = expensesRes.documents.map(doc => ({
      id: doc.$id,
      amount: doc.amount,
      description: doc.description,
      categoryId: doc.categoryId,
      paidBy: doc.paidBy,
      date: doc.date,
    }))

    const budgets: Budget[] = budgetsRes.documents.map(doc => ({
      categoryId: doc.categoryId,
      amount: doc.amount,
      month: doc.month,
    }))

    const settings: AppSettings = settingsRes.documents.length > 0
      ? {
          currency: settingsRes.documents[0].currency || defaultSettings.currency,
          dateFormat: settingsRes.documents[0].dateFormat || defaultSettings.dateFormat,
          theme: settingsRes.documents[0].theme || defaultSettings.theme,
          compactView: settingsRes.documents[0].compactView ?? defaultSettings.compactView,
          weekStart: settingsRes.documents[0].weekStart || defaultSettings.weekStart,
          lang: settingsRes.documents[0].lang || defaultSettings.lang,
          budgetAlert: settingsRes.documents[0].budgetAlert ?? defaultSettings.budgetAlert,
          budgetAlertPct: settingsRes.documents[0].budgetAlertPct ?? defaultSettings.budgetAlertPct,
          primaryColor: settingsRes.documents[0].primaryColor || defaultSettings.primaryColor,
          accentColor: settingsRes.documents[0].accentColor || defaultSettings.accentColor,
          dailyReminder: settingsRes.documents[0].dailyReminder ?? defaultSettings.dailyReminder,
        }
      : defaultSettings

    return { members, categories, expenses, budgets, settings }
  } catch (err) {
    console.error('Failed to load from Appwrite:', err)
    return null
  }
}

async function migrateToAppwrite(userId: string, state: State) {
  const dbId = APPWRITE_DB_ID
  const promises: Promise<any>[] = []

  for (const m of state.members) {
    promises.push(
      databases.createDocument(dbId, 'members', m.id, {
        name: m.name,
        color: m.color,
        avatar: m.avatar,
        photoId: '',
        userId,
      }).catch(err => console.error('migrate member:', m.id, err.message))
    )
  }

  for (const c of state.categories) {
    promises.push(
      databases.createDocument(dbId, 'categories', c.id, {
        name: c.name,
        icon: c.icon,
        color: c.color,
        userId,
      }).catch(err => console.error('migrate category:', c.id, err.message))
    )
  }

  for (const e of state.expenses) {
    promises.push(
      databases.createDocument(dbId, 'expenses', e.id, {
        amount: e.amount,
        description: e.description,
        categoryId: e.categoryId,
        paidBy: e.paidBy,
        date: e.date,
        userId,
      }).catch(err => console.error('migrate expense:', e.id, err.message))
    )
  }

  for (const b of state.budgets) {
    promises.push(
      databases.createDocument(dbId, 'budgets', ID.unique(), {
        categoryId: b.categoryId,
        amount: b.amount,
        month: b.month,
        userId,
      }).catch(err => console.error('migrate budget:', err.message))
    )
  }

  promises.push(
    databases.createDocument(dbId, 'settings', userId, {
      ...state.settings,
      userId,
    }).catch(err => console.error('migrate settings:', err.message))
  )

  await Promise.all(promises)
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const initRef = useRef(true)
  const migratedRef = useRef(false)
  const stateRef = useRef(state)
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  stateRef.current = state

  const clearStatusTimer = useCallback(() => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
  }, [])

  const markSaving = useCallback(() => setSaveStatus('saving'), [])

  const markSaved = useCallback(() => {
    setSaveStatus('saved')
    clearStatusTimer()
    statusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000)
  }, [clearStatusTimer])

  const markError = useCallback(() => {
    setSaveStatus('error')
    clearStatusTimer()
    statusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 4000)
  }, [clearStatusTimer])

  useEffect(() => {
    if (initRef.current) { initRef.current = false; return }
    persist(state)
  }, [state])

  useEffect(() => {
    if (!user || migratedRef.current) return
    migratedRef.current = true

    loadFromAppwrite(user.$id).then(data => {
      if (data) {
        const localSettings = localStorage.getItem('homefinance_settings')
        const mergedSettings = localSettings ? { ...data.settings, ...JSON.parse(localSettings) } : data.settings
        dispatch({ type: 'SET_STATE', payload: { ...data, settings: mergedSettings } })
      } else {
        migrateToAppwrite(user.$id, stateRef.current)
      }
    })
  }, [user?.$id])

  const addMember = useCallback((m: Omit<Member, 'id'>) => {
    const id = uid()
    dispatch({ type: 'ADD_MEMBER', payload: { id, ...m } })
    if (user) {
      markSaving()
      databases.createDocument(APPWRITE_DB_ID, 'members', id, {
        name: m.name,
        color: m.color,
        avatar: m.avatar,
        photoId: m.photoId || '',
        userId: user.$id,
      }).then(markSaved).catch(err => { markError(); console.error('addMember sync:', err.message) })
    }
  }, [user, markSaving, markSaved, markError])

  const removeMember = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_MEMBER', payload: id })
    if (user) {
      markSaving()
      databases.deleteDocument(APPWRITE_DB_ID, 'members', id)
        .then(markSaved).catch(err => { markError(); console.error('removeMember sync:', err.message) })
    }
  }, [user, markSaving, markSaved, markError])

  const addCategory = useCallback((c: Omit<Category, 'id'>) => {
    const id = uid()
    dispatch({ type: 'ADD_CATEGORY', payload: { id, ...c } })
    if (user) {
      markSaving()
      databases.createDocument(APPWRITE_DB_ID, 'categories', id, {
        name: c.name,
        icon: c.icon,
        color: c.color,
        userId: user.$id,
      }).then(markSaved).catch(err => { markError(); console.error('addCategory sync:', err.message) })
    }
    return id
  }, [user, markSaving, markSaved, markError])

  const updateCategory = useCallback((cat: Category) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: cat })
    if (user) {
      markSaving()
      databases.updateDocument(APPWRITE_DB_ID, 'categories', cat.id, {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
      }).then(markSaved).catch(err => { markError(); console.error('updateCategory sync:', err.message) })
    }
  }, [user, markSaving, markSaved, markError])

  const removeCategory = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_CATEGORY', payload: id })
    if (user) {
      markSaving()
      databases.deleteDocument(APPWRITE_DB_ID, 'categories', id)
        .then(markSaved).catch(err => { markError(); console.error('removeCategory sync:', err.message) })
    }
  }, [user, markSaving, markSaved, markError])

  const addExpense = useCallback((e: Omit<Expense, 'id'>) => {
    const id = uid()
    dispatch({ type: 'ADD_EXPENSE', payload: { id, ...e } })
    if (user) {
      markSaving()
      databases.createDocument(APPWRITE_DB_ID, 'expenses', id, {
        amount: e.amount,
        description: e.description,
        categoryId: e.categoryId,
        paidBy: e.paidBy,
        date: e.date,
        userId: user.$id,
      }).then(markSaved).catch(err => { markError(); console.error('addExpense sync:', err.message) })
    }
  }, [user, markSaving, markSaved, markError])

  const updateExpense = useCallback((e: Expense) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: e })
    if (!user) return
    markSaving()
    databases.updateDocument(APPWRITE_DB_ID, 'expenses', e.id, {
      amount: e.amount,
      description: e.description,
      categoryId: e.categoryId,
      paidBy: e.paidBy,
      date: e.date,
    }).then(markSaved).catch(() => {
      databases.createDocument(APPWRITE_DB_ID, 'expenses', e.id, {
        amount: e.amount,
        description: e.description,
        categoryId: e.categoryId,
        paidBy: e.paidBy,
        date: e.date,
        userId: user.$id,
      }).then(markSaved).catch(err => { markError(); console.error('updateExpense sync:', err.message) })
    })
  }, [user, markSaving, markSaved, markError])

  const removeExpense = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_EXPENSE', payload: id })
    if (user) {
      markSaving()
      databases.deleteDocument(APPWRITE_DB_ID, 'expenses', id)
        .then(markSaved).catch(err => { markError(); console.error('removeExpense sync:', err.message) })
    }
  }, [user, markSaving, markSaved, markError])

  const setBudget = useCallback((b: Budget) => {
    dispatch({ type: 'SET_BUDGET', payload: b })
    if (user) {
      markSaving()
      databases.listDocuments(APPWRITE_DB_ID, 'budgets', [
        Query.equal('categoryId', b.categoryId),
        Query.equal('month', b.month),
      ]).then(res => {
        if (res.total > 0) {
          return databases.updateDocument(APPWRITE_DB_ID, 'budgets', res.documents[0].$id, { amount: b.amount })
        }
        return databases.createDocument(APPWRITE_DB_ID, 'budgets', ID.unique(), {
          categoryId: b.categoryId,
          amount: b.amount,
          month: b.month,
          userId: user.$id,
        })
      }).then(markSaved).catch(err => { markError(); console.error('setBudget sync:', err.message) })
    }
  }, [user, markSaving, markSaved, markError])

  const removeBudget = useCallback((categoryId: string) => {
    dispatch({ type: 'REMOVE_BUDGET', payload: categoryId })
    if (user) {
      markSaving()
      databases.listDocuments(APPWRITE_DB_ID, 'budgets', [
        Query.equal('categoryId', categoryId),
      ]).then(res => {
        return Promise.all(res.documents.map(d => databases.deleteDocument(APPWRITE_DB_ID, 'budgets', d.$id)))
      }).then(markSaved).catch(err => { markError(); console.error('removeBudget sync:', err.message) })
    }
  }, [user, markSaving, markSaved, markError])

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: s })
  }, [])

  const saveSettings = useCallback(() => {
    if (!user) return Promise.resolve()
    const s = stateRef.current.settings
    markSaving()
    return databases.updateDocument(APPWRITE_DB_ID, 'settings', user.$id, s)
      .then(markSaved)
      .catch(err => {
        if (err.message?.includes('not found')) {
          return databases.createDocument(APPWRITE_DB_ID, 'settings', user.$id, {
            ...s,
            userId: user.$id,
          }).then(markSaved).catch(() => markError())
        } else {
          markError()
          console.error('saveSettings sync:', err.message)
        }
      })
  }, [user, markSaving, markSaved, markError])

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' })
    if (user) {
      markSaving()
      const dbId = APPWRITE_DB_ID
      const uid = user.$id
      Promise.all([
        databases.listDocuments(dbId, 'members', [Query.equal('userId', uid)]),
        databases.listDocuments(dbId, 'categories', [Query.equal('userId', uid)]),
        databases.listDocuments(dbId, 'expenses', [Query.equal('userId', uid)]),
        databases.listDocuments(dbId, 'budgets', [Query.equal('userId', uid)]),
      ]).then(([m, c, e, b]) => Promise.all([
        ...m.documents.map(d => databases.deleteDocument(dbId, 'members', d.$id)),
        ...c.documents.map(d => databases.deleteDocument(dbId, 'categories', d.$id)),
        ...e.documents.map(d => databases.deleteDocument(dbId, 'expenses', d.$id)),
        ...b.documents.map(d => databases.deleteDocument(dbId, 'budgets', d.$id)),
      ])).then(markSaved).catch(err => { markError(); console.error('resetAll sync:', err.message) })
    }
  }, [user, markSaving, markSaved, markError])

  const getCategory = useCallback((id: string) => state.categories.find(c => c.id === id), [state.categories])
  const getMember = useCallback((id: string) => state.members.find(m => m.id === id), [state.members])
  const monthExpenses = useCallback((month: string) => state.expenses.filter(e => e.date.startsWith(month)), [state.expenses])
  const categoryTotal = useCallback((categoryId: string, month: string) =>
    state.expenses.filter(e => e.categoryId === categoryId && e.date.startsWith(month)).reduce((s, e) => s + e.amount, 0),
    [state.expenses]
  )

  const fa = useCallback((amount: number) => fmtAmount(amount, state.settings.currency), [state.settings.currency])
  const fd = useCallback((date: string) => fmtDate(date, state.settings.dateFormat), [state.settings.dateFormat])
  const tFn = useCallback((key: string, vars?: Record<string, string>) => translate(key, state.settings.lang, vars), [state.settings.lang])

  return (
    <FinanceContext value={{
      state, saveStatus, addMember, removeMember, addCategory, updateCategory, removeCategory,
      addExpense, updateExpense, removeExpense, setBudget, removeBudget,
      getCategory, getMember, monthExpenses, categoryTotal,
      updateSettings, saveSettings, resetAll,
      t: tFn, fa, fd,
    }}>
      {children}
    </FinanceContext>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}
