const images = [
  { id: 'barber1', alt: 'Corte clásico' },
  { id: 'barber2', alt: 'Fade moderno' },
  { id: 'barber3', alt: 'Barba perfilada' },
  { id: 'barber4', alt: 'Ambiente de la barbería' },
  { id: 'barber5', alt: 'Herramientas profesionales' },
  { id: 'barber6', alt: 'Resultado final' },
]

export default function Gallery() {
  return (
    <section id="galeria" className="py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-subtitle">Nuestro trabajo</p>
          <h2 className="section-title">Galería</h2>
          <div className="w-12 h-0.5 bg-gold mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative overflow-hidden aspect-[4/3] group">
              <img
                src={`https://picsum.photos/seed/${img.id}/600/450`}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm tracking-widest uppercase font-medium">
                  {img.alt}
                </span>
              </div>
              {/* Gold corner accent */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
