import { useState, useEffect } from 'react'
import { X, Bell, Search, Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import { getAlerts, deleteAlert, checkAlerts } from '../api/alerts'
import { getSearchAlerts, deleteSearchAlert } from '../api/searchAlerts'

export function AlertsListDialog({ isOpen, onClose }) {
  const [alerts, setAlerts] = useState([])
  const [searchAlerts, setSearchAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('price')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [priceData, searchData] = await Promise.all([getAlerts(), getSearchAlerts()])
      setAlerts(priceData.alerts || [])
      setSearchAlerts(searchData.alerts || [])
    } catch (e) {
      setError('Alerts konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) load()
  }, [isOpen])

  if (!isOpen) return null

  const handleDeletePrice = async (alertId) => {
    try {
      await deleteAlert(alertId)
      setAlerts((prev) => prev.filter((a) => a.id !== alertId))
    } catch (e) {
      setError('Löschen fehlgeschlagen.')
    }
  }

  const handleDeleteSearch = async (alertId) => {
    try {
      await deleteSearchAlert(alertId)
      setSearchAlerts((prev) => prev.filter((a) => a.id !== alertId))
    } catch (e) {
      setError('Löschen fehlgeschlagen.')
    }
  }

  const handleCheck = async () => {
    setChecking(true)
    try {
      await checkAlerts()
      await load()
    } catch (e) {
      setError('Prüfung fehlgeschlagen.')
    } finally {
      setChecking(false)
    }
  }

  const active = alerts.filter((a) => !a.triggered)
  const triggered = alerts.filter((a) => a.triggered)
  const totalCount = active.length + searchAlerts.length

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 max-w-lg w-full border border-foreground/10 max-h-[80vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-neon-cyan" />
            <h3 className="text-lg font-bold text-foreground">Meine Alerts</h3>
            {totalCount > 0 && (
              <span className="bg-neon-cyan/20 text-neon-cyan text-xs font-bold px-2 py-0.5 rounded-full">
                {totalCount} aktiv
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCheck}
              disabled={checking}
              className="flex items-center gap-1.5 text-xs bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-lg px-3 py-1.5 text-foreground/60 hover:text-foreground transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              Jetzt prüfen
            </button>
            <button onClick={onClose} className="text-foreground/40 hover:text-foreground/60 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('price')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${
              tab === 'price'
                ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
                : 'bg-foreground/5 border-foreground/10 text-foreground/50 hover:text-foreground/70'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Preisalarme
            {active.length > 0 && <span className="bg-foreground/15 text-xs px-1.5 rounded-full">{active.length}</span>}
          </button>
          <button
            onClick={() => setTab('search')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${
              tab === 'search'
                ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
                : 'bg-foreground/5 border-foreground/10 text-foreground/50 hover:text-foreground/70'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Suchalarme
            {searchAlerts.length > 0 && <span className="bg-foreground/15 text-xs px-1.5 rounded-full">{searchAlerts.length}</span>}
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {loading && <p className="text-foreground/40 text-sm text-center py-8">Lade Alerts...</p>}

          {/* Preisalarme */}
          {!loading && tab === 'price' && (
            <>
              {alerts.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="w-10 h-10 text-foreground/15 mx-auto mb-2" />
                  <p className="text-foreground/40 text-sm">Noch keine Preisalarme.</p>
                  <p className="text-foreground/25 text-xs mt-1">Klick auf 🔔 bei einem Produkt.</p>
                </div>
              )}
              {active.length > 0 && (
                <div>
                  <p className="text-xs text-foreground/40 uppercase tracking-wider mb-2">Aktiv</p>
                  <div className="space-y-2">
                    {active.map((a) => <PriceAlertRow key={a.id} alert={a} onDelete={handleDeletePrice} />)}
                  </div>
                </div>
              )}
              {triggered.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-foreground/40 uppercase tracking-wider mb-2">Ausgelöst</p>
                  <div className="space-y-2">
                    {triggered.map((a) => <PriceAlertRow key={a.id} alert={a} onDelete={handleDeletePrice} triggered />)}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Suchalarme */}
          {!loading && tab === 'search' && (
            <>
              {searchAlerts.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-10 h-10 text-foreground/15 mx-auto mb-2" />
                  <p className="text-foreground/40 text-sm">Noch keine Suchalarme.</p>
                  <p className="text-foreground/25 text-xs mt-1">Nach etwas suchen → "Suchalarm" klicken.</p>
                </div>
              )}
              <div className="space-y-2">
                {searchAlerts.map((a) => <SearchAlertRow key={a.id} alert={a} onDelete={handleDeleteSearch} />)}
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        </div>
      </div>
    </div>
  )
}

function PriceAlertRow({ alert, onDelete, triggered }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${triggered ? 'bg-green-500/5 border-green-500/20' : 'bg-foreground/5 border-foreground/10'}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground/80 truncate">{alert.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {triggered ? (
            <span className="text-xs text-green-400">✓ Ausgelöst bei {alert.triggered_price?.toFixed(2)}€</span>
          ) : (
            <>
              <span className="text-xs text-foreground/40">Aktuell: <span className="text-foreground/60">{alert.current_price?.toFixed(2)}€</span></span>
              <span className="text-xs text-foreground/20">→</span>
              <span className="text-xs text-neon-cyan">Alert: {alert.alert_price?.toFixed(2)}€</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <a href={alert.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-foreground/30 hover:text-foreground/60 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <button onClick={() => onDelete(alert.id)} className="p-1.5 text-foreground/30 hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function SearchAlertRow({ alert, onDelete }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-foreground/5 border-foreground/10">
      <Search className="w-4 h-4 text-neon-cyan shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground/80 font-medium">"{alert.query}"</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-neon-cyan">unter {alert.max_price?.toFixed(2)}€</span>
          <span className="text-xs text-foreground/30">· {alert.seen_urls?.length || 0} bereits gesehen</span>
        </div>
      </div>
      <button onClick={() => onDelete(alert.id)} className="p-1.5 text-foreground/30 hover:text-red-400 transition-colors shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
