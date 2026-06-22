export type AppLang = 'ro' | 'en'

const ROMANIAN_COUNTRIES = new Set(['RO', 'MD'])
const CACHE_KEY = 'homefinance_detected_lang'

export function countryToLang(countryCode: string | undefined | null): AppLang {
  if (!countryCode) return browserLang()
  return ROMANIAN_COUNTRIES.has(countryCode.toUpperCase()) ? 'ro' : 'en'
}

export function browserLang(): AppLang {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const l of langs) {
    if (l.toLowerCase().startsWith('ro')) return 'ro'
  }
  return 'en'
}

export async function detectLangFromIp(): Promise<AppLang> {
  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached === 'ro' || cached === 'en') return cached

  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5000)
    const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) throw new Error('geo lookup failed')
    const data = await res.json()
    const lang = countryToLang(data.country_code ?? data.country)
    sessionStorage.setItem(CACHE_KEY, lang)
    return lang
  } catch {
    const lang = browserLang()
    sessionStorage.setItem(CACHE_KEY, lang)
    return lang
  }
}

export function isLangManual(): boolean {
  return localStorage.getItem('homefinance_lang_manual') === '1'
}

export function markLangManual(): void {
  localStorage.setItem('homefinance_lang_manual', '1')
}
