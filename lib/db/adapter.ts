import { createRDSDataClient, RDSDataAPIClient } from './rds-data-client'

export class DatabaseAdapter {
  private client: RDSDataAPIClient

  constructor() {
    this.client = createRDSDataClient()
  }

  // Public method to execute raw queries for debugging
  async rawQuery(sql: string, params: any[] = []) {
    return this.client.query(sql, params)
  }

  // Product operations
  async getProducts(options: {
    limit?: number
    offset?: number
    search?: string
    brandId?: string
    categoryId?: string
    status?: string
    sortBy?: string
    sortOrder?: string
  } = {}) {
    const { 
      limit = 10, 
      offset = 0, 
      search, 
      brandId, 
      categoryId, 
      status, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = options
    
    let sql = 'SELECT * FROM Product'
    const params: any[] = []
    const whereConditions: string[] = []
    
    if (search) {
      whereConditions.push('(nameKo LIKE ? OR descriptionKo LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    
    if (brandId) {
      whereConditions.push('brandId = ?')
      params.push(brandId)
    }
    
    if (categoryId) {
      whereConditions.push('categoryId = ?')
      params.push(categoryId)
    }
    
    if (status) {
      if (status === 'OUT_OF_STOCK') {
        whereConditions.push('inventory = 0')
      } else {
        whereConditions.push('status = ?')
        params.push(status)
      }
    }
    
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ')
    }
    
    // Add sorting
    const allowedSortFields = ['createdAt', 'basePrice', 'nameKo']
    let sortField = 'createdAt'
    if (sortBy === 'price') sortField = 'basePrice'
    else if (sortBy === 'name') sortField = 'nameKo'
    else if (allowedSortFields.includes(sortBy)) sortField = sortBy
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    sql += ` ORDER BY ${sortField} ${order}`
    
    if (limit) {
      sql += ' LIMIT ?'
      params.push(limit)
    }
    
    if (offset) {
      sql += ' OFFSET ?'
      params.push(offset)
    }
    
    const result = await this.client.query(sql, params)
    return result.rows
  }

  async getProductById(id: string) {
    const sql = 'SELECT * FROM Product WHERE id = ?'
    const result = await this.client.query(sql, [id])
    return result.rows[0] || null
  }

  async getProductCount(options: {
    search?: string
    brandId?: string
    categoryId?: string
    status?: string
  } = {}) {
    const { search, brandId, categoryId, status } = options
    
    let sql = 'SELECT COUNT(*) as count FROM Product'
    const params: any[] = []
    const whereConditions: string[] = []
    
    if (search) {
      whereConditions.push('(nameKo LIKE ? OR descriptionKo LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    
    if (brandId) {
      whereConditions.push('brandId = ?')
      params.push(brandId)
    }
    
    if (categoryId) {
      whereConditions.push('categoryId = ?')
      params.push(categoryId)
    }
    
    if (status) {
      if (status === 'OUT_OF_STOCK') {
        whereConditions.push('inventory = 0')
      } else {
        whereConditions.push('status = ?')
        params.push(status)
      }
    }
    
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ')
    }
    
    const result = await this.client.query(sql, params)
    return result.rows[0]?.count || 0
  }

  async createProduct(data: {
    name: string
    description?: string
    price: number
    sku: string
    brandId: string
    categoryId: string
    imageUrl?: string
    stock?: number
  }) {
    const sql = `
      INSERT INTO Product (id, nameKo, descriptionKo, basePrice, sku, brandId, categoryId, thumbnailImage, inventory, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())
    `
    
    const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const params = [
      id,
      data.name,
      data.description || null,
      data.price,
      data.sku,
      data.brandId,
      data.categoryId,
      data.imageUrl || null,
      data.stock || 0
    ]
    
    await this.client.query(sql, params)
    return { id, ...data }
  }

  // User operations
  async getUserByEmail(email: string) {
    const sql = 'SELECT * FROM User WHERE email = ?'
    const result = await this.client.query(sql, [email])
    return result.rows[0] || null
  }

  async getUsers(options: {
    search?: string
    role?: string
    limit?: number
    offset?: number
  } = {}) {
    const { search, role, limit = 10, offset = 0 } = options
    
    let sql = 'SELECT * FROM User'
    const params: any[] = []
    const whereConditions: string[] = []
    
    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    
    if (role) {
      whereConditions.push('role = ?')
      params.push(role)
    }
    
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ')
    }
    
    sql += ' ORDER BY createdAt DESC'
    
    if (limit) {
      sql += ' LIMIT ?'
      params.push(limit)
    }
    
    if (offset) {
      sql += ' OFFSET ?'
      params.push(offset)
    }
    
    const result = await this.client.query(sql, params)
    return result.rows
  }

  async getUserCount(options: {
    search?: string
    role?: string
  } = {}) {
    const { search, role } = options
    
    let sql = 'SELECT COUNT(*) as count FROM User'
    const params: any[] = []
    const whereConditions: string[] = []
    
    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    
    if (role) {
      whereConditions.push('role = ?')
      params.push(role)
    }
    
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ')
    }
    
    const result = await this.client.query(sql, params)
    return result.rows[0]?.count || 0
  }

  async getUserById(id: string) {
    const sql = 'SELECT * FROM User WHERE id = ?'
    const result = await this.client.query(sql, [id])
    return result.rows[0] || null
  }

  async createUser(data: {
    email: string
    name?: string
    role?: string
    cognitoId?: string
  }) {
    const sql = `
      INSERT INTO User (id, email, name, role, cognitoId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `
    
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const params = [
      id,
      data.email,
      data.name || null,
      data.role || 'BUYER',
      data.cognitoId || null
    ]
    
    await this.client.query(sql, params)
    return { id, ...data }
  }

  // Analytics operations
  async getAnalyticsOverview() {
    const queries = [
      { sql: 'SELECT COUNT(*) as totalUsers FROM User' },
      { sql: 'SELECT COUNT(*) as totalProducts FROM Product' },
      { sql: 'SELECT COUNT(*) as totalOrders FROM \`Order\`' },
      { sql: 'SELECT COALESCE(SUM(totalAmount), 0) as totalRevenue FROM \`Order\`' }
    ]
    
    // Use batch query for better performance
    const results = await this.client.batchQuery(queries)
    
    return {
      totalUsers: results[0].rows[0]?.totalUsers || 0,
      totalProducts: results[1].rows[0]?.totalProducts || 0,
      totalOrders: results[2].rows[0]?.totalOrders || 0,
      totalRevenue: results[3].rows[0]?.totalRevenue || 0
    }
  }

  async getRecentOrders(limit = 10) {
    const sql = `
      SELECT o.*, u.email as userEmail, u.name as userName
      FROM \`Order\` o
      LEFT JOIN User u ON o.userId = u.id
      ORDER BY o.createdAt DESC
      LIMIT ?
    `
    const result = await this.client.query(sql, [limit])
    return result.rows
  }

  // Order operations
  async getOrderById(id: string) {
    const sql = `
      SELECT o.*, u.email as userEmail, u.name as userName
      FROM \`Order\` o
      LEFT JOIN User u ON o.userId = u.id
      WHERE o.id = ?
    `
    const result = await this.client.query(sql, [id])
    return result.rows[0] || null
  }

  async getOrdersByUserId(userId: string, options: {
    limit?: number
    offset?: number
  } = {}) {
    const { limit = 10, offset = 0 } = options
    
    const sql = `
      SELECT * FROM \`Order\`
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `
    const result = await this.client.query(sql, [userId, limit, offset])
    return result.rows
  }

  async createOrder(data: {
    userId: string
    totalAmount: number
    status?: string
    shippingAddress?: any
    items: Array<{
      productId: string
      quantity: number
      price: number
    }>
    memo?: string
  }) {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Insert order
    const orderSql = `
      INSERT INTO \`Order\` (id, orderNumber, userId, totalAmount, status, shippingAddress, memo, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `
    
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`
    
    await this.client.query(orderSql, [
      orderId,
      orderNumber,
      data.userId,
      data.totalAmount,
      data.status || 'PENDING',
      JSON.stringify(data.shippingAddress || {}),
      data.memo || null
    ])
    
    // Insert order items
    if (data.items && data.items.length > 0) {
      const itemsSql = `
        INSERT INTO \`OrderItem\` (id, orderId, productId, quantity, price, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `
      
      for (const item of data.items) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await this.client.query(itemsSql, [
          itemId,
          orderId,
          item.productId,
          item.quantity,
          item.price
        ])
      }
    }
    
    return { id: orderId, orderNumber, ...data }
  }

  // Test database connection
  async testConnection() {
    try {
      const result = await this.client.query('SELECT 1 as test')
      return {
        success: true,
        message: 'Database connection successful',
        data: result.rows
      }
    } catch (error) {
      return {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  // Get cache statistics
  getCacheStats() {
    return this.client.getCacheStats()
  }

  // Clear cache
  clearCache() {
    this.client.clearCache()
  }
}

// Singleton instance
let dbAdapter: DatabaseAdapter | null = null

export function getDatabase(): DatabaseAdapter {
  if (!dbAdapter) {
    dbAdapter = new DatabaseAdapter()
  }
  return dbAdapter
}