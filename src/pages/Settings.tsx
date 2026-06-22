import { useState, useRef, useEffect } from 'react'
import {
  Palette, Bell, Database, Globe, Info, Cloud,
  Sun, Moon, Download, Upload, Trash2, RefreshCw, CheckCircle2, Loader2, AlertCircle, LogOut,
} from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { useLocale } from '../context/LocaleContext'
import { markLangManual } from '../utils/detectLocale'
import { useAuth } from '../context/AuthContext'
import { useMediaQuery } from '../utils/useMediaQuery'

export default function Settings() {
  const { state, updateSettings, saveSettings, saveStatus, resetAll, removeExpense, t } = useFinance()
  const { setLang } = useLocale()
  const { logout } = useAuth()
  const isMobile = useMediaQuery('(max-width: 767px)')

  const { settings } = state
  const [resetConfirm, setResetConfirm] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)
  const savedRef = useRef(JSON.stringify(settings))
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setDirty(JSON.stringify(settings) !== savedRef.current)
  }, [settings])

  const handleSave = () => {
    savedRef.current = JSON.stringify(state.settings)
    setDirty(false)
    saveSettings()
  }

  const handleExport = () => {
    const { settings: _, ...data } = state
    const blob = new Blob([JSON.stringify({ ...data, settings: state.settings }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `homefinance_backup_${new Date().toISOString().slice(0, 10)}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.settings) updateSettings(data.settings)
        alert('Setări importate cu succes!')
      } catch { alert('Fișier invalid') }
    }
    input.click()
  }

  const handleClearExpenses = () => {
    state.expenses.forEach(e => removeExpense(e.id))
    setClearConfirm(false)
  }

  const sectionStyle: React.CSSProperties = { marginBottom: '1.5rem' }
  const labelStyle: React.CSSProperties = {
    fontSize: '0.8125rem', fontWeight: 500, color: '#3F3F46', marginBottom: '0.375rem', display: 'block',
  }

  const saveBtnText = () => {
    switch (saveStatus) {
      case 'saving': return 'Se salvează...'
      case 'saved': return 'Salvat'
      case 'error': return 'Eroare'
      default: return 'Salvează în cloud'
    }
  }

  const saveBtnIcon = () => {
    switch (saveStatus) {
      case 'saving': return <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
      case 'saved': return <CheckCircle2 size={16} />
      case 'error': return <AlertCircle size={16} />
      default: return <Cloud size={16} />
    }
  }

  const saveBtnColor = () => {
    switch (saveStatus) {
      case 'saving': return undefined
      case 'saved': return '#10B981'
      case 'error': return '#EF4444'
      default: return undefined
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '1.5rem',             flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0.75rem' : 0 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('settings.title')}</h2>
          <p style={{ color: '#71717a', fontSize: '0.875rem' }}>{t('settings.subtitle')}</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saveStatus === 'saving' || !dirty}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: saveBtnColor() || undefined,
          }}>
          {saveBtnIcon()}
          {saveBtnText()}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* General */}
        <div className="stat-card" style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <Globe size={20} style={{ color: '#3B82F6' }} />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{t('settings.general')}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>{t('settings.currency')}</label>
              <select className="input-field" value={settings.currency}
                onChange={e => updateSettings({ currency: e.target.value })}>
                <option value="lei">Lei (RON)</option>
                <option value="€">Euro (EUR)</option>
                <option value="$">Dolar (USD)</option>
                <option value="£">Liră (GBP)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('settings.dateFormat')}</label>
              <select className="input-field" value={settings.dateFormat}
                onChange={e => updateSettings({ dateFormat: e.target.value })}>
                <option value="YYYY-MM-DD">2026-06-16</option>
                <option value="DD.MM.YYYY">16.06.2026</option>
                <option value="DD/MM/YYYY">16/06/2026</option>
                <option value="MM/DD/YYYY">06/16/2026</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('settings.language')}</label>
              <select className="input-field" value={settings.lang}
                onChange={e => {
                  const lang = e.target.value as 'ro' | 'en'
                  markLangManual()
                  setLang(lang)
                  updateSettings({ lang })
                }}>
                <option value="ro">Română</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('settings.weekStart')}</label>
              <select className="input-field" value={settings.weekStart}
                onChange={e => updateSettings({ weekStart: e.target.value as 'monday' | 'sunday' })}>
                <option value="monday">Luni</option>
                <option value="sunday">Duminică</option>
              </select>
            </div>
          </div>
        </div>

        {/* Display */}
        <div className="stat-card" style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <Palette size={20} style={{ color: '#8B5CF6' }} />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{t('settings.appearance')}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>{t('settings.theme')}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(() => { const ac = settings.accentColor
                  return <>
                    <button onClick={() => updateSettings({ theme: 'light' })}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                        padding: '0.625rem', borderRadius: '0.75rem', border: '1px solid',
                        borderColor: settings.theme === 'light' ? ac : '#e4e4e7',
                        background: settings.theme === 'light' ? `${ac}15` : 'white',
                        color: settings.theme === 'light' ? ac : '#71717a',
                        cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
                      }}>
                      <Sun size={16} /> Light
                    </button>
                    <button onClick={() => updateSettings({ theme: 'dark' })}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                        padding: '0.625rem', borderRadius: '0.75rem', border: '1px solid',
                        borderColor: settings.theme === 'dark' ? ac : '#e4e4e7',
                        background: settings.theme === 'dark' ? `${ac}15` : 'white',
                        color: settings.theme === 'dark' ? ac : '#71717a',
                        cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
                      }}>
                      <Moon size={16} /> Dark
                    </button>
                  </>
                })()}
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('settings.compact')}</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 0', fontSize: '0.875rem' }}>
                <input type="checkbox" checked={settings.compactView}
                  onChange={e => updateSettings({ compactView: e.target.checked })} />
                {t('settings.compact')}
              </label>
            </div>
            <div>
              <label style={labelStyle}>{t('settings.primaryColor')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="color" value={settings.primaryColor}
                  onChange={e => updateSettings({ primaryColor: e.target.value })}
                  style={{ width: 40, height: 40, borderRadius: '0.5rem', border: '1px solid #e4e4e7', padding: 2, cursor: 'pointer', background: 'none' }} />
                <span style={{ fontSize: '0.75rem', color: '#71717a', fontFamily: 'monospace' }}>{settings.primaryColor}</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('settings.accentColor')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="color" value={settings.accentColor}
                  onChange={e => updateSettings({ accentColor: e.target.value })}
                  style={{ width: 40, height: 40, borderRadius: '0.5rem', border: '1px solid #e4e4e7', padding: 2, cursor: 'pointer', background: 'none' }} />
                <span style={{ fontSize: '0.75rem', color: '#71717a', fontFamily: 'monospace' }}>{settings.accentColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="stat-card" style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <Bell size={20} style={{ color: '#F59E0B' }} />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{t('settings.notifications')}</h3>
          </div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={settings.budgetAlert}
                onChange={e => updateSettings({ budgetAlert: e.target.checked })} />
              {t('settings.budgetAlert')}
            </label>
            {settings.budgetAlert && (
              <div>
                <label style={labelStyle}>{t('settings.budgetAlertPct')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input className="input-field" type="range" min="50" max="100"
                    value={settings.budgetAlertPct}
                    onChange={e => updateSettings({ budgetAlertPct: Number(e.target.value) })}
                    style={{ flex: 1, padding: 0, accentColor: settings.accentColor }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '3ch' }}>{settings.budgetAlertPct}%</span>
                </div>
              </div>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={settings.dailyReminder}
                onChange={e => updateSettings({ dailyReminder: e.target.checked })} />
              {t('settings.dailyReminder')}
            </label>
          </div>
        </div>

        {/* Data */}
        <div className="stat-card" style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <Database size={20} style={{ color: '#10B981' }} />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{t('settings.data')}</h3>
          </div>
          <p style={{ color: '#71717a', fontSize: '0.8125rem', marginBottom: '1rem' }}>{t('settings.dataDesc')}</p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={handleExport}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Download size={16} /> {t('settings.export')}
            </button>
            <button className="btn-secondary" onClick={handleImport}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Upload size={16} /> {t('settings.import')}
            </button>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '1.25rem 0' }} />

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {!clearConfirm ? (
              <button className="btn-danger" onClick={() => setClearConfirm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', alignSelf: 'flex-start' }}>
                <Trash2 size={16} /> {t('settings.clearExpenses')}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', background: '#fef2f2', flexWrap: 'wrap' }}>
                <p style={{ fontSize: '0.8125rem', color: '#ef4444', flex: '1 1 100%' }}>{t('settings.clearConfirm')}</p>
                <button className="btn-danger" onClick={handleClearExpenses} style={{ fontSize: '0.8125rem' }}>{t('settings.yesDelete')}</button>
                <button className="btn-secondary" onClick={() => setClearConfirm(false)} style={{ fontSize: '0.8125rem' }}>{t('form.cancel')}</button>
              </div>
            )}

            {!resetConfirm ? (
              <button className="btn-danger" onClick={() => setResetConfirm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', alignSelf: 'flex-start' }}>
                <RefreshCw size={16} /> {t('settings.resetAll')}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', background: '#fef2f2', flexWrap: 'wrap' }}>
                <p style={{ fontSize: '0.8125rem', color: '#ef4444', flex: '1 1 100%' }}>{t('settings.resetConfirm')}</p>
                <button className="btn-danger" onClick={() => { resetAll(); setResetConfirm(false) }} style={{ fontSize: '0.8125rem' }}>{t('settings.yesReset')}</button>
                <button className="btn-secondary" onClick={() => setClearConfirm(false)} style={{ fontSize: '0.8125rem' }}>{t('form.cancel')}</button>
              </div>
            )}
          </div>
        </div>

        {/* About */}
        <div className="stat-card" style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <Info size={20} style={{ color: '#6B7280' }} />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{t('settings.about')}</h3>
          </div>
          <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.8125rem', color: '#52525b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}>
              <span style={{ color: '#71717a' }}>{t('settings.version')}</span>
              <span style={{ fontWeight: 500 }}>1.0.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}>
              <span style={{ color: '#71717a' }}>{t('settings.storage')}</span>
              <span style={{ fontWeight: 500 }}>Appwrite Cloud</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}>
              <span style={{ color: '#71717a' }}>{t('common.transactions')}</span>
              <span style={{ fontWeight: 500 }}>{state.expenses.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}>
              <span style={{ color: '#71717a' }}>{t('common.members')}</span>
              <span style={{ fontWeight: 500 }}>{state.members.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}>
              <span style={{ color: '#71717a' }}>{t('common.categories')}</span>
              <span style={{ fontWeight: 500 }}>{state.categories.length}</span>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="stat-card" style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <LogOut size={20} style={{ color: '#EF4444' }} />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{t('settings.account')}</h3>
          </div>
          <p style={{ color: '#71717a', fontSize: '0.8125rem', marginBottom: '1rem' }}>{t('settings.accountDesc')}</p>
          <button className="btn-danger" onClick={async () => { await saveSettings(); logout() }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <LogOut size={16} /> {t('settings.logout')}
          </button>
        </div>
      </div>
    </div>
  )
}
