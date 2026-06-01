'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import TaskChart from '@/components/TaskChart'

function Countdown({ deadline, allDone }: { deadline: string; allDone: boolean }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  if (allDone) return null
  const diff = new Date(deadline).getTime() - now.getTime()
  const overdue = diff < 0
  const abs = Math.abs(diff)
  const d = Math.floor(abs / 86400000)
  const h = Math.floor((abs % 86400000) / 3600000)
  const m = Math.floor((abs % 3600000) / 60000)
  const s = Math.floor((abs % 60000) / 1000)
  const parts: string[] = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0 || d > 0) parts.push(`${h}h`)
  if (d === 0) parts.push(`${m}m`)
  if (d === 0 && h === 0) parts.push(`${s}s`)
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{
      background: overdue ? '#7f1d1d44' : diff < 3600000 ? '#92400e44' : '#1a2a1a',
      color: overdue ? '#fca5a5' : diff < 3600000 ? '#fbbf24' : '#86efac',
      border: `1px solid ${overdue ? '#7f1d1d' : diff < 3600000 ? '#92400e' : '#166534'}`,
    }}>
      {overdue ? `+${parts.join(' ')}` : parts.join(' ')}
    </span>
  )
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface TaskAssignment {
  userId: string
  completedAt: string | null
  user: { id: string; name: string; email: string }
  task: { deadline: string; title: string }
}

interface Task {
  id: string
  title: string
  priority: string
  deadline: string
  createdAt: string
  assignments: TaskAssignment[]
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [completingId, setCompletingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      const user = session.user as any
      if (user.role !== 'ADMIN') router.push('/dashboard')
      else fetchAll()
    }
  }, [status])

  async function fetchAll() {
    const [usersRes, tasksRes] = await Promise.all([
      fetch('/api/users'),
      fetch('/api/tasks'),
    ])
    const [usersData, tasksData] = await Promise.all([usersRes.json(), tasksRes.json()])
    const adminId = (session?.user as any)?.id
    setUsers(Array.isArray(usersData) ? usersData.filter((u: User) => u.id !== adminId) : [])
    setTasks(Array.isArray(tasksData) ? tasksData : [])
    setLoading(false)
  }

  async function handleComplete(taskId: string, completed: boolean) {
    setCompletingId(taskId)
    await fetch(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
    setCompletingId(null)
    fetchAll()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a0810' }}>
        <div className="text-white text-lg">Cargando...</div>
      </div>
    )
  }

  // Build chart data for selected user or all
  const filteredTasks = selectedUserId
    ? tasks.filter((t) => t.assignments.some((a) => a.userId === selectedUserId))
    : tasks

  const chartAssignments = filteredTasks.flatMap((t) =>
    t.assignments
      .filter((a) => !selectedUserId || a.userId === selectedUserId)
      .map((a) => ({
        completedAt: a.completedAt,
        task: { deadline: t.deadline, title: t.title },
      }))
  )

  const now = new Date()
  const totalPending = filteredTasks.reduce((acc, t) => {
    const userAssignments = selectedUserId
      ? t.assignments.filter((a) => a.userId === selectedUserId)
      : t.assignments
    return acc + userAssignments.filter((a) => !a.completedAt).length
  }, 0)

  const totalCompleted = filteredTasks.reduce((acc, t) => {
    const userAssignments = selectedUserId
      ? t.assignments.filter((a) => a.userId === selectedUserId)
      : t.assignments
    return acc + userAssignments.filter((a) => a.completedAt).length
  }, 0)

  const totalOverdue = filteredTasks.reduce((acc, t) => {
    const userAssignments = selectedUserId
      ? t.assignments.filter((a) => a.userId === selectedUserId)
      : t.assignments
    return acc + userAssignments.filter((a) => !a.completedAt && new Date(t.deadline) < now).length
  }, 0)

  return (
    <div className="min-h-screen" style={{ background: '#1a0810' }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
            <p style={{ color: '#dfa0ac' }} className="mt-1">Supervisión del equipo DDM</p>
          </div>
        </div>

        {/* User filter */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedUserId(null)}
            className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all"
            style={{
              background: !selectedUserId ? '#722F37' : '#2d1520',
              color: 'white',
              border: `1px solid ${!selectedUserId ? '#8b3d47' : '#4a1e2c'}`,
            }}
          >
            Todo el equipo
          </button>
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUserId(u.id === selectedUserId ? null : u.id)}
              className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all"
              style={{
                background: selectedUserId === u.id ? '#722F37' : '#2d1520',
                color: 'white',
                border: `1px solid ${selectedUserId === u.id ? '#8b3d47' : '#4a1e2c'}`,
              }}
            >
              {u.name}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <SummaryCard label="Pendientes" value={totalPending} color="#eab308" icon="⏳" />
          <SummaryCard label="Completadas" value={totalCompleted} color="#4ade80" icon="✅" />
          <SummaryCard label="Vencidas" value={totalOverdue} color="#ef4444" icon="⚠️" />
        </div>

        {/* Chart */}
        <div className="mb-8">
          <TaskChart assignments={chartAssignments} />
        </div>

        {/* My tasks (admin's own assignments) */}
        {(() => {
          const adminId = (session?.user as any)?.id
          const myTasks = tasks.filter((t) => t.assignments.some((a) => a.userId === adminId))
          if (myTasks.length === 0) return null
          return (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Mis tareas</h2>
              <div className="space-y-3">
                {myTasks.map((task) => {
                  const mine = task.assignments.find((a) => a.userId === adminId)!
                  const done = !!mine.completedAt
                  const overdue = new Date(task.deadline) < now
                  return (
                    <div key={task.id} className="rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap"
                      style={{ background: '#2d1520', border: `1px solid ${done ? '#1a4a2d' : overdue ? '#7f1d1d' : '#4a1e2c'}` }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <PriorityBadge priority={task.priority} />
                          {done && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1a4a2d', color: '#4ade80' }}>Completada</span>}
                          {overdue && !done && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#7f1d1d', color: '#fca5a5' }}>Vencida</span>}
                        </div>
                        <p className="text-white font-medium">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs" style={{ color: '#a85060' }}>
                            Vence: {new Date(task.deadline).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                          <Countdown deadline={task.deadline} allDone={done} />
                        </div>
                      </div>
                      <button
                        disabled={completingId === task.id}
                        onClick={() => handleComplete(task.id, !done)}
                        className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all shrink-0"
                        style={{
                          background: done ? '#1a4a2d' : '#1a0810',
                          border: `1px solid ${done ? '#16a34a' : '#4a1e2c'}`,
                          color: done ? '#4ade80' : '#dfa0ac',
                        }}
                      >
                        {completingId === task.id ? '...' : done ? '✓ Completada' : 'Marcar como hecha'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* Tasks overview */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            {selectedUserId ? `Tareas de ${users.find((u) => u.id === selectedUserId)?.name}` : 'Todas las tareas activas'}
          </h2>
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
                <p style={{ color: '#dfa0ac' }}>No hay tareas asignadas</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const relevantAssignments = selectedUserId
                  ? task.assignments.filter((a) => a.userId === selectedUserId)
                  : task.assignments
                const isOverdue = new Date(task.deadline) < now
                const allDone = relevantAssignments.length > 0 && relevantAssignments.every((a) => a.completedAt)

                return (
                  <div
                    key={task.id}
                    className="rounded-xl p-4"
                    style={{ background: '#2d1520', border: `1px solid ${allDone ? '#1a4a2d' : isOverdue ? '#7f1d1d' : '#4a1e2c'}` }}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <PriorityBadge priority={task.priority} />
                          {allDone && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1a4a2d', color: '#4ade80' }}>Completada</span>}
                          {isOverdue && !allDone && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#7f1d1d', color: '#fca5a5' }}>Vencida</span>}
                        </div>
                        <h3 className="text-white font-medium">{task.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-xs" style={{ color: '#a85060' }}>
                            Vence: {new Date(task.deadline).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                          <Countdown deadline={task.deadline} allDone={allDone} />
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {relevantAssignments.map((a) => (
                          <div
                            key={a.userId}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                            style={{ background: a.completedAt ? '#1a4a2d' : '#1a0810', border: `1px solid ${a.completedAt ? '#16a34a' : '#4a1e2c'}` }}
                          >
                            <span className="text-xs" style={{ color: a.completedAt ? '#4ade80' : '#dfa0ac' }}>
                              {a.user.name}
                            </span>
                            {a.completedAt ? <span className="text-xs">✓</span> : <span className="text-xs" style={{ color: '#722F37' }}>○</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function SummaryCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#2d1520', border: `1px solid ${color}33` }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
      <div className="text-sm mt-1" style={{ color: '#dfa0ac' }}>{label}</div>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; color: string }> = {
    HIGH: { label: 'Alta', color: '#ef4444' },
    MEDIUM: { label: 'Media', color: '#eab308' },
    LOW: { label: 'Baja', color: '#4ade80' },
  }
  const p = map[priority] || map.MEDIUM
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${p.color}22`, color: p.color }}>
      {p.label}
    </span>
  )
}
