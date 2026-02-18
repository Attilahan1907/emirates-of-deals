export function Header({ onLogoClick }) {
  return (
    <header className="w-full pt-10 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-3">
        <img
          src="/logo.png"
          alt="Emirates of Deals"
          className="w-52 h-52 rounded-3xl object-cover cursor-pointer hover:scale-105 transition-transform"
          onClick={onLogoClick}
        />
        <p className="text-sm text-white/40 tracking-wide">
          Finde die besten Preise
        </p>
      </div>
    </header>
  )
}
