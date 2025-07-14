# 👀 Visual Guide - What You'll See on Screen

This guide shows you exactly what to look for!

---

## 🏠 AWS Homepage (aws.amazon.com)

**What you see:**
```
[🖥️ Big page with clouds and text]
   
   Amazon Web Services
   ────────────────────
   
   [🔶 Create an AWS Account] ← CLICK THIS ORANGE BUTTON
   [      Sign In       ]
```

**What to do:** Click the orange "Create an AWS Account" button

---

## 📝 Account Creation Form

**What you see:**
```
Create a new AWS account
────────────────────────

Root user email address
[master@k-fashions.com        ] ← TYPE THIS

AWS account name  
[K-Fashion Platform           ] ← TYPE THIS

[    Verify email address     ] ← CLICK THIS
```

---

## 📧 Email Verification

**What you see in AWS:**
```
Verify your email address
─────────────────────────

Enter verification code
[      ] ← PASTE CODE HERE

[  Verify  ]
```

**What you see in your email:**
```
From: AWS <no-reply@signin.aws>
Subject: AWS Email Address Verification

Your verification code is: 123456
```

**What to do:** Copy `123456` and paste it in AWS

---

## 💳 Payment Page

**What you see:**
```
Payment Information
───────────────────

Credit or debit card
[1234 5678 9012 3456      ] ← YOUR CARD NUMBER

Expires: [12/25] CVV: [123] ← EXPIRY & CVV

Full name: [Your Name      ]
```

**Don't worry:** They charge $1 to verify, then give it back!

---

## 🔍 After Login - Finding Cognito

**What you see (AWS Console):**
```
    AWS Management Console
    ──────────────────────
    
    [🔍 Search services, features...] ← TYPE "cognito" HERE
    
    Services  Recently visited  Favorites
    ──────────────────────────────────
    
    [📱 Cognito]  ← CLICK THIS WHEN IT APPEARS
    [💾 S3     ]
    [🗄️ RDS    ]
```

---

## 🌏 Choosing Region

**What you see (top right corner):**
```
Your Name ▼    🌏 N. Virginia ▼    🔔    ❓    📱
                   └─────────┘
                   CLICK THIS
```

**What the dropdown looks like:**
```
Select a region
─────────────────
🇺🇸 US East (N. Virginia)
🇺🇸 US West (Oregon)
🇯🇵 Asia Pacific (Tokyo)  ← CLICK THIS ONE!
🇸🇬 Asia Pacific (Singapore)
🇦🇺 Asia Pacific (Sydney)
```

---

## 👥 Creating Cognito User Pool

**What you see:**
```
Amazon Cognito
──────────────

User pools    Identity pools
──────────    ──────────────

[🔷 Create user pool] ← CLICK THIS BLUE BUTTON
```

---

## 📋 User Pool Settings Screens

### Screen 1 - Sign-in Experience
**What you see:**
```
Configure sign-in experience
────────────────────────────

Cognito user pool sign-in options
☐ User name
☑ Email          ← CHECK ONLY THIS ONE
☐ Phone number

User name requirements  
☑ Allow users to sign in with a preferred user name ← CHECK THIS

[    Next    ]
```

### Screen 2 - Security
**What you see:**
```
Configure security requirements
───────────────────────────────

Multi-factor authentication (MFA)
○ No MFA         ← CLICK THIS
○ Optional MFA
○ Required MFA

[    Next    ]
```

### Screen 3 - Sign-up Experience  
**What you see:**
```
Configure sign-up experience
────────────────────────────

Self-registration
☑ Enable self-registration ← SHOULD BE CHECKED

Attribute verification and user account confirmation
☑ Send verification code ← CHECK THIS

Verifying attribute changes
☑ Email ← CHECK THIS

Required attributes
☑ email ← CHECK THIS  
☑ name  ← CHECK THIS

[    Next    ]
```

### Screen 4 - Message Delivery
**What you see:**
```
Configure message delivery
──────────────────────────

Email
○ Send email with Cognito ← CLICK THIS
○ Send email with Amazon SES

[    Next    ]
```

### Screen 5 - App Integration
**What you see:**
```
Integrate your app
──────────────────

User pool name
[k-fashion-platform] ← TYPE THIS

Initial app client
App client name: [k-fashion-web-client] ← TYPE THIS
Client secret: [Generate a client secret ▼] ← KEEP THIS

[    Next    ]
```

---

## 📊 After Creating User Pool

**What you see:**
```
User pool: k-fashion-platform
─────────────────────────────

User pool ID: ap-northeast-1_ABC123XYZ ← COPY THIS!

Tabs: [General settings] [App integration] [Sign-in experience] [Sign-up experience] [Message delivery]
```

**Click "App integration" tab, then you see:**
```
App integration
───────────────

App clients and analytics
Name: k-fashion-web-client ← CLICK THIS LINK

Client ID: 1a2b3c4d5e6f7g8h9i0j ← COPY THIS!
Client secret: [Show] ← CLICK SHOW, THEN COPY!
```

---

## 💻 What VS Code Looks Like

**File Explorer (left side):**
```
📁 your-project-folder
├── 📁 app
├── 📁 components  
├── 📁 lib
├── 📄 .env.local ← FIND THIS FILE (or create it)
├── 📄 package.json
└── 📄 README.md
```

**Inside .env.local file:**
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

COGNITO_CLIENT_ID=paste-here ← REPLACE WITH YOUR VALUE
COGNITO_CLIENT_SECRET=paste-here ← REPLACE WITH YOUR VALUE  
COGNITO_ISSUER=https://cognito-idp.ap-northeast-1.amazonaws.com/paste-pool-id-here

AWS_REGION=ap-northeast-1
```

---

## 🚀 What Vercel Looks Like

**Your dashboard:**
```
Vercel Dashboard
────────────────

🏠 Overview   👥 Teams   ⚙️ Settings

Your Projects:
┌─────────────────────────┐
│ 📱 k-fashion-platform  │ ← CLICK YOUR PROJECT
│ Last deployed: 2h ago  │
└─────────────────────────┘
```

**Settings page:**
```
Project Settings
────────────────

General  Functions  Domains  Environment Variables  Git
                                    ↑
                              CLICK THIS TAB
```

**Environment Variables page:**
```
Environment Variables
─────────────────────

🔍 Search variables...

Name                     Value                  Environment
COGNITO_CLIENT_ID       •••••••••••••••••••••   Production  [⋯ Edit]
COGNITO_CLIENT_SECRET   •••••••••••••••••••••   Production  [⋯ Edit]
COGNITO_ISSUER         •••••••••••••••••••••   Production  [⋯ Edit]
                                                           ↑
                                                      CLICK THESE
```

---

## ✅ Success! What You Should See

**When everything works:**

1. **Local development (localhost:3000):**
   ```
   🏠 K-Fashion Platform
   ─────────────────────
   
   [🔐 Login] [📝 Sign up] ← THESE SHOULD WORK!
   ```

2. **After clicking Login:**
   ```
   Sign in to your account
   ───────────────────────
   
   Email: [your-email@domain.com]
   Password: [••••••••••••••••]
   
   [Sign in] [Create account]
   ```

3. **After successful login:**
   ```
   Welcome back! 
   
   Dashboard  Products  Orders  Profile
   ─────────  ────────  ──────  ───────
   ```

**If you see this, YOU DID IT! 🎉**

---

## 🆘 Common Problems & What They Look Like

### Problem: Wrong region
**You see:**
```
Amazon Cognito

No user pools
Create your first user pool to get started
```

**Solution:** Change region to "Asia Pacific (Tokyo)" (top right)

### Problem: Forgot to save .env.local
**You see in terminal:**
```
Error: Environment variable COGNITO_CLIENT_ID is not defined
```

**Solution:** Check .env.local file is saved (Cmd+S or Ctrl+S)

### Problem: Login shows error
**You see:**
```
❌ Sign in failed
Invalid client credentials
```

**Solution:** Check you copied Client ID and Secret correctly (no spaces!)

---

Remember: Take your time, read carefully, and don't rush! 🐌✨