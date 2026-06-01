'use client'
import { useEffect, useState } from 'react'

const TABS = [
  { id: 'contenido',   label: 'Contenido' },
  { id: 'plataformas', label: 'Plataformas' },
  { id: 'clientes',    label: 'Clientes' },
  { id: 'engagement',  label: 'Engagement' },
  { id: 'resultados',  label: 'Resultados' },
  { id: 'equipo',      label: 'Equipo' },
]

function Clock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const u = () => setTime(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    u(); const id = setInterval(u, 1000); return () => clearInterval(id)
  }, [])
  return <span>{time}</span>
}

function Num({ n, suffix = '', prefix = '' }: { n: number; suffix?: string; prefix?: string }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let c = 0; const step = Math.ceil(n / 80)
    const id = setInterval(() => { c += step; if (c >= n) { setV(n); clearInterval(id) } else setV(c) }, 18)
    return () => clearInterval(id)
  }, [n])
  return <>{prefix}{v.toLocaleString('es-AR')}{suffix}</>
}

function Bar({ label, pct, color, val }: { label: string; pct: number; color: string; val: string }) {
  const [w, setW] = useState(0)
  useEffect(() => { setTimeout(() => setW(pct), 200) }, [pct])
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-36 shrink-0" style={{ color: '#dfa0ac' }}>{label}</span>
      <div className="flex-1 h-2 rounded-full" style={{ background: '#2d1520' }}>
        <div className="h-2 rounded-full" style={{ width: `${w}%`, background: color, transition: 'width 1.4s ease' }} />
      </div>
      <span className="text-xs font-mono w-16 text-right shrink-0" style={{ color }}>{val}</span>
    </div>
  )
}

// ── Tab Contenido ─────────────────────────────────────────────────────────────
function TabContenido({ m }: { m: boolean }) {
  const MESES = ['Dic', 'Ene', 'Feb', 'Mar', 'Abr']
  const VIDS  = [11200, 12800, 10400, 15600, 18247]
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Videos publicados — Abril', n: 18247, suffix: '',  color: '#c9a227', sub: '+17% vs marzo' },
          { label: 'Reproducciones totales',    n: 47200000, suffix: '', color: '#60a5fa', sub: '47.2 millones', fmt: true },
          { label: 'Cuentas alcanzadas',        n: 8900000, suffix: '', color: '#4ade80', sub: '8.9 millones de personas', fmt: true },
          { label: 'Consultas generadas',       n: 3840, suffix: '',    color: '#a78bfa', sub: 'para los clientes DDM' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: '#1a0810', border: `1px solid ${s.color}33` }}>
            <p className="text-xs mb-3" style={{ color: '#a85060' }}>{s.label}</p>
            <p className="text-4xl font-bold mb-1" style={{ color: s.color }}>
              {m ? (s.fmt
                ? (s.n >= 1000000 ? <>{(s.n/1000000).toFixed(1)}M</> : <>{(s.n/1000).toFixed(0)}K</>)
                : <Num n={s.n} suffix={s.suffix} />
              ) : '0'}
            </p>
            <p className="text-xs" style={{ color: '#a85060' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Histograma + breakdown */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-semibold text-white">Videos publicados — últimos 5 meses</p>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1a4a2d', color: '#4ade80' }}>+63% en 5 meses</span>
          </div>
          <div className="flex items-end gap-4 h-44">
            {VIDS.map((v, i) => {
              const isLast = i === VIDS.length - 1
              const max = Math.max(...VIDS)
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: isLast ? '#c9a227' : '#dfa0ac' }}>{v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}</span>
                  <div className="w-full rounded-t-lg" style={{ height: m ? `${(v / max) * 100}%` : '0%', background: isLast ? 'linear-gradient(to top, #722F37, #c9a227)' : 'linear-gradient(to top, #3a1520, #722F37)', transition: `height ${0.4 + i * 0.15}s ease`, minHeight: '4px' }} />
                  <span className="text-xs" style={{ color: isLast ? '#c9a227' : '#a85060' }}>{MESES[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="col-span-2 rounded-2xl p-6 space-y-4" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
          <p className="text-sm font-semibold text-white">Tipo de contenido publicado</p>
          <Bar label="Reels / TikToks"   pct={58} color="#c9a227" val="10.583" />
          <Bar label="Stories"           pct={24} color="#60a5fa" val="4.379" />
          <Bar label="Posts estáticos"   pct={11} color="#4ade80" val="2.007" />
          <Bar label="Carruseles"        pct={5}  color="#a78bfa" val="912" />
          <Bar label="Videos largos"     pct={2}  color="#f472b6" val="366" />
          <div className="pt-2" style={{ borderTop: '1px solid #2d1520' }}>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#a85060' }}>Promedio por cliente/día</span>
              <span className="font-bold text-white">12.9 piezas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top contenido */}
      <div className="rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
        <p className="text-sm font-semibold text-white mb-4">Top contenido del mes</p>
        <table className="w-full text-xs">
          <thead><tr style={{ color: '#a85060' }}>{['Cliente','Plataforma','Formato','Reproducciones','Likes','Compartidos','Consultas'].map(h=><th key={h} className="text-left pb-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[
              ['@fitnessbymartina','TikTok',   'Reel',    '2.4M', '186k','43k','284'],
              ['@chefrodriguezok', 'Instagram', 'Reel',    '1.8M', '142k','31k','197'],
              ['@gastrobar.norte', 'Instagram', 'Carrusel','980k', '74k', '18k','143'],
              ['@psicologaclara',  'TikTok',   'Reel',    '760k', '58k', '12k','98'],
              ['@luciamodabsas',   'Instagram', 'Reel',    '620k', '47k', '9k', '74'],
              ['@coachsergio',     'TikTok',   'Reel',    '540k', '41k', '8k', '61'],
            ].map(([cli,plat,fmt,rep,lk,sh,cons])=>(
              <tr key={cli as string} style={{ borderTop: '1px solid #2d1520' }}>
                <td className="py-2.5 text-white font-medium">{cli}</td>
                <td><span className="px-2 py-0.5 rounded-full" style={{ background: plat === 'TikTok' ? '#60a5fa22' : '#f472b622', color: plat === 'TikTok' ? '#60a5fa' : '#f472b6' }}>{plat}</span></td>
                <td style={{ color: '#a85060' }}>{fmt}</td>
                <td style={{ color: '#c9a227', fontWeight: 'bold' }}>{rep}</td>
                <td style={{ color: '#dfa0ac' }}>{lk}</td>
                <td style={{ color: '#dfa0ac' }}>{sh}</td>
                <td style={{ color: '#4ade80', fontWeight: 'bold' }}>{cons}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tab Plataformas ───────────────────────────────────────────────────────────
function TabPlataformas() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { plat: 'Instagram', color: '#f472b6', videos: '9.840', repros: '22.1M', alcance: '4.8M', eng: '8.2%', icon: '📸' },
          { plat: 'TikTok',   color: '#60a5fa', videos: '7.290', repros: '21.4M', alcance: '3.6M', eng: '9.7%', icon: '🎵' },
          { plat: 'YouTube',  color: '#ef4444', videos: '1.117', repros: '3.7M',  alcance: '500k', eng: '4.1%', icon: '▶️' },
        ].map((p) => (
          <div key={p.plat} className="rounded-2xl p-6" style={{ background: '#1a0810', border: `1px solid ${p.color}33` }}>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">{p.icon}</span>
              <span className="text-base font-bold text-white">{p.plat}</span>
            </div>
            {[['Videos publicados', p.videos, p.color],['Reproducciones', p.repros, '#dfa0ac'],['Alcance', p.alcance, '#dfa0ac'],['Engagement rate', p.eng, p.eng > '8%' ? '#4ade80' : '#eab308']].map(([l,v,c])=>(
              <div key={l as string} className="flex justify-between py-2" style={{ borderBottom: '1px solid #2d1520' }}>
                <span className="text-xs" style={{ color: '#a85060' }}>{l}</span>
                <span className="text-xs font-bold" style={{ color: c as string }}>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
        <p className="text-sm font-semibold text-white mb-5">Distribución de reproducciones por plataforma</p>
        <Bar label="Instagram"    pct={47} color="#f472b6" val="22.1M" />
        <div className="mb-3" />
        <Bar label="TikTok"       pct={45} color="#60a5fa" val="21.4M" />
        <div className="mb-3" />
        <Bar label="YouTube"      pct={8}  color="#ef4444" val="3.7M" />
      </div>
    </div>
  )
}

// ── Tab Clientes ──────────────────────────────────────────────────────────────
function TabClientes() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Clientes activos',         value: '47',    color: '#4ade80' },
          { label: 'Videos prom. por cliente',  value: '388',   color: '#c9a227' },
          { label: 'Mejor cliente del mes',     value: '2.4M',  color: '#f472b6' },
          { label: 'Consultas promedio/cliente',value: '81.7',  color: '#a78bfa' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: '#1a0810', border: `1px solid ${s.color}33` }}>
            <p className="text-xs mb-3" style={{ color: '#a85060' }}>{s.label}</p>
            <p className="text-4xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
        <p className="text-sm font-semibold text-white mb-4">Rendimiento por cliente — Abril 2025</p>
        <table className="w-full text-xs">
          <thead><tr style={{ color: '#a85060' }}>{['Cliente','Videos','Reproducciones','Seguidores +','Consultas','Engagement','Estado'].map(h=><th key={h} className="text-left pb-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[
              ['@fitnessbymartina','624','4.2M','+8.400','284','9.8%','#4ade80'],
              ['@chefrodriguezok', '518','3.1M','+6.200','197','8.4%','#4ade80'],
              ['@gastrobar.norte', '497','2.8M','+5.100','143','7.1%','#4ade80'],
              ['@psicologaclara',  '412','1.9M','+3.800','98', '7.4%','#4ade80'],
              ['@luciamodabsas',   '388','1.6M','+3.100','74', '6.9%','#4ade80'],
              ['@coachsergio',     '374','1.4M','+2.800','61', '7.2%','#4ade80'],
              ['@abogadosunidos',  '214','620k','+980',  '28', '4.1%','#eab308'],
              ['@reposteriamia',   '183','410k','+640',  '17', '3.8%','#eab308'],
            ].map(([cli,vid,rep,seg,cons,eng,col])=>(
              <tr key={cli as string} style={{ borderTop: '1px solid #2d1520' }}>
                <td className="py-2.5 text-white font-medium">{cli}</td>
                <td style={{ color: '#dfa0ac' }}>{vid}</td>
                <td style={{ color: '#c9a227', fontWeight: 'bold' }}>{rep}</td>
                <td style={{ color: '#4ade80' }}>{seg}</td>
                <td style={{ color: '#a78bfa', fontWeight: 'bold' }}>{cons}</td>
                <td style={{ color: col as string }}>{eng}</td>
                <td><span className="px-2 py-0.5 rounded-full text-xs" style={{ background: `${col}22`, color: col as string }}>●</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tab Engagement ────────────────────────────────────────────────────────────
function TabEngagement() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Engagement rate promedio', value: '7.4%',   color: '#c9a227', sub: 'Promedio industria: 2.1%' },
          { label: 'Likes totales',            value: '3.84M',  color: '#f472b6', sub: 'Abril 2025' },
          { label: 'Comentarios totales',      value: '284k',   color: '#60a5fa', sub: 'Promedio: 15.6 por video' },
          { label: 'Compartidos totales',      value: '612k',   color: '#4ade80', sub: 'Promedio: 33.6 por video' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: '#1a0810', border: `1px solid ${s.color}33` }}>
            <p className="text-xs mb-3" style={{ color: '#a85060' }}>{s.label}</p>
            <p className="text-4xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: '#a85060' }}>{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
          <p className="text-sm font-semibold text-white mb-5">Engagement rate por plataforma</p>
          <Bar label="TikTok"          pct={97} color="#60a5fa" val="9.7%" />
          <div className="mb-3" />
          <Bar label="Instagram Reels" pct={88} color="#f472b6" val="8.8%" />
          <div className="mb-3" />
          <Bar label="Instagram Posts" pct={62} color="#a78bfa" val="6.2%" />
          <div className="mb-3" />
          <Bar label="Stories"         pct={41} color="#4ade80" val="4.1%" />
          <div className="mb-3" />
          <Bar label="YouTube"         pct={21} color="#ef4444" val="4.1%" />
        </div>
        <div className="rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
          <p className="text-sm font-semibold text-white mb-5">Mejor horario de publicación</p>
          {[
            ['07:00 – 09:00', '11.2%', '#c9a227'],
            ['12:00 – 14:00', '8.7%',  '#4ade80'],
            ['18:00 – 21:00', '9.4%',  '#60a5fa'],
            ['21:00 – 23:00', '7.1%',  '#dfa0ac'],
            ['Resto del día', '3.8%',  '#a85060'],
          ].map(([h,e,c])=>(
            <div key={h as string} className="flex justify-between items-center py-2.5" style={{ borderBottom: '1px solid #2d1520' }}>
              <span className="text-xs" style={{ color: '#dfa0ac' }}>{h}</span>
              <span className="text-sm font-bold" style={{ color: c as string }}>{e}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tab Resultados ────────────────────────────────────────────────────────────
function TabResultados() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Consultas generadas',      value: '3.840', color: '#a78bfa', sub: 'para clientes DDM' },
          { label: 'Seguidores ganados total',  value: '124.3k',color: '#4ade80', sub: 'entre todos los clientes' },
          { label: 'Costo por consulta',        value: '$0',    color: '#c9a227', sub: '100% orgánico' },
          { label: 'Conversión vista→consulta', value: '0.81%', color: '#60a5fa', sub: 'vs 0.3% promedio industria' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: '#1a0810', border: `1px solid ${s.color}33` }}>
            <p className="text-xs mb-3" style={{ color: '#a85060' }}>{s.label}</p>
            <p className="text-4xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: '#a85060' }}>{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
        <p className="text-sm font-semibold text-white mb-4">Consultas generadas por cliente — Abril 2025</p>
        <table className="w-full text-xs">
          <thead><tr style={{ color: '#a85060' }}>{['Cliente','Nicho','Reproducciones','Consultas','Conv. rate','Seguidores +','Plataforma'].map(h=><th key={h} className="text-left pb-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[
              ['@fitnessbymartina','Fitness',    '4.2M','284','0.94%','+8.400','TikTok + IG'],
              ['@chefrodriguezok', 'Gastronomía','3.1M','197','0.88%','+6.200','IG + TikTok'],
              ['@gastrobar.norte', 'Restaurante','2.8M','143','0.71%','+5.100','Instagram'],
              ['@psicologaclara',  'Salud mental','1.9M','98', '0.79%','+3.800','TikTok + IG'],
              ['@luciamodabsas',   'Moda',       '1.6M','74', '0.67%','+3.100','Instagram'],
              ['@coachsergio',     'Coaching',   '1.4M','61', '0.72%','+2.800','TikTok'],
            ].map(([cli,nicho,rep,cons,conv,seg,plat])=>(
              <tr key={cli as string} style={{ borderTop: '1px solid #2d1520' }}>
                <td className="py-2.5 text-white font-medium">{cli}</td>
                <td style={{ color: '#a85060' }}>{nicho}</td>
                <td style={{ color: '#c9a227' }}>{rep}</td>
                <td style={{ color: '#a78bfa', fontWeight: 'bold' }}>{cons}</td>
                <td style={{ color: '#4ade80' }}>{conv}</td>
                <td style={{ color: '#4ade80' }}>{seg}</td>
                <td style={{ color: '#dfa0ac' }}>{plat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tab Equipo ────────────────────────────────────────────────────────────────
function TabEquipo() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Editores activos',         value: '8',    color: '#4ade80' },
          { label: 'Videos por editor/día',    value: '76.4', color: '#c9a227' },
          { label: 'Tiempo prom. por video',   value: '23 min',color: '#60a5fa' },
          { label: 'Aprobación primera entrega', value: '94%',  color: '#a78bfa' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: '#1a0810', border: `1px solid ${s.color}33` }}>
            <p className="text-xs mb-3" style={{ color: '#a85060' }}>{s.label}</p>
            <p className="text-4xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-6" style={{ background: '#1a0810', border: '1px solid #4a1e2c' }}>
        <p className="text-sm font-semibold text-white mb-4">Producción individual — Abril 2025</p>
        <table className="w-full text-xs">
          <thead><tr style={{ color: '#a85060' }}>{['Editor','Videos entregados','Clientes asignados','Aprobación 1ra entrega','Tiempo prom.','Revisiones prom.','Rating'].map(h=><th key={h} className="text-left pb-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[
              ['Admin',     '2.847','12','97%','19 min','0.2','⭐⭐⭐⭐⭐'],
              ['Ezequiel R.',   '2.614','11','96%','21 min','0.3','⭐⭐⭐⭐⭐'],
              ['Valentina S.',  '2.380', '9','94%','23 min','0.4','⭐⭐⭐⭐⭐'],
              ['Diego F.',      '2.190', '9','93%','24 min','0.5','⭐⭐⭐⭐'],
              ['Camila D.',     '2.041', '8','91%','26 min','0.7','⭐⭐⭐⭐'],
              ['Luciana M.',    '1.980', '8','90%','27 min','0.8','⭐⭐⭐⭐'],
              ['Tomás A.',      '1.874', '7','88%','29 min','1.1','⭐⭐⭐'],
              ['Florencia B.',  '1.321', '5','84%','34 min','1.4','⭐⭐⭐'],
            ].map(([nom,vid,cli,apr,t,rev,rat])=>(
              <tr key={nom as string} style={{ borderTop: '1px solid #2d1520' }}>
                <td className="py-2.5 text-white font-medium">{nom}</td>
                <td style={{ color: '#c9a227', fontWeight: 'bold' }}>{vid}</td>
                <td style={{ color: '#dfa0ac' }}>{cli}</td>
                <td style={{ color: Number((apr as string).replace('%','')) >= 94 ? '#4ade80' : Number((apr as string).replace('%','')) >= 90 ? '#eab308' : '#ef4444' }}>{apr}</td>
                <td style={{ color: '#a85060' }}>{t}</td>
                <td style={{ color: '#dfa0ac' }}>{rev}</td>
                <td>{rat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Demo2Page() {
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState('contenido')
  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  return (
    <div className="min-h-screen" style={{ background: '#0f0508', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ background: '#722F37', borderBottom: '1px solid #8b3d47' }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg tracking-widest text-white" style={{ background: 'rgba(255,255,255,0.15)' }}>DDM</div>
            <div>
              <p className="text-white font-bold text-base leading-none">CRM · DDM Agency</p>
              <p className="text-xs leading-none mt-0.5" style={{ color: '#f0d0d5' }}>Producción de Contenido — Abril 2025</p>
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
        <div className="max-w-7xl mx-auto px-6 flex gap-1 pt-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-5 py-2.5 text-sm font-medium cursor-pointer transition-all rounded-t-lg"
              style={{ background: tab === t.id ? '#0f0508' : 'transparent', color: tab === t.id ? 'white' : 'rgba(255,255,255,0.65)', borderTop: tab === t.id ? '2px solid #c9a227' : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {tab === 'contenido'   && <TabContenido m={mounted} />}
        {tab === 'plataformas' && <TabPlataformas />}
        {tab === 'clientes'    && <TabClientes />}
        {tab === 'engagement'  && <TabEngagement />}
        {tab === 'resultados'  && <TabResultados />}
        {tab === 'equipo'      && <TabEquipo />}
      </main>
    </div>
  )
}
