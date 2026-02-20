import { useState, useMemo } from 'react'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { StatsBar } from './components/StatsBar'
import { ResultsGrid } from './components/ResultsGrid'
import { EmptyState } from './components/EmptyState'
import { LoadingState } from './components/LoadingState'
import { CategoryGrid } from './components/CategoryGrid'
import { Watchlist } from './components/Watchlist'
import { SettingsDialog } from './components/SettingsDialog'
import { AlertsListDialog } from './components/AlertsListDialog'
import { SearchAlertDialog } from './components/SearchAlertDialog'
import { useSearch } from './hooks/useSearch'

export default function App() {
  const [showWatchlist, setShowWatchlist] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const [showSearchAlert, setShowSearchAlert] = useState(false)
  const [lastQuery, setLastQuery] = useState('')
  const {
    results,
    loading,
    loadingMore,
    error,
    hasSearched,
    hasMore,
    search,
    loadMore,
    reset,
  } = useSearch()
  const [activeCategory, setActiveCategory] = useState(null)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showImages, setShowImages] = useState(false)

  const filteredResults = useMemo(() => {
    const min = minPrice !== '' ? Number(minPrice) : 0
    const max = maxPrice !== '' ? Number(maxPrice) : Infinity
    return results.filter((r) => r.price >= min && r.price <= max)
  }, [results, minPrice, maxPrice])

  const handleCategorySelect = (subcategory) => {
    setActiveCategory(subcategory)
    const query = subcategory.defaultQuery || ''
    setLastQuery(query)
    search(query, '', 50, subcategory.benchmarkType || null, subcategory.categoryId || null)
  }

  const handleClearCategory = () => {
    setActiveCategory(null)
  }

  const handleSearch = (query, location, radius) => {
    const effectiveQuery = query.trim() || activeCategory?.defaultQuery || ''
    setLastQuery(effectiveQuery)
    search(effectiveQuery, location, radius, activeCategory?.benchmarkType || null, activeCategory?.categoryId || null)
  }

  if (showWatchlist) {
    return (
      <div className="min-h-screen bg-base flex flex-col">
        <Header
          onLogoClick={() => {
            setShowWatchlist(false)
            setActiveCategory(null)
            setMinPrice('')
            setMaxPrice('')
            reset()
          }}
          onWatchlistClick={() => setShowWatchlist(false)}
          onSettingsClick={() => setShowSettings(true)}
          onAlertsClick={() => setShowAlerts(true)}
        />
        <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
        <AlertsListDialog isOpen={showAlerts} onClose={() => setShowAlerts(false)} />
        <Watchlist />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <Header
        onLogoClick={() => {
          setActiveCategory(null)
          setMinPrice('')
          setMaxPrice('')
          reset()
        }}
        onWatchlistClick={() => setShowWatchlist(true)}
        onSettingsClick={() => setShowSettings(true)}
        onAlertsClick={() => setShowAlerts(true)}
      />
      <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AlertsListDialog isOpen={showAlerts} onClose={() => setShowAlerts(false)} />
      <SearchAlertDialog
        isOpen={showSearchAlert}
        onClose={() => setShowSearchAlert(false)}
        query={lastQuery}
        onOpenSettings={() => { setShowSearchAlert(false); setShowSettings(true) }}
      />
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
          hasSearched={hasSearched && !loading && results.length > 0}
          onSearchAlert={() => setShowSearchAlert(true)}
          showImages={showImages}
          onShowImagesChange={setShowImages}
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
              onOpenSettings={() => setShowSettings(true)}
              showImages={showImages}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
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
            <EmptyState variant="welcome" onSuggestionClick={(q) => { setLastQuery(q); search(q, '', 50) }} />
            <CategoryGrid onCategorySelect={handleCategorySelect} />
          </>
        )}
      </main>
    </div>
  )
}
