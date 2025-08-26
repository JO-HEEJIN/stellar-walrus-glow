import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if RDS Data API SDK is available
    try {
      const { RDSDataClient, ExecuteStatementCommand } = await import('@aws-sdk/client-rds-data')
      
      const client = new RDSDataClient({ 
        region: process.env.AWS_REGION || 'us-east-2'
      })

      // Simple query to test connection
      const command = new ExecuteStatementCommand({
        resourceArn: process.env.RDS_CLUSTER_ARN || 'arn:aws:rds:us-east-2:711082721767:cluster:k-fashion-aurora-cluster',
        secretArn: process.env.RDS_SECRET_ARN || 'arn:aws:secretsmanager:us-east-2:711082721767:secret:rds-proxy-k-fashion-secrets-ZQBz8g',
        database: process.env.RDS_DATABASE_NAME || 'kfashion',
        sql: 'SELECT 1 as test',
        includeResultMetadata: true
      })

      const response = await client.send(command)
      
      return NextResponse.json({
        status: 'success',
        message: 'RDS Data API connection successful',
        data: response.records,
        metadata: response.columnMetadata,
        timestamp: new Date().toISOString()
      })

    } catch (sdkError) {
      return NextResponse.json({
        status: 'error',
        message: 'RDS Data API Error',
        error: sdkError instanceof Error ? sdkError.message : String(sdkError),
        errorDetails: {
          name: sdkError instanceof Error ? sdkError.name : 'Unknown',
          stack: sdkError instanceof Error ? sdkError.stack : undefined
        },
        environment: {
          hasClusterArn: !!process.env.RDS_CLUSTER_ARN,
          hasSecretArn: !!process.env.RDS_SECRET_ARN,
          hasRegion: !!process.env.AWS_REGION,
          hasRoleArn: !!process.env.AWS_ROLE_ARN
        }
      }, { status: 500 })
    }

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'RDS Data API test failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}