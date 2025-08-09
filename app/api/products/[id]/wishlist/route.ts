import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication using JWT token from cookie
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let user;
    try {
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      user = await prisma.user.findFirst({
        where: { email: `${decoded.username}@kfashion.com` }
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Add to wishlist (upsert to handle duplicates)
    await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: params.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        productId: params.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication using JWT token from cookie
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let user;
    try {
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      user = await prisma.user.findFirst({
        where: { email: `${decoded.username}@kfashion.com` }
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Remove from wishlist
    await prisma.wishlist.deleteMany({
      where: {
        userId: user.id,
        productId: params.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}