import { useState } from 'react'
import { X, Search, Settings } from 'lucide-react'
import { useNotificationSettings } from '../hooks/useNotificationSettings.jsx'
import { createSearchAlert } from '../api/searchAlerts'

export function SearchAlertDialog({ isOpen, onClose, query, onOpenSettings }) {
  const [maxPrice, setMaxPrice] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const { settings } = useNotificationSettings()

  const handleClose = () => {
    setMaxPrice('')
    setError('')
    setSaved(false)
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

    const price = parseFloat(maxPrice)
    if (isNaN(price) || price <= 0) {
      setError('Bitte einen gültigen Maximalpreis eingeben.')
      return
    }

    try {
      await createSearchAlert({
        query,
        max_price: price,
        contact_info: settings.telegramChatId,
      })
      setSaved(true)
      setTimeout(handleClose, 800)
    } catch (err) {
      setError('Fehler beim Speichern. Bitte erneut versuchen.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 max-w-md w-full border border-foreground/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-neon-cyan" />
            <h3 className="text-lg font-bold text-foreground">Suchalarm einrichten</h3>
          </div>
          <button onClick={handleClose} className="text-foreground/40 hover:text-foreground/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-foreground/5 rounded-lg">
          <p className="text-xs text-foreground/50 mb-1">Suche</p>
          <p className="text-sm text-foreground/90 font-medium">"{query}"</p>
          <p className="text-xs text-foreground/40 mt-1">Du wirst benachrichtigt wenn eine neue Anzeige erscheint</p>
        </div>

        {settings.telegramChatId ? (
          <div className="mb-4 flex items-center gap-2 p-2 bg-foreground/5 rounded-lg">
            <span className="text-xs text-foreground/40">Telegram:</span>
            <span className="text-xs text-neon-cyan font-mono">{settings.telegramChatId}</span>
            <button
              type="button"
              onClick={() => { handleClose(); onOpenSettings() }}
              className="ml-auto text-foreground/30 hover:text-foreground/60 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-400">
              Keine Telegram Chat ID hinterlegt.{' '}
              <button type="button" onClick={() => { handleClose(); onOpenSettings() }} className="underline hover:text-yellow-300">
                Jetzt setzen ⚙️
              </button>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-2">
              Maximalpreis (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="z.B. 300"
              className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-4 py-2 text-foreground placeholder-foreground/30 focus:outline-none focus:border-neon-cyan/50"
              required
            />
            <p className="text-xs text-foreground/40 mt-1">
              Nur Anzeigen unter diesem Preis lösen eine Benachrichtigung aus
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose}
              className="flex-1 py-2 px-4 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-lg text-foreground/70 transition-all">
              Abbrechen
            </button>
            <button type="submit"
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all border ${
                saved
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-neon-cyan/20 hover:bg-neon-cyan/30 border-neon-cyan/50 text-neon-cyan'
              }`}>
              {saved ? 'Gespeichert ✓' : 'Alarm speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
