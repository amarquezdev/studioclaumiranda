export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Visit */}
          <div>
            <h3 className="text-[11px] tracking-[0.25em] text-primary-foreground/60">VISÍTANOS</h3>
            <div className="mt-6 space-y-2 text-sm leading-relaxed text-primary-foreground/80">
              <p>Pje. San Sebastián Mártir 1734</p>
              <p>San Vicente de Tagua Tagua</p>
              <p>Región de O'Higgins, Chile</p>
            </div>
          </div>

          {/* Book */}
          <div>
            <h3 className="text-[11px] tracking-[0.25em] text-primary-foreground/60">RESERVAS</h3>
            <div className="mt-6 space-y-2 text-sm leading-relaxed text-primary-foreground/80">
              <p>Lun – Vie: 10am – 19pm</p>
              <p>Sábado: 11am – 17pm</p>
              <p>Domingo: Cerrado</p>
              <p className="pt-2">+56 9 58306982</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[11px] tracking-[0.25em] text-primary-foreground/60">CONTACTO</h3>
            <div className="mt-6 space-y-2 text-sm leading-relaxed text-primary-foreground/80">
              <p>studioclaumiranda@gmail.com</p>
              <a
                href="https://www.instagram.com/studioclaumiranda/"
                target="_blank"
                rel="noopener noreferrer"
                className="block pt-2 underline underline-offset-4 hover:text-primary-foreground"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Newsletter card */}
          <div className="bg-primary-foreground/10 p-6">
            <p className="font-serif text-xl italic leading-snug">
              Suscríbete para tips de belleza y ofertas exclusivas
            </p>
            <form className="mt-6 flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="Tu email"
                className="border-b border-primary-foreground/30 bg-transparent pb-2 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:border-primary-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="mt-2 self-start text-[11px] tracking-[0.25em] text-primary-foreground/70 transition-colors hover:text-primary-foreground"
              >
                SUSCRIBIRSE →
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Image strip */}
      <div className="grid grid-cols-3">
        <img src="/footer-1.png" alt="Textura de cabello rubio ondulado" className="h-40 w-full object-cover md:h-48" />
        <div className="flex items-center justify-center bg-background">
          <span className="font-serif text-3xl text-foreground md:text-4xl">Studio Clau</span>
        </div>
        <img src="/footer-2.png" alt="Tela de seda crema suave" className="h-40 w-full object-cover md:h-48" />
      </div>

      <div className="bg-background py-6 text-center">
        <p className="text-[10px] tracking-[0.2em] text-foreground/50">
          © 2026 STUDIO CLAU MIRANDA — TODOS LOS DERECHOS RESERVADOS
        </p>
      </div>
    </footer>
  )
}
