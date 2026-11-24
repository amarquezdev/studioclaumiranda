// Logos are pre-tinted to the muted-foreground gray (#88796A).
// Heights are tuned per logo so they read with similar visual weight.
const brands = [
  { name: 'Inoar',     src: '/brands/inoar.png',  h: 'h-6 md:h-8'   },
  { name: "L'Oréal",   src: '/brands/loreal.svg', h: 'h-5 md:h-6'   },
  { name: 'Matrix',    src: '/brands/matrix.png', h: 'h-7 md:h-9'   },
  { name: 'Silkey',    src: '/brands/silkey.svg', h: 'h-9 md:h-11'  },
  { name: 'SOW',       src: '/brands/sow.png',    h: 'h-10 md:h-12' },
  { name: 'Wella',     src: '/brands/wella.png',  h: 'h-10 md:h-12' },
]

export function BrandSlider() {
  const list = [...brands, ...brands]

  return (
    <section className="mt-16 bg-muted py-12 md:mt-24 md:py-16">
      <p className="mb-10 text-center text-[11px] tracking-[0.3em] text-foreground/70">
        MARCAS CON LAS QUE TRABAJA
      </p>
      <div className="relative overflow-hidden">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-muted to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-muted to-transparent" />

        <ul className="flex w-max animate-marquee items-center gap-16 md:gap-24">
          {list.map((brand, i) => (
            <li key={`${brand.name}-${i}`} aria-hidden={i >= brands.length} className="shrink-0">
              <img
                src={brand.src}
                alt={i < brands.length ? brand.name : ''}
                loading="lazy"
                className={`${brand.h} w-auto opacity-80`}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
