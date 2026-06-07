import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const leftLinks = ['ABOUT', 'SERVICES', 'GALLERY']
const rightLinks = ['PRODUCTS', 'BLOG', 'CONTACT']

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-10 px-6 py-6 md:justify-center md:px-10">
        {/* Left links */}
        <ul className="hidden flex-1 items-center justify-end gap-8 md:flex">
          {leftLinks.map((link) => (
            <li key={link}>
              <a
                href="#"
                className="text-[11px] tracking-[0.2em] text-foreground/70 transition-colors hover:text-foreground"
              >
                {link}
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
            <li key={link}>
              <a
                href="#"
                className="text-[11px] tracking-[0.2em] text-foreground/70 transition-colors hover:text-foreground"
              >
                {link}
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

      {open && (
        <div className="border-t border-border bg-background/95 px-6 py-6 md:hidden">
          <ul className="flex flex-col gap-4">
            {[...leftLinks, ...rightLinks].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-xs tracking-[0.2em] text-foreground/70"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
