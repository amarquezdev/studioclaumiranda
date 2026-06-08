import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const leftLinks = [
  { label: 'INICIO',   href: '#'         },
  { label: 'RESEÑAS',  href: '#resenas'  },
]
const rightLinks = [
  { label: 'RESERVA',  href: '#book'     },
  { label: 'HISTORIA', href: '#historia' },
  { label: 'TRABAJOS', href: '#trabajos' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-10 px-6 py-6 md:justify-center md:px-10">
        {/* Left links */}
        <ul className="hidden flex-1 items-center justify-end gap-8 md:flex">
          {leftLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-[11px] tracking-[0.2em] text-foreground/70 transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Logo */}
        <a
          href="#"
          className="font-serif text-2xl font-medium tracking-wide text-foreground md:text-3xl"
        >
          Studio Clau Miranda
        </a>

        {/* Right links */}
        <ul className="hidden flex-1 items-center justify-start gap-8 md:flex">
          {rightLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-[11px] tracking-[0.2em] text-foreground/70 transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      <div
        className={`overflow-hidden border-border bg-background/95 transition-all duration-300 ease-in-out md:hidden ${
          open ? 'max-h-64 border-t' : 'max-h-0'
        }`}
      >
        <ul className="flex flex-col gap-4 px-6 py-6">
          {[...leftLinks, ...rightLinks].map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-xs tracking-[0.2em] text-foreground/70"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
