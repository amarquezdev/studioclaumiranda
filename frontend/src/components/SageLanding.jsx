/**
 * Sage-inspired landing design adapted for Studio Clau Miranda.
 * Replaces Hero + Services + About with the Sage editorial layout.
 */

const IMG = {
  hero:     'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1920&q=90',
  jar:      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=85',
  salon1:   'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=720&q=85',
  balayage: 'https://images.unsplash.com/photo-1487412947147-5cebf100d293?auto=format&fit=crop&w=720&q=85',
  products: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?auto=format&fit=crop&w=960&q=85',
  small:    'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&w=480&q=85',
}

export default function SageLanding() {
  return (
    <div className="font-serif" style={{ backgroundColor: '#F7F2EC', color: '#2A2420' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ height: '100svh' }}>
        {/* Hero image — woman with flowing hair, face zoomed */}
        <img
          src={IMG.hero}
          alt="Studio Clau Miranda"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 15%' }}
        />

        {/* Gradient: darkens top (navbar legibility) and bottom (monogram legibility) */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.52) 100%)',
        }} />

        {/* "stcm" monogram — massive italic serif, lower-left */}
        <div className="absolute bottom-6 left-6 leading-none select-none" style={{ lineHeight: 0.85 }}>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(7rem, 18vw, 17rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.93)',
              display: 'block',
              textShadow: '0 2px 40px rgba(0,0,0,0.25)',
            }}
          >
            stcm
          </span>
          {/* Thin subtitle line */}
          <span
            style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '0.65rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
              display: 'block',
              marginTop: '0.5rem',
              marginLeft: '0.15em',
            }}
          >
            Studio Clau Miranda — Peluquería &amp; Estética
          </span>
        </div>
      </section>

      {/* ── PHILOSOPHY ───────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#FAFAF7' }} className="py-24 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Text left */}
          <div>
            <h2
              className="mb-6 leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                fontWeight: 400,
                color: '#2A2420',
              }}
            >
              New philosophy<br />
              of selfcare: healthy<br />
              skin&amp;hair
            </h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#5A5450', maxWidth: '34ch' }}>
              Sage is about conscious simplicity — effective formulas,
              thoughtful ingredients, and soft textures designed for real
              everyday life.
            </p>
            <p className="text-sm leading-relaxed mb-8" style={{ color: '#5A5450', maxWidth: '34ch' }}>
              We believe skincare should support your skin, not overwhelm
              it; combining modern science with a calm, minimal approach.
            </p>
            <a
              href="#reservar"
              className="inline-block text-sm tracking-wide"
              style={{
                backgroundColor: '#6E8060',
                color: '#fff',
                borderRadius: '9999px',
                padding: '0.65rem 1.6rem',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: 400,
                letterSpacing: '0.03em',
                textDecoration: 'none',
              }}
            >
              More about Studio Clau
            </a>
          </div>

          {/* Product image right */}
          <div className="flex items-center justify-center">
            <img
              src={IMG.jar}
              alt="Producto capilar destacado"
              className="w-full max-w-sm object-cover"
              style={{
                height: '420px',
                objectFit: 'cover',
                borderRadius: '4px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.10)',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── PURE CARE ────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#F7F2EC' }} className="py-20 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* Left: 2 photos side by side */}
          <div className="grid grid-cols-2 gap-3">
            <img
              src={IMG.salon1}
              alt="Interior del salón"
              className="w-full object-cover"
              style={{ height: '340px', objectFit: 'cover' }}
            />
            <img
              src={IMG.balayage}
              alt="Coloración y estilismo"
              className="w-full object-cover"
              style={{ height: '340px', objectFit: 'cover' }}
            />
          </div>

          {/* Right: text + small photo */}
          <div className="md:pl-8 pt-4 md:pt-0">
            <h2
              className="mb-5 leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                fontWeight: 400,
                color: '#2A2420',
              }}
            >
              Pure care<br />by nature
            </h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#5A5450' }}>
              Thoughtfully crafted formulas designed to
              bring balance and calm to your daily routine.
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#5A5450' }}>
              Lightweight textures, gentle ingredients, and
              a minimalist approach help support healthy-
              looking skin — effortlessly, every day.
            </p>
            <img
              src={IMG.small}
              alt="Detalle de técnica"
              className="w-full object-cover"
              style={{ height: '200px', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* ── ALL-IN-ONE COLLECTION ────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 px-6 lg:px-16"
        style={{ backgroundColor: '#F7F2EC' }}
      >
        {/* Large watermark text — "nueva" behind content */}
        <span
          aria-hidden="true"
          className="absolute select-none pointer-events-none"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(10rem, 28vw, 26rem)',
            fontWeight: 700,
            color: '#C8D0BD',
            opacity: 0.55,
            bottom: '-2rem',
            left: '-1rem',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            zIndex: 0,
          }}
        >
          new
        </span>

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Products image left */}
          <div>
            <img
              src={IMG.products}
              alt="Colección de productos capilares"
              className="w-full object-cover"
              style={{ height: '480px', objectFit: 'cover' }}
            />
          </div>

          {/* Text right */}
          <div>
            <h2
              className="mb-4 leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                fontWeight: 400,
                color: '#2A2420',
              }}
            >
              All-in-One<br />
              Skincare Comlex
            </h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#5A5450', maxWidth: '32ch' }}>
              Multifunctional line designed to simplify your daily routine
              without compromising results
            </p>
            <p className="text-sm leading-relaxed mb-8" style={{ color: '#5A5450', maxWidth: '38ch' }}>
              Each formula combines hydration, barrier support, and
              skin-balancing ingredients to work in one effortless step.
              The collection focuses on smart minimalism — fewer
              products, more impact, and consistent care for healthy-
              looking skin.
            </p>
            <a
              href="#servicios"
              className="inline-block text-sm tracking-wide"
              style={{
                border: '1px solid #2A2420',
                color: '#2A2420',
                borderRadius: '9999px',
                padding: '0.6rem 1.6rem',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: 400,
                letterSpacing: '0.04em',
                textDecoration: 'none',
              }}
            >
              Catalog
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
