import { Instagram, Facebook, MapPin, Phone, Mail, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="bg-secondary py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-light tracking-wide text-foreground mb-4">
              <span className="italic">Lumière</span>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Tu destino de belleza donde cada detalle importa. Experiencias de lujo para realzar tu belleza natural.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase text-foreground mb-6">Navegación</h4>
            <ul className="space-y-3">
              {["Inicio", "Servicios", "Reservar", "Sobre Nosotros", "Contacto"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase text-foreground mb-6">Servicios</h4>
            <ul className="space-y-3">
              {["Corte de Cabello", "Coloración", "Tratamientos", "Peinados", "Maquillaje", "Manicure"].map((service) => (
                <li key={service}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {service}
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
                <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                <span>Calle Gran Vía 45, Madrid, España</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span>+34 912 345 678</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span>hola@lumiere.es</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <Clock className="w-4 h-4 mt-0.5 text-primary" />
                <div>
                  <p>Lun - Sáb: 9:00 - 20:00</p>
                  <p>Domingo: Cerrado</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs tracking-wider">
            © 2026 Lumière Beauty Salon. Todos los derechos reservados.
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
