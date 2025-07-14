# Update Environment Variables

## 1. Local Development (.env.local)

Create or update `.env.local` with new AWS values:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# NEW AWS Cognito Configuration
COGNITO_CLIENT_ID=your-new-client-id
COGNITO_CLIENT_SECRET=your-new-client-secret
COGNITO_ISSUER=https://cognito-idp.ap-northeast-1.amazonaws.com/your-new-pool-id

# NEW AWS Credentials (for S3, etc.)
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your-new-access-key
AWS_SECRET_ACCESS_KEY=your-new-secret-key

# NEW S3 Bucket
S3_BUCKET=k-fashion-platform-images

# Database (Aurora MySQL) - To be created
DATABASE_URL=mysql://username:password@your-new-aurora-endpoint:3306/kfashion

# Redis (Upstash) - No change needed
UPSTASH_REDIS_REST_URL=your-existing-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-existing-upstash-token
```

## 2. Vercel Environment Variables

Update in Vercel Dashboard (vercel.com):

```bash
# Use Vercel CLI
vercel env pull  # Backup current env vars

# Update each variable
vercel env add COGNITO_CLIENT_ID production
vercel env add COGNITO_CLIENT_SECRET production
vercel env add COGNITO_ISSUER production
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add S3_BUCKET production
vercel env add DATABASE_URL production

# Also update for preview and development environments
```

## 3. Create IAM User for Application

In AWS Console:
1. Go to IAM → Users → Create User
2. User name: `k-fashion-app-user`
3. Attach policies:
   - Custom policy for S3 access (specific bucket)
   - Custom policy for Cognito access
   - AmazonRDSDataFullAccess (for Aurora)

Example S3 Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::k-fashion-platform-images/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::k-fashion-platform-images"
    }
  ]
}
```

## 4. Test Environment Variables

Create a test script:
```typescript
// scripts/test-env.ts
console.log('Environment Variables Check:');
console.log('COGNITO_CLIENT_ID:', process.env.COGNITO_CLIENT_ID ? '✓' : '✗');
console.log('COGNITO_CLIENT_SECRET:', process.env.COGNITO_CLIENT_SECRET ? '✓' : '✗');
console.log('COGNITO_ISSUER:', process.env.COGNITO_ISSUER ? '✓' : '✗');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓' : '✗');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓' : '✗');
console.log('S3_BUCKET:', process.env.S3_BUCKET);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓' : '✗');
```