import { useState, useCallback, useRef } from 'react'
import { searchProducts } from '../api/search'

const BATCH_SIZE = 5

export function useSearch() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const nextPageRef = useRef(1)
  const searchParamsRef = useRef(null)

  const search = useCallback(async (query, location = '', radius = 50, category = null, categoryId = null, sources = ['kleinanzeigen'], minPrice = null, maxPrice = null) => {
    if (!query.trim() && !categoryId) return

    setLoading(true)
    setError(null)
    setHasSearched(true)
    nextPageRef.current = 1 + BATCH_SIZE
    searchParamsRef.current = { query, location, radius, category, categoryId, sources, minPrice, maxPrice }

    try {
      const data = await searchProducts(query, location, radius, category, categoryId, 1, BATCH_SIZE, sources, minPrice, maxPrice)
      setResults(data.results || [])
      setHasMore(data.has_more || false)
    } catch (err) {
      setError(err.message || 'Ein Fehler ist aufgetreten')
      setResults([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!searchParamsRef.current || loadingMore) return

    setLoadingMore(true)
    const { query, location, radius, category, categoryId, sources, minPrice, maxPrice } = searchParamsRef.current
    const startPage = nextPageRef.current

    try {
      const data = await searchProducts(query, location, radius, category, categoryId, startPage, BATCH_SIZE, sources, minPrice, maxPrice)
      setResults(prev => [...prev, ...(data.results || [])])
      setHasMore(data.has_more || false)
      nextPageRef.current = startPage + BATCH_SIZE
    } catch (err) {
      setError(err.message || 'Fehler beim Laden weiterer Ergebnisse')
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore])

  const reset = useCallback(() => {
    setResults([])
    setError(null)
    setHasSearched(false)
    setHasMore(false)
    nextPageRef.current = 1
    searchParamsRef.current = null
  }, [])

  return {
    results,
    loading,
    loadingMore,
    error,
    hasSearched,
    hasMore,
    search,
    loadMore,
    reset,
  }
}
