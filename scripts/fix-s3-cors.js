const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3')
require('dotenv').config()

const client = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedOrigins: [
        'https://k-fashions.com',
        'https://*.k-fashions.com',
        'http://localhost:3000',
        'http://localhost:3001',
        'https://*.vercel.app'
      ],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3000,
    },
  ],
}

async function updateS3Cors() {
  try {
    console.log('Updating S3 CORS configuration...')
    
    const command = new PutBucketCorsCommand({
      Bucket: process.env.S3_BUCKET,
      CORSConfiguration: corsConfiguration,
    })

    const response = await client.send(command)
    console.log('S3 CORS configuration updated successfully:', response)
    
    console.log('Applied CORS rules:')
    corsConfiguration.CORSRules.forEach((rule, index) => {
      console.log(`Rule ${index + 1}:`)
      console.log(`  Origins: ${rule.AllowedOrigins.join(', ')}`)
      console.log(`  Methods: ${rule.AllowedMethods.join(', ')}`)
      console.log(`  Headers: ${rule.AllowedHeaders.join(', ')}`)
    })
    
  } catch (error) {
    console.error('Error updating S3 CORS:', error)
    process.exit(1)
  }
}

updateS3Cors()