import { useEffect, useState } from 'react'
import { adminGetServices, adminGetAppointments } from '../../api/client'

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-card border border-border rounded-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-2xl font-bold ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</span>
      </div>
      <p className="text-foreground font-medium text-sm">{label}</p>
      {sub && <p className="text-muted-foreground text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

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
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-light tracking-wide text-foreground">Dashboard</h1>
        <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mt-1">
          {now.toLocaleDateString('es-CL', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-8 md:mb-10">
        <StatCard icon="✂"  label="Servicios activos"  value={services.filter(s => s.is_active).length} sub={`${services.length} total`} />
        <StatCard icon="📅" label="Citas hoy"          value={todayAppts.length}   sub="agendadas hoy" />
        <StatCard icon="⏳" label="Sin confirmar"      value={pendingAppts.length} sub="pendientes" />
        <StatCard icon="💰" label="Ingreso hoy"        value={fmt(revenueToday)}   sub="estimado" accent />
        <StatCard icon="📈" label="Ingreso mensual"    value={fmt(revenueMonth)}   sub={now.toLocaleDateString('es-CL',{month:'long'})} accent />
      </div>

      {/* Upcoming appointments */}
      <div>
        <h2 className="text-foreground font-light tracking-widest text-xs uppercase mb-4">Próximas citas</h2>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay citas próximas.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-card border border-border rounded-sm overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    {['Fecha y hora', 'Cliente', 'Contacto', 'Estilista', 'Servicio', 'Valor', 'Estado'].map(h => (
                      <th key={h} className="text-left text-muted-foreground text-xs uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map(a => (
                    <tr key={a.id} className="border-b border-border/50 hover:bg-foreground/5 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {fmtDt(a.start_datetime, { dateStyle:'short', timeStyle:'short' })}
                      </td>
                      <td className="px-4 py-3 text-foreground font-medium">{a.user?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        <p>{a.user?.email ?? '—'}</p>
                        {a.user?.phone && <p>{a.user.phone}</p>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.barber?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.service?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-primary text-xs font-medium">
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

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {upcoming.map(a => (
                <div key={a.id} className="bg-card border border-border rounded-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-foreground font-medium text-sm">{a.user?.name ?? '—'}</p>
                      <p className="text-muted-foreground text-xs">{a.user?.email ?? '—'}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status]}`}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/50 text-xs">
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wider" style={{fontSize:'9px'}}>Fecha</p>
                      <p className="text-foreground mt-0.5">{fmtDt(a.start_datetime, { dateStyle:'short', timeStyle:'short' })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wider" style={{fontSize:'9px'}}>Servicio</p>
                      <p className="text-foreground mt-0.5">{a.service?.name ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wider" style={{fontSize:'9px'}}>Valor</p>
                      <p className="text-primary font-medium mt-0.5">{a.service ? `$${a.service.price.toLocaleString()}` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wider" style={{fontSize:'9px'}}>Estilista</p>
                      <p className="text-foreground mt-0.5">{a.barber?.name ?? '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
