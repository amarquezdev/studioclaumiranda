import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { getReviews } from '../api/client'

function Stars({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < count ? 'fill-primary text-primary' : 'fill-muted text-muted'}`}
        />
      ))}
    </div>
  )
}

export default function Reviews() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReviews()
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const reviews       = data?.reviews ?? []
  const overallRating = data?.overall_rating ?? 5.0
  const totalRatings  = data?.total_ratings ?? 0

  return (
    <section id="resenas" className="py-24 px-6 lg:px-12 bg-background">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4">Testimonios</p>
          <h2 className="text-4xl md:text-5xl font-light text-foreground tracking-wide">
            Lo que dicen <span className="italic">Nuestras Clientas</span>
          </h2>

          {/* Overall rating */}
          {!loading && data && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-2xl font-medium text-foreground">
                {overallRating.toFixed(1)}
              </span>
              {totalRatings > 0 && (
                <span className="text-muted-foreground">
                  basado en {totalRatings} reseñas de Google
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {loading && (
            <p className="text-muted-foreground text-sm col-span-2 text-center">
              Cargando reseñas...
            </p>
          )}

          {!loading && reviews.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-2 text-center">
              No hay reseñas disponibles.
            </p>
          )}

          {!loading && reviews.map((r, i) => (
            <div
              key={i}
              className="bg-card border border-border p-8 transition-all duration-300 hover:border-primary/50"
            >
              <div className="flex items-start gap-4 mb-6">
                {r.profile_photo_url ? (
                  <img
                    src={r.profile_photo_url}
                    alt={r.author_name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-medium shrink-0">
                    {r.author_initial}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-base font-medium text-foreground truncate">{r.author_name}</h4>
                    <span className="text-sm text-muted-foreground shrink-0">{r.relative_time_description}</span>
                  </div>
                  <div className="mt-1">
                    <Stars count={r.rating} />
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">"{r.text}"</p>

              {/* Google badge */}
              <div className="mt-6 flex items-center gap-2 text-muted-foreground">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-xs uppercase tracking-wider">Google Review</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
