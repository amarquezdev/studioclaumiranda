import { MapPin, Phone, Mail, Clock } from 'lucide-react'

function InstagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function FacebookIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer id="contacto" className="bg-secondary py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">

          {/* Logo & Description */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-light tracking-wide text-foreground mb-4">
              <span className="italic">Studio</span> Clau Miranda
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Peluquería y estética donde cada detalle importa. Realzamos tu belleza con dedicación y profesionalismo.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <FacebookIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase text-foreground mb-6">Navegación</h4>
            <ul className="space-y-3">
              {[
                { label: 'Inicio',    href: '#'         },
                { label: 'Servicios', href: '#servicios' },
                { label: 'Reservar',  href: '#reservar'  },
                { label: 'Reseñas',   href: '#resenas'   },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase text-foreground mb-6">Servicios</h4>
            <ul className="space-y-3">
              {['Corte de Cabello', 'Coloración', 'Tratamientos', 'Peinados', 'Estética'].map(s => (
                <li key={s}>
                  <a href="#servicios" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase text-foreground mb-6">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>Chile</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+56 9 5830 6982</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>contacto@studioclau.cl</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <Clock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p>Lun – Vie: 10:00 – 19:00</p>
                  <p>Sáb: 11:00 – 16:00</p>
                  <p>Dom: Cerrado</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs tracking-wider">
            © 2026 Studio Clau Miranda. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-xs">
              Política de Privacidad
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-xs">
              Términos y Condiciones
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
