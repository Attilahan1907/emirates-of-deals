const stats = [
  { value: "50K+", label: "Produkte erfasst" },
  { value: "120+", label: "Shops verglichen" },
  { value: "2M+", label: "Preise gespart" },
  { value: "99,9%", label: "Verfügbarkeit" },
]

export function StatsBar() {
  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] md:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center bg-[rgba(5,5,5,0.8)] px-6 py-6 text-center"
        >
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {stat.value}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  )
}
