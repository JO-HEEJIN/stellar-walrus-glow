# Vercel Environment Variables Setup

## Required Environment Variables

Add these to Vercel Dashboard → Settings → Environment Variables:

### 1. Database Connection (IMPORTANT: Copy exactly as shown)
```
DATABASE_URL=mysql://kfashion_admin:Qlalfqjsgh1!@k-fashion-aurora-cluster-instance-1.cf462wy64uko.us-east-2.rds.amazonaws.com:3306/kfashion
```

**Note**: 
- Remove `%21` and use plain `!` in password
- Remove `?ssl=true` or `?sslaccept=strict` - Vercel handles SSL automatically
- Make sure there are no quotes around the value in Vercel

### 2. Authentication Bypass
```
NEXT_PUBLIC_SKIP_AUTH=true
```

### 3. JWT Secret
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. AWS Configuration (Optional)
```
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=AKIA2LD6VIHT55OJIHVD
AWS_SECRET_ACCESS_KEY=EXzvvR231zwfktmwoyw3gwVU9bz6m9hDmTtM9tQz
S3_BUCKET=k-fashion-products-711082721767
```

### 5. Redis (Optional)
```
UPSTASH_REDIS_REST_URL=https://keen-buck-61000.upstash.io
UPSTASH_REDIS_REST_TOKEN=Ae5IAAIjcDFkNWQwYjVjMjVjZmY0YWU1OWU1ODc1M2Y1ZDc4NTlkY3AxMA
```

## After Adding Variables

1. Click "Save" for each variable
2. Go to Deployments tab
3. Click on the latest deployment
4. Click "Redeploy" → "Redeploy"
5. Wait for deployment to complete

## Testing URLs

After deployment, test these URLs:

1. Environment Check: https://k-fashions.com/api/env-check
2. Database Test: https://k-fashions.com/api/test-db
3. Debug Users: https://k-fashions.com/api/debug/users

## Common Issues

### Issue: 500 Error on /api/users
- Check DATABASE_URL format (no quotes, no %21 encoding)
- Ensure NEXT_PUBLIC_SKIP_AUTH is exactly "true"
- Check Vercel Function logs for detailed errors

### Issue: Authentication errors
- Make sure NEXT_PUBLIC_SKIP_AUTH=true is set
- JWT_SECRET must match between local and production

### Issue: Database connection failed
- PASSWORD: Use `!` instead of `%21`
- Remove SSL parameters from URL
- Check AWS RDS security groups allow Vercel IPs