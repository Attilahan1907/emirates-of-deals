import { useState, useMemo } from 'react'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { StatsBar } from './components/StatsBar'
import { ResultsGrid } from './components/ResultsGrid'
import { EmptyState } from './components/EmptyState'
import { LoadingState } from './components/LoadingState'
import { CategoryGrid } from './components/CategoryGrid'
import { useSearch } from './hooks/useSearch'

export default function App() {
  const { results, loading, error, hasSearched, search, reset } = useSearch()
  const [activeCategory, setActiveCategory] = useState(null)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const filteredResults = useMemo(() => {
    const min = minPrice !== '' ? Number(minPrice) : 0
    const max = maxPrice !== '' ? Number(maxPrice) : Infinity
    return results.filter((r) => r.price >= min && r.price <= max)
  }, [results, minPrice, maxPrice])

  const handleCategorySelect = (subcategory) => {
    setActiveCategory(subcategory)
    const query = subcategory.defaultQuery || ''
    search(query, '', 50, subcategory.benchmarkType || null, subcategory.categoryId || null)
  }

  const handleClearCategory = () => {
    setActiveCategory(null)
  }

  const handleSearch = (query, location, radius) => {
    const effectiveQuery = query.trim() || activeCategory?.defaultQuery || ''
    search(effectiveQuery, location, radius, activeCategory?.benchmarkType || null, activeCategory?.categoryId || null)
  }

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <Header onLogoClick={() => {
        setActiveCategory(null)
        setMinPrice('')
        setMaxPrice('')
        reset()
      }} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <SearchBar
          onSearch={handleSearch}
          loading={loading}
          activeCategory={activeCategory}
          onClearCategory={handleClearCategory}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
        />

        {error && (
          <div className="glass rounded-xl p-4 mt-6 border-red-500/30 text-red-400 text-center">
            {error}
          </div>
        )}

        {loading && <LoadingState />}

        {!loading && hasSearched && filteredResults.length > 0 && (
          <>
            <StatsBar results={filteredResults} />
            <ResultsGrid
              results={filteredResults}
              benchmarkType={activeCategory?.benchmarkType || null}
            />
          </>
        )}

        {!loading && hasSearched && results.length > 0 && filteredResults.length === 0 && (
          <div className="glass rounded-xl p-4 mt-6 text-center">
            <p className="text-white/50 text-sm">Keine Ergebnisse in dieser Preisspanne.</p>
            <p className="text-white/30 text-xs mt-1">{results.length} Angebote ausserhalb des Filters.</p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && !error && (
          <EmptyState variant="no-results" />
        )}

        {!hasSearched && !loading && (
          <>
            <EmptyState variant="welcome" onSuggestionClick={(q) => search(q, '', 50)} />
            <CategoryGrid onCategorySelect={handleCategorySelect} />
          </>
        )}
      </main>
    </div>
  )
}
