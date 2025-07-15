#!/bin/bash

# Script to create new User Pool with username support for K-Fashion platform

set -e

REGION="us-east-2"
POOL_NAME="K-Fashion-UserPool-v2"

echo "🏗️  Creating New User Pool with Username Support"
echo "Region: $REGION"
echo "Pool Name: $POOL_NAME"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI is configured"

echo "📋 Creating User Pool..."

# Create User Pool with username support
USER_POOL_RESULT=$(aws cognito-idp create-user-pool \
    --pool-name "$POOL_NAME" \
    --policies '{
        "PasswordPolicy": {
            "MinimumLength": 8,
            "RequireUppercase": true,
            "RequireLowercase": true,
            "RequireNumbers": true,
            "RequireSymbols": false
        }
    }' \
    --username-configuration '{
        "CaseSensitive": false
    }' \
    --auto-verified-attributes email \
    --verification-message-template '{
        "DefaultEmailOption": "CONFIRM_WITH_CODE"
    }' \
    --admin-create-user-config '{
        "AllowAdminCreateUserOnly": true,
        "UnusedAccountValidityDays": 365
    }' \
    --account-recovery-setting '{
        "RecoveryMechanisms": [
            {
                "Priority": 1,
                "Name": "verified_email"
            }
        ]
    }' \
    --schema '[
        {
            "Name": "email",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        },
        {
            "Name": "name",
            "AttributeDataType": "String", 
            "Required": false,
            "Mutable": true
        },
        {
            "Name": "real_email",
            "AttributeDataType": "String",
            "Required": false,
            "Mutable": true,
            "DeveloperOnlyAttribute": false
        }
    ]' \
    --region "$REGION" \
    --output json)

USER_POOL_ID=$(echo "$USER_POOL_RESULT" | jq -r '.UserPool.Id')
echo "✅ User Pool created: $USER_POOL_ID"

echo ""
echo "📱 Creating User Pool Client..."

# Create User Pool Client
CLIENT_RESULT=$(aws cognito-idp create-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-name "K-Fashion-WebApp" \
    --generate-secret \
    --explicit-auth-flows "ADMIN_NO_SRP_AUTH" "ALLOW_USER_SRP_AUTH" "ALLOW_REFRESH_TOKEN_AUTH" \
    --supported-identity-providers "COGNITO" \
    --callback-urls "http://localhost:3002/api/auth/callback/cognito" "https://your-domain.com/api/auth/callback/cognito" \
    --logout-urls "http://localhost:3002" "https://your-domain.com" \
    --allowed-o-auth-flows "code" \
    --allowed-o-auth-scopes "openid" "email" "profile" \
    --allowed-o-auth-flows-user-pool-client \
    --prevent-user-existence-errors "ENABLED" \
    --enable-token-revocation \
    --region "$REGION" \
    --output json)

CLIENT_ID=$(echo "$CLIENT_RESULT" | jq -r '.UserPoolClient.ClientId')
CLIENT_SECRET=$(echo "$CLIENT_RESULT" | jq -r '.UserPoolClient.ClientSecret')

echo "✅ User Pool Client created: $CLIENT_ID"

echo ""
echo "🌐 User Pool Domain..."

# Create User Pool Domain (optional, for hosted UI)
DOMAIN_NAME="k-fashion-auth-$(date +%s)"
aws cognito-idp create-user-pool-domain \
    --domain "$DOMAIN_NAME" \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" >/dev/null || echo "⚠️  Domain creation failed (may already exist)"

echo "✅ Domain created (if available): $DOMAIN_NAME"

echo ""
echo "📋 New Cognito Configuration:"
echo "=============================="
echo "COGNITO_USER_POOL_ID=$USER_POOL_ID"
echo "COGNITO_CLIENT_ID=$CLIENT_ID"
echo "COGNITO_CLIENT_SECRET=$CLIENT_SECRET"
echo "COGNITO_ISSUER=https://cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID"
echo ""

# Update .env files
echo "📝 Updating environment files..."

# Update .env
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%s)
    sed -i.tmp "s/COGNITO_USER_POOL_ID=.*/COGNITO_USER_POOL_ID=$USER_POOL_ID/" .env
    sed -i.tmp "s/COGNITO_CLIENT_ID=.*/COGNITO_CLIENT_ID=$CLIENT_ID/" .env
    sed -i.tmp "s/COGNITO_CLIENT_SECRET=.*/COGNITO_CLIENT_SECRET=$CLIENT_SECRET/" .env
    sed -i.tmp "s|COGNITO_ISSUER=.*|COGNITO_ISSUER=https://cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID|" .env
    rm .env.tmp
    echo "✅ Updated .env"
fi

# Update .env.local
if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup.$(date +%s)
    sed -i.tmp "s/COGNITO_USER_POOL_ID=.*/COGNITO_USER_POOL_ID=$USER_POOL_ID/" .env.local
    sed -i.tmp "s/COGNITO_CLIENT_ID=.*/COGNITO_CLIENT_ID=$CLIENT_ID/" .env.local
    sed -i.tmp "s/COGNITO_CLIENT_SECRET=.*/COGNITO_CLIENT_SECRET=$CLIENT_SECRET/" .env.local
    sed -i.tmp "s|COGNITO_ISSUER=.*|COGNITO_ISSUER=https://cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID|" .env.local
    rm .env.local.tmp
    echo "✅ Updated .env.local"
fi

echo ""
echo "🎉 New User Pool Setup Complete!"
echo ""
echo "🔄 Next Steps:"
echo "1. The environment files have been automatically updated"
echo "2. Run the user creation script:"
echo "   ./scripts/recreate-cognito-users-v2.sh"
echo "3. Test the new authentication system"
echo ""
echo "📋 Important Notes:"
echo "- Username format: kf001, kf002, kf003 (now supported!)"
echo "- Email format: user@domain.com (stored separately)"
echo "- The old User Pool will remain but won't be used"
echo ""
echo "⚠️  Don't forget to:"
echo "- Update your production environment variables"
echo "- Test all authentication flows"
echo "- Update any hardcoded User Pool references"