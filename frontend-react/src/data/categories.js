import {
  Monitor,
  Car,
  Home,
  Sofa,
  Shirt,
  PawPrint,
  Baby,
  Briefcase,
  Puzzle,
  Music,
  Cpu,
  Smartphone,
  Gamepad2,
  Laptop,
  Bike,
  Building2,
  UtensilsCrossed,
  Armchair,
  ShoppingBag,
  Dog,
  Cat,
  BookOpen,
  Film,
  MemoryStick,
} from 'lucide-react'

// categoryId = Kleinanzeigen Kategorie-ID (wird an URL angehängt: /k0c{id})
// So filtert Kleinanzeigen selbst nach Kategorie — keine Adapter, Teile etc.
export const CATEGORIES = [
  {
    id: 'elektronik',
    label: 'Elektronik',
    icon: Monitor,
    color: 'neon-cyan',
    subcategories: [
      { id: 'gpu', label: 'Grafikkarten', defaultQuery: 'Grafikkarte', benchmarkType: 'gpu', icon: Cpu, categoryId: 225 },
      { id: 'cpu', label: 'Prozessoren', defaultQuery: 'Prozessor', benchmarkType: 'cpu', icon: Cpu, categoryId: 225 },
      { id: 'ram', label: 'RAM / Arbeitsspeicher', defaultQuery: 'RAM DDR', benchmarkType: 'ram', icon: MemoryStick, categoryId: 225 },
      { id: 'smartphone', label: 'Smartphones', defaultQuery: 'Smartphone', benchmarkType: 'smartphone', icon: Smartphone, categoryId: 173 },
      { id: 'konsolen', label: 'Konsolen', defaultQuery: 'Konsole', icon: Gamepad2, categoryId: 279 },
      { id: 'laptop', label: 'Laptops', defaultQuery: 'Laptop', icon: Laptop, categoryId: 278 },
    ],
  },
  {
    id: 'auto',
    label: 'Auto, Rad & Boot',
    icon: Car,
    color: 'electric-purple',
    subcategories: [
      { id: 'autos', label: 'Autos', defaultQuery: 'Auto', icon: Car, categoryId: 216 },
      { id: 'fahrrad', label: 'Fahrraeder', defaultQuery: 'Fahrrad', icon: Bike, categoryId: 217 },
    ],
  },
  {
    id: 'immobilien',
    label: 'Immobilien',
    icon: Building2,
    color: 'emerald-glow',
    subcategories: [
      { id: 'mietwohnungen', label: 'Mietwohnungen', defaultQuery: 'Wohnung', icon: Home, categoryId: 203 },
      { id: 'haeuser', label: 'Haeuser kaufen', defaultQuery: 'Haus', icon: Home, categoryId: 208 },
    ],
  },
  {
    id: 'haus-garten',
    label: 'Haus & Garten',
    icon: Sofa,
    color: 'neon-cyan',
    subcategories: [
      { id: 'kueche', label: 'Kueche & Esszimmer', defaultQuery: 'Kueche', icon: UtensilsCrossed, categoryId: 84 },
      { id: 'wohnzimmer', label: 'Wohnzimmer', defaultQuery: 'Wohnzimmer', icon: Armchair, categoryId: 86 },
    ],
  },
  {
    id: 'mode',
    label: 'Mode & Beauty',
    icon: Shirt,
    color: 'electric-purple',
    subcategories: [
      { id: 'damen', label: 'Damenbekleidung', defaultQuery: 'Damen', icon: ShoppingBag, categoryId: 322 },
      { id: 'herren', label: 'Herrenbekleidung', defaultQuery: 'Herren', icon: Shirt, categoryId: 160 },
    ],
  },
  {
    id: 'haustiere',
    label: 'Haustiere',
    icon: PawPrint,
    color: 'emerald-glow',
    subcategories: [
      { id: 'hunde', label: 'Hunde', defaultQuery: 'Hund', icon: Dog, categoryId: 134 },
      { id: 'katzen', label: 'Katzen', defaultQuery: 'Katze', icon: Cat, categoryId: 136 },
    ],
  },
  {
    id: 'familie',
    label: 'Familie, Kind & Baby',
    icon: Baby,
    color: 'neon-cyan',
    subcategories: [
      { id: 'babykleidung', label: 'Baby- & Kinderkleidung', defaultQuery: 'Babykleidung', icon: Baby, categoryId: 22 },
      { id: 'kinderwagen', label: 'Kinderwagen & Buggys', defaultQuery: 'Kinderwagen', icon: Baby, categoryId: 25 },
    ],
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: Briefcase,
    color: 'electric-purple',
    subcategories: [
      { id: 'gastro', label: 'Gastronomie & Tourismus', defaultQuery: 'Gastronomie', icon: Briefcase, categoryId: 110 },
      { id: 'handwerk', label: 'Bau, Handwerk & Produktion', defaultQuery: 'Handwerk', icon: Briefcase, categoryId: 107 },
    ],
  },
  {
    id: 'freizeit',
    label: 'Freizeit & Hobby',
    icon: Puzzle,
    color: 'emerald-glow',
    subcategories: [
      { id: 'kunst', label: 'Kunst & Antiquitaeten', defaultQuery: 'Kunst', icon: Puzzle, categoryId: 240 },
      { id: 'sammeln', label: 'Sammeln', defaultQuery: 'Sammeln', icon: Puzzle, categoryId: 234 },
    ],
  },
  {
    id: 'musik-filme',
    label: 'Musik, Filme & Buecher',
    icon: Music,
    color: 'neon-cyan',
    subcategories: [
      { id: 'buecher', label: 'Buecher & Zeitschriften', defaultQuery: 'Buch', icon: BookOpen, categoryId: 76 },
      { id: 'filme', label: 'Film & DVD', defaultQuery: 'DVD', icon: Film, categoryId: 79 },
    ],
  },
]
