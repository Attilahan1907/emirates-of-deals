import { useState } from 'react'
import { SlidersHorizontal, Euro, X } from 'lucide-react'

export function FilterPanel({ minPrice, maxPrice, onMinPriceChange, onMaxPriceChange, showImages, onShowImagesChange }) {
  const [open, setOpen] = useState(false)

  const hasActiveFilters = minPrice !== '' || maxPrice !== ''

  const clearFilters = () => {
    onMinPriceChange('')
    onMaxPriceChange('')
  }

  return (
    <div className="mt-3">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Filter</span>
        {hasActiveFilters && (
          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
        )}
      </button>

      {/* Filter panel */}
      {open && (
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-4">
          {/* Price filter */}
          <div className="flex items-center gap-2">
            <Euro className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[11px] text-white/40 mr-1">Preis</span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="w-20 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-white placeholder-white/25 outline-none focus:border-neon-cyan/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-white/15 text-xs">—</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="w-20 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-white placeholder-white/25 outline-none focus:border-neon-cyan/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[10px] text-white/20">EUR</span>
          </div>

          {/* Fotos Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => onShowImagesChange(!showImages)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                showImages
                  ? 'bg-neon-cyan border-neon-cyan'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              {showImages && <span className="text-black text-[10px] font-bold leading-none">✓</span>}
            </div>
            <span
              onClick={() => onShowImagesChange(!showImages)}
              className="text-[11px] text-white/40 hover:text-white/60 transition-colors"
            >
              Fotos anzeigen
            </span>
          </label>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-[10px] text-white/30 hover:text-red-400 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              Zuruecksetzen
            </button>
          )}
        </div>
      )}
    </div>
  )
}
