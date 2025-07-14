# Create S3 Bucket for Product Images

## 1. Create S3 Bucket

In AWS Console:
1. Go to S3 service
2. Click "Create bucket"
3. Configure:
   - **Bucket name**: `k-fashion-platform-images`
   - **Region**: `ap-northeast-1` (Tokyo)
   - **Object Ownership**: ACLs disabled
   - **Block Public Access**: Block all public access (✓)
   - **Bucket Versioning**: Disable
   - **Encryption**: Amazon S3 managed keys (SSE-S3)

## 2. Configure CORS

After bucket creation, go to Permissions → CORS and add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-domain.com",
      "https://*.vercel.app"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## 3. Create Bucket Policy

In Permissions → Bucket Policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAppUserAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/k-fashion-app-user"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::k-fashion-platform-images/*"
    }
  ]
}
```

## 4. Create Folder Structure

Create these folders in the bucket:
- `/products/` - Product images
- `/brands/` - Brand logos
- `/banners/` - Marketing banners
- `/temp/` - Temporary uploads

## 5. Set Up Lifecycle Rules (Optional)

To manage costs, create lifecycle rules:
1. Go to Management → Lifecycle rules
2. Create rule for `/temp/` folder:
   - Delete objects after 1 day
3. Create rule for old versions:
   - Delete previous versions after 30 days