export function LoadingState() {
  return (
    <div className="mt-6 space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-4 h-20">
            <div className="shimmer-bg rounded h-3 w-16 mb-3" />
            <div className="shimmer-bg rounded h-5 w-24" />
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 space-y-3">
            <div className="flex justify-between">
              <div className="shimmer-bg rounded-lg h-7 w-7" />
              <div className="shimmer-bg rounded h-7 w-28" />
            </div>
            <div className="shimmer-bg rounded h-4 w-full" />
            <div className="shimmer-bg rounded h-4 w-3/4" />
            <div className="flex justify-between items-end mt-4">
              <div className="shimmer-bg rounded h-8 w-24" />
              <div className="shimmer-bg rounded-lg h-9 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
