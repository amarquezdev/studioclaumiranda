import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

const items = [
  { img: '/1s.webp', alt: 'Trabajo de coloración de Claudia Miranda 1' },
  { img: '/2s.webp', alt: 'Trabajo de coloración de Claudia Miranda 2' },
  { img: '/3s.webp', alt: 'Trabajo de coloración de Claudia Miranda 3' },
  { img: '/4s.webp', alt: 'Trabajo de coloración de Claudia Miranda 4' },
]

const N = items.length
const AUTOPLAY_MS = 5000
const mod = (k) => ((k % N) + N) % N

// Slot geometry, in % of the stage box. Slot 0 is the large image,
// 1–3 the small ones, -1 / 4 are the off-stage positions used while
// an image is leaving or entering.
const LAYOUT = {
  desktop: (slot) => {
    if (slot <= 0) return { left: slot === 0 ? 0 : -43, top: 0, width: 40, height: 100 }
    return { left: 43 + (slot - 1) * 20, top: 57.5, width: 17, height: 42.5 }
  },
  mobile: (slot) => {
    if (slot <= 0) return { left: slot === 0 ? 0 : -104, top: 0, width: 100, height: 74 }
    return { left: (slot - 1) * 34.5, top: 77, width: 31, height: 23 }
  },
}

function useIsDesktop() {
  const query = '(min-width: 768px)'
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setIsDesktop(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return isDesktop
}

// Thin "<" / ">" arrows
function Arrow({ dir, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Imagen anterior' : 'Imagen siguiente'}
      className="flex h-12 w-12 items-center justify-center text-foreground/70 transition-colors hover:text-foreground"
    >
      <svg viewBox="0 0 24 48" className="h-9 w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.25">
        <path d={dir === 'prev' ? 'M20 4 L4 24 L20 44' : 'M4 4 L20 24 L4 44'} />
      </svg>
    </button>
  )
}

export function Gallery() {
  const [pos, setPos] = useState(0)          // virtual index of the large image (unbounded)
  const [paused, setPaused] = useState(false)
  const [active, setActive] = useState(null) // lightbox index
  const isDesktop = useIsDesktop()
  const reducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current

  const labelRef   = useReveal({ y: 15, duration: 1.2 })
  const headingRef = useReveal({ y: 25, delay: 0.15, duration: 1.4 })
  const stageRef   = useReveal({ y: 30, delay: 0.3,  duration: 1.5 })

  const goNext = useCallback(() => setPos((p) => p + 1), [])
  const goPrev = useCallback(() => setPos((p) => p - 1), [])

  // Autoplay — restarts after every move so manual navigation gets a full interval
  useEffect(() => {
    if (paused || reducedMotion || active !== null) return
    const id = setTimeout(goNext, AUTOPLAY_MS)
    return () => clearTimeout(id)
  }, [pos, paused, reducedMotion, active, goNext])

  // Lightbox controls
  const lbPrev  = useCallback(() => setActive((i) => mod(i - 1)), [])
  const lbNext  = useCallback(() => setActive((i) => mod(i + 1)), [])
  const lbClose = useCallback(() => setActive(null), [])

  useEffect(() => {
    if (active === null) return
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  lbPrev()
      if (e.key === 'ArrowRight') lbNext()
      if (e.key === 'Escape')     lbClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, lbPrev, lbNext, lbClose])

  useEffect(() => {
    document.body.style.overflow = active !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [active])

  const layout = isDesktop ? LAYOUT.desktop : LAYOUT.mobile
  // Render one off-stage slide on each side so they can animate in/out
  const slides = []
  for (let k = pos - 1; k <= pos + N; k++) slides.push(k)

  const counter = (
    <p className="font-sans text-[11px] tracking-[0.3em] text-foreground/70">
      {String(mod(pos) + 1).padStart(2, '0')}
      <span className="mx-2 text-foreground/30">/</span>
      {String(N).padStart(2, '0')}
    </p>
  )
  const arrows = (
    <div className="flex items-center gap-4">
      <Arrow dir="prev" onClick={goPrev} />
      {counter}
      <Arrow dir="next" onClick={goNext} />
    </div>
  )

  return (
    <section id="trabajos" className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        {/* Heading — centered above on mobile, top-right over the small images on desktop */}
        <div className="mb-10 text-center md:hidden">
          <p className="text-[11px] tracking-[0.3em] text-foreground/70">GALERÍA</p>
          <h2 className="mt-4 font-serif text-4xl italic text-foreground text-balance">Su Trabajo</h2>
        </div>

        <div
          ref={stageRef}
          className="relative aspect-[1/1.8] overflow-hidden md:aspect-[15/8]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-roledescription="carrusel"
        >
          <div className="pointer-events-none absolute right-0 top-0 z-20 hidden h-[57.5%] w-[57%] flex-col justify-between pb-8 md:flex [&_button]:pointer-events-auto">
            <div>
              <p ref={labelRef} className="text-[11px] tracking-[0.3em] text-foreground/70">GALERÍA</p>
              <h2 ref={headingRef} className="mt-4 font-serif text-5xl italic text-foreground lg:text-6xl">
                Su Trabajo
              </h2>
            </div>
            <div className="-ml-3">{arrows}</div>
          </div>

          {slides.map((k) => {
            const slot = k - pos
            const g = layout(slot)
            const visible = slot >= 0 && slot < N
            const item = items[mod(k)]
            return (
              <button
                key={k}
                type="button"
                tabIndex={visible ? 0 : -1}
                aria-hidden={!visible}
                onClick={() => (slot === 0 ? setActive(mod(k)) : setPos(k))}
                aria-label={slot === 0 ? `Ampliar imagen ${mod(k) + 1}` : `Ver imagen ${mod(k) + 1}`}
                className={`group absolute overflow-hidden transition-all duration-[1100ms] ease-[cubic-bezier(0.65,0,0.35,1)] focus:outline-none ${
                  slot === 0 ? 'z-10 cursor-zoom-in' : 'z-0'
                }`}
                style={{
                  left: `${g.left}%`,
                  top: `${g.top}%`,
                  width: `${g.width}%`,
                  height: `${g.height}%`,
                  opacity: visible ? 1 : 0,
                }}
              >
                <img
                  src={item.img}
                  alt={item.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {slot > 0 && (
                  <span className="absolute inset-0 bg-background/0 transition-colors duration-500 group-hover:bg-background/20" />
                )}
              </button>
            )
          })}
        </div>

        {/* Mobile controls */}
        <div className="mt-6 flex justify-center md:hidden">{arrows}</div>
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={lbClose}
        >
          <button
            onClick={lbClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center text-white/80 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="size-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); lbPrev() }}
            className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center text-white/70 hover:text-white md:left-6"
            aria-label="Anterior"
          >
            <ChevronLeft className="size-8" />
          </button>

          <img
            src={items[active].img}
            alt={items[active].alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
          />

          <button
            onClick={(e) => { e.stopPropagation(); lbNext() }}
            className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center text-white/70 hover:text-white md:right-6"
            aria-label="Siguiente"
          >
            <ChevronRight className="size-8" />
          </button>

          <div className="absolute bottom-5 flex">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActive(i) }}
                className="flex min-h-7 min-w-7 items-center justify-center"
                aria-label={`Ir a imagen ${i + 1}`}
              >
                <span className={`block h-1.5 rounded-full transition-all ${
                  i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                }`} />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
