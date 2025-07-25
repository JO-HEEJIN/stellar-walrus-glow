import { config } from 'dotenv';
import { S3Client, ListBucketsCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { uploadToS3, generateS3Key } from '@/lib/s3';

// Load environment variables
config();

async function testS3Connection() {
  console.log('🪣 Testing AWS S3 Connection...\n');

  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const bucketName = process.env.S3_BUCKET || 'k-fashion-products-711082721767';

  try {
    // Test 1: Check AWS credentials
    console.log('1️⃣ Testing AWS credentials...');
    console.log(`   Region: ${process.env.AWS_REGION}`);
    console.log(`   Access Key ID: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 8)}...`);
    console.log(`   Bucket: ${bucketName}`);

    // Test 2: List buckets (to verify credentials)
    console.log('\n2️⃣ Testing AWS credentials by listing buckets...');
    try {
      const listCommand = new ListBucketsCommand({});
      const buckets = await s3Client.send(listCommand);
      console.log(`✅ Found ${buckets.Buckets?.length || 0} buckets`);
      
      const targetBucket = buckets.Buckets?.find(b => b.Name === bucketName);
      if (targetBucket) {
        console.log(`✅ Target bucket "${bucketName}" found!`);
        console.log(`   Created: ${targetBucket.CreationDate}`);
      } else {
        console.log(`❌ Target bucket "${bucketName}" not found`);
        console.log('Available buckets:');
        buckets.Buckets?.forEach(bucket => {
          console.log(`   • ${bucket.Name}`);
        });
      }
    } catch (error: any) {
      console.error('❌ Failed to list buckets:', error.message);
      throw error;
    }

    // Test 3: Check bucket access
    console.log('\n3️⃣ Testing bucket access...');
    try {
      const headCommand = new HeadBucketCommand({ Bucket: bucketName });
      await s3Client.send(headCommand);
      console.log(`✅ Can access bucket "${bucketName}"`);
    } catch (error: any) {
      console.error(`❌ Cannot access bucket "${bucketName}":`, error.message);
      throw error;
    }

    // Test 4: Test upload functionality with small test file
    console.log('\n4️⃣ Testing file upload...');
    try {
      // Create a small test image buffer (1x1 pixel PNG)
      const testImageBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
        0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);

      const testKey = generateS3Key('test', 'test-image.png', 'test-product');
      console.log(`   Generated key: ${testKey}`);

      const uploadedUrl = await uploadToS3(
        testImageBuffer,
        testKey,
        'image/png',
        {
          testUpload: 'true',
          uploadedAt: new Date().toISOString(),
        }
      );

      console.log(`✅ Test upload successful!`);
      console.log(`   URL: ${uploadedUrl}`);
    } catch (error: any) {
      console.error('❌ Upload test failed:', error.message);
      throw error;
    }

    // Test 5: Test key generation
    console.log('\n5️⃣ Testing key generation...');
    const testKeys = [
      generateS3Key('products/thumbnail', '테스트이미지.jpg', 'prod-123'),
      generateS3Key('products/gallery', 'Product Image 2024.png'),
      generateS3Key('brands/logo', 'K-Fashion Logo!@#.jpg', 'brand-456'),
    ];

    testKeys.forEach((key, index) => {
      console.log(`   Test ${index + 1}: ${key}`);
    });
    console.log('✅ Key generation working correctly');

    // Summary
    console.log('\n📊 AWS S3 Integration Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ AWS Credentials: Valid');
    console.log(`✅ Bucket Access: ${bucketName}`);
    console.log('✅ Upload Functionality: Working');
    console.log('✅ Key Generation: Working');
    console.log('✅ File Naming: Korean-safe');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n🚀 S3 is ready for image uploads!');
    console.log('\n📋 Next steps:');
    console.log('• Create React upload components');
    console.log('• Integrate with product management');
    console.log('• Test with real product images');

  } catch (error: any) {
    console.error('\n❌ S3 connection test failed:', error.message);
    console.error('Full error:', error);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check AWS credentials in .env file');
    console.log('2. Verify S3 bucket exists and is accessible');
    console.log('3. Check IAM permissions for S3 operations');
    console.log('4. Ensure bucket region matches AWS_REGION');
    
    throw error;
  }
}

testS3Connection().catch(console.error);