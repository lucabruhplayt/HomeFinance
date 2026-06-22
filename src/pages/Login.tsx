import { useState } from 'react'
import { Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, register, mfaPending, startMfaChallenge, completeMfaChallenge } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaSent, setMfaSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isRegister) {
        await register(email, password, name)
      } else {
        await login(email, password)
      }
    } catch (err: any) {
      setError(err.message || 'Eroare de autentificare')
    }
    setBusy(false)
  }

  const handleMfaStart = async () => {
    setError('')
    setBusy(true)
    try {
      await startMfaChallenge()
      setMfaSent(true)
    } catch (err: any) {
      setError(err.message || 'Eroare la trimiterea codului')
    }
    setBusy(false)
  }

  const handleMfaComplete = async () => {
    setError('')
    setBusy(true)
    try {
      await completeMfaChallenge(mfaCode)
    } catch (err: any) {
      setError(err.message || 'Cod incorect')
    }
    setBusy(false)
  }

  if (mfaPending) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1rem' }}>
        <div className="modal-content" style={{ maxWidth: 400, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <Shield size={40} style={{ color: '#8B5CF6', marginBottom: '0.5rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Autentificare în doi pași</h2>
            <p style={{ color: '#71717a', fontSize: '0.875rem' }}>
              {mfaSent ? 'Introdu codul primit pe email' : 'Apasă butonul pentru a primi codul'}
            </p>
          </div>

          {!mfaSent ? (
            <button className="btn-primary" onClick={handleMfaStart} disabled={busy}
              style={{ width: '100%', justifyContent: 'center' }}>
              {busy ? 'Se trimite...' : 'Trimite cod pe email'}
            </button>
          ) : (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label>Cod primit pe email</label>
                <input className="input-field" type="text" inputMode="numeric" autoFocus
                  value={mfaCode} onChange={e => setMfaCode(e.target.value)}
                  placeholder="Introdu codul din 6 cifre" />
              </div>
              {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
              <button className="btn-primary" onClick={handleMfaComplete} disabled={busy || mfaCode.length < 6}
                style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }}>
                {busy ? 'Se verifică...' : 'Verifică'}
              </button>
              <button style={{ background: 'none', border: 'none', color: 'var(--cta)', cursor: 'pointer', fontSize: '0.875rem', width: '100%', textAlign: 'center' }}
                onClick={handleMfaStart} disabled={busy}>
                Retrimite codul
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem',
    }}>
      <div className="modal-content" style={{ maxWidth: 400, width: '100%' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.25rem' }}>
          HomeFinance
        </h1>
        <p style={{ textAlign: 'center', color: '#71717a', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {isRegister ? 'Creează un cont nou' : 'Autentifică-te'}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: '1rem' }}>
              <label>Nume</label>
              <input className="input-field" type="text" required
                value={name} onChange={e => setName(e.target.value)} placeholder="Numele tău" />
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <label>Email</label>
            <input className="input-field" type="email" required
              value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplu.ro" />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Parolă</label>
            <input className="input-field" type="password" required
              value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
          )}

          <button type="submit" className="btn-primary" disabled={busy}
            style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }}>
            {busy ? 'Se procesează...' : (isRegister ? 'Creează cont' : 'Autentifică-te')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#71717a' }}>
          {isRegister ? 'Ai deja cont?' : 'Nu ai cont?'}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError('') }}
            style={{ background: 'none', border: 'none', color: 'var(--cta)', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
            {isRegister ? 'Autentifică-te' : 'Înregistrează-te'}
          </button>
        </p>
      </div>
    </div>
  )
}
