'use client'
import { useState } from 'react'

interface RenewalModalProps {
  clientId: string
  clientName: string
  onClose: () => void
  onSave: () => void
}

export default function RenewalModal({ clientId, clientName, onClose, onSave }: RenewalModalProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!startDate || !endDate) return setError('Ambas fechas son obligatorias')
    setLoading(true)
    setError('')
    const res = await fetch(`/api/clients/${clientId}/renewals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al guardar')
      setLoading(false)
      return
    }
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-2xl w-full max-w-sm" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Registrar renovación</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button>
          </div>
          <p className="text-sm mb-5" style={{ color: '#dfa0ac' }}>{clientName}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Nueva fecha de inicio</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                style={{ background: '#1a0810', border: '1px solid #4a1e2c' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Nueva fecha de fin</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                style={{ background: '#1a0810', border: '1px solid #4a1e2c' }} />
            </div>
            {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm cursor-pointer"
                style={{ background: '#1a0810', border: '1px solid #4a1e2c', color: '#dfa0ac' }}>Cancelar</button>
              <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-bold text-white cursor-pointer"
                style={{ background: loading ? '#5e2230' : '#722F37' }}>
                {loading ? 'Guardando...' : 'Confirmar renovación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
