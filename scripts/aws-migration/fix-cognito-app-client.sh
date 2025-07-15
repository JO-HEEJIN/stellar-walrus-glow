#!/bin/bash

# Script to fix Cognito App Client settings for NextAuth.js

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Fixing Cognito App Client for NextAuth.js${NC}"
echo "=================================================="

# Configuration
USER_POOL_ID="us-east-2_0wMigvevV"
REGION="us-east-2"
CLIENT_ID="m54agqq3voggceuulv2h0pjt1"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "User Pool ID: $USER_POOL_ID"
echo "Region: $REGION"
echo "Client ID: $CLIENT_ID"
echo ""

# Get current app client settings
echo -e "${YELLOW}🔍 Current App Client Settings:${NC}"
aws cognito-idp describe-user-pool-client \
    --user-pool-id $USER_POOL_ID \
    --client-id $CLIENT_ID \
    --region $REGION \
    --query 'UserPoolClient.{
        ClientName: ClientName,
        GenerateSecret: GenerateSecret,
        CallbackURLs: CallbackURLs,
        LogoutURLs: LogoutURLs,
        AllowedOAuthFlows: AllowedOAuthFlows,
        AllowedOAuthScopes: AllowedOAuthScopes,
        SupportedIdentityProviders: SupportedIdentityProviders,
        ExplicitAuthFlows: ExplicitAuthFlows
    }' \
    --output json | jq '.'

echo -e "\n${YELLOW}🔧 Updating App Client Settings...${NC}"

# Update the app client with correct settings for NextAuth.js
aws cognito-idp update-user-pool-client \
    --user-pool-id $USER_POOL_ID \
    --client-id $CLIENT_ID \
    --region $REGION \
    --callback-urls "http://localhost:3000/api/auth/callback/cognito" "https://k-fasions-git-main-momos-projects-2cacd960.vercel.app/api/auth/callback/cognito" \
    --logout-urls "http://localhost:3000" "https://k-fasions-git-main-momos-projects-2cacd960.vercel.app" \
    --allowed-o-auth-flows "code" \
    --allowed-o-auth-scopes "openid" "email" "profile" \
    --supported-identity-providers "COGNITO" \
    --explicit-auth-flows "ALLOW_ADMIN_USER_PASSWORD_AUTH" "ALLOW_USER_PASSWORD_AUTH" "ALLOW_USER_SRP_AUTH" "ALLOW_REFRESH_TOKEN_AUTH" \
    --allowed-o-auth-flows-user-pool-client

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ App Client updated successfully!${NC}"
else
    echo -e "${RED}❌ Failed to update App Client${NC}"
    exit 1
fi

# Get the updated settings
echo -e "\n${YELLOW}📊 Updated App Client Settings:${NC}"
UPDATED_CLIENT=$(aws cognito-idp describe-user-pool-client \
    --user-pool-id $USER_POOL_ID \
    --client-id $CLIENT_ID \
    --region $REGION)

echo "$UPDATED_CLIENT" | jq '.UserPoolClient.{
    ClientName: ClientName,
    GenerateSecret: GenerateSecret,
    CallbackURLs: CallbackURLs,
    LogoutURLs: LogoutURLs,
    AllowedOAuthFlows: AllowedOAuthFlows,
    AllowedOAuthScopes: AllowedOAuthScopes,
    SupportedIdentityProviders: SupportedIdentityProviders,
    ExplicitAuthFlows: ExplicitAuthFlows
}'

# Get the new client secret
echo -e "\n${YELLOW}🔑 New Client Secret:${NC}"
NEW_SECRET=$(echo "$UPDATED_CLIENT" | jq -r '.UserPoolClient.ClientSecret')
echo -e "${BLUE}CLIENT_SECRET: $NEW_SECRET${NC}"

echo -e "\n${GREEN}✅ Configuration Complete!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Update your .env file with the new client secret:${NC}"
echo "COGNITO_CLIENT_SECRET=$NEW_SECRET"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Update your .env file with the new client secret above"
echo "2. Restart your development server: npm run dev"
echo "3. Clear your browser cookies/cache"
echo "4. Try logging in again"