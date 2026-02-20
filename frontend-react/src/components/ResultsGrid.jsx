import { ProductCard } from './ProductCard'
import { computeDealScores } from '../utils/computeDealScore'

const BENCHMARK_TYPES = ['gpu', 'cpu', 'smartphone', 'ram']

export function ResultsGrid({ results, benchmarkType, onOpenSettings, showImages, hasMore, loadingMore, onLoadMore }) {
  const hasBenchmark = BENCHMARK_TYPES.includes(benchmarkType)
  const scores = computeDealScores(results, benchmarkType)

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
            dealScore={scores[index] ?? null}
            isBenchmark={hasBenchmark}
            onOpenSettings={onOpenSettings}
            showImages={showImages}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        {hasMore && (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-xl text-sm font-medium border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed text-white/70 transition-colors"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin inline-block" />
                Lädt weitere Angebote…
              </span>
            ) : (
              'Mehr laden'
            )}
          </button>
        )}
        {results.length > 0 && (
          <p className="text-white/30 text-xs">
            {results.length} Angebote geladen{hasMore ? ' – es gibt noch mehr' : ' – alle geladen'}
          </p>
        )}
      </div>
    </>
  )
}
