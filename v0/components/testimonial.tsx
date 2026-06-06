"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, ArrowLeft, ArrowRight } from "lucide-react"

const reviews = [
  {
    quote:
      "Desde la primera visita, Studio Clau Miranda transform\u00f3 no solo mi cabello, sino la forma en que me siento. La atenci\u00f3n al detalle, el ambiente calmado y la artistr\u00eda detr\u00e1s de cada corte es como ninguna otra que haya experimentado.",
    name: "RACHEL",
  },
  {
    quote:
      "Nunca me hab\u00eda sentido tan bien atendida. El equipo escucha, aconseja y cumple cada vez. Mi color nunca se ha visto tan natural y luminoso. No le confiar\u00e9 mi cabello a nadie m\u00e1s.",
    name: "SOFIA",
  },
  {
    quote:
      "Un santuario absoluto. Desde el momento en que entras sientes la calma. El peinado es impecable y dura semanas. Studio Clau Miranda ha cambiado completamente mi relación con mi cabello.",
    name: "MARTA",
  },
]

export function Testimonial() {
  const [index, setIndex] = useState(0)

  const next = useCallback(() => setIndex((i) => (i + 1) % reviews.length), [])
  const prev = useCallback(() => setIndex((i) => (i - 1 + reviews.length) % reviews.length), [])

  useEffect(() => {
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next])

  return (
    <section className="bg-background">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center md:py-32">
        <p className="text-[11px] tracking-[0.3em] text-foreground/50">TESTIMONIOS</p>
        <h2 className="mt-4 font-serif text-3xl italic text-foreground md:text-4xl text-balance">
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
            <span className="font-medium text-foreground">5.0</span> basado en 48 reseñas de Google
          </p>
        </div>

        {/* Slider */}
        <div className="relative mt-12 w-full">
          <p
            key={index}
            className="mx-auto max-w-2xl font-serif text-2xl leading-relaxed text-foreground/90 md:text-[26px] md:leading-relaxed text-balance"
          >
            {`"${reviews[index].quote}"`}
          </p>
          <p className="mt-8 text-[11px] tracking-[0.25em] text-foreground/60">{reviews[index].name}</p>

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
                    i === index ? "w-6 bg-foreground" : "w-1.5 bg-foreground/30"
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
