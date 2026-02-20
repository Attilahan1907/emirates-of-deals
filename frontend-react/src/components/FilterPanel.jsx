import { useState } from 'react'
import { SlidersHorizontal, Euro, X } from 'lucide-react'

export function FilterPanel({ minPrice, maxPrice, onMinPriceChange, onMaxPriceChange, showImages, onShowImagesChange, includeEbay, onIncludeEbayChange }) {
  const [open, setOpen] = useState(false)

  const hasActiveFilters = minPrice !== '' || maxPrice !== ''

  const clearFilters = () => {
    onMinPriceChange('')
    onMaxPriceChange('')
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-foreground/40 hover:text-foreground/70 transition-colors cursor-pointer"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Filter</span>
        {hasActiveFilters && (
          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
        )}
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-foreground/5 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Euro className="w-3.5 h-3.5 text-foreground/30" />
            <span className="text-[11px] text-foreground/40 mr-1">Preis</span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="w-20 bg-foreground/5 border border-foreground/10 rounded-lg py-1.5 px-2.5 text-xs text-foreground placeholder-foreground/25 outline-none focus:border-neon-cyan/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-foreground/15 text-xs">—</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="w-20 bg-foreground/5 border border-foreground/10 rounded-lg py-1.5 px-2.5 text-xs text-foreground placeholder-foreground/25 outline-none focus:border-neon-cyan/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[10px] text-foreground/20">EUR</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => onShowImagesChange(!showImages)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                showImages
                  ? 'bg-neon-cyan border-neon-cyan'
                  : 'border-foreground/20 bg-foreground/5'
              }`}
            >
              {showImages && <span className="text-black text-[10px] font-bold leading-none">✓</span>}
            </div>
            <span
              onClick={() => onShowImagesChange(!showImages)}
              className="text-[11px] text-foreground/40 hover:text-foreground/60 transition-colors"
            >
              Fotos anzeigen
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => onIncludeEbayChange(!includeEbay)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                includeEbay
                  ? 'bg-amber-400 border-amber-400'
                  : 'border-foreground/20 bg-foreground/5'
              }`}
            >
              {includeEbay && <span className="text-black text-[10px] font-bold leading-none">✓</span>}
            </div>
            <span
              onClick={() => onIncludeEbayChange(!includeEbay)}
              className="text-[11px] text-foreground/40 hover:text-foreground/60 transition-colors"
            >
              eBay einbeziehen
            </span>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-[10px] text-foreground/30 hover:text-red-400 transition-colors cursor-pointer"
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
