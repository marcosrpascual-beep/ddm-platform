'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import CreateUserModal from '@/components/CreateUserModal'

interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  whatsappApiKey: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

function getInactivityLabel(lastLoginAt: string | null): { label: string; color: string; dot: string } {
  if (!lastLoginAt) return { label: 'Nunca ingresó', color: '#a85060', dot: '#5e2230' }

  const diff = Date.now() - new Date(lastLoginAt).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 5) return { label: 'Activo ahora', color: '#4ade80', dot: '#4ade80' }
  if (minutes < 60) return { label: `Hace ${minutes} min`, color: '#4ade80', dot: '#4ade80' }
  if (hours < 48) return { label: `Hace ${hours}h`, color: '#eab308', dot: '#eab308' }
  if (hours < 168) return { label: `Hace ${hours}h`, color: '#f97316', dot: '#f97316' }
  return { label: `Hace ${hours}h`, color: '#ef4444', dot: '#ef4444' }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      const user = session.user as any
      if (user.role !== 'ADMIN') router.push('/dashboard')
      else fetchUsers()
    }
  }, [status])

  async function fetchUsers() {
    const res = await fetch('/api/users')
    const data = await res.json()
    setUsers(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar al usuario "${name}"? Esta acción eliminará también todas sus asignaciones.`)) return
    setDeletingId(id)
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    fetchUsers()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a0810' }}>
        <div className="text-white text-lg">Cargando...</div>
      </div>
    )
  }

  const currentUserId = (session?.user as any)?.id

  return (
    <div className="min-h-screen" style={{ background: '#1a0810' }}>
      <Navbar />
      {(showModal || editUser) && (
        <CreateUserModal
          editUser={editUser}
          onClose={() => { setShowModal(false); setEditUser(null) }}
          onSave={() => { setShowModal(false); setEditUser(null); fetchUsers() }}
        />
      )}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
            <p style={{ color: '#dfa0ac' }} className="mt-1">{users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
            style={{ background: '#722F37' }}
          >
            + Nuevo usuario
          </button>
        </div>

        {/* Instructions */}
        <div className="rounded-xl p-4 mb-6" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
          <p className="text-sm font-medium text-white mb-1">¿Cómo crear un acceso para un miembro?</p>
          <p className="text-sm" style={{ color: '#dfa0ac' }}>
            Creá el usuario con su email y una contraseña inicial. Luego compartile esas credenciales por WhatsApp o mensaje. El miembro entra a la plataforma y puede trabajar normalmente.
          </p>
        </div>

        {users.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
            <p className="text-4xl mb-3">👥</p>
            <p style={{ color: '#dfa0ac' }}>No hay usuarios registrados aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const activity = getInactivityLabel(user.lastLoginAt)
              return (
                <div
                  key={user.id}
                  className="rounded-xl p-5 flex items-center gap-4"
                  style={{ background: '#2d1520', border: `1px solid ${user.isActive ? '#4a1e2c' : '#2d1520'}`, opacity: user.isActive ? 1 : 0.6 }}
                >
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                    style={{ background: user.role === 'ADMIN' ? '#c9a227' : '#722F37' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold">{user.name}</h3>
                      {user.id === currentUserId && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#c9a22722', color: '#c9a227' }}>Tú</span>
                      )}
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: user.role === 'ADMIN' ? '#c9a22722' : '#72293722',
                          color: user.role === 'ADMIN' ? '#c9a227' : '#dfa0ac',
                        }}
                      >
                        {user.role === 'ADMIN' ? 'Admin' : 'Miembro'}
                      </span>
                      {!user.isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1a0810', color: '#a85060' }}>Inactivo</span>
                      )}
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: '#a85060' }}>{user.email}</p>
                    {/* Activity indicator */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: activity.dot }} />
                      <span className="text-xs" style={{ color: activity.color }}>{activity.label}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditUser(user)}
                      className="px-4 py-2 rounded-lg text-sm cursor-pointer"
                      style={{ background: '#1a0810', border: '1px solid #4a1e2c', color: '#dfa0ac' }}
                    >
                      Editar
                    </button>
                    {user.id !== currentUserId && (
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={deletingId === user.id}
                        className="px-4 py-2 rounded-lg text-sm cursor-pointer"
                        style={{ background: '#7f1d1d33', border: '1px solid #7f1d1d', color: '#fca5a5' }}
                      >
                        {deletingId === user.id ? '...' : 'Eliminar'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
