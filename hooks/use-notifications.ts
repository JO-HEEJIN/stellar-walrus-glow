'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'

export interface Notification {
  id: string
  type: 'order_status_change' | 'new_order' | 'inventory_alert' | 'connection' | 'system'
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
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Keep last 50 notifications

    // Show toast notification for important types
    if (notification.type !== 'connection' && notification.type !== 'system') {
      toast.success(notification.title, {
        description: notification.message,
        duration: 5000,
      })
    }
  }, [])

  const connect = useCallback(() => {
    if (!userId || wsRef.current?.readyState === WebSocket.OPEN) return

    setConnectionStatus('connecting')
    
    try {
      // Use different URL for development vs production
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? `ws://localhost:8080/api/notifications/websocket?userId=${userId}&userRole=${userRole}`
        : `wss://${window.location.host}/api/notifications/websocket?userId=${userId}&userRole=${userRole}`

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        
        // Send ping to keep connection alive
        ws.send(JSON.stringify({ type: 'ping' }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'connection':
              addNotification({
                type: 'system',
                title: '연결됨',
                message: data.message,
                timestamp: data.timestamp
              })
              break
              
            case 'order_status_change':
              addNotification({
                type: 'order_status_change',
                title: '주문 상태 변경',
                message: data.message,
                timestamp: data.timestamp,
                orderId: data.orderId,
                data: { status: data.status }
              })
              break
              
            case 'new_order':
              addNotification({
                type: 'new_order',
                title: '새로운 주문',
                message: data.message,
                timestamp: data.timestamp,
                orderId: data.orderId,
                data: { customerEmail: data.customerEmail }
              })
              break
              
            case 'inventory_alert':
              addNotification({
                type: 'inventory_alert',
                title: '재고 부족 알림',
                message: data.message,
                timestamp: data.timestamp,
                productId: data.productId,
                data: { 
                  productName: data.productName,
                  currentStock: data.currentStock,
                  threshold: data.threshold
                }
              })
              break
              
            case 'pong':
              // Keep alive response
              break
              
            default:
              console.log('Unknown notification type:', data.type)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        wsRef.current = null

        // Attempt to reconnect if it wasn't a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000) // Exponential backoff, max 30s
          reconnectAttempts.current++
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`)
            connect()
          }, delay)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionStatus('error')
          addNotification({
            type: 'system',
            title: '연결 오류',
            message: '실시간 알림 서버에 연결할 수 없습니다. 페이지를 새로고침해 주세요.',
            timestamp: new Date().toISOString()
          })
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
      }

      // Send periodic pings to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        } else {
          clearInterval(pingInterval)
        }
      }, 30000) // 30 seconds

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionStatus('error')
    }
  }, [userId, userRole, addNotification])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }
    
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }, [])

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Connect when userId is available
  useEffect(() => {
    if (userId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [userId, connect, disconnect])

  // Calculate unread count
  const unreadCount = notifications.filter(notif => !notif.read).length

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