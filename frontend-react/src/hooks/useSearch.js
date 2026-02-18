import { useState, useCallback } from 'react'
import { searchProducts } from '../api/search'

export function useSearch() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(async (query, location = '', radius = 50, category = null, categoryId = null) => {
    if (!query.trim() && !categoryId) return

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const data = await searchProducts(query, location, radius, category, categoryId)
      setResults(data)
    } catch (err) {
      setError(err.message || 'Ein Fehler ist aufgetreten')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResults([])
    setError(null)
    setHasSearched(false)
  }, [])

  return { results, loading, error, hasSearched, search, reset }
}
