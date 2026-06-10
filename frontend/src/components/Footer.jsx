export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Visit */}
          <div>
            <h3 className="text-[11px] tracking-[0.25em] text-primary-foreground/60">VISÍTANOS</h3>
            <address className="mt-6 not-italic space-y-2 text-sm leading-relaxed text-primary-foreground/80">
              <p>Peluquería Studio Clau Miranda</p>
              <p>Pje. San Sebastián Mártir 1734</p>
              <p>San Vicente de Tagua Tagua</p>
              <p>Región de O'Higgins, Chile</p>
            </address>
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

        </div>
      </div>

      <div className="bg-background py-6 text-center">
        <p className="text-[10px] tracking-[0.2em] text-foreground/50">
          © 2026 STUDIO CLAU MIRANDA — TODOS LOS DERECHOS RESERVADOS
        </p>
      </div>
    </footer>
  )
}
