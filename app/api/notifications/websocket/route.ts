// WebSocket notifications have been replaced with polling-based notifications
// This endpoint now returns information about the notification system

export async function GET() {
  return Response.json({
    status: 'Polling-based notification system active',
    message: 'WebSocket has been replaced with polling for better compatibility with Next.js App Router',
    pollingInterval: '30 seconds',
    endpoints: {
      check: '/api/notifications/check',
      markRead: 'POST /api/notifications/check'
    }
  })
}