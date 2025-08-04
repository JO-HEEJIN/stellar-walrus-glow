// In-memory notification store
// In production, this should be replaced with Redis or database

export interface StoredNotification {
  id: string
  userId: string
  userRole: string
  type: 'order_status_change' | 'new_order' | 'inventory_alert' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  orderId?: string
  productId?: string
  data?: any
}

class NotificationStore {
  private notifications: Map<string, StoredNotification[]> = new Map()
  private notificationTTL = 24 * 60 * 60 * 1000 // 24 hours

  // Add notification for specific user
  addNotification(userId: string, notification: Omit<StoredNotification, 'id' | 'userId' | 'read'>) {
    const newNotification: StoredNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId,
      read: false
    }

    const userNotifications = this.notifications.get(userId) || []
    userNotifications.unshift(newNotification)
    
    // Keep only last 100 notifications per user
    if (userNotifications.length > 100) {
      userNotifications.pop()
    }

    this.notifications.set(userId, userNotifications)
    this.cleanupOldNotifications(userId)

    return newNotification
  }

  // Add notification for multiple users
  addNotificationForUsers(userIds: string[], notification: Omit<StoredNotification, 'id' | 'userId' | 'read'>) {
    return userIds.map(userId => this.addNotification(userId, notification))
  }

  // Add notification for users with specific roles
  addNotificationForRoles(roles: string[], notification: Omit<StoredNotification, 'id' | 'userId' | 'read' | 'userRole'>) {
    const notifications: StoredNotification[] = []
    
    // In production, we would query the database for users with these roles
    // For now, we'll just store with a special key format
    roles.forEach(role => {
      const roleKey = `role:${role}`
      const newNotification: StoredNotification = {
        ...notification,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: roleKey,
        userRole: role,
        read: false
      }

      const roleNotifications = this.notifications.get(roleKey) || []
      roleNotifications.unshift(newNotification)
      
      if (roleNotifications.length > 100) {
        roleNotifications.pop()
      }

      this.notifications.set(roleKey, roleNotifications)
      notifications.push(newNotification)
    })

    return notifications
  }

  // Get notifications for a user (including role-based notifications)
  getNotifications(userId: string, userRole?: string, since?: Date): StoredNotification[] {
    const userNotifications = this.notifications.get(userId) || []
    
    // Also get role-based notifications if role is provided
    let roleNotifications: StoredNotification[] = []
    if (userRole) {
      roleNotifications = this.notifications.get(`role:${userRole}`) || []
    }

    // Combine and sort by timestamp
    let allNotifications = [...userNotifications, ...roleNotifications]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Filter by since date if provided
    if (since) {
      allNotifications = allNotifications.filter(n => 
        new Date(n.timestamp).getTime() > since.getTime()
      )
    }

    // Remove duplicates
    const seen = new Set<string>()
    return allNotifications.filter(n => {
      const key = `${n.type}-${n.orderId || n.productId || n.message}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // Mark notification as read
  markAsRead(userId: string, notificationId: string) {
    const userNotifications = this.notifications.get(userId) || []
    const notification = userNotifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }

    // Also check role-based notifications
    for (const [key, notifications] of this.notifications) {
      if (key.startsWith('role:')) {
        const notification = notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.read = true
          break
        }
      }
    }
  }

  // Mark all notifications as read for a user
  markAllAsRead(userId: string, userRole?: string) {
    const userNotifications = this.notifications.get(userId) || []
    userNotifications.forEach(n => n.read = true)

    if (userRole) {
      const roleNotifications = this.notifications.get(`role:${userRole}`) || []
      roleNotifications.forEach(n => n.read = true)
    }
  }

  // Clean up old notifications
  private cleanupOldNotifications(userId: string) {
    const notifications = this.notifications.get(userId) || []
    const now = Date.now()
    
    const filtered = notifications.filter(n => {
      const timestamp = new Date(n.timestamp).getTime()
      return now - timestamp < this.notificationTTL
    })

    if (filtered.length !== notifications.length) {
      this.notifications.set(userId, filtered)
    }
  }

  // Get unread count
  getUnreadCount(userId: string, userRole?: string): number {
    const notifications = this.getNotifications(userId, userRole)
    return notifications.filter(n => !n.read).length
  }

  // Clear all notifications for a user
  clearUserNotifications(userId: string) {
    this.notifications.delete(userId)
  }
}

// Export singleton instance
export const notificationStore = new NotificationStore()

// Helper functions for creating notifications
export function createOrderStatusNotification(orderId: string, orderNumber: string, status: string, customerEmail: string) {
  return notificationStore.addNotification(customerEmail, {
    type: 'order_status_change',
    title: '주문 상태 변경',
    message: `주문 #${orderNumber}의 상태가 ${getStatusLabel(status)}로 변경되었습니다.`,
    timestamp: new Date().toISOString(),
    orderId,
    userRole: 'BUYER',
    data: { status }
  })
}

export function createNewOrderNotification(orderId: string, orderNumber: string, customerEmail: string) {
  // Notify admins about new order
  return notificationStore.addNotificationForRoles(['MASTER_ADMIN', 'BRAND_ADMIN'], {
    type: 'new_order',
    title: '새로운 주문',
    message: `새로운 주문이 접수되었습니다. (주문번호: #${orderNumber})`,
    timestamp: new Date().toISOString(),
    orderId,
    data: { customerEmail }
  })
}

export function createInventoryAlertNotification(productId: string, productName: string, currentStock: number, threshold: number) {
  return notificationStore.addNotificationForRoles(['MASTER_ADMIN', 'BRAND_ADMIN'], {
    type: 'inventory_alert',
    title: '재고 부족 알림',
    message: `${productName}의 재고가 부족합니다. (현재: ${currentStock}개, 임계값: ${threshold}개)`,
    timestamp: new Date().toISOString(),
    productId,
    data: { productName, currentStock, threshold }
  })
}

function getStatusLabel(status: string): string {
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