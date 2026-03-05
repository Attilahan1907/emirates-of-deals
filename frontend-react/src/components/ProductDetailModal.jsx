import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { X, ExternalLink, TrendingDown } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'
import { DealScore } from './DealScore'

export function ProductDetailModal({ isOpen, onClose, item, dealScore, allPrices, benchmarkType, isBenchmark }) {
  const [visible, setVisible] = useState(false)
  const touchStartY = useRef(null)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Mount animation
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
    } else {
      setVisible(false)
    }
  }, [isOpen])

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 300)
  }, [onClose])

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) handleClose()
  }, [handleClose])

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (touchStartY.current === null) return
    const delta = e.touches[0].clientY - touchStartY.current
    if (delta > 0) setDragY(delta)
  }

  const handleTouchEnd = () => {
    if (dragY > 100) {
      handleClose()
    }
    setDragY(0)
    setIsDragging(false)
    touchStartY.current = null
  }

  // Stats calculation
  const stats = useMemo(() => {
    const validPrices = allPrices.filter(p => p > 0)
    if (validPrices.length === 0) return null
    const min = Math.min(...validPrices)
    const max = Math.max(...validPrices)
    const avg = validPrices.reduce((a, b) => a + b, 0) / validPrices.length
    return { min, max, avg }
  }, [allPrices])

  const savingsPercent = useMemo(() => {
    if (!stats || !item?.price || item.price <= 0 || stats.avg <= 0) return null
    const pct = ((stats.avg - item.price) / stats.avg) * 100
    return pct > 0 ? Math.round(pct) : null
  }, [stats, item])

  const hasScore = dealScore && dealScore.score !== null && dealScore.score !== undefined

  if (!isOpen || !item) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end md:items-center md:justify-center transition-all duration-300 ${
        visible ? 'bg-black/70 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Mobile: fullscreen sheet from bottom / Desktop: centered 2-col modal */}
      <div
        className={`
          w-full max-h-[92vh] overflow-y-auto overscroll-contain
          rounded-t-3xl md:rounded-2xl
          glass border-t border-foreground/10 md:border
          md:max-w-3xl md:mx-4
          ${visible
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-full md:translate-y-0 md:scale-95 opacity-0'
          }
        `}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'all 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-foreground/20" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 md:top-5 md:right-5 z-10 p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/50 hover:text-foreground/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content grid: stack on mobile, 2-col on desktop */}
        <div className="md:grid md:grid-cols-2 md:gap-0">

          {/* Left: Image */}
          <div className="p-5 pb-2 md:p-6 md:pb-6">
            {item.image ? (
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-foreground/5">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.classList.add('flex', 'items-center', 'justify-center')
                    const span = document.createElement('span')
                    span.textContent = 'Kein Bild'
                    span.className = 'text-foreground/30 text-sm'
                    e.target.parentElement.appendChild(span)
                  }}
                />
              </div>
            ) : (
              <div className="w-full aspect-[4/3] rounded-xl bg-foreground/5 flex items-center justify-center">
                <span className="text-foreground/30 text-sm">Kein Bild</span>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="p-5 pt-2 md:p-6 md:pl-0 flex flex-col gap-3">

            {/* Source badge */}
            <div className="flex items-center gap-2">
              {item.source === 'ebay' ? (
                <span className="text-[10px] font-semibold bg-amber-400/15 text-amber-400 border border-amber-400/20 rounded-full px-2.5 py-0.5">
                  eBay
                </span>
              ) : (
                <span className="text-[10px] font-semibold bg-emerald-400/10 text-emerald-400/70 border border-emerald-400/15 rounded-full px-2.5 py-0.5">
                  Kleinanzeigen
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-base md:text-lg font-semibold text-foreground/95 leading-snug">
              {item.title}
            </h2>

            {/* Price + DealScore row */}
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold font-mono text-neon-cyan drop-shadow-[0_0_12px_rgba(0,229,255,0.5)]">
                {formatPrice(item.price)}
              </p>
              {hasScore && (
                <DealScore
                  score={dealScore.score}
                  model={dealScore.model}
                  benchmark={dealScore.benchmark}
                  isBenchmark={isBenchmark}
                  pricePerGB={dealScore.pricePerGB}
                  ramType={dealScore.ramType}
                />
              )}
            </div>

            {/* Savings badge */}
            {savingsPercent && (
              <div className="inline-flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <TrendingDown className="w-3.5 h-3.5" />
                {savingsPercent}% unter Durchschnitt
              </div>
            )}

            {/* Benchmark info */}
            {isBenchmark && hasScore && dealScore?.model && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.12)' }}
              >
                <span className="text-muted-foreground shrink-0">Erkannt:</span>
                <span className="font-semibold text-primary/90">{dealScore.model}</span>
                {dealScore.benchmark && (
                  <span className="text-muted-foreground ml-auto whitespace-nowrap">
                    {Number(dealScore.benchmark).toLocaleString('de-DE')} Pkt.
                  </span>
                )}
              </div>
            )}

            {/* Stats grid */}
            {stats && (
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                  { label: 'Min', value: stats.min },
                  { label: 'Durchschnitt', value: stats.avg },
                  { label: 'Max', value: stats.max },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-0.5 py-2.5 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06]"
                  >
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
                    <span className="text-sm font-semibold font-mono text-foreground/80">{formatPrice(value)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Original price info */}
            {item.original && (
              <p className="text-xs text-foreground/40">{item.original}</p>
            )}

            {/* CTA */}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 bg-neon-cyan/15 hover:bg-neon-cyan/25 border border-neon-cyan/25 text-neon-cyan hover:shadow-[0_4px_20px_rgba(0,229,255,0.25)] hover:-translate-y-0.5"
            >
              <ExternalLink className="w-4 h-4" />
              Zum Deal
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
