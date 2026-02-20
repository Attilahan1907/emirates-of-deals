import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NotificationSettingsProvider } from './hooks/useNotificationSettings.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationSettingsProvider>
      <App />
    </NotificationSettingsProvider>
  </StrictMode>,
)
