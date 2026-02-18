import { sparklinePoints } from '../utils/sparklinePoints'

export function Sparkline({ prices, currentIndex, width = 120, height = 30 }) {
  const path = sparklinePoints(prices, width, height)
  if (!path) return null

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const padding = 2

  const stepX = (width - padding * 2) / Math.max(prices.length - 1, 1)
  const cx = padding + currentIndex * stepX
  const cy = padding + (1 - (prices[currentIndex] - min) / range) * (height - padding * 2)

  return (
    <svg width={width} height={height} className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
      <defs>
        <linearGradient id={`sparkGrad-${currentIndex}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="#00f0ff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={cx} cy={cy} r="3" fill="#00f0ff" />
    </svg>
  )
}
