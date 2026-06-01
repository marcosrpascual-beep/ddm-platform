'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import CreateTaskModal from '@/components/CreateTaskModal'

function Countdown({ deadline, allDone }: { deadline: string; allDone: boolean }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const diff = new Date(deadline).getTime() - now.getTime()
  const overdue = diff < 0
  const abs = Math.abs(diff)
  const totalDays = Math.floor(abs / 86400000)
  const months = Math.floor(totalDays / 30)
  const days = totalDays % 30
  const h = Math.floor((abs % 86400000) / 3600000)
  const m = Math.floor((abs % 3600000) / 60000)

  let label = ''
  if (months > 0) label = days > 0 ? `${months}m ${days}d` : `${months}m`
  else if (totalDays > 0) label = `${totalDays}d`
  else label = h > 0 ? `${h}h ${m}m` : `${m}m`

  const isWarning = !overdue && diff < 7 * 86400000

  if (allDone) return null

  return (
    <span
      className="text-xs font-mono px-2 py-0.5 rounded-full"
      style={{
        background: overdue ? '#7f1d1d44' : isWarning ? '#92400e44' : '#1a2a1a',
        color: overdue ? '#fca5a5' : isWarning ? '#fbbf24' : '#86efac',
        border: `1px solid ${overdue ? '#7f1d1d' : isWarning ? '#92400e' : '#166534'}`,
      }}
    >
      {overdue ? `+${label}` : label}
    </span>
  )
}

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  durationDays: number
  durationHours: number
  deadline: string
  createdAt: string
  createdBy: { name: string }
  assignments: { userId: string; completedAt: string | null; user: { id: string; name: string; email: string } }[]
}

interface User {
  id: string
  name: string
  email: string
}

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  HIGH: { label: 'Alta', color: '#ef4444' },
  MEDIUM: { label: 'Media', color: '#eab308' },
  LOW: { label: 'Baja', color: '#4ade80' },
}

export default function AdminTasksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      const user = session.user as any
      if (user.role !== 'ADMIN') router.push('/dashboard')
      else fetchAll()
    }
  }, [status])

  async function fetchAll() {
    const [tasksRes, usersRes] = await Promise.all([
      fetch('/api/tasks'),
      fetch('/api/users'),
    ])
    const [tasksData, usersData] = await Promise.all([tasksRes.json(), usersRes.json()])
    setTasks(Array.isArray(tasksData) ? tasksData : [])
    setUsers(Array.isArray(usersData) ? usersData : [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta tarea?')) return
    setDeletingId(id)
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    fetchAll()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a0810' }}>
        <div className="text-white text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#1a0810' }}>
      <Navbar />
      {(showModal || editTask) && (
        <CreateTaskModal
          users={users}
          editTask={editTask}
          onClose={() => { setShowModal(false); setEditTask(null) }}
          onSave={() => { setShowModal(false); setEditTask(null); fetchAll() }}
        />
      )}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestión de Tareas</h1>
            <p style={{ color: '#dfa0ac' }} className="mt-1">{tasks.length} tarea{tasks.length !== 1 ? 's' : ''} en total</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all"
            style={{ background: '#722F37' }}
          >
            + Nueva tarea
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
            <p className="text-4xl mb-3">📋</p>
            <p style={{ color: '#dfa0ac' }}>No hay tareas creadas aún</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
              style={{ background: '#722F37' }}
            >
              Crear primera tarea
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const isOverdue = new Date(task.deadline) < new Date()
              const allDone = task.assignments.length > 0 && task.assignments.every((a) => a.completedAt)
              const p = PRIORITY_MAP[task.priority] || PRIORITY_MAP.MEDIUM

              return (
                <div
                  key={task.id}
                  className="rounded-xl p-5"
                  style={{ background: '#2d1520', border: `1px solid ${allDone ? '#1a4a2d' : isOverdue ? '#7f1d1d' : '#4a1e2c'}` }}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${p.color}22`, color: p.color }}>
                          {p.label}
                        </span>
                        {allDone && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1a4a2d', color: '#4ade80' }}>Completada</span>}
                        {isOverdue && !allDone && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#7f1d1d', color: '#fca5a5' }}>Vencida</span>}
                        <span className="text-xs" style={{ color: '#a85060' }}>
                          {task.durationDays > 0 && `${task.durationDays}d `}{task.durationHours > 0 && `${task.durationHours}h`}
                        </span>
                      </div>

                      <h3 className="text-white font-semibold text-base">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm mt-1" style={{ color: '#dfa0ac' }}>{task.description}</p>
                      )}

                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <p className="text-xs" style={{ color: '#a85060' }}>
                          Vence: {new Date(task.deadline).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                        <Countdown deadline={task.deadline} allDone={allDone} />
                        <div className="flex gap-2 flex-wrap">
                          {task.assignments.map((a) => (
                            <span
                              key={a.userId}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                background: a.completedAt ? '#1a4a2d' : '#1a0810',
                                color: a.completedAt ? '#4ade80' : '#dfa0ac',
                                border: `1px solid ${a.completedAt ? '#16a34a' : '#4a1e2c'}`,
                              }}
                            >
                              {a.user.name} {a.completedAt ? '✓' : '○'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditTask(task)}
                        className="px-4 py-2 rounded-lg text-sm cursor-pointer transition-all"
                        style={{ background: '#1a0810', border: '1px solid #4a1e2c', color: '#dfa0ac' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        disabled={deletingId === task.id}
                        className="px-4 py-2 rounded-lg text-sm cursor-pointer transition-all"
                        style={{ background: '#7f1d1d33', border: '1px solid #7f1d1d', color: '#fca5a5' }}
                      >
                        {deletingId === task.id ? '...' : 'Eliminar'}
                      </button>
                    </div>
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
