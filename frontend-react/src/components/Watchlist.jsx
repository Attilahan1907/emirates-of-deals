import { useFavorites } from '../hooks/useFavorites'
import { ProductCard } from './ProductCard'
import { Heart, Trash2, Bell, BellOff } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'

export function Watchlist() {
  const { favorites, removeFavorite, updateFavorite } = useFavorites()

  const handleRemoveAlert = async (id) => {
    const favorite = favorites.find(f => f.id === id)
    if (favorite?.backendAlertId) {
      try {
        const { deleteAlert } = await import('../api/alerts')
        await deleteAlert(favorite.backendAlertId)
      } catch (err) {
        console.error('Error deleting backend alert:', err)
      }
    }
    updateFavorite(id, { alertPrice: null, notificationMethod: null, contactInfo: null, backendAlertId: null })
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-base flex flex-col">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-24">
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground/90 mb-2">Keine Favoriten gespeichert</h2>
            <p className="text-foreground/50">
              Fügen Sie Angebote zu Ihren Favoriten hinzu, um sie hier zu sehen
            </p>
          </div>
        </div>
      </div>
    )
  }

  const favoritesWithAlerts = favorites.filter(f => f.alertPrice)
  const favoritesWithoutAlerts = favorites.filter(f => !f.alertPrice)

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-24">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-400 fill-current" />
              <h1 className="text-3xl font-bold text-foreground">Meine Watchlist</h1>
              <span className="bg-foreground/10 text-foreground/60 text-sm px-3 py-1 rounded-full">
                {favorites.length} {favorites.length === 1 ? 'Artikel' : 'Artikel'}
              </span>
            </div>
          </div>

          {favoritesWithAlerts.length > 0 && (
            <div className="mb-6 p-4 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-neon-cyan" />
                <h3 className="font-semibold text-foreground">Aktive Preis-Alerts ({favoritesWithAlerts.length})</h3>
              </div>
              <p className="text-sm text-foreground/60">
                Sie erhalten Benachrichtigungen, wenn die Preise unter Ihre festgelegten Schwellenwerte fallen
              </p>
            </div>
          )}
        </div>

        {favoritesWithAlerts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-neon-cyan" />
              Mit Preis-Alerts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {favoritesWithAlerts.map((favorite, index) => (
                <div key={favorite.id} className="relative">
                  <ProductCard
                    item={favorite}
                    rank={index + 1}
                    isBest={false}
                    allPrices={[favorite.price]}
                    dealScore={null}
                    isBenchmark={false}
                  />
                  <div className="absolute top-4 left-4 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg px-2 py-1">
                    <p className="text-xs text-neon-cyan font-medium">
                      Alert: {formatPrice(favorite.alertPrice)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveAlert(favorite.id)}
                    className="absolute top-4 right-16 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg text-foreground/40 hover:text-foreground/60 transition-all"
                    title="Alert entfernen"
                  >
                    <BellOff className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {favoritesWithoutAlerts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Gespeicherte Angebote</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {favoritesWithoutAlerts.map((favorite, index) => (
                <div key={favorite.id} className="relative">
                  <ProductCard
                    item={favorite}
                    rank={favoritesWithAlerts.length + index + 1}
                    isBest={false}
                    allPrices={[favorite.price]}
                    dealScore={null}
                    isBenchmark={false}
                  />
                  <button
                    onClick={async () => await removeFavorite(favorite.id)}
                    className="absolute top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-all z-20"
                    title="Aus Favoriten entfernen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="mt-12 p-6 bg-foreground/5 rounded-xl border border-foreground/10">
            <h3 className="font-semibold text-foreground mb-3">Info</h3>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>• Ihre Favoriten werden lokal in Ihrem Browser gespeichert</li>
              <li>• Preis-Alerts werden regelmäßig geprüft und Sie erhalten Benachrichtigungen</li>
              <li>• Aktualisierte Preise werden automatisch erkannt</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
