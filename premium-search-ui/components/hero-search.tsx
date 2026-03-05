"use client"

import { useState, useRef } from "react"
import { Search, ArrowRight } from "lucide-react"

const popularSearches = [
  "iPhone 16 Pro",
  "PlayStation 5",
  "Nike Air Max",
  "Samsung Galaxy S25",
  "AirPods Pro",
  "MacBook Air",
]

export function HeroSearch() {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Search Bar */}
      <div
        className={`
          group relative flex items-center rounded-full
          border border-[rgba(255,255,255,0.1)]
          bg-[rgba(255,255,255,0.03)]
          shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]
          transition-all duration-300
          ${isFocused ? "border-[rgba(0,229,255,0.3)] shadow-[inset_0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,229,255,0.08)]" : "hover:border-[rgba(255,255,255,0.15)]"}
        `}
      >
        <div className="flex items-center pl-5">
          <Search
            size={20}
            className={`transition-colors duration-300 ${isFocused ? "text-primary" : "text-muted-foreground"}`}
          />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Suche ein Produkt, um Preise zu vergleichen..."
          className="flex-1 bg-transparent px-4 py-5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="pr-2">
          <button
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,229,255,0.35)] active:scale-95 active:shadow-none"
          >
            Suchen
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Popular Search Tags */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="mr-1 text-xs text-muted-foreground">Beliebt:</span>
        {popularSearches.map((term) => (
          <button
            key={term}
            onClick={() => {
              setQuery(term)
              inputRef.current?.focus()
            }}
            className="rounded-full border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] px-3.5 py-1.5 text-xs text-muted-foreground transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:border-[rgba(0,229,255,0.2)] hover:text-foreground hover:shadow-[0_4px_12px_rgba(0,229,255,0.08)] active:scale-95 active:shadow-none"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  )
}
