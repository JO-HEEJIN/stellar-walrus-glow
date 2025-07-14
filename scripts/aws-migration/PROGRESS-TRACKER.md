# ✅ AWS Migration Progress Tracker

Print this page and check off each step as you complete it!

---

## 🎯 STEP 1: Create AWS Account
**Time needed: 10 minutes**

- [ ] Go to aws.amazon.com
- [ ] Click "Create an AWS Account"
- [ ] Enter email: master@k-fashions.com
- [ ] Enter account name: K-Fashion Platform  
- [ ] Verify email (check inbox)
- [ ] Create strong password
- [ ] Write down password somewhere safe
- [ ] Fill in contact information
- [ ] Add credit card (they'll charge $1 then refund)
- [ ] Verify phone number with SMS
- [ ] Choose "Basic support - Free"
- [ ] Complete signup

**✅ DONE? You have an AWS account!**

---

## 🔒 STEP 2: Secure Account
**Time needed: 5 minutes**

- [ ] Download Google Authenticator app on phone
- [ ] Login to AWS console
- [ ] Click your name (top right) → "Security credentials"
- [ ] Find "Multi-factor authentication (MFA)"
- [ ] Click "Assign MFA device"
- [ ] Choose "Authenticator app"
- [ ] Show QR code
- [ ] Scan QR code with Google Authenticator
- [ ] Enter two 6-digit codes from app
- [ ] Click "Assign MFA"

**✅ DONE? Your account is secure!**

---

## 👥 STEP 3: Create Login System (Cognito)
**Time needed: 15 minutes**

### Find Cognito:
- [ ] In AWS console, search for "Cognito"
- [ ] Click "Cognito"
- [ ] Change region to "Asia Pacific (Tokyo)" (top right)
- [ ] Click "Create user pool"

### Configure User Pool:
- [ ] **Screen 1**: Check only "Email" → Next
- [ ] **Screen 2**: Choose "No MFA" → Next
- [ ] **Screen 3**: Keep defaults → Next
- [ ] **Screen 4**: Keep defaults → Next
- [ ] **Screen 5**: 
  - [ ] User pool name: `k-fashion-platform`
  - [ ] App client name: `k-fashion-web-client`
  - [ ] Generate client secret: YES
  - [ ] Click Next
- [ ] **Screen 6**: Click "Create user pool"

### Save These 3 Important Values:
- [ ] **User Pool ID**: `ap-northeast-1_XXXXXXXXX` 
- [ ] **Client ID**: (long string of letters/numbers)
- [ ] **Client Secret**: Click "Show" then copy

Write them here:
```
User Pool ID: _________________________________
Client ID: ____________________________________
Client Secret: ________________________________
```

### Configure App Settings:
- [ ] Click your user pool name
- [ ] Click "App integration" tab
- [ ] Find your app client → Click it
- [ ] Click "Edit" next to "Hosted UI"
- [ ] Add callback URL: `http://localhost:3000/api/auth/callback/cognito`
- [ ] Add sign-out URL: `http://localhost:3000`
- [ ] Check: Authorization code grant, OpenID, Email, Profile
- [ ] Click "Save changes"

**✅ DONE? Login system created!**

---

## 💻 STEP 4: Update Your Code
**Time needed: 5 minutes**

- [ ] Open VS Code
- [ ] Open your project folder
- [ ] Find or create `.env.local` file
- [ ] Update these 3 lines with your values:

```
COGNITO_CLIENT_ID=your-client-id-here
COGNITO_CLIENT_SECRET=your-client-secret-here
COGNITO_ISSUER=https://cognito-idp.ap-northeast-1.amazonaws.com/your-pool-id-here
```

- [ ] Save file (Cmd+S or Ctrl+S)
- [ ] Open terminal in VS Code
- [ ] Run: `npm run dev`
- [ ] Test at: `http://localhost:3000`
- [ ] Try to login/register

**✅ DONE? Local code works!**

---

## 🚀 STEP 5: Update Vercel
**Time needed: 5 minutes**

- [ ] Go to vercel.com
- [ ] Login to your account
- [ ] Click on your project
- [ ] Click "Settings" → "Environment Variables"
- [ ] Edit `COGNITO_CLIENT_ID` → Paste new value → Save
- [ ] Edit `COGNITO_CLIENT_SECRET` → Paste new value → Save  
- [ ] Edit `COGNITO_ISSUER` → Paste new value → Save
- [ ] Go back to project overview
- [ ] Click "Redeploy"
- [ ] Wait for deployment (2-3 minutes)
- [ ] Test your live site

**✅ DONE? Your app is migrated!**

---

## 📝 STEP 6: Save Important Info
**Time needed: 2 minutes**

Create a file called `MY-AWS-INFO.txt` on your desktop:

- [ ] Copy this template:
```
=== MY AWS ACCOUNT INFO ===
Created: [today's date]

Login: https://console.aws.amazon.com/
Email: master@k-fashions.com
Password: [your password]

Cognito Details:
Region: ap-northeast-1 (Tokyo)
User Pool ID: [your pool id]
Client ID: [your client id]
Client Secret: [your client secret]

IMPORTANT: Keep this file safe!
========================
```

- [ ] Fill in all the details
- [ ] Save to desktop (NOT in your project)

**✅ DONE? Important info saved!**

---

## 🎉 Final Check

Test these things work:

- [ ] Can visit your live website
- [ ] Can register a new account
- [ ] Can login with email/password
- [ ] Can logout
- [ ] Can login again

**All working? CONGRATULATIONS! 🎊**

---

## 📞 Need Help?

### ❌ Something's not working?

1. **Take a break** (seriously!)
2. **Double-check** you copied the 3 Cognito values correctly
3. **No extra spaces** at the beginning or end
4. **Restart** your dev server: Ctrl+C then `npm run dev`
5. **Clear your browser cache** (Cmd+Shift+R or Ctrl+Shift+R)

### ✅ Everything working?

You're done with the hardest part! 

**Next steps** (for later):
- [ ] Create S3 bucket (for images)
- [ ] Create database (for data)  
- [ ] Set up backups (for safety)

But for now... **celebrate!** ☕🎂

---

## 📊 Migration Status

**Started:** _________________ (date/time)

**Finished:** ________________ (date/time)

**Total time:** ______________ minutes

**Difficulty (1-10):** ________

**Notes:**
________________________________
________________________________
________________________________

**Next review date:** _____________