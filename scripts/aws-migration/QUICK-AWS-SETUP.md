# 🚀 Quick AWS Setup for CloudFront + S3 Deployment

## 📋 Prerequisites

**You need:**
1. AWS Account (already have ✅)
2. AWS CLI installed 
3. AWS credentials configured
4. 15-20 minutes

---

## 🔧 Step 1: Install AWS CLI (if not installed)

### macOS:
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

### Verify installation:
```bash
aws --version
```

---

## 🔑 Step 2: Configure AWS Credentials

### Create IAM User:
1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. User name: `k-fashion-deployer`
4. Check "Programmatic access"
5. Attach policies:
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
6. Save the **Access Key ID** and **Secret Access Key**

### Configure CLI:
```bash
aws configure
```

**Enter these values:**
```
AWS Access Key ID: [your-access-key]
AWS Secret Access Key: [your-secret-key]
Default region name: ap-northeast-1
Default output format: json
```

---

## 🧪 Step 3: Test Your Setup

```bash
# Test AWS connection
aws sts get-caller-identity

# Should show your account info
```

---

## 🚀 Step 4: Deploy Your App

```bash
# Navigate to your project
cd /path/to/your/project

# Run the deployment script
./scripts/aws-migration/deploy-to-aws.sh
```

**What this script does:**
1. ✅ Builds your app as static files
2. ✅ Creates S3 bucket for hosting
3. ✅ Uploads your app files
4. ✅ Creates CloudFront distribution
5. ✅ Gives you the live URL

---

## 📊 Expected Output

```
🚀 Starting AWS deployment for k-fashion-platform
=====================================
📦 Building static site...
✅ Static build completed
🪣 Creating S3 bucket: k-fashion-platform-static-hosting-1234567890
✅ S3 bucket created and configured
📤 Uploading files to S3...
✅ Files uploaded to S3
☁️ Creating CloudFront distribution...
✅ CloudFront distribution created: E1234567890ABC
🌐 Getting distribution URL...
✅ Deployment completed!
=====================================
🎉 Your app is now deployed!

📋 Deployment Information:
S3 Bucket: k-fashion-platform-static-hosting-1234567890
CloudFront Distribution ID: E1234567890ABC
CloudFront URL: https://d1234567890abc.cloudfront.net

⏳ Note: CloudFront deployment can take 10-15 minutes to propagate globally
```

---

## 🎯 After Deployment

### Test Your App:
1. Wait 10-15 minutes for CloudFront to deploy
2. Open the CloudFront URL in your browser
3. Test login functionality

### For Future Updates:
```bash
# 1. Build new version
npm run build:static

# 2. Upload to S3
aws s3 sync out/ s3://your-bucket-name/ --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR-DISTRIBUTION-ID \
  --paths "/*"
```

---

## 🆘 Troubleshooting

### Problem: "aws: command not found"
**Solution:** Install AWS CLI (Step 1)

### Problem: "Unable to locate credentials"
**Solution:** Run `aws configure` (Step 2)

### Problem: "Access Denied"
**Solution:** Check your IAM user has S3 and CloudFront permissions

### Problem: "Build failed"
**Solution:** Run `npm install` and try again

---

## 💰 Cost Estimate

**Monthly costs for small app:**
- S3 Storage (1GB): ~$0.02
- CloudFront (10GB transfer): ~$1.00
- **Total: ~$1-2/month**

Much cheaper than Vercel Pro! 🎉

---

## 🎉 You're Done!

Your app is now:
- ✅ Hosted on AWS
- ✅ Globally distributed via CloudFront
- ✅ Super fast and reliable
- ✅ Cost-effective

**Next step:** Test your deployment and celebrate! 🎊