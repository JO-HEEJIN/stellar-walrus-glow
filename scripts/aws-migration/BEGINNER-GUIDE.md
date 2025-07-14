# 🚀 Complete AWS Migration Guide for Beginners

## What We're Doing
We're moving your K-Fashion app from an old AWS account to a new one. Think of it like moving from an old house to a new house - we need to pack everything up and set it up in the new place.

---

# Part 1: Create Your New AWS Account (30 minutes)

## Step 1: Go to AWS Website
1. Open your web browser (Chrome, Safari, etc.)
2. Type this in the address bar: `aws.amazon.com`
3. Click the orange button that says **"Create an AWS Account"**

## Step 2: Fill in Your Information
You'll see a form. Fill it out like this:

1. **Root user email address**: `master@k-fashions.com`
2. **AWS account name**: `K-Fashion Platform`
3. Click **"Verify email address"**

## Step 3: Check Your Email
1. Open your email (master@k-fashions.com)
2. Look for email from AWS
3. Copy the verification code
4. Paste it back in AWS website
5. Click **"Verify"**

## Step 4: Set Your Password
1. Create a strong password (write it down somewhere safe!)
   - Example: `KFashion2024!@#AWS`
   - Must have uppercase, lowercase, numbers, and symbols
2. Confirm password (type it again)
3. Click **"Continue"**

## Step 5: Contact Information
Fill in your business information:
- **Full name**: Your name
- **Phone number**: Your phone
- **Country**: South Korea
- **Address**: Your business address
- **City**: Your city
- **State/Province**: Your province
- **Postal code**: Your postal code

Click **"Continue"**

## Step 6: Payment Information
AWS needs a credit card (they'll charge $1 to verify, then refund it):
1. Enter your credit card number
2. Enter expiration date
3. Enter CVV (3 numbers on back of card)
4. Check the box to accept terms
5. Click **"Verify and Continue"**

## Step 7: Phone Verification
1. Choose **"Text message (SMS)"**
2. Enter your phone number
3. Click **"Send SMS"**
4. Enter the 4-digit code you receive
5. Click **"Continue"**

## Step 8: Choose Support Plan
1. Select **"Basic support - Free"**
2. Click **"Complete sign up"**

🎉 **Congratulations! You now have an AWS account!**

---

# Part 2: Secure Your Account (15 minutes)

## Step 1: First Login
1. You'll see "Go to the AWS Management Console"
2. Click it
3. Sign in with:
   - Root user email: `master@k-fashions.com`
   - Password: (the one you created)

## Step 2: Enable MFA (Extra Security)
This is like adding a second lock to your door:

1. Click your account name (top right corner)
2. Click **"Security credentials"**
3. Find **"Multi-factor authentication (MFA)"**
4. Click **"Assign MFA device"**
5. Choose **"Authenticator app"**
6. Install Google Authenticator on your phone:
   - iPhone: Go to App Store, search "Google Authenticator"
   - Android: Go to Play Store, search "Google Authenticator"
7. In AWS, click **"Show QR code"**
8. Open Google Authenticator app
9. Tap **"+"** then **"Scan QR code"**
10. Point phone camera at QR code on screen
11. Enter two codes from app into AWS
12. Click **"Assign MFA"**

## Step 3: Create an Admin User
Never use root account for daily work!

1. In AWS Console, search for **"IAM"** in top search bar
2. Click **"IAM"**
3. Click **"Users"** (left menu)
4. Click **"Create user"** button
5. User name: `kfashion-admin`
6. Check ✓ **"Provide user access to the AWS Management Console"**
7. Select **"I want to create an IAM user"**
8. Choose **"Custom password"**
9. Enter password: `KFashionAdmin2024!`
10. Uncheck **"User must create new password"**
11. Click **"Next"**
12. Select **"Attach policies directly"**
13. Search for and check: **"AdministratorAccess"**
14. Click **"Next"**
15. Click **"Create user"**
16. **IMPORTANT**: Click **"Download .csv"** and save this file!

---

# Part 3: Create Cognito (User Login System) - 20 minutes

## Step 1: Go to Cognito
1. In AWS Console (main page), use search bar at top
2. Type **"Cognito"**
3. Click **"Cognito"** when it appears

## Step 2: Choose Region
1. Look at top right, next to your account name
2. Click the region (might say "N. Virginia" or something)
3. Choose **"Asia Pacific (Tokyo)"** from the list

## Step 3: Create User Pool
1. Click big blue button **"Create user pool"**

### Screen 1: Sign-in Experience
1. Under "Cognito user pool sign-in options", check only: ✓ **Email**
2. Under "User name requirements", check: ✓ **Allow users to sign in with a preferred user name**
3. Make sure **"Make user name case sensitive"** is set to **No**
4. Click **"Next"**

### Screen 2: Security Requirements
1. Password policy - leave all defaults
2. Multi-factor authentication: Choose **"No MFA"**
3. User account recovery: Check only ✓ **"Enable self-service account recovery"**
4. Delivery method: Select **"Email only"**
5. Click **"Next"**

### Screen 3: Sign-up Experience
1. Self-registration: **"Enable self-registration"** should be ON
2. Attribute verification: Select **"Send verification code"**
3. Attributes to verify: Check ✓ **"Email"**
4. Keep "Allow Cognito to automatically send messages" as **Yes**
5. Required attributes: Check only ✓ **"email"** and ✓ **"name"**
6. Click **"Next"**

### Screen 4: Message Delivery
1. Email provider: Select **"Send email with Cognito"**
2. Leave other settings as default
3. Click **"Next"**

### Screen 5: App Integration
1. User pool name: `k-fashion-platform`
2. Under "Initial app client":
   - App client name: `k-fashion-web-client`
   - Client secret: Select **"Generate a client secret"**
3. Click **"Next"**

### Screen 6: Review and Create
1. Review everything
2. Scroll to bottom
3. Click **"Create user pool"**

## Step 4: Save Important Information
After creation, you'll see your user pool. We need 3 things:

1. Click on your user pool name `k-fashion-platform`
2. **User Pool ID**: Copy this (looks like: `ap-northeast-1_XXXXXXXXX`)
3. Click **"App integration"** tab
4. Scroll down to **"App client list"**
5. Click on `k-fashion-web-client`
6. **Client ID**: Copy this (long string of letters/numbers)
7. Click **"Show client secret"**
8. **Client secret**: Copy this (another long string)

**Save these in a text file like this:**
```
COGNITO_USER_POOL_ID=ap-northeast-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id-here
COGNITO_CLIENT_SECRET=your-client-secret-here
```

## Step 5: Configure App Client
Still on the same page:

1. Click **"Edit"** next to "Hosted UI"
2. Under "Allowed callback URLs" add these (press Enter after each):
   ```
   http://localhost:3000/api/auth/callback/cognito
   https://your-domain.vercel.app/api/auth/callback/cognito
   ```
3. Under "Allowed sign-out URLs" add:
   ```
   http://localhost:3000
   https://your-domain.vercel.app
   ```
4. Under "OAuth 2.0 grant types" check:
   - ✓ Authorization code grant
5. Under "OpenID Connect scopes" check:
   - ✓ OpenID
   - ✓ Email  
   - ✓ Profile
6. Click **"Save changes"**

---

# Part 4: Update Your Code (10 minutes)

## Step 1: Open Your Project
1. Open Visual Studio Code (or your code editor)
2. Open your k-fashion project folder

## Step 2: Create Environment File
1. Look for a file called `.env.local` in your project root
2. If it doesn't exist, create it:
   - Right-click in file explorer
   - Click "New File"
   - Name it `.env.local`

## Step 3: Update Environment Variables
Copy and paste this into `.env.local`, replacing with your values:

```bash
# These stay the same
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# These are NEW - replace with your values from Step 4 of Cognito
COGNITO_CLIENT_ID=paste-your-client-id-here
COGNITO_CLIENT_SECRET=paste-your-client-secret-here
COGNITO_ISSUER=https://cognito-idp.ap-northeast-1.amazonaws.com/paste-your-user-pool-id-here

# These we'll set up later
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=we-will-create-this-later
AWS_SECRET_ACCESS_KEY=we-will-create-this-later
S3_BUCKET=k-fashion-platform-images
DATABASE_URL=we-will-create-this-later

# These stay the same if you have them
UPSTASH_REDIS_REST_URL=your-existing-url-if-you-have-one
UPSTASH_REDIS_REST_TOKEN=your-existing-token-if-you-have-one
```

## Step 4: Test Your Changes
1. Open Terminal in VS Code (Terminal → New Terminal)
2. Type: `npm run dev`
3. Open browser to: `http://localhost:3000`
4. Try to login - it should use your new Cognito!

---

# Part 5: Update Vercel (10 minutes)

## Step 1: Login to Vercel
1. Go to `vercel.com`
2. Login with your account
3. Click on your `k-fashion` project

## Step 2: Update Environment Variables
1. Click **"Settings"** (top menu)
2. Click **"Environment Variables"** (left menu)
3. Update these one by one:

For each variable:
1. Find the variable name (like `COGNITO_CLIENT_ID`)
2. Click the **"..."** menu → **"Edit"**
3. Replace the value with your new one
4. Click **"Save"**

Variables to update:
- `COGNITO_CLIENT_ID`
- `COGNITO_CLIENT_SECRET`
- `COGNITO_ISSUER`

## Step 3: Redeploy
1. Go back to project overview
2. Click **"Redeploy"** button
3. Click **"Redeploy"** in popup
4. Wait for deployment to finish (2-3 minutes)

---

# What's Next?

You've completed the most important part - authentication! Your users can now login with the new AWS account.

Next steps (we can do these later):
1. **Create S3 bucket** - for storing product images
2. **Create database** - for storing all your data
3. **Set up backups** - to keep your data safe

---

# Troubleshooting

## "Login doesn't work"
1. Check `.env.local` has correct values
2. Make sure you saved the file
3. Restart dev server (Ctrl+C, then `npm run dev`)

## "Vercel shows error"
1. Check all environment variables are updated
2. Check for typos in values
3. Redeploy again

## "I forgot my password"
1. Go to AWS console
2. Click "Forgot password"
3. Check email for reset link

---

# Important Information to Save

Create a file called `AWS-CREDENTIALS.txt` on your computer (NOT in the project) and save:

```
AWS Account
-----------
Root Email: master@k-fashions.com
Root Password: [your password]
Account ID: [shown in AWS console top right]

Admin User
----------
Username: kfashion-admin
Password: KFashionAdmin2024!
Console URL: https://console.aws.amazon.com/

Cognito
-------
Region: ap-northeast-1 (Tokyo)
User Pool ID: [your pool id]
Client ID: [your client id]
Client Secret: [your client secret]

Created Date: [today's date]
```

Keep this file safe and secure!