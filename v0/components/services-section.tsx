import { ArrowRight } from "lucide-react"

const services = [
  {
    title: "Cabello",
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Color",
    image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Tratamientos",
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Maquillaje",
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=600&q=80",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-24 px-6 lg:px-12 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-light text-foreground tracking-[0.1em] uppercase mb-12">
          Nuestros Servicios
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {services.map((service) => (
            <a
              key={service.title}
              href="#booking"
              className="group relative overflow-hidden aspect-[3/4]"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h3 className="text-foreground text-sm md:text-base tracking-[0.15em] uppercase flex items-center gap-2 group-hover:text-primary transition-colors">
                  {service.title}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
