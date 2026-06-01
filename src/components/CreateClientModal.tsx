'use client'
import { useState } from 'react'

interface User {
  id: string
  name: string
}

interface Client {
  id: string
  name: string
  isActive: boolean
  leftService: boolean
  followersStart: number | null
  startDate: string | null
  endDate: string | null
  instagramUrl: string | null
  tiktokUrl: string | null
  contentSheetUrl: string | null
  scriptDocUrl: string | null
  notes: string | null
  country: string | null
  source: string | null
  ddmUserId: string | null
}

interface CreateClientModalProps {
  editClient?: Client | null
  users: User[]
  onClose: () => void
  onSave: () => void
}

function toDateInputValue(isoString: string | null): string {
  if (!isoString) return ''
  return isoString.slice(0, 10)
}

export default function CreateClientModal({ editClient, users, onClose, onSave }: CreateClientModalProps) {
  const [name, setName] = useState(editClient?.name || '')
  const [status, setStatus] = useState<'active' | 'inactive' | 'left'>(
    editClient?.leftService ? 'left' : editClient !== null && editClient !== undefined && !editClient.isActive ? 'inactive' : 'active'
  )
  const [followersStart, setFollowersStart] = useState(editClient?.followersStart != null ? String(editClient.followersStart) : '')
  const [startDate, setStartDate] = useState(toDateInputValue(editClient?.startDate ?? null))
  const [endDate, setEndDate] = useState(toDateInputValue(editClient?.endDate ?? null))
  const [instagramUrl, setInstagramUrl] = useState(editClient?.instagramUrl || '')
  const [tiktokUrl, setTiktokUrl] = useState(editClient?.tiktokUrl || '')
  const [contentSheetUrl, setContentSheetUrl] = useState(editClient?.contentSheetUrl || '')
  const [scriptDocUrl, setScriptDocUrl] = useState(editClient?.scriptDocUrl || '')
  const [notes, setNotes] = useState(editClient?.notes || '')
  const [country, setCountry] = useState(editClient?.country || '')
  const [source, setSource] = useState(editClient?.source || '')
  const [ddmUserId, setDdmUserId] = useState(editClient?.ddmUserId || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('El nombre es obligatorio')

    setLoading(true)
    setError('')

    const payload = {
      name: name.trim(),
      isActive: status === 'active',
      leftService: status === 'left',
      followersStart: followersStart ? parseInt(followersStart) : null,
      startDate: startDate || null,
      endDate: endDate || null,
      instagramUrl: instagramUrl.trim() || null,
      tiktokUrl: tiktokUrl.trim() || null,
      contentSheetUrl: contentSheetUrl.trim() || null,
      scriptDocUrl: scriptDocUrl.trim() || null,
      notes: notes.trim() || null,
      country: country.trim() || null,
      source: source || null,
      ddmUserId: ddmUserId || null,
    }

    const url = editClient ? `/api/clients/${editClient.id}` : '/api/clients'
    const method = editClient ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al guardar')
      setLoading(false)
      return
    }

    onSave()
  }

  const inputStyle = {
    background: '#1a0810',
    border: '1px solid #4a1e2c',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editClient ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Nombre *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                style={inputStyle}
                placeholder="Nombre del cliente"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Estado</label>
              <div className="flex gap-2">
                {[
                  { value: 'active', label: 'Activo', color: '#4ade80' },
                  { value: 'inactive', label: 'Inactivo', color: '#eab308' },
                  { value: 'left', label: 'Abandonó', color: '#ef4444' },
                ].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value as any)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all"
                    style={{
                      background: status === s.value ? `${s.color}22` : '#1a0810',
                      border: `1px solid ${status === s.value ? s.color : '#4a1e2c'}`,
                      color: status === s.value ? s.color : '#dfa0ac',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seguidores al inicio */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Seguidores al inicio</label>
              <input
                type="number"
                min="0"
                value={followersStart}
                onChange={(e) => setFollowersStart(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                style={inputStyle}
                placeholder="Ej: 5000"
              />
            </div>

            {/* Fechas */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Fecha de inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                  style={inputStyle}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Fecha de finalización</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Instagram URL */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Instagram URL</label>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                style={inputStyle}
                placeholder="https://instagram.com/..."
              />
            </div>

            {/* TikTok URL */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>TikTok URL</label>
              <input
                type="text"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                style={inputStyle}
                placeholder="https://tiktok.com/@..."
              />
            </div>

            {/* Google Sheets */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Google Sheets de contenido</label>
              <input
                type="text"
                value={contentSheetUrl}
                onChange={(e) => setContentSheetUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                style={inputStyle}
                placeholder="https://docs.google.com/spreadsheets/..."
              />
            </div>

            {/* Documento de guiones */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Documento de guiones</label>
              <input
                type="text"
                value={scriptDocUrl}
                onChange={(e) => setScriptDocUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                style={inputStyle}
                placeholder="https://docs.google.com/document/..."
              />
            </div>

            {/* DDM responsable */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>DDM responsable</label>
              <select
                value={ddmUserId}
                onChange={(e) => setDdmUserId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none cursor-pointer"
                style={inputStyle}
              >
                <option value="">Sin asignar</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Fuente */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>¿De dónde vino?</label>
              <select value={source} onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none cursor-pointer" style={inputStyle}>
                <option value="">Sin especificar</option>
                <option value="Referido">Referido</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="YouTube">YouTube</option>
                <option value="Llamada en frío">Llamada en frío</option>
                <option value="Prospección en frío">Prospección en frío</option>
                <option value="Email marketing">Email marketing</option>
                <option value="Webinar / Evento">Webinar / Evento</option>
                <option value="Vproject">Vproject</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>País</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none" style={inputStyle}
                placeholder="Ej: España, Argentina..." />
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Notas</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none resize-none"
                style={inputStyle}
                placeholder="Notas adicionales sobre el cliente..."
              />
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm text-red-200" style={{ background: '#4a1e2c' }}>
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer"
                style={{ background: '#1a0810', border: '1px solid #4a1e2c', color: '#dfa0ac' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white cursor-pointer"
                style={{ background: loading ? '#5e2230' : '#722F37' }}
              >
                {loading ? 'Guardando...' : editClient ? 'Guardar cambios' : 'Crear cliente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
