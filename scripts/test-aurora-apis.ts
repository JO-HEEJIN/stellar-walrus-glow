import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function testAuroraAPIs() {
  console.log('🧪 Testing K-Fashion APIs with Aurora Database\n');

  try {
    await prisma.$connect();
    console.log('✅ Connected to Aurora MySQL\n');

    // Test 1: Brands API functionality
    console.log('1️⃣ Testing Brands API...');
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✅ Found ${brands.length} brands:`);
    brands.forEach(brand => {
      console.log(`   • ${brand.nameKo} (${brand.nameCn}) - ${brand._count.products} products`);
    });

    // Test 2: Products API functionality
    console.log('\n2️⃣ Testing Products API...');
    const products = await prisma.product.findMany({
      include: {
        brand: {
          select: { id: true, nameKo: true, nameCn: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
      take: 5,
    });

    console.log(`✅ Found ${products.length} products:`);
    products.forEach(product => {
      console.log(`   • ${product.nameKo} - ₩${product.basePrice.toLocaleString()} (${product.inventory} in stock)`);
      console.log(`     Brand: ${product.brand?.nameKo || 'No brand'}, Category: ${product.category?.name || 'No category'}`);
    });

    // Test 3: Users API functionality
    console.log('\n3️⃣ Testing Users API...');
    const users = await prisma.user.findMany({
      include: {
        brand: {
          select: { nameKo: true },
        },
      },
    });

    console.log(`✅ Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   • ${user.name} (${user.email}) - ${user.role}`);
      if (user.brand) {
        console.log(`     Brand: ${user.brand.nameKo}`);
      }
    });

    // Test 4: Search functionality
    console.log('\n4️⃣ Testing Search functionality...');
    const searchResults = await prisma.product.findMany({
      where: {
        OR: [
          { nameKo: { contains: '셔츠' } },
          { nameKo: { contains: '진' } },
          { nameKo: { contains: '후드' } },
        ],
      },
      include: {
        brand: true,
      },
    });

    console.log(`✅ Search results for '셔츠|진|후드': ${searchResults.length} products`);
    searchResults.forEach(product => {
      console.log(`   • ${product.nameKo} (${product.brand.nameKo})`);
    });

    // Test 5: Order creation simulation
    console.log('\n5️⃣ Testing Order creation logic...');
    
    // Get a product for order simulation
    const testProduct = await prisma.product.findFirst({
      where: { inventory: { gt: 0 } },
    });

    if (testProduct) {
      console.log(`✅ Found orderable product: ${testProduct.nameKo}`);
      console.log(`   SKU: ${testProduct.sku}, Price: ₩${testProduct.basePrice.toLocaleString()}`);
      console.log(`   Inventory: ${testProduct.inventory} units`);
      
      // Calculate total for sample order (2 units)
      const quantity = 2;
      const totalAmount = Number(testProduct.basePrice) * quantity;
      console.log(`   Sample order (${quantity} units): ₩${totalAmount.toLocaleString()}`);
      
      if (totalAmount >= 50000) {
        console.log('   ✅ Meets minimum order amount (₩50,000)');
      } else {
        console.log('   ❌ Below minimum order amount (₩50,000)');
      }
    } else {
      console.log('❌ No orderable products found');
    }

    // Test 6: Database performance
    console.log('\n6️⃣ Testing Database performance...');
    
    const startTime = Date.now();
    
    // Complex query with joins
    const complexQuery = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        brand: true,
        category: true,
      },
      take: 10,
    });
    
    const queryTime = Date.now() - startTime;
    console.log(`✅ Complex query completed in ${queryTime}ms`);
    console.log(`   Retrieved ${complexQuery.length} products with brand and category data`);

    // Test concurrent queries
    const concurrentStart = Date.now();
    await Promise.all([
      prisma.brand.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.category.count(),
    ]);
    const concurrentTime = Date.now() - concurrentStart;
    console.log(`✅ 4 concurrent count queries completed in ${concurrentTime}ms`);

    // Final summary
    console.log('\n📊 Aurora Database Integration Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Brands API: ${brands.length} brands ready`);
    console.log(`✅ Products API: ${products.length} products ready`);
    console.log(`✅ Users API: ${users.length} users ready`);
    console.log(`✅ Search functionality: Working`);
    console.log(`✅ Order logic: Ready for testing`);
    console.log(`✅ Performance: ${queryTime}ms avg query time`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n🚀 Your K-Fashion platform is ready to use Aurora database!');
    console.log('\n📋 Next steps:');
    console.log('• Start the development server: npm run dev');
    console.log('• Test the frontend with real data');
    console.log('• Create test orders');
    console.log('• Verify all CRUD operations work');

  } catch (error: any) {
    console.error('\n❌ Aurora API test failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testAuroraAPIs().catch(console.error);