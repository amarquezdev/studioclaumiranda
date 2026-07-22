import { useEffect, useRef } from 'react'
import gsap from 'gsap'

function SplitChars({ text, className }) {
  return (
    <span className={className} role="group" aria-label={text}>
      {text.split('').map((char, i) => (
        <span key={i} className="gsap-char inline-block" aria-hidden="true">
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  )
}

export function Hero() {
  const titleRef = useRef(null)
  const btnRef   = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const chars = titleRef.current?.querySelectorAll('.gsap-char')
      if (chars?.length) {
        gsap.from(chars, {
          opacity: 0,
          y: 16,
          duration: 0.55,
          stagger: 0.035,
          ease: 'power2.out',
          delay: 0.3,
        })
      }
      const locationEls = titleRef.current?.querySelectorAll('.gsap-location')
      if (locationEls?.length) {
        gsap.from(locationEls, {
          opacity: 0,
          y: 10,
          duration: 1.1,
          ease: 'power2.out',
          delay: 1.7,
        })
      }
      if (btnRef.current) {
        gsap.from(btnRef.current, {
          opacity: 0,
          y: 28,
          duration: 1.1,
          ease: 'power2.out',
          delay: 1.9,
        })
      }
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative h-screen min-h-[640px] w-full">
      {/* Three columns spanning full height */}
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-[2fr_3fr_2fr]">
        <div className="relative hidden h-full w-full md:block" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1522123472015-2d9f7ee5608d?q=75&w=800&auto=format&fit=crop"
            alt="Servicio de coloración en peluquería Studio Clau Miranda, San Vicente de Tagua Tagua"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="relative h-full w-full">
          <img
            src="https://images.unsplash.com/photo-1779400203057-23f445b63fc1?q=80&w=1080&auto=format&fit=crop"
            srcSet="
              https://images.unsplash.com/photo-1779400203057-23f445b63fc1?q=75&w=640&auto=format&fit=crop 640w,
              https://images.unsplash.com/photo-1779400203057-23f445b63fc1?q=75&w=828&auto=format&fit=crop 828w,
              https://images.unsplash.com/photo-1779400203057-23f445b63fc1?q=80&w=1080&auto=format&fit=crop 1080w,
              https://images.unsplash.com/photo-1779400203057-23f445b63fc1?q=80&w=1600&auto=format&fit=crop 1600w
            "
            sizes="(max-width: 767px) 100vw, 43vw"
            alt="Peluquería Studio Clau Miranda — San Vicente de Tagua Tagua"
            className="absolute inset-x-0 top-0 h-[calc(100%+2.5rem)] w-full object-cover object-top"
            fetchpriority="high"
            loading="eager"
          />
        </div>
        <div className="relative hidden h-full w-full md:block" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1521194263619-39ecc5b55c61?q=75&w=800&auto=format&fit=crop"
            alt="Tratamiento capilar en salón de belleza San Vicente de Tagua Tagua"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* Headline */}
      <div className="relative z-10 h-full" ref={titleRef}>
        {/* Mobile */}
        <div className="flex h-full items-start pt-36 px-6 md:hidden">
          <div>
            <h1 className="font-serif leading-[1.05] text-foreground">
              <SplitChars text="Un Cabello Sano" className="block text-5xl sm:text-6xl" />
              <SplitChars text="En Manos Expertas" className="mt-2 block text-5xl italic sm:text-6xl" />
            </h1>
            <p className="gsap-location mt-4 text-xs tracking-[0.25em] uppercase text-foreground/70">Peluquería · San Vicente de Tagua Tagua</p>
          </div>
        </div>
        {/* Desktop */}
        <div className="absolute inset-0 hidden md:block">
          <div className="absolute top-1/2 -translate-y-1/2 left-[28.57%] -translate-x-1/2 text-center">
            <h1 className="font-serif leading-[1.05] text-foreground text-nowrap">
              <SplitChars text="Un Cabello Sano" className="block text-7xl" />
              <SplitChars text="En Manos Expertas" className="mt-2 block text-7xl italic" />
            </h1>
            <p className="gsap-location mt-5 text-xs tracking-[0.3em] uppercase text-foreground/70">Peluquería · San Vicente de Tagua Tagua</p>
          </div>
        </div>
      </div>

      {/* Book button */}
      <div ref={btnRef} className="absolute bottom-36 left-1/2 z-20 -translate-x-1/2 md:bottom-12 md:left-[71.43%]">
        <a
          href="#book"
          className="inline-flex items-center bg-primary px-10 py-4 text-[11px] tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          RESERVAR CITA
        </a>
      </div>
    </section>
  )
}
