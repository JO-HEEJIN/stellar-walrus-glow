# AWS Cognito Setup Guide

## User Pool Information
- **User Pool ID**: ap-northeast-1_xV5GZRniK
- **App Client Name**: kFashion-c6n47r
- **Client ID**: r03rnf7k4b9fafv8rs5av22it
- **Region**: ap-northeast-1 (Tokyo)

## Setting Up Groups (via AWS Console)

1. Go to AWS Cognito Console
2. Select your User Pool (ap-northeast-1_xV5GZRniK)
3. Navigate to "Groups" tab
4. Create the following groups:

### Groups to Create:
| Group Name | Description | Role Mapping |
|------------|-------------|--------------|
| master-admins | Master administrators with full system access | MASTER_ADMIN |
| brand-admins | Brand administrators who can manage their own brand | BRAND_ADMIN |
| buyers | Wholesale buyers who can place orders | BUYER |

## Creating Test Users (via AWS Console)

1. In your User Pool, go to "Users" tab
2. Click "Create user"
3. Create the following test users:

### Test Users:
| Username/Email | Name | Group | Initial Password |
|----------------|------|-------|------------------|
| master@kfashion.com | Master Admin | master-admins | TestPass123! |
| brand@kfashion.com | Brand Admin | brand-admins | TestPass123! |
| buyer@kfashion.com | Test Buyer | buyers | TestPass123! |

### Steps for Each User:
1. **Create User**:
   - Username: Use email address
   - Email: Same as username
   - Mark email as verified
   - Temporary password: Set a strong temporary password

2. **Add to Group**:
   - After creating the user, click on the user
   - Go to "Group membership" tab
   - Add user to appropriate group

## Setting Up with AWS CLI

If you have AWS CLI configured, you can run:

```bash
# Install AWS SDK if not already installed
npm install -g @aws-sdk/client-cognito-identity-provider

# Run the setup script
node scripts/setup-cognito-users.js
```

Make sure you have AWS credentials configured:
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Enter region: ap-northeast-1
# Enter output format: json
```

## Testing the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/login

3. Click "AWS Cognito로 로그인"

4. Log in with one of the test accounts:
   - Email: master@kfashion.com
   - Password: TestPass123!

5. You should be redirected to the dashboard showing your role

## Cognito App Client Settings

Make sure your App Client has the following settings:

### 1. Hosted UI Domain
First, you need to set up a Cognito domain:
1. Go to "App integration" tab
2. Click on "Domain" 
3. Create a domain like: `kfashion-c6n47r.auth.ap-northeast-1.amazoncognito.com`
4. Save the domain

### 2. App Client Settings
Click on your app client and configure:

#### Authentication Flows:
- [x] ALLOW_USER_PASSWORD_AUTH
- [x] ALLOW_REFRESH_TOKEN_AUTH
- [x] ALLOW_USER_SRP_AUTH

#### Hosted UI Settings:
- **Callback URLs**: 
  ```
  http://localhost:3000/api/auth/callback/cognito
  ```
  (For production, add: `https://your-domain.com/api/auth/callback/cognito`)
  
- **Sign out URLs**:
  ```
  http://localhost:3000
  ```
  (For production, add: `https://your-domain.com`)

- **Identity Providers**: 
  - [x] Cognito User Pool

- **Allowed OAuth Flows**:
  - [x] Authorization code grant
  
- **Allowed OAuth Scopes**:
  - [x] email
  - [x] openid
  - [x] profile
  - [x] aws.cognito.signin.user.admin (optional)

### 3. Save Changes
Click "Save changes" at the bottom of the page.

## Troubleshooting

### Common Issues:

1. **"Invalid redirect_uri" error**:
   - Make sure callback URL is added to App Client settings
   - URL must match exactly (including trailing slashes)

2. **"User does not exist" error**:
   - Ensure user is created in the correct user pool
   - Check that email is verified

3. **Role not showing correctly**:
   - Verify user is added to the correct group
   - Check that group names match the code expectations

4. **Cannot sign in**:
   - Check that authentication flows are enabled in App Client
   - Ensure password meets Cognito password policy

## Production Considerations

1. **Password Policy**: Set strong password requirements in User Pool settings
2. **MFA**: Enable Multi-Factor Authentication for admin users
3. **Account Recovery**: Configure account recovery options
4. **Email Configuration**: Set up SES for sending emails
5. **Lambda Triggers**: Consider adding triggers for custom authentication flows

## Next Steps

After setting up users and groups:
1. Test login with each role type
2. Verify role-based access control works
3. Configure production domain in Cognito
4. Set up custom email templates
5. Enable CloudWatch logging for monitoring