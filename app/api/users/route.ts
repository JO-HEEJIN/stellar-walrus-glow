import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Authentication removed for now
    // TODO: Add proper authentication when auth system is set up

    // Role permission checks removed for now
    // TODO: Add proper role-based permission checks when auth system is set up

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role') || 'all'

    // Mock users data
    const mockUsers = [
      {
        id: '1',
        email: 'master@kfashion.com',
        name: 'Master Admin',
        role: 'MASTER_ADMIN',
        status: 'ACTIVE',
        createdAt: new Date('2024-01-01').toISOString(),
      },
      {
        id: '2',
        email: 'brand@kfashion.com',
        name: 'Brand Admin',
        role: 'BRAND_ADMIN',
        brandId: 'brand1',
        status: 'ACTIVE',
        createdAt: new Date('2024-01-15').toISOString(),
      },
      {
        id: '3',
        email: 'buyer@kfashion.com',
        name: 'Test Buyer',
        role: 'BUYER',
        status: 'ACTIVE',
        createdAt: new Date('2024-02-01').toISOString(),
      },
    ]

    // Filter by role if specified
    const users = role === 'all' 
      ? mockUsers 
      : mockUsers.filter(user => user.role === role)

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Authentication removed for now
    // TODO: Add proper authentication when auth system is set up

    // Role permission checks removed for now
    // TODO: Add proper role-based permission checks when auth system is set up

    // Parse request body
    const body = await request.json()
    const { userId, updates } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate allowed updates
    const allowedUpdates = ['role', 'status', 'brandId']
    const updateKeys = Object.keys(updates)
    const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key))

    if (!isValidUpdate) {
      return NextResponse.json(
        { error: 'Invalid update fields' },
        { status: 400 }
      )
    }

    // Mock updated user
    const mockUpdatedUser = {
      id: userId,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system', // TODO: Replace with actual user ID when auth is set up
    }

    return NextResponse.json(mockUpdatedUser)
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}