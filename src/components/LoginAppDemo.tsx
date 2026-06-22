import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  LayoutDashboard, Receipt, PiggyBank, Tags, Users, Wallet, Plus,
} from 'lucide-react'
import { useLocale } from '../context/LocaleContext'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
const PAUSE_MS = 2000
const MOVE_MS = 700
const CLICK_MS = 350

type ViewId = 'sidebar-dash' | 'sidebar-expenses' | 'sidebar-budget' | 'sidebar-categories' | 'sidebar-members'

const viewOrder: ViewId[] = [
  'sidebar-dash',
  'sidebar-expenses',
  'sidebar-budget',
  'sidebar-categories',
  'sidebar-members',
]

const navItems: { id: ViewId; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'sidebar-dash', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'sidebar-expenses', icon: Receipt, label: 'Cheltuieli' },
  { id: 'sidebar-budget', icon: PiggyBank, label: 'Buget' },
  { id: 'sidebar-categories', icon: Tags, label: 'Categorii' },
  { id: 'sidebar-members', icon: Users, label: 'Membri' },
]

const viewTitles: Record<ViewId, { title: string; subtitle: string }> = {
  'sidebar-dash': { title: 'Dashboard', subtitle: '2026-06 — Rezumatul lunii' },
  'sidebar-expenses': { title: 'Cheltuieli', subtitle: '12 tranzacții — 2.450 lei total' },
  'sidebar-budget': { title: 'Buget lunar', subtitle: '2026-06 — limite pe categorii' },
  'sidebar-categories': { title: 'Categorii', subtitle: '11 categorii active' },
  'sidebar-members': { title: 'Membri', subtitle: '2 membri — decontări' },
}

function DemoHeader({ viewId }: { viewId: ViewId }) {
  const { title, subtitle } = viewTitles[viewId]
  return (
    <div data-demo="content-header" style={{ marginBottom: '0.75rem' }}>
      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8125rem', fontWeight: 600 }}>{title}</p>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.625rem' }}>{subtitle}</p>
    </div>
  )
}

function DashboardView() {
  return (
    <div style={{ animation: 'demo-view-in 0.35s ease both' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem', marginBottom: '0.625rem' }}>
        {[
          { label: 'Total', value: '2.450', unit: 'lei', color: '#0EA5E9' },
          { label: 'Medie', value: '816', unit: 'lei', color: '#8B5CF6' },
          { label: 'Săpt.', value: '580', unit: 'lei', color: '#10B981' },
          { label: 'Nr.', value: '12', unit: 'tranz.', color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', padding: '0.5rem 0.625rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.5625rem' }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: '0.75rem', fontWeight: 600 }}>
              {s.value} <span style={{ fontSize: '0.5625rem', fontWeight: 400 }}>{s.unit}</span>
            </p>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', padding: '0.5rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.5625rem', marginBottom: '0.375rem' }}>Pe categorii</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'conic-gradient(#0EA5E9 0% 35%, #8B5CF6 35% 55%, #10B981 55% 75%, #F59E0B 75% 100%)',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#18181B',
                margin: '15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.4375rem', fontWeight: 600 }}>2.4K</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', padding: '0.5rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.5625rem', marginBottom: '0.375rem' }}>Zilnic</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 52, justifyContent: 'center' }}>
            {[45, 65, 35, 80, 55, 40, 70].map((h, i) => (
              <div key={i} style={{
                width: 10, height: `${h}%`,
                background: 'linear-gradient(to top, #0EA5E9, #6366F1)',
                borderRadius: '2px 2px 0 0', transformOrigin: 'bottom',
                animation: `demo-bar-grow 0.5s ease both ${i * 0.08}s`,
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ExpensesView() {
  const rows = [
    { desc: 'Cumpărături Kaufland', cat: 'Mâncare', who: 'Andrei', amt: '245 lei', color: '#F97316' },
    { desc: 'Factură electricitate', cat: 'Utilități', who: 'Maria', amt: '180 lei', color: '#EAB308' },
    { desc: 'Benzină', cat: 'Transport', who: 'Andrei', amt: '320 lei', color: '#8B5CF6' },
    { desc: 'Netflix', cat: 'Divertisment', who: 'Maria', amt: '65 lei', color: '#EC4899' },
    { desc: 'Farmacie', cat: 'Sănătate', who: 'Andrei', amt: '95 lei', color: '#EF4444' },
  ]
  return (
    <div style={{ animation: 'demo-view-in 0.35s ease both' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '0.5rem', padding: '0.375rem 0.5rem',
        background: 'rgba(99,102,241,0.1)', borderRadius: '0.375rem',
        border: '1px solid rgba(99,102,241,0.2)',
      }}>
        <span style={{ color: '#A5B4FC', fontSize: '0.5625rem', fontWeight: 500 }}>Adaugă cheltuieli rapid</span>
        <div style={{
          width: 20, height: 20, borderRadius: '0.375rem',
          background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Plus size={12} color="white" />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {rows.map((e, i) => (
          <div key={e.desc} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.375rem 0.5rem', borderRadius: '0.375rem',
            background: 'rgba(255,255,255,0.03)',
            animation: `demo-view-in 0.3s ease both ${0.05 + i * 0.06}s`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.5625rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.desc}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.5rem' }}>{e.cat} · {e.who}</p>
              </div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.5625rem', fontWeight: 600, flexShrink: 0 }}>{e.amt}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BudgetView() {
  const items = [
    { name: 'Mâncare', spent: 845, budget: 1000, color: '#F97316' },
    { name: 'Utilități', spent: 420, budget: 500, color: '#EAB308' },
    { name: 'Transport', spent: 320, budget: 400, color: '#8B5CF6' },
    { name: 'Divertisment', spent: 180, budget: 200, color: '#EC4899' },
  ]
  return (
    <div style={{ animation: 'demo-view-in 0.35s ease both' }}>
      <div style={{
        padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '0.5rem',
        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5625rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>
          <span>Total cheltuit</span><span style={{ color: '#10B981', fontWeight: 600 }}>1.765 / 2.100 lei</span>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: '84%', height: '100%', background: 'linear-gradient(90deg, #10B981, #0EA5E9)', borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {items.map((b, i) => {
          const pct = Math.round(b.spent / b.budget * 100)
          const over = pct >= 90
          return (
            <div key={b.name} style={{
              padding: '0.375rem 0.5rem', borderRadius: '0.375rem',
              background: 'rgba(255,255,255,0.03)',
              animation: `demo-view-in 0.3s ease both ${0.05 + i * 0.07}s`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5625rem', marginBottom: '0.2rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{b.name}</span>
                <span style={{ color: over ? '#F87171' : '#10B981' }}>{pct}%</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: over ? '#EF4444' : b.color,
                  borderRadius: 2, transition: 'width 0.6s ease',
                }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.5rem', marginTop: '0.125rem' }}>
                {b.spent} / {b.budget} lei
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CategoriesView() {
  const cats = [
    { icon: '🍕', name: 'Mâncare', count: 8, color: '#F97316' },
    { icon: '⚡', name: 'Utilități', count: 3, color: '#EAB308' },
    { icon: '🏠', name: 'Chirie', count: 1, color: '#3B82F6' },
    { icon: '🚗', name: 'Transport', count: 4, color: '#8B5CF6' },
    { icon: '🎬', name: 'Divertisment', count: 2, color: '#EC4899' },
    { icon: '💊', name: 'Sănătate', count: 2, color: '#EF4444' },
  ]
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem',
      animation: 'demo-view-in 0.35s ease both',
    }}>
      {cats.map((c, i) => (
        <div key={c.name} style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.5rem', borderRadius: '0.5rem',
          background: `${c.color}10`, border: `1px solid ${c.color}25`,
          animation: `demo-view-in 0.3s ease both ${0.04 + i * 0.06}s`,
        }}>
          <span style={{ fontSize: '0.875rem' }}>{c.icon}</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.5625rem', fontWeight: 500 }}>{c.name}</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.5rem' }}>{c.count} cheltuieli</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function MembersView() {
  const members = [
    { name: 'Andrei', initial: 'A', color: '#3B82F6', paid: '1.120 lei', owes: 'de primit 115 lei' },
    { name: 'Maria', initial: 'M', color: '#EC4899', paid: '890 lei', owes: 'de plătit 115 lei' },
  ]
  return (
    <div style={{ animation: 'demo-view-in 0.35s ease both' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.5rem' }}>
        {members.map((m, i) => (
          <div key={m.name} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem', borderRadius: '0.5rem',
            background: 'rgba(255,255,255,0.03)',
            animation: `demo-view-in 0.3s ease both ${0.05 + i * 0.08}s`,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: m.color, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6875rem', fontWeight: 600, flexShrink: 0,
            }}>{m.initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.625rem', fontWeight: 600 }}>{m.name}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.5rem' }}>A plătit {m.paid}</p>
            </div>
            <span style={{
              fontSize: '0.5rem', fontWeight: 500,
              color: m.name === 'Andrei' ? '#10B981' : '#F59E0B',
            }}>{m.owes}</span>
          </div>
        ))}
      </div>
      <div style={{
        padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
        animation: 'demo-view-in 0.3s ease both 0.2s',
      }}>
        <p style={{ color: '#A5B4FC', fontSize: '0.5625rem', fontWeight: 600, marginBottom: '0.25rem' }}>Decontare sugerată</p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.5625rem' }}>
          Maria plătește <span style={{ color: '#818CF8', fontWeight: 600 }}>115 lei</span> către Andrei
        </p>
      </div>
    </div>
  )
}

const views: Record<ViewId, ReactNode> = {
  'sidebar-dash': <DashboardView />,
  'sidebar-expenses': <ExpensesView />,
  'sidebar-budget': <BudgetView />,
  'sidebar-categories': <CategoriesView />,
  'sidebar-members': <MembersView />,
}

const tooltips: Record<ViewId, string> = {
  'sidebar-dash': 'auth.demo.tip.dash',
  'sidebar-expenses': 'auth.demo.tip.expenses',
  'sidebar-budget': 'auth.demo.tip.budget',
  'sidebar-categories': 'auth.demo.tip.categories',
  'sidebar-members': 'auth.demo.tip.members',
}

export default function LoginAppDemo() {
  const { t } = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(true)
  const [cursorPos, setCursorPos] = useState({ x: 26, y: 80 })
  const [tooltip, setTooltip] = useState({ text: '', visible: false })
  const [clicking, setClicking] = useState(false)
  const [highlightedNav, setHighlightedNav] = useState<ViewId | null>(null)
  const [cursorVisible, setCursorVisible] = useState(false)
  const [activeNav, setActiveNav] = useState<ViewId>('sidebar-dash')
  const [viewKey, setViewKey] = useState(0)

  const getPos = useCallback((selector: string) => {
    const container = containerRef.current
    if (!container) return null
    const el = container.querySelector(selector) as HTMLElement | null
    if (!el) return null
    const cr = container.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    return {
      x: er.left - cr.left + er.width / 2,
      y: er.top - cr.top + er.height / 2,
    }
  }, [])

  const runDemo = useCallback(async () => {
    await delay(800)
    if (!activeRef.current) return
    setCursorVisible(true)

    let currentIdx = 0
    const showView = (id: ViewId) => {
      setActiveNav(id)
      setViewKey(k => k + 1)
      setTooltip({ text: t(tooltips[id]), visible: true })
      setHighlightedNav(null)
      const contentPos = getPos('[data-demo="content-area"]')
      if (contentPos) setCursorPos(contentPos)
    }

    showView(viewOrder[0])
    await delay(PAUSE_MS)

    while (activeRef.current) {
      setTooltip({ text: '', visible: false })

      const nextIdx = (currentIdx + 1) % viewOrder.length
      const nextId = viewOrder[nextIdx]

      const navPos = getPos(`[data-demo="${nextId}"]`)
      if (navPos) setCursorPos(navPos)
      await delay(MOVE_MS)
      if (!activeRef.current) break

      setHighlightedNav(nextId)
      setClicking(true)
      await delay(CLICK_MS)
      setClicking(false)

      showView(nextId)
      currentIdx = nextIdx
      await delay(PAUSE_MS)
    }
  }, [getPos, t])

  useEffect(() => {
    runDemo()
    return () => { activeRef.current = false }
  }, [runDemo])

  return (
    <div style={{ width: '100%', maxWidth: 580 }}>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#FAFAFA', fontSize: '0.9375rem', fontWeight: 600 }}>{t('auth.demo.live')}</p>
          <p style={{ color: '#71717A', fontSize: '0.75rem' }}>{t('auth.demo.subtitle')}</p>
        </div>
        {cursorVisible && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '2rem', padding: '0.25rem 0.625rem',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse 1.5s ease infinite' }} />
            <span style={{ color: '#6EE7B7', fontSize: '0.6875rem', fontWeight: 500 }}>{t('auth.demo.active')}</span>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          background: 'rgba(24,24,27,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          animation: 'scaleIn 0.5s ease both',
        }}
      >
        <style>{`
          @keyframes demo-click-ripple {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.7 }
            100% { transform: translate(-50%, -50%) scale(3); opacity: 0 }
          }
          @keyframes demo-tooltip-in {
            from { opacity: 0; transform: translateY(4px) scale(0.95) }
            to { opacity: 1; transform: translateY(0) scale(1) }
          }
          @keyframes demo-bar-grow {
            from { transform: scaleY(0) }
            to { transform: scaleY(1) }
          }
          @keyframes demo-view-in {
            from { opacity: 0; transform: translateY(6px) }
            to { opacity: 1; transform: translateY(0) }
          }
        `}</style>

        <div style={{ display: 'flex', minHeight: 340 }}>
          <div style={{
            width: 52, background: '#18181B', borderRight: '1px solid rgba(255,255,255,0.06)',
            padding: '0.625rem 0.375rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '0.5rem', margin: '0 auto 0.5rem',
              background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Wallet size={14} color="white" />
            </div>
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = activeNav === item.id
              const isHighlighted = highlightedNav === item.id
              return (
                <div
                  key={item.id}
                  data-demo={item.id}
                  style={{
                    width: 36, height: 36, borderRadius: '0.5rem', margin: '0 auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isHighlighted
                      ? 'rgba(99,102,241,0.4)'
                      : isActive ? 'rgba(99,102,241,0.25)' : 'transparent',
                    color: isActive || isHighlighted ? '#A5B4FC' : '#52525B',
                    boxShadow: isHighlighted ? '0 0 16px rgba(99,102,241,0.5)' : 'none',
                    transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <Icon size={16} />
                </div>
              )
            })}
          </div>

          <div
            data-demo="content-area"
            style={{ flex: 1, padding: '0.875rem', overflow: 'hidden', position: 'relative' }}
          >
            <DemoHeader viewId={activeNav} />
            <div key={viewKey}>
              {views[activeNav]}
            </div>
          </div>
        </div>

        {cursorVisible && (
          <>
            <div style={{
              position: 'absolute',
              left: cursorPos.x,
              top: cursorPos.y,
              width: 40, height: 40, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
              transition: `left ${MOVE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), top ${MOVE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
              pointerEvents: 'none', zIndex: 20,
            }} />
            <div style={{
              position: 'absolute',
              left: cursorPos.x,
              top: cursorPos.y,
              transform: 'translate(-2px, -2px)',
              transition: `left ${MOVE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), top ${MOVE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
              pointerEvents: 'none', zIndex: 21,
              filter: 'drop-shadow(0 2px 4px rgba(99,102,241,0.5))',
            }}>
              <svg width="18" height="24" viewBox="0 0 22 30" fill="none">
                <path d="M3 2L16 15H10L7 20L4 15H3V2Z" fill={clicking ? '#C7D2FE' : 'white'} stroke="#6366F1" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              {clicking && (
                <div style={{
                  position: 'absolute', left: 6, top: 10, width: 6, height: 6, borderRadius: '50%',
                  background: 'rgba(99,102,241,0.5)',
                  animation: 'demo-click-ripple 0.45s ease-out forwards',
                }} />
              )}
            </div>

            {tooltip.visible && (
              <div style={{
                position: 'absolute',
                left: Math.min(Math.max(cursorPos.x - 60, 60), 400),
                top: Math.max(cursorPos.y - 44, 8),
                zIndex: 22, pointerEvents: 'none',
                animation: 'demo-tooltip-in 0.2s ease both',
                maxWidth: 200,
              }}>
                <div style={{
                  background: '#18181B', border: '1px solid rgba(99,102,241,0.4)',
                  borderRadius: '0.5rem', padding: '0.375rem 0.625rem',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                }}>
                  <p style={{ color: '#E4E4E7', fontSize: '0.6875rem', lineHeight: 1.35, margin: 0, fontWeight: 500 }}>{tooltip.text}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
