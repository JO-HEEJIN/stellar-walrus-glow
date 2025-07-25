import { config } from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Load environment variables
config();

async function simpleS3Test() {
  console.log('🧪 Simple S3 Upload Test\n');

  // Create S3 client
  const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  console.log('S3 Client Configuration:');
  console.log(`  Region: ${process.env.AWS_REGION}`);
  console.log(`  Bucket: ${process.env.S3_BUCKET}`);
  console.log(`  Access Key: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 8)}...`);

  try {
    // Create a simple text file to upload
    const testContent = 'Hello from K-Fashion platform! This is a test upload.';
    const testBuffer = Buffer.from(testContent, 'utf8');

    const key = `test/simple-test-${Date.now()}.txt`;
    
    console.log(`\nUploading test file: ${key}`);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: testBuffer,
      ContentType: 'text/plain',
      Metadata: {
        testFile: 'true',
        uploadedAt: new Date().toISOString(),
      },
    });

    const result = await s3Client.send(command);
    
    console.log('✅ Upload successful!');
    console.log('Response:', result);
    
    const publicUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log(`Public URL: ${publicUrl}`);

  } catch (error: any) {
    console.error('❌ Upload failed:', error.message);
    console.error('Full error:', error);
  }
}

simpleS3Test().catch(console.error);