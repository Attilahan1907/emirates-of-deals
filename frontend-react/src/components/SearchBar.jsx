import { useState, useEffect, useRef } from 'react'
import { Search, ArrowRight, MapPin, Loader2, X, Zap, Bell } from 'lucide-react'
import { FilterPanel } from './FilterPanel'

const RADIUS_OPTIONS = [
  { value: -1, label: 'Deutschlandweit' },
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

const POPULAR_SEARCHES = [
  'iPhone 16 Pro', 'PlayStation 5', 'Nike Air Max', 'Samsung Galaxy S25', 'AirPods Pro', 'MacBook Air',
]

export function SearchBar({
  onSearch, loading, activeCategory, onClearCategory,
  minPrice, maxPrice, onMinPriceChange, onMaxPriceChange,
  hasSearched, onSearchAlert, showImages, onShowImagesChange,
  includeEbay, onIncludeEbayChange,
}) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [radius, setRadius] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  const handleLocationChange = (e) => {
    const val = e.target.value
    setLocation(val)
    if (!val.trim()) setRadius(-1)
    else if (radius === -1) setRadius(50)
  }

  useEffect(() => {
    if (activeCategory) setQuery('')
  }, [activeCategory])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim() || activeCategory?.categoryId) {
      const effectiveLocation = radius === -1 ? '' : location
      const effectiveRadius = radius === -1 ? 50 : radius
      const sources = ['kleinanzeigen', ...(includeEbay ? ['ebay'] : [])]
      onSearch(query, effectiveLocation, effectiveRadius, sources)
    }
  }

  /* ── HERO MODE (Startseite) ───────────────────────────────── */
  if (!hasSearched) {
    return (
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
        {/* Kategorie-Badge */}
        {activeCategory && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-accent/15 border border-accent/25 text-[#a78bfa] text-[11px] font-semibold rounded-full px-3 py-1">
              {activeCategory.benchmarkType && <Zap className="w-3 h-3 text-amber-400" />}
              {activeCategory.label}
              <button type="button" onClick={onClearCategory} className="ml-1 hover:text-white transition-colors cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
            {activeCategory.benchmarkType && (
              <span className="text-[10px] text-amber-400/60">Preis-Leistungs-Analyse aktiv</span>
            )}
          </div>
        )}

        {/* Pill Search — exakt v0 hero-search.tsx */}
        <div className={`
          group relative flex items-center rounded-full
          border border-[rgba(255,255,255,0.1)]
          bg-[rgba(255,255,255,0.03)]
          shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]
          transition-all duration-300
          ${isFocused
            ? 'border-[rgba(0,229,255,0.3)] shadow-[inset_0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,229,255,0.08)]'
            : 'hover:border-[rgba(255,255,255,0.15)]'}
        `}>
          <div className="flex items-center pl-5">
            <Search size={20} className={`transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={activeCategory ? `Suche in ${activeCategory.label}…` : 'Suche ein Produkt, um Preise zu vergleichen…'}
            className="flex-1 bg-transparent px-4 py-5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="pr-2">
            <button
              type="submit"
              disabled={loading || (!query.trim() && !activeCategory?.categoryId)}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,229,255,0.35)] active:scale-95 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              Suchen
            </button>
          </div>
        </div>

        {/* Standort-Zeile (sekundär, unterhalb der Pill) */}
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="relative flex items-center">
            <MapPin className="absolute left-3 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="PLZ oder Ort (optional)"
              value={location}
              onChange={handleLocationChange}
              className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-full py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-[rgba(0,229,255,0.3)] transition-all w-44"
            />
          </div>
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            disabled={!location.trim()}
            className={`bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-full py-1.5 px-3 text-xs outline-none appearance-none transition-all ${!location.trim() ? 'text-muted-foreground/40 cursor-not-allowed' : 'text-foreground cursor-pointer'}`}
          >
            {RADIUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-card text-foreground">{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Popular Search Tags — exakt v0 hero-search.tsx */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-xs text-muted-foreground">Beliebt:</span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => { setQuery(term); inputRef.current?.focus() }}
              className="rounded-full border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] px-3.5 py-1.5 text-xs text-muted-foreground transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:border-[rgba(0,229,255,0.2)] hover:text-foreground hover:shadow-[0_4px_12px_rgba(0,229,255,0.08)] active:scale-95 active:shadow-none cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </form>
    )
  }

  /* ── COMPACT MODE (Nach Suche) ───────────────────────────── */
  return (
    <form onSubmit={handleSubmit} className="w-full">
      {activeCategory && (
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-accent/15 border border-accent/25 text-[#a78bfa] text-[11px] font-semibold rounded-full px-3 py-1">
            {activeCategory.benchmarkType && <Zap className="w-3 h-3 text-amber-400" />}
            {activeCategory.label}
            <button type="button" onClick={onClearCategory} className="ml-1 hover:text-white transition-colors cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
          {activeCategory.benchmarkType && (
            <span className="text-[10px] text-amber-400/60">Preis-Leistungs-Analyse aktiv</span>
          )}
        </div>
      )}

      <div className={`relative rounded-2xl border transition-all duration-300 ${
        isFocused
          ? 'border-[rgba(0,229,255,0.3)] shadow-[inset_0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,229,255,0.08)] bg-[rgba(255,255,255,0.04)]'
          : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.02)]'
      }`}>
        <div className="flex flex-col sm:flex-row items-stretch gap-0">
          <div className="relative flex-1 flex items-center">
            <Search className={`absolute left-4 w-4 h-4 transition-colors duration-200 ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
            <input
              ref={inputRef}
              type="text"
              placeholder={activeCategory ? `Suche in ${activeCategory.label}…` : 'Was suchst du?'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-transparent py-4 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          <div className="hidden sm:block w-px bg-border self-stretch my-2" />
          <div className="relative flex items-center sm:w-44">
            <MapPin className="absolute left-4 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="PLZ oder Ort"
              value={location}
              onChange={handleLocationChange}
              className="w-full bg-transparent py-4 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          <div className="hidden sm:block w-px bg-border self-stretch my-2" />
          <div className="flex items-center sm:w-36">
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              disabled={!location.trim()}
              className={`w-full bg-transparent py-4 px-4 text-sm outline-none appearance-none cursor-pointer ${!location.trim() ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-foreground/70'}`}
            >
              {RADIUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-card text-foreground">{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="p-2 flex items-center">
            <button
              type="submit"
              disabled={loading || (!query.trim() && !activeCategory?.categoryId)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold rounded-xl py-2.5 px-5 text-sm transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.25)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Finden
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <FilterPanel
          minPrice={minPrice} maxPrice={maxPrice}
          onMinPriceChange={onMinPriceChange} onMaxPriceChange={onMaxPriceChange}
          showImages={showImages} onShowImagesChange={onShowImagesChange}
          includeEbay={includeEbay} onIncludeEbayChange={onIncludeEbayChange}
        />
        <button type="button" onClick={onSearchAlert}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
          <Bell className="w-3.5 h-3.5" />
          Suchalarm einrichten
        </button>
      </div>
    </form>
  )
}
