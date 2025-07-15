#!/bin/bash

# Script to check Cognito setup and create test users

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Checking AWS Cognito Setup${NC}"
echo "=================================="

# Get values from .env file
USER_POOL_ID="us-east-2_0wMigvevV"
REGION="us-east-2"
CLIENT_ID="m54agqq3voggceuulv2h0pjt1"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "User Pool ID: $USER_POOL_ID"
echo "Region: $REGION"
echo "Client ID: $CLIENT_ID"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not configured. Please run: aws configure${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI is configured${NC}"

# Check User Pool exists
echo -e "\n${YELLOW}🏊 Checking User Pool...${NC}"
if aws cognito-idp describe-user-pool --user-pool-id $USER_POOL_ID --region $REGION &> /dev/null; then
    echo -e "${GREEN}✅ User Pool exists${NC}"
else
    echo -e "${RED}❌ User Pool not found! Check your configuration.${NC}"
    exit 1
fi

# Check App Client
echo -e "\n${YELLOW}📱 Checking App Client...${NC}"
APP_CLIENT=$(aws cognito-idp describe-user-pool-client \
    --user-pool-id $USER_POOL_ID \
    --client-id $CLIENT_ID \
    --region $REGION 2>&1)

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ App Client exists${NC}"
    
    # Check callback URLs
    echo -e "\n${YELLOW}🔗 App Client Settings:${NC}"
    echo "$APP_CLIENT" | grep -E "(CallbackURLs|LogoutURLs)" || echo "No callback URLs configured"
else
    echo -e "${RED}❌ App Client not found!${NC}"
    exit 1
fi

# List existing users
echo -e "\n${YELLOW}👥 Existing Users:${NC}"
USERS=$(aws cognito-idp list-users \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'Users[*].[Username,UserStatus,Attributes[?Name==`email`].Value|[0]]' \
    --output table 2>&1)

if [[ $? -eq 0 ]]; then
    echo "$USERS"
else
    echo -e "${RED}No users found or error listing users${NC}"
fi

# Ask if user wants to create test users
echo -e "\n${YELLOW}Would you like to create test users? (y/n)${NC}"
read -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Create test users
    echo -e "\n${BLUE}Creating test users...${NC}"
    
    # Function to create user
    create_user() {
        local email=$1
        local password=$2
        local name=$3
        
        echo -e "\n${YELLOW}Creating user: $email${NC}"
        
        # Create user
        aws cognito-idp admin-create-user \
            --user-pool-id $USER_POOL_ID \
            --username $email \
            --user-attributes Name=email,Value=$email Name=name,Value="$name" \
            --message-action SUPPRESS \
            --region $REGION &> /dev/null
        
        if [[ $? -eq 0 ]]; then
            # Set permanent password
            aws cognito-idp admin-set-user-password \
                --user-pool-id $USER_POOL_ID \
                --username $email \
                --password "$password" \
                --permanent \
                --region $REGION &> /dev/null
            
            if [[ $? -eq 0 ]]; then
                echo -e "${GREEN}✅ User created: $email / $password${NC}"
            else
                echo -e "${RED}❌ Failed to set password for $email${NC}"
            fi
        else
            echo -e "${RED}❌ User might already exist or creation failed${NC}"
        fi
    }
    
    # Create test users
    create_user "master@k-fashions.com" "Master123!" "Master Admin"
    create_user "brand@k-fashions.com" "Brand123!" "Brand Admin"
    create_user "buyer@k-fashions.com" "Buyer123!" "Test Buyer"
    
    echo -e "\n${GREEN}✅ Test users created!${NC}"
    echo -e "\n${BLUE}📋 Test Credentials:${NC}"
    echo "============================"
    echo "Master Admin:"
    echo "  Email: master@k-fashions.com"
    echo "  Password: Master123!"
    echo ""
    echo "Brand Admin:"
    echo "  Email: brand@k-fashions.com"
    echo "  Password: Brand123!"
    echo ""
    echo "Buyer:"
    echo "  Email: buyer@k-fashions.com"
    echo "  Password: Buyer123!"
    echo "============================"
fi

echo -e "\n${BLUE}🔧 Troubleshooting Tips:${NC}"
echo "1. Make sure your app's callback URLs are configured in Cognito"
echo "2. Check that your .env file has the correct values"
echo "3. Try logging in with the test credentials above"
echo "4. Check browser console for any errors"