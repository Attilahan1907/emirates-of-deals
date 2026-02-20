import { useState } from 'react'
import { X, Bell, Settings } from 'lucide-react'
import { useNotificationSettings } from '../hooks/useNotificationSettings.jsx'

export function AlertDialog({ isOpen, onClose, onSave, item, currentPrice, onOpenSettings }) {
  const [alertPrice, setAlertPrice] = useState('')
  const [error, setError] = useState('')
  const { settings } = useNotificationSettings()

  const handleClose = () => {
    setAlertPrice('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!settings.telegramChatId) {
      setError('Bitte zuerst die Telegram Chat ID im ⚙️ Einstellungen speichern.')
      return
    }

    const price = parseFloat(alertPrice)
    if (isNaN(price) || price <= 0) {
      setError('Bitte einen gültigen Preis eingeben.')
      return
    }

    if (price >= currentPrice) {
      setError(`Alert-Preis muss unter dem aktuellen Preis (${currentPrice.toFixed(2)}€) liegen.`)
      return
    }

    try {
      await onSave({
        alertPrice: price,
        notificationMethod: 'telegram',
        contactInfo: settings.telegramChatId,
      })
      handleClose()
    } catch (err) {
      setError('Fehler beim Speichern. Bitte erneut versuchen.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 max-w-md w-full border border-foreground/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-neon-cyan" />
            <h3 className="text-lg font-bold text-foreground">Preis-Alert einrichten</h3>
          </div>
          <button onClick={handleClose} className="text-foreground/40 hover:text-foreground/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-foreground/5 rounded-lg">
          <p className="text-xs text-foreground/50 mb-1">Produkt</p>
          <p className="text-sm text-foreground/90 line-clamp-2">{item.title}</p>
          <p className="text-xs text-neon-cyan mt-1">Aktueller Preis: {currentPrice.toFixed(2)}€</p>
        </div>

        {settings.telegramChatId ? (
          <div className="mb-4 flex items-center gap-2 p-2 bg-foreground/5 rounded-lg">
            <span className="text-xs text-foreground/40">Telegram:</span>
            <span className="text-xs text-neon-cyan font-mono">{settings.telegramChatId}</span>
            <button
              type="button"
              onClick={() => { handleClose(); onOpenSettings() }}
              className="ml-auto text-foreground/30 hover:text-foreground/60 transition-colors"
              title="Einstellungen öffnen"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-400">
              Keine Telegram Chat ID hinterlegt.{' '}
              <button
                type="button"
                onClick={() => { handleClose(); onOpenSettings() }}
                className="underline hover:text-yellow-300"
              >
                Jetzt in Einstellungen setzen ⚙️
              </button>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-2">
              Alert bei Preis unter (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={alertPrice}
              onChange={(e) => setAlertPrice(e.target.value)}
              placeholder="z.B. 299.99"
              className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-4 py-2 text-foreground placeholder-foreground/30 focus:outline-none focus:border-neon-cyan/50"
              required
            />
            <p className="text-xs text-foreground/40 mt-1">
              Du bekommst eine Telegram-Nachricht, wenn der Preis darunter fällt.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 px-4 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-lg text-foreground/70 transition-all"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/50 text-neon-cyan rounded-lg font-medium transition-all"
            >
              Alert speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
