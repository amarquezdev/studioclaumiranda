export function Hero() {
  return (
    <section className="relative h-screen min-h-[640px] w-full">
      {/* Three columns spanning full height to the top of the viewport */}
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3">
        {/* Left solid tone */}
        <div className="hidden bg-secondary md:block" aria-hidden="true" />

        {/* Center image — overflows slightly past the bottom edge */}
        <div className="relative h-full w-full">
          <img
            src="/hero.png"
            alt="Woman with voluminous blonde hair wearing sunglasses and a camel coat"
            className="absolute inset-x-0 top-0 h-[calc(100%+2.5rem)] w-full object-cover object-top"
          />
        </div>

        {/* Right solid tone */}
        <div className="hidden bg-muted md:block" aria-hidden="true" />
      </div>

      {/* Headline overlay — spans the left column and a bit into the center */}
      <div className="relative z-10 grid h-full grid-cols-1 md:grid-cols-3">
        <div className="col-span-1 flex flex-col justify-center px-6 md:col-span-2 md:px-10">
          <h1 className="font-serif text-5xl leading-[1.05] text-foreground text-nowrap sm:text-6xl md:text-7xl">
            Good Hair Days
            <span className="mt-2 block italic">Just Got Better</span>
          </h1>
        </div>
      </div>

      {/* Book button — sits on the seam between the center and right columns */}
      <div className="absolute bottom-12 left-1/2 z-20 -translate-x-1/2 md:left-2/3">
        <a
          href="#book"
          className="inline-flex items-center bg-primary px-7 py-3.5 text-[11px] tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          BOOK APPOINTMENT
        </a>
      </div>
    </section>
  )
}
