'use client'
import { useState } from 'react'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  whatsappApiKey: string | null
  isActive: boolean
}

interface CreateUserModalProps {
  editUser?: UserData | null
  onClose: () => void
  onSave: () => void
}

export default function CreateUserModal({ editUser, onClose, onSave }: CreateUserModalProps) {
  const [name, setName] = useState(editUser?.name || '')
  const [email, setEmail] = useState(editUser?.email || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(editUser?.role || 'EMPLOYEE')
  const [phone, setPhone] = useState(editUser?.phone || '')
  const [whatsappApiKey, setWhatsappApiKey] = useState(editUser?.whatsappApiKey || '')
  const [isActive, setIsActive] = useState(editUser?.isActive !== false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showWAInstructions, setShowWAInstructions] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return setError('Nombre y email son obligatorios')
    if (!editUser && !password.trim()) return setError('La contraseña es obligatoria para usuarios nuevos')

    setLoading(true)
    setError('')

    const payload: any = {
      name: name.trim(),
      email: email.trim(),
      role,
      phone: phone.trim() || null,
      whatsappApiKey: whatsappApiKey.trim() || null,
      isActive,
    }

    if (password.trim()) payload.password = password.trim()

    const url = editUser ? `/api/users/${editUser.id}` : '/api/users'
    const method = editUser ? 'PUT' : 'POST'

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
              {editUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Nombre completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                  style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}
                  placeholder="Nombre Apellido"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                  style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}
                  placeholder="empleado@gmail.com"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>
                  Contraseña {editUser ? '(dejar vacío para no cambiar)' : '*'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-white outline-none"
                  style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}
                  placeholder={editUser ? 'Nueva contraseña (opcional)' : 'Contraseña inicial'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#dfa0ac' }}>Rol</label>
              <div className="flex gap-2">
                {[
                  { value: 'EMPLOYEE', label: 'Miembro' },
                  { value: 'ADMIN', label: 'Administrador' },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all"
                    style={{
                      background: role === r.value ? '#4a1e2c' : '#1a0810',
                      border: `1px solid ${role === r.value ? '#722F37' : '#4a1e2c'}`,
                      color: role === r.value ? 'white' : '#dfa0ac',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp section */}
            <div className="rounded-xl p-4" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-white">Notificaciones WhatsApp</p>
                <button
                  type="button"
                  onClick={() => setShowWAInstructions(!showWAInstructions)}
                  className="text-xs cursor-pointer px-2 py-1 rounded"
                  style={{ color: '#c9a227', background: '#c9a22711' }}
                >
                  {showWAInstructions ? 'Ocultar' : '¿Cómo activar?'}
                </button>
              </div>

              {showWAInstructions && (
                <div className="mb-3 rounded-lg p-3 text-xs" style={{ background: '#2d1520', color: '#dfa0ac' }}>
                  <p className="font-bold text-white mb-1">Para activar WhatsApp (CallMeBot):</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>El empleado debe agregar +34 644 59 97 09 a sus contactos de WhatsApp</li>
                    <li>Enviar el mensaje: <code style={{ color: '#c9a227' }}>I allow callmebot to send me messages</code></li>
                    <li>Recibirá su API key por WhatsApp</li>
                    <li>Pegar esa API key aquí abajo</li>
                  </ol>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#a85060' }}>Teléfono (ej: 5491112345678)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none"
                    style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}
                    placeholder="Número con código de país"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#a85060' }}>API Key de CallMeBot</label>
                  <input
                    type="text"
                    value={whatsappApiKey}
                    onChange={(e) => setWhatsappApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none"
                    style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}
                    placeholder="API key recibida por WhatsApp"
                  />
                </div>
              </div>
            </div>

            {editUser && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className="relative w-11 h-6 rounded-full transition-all cursor-pointer"
                  style={{ background: isActive ? '#722F37' : '#4a1e2c' }}
                >
                  <span
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: isActive ? '24px' : '4px' }}
                  />
                </button>
                <label className="text-sm" style={{ color: '#dfa0ac' }}>
                  Cuenta {isActive ? 'activa' : 'desactivada'}
                </label>
              </div>
            )}

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
                {loading ? 'Guardando...' : editUser ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
