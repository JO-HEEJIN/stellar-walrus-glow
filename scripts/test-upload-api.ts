import { config } from 'dotenv';
import FormData from 'form-data';
import fs from 'fs';

// Load environment variables
config();

async function testUploadAPI() {
  console.log('🚀 Testing Upload API\n');

  try {
    // Create a small test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    // Save test image to temp file
    const tempFile = '/tmp/test-image.png';
    fs.writeFileSync(tempFile, testImageBuffer);

    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempFile), {
      filename: 'test-image.png',
      contentType: 'image/png',
    });
    formData.append('productId', 'test-product-123');
    formData.append('imageType', 'gallery');

    console.log('Uploading test image to /api/upload...');

    // Make request to upload API
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Add auth token for testing (you'll need to get this from your auth system)
        'Cookie': 'auth-token=test-token',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.text();
    console.log('Response body:', result);

    if (response.ok) {
      console.log('✅ Upload API test successful!');
      const data = JSON.parse(result);
      console.log('Uploaded image URL:', data.data?.url);
    } else {
      console.log('❌ Upload API test failed');
    }

    // Cleanup
    fs.unlinkSync(tempFile);

  } catch (error: any) {
    console.error('❌ API test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Only run if server is running
console.log('Make sure your development server is running (npm run dev)');
console.log('Then press Enter to continue...');

// For now, let's just show the test setup
console.log('\n📋 Upload API Test Setup Complete');
console.log('To test the upload API:');
console.log('1. Start the development server: npm run dev');
console.log('2. Navigate to: http://localhost:3000/test-upload');
console.log('3. Try uploading an image through the UI');
console.log('4. Check the console for any errors');

// testUploadAPI().catch(console.error);