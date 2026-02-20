import { useEffect, useRef } from 'react'
import { ProductCard } from './ProductCard'
import { computeDealScores } from '../utils/computeDealScore'

const BENCHMARK_TYPES = ['gpu', 'cpu', 'smartphone', 'ram']

export function ResultsGrid({ results, benchmarkType, onOpenSettings, showImages, hasMore, loadingMore, onLoadMore }) {
  const hasBenchmark = BENCHMARK_TYPES.includes(benchmarkType)
  const scores = computeDealScores(results, benchmarkType)
  const sentinelRef = useRef(null)

  // Auto-load when sentinel element scrolls into view
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          onLoadMore()
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, onLoadMore])

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

      {/* Sentinel + Status */}
      <div ref={sentinelRef} className="mt-6 flex flex-col items-center gap-2 pb-4">
        {loadingMore && (
          <span className="flex items-center gap-2 text-sm text-foreground/50">
            <span className="w-4 h-4 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin inline-block" />
            Lädt weitere Angebote…
          </span>
        )}
        {results.length > 0 && (
          <p className="text-foreground/30 text-xs">
            {results.length} Angebote geladen{hasMore ? '' : ' – alle geladen'}
          </p>
        )}
      </div>
    </>
  )
}
