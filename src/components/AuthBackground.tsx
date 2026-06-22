import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  centered?: boolean
}

export default function AuthBackground({ children, centered = false }: Props) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A1A',
      position: 'relative',
      overflow: 'hidden',
      display: centered ? 'flex' : undefined,
      flexDirection: centered ? 'column' : undefined,
    }}>
      <style>{`
        @keyframes auth-float-bg {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        @keyframes auth-float {
          0%, 100% { transform: translateY(0px) }
          50% { transform: translateY(-20px) }
        }
        @keyframes auth-glow-pulse {
          0%, 100% { opacity: 0.4 }
          50% { opacity: 0.7 }
        }
      `}</style>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 20% 25%, rgba(14,165,233,0.08) 0%, transparent 45%), radial-gradient(circle at 80% 75%, rgba(99,102,241,0.08) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(16,185,129,0.04) 0%, transparent 60%)',
        backgroundSize: '200% 200%',
        animation: 'auth-float-bg 12s ease infinite',
      }} />

      <div style={{
        position: 'absolute', width: 420, height: 420, borderRadius: '50%',
        background: 'rgba(14,165,233,0.06)', filter: 'blur(80px)',
        top: '-5%', left: '10%',
        animation: 'auth-float 9s ease infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 380, height: 380, borderRadius: '50%',
        background: 'rgba(99,102,241,0.06)', filter: 'blur(80px)',
        bottom: '5%', right: '8%',
        animation: 'auth-float 11s ease infinite 2s',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 260, height: 260, borderRadius: '50%',
        background: 'rgba(16,185,129,0.05)', filter: 'blur(60px)',
        top: '45%', left: '55%',
        animation: 'auth-glow-pulse 6s ease infinite',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, flex: centered ? 1 : undefined, display: centered ? 'flex' : undefined, flexDirection: centered ? 'column' : undefined }}>
        {children}
      </div>
    </div>
  )
}
