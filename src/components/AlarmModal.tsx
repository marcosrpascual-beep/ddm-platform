'use client'
import { useEffect, useRef } from 'react'

interface AlarmModalProps {
  taskTitle: string
  timeRemaining: string
  percentRemaining: number
  onDismiss: () => void
}

export default function AlarmModal({ taskTitle, timeRemaining, percentRemaining, onDismiss }: AlarmModalProps) {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Generate alarm sound with Web Audio API
    function playBeep() {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        const ctx = audioCtxRef.current
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.frequency.setValueAtTime(880, ctx.currentTime)
        oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.15)
        oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.3)

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.5)
      } catch {}
    }

    playBeep()
    intervalRef.current = setInterval(playBeep, 2000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      audioCtxRef.current?.close()
      audioCtxRef.current = null
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div
        className="slide-in rounded-2xl p-8 max-w-lg w-full mx-4 text-center"
        style={{ background: '#2d1520', border: '2px solid #c9a227', boxShadow: '0 0 40px rgba(201,162,39,0.3)' }}
      >
        {/* Alarm icon animated */}
        <div className="alarm-pulse text-6xl mb-4">⏰</div>

        <h2 className="text-2xl font-bold mb-2" style={{ color: '#c9a227' }}>
          ¡Tiempo casi agotado!
        </h2>

        <div className="rounded-xl p-4 my-5" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
          <p className="text-white font-semibold text-lg mb-1">{taskTitle}</p>
          <p className="text-sm" style={{ color: '#dfa0ac' }}>
            Te quedan menos del <strong style={{ color: '#c9a227' }}>{Math.round(percentRemaining)}%</strong> del tiempo
          </p>
          <p className="text-2xl font-bold mt-2" style={{ color: '#f5f0f0' }}>
            {timeRemaining}
          </p>
          <p className="text-xs mt-1" style={{ color: '#a85060' }}>restantes para completar esta tarea</p>
        </div>

        <p className="text-sm mb-6" style={{ color: '#dfa0ac' }}>
          Debes terminarla lo antes posible. ¡Vamos, podés!
        </p>

        <button
          onClick={onDismiss}
          className="px-8 py-3 rounded-xl font-bold text-white text-base cursor-pointer transition-all"
          style={{ background: '#722F37', border: '2px solid #a85060' }}
        >
          Entendido, voy a terminarla
        </button>
      </div>
    </div>
  )
}
