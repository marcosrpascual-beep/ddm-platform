'use client'
import { useEffect, useState } from 'react'

const MONTHS = ['Dic', 'Ene', 'Feb', 'Mar', 'Abr']
const BARS   = [ 64,    71,    63,    76,    82 ]

const TABS = [
  { id: 'ventas',      label: 'Panel de ventas' },
  { id: 'equipo',      label: 'Equipo' },
  { id: 'clientes',    label: 'Clientes' },
  { id: 'kpis',        label: 'KPIs' },
  { id: 'facturacion', label: 'Facturación' },
  { id: 'prospeccion', label: 'Prospección' },
]

function Clock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    update(); const id = setInterval(update, 1000); return () => clearInterval(id)
  }, [])
  return <span>{time}</span>
}

function AnimatedNumber({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let cur = 0; const step = Math.ceil(target / 60)
    const id = setInterval(() => { cur += step; if (cur >= target) { setVal(target); clearInterval(id) } else setVal(cur) }, 20)
    return () => clearInterval(id)
  }, [target])
  return <>{prefix}{val.toLocaleString('es-AR')}{suffix}</>
}

function CircleProgress({ pct, mounted }: { pct: number; mounted: boolean }) {
  const r = 100; const circ = 2 * Math.PI * r
  const offset = circ - (mounted ? pct / 100 : 0) * circ
  return (
    <svg width="260" height="260" viewBox="0 0 260 260">
      <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#722F37" /><stop offset="100%" stopColor="#c9a227" /></linearGradient></defs>
      <circle cx="130" cy="130" r={r} fill="none" stroke="#2d1520" strokeWidth="18" />
      <circle cx="130" cy="130" r={r} fill="none" stroke="url(#gold)" strokeWidth="18"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 130 130)" style={{ transition: 'stroke-dashoffset 1.8s ease' }} />
      <text x="130" y="112" textAnchor="middle" fill="white" fontSize="54" fontWeight="bold" fontFamily="monospace">82%</text>
      <text x="130" y="148" textAnchor="middle" fill="#dfa0ac" fontSize="13" fontFamily="sans-serif">cierre en 1ra llamada</text>
      <text x="130" y="168" textAnchor="middle" fill="#dfa0ac" fontSize="13" fontFamily="sans-serif">sin objeciones</text>
    </svg>
  )
}

// ─── Tab contents ─────────────────────────────────────────────────────────────

function TabVentas({ mounted }: { mounted: boolean }) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Cierre en 1ra llamada', value: 82, suffix: '%', sub: '+19% vs mes anterior', color: '#c9a227' },
          { label: 'Llamadas — Abril',       value: 387, suffix: '',  sub: '↑ 23 en la última semana', color: '#60a5fa' },
          { label: 'Clientes cerrados',      value: 318, suffix: '',  sub: 'de 387 llamadas totales', color: '#4ade80' },
          { label: 'Satisfacción cliente',   value: 94,  suffix: '%', sub: 'NPS promedio: 78', color: '#a78bfa' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: '#1a0810', border: `1px solid ${s.color}33` }}>
            <p className="text-xs mb-3" style={{ color: '#a85060' }}>{s.label}</p>
            <p className="text-4xl font-bold mb-1" style={{ color: s.color }}>
              {mounted ? <AnimatedNumber target={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
            </p>
            <p className="text-xs" style={{ color: '#a85060' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 rounded-2xl p-6 flex flex-col items-center justify-center" style={{ background: '#1a0810', border: '1px solid #c9a22744' }}>
          <p className="text-sm font-semibold text-white mb-5">Tasa de cierre global</p>
          <CircleProgress pct={82} mounted={mounted} />
          <div className="mt-5 w-full space-y-2.5">
            {[{ label: 'Sin objeciones', pct: 82, color: '#c9a227' }, { label: 'Con 1 objeción', pct: 13, color: '#60a5fa' }, { label: 'No cerrado', pct: 5, color: '#4a2030' }].map((r) => (
              <div key={r.label} className="flex items-center gap-2">
                <span className="text-xs w-28" style={{ color: '#dfa0ac' }}>{r.label}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: '#2d1520' }}>
                  <div className="h-1.5 rounded-full" style={{ width: mounted ? `${r.pct}%` : '0%', background: r.color, transition: 'width 1.8s ease' }} />
                </div>
                <span className="text-xs font-mono" style={{ color: r.color }}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-3 rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-semibold text-white">Evolución de cierre — últimos 5 meses</p>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1a4a2d', color: '#4ade80' }}>+28% en 5 meses</span>
          </div>
          <div className="flex items-end gap-4 h-40">
            {BARS.map((h, i) => {
              const isLast = i === BARS.length - 1
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: isLast ? '#c9a227' : '#dfa0ac' }}>{h}%</span>
                  <div className="w-full rounded-t-lg" style={{ height: mounted ? `${(h / 90) * 100}%` : '0%', background: isLast ? 'linear-gradient(to top, #722F37, #c9a227)' : 'linear-gradient(to top, #3a1520, #722F37)', transition: `height ${0.4 + i * 0.15}s ease`, minHeight: '4px' }} />
                  <span className="text-xs font-medium" style={{ color: isLast ? '#c9a227' : '#a85060' }}>{MONTHS[i]}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-5 rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: '#c9a22711', border: '1px solid #c9a22733' }}>
            <span style={{ color: '#c9a227' }}>📊</span>
            <p className="text-xs" style={{ color: '#dfa0ac' }}>Febrero fue el único mes con caída. Desde marzo la tasa viene en máximos históricos.</p>
          </div>
        </div>
      </div>

      {/* Últimas llamadas */}
      <div className="rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white">Últimas llamadas registradas</p>
          <span className="text-xs" style={{ color: '#a85060' }}>Abril 2025</span>
        </div>
        <table className="w-full text-xs">
          <thead><tr style={{ color: '#a85060' }}>{['Prospecto','Fecha','Duración','Resultado','Responsable'].map(h=><th key={h} className="text-left pb-3 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y" style={{ borderColor: '#2d1520' }}>
            {[
              ['Martina G.',  '28 abr', '14 min', 'Cerrado',     'Admin',  '#4ade80'],
              ['Diego F.',    '28 abr', '9 min',  'Cerrado',     'Ezequiel R.','#4ade80'],
              ['Lucía M.',    '27 abr', '22 min', 'Seguimiento', 'Admin',  '#eab308'],
              ['Tomás A.',    '27 abr', '7 min',  'Cerrado',     'Ezequiel R.','#4ade80'],
              ['Valentina S.','26 abr', '18 min', 'Cerrado',     'Admin',  '#4ade80'],
              ['Rodrigo B.',  '26 abr', '31 min', 'No cerrado',  'Ezequiel R.','#ef4444'],
              ['Camila D.',   '25 abr', '11 min', 'Cerrado',     'Admin',  '#4ade80'],
              ['Nicolás V.',  '25 abr', '8 min',  'Cerrado',     'Ezequiel R.','#4ade80'],
            ].map(([nom,fecha,dur,res,resp,col])=>(
              <tr key={nom as string}>
                <td className="py-2.5 text-white font-medium">{nom}</td>
                <td style={{ color: '#a85060' }}>{fecha}</td>
                <td style={{ color: '#a85060' }}>{dur}</td>
                <td><span className="px-2 py-0.5 rounded-full text-xs" style={{ background: `${col}22`, color: col as string }}>{res}</span></td>
                <td style={{ color: '#dfa0ac' }}>{resp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl p-5" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
          <p className="text-sm font-semibold text-white mb-4">Cierre por día de la semana</p>
          {[['Lunes','88%','#c9a227'],['Martes','84%','#60a5fa'],['Miércoles','79%','#60a5fa'],['Jueves','86%','#4ade80'],['Viernes','71%','#a85060']].map(([d,v,c])=>(
            <div key={d as string} className="flex items-center gap-3 mb-2">
              <span className="text-xs w-20" style={{ color: '#dfa0ac' }}>{d}</span>
              <div className="flex-1 h-1.5 rounded-full" style={{ background: '#2d1520' }}>
                <div className="h-1.5 rounded-full" style={{ width: v as string, background: c as string }} />
              </div>
              <span className="text-xs font-mono w-8 text-right" style={{ color: c as string }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-5" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
          <p className="text-sm font-semibold text-white mb-4">Leads por fuente</p>
          {[['Instagram orgánico','47%','#a78bfa'],['Referidos','31%','#4ade80'],['Instagram ads','14%','#60a5fa'],['Otros','8%','#a85060']].map(([src,pct,c])=>(
            <div key={src as string} className="flex items-center gap-3 mb-2">
              <span className="text-xs w-36" style={{ color: '#dfa0ac' }}>{src}</span>
              <div className="flex-1 h-1.5 rounded-full" style={{ background: '#2d1520' }}>
                <div className="h-1.5 rounded-full" style={{ width: pct as string, background: c as string }} />
              </div>
              <span className="text-xs font-mono w-8 text-right" style={{ color: c as string }}>{pct}</span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-5" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
          <p className="text-sm font-semibold text-white mb-4">Tiempo promedio de cierre</p>
          {[['Duración promedio llamada','12 min'],['Tiempo hasta cierre','0 días'],['Follow-ups promedio','0.3'],['Objeciones por llamada','0.2']].map(([label,val])=>(
            <div key={label as string} className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: '#a85060' }}>{label}</span>
              <span className="text-xs font-bold text-white">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabEquipo() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Miembros activos', value: '8', color: '#4ade80' },
          { label: 'Llamadas promedio/día', value: '19.3', color: '#60a5fa' },
          { label: 'Mejor cierre del mes', value: '91%', color: '#c9a227' },
          { label: 'Tareas completadas', value: '143', color: '#a78bfa' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: '#1a0810', border: `1px solid ${s.color}33` }}>
            <p className="text-xs mb-3" style={{ color: '#a85060' }}>{s.label}</p>
            <p className="text-4xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
        <p className="text-sm font-semibold text-white mb-4">Rendimiento individual — Abril 2025</p>
        <table className="w-full text-xs">
          <thead><tr style={{ color: '#a85060' }}>{['Miembro','Llamadas','Cerrados','Tasa cierre','Duración prom.','NPS','Estado'].map(h=><th key={h} className="text-left pb-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[
              ['Admin',    '94', '86', '91%', '11 min', '82', '#4ade80', 'Activo'],
              ['Ezequiel R.',  '88', '79', '90%', '13 min', '79', '#4ade80', 'Activo'],
              ['Valentina S.', '71', '61', '86%', '14 min', '76', '#4ade80', 'Activo'],
              ['Diego F.',     '64', '51', '80%', '16 min', '71', '#4ade80', 'Activo'],
              ['Camila D.',    '38', '28', '74%', '19 min', '68', '#eab308', 'Activo'],
              ['Tomás A.',     '32', '13', '41%', '28 min', '54', '#ef4444', 'En revisión'],
            ].map(([nom,ll,cer,tasa,dur,nps,col,est])=>(
              <tr key={nom as string} style={{ borderTop: '1px solid #2d1520' }}>
                <td className="py-3 text-white font-medium">{nom}</td>
                <td style={{ color: '#dfa0ac' }}>{ll}</td>
                <td style={{ color: '#dfa0ac' }}>{cer}</td>
                <td><span style={{ color: col as string, fontWeight: 'bold' }}>{tasa}</span></td>
                <td style={{ color: '#a85060' }}>{dur}</td>
                <td style={{ color: '#dfa0ac' }}>{nps}</td>
                <td><span className="px-2 py-0.5 rounded-full" style={{ background: `${col}22`, color: col as string }}>{est}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabClientes() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Clientes activos', value: '47', color: '#4ade80' },
          { label: 'LTV promedio', value: '$2.840', color: '#c9a227' },
          { label: 'Churn rate', value: '3.2%', color: '#ef4444' },
          { label: 'Retención promedio', value: '8.4 meses', color: '#60a5fa' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: '#1a0810', border: `1px solid ${s.color}33` }}>
            <p className="text-xs mb-3" style={{ color: '#a85060' }}>{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
        <p className="text-sm font-semibold text-white mb-4">Cartera de clientes</p>
        <table className="w-full text-xs">
          <thead><tr style={{ color: '#a85060' }}>{['Cliente','Inicio','Vencimiento','Estado','LTV','DDM asignado','Renovaciones'].map(h=><th key={h} className="text-left pb-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[
              ['@fitnessbymartina','oct 2024','abr 2025','Activo','$3.200','Admin','1'],
              ['@chefrodriguezok','ago 2024','abr 2025','Activo','$4.800','Ezequiel R.','2'],
              ['@luciamodabsas','ene 2025','abr 2025','Activo','$1.600','Valentina S.','0'],
              ['@gastrobar.norte','jul 2024','mar 2025','Renovó','$6.400','Admin','3'],
              ['@psicologaclara','feb 2025','abr 2025','Activo','$1.600','Diego F.','0'],
              ['@abogadosunidos','nov 2024','ene 2025','Abandonó','$2.400','Camila D.','0'],
            ].map(([cli,ini,fin,est,ltv,ddm,ren])=>(
              <tr key={cli as string} style={{ borderTop: '1px solid #2d1520' }}>
                <td className="py-3 text-white font-medium">{cli}</td>
                <td style={{ color: '#a85060' }}>{ini}</td>
                <td style={{ color: '#a85060' }}>{fin}</td>
                <td><span className="px-2 py-0.5 rounded-full" style={{ background: est === 'Activo' ? '#4ade8022' : est === 'Renovó' ? '#60a5fa22' : '#ef444422', color: est === 'Activo' ? '#4ade80' : est === 'Renovó' ? '#60a5fa' : '#ef4444' }}>{est}</span></td>
                <td style={{ color: '#c9a227', fontWeight: 'bold' }}>{ltv}</td>
                <td style={{ color: '#dfa0ac' }}>{ddm}</td>
                <td style={{ color: '#a85060', textAlign: 'center' }}>{ren}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabKPIs() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: 'Tasa de cierre 1ra llamada', value: '82%', change: '+19%', color: '#c9a227', desc: 'vs 63% en feb' },
        { label: 'Tasa de retención mensual', value: '96.8%', change: '+1.2%', color: '#4ade80', desc: 'vs 95.6% en mar' },
        { label: 'Costo por lead', value: '$12.40', change: '-18%', color: '#4ade80', desc: 'vs $15.10 en mar' },
        { label: 'Revenue por llamada', value: '$184', change: '+22%', color: '#c9a227', desc: 'vs $151 en mar' },
        { label: 'NPS del equipo', value: '78', change: '+4', color: '#a78bfa', desc: 'vs 74 en mar' },
        { label: 'Tiempo prom. al cierre', value: '12 min', change: '-3 min', color: '#4ade80', desc: 'vs 15 min en mar' },
        { label: 'Churn mensual', value: '3.2%', change: '-0.8%', color: '#4ade80', desc: 'vs 4.0% en mar' },
        { label: 'Llamadas por día', value: '19.3', change: '+2.1', color: '#60a5fa', desc: 'vs 17.2 en mar' },
        { label: 'Follow-ups necesarios', value: '0.3', change: '-0.4', color: '#4ade80', desc: 'vs 0.7 en mar' },
      ].map((k) => (
        <div key={k.label} className="rounded-2xl p-5" style={{ background: '#1a0810', border: `1px solid ${k.color}33` }}>
          <p className="text-xs mb-2" style={{ color: '#a85060' }}>{k.label}</p>
          <p className="text-4xl font-bold mb-1" style={{ color: k.color }}>{k.value}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: k.change.startsWith('+') && k.label !== 'Churn mensual' ? '#4ade80' : k.change.startsWith('-') ? '#4ade80' : '#ef4444' }}>{k.change}</span>
            <span className="text-xs" style={{ color: '#a85060' }}>{k.desc}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function TabFacturacion() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'MRR — Abril', value: '$133.600', color: '#c9a227' },
          { label: 'ARR proyectado', value: '$1.603.200', color: '#4ade80' },
          { label: 'Ticket promedio', value: '$2.840', color: '#60a5fa' },
          { label: 'Crecimiento MoM', value: '+14.2%', color: '#a78bfa' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: '#1a0810', border: `1px solid ${s.color}33` }}>
            <p className="text-xs mb-3" style={{ color: '#a85060' }}>{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
        <p className="text-sm font-semibold text-white mb-4">Ingresos mensuales — historial</p>
        <table className="w-full text-xs">
          <thead><tr style={{ color: '#a85060' }}>{['Mes','Clientes activos','MRR','Nuevos','Churn','Crecimiento'].map(h=><th key={h} className="text-left pb-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[
              ['Diciembre 2024','38','$107.920','+6','-2','+11.4%'],
              ['Enero 2025',   '41','$116.440','+5','-2','+7.9%'],
              ['Febrero 2025', '39','$110.760','+2','-4','-4.9%'],
              ['Marzo 2025',   '44','$124.960','+7','-2','+12.8%'],
              ['Abril 2025',   '47','$133.600','+5','-2','+6.9%'],
            ].map(([mes,cli,mrr,nu,ch,cre])=>(
              <tr key={mes as string} style={{ borderTop: '1px solid #2d1520' }}>
                <td className="py-3 text-white">{mes}</td>
                <td style={{ color: '#dfa0ac' }}>{cli}</td>
                <td style={{ color: '#c9a227', fontWeight: 'bold' }}>{mrr}</td>
                <td style={{ color: '#4ade80' }}>{nu}</td>
                <td style={{ color: '#ef4444' }}>{ch}</td>
                <td style={{ color: (cre as string).startsWith('+') ? '#4ade80' : '#ef4444', fontWeight: 'bold' }}>{cre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabProspeccion() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Leads este mes', value: '412', color: '#60a5fa' },
          { label: 'Conversión lead→llamada', value: '94%', color: '#c9a227' },
          { label: 'Llamadas agendadas', value: '387', color: '#a78bfa' },
          { label: 'Pipeline estimado', value: '$21.400', color: '#4ade80' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: '#1a0810', border: `1px solid ${s.color}33` }}>
            <p className="text-xs mb-3" style={{ color: '#a85060' }}>{s.label}</p>
            <p className="text-4xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
        <p className="text-sm font-semibold text-white mb-4">Pipeline activo</p>
        <table className="w-full text-xs">
          <thead><tr style={{ color: '#a85060' }}>{['Prospecto','Fuente','Etapa','Valor est.','Próxima acción','Responsable'].map(h=><th key={h} className="text-left pb-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[
              ['@tatuana.fit',     'Instagram', 'Llamada agendada', '$1.600', '30 abr — 16:00', 'Admin'],
              ['@coachsergio',     'Referido',  'Propuesta enviada','$3.200', '1 may — 10:00',  'Ezequiel R.'],
              ['@doctorjuanluna', 'Instagram', 'Primer contacto',  '$1.600', '1 may — 15:30',  'Valentina S.'],
              ['@estudioarquibsas','Ads',      'Llamada agendada', '$2.400', '2 may — 11:00',  'Admin'],
              ['@reposteriamia',   'Referido',  'Negociación',      '$1.600', '2 may — 17:00',  'Diego F.'],
            ].map(([pro,fuen,etapa,val,prox,resp])=>(
              <tr key={pro as string} style={{ borderTop: '1px solid #2d1520' }}>
                <td className="py-3 text-white font-medium">{pro}</td>
                <td style={{ color: '#a85060' }}>{fuen}</td>
                <td><span className="px-2 py-0.5 rounded-full" style={{ background: '#60a5fa22', color: '#60a5fa' }}>{etapa}</span></td>
                <td style={{ color: '#c9a227', fontWeight: 'bold' }}>{val}</td>
                <td style={{ color: '#dfa0ac' }}>{prox}</td>
                <td style={{ color: '#dfa0ac' }}>{resp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState('ventas')
  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  return (
    <div className="min-h-screen" style={{ background: '#0f0508', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{ background: '#722F37', borderBottom: '1px solid #8b3d47' }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg tracking-widest text-white" style={{ background: 'rgba(255,255,255,0.15)' }}>DDM</div>
            <div>
              <p className="text-white font-bold text-base leading-none">CRM · DDM Agency</p>
              <p className="text-xs leading-none mt-0.5" style={{ color: '#f0d0d5' }}>Abril 2025</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: '#1a4a2d', color: '#4ade80', border: '1px solid #16a34a' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>
              LIVE
            </div>
            <span className="text-white font-mono text-sm"><Clock /></span>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-1 pt-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-5 py-2.5 text-sm font-medium cursor-pointer transition-all rounded-t-lg"
              style={{
                background: tab === t.id ? '#0f0508' : 'transparent',
                color: tab === t.id ? 'white' : 'rgba(255,255,255,0.65)',
                borderTop: tab === t.id ? '2px solid #c9a227' : '2px solid transparent',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {tab === 'ventas'      && <TabVentas mounted={mounted} />}
        {tab === 'equipo'      && <TabEquipo />}
        {tab === 'clientes'    && <TabClientes />}
        {tab === 'kpis'        && <TabKPIs />}
        {tab === 'facturacion' && <TabFacturacion />}
        {tab === 'prospeccion' && <TabProspeccion />}
      </main>
    </div>
  )
}
