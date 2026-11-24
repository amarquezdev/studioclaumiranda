export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Service area */}
          <div>
            <h3 className="text-[11px] tracking-[0.25em] text-primary-foreground/60">A DOMICILIO</h3>
            <div className="mt-6 space-y-2 text-sm leading-relaxed text-primary-foreground/80">
              <p>Claudia Miranda, estilista</p>
              <p>Santiago</p>
              <p>Viña del Mar y Concón</p>
              <p>San Vicente de Tagua Tagua</p>
            </div>
          </div>

          {/* Book */}
          <div>
            <h3 className="text-[11px] tracking-[0.25em] text-primary-foreground/60">RESERVAS</h3>
            <div className="mt-6 space-y-2 text-sm leading-relaxed text-primary-foreground/80">
              <p>Horario flexible, coordinado según tu disponibilidad.</p>
              <a
                href="https://wa.me/56958306982"
                target="_blank"
                rel="noopener noreferrer"
                className="block pt-2 hover:text-primary-foreground"
              >
                +56 9 5830 6982
              </a>
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

      <div className="bg-background pb-24 pt-6 text-center md:pb-6">
        <p className="text-[10px] tracking-[0.2em] text-foreground/70">
          © 2026 STUDIO CLAU MIRANDA — TODOS LOS DERECHOS RESERVADOS
        </p>
      </div>
    </footer>
  )
}
