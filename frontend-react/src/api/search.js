export async function searchProducts(query, location = '', radius = 50, category = null, categoryId = null, startPage = 1, batchSize = 3, sources = ['kleinanzeigen'], minPrice = null, maxPrice = null, categoryFilters = {}, condition = '') {
  const body = { query, location, radius: Number(radius), start_page: startPage, batch_size: batchSize, sources }
  if (category) body.category = category
  if (categoryId) body.category_id = categoryId
  if (minPrice !== null && minPrice !== '') body.min_price = Number(minPrice)
  if (maxPrice !== null && maxPrice !== '') body.max_price = Number(maxPrice)
  if (condition) body.condition = condition

  // Only send non-empty category filters
  const activeFilters = {}
  if (categoryFilters) {
    for (const [key, value] of Object.entries(categoryFilters)) {
      if (value) activeFilters[key] = value
    }
  }
  if (Object.keys(activeFilters).length > 0) {
    body.category_filters = activeFilters
  }

  const res = await fetch('/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error('Backend nicht erreichbar — bitte Backend neu starten.')
    }
    throw new Error(`Suche fehlgeschlagen (${res.status})`)
  }

  return res.json()
}
