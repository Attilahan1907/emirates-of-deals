export function DealScore({ score, model, benchmark, isBenchmark, pricePerGB, ramType }) {
  if (score === null || score === undefined) return null

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
    <div
      className="flex flex-col items-center justify-center w-10 h-10 rounded-lg font-bold"
      style={{ backgroundColor: color + '22', color }}
      title={tooltip}
    >
      <span className="text-sm leading-none">{score}</span>
      <span className="text-[8px] opacity-60 leading-none mt-0.5">{label}</span>
    </div>
  )
}
