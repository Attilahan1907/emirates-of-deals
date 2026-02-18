export function computeStats(results) {
  if (!results.length) {
    return { count: 0, bestPrice: 0, avgPrice: 0, maxSavings: 0 }
  }

  const prices = results.map((r) => r.price)
  const bestPrice = Math.min(...prices)
  const worstPrice = Math.max(...prices)
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
  const maxSavings = worstPrice - bestPrice

  return {
    count: results.length,
    bestPrice,
    avgPrice,
    maxSavings,
  }
}
