import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-background">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">

        {/* Left image */}
        <div className="hidden md:block relative h-[70vh] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1648157963892-fa90a04e278b?q=80&w=821&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Barbería interior"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Center content */}
        <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1554651802-723bd268a3a5?q=80&w=785&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Barbería"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/65" />

          <div className="relative z-10 text-center px-6">
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4">Bienvenida a</p>
            <h2 className="text-5xl md:text-7xl font-light text-foreground tracking-wide">
              <span className="italic">Studio</span> Clau
            </h2>
            <p className="text-2xl md:text-3xl font-light text-foreground tracking-[0.15em] uppercase mt-2">
              Miranda
            </p>
            <div className="mt-6 inline-block">
              <span className="text-xs tracking-[0.2em] uppercase text-foreground border border-foreground px-6 py-2">
                Peluquería &amp; Estética
              </span>
            </div>
            <div className="mt-8">
              <a
                href="#reservar"
                className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-sm tracking-wider uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Reservar Ahora
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Right image */}
        <div className="hidden md:block relative h-[70vh] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1554555819-f722cb0c01c5?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Corte de cabello"
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </section>
  )
}
