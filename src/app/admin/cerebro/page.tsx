'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_QUESTIONS = [
  { label: '💰 Precios del servicio', q: '¿Cuáles son todos los precios y planes del servicio?' },
  { label: '⭐ Casos de éxito', q: 'Contame los casos de éxito más importantes con números reales.' },
  { label: '🤝 Clientes activos', q: '¿Quiénes son los clientes activos a mayo 2026 y cuál es el status de cada uno?' },
  { label: '📋 Proceso de onboarding', q: '¿Cuál es el proceso de onboarding paso a paso cuando cierra un cliente?' },
  { label: '❓ Objeciones', q: 'Dame las objeciones más comunes y cómo responderlas.' },
  { label: '📞 Estructura de llamada', q: '¿Cuál es la estructura de la llamada de venta?' },
  { label: '🎬 Estrategia de contenido', q: 'Explicame la estrategia de contenido: trial reels, pilares y formatos.' },
  { label: '👥 Equipo', q: '¿Cómo está compuesto el equipo?' },
]

export default function CerebroPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as any

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('ddm_cerebro_key') || ''
    setApiKey(saved)
    setShowKeyInput(!saved)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && user?.role !== 'ADMIN') router.push('/dashboard')
  }, [status, user, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    if (!text.trim() || loading) return
    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const res = await fetch('/api/cerebro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, apiKey }),
      })

      if (!res.ok) throw new Error(await res.text())

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let aiText = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.delta?.text || parsed.delta?.value || ''
            if (delta) {
              aiText += delta
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: aiText }
                return updated
              })
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  function saveKey(key: string) {
    localStorage.setItem('ddm_cerebro_key', key)
    setApiKey(key)
    setShowKeyInput(false)
  }

  if (status === 'loading') return null

  if (showKeyInput) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#0f0f11' }}>
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col gap-4 w-full max-w-sm px-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🧠</div>
              <h2 className="text-lg font-bold mb-1" style={{ color: '#9d8ff9' }}>Conectá tu cuenta de Claude</h2>
              <p className="text-xs" style={{ color: '#8888a0' }}>
                Ingresá tu Anthropic API Key. La podés encontrar en{' '}
                <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color: '#7c6af7' }}>
                  console.anthropic.com
                </a>
              </p>
            </div>
            <input
              type="password"
              placeholder="sk-ant-..."
              autoFocus
              className="rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: '#1a1a1f', border: '1px solid #2e2e38', color: '#e8e8f0' }}
              onFocus={e => (e.target.style.borderColor = '#7c6af7')}
              onBlur={e => (e.target.style.borderColor = '#2e2e38')}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim()
                  if (val.startsWith('sk-ant-')) saveKey(val)
                }
              }}
              id="key-field"
            />
            <button
              className="rounded-xl py-3 text-sm font-semibold"
              style={{ background: '#7c6af7', color: '#fff' }}
              onClick={() => {
                const val = (document.getElementById('key-field') as HTMLInputElement)?.value.trim()
                if (val?.startsWith('sk-ant-')) saveKey(val)
              }}
            >
              Conectar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f0f11' }}>
      <Navbar />

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col gap-3 p-4 overflow-y-auto" style={{ width: 240, minWidth: 240, background: '#1a1a1f', borderRight: '1px solid #2e2e38' }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8888a0' }}>Preguntas rápidas</p>
          {QUICK_QUESTIONS.map(({ label, q }) => (
            <button
              key={label}
              onClick={() => send(q)}
              className="text-left rounded-lg px-3 py-2 text-xs transition-all"
              style={{ background: '#222228', border: '1px solid #2e2e38', color: '#e8e8f0', lineHeight: 1.4 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#7c6af7'; (e.currentTarget as HTMLElement).style.color = '#9d8ff9' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2e2e38'; (e.currentTarget as HTMLElement).style.color = '#e8e8f0' }}
            >
              {label}
            </button>
          ))}
          <div style={{ height: 1, background: '#2e2e38', marginTop: 'auto' }} />
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-xs rounded-lg px-3 py-2 transition-all"
              style={{ background: '#1a1a1f', border: '1px solid #2e2e38', color: '#8888a0' }}
            >
              🗑 Borrar conversación
            </button>
          )}
          <button
            onClick={() => { localStorage.removeItem('ddm_cerebro_key'); setShowKeyInput(true) }}
            className="text-xs rounded-lg px-3 py-2 transition-all"
            style={{ background: '#1a1a1f', border: '1px solid #2e2e38', color: '#8888a0' }}
          >
            🔑 Cambiar API key
          </button>
        </aside>

        {/* Chat */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6" style={{ scrollbarWidth: 'thin' }}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="text-5xl">🧠</div>
                <h2 className="text-xl font-bold" style={{ color: '#9d8ff9' }}>Cerebro DDM</h2>
                <p className="text-sm max-w-sm" style={{ color: '#8888a0' }}>
                  Toda la información del negocio: precios, clientes, casos de éxito, objeciones, metodología y estrategia.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap max-w-[85%]"
                      style={{
                        background: msg.role === 'user' ? '#1e1b3a' : '#181820',
                        border: `1px solid ${msg.role === 'user' ? '#3d3670' : '#2e2e38'}`,
                        color: '#e8e8f0',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-4 py-3" style={{ background: '#181820', border: '1px solid #2e2e38' }}>
                      <span className="text-sm" style={{ color: '#8888a0' }}>Pensando...</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid #2e2e38' }}>
            <div className="flex gap-2 max-w-3xl mx-auto items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={autoResize}
                onKeyDown={handleKey}
                placeholder="Escribí tu pregunta... (Enter para enviar)"
                rows={1}
                className="flex-1 rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                style={{
                  background: '#1a1a1f',
                  border: '1px solid #2e2e38',
                  color: '#e8e8f0',
                  maxHeight: 160,
                  scrollbarWidth: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = '#7c6af7')}
                onBlur={e => (e.target.style.borderColor = '#2e2e38')}
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="rounded-xl px-4 py-3 text-sm font-semibold transition-all"
                style={{
                  background: loading || !input.trim() ? '#2e2e38' : '#7c6af7',
                  color: loading || !input.trim() ? '#8888a0' : '#fff',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
