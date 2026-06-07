import { useState, useEffect } from 'react'
import { Scissors, Sparkles, Palette, Droplets } from 'lucide-react'

const ICONS = [Scissors, Palette, Droplets, Sparkles]

const FALLBACK_SERVICES = [
  {
    name: 'Corte & Estilo',
    description: 'Cortes personalizados y peinados que realzan tu rostro y personalidad.',
    price: 'Desde $14.000',
    duration: '30 min',
  },
  {
    name: 'Coloración',
    description: 'Color a medida, balayage y mechas con productos de lujo.',
    price: 'Desde $30.000',
    duration: '120 min',
  },
  {
    name: 'Tratamientos',
    description: 'Hidratación profunda, keratina y rituales reparadores.',
    price: 'Desde $20.000',
    duration: '75 min',
  },
  {
    name: 'Eventos & Novias',
    description: 'Peinados de ocasión y paquetes especiales para tu gran día.',
    price: 'Desde $40.000',
    duration: '90 min',
  },
]

function formatPrice(price, priceFrom) {
  const formatted = '$' + Math.round(price).toLocaleString('es-CL')
  return priceFrom ? `Desde ${formatted}` : formatted
}

export function Booking() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/services?active_only=true')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(
            data
              .filter((s) => s.is_active)
              .map((s, i) => ({
                icon: ICONS[i % ICONS.length],
                name: s.name,
                desc: s.description ?? '',
                price: formatPrice(s.price, s.price_from),
                duration: `${s.duration_minutes} min`,
              }))
          )
        } else {
          setServices(
            FALLBACK_SERVICES.map((s, i) => ({ icon: ICONS[i % ICONS.length], ...s, desc: s.description }))
          )
        }
      })
      .catch(() => {
        setServices(
          FALLBACK_SERVICES.map((s, i) => ({ icon: ICONS[i % ICONS.length], ...s, desc: s.description }))
        )
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="book" className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="mb-14 text-center">
          <p className="text-[11px] tracking-[0.3em] text-foreground/50">RESERVA</p>
          <h2 className="mt-4 font-serif text-4xl italic text-foreground md:text-5xl text-balance">
            Elige tu Servicio
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col border border-border bg-card p-8 animate-pulse">
                <div className="size-7 rounded bg-muted" />
                <div className="mt-6 h-6 w-3/4 rounded bg-muted" />
                <div className="mt-3 flex-1 space-y-2">
                  <div className="h-3 rounded bg-muted" />
                  <div className="h-3 w-5/6 rounded bg-muted" />
                </div>
                <div className="mt-6 h-10 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.name}
                  className="group flex flex-col border border-border bg-card p-8 transition-colors hover:bg-accent"
                >
                  <Icon className="size-7 text-foreground/80" strokeWidth={1.25} />
                  <h3 className="mt-6 font-serif text-2xl text-foreground">{s.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs tracking-wide text-foreground/70">
                    <span>{s.price}</span>
                    <span>{s.duration}</span>
                  </div>

                  <a
                    href="#"
                    className="mt-6 inline-flex items-center justify-center bg-primary px-5 py-3 text-[11px] tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    RESERVAR
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
