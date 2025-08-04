import { NextRequest, NextResponse } from 'next/server'
import { notificationStore } from '@/lib/notification-store'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Get authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ 
        notifications: [],
        unreadCount: 0 
      })
    }

    // Verify token and get user info
    let userInfo
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userInfo = decoded
    } catch (error) {
      return NextResponse.json({ 
        notifications: [],
        unreadCount: 0 
      })
    }

    // Get since parameter if provided
    const since = request.nextUrl.searchParams.get('since')
    const sinceDate = since ? new Date(since) : undefined

    // Get notifications for the user
    const notifications = notificationStore.getNotifications(
      userInfo.email || userInfo.username,
      userInfo.role,
      sinceDate
    )

    const unreadCount = notificationStore.getUnreadCount(
      userInfo.email || userInfo.username,
      userInfo.role
    )

    return NextResponse.json({
      notifications,
      unreadCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error checking notifications:', error)
    return NextResponse.json({ 
      notifications: [],
      unreadCount: 0,
      error: 'Failed to check notifications' 
    }, { status: 500 })
  }
}

// Mark notification as read
export async function POST(request: NextRequest) {
  try {
    // Get authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token and get user info
    let userInfo
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userInfo = decoded
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { action, notificationId } = body

    const userId = userInfo.email || userInfo.username

    if (action === 'markAsRead' && notificationId) {
      notificationStore.markAsRead(userId, notificationId)
    } else if (action === 'markAllAsRead') {
      notificationStore.markAllAsRead(userId, userInfo.role)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ 
      error: 'Failed to update notification' 
    }, { status: 500 })
  }
}