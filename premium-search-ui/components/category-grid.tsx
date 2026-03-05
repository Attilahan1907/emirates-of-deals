"use client"

import {
  Smartphone,
  Laptop,
  Shirt,
  ShoppingBag,
  Gamepad2,
  Home,
  type LucideIcon,
} from "lucide-react"

interface Category {
  name: string
  description: string
  icon: LucideIcon
  span: string
}

const categories: Category[] = [
  {
    name: "Elektronik",
    description: "Smartphones, Tablets & mehr",
    icon: Smartphone,
    span: "md:col-span-2 md:row-span-2",
  },
  {
    name: "Laptops",
    description: "Arbeits- & Spielmaschinen",
    icon: Laptop,
    span: "md:col-span-1",
  },
  {
    name: "Mode",
    description: "Top-Marken, beste Preise",
    icon: Shirt,
    span: "md:col-span-1",
  },
  {
    name: "Gaming",
    description: "Konsolen, Zubehör & Spiele",
    icon: Gamepad2,
    span: "md:col-span-1",
  },
  {
    name: "Haus & Wohnen",
    description: "Möbel & Haushaltsgeräte",
    icon: Home,
    span: "md:col-span-1",
  },
  {
    name: "Lebensmittel",
    description: "Täglicher Bedarf im Vergleich",
    icon: ShoppingBag,
    span: "md:col-span-2",
  },
]

function CategoryCard({ category }: { category: Category }) {
  const Icon = category.icon

  return (
    <button
      className={`
        group relative flex flex-col items-start justify-end overflow-hidden
        rounded-2xl border border-[rgba(255,255,255,0.06)]
        bg-[rgba(255,255,255,0.02)] p-6
        transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        hover:-translate-y-0.5 hover:border-[rgba(0,229,255,0.15)]
        hover:bg-[rgba(255,255,255,0.04)]
        hover:shadow-[0_8px_30px_rgba(0,229,255,0.06)]
        active:scale-[0.98] active:shadow-none
        ${category.span}
      `}
    >
      {/* Subtle gradient orb */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-muted-foreground transition-colors duration-200 group-hover:border-primary/20 group-hover:text-primary">
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{category.description}</p>
    </button>
  )
}

export function CategoryGrid() {
  return (
    <section id="categories" className="mx-auto w-full max-w-5xl px-6">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Kategorien durchstöbern
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Entdecke Angebote in jeder Kategorie
        </p>
      </div>
      <div className="grid auto-rows-[140px] grid-cols-2 gap-3 md:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </div>
    </section>
  )
}
