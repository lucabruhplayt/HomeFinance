import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react'
import { v4 as uuid } from 'uuid'
import type { Member, Category, Expense, Budget } from '../types'

interface State {
  members: Member[]
  categories: Category[]
  expenses: Expense[]
  budgets: Budget[]
}

type Action =
  | { type: 'ADD_MEMBER'; payload: Omit<Member, 'id'> }
  | { type: 'REMOVE_MEMBER'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id'> }
  | { type: 'REMOVE_CATEGORY'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Omit<Expense, 'id'> }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'REMOVE_EXPENSE'; payload: string }
  | { type: 'SET_BUDGET'; payload: Budget }
  | { type: 'REMOVE_BUDGET'; payload: string }

const defaultMembers: Member[] = [
  { id: '1', name: 'Andrei', color: '#3B82F6', avatar: 'A' },
  { id: '2', name: 'Maria', color: '#EC4899', avatar: 'M' },
]

const defaultCategories: Category[] = [
  { id: '1', name: 'Mâncare', icon: 'UtensilsCrossed', color: '#F97316' },
  { id: '2', name: 'Utilități', icon: 'Zap', color: '#EAB308' },
  { id: '3', name: 'Chirie', icon: 'Home', color: '#3B82F6' },
  { id: '4', name: 'Transport', icon: 'Car', color: '#8B5CF6' },
  { id: '5', name: 'Divertisment', icon: 'Film', color: '#EC4899' },
  { id: '6', name: 'Sănătate', icon: 'Heart', color: '#EF4444' },
  { id: '7', name: 'Învățământ', icon: 'BookOpen', color: '#14B8A6' },
  { id: '8', name: 'Altele', icon: 'MoreHorizontal', color: '#6B7280' },
]

const saved = localStorage.getItem('homefinance')
const initialState: State = saved
  ? JSON.parse(saved)
  : { members: defaultMembers, categories: defaultCategories, expenses: [], budgets: [] }

function persist(state: State) {
  localStorage.setItem('homefinance', JSON.stringify(state))
}

function reducer(state: State, action: Action): State {
  let next: State
  switch (action.type) {
    case 'ADD_MEMBER':
      next = { ...state, members: [...state.members, { id: uuid(), ...action.payload }] }; break
    case 'REMOVE_MEMBER':
      next = { ...state, members: state.members.filter(m => m.id !== action.payload) }; break
    case 'ADD_CATEGORY':
      next = { ...state, categories: [...state.categories, { id: uuid(), ...action.payload }] }; break
    case 'REMOVE_CATEGORY':
      next = { ...state, categories: state.categories.filter(c => c.id !== action.payload) }; break
    case 'ADD_EXPENSE':
      next = { ...state, expenses: [...state.expenses, { id: uuid(), ...action.payload }] }; break
    case 'UPDATE_EXPENSE':
      next = { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) }; break
    case 'REMOVE_EXPENSE':
      next = { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) }; break
    case 'SET_BUDGET': {
      const exist = state.budgets.findIndex(b => b.categoryId === action.payload.categoryId && b.month === action.payload.month)
      const budgets = exist >= 0
        ? state.budgets.map((b, i) => i === exist ? action.payload : b)
        : [...state.budgets, action.payload]
      next = { ...state, budgets }; break
    }
    case 'REMOVE_BUDGET':
      next = { ...state, budgets: state.budgets.filter(b => b.categoryId !== action.payload) }; break
    default:
      return state
  }
  persist(next)
  return next
}

interface ContextType {
  state: State
  addMember: (m: Omit<Member, 'id'>) => void
  removeMember: (id: string) => void
  addCategory: (c: Omit<Category, 'id'>) => void
  removeCategory: (id: string) => void
  addExpense: (e: Omit<Expense, 'id'>) => void
  updateExpense: (e: Expense) => void
  removeExpense: (id: string) => void
  setBudget: (b: Budget) => void
  removeBudget: (categoryId: string) => void
  getCategory: (id: string) => Category | undefined
  getMember: (id: string) => Member | undefined
  monthExpenses: (month: string) => Expense[]
  categoryTotal: (categoryId: string, month: string) => number
}

const FinanceContext = createContext<ContextType | null>(null)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const addMember = useCallback((m: Omit<Member, 'id'>) => dispatch({ type: 'ADD_MEMBER', payload: m }), [])
  const removeMember = useCallback((id: string) => dispatch({ type: 'REMOVE_MEMBER', payload: id }), [])
  const addCategory = useCallback((c: Omit<Category, 'id'>) => dispatch({ type: 'ADD_CATEGORY', payload: c }), [])
  const removeCategory = useCallback((id: string) => dispatch({ type: 'REMOVE_CATEGORY', payload: id }), [])
  const addExpense = useCallback((e: Omit<Expense, 'id'>) => dispatch({ type: 'ADD_EXPENSE', payload: e }), [])
  const updateExpense = useCallback((e: Expense) => dispatch({ type: 'UPDATE_EXPENSE', payload: e }), [])
  const removeExpense = useCallback((id: string) => dispatch({ type: 'REMOVE_EXPENSE', payload: id }), [])
  const setBudget = useCallback((b: Budget) => dispatch({ type: 'SET_BUDGET', payload: b }), [])
  const removeBudget = useCallback((categoryId: string) => dispatch({ type: 'REMOVE_BUDGET', payload: categoryId }), [])

  const getCategory = useCallback((id: string) => state.categories.find(c => c.id === id), [state.categories])
  const getMember = useCallback((id: string) => state.members.find(m => m.id === id), [state.members])
  const monthExpenses = useCallback((month: string) => state.expenses.filter(e => e.date.startsWith(month)), [state.expenses])
  const categoryTotal = useCallback((categoryId: string, month: string) =>
    state.expenses.filter(e => e.categoryId === categoryId && e.date.startsWith(month)).reduce((s, e) => s + e.amount, 0),
    [state.expenses]
  )

  return (
    <FinanceContext value={{
      state, addMember, removeMember, addCategory, removeCategory,
      addExpense, updateExpense, removeExpense, setBudget, removeBudget,
      getCategory, getMember, monthExpenses, categoryTotal
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
