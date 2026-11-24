import { useReveal } from '../hooks/useReveal'

export function About() {
  const imgRef      = useReveal({ y: 35, duration: 1.6 })
  const labelRef    = useReveal({ y: 15, duration: 1.2 })
  const headingRef  = useReveal({ y: 28, delay: 0.15, duration: 1.4 })
  const textRef     = useReveal({ y: 20, delay: 0.3,  duration: 1.3 })
  const text2Ref    = useReveal({ y: 20, delay: 0.45, duration: 1.3 })
  const claudiaRef  = useReveal({ y: 15, delay: 0.6,  duration: 1.2 })
  const statsRef    = useReveal({ y: 20, delay: 0.75, duration: 1.2 })

  return (
    <section id="historia" className="bg-background">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr]">
        {/* Portrait */}
        <div ref={imgRef} className="relative mx-auto aspect-square w-4/5 overflow-hidden md:mx-0 md:aspect-auto md:min-h-[680px] md:w-auto">
          <div className="absolute inset-0 md:left-12 lg:left-16">
            <img
              src="/estilista-claumiranda.webp"
              alt="Claudia Miranda, estilista y colorista a domicilio"
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center px-8 py-16 md:px-16 md:py-24 lg:px-20">
          <p ref={labelRef} className="text-[11px] tracking-[0.3em] text-foreground/70">SOBRE CLAUDIA</p>

          <h2 ref={headingRef} className="mt-4 font-serif text-4xl leading-tight text-foreground md:text-5xl">
            Belleza y detalle,
            <span className="block italic">donde tú estés</span>
          </h2>

          <p ref={textRef} className="mt-6 text-sm leading-relaxed text-foreground/70">
            Con más de 20 años de experiencia, Claudia Miranda ha hecho del color su sello.
            Especialista en coloración, mechas y tratamientos capilares, trabajó como estilista
            para la comunidad chilena en Suecia y hoy suma certificaciones internacionales
            recientes en Argentina, que la mantienen al día con las técnicas más actuales sin
            descuidar la salud de tu cabello.
          </p>

          <p ref={text2Ref} className="mt-4 text-sm leading-relaxed text-foreground/70">
            Hoy lleva esa experiencia directamente a tu casa. Atiende a domicilio en Santiago,
            Viña del Mar, Concón y San Vicente de Tagua Tagua, con la dedicación de un servicio
            profesional y la comodidad de tu propio espacio. Cada coloración y tratamiento se
            diseña a tu medida, con productos de la más alta calidad.
          </p>

          <div ref={claudiaRef}>
            <hr className="mt-10 border-foreground/15" />
            <div className="mt-8">
              <p className="font-serif text-xl italic text-[#c9a05a]">Claudia Miranda</p>
              <p className="mt-1 text-[10px] tracking-[0.25em] text-foreground/70">
                ESTILISTA &amp; COLORISTA
              </p>
            </div>
          </div>

          <div ref={statsRef} className="mt-10 grid grid-cols-3 gap-4">
            <div>
              <p className="font-serif text-3xl text-[#c9a05a]">20+</p>
              <p className="mt-1 text-[10px] tracking-[0.2em] text-foreground/70">AÑOS</p>
            </div>
            <div>
              <p className="font-serif text-3xl text-[#c9a05a]">1k+</p>
              <p className="mt-1 text-[10px] tracking-[0.2em] text-foreground/70">CLIENTAS SATISFECHAS</p>
            </div>
            <div>
              <p className="font-serif text-3xl text-[#c9a05a]">12</p>
              <p className="mt-1 text-[10px] tracking-[0.2em] text-foreground/70">CERTIFICACIONES</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
