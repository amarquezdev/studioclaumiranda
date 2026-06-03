import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '../lib/utils'

const navLinks = [
  { name: 'Inicio',    href: '#'         },
  { name: 'Servicios', href: '#servicios' },
  { name: 'Reservar',  href: '#reservar'  },
  { name: 'Reseñas',   href: '#resenas'   },
  { name: 'Contacto',  href: '#contacto'  },
]

// Glass styles: hero (transparent over dark image) vs scrolled (opaque over light sections)
const glassHero = {
  background:           'rgba(255,255,255,0.09)',
  border:               '1px solid rgba(255,255,255,0.18)',
}
const glassScrolled = {
  background:           'rgba(28,24,20,0.88)',
  border:               '1px solid rgba(255,255,255,0.10)',
}

// Neumorphism states — work on both glass variants since text is always white
const NEU_IDLE = {
  background:   'transparent',
  boxShadow:    'none',
  borderRadius: '9999px',
  padding:      '6px 14px',
  transition:   'background 0.2s, box-shadow 0.2s, color 0.2s',
}
const NEU_HOVER = {
  ...NEU_IDLE,
  background: 'rgba(255,255,255,0.08)',
  boxShadow:  '4px 4px 10px rgba(0,0,0,0.35), -2px -2px 6px rgba(255,255,255,0.12)',
}

function NavItem({ link, mobile = false, onClick }) {
  const [hovered, setHovered] = useState(false)

  const mobileStyle = {
    background:   hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
    boxShadow:    hovered
      ? 'inset 3px 3px 7px rgba(0,0,0,0.30), inset -2px -2px 5px rgba(255,255,255,0.10)'
      : 'none',
    borderRadius: '10px',
    padding:      '10px 14px',
    transition:   'background 0.2s, box-shadow 0.2s',
    color:        hovered ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.70)',
  }

  return (
    <a
      href={link.href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 300)}
      className={cn(
        'block tracking-[0.22em] uppercase select-none',
        mobile ? 'text-[11px] border-b border-white/10 last:border-0' : 'text-[10.5px]'
      )}
      style={mobile ? mobileStyle : {
        ...(hovered ? NEU_HOVER : NEU_IDLE),
        color: hovered ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.68)',
      }}
    >
      {link.name}
    </a>
  )
}

export default function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.82)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const glass = {
    ...(scrolled ? glassScrolled : glassHero),
    backdropFilter:       'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    borderRadius:         '16px',
    transition:           'background 0.45s ease, border-color 0.45s ease',
  }

  return (
    <header className="fixed top-3 left-3 right-3 md:top-5 md:left-8 md:right-8 z-50">

      {/* ── Floating pill ────────────────────────────────────────────────── */}
      <div style={glass}>
        <div className="px-5 py-2.5 flex items-center justify-between">

          {/* Brand */}
          <a
            href="#"
            style={{
              fontFamily:    "'Cormorant Garamond', Georgia, serif",
              color:         'rgba(255,255,255,0.92)',
              letterSpacing: '0.28em',
              fontSize:      '0.75rem',
              fontWeight:    300,
              textTransform: 'uppercase',
              lineHeight:    1,
            }}
          >
            Studio Clau Miranda
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <NavItem key={link.name} link={link} />
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden"
            aria-label="Menú"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ──────────────────────────────────────────────── */}
      <div className={cn(
        'md:hidden absolute left-0 right-0 mt-2 overflow-hidden transition-all duration-300',
        open ? 'max-h-80 opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'
      )}>
        <div style={{
          background:           'rgba(18,15,13,0.72)',
          backdropFilter:       'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border:               '1px solid rgba(255,255,255,0.13)',
          borderRadius:         '14px',
        }}>
          <nav className="flex flex-col px-3 py-3">
            {navLinks.map(link => (
              <NavItem
                key={link.name}
                link={link}
                mobile
                onClick={() => setOpen(false)}
              />
            ))}
          </nav>
        </div>
      </div>

    </header>
  )
}
