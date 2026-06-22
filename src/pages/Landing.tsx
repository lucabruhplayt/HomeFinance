import { useEffect, useState } from 'react'
import {
  Wallet, LayoutDashboard, Receipt, PiggyBank, Users, Tags,
  ArrowRight, Sparkles, Shield, Smartphone, ChevronDown, TrendingUp,
} from 'lucide-react'
import { useMediaQuery } from '../utils/useMediaQuery'
import AuthBackground from '../components/AuthBackground'
import { useLocale } from '../context/LocaleContext'

interface Props {
  onLogin: () => void
  onRegister: () => void
}

const featureKeys = [
  { icon: LayoutDashboard, titleKey: 'auth.landing.feat1Title', descKey: 'auth.landing.feat1Desc', color: '#0EA5E9', delay: '0.1s' },
  { icon: Receipt, titleKey: 'auth.landing.feat2Title', descKey: 'auth.landing.feat2Desc', color: '#8B5CF6', delay: '0.2s' },
  { icon: PiggyBank, titleKey: 'auth.landing.feat3Title', descKey: 'auth.landing.feat3Desc', color: '#10B981', delay: '0.3s' },
  { icon: Users, titleKey: 'auth.landing.feat4Title', descKey: 'auth.landing.feat4Desc', color: '#F59E0B', delay: '0.4s' },
]

const stepKeys = [
  { num: '01', titleKey: 'auth.landing.step1Title', descKey: 'auth.landing.step1Desc' },
  { num: '02', titleKey: 'auth.landing.step2Title', descKey: 'auth.landing.step2Desc' },
  { num: '03', titleKey: 'auth.landing.step3Title', descKey: 'auth.landing.step3Desc' },
]

const floatingSideCards = [
  { label: 'Mâncare', value: '845 lei', color: '#F97316', top: '18%', left: '3%', delay: '0.8s' },
  { label: 'Buget OK', value: '68%', color: '#10B981', top: '42%', left: '1.5%', delay: '1.1s' },
  { label: 'Andrei', value: '1.120 lei', color: '#3B82F6', top: '22%', right: '3%', delay: '0.9s' },
  { label: 'Maria', value: '890 lei', color: '#EC4899', top: '48%', right: '2%', delay: '1.2s' },
]

export default function Landing({ onLogin, onRegister }: Props) {
  const { t } = useLocale()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isWide = useMediaQuery('(min-width: 1100px)')
  const [visible, setVisible] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % featureKeys.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const anim = (delay: string) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.7s ease ${delay}, transform 0.7s ease ${delay}`,
  })

  const sideAnim = (delay: string) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0) scale(1)' : 'translateX(-20px) scale(0.95)',
    transition: `opacity 0.8s ease ${delay}, transform 0.8s ease ${delay}`,
  })

  const sideAnimRight = (delay: string) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0) scale(1)' : 'translateX(20px) scale(0.95)',
    transition: `opacity 0.8s ease ${delay}, transform 0.8s ease ${delay}`,
  })

  return (
    <AuthBackground>
      <style>{`
        @keyframes landing-shimmer {
          0% { background-position: -200% center }
          100% { background-position: 200% center }
        }
        @keyframes landing-bounce-soft {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(6px) }
        }
        @keyframes landing-scale-in {
          from { opacity: 0; transform: scale(0.9) }
          to { opacity: 1; transform: scale(1) }
        }
        @keyframes landing-float-card {
          0%, 100% { transform: translateY(0) rotate(0deg) }
          50% { transform: translateY(-10px) rotate(0.5deg) }
        }
        @keyframes landing-float-side {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(-12px) }
        }
        @keyframes landing-orbit {
          from { transform: rotate(0deg) translateX(6px) rotate(0deg) }
          to { transform: rotate(360deg) translateX(6px) rotate(-360deg) }
        }
        @keyframes landing-line-pulse {
          0%, 100% { opacity: 0.15 }
          50% { opacity: 0.4 }
        }
        .landing-cta {
          background: linear-gradient(135deg, #0EA5E9, #6366F1);
          background-size: 200% 200%;
          border: none;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .landing-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(99,102,241,0.4);
        }
        .landing-cta:active { transform: translateY(-1px); }
        .landing-ghost {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #E4E4E7;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .landing-ghost:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(99,102,241,0.4);
          transform: translateY(-2px);
        }
        .landing-feature-card {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .landing-feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(99,102,241,0.3) !important;
          box-shadow: 0 16px 40px rgba(0,0,0,0.25);
        }
      `}</style>

      {/* Decorative side lines */}
      {isWide && (
        <>
          <div style={{
            position: 'fixed', left: 0, top: '10%', bottom: '10%', width: 1,
            background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.3), transparent)',
            animation: 'landing-line-pulse 3s ease infinite',
            pointerEvents: 'none', zIndex: 0,
          }} />
          <div style={{
            position: 'fixed', right: 0, top: '10%', bottom: '10%', width: 1,
            background: 'linear-gradient(to bottom, transparent, rgba(14,165,233,0.3), transparent)',
            animation: 'landing-line-pulse 3s ease infinite 1.5s',
            pointerEvents: 'none', zIndex: 0,
          }} />
        </>
      )}

      {/* Floating side cards — desktop wide */}
      {isWide && floatingSideCards.map((card, i) => {
        const isLeft = 'left' in card
        const animStyle = isLeft ? sideAnim(card.delay) : sideAnimRight(card.delay)
        return (
          <div
            key={card.label}
            style={{
              position: 'fixed',
              top: card.top,
              ...(isLeft ? { left: card.left } : { right: (card as { right: string }).right }),
              zIndex: 0, pointerEvents: 'none',
              animation: visible ? `landing-float-side ${4 + i * 0.5}s ease-in-out infinite` : undefined,
              ...animStyle,
            }}
          >
            <div style={{
              background: 'rgba(24,24,27,0.7)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${card.color}30`,
              borderRadius: '0.75rem',
              padding: '0.625rem 0.875rem',
              boxShadow: `0 8px 24px rgba(0,0,0,0.2), 0 0 20px ${card.color}15`,
            }}>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.625rem', marginBottom: '0.125rem' }}>{card.label}</p>
              <p style={{ color: card.color, fontSize: '0.8125rem', fontWeight: 600 }}>{card.value}</p>
            </div>
          </div>
        )
      })}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        {/* Nav */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '1rem 1.25rem' : '1.25rem 2.5rem',
          ...anim('0s'),
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            }}>
              <Wallet size={22} color="white" />
            </div>
            <span style={{
              fontSize: '1.125rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Home Finance</span>
          </div>
          <button
            className="landing-ghost"
            onClick={onLogin}
            style={{ padding: '0.5rem 1.125rem', borderRadius: '0.625rem', fontSize: '0.875rem' }}
          >
            {t('auth.login')}
          </button>
        </nav>

        {/* Hero — 2 coloane pe desktop */}
        <section style={{
          padding: isMobile ? '2rem 1.25rem 2.5rem' : '3rem 2.5rem 4rem',
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: isMobile ? undefined : '1fr 1fr',
          gap: isMobile ? undefined : '3rem',
          alignItems: 'center',
        }}>
          <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 0.875rem', borderRadius: '2rem',
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
              marginBottom: '1.5rem',
              ...anim('0.1s'),
            }}>
              <Sparkles size={14} style={{ color: '#818CF8', animation: visible ? 'landing-orbit 4s linear infinite' : undefined }} />
              <span style={{ color: '#A5B4FC', fontSize: '0.8125rem', fontWeight: 500 }}>
                {t('auth.landing.badge')}
              </span>
            </div>

            <h1 style={{
              fontSize: isMobile ? '2.25rem' : '3.25rem',
              fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.03em',
              marginBottom: '1.25rem', color: '#FAFAFA',
              ...anim('0.2s'),
            }}>
              {t('auth.landing.hero1')}{' '}
              <span style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 50%, #10B981 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: visible ? 'landing-shimmer 4s linear infinite' : undefined,
              }}>{t('auth.landing.hero2')}</span>
            </h1>

            <p style={{
              fontSize: isMobile ? '1rem' : '1.125rem',
              color: '#A1A1AA', lineHeight: 1.65, maxWidth: 520,
              margin: isMobile ? '0 auto 2rem' : '0 0 2rem',
              ...anim('0.35s'),
            }}>
              {t('auth.landing.desc')}
            </p>

            <div style={{
              display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start',
              ...anim('0.45s'),
            }}>
              <button className="landing-cta" onClick={onRegister}
                style={{ padding: '0.875rem 1.75rem', borderRadius: '0.875rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {t('auth.landing.startFree')} <ArrowRight size={18} />
              </button>
              <button className="landing-ghost" onClick={onLogin}
                style={{ padding: '0.875rem 1.5rem', borderRadius: '0.875rem', fontSize: '0.9375rem' }}>
                {t('auth.landing.hasAccount')}
              </button>
            </div>

            {/* Mini stats row */}
            {!isMobile && (
              <div style={{
                display: 'flex', gap: '1.5rem', marginTop: '2.5rem',
                ...anim('0.55s'),
              }}>
                {[
                  { icon: TrendingUp, label: t('auth.landing.free'), sub: t('auth.landing.freeSub') },
                  { icon: Shield, label: t('auth.landing.secure'), sub: t('auth.landing.secureSub') },
                  { icon: Smartphone, label: t('auth.landing.pwa'), sub: t('auth.landing.pwaSub') },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '0.5rem',
                      background: 'rgba(99,102,241,0.12)', color: '#818CF8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p style={{ color: '#E4E4E7', fontSize: '0.8125rem', fontWeight: 600 }}>{label}</p>
                      <p style={{ color: '#52525B', fontSize: '0.6875rem' }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hero preview — dreapta */}
          {!isMobile && (
            <div style={{
              animation: visible ? 'landing-float-card 5s ease-in-out infinite' : undefined,
              ...anim('0.5s'),
            }}>
              <div style={{
                background: 'rgba(24,24,27,0.75)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,102,241,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', fontWeight: 600 }}>Dashboard</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>2026-06 — Rezumatul lunii</p>
                  </div>
                  <div style={{
                    width: 36, height: 36, borderRadius: '0.625rem',
                    background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Wallet size={18} color="white" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'Total lună', value: '2.450 lei', color: '#0EA5E9' },
                    { label: 'Medie/persoană', value: '816 lei', color: '#8B5CF6' },
                    { label: 'Buget folosit', value: '68%', color: '#10B981' },
                    { label: 'Tranzacții', value: '24', color: '#F59E0B' },
                  ].map((s, i) => (
                    <div key={s.label} style={{
                      background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', padding: '0.875rem',
                      animation: visible ? `landing-scale-in 0.5s ease both ${0.6 + i * 0.1}s` : undefined,
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6875rem', marginBottom: '0.25rem' }}>{s.label}</p>
                      <p style={{ color: s.color, fontSize: '1.0625rem', fontWeight: 600 }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', padding: '1rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.625rem' }}>Pe categorii</p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'conic-gradient(#0EA5E9 0% 35%, #8B5CF6 35% 55%, #10B981 55% 75%, #F59E0B 75% 100%)',
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: '#18181B',
                          margin: '24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.5625rem', fontWeight: 600 }}>2.4K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', padding: '1rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.625rem' }}>Zilnic</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem', height: 80, justifyContent: 'center' }}>
                      {[45, 65, 35, 80, 55, 40, 70].map((h, i) => (
                        <div key={i} style={{
                          width: 14, height: `${h}%`,
                          background: 'linear-gradient(to top, #0EA5E9, #6366F1)',
                          borderRadius: '3px 3px 0 0',
                          transformOrigin: 'bottom',
                          animation: visible ? `landing-scale-in 0.4s ease both ${0.9 + i * 0.06}s` : undefined,
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isMobile && (
            <div style={{ marginTop: '2rem', ...anim('0.6s') }}>
              <div style={{
                background: 'rgba(24,24,27,0.75)', borderRadius: '1rem', padding: '1.25rem',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
              }}>
                {[
                  { label: 'Total', value: '2.450 lei', color: '#0EA5E9' },
                  { label: 'Buget', value: '68%', color: '#10B981' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.625rem', padding: '0.75rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6875rem' }}>{s.label}</p>
                    <p style={{ color: s.color, fontSize: '0.9375rem', fontWeight: 600 }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <div style={{ textAlign: 'center', marginBottom: '1rem', ...anim('0.7s') }}>
          <ChevronDown size={24} style={{ color: '#52525B', animation: 'landing-bounce-soft 2s ease infinite' }} />
        </div>

        {/* Features */}
        <section style={{ padding: isMobile ? '2rem 1.25rem' : '3rem 2.5rem 4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem', ...anim('0.1s') }}>
            <h2 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 700, color: '#FAFAFA', marginBottom: '0.75rem' }}>
              {t('auth.landing.featuresTitle')}
            </h2>
            <p style={{ color: '#71717A', fontSize: '0.9375rem', maxWidth: 520, margin: '0 auto' }}>
              {t('auth.landing.featuresDesc')}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '1rem',
          }}>
            {featureKeys.map((f, i) => {
              const Icon = f.icon
              const active = activeFeature === i
              return (
                <div
                  key={f.titleKey}
                  className="landing-feature-card"
                  style={{
                    background: active ? `${f.color}12` : 'rgba(24,24,27,0.6)',
                    border: `1px solid ${active ? `${f.color}40` : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '1rem',
                    padding: isMobile ? '1.25rem' : '1.5rem',
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                    ...anim(f.delay),
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: '0.875rem', flexShrink: 0,
                    background: `${f.color}20`, color: f.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.3s ease',
                    transform: active ? 'scale(1.08)' : 'scale(1)',
                  }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ color: '#F4F4F5', fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem' }}>{t(f.titleKey)}</h3>
                    <p style={{ color: '#A1A1AA', fontSize: '0.875rem', lineHeight: 1.55 }}>{t(f.descKey)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* How it works */}
        <section style={{ padding: isMobile ? '2rem 1.25rem' : '3rem 2.5rem' }}>
          <h2 style={{
            textAlign: 'center', fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: 700, color: '#FAFAFA', marginBottom: '2rem',
          }}>
            {t('auth.landing.howTitle')}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '1.25rem',
          }}>
            {stepKeys.map((s, i) => (
              <div key={s.num} style={{
                textAlign: 'center', padding: '1.5rem 1rem',
                background: 'rgba(24,24,27,0.5)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '1rem',
                ...anim(`${0.1 + i * 0.15}s`),
              }}>
                <div style={{
                  fontSize: '2rem', fontWeight: 700,
                  background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  marginBottom: '0.75rem',
                }}>{s.num}</div>
                <h3 style={{ color: '#F4F4F5', fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem' }}>{t(s.titleKey)}</h3>
                <p style={{ color: '#71717A', fontSize: '0.875rem' }}>{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust badges */}
        <section style={{
          display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center',
          padding: isMobile ? '1.5rem 1.25rem' : '2rem 2.5rem',
          ...anim('0.2s'),
        }}>
          {[
            { icon: Shield, label: t('auth.landing.trust1') },
            { icon: Smartphone, label: t('auth.landing.trust2') },
            { icon: Tags, label: t('auth.landing.trust3') },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: '#71717A', fontSize: '0.8125rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '2rem',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <Icon size={16} style={{ color: '#6366F1' }} />
              {label}
            </div>
          ))}
        </section>

        {/* Final CTA */}
        <section style={{
          textAlign: 'center',
          padding: isMobile ? '2.5rem 1.25rem 3rem' : '4rem 2.5rem 5rem',
          ...anim('0.3s'),
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(99,102,241,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '1.5rem',
            padding: isMobile ? '2rem 1.5rem' : '3rem 2rem',
            maxWidth: 720, margin: '0 auto',
          }}>
            <h2 style={{ fontSize: isMobile ? '1.375rem' : '1.75rem', fontWeight: 700, color: '#FAFAFA', marginBottom: '0.75rem' }}>
              {t('auth.landing.ctaTitle')}
            </h2>
            <p style={{ color: '#A1A1AA', fontSize: '0.9375rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {t('auth.landing.ctaDesc')}
            </p>
            <button className="landing-cta" onClick={onRegister}
              style={{ padding: '0.875rem 2rem', borderRadius: '0.875rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {t('auth.landing.ctaBtn')} <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <footer style={{
          textAlign: 'center', padding: '1.5rem 2.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: '#52525B', fontSize: '0.8125rem',
        }}>
          {t('auth.landing.footer')}
        </footer>
      </div>
    </AuthBackground>
  )
}
