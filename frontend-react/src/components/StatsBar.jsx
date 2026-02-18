import { Tag, TrendingDown, BarChart3, Percent } from 'lucide-react'
import { computeStats } from '../utils/computeStats'
import { formatPrice } from '../utils/formatPrice'

export function StatsBar({ results }) {
  const stats = computeStats(results)

  const cards = [
    {
      icon: Tag,
      label: 'Angebote',
      value: stats.count,
      color: 'text-neon-cyan',
      glow: 'shadow-neon-cyan/10',
    },
    {
      icon: TrendingDown,
      label: 'Bester Preis',
      value: formatPrice(stats.bestPrice),
      color: 'text-emerald-glow',
      glow: 'shadow-emerald-glow/10',
    },
    {
      icon: BarChart3,
      label: 'Durchschnitt',
      value: formatPrice(stats.avgPrice),
      color: 'text-electric-purple',
      glow: 'shadow-electric-purple/10',
    },
    {
      icon: Percent,
      label: 'Max. Ersparnis',
      value: formatPrice(stats.maxSavings),
      color: 'text-neon-cyan',
      glow: 'shadow-neon-cyan/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/[0.05] transition-colors"
        >
          <div className={`p-2 rounded-lg bg-white/5 ${card.color}`}>
            <card.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider">{card.label}</p>
            <p className={`text-lg font-semibold font-mono ${card.color}`}>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
