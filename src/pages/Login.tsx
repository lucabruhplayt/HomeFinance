import { useState, useEffect } from 'react'
import { Shield, Wallet, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useMediaQuery } from '../utils/useMediaQuery'
import AuthBackground from '../components/AuthBackground'
import LoginAppDemo from '../components/LoginAppDemo'
import { useLocale } from '../context/LocaleContext'

interface Props {
  onBack: () => void
  initialRegister?: boolean
}

export default function Login({ onBack, initialRegister = false }: Props) {
  const { login, register, mfaPending, startMfaChallenge, completeMfaChallenge } = useAuth()
  const { t } = useLocale()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(initialRegister)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaSent, setMfaSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setIsRegister(initialRegister)
  }, [initialRegister])

  const anim = (delay: string) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}, transform 0.6s ease ${delay}`,
  })

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

  const formStyles = `
    .login-input {
      transition: all 0.3s ease;
      background: #18181B !important;
      border-color: #27272A !important;
      color: #F4F4F5 !important;
    }
    .login-input:focus {
      border-color: #6366F1 !important;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
      transform: translateY(-1px);
    }
    .login-input::placeholder { color: #52525B; }
    .login-btn {
      background: linear-gradient(135deg, #0EA5E9, #6366F1);
      border: none;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(99,102,241,0.35);
    }
    .login-btn:active:not(:disabled) { transform: translateY(0); }
    .login-back {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: #A1A1AA;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .login-back:hover {
      background: rgba(255,255,255,0.1);
      color: #F4F4F5;
      transform: translateX(-2px);
    }
    @keyframes login-wiggle {
      0%, 100% { transform: rotate(0deg) }
      25% { transform: rotate(-8deg) }
      75% { transform: rotate(8deg) }
    }
    @keyframes login-form-glow {
      0%, 100% { box-shadow: 0 0 0 rgba(99,102,241,0) }
      50% { box-shadow: 0 0 40px rgba(99,102,241,0.08) }
    }
  `

  if (mfaPending) {
    return (
      <AuthBackground centered>
        <style>{formStyles}</style>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-content" style={{
            maxWidth: 400, width: '100%',
            background: 'rgba(24,24,27,0.85)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            animation: 'scaleIn 0.4s ease both',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <Shield size={40} style={{ color: '#6366F1', marginBottom: '0.5rem' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem', color: '#F4F4F5' }}>
                {t('auth.mfaTitle')}
              </h2>
              <p style={{ color: '#A1A1AA', fontSize: '0.875rem' }}>
                {mfaSent ? t('auth.mfaEnterCode') : t('auth.mfaSendPrompt')}
              </p>
            </div>
            {!mfaSent ? (
              <button className="login-btn" onClick={handleMfaStart} disabled={busy}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.9375rem' }}>
                {busy ? t('auth.mfaSending') : t('auth.mfaSend')}
              </button>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#A1A1AA' }}>{t('auth.mfaCode')}</label>
                  <input className="input-field login-input" type="text" inputMode="numeric" autoFocus
                    value={mfaCode} onChange={e => setMfaCode(e.target.value)}
                    placeholder={t('auth.mfaCodePlaceholder')} />
                </div>
                {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
                <button className="login-btn" onClick={handleMfaComplete} disabled={busy || mfaCode.length < 6}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.9375rem', marginBottom: '0.75rem' }}>
                  {busy ? t('auth.mfaVerifying') : t('auth.mfaVerify')}
                </button>
                <button style={{ background: 'none', border: 'none', color: '#6366F1', cursor: 'pointer', fontSize: '0.875rem', width: '100%', textAlign: 'center' }}
                  onClick={handleMfaStart} disabled={busy}>
                  {t('auth.mfaResend')}
                </button>
              </>
            )}
          </div>
        </div>
      </AuthBackground>
    )
  }

  return (
    <AuthBackground>
      <style>{formStyles}</style>

      <div style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1.15fr',
        maxWidth: 1280,
        margin: '0 auto',
        width: '100%',
        padding: isMobile ? '0' : '0 2rem',
        gap: isMobile ? 0 : '2rem',
        alignItems: 'center',
        position: 'relative',
      }}>
        {/* Form — centrat în coloana stângă */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          padding: isMobile ? '1rem 1.25rem 2rem' : '2rem 1rem 2rem 2rem',
          minHeight: isMobile ? '100vh' : undefined,
          justifyContent: 'center',
        }}>
          <button
            className="login-back"
            onClick={onBack}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
              fontSize: '0.8125rem', alignSelf: 'flex-start', marginBottom: '1.25rem',
              position: isMobile ? undefined : 'absolute',
              top: isMobile ? undefined : '1.5rem',
              left: isMobile ? undefined : '2rem',
              ...anim('0s'),
            }}
          >
            <ArrowLeft size={16} /> {t('auth.back')}
          </button>

          <div style={{
            width: '100%', maxWidth: 400,
            margin: '0 auto',
            padding: isMobile ? 0 : '1rem',
            borderRadius: '1.25rem',
            animation: visible ? 'login-form-glow 4s ease infinite' : undefined,
            ...anim('0.1s'),
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '1rem',
                background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                animation: visible ? 'login-wiggle 0.6s ease 0.5s both' : undefined,
              }}>
                <Wallet size={30} color="white" />
              </div>
              <h1 style={{
                fontSize: '1.625rem', fontWeight: 700, marginBottom: '0.375rem',
                background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {isRegister ? t('auth.welcome') : t('auth.welcomeBack')}
              </h1>
              <p style={{ color: '#A1A1AA', fontSize: '0.875rem' }}>
                {isRegister ? t('auth.registerSubtitle') : t('auth.loginSubtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div style={{ marginBottom: '1rem', ...anim('0.15s') }}>
                  <label style={{ color: '#A1A1AA' }}>{t('auth.name')}</label>
                  <input className="input-field login-input" type="text" required
                    value={name} onChange={e => setName(e.target.value)} placeholder={t('auth.namePlaceholder')} />
                </div>
              )}
              <div style={{ marginBottom: '1rem', ...anim('0.2s') }}>
                <label style={{ color: '#A1A1AA' }}>{t('auth.email')}</label>
                <input className="input-field login-input" type="email" required
                  value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.emailPlaceholder')} />
              </div>
              <div style={{ marginBottom: '1.5rem', ...anim('0.25s') }}>
                <label style={{ color: '#A1A1AA' }}>{t('auth.password')}</label>
                <div style={{ position: 'relative' }}>
                  <input className="input-field login-input" type={showPassword ? 'text' : 'password'} required
                    value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    style={{ paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#52525B', padding: 4, display: 'flex',
                    }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p style={{
                  color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem',
                  padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  background: 'rgba(239,68,68,0.1)',
                  animation: 'fadeIn 0.3s ease',
                }}>{error}</p>
              )}

              <button type="submit" className="login-btn" disabled={busy}
                style={{
                  width: '100%', padding: '0.8125rem', borderRadius: '0.75rem',
                  fontSize: '0.9375rem', marginBottom: '0.875rem',
                  //opacity: busy ? 0.7 : 1,
                  ...anim('0.3s'),
                }}>
                {busy ? t('auth.processing') : (isRegister ? t('auth.createAccount') : t('auth.signIn'))}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', ...anim('0.35s') }}>
              <span style={{ color: '#71717A' }}>
                {isRegister ? t('auth.hasAccount') : t('auth.noAccount')}
              </span>{' '}
              <button
                onClick={() => { setIsRegister(!isRegister); setError('') }}
                style={{
                  border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                  background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}
              >
                {isRegister ? t('auth.signIn') : t('auth.register')}
              </button>
            </p>
          </div>
        </div>

        {/* Demo app preview */}
        {!isMobile && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem 1rem 2rem 0',
            ...anim('0.5s'),
          }}>
            <LoginAppDemo />
          </div>
        )}
      </div>
    </AuthBackground>
  )
}
