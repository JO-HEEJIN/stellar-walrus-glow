# Create New Cognito User Pool

## 1. Login to AWS Console
- URL: https://console.aws.amazon.com
- Use your IAM admin user (not root)

## 2. Navigate to Cognito
- Search for "Cognito" in AWS Console
- Select region: `ap-northeast-1` (Tokyo)

## 3. Create User Pool
Click "Create user pool" and configure:

### Step 1: Configure sign-in experience
- **Cognito user pool sign-in options**: Email
- **User name requirements**: ✓ Allow users to sign in with a preferred user name
- **Enable case insensitivity**: ✓ Yes

### Step 2: Configure security requirements
- **Password policy**:
  - Minimum length: 8
  - Require: Numbers, lowercase, uppercase, symbols
- **Multi-factor authentication**: Optional
- **User account recovery**: Email only

### Step 3: Configure sign-up experience
- **Self-registration**: ✓ Enable
- **Attribute verification**: Email
- **Required attributes**:
  - email (required)
  - name
  - custom:role (String)
  - custom:brandId (String)

### Step 4: Configure message delivery
- **Email**: Use Cognito default
- **FROM email address**: no-reply@verificationemail.com

### Step 5: Integrate your app
- **User pool name**: `k-fashion-platform`
- **App client name**: `k-fashion-web-client`
- **Client secret**: Generate a client secret
- **Advanced app client settings**:
  - Authentication flows: ALLOW_USER_PASSWORD_AUTH, ALLOW_REFRESH_TOKEN_AUTH
  - OAuth 2.0 grant types: Authorization code grant
  - OpenID Connect scopes: openid, email, profile
  - Callback URLs: 
    - http://localhost:3000/api/auth/callback/cognito
    - https://your-domain.com/api/auth/callback/cognito
  - Sign out URLs:
    - http://localhost:3000
    - https://your-domain.com

### Step 6: Review and create
- Review all settings
- Click "Create user pool"

## 4. Save Important Values
After creation, note down:
- User Pool ID: `ap-northeast-1_XXXXXXXXX`
- App Client ID: `XXXXXXXXXXXXXXXXXXXXXXXXX`
- App Client Secret: `XXXXXXXXXXXXXXXXXXXXXXXXX`

## 5. Create Initial User Groups
In the User Pool, go to "Groups" and create:
- Group name: `MASTER_ADMIN`
- Group name: `BRAND_ADMIN`
- Group name: `BUYER`