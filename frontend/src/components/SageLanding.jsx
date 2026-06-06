/**
 * Sage-inspired landing design adapted for Studio Clau Miranda.
 * Replaces Hero + Services + About with the Sage editorial layout.
 */

const IMG = {
  hero:     'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&h=1200&q=90',
  jar:      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=85',
  salon1:   'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=720&q=85',
  balayage: 'https://images.unsplash.com/photo-1487412947147-5cebf100d293?auto=format&fit=crop&w=720&q=85',
  products: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?auto=format&fit=crop&w=960&q=85',
  small:    'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&w=480&q=85',
}

export default function SageLanding() {
  return (
    <div className="font-serif" style={{ backgroundColor: '#F7F2EC', color: '#2A2420' }}>

      {/* ── HERO 3 COLUMNAS (desktop) / fullscreen (mobile) ─────────────── */}

      {/* Desktop: 3 columns */}
      <section
        className="hidden md:grid"
        style={{
          height: '100svh',
          paddingTop: '65px',         /* navbar height */
          gridTemplateColumns: '5fr 6fr 4fr',
          backgroundColor: '#F7F2EC',
        }}
      >
        {/* ── Columna izquierda — texto editorial ── */}
        <div style={{
          background:     '#F7F2EC',
          display:        'flex',
          flexDirection:  'column',
          justifyContent: 'flex-end',
          padding:        '0 2.5rem 4rem 3rem',
        }}>
          <p style={{
            fontFamily:    'system-ui, sans-serif',
            fontSize:      '0.65rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color:         '#8A8480',
            marginBottom:  '1.5rem',
          }}>
            Peluquería &amp; Estética
          </p>
          <h1 style={{
            fontFamily:   'system-ui, -apple-system, sans-serif',
            fontSize:     'clamp(2.4rem, 4vw, 4rem)',
            fontWeight:   800,
            lineHeight:   0.95,
            letterSpacing:'-0.02em',
            textTransform:'uppercase',
            color:        '#2A2420',
            margin:       0,
          }}>
            GOOD<br/>HAIR<br/>DAYS
          </h1>
          <h1 style={{
            fontFamily:  "'Cormorant Garamond', Georgia, serif",
            fontSize:    'clamp(2.4rem, 4vw, 4rem)',
            fontWeight:  300,
            fontStyle:   'italic',
            lineHeight:  1.05,
            color:       '#2A2420',
            margin:      '0.2rem 0 0',
          }}>
            Just Got<br/>Better
          </h1>
        </div>

        {/* ── Columna central — imagen + botón ── */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src={IMG.hero}
            alt="Studio Clau Miranda"
            style={{
              position:       'absolute',
              inset:          0,
              width:          '100%',
              height:         '100%',
              objectFit:      'cover',
              objectPosition: 'center 15%',
            }}
          />
          {/* Gradient al fondo para contraste del botón */}
          <div style={{
            position:   'absolute',
            inset:      0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 40%)',
          }} />
          {/* Botón de reserva */}
          <a
            href="#reservar"
            style={{
              position:      'absolute',
              bottom:        '2.5rem',
              left:          '50%',
              transform:     'translateX(-50%)',
              background:    '#2A2420',
              color:         '#F7F2EC',
              padding:       '14px 40px',
              fontSize:      '0.68rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              textDecoration:'none',
              fontFamily:    'system-ui, sans-serif',
              whiteSpace:    'nowrap',
              transition:    'background 0.2s',
              display:       'inline-block',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#6E8060'}
            onMouseLeave={e => e.currentTarget.style.background = '#2A2420'}
          >
            Reservar Hora
          </a>
        </div>

        {/* ── Columna derecha — info complementaria ── */}
        <div style={{
          background:     '#F7F2EC',
          display:        'flex',
          flexDirection:  'column',
          justifyContent: 'flex-end',
          padding:        '0 2.5rem 4rem 2rem',
        }}>
          <div style={{ width: '2rem', height: '1px', background: '#6E8060', marginBottom: '1rem' }} />
          <p style={{
            fontFamily:  "'Cormorant Garamond', Georgia, serif",
            fontSize:    '1rem',
            fontStyle:   'italic',
            color:       '#2A2420',
            marginBottom:'0.4rem',
            lineHeight:  1.3,
          }}>
            Studio Clau Miranda
          </p>
          <p style={{
            fontFamily:    'system-ui, sans-serif',
            fontSize:      '0.65rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         '#8A8480',
            marginBottom:  '1.5rem',
            lineHeight:    1.6,
          }}>
            Reserva tu hora<br/>en línea
          </p>
          <p style={{
            fontFamily:    'system-ui, sans-serif',
            fontSize:      '0.6rem',
            letterSpacing: '0.12em',
            color:         '#B0A8A4',
            textTransform: 'uppercase',
          }}>
            studioclaumiranda.cl
          </p>
        </div>
      </section>

      {/* Mobile: imagen fullscreen con texto overlay */}
      <section className="md:hidden relative overflow-hidden" style={{ height: '100svh' }}>
        <img
          src={IMG.hero}
          alt="Studio Clau Miranda"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 15%' }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)',
        }} />
        <div className="absolute bottom-10 left-6 right-6">
          <h1 style={{
            fontFamily:    'system-ui, sans-serif',
            fontSize:      'clamp(2.4rem, 12vw, 4rem)',
            fontWeight:    800,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color:         'rgba(255,255,255,0.95)',
            lineHeight:    0.95,
            marginBottom:  '0.15em',
          }}>
            GOOD HAIR DAYS
          </h1>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize:   'clamp(2.4rem, 12vw, 4rem)',
            fontWeight: 300,
            fontStyle:  'italic',
            color:      'rgba(255,255,255,0.93)',
            lineHeight: 1.05,
            marginBottom:'1.5rem',
          }}>
            Just Got Better
          </h1>
          <a
            href="#reservar"
            style={{
              display:       'inline-block',
              background:    '#F7F2EC',
              color:         '#2A2420',
              padding:       '13px 36px',
              fontSize:      '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textDecoration:'none',
              fontFamily:    'system-ui, sans-serif',
            }}
          >
            Reservar Hora
          </a>
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
