# RDS Connection Testing Guide

## Current Issue
Database is publicly accessible but Vercel still can't connect.

## Quick Fix - Allow All IPs Temporarily

1. Go to AWS EC2 → Security Groups
2. Find `k-fashion-aurora-sg (sg-05100156f994a4530)`
3. Edit inbound rules
4. Add rule:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: 0.0.0.0/0 (Anywhere IPv4)
   - Description: Temporary - Testing Vercel connection

## After Testing Works
Once connection is confirmed working:
1. Remove the 0.0.0.0/0 rule
2. Add these Vercel IP ranges instead:

### Vercel Production IPs (as of 2024):
```
76.76.21.0/24
76.223.126.0/24
76.76.19.0/24
```

### Additional IPs to consider:
```
35.90.0.0/16     # AWS us-west-2
54.148.0.0/15    # AWS us-west-2
44.224.0.0/11    # AWS us-west-2
```

## Alternative: Use RDS Proxy
For better security, consider AWS RDS Proxy which:
- Handles connection pooling
- Works better with serverless
- More secure than public access