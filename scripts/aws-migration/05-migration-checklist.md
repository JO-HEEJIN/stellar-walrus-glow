# AWS Migration Checklist

## Pre-Migration
- [ ] Backup all current data (if any)
- [ ] Document current AWS resource IDs
- [ ] Notify users about potential downtime
- [ ] Create new AWS account with master@k-fashions.com

## AWS Account Setup
- [ ] Enable MFA on root account
- [ ] Create IAM admin user
- [ ] Set up billing alerts
- [ ] Enable CloudTrail for audit logging

## Cognito Migration
- [ ] Create new User Pool in ap-northeast-1
- [ ] Configure app client settings
- [ ] Create user groups (MASTER_ADMIN, BRAND_ADMIN, BUYER)
- [ ] Update COGNITO_CLIENT_ID in .env.local
- [ ] Update COGNITO_CLIENT_SECRET in .env.local
- [ ] Update COGNITO_ISSUER in .env.local
- [ ] Test authentication flow

## S3 Setup
- [ ] Create k-fashion-platform-images bucket
- [ ] Configure CORS settings
- [ ] Set up bucket policy
- [ ] Create folder structure
- [ ] Create IAM user with S3 permissions
- [ ] Update AWS_ACCESS_KEY_ID in .env.local
- [ ] Update AWS_SECRET_ACCESS_KEY in .env.local
- [ ] Update S3_BUCKET in .env.local
- [ ] Test file upload

## Database Setup
- [ ] Create Aurora Serverless v2 cluster
- [ ] Configure security groups
- [ ] Create database and user
- [ ] Update DATABASE_URL in .env.local
- [ ] Run Prisma migrations
- [ ] Run seed script
- [ ] Test database connection

## Application Updates
- [ ] Update all environment variables in Vercel
- [ ] Deploy to Vercel preview
- [ ] Test all features:
  - [ ] User registration
  - [ ] User login
  - [ ] Product creation
  - [ ] Image upload
  - [ ] Order creation
- [ ] Fix any issues found

## DNS and Domain
- [ ] Update DNS records if needed
- [ ] Update callback URLs in Cognito
- [ ] Test with production domain

## Post-Migration
- [ ] Delete resources from old AWS account
- [ ] Update documentation
- [ ] Monitor for 24 hours
- [ ] Create AWS cost budget alerts
- [ ] Schedule regular backups

## Rollback Plan
If issues occur:
1. Revert environment variables to old values
2. Redeploy previous version on Vercel
3. Investigate and fix issues
4. Retry migration

## Support Contacts
- AWS Support: https://console.aws.amazon.com/support
- Vercel Support: https://vercel.com/support
- Your email: master@k-fashions.com