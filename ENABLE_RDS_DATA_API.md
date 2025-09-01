# Enable RDS Data API on Aurora Cluster

## Check Current Status

1. Test the API: https://k-fashions.com/api/test-rds-data-api
2. If you see "not enabled" error, follow the steps below

## Steps to Enable RDS Data API

### 1. Open AWS Console
- Go to: https://console.aws.amazon.com/rds
- Region: **us-east-2 (Ohio)**

### 2. Find Your Aurora Cluster
- Click "Databases" in left menu
- Find: `k-fashion-aurora-cluster`
- Select the **cluster** (not instance)

### 3. Modify Cluster
- Click "Modify" button
- Scroll to "Additional configuration"

### 4. Enable Data API
- Find "Web Service Data API" section
- Check ✅ **Enable the Data API**
- Scroll to bottom
- Click "Continue"

### 5. Apply Changes
- Choose "Apply immediately"
- Click "Modify cluster"
- Wait 5-10 minutes for changes to apply

## Create or Update Secrets Manager

### 1. Open Secrets Manager
- Go to: https://console.aws.amazon.com/secretsmanager
- Region: **us-east-2 (Ohio)**

### 2. Check Existing Secret
Look for: `rds-proxy-k-fashion-secrets`

If it doesn't exist:

### 3. Create New Secret
- Click "Store a new secret"
- Choose "Credentials for Amazon RDS database"
- Enter:
  - Username: `kfashion_admin`
  - Password: `Qlalfqjsgh1!`
  - Database: Select `k-fashion-aurora-cluster`
- Secret name: `rds-proxy-k-fashion-secrets`
- Click "Next" → "Next" → "Store"

### 4. Get Secret ARN
- Click on the secret
- Copy the "Secret ARN"
- Update in Vercel if different

## Required IAM Permissions

Your AWS user (`AKIA2LD6VIHT55OJIHVD`) needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rds-data:ExecuteStatement",
        "rds-data:BatchExecuteStatement",
        "rds-data:BeginTransaction",
        "rds-data:CommitTransaction",
        "rds-data:RollbackTransaction"
      ],
      "Resource": "arn:aws:rds:us-east-2:711082721767:cluster:k-fashion-aurora-cluster"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-2:711082721767:secret:rds-proxy-k-fashion-secrets-*"
    }
  ]
}
```

## Test Connection

After enabling Data API:

1. Wait 5-10 minutes
2. Test: https://k-fashions.com/api/test-rds-data-api
3. Should see: "RDS Data API is working!"

## Troubleshooting

### Error: "Data API is not enabled"
- The cluster doesn't have Data API enabled
- Follow steps above to enable it

### Error: "Secret not found"
- Secrets Manager ARN is incorrect
- Create the secret as shown above

### Error: "Access denied"
- IAM permissions missing
- Add the policy shown above to your IAM user

### Error: "Cluster not found"
- Wrong cluster ARN
- Verify: `arn:aws:rds:us-east-2:711082721767:cluster:k-fashion-aurora-cluster`

## Important Notes

⚠️ **Aurora Serverless v1 vs v2**
- Data API works best with Aurora Serverless v1
- Aurora Serverless v2 and provisioned clusters may have limited Data API support
- If your cluster is provisioned, you might need to:
  1. Create an Aurora Serverless v1 cluster
  2. Or use RDS Proxy instead of Data API