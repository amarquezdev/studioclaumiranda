import { useState, useEffect, useCallback, useRef } from 'react'
import { Star, ArrowLeft, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { getReviews } from '../api/client'
import { useReveal } from '../hooks/useReveal'

const FALLBACK_REVIEWS = [
  {
    quote:
      'Es la segunda vez que vamos con mi hija y 100% recomendada. Una mujer muy amable y admirable; sobre todo una excelente profesional, seca en lo que hace.',
    name: 'IRIS FLORES',
  },
  {
    quote:
      'Quedé más que feliz con mi corte. Con la atención que entrega es amable y es seca como peluquera. 100% la recomiendo. Nunca salí feliz de una peluquería hasta hoy.',
    name: 'SOLANGE CONCHA',
  },
  {
    quote:
      'Excelente atención. Hace tiempo que me atiendo con la señora Claudia y es muy linda persona y su trabajo lo hace excelente.',
    name: 'MARÍA ISABEL FUENTES',
  },
  {
    quote: 'Excelente. Buena conversación, productos de calidad, una atención 10/10.',
    name: 'CATALINA ASTORGA',
  },
]

export function Testimonial() {
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS)
  const [rating, setRating] = useState({ overall: 5.0, total: 48 })
  const [index, setIndex] = useState(0)

  useEffect(() => {
    getReviews()
      .then(({ data }) => {
        if (data.reviews?.length) {
          setReviews(
            data.reviews.map((r) => ({
              quote: r.text,
              name: r.author_name.toUpperCase(),
            }))
          )
          setRating({ overall: data.overall_rating, total: data.total_ratings })
        }
      })
      .catch(() => {})
  }, [])

  const next = useCallback(() => setIndex((i) => (i + 1) % reviews.length), [reviews.length])
  const prev = useCallback(() => setIndex((i) => (i - 1 + reviews.length) % reviews.length), [reviews.length])

  useEffect(() => {
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next])

  const reviewRef = useRef(null)

  useEffect(() => {
    if (!reviewRef.current) return
    gsap.fromTo(reviewRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }
    )
  }, [index, reviews])

  const labelRef = useReveal({ y: 15, duration: 1.2 })
  const headingRef = useReveal({ y: 25, delay: 0.15, duration: 1.4 })

  return (
    <section id="resenas" className="bg-background">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center md:py-32">
        <p ref={labelRef} className="text-[11px] tracking-[0.3em] text-foreground/50">TESTIMONIOS</p>
        <h2 ref={headingRef} className="mt-4 font-serif text-3xl italic text-foreground md:text-4xl text-balance">
          Lo que dicen Nuestras Clientas
        </h2>

        {/* Rating */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 text-foreground">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-foreground" />
            ))}
          </div>
          <p className="text-sm text-foreground/70">
            <span className="font-medium text-foreground">{rating.overall.toFixed(1)}</span>{' '}
            basado en {rating.total} reseñas de Google
          </p>
        </div>

        {/* Slider */}
        <div className="relative mt-12 w-full">
          <div ref={reviewRef}>
            <p className="mx-auto max-w-2xl font-serif text-2xl leading-relaxed text-foreground/90 md:text-[26px] md:leading-relaxed text-balance">
              {`"${reviews[index].quote}"`}
            </p>
            <p className="mt-8 text-[11px] tracking-[0.25em] text-foreground/60">{reviews[index].name}</p>
          </div>

          {/* Arrows */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              aria-label="Reseña anterior"
              className="flex size-10 items-center justify-center border border-foreground/20 text-foreground/70 transition-colors hover:bg-foreground hover:text-background"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Ir a la reseña ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-6 bg-foreground' : 'w-1.5 bg-foreground/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Reseña siguiente"
              className="flex size-10 items-center justify-center border border-foreground/20 text-foreground/70 transition-colors hover:bg-foreground hover:text-background"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
