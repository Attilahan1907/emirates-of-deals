export async function createAlert(alertData) {
  const res = await fetch('/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alertData),
  })

  if (!res.ok) {
    throw new Error(`Alert erstellen fehlgeschlagen (${res.status})`)
  }

  return res.json()
}

export async function getAlerts() {
  const res = await fetch('/alerts', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Alerts laden fehlgeschlagen (${res.status})`)
  }

  return res.json()
}

export async function deleteAlert(alertId) {
  const res = await fetch(`/alerts/${alertId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Alert löschen fehlgeschlagen (${res.status})`)
  }

  return res.json()
}

export async function checkAlerts() {
  const res = await fetch('/alerts/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Alert-Prüfung fehlgeschlagen (${res.status})`)
  }

  return res.json()
}
