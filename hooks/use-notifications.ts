'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'

export interface Notification {
  id: string
  type: 'order_status_change' | 'new_order' | 'inventory_alert' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  orderId?: string
  productId?: string
  data?: any
}

export interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAll: () => void
}

export function useNotifications(userId?: string, userRole?: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastCheckRef = useRef<Date | null>(null)
  const POLLING_INTERVAL = 30000 // 30 seconds

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!userId) return

    try {
      setConnectionStatus('connecting')
      
      // Build URL with since parameter for incremental updates
      const url = new URL('/api/notifications/check', window.location.origin)
      if (lastCheckRef.current) {
        url.searchParams.set('since', lastCheckRef.current.toISOString())
      }

      const response = await fetch(url.toString(), {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      
      if (lastCheckRef.current) {
        // Incremental update - add new notifications
        if (data.notifications.length > 0) {
          setNotifications(prev => {
            const newNotifications = data.notifications.filter((newNotif: Notification) => 
              !prev.some(existingNotif => existingNotif.id === newNotif.id)
            )
            
            // Show toast for new notifications
            newNotifications.forEach((notification: Notification) => {
              if (notification.type !== 'system') {
                toast.success(notification.title, {
                  description: notification.message,
                  duration: 5000,
                })
              }
            })
            
            return [...newNotifications, ...prev].slice(0, 50) // Keep last 50
          })
        }
      } else {
        // Initial load - replace all notifications
        setNotifications(data.notifications || [])
      }
      
      setUnreadCount(data.unreadCount || 0)
      setIsConnected(true)
      setConnectionStatus('connected')
      lastCheckRef.current = new Date()
      
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setIsConnected(false)
      setConnectionStatus('error')
    }
  }, [userId])

  // Start polling
  const startPolling = useCallback(() => {
    if (!userId) {
      console.log('No userId provided, cannot start polling')
      return
    }
    
    // Stop any existing polling first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      console.log('Cleared existing polling interval before starting new one')
    }

    // Fetch immediately
    fetchNotifications()

    // Set up polling interval
    pollingIntervalRef.current = setInterval(fetchNotifications, POLLING_INTERVAL)
    
    console.log(`Started notification polling every ${POLLING_INTERVAL/1000}s (interval ID: ${pollingIntervalRef.current})`)
  }, [userId, fetchNotifications])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log(`Stopping notification polling (interval ID: ${pollingIntervalRef.current})`)
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      console.log('Stopped notification polling')
    }
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    // Update local state immediately
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))

    // Update on server
    try {
      await fetch('/api/notifications/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'markAsRead', notificationId: id })
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    // Update local state immediately
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    setUnreadCount(0)

    // Update on server
    try {
      await fetch('/api/notifications/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'markAllAsRead' })
      })
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [])

  const clearNotification = useCallback((id: string) => {
    const notification = notifications.find(n => n.id === id)
    setNotifications(prev => prev.filter(notif => notif.id !== id))
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }, [notifications])

  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  // Start/stop polling when userId changes
  useEffect(() => {
    if (userId) {
      console.log('userId changed, starting polling for:', userId)
      startPolling()
    } else {
      console.log('No userId, stopping polling')
      stopPolling()
    }

    return () => {
      console.log('Cleanup: stopping polling')
      stopPolling()
    }
  }, [userId]) // startPolling과 stopPolling 제거

  // Handle page visibility changes to pause/resume polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Page hidden, stopping polling')
        stopPolling()
      } else if (userId) {
        console.log('Page visible, checking if polling needed')
        // Only restart if not already polling
        if (!pollingIntervalRef.current) {
          console.log('No active polling, restarting')
          startPolling()
        } else {
          console.log('Polling already active, skipping restart')
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [userId]) // startPolling과 stopPolling 제거

  return {
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll
  }
}