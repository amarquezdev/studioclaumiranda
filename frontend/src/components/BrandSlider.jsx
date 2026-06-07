const brands = ['INOAR', 'LOREAL MATRIX', 'DAVINES', 'OMNIPLEX', 'SILKEY', 'SOW']

export function BrandSlider() {
  const list = [...brands, ...brands]

  return (
    <section className="border-y border-border bg-muted py-12 md:py-16">
      <p className="mb-8 text-center text-[11px] tracking-[0.3em] text-muted-foreground">
        NUESTRAS MARCAS
      </p>
      <div className="relative overflow-hidden">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-muted to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-muted to-transparent" />

        <div className="flex w-max animate-marquee items-center gap-16 md:gap-24">
          {list.map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="whitespace-nowrap font-serif text-2xl tracking-wide text-muted-foreground/60 md:text-3xl"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
