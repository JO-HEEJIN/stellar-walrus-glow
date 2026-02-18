# Vercel Environment Variables Setup

## Required Environment Variables

Add these to Vercel Dashboard → Settings → Environment Variables:

### 1. Database Connection (IMPORTANT: Copy exactly as shown)
```
DATABASE_URL=mysql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:3306/kfashion
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
JWT_SECRET=<YOUR_JWT_SECRET>
```

### 4. AWS Configuration (Optional)
```
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
S3_BUCKET=<YOUR_S3_BUCKET>
```

### 5. Redis (Optional)
```
UPSTASH_REDIS_REST_URL=<YOUR_UPSTASH_URL>
UPSTASH_REDIS_REST_TOKEN=<YOUR_UPSTASH_TOKEN>
```

## After Adding Variables

1. Click "Save" for each variable
2. Go to Deployments tab
3. Click on the latest deployment
4. Click "Redeploy" → "Redeploy"
5. Wait for deployment to complete

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
