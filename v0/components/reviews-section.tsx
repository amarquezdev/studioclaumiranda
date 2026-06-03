import { Star } from "lucide-react"

const reviews = [
  {
    id: 1,
    name: "Laura Martínez",
    date: "Hace 2 semanas",
    rating: 5,
    text: "Una experiencia increíble. El ambiente es muy elegante y relajante. María hizo un trabajo espectacular con mi color, exactamente lo que quería. Definitivamente volveré.",
    avatar: "L",
  },
  {
    id: 2,
    name: "Patricia Sánchez",
    date: "Hace 1 mes",
    rating: 5,
    text: "El mejor salón de belleza de la ciudad. Atención impecable y resultados profesionales. Los tratamientos capilares son maravillosos, mi cabello nunca había estado tan saludable.",
    avatar: "P",
  },
  {
    id: 3,
    name: "Carmen Rodríguez",
    date: "Hace 1 mes",
    rating: 5,
    text: "Vine para mi boda y quedé encantada. El equipo es muy profesional y atento a cada detalle. El maquillaje duró toda la noche y las fotos quedaron perfectas.",
    avatar: "C",
  },
  {
    id: 4,
    name: "Isabel García",
    date: "Hace 2 meses",
    rating: 4,
    text: "Excelente servicio y ambiente muy acogedor. Las instalaciones son de primera clase. El único detalle es que a veces hay que esperar un poco, pero vale la pena.",
    avatar: "I",
  },
]

export function ReviewsSection() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4">Testimonios</p>
          <h2 className="text-4xl md:text-5xl font-light text-foreground tracking-wide">
            Lo que dicen <span className="italic">Nuestras Clientas</span>
          </h2>
          
          {/* Google Rating Summary */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-2xl font-medium text-foreground">4.9</span>
            <span className="text-muted-foreground">basado en 127 reseñas de Google</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card border border-border p-8 transition-all duration-300 hover:border-primary/50"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-medium">
                  {review.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-foreground">{review.name}</h4>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "fill-primary text-primary"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">{review.text}</p>
              
              {/* Google Icon */}
              <div className="mt-6 flex items-center gap-2 text-muted-foreground">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-xs uppercase tracking-wider">Google Review</span>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm tracking-wider uppercase"
          >
            Ver todas las reseñas en Google
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
