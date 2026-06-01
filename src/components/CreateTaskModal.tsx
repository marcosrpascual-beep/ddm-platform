'use client'
import { useState } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  durationDays: number
  durationHours: number
  assignments: { userId: string }[]
}

interface CreateTaskModalProps {
  users: User[]
  editTask?: Task | null
  onClose: () => void
  onSave: () => void
}

export default function CreateTaskModal({ users, editTask, onClose, onSave }: CreateTaskModalProps) {
  const [title, setTitle] = useState(editTask?.title || '')
  const [description, setDescription] = useState(editTask?.description || '')
  const [priority, setPriority] = useState(editTask?.priority || 'MEDIUM')
  const [durationDays, setDurationDays] = useState(String(editTask?.durationDays || 0))
  const [durationHours, setDurationHours] = useState(String(editTask?.durationHours || 0))
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    editTask?.assignments?.map((a) => a.userId) || []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleUser(id: string) {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError('El título es obligatorio')
    if (selectedUsers.length === 0) return setError('Seleccioná al menos un miembro')
    if (parseInt(durationDays) === 0 && parseInt(durationHours) === 0) {
      return setError('Definí una duración mayor a 0')
    }

    setLoading(true)
    setError('')

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      durationDays: parseInt(durationDays) || 0,
      durationHours: parseInt(durationHours) || 0,
      assigneeIds: selectedUsers,
    }

    const url = editTask ? `/api/tasks/${editTask.id}` : '/api/tasks'
    const method = editTask ? 'PUT' : 'POST'

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editTask ? 'Editar Tarea' : 'Nueva Tarea'}
            </h2>
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
                placeholder="Ej: Crear contenido para Instagram"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg text-white outline-none resize-none"
                style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}
                placeholder="Detalles de la tarea..."
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
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Duración del tiempo</label>
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

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#dfa0ac' }}>
                Asignar a *
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {users.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all"
                    style={{
                      background: selectedUsers.includes(u.id) ? '#4a1e2c' : '#1a0810',
                      border: `1px solid ${selectedUsers.includes(u.id) ? '#722F37' : '#4a1e2c'}`,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: selectedUsers.includes(u.id) ? '#722F37' : 'transparent', border: `2px solid ${selectedUsers.includes(u.id) ? '#722F37' : '#722F37'}` }}
                    >
                      {selectedUsers.includes(u.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedUsers.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      <p className="text-xs" style={{ color: '#a85060' }}>{u.email}</p>
                    </div>
                  </label>
                ))}
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
                {loading ? 'Guardando...' : editTask ? 'Guardar cambios' : 'Crear tarea'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
