import { useReveal } from '../hooks/useReveal'

export function About() {
  const imgRef     = useReveal({ y: 50, duration: 1.0 })
  const labelRef   = useReveal({ y: 20, duration: 0.7 })
  const headingRef = useReveal({ y: 35, delay: 0.1, duration: 0.9 })
  const textRef    = useReveal({ y: 25, delay: 0.2, duration: 0.8 })
  const statsRef   = useReveal({ y: 25, delay: 0.3, duration: 0.8 })

  return (
    <section id="historia" className="bg-background">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr]">
        {/* Portrait */}
        <div ref={imgRef} className="relative mx-auto aspect-square w-4/5 overflow-hidden md:mx-0 md:aspect-auto md:min-h-[680px] md:w-auto">
          <div className="absolute inset-0 md:left-12 lg:left-16">
            <img
              src="/estilista-claumiranda.webp"
              alt="Claudia Miranda — Fundadora y Estilista Principal"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center px-8 py-16 md:px-16 md:py-24 lg:px-20">
          <p ref={labelRef} className="text-[11px] tracking-[0.3em] text-foreground/50">NUESTRA HISTORIA</p>

          <h2 ref={headingRef} className="mt-4 font-serif text-4xl leading-tight text-foreground md:text-5xl">
            Un legado de
            <span className="block italic">belleza y detalle</span>
          </h2>

          <p ref={textRef} className="mt-6 text-sm leading-relaxed text-foreground/70">
            Fundado en 2014, Studio Clau Miranda nació de una idea simple: que cada visita al salón
            debía sentirse como un ritual. Lo que comenzó como un pequeño estudio se ha convertido
            en un referente de estilo, donde la artesanía se encuentra con el cuidado personalizado.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-foreground/70">
            Creemos que el cabello es una extensión de quién eres. Por eso cada corte, color y
            tratamiento se diseña a tu medida, utilizando técnicas refinadas y productos de la más
            alta calidad.
          </p>

          <hr className="mt-10 border-foreground/15" />

          <div className="mt-8">
            <p className="font-serif text-xl italic text-[#c9a05a]">Claudia Miranda</p>
            <p className="mt-1 text-[10px] tracking-[0.25em] text-foreground/45">
              FUNDADORA &amp; ESTILISTA PRINCIPAL
            </p>
          </div>

          <div ref={statsRef} className="mt-10 grid grid-cols-3 gap-4">
            <div>
              <p className="font-serif text-3xl text-[#c9a05a]">20+</p>
              <p className="mt-1 text-[10px] tracking-[0.2em] text-foreground/45">AÑOS</p>
            </div>
            <div>
              <p className="font-serif text-3xl text-[#c9a05a]">1k+</p>
              <p className="mt-1 text-[10px] tracking-[0.2em] text-foreground/45">CLIENTAS SATISFECHAS</p>
            </div>
            <div>
              <p className="font-serif text-3xl text-[#c9a05a]">12</p>
              <p className="mt-1 text-[10px] tracking-[0.2em] text-foreground/45">CERTIFICACIONES</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
