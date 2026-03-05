"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "Angebote", href: "#" },
  { label: "Kategorien", href: "#categories" },
  { label: "So funktioniert's", href: "#" },
  { label: "Über uns", href: "#" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="relative flex w-full items-center justify-between rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.6)] px-6 py-3 backdrop-blur-xl">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">E</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Emirates of Deals
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <button className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
              Anmelden
            </button>
            <button className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,229,255,0.3)] active:scale-95 active:shadow-none">
              Loslegen
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mx-6 mt-1 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.95)] p-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="my-2 h-px bg-border" />
            <button className="rounded-xl px-4 py-3 text-left text-sm text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground">
              Anmelden
            </button>
            <button className="mt-1 rounded-full bg-primary px-5 py-3 text-center text-sm font-medium text-primary-foreground transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95">
              Loslegen
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
