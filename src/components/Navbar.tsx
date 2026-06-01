'use client'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const user = session?.user as any

  const isAdmin = user?.role === 'ADMIN'

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3" style={{ background: '#722F37', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
      {/* Logo */}
      <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3 text-white no-underline">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg tracking-widest" style={{ background: 'rgba(255,255,255,0.15)' }}>
          DDM
        </div>
        <span className="text-white font-semibold text-base hidden sm:block">Plataforma DDM</span>
      </Link>

      {/* Nav links (admin) */}
      {isAdmin && (
        <div className="flex items-center gap-1">
          <NavLink href="/admin" current={pathname === '/admin'}>Panel</NavLink>
          <NavLink href="/admin/mi-panel" current={pathname === '/admin/mi-panel'}>Mi panel</NavLink>
          <NavLink href="/admin/tasks" current={pathname === '/admin/tasks'}>Tareas</NavLink>
          <NavLink href="/admin/clients" current={pathname === '/admin/clients'}>Clientes</NavLink>
          <NavLink href="/admin/users" current={pathname === '/admin/users'}>Usuarios</NavLink>
          <NavLink href="/admin/cerebro" current={pathname.startsWith('/admin/cerebro')}>🧠 Cerebro</NavLink>
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-white text-sm font-medium leading-none">{user?.name}</p>
          <p className="text-sm leading-none mt-0.5" style={{ color: '#f0d0d5' }}>
            {isAdmin ? 'Administrador' : 'Miembro'}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
        >
          Salir
        </button>
      </div>
    </nav>
  )
}

function NavLink({ href, current, children }: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg text-sm font-medium transition-all no-underline"
      style={{
        background: current ? 'rgba(255,255,255,0.2)' : 'transparent',
        color: 'white',
      }}
    >
      {children}
    </Link>
  )
}
