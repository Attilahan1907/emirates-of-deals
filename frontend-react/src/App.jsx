import { useState, useEffect, useRef, useMemo } from 'react'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { StatsBar } from './components/StatsBar'
import { SortBar } from './components/SortBar'
import { ResultsGrid } from './components/ResultsGrid'
import { EmptyState } from './components/EmptyState'
import { LoadingState } from './components/LoadingState'
import { CategoryGrid } from './components/CategoryGrid'
import { Watchlist } from './components/Watchlist'
import { SettingsDialog } from './components/SettingsDialog'
import { AlertsListDialog } from './components/AlertsListDialog'
import { SearchAlertDialog } from './components/SearchAlertDialog'
import { useSearch } from './hooks/useSearch'
import { computeDealScores } from './utils/computeDealScore'
import { PriceTicker } from './components/PriceTicker'
import { IOSInstallPrompt } from './components/IOSInstallPrompt'
import { DealCounter } from './components/DealCounter'


export default function App() {
  const [showWatchlist, setShowWatchlist] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const [showSearchAlert, setShowSearchAlert] = useState(false)
  const [lastQuery, setLastQuery] = useState('')
  const { results, loading, loadingMore, error, hasSearched, hasMore, search, loadMore, reset } = useSearch()
  const [activeCategory, setActiveCategory] = useState(null)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showImages, setShowImages] = useState(false)
  const [includeEbay, setIncludeEbay] = useState(true)
  const [sortBy, setSortBy] = useState('price_asc')

  // Sortierung clientseitig (nach Eingang der Ergebnisse)
  const sortedResults = useMemo(() => {
    if (sortBy === 'price_asc')  return [...results].sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc') return [...results].sort((a, b) => b.price - a.price)
    if (sortBy === 'deal_score') {
      const scores = computeDealScores(results, activeCategory?.benchmarkType || null)
      return [...results]
        .map((r, i) => ({ r, score: scores[i]?.score ?? -1 }))
        .sort((a, b) => b.score - a.score)
        .map(({ r }) => r)
    }
    return results // relevance: original scraper order
  }, [results, sortBy, activeCategory])

  // Bei Preisfilter-Änderung → neue Backend-Suche (700ms Debounce)
  const priceDebounceRef = useRef(null)
  const lastSearchParamsRef = useRef(null)
  useEffect(() => {
    if (!hasSearched || loading) return
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current)
    priceDebounceRef.current = setTimeout(() => {
      const p = lastSearchParamsRef.current
      if (!p) return
      search(p.query, p.location, p.radius, p.category, p.categoryId, p.sources, minPrice || null, maxPrice || null)
    }, 700)
    return () => clearTimeout(priceDebounceRef.current)
  }, [minPrice, maxPrice])

  const handleCategorySelect = (subcategory) => {
    setActiveCategory(subcategory)
    setSortBy('price_asc')
    const query = subcategory.defaultQuery || ''
    setLastQuery(query)
    const params = { query, location: '', radius: 50, category: subcategory.benchmarkType || null, categoryId: subcategory.categoryId || null, sources: ['kleinanzeigen'] }
    lastSearchParamsRef.current = params
    search(params.query, params.location, params.radius, params.category, params.categoryId, params.sources, minPrice || null, maxPrice || null)
  }

  const handleSearch = (query, location, radius, sources = ['kleinanzeigen']) => {
    const effectiveQuery = query.trim() || activeCategory?.defaultQuery || ''
    setLastQuery(effectiveQuery)
    setSortBy('price_asc')
    const params = { query: effectiveQuery, location, radius, category: activeCategory?.benchmarkType || null, categoryId: activeCategory?.categoryId || null, sources }
    lastSearchParamsRef.current = params
    search(params.query, params.location, params.radius, params.category, params.categoryId, params.sources, minPrice || null, maxPrice || null)
  }

  const handleReset = () => {
    setActiveCategory(null)
    setMinPrice('')
    setMaxPrice('')
    reset()
  }

  /* Ambient Glow — von v0 page.tsx */
  const ambientBg = (
    <div className="pointer-events-none fixed inset-0 overflow-hidden hidden md:block" aria-hidden="true">
      <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[120px]" />
      <div className="absolute right-0 top-1/3 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-accent/[0.03] blur-[100px]" />
    </div>
  )

  const headerProps = {
    onLogoClick: () => { setShowWatchlist(false); handleReset() },
    onWatchlistClick: () => setShowWatchlist(!showWatchlist),
    onSettingsClick: () => setShowSettings(true),
    onAlertsClick: () => setShowAlerts(true),
  }

  /* ── WATCHLIST ──────────────────────────────────────────────── */
  if (showWatchlist) {
    return (
      <div className="relative min-h-screen bg-background">
        <IOSInstallPrompt />
        {ambientBg}
        <Header {...headerProps} onWatchlistClick={() => setShowWatchlist(false)} />
        <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
        <AlertsListDialog isOpen={showAlerts} onClose={() => setShowAlerts(false)} />
        <div className="relative z-10 pt-20 md:pt-36">
          <Watchlist />
        </div>
      </div>
    )
  }

  /* ── LANDING PAGE (!hasSearched && !loading) ────────────────── */
  if (!hasSearched && !loading) {
    return (
      <div className="relative min-h-screen bg-background">
        <IOSInstallPrompt />
        {/* Dot-Grid Hintergrund */}
        <div
          className="pointer-events-none fixed inset-0 dot-grid"
          style={{ maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)' }}
          aria-hidden="true"
        />
        {ambientBg}
        <Header {...headerProps} />
        <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
        <AlertsListDialog isOpen={showAlerts} onClose={() => setShowAlerts(false)} />

        <main className="relative z-10">
          {/* Hero Section — von v0 page.tsx */}
          <section className="flex flex-col items-center justify-center px-6 pb-8 pt-24 md:pb-10 md:pt-48">
            {/* Badge */}
            <div className="mb-8 flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Echtzeit-Preisvergleich auf Kleinanzeigen & eBay
              </span>
            </div>

            {/* Headline — von v0 page.tsx */}
            <h1 className="mx-auto max-w-4xl text-balance text-center text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-foreground md:text-6xl lg:text-7xl">
              Finde den besten Preis.{' '}
              <span className="bg-gradient-to-r from-primary to-[#7c3aed] bg-clip-text text-transparent">
                Jedes Mal.
              </span>
            </h1>

            {/* Subtitle — von v0 page.tsx */}
            <p className="mx-auto mt-6 max-w-xl text-pretty text-center text-base leading-relaxed text-muted-foreground md:text-lg">
              Vergleiche Preise bei allen großen Händlern in Sekunden.
              Schluss mit Überzahlen, fang an zu sparen.
            </p>

            {/* Deal Counter */}
            <DealCounter />

            {/* SearchBar (Hero-Modus) */}
            <div className="mt-10 w-full md:mt-12">
              <SearchBar
                onSearch={handleSearch}
                loading={loading}
                activeCategory={activeCategory}
                onClearCategory={() => setActiveCategory(null)}
                minPrice={minPrice} maxPrice={maxPrice}
                onMinPriceChange={setMinPrice} onMaxPriceChange={setMaxPrice}
                hasSearched={false}
                onSearchAlert={() => setShowSearchAlert(true)}
                showImages={showImages} onShowImagesChange={setShowImages}
                includeEbay={includeEbay} onIncludeEbayChange={setIncludeEbay}
              />
            </div>
          </section>

          {/* Preis-Ticker */}
          <PriceTicker onSearch={handleSearch} />

          {/* Kategorien */}
          <section className="pb-16 md:pb-20">
            <CategoryGrid onCategorySelect={handleCategorySelect} />
          </section>

          {/* Footer — von v0 page.tsx */}
          <footer className="border-t border-[rgba(255,255,255,0.06)] py-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                  <span className="text-xs font-bold text-primary-foreground">E</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">Emirates of Deals</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Mit Präzision gebaut. Fürs Sparen designt.
              </p>
            </div>
          </footer>
        </main>
      </div>
    )
  }

  /* ── ERGEBNIS-SEITE (hasSearched || loading) ────────────────── */
  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <IOSInstallPrompt />
      {ambientBg}
      <Header {...headerProps} />
      <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AlertsListDialog isOpen={showAlerts} onClose={() => setShowAlerts(false)} />
      <SearchAlertDialog
        isOpen={showSearchAlert}
        onClose={() => setShowSearchAlert(false)}
        query={lastQuery}
        onOpenSettings={() => { setShowSearchAlert(false); setShowSettings(true) }}
      />

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-36 pb-12">
        <SearchBar
          onSearch={handleSearch}
          loading={loading}
          activeCategory={activeCategory}
          onClearCategory={() => setActiveCategory(null)}
          minPrice={minPrice} maxPrice={maxPrice}
          onMinPriceChange={setMinPrice} onMaxPriceChange={setMaxPrice}
          hasSearched={hasSearched && !loading && results.length > 0}
          onSearchAlert={() => setShowSearchAlert(true)}
          showImages={showImages} onShowImagesChange={setShowImages}
          includeEbay={includeEbay} onIncludeEbayChange={setIncludeEbay}
          currentQuery={lastQuery}
        />

        {error && (
          <div className="rounded-xl p-4 mt-6 border border-red-500/30 bg-red-500/5 text-red-400 text-center text-sm">
            {error}
          </div>
        )}

        {loading && <LoadingState />}

        {!loading && hasSearched && results.length > 0 && (
          <>
            <StatsBar results={results} />
            <SortBar sortBy={sortBy} onChange={setSortBy} />
            <ResultsGrid
              results={sortedResults}
              benchmarkType={activeCategory?.benchmarkType || null}
              onOpenSettings={() => setShowSettings(true)}
              showImages={showImages}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
            />
          </>
        )}

        {!loading && hasSearched && results.length === 0 && !error && (
          <EmptyState variant="no-results" />
        )}
      </main>
    </div>
  )
}
