import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { account, ID } from '../lib/appwrite'
import { AuthenticationFactor, type Models } from 'appwrite'

interface AuthContextType {
  user: Models.User<any> | null
  loading: boolean
  mfaPending: boolean
  mfaChallengeId: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  startMfaChallenge: () => Promise<void>
  completeMfaChallenge: (otp: string) => Promise<void>
  updateMfaStatus: (enable: boolean) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [mfaPending, setMfaPending] = useState(false)
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null)

  useEffect(() => {
    account.get()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await account.createEmailPasswordSession({ email, password })
    try {
      const u = await account.get()
      if (u.mfa) {
        setUser(null)
        setMfaPending(true)
      } else {
        setUser(u)
      }
    } catch {
      // account.get() throws 401 when MFA challenge is required
      setUser(null)
      setMfaPending(true)
    }
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    await account.create({ userId: ID.unique(), email, password, name })
    await login(email, password)
  }, [login])

  const logout = useCallback(async () => {
    await account.deleteSession('current').catch(() => {})
    setUser(null)
    setMfaPending(false)
    setMfaChallengeId(null)
  }, [])

  const startMfaChallenge = useCallback(async () => {
    const challenge = await account.createMFAChallenge({ factor: AuthenticationFactor.Email })
    setMfaChallengeId(challenge.$id)
  }, [])

  const completeMfaChallenge = useCallback(async (otp: string) => {
    if (!mfaChallengeId) throw new Error('No MFA challenge in progress')
    await account.updateMFAChallenge({ challengeId: mfaChallengeId, otp })
    const u = await account.get()
    setUser(u)
    setMfaPending(false)
    setMfaChallengeId(null)
  }, [mfaChallengeId])

  const updateMfaStatus = useCallback(async (enable: boolean) => {
    await account.updateMFA({ mfa: enable })
    const u = await account.get()
    setUser(u)
  }, [])

  return (
    <AuthContext value={{
      user, loading, mfaPending, mfaChallengeId,
      login, register, logout,
      startMfaChallenge, completeMfaChallenge,
      updateMfaStatus,
    }}>
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within FinanceProvider')
  return ctx
}
