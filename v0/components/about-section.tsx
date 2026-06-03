export function AboutSection() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80"
                  alt="Salon atmosphere"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80"
                  alt="Hair styling"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="pt-8 space-y-4">
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=600&q=80"
                  alt="Beauty products"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80"
                  alt="Styling session"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:pl-8">
            <h2 className="text-4xl md:text-5xl font-light text-foreground tracking-wide mb-8">
              Sobre <span className="italic">Nosotros</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Bienvenida a Lumière, donde la belleza se encuentra con la excelencia. Somos un salón de belleza boutique dedicado a realzar tu belleza natural con tratamientos personalizados y un servicio excepcional.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Nuestro equipo de estilistas expertos combina técnicas vanguardistas con productos de la más alta calidad para crear resultados que superan tus expectativas. Cada visita es una experiencia de lujo diseñada para hacerte sentir renovada y radiante.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-3 border border-foreground text-foreground px-8 py-4 text-sm tracking-wider uppercase hover:bg-foreground hover:text-background transition-all duration-300"
            >
              Contáctanos
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
