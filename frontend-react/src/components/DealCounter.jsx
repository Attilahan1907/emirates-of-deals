import { useState, useEffect, useRef } from 'react'

const TARGET = 47382
const DURATION = 1800 // ms

export function DealCounter() {
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  // IntersectionObserver — zählt erst wenn sichtbar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  // Count-up Animation
  useEffect(() => {
    if (!visible) return
    const start = performance.now()
    const frame = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / DURATION, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * TARGET))
      if (progress < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [visible])

  const formatted = count.toLocaleString('de-DE')

  return (
    <div ref={ref} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-8 mb-2 px-4">
      {/* Counter */}
      <div className="flex items-center gap-2">
        <span className="text-xl md:text-2xl font-bold font-mono text-primary tabular-nums">{formatted}</span>
        <div className="flex flex-col items-start">
          <span className="text-xs font-semibold text-foreground/70 leading-tight">Deals</span>
          <span className="text-xs text-muted-foreground leading-tight">verglichen</span>
        </div>
      </div>

      <div className="hidden sm:block w-px h-6 bg-border" />

      {/* Live */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-xs text-muted-foreground">Echtzeit</span>
      </div>

      <div className="hidden sm:block w-px h-6 bg-border" />

      {/* Kein Login */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Kostenlos</span>
        <span className="text-xs font-semibold text-[#f59e0b]">✦ Kein Login</span>
      </div>
    </div>
  )
}
