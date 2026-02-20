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

/* Statische Plattform-Statistiken — von v0 stats-bar.tsx */
const PLATFORM_STATS = [
  { value: '50K+', label: 'Produkte erfasst' },
  { value: '120+', label: 'Shops verglichen' },
  { value: '2M+', label: 'Preise gespart' },
  { value: '99,9%', label: 'Verfügbarkeit' },
]

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

  const handleSearch = (query, location, radius, sources = ['kleinanzeigen']) => {
    const effectiveQuery = query.trim() || activeCategory?.defaultQuery || ''
    setLastQuery(effectiveQuery)
    search(effectiveQuery, location, radius, activeCategory?.benchmarkType || null, activeCategory?.categoryId || null, sources)
  }

  const handleReset = () => {
    setActiveCategory(null)
    setMinPrice('')
    setMaxPrice('')
    reset()
  }

  /* Ambient Glow — von v0 page.tsx */
  const ambientBg = (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
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
        {ambientBg}
        <Header {...headerProps} onWatchlistClick={() => setShowWatchlist(false)} />
        <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
        <AlertsListDialog isOpen={showAlerts} onClose={() => setShowAlerts(false)} />
        <div className="relative z-10 pt-24">
          <Watchlist />
        </div>
      </div>
    )
  }

  /* ── LANDING PAGE (!hasSearched && !loading) ────────────────── */
  if (!hasSearched && !loading) {
    return (
      <div className="relative min-h-screen bg-background">
        {ambientBg}
        <Header {...headerProps} />
        <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
        <AlertsListDialog isOpen={showAlerts} onClose={() => setShowAlerts(false)} />

        <main className="relative z-10">
          {/* Hero Section — von v0 page.tsx */}
          <section className="flex flex-col items-center justify-center px-6 pb-16 pt-32 md:pb-24 md:pt-44">
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

          {/* Statische Stats — von v0 page.tsx + stats-bar.tsx */}
          <section className="px-6 pb-20 md:pb-28">
            <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] md:grid-cols-4">
              {PLATFORM_STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center justify-center bg-[rgba(5,5,5,0.8)] px-6 py-6 text-center">
                  <span className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</span>
                  <span className="mt-1 text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Kategorien — von v0 page.tsx */}
          <section className="pb-24 md:pb-32">
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

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
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
        />

        {error && (
          <div className="rounded-xl p-4 mt-6 border border-red-500/30 bg-red-500/5 text-red-400 text-center text-sm">
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
          <div className="rounded-xl p-4 mt-6 border border-border bg-[rgba(255,255,255,0.02)] text-center">
            <p className="text-foreground/50 text-sm">Keine Ergebnisse in dieser Preisspanne.</p>
            <p className="text-muted-foreground text-xs mt-1">{results.length} Angebote außerhalb des Filters.</p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && !error && (
          <EmptyState variant="no-results" />
        )}
      </main>
    </div>
  )
}
