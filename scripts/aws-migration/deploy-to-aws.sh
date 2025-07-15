#!/bin/bash

# 🚀 AWS CloudFront + S3 Deployment Script
# 
# This script automates the deployment of your Next.js app to AWS
# using S3 for static hosting and CloudFront for global distribution.

set -e  # Exit on any error

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="k-fashion-platform"
REGION="ap-northeast-1"  # Tokyo region
BUCKET_NAME="${APP_NAME}-static-hosting-$(date +%s)"

echo -e "${BLUE}🚀 Starting AWS deployment for ${APP_NAME}${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first:${NC}"
    echo "   curl 'https://awscli.amazonaws.com/AWSCLIV2.pkg' -o 'AWSCLIV2.pkg'"
    echo "   sudo installer -pkg AWSCLIV2.pkg -target /"
    exit 1
fi

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS is not configured. Please run: aws configure${NC}"
    exit 1
fi

# Step 1: Build the static site
echo -e "${YELLOW}📦 Building static site...${NC}"
npm run build:static

if [ ! -d "out" ]; then
    echo -e "${RED}❌ Build failed - 'out' directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Static build completed${NC}"

# Step 2: Create S3 bucket
echo -e "${YELLOW}🪣 Creating S3 bucket: ${BUCKET_NAME}${NC}"

aws s3 mb s3://${BUCKET_NAME} --region ${REGION}

# Configure bucket for static website hosting
aws s3 website s3://${BUCKET_NAME} \
    --index-document index.html \
    --error-document 404.html

echo -e "${GREEN}✅ S3 bucket created and configured${NC}"

# Step 3: Upload files to S3
echo -e "${YELLOW}📤 Uploading files to S3...${NC}"

aws s3 sync out/ s3://${BUCKET_NAME}/ \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --region ${REGION}

# Upload HTML files with shorter cache
aws s3 sync out/ s3://${BUCKET_NAME}/ \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --region ${REGION}

echo -e "${GREEN}✅ Files uploaded to S3${NC}"

# Step 4: Create CloudFront distribution
echo -e "${YELLOW}☁️ Creating CloudFront distribution...${NC}"

# Create distribution configuration
cat > cloudfront-config.json << EOF
{
    "CallerReference": "${APP_NAME}-$(date +%s)",
    "Comment": "${APP_NAME} Static Website",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3Origin",
                "DomainName": "${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3Origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "Enabled": true,
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/404.html",
                "ResponseCode": "404",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_100"
}
EOF

# Create the distribution
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json \
    --query 'Distribution.Id' \
    --output text)

# Clean up config file
rm cloudfront-config.json

echo -e "${GREEN}✅ CloudFront distribution created: ${DISTRIBUTION_ID}${NC}"

# Step 5: Get the distribution domain
echo -e "${YELLOW}🌐 Getting distribution URL...${NC}"

DISTRIBUTION_DOMAIN=$(aws cloudfront get-distribution \
    --id ${DISTRIBUTION_ID} \
    --query 'Distribution.DomainName' \
    --output text)

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}🎉 Your app is now deployed!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Information:${NC}"
echo -e "S3 Bucket: ${BUCKET_NAME}"
echo -e "CloudFront Distribution ID: ${DISTRIBUTION_ID}"
echo -e "CloudFront URL: https://${DISTRIBUTION_DOMAIN}"
echo ""
echo -e "${YELLOW}⏳ Note: CloudFront deployment can take 10-15 minutes to propagate globally${NC}"
echo ""
echo -e "${BLUE}💾 Save this information in a safe place!${NC}"

# Create deployment info file
cat > deployment-info.txt << EOF
K-Fashion Platform - AWS Deployment Information
=============================================

Deployment Date: $(date)
S3 Bucket: ${BUCKET_NAME}
CloudFront Distribution ID: ${DISTRIBUTION_ID}
CloudFront URL: https://${DISTRIBUTION_DOMAIN}
Region: ${REGION}

Next Steps:
1. Wait 10-15 minutes for CloudFront to deploy globally
2. Test your app at: https://${DISTRIBUTION_DOMAIN}
3. Configure your custom domain (optional)
4. Set up CI/CD for automated deployments

To update your app:
1. Run: npm run build:static
2. Upload to S3: aws s3 sync out/ s3://${BUCKET_NAME}/ --delete
3. Invalidate CloudFront: aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"
EOF

echo -e "${GREEN}📄 Deployment information saved to: deployment-info.txt${NC}"