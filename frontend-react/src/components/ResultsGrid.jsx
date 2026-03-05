import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { ProductCard } from './ProductCard'
import { ProductDetailModal } from './ProductDetailModal'
import { computeDealScores } from '../utils/computeDealScore'
import { extractGpuModel, extractCpuModel, extractSmartphoneModel } from '../utils/extractModel'

const BENCHMARK_TYPES = ['gpu', 'cpu', 'smartphone', 'ram']

export function ResultsGrid({ results, benchmarkType, onOpenSettings, showImages, hasMore, loadingMore, onLoadMore }) {
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // Auto-detect benchmark type from result titles when no category is active
  const effectiveBenchmarkType = useMemo(() => {
    if (benchmarkType) return benchmarkType
    if (results.length === 0) return null
    const sample = results.slice(0, 20)
    const threshold = Math.max(4, Math.ceil(sample.length * 0.35))
    if (sample.filter(r => extractGpuModel(r.title)).length >= threshold) return 'gpu'
    if (sample.filter(r => extractCpuModel(r.title)).length >= threshold) return 'cpu'
    if (sample.filter(r => extractSmartphoneModel(r.title)).length >= threshold) return 'smartphone'
    return null
  }, [results, benchmarkType])

  const hasBenchmark = BENCHMARK_TYPES.includes(effectiveBenchmarkType)
  const scores = computeDealScores(results, effectiveBenchmarkType)
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

  const handleItemClick = useCallback((item, index) => {
    setSelectedItem(item)
    setSelectedIndex(index)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null)
    setSelectedIndex(-1)
  }, [])

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
            onItemClick={(clickedItem) => handleItemClick(clickedItem, index)}
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

      {/* Product Detail Modal — rendered once */}
      <ProductDetailModal
        isOpen={!!selectedItem}
        onClose={handleCloseModal}
        item={selectedItem}
        dealScore={selectedIndex >= 0 ? (scores[selectedIndex] ?? null) : null}
        allPrices={results.map((r) => r.price)}
        benchmarkType={effectiveBenchmarkType}
        isBenchmark={hasBenchmark}
      />
    </>
  )
}
