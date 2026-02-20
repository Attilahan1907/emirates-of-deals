import { useState, useEffect } from 'react'
import { X, Settings, Send } from 'lucide-react'
import { useNotificationSettings } from '../hooks/useNotificationSettings.jsx'

export function SettingsDialog({ isOpen, onClose }) {
  const { settings, setTelegramChatId } = useNotificationSettings()
  const [telegram, setTelegram] = useState('')
  const [saved, setSaved] = useState(false)
  const [testState, setTestState] = useState('idle') // idle | loading | success | error
  const [testError, setTestError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTelegram(settings.telegramChatId || '')
      setSaved(false)
      setTestState('idle')
      setTestError('')
    }
  }, [isOpen, settings.telegramChatId])

  const handleTest = async () => {
    const chatId = telegram.trim()
    if (!chatId) return
    setTestState('loading')
    setTestError('')
    try {
      const res = await fetch('/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId }),
      })
      const data = await res.json()
      if (data.success) {
        setTestState('success')
        setTimeout(() => setTestState('idle'), 3000)
      } else {
        setTestState('error')
        setTestError(data.error || 'Unbekannter Fehler')
      }
    } catch {
      setTestState('error')
      setTestError('Server nicht erreichbar')
    }
  }

  if (!isOpen) return null

  const handleSave = () => {
    setTelegramChatId(telegram.trim())
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 max-w-md w-full border border-foreground/10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-neon-cyan" />
            <h3 className="text-lg font-bold text-foreground">Benachrichtigungs-Einstellungen</h3>
          </div>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-foreground/50 mb-5">
          Einmal speichern – wird bei jedem neuen Alarm automatisch eingesetzt.
        </p>

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            Telegram Chat ID
          </label>
          <input
            type="text"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
            placeholder="z.B. 123456789"
            className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-4 py-2 text-foreground placeholder-foreground/30 focus:outline-none focus:border-neon-cyan/50"
          />
          <p className="text-xs text-foreground/40 mt-1">
            Deine ID findest du mit <span className="text-neon-cyan">@userinfobot</span> auf Telegram
          </p>
          <button
            type="button"
            onClick={handleTest}
            disabled={!telegram.trim() || testState === 'loading'}
            className={`mt-3 flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              testState === 'success'
                ? 'bg-green-500/15 border-green-500/40 text-green-400'
                : testState === 'error'
                ? 'bg-red-500/15 border-red-500/40 text-red-400'
                : 'bg-foreground/5 border-foreground/15 text-foreground/50 hover:text-foreground/70 hover:bg-foreground/10'
            }`}
          >
            <Send className="w-3 h-3" />
            {testState === 'loading' ? 'Wird gesendet…' : testState === 'success' ? 'Nachricht gesendet ✓' : testState === 'error' ? 'Fehlgeschlagen' : 'Testnachricht senden'}
          </button>
          {testState === 'error' && testError && (
            <p className="text-xs text-red-400/70 mt-1">{testError}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-lg text-foreground/70 transition-all"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all border ${
              saved
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : 'bg-neon-cyan/20 hover:bg-neon-cyan/30 border-neon-cyan/50 text-neon-cyan'
            }`}
          >
            {saved ? 'Gespeichert ✓' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
