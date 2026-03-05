import { useState, useEffect } from 'react'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

function SparklineSVG({ history, width = 120, height = 36 }) {
  if (!history || history.length < 2) return null

  const prices = history.map(h => h.price)
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const range = maxP - minP || 1

  const pad = 2
  const points = prices.map((p, i) => {
    const x = pad + (i / (prices.length - 1)) * (width - pad * 2)
    const y = pad + ((maxP - p) / range) * (height - pad * 2)
    return `${x},${y}`
  })
  const polyline = points.join(' ')

  // Fill area under line
  const first = points[0].split(',')
  const last = points[points.length - 1].split(',')
  const fillPoints = `${first[0]},${height} ${polyline} ${last[0]},${height}`

  const isDown = prices[prices.length - 1] < prices[0]
  const color = isDown ? '#34d399' : prices[prices.length - 1] > prices[0] ? '#f87171' : '#94a3b8'

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <polygon points={fillPoints} fill={color} fillOpacity="0.12" />
      <polyline points={polyline} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last price dot */}
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  )
}

export function PriceHistoryChart({ url }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) return
    setLoading(true)
    fetch(`${import.meta.env.VITE_API_URL || ''}/price-history?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => { setData(data); setLoading(false) })
      .catch(err => { setError(err); setLoading(false) })
  }, [url])

  if (loading) return <div className="h-4 w-12 bg-foreground/5 animate-pulse rounded" />
  if (error || !data || !data.history || data.history.length < 2) return null

  const stats = data.stats
  const history = data.history
  const currentPrice = history[history.length - 1].price
  const firstPrice = history[0].price
  const diff = currentPrice - firstPrice
  const percentChange = ((diff / firstPrice) * 100).toFixed(1)

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground/5 border border-foreground/10 group/tooltip relative cursor-help">
      {diff < 0 ? (
        <TrendingDown className="w-3 h-3 text-emerald-400 shrink-0" />
      ) : diff > 0 ? (
        <TrendingUp className="w-3 h-3 text-red-400 shrink-0" />
      ) : (
        <Minus className="w-3 h-3 text-muted-foreground shrink-0" />
      )}
      <span className={`text-[10px] font-bold ${diff < 0 ? 'text-emerald-400' : diff > 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
        {diff === 0 ? 'Stabil' : `${diff > 0 ? '+' : ''}${percentChange}%`}
      </span>

      {/* Tooltip with SVG chart */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-3 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 backdrop-blur-xl">
        <p className="text-[11px] font-bold mb-2">
          Preisverlauf <span className="text-muted-foreground font-normal">({history.length} Datenpunkte)</span>
        </p>

        {/* SVG Chart */}
        <div className="mb-2 flex justify-center">
          <SparklineSVG history={history} width={172} height={40} />
        </div>

        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Niedrigster:</span>
            <span className="text-emerald-400 font-bold">{stats.min.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Höchster:</span>
            <span className="text-red-400 font-bold">{stats.max.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Durchschnitt:</span>
            <span className="font-bold">{stats.avg.toFixed(2)}€</span>
          </div>
        </div>
      </div>
    </div>
  )
}
