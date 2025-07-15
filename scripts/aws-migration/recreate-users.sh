#!/bin/bash

# Script to recreate missing Cognito users

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Recreating Cognito Users${NC}"
echo "=================================="

# Configuration from your .env
USER_POOL_ID="us-east-2_0wMigvevV"
REGION="us-east-2"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "User Pool ID: $USER_POOL_ID"
echo "Region: $REGION"
echo ""

# Function to create or update user
create_or_update_user() {
    local email=$1
    local password=$2
    local name=$3
    local role=$4
    
    echo -e "\n${YELLOW}👤 Processing user: $email${NC}"
    
    # First, try to delete the user if it exists (in case it's in a bad state)
    echo "Cleaning up any existing user..."
    aws cognito-idp admin-delete-user \
        --user-pool-id $USER_POOL_ID \
        --username $email \
        --region $REGION &> /dev/null || true
    
    # Create the user
    echo "Creating user..."
    aws cognito-idp admin-create-user \
        --user-pool-id $USER_POOL_ID \
        --username $email \
        --user-attributes \
            Name=email,Value=$email \
            Name=email_verified,Value=true \
            Name=name,Value="$name" \
        --message-action SUPPRESS \
        --region $REGION
    
    if [[ $? -eq 0 ]]; then
        echo "Setting permanent password..."
        # Set permanent password
        aws cognito-idp admin-set-user-password \
            --user-pool-id $USER_POOL_ID \
            --username $email \
            --password "$password" \
            --permanent \
            --region $REGION
        
        if [[ $? -eq 0 ]]; then
            echo -e "${GREEN}✅ User created successfully!${NC}"
            echo -e "${BLUE}   Email: $email${NC}"
            echo -e "${BLUE}   Password: $password${NC}"
            echo -e "${BLUE}   Role: $role${NC}"
        else
            echo -e "${RED}❌ Failed to set password${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to create user${NC}"
    fi
}

# Create all three users
echo -e "\n${BLUE}🚀 Creating all users...${NC}"

create_or_update_user "master@k-fashions.com" "Master123!" "Master Admin" "MASTER_ADMIN"
create_or_update_user "brand@k-fashions.com" "Brand123!" "Brand Admin" "BRAND_ADMIN"
create_or_update_user "buyer@k-fashions.com" "Buyer123!" "Test Buyer" "BUYER"

# Verify users were created
echo -e "\n${YELLOW}📊 Verifying users...${NC}"
echo "Current users in the pool:"

aws cognito-idp list-users \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'Users[*].[Username,UserStatus,Attributes[?Name==`email`].Value|[0]]' \
    --output table

echo -e "\n${GREEN}✅ User recreation complete!${NC}"
echo ""
echo -e "${BLUE}📋 Login Credentials:${NC}"
echo "=================================="
echo -e "${YELLOW}Master Admin:${NC}"
echo "  Email: master@k-fashions.com"
echo "  Password: Master123!"
echo ""
echo -e "${YELLOW}Brand Admin:${NC}"
echo "  Email: brand@k-fashions.com"
echo "  Password: Brand123!"
echo ""
echo -e "${YELLOW}Buyer:${NC}"
echo "  Email: buyer@k-fashions.com"
echo "  Password: Buyer123!"
echo "=================================="
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "1. Users are now created with verified emails"
echo "2. Passwords are set as permanent (no reset required)"
echo "3. Try logging in at http://localhost:3000"
echo ""
echo -e "${RED}🔥 If users keep disappearing:${NC}"
echo "1. Check if there's a Lambda trigger deleting users"
echo "2. Check CloudTrail logs for deletion events"
echo "3. Verify no automation is running"