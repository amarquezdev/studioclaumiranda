import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { getServices } from '../api/client'

export default function Services() {
  const [services, setServices] = useState([])

  useEffect(() => {
    getServices().then(r => setServices(r.data)).catch(() => {})
  }, [])

  return (
    <section id="servicios" className="py-24 px-6 lg:px-12 bg-background">
      <div className="max-w-6xl mx-auto">
        <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4">Lo que ofrecemos</p>
        <h2 className="text-2xl md:text-3xl font-light text-foreground tracking-[0.1em] uppercase mb-12">
          Nuestros Servicios
        </h2>

        {services.length === 0 ? (
          <p className="text-muted-foreground text-sm">Cargando servicios...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border">
            {services.map((service, i) => (
              <a
                key={service.id}
                href="#reservar"
                className="group bg-background p-8 hover:bg-card transition-colors duration-300 flex flex-col gap-4"
              >
                <span className="text-xs text-muted-foreground tracking-[0.2em]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-8 h-px bg-primary" />
                <h3 className="text-lg font-light text-foreground tracking-wide group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <div className="text-xs text-muted-foreground tracking-wider">
                    {service.duration_minutes} min
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-medium">
                      {service.price_from && (
                        <span className="text-xs font-normal mr-0.5">Desde </span>
                      )}
                      ${service.price.toLocaleString()}
                    </span>
                    <ArrowRight className="w-3 h-3 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
