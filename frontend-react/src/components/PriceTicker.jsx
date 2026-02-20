import { useState } from 'react'

const ITEMS = [
  { title: 'RTX 4090 Founders Edition', price: '649€', tag: 'GPU' },
  { title: 'iPhone 15 Pro 256GB', price: '720€', tag: 'Smartphone' },
  { title: 'PlayStation 5 Slim', price: '380€', tag: 'Konsole' },
  { title: 'MacBook Air M2 8GB', price: '890€', tag: 'Laptop' },
  { title: 'Samsung Galaxy S25 Ultra', price: '950€', tag: 'Smartphone' },
  { title: 'AirPods Pro 2. Gen', price: '175€', tag: 'Audio' },
  { title: 'RTX 3080 Ti 12GB', price: '410€', tag: 'GPU' },
  { title: 'Nintendo Switch OLED', price: '220€', tag: 'Konsole' },
  { title: 'iPad Pro M4 11"', price: '860€', tag: 'Tablet' },
  { title: 'Ryzen 9 7950X', price: '390€', tag: 'CPU' },
  { title: 'Dyson V15 Detect', price: '340€', tag: 'Haushalt' },
  { title: 'Sony WH-1000XM5', price: '220€', tag: 'Audio' },
]

const TICKER = [...ITEMS, ...ITEMS]

export function PriceTicker({ onSearch }) {
  const [paused, setPaused] = useState(false)

  const handleClick = (item) => {
    if (onSearch) {
      // Deutschlandweit suchen, beide Quellen
      onSearch(item.title, '', -1, ['kleinanzeigen', 'ebay'])
    }
  }

  return (
    <div
      className="relative w-full overflow-hidden border-y border-[rgba(255,255,255,0.05)] py-2.5 my-10"
      style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex gap-0 animate-marquee"
        style={{ animationPlayState: paused ? 'paused' : 'running' }}
      >
        {TICKER.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(item)}
            className="flex items-center gap-3 shrink-0 px-6 group cursor-pointer rounded-lg transition-colors duration-150 hover:bg-[rgba(255,255,255,0.04)] active:bg-[rgba(255,255,255,0.08)] py-1"
            title={`Nach „${item.title}" suchen`}
          >
            {/* Trennpunkt */}
            <span className="w-1 h-1 rounded-full bg-[rgba(255,255,255,0.15)] group-hover:bg-primary/40 transition-colors" />
            {/* Tag */}
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 group-hover:text-muted-foreground/80 transition-colors">
              {item.tag}
            </span>
            {/* Titel */}
            <span className="text-xs text-foreground/70 font-medium group-hover:text-foreground transition-colors">
              {item.title}
            </span>
            {/* Preis */}
            <span className="text-xs font-bold group-hover:opacity-90 transition-opacity" style={{ color: 'var(--deal)' }}>
              {item.price}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
