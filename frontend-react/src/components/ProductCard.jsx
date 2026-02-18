import { ExternalLink } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'
import { BestDealBadge } from './BestDealBadge'
import { Sparkline } from './Sparkline'
import { DealScore } from './DealScore'

export function ProductCard({ item, rank, isBest, allPrices, dealScore, isBenchmark }) {
  const hasScore = dealScore && dealScore.score !== null && dealScore.score !== undefined

  return (
    <div
      className={`glass rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.05] group ${
        isBest ? 'animate-pulse-glow border-emerald-glow/30' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
              isBest
                ? 'bg-emerald-glow/20 text-emerald-glow'
                : 'bg-white/5 text-white/40'
            }`}
          >
            #{rank}
          </span>
          {isBest && <BestDealBadge />}
        </div>
        <div className="flex items-center gap-3">
          {hasScore && (
            <DealScore
              score={dealScore.score}
              model={dealScore.model}
              benchmark={dealScore.benchmark}
              isBenchmark={isBenchmark}
              pricePerGB={dealScore.pricePerGB}
              ramType={dealScore.ramType}
            />
          )}
          <Sparkline prices={allPrices} currentIndex={rank - 1} />
        </div>
      </div>

      <h3 className="text-sm font-medium text-white/90 line-clamp-2 leading-relaxed">
        {item.title}
      </h3>

      <div className="mt-auto flex items-end justify-between gap-3">
        <div>
          <p className={`text-2xl font-bold font-mono ${isBest ? 'text-emerald-glow' : 'text-neon-cyan'}`}>
            {formatPrice(item.price)}
          </p>
          {item.original && (
            <p className="text-xs text-white/30 mt-0.5">{item.original}</p>
          )}
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/20 text-neon-cyan text-xs font-medium rounded-lg py-2 px-3 transition-all whitespace-nowrap"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Zum Deal
        </a>
      </div>
    </div>
  )
}
