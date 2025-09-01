import { NextResponse } from 'next/server'
import { RDSDataClient, ExecuteStatementCommand } from '@aws-sdk/client-rds-data'

export async function GET() {
  const response: any = {
    timestamp: new Date().toISOString(),
    config: {
      hasClusterArn: !!process.env.RDS_CLUSTER_ARN,
      hasSecretArn: !!process.env.RDS_SECRET_ARN,
      hasDatabase: !!process.env.RDS_DATABASE_NAME,
      hasAwsKeys: !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-2',
    },
    test: null,
    error: null
  }

  try {
    // Create RDS Data API client
    const client = new RDSDataClient({
      region: process.env.AWS_REGION || 'us-east-2',
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      } : undefined,
    })

    // Test simple query
    const command = new ExecuteStatementCommand({
      resourceArn: process.env.RDS_CLUSTER_ARN || 'arn:aws:rds:us-east-2:711082721767:cluster:k-fashion-aurora-cluster',
      secretArn: process.env.RDS_SECRET_ARN || 'arn:aws:secretsmanager:us-east-2:711082721767:secret:rds-proxy-k-fashion-secrets-ZQBz8g',
      database: process.env.RDS_DATABASE_NAME || 'kfashion',
      sql: 'SELECT 1 as test, NOW() as current_time',
    })

    const result = await client.send(command)
    
    response.test = {
      success: true,
      message: 'RDS Data API is working!',
      result: result.records,
      metadata: {
        numberOfRecordsUpdated: result.numberOfRecordsUpdated,
        generatedFields: result.generatedFields,
      }
    }

    // Try to count users
    const userCountCommand = new ExecuteStatementCommand({
      resourceArn: process.env.RDS_CLUSTER_ARN || 'arn:aws:rds:us-east-2:711082721767:cluster:k-fashion-aurora-cluster',
      secretArn: process.env.RDS_SECRET_ARN || 'arn:aws:secretsmanager:us-east-2:711082721767:secret:rds-proxy-k-fashion-secrets-ZQBz8g',
      database: process.env.RDS_DATABASE_NAME || 'kfashion',
      sql: 'SELECT COUNT(*) as count FROM User',
    })

    const userCountResult = await client.send(userCountCommand)
    response.userCount = {
      success: true,
      count: userCountResult.records?.[0]?.[0]?.longValue || 0
    }

  } catch (error: any) {
    response.error = {
      message: error.message,
      code: error.Code || error.code,
      name: error.name,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      details: error.toString()
    }

    // Common error explanations
    if (error.message?.includes('not enabled')) {
      response.error.solution = 'RDS Data API is not enabled on your Aurora cluster. You need to modify the cluster to enable Data API.'
    } else if (error.message?.includes('Secret')) {
      response.error.solution = 'Check your AWS Secrets Manager ARN and ensure the secret exists and contains database credentials.'
    } else if (error.message?.includes('Access denied')) {
      response.error.solution = 'Check AWS IAM permissions for RDS Data API and Secrets Manager access.'
    } else if (error.message?.includes('Cluster not found')) {
      response.error.solution = 'Check your RDS cluster ARN is correct.'
    }
  }

  return NextResponse.json(response)
}