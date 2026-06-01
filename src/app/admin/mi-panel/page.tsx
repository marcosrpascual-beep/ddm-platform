'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import TaskCard from '@/components/TaskCard'
import TaskChart from '@/components/TaskChart'
import SelfTaskModal from '@/components/SelfTaskModal'

export default function AdminMiPanelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSelfTask, setShowSelfTask] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      const user = session.user as any
      if (user.role !== 'ADMIN') router.push('/dashboard')
      else fetchTasks()
    }
  }, [status])

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks?mine=true')
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : [])
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(taskId: string, completed: boolean) {
    await fetch(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
    await fetchTasks()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a0810' }}>
        <div className="text-white text-lg">Cargando...</div>
      </div>
    )
  }

  const user = session?.user as any
  const chartAssignments = tasks.map((t) => ({
    completedAt: t.myAssignment?.completedAt || null,
    task: { deadline: t.deadline, title: t.title },
  }))
  const pending = tasks.filter((t) => !t.myAssignment?.completedAt)
  const completed = tasks.filter((t) => t.myAssignment?.completedAt)

  return (
    <div className="min-h-screen" style={{ background: '#1a0810' }}>
      <Navbar />

      {showSelfTask && (
        <SelfTaskModal
          onClose={() => setShowSelfTask(false)}
          onSave={() => { setShowSelfTask(false); fetchTasks() }}
        />
      )}

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Hola, {user?.name}
            </h1>
            <p style={{ color: '#dfa0ac' }} className="mt-1">
              Tenés <strong style={{ color: '#f5f0f0' }}>{pending.length}</strong> tarea{pending.length !== 1 ? 's' : ''} pendiente{pending.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowSelfTask(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all flex items-center gap-2"
            style={{ background: '#722F37', border: '1px solid #8b3d47' }}
          >
            <span>+</span> Asignarme una tarea
          </button>
        </div>

        {tasks.length > 0 && (
          <div className="mb-8">
            <TaskChart assignments={chartAssignments} />
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
            Tareas pendientes
          </h2>
          {pending.length === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
              <p className="text-4xl mb-3">🎉</p>
              <p style={{ color: '#dfa0ac' }}>No tenés tareas pendientes</p>
              <button
                onClick={() => setShowSelfTask(true)}
                className="mt-4 px-4 py-2 rounded-lg text-sm cursor-pointer"
                style={{ background: '#4a1e2c', color: '#dfa0ac', border: '1px solid #722F37' }}
              >
                + Asignarme una tarea
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {pending.map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  priority={task.priority}
                  deadline={task.deadline}
                  createdAt={task.createdAt}
                  assignmentId={task.myAssignment?.id || ''}
                  completedAt={task.myAssignment?.completedAt || null}
                  alarmed20={task.myAssignment?.alarmed20 || false}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          )}
        </div>

        {completed.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#4ade80' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
              Tareas completadas
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {completed.map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  priority={task.priority}
                  deadline={task.deadline}
                  createdAt={task.createdAt}
                  assignmentId={task.myAssignment?.id || ''}
                  completedAt={task.myAssignment?.completedAt || null}
                  alarmed20={task.myAssignment?.alarmed20 || false}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
