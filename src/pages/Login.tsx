import { useState, useRef, useCallback, useEffect } from 'react'
import { Shield, Wallet, Eye, EyeOff, LayoutDashboard, Receipt, PiggyBank, TrendingUp, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useMediaQuery } from '../utils/useMediaQuery'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

interface DemoStep {
  target: string
  text: string
  action: 'hover' | 'click' | 'focus'
}

const demoSteps: DemoStep[] = [
  { target: '[data-demo="logo"]', text: 'Bun venit la Home Finance!', action: 'hover' },
  { target: '[data-demo="email"]', text: 'Introdu adresa ta de email', action: 'focus' },
  { target: '[data-demo="password"]', text: 'Introdu parola contului tău', action: 'focus' },
  { target: '[data-demo="submit"]', text: 'Autentifică-te în aplicație', action: 'click' },
  { target: '[data-demo="toggle"]', text: 'Nu ai cont? Înregistrează-te', action: 'click' },
  { target: '[data-mock="title"]', text: 'Dashboardul tău financiar personal', action: 'hover' },
  { target: '[data-mock="stat-total"]', text: '2.450 lei cheltuiți luna aceasta', action: 'hover' },
  { target: '[data-mock="stat-avg"]', text: '816 lei medie per persoană', action: 'hover' },
  { target: '[data-mock="pie"]', text: 'Defalcare pe categorii de cheltuieli', action: 'hover' },
  { target: '[data-mock="bars"]', text: 'Evoluția zilnică a cheltuielilor', action: 'hover' },
  { target: '[data-mock="feature-0"]', text: 'Dashboard — statistici și grafice detaliate', action: 'click' },
  { target: '[data-mock="feature-1"]', text: 'Cheltuieli — adaugă și filtrează tranzacțiile', action: 'click' },
  { target: '[data-mock="feature-2"]', text: 'Buget — stabilește limite lunare', action: 'click' },
  { target: '[data-mock="feature-3"]', text: 'Statistici — analizează tendințele', action: 'click' },
  { target: '[data-mock="cta"]', text: 'Organizează-ți finanțele — începe acum!', action: 'click' },
]

export default function Login() {
  const { login, register, mfaPending, startMfaChallenge, completeMfaChallenge } = useAuth()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaSent, setMfaSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const pageRef = useRef<HTMLDivElement>(null)
  const [cursorPos, setCursorPos] = useState({ x: 400, y: 300 })
  const [tooltip, setTooltip] = useState({ text: '', visible: false })
  const [clicking, setClicking] = useState(false)
  const [highlighted, setHighlighted] = useState('')
  const [cursorVisible, setCursorVisible] = useState(false)
  const [demoStarted, setDemoStarted] = useState(false)
  const activeRef = useRef(true)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const runDemo = useCallback(async () => {
    await delay(1500)
    if (!activeRef.current) return
    setDemoStarted(true)
    setCursorVisible(true)

    while (activeRef.current) {
      for (const step of demoSteps) {
        if (!activeRef.current) break

        const target = document.querySelector(step.target) as HTMLElement | null
        if (!target) continue

        const rect = target.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2

        setCursorPos({ x, y })
        setTooltip({ text: '', visible: false })
        setHighlighted('')
        setClicking(false)

        await delay(750)

        setTooltip({ text: step.text, visible: true })
        setHighlighted(step.target)

        if (step.action === 'focus') {
          const input = target.querySelector('input')
          if (input) input.focus()
          await delay(1200)
        } else if (step.action === 'click') {
          await delay(600)
          setClicking(true)
          await delay(350)
          setClicking(false)
          await delay(400)
          setHighlighted('')
        } else {
          await delay(1400)
        }

        setTooltip({ text: '', visible: false })
        await delay(300)
      }
      await delay(3000)
    }
  }, [])

  useEffect(() => {
    runDemo()
    return () => { activeRef.current = false }
  }, [runDemo])

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

  const features = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', desc: 'Vizualizare lunară', color: '#0EA5E9' },
    { icon: <Receipt size={18} />, label: 'Cheltuieli', desc: 'Adaugă și filtrează', color: '#8B5CF6' },
    { icon: <PiggyBank size={18} />, label: 'Buget', desc: 'Stabilește limite', color: '#10B981' },
    { icon: <TrendingUp size={18} />, label: 'Statistici', desc: 'Evoluție în timp', color: '#F59E0B' },
  ]

  const mfaView = (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0A0A1A 0%, #1A1A3E 50%, #0F172A 100%)',
      padding: '1rem',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes float-bg {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
      `}</style>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 25% 40%, rgba(14,165,233,0.08) 0%, transparent 50%), radial-gradient(circle at 75% 60%, rgba(99,102,241,0.08) 0%, transparent 50%)',
        backgroundSize: '200% 200%',
        animation: 'float-bg 10s ease infinite',
      }} />
      <div className="modal-content" style={{ maxWidth: 400, width: '100%', animation: 'fadeIn 0.5s ease both', position: 'relative', background: 'rgba(24,24,27,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Shield size={40} style={{ color: '#6366F1', marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem', color: '#F4F4F5' }}>Autentificare în doi pași</h2>
          <p style={{ color: '#A1A1AA', fontSize: '0.875rem' }}>
            {mfaSent ? 'Introdu codul primit pe email' : 'Apasă butonul pentru a primi codul'}
          </p>
        </div>
        {!mfaSent ? (
          <button className="btn-primary" onClick={handleMfaStart} disabled={busy}
            style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
            {busy ? 'Se trimite...' : 'Trimite cod pe email'}
          </button>
        ) : (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#A1A1AA' }}>Cod primit pe email</label>
              <input className="input-field" type="text" inputMode="numeric" autoFocus
                value={mfaCode} onChange={e => setMfaCode(e.target.value)}
                placeholder="Introdu codul din 6 cifre"
                style={{ background: '#18181B', borderColor: '#27272A', color: '#F4F4F5', transition: 'all 0.3s' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)' }}
                onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }} />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
            <button className="btn-primary" onClick={handleMfaComplete} disabled={busy || mfaCode.length < 6}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem', background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
              {busy ? 'Se verifică...' : 'Verifică'}
            </button>
            <button style={{ background: 'none', border: 'none', color: '#6366F1', cursor: 'pointer', fontSize: '0.875rem', width: '100%', textAlign: 'center' }}
              onClick={handleMfaStart} disabled={busy}>
              Retrimite codul
            </button>
          </>
        )}
      </div>
    </div>
  )

  if (mfaPending) return mfaView

  return (
    <div ref={pageRef} style={{
      minHeight: '100vh', display: 'flex',
      background: '#0A0A1A',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes float-bg {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) }
          50% { transform: translateY(-16px) }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.15) }
          50% { box-shadow: 0 0 40px rgba(99,102,241,0.3) }
        }
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateX(-30px) }
          to { opacity: 1; transform: translateX(0) }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) }
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes staggerIn {
          from { opacity: 0; transform: translateY(12px) }
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(8px) }
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3) }
          50% { transform: scale(1.05) }
          70% { transform: scale(0.95) }
          100% { opacity: 1; transform: scale(1) }
        }
        @keyframes clickRipple {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.7 }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0 }
        }
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateY(6px) scale(0.92) }
          to { opacity: 1; transform: translateY(0) scale(1) }
        }
        @keyframes demoHighlight {
          0%, 100% { outline-color: rgba(99,102,241,0.3) }
          50% { outline-color: rgba(99,102,241,0.7) }
        }
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
        .login-input::placeholder {
          color: #52525B;
        }
        .login-btn {
          background: linear-gradient(135deg, #0EA5E9, #6366F1);
          background-size: 200% 200%;
          border: none;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.35);
        }
        .login-btn:active {
          transform: translateY(0px);
        }
        .login-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -200%; width: 200%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transition: left 0.5s ease;
        }
        .login-btn:hover::after {
          left: 200%;
        }
      `}</style>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(14,165,233,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(99,102,241,0.06) 0%, transparent 50%)',
        backgroundSize: '200% 200%',
        animation: 'float-bg 10s ease infinite',
      }} />

      {!isMobile && (
        <>
          <div style={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: 'rgba(14,165,233,0.05)', filter: 'blur(80px)',
            top: '5%', left: '30%',
            animation: 'float 8s ease infinite',
          }} />
          <div style={{
            position: 'absolute', width: 350, height: 350, borderRadius: '50%',
            background: 'rgba(99,102,241,0.05)', filter: 'blur(80px)',
            bottom: '10%', right: '25%',
            animation: 'float 9s ease infinite 2s',
          }} />
        </>
      )}

      {/* Cursor glow trail */}
      {cursorVisible && !isMobile && (
        <div style={{
          position: 'fixed',
          left: cursorPos.x,
          top: cursorPos.y,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          transition: 'left 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          zIndex: 9998,
          pointerEvents: 'none',
        }} />
      )}

      {/* Cursor */}
      {cursorVisible && !isMobile && (
        <div style={{
          position: 'fixed',
          left: cursorPos.x,
          top: cursorPos.y,
          transform: 'translate(-3px, -3px)',
          transition: 'left 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          zIndex: 9999,
          pointerEvents: 'none',
          filter: 'drop-shadow(0 2px 6px rgba(99,102,241,0.5))',
        }}>
          <svg width="22" height="30" viewBox="0 0 22 30" fill="none">
            <path d="M3 2L16 15H10L7 20L4 15H3V2Z" fill={clicking ? '#C7D2FE' : 'white'} stroke="#6366F1" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>

          {clicking && (
            <div style={{
              position: 'absolute',
              left: 8, top: 12,
              width: 8, height: 8,
              borderRadius: '50%',
              background: 'rgba(99,102,241,0.5)',
              animation: 'clickRipple 0.5s ease-out forwards',
            }} />
          )}
        </div>
      )}

      {/* Tooltip */}
      {tooltip.visible && cursorVisible && !isMobile && (
        <div style={{
          position: 'fixed',
          left: Math.min(cursorPos.x + 26, window.innerWidth - 240),
          top: Math.max(cursorPos.y - 44, 12),
          zIndex: 9999,
          pointerEvents: 'none',
          animation: 'tooltipIn 0.25s ease both',
          maxWidth: 230,
        }}>
          <div style={{
            background: '#18181B',
            border: '1px solid rgba(99,102,241,0.35)',
            borderRadius: '0.625rem',
            padding: '0.5rem 0.75rem',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)',
          }}>
            <p style={{
              color: '#E4E4E7',
              fontSize: '0.75rem',
              lineHeight: 1.4,
              fontWeight: 500,
              margin: 0,
            }}>{tooltip.text}</p>
          </div>
          <div style={{
            position: 'absolute',
            bottom: -5,
            left: 14,
            width: 8,
            height: 8,
            background: '#18181B',
            borderRight: '1px solid rgba(99,102,241,0.35)',
            borderBottom: '1px solid rgba(99,102,241,0.35)',
            transform: 'rotate(45deg)',
          }} />
        </div>
      )}

      {/* LEFT: Form */}
      <div style={{
        flex: isMobile ? 1 : '0 0 45%',
        maxWidth: isMobile ? '100%' : 520,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '1rem' : '2rem',
        minHeight: isMobile ? '100vh' : undefined,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: '100%', maxWidth: 400,
          animation: 'cardEntrance 0.6s ease both',
        }}>
          <div data-demo="logo" style={{
            textAlign: 'center', marginBottom: '2rem',
            ...(highlighted === '[data-demo="logo"]' ? {
              filter: 'brightness(1.3)',
              transition: 'filter 0.3s',
            } : {}),
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '1rem',
              background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              animation: 'pulse-glow 3s ease infinite',
              boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
            }}>
              <Wallet size={32} color="white" />
            </div>
            <h1 style={{
              fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem',
              background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              Home Finance
            </h1>
            <p style={{ color: '#A1A1AA', fontSize: '0.875rem' }}>
              {isRegister ? 'Creează un cont nou' : 'Autentifică-te'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div style={{ marginBottom: '1rem', animation: 'staggerIn 0.4s ease both' }}>
                <label style={{ color: '#A1A1AA' }}>Nume</label>
                <input className="input-field login-input" type="text" required
                  value={name} onChange={e => setName(e.target.value)} placeholder="Numele tău" />
              </div>
            )}
            <div data-demo="email" style={{
              marginBottom: '1rem', animation: 'staggerIn 0.4s ease both 0.05s',
              ...(highlighted === '[data-demo="email"]' ? {
                filter: 'brightness(1.15)',
                transition: 'filter 0.3s',
              } : {}),
            }}>
              <label style={{ color: '#A1A1AA' }}>Email</label>
              <input ref={emailRef} className="input-field login-input" type="email" required
                value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplu.ro" />
            </div>
            <div data-demo="password" style={{
              marginBottom: '1.5rem', animation: 'staggerIn 0.4s ease both 0.1s',
              ...(highlighted === '[data-demo="password"]' ? {
                filter: 'brightness(1.15)',
                transition: 'filter 0.3s',
              } : {}),
            }}>
              <label style={{ color: '#A1A1AA' }}>Parolă</label>
              <div style={{ position: 'relative' }}>
                <input ref={passwordRef} className="input-field login-input" type={showPassword ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  style={{ paddingRight: '2.5rem', background: '#18181B', borderColor: '#27272A', color: '#F4F4F5', transition: 'all 0.3s' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#52525B', padding: 4, display: 'flex',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#6366F1' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#52525B' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p style={{
                color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem',
                animation: 'fadeIn 0.3s ease',
                padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                background: 'rgba(239,68,68,0.1)',
              }}>{error}</p>
            )}

            <button data-demo="submit" type="submit" className="login-btn" disabled={busy}
              style={{
                width: '100%', justifyContent: 'center', marginBottom: '0.75rem',
                padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                color: 'white', fontSize: '0.9375rem', fontWeight: 500, cursor: 'pointer',
                animation: 'staggerIn 0.4s ease both 0.15s',
                opacity: busy ? 0.7 : 1,
                ...(highlighted === '[data-demo="submit"]' ? {
                  boxShadow: '0 0 24px rgba(99,102,241,0.5)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s',
                } : {}),
              }}>
              {busy ? 'Se procesează...' : (isRegister ? 'Creează cont' : 'Autentifică-te')}
            </button>
          </form>

          <p data-demo="toggle" style={{
            textAlign: 'center', fontSize: '0.875rem',
            animation: 'staggerIn 0.4s ease both 0.2s',
            ...(highlighted === '[data-demo="toggle"]' ? {
              filter: 'brightness(1.3)',
              transition: 'filter 0.3s',
            } : {}),
          }}>
            <span style={{ color: '#71717A' }}>
              {isRegister ? 'Ai deja cont?' : 'Nu ai cont?'}
            </span>{' '}
            <button onClick={() => { setIsRegister(!isRegister); setError('') }}
              style={{
                border: 'none', cursor: 'pointer', fontWeight: 600,
                fontSize: '0.875rem',
                background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
              {isRegister ? 'Autentifică-te' : 'Înregistrează-te'}
            </button>
          </p>
        </div>
      </div>

      {/* RIGHT: App Preview */}
      {!isMobile && (
        <div style={{
          flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{
            width: '100%', maxWidth: 560,
            animation: 'slideUp 0.8s ease both 0.2s',
          }}>
            <div style={{
              position: 'relative',
              background: 'rgba(24,24,27,0.7)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '1.5rem',
              padding: '1.75rem',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.15)',
            }}>
              {/* Mock header */}
              <div data-mock="title" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem',
                ...(highlighted === '[data-mock="title"]' ? {
                  filter: 'brightness(1.2)',
                  transition: 'filter 0.3s',
                } : {}),
              }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem', fontWeight: 600 }}>Dashboard</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>2026-06 — Rezumatul lunii</p>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Wallet size={16} color="white" />
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1.5rem' }}>
                {[
                  { mock: 'stat-total', label: 'Total', value: '2,450 lei', color: '#0EA5E9', delay: '0.3s' },
                  { mock: 'stat-avg', label: 'Medie', value: '816 lei', color: '#8B5CF6', delay: '0.4s' },
                  { mock: 'stat-week', label: 'Săptămâna', value: '580 lei', color: '#10B981', delay: '0.5s' },
                  { mock: 'stat-count', label: 'Tranzacții', value: '12', color: '#F59E0B', delay: '0.6s' },
                ].map(s => {
                  const sel = `[data-mock="${s.mock}"]`
                  const hl = highlighted === sel
                  return (
                    <div key={s.label} data-mock={s.mock} style={{
                      background: hl ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      animation: `countUp 0.5s ease both ${s.delay}`,
                      border: hl ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                      transition: 'all 0.3s',
                      boxShadow: hl ? '0 0 20px rgba(99,102,241,0.2)' : 'none',
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6875rem', marginBottom: '0.125rem' }}>{s.label}</p>
                      <p style={{ color: s.color, fontSize: '1rem', fontWeight: 600 }}>{s.value}</p>
                    </div>
                  )
                })}
              </div>

              {/* Charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div data-mock="pie" style={{
                  background: highlighted === '[data-mock="pie"]' ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                  borderRadius: '0.75rem', padding: '1rem',
                  animation: 'slideUp 0.6s ease both 0.5s',
                  border: highlighted === '[data-mock="pie"]' ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                  transition: 'all 0.3s',
                  boxShadow: highlighted === '[data-mock="pie"]' ? '0 0 20px rgba(99,102,241,0.2)' : 'none',
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.75rem' }}>Pe categorii</p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                      width: 100, height: 100, borderRadius: '50%',
                      background: 'conic-gradient(#0EA5E9 0% 35%, #8B5CF6 35% 55%, #10B981 55% 75%, #F59E0B 75% 88%, #EC4899 88% 100%)',
                      animation: 'bounce-in 0.6s ease both 0.7s',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: '#18181B',
                        position: 'relative', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.625rem', fontWeight: 600 }}>2.4K</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div data-mock="bars" style={{
                  background: highlighted === '[data-mock="bars"]' ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                  borderRadius: '0.75rem', padding: '1rem',
                  animation: 'slideUp 0.6s ease both 0.6s',
                  border: highlighted === '[data-mock="bars"]' ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                  transition: 'all 0.3s',
                  boxShadow: highlighted === '[data-mock="bars"]' ? '0 0 20px rgba(99,102,241,0.2)' : 'none',
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.75rem' }}>Zilnic</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem', height: 80, justifyContent: 'center' }}>
                    {[45, 65, 35, 80, 55, 40, 70].map((h, i) => (
                      <div key={i} style={{
                        width: 18, height: `${h}%`,
                        background: 'linear-gradient(to top, #0EA5E9, #6366F1)',
                        borderRadius: '4px 4px 0 0',
                        animation: `slideUp 0.4s ease both ${0.8 + i * 0.1}s`,
                        opacity: 0.8,
                      }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature badges */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
                animation: 'slideUp 0.6s ease both 1.1s',
              }}>
                {features.map((f, i) => {
                  const sel = `[data-mock="feature-${i}"]`
                  const hl = highlighted === sel
                  return (
                    <div key={f.label} data-mock={`feature-${i}`} style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.625rem',
                      background: hl ? `${f.color}20` : 'rgba(255,255,255,0.03)',
                      border: hl ? `1px solid ${f.color}50` : '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.3s',
                      boxShadow: hl ? `0 0 20px ${f.color}25` : 'none',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '0.5rem',
                        background: hl ? `${f.color}30` : `${f.color}15`, color: f.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {f.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8125rem', fontWeight: 500 }}>{f.label}</p>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.6875rem' }}>{f.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom CTA */}
              <div data-mock="cta" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginTop: '1.25rem', padding: '0.75rem', borderRadius: '0.75rem',
                background: highlighted === '[data-mock="cta"]' ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
                border: highlighted === '[data-mock="cta"]' ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(99,102,241,0.15)',
                animation: 'slideUp 0.6s ease both 1.3s',
                transition: 'all 0.3s',
                boxShadow: highlighted === '[data-mock="cta"]' ? '0 0 24px rgba(99,102,241,0.3)' : 'none',
              }}>
                <span style={{ color: '#818CF8', fontSize: '0.8125rem' }}>Organizează-ți cheltuielile</span>
                <ArrowRight size={16} style={{ color: '#818CF8', flexShrink: 0 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo badge */}
      {demoStarted && !isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 10000,
          pointerEvents: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(24,24,27,0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '0.5rem',
          padding: '0.375rem 0.625rem',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#10B981',
            animation: 'pulse-glow 1.5s ease infinite',
          }} />
          <span style={{ color: '#A1A1AA', fontSize: '0.6875rem' }}>Demo activ</span>
        </div>
      )}
    </div>
  )
}
