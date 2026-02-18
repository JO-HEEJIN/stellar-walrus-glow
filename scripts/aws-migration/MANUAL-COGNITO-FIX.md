# Manual Fix for Cognito App Client (PKCE Issue)

Since AWS CLI needs configuration, let's fix this manually in the AWS Console.

## Quick Manual Fix

### Step 1: Go to AWS Cognito Console
1. Open: https://console.aws.amazon.com/cognito/
2. **Make sure region is set to: US East (Ohio) - us-east-2**
3. Click on your User Pool

### Step 2: Update App Client Settings
1. Click **"App integration"** tab
2. Find your app client
3. Click **"Edit"**

### Step 3: Configure OAuth Settings
Update these settings:

**Allowed callback URLs:**
```
http://localhost:3000/api/auth/callback/cognito
https://<YOUR_VERCEL_DOMAIN>/api/auth/callback/cognito
```

**Allowed sign-out URLs:**
```
http://localhost:3000
https://<YOUR_VERCEL_DOMAIN>
```

**OAuth 2.0 grant types:**
- Authorization code grant

**OpenID Connect scopes:**
- OpenID
- Email
- Profile

### Step 4: Advanced Settings
Scroll down to **"Advanced app client settings"**:

**Authentication flows:**
- ALLOW_USER_PASSWORD_AUTH
- ALLOW_USER_SRP_AUTH
- ALLOW_REFRESH_TOKEN_AUTH
- ALLOW_ADMIN_USER_PASSWORD_AUTH

### Step 5: Save Changes
Click **"Save changes"**

## Alternative: Simple Code Fix

If the manual steps are too complex, we can try a simpler code-only fix.

Update your `.env` file and add this line:
```env
NEXTAUTH_URL=http://localhost:3000
```

Then restart your server:
```bash
npm run dev
```

## Test the Fix

1. **Clear browser cookies** (very important!)
   - Chrome: DevTools → Application → Storage → Clear site data
   - Or use incognito/private mode

2. **Go to**: http://localhost:3000

3. **Try logging in** with your credentials

## If Still Not Working

Try this temporary workaround - create a simple test page:

1. Go to: http://localhost:3000/api/auth/signin
2. This is NextAuth's built-in sign-in page
3. Choose "Cognito" provider
4. Enter your credentials

This bypasses any custom login form issues.

## Current Settings Summary

Your configuration should be:
- **User Pool ID**: Set via `COGNITO_USER_POOL_ID` env var
- **Client ID**: Set via `COGNITO_CLIENT_ID` env var
- **Region**: Set via `AWS_REGION` env var
- **Callback URL**: `http://localhost:3000/api/auth/callback/cognito`

**The manual AWS Console fix should resolve the PKCE cookie issue!**
