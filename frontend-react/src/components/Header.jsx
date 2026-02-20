import { Heart, Settings, Bell } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

export function Header({ onLogoClick, onWatchlistClick, onSettingsClick, onAlertsClick }) {
  const { favorites } = useFavorites()
  const favoritesCount = favorites.length

  return (
    <header className="w-full pt-10 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-3">
        <div className="relative w-full flex justify-end gap-2">
          <button
            onClick={onSettingsClick}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white/70 hover:text-white transition-all"
            title="Benachrichtigungs-Einstellungen"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onAlertsClick}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white/70 hover:text-white transition-all"
            title="Meine Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">Alerts</span>
          </button>
          <button
            onClick={onWatchlistClick}
            className="relative flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white/70 hover:text-white transition-all"
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Watchlist</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
        <img
          src="/logo.png"
          alt="Emirates of Deals"
          className="w-52 h-52 rounded-3xl object-cover cursor-pointer hover:scale-105 transition-transform"
          onClick={onLogoClick}
        />
        <p className="text-sm text-white/40 tracking-wide">
          Finde die besten Preise
        </p>
      </div>
    </header>
  )
}
