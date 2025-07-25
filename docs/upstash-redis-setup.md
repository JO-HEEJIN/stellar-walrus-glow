# Upstash Redis Setup Guide

This guide will help you set up Upstash Redis for the K-Fashion platform's caching layer.

## Why Upstash Redis?

- **Serverless**: Pay per request, automatic scaling
- **Global**: Edge locations worldwide for low latency
- **Compatible**: Drop-in replacement for Redis
- **Managed**: No infrastructure management needed

## Setup Steps

### 1. Create Upstash Account

1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub/Google or email
3. Verify your email address

### 2. Create Redis Database

1. **Click "Create Database"**
2. **Configure Database:**
   - **Name**: `k-fashion-cache`
   - **Type**: Regional (for consistent latency)
   - **Region**: Choose closest to your app servers
     - US East (N. Virginia) - us-east-1
     - Europe (Ireland) - eu-west-1
     - Asia Pacific (Tokyo) - ap-northeast-1
   - **Plan**: Pay as you Scale (recommended for production)

3. **Advanced Settings:**
   - **Eviction Policy**: `allkeys-lru` (removes least recently used keys)
   - **Max Memory**: Leave default (will auto-scale)
   - **TLS**: Enabled (default)

### 3. Get Connection Details

After creation, you'll see:

**Database URL:**
```
https://caring-cobra-12345.upstash.io
```

**REST Token:**
```
AXXXASQgxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Configure Environment Variables

Add to your `.env` file:

```bash
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://caring-cobra-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXASQgxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cache Configuration (optional)
CACHE_DEFAULT_TTL=300
CACHE_PRODUCT_TTL=300
CACHE_BRAND_TTL=1800
CACHE_ANALYTICS_TTL=300
```

### 5. Test Redis Connection

Create a test script or use our built-in test:

```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Test connection
async function testRedis() {
  try {
    await redis.set('test', 'Hello Upstash!')
    const result = await redis.get('test')
    console.log('✅ Redis test successful:', result)
    
    await redis.del('test')
    console.log('✅ Cleanup completed')
  } catch (error) {
    console.error('❌ Redis test failed:', error)
  }
}

testRedis()
```

## Performance Configuration

### 1. Connection Settings

For optimal performance, configure these settings in your cache implementation:

```typescript
// lib/cache.ts
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  retry: {
    retries: 3,
    retryDelayOnFailure: 1000,
  },
  requestTimeout: 5000, // 5 second timeout
})
```

### 2. Cache Strategy

**High-Frequency Data (Short TTL):**
- Product listings: 1-5 minutes
- Inventory levels: 30 seconds
- User sessions: 1 hour

**Stable Data (Long TTL):**
- Brand information: 30 minutes
- Category data: 1 hour
- System configuration: 24 hours

**Analytics Data (Medium TTL):**
- Daily metrics: 5 minutes
- Real-time counters: 1 minute

### 3. Memory Management

**Key Naming Convention:**
```
product:list:search={query}&page={page}
product:{id}
brand:{id}
analytics:overview:{date}
inventory:{productId}
```

**Efficient Data Storage:**
- Use JSON for complex objects
- Compress large payloads if needed
- Set appropriate TTLs to prevent memory bloat

## Monitoring and Analytics

### 1. Upstash Console

Monitor your Redis usage:
- **Requests per second**
- **Memory usage**
- **Hit/miss ratios**
- **Response times**

### 2. Application Monitoring

Use our built-in monitoring:

```typescript
import { trackCache } from '@/lib/monitoring'

// Track cache hits/misses
const cachedData = await redis.get(key)
if (cachedData) {
  trackCache(true) // Cache hit
  return JSON.parse(cachedData)
} else {
  trackCache(false) // Cache miss
  // Fetch fresh data...
}
```

### 3. Alerts

Set up alerts for:
- High memory usage (>80%)
- Low hit rate (<70%)
- High response times (>100ms)
- Error rate increase

## Security Best Practices

### 1. Access Control

- **REST API**: Secured with tokens (already implemented)
- **IP Restrictions**: Configure in Upstash console if needed
- **Environment Variables**: Never commit tokens to git

### 2. Data Encryption

- **In Transit**: TLS enabled by default
- **At Rest**: Upstash encrypts all data
- **Sensitive Data**: Don't cache sensitive information

### 3. Token Management

```bash
# Rotate tokens periodically
# Generate new token in Upstash console
# Update environment variables
# Deploy with zero downtime
```

## Cost Optimization

### 1. Usage Patterns

Monitor and optimize:
- **Read/Write Ratio**: Aim for high read ratio
- **Cache Hit Rate**: Target 80%+ hit rate
- **TTL Settings**: Balance freshness vs cost

### 2. Pricing Tiers

**Pay as you Scale:**
- $0.20 per 100K requests
- $0.50 per GB storage per month
- No minimum commitment

**Fixed Plans** (if high usage):
- Pro: $60/month for 1M requests
- Pro+: $280/month for 10M requests

### 3. Cost Reduction Tips

- Set appropriate TTLs to reduce storage
- Use cache warming strategically
- Monitor unused keys and adjust TTLs
- Consider data compression for large objects

## Troubleshooting

### Common Issues:

1. **Connection Timeouts**
   ```bash
   Error: Request timeout
   ```
   - Check network connectivity
   - Increase timeout settings
   - Verify Upstash service status

2. **Authentication Errors**
   ```bash
   Error: Invalid token
   ```
   - Verify UPSTASH_REDIS_REST_TOKEN
   - Check token hasn't been rotated
   - Ensure URL and token match

3. **Memory Limits**
   ```bash
   Error: Out of memory
   ```
   - Review TTL settings
   - Check for memory leaks
   - Consider upgrading plan

4. **High Latency**
   - Choose region closer to application
   - Optimize payload sizes
   - Use connection pooling

## Testing Your Setup

Run our cache test script:

```bash
npm run test:cache
```

Or manually test with curl:

```bash
# Set a value
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"key": "test", "value": "hello"}' \
     https://your-endpoint.upstash.io/set

# Get the value
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-endpoint.upstash.io/get/test
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Connection tested successfully
- [ ] Monitoring enabled
- [ ] Appropriate TTLs set
- [ ] Error handling implemented
- [ ] Security tokens secured
- [ ] Backup/recovery plan (if needed)
- [ ] Cost monitoring set up

## Integration with K-Fashion Platform

Our caching layer automatically:
- ✅ Caches product listings and details
- ✅ Caches brand information
- ✅ Caches analytics data
- ✅ Handles cache invalidation
- ✅ Provides fallback to database
- ✅ Tracks performance metrics

After setup, your application will automatically start using Redis caching with no code changes required!