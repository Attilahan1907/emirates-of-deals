export async function getSearchAlerts() {
  const res = await fetch('/search-alerts')
  if (!res.ok) throw new Error(`Laden fehlgeschlagen (${res.status})`)
  return res.json()
}

export async function createSearchAlert(data) {
  const res = await fetch('/search-alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Erstellen fehlgeschlagen (${res.status})`)
  return res.json()
}

export async function deleteSearchAlert(alertId) {
  const res = await fetch(`/search-alerts/${alertId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Löschen fehlgeschlagen (${res.status})`)
  return res.json()
}
