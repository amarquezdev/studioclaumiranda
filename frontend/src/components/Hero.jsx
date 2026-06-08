export function Hero() {
  return (
    <section className="relative h-screen min-h-[640px] w-full">
      {/* Three columns spanning full height */}
      <div className="absolute top-0 bottom-0 left-4 right-0 md:inset-0 grid grid-cols-1 md:grid-cols-[2fr_3fr_2fr]">
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

      {/* Headline — mobile: left-aligned; desktop: centered on left/center seam (28.57%) */}
      <div className="relative z-10 h-full">
        {/* Mobile */}
        <div className="flex h-full items-center px-6 md:hidden">
          <h1 className="font-serif text-5xl leading-[1.05] text-foreground sm:text-6xl">
            Un Cabello Sano
            <span className="mt-2 block italic">En Manos Expertas</span>
          </h1>
        </div>
        {/* Desktop */}
        <div className="absolute inset-0 hidden md:block">
          <div className="absolute top-1/2 -translate-y-1/2 left-[28.57%] -translate-x-1/2 text-center">
            <h1 className="font-serif text-7xl leading-[1.05] text-foreground text-nowrap">
              Un Cabello Sano
              <span className="mt-2 block italic">En Manos Expertas</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Book button — mobile: centered; desktop: centered on center/right seam (71.43%) */}
      <div className="absolute bottom-12 left-1/2 z-20 -translate-x-1/2 md:left-[71.43%]">
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
