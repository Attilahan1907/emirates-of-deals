import { Fragment, useState } from 'react'
import { Zap, X } from 'lucide-react'
import { CATEGORIES } from '../data/categories'

const CAT_COLORS = {
  'elektronik':  { accent: '#00E5FF', bg: 'rgba(0,229,255,0.10)',   border: 'rgba(0,229,255,0.22)',   glow: 'rgba(0,229,255,0.06)' },
  'auto':        { accent: '#A78BFA', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.22)', glow: 'rgba(167,139,250,0.06)' },
  'immobilien':  { accent: '#34D399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.22)',  glow: 'rgba(52,211,153,0.06)' },
  'haus-garten': { accent: '#2DD4BF', bg: 'rgba(45,212,191,0.10)',  border: 'rgba(45,212,191,0.22)',  glow: 'rgba(45,212,191,0.06)' },
  'mode':        { accent: '#F472B6', bg: 'rgba(244,114,182,0.10)', border: 'rgba(244,114,182,0.22)', glow: 'rgba(244,114,182,0.06)' },
  'haustiere':   { accent: '#FBBF24', bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.22)',  glow: 'rgba(251,191,36,0.06)' },
  'familie':     { accent: '#60A5FA', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.22)',  glow: 'rgba(96,165,250,0.06)' },
  'jobs':        { accent: '#818CF8', bg: 'rgba(129,140,248,0.10)', border: 'rgba(129,140,248,0.22)', glow: 'rgba(129,140,248,0.06)' },
  'freizeit':    { accent: '#FB923C', bg: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,0.22)',  glow: 'rgba(251,146,60,0.06)' },
  'musik-filme': { accent: '#C084FC', bg: 'rgba(192,132,252,0.10)', border: 'rgba(192,132,252,0.22)', glow: 'rgba(192,132,252,0.06)' },
}

export function CategoryGrid({ onCategorySelect }) {
  const [selectedId, setSelectedId] = useState(null)

  const selectedCat = CATEGORIES.find((c) => c.id === selectedId)
  const selectedIndex = selectedId ? CATEGORIES.findIndex((c) => c.id === selectedId) : -1

  // Desktop accordion: last card index in clicked row (4-col grid)
  const desktopAfter = selectedIndex >= 0
    ? Math.min(Math.floor(selectedIndex / 4) * 4 + 3, CATEGORIES.length - 1)
    : -1

  const handleCardClick = (cat) => setSelectedId((prev) => (prev === cat.id ? null : cat.id))
  const handleSubSelect = (sub) => { onCategorySelect(sub); setSelectedId(null) }
  const closeSheet = () => setSelectedId(null)

  const SubBtn = ({ sub }) => {
    const SubIcon = sub.icon
    return (
      <button
        onClick={() => handleSubSelect(sub)}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-left text-xs text-muted-foreground hover:border-[rgba(0,229,255,0.2)] hover:text-foreground hover:bg-[rgba(255,255,255,0.04)] active:scale-[0.97] transition-all duration-150 cursor-pointer group/sub"
      >
        <SubIcon className="w-3.5 h-3.5 flex-shrink-0 group-hover/sub:text-primary transition-colors" />
        <span className="flex-1 truncate">{sub.label}</span>
        {sub.benchmarkType && <Zap className="w-3 h-3 text-amber-400/60 flex-shrink-0" />}
      </button>
    )
  }

  return (
    <section id="categories" className="mx-auto w-full max-w-5xl px-6">

      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Kategorien durchstöbern
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Entdecke Angebote in jeder Kategorie
        </p>
      </div>

      {/* ── MOBILE: 2-Spalten Grid → Tap öffnet Bottom Sheet ───── */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isSelected = selectedId === cat.id
          const c = CAT_COLORS[cat.id] || CAT_COLORS['elektronik']
          return (
            <button
              key={cat.id}
              onClick={() => handleCardClick(cat)}
              style={isSelected ? {
                borderColor: c.border,
                background: `linear-gradient(135deg, ${c.glow}, transparent)`,
              } : {}}
              className={`
                h-[130px] group relative flex flex-col items-start justify-end overflow-hidden
                rounded-2xl border p-4
                transition-all duration-150 active:scale-[0.97]
                ${isSelected
                  ? 'border-transparent'
                  : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]'}
              `}
            >
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border transition-colors"
                style={{ backgroundColor: c.bg, borderColor: c.border, color: c.accent }}
              >
                <Icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-foreground text-left leading-tight">{cat.label}</h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{cat.subcategories.length} Kategorien</p>
            </button>
          )
        })}
      </div>

      {/* ── DESKTOP: 4-Spalten Bento Grid + Accordion ───────────── */}
      <div className="hidden md:grid grid-cols-4 gap-3">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon
          const isSelected = selectedId === cat.id
          const showPanel = selectedCat && i === desktopAfter
          const c = CAT_COLORS[cat.id] || CAT_COLORS['elektronik']

          return (
            <Fragment key={cat.id}>
              <button
                onClick={() => handleCardClick(cat)}
                style={isSelected ? {
                  borderColor: c.border,
                  background: `linear-gradient(135deg, ${c.glow}, transparent)`,
                } : {}}
                className={`
                  h-[140px] group relative flex flex-col items-start justify-end overflow-hidden
                  rounded-2xl border p-6
                  transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  hover:-translate-y-0.5 active:scale-[0.98] active:shadow-none
                  ${isSelected
                    ? ''
                    : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]'}
                `}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = c.border
                    e.currentTarget.style.background = `linear-gradient(135deg, ${c.glow}, transparent)`
                    e.currentTarget.style.boxShadow = `0 8px 30px ${c.glow}`
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = ''
                    e.currentTarget.style.background = ''
                    e.currentTarget.style.boxShadow = ''
                  }
                }}
              >
                {/* Glow blob oben rechts in Kategoriefarbe */}
                <div
                  className="absolute -top-10 -right-10 h-28 w-28 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ backgroundColor: c.accent }}
                />
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-200"
                  style={{ backgroundColor: c.bg, borderColor: c.border, color: c.accent }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{cat.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground truncate w-full">{cat.subcategories.length} Unterkategorien</p>
              </button>

              {showPanel && (() => {
                const pc = CAT_COLORS[selectedCat.id] || CAT_COLORS['elektronik']
                return (
                  <div
                    className="col-span-4 rounded-2xl border p-4"
                    style={{ borderColor: pc.border, background: `linear-gradient(135deg, ${pc.glow}, transparent)` }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: pc.accent }}>
                      {selectedCat.label}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedCat.subcategories.map((sub) => <SubBtn key={sub.id} sub={sub} />)}
                    </div>
                  </div>
                )
              })()}
            </Fragment>
          )
        })}
      </div>

      {/* ── MOBILE: Bottom Sheet ─────────────────────────────────── */}
      {selectedCat && (() => {
        const sc = CAT_COLORS[selectedCat.id] || CAT_COLORS['elektronik']
        const SheetIcon = selectedCat.icon
        return (
          <div className="md:hidden">
            <div className="fixed inset-0 bg-black/50 z-40" onClick={closeSheet} />
            <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t bg-card p-5 pb-10 shadow-2xl" style={{ borderColor: sc.border }}>
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-foreground/20" />
              <div className="flex items-center justify-between mb-4 mt-1">
                <div className="flex items-center gap-2">
                  <SheetIcon className="w-4 h-4" style={{ color: sc.accent }} />
                  <p className="text-sm font-semibold text-foreground">{selectedCat.label}</p>
                  <span className="text-xs text-muted-foreground">({selectedCat.subcategories.length})</span>
                </div>
                <button onClick={closeSheet} className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground/70 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto">
                {selectedCat.subcategories.map((sub) => <SubBtn key={sub.id} sub={sub} />)}
              </div>
            </div>
          </div>
        )
      })()}
    </section>
  )
}
