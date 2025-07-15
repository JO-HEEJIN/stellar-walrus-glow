#!/bin/bash

# Script to create users in the new User Pool with username support
# This script will read the User Pool ID from .env.local file

set -e

REGION="us-east-2"

echo "🔧 Creating Users in New User Pool (Username Support)"
echo "Region: $REGION"
echo ""

# Read User Pool ID from .env.local
if [ -f ".env.local" ]; then
    USER_POOL_ID=$(grep "COGNITO_USER_POOL_ID=" .env.local | cut -d'=' -f2)
    echo "User Pool ID: $USER_POOL_ID"
else
    echo "❌ .env.local file not found. Please create the User Pool first."
    exit 1
fi

if [ -z "$USER_POOL_ID" ]; then
    echo "❌ COGNITO_USER_POOL_ID not found in .env.local"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI is configured"

# Function to create group if it doesn't exist
create_group_if_not_exists() {
    local group_name=$1
    local description=$2
    
    if aws cognito-idp get-group --group-name "$group_name" --user-pool-id "$USER_POOL_ID" --region "$REGION" >/dev/null 2>&1; then
        echo "📋 Group '$group_name' already exists"
    else
        echo "➕ Creating group: $group_name"
        aws cognito-idp create-group \
            --group-name "$group_name" \
            --user-pool-id "$USER_POOL_ID" \
            --description "$description" \
            --region "$REGION"
        echo "✅ Created group: $group_name"
    fi
}

# Function to create user if it doesn't exist (NEW: supports username)
create_user_if_not_exists() {
    local username=$1
    local real_email=$2
    local system_email=$3
    local name=$4
    local temp_password=$5
    
    if aws cognito-idp admin-get-user --username "$username" --user-pool-id "$USER_POOL_ID" --region "$REGION" >/dev/null 2>&1; then
        echo "👤 User '$username' already exists"
    else
        echo "➕ Creating user: $username"
        echo "   Real Email: $real_email"
        echo "   System Email: $system_email"
        echo "   Name: $name"
        
        aws cognito-idp admin-create-user \
            --user-pool-id "$USER_POOL_ID" \
            --username "$username" \
            --user-attributes \
                Name=email,Value="$system_email" \
                Name=email_verified,Value=true \
                Name=name,Value="$name" \
                Name=custom:real_email,Value="$real_email" \
            --temporary-password "$temp_password" \
            --message-action SUPPRESS \
            --region "$REGION"
        
        # Set permanent password
        echo "🔑 Setting permanent password for $username"
        aws cognito-idp admin-set-user-password \
            --user-pool-id "$USER_POOL_ID" \
            --username "$username" \
            --password "$temp_password" \
            --permanent \
            --region "$REGION"
        
        echo "✅ Created user: $username"
        echo ""
    fi
}

# Function to add user to group
add_user_to_group() {
    local username=$1
    local group_name=$2
    
    echo "👥 Adding $username to group $group_name"
    aws cognito-idp admin-add-user-to-group \
        --user-pool-id "$USER_POOL_ID" \
        --username "$username" \
        --group-name "$group_name" \
        --region "$REGION" || echo "⚠️  Failed to add $username to $group_name (might already be in group)"
}

echo "🏗️  Creating Groups..."

# Create groups
create_group_if_not_exists "master-admins" "Master administrators with full access"
create_group_if_not_exists "brand-admins" "Brand administrators with brand management access"
create_group_if_not_exists "buyers" "Regular buyers with shopping access"

echo ""
echo "👥 Creating Users with Username System..."

# Create users with new username system (kf001, kf002, kf003)
create_user_if_not_exists "kf001" "master.admin@gmail.com" "kf001@k-fashions.com" "마스터관리자" "TempPass123!"
create_user_if_not_exists "kf002" "brand.admin@gmail.com" "kf002@k-fashions.com" "브랜드관리자" "TempPass123!"
create_user_if_not_exists "kf003" "buyer.user@gmail.com" "kf003@k-fashions.com" "구매자사용자" "TempPass123!"

echo ""
echo "🔗 Adding Users to Groups..."

# Add users to groups
add_user_to_group "kf001" "master-admins"
add_user_to_group "kf002" "brand-admins"
add_user_to_group "kf003" "buyers"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Test Credentials (Username System):"
echo "======================================"
echo "🔑 Master Admin:"
echo "   Username: kf001"
echo "   Real Email: master.admin@gmail.com"
echo "   System Email: kf001@k-fashions.com"
echo "   Password: TempPass123!"
echo "   Name: 마스터관리자"
echo "   Role: MASTER_ADMIN"
echo ""
echo "🔑 Brand Admin:"
echo "   Username: kf002"
echo "   Real Email: brand.admin@gmail.com"
echo "   System Email: kf002@k-fashions.com"
echo "   Password: TempPass123!"
echo "   Name: 브랜드관리자"
echo "   Role: BRAND_ADMIN"
echo ""
echo "🔑 Buyer:"
echo "   Username: kf003"
echo "   Real Email: buyer.user@gmail.com"
echo "   System Email: kf003@k-fashions.com"
echo "   Password: TempPass123!"
echo "   Name: 구매자사용자"
echo "   Role: BUYER"
echo ""
echo "⚠️  Important Notes:"
echo "- Username login is now supported! (kf001, kf002, kf003)"
echo "- Each user has two emails: real email and system email"
echo "- Passwords are set to permanent (no forced change required)"
echo "- Email verification is automatically set to true"
echo ""
echo "🧪 Test Features:"
echo "================"
echo "🔐 Login Test:"
echo "   Visit: http://localhost:3002/login"
echo "   Use Username: kf001, Password: TempPass123!"
echo ""
echo "🔍 Username Finder Test:"
echo "   Visit: http://localhost:3002/find-username"
echo "   Try: Name=마스터관리자, Email=master.admin@gmail.com → k***1"
echo "   Try: Name=브랜드관리자, Email=brand.admin@gmail.com → k***2"
echo "   Try: Name=구매자사용자, Email=buyer.user@gmail.com → k***3"
echo ""
echo "🌐 Next Steps:"
echo "1. Test authentication at: http://localhost:3002/login"
echo "2. Test username finder at: http://localhost:3002/find-username"
echo "3. Verify role-based access in dashboard"
echo "4. Update production environment variables when ready"