import { ArrowUpNarrowWide, ArrowDownWideNarrow, Zap, AlignJustify } from 'lucide-react'

const OPTIONS = [
  { id: 'price_asc',   label: 'Günstigste',     icon: ArrowUpNarrowWide },
  { id: 'price_desc',  label: 'Teuerste',        icon: ArrowDownWideNarrow },
  { id: 'deal_score',  label: 'Preis-Leistung',  icon: Zap },
  { id: 'relevance',   label: 'Relevanz',        icon: AlignJustify },
]

export function SortBar({ sortBy, onChange }) {
  return (
    <div className="flex items-center gap-2 mt-4 flex-wrap">
      <span className="text-xs text-muted-foreground shrink-0">Sortieren:</span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {OPTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150
              ${sortBy === id
                ? 'bg-primary/15 border-primary/40 text-primary'
                : 'bg-foreground/5 border-foreground/10 text-foreground/50 hover:text-foreground/80 hover:border-foreground/20'
              }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
