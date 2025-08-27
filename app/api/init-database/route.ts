import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/adapter'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    
    // Create tables with simplified structure
    const createTableQueries = [
      // Brand table
      `CREATE TABLE IF NOT EXISTS Brand (
        id VARCHAR(255) PRIMARY KEY,
        nameKo VARCHAR(255) NOT NULL,
        nameCn VARCHAR(255),
        slug VARCHAR(255) UNIQUE,
        description TEXT,
        logoUrl VARCHAR(500),
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // Category table  
      `CREATE TABLE IF NOT EXISTS Category (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        nameEn VARCHAR(255),
        icon VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // User table
      `CREATE TABLE IF NOT EXISTS User (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('BUYER', 'BRAND_ADMIN', 'MASTER_ADMIN') DEFAULT 'BUYER',
        cognitoId VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // Product table
      `CREATE TABLE IF NOT EXISTS Product (
        id VARCHAR(255) PRIMARY KEY,
        brandId VARCHAR(255),
        sku VARCHAR(255) UNIQUE NOT NULL,
        nameKo VARCHAR(255) NOT NULL,
        nameCn VARCHAR(255),
        descriptionKo TEXT,
        descriptionCn TEXT,
        categoryId VARCHAR(255),
        status ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK') DEFAULT 'ACTIVE',
        basePrice DECIMAL(10, 2) NOT NULL,
        inventory INT DEFAULT 0,
        thumbnailImage VARCHAR(500),
        images JSON,
        options JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        careInstructions TEXT,
        discountPrice DECIMAL(10, 2),
        discountRate INT DEFAULT 0,
        features JSON,
        FOREIGN KEY (brandId) REFERENCES Brand(id),
        FOREIGN KEY (categoryId) REFERENCES Category(id)
      )`,
      
      // Order table (Order is reserved word, use backticks)
      `CREATE TABLE IF NOT EXISTS \\`Order\\` (
        id VARCHAR(255) PRIMARY KEY,
        orderNumber VARCHAR(255) UNIQUE,
        userId VARCHAR(255),
        status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
        totalAmount DECIMAL(10, 2) NOT NULL,
        shippingAddress JSON,
        paymentMethod VARCHAR(255),
        paymentInfo JSON,
        memo TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES User(id)
      )`,
      
      // OrderItem table
      `CREATE TABLE IF NOT EXISTS OrderItem (
        id VARCHAR(255) PRIMARY KEY,
        orderId VARCHAR(255),
        productId VARCHAR(255),
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        options JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orderId) REFERENCES \\`Order\\`(id),
        FOREIGN KEY (productId) REFERENCES Product(id)
      )`
    ]
    
    const results = []
    for (const query of createTableQueries) {
      try {
        await db.rawQuery(query, [])
        results.push({ query: query.substring(0, 50) + '...', status: 'success' })
      } catch (error) {
        results.push({ 
          query: query.substring(0, 50) + '...', 
          status: 'error', 
          error: error instanceof Error ? error.message : String(error) 
        })
      }
    }
    
    // Insert basic brand and category data
    await db.rawQuery(`INSERT IGNORE INTO Brand (id, nameKo, slug, isActive) VALUES 
      ('BRAND_001', 'K-Fashion Seoul', 'k-fashion-seoul', TRUE),
      ('BRAND_002', 'Modern Korean', 'modern-korean', TRUE)`, [])
      
    await db.rawQuery(`INSERT IGNORE INTO Category (id, name, nameEn) VALUES 
      ('CAT_001', '상의', 'Top'),
      ('CAT_002', '하의', 'Bottom'),
      ('CAT_003', '아우터', 'Outer')`, [])
    
    // Check final state
    const tables = await db.rawQuery('SHOW TABLES', [])
    const productCount = await db.rawQuery('SELECT COUNT(*) as count FROM Product', [])
    
    return NextResponse.json({
      success: true,
      message: '데이터베이스가 초기화되었습니다.',
      results,
      finalState: {
        tables: tables.rows,
        productCount: productCount.rows[0]?.count || 0
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Same as GET
  return GET(request)
}