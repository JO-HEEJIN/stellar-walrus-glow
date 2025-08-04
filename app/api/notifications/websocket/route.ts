import { NextRequest } from 'next/server'
import { WebSocketServer } from 'ws'

interface ExtendedWebSocket extends WebSocket {
  userId?: string
  userRole?: string
  isAlive?: boolean
}

class NotificationWebSocketManager {
  private static instance: NotificationWebSocketManager
  private wss: WebSocketServer | null = null
  private clients: Map<string, ExtendedWebSocket> = new Map()

  static getInstance(): NotificationWebSocketManager {
    if (!NotificationWebSocketManager.instance) {
      NotificationWebSocketManager.instance = new NotificationWebSocketManager()
    }
    return NotificationWebSocketManager.instance
  }

  initialize(server: any) {
    if (this.wss) return

    this.wss = new WebSocketServer({ 
      port: 8080,
      path: '/api/notifications/websocket'
    })

    this.wss.on('connection', (ws: ExtendedWebSocket, request) => {
      console.log('New WebSocket connection established')
      
      // Extract user info from query params or headers
      const url = new URL(request.url || '', `http://${request.headers.host}`)
      const userId = url.searchParams.get('userId')
      const userRole = url.searchParams.get('userRole')

      if (userId) {
        ws.userId = userId
        ws.userRole = userRole || 'BUYER'
        ws.isAlive = true
        this.clients.set(userId, ws)
        
        console.log(`User ${userId} connected with role ${ws.userRole}`)
      }

      // Ping-pong for connection health check
      ws.on('pong', () => {
        ws.isAlive = true
      })

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(ws, message)
        } catch (error) {
          console.error('Invalid message format:', error)
        }
      })

      ws.on('close', () => {
        if (ws.userId) {
          this.clients.delete(ws.userId)
          console.log(`User ${ws.userId} disconnected`)
        }
      })

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
      })

      // Send welcome message
      this.sendToClient(ws, {
        type: 'connection',
        message: '실시간 알림 서비스에 연결되었습니다.',
        timestamp: new Date().toISOString()
      })
    })

    // Health check interval
    setInterval(() => {
      this.wss?.clients.forEach((ws: ExtendedWebSocket) => {
        if (!ws.isAlive) {
          ws.terminate()
          if (ws.userId) {
            this.clients.delete(ws.userId)
          }
          return
        }
        
        ws.isAlive = false
        ws.ping()
      })
    }, 30000) // 30 seconds
  }

  private handleMessage(ws: ExtendedWebSocket, message: any) {
    switch (message.type) {
      case 'ping':
        this.sendToClient(ws, { type: 'pong', timestamp: new Date().toISOString() })
        break
      case 'subscribe':
        // Handle subscription to specific notification types
        console.log(`User ${ws.userId} subscribed to ${message.channels}`)
        break
      default:
        console.log('Unknown message type:', message.type)
    }
  }

  private sendToClient(ws: ExtendedWebSocket, data: any) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data))
    }
  }

  // Public methods for sending notifications
  sendOrderNotification(orderId: string, status: string, userIds: string[]) {
    const notification = {
      type: 'order_status_change',
      orderId,
      status,
      message: `주문 #${orderId}의 상태가 ${this.getStatusLabel(status)}로 변경되었습니다.`,
      timestamp: new Date().toISOString()
    }

    userIds.forEach(userId => {
      const client = this.clients.get(userId)
      if (client) {
        this.sendToClient(client, notification)
      }
    })
  }

  sendNewOrderNotification(orderId: string, customerEmail: string) {
    const notification = {
      type: 'new_order',
      orderId,
      customerEmail,
      message: `새로운 주문이 접수되었습니다. (주문번호: #${orderId})`,
      timestamp: new Date().toISOString()
    }

    // Send to all admins and brand admins
    this.clients.forEach((client, userId) => {
      if (client.userRole === 'MASTER_ADMIN' || client.userRole === 'BRAND_ADMIN') {
        this.sendToClient(client, notification)
      }
    })
  }

  sendInventoryAlert(productId: string, productName: string, currentStock: number, threshold: number) {
    const notification = {
      type: 'inventory_alert',
      productId,
      productName,
      currentStock,
      threshold,
      message: `${productName}의 재고가 부족합니다. (현재: ${currentStock}개, 임계값: ${threshold}개)`,
      timestamp: new Date().toISOString()
    }

    // Send to all admins and brand admins
    this.clients.forEach((client, userId) => {
      if (client.userRole === 'MASTER_ADMIN' || client.userRole === 'BRAND_ADMIN') {
        this.sendToClient(client, notification)
      }
    })
  }

  private getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      PENDING: '결제 대기',
      PAID: '결제 완료',
      PREPARING: '상품 준비중',
      SHIPPED: '배송중',
      DELIVERED: '배송 완료',
      CANCELLED: '취소됨'
    }
    return statusLabels[status] || status
  }

  getConnectedClients(): number {
    return this.clients.size
  }

  getClientsByRole(role: string): number {
    let count = 0
    this.clients.forEach(client => {
      if (client.userRole === role) count++
    })
    return count
  }
}

// Export the singleton instance
export const notificationManager = NotificationWebSocketManager.getInstance()

// HTTP endpoints for WebSocket info
export async function GET() {
  return Response.json({
    status: 'WebSocket server running',
    connectedClients: notificationManager.getConnectedClients(),
    clientsByRole: {
      MASTER_ADMIN: notificationManager.getClientsByRole('MASTER_ADMIN'),
      BRAND_ADMIN: notificationManager.getClientsByRole('BRAND_ADMIN'),
      BUYER: notificationManager.getClientsByRole('BUYER')
    }
  })
}

// Initialize WebSocket server (this will be called when the API route is first accessed)
if (typeof window === 'undefined') {
  // Only run on server side
  try {
    notificationManager.initialize(null)
  } catch (error) {
    console.error('Failed to initialize WebSocket server:', error)
  }
}