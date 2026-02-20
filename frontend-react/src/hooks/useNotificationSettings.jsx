import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const STORAGE_KEY = 'emirates-of-deals_notification_settings'

export const NotificationSettingsContext = createContext(null)

export function NotificationSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    telegramChatId: '',
    whatsappNumber: '',
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {}
  }, [settings])

  const setTelegramChatId = useCallback((chatId) => {
    setSettings((prev) => ({ ...prev, telegramChatId: chatId }))
  }, [])

  const setWhatsappNumber = useCallback((number) => {
    setSettings((prev) => ({ ...prev, whatsappNumber: number }))
  }, [])

  return (
    <NotificationSettingsContext.Provider value={{ settings, setTelegramChatId, setWhatsappNumber }}>
      {children}
    </NotificationSettingsContext.Provider>
  )
}

export function useNotificationSettings() {
  const ctx = useContext(NotificationSettingsContext)
  if (!ctx) throw new Error('useNotificationSettings must be used within NotificationSettingsProvider')
  return ctx
}
