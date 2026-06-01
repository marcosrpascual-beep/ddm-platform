'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useState } from 'react'

interface TaskAssignment {
  completedAt: string | null
  task: {
    deadline: string
    title: string
  }
}

interface TaskChartProps {
  assignments: TaskAssignment[]
}

type Period = 'week' | 'month' | 'all'

function getBarData(assignments: TaskAssignment[], period: Period) {
  const now = new Date()
  const cutoff =
    period === 'week'
      ? new Date(now.getTime() - 7 * 86400000)
      : period === 'month'
      ? new Date(now.getTime() - 30 * 86400000)
      : null

  const filtered = cutoff
    ? assignments.filter((a) => new Date(a.task.deadline) >= cutoff!)
    : assignments

  let onTime = 0
  let late = 0
  let pending = 0

  for (const a of filtered) {
    if (!a.completedAt) {
      if (new Date(a.task.deadline) < now) late++
      else pending++
    } else {
      if (new Date(a.completedAt) <= new Date(a.task.deadline)) onTime++
      else late++
    }
  }

  return { onTime, late, pending, total: filtered.length }
}

const COLORS = ['#4ade80', '#ef4444', '#eab308']

export default function TaskChart({ assignments }: TaskChartProps) {
  const [period, setPeriod] = useState<Period>('month')

  const { onTime, late, pending, total } = getBarData(assignments, period)

  const barData = [{ name: 'Tareas', 'A tiempo': onTime, Vencidas: late, Pendientes: pending }]
  const pieData = [
    { name: 'A tiempo', value: onTime },
    { name: 'Vencidas', value: late },
    { name: 'Pendientes', value: pending },
  ]

  return (
    <div className="rounded-xl p-6" style={{ background: '#2d1520', border: '1px solid #4a1e2c' }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white">Rendimiento de Tareas</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
              style={{
                background: period === p ? '#722F37' : '#1a0810',
                color: period === p ? 'white' : '#dfa0ac',
                border: `1px solid ${period === p ? '#8b3d47' : '#4a1e2c'}`,
              }}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Histórico'}
            </button>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <div className="text-center py-12" style={{ color: '#a85060' }}>
          No hay datos para este período
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Summary cards */}
          <div className="flex gap-3 lg:flex-col">
            <StatCard label="A tiempo" value={onTime} color="#4ade80" />
            <StatCard label="Vencidas" value={late} color="#ef4444" />
            <StatCard label="Pendientes" value={pending} color="#eab308" />
          </div>

          {/* Bar chart */}
          <div className="flex-1" style={{ minHeight: 200 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a1e2c" />
                <XAxis dataKey="name" stroke="#a85060" tick={{ fontSize: 12 }} />
                <YAxis stroke="#a85060" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1a0810', border: '1px solid #4a1e2c', borderRadius: 8, color: 'white' }}
                />
                <Legend wrapperStyle={{ color: '#dfa0ac', fontSize: 12 }} />
                <Bar dataKey="A tiempo" fill="#4ade80" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Vencidas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pendientes" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div style={{ width: 180, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a0810', border: '1px solid #4a1e2c', borderRadius: 8, color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="rounded-lg px-4 py-3 text-center min-w-20"
      style={{ background: `${color}11`, border: `1px solid ${color}33` }}
    >
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs mt-0.5" style={{ color: '#dfa0ac' }}>
        {label}
      </div>
    </div>
  )
}
