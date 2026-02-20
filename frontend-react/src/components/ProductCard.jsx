import { useState } from 'react'
import { ExternalLink, Heart, Bell } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'
import { BestDealBadge } from './BestDealBadge'
import { DealScore } from './DealScore'
import { AlertDialog } from './AlertDialog'
import { useFavorites } from '../hooks/useFavorites'

export function ProductCard({ item, rank, isBest, allPrices, dealScore, isBenchmark, onOpenSettings, showImages }) {
  const hasScore = dealScore && dealScore.score !== null && dealScore.score !== undefined
  const { isFavorite, addFavorite, removeFavorite, getFavorite } = useFavorites()
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const favorite = getFavorite(item.url)
  const isFav = isFavorite(item.url)

  const handleFavoriteClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      if (isFav) {
        await removeFavorite(favorite.id)
      } else {
        // Add to favorites without alert first
        await addFavorite(item)
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
      // Still update UI optimistically
    }
  }

  const handleAlertClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowAlertDialog(true)
  }

  const handleSaveAlert = async (alertData) => {
    try {
      // Add or update favorite with alert
      await addFavorite(item, alertData.alertPrice, alertData.notificationMethod, alertData.contactInfo)
    } catch (err) {
      console.error('Error saving alert:', err)
      alert('Fehler beim Speichern des Alerts. Bitte versuchen Sie es erneut.')
    }
  }

  return (
    <>
      <div
        className={`glass rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.05] group relative ${
          isBest ? 'animate-pulse-glow border-emerald-glow/30' : ''
        }`}
      >
        {/* Produktbild */}
        {showImages && item.image && (
          <div className="w-full h-40 rounded-xl overflow-hidden bg-white/5 -mx-0">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
        )}

        {/* Favorite and Alert buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-lg transition-all ${
              isFav
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
            }`}
            title={isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleAlertClick}
            className={`p-2 rounded-lg transition-all ${
              favorite?.alertPrice
                ? 'bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
            }`}
            title={favorite?.alertPrice ? `Alert bei ${favorite.alertPrice}€` : 'Preis-Alert einrichten'}
          >
            <Bell className={`w-4 h-4 ${favorite?.alertPrice ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex items-start justify-between gap-2 pr-20">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                isBest
                  ? 'bg-emerald-glow/20 text-emerald-glow'
                  : 'bg-white/5 text-white/40'
              }`}
            >
              #{rank}
            </span>
            {isBest && <BestDealBadge />}
          </div>
          <div className="flex items-center gap-3">
            {hasScore && (
              <DealScore
                score={dealScore.score}
                model={dealScore.model}
                benchmark={dealScore.benchmark}
                isBenchmark={isBenchmark}
                pricePerGB={dealScore.pricePerGB}
                ramType={dealScore.ramType}
              />
            )}
          </div>
        </div>

        <h3 className="text-sm font-medium text-white/90 line-clamp-2 leading-relaxed pr-16">
          {item.title}
        </h3>

        {favorite?.alertPrice && (
          <div className="bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg px-3 py-1.5">
            <p className="text-xs text-neon-cyan">
              🔔 Alert bei {favorite.alertPrice.toFixed(2)}€ aktiv
            </p>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className={`text-2xl font-bold font-mono ${isBest ? 'text-emerald-glow' : 'text-neon-cyan'}`}>
              {formatPrice(item.price)}
            </p>
            {item.original && (
              <p className="text-xs text-white/30 mt-0.5">{item.original}</p>
            )}
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/20 text-neon-cyan text-xs font-medium rounded-lg py-2 px-3 transition-all whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Zum Deal
          </a>
        </div>
      </div>

      <AlertDialog
        isOpen={showAlertDialog}
        onClose={() => setShowAlertDialog(false)}
        onSave={handleSaveAlert}
        item={item}
        currentPrice={item.price}
        onOpenSettings={onOpenSettings}
      />
    </>
  )
}
