import { useState } from 'react'
import { Zap } from 'lucide-react'
import { CATEGORIES } from '../data/categories'

export function CategoryGrid({ onCategorySelect }) {
  const [selectedId, setSelectedId] = useState(null)

  const selectedCat = CATEGORIES.find((c) => c.id === selectedId)

  const handleCardClick = (cat) => {
    setSelectedId((prev) => (prev === cat.id ? null : cat.id))
  }

  return (
    <section id="categories" className="mx-auto w-full max-w-5xl px-6">
      {/* Titel — exakt v0 category-grid.tsx */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Kategorien durchstöbern
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Entdecke Angebote in jeder Kategorie
        </p>
      </div>

      {/* Bento-Grid — exakt v0 auto-rows-[140px] grid-cols-2 gap-3 md:grid-cols-4 */}
      <div className="grid auto-rows-[140px] grid-cols-2 gap-3 md:grid-cols-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isSelected = selectedId === cat.id

          return (
            <button
              key={cat.id}
              onClick={() => handleCardClick(cat)}
              className={`
                group relative flex flex-col items-start justify-end overflow-hidden
                rounded-2xl border p-6
                transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                hover:-translate-y-0.5
                hover:bg-[rgba(255,255,255,0.04)]
                hover:shadow-[0_8px_30px_rgba(0,229,255,0.06)]
                active:scale-[0.98] active:shadow-none
                ${isSelected
                  ? 'border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.04)]'
                  : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(0,229,255,0.15)]'}
              `}
            >
              {/* Glow Orb — exakt v0 */}
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

              {/* Icon */}
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border bg-[rgba(255,255,255,0.04)] text-muted-foreground transition-colors duration-200 group-hover:border-primary/20 group-hover:text-primary ${isSelected ? 'border-primary/30 text-primary' : 'border-[rgba(255,255,255,0.08)]'}`}>
                <Icon size={20} />
              </div>

              <h3 className="text-sm font-semibold text-foreground">{cat.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground truncate w-full">{cat.subcategories.length} Unterkategorien</p>
            </button>
          )
        })}
      </div>

      {/* Subcategory-Panel — erscheint unterhalb wenn Kategorie gewählt */}
      {selectedCat && (
        <div className="mt-3 rounded-2xl border border-[rgba(0,229,255,0.15)] bg-[rgba(255,255,255,0.02)] p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{selectedCat.label}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {selectedCat.subcategories.map((sub) => {
              const SubIcon = sub.icon
              return (
                <button
                  key={sub.id}
                  onClick={() => { onCategorySelect(sub); setSelectedId(null) }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-left text-xs text-muted-foreground hover:border-[rgba(0,229,255,0.2)] hover:text-foreground hover:bg-[rgba(255,255,255,0.04)] transition-all duration-150 cursor-pointer group/sub"
                >
                  <SubIcon className="w-3.5 h-3.5 flex-shrink-0 group-hover/sub:text-primary transition-colors" />
                  <span className="flex-1 truncate">{sub.label}</span>
                  {sub.benchmarkType && <Zap className="w-3 h-3 text-amber-400/60 flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
