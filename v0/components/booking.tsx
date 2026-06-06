import { Scissors, Sparkles, Palette, Droplets } from "lucide-react"

const services = [
  {
    icon: Scissors,
    name: "Corte & Estilo",
    desc: "Cortes personalizados y peinados que realzan tu rostro y personalidad.",
    price: "Desde $45",
    duration: "60 min",
  },
  {
    icon: Palette,
    name: "Coloración",
    desc: "Color a medida, balayage y mechas con productos de lujo.",
    price: "Desde $90",
    duration: "120 min",
  },
  {
    icon: Droplets,
    name: "Tratamientos",
    desc: "Hidratación profunda, keratina y rituales reparadores.",
    price: "Desde $60",
    duration: "75 min",
  },
  {
    icon: Sparkles,
    name: "Eventos & Novias",
    desc: "Peinados de ocasión y paquetes especiales para tu gran día.",
    price: "Desde $120",
    duration: "90 min",
  },
]

export function Booking() {
  return (
    <section id="book" className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="mb-14 text-center">
          <p className="text-[11px] tracking-[0.3em] text-foreground/50">RESERVA</p>
          <h2 className="mt-4 font-serif text-4xl italic text-foreground md:text-5xl text-balance">
            Elige tu Servicio
          </h2>
        </div>

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
      </div>
    </section>
  )
}
