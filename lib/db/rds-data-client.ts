import { RDSDataClient, ExecuteStatementCommand } from '@aws-sdk/client-rds-data'

export interface RDSDataClientConfig {
  region: string
  clusterArn: string
  secretArn: string
  database: string
}

export interface QueryResult {
  rows: Record<string, any>[]
  affectedRows?: number
  insertId?: number
}

export class RDSDataAPIClient {
  private client: RDSDataClient
  private config: RDSDataClientConfig
  private queryCache: Map<string, { result: QueryResult; timestamp: number }>
  private cacheTimeout: number = 30000 // 30 seconds

  constructor(config: RDSDataClientConfig) {
    this.config = config
    this.client = new RDSDataClient({ 
      region: config.region,
      maxAttempts: 3 // Retry failed requests
    })
    this.queryCache = new Map()
  }

  async query(sql: string, params: any[] = []): Promise<QueryResult> {
    // Check if this is a read-only query that can be cached
    const isReadQuery = sql.trim().toUpperCase().startsWith('SELECT')
    const cacheKey = isReadQuery ? `${sql}|${JSON.stringify(params)}` : null
    
    // Check cache for read queries
    if (cacheKey && this.queryCache.has(cacheKey)) {
      const cached = this.queryCache.get(cacheKey)!
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.result
      }
      // Remove expired cache entry
      this.queryCache.delete(cacheKey)
    }

    try {
      const command = new ExecuteStatementCommand({
        resourceArn: this.config.clusterArn,
        secretArn: this.config.secretArn,
        database: this.config.database,
        sql,
        parameters: this.formatParameters(params),
        includeResultMetadata: true,
        formatRecordsAs: 'JSON'
      })

      const response = await this.client.send(command)
      
      const result = {
        rows: this.formatResults(response),
        affectedRows: response.numberOfRecordsUpdated,
        insertId: response.generatedFields?.[0]?.longValue
      }

      // Cache read queries
      if (cacheKey && result.rows.length > 0) {
        this.queryCache.set(cacheKey, {
          result,
          timestamp: Date.now()
        })
        
        // Clean up old cache entries to prevent memory leak
        if (this.queryCache.size > 100) {
          this.cleanupCache()
        }
      }
      
      return result
    } catch (error) {
      console.error('RDS Data API Error:', error)
      throw new Error(`Database query failed: ${error}`)
    }
  }

  private cleanupCache() {
    const now = Date.now()
    for (const [key, value] of this.queryCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.queryCache.delete(key)
      }
    }
  }

  async batchQuery(queries: Array<{sql: string; params?: any[]}>): Promise<QueryResult[]> {
    // Execute queries in parallel for better performance
    const promises = queries.map(({ sql, params = [] }) => this.query(sql, params))
    return Promise.all(promises)
  }

  clearCache() {
    this.queryCache.clear()
  }

  getCacheStats() {
    return {
      size: this.queryCache.size,
      entries: Array.from(this.queryCache.keys()),
      timeout: this.cacheTimeout
    }
  }

  private formatParameters(params: any[]) {
    return params.map((param) => {
      if (typeof param === 'string') {
        return { value: { stringValue: param } }
      } else if (typeof param === 'number') {
        return { value: { longValue: param } }
      } else if (typeof param === 'boolean') {
        return { value: { booleanValue: param } }
      } else if (param === null || param === undefined) {
        return { value: { isNull: true } }
      }
      return { value: { stringValue: String(param) } }
    })
  }

  private formatResults(response: any): Record<string, any>[] {
    if (!response.records || response.records.length === 0) {
      return []
    }

    const columnNames = response.columnMetadata?.map((col: any) => col.name) || []
    
    return response.records.map((record: any) => {
      const row: Record<string, any> = {}
      record.forEach((field: any, index: number) => {
        const columnName = columnNames[index] || `column_${index}`
        row[columnName] = this.extractFieldValue(field)
      })
      return row
    })
  }

  private extractFieldValue(field: any): any {
    if (field.stringValue !== undefined) return field.stringValue
    if (field.longValue !== undefined) return field.longValue
    if (field.doubleValue !== undefined) return field.doubleValue
    if (field.booleanValue !== undefined) return field.booleanValue
    if (field.isNull) return null
    return field
  }

  // Prisma-compatible methods
  async findFirst(table: string, where: Record<string, any> = {}) {
    const conditions = Object.entries(where)
      .map(([key]) => `${key} = ?`)
      .join(' AND ')
    
    const sql = `SELECT * FROM ${table}${conditions ? ` WHERE ${conditions}` : ''} LIMIT 1`
    const params = Object.values(where)
    
    const result = await this.query(sql, params)
    return result.rows[0] || null
  }

  async findMany(table: string, options: {
    where?: Record<string, any>
    limit?: number
    offset?: number
  } = {}) {
    const { where = {}, limit, offset } = options
    
    const conditions = Object.entries(where)
      .map(([key]) => `${key} = ?`)
      .join(' AND ')
    
    let sql = `SELECT * FROM ${table}`
    if (conditions) sql += ` WHERE ${conditions}`
    if (limit) sql += ` LIMIT ${limit}`
    if (offset) sql += ` OFFSET ${offset}`
    
    const params = Object.values(where)
    const result = await this.query(sql, params)
    return result.rows
  }

  async create(table: string, data: Record<string, any>) {
    const columns = Object.keys(data).join(', ')
    const placeholders = Object.keys(data).map(() => '?').join(', ')
    const values = Object.values(data)
    
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`
    const result = await this.query(sql, values)
    
    return { id: result.insertId, ...data }
  }

  async update(table: string, where: Record<string, any>, data: Record<string, any>) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ')
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ')
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`
    const params = [...Object.values(data), ...Object.values(where)]
    
    await this.query(sql, params)
    return { ...where, ...data }
  }

  async delete(table: string, where: Record<string, any>) {
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ')
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`
    const params = Object.values(where)
    
    const result = await this.query(sql, params)
    return { affectedRows: result.affectedRows }
  }
}

// Factory function for creating client instance
export function createRDSDataClient(): RDSDataAPIClient {
  const config: RDSDataClientConfig = {
    region: process.env.AWS_REGION || 'us-east-2',
    clusterArn: process.env.RDS_CLUSTER_ARN || 'arn:aws:rds:us-east-2:711082721767:cluster:k-fashion-aurora-cluster',
    secretArn: process.env.RDS_SECRET_ARN || 'arn:aws:secretsmanager:us-east-2:711082721767:secret:rds-proxy-k-fashion-secrets-ZQBz8g',
    database: process.env.RDS_DATABASE_NAME || 'kfashion'
  }

  return new RDSDataAPIClient(config)
}