import { useEffect, useState } from 'react'
import { adminGetServices, adminGetAppointments } from '../../api/client'

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-2xl font-bold ${accent ? 'text-gold' : 'text-white'}`}>{value}</span>
      </div>
      <p className="text-white font-medium text-sm">{label}</p>
      {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

// Strip timezone suffix before parsing so the browser treats the stored value
// as local time, avoiding the UTC→Chile conversion that shifts hours by -4.
function fmtDt(iso, opts) {
  if (!iso) return '—'
  const local = iso.replace(/([+-]\d{2}:\d{2}|Z)$/, '')
  return new Date(local).toLocaleString('es-CL', opts)
}

const STATUS_COLORS = {
  pending:   'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  completed: 'bg-blue-500/20 text-blue-400',
}
const STATUS_LABELS = { pending:'Pendiente', confirmed:'Confirmada', cancelled:'Cancelada', completed:'Completada' }

export default function Dashboard() {
  const [services, setServices]         = useState([])
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    Promise.all([adminGetServices(), adminGetAppointments()])
      .then(([s, a]) => { setServices(s.data); setAppointments(a.data) })
      .catch(() => {})
  }, [])

  const now   = new Date()
  const today = now.toDateString()

  const todayAppts   = appointments.filter(a => new Date(a.start_datetime).toDateString() === today)
  const pendingAppts = appointments.filter(a => a.status === 'pending')

  const upcoming = [...appointments]
    .filter(a => new Date(a.start_datetime) >= now && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
    .slice(0, 8)

  // Revenue calculation (pending + confirmed only)
  const countableStatuses = ['pending', 'confirmed']

  const revenueToday = todayAppts
    .filter(a => countableStatuses.includes(a.status))
    .reduce((sum, a) => sum + (a.service?.price ?? 0), 0)

  const revenueMonth = appointments
    .filter(a => {
      const d = new Date(a.start_datetime)
      return d.getMonth() === now.getMonth()
        && d.getFullYear() === now.getFullYear()
        && countableStatuses.includes(a.status)
    })
    .reduce((sum, a) => sum + (a.service?.price ?? 0), 0)

  const fmt = (n) => `$${Math.round(n).toLocaleString('es-CL')}`

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {now.toLocaleDateString('es-CL', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        <StatCard icon="✂"  label="Servicios activos"  value={services.filter(s => s.is_active).length} sub={`${services.length} total`} />
        <StatCard icon="📅" label="Citas hoy"          value={todayAppts.length}   sub="agendadas hoy" />
        <StatCard icon="⏳" label="Sin confirmar"      value={pendingAppts.length} sub="pendientes" />
        <StatCard icon="💰" label="Ingreso hoy"        value={fmt(revenueToday)}   sub="estimado" accent />
        <StatCard icon="📈" label="Ingreso mensual"    value={fmt(revenueMonth)}   sub={now.toLocaleDateString('es-CL',{month:'long'})} accent />
      </div>

      {/* Upcoming appointments */}
      <div>
        <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Próximas citas</h2>
        {upcoming.length === 0
          ? <p className="text-gray-500 text-sm">No hay citas próximas.</p>
          : (
            <div className="bg-dark-card border border-dark-border rounded-sm overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-dark-border">
                    {['Fecha y hora', 'Cliente', 'Contacto', 'Estilista', 'Servicio', 'Valor', 'Estado'].map(h => (
                      <th key={h} className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map(a => (
                    <tr key={a.id} className="border-b border-dark-border/50 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-gray-300 text-xs whitespace-nowrap">
                        {fmtDt(a.start_datetime, { dateStyle:'short', timeStyle:'short' })}
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{a.user?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        <p>{a.user?.email ?? '—'}</p>
                        {a.user?.phone && <p>{a.user.phone}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{a.barber?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-300">{a.service?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gold text-xs font-medium">
                        {a.service ? `$${a.service.price.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status]}`}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  )
}
