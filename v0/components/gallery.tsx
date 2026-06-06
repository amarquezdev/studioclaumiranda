const items = [
  { img: "/sq-1.png", alt: "Woman with sleek styled blonde hair" },
  { img: "/sq-2.png", alt: "Luxury salon interior with chair and mirror" },
  { img: "/sq-3.png", alt: "Premium hair care products in amber bottles" },
  { img: "/sq-4.png", alt: "Woman receiving a luxury hair treatment" },
]

export function Gallery() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        <div className="mb-12 text-center">
          <p className="text-[11px] tracking-[0.3em] text-foreground/50">GALERÍA</p>
          <h2 className="mt-4 font-serif text-4xl italic text-foreground md:text-5xl text-balance">
            Nuestro Trabajo
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {items.map((item, i) => (
            <a key={i} href="#" className="group block overflow-hidden">
              <img
                src={item.img || "/placeholder.svg"}
                alt={item.alt}
                className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
