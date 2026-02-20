import { Tag, TrendingDown, BarChart3, Percent } from 'lucide-react'
import { computeStats } from '../utils/computeStats'
import { formatPrice } from '../utils/formatPrice'

export function StatsBar({ results }) {
  const stats = computeStats(results)

  const cards = [
    { icon: Tag, label: 'Angebote', value: stats.count, color: '#00e5ff' },
    { icon: TrendingDown, label: 'Bester Preis', value: formatPrice(stats.bestPrice), color: '#10b981' },
    { icon: BarChart3, label: 'Durchschnitt', value: formatPrice(stats.avgPrice), color: '#a78bfa' },
    { icon: Percent, label: 'Max. Ersparnis', value: formatPrice(stats.maxSavings), color: '#00e5ff' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] mt-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3 px-5 py-4 bg-card hover:bg-foreground/[0.02] transition-colors"
        >
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: card.color + '12' }}
          >
            <card.icon className="w-4 h-4" style={{ color: card.color }} />
          </div>
          <div>
            <p className="text-[10px] text-foreground/40 uppercase tracking-widest">{card.label}</p>
            <p className="text-base font-semibold font-mono" style={{ color: card.color }}>
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
