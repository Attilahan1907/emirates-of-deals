import { useState, useEffect, useCallback } from 'react'
import { createAlert, deleteAlert } from '../api/alerts'

const STORAGE_KEY = 'emirates-of-deals_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Error loading favorites:', err)
    }
  }, [])

  // Save to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch (err) {
      console.error('Error saving favorites:', err)
    }
  }, [favorites])

  const addFavorite = useCallback(async (item, alertPrice = null, notificationMethod = null, contactInfo = null) => {
    const favorite = {
      id: `${item.url}-${Date.now()}`,
      ...item,
      addedAt: new Date().toISOString(),
      alertPrice: alertPrice,
      notificationMethod: notificationMethod, // 'whatsapp' or 'telegram'
      contactInfo: contactInfo, // phone number or telegram chat_id
      lastCheckedPrice: item.price,
      lastCheckedAt: new Date().toISOString(),
      backendAlertId: null
    }
    
    // If alert is set, create backend alert
    if (alertPrice && notificationMethod && contactInfo) {
      try {
        const result = await createAlert({
          url: item.url,
          title: item.title,
          current_price: item.price,
          alert_price: alertPrice,
          notification_method: notificationMethod,
          contact_info: contactInfo
        })
        if (result && result.alert_id) {
          favorite.backendAlertId = result.alert_id
        }
      } catch (err) {
        console.error('Error creating backend alert:', err)
        // Continue anyway - favorite is saved locally
        // User will still see the alert in the UI, but backend monitoring might not work
      }
    }
    
    setFavorites(prev => {
      // Check if already exists (by URL)
      const exists = prev.find(f => f.url === item.url)
      if (exists) {
        // Update existing favorite
        return prev.map(f => f.url === item.url ? favorite : f)
      }
      return [...prev, favorite]
    })
    
    return favorite.id
  }, [])

  const removeFavorite = useCallback(async (id) => {
    setFavorites(prev => {
      const favorite = prev.find(f => f.id === id)
      
      // If it has a backend alert, delete it
      if (favorite?.backendAlertId) {
        deleteAlert(favorite.backendAlertId).catch(err => {
          console.error('Error deleting backend alert:', err)
        })
      }
      
      return prev.filter(f => f.id !== id)
    })
  }, [])

  const updateFavorite = useCallback((id, updates) => {
    setFavorites(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ))
  }, [])

  const isFavorite = useCallback((url) => {
    return favorites.some(f => f.url === url)
  }, [favorites])

  const getFavorite = useCallback((url) => {
    return favorites.find(f => f.url === url)
  }, [favorites])

  return {
    favorites,
    addFavorite,
    removeFavorite,
    updateFavorite,
    isFavorite,
    getFavorite
  }
}
