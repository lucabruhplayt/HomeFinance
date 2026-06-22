import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { t as translate } from '../utils/i18n'
import { detectLangFromIp, isLangManual, type AppLang } from '../utils/detectLocale'

interface LocaleContextType {
  lang: AppLang
  ready: boolean
  setLang: (lang: AppLang) => void
  t: (key: string, vars?: Record<string, string>) => string
}

const LocaleContext = createContext<LocaleContextType | null>(null)

function readSavedLang(): AppLang | null {
  try {
    const raw = localStorage.getItem('homefinance_settings')
    if (!raw) return null
    const lang = JSON.parse(raw).lang
    return lang === 'en' || lang === 'ro' ? lang : null
  } catch {
    return null
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AppLang>(() => {
    if (isLangManual()) return readSavedLang() ?? 'ro'
    return readSavedLang() ?? 'ro'
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    detectLangFromIp().then(detected => {
      if (cancelled) return
      if (!isLangManual()) {
        setLangState(detected)
        try {
          const raw = localStorage.getItem('homefinance_settings')
          const settings = raw ? JSON.parse(raw) : {}
          localStorage.setItem('homefinance_settings', JSON.stringify({ ...settings, lang: detected }))
        } catch { /* ignore */ }
      }
      setReady(true)
    })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: AppLang) => setLangState(l), [])

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => translate(key, lang, vars),
    [lang],
  )

  return (
    <LocaleContext value={{ lang, ready, setLang, t }}>
      {children}
    </LocaleContext>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
