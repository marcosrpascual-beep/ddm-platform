'use client'
import { useState, useEffect } from 'react'

interface TaskTimerProps {
  deadline: string
  createdAt: string
  completed: boolean
}

function formatDuration(ms: number) {
  if (ms <= 0) return '0h 0m'
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function useTaskTimer(deadline: string, createdAt: string) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const deadlineMs = new Date(deadline).getTime()
  const createdMs = new Date(createdAt).getTime()
  const totalMs = deadlineMs - createdMs
  const remainingMs = deadlineMs - now
  const elapsedMs = now - createdMs

  const percentRemaining = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100))
  const percentElapsed = 100 - percentRemaining
  const isOverdue = remainingMs < 0
  const isAlarmZone = percentRemaining <= 20 && percentRemaining > 0

  return {
    remainingMs,
    percentRemaining,
    percentElapsed,
    isOverdue,
    isAlarmZone,
    timeRemaining: formatDuration(remainingMs),
  }
}

export default function TaskTimer({ deadline, createdAt, completed }: TaskTimerProps) {
  const { remainingMs, percentRemaining, isOverdue, timeRemaining } = useTaskTimer(deadline, createdAt)

  if (completed) {
    return (
      <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: '#1a4a2d', color: '#4ade80' }}>
        Completada
      </span>
    )
  }

  const barColor = isOverdue
    ? '#ef4444'
    : percentRemaining <= 20
    ? '#f97316'
    : percentRemaining <= 50
    ? '#eab308'
    : '#4ade80'

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs" style={{ color: '#dfa0ac' }}>Tiempo restante</span>
        <span className="text-xs font-bold" style={{ color: barColor }}>
          {isOverdue ? 'VENCIDA' : timeRemaining}
        </span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1a0810' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${isOverdue ? 100 : percentRemaining}%`,
            background: barColor,
          }}
        />
      </div>
    </div>
  )
}
