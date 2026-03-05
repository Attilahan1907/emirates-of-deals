import { useState } from 'react'
import { ExternalLink, Heart, Bell, MapPin, Clock } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'
import { BestDealBadge } from './BestDealBadge'
import { DealScore } from './DealScore'
import { AlertDialog } from './AlertDialog'
import { PriceHistoryChart } from './PriceHistoryChart'
import { useFavorites } from '../hooks/useFavorites'

export function ProductCard({ item, rank, isBest, allPrices, dealScore, isBenchmark, onOpenSettings, showImages, onItemClick }) {
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
        onClick={() => onItemClick?.(item)}
        className={`group relative glass rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:bg-foreground/5 hover:border-foreground/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] active:scale-[0.99] active:shadow-none cursor-pointer ${
          isBest ? 'animate-pulse-glow border-emerald-glow/30' : ''
        }`}
      >
        {/* Produktbild */}
        {showImages && item.image && (
          <div className="w-full h-40 rounded-xl overflow-hidden bg-foreground/5 -mx-0">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
        )}

        {/* Favorite and Alert buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={handleFavoriteClick}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              isFav
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                : 'bg-foreground/5 text-foreground/35 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent'
            }`}
            title={isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleAlertClick}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              favorite?.alertPrice
                ? 'bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                : 'bg-foreground/5 text-foreground/35 hover:bg-neon-cyan/10 hover:text-neon-cyan border border-transparent hover:border-neon-cyan/20'
            }`}
            title={favorite?.alertPrice ? `Alert bei ${favorite.alertPrice}€` : 'Preis-Alert einrichten'}
          >
            <Bell className={`w-4 h-4 ${favorite?.alertPrice ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex items-start justify-between gap-2 pr-24">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                isBest
                  ? 'bg-emerald-glow/20 text-emerald-glow'
                  : 'bg-foreground/5 text-foreground/40'
              }`}
            >
              #{rank}
            </span>
            {isBest && <BestDealBadge />}
            {item.source === 'ebay' ? (
              <span className="text-[9px] font-semibold bg-amber-400/15 text-amber-400 border border-amber-400/20 rounded-full px-2 py-0.5">
                eBay
              </span>
            ) : (
              <span className="text-[9px] font-semibold bg-emerald-400/10 text-emerald-400/70 border border-emerald-400/15 rounded-full px-2 py-0.5">
                Kleinanzeigen
              </span>
            )}
            <PriceHistoryChart url={item.url} />
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

        <h3 className="text-sm font-medium text-foreground/90 line-clamp-2 leading-relaxed pr-16">
          {item.title}
        </h3>

        {(item.location || item.date) && (
          <div className="flex items-center gap-3 text-[10px] text-foreground/40">
            {item.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {item.location}
              </span>
            )}
            {item.date && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.date}
              </span>
            )}
          </div>
        )}

        {/* Preis-Leistungs-Anzeige — nur bei Benchmark-Kategorien (GPU/CPU/RAM/Smartphone) */}
        {isBenchmark && hasScore && dealScore?.model && (
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px]"
            style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.12)' }}
          >
            <span className="text-muted-foreground shrink-0">Erkannt:</span>
            <span className="font-semibold text-primary/90 truncate">{dealScore.model}</span>
            {dealScore.benchmark && (
              <span className="text-muted-foreground shrink-0 ml-auto whitespace-nowrap">
                {Number(dealScore.benchmark).toLocaleString('de-DE')} Pkt.
              </span>
            )}
          </div>
        )}

        {favorite?.alertPrice && (
          <div className="bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg px-3 py-1.5">
            <p className="text-xs text-neon-cyan">
              🔔 Alert bei {favorite.alertPrice.toFixed(2)}€ aktiv
            </p>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className={`text-2xl font-bold font-mono transition-all ${isBest ? 'text-emerald-glow drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-neon-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]'}`}>
              {formatPrice(item.price)}
            </p>
            {item.original && (
              <p className="text-xs text-foreground/30 mt-0.5">{item.original}</p>
            )}
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center gap-1.5 text-xs font-semibold rounded-xl py-2 px-3.5 transition-all duration-200 whitespace-nowrap border ${
              isBest
                ? 'bg-[rgba(245,158,11,0.12)] hover:bg-[rgba(245,158,11,0.2)] border-[rgba(245,158,11,0.25)] text-[#f59e0b] hover:shadow-[0_4px_14px_rgba(245,158,11,0.25)] hover:-translate-y-0.5'
                : 'bg-neon-cyan/10 hover:bg-neon-cyan/20 border-neon-cyan/20 text-neon-cyan hover:shadow-[0_4px_14px_rgba(0,229,255,0.2)] hover:-translate-y-0.5'
            }`}
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
