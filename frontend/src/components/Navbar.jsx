import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '../lib/utils'

const leftLinks  = [
  { name: 'Inicio',    href: '#'         },
  { name: 'Servicios', href: '#servicios' },
  { name: 'Reservar',  href: '#reservar'  },
]
const rightLinks = [
  { name: 'Reseñas',  href: '#resenas'  },
  { name: 'Contacto', href: '#contacto' },
]
const allLinks = [...leftLinks, ...rightLinks]

const linkCls = "text-[11px] tracking-[0.22em] uppercase transition-colors duration-200 hover:text-primary"
const linkStyle = { color: '#6A6460' }

export default function Navbar() {
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-300"
      style={{
        background:   '#F7F2EC',
        borderBottom: scrolled ? '1px solid #E0D9D2' : '1px solid transparent',
        boxShadow:    scrolled ? '0 1px 12px rgba(42,36,32,0.06)' : 'none',
      }}
    >
      {/* ── Desktop nav ─────────────────────────────────────────────── */}
      <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center px-10 py-4">

        {/* Left links */}
        <nav className="flex items-center justify-end gap-8">
          {leftLinks.map(link => (
            <a key={link.name} href={link.href} className={linkCls} style={linkStyle}>
              {link.name}
            </a>
          ))}
        </nav>

        {/* Center — Logo */}
        <a
          href="#"
          className="px-10 text-center leading-none"
          style={{
            fontFamily:    "'Cormorant Garamond', Georgia, serif",
            fontSize:      '1.15rem',
            fontWeight:    400,
            fontStyle:     'italic',
            letterSpacing: '0.06em',
            color:         '#2A2420',
          }}
        >
          Studio Clau Miranda
        </a>

        {/* Right links */}
        <nav className="flex items-center gap-8">
          {rightLinks.map(link => (
            <a key={link.name} href={link.href} className={linkCls} style={linkStyle}>
              {link.name}
            </a>
          ))}
        </nav>
      </div>

      {/* ── Mobile nav ──────────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-5 py-4">
        <a
          href="#"
          style={{
            fontFamily:    "'Cormorant Garamond', Georgia, serif",
            fontSize:      '1rem',
            fontStyle:     'italic',
            letterSpacing: '0.05em',
            color:         '#2A2420',
          }}
        >
          Studio Clau Miranda
        </a>
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Menú"
          style={{ color: '#6A6460' }}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className={cn(
        'md:hidden overflow-hidden transition-all duration-300',
        open ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
      )}>
        <nav
          className="flex flex-col border-t px-5 py-4 gap-0"
          style={{ background: '#F7F2EC', borderColor: '#E0D9D2' }}
        >
          {allLinks.map(link => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-3 text-[11px] tracking-[0.22em] uppercase border-b last:border-0 transition-colors hover:text-primary"
              style={{ color: '#6A6460', borderColor: '#E0D9D2' }}
            >
              {link.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
