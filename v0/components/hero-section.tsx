import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative bg-background">
      {/* Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
        {/* Left Image */}
        <div className="hidden md:block relative h-[70vh] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
            alt="Beauty treatment"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Center Content */}
        <div className="md:col-span-2 relative h-[70vh] flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80"
            alt="Salon interior"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/60" />
          
          <div className="relative z-10 text-center px-6">
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4">Bienvenida a</p>
            <h2 className="text-5xl md:text-7xl font-light text-foreground tracking-wide">
              <span className="italic">Nueva</span> Temporada
            </h2>
            <p className="text-2xl md:text-3xl font-light text-foreground tracking-[0.15em] uppercase mt-2">
              de Belleza
            </p>
            <div className="mt-6 inline-block">
              <span className="text-xs tracking-[0.2em] uppercase text-foreground border border-foreground px-6 py-2">
                Tratamientos Exclusivos
              </span>
            </div>
            <div className="mt-8">
              <a
                href="#booking"
                className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-sm tracking-wider uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Reservar Ahora
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="hidden md:block relative h-[70vh] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=800&q=80"
            alt="Hair styling"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
