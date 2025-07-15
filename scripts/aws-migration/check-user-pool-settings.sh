#!/bin/bash

# Script to check User Pool settings that might cause users to disappear

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Checking User Pool Settings${NC}"
echo "=================================="

USER_POOL_ID="us-east-2_0wMigvevV"
REGION="us-east-2"

# Get user pool details
echo -e "${YELLOW}📊 User Pool Configuration:${NC}"
aws cognito-idp describe-user-pool \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query '{
        Name: UserPool.Name,
        Status: UserPool.Status,
        UserAttributeUpdateSettings: UserPool.UserAttributeUpdateSettings,
        Policies: UserPool.Policies,
        DeletionProtection: UserPool.DeletionProtection,
        LambdaConfig: UserPool.LambdaConfig
    }' \
    --output json | jq '.'

# Check for Lambda triggers that might delete users
echo -e "\n${YELLOW}🔧 Lambda Triggers:${NC}"
LAMBDA_CONFIG=$(aws cognito-idp describe-user-pool \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'UserPool.LambdaConfig' \
    --output json)

if [ "$LAMBDA_CONFIG" != "{}" ] && [ "$LAMBDA_CONFIG" != "null" ]; then
    echo -e "${RED}⚠️  Lambda triggers found! These might be affecting users:${NC}"
    echo "$LAMBDA_CONFIG" | jq '.'
else
    echo -e "${GREEN}✅ No Lambda triggers configured${NC}"
fi

# Check password policy
echo -e "\n${YELLOW}🔒 Password Policy:${NC}"
aws cognito-idp describe-user-pool \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'UserPool.Policies.PasswordPolicy' \
    --output json | jq '.'

# Check user pool deletion protection
echo -e "\n${YELLOW}🛡️  Deletion Protection:${NC}"
DELETION_PROTECTION=$(aws cognito-idp describe-user-pool \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'UserPool.DeletionProtection' \
    --output text)

if [ "$DELETION_PROTECTION" == "ACTIVE" ]; then
    echo -e "${GREEN}✅ Deletion protection is ACTIVE${NC}"
else
    echo -e "${YELLOW}⚠️  Deletion protection is INACTIVE${NC}"
fi

# Check MFA configuration
echo -e "\n${YELLOW}🔐 MFA Configuration:${NC}"
aws cognito-idp describe-user-pool \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'UserPool.MfaConfiguration' \
    --output text

echo -e "\n${BLUE}📋 Common Issues That Cause Users to Disappear:${NC}"
echo "1. Lambda triggers that delete inactive users"
echo "2. User pool policies with expiration settings"
echo "3. External scripts or automation"
echo "4. Incorrect attribute requirements"
echo "5. MFA enforcement without proper setup"