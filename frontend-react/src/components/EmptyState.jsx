import { Search, PackageOpen } from 'lucide-react'

const SUGGESTIONS = [
  'RTX 4070 Ti Super',
  'iPhone 15 Pro',
  'PlayStation 5',
  'MacBook Air M3',
  'Samsung Galaxy S24',
]

export function EmptyState({ variant = 'welcome', onSuggestionClick }) {
  if (variant === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 rounded-2xl bg-white/5 mb-4">
          <PackageOpen className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-lg font-medium text-white/60 mb-1">Keine Ergebnisse</h2>
        <p className="text-sm text-white/30 max-w-md">
          Versuche es mit anderen Suchbegriffen oder einem groesseren Radius.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-4 rounded-2xl bg-neon-cyan/5 border border-neon-cyan/10 mb-6">
        <Search className="w-10 h-10 text-neon-cyan/40" />
      </div>
      <h2 className="text-xl font-semibold text-white/80 mb-2">
        Finde die besten Deals
      </h2>
      <p className="text-sm text-white/30 max-w-md mb-8">
        Suche nach Produkten und vergleiche Preise aus verschiedenen Quellen.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestionClick?.(s)}
            className="glass rounded-full px-4 py-2 text-xs text-white/50 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
