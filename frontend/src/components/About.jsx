export default function About() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Image grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80"
                  alt="Estética"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80"
                  alt="Peinado"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="pt-8 space-y-4">
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80"
                  alt="Estilista"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80"
                  alt="Productos"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:pl-8">
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4">Quiénes somos</p>
            <h2 className="text-4xl md:text-5xl font-light text-foreground tracking-wide mb-8">
              Sobre <span className="italic">Nosotras</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              En Studio Clau Miranda combinamos técnica, creatividad y atención personalizada para que cada clienta salga sintiéndose radiante. Más de diez años de experiencia nos respaldan.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Usamos productos de alta calidad y nos mantenemos en constante formación para ofrecerte lo último en tendencias de cabello y estética. Tu bienestar y tu imagen son nuestra prioridad.
            </p>
            <a
              href="#contacto"
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
