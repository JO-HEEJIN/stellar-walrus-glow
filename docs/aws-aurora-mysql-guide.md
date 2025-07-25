# AWS Aurora MySQL Setup Guide for K-Fashion Platform

## Overview
This guide walks through setting up AWS Aurora MySQL for the K-Fashion platform, optimized for the Seoul (ap-northeast-2) region.

## Prerequisites
- AWS Account with appropriate permissions
- AWS CLI configured (optional but recommended)
- Basic understanding of MySQL

## Step 1: Choose Your Region Strategy

### Option A: Keep Everything in Tokyo (ap-northeast-1)
**Pros:**
- Consistent with existing Cognito setup
- No need to migrate authentication
- Simpler architecture

**Cons:**
- Higher latency from Seoul (~35-50ms)
- Potential performance impact

### Option B: Use Seoul Region (ap-northeast-2) for Database
**Pros:**
- Lowest latency for database operations (~5-10ms)
- Better performance for your location
- Can scale to serve Korean market better

**Cons:**
- Cross-region communication with Cognito
- Slightly higher complexity
- Small additional data transfer costs

### Option C: Migrate Everything to Seoul (Recommended)
**Pros:**
- Optimal performance
- Lower costs (no cross-region transfer)
- Better for Korean market expansion

**Cons:**
- Need to recreate Cognito user pool
- Update all configurations

## Step 2: Create Aurora MySQL Cluster

### Using AWS Console

1. **Navigate to RDS Console**
   - Go to AWS RDS Console
   - Select your chosen region (ap-northeast-2 for Seoul)

2. **Create Database**
   - Click "Create database"
   - Choose "Amazon Aurora"
   - Select "Aurora MySQL-Compatible Edition"

3. **Configuration**
   ```
   Engine version: Aurora MySQL 3.04.x (MySQL 8.0 compatible)
   Templates: Production (for production) or Dev/Test (for development)
   ```

4. **Settings**
   ```
   DB cluster identifier: kfashion-aurora-cluster
   Master username: admin
   Master password: [Generate strong password]
   ```

5. **Instance Configuration**
   ```
   Instance class:
   - Development: db.t4g.medium (2 vCPU, 4 GB RAM)
   - Production: db.r6g.large (2 vCPU, 16 GB RAM)
   
   Multi-AZ deployment: Yes (for production)
   ```

6. **Connectivity**
   ```
   VPC: Default or create new
   Subnet group: Create new or use existing
   Public access: No (recommended)
   Security group: Create new
   Port: 3306
   ```

7. **Additional Configuration**
   ```
   Initial database name: kfashion
   Backup retention: 7 days
   Encryption: Enable encryption at rest
   ```

### Using AWS CLI

```bash
# Create subnet group
aws rds create-db-subnet-group \
    --db-subnet-group-name kfashion-subnet-group \
    --db-subnet-group-description "Subnet group for K-Fashion Aurora" \
    --subnet-ids subnet-xxx subnet-yyy \
    --region ap-northeast-2

# Create security group
aws ec2 create-security-group \
    --group-name kfashion-aurora-sg \
    --description "Security group for K-Fashion Aurora" \
    --vpc-id vpc-xxx \
    --region ap-northeast-2

# Create Aurora cluster
aws rds create-db-cluster \
    --db-cluster-identifier kfashion-aurora-cluster \
    --engine aurora-mysql \
    --engine-version 8.0.mysql_aurora.3.04.0 \
    --master-username admin \
    --master-user-password "YourSecurePassword" \
    --database-name kfashion \
    --db-subnet-group-name kfashion-subnet-group \
    --vpc-security-group-ids sg-xxx \
    --storage-encrypted \
    --region ap-northeast-2

# Create Aurora instance
aws rds create-db-instance \
    --db-instance-identifier kfashion-aurora-instance-1 \
    --db-instance-class db.t4g.medium \
    --engine aurora-mysql \
    --db-cluster-identifier kfashion-aurora-cluster \
    --region ap-northeast-2
```

## Step 3: Configure Security

### Security Group Rules

Add inbound rules to allow connections:

1. **From Application (Vercel)**
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: Vercel IP ranges (see Vercel documentation)

2. **From Development Machine (temporary)**
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: Your IP address

### IAM Database Authentication (Optional but Recommended)

```bash
# Create IAM policy
aws iam create-policy \
    --policy-name kfashion-aurora-connect \
    --policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": "rds-db:connect",
            "Resource": "arn:aws:rds-db:ap-northeast-2:YOUR_ACCOUNT:dbuser:kfashion-aurora-cluster/*"
        }]
    }'
```

## Step 4: Connection Configuration

### Get Connection Details

```bash
# Get cluster endpoint
aws rds describe-db-clusters \
    --db-cluster-identifier kfashion-aurora-cluster \
    --query 'DBClusters[0].Endpoint' \
    --region ap-northeast-2
```

### Update Environment Variables

```env
# Writer endpoint (for writes)
DATABASE_URL="mysql://admin:password@kfashion-aurora-cluster.cluster-xxx.ap-northeast-2.rds.amazonaws.com:3306/kfashion"

# Reader endpoint (for reads - optional)
DATABASE_URL_READER="mysql://admin:password@kfashion-aurora-cluster.cluster-ro-xxx.ap-northeast-2.rds.amazonaws.com:3306/kfashion"
```

## Step 5: Database Setup with Prisma

1. **Update Prisma Schema** (already configured in your project)

2. **Run Migrations**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate deploy
   ```

3. **Verify Connection**
   ```bash
   # Test connection
   npx prisma db pull
   ```

## Step 6: Performance Optimization

### Aurora-Specific Optimizations

1. **Enable Query Cache**
   ```sql
   SET GLOBAL query_cache_size = 67108864; -- 64MB
   SET GLOBAL query_cache_type = 1;
   ```

2. **Connection Pooling**
   Update your Prisma configuration:
   ```typescript
   // lib/prisma.ts
   const prisma = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL,
       },
     },
     log: ['error', 'warn'],
     // Connection pool settings
     // Aurora handles pooling well, so keep these moderate
   });
   ```

3. **Read Replicas**
   - Aurora automatically creates read replicas
   - Use reader endpoint for read-heavy operations

## Step 7: Monitoring and Maintenance

### CloudWatch Metrics to Monitor

1. **Performance Metrics**
   - CPU Utilization (target: < 70%)
   - Database Connections (monitor for spikes)
   - Read/Write Latency (target: < 10ms)
   - Deadlocks (should be near 0)

2. **Set Up Alarms**
   ```bash
   aws cloudwatch put-metric-alarm \
       --alarm-name kfashion-aurora-cpu \
       --alarm-description "Aurora CPU usage" \
       --metric-name CPUUtilization \
       --namespace AWS/RDS \
       --statistic Average \
       --period 300 \
       --threshold 70 \
       --comparison-operator GreaterThanThreshold \
       --dimensions Name=DBClusterIdentifier,Value=kfashion-aurora-cluster \
       --evaluation-periods 2 \
       --region ap-northeast-2
   ```

### Backup Strategy

1. **Automated Backups**
   - Already enabled with 7-day retention
   - Point-in-time recovery available

2. **Manual Snapshots**
   ```bash
   aws rds create-db-cluster-snapshot \
       --db-cluster-identifier kfashion-aurora-cluster \
       --db-cluster-snapshot-identifier kfashion-aurora-manual-$(date +%Y%m%d) \
       --region ap-northeast-2
   ```

## Step 8: Cost Optimization

### Estimated Costs (Seoul Region)

1. **Development Environment**
   - db.t4g.medium: ~$60/month
   - Storage: ~$10/month
   - Total: ~$70/month

2. **Production Environment**
   - db.r6g.large: ~$230/month
   - Multi-AZ: x2 = ~$460/month
   - Storage: ~$20/month
   - Total: ~$480/month

### Cost Saving Tips

1. **Use Aurora Serverless v2 for Variable Workloads**
   - Scales automatically
   - Pay only for what you use
   - Good for development environments

2. **Stop Development Clusters When Not in Use**
   ```bash
   aws rds stop-db-cluster \
       --db-cluster-identifier kfashion-aurora-cluster \
       --region ap-northeast-2
   ```

3. **Use Reserved Instances for Production**
   - Save up to 45% for 1-year commitment
   - Save up to 66% for 3-year commitment

## Step 9: Migration from Development to Production

### When moving to production:

1. **Create Production Cluster**
   - Use production instance types
   - Enable Multi-AZ
   - Set longer backup retention (30 days)

2. **Data Migration**
   ```bash
   # Export from development
   mysqldump -h dev-endpoint -u admin -p kfashion > kfashion_backup.sql
   
   # Import to production
   mysql -h prod-endpoint -u admin -p kfashion < kfashion_backup.sql
   ```

3. **Update Environment Variables**
   - Point to production endpoints
   - Use separate credentials
   - Enable SSL/TLS

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check security group rules
   - Verify VPC settings
   - Ensure cluster is running

2. **Authentication Failed**
   - Verify credentials
   - Check IAM permissions
   - Ensure proper URL encoding

3. **Performance Issues**
   - Check CloudWatch metrics
   - Review slow query logs
   - Consider scaling up instance class

### Useful Commands

```bash
# Check cluster status
aws rds describe-db-clusters \
    --db-cluster-identifier kfashion-aurora-cluster \
    --region ap-northeast-2

# View recent events
aws rds describe-events \
    --source-identifier kfashion-aurora-cluster \
    --source-type db-cluster \
    --region ap-northeast-2

# Modify cluster (e.g., change instance class)
aws rds modify-db-instance \
    --db-instance-identifier kfashion-aurora-instance-1 \
    --db-instance-class db.r6g.large \
    --apply-immediately \
    --region ap-northeast-2
```

## Next Steps

1. Set up Aurora cluster following this guide
2. Update your `.env` file with connection details
3. Run Prisma migrations
4. Test connection with the test script
5. Set up monitoring and alarms
6. Plan for backup and disaster recovery

## Regional Architecture Decision

### Recommended Approach for Your Situation

Since you're in Seoul and latency is important:

1. **Short Term**: Keep Cognito in Tokyo, create Aurora in Seoul
   - Minimal disruption
   - Better database performance
   - Small cross-region costs

2. **Long Term**: Consider migrating everything to Seoul
   - Optimal performance
   - Lower costs
   - Better for Korean market

The cross-region latency between Seoul and Tokyo (~35ms) is acceptable for authentication (happens less frequently) but would impact database operations (happen constantly).