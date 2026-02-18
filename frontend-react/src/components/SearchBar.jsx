import { useState, useEffect } from 'react'
import { Search, MapPin, Loader2, X, Zap } from 'lucide-react'
import { FilterPanel } from './FilterPanel'

const RADIUS_OPTIONS = [
  { value: 0, label: 'Ganzer Ort' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 30, label: '30 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: 150, label: '150 km' },
  { value: 200, label: '200 km' },
]

export function SearchBar({ onSearch, loading, activeCategory, onClearCategory, minPrice, maxPrice, onMinPriceChange, onMaxPriceChange }) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [radius, setRadius] = useState(50)

  useEffect(() => {
    if (activeCategory) {
      setQuery('')
    }
  }, [activeCategory])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim() || activeCategory?.categoryId) {
      onSearch(query, location, radius)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-4 sm:p-6 mt-2">
      {activeCategory && (
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-electric-purple/15 border border-electric-purple/25 text-electric-purple text-[11px] font-semibold rounded-full px-3 py-1">
            {activeCategory.benchmarkType && <Zap className="w-3 h-3 text-amber-400" />}
            {activeCategory.label}
            <button
              type="button"
              onClick={onClearCategory}
              className="ml-1 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
          {activeCategory.benchmarkType && (
            <span className="text-[10px] text-amber-400/60">
              Preis-Leistungs-Analyse aktiv
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder={activeCategory ? `Suche in ${activeCategory.label}...` : 'Was suchst du?'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all"
          />
        </div>

        <div className="relative sm:w-44">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="PLZ oder Ort"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all"
          />
        </div>

        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all sm:w-36 appearance-none cursor-pointer"
        >
          {RADIUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-base text-white">
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading || (!query.trim() && !activeCategory?.categoryId)}
          className="flex items-center justify-center gap-2 bg-neon-cyan/15 hover:bg-neon-cyan/25 border border-neon-cyan/30 text-neon-cyan font-medium rounded-xl py-3 px-6 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Finden
        </button>
      </div>

      <FilterPanel
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={onMinPriceChange}
        onMaxPriceChange={onMaxPriceChange}
      />
    </form>
  )
}
