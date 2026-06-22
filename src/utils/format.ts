import type { AppSettings } from '../types'

export function formatAmount(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`
}

export function formatDate(dateStr: string, format: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  switch (format) {
    case 'DD.MM.YYYY': return `${day}.${m}.${y}`
    case 'DD/MM/YYYY': return `${day}/${m}/${y}`
    case 'MM/DD/YYYY': return `${m}/${day}/${y}`
    default: return `${y}-${m}-${day}`
  }
}

export function monthLabel(month: string, lang: 'ro' | 'en'): string {
  const [y, m] = month.split('-')
  const names: Record<string, string[]> = {
    ro: ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  }
  return `${names[lang][parseInt(m) - 1]} ${y}`
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('homefinance_settings')
    return raw ? JSON.parse(raw) : defaultSettings
  } catch {
    return defaultSettings
  }
}

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
