import { Header } from "@/components/header"
import { HeroSearch } from "@/components/hero-search"
import { CategoryGrid } from "@/components/category-grid"
import { StatsBar } from "@/components/stats-bar"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-accent/[0.03] blur-[100px]" />
      </div>

      <Header />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center px-6 pb-16 pt-32 md:pb-24 md:pt-44">
          {/* Badge */}
          <div className="mb-8 flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              Echtzeit-Preisvergleich in über 120 Shops
            </span>
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-balance text-center text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-foreground md:text-6xl lg:text-7xl">
            Finde den besten Preis.{" "}
            <span className="bg-gradient-to-r from-primary to-[#7c3aed] bg-clip-text text-transparent">
              Jedes Mal.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-xl text-pretty text-center text-base leading-relaxed text-muted-foreground md:text-lg">
            Vergleiche Preise bei allen großen Händlern in Sekunden.
            Schluss mit Überzahlen, fang an zu sparen.
          </p>

          {/* Search */}
          <div className="mt-10 w-full md:mt-12">
            <HeroSearch />
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 pb-20 md:pb-28">
          <StatsBar />
        </section>

        {/* Categories */}
        <section className="pb-24 md:pb-32">
          <CategoryGrid />
        </section>

        {/* Footer */}
        <footer className="border-t border-[rgba(255,255,255,0.06)] py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                <span className="text-xs font-bold text-primary-foreground">E</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Emirates of Deals
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {"Mit Präzision gebaut. Fürs Sparen designt."}
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
