import type { Account } from 'appwrite'

export const SESSION_DAYS = 30
export const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000
const REMEMBER_KEY = 'homefinance_remember_until'
const REFRESH_KEY = 'homefinance_session_refreshed'
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000

export async function persistLoginSession(account: Account): Promise<void> {
  try {
    await account.updateSession({ sessionId: 'current' })
  } catch {
    /* extend may fail if session is fresh enough */
  }
  localStorage.setItem(REMEMBER_KEY, String(Date.now() + SESSION_MS))
}

export async function refreshSessionIfNeeded(account: Account): Promise<boolean> {
  const until = localStorage.getItem(REMEMBER_KEY)
  if (until && Date.now() > Number(until)) {
    await account.deleteSession('current').catch(() => {})
    localStorage.removeItem(REMEMBER_KEY)
    localStorage.removeItem(REFRESH_KEY)
    return false
  }

  const last = localStorage.getItem(REFRESH_KEY)
  if (!last || Date.now() - Number(last) > REFRESH_INTERVAL) {
    try {
      await account.updateSession({ sessionId: 'current' })
      localStorage.setItem(REFRESH_KEY, String(Date.now()))
      if (!until) {
        localStorage.setItem(REMEMBER_KEY, String(Date.now() + SESSION_MS))
      }
    } catch {
      /* ignore refresh errors — session may still be valid */
    }
  }

  return true
}

export function clearSessionPersistence(): void {
  localStorage.removeItem(REMEMBER_KEY)
  localStorage.removeItem(REFRESH_KEY)
}
