import { useState } from 'react'
import { Menu, X, Heart, Settings, Bell } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

const navLinks = [
  { label: 'Angebote', href: '#' },
  { label: 'Kategorien', href: '#categories' },
  { label: 'So funktioniert\'s', href: '#' },
]

export function Header({ onLogoClick, onWatchlistClick, onSettingsClick, onAlertsClick }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { favorites } = useFavorites()
  const favoritesCount = favorites.length

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="relative flex w-full items-center justify-between rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.6)] px-6 py-3 backdrop-blur-xl">

          {/* Logo */}
          <button onClick={onLogoClick} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="BargainBot" className="w-8 h-8 rounded-lg object-cover" onError={(e) => { e.target.style.display = 'none' }} />
            <span className="text-sm font-semibold tracking-tight text-foreground">BargainBot</span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}
                className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
                {link.label}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden items-center gap-1.5 md:flex">
            <button onClick={onSettingsClick}
              className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground"
              title="Einstellungen">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={onAlertsClick}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
              <Bell className="w-4 h-4" />
              Alerts
            </button>
            <button onClick={onWatchlistClick}
              className="relative flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,229,255,0.3)] active:scale-95 active:shadow-none">
              <Heart className="w-4 h-4" />
              Watchlist
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mx-6 mt-1 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.95)] p-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}
                className="rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="my-2 h-px bg-border" />
            <button onClick={() => { onSettingsClick(); setMobileOpen(false) }}
              className="rounded-xl px-4 py-3 text-left text-sm text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground">
              Einstellungen
            </button>
            <button onClick={() => { onAlertsClick(); setMobileOpen(false) }}
              className="rounded-xl px-4 py-3 text-left text-sm text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground">
              Meine Alerts
            </button>
            <button onClick={() => { onWatchlistClick(); setMobileOpen(false) }}
              className="mt-1 rounded-full bg-primary px-5 py-3 text-center text-sm font-medium text-primary-foreground transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95">
              Watchlist
              {favoritesCount > 0 && ` (${favoritesCount})`}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
