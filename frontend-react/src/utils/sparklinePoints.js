export function sparklinePoints(prices, width = 120, height = 30, padding = 2) {
  if (!prices.length) return ''

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1

  const stepX = (width - padding * 2) / Math.max(prices.length - 1, 1)

  const points = prices.map((p, i) => {
    const x = padding + i * stepX
    const y = padding + (1 - (p - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  return `M${points.join(' L')}`
}
