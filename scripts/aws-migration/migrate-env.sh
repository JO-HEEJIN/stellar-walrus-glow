#!/bin/bash

# AWS Migration Helper Script
# This script helps update environment variables after AWS migration

echo "🚀 K-Fashion Platform AWS Migration Helper"
echo "========================================"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    touch .env.local
fi

# Backup current .env.local
echo "📦 Backing up current .env.local..."
cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)

# Function to update or add environment variable
update_env() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" .env.local; then
        # Update existing
        sed -i '' "s|^${key}=.*|${key}=${value}|" .env.local
        echo "✅ Updated: ${key}"
    else
        # Add new
        echo "${key}=${value}" >> .env.local
        echo "✅ Added: ${key}"
    fi
}

echo ""
echo "Please enter your new AWS configuration values:"
echo ""

# Cognito Configuration
read -p "Enter new COGNITO_CLIENT_ID: " COGNITO_CLIENT_ID
read -p "Enter new COGNITO_CLIENT_SECRET: " COGNITO_CLIENT_SECRET
read -p "Enter new Cognito User Pool ID (e.g., ap-northeast-1_XXXXXX): " USER_POOL_ID

# AWS Credentials
read -p "Enter new AWS_ACCESS_KEY_ID: " AWS_ACCESS_KEY_ID
read -p "Enter new AWS_SECRET_ACCESS_KEY: " AWS_SECRET_ACCESS_KEY

# S3 Bucket
read -p "Enter new S3_BUCKET name: " S3_BUCKET

# Database
read -p "Enter new DATABASE_URL (or press Enter to skip): " DATABASE_URL

# Update environment variables
echo ""
echo "📝 Updating environment variables..."

update_env "COGNITO_CLIENT_ID" "$COGNITO_CLIENT_ID"
update_env "COGNITO_CLIENT_SECRET" "$COGNITO_CLIENT_SECRET"
update_env "COGNITO_ISSUER" "https://cognito-idp.ap-northeast-1.amazonaws.com/${USER_POOL_ID}"
update_env "AWS_REGION" "ap-northeast-1"
update_env "AWS_ACCESS_KEY_ID" "$AWS_ACCESS_KEY_ID"
update_env "AWS_SECRET_ACCESS_KEY" "$AWS_SECRET_ACCESS_KEY"
update_env "S3_BUCKET" "$S3_BUCKET"

if [ ! -z "$DATABASE_URL" ]; then
    update_env "DATABASE_URL" "$DATABASE_URL"
fi

echo ""
echo "✅ Environment variables updated!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to test locally"
echo "2. Update Vercel environment variables"
echo "3. Test all features"
echo ""
echo "To update Vercel env vars, run:"
echo "  vercel env add COGNITO_CLIENT_ID production"
echo "  vercel env add COGNITO_CLIENT_SECRET production"
echo "  ... (repeat for all variables)"
echo ""
echo "Backup saved to: .env.local.backup.$(date +%Y%m%d_%H%M%S)"