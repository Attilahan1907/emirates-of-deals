import { ProductCard } from './ProductCard'
import { computeDealScores } from '../utils/computeDealScore'

const BENCHMARK_TYPES = ['gpu', 'cpu', 'smartphone', 'ram']

export function ResultsGrid({ results, benchmarkType, onOpenSettings, showImages }) {
  const hasBenchmark = BENCHMARK_TYPES.includes(benchmarkType)
  const scores = hasBenchmark ? computeDealScores(results, benchmarkType) : null

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
        {results.map((item, index) => (
          <ProductCard
            key={`${item.url}-${index}`}
            item={item}
            rank={index + 1}
            isBest={index === 0}
            allPrices={results.map((r) => r.price)}
            dealScore={scores ? scores[index] : null}
            isBenchmark={hasBenchmark}
            onOpenSettings={onOpenSettings}
            showImages={showImages}
          />
        ))}
      </div>

      {results.length > 0 && (
        <div className="text-center mt-8 py-4">
          <p className="text-white/30 text-sm">{results.length} Angebote geladen</p>
        </div>
      )}
    </>
  )
}
