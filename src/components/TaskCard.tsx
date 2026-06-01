'use client'
import { useState, useEffect } from 'react'
import TaskTimer, { useTaskTimer } from './TaskTimer'
import AlarmModal from './AlarmModal'

interface TaskCardProps {
  id: string
  title: string
  description: string | null
  priority: string
  deadline: string
  createdAt: string
  assignmentId: string
  completedAt: string | null
  alarmed20: boolean
  onComplete: (taskId: string, completed: boolean) => Promise<void>
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  HIGH: { label: 'Alta', color: '#ef4444' },
  MEDIUM: { label: 'Media', color: '#eab308' },
  LOW: { label: 'Baja', color: '#4ade80' },
}

export default function TaskCard({
  id,
  title,
  description,
  priority,
  deadline,
  createdAt,
  completedAt,
  alarmed20,
  onComplete,
}: TaskCardProps) {
  const [completing, setCompleting] = useState(false)
  const [showAlarm, setShowAlarm] = useState(false)
  const [alarmDismissed, setAlarmDismissed] = useState(alarmed20)
  const [showConfirm, setShowConfirm] = useState(false)
  const isCompleted = !!completedAt

  const { percentRemaining, isAlarmZone, isOverdue, timeRemaining } = useTaskTimer(deadline, createdAt)

  useEffect(() => {
    if (isAlarmZone && !alarmDismissed && !isCompleted && !isOverdue) {
      setShowAlarm(true)
    }
  }, [isAlarmZone, alarmDismissed, isCompleted, isOverdue])

  async function handleDismissAlarm() {
    setShowAlarm(false)
    setAlarmDismissed(true)
    try {
      await fetch(`/api/tasks/${id}/alarm`, { method: 'POST' })
    } catch {}
  }

  function handleCheckboxClick() {
    if (completing) return
    if (!isCompleted) {
      // Show confirmation before marking complete
      setShowConfirm(true)
    } else {
      // Unmark directly (no confirmation needed)
      doComplete(false)
    }
  }

  async function doComplete(completed: boolean) {
    setCompleting(true)
    try {
      await onComplete(id, completed)
    } finally {
      setCompleting(false)
    }
  }

  const priorityInfo = PRIORITY_LABELS[priority] || PRIORITY_LABELS.MEDIUM

  const borderColor = isCompleted
    ? '#1a4a2d'
    : isOverdue
    ? '#7f1d1d'
    : isAlarmZone
    ? '#7c2d12'
    : '#4a1e2c'

  return (
    <>
      {showAlarm && (
        <AlarmModal
          taskTitle={title}
          timeRemaining={timeRemaining}
          percentRemaining={percentRemaining}
          onDismiss={handleDismissAlarm}
        />
      )}

      <div
        className="rounded-xl p-5 flex flex-col gap-4 transition-all"
        style={{
          background: '#2d1520',
          border: `1px solid ${borderColor}`,
          opacity: isCompleted ? 0.7 : 1,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${priorityInfo.color}22`, color: priorityInfo.color, border: `1px solid ${priorityInfo.color}44` }}
              >
                {priorityInfo.label}
              </span>
              {isOverdue && !isCompleted && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#7f1d1d', color: '#fca5a5' }}>
                  Vencida
                </span>
              )}
              {isAlarmZone && !isCompleted && !isOverdue && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full alarm-pulse" style={{ background: '#7c2d12', color: '#fdba74' }}>
                  ¡Urgente!
                </span>
              )}
            </div>
            <h3
              className="font-semibold text-base leading-snug"
              style={{ color: isCompleted ? '#a85060' : '#f5f0f0', textDecoration: isCompleted ? 'line-through' : 'none' }}
            >
              {title}
            </h3>
            {description && (
              <p className="text-sm mt-1 leading-relaxed" style={{ color: '#dfa0ac' }}>
                {description}
              </p>
            )}
          </div>

          {/* Checkbox with tooltip */}
          <div className="relative flex-shrink-0">
            <button
              onClick={handleCheckboxClick}
              disabled={completing}
              className="group w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all"
              style={{
                background: isCompleted ? '#16a34a' : 'transparent',
                border: `2px solid ${isCompleted ? '#16a34a' : '#722F37'}`,
              }}
              title={isCompleted ? 'Desmarcar tarea' : 'Marcar como completada'}
            >
              {isCompleted ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#722F37' }}>✓</span>
              )}
            </button>
          </div>
        </div>

        {/* Confirmation dialog */}
        {showConfirm && (
          <div
            className="rounded-xl p-4 slide-in"
            style={{ background: '#1a0810', border: '1px solid #c9a227' }}
          >
            <p className="text-sm font-medium text-white mb-3">
              ¿Estás seguro que completaste la tarea?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowConfirm(false); doComplete(true) }}
                className="flex-1 py-2 rounded-lg text-sm font-bold text-white cursor-pointer transition-all"
                style={{ background: '#16a34a' }}
              >
                Sí, la completé
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all"
                style={{ background: '#1a0810', border: '1px solid #4a1e2c', color: '#dfa0ac' }}
              >
                No todavía
              </button>
            </div>
          </div>
        )}

        {/* Timer */}
        <TaskTimer deadline={deadline} createdAt={createdAt} completed={isCompleted} />

        {/* Deadline */}
        <div className="text-xs" style={{ color: '#a85060' }}>
          Vence: {new Date(deadline).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
        </div>
      </div>
    </>
  )
}
