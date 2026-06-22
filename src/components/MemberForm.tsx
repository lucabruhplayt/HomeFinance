import { useState } from 'react'
import { X, Image, Palette, Loader2 } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'
import { storage, ID, APPWRITE_BUCKET_ID } from '../lib/appwrite'

const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#D946EF']

interface Props {
  onClose: () => void
}

export default function MemberForm({ onClose }: Props) {
  const { state, addMember, t } = useFinance()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState('')
  const [photoId, setPhotoId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [color, setColor] = useState(COLORS[state.members.length % COLORS.length])

  const handleFile = async (file: File) => {
    if (!user) {
      const reader = new FileReader()
      reader.onload = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
      return
    }
    setUploading(true)
    try {
      const res = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), file)
      const url = storage.getFileView(APPWRITE_BUCKET_ID, res.$id).toString()
      setPhoto(url)
      setPhotoId(res.$id)
    } catch {
      const reader = new FileReader()
      reader.onload = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = name.trim()
    if (!val) return
    addMember({
      name: val,
      color,
      avatar: val[0].toUpperCase(),
      photo: photo || undefined,
      photoId: photoId || undefined,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{t('members.add')}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label>{t('members.name')}</label>
            <input className="input-field" type="text" required autoFocus
              value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Ion Popescu" />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Image size={14} /> {t('members.photo')}
            </label>
            <input className="input-field" type="file" accept="image/*" disabled={uploading}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
              style={{ padding: '0.5rem 1rem' }} />
            {uploading && (
              <div style={{ marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#71717a' }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Se încarcă...
              </div>
            )}
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>{t('members.orUrl')}</span>
              <input className="input-field" type="text"
                value={photo} onChange={e => { setPhoto(e.target.value); setPhotoId('') }} placeholder="https://example.com/poza.jpg"
                style={{ flex: 1 }} />
            </div>
            {photo && (
              <div style={{ marginTop: '0.75rem', width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--glass-border)' }}>
                <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Palette size={14} /> {t('members.color')}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', border: '2px solid',
                    borderColor: c === color ? c : 'transparent',
                    background: c, cursor: 'pointer', outline: c === color ? `3px solid ${c}40` : 'none',
                    transition: 'all 0.2s',
                  }} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: 600 }}>
              {name ? name[0].toUpperCase() : '?'}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#71717a' }}>
              {t('members.preview')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>{t('form.cancel')}</button>
            <button type="submit" className="btn-primary" disabled={uploading}>{t('members.add')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
