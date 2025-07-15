#!/bin/bash

# Script to unlock a user and reset their status in Cognito

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔓 Unlocking Cognito User${NC}"
echo "=================================="

# Configuration
USER_POOL_ID="us-east-2_0wMigvevV"
REGION="us-east-2"

# Function to unlock and reset user
unlock_user() {
    local email=$1
    local new_password=$2
    
    echo -e "\n${YELLOW}🔧 Processing user: $email${NC}"
    
    # Check current user status
    echo "Checking user status..."
    USER_STATUS=$(aws cognito-idp admin-get-user \
        --user-pool-id $USER_POOL_ID \
        --username $email \
        --region $REGION \
        --query 'UserStatus' \
        --output text 2>/dev/null || echo "NOT_FOUND")
    
    echo "Current status: $USER_STATUS"
    
    if [ "$USER_STATUS" == "NOT_FOUND" ]; then
        echo -e "${RED}❌ User not found. Creating new user...${NC}"
        
        # Create the user
        aws cognito-idp admin-create-user \
            --user-pool-id $USER_POOL_ID \
            --username $email \
            --user-attributes \
                Name=email,Value=$email \
                Name=email_verified,Value=true \
                Name=name,Value="$(echo $email | cut -d'@' -f1)" \
            --message-action SUPPRESS \
            --region $REGION
        
        # Set permanent password
        aws cognito-idp admin-set-user-password \
            --user-pool-id $USER_POOL_ID \
            --username $email \
            --password "$new_password" \
            --permanent \
            --region $REGION
        
        echo -e "${GREEN}✅ User created and unlocked${NC}"
    else
        # Reset password (this also unlocks the user)
        echo "Resetting password to unlock user..."
        aws cognito-idp admin-set-user-password \
            --user-pool-id $USER_POOL_ID \
            --username $email \
            --password "$new_password" \
            --permanent \
            --region $REGION
        
        # Enable the user if disabled
        echo "Enabling user..."
        aws cognito-idp admin-enable-user \
            --user-pool-id $USER_POOL_ID \
            --username $email \
            --region $REGION
        
        echo -e "${GREEN}✅ User unlocked and password reset${NC}"
    fi
    
    # Verify final status
    NEW_STATUS=$(aws cognito-idp admin-get-user \
        --user-pool-id $USER_POOL_ID \
        --username $email \
        --region $REGION \
        --query 'UserStatus' \
        --output text)
    
    echo -e "${BLUE}New status: $NEW_STATUS${NC}"
    echo -e "${BLUE}New password: $new_password${NC}"
}

# Ask which user to unlock
echo -e "${YELLOW}Which user do you want to unlock?${NC}"
echo "1) master@k-fashions.com"
echo "2) brand@k-fashions.com" 
echo "3) buyer@k-fashions.com"
echo "4) All users"
echo "5) Custom email"

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        unlock_user "master@k-fashions.com" "Master123!"
        ;;
    2)
        unlock_user "brand@k-fashions.com" "Brand123!"
        ;;
    3)
        unlock_user "buyer@k-fashions.com" "Buyer123!"
        ;;
    4)
        echo -e "\n${BLUE}🔓 Unlocking all users...${NC}"
        unlock_user "master@k-fashions.com" "Master123!"
        unlock_user "brand@k-fashions.com" "Brand123!"
        unlock_user "buyer@k-fashions.com" "Buyer123!"
        ;;
    5)
        read -p "Enter email address: " custom_email
        read -p "Enter new password: " custom_password
        unlock_user "$custom_email" "$custom_password"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}✅ Unlock operation completed!${NC}"
echo ""
echo -e "${BLUE}📋 Ready to Test:${NC}"
echo "1. Go to http://localhost:3000"
echo "2. Try logging in with the credentials above"
echo "3. The account should now be unlocked"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "- Wait 30 seconds before trying to login"
echo "- Use the exact password shown above"
echo "- Don't make multiple rapid attempts"