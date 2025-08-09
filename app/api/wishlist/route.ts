import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all wishlist items
export async function GET(request: NextRequest) {
  try {
    // Check authentication
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

    // Get all wishlist items for the user
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            brand: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      data: wishlistItems.map(item => ({
        id: item.id,
        productId: item.productId,
        createdAt: item.createdAt,
        product: {
          id: item.product.id,
          name: item.product.nameKo,
          price: Number(item.product.basePrice),
          discountPrice: item.product.discountPrice ? Number(item.product.discountPrice) : undefined,
          discountRate: item.product.discountRate,
          imageUrl: item.product.thumbnailImage || '/placeholder.svg',
          brandName: item.product.brand.nameKo,
          minOrderQty: item.product.minOrderQty
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}