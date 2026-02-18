import { useState } from 'react'
import { ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { CATEGORIES } from '../data/categories'

const COLOR_MAP = {
  'neon-cyan': {
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/20',
    text: 'text-neon-cyan',
    hoverBg: 'hover:bg-neon-cyan/15',
    activeBg: 'bg-neon-cyan/20',
    dot: 'bg-neon-cyan',
  },
  'electric-purple': {
    bg: 'bg-electric-purple/10',
    border: 'border-electric-purple/20',
    text: 'text-electric-purple',
    hoverBg: 'hover:bg-electric-purple/15',
    activeBg: 'bg-electric-purple/20',
    dot: 'bg-electric-purple',
  },
  'emerald-glow': {
    bg: 'bg-emerald-glow/10',
    border: 'border-emerald-glow/20',
    text: 'text-emerald-glow',
    hoverBg: 'hover:bg-emerald-glow/15',
    activeBg: 'bg-emerald-glow/20',
    dot: 'bg-emerald-glow',
  },
}

export function CategoryGrid({ onCategorySelect }) {
  const [expandedId, setExpandedId] = useState(null)

  const toggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Kategorien
        </h2>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => {
          const colors = COLOR_MAP[cat.color] || COLOR_MAP['neon-cyan']
          const isExpanded = expandedId === cat.id
          const Icon = cat.icon

          return (
            <div key={cat.id} className="flex flex-col">
              {/* Main category card */}
              <button
                onClick={() => toggle(cat.id)}
                className={`glass rounded-xl p-4 flex flex-col items-center gap-2.5 transition-all cursor-pointer group
                  ${isExpanded ? `${colors.activeBg} border-white/15` : colors.hoverBg}
                `}
              >
                <div className={`p-2.5 rounded-xl ${colors.bg} border ${colors.border} transition-colors group-hover:scale-105`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <span className="text-xs font-medium text-white/70 text-center leading-tight">
                  {cat.label}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-white/30" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                )}
              </button>

              {/* Subcategories dropdown */}
              {isExpanded && (
                <div className="mt-1.5 glass rounded-xl p-2 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  {cat.subcategories.map((sub) => {
                    const SubIcon = sub.icon
                    return (
                      <button
                        key={sub.id}
                        onClick={() => onCategorySelect(sub)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all cursor-pointer
                          hover:bg-white/5 group/sub`}
                      >
                        <SubIcon className={`w-3.5 h-3.5 text-white/30 group-hover/sub:${colors.text}`} />
                        <span className="text-xs text-white/50 group-hover/sub:text-white/80 transition-colors flex-1">
                          {sub.label}
                        </span>
                        {sub.benchmarkType && (
                          <Zap className="w-3 h-3 text-amber-400/60" title="Preis-Leistungs-Analyse verfuegbar" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
