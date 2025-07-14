# Create Aurora MySQL Database

## 1. Create Aurora Serverless v2 Cluster

In AWS Console:
1. Go to RDS service
2. Click "Create database"
3. Configure:

### Engine options
- **Engine type**: Amazon Aurora
- **Edition**: Amazon Aurora MySQL-Compatible Edition
- **Engine version**: Aurora MySQL 3.04.0 (compatible with MySQL 8.0.32)

### Database features
- **Serverless v2** (for auto-scaling and cost efficiency)

### Settings
- **DB cluster identifier**: `k-fashion-cluster`
- **Master username**: `admin`
- **Master password**: Generate a strong password

### Connectivity
- **Virtual private cloud (VPC)**: Default VPC
- **DB subnet group**: default
- **Public access**: No (for security)
- **VPC security group**: Create new
  - Name: `k-fashion-db-sg`
  - Add inbound rule: MySQL/Aurora (3306) from your app

### Serverless v2 capacity settings
- **Minimum ACUs**: 0.5 (for cost savings)
- **Maximum ACUs**: 1 (can increase later)

### Additional configuration
- **Initial database name**: `kfashion`
- **DB cluster parameter group**: default.aurora-mysql8.0
- **Backup retention period**: 7 days
- **Enable deletion protection**: Yes (for production)

## 2. Create Database User

After cluster creation, connect using MySQL client:

```sql
-- Create application user
CREATE USER 'kfashion_app'@'%' IDENTIFIED BY 'strong_password_here';

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER 
ON kfashion.* TO 'kfashion_app'@'%';

FLUSH PRIVILEGES;
```

## 3. Get Connection String

Your DATABASE_URL will be:
```
mysql://kfashion_app:password@k-fashion-cluster.cluster-xxxxxxxxxxxx.ap-northeast-1.rds.amazonaws.com:3306/kfashion?ssl={"rejectUnauthorized":true}
```

## 4. Test Connection

```bash
# Install MySQL client if needed
brew install mysql-client

# Test connection
mysql -h k-fashion-cluster.cluster-xxxxxxxxxxxx.ap-northeast-1.rds.amazonaws.com \
      -u kfashion_app \
      -p \
      kfashion

# Should connect successfully
```

## 5. Run Prisma Migrations

```bash
# Update .env.local with new DATABASE_URL
# Then run:
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## 6. Set Up Monitoring

1. Go to CloudWatch
2. Create alarms for:
   - CPU utilization > 80%
   - Database connections > 80%
   - Storage space < 10GB
3. Set up SNS notifications to your email