const { S3Client, PutBucketPolicyCommand, PutPublicAccessBlockCommand } = require('@aws-sdk/client-s3')
require('dotenv').config()

const client = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const bucketName = process.env.S3_BUCKET

// Bucket policy to allow public read access
const bucketPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'PublicReadGetObject',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${bucketName}/*`
    },
    {
      Sid: 'AllowDirectUpload',
      Effect: 'Allow',
      Principal: '*',
      Action: [
        's3:PutObject',
        's3:PutObjectAcl'
      ],
      Resource: `arn:aws:s3:::${bucketName}/*`,
      Condition: {
        StringEquals: {
          's3:x-amz-acl': 'public-read'
        }
      }
    }
  ]
}

async function updateS3Permissions() {
  try {
    console.log('Updating S3 bucket permissions...')
    
    // 1. Disable public access block (to allow public read)
    console.log('1. Updating public access block settings...')
    const publicAccessBlockCommand = new PutPublicAccessBlockCommand({
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false,
      },
    })
    
    await client.send(publicAccessBlockCommand)
    console.log('   ✓ Public access block updated')
    
    // 2. Apply bucket policy
    console.log('2. Applying bucket policy...')
    const policyCommand = new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy, null, 2),
    })
    
    await client.send(policyCommand)
    console.log('   ✓ Bucket policy applied')
    
    console.log('\n✅ S3 permissions updated successfully!')
    console.log('\nBucket policy applied:')
    console.log(JSON.stringify(bucketPolicy, null, 2))
    
  } catch (error) {
    console.error('❌ Error updating S3 permissions:', error)
    process.exit(1)
  }
}

updateS3Permissions()