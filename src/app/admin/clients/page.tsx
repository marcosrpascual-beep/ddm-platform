'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import Navbar from '@/components/Navbar'
import CreateClientModal from '@/components/CreateClientModal'
import RenewalModal from '@/components/RenewalModal'

interface ClientRenewal { id: string; startDate: string; endDate: string }
interface DDMUser { id: string; name: string }
interface Client {
  id: string; name: string; isActive: boolean; leftService: boolean
  followersStart: number | null; startDate: string | null; endDate: string | null
  instagramUrl: string | null; tiktokUrl: string | null
  contentSheetUrl: string | null; scriptDocUrl: string | null
  notes: string | null; country: string | null; source: string | null
  ddmUserId: string | null; ddmUser: DDMUser | null
  renewals: ClientRenewal[]; createdAt: string
}
interface User { id: string; name: string; email: string }

function Countdown({ endDate }: { endDate: string }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const diff = new Date(endDate).getTime() - now.getTime()
  const overdue = diff < 0
  const abs = Math.abs(diff)
  const totalDays = Math.floor(abs / 86400000)
  const h = Math.floor((abs % 86400000) / 3600000)
  const m = Math.floor((abs % 3600000) / 60000)

  let label = ''
  if (totalDays > 0) label = `${totalDays}d`
  else label = h > 0 ? `${h}h ${m}m` : `${m}m`

  const isWarning = !overdue && diff < 7 * 86400000

  return (
    <span className="text-xs font-mono px-1.5 py-0.5 rounded-full mt-1 inline-block" style={{
      background: overdue ? '#7f1d1d44' : isWarning ? '#92400e44' : '#1a2a1a',
      color: overdue ? '#fca5a5' : isWarning ? '#fbbf24' : '#86efac',
      border: `1px solid ${overdue ? '#7f1d1d' : isWarning ? '#92400e' : '#166534'}`,
    }}>
      {overdue ? `+${label}` : label}
    </span>
  )
}

function fmtDate(d: string | null) {
  if (!d) return null
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return null
  return dt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getEndDateColor(endDate: string | null, isActive: boolean) {
  if (!endDate || !isActive) return null
  const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
  if (days < 7) return '#ef4444'
  if (days < 15) return '#f97316'
  if (days <= 30) return '#eab308'
  return '#4ade80'
}

// LTV in months from original start to latest end date
function calcLtvMonths(client: Client): number | null {
  const start = client.startDate
  if (!start) return null
  const latestEnd = client.renewals.length > 0
    ? client.renewals[client.renewals.length - 1].endDate
    : client.endDate
  if (!latestEnd) return null
  const ms = new Date(latestEnd).getTime() - new Date(start).getTime()
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24 * 30)))
}

function LinkPill({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold no-underline whitespace-nowrap"
      style={{ background: `${color}22`, border: `1px solid ${color}55`, color }}>
      {label}
    </a>
  )
}

const PIE_COLORS = ['#4ade80', '#eab308', '#ef4444', '#818cf8', '#f472b6', '#34d399', '#fb923c', '#60a5fa']

function PieCard({ title, data }: { title: string; data: { name: string; value: number; color: string }[] }) {
  const filtered = data.filter(d => d.value > 0)
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="rounded-xl p-5" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
      <p className="text-sm font-semibold text-white mb-4 text-center">{title}</p>
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-24">
          <p className="text-xs" style={{ color: '#a85060' }}>Sin datos aún</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div style={{ width: 100, height: 100, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={filtered} dataKey="value" cx="50%" cy="50%" innerRadius={26} outerRadius={46} paddingAngle={2}>
                  {filtered.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: any, n: any) => [v, n]}
                  contentStyle={{ background: '#1a0810', border: '1px solid #4a1e2c', borderRadius: 8, color: '#dfa0ac', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="text-xs mb-1" style={{ color: '#a85060' }}>Total: <span className="text-white font-bold">{total}</span></div>
            {filtered.map(d => (
              <div key={d.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs truncate" style={{ color: '#dfa0ac' }}>{d.name}</span>
                </div>
                <span className="text-sm font-bold flex-shrink-0" style={{ color: d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminClientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [renewClient, setRenewClient] = useState<Client | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingRenewal, setEditingRenewal] = useState<{ id: string; clientId: string; startDate: string; endDate: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      const user = session.user as any
      if (user.role !== 'ADMIN') router.push('/dashboard')
      else fetchAll()
    }
  }, [status])

  async function fetchAll() {
    const [cr, ur] = await Promise.all([fetch('/api/clients'), fetch('/api/users')])
    const [cd, ud] = await Promise.all([cr.json(), ur.json()])
    setClients(Array.isArray(cd) ? cd : [])
    setUsers(Array.isArray(ud) ? ud : [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este cliente?')) return
    setDeletingId(id)
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    fetchAll()
  }

  async function handleSaveRenewal() {
    if (!editingRenewal) return
    await fetch(`/api/clients/${editingRenewal.clientId}/renewals/${editingRenewal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: editingRenewal.startDate, endDate: editingRenewal.endDate }),
    })
    setEditingRenewal(null)
    fetchAll()
  }

  async function handleDeleteRenewal(clientId: string, renewalId: string) {
    if (!confirm('¿Eliminar esta renovación?')) return
    await fetch(`/api/clients/${clientId}/renewals/${renewalId}`, { method: 'DELETE' })
    fetchAll()
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a0810' }}><div className="text-white">Cargando...</div></div>
  }

  const sorted = [...clients].sort((a, b) => {
    const rank = (c: Client) => c.leftService ? 2 : c.isActive ? 0 : 1
    return rank(a) - rank(b)
  })

  const total = clients.length
  const activos = clients.filter(c => c.isActive && !c.leftService).length
  const inactivos = clients.filter(c => !c.isActive && !c.leftService).length
  const abandonaron = clients.filter(c => c.leftService).length

  // LTV calculations
  const ltvValues = clients.map(calcLtvMonths).filter((v): v is number => v !== null)
  const avgLtv = ltvValues.length > 0 ? Math.round(ltvValues.reduce((a, b) => a + b, 0) / ltvValues.length) : 0
  const maxLtv = ltvValues.length > 0 ? Math.max(...ltvValues) : 0
  const totalMonths = ltvValues.reduce((a, b) => a + b, 0)

  const distPie = [
    { name: 'Activos', value: activos, color: '#4ade80' },
    { name: 'Inactivos', value: inactivos, color: '#eab308' },
    { name: 'Abandonaron', value: abandonaron, color: '#ef4444' },
  ]
  const renewPie = [
    { name: 'Renovaron', value: activos, color: '#4ade80' },
    { name: 'No renovaron', value: abandonaron + inactivos, color: '#ef4444' },
  ]
  const countryMap: Record<string, number> = {}
  clients.forEach(c => { if (c.country) countryMap[c.country] = (countryMap[c.country] || 0) + 1 })
  const countryPie = Object.entries(countryMap).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }))

  const sourceMap: Record<string, number> = {}
  clients.forEach(c => { if (c.source) sourceMap[c.source] = (sourceMap[c.source] || 0) + 1 })
  const sourcePie = Object.entries(sourceMap).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }))

  const newClientsPerMonth = (() => {
    const map: Record<string, number> = {}
    clients.forEach(c => {
      if (!c.startDate) return
      const d = new Date(c.startDate)
      if (isNaN(d.getTime())) return
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, clientes]) => {
        const [year, month] = key.split('-')
        const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })
        return { label, clientes }
      })
  })()

  const modalUsers = users.map(u => ({ id: u.id, name: u.name }))

  return (
    <div className="min-h-screen" style={{ background: '#1a0810' }}>
      <Navbar />
      {(showModal || editClient) && (
        <CreateClientModal users={modalUsers} editClient={editClient}
          onClose={() => { setShowModal(false); setEditClient(null) }}
          onSave={() => { setShowModal(false); setEditClient(null); fetchAll() }} />
      )}
      {renewClient && (
        <RenewalModal clientId={renewClient.id} clientName={renewClient.name}
          onClose={() => setRenewClient(null)}
          onSave={() => { setRenewClient(null); fetchAll() }} />
      )}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestión de Clientes</h1>
            <p style={{ color: '#dfa0ac' }} className="mt-1">{total} clientes históricos</p>
          </div>
          <button onClick={() => setShowModal(true)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: '#722F37' }}>
            + Nuevo cliente
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Históricos', value: total, color: 'white' },
            { label: 'Activos', value: activos, color: '#4ade80' },
            { label: 'Inactivos', value: inactivos, color: '#eab308' },
            { label: 'Abandonaron', value: abandonaron, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#dfa0ac' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* LTV Section */}
        <div className="rounded-xl p-5 mb-6" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
          <h2 className="text-sm font-bold text-white mb-4">Life Time Value</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#c9a227' }}>{avgLtv} mes{avgLtv !== 1 ? 'es' : ''}</div>
              <div className="text-xs mt-1" style={{ color: '#dfa0ac' }}>Promedio por cliente</div>
            </div>
            <div className="text-center" style={{ borderLeft: '1px solid #4a1e2c', borderRight: '1px solid #4a1e2c' }}>
              <div className="text-2xl font-bold" style={{ color: '#4ade80' }}>{maxLtv} mes{maxLtv !== 1 ? 'es' : ''}</div>
              <div className="text-xs mt-1" style={{ color: '#dfa0ac' }}>Cliente más longevo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#818cf8' }}>{totalMonths} mes{totalMonths !== 1 ? 'es' : ''}</div>
              <div className="text-xs mt-1" style={{ color: '#dfa0ac' }}>Total acumulado</div>
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: '#5e2230' }}>* Calculado entre fecha de inicio de servicio y última fecha de vencimiento. Solo clientes con ambas fechas cargadas.</p>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <PieCard title="Distribución de clientes" data={distPie} />
          <PieCard title="Renovaciones" data={renewPie} />
          <PieCard title="Clientes por país" data={countryPie} />
        </div>

        <div className="mb-4">
          <PieCard title="¿De dónde vienen los clientes?" data={sourcePie} />
        </div>

        {/* New clients per month */}
        <div className="rounded-xl p-5 mb-8" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
          <p className="text-sm font-semibold text-white mb-4">Nuevos clientes por mes</p>
          {newClientsPerMonth.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: '#a85060' }}>Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={newClientsPerMonth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a1e2c44" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#a85060', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#a85060', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#722F3722' }}
                  contentStyle={{ background: '#1a0810', border: '1px solid #4a1e2c', borderRadius: 8, color: '#dfa0ac', fontSize: 12 }}
                  formatter={(v: any) => [v, 'Nuevos clientes']}
                />
                <Bar dataKey="clientes" fill="#722F37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Table */}
        {clients.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
            <p className="text-4xl mb-3">👥</p>
            <p style={{ color: '#dfa0ac' }}>No hay clientes aún</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #4a1e2c' }}>
            <div className="hidden sm:grid px-4 py-3 text-xs font-semibold gap-3"
              style={{ background: '#3d1a28', color: '#a85060', gridTemplateColumns: '220px 110px 120px 160px 1fr 150px' }}>
              <span>CLIENTE</span>
              <span>DDM</span>
              <span>INICIO</span>
              <span>VENCIMIENTO</span>
              <span>LINKS</span>
              <span></span>
            </div>

            {sorted.map((client, idx) => {
              const lastRenewal = client.renewals.length > 0 ? client.renewals[client.renewals.length - 1] : null
              const displayEndDate = lastRenewal ? lastRenewal.endDate : client.endDate
              const endColor = getEndDateColor(displayEndDate, client.isActive)
              const startFmt = fmtDate(client.startDate)
              const endFmt = fmtDate(displayEndDate)
              const ltv = calcLtvMonths(client)
              const badge = client.leftService
                ? { bg: '#ef444422', color: '#ef4444', label: 'Abandonó' }
                : client.isActive
                  ? { bg: '#4ade8022', color: '#4ade80', label: 'Activo' }
                  : { bg: '#eab30822', color: '#eab308', label: 'Inactivo' }
              const isExpanded = expandedId === client.id

              return (
                <div key={client.id} style={{ borderTop: '1px solid #4a1e2c33', opacity: client.leftService ? 0.8 : 1 }}>
                  {/* Main row */}
                  <div className="sm:grid px-4 py-3 gap-3 items-center"
                    style={{ gridTemplateColumns: '220px 110px 120px 160px 1fr 150px', background: idx % 2 === 0 ? '#2d1520' : '#311723' }}>

                    {/* Name */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 text-white"
                        style={{ background: client.isActive && !client.leftService ? '#722F37' : '#3d1a28' }}>
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-white">{client.name}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                          {client.renewals.length > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#818cf822', color: '#818cf8' }}>
                              ×{client.renewals.length + 1}
                            </span>
                          )}
                        </div>
                        {ltv !== null && <span className="text-xs" style={{ color: '#a85060' }}>LTV: {ltv} mes{ltv !== 1 ? 'es' : ''}</span>}
                      </div>
                    </div>

                    {/* DDM */}
                    <div>
                      {client.ddmUser
                        ? <span className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: '#c9a22718', color: '#c9a227', border: '1px solid #c9a22733' }}>{client.ddmUser.name}</span>
                        : <span className="text-xs" style={{ color: '#5e2230' }}>—</span>}
                    </div>

                    {/* Start date */}
                    <div>
                      {startFmt
                        ? <span className="text-xs px-2 py-1 rounded-lg" style={{ background: '#1a0810', border: '1px solid #4a1e2c', color: '#dfa0ac' }}>{startFmt}</span>
                        : <span className="text-xs" style={{ color: '#5e2230' }}>—</span>}
                    </div>

                    {/* End date (latest) */}
                    <div className="flex flex-col gap-0.5">
                      {endFmt
                        ? <>
                            <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: `${endColor || '#4a1e2c'}18`, border: `1px solid ${endColor || '#4a1e2c'}44`, color: endColor || '#dfa0ac' }}>{endFmt}</span>
                            {client.isActive && !client.leftService && displayEndDate && <Countdown endDate={displayEndDate} />}
                          </>
                        : <span className="text-xs" style={{ color: '#5e2230' }}>—</span>}
                    </div>

                    {/* Links */}
                    <div className="flex gap-1.5 flex-wrap">
                      {client.instagramUrl && <LinkPill href={client.instagramUrl} label="IG" color="#e1306c" />}
                      {client.tiktokUrl && <LinkPill href={client.tiktokUrl} label="TT" color="#69c9d0" />}
                      {client.contentSheetUrl && <LinkPill href={client.contentSheetUrl} label="📊" color="#4ade80" />}
                      {client.scriptDocUrl && <LinkPill href={client.scriptDocUrl} label="📄" color="#818cf8" />}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => setRenewClient(client)}
                        className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer font-medium"
                        style={{ background: '#4ade8018', border: '1px solid #4ade8044', color: '#4ade80' }}>
                        Renovó
                      </button>
                      <button onClick={() => setEditClient(client)}
                        className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer"
                        style={{ background: '#1a0810', border: '1px solid #4a1e2c', color: '#dfa0ac' }}>Editar</button>
                      <button onClick={() => setExpandedId(isExpanded ? null : client.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer"
                        style={{ background: '#1a0810', border: '1px solid #4a1e2c', color: '#dfa0ac' }}>
                        {isExpanded ? '▲' : '▼'}
                      </button>
                      <button onClick={() => handleDelete(client.id)} disabled={deletingId === client.id}
                        className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer"
                        style={{ background: '#7f1d1d33', border: '1px solid #7f1d1d', color: '#fca5a5' }}>
                        {deletingId === client.id ? '...' : 'X'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded: date history */}
                  {isExpanded && (
                    <div className="px-6 py-3" style={{ background: '#1a0810', borderTop: '1px solid #4a1e2c33' }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: '#a85060' }}>Historial de fechas</p>
                      <div className="flex flex-col gap-2">
                        {client.startDate && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs w-36 flex-shrink-0" style={{ color: '#5e2230' }}>Inicio de servicio</span>
                            <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#2d1520', border: '1px solid #4a1e2c', color: '#dfa0ac' }}>
                              {fmtDate(client.startDate)}
                              {client.endDate && !client.renewals.length ? ` → ${fmtDate(client.endDate)}` : ''}
                            </span>
                          </div>
                        )}
                        {client.renewals.map((r, i) => {
                          const isEditing = editingRenewal?.id === r.id
                          return (
                            <div key={r.id}>
                              {isEditing ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs w-36 flex-shrink-0" style={{ color: '#5e2230' }}>Renovación {i + 1}</span>
                                  <input type="date" value={editingRenewal.startDate}
                                    onChange={e => setEditingRenewal(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                                    className="px-2 py-0.5 rounded text-xs text-white outline-none"
                                    style={{ background: '#2d1520', border: '1px solid #4ade8055' }} />
                                  <span className="text-xs" style={{ color: '#a85060' }}>→</span>
                                  <input type="date" value={editingRenewal.endDate}
                                    onChange={e => setEditingRenewal(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                                    className="px-2 py-0.5 rounded text-xs text-white outline-none"
                                    style={{ background: '#2d1520', border: '1px solid #4ade8055' }} />
                                  <button onClick={handleSaveRenewal} className="px-2 py-0.5 rounded text-xs cursor-pointer"
                                    style={{ background: '#4ade8022', border: '1px solid #4ade8055', color: '#4ade80' }}>Guardar</button>
                                  <button onClick={() => setEditingRenewal(null)} className="px-2 py-0.5 rounded text-xs cursor-pointer"
                                    style={{ background: '#1a0810', border: '1px solid #4a1e2c', color: '#a85060' }}>Cancelar</button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs w-36 flex-shrink-0" style={{ color: '#5e2230' }}>Renovación {i + 1}</span>
                                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#4ade8011', border: '1px solid #4ade8033', color: '#4ade80' }}>
                                    {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                                  </span>
                                  <button onClick={() => setEditingRenewal({ id: r.id, clientId: client.id, startDate: r.startDate.slice(0, 10), endDate: r.endDate.slice(0, 10) })}
                                    className="px-2 py-0.5 rounded text-xs cursor-pointer"
                                    style={{ background: '#1a0810', border: '1px solid #4a1e2c', color: '#dfa0ac' }}>Editar</button>
                                  <button onClick={() => handleDeleteRenewal(client.id, r.id)}
                                    className="px-2 py-0.5 rounded text-xs cursor-pointer"
                                    style={{ background: '#7f1d1d22', border: '1px solid #7f1d1d55', color: '#fca5a5' }}>Borrar</button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                        {!client.startDate && client.renewals.length === 0 && (
                          <p className="text-xs" style={{ color: '#5e2230' }}>Sin fechas cargadas</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
