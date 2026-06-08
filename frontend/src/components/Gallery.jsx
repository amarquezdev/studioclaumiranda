import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const items = [
  { img: '/1s.webp', alt: 'Trabajo Studio Clau Miranda 1' },
  { img: '/2s.webp', alt: 'Trabajo Studio Clau Miranda 2' },
  { img: '/3s.webp', alt: 'Trabajo Studio Clau Miranda 3' },
  { img: '/4s.webp', alt: 'Trabajo Studio Clau Miranda 4' },
]

export function Gallery() {
  const [active, setActive] = useState(null)

  const prev = useCallback(() =>
    setActive(i => (i - 1 + items.length) % items.length), [])
  const next = useCallback(() =>
    setActive(i => (i + 1) % items.length), [])
  const close = useCallback(() => setActive(null), [])

  useEffect(() => {
    if (active === null) return
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, prev, next, close])

  // Lock body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = active !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [active])

  return (
    <section id="trabajos" className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        <div className="mb-12 text-center">
          <p className="text-[11px] tracking-[0.3em] text-foreground/50">GALERÍA</p>
          <h2 className="mt-4 font-serif text-4xl italic text-foreground md:text-5xl text-balance">
            Nuestro Trabajo
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="group block overflow-hidden focus:outline-none"
              aria-label={`Ver imagen ${i + 1}`}
            >
              <img
                src={item.img}
                alt={item.alt}
                className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center text-white/80 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="size-6" />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center text-white/70 hover:text-white md:left-6"
            aria-label="Anterior"
          >
            <ChevronLeft className="size-8" />
          </button>

          {/* Image */}
          <img
            src={items[active].img}
            alt={items[active].alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
          />

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center text-white/70 hover:text-white md:right-6"
            aria-label="Siguiente"
          >
            <ChevronRight className="size-8" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActive(i) }}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                }`}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
