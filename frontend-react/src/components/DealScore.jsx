export function DealScore({ score, model, benchmark, isBenchmark, pricePerGB, ramType }) {
  if (score === null || score === undefined) return null

  const radius = 15
  const stroke = 3.5
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'

  const isRam = pricePerGB !== undefined && pricePerGB !== null
  const label = isRam ? 'EUR/GB' : isBenchmark ? 'P/L' : 'Deal'

  const tooltip = isRam
    ? `Preis/GB: ${pricePerGB.toFixed(2)} EUR\n${model || ''}${ramType ? ` (${ramType})` : ''}\nScore: ${score}/100`
    : isBenchmark
    ? `Preis-Leistung: ${score}/100${model ? `\nModell: ${model}` : ''}${benchmark ? `\nBenchmark: ${benchmark} Pkt.` : ''}`
    : `Deal Score: ${score}/100 – relativ zu allen Angeboten`

  return (
    <div className="flex items-center gap-2" title={tooltip}>
      <div className="relative w-9 h-9">
        <svg className="w-9 h-9 -rotate-90" viewBox="0 0 30 30">
          <circle
            cx="15"
            cy="15"
            r={normalizedRadius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={stroke}
          />
          <circle
            cx="15"
            cy="15"
            r={normalizedRadius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.7s ease' }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[9px] font-bold leading-none"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] text-white/35 uppercase tracking-wider font-semibold">{label}</span>
        {isRam && (
          <span className="text-[8px] text-white/25">{pricePerGB.toFixed(2)} EUR</span>
        )}
        {!isRam && isBenchmark && model && (
          <span className="text-[8px] text-white/25 truncate max-w-[70px]">{model}</span>
        )}
      </div>
    </div>
  )
}
