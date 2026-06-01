'use client'
import { useState } from 'react'

interface SelfTaskModalProps {
  onClose: () => void
  onSave: () => void
}

export default function SelfTaskModal({ onClose, onSave }: SelfTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [durationDays, setDurationDays] = useState('0')
  const [durationHours, setDurationHours] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError('El título es obligatorio')
    if (parseInt(durationDays) === 0 && parseInt(durationHours) === 0) {
      return setError('Definí una duración mayor a 0')
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/tasks/self', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        durationDays: parseInt(durationDays) || 0,
        durationHours: parseInt(durationHours) || 0,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al crear la tarea')
      setLoading(false)
      return
    }

    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-2xl w-full max-w-md" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Nueva tarea propia</h2>
              <p className="text-xs mt-0.5" style={{ color: '#a85060' }}>Se asignará automáticamente a vos</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}
                placeholder="¿Qué tenés que hacer?"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none resize-none"
                style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}
                placeholder="Detalles opcionales..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Prioridad</label>
              <div className="flex gap-2">
                {[
                  { value: 'LOW', label: 'Baja', color: '#4ade80' },
                  { value: 'MEDIUM', label: 'Media', color: '#eab308' },
                  { value: 'HIGH', label: 'Alta', color: '#ef4444' },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all"
                    style={{
                      background: priority === p.value ? `${p.color}22` : '#1a0810',
                      border: `1px solid ${priority === p.value ? p.color : '#4a1e2c'}`,
                      color: priority === p.value ? p.color : '#dfa0ac',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>¿Cuánto tiempo tenés?</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-white outline-none text-center"
                    style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}
                  />
                  <p className="text-xs text-center mt-1" style={{ color: '#a85060' }}>Días</p>
                </div>
                <div className="flex items-center text-white font-bold pb-5">:</div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-white outline-none text-center"
                    style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}
                  />
                  <p className="text-xs text-center mt-1" style={{ color: '#a85060' }}>Horas</p>
                </div>
              </div>
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
                {loading ? 'Creando...' : 'Crear tarea'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
