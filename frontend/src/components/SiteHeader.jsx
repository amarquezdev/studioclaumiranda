import { useEffect, useState } from 'react'

const WA_HREF = 'https://wa.me/56958306982?text=Hola%20Clau,%20quisiera%20reservar%20una%20cita%20%F0%9F%91%8B%F0%9F%8F%BB'

const links = [
  { label: 'Inicio',   href: '#'         },
  { label: 'Reseñas',  href: '#resenas'  },
  { label: 'Reserva',  href: '#book'     },
  { label: 'Historia', href: '#historia' },
  { label: 'Trabajos', href: '#trabajos' },
]

const STAGGER = 90   // ms between each item
const BASE_DELAY = 250

// Hamburger with uneven line widths; morphs into an X when open.
function Burger({ open, onClick }) {
  const line = 'absolute right-0 h-[1.5px] md:h-[2px] bg-foreground transition-all duration-500 ease-[cubic-bezier(0.7,0,0.2,1)]'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={open}
      aria-controls="site-menu"
      className="group relative h-[18px] w-8 md:h-[22px] md:w-11"
    >
      <span
        className={`${line} ${open ? 'top-1/2 w-full rotate-45' : 'top-0 w-full group-hover:w-3/4'}`}
      />
      <span
        className={`${line} top-1/2 ${open ? 'w-0 opacity-0' : 'w-1/2 group-hover:w-full'}`}
      />
      <span
        className={`${line} ${open ? 'top-1/2 w-full -rotate-45' : 'top-full w-3/4 group-hover:w-1/2'}`}
      />
    </button>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  // Lock background scroll while the menu covers the page
  useEffect(() => {
    const root = document.documentElement
    if (open) {
      root.style.overflow = 'hidden'
      window.__lenis?.stop()
    } else {
      root.style.overflow = ''
      window.__lenis?.start()
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (e, href) => {
    e.preventDefault()
    setOpen(false)
    const target = href === '#' ? 0 : document.querySelector(href)
    // Wait one frame so the scroll lock is released before scrolling
    requestAnimationFrame(() => {
      if (window.__lenis) window.__lenis.scrollTo(target, { duration: 1.4 })
      else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' })
      else target?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="relative mx-auto flex max-w-6xl items-center justify-center px-6 pb-4 pt-8 md:px-10 md:pt-10">
<div className="absolute right-6 top-[calc(50%+8px)] flex -translate-y-1/2 md:right-10 md:top-[calc(50%+12px)]">
            <Burger open={false} onClick={() => setOpen(true)} />
          </div>
          <a
            href="#"
            onClick={(e) => go(e, '#')}
            className="font-serif text-2xl font-medium italic tracking-wide text-foreground md:text-3xl"
          >
            Studio Clau Miranda
          </a>
        </nav>
      </header>

      {/* Full-screen menu */}
      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        aria-hidden={!open}
        className={`fixed inset-0 z-[60] flex flex-col bg-background transition-[clip-path] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${
          open ? 'pointer-events-auto [clip-path:inset(0_0_0_0)]' : 'pointer-events-none [clip-path:inset(0_0_100%_0)]'
        }`}
      >
        <div className="relative mx-auto flex w-full max-w-6xl items-center justify-center px-6 pb-4 pt-8 md:px-10 md:pt-10">
<div className="absolute right-6 top-[calc(50%+8px)] flex -translate-y-1/2 md:right-10 md:top-[calc(50%+12px)]">
            <Burger open={open} onClick={() => setOpen(false)} />
          </div>
          <span className="font-serif text-2xl font-medium italic tracking-wide text-foreground md:text-3xl">
            Studio Clau Miranda
          </span>
        </div>

        <nav className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 pb-12">
          <ul className="flex flex-col items-center gap-5 md:gap-7">
            {links.map((link, i) => (
              <li key={link.label} className="overflow-hidden">
                <a
                  href={link.href}
                  onClick={(e) => go(e, link.href)}
                  tabIndex={open ? 0 : -1}
                  style={{ transitionDelay: open ? `${BASE_DELAY + i * STAGGER}ms` : '0ms' }}
                  className={`block font-sans text-lg font-light tracking-[0.3em] text-foreground transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] md:text-2xl ${
                    open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                  }`}
                >
                  <span className="transition-colors hover:text-muted-foreground">
                    {link.label.toUpperCase()}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={open ? 0 : -1}
            style={{ transitionDelay: open ? `${BASE_DELAY + links.length * STAGGER + 60}ms` : '0ms' }}
            className={`mt-12 inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-[11px] tracking-[0.25em] text-primary-foreground transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-gold-light md:mt-16 ${
              open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            ESCRÍBENOS POR WHATSAPP
          </a>
        </nav>
      </div>
    </>
  )
}
