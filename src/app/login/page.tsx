'use client'
import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      const user = session.user as any
      router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard')
    }
  }, [status, session, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a0810 0%, #2d1520 50%, #1a0810 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4" style={{ background: '#722F37' }}>
            <span className="text-white font-bold text-3xl tracking-wider">DDM</span>
          </div>
          <h1 className="text-white text-3xl font-bold">Bienvenido</h1>
          <p style={{ color: '#dfa0ac' }} className="mt-1 text-sm">Plataforma de Gestión de Tareas</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#dfa0ac' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 outline-none transition-all"
                style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#dfa0ac' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 outline-none transition-all"
                style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm text-red-200" style={{ background: '#4a1e2c', border: '1px solid #8b3d47' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-semibold text-base transition-all cursor-pointer disabled:opacity-60"
              style={{ background: loading ? '#5e2230' : '#722F37' }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: '#5e2230' }}>
          © {new Date().getFullYear()} DDM Agency
        </p>
      </div>
    </div>
  )
}
