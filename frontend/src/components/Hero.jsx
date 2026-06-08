import { useEffect, useRef } from 'react'
import gsap from 'gsap'

function SplitChars({ text, className }) {
  return (
    <span className={className} aria-label={text}>
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
          y: 18,
          duration: 0.35,
          stagger: 0.03,
          ease: 'power2.out',
          delay: 0.2,
        })
      }
      if (btnRef.current) {
        gsap.from(btnRef.current, {
          opacity: 0,
          y: 36,
          duration: 0.8,
          ease: 'power3.out',
          delay: 1.1,
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
            src="https://images.unsplash.com/photo-1522123472015-2d9f7ee5608d?fm=jpg&q=80&w=800&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="relative h-full w-full">
          <img
            src="https://images.unsplash.com/photo-1779400203057-23f445b63fc1?fm=jpg&q=80&w=1600&auto=format&fit=crop"
            alt="Joven con vestido negro y cabello en movimiento"
            className="absolute inset-x-0 top-0 h-[calc(100%+2.5rem)] w-full object-cover object-top"
          />
        </div>
        <div className="relative hidden h-full w-full md:block" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1521194263619-39ecc5b55c61?fm=jpg&q=80&w=800&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Headline */}
      <div className="relative z-10 h-full" ref={titleRef}>
        {/* Mobile */}
        <div className="flex h-full items-center pb-20 px-6 md:hidden">
          <h1 className="font-serif leading-[1.05] text-foreground">
            <SplitChars text="Un Cabello Sano" className="block text-5xl sm:text-6xl" />
            <SplitChars text="En Manos Expertas" className="mt-2 block text-5xl italic sm:text-6xl" />
          </h1>
        </div>
        {/* Desktop */}
        <div className="absolute inset-0 hidden md:block">
          <div className="absolute top-1/2 -translate-y-1/2 left-[28.57%] -translate-x-1/2 text-center">
            <h1 className="font-serif leading-[1.05] text-foreground text-nowrap">
              <SplitChars text="Un Cabello Sano" className="block text-7xl" />
              <SplitChars text="En Manos Expertas" className="mt-2 block text-7xl italic" />
            </h1>
          </div>
        </div>
      </div>

      {/* Book button */}
      <div ref={btnRef} className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2 md:bottom-12 md:left-[71.43%]">
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
