# AWS Aurora MySQL Setup Guide

This guide will help you set up AWS Aurora MySQL with read replicas for the K-Fashion platform's load-balanced architecture.

## Prerequisites

- AWS CLI configured with appropriate permissions
- Terraform or AWS Console access
- Database credentials securely stored

## Aurora Cluster Configuration

### 1. Create Aurora MySQL Cluster

**Via AWS Console:**
1. Navigate to RDS in AWS Console
2. Click "Create database"
3. Choose "Amazon Aurora" → "MySQL-Compatible"
4. Select "Provisioned" (for predictable workloads)

**Recommended Settings:**
- **Engine Version**: Aurora MySQL 8.0.35 or latest
- **Instance Class**: 
  - Production: `db.r6g.large` or higher
  - Development: `db.t4g.medium`
- **Multi-AZ**: Yes (for high availability)
- **Storage**: Aurora shared storage (automatic scaling)

### 2. Cluster Configuration

**Database Details:**
- **Cluster Identifier**: `k-fashion-aurora-cluster`
- **Master Username**: `kfashion_admin`
- **Master Password**: Generate secure password
- **Database Name**: `kfashion_prod`

**Networking:**
- **VPC**: Default or create custom VPC
- **Subnet Group**: Create new or use default
- **Security Groups**: Create specific security group
- **Port**: 3306 (MySQL default)

### 3. Security Group Rules

Create security group `k-fashion-db-sg` with:

**Inbound Rules:**
```
Port 3306 - Source: Your application servers' security group
Port 3306 - Source: Your development IP (temporary)
```

**Outbound Rules:**
```
All traffic - Destination: 0.0.0.0/0 (for software updates)
```

### 4. Read Replica Setup

After primary cluster is created:

1. **Add Read Replica:**
   - Go to your Aurora cluster
   - Click "Actions" → "Add reader"
   - Choose same instance class as writer
   - Place in different AZ for high availability

2. **Configure Read Replica:**
   - **Instance Identifier**: `k-fashion-aurora-reader-1`
   - **Instance Class**: Same as writer instance
   - **Availability Zone**: Different from writer

3. **Additional Replicas (Optional):**
   - For high load: Add 2-3 read replicas
   - Distribute across multiple AZs

## Connection Strings

After setup, you'll get these endpoints:

### Writer Endpoint (Primary)
```
k-fashion-aurora-cluster.cluster-xxxxxx.us-east-1.rds.amazonaws.com:3306
```

### Reader Endpoint (Load Balanced)
```
k-fashion-aurora-cluster.cluster-ro-xxxxxx.us-east-1.rds.amazonaws.com:3306
```

## Environment Variables

Update your `.env` file:

```bash
# Primary database (writes)
DATABASE_URL_PRIMARY="mysql://kfashion_admin:PASSWORD@k-fashion-aurora-cluster.cluster-xxxxxx.us-east-1.rds.amazonaws.com:3306/kfashion_prod"

# Read replica (reads)
DATABASE_URL_REPLICA="mysql://kfashion_admin:PASSWORD@k-fashion-aurora-cluster.cluster-ro-xxxxxx.us-east-1.rds.amazonaws.com:3306/kfashion_prod"

# Fallback connection
DATABASE_URL="mysql://kfashion_admin:PASSWORD@k-fashion-aurora-cluster.cluster-xxxxxx.us-east-1.rds.amazonaws.com:3306/kfashion_prod"

# Connection pool settings
DATABASE_CONNECTION_LIMIT=15
DATABASE_POOL_TIMEOUT=10
DATABASE_QUERY_TIMEOUT=30000
```

## Database Migration

### 1. Generate Prisma Client
```bash
npm run prisma:generate
```

### 2. Create Database Schema
```bash
npm run prisma:migrate deploy
```

### 3. Seed Initial Data
```bash
npm run prisma:db seed
```

## Monitoring Setup

### 1. Enable Performance Insights
- Go to RDS Console → Your cluster
- Modify cluster → Enable Performance Insights
- Set retention period (7 days free, 2+ years paid)

### 2. CloudWatch Metrics
Monitor these key metrics:
- `DatabaseConnections`
- `CPUUtilization`
- `ReadLatency` / `WriteLatency`
- `SelectThroughput`
- `DMLThroughput`

### 3. Alarms
Set up CloudWatch alarms for:
- High CPU usage (>80%)
- High connection count (>80% of max)
- High read/write latency (>100ms)

## Security Best Practices

### 1. Network Security
- Use VPC with private subnets for database
- Restrict security group access
- No public accessibility for production

### 2. Encryption
- Enable encryption at rest
- Enable encryption in transit (SSL)
- Use AWS KMS for key management

### 3. Access Control
- Use IAM database authentication (recommended)
- Rotate passwords regularly
- Use least privilege principle

### 4. Backup Configuration
- Automated backups enabled (1-35 days retention)
- Cross-region backup copying for disaster recovery
- Point-in-time recovery enabled

## Cost Optimization

### 1. Instance Right-Sizing
- Start with smaller instances
- Monitor performance metrics
- Scale up based on actual usage

### 2. Reserved Instances
- Consider 1-year or 3-year reservations
- Can save 30-60% on compute costs

### 3. Aurora Serverless (Alternative)
- For variable workloads
- Automatically scales compute capacity
- Pay per second billing

## Troubleshooting

### Common Issues:

1. **Connection Timeout**
   - Check security group rules
   - Verify VPC routing
   - Check connection string format

2. **High CPU Usage**
   - Review slow queries
   - Add database indexes
   - Consider read replicas

3. **Connection Pool Exhaustion**
   - Increase connection limit
   - Optimize query performance
   - Review connection pooling settings

## Testing the Setup

Run the health check endpoint to verify connectivity:

```bash
curl http://localhost:3000/api/health/detailed
```

Look for database status in the response:
```json
{
  "services": {
    "database": {
      "primary": { "status": "healthy", "responseTime": 45 },
      "replica": { "status": "healthy", "responseTime": 32 }
    }
  }
}
```