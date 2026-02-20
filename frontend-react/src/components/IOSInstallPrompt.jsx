import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

// iOS Share Icon SVG (exakt wie in Safari)
function IOSShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.684 7.316 12 4m0 0 3.316 3.316M12 4v12" />
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
    </svg>
  )
}

export function IOSInstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.navigator.standalone === true
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const seen = localStorage.getItem('ios-install-seen')

    if (isIOS && isSafari && !isStandalone && !seen) {
      setTimeout(() => {
        setVisible(true)
        requestAnimationFrame(() => setTimeout(() => setAnimateIn(true), 10))
      }, 1800)
    }
  }, [])

  const dismiss = () => {
    setAnimateIn(false)
    setTimeout(() => setVisible(false), 350)
    localStorage.setItem('ios-install-seen', '1')
  }


  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        style={{ opacity: animateIn ? 1 : 0 }}
        onClick={dismiss}
      />

      {/* Sheet */}
      <div
        className="relative w-full rounded-t-3xl bg-card border-t border-[rgba(255,255,255,0.08)] p-6 pb-12 shadow-2xl transition-transform duration-350 ease-out"
        style={{ transform: animateIn ? 'translateY(0)' : 'translateY(100%)' }}
      >
        {/* Drag Handle */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-foreground/20" />

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-foreground/40 hover:text-foreground/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mt-3 flex flex-col items-center gap-5">
          {/* App Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-[0_4px_20px_rgba(0,229,255,0.3)]">
            <img src="/logo.png" alt="Emirates of Deals" className="h-12 w-12 object-contain" />
          </div>

          {/* Headline */}
          <div className="text-center">
            <h2 className="text-base font-bold text-foreground">Zum Home-Bildschirm hinzufügen</h2>
            <p className="mt-1 text-sm text-muted-foreground">Öffne die App jederzeit mit einem Klick</p>
          </div>

          {/* Steps */}
          <div className="w-full flex flex-col gap-2.5">
            <div className="w-full flex items-center gap-3 rounded-2xl bg-foreground/5 border border-[rgba(255,255,255,0.05)] px-4 py-3.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">1</span>
              <div className="flex-1">
                <p className="text-sm text-foreground leading-snug">
                  Tippe auf <strong>Teilen</strong> unten in Safari
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Den Pfeil nach unten beachten ↓</p>
              </div>
              <span className="text-primary/80">
                <IOSShareIcon />
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-foreground/5 border border-[rgba(255,255,255,0.05)] px-4 py-3.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">2</span>
              <div className="flex-1">
                <p className="text-sm text-foreground leading-snug">
                  Liste <strong>nach unten scrollen</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">→ „Zum Home-Bildschirm" tippen</p>
              </div>
              <span className="text-xl">＋</span>
            </div>
          </div>

          {/* Animierter Pfeil → zeigt auf Safari Share Button unten */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-muted-foreground">Safari Share Button unten in der Leiste</p>
            <span className="text-primary animate-bounce text-lg">↓</span>
          </div>

          <button
            onClick={dismiss}
            className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all active:scale-95"
          >
            Verstanden
          </button>

          <button
            onClick={dismiss}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors -mt-2"
          >
            Später
          </button>
        </div>
      </div>
    </div>
  )
}
