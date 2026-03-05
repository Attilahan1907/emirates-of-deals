import { useState } from 'react'
import { SlidersHorizontal, Euro, X } from 'lucide-react'
import { CATEGORY_FILTERS } from '../data/categoryFilters'

export function FilterPanel({ minPrice, maxPrice, onMinPriceChange, onMaxPriceChange, showImages, onShowImagesChange, includeEbay, onIncludeEbayChange, ebayAvailable, categoryId, categoryFilters, onCategoryFiltersChange, condition, onConditionChange }) {
  const [open, setOpen] = useState(false)

  const catFilterDef = categoryId ? CATEGORY_FILTERS[categoryId] : null
  const hasActiveCatFilters = categoryFilters && Object.values(categoryFilters).some(v => v)
  const hasActiveFilters = minPrice !== '' || maxPrice !== '' || hasActiveCatFilters || (condition && condition !== '')

  const clearFilters = () => {
    onMinPriceChange('')
    onMaxPriceChange('')
    if (onCategoryFiltersChange) onCategoryFiltersChange({})
    if (onConditionChange) onConditionChange('')
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
        <div className="mt-3 pt-3 border-t border-foreground/5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-4">
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

            {/* Zustand-Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-foreground/40">Zustand</span>
              <select
                value={condition || ''}
                onChange={(e) => onConditionChange && onConditionChange(e.target.value)}
                className="bg-foreground/5 border border-foreground/10 rounded-lg py-1.5 px-2 text-xs text-foreground outline-none focus:border-neon-cyan/50 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-card text-foreground">Alle</option>
                <option value="gebraucht" className="bg-card text-foreground">Gebraucht</option>
                <option value="neu" className="bg-card text-foreground">Neu</option>
              </select>
            </div>

            {/* eBay-Toggle */}
            <label className={`flex items-center gap-2 select-none ${ebayAvailable === false ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              title={ebayAvailable === false ? 'EBAY_APP_ID nicht konfiguriert' : undefined}
            >
              <div
                onClick={() => ebayAvailable !== false && onIncludeEbayChange(!includeEbay)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  includeEbay && ebayAvailable !== false
                    ? 'bg-amber-400 border-amber-400'
                    : 'border-foreground/20 bg-foreground/5'
                }`}
              >
                {includeEbay && ebayAvailable !== false && <span className="text-black text-[10px] font-bold leading-none">✓</span>}
              </div>
              <span
                onClick={() => ebayAvailable !== false && onIncludeEbayChange(!includeEbay)}
                className="text-[11px] text-foreground/40 hover:text-foreground/60 transition-colors"
              >
                eBay einbeziehen{ebayAvailable === false && ' (kein API-Key)'}
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

          {catFilterDef && (
            <div className="flex flex-col gap-3 pt-2 border-t border-foreground/5">
              {/* Dropdown-Filter in einer Zeile */}
              <div className="flex flex-wrap items-center gap-3">
                {catFilterDef.filters.filter(f => !f.type || f.type === 'dropdown').map((filter) => (
                  <div key={filter.key} className="flex items-center gap-1.5">
                    <span className="text-[11px] text-foreground/40">{filter.label}</span>
                    <select
                      value={(categoryFilters && categoryFilters[filter.key]) || ''}
                      onChange={(e) => {
                        if (onCategoryFiltersChange) {
                          onCategoryFiltersChange({ ...categoryFilters, [filter.key]: e.target.value })
                        }
                      }}
                      className="bg-foreground/5 border border-foreground/10 rounded-lg py-1.5 px-2 text-xs text-foreground outline-none focus:border-neon-cyan/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-card text-foreground">Alle</option>
                      {filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-card text-foreground">{opt.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
                {/* Range-Select-Filter (Baujahr, KM) */}
                {catFilterDef.filters.filter(f => f.type === 'range_from' || f.type === 'range_to').map((filter) => (
                  <div key={filter.key} className="flex items-center gap-1.5">
                    <span className="text-[11px] text-foreground/40">{filter.label}</span>
                    <select
                      value={(categoryFilters && categoryFilters[filter.key]) || ''}
                      onChange={(e) => {
                        if (onCategoryFiltersChange) {
                          onCategoryFiltersChange({ ...categoryFilters, [filter.key]: e.target.value })
                        }
                      }}
                      className="bg-foreground/5 border border-foreground/10 rounded-lg py-1.5 px-2 text-xs text-foreground outline-none focus:border-neon-cyan/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-card text-foreground">Alle</option>
                      {filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-card text-foreground">{opt.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              {/* Marken-Grid */}
              {catFilterDef.filters.filter(f => f.type === 'brand_grid').map((filter) => (
                <div key={filter.key}>
                  <span className="text-[11px] text-foreground/40 block mb-1.5">{filter.label}</span>
                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5">
                    {filter.options.map((opt) => {
                      const isSelected = categoryFilters && categoryFilters[filter.key] === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            if (onCategoryFiltersChange) {
                              onCategoryFiltersChange({
                                ...categoryFilters,
                                [filter.key]: isSelected ? '' : opt.value
                              })
                            }
                          }}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-[10px] cursor-pointer ${
                            isSelected
                              ? 'border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan'
                              : 'border-foreground/10 bg-foreground/5 text-foreground/50 hover:border-foreground/25'
                          }`}
                        >
                          <img
                            src={opt.logo}
                            alt={opt.label}
                            className="w-8 h-8 object-contain"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
