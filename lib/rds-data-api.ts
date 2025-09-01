import { RDSDataClient, ExecuteStatementCommand, BatchExecuteStatementCommand, BeginTransactionCommand, CommitTransactionCommand, RollbackTransactionCommand } from '@aws-sdk/client-rds-data'

// RDS Data API configuration
const rdsClient = new RDSDataClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Aurora Serverless cluster ARN and secret ARN
const RESOURCE_ARN = process.env.RDS_RESOURCE_ARN || 'arn:aws:rds:us-east-2:711082721767:cluster:k-fashion-aurora-cluster'
const SECRET_ARN = process.env.RDS_SECRET_ARN || 'arn:aws:secretsmanager:us-east-2:711082721767:secret:rds!cluster-xxxxxxxx'
const DATABASE = 'kfashion'

export interface QueryResult {
  records: any[]
  numberOfRecordsUpdated?: number
  generatedFields?: any[]
}

// Helper function to execute SQL queries
export async function executeQuery(sql: string, parameters: any[] = []): Promise<QueryResult> {
  try {
    const command = new ExecuteStatementCommand({
      resourceArn: RESOURCE_ARN,
      secretArn: SECRET_ARN,
      database: DATABASE,
      sql,
      parameters: parameters.map((value, index) => ({
        name: `param${index + 1}`,
        value: formatParameter(value),
      })),
      includeResultMetadata: true,
    })

    const response = await rdsClient.send(command)
    
    return {
      records: response.records || [],
      numberOfRecordsUpdated: response.numberOfRecordsUpdated,
      generatedFields: response.generatedFields,
    }
  } catch (error) {
    console.error('RDS Data API Error:', error)
    throw error
  }
}

// Format parameter for RDS Data API
function formatParameter(value: any) {
  if (value === null || value === undefined) {
    return { isNull: true }
  }
  if (typeof value === 'string') {
    return { stringValue: value }
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { longValue: value }
    }
    return { doubleValue: value }
  }
  if (typeof value === 'boolean') {
    return { booleanValue: value }
  }
  if (value instanceof Date) {
    return { stringValue: value.toISOString() }
  }
  if (Buffer.isBuffer(value)) {
    return { blobValue: value }
  }
  // Default to string
  return { stringValue: JSON.stringify(value) }
}

// Transaction support
export async function beginTransaction(): Promise<string> {
  const command = new BeginTransactionCommand({
    resourceArn: RESOURCE_ARN,
    secretArn: SECRET_ARN,
    database: DATABASE,
  })
  const response = await rdsClient.send(command)
  return response.transactionId!
}

export async function commitTransaction(transactionId: string): Promise<void> {
  const command = new CommitTransactionCommand({
    resourceArn: RESOURCE_ARN,
    secretArn: SECRET_ARN,
    transactionId,
  })
  await rdsClient.send(command)
}

export async function rollbackTransaction(transactionId: string): Promise<void> {
  const command = new RollbackTransactionCommand({
    resourceArn: RESOURCE_ARN,
    secretArn: SECRET_ARN,
    transactionId,
  })
  await rdsClient.send(command)
}

// User-specific queries
export async function getAllUsers() {
  const sql = `
    SELECT id, name, email, role, status, brandId, createdAt, updatedAt
    FROM User
    ORDER BY createdAt DESC
  `
  const result = await executeQuery(sql)
  return result.records
}

export async function getUserById(id: string) {
  const sql = `
    SELECT id, name, email, role, status, brandId, createdAt, updatedAt
    FROM User
    WHERE id = :param1
  `
  const result = await executeQuery(sql, [id])
  return result.records[0]
}

export async function createUser(data: {
  name: string
  email: string
  role: string
  status?: string
  brandId?: string
}) {
  const sql = `
    INSERT INTO User (id, name, email, role, status, brandId, createdAt, updatedAt)
    VALUES (UUID(), :param1, :param2, :param3, :param4, :param5, NOW(), NOW())
  `
  const result = await executeQuery(sql, [
    data.name,
    data.email,
    data.role,
    data.status || 'ACTIVE',
    data.brandId || null,
  ])
  return result
}

export async function updateUser(id: string, data: Partial<{
  name: string
  email: string
  role: string
  status: string
  brandId: string
}>) {
  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (data.name !== undefined) {
    updates.push(`name = :param${paramIndex}`)
    values.push(data.name)
    paramIndex++
  }
  if (data.email !== undefined) {
    updates.push(`email = :param${paramIndex}`)
    values.push(data.email)
    paramIndex++
  }
  if (data.role !== undefined) {
    updates.push(`role = :param${paramIndex}`)
    values.push(data.role)
    paramIndex++
  }
  if (data.status !== undefined) {
    updates.push(`status = :param${paramIndex}`)
    values.push(data.status)
    paramIndex++
  }
  if (data.brandId !== undefined) {
    updates.push(`brandId = :param${paramIndex}`)
    values.push(data.brandId)
    paramIndex++
  }

  updates.push(`updatedAt = NOW()`)
  values.push(id)

  const sql = `
    UPDATE User
    SET ${updates.join(', ')}
    WHERE id = :param${paramIndex}
  `
  
  const result = await executeQuery(sql, values)
  return result
}