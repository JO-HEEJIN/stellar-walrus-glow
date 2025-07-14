# 🎯 Super Simple AWS Migration - Just Follow These Steps!

## 📱 What You Need Before Starting
1. **Email access** to master@k-fashions.com
2. **Credit card** (AWS will charge $1 then refund)
3. **Phone** that can receive SMS
4. **30-45 minutes** of time
5. **Your computer** with the project open

---

## 🏃 STEP 1: Create AWS Account (10 mins)

### Do This:
```
1. Go to → aws.amazon.com
2. Click → "Create an AWS Account" (orange button)
3. Enter:
   Email: master@k-fashions.com
   Account name: K-Fashion Platform
4. Click → "Verify email address"
5. Check email → Copy code → Paste it
6. Create password → Write it down! 
7. Fill your info → Click continue
8. Add credit card → Click continue
9. Enter SMS code from phone
10. Choose "Basic support - Free"
```

✅ **Done?** You have an AWS account!

---

## 🔒 STEP 2: Add Security (5 mins)

### Do This:
```
1. Download "Google Authenticator" app on your phone
2. In AWS → Click your name (top right) → "Security credentials"
3. Find "Multi-factor authentication (MFA)"
4. Click → "Assign MFA device"
5. Choose → "Authenticator app" 
6. Click → "Show QR code"
7. On phone → Open Google Authenticator → Tap "+" → Scan QR code
8. Type the 6 numbers from app into AWS (twice)
9. Click → "Assign MFA"
```

✅ **Done?** Your account is secure!

---

## 👤 STEP 3: Make Login System (15 mins)

### Find Cognito:
```
1. In AWS → Search bar at top → Type "Cognito" → Click it
2. Top right → Change region to "Asia Pacific (Tokyo)"
3. Click → "Create user pool"
```

### Fill These Screens:
```
Screen 1: Click only "Email" → Click "Next"
Screen 2: Choose "No MFA" → Click "Next"  
Screen 3: Keep defaults → Click "Next"
Screen 4: Keep defaults → Click "Next"
Screen 5: 
   - User pool name: k-fashion-platform
   - App client name: k-fashion-web-client
   - Click "Next"
Screen 6: Click "Create user pool"
```

### Copy These 3 Things:
After creation, find and copy:
1. **User Pool ID**: `ap-northeast-1_XXXXXXXXX`
2. **Client ID**: (long random letters/numbers)
3. **Client Secret**: Click "Show" then copy

### One More Thing:
```
1. Click your pool name
2. Click "App integration" tab
3. Find your app → Click it
4. Click "Edit" next to "Hosted UI"
5. In "Allowed callback URLs" paste:
   http://localhost:3000/api/auth/callback/cognito
6. In "Allowed sign-out URLs" paste:
   http://localhost:3000
7. Check these boxes:
   ✓ Authorization code grant
   ✓ OpenID
   ✓ Email
   ✓ Profile
8. Click "Save changes"
```

✅ **Done?** Login system created!

---

## 💻 STEP 4: Update Your Code (5 mins)

### In VS Code:
```
1. Open your project
2. Find file ".env.local" (or create it)
3. Replace these 3 lines with your values:

COGNITO_CLIENT_ID=paste-your-client-id
COGNITO_CLIENT_SECRET=paste-your-client-secret  
COGNITO_ISSUER=https://cognito-idp.ap-northeast-1.amazonaws.com/your-pool-id

4. Save file (Cmd+S or Ctrl+S)
5. In terminal: npm run dev
6. Test login at http://localhost:3000
```

✅ **Done?** Local code updated!

---

## 🚀 STEP 5: Update Vercel (5 mins)

### Do This:
```
1. Go to → vercel.com → Login
2. Click → Your project
3. Click → "Settings" → "Environment Variables"
4. Update these 3:
   - COGNITO_CLIENT_ID → Edit → Paste new value → Save
   - COGNITO_CLIENT_SECRET → Edit → Paste new value → Save
   - COGNITO_ISSUER → Edit → Paste new value → Save
5. Go back → Click "Redeploy"
```

✅ **Done?** Your app is migrated!

---

## 📝 Save This Information!

Create a new text file on your desktop called `MY-AWS-INFO.txt`:

```
=== SAVE THIS INFO ===
AWS Login Page: https://console.aws.amazon.com/
Email: master@k-fashions.com
Password: [your password]

Cognito Info:
User Pool ID: [paste here]
Client ID: [paste here]
Client Secret: [paste here]

Date Created: [today]
===================
```

---

## ❓ Need Help?

### Problem: "Login doesn't work"
→ Solution: Check you copied the 3 values correctly (no extra spaces!)

### Problem: "I see an error"
→ Solution: 
1. Check .env.local file saved
2. Stop server (Ctrl+C)
3. Run: npm run dev
4. Try again

### Problem: "I'm lost"
→ Solution: Take a break, then start from where you left off

---

## 🎉 You Did It!

Your app now uses YOUR AWS account. Users can login and you control everything!

**Next time we'll add:**
- S3 (for images) 
- Database (for data)
- Backups (for safety)

But for now, you're done! Take a coffee break! ☕