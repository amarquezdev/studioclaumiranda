"use client"

import { useState } from "react"
import { Search, ShoppingBag, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { name: "Inicio", href: "#" },
  { name: "Servicios", href: "#services" },
  { name: "Reservar", href: "#booking" },
  { name: "Contacto", href: "#contact" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="relative">
      {/* Top Banner */}
      <div className="bg-primary py-2 text-center">
        <p className="text-primary-foreground text-xs tracking-[0.2em] uppercase">
          ✦ Primera visita: 20% de descuento en todos los servicios ✦
        </p>
      </div>

      {/* Main Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            {/* Left Icons */}
            <div className="flex items-center gap-6">
              <button className="text-foreground hover:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Logo */}
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-light tracking-wide text-foreground">
                <span className="italic">Lumière</span>
              </h1>
              <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mt-1">
                Beauty Salon
              </p>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-6">
              <button className="text-foreground hover:text-primary transition-colors hidden md:block">
                <ShoppingBag className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-foreground hover:text-primary transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-12 mt-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors uppercase"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "absolute top-full left-0 right-0 bg-background border-b border-border z-50 md:hidden transition-all duration-300",
          mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        <nav className="flex flex-col py-6 px-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="py-3 text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors uppercase border-b border-border last:border-0"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
