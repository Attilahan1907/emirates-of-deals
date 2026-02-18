export async function searchProducts(query, location = '', radius = 50, category = null, categoryId = null) {
  const body = { query, location, radius: Number(radius) }
  if (category) body.category = category
  if (categoryId) body.category_id = categoryId

  const res = await fetch('/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Suche fehlgeschlagen (${res.status})`)
  }

  return res.json()
}
