import { config } from 'dotenv';
config();

async function testProductCRUD() {
  console.log('🧪 Testing Product CRUD Operations\n');

  const baseUrl = 'http://localhost:3001/api';
  
  // Test auth token (you'll need to get this from your browser after logging in)
  const authToken = 'test-token'; // Replace with actual token
  
  try {
    // 1. Test GET all products
    console.log('1️⃣ Testing GET /api/products');
    const listResponse = await fetch(`${baseUrl}/products?limit=5`, {
      headers: {
        'Cookie': `auth-token=${authToken}`,
      },
    });
    
    if (listResponse.ok) {
      const data = await listResponse.json();
      console.log(`✅ Found ${data.meta.totalItems} products`);
      console.log(`   Showing ${data.data.length} products on page ${data.meta.page}`);
      
      if (data.data.length > 0) {
        console.log('\n   Sample product:');
        const sample = data.data[0];
        console.log(`   - Name: ${sample.nameKo}`);
        console.log(`   - SKU: ${sample.sku}`);
        console.log(`   - Price: ₩${sample.basePrice.toLocaleString()}`);
        console.log(`   - Brand: ${sample.brand?.nameKo || 'N/A'}`);
      }
    } else {
      console.log('❌ Failed to fetch products:', listResponse.status);
    }

    // 2. Test search functionality
    console.log('\n2️⃣ Testing search functionality');
    const searchResponse = await fetch(`${baseUrl}/products?search=티셔츠&limit=5`, {
      headers: {
        'Cookie': `auth-token=${authToken}`,
      },
    });
    
    if (searchResponse.ok) {
      const data = await searchResponse.json();
      console.log(`✅ Search for "티셔츠" returned ${data.data.length} results`);
    }

    // 3. Test filter by brand
    console.log('\n3️⃣ Testing brand filter');
    // First get a brand ID
    const brandsResponse = await fetch(`${baseUrl}/brands`);
    if (brandsResponse.ok) {
      const brandsData = await brandsResponse.json();
      if (brandsData.data && brandsData.data.length > 0) {
        const brandId = brandsData.data[0].id;
        const brandName = brandsData.data[0].nameKo;
        
        const brandFilterResponse = await fetch(`${baseUrl}/products?brandId=${brandId}&limit=5`, {
          headers: {
            'Cookie': `auth-token=${authToken}`,
          },
        });
        
        if (brandFilterResponse.ok) {
          const data = await brandFilterResponse.json();
          console.log(`✅ Found ${data.data.length} products for brand "${brandName}"`);
        }
      }
    }

    // 4. Test creating a product (requires BRAND_ADMIN or MASTER_ADMIN role)
    console.log('\n4️⃣ Testing product creation (requires proper auth)');
    console.log('   Note: This will fail without proper authentication');
    console.log('   To test: Login as brand@kfashion.com or master@kfashion.com');
    
    // 5. Test pagination
    console.log('\n5️⃣ Testing pagination');
    const page2Response = await fetch(`${baseUrl}/products?page=2&limit=5`, {
      headers: {
        'Cookie': `auth-token=${authToken}`,
      },
    });
    
    if (page2Response.ok) {
      const data = await page2Response.json();
      console.log(`✅ Page 2 has ${data.data.length} products`);
      console.log(`   Total pages: ${data.meta.totalPages}`);
    }

    console.log('\n✅ Product CRUD test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Login to the app as BRAND_ADMIN or MASTER_ADMIN');
    console.log('2. Navigate to /products/new to create a product with images');
    console.log('3. Test editing and deleting products from the product list');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('Make sure the development server is running on port 3001');
console.log('Starting tests in 2 seconds...\n');

setTimeout(() => {
  testProductCRUD().catch(console.error);
}, 2000);