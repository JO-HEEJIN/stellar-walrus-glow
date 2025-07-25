import { config } from 'dotenv';
config();

async function testInventoryManagement() {
  console.log('🧪 Testing Inventory Management\n');

  const baseUrl = 'http://localhost:3001/api';
  
  try {
    // 1. Get products to find one to test with
    console.log('1️⃣ Getting products list...');
    const productsResponse = await fetch(`${baseUrl}/products?limit=5`);
    
    if (!productsResponse.ok) {
      throw new Error(`Failed to fetch products: ${productsResponse.status}`);
    }
    
    const productsData = await productsResponse.json();
    
    if (!productsData.data || productsData.data.length === 0) {
      console.log('❌ No products found to test inventory with');
      return;
    }
    
    const testProduct = productsData.data[0];
    console.log(`✅ Using product: ${testProduct.nameKo} (SKU: ${testProduct.sku})`);
    console.log(`   Current inventory: ${testProduct.inventory}`);
    
    // 2. Test inventory increment
    console.log('\n2️⃣ Testing inventory increment...');
    const incrementResponse = await fetch(`${baseUrl}/products/${testProduct.id}/inventory`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'increment',
        quantity: 5,
        reason: 'Testing inventory increment'
      })
    });
    
    if (incrementResponse.ok) {
      const incrementData = await incrementResponse.json();
      console.log(`✅ Inventory incremented from ${incrementData.data.previousInventory} to ${incrementData.data.newInventory}`);
    } else {
      console.log('❌ Failed to increment inventory:', incrementResponse.status);
    }
    
    // 3. Test inventory decrement
    console.log('\n3️⃣ Testing inventory decrement...');
    const decrementResponse = await fetch(`${baseUrl}/products/${testProduct.id}/inventory`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'decrement',
        quantity: 3,
        reason: 'Testing inventory decrement'
      })
    });
    
    if (decrementResponse.ok) {
      const decrementData = await decrementResponse.json();
      console.log(`✅ Inventory decremented from ${decrementData.data.previousInventory} to ${decrementData.data.newInventory}`);
    } else {
      console.log('❌ Failed to decrement inventory:', decrementResponse.status);
    }
    
    // 4. Test inventory set
    console.log('\n4️⃣ Testing inventory set...');
    const setResponse = await fetch(`${baseUrl}/products/${testProduct.id}/inventory`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'set',
        quantity: 100,
        reason: 'Testing inventory set operation'
      })
    });
    
    if (setResponse.ok) {
      const setData = await setResponse.json();
      console.log(`✅ Inventory set from ${setData.data.previousInventory} to ${setData.data.newInventory}`);
    } else {
      console.log('❌ Failed to set inventory:', setResponse.status);
    }
    
    // 5. Test negative inventory prevention
    console.log('\n5️⃣ Testing negative inventory prevention...');
    const negativeResponse = await fetch(`${baseUrl}/products/${testProduct.id}/inventory`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'decrement',
        quantity: 1000, // More than current inventory
        reason: 'Testing negative inventory prevention'
      })
    });
    
    if (!negativeResponse.ok) {
      console.log('✅ Correctly prevented negative inventory (expected behavior)');
      const error = await negativeResponse.json();
      console.log(`   Error: ${error.error?.message || 'Insufficient inventory'}`);
    } else {
      console.log('❌ Should have prevented negative inventory!');
    }
    
    console.log('\n✅ Inventory management test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Navigate to http://localhost:3001/inventory');
    console.log('2. Try updating inventory through the UI');
    console.log('3. Check the audit logs for tracking');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('Make sure the development server is running on port 3001');
console.log('Starting tests in 2 seconds...\n');

setTimeout(() => {
  testInventoryManagement().catch(console.error);
}, 2000);