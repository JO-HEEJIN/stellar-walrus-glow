import { PrismaClient } from '@prisma/client';

async function measureAuroraPerformance() {
  console.log('📊 Measuring Aurora MySQL Performance from Seoul to Ohio\n');

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    await prisma.$connect();
    console.log('✅ Connected to Aurora MySQL in us-east-2 (Ohio)\n');

    // Test 1: Basic Connection Latency
    console.log('1️⃣ Connection Latency Test (10 samples)');
    const connectionLatencies: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1 as ping`;
      const latency = Date.now() - start;
      connectionLatencies.push(latency);
      console.log(`   Sample ${i + 1}: ${latency}ms`);
    }

    const avgConnectionLatency = connectionLatencies.reduce((a, b) => a + b, 0) / connectionLatencies.length;
    const minConnectionLatency = Math.min(...connectionLatencies);
    const maxConnectionLatency = Math.max(...connectionLatencies);

    console.log(`   Average: ${avgConnectionLatency.toFixed(2)}ms`);
    console.log(`   Min: ${minConnectionLatency}ms, Max: ${maxConnectionLatency}ms\n`);

    // Test 2: Write Performance
    console.log('2️⃣ Write Performance Test');
    const writeLatencies: number[] = [];

    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      
      const testUser = await prisma.user.create({
        data: {
          email: `perf-test-${Date.now()}-${i}@kfashion.com`,
          name: `Performance Test User ${i}`,
          role: 'BUYER',
        },
      });

      const writeLatency = Date.now() - start;
      writeLatencies.push(writeLatency);
      console.log(`   Write ${i + 1}: ${writeLatency}ms`);

      // Clean up immediately
      await prisma.user.delete({ where: { id: testUser.id } });
    }

    const avgWriteLatency = writeLatencies.reduce((a, b) => a + b, 0) / writeLatencies.length;
    console.log(`   Average Write: ${avgWriteLatency.toFixed(2)}ms\n`);

    // Test 3: Read Performance
    console.log('3️⃣ Read Performance Test');
    
    // Create some test data first
    const testUsers = await Promise.all([
      prisma.user.create({
        data: { email: 'read-test-1@kfashion.com', name: 'Reader 1', role: 'BUYER' }
      }),
      prisma.user.create({
        data: { email: 'read-test-2@kfashion.com', name: 'Reader 2', role: 'BRAND_ADMIN' }
      }),
      prisma.user.create({
        data: { email: 'read-test-3@kfashion.com', name: 'Reader 3', role: 'BUYER' }
      }),
    ]);

    const readLatencies: number[] = [];

    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      await prisma.user.findMany({
        where: { email: { contains: 'read-test' } },
        take: 10,
      });
      const readLatency = Date.now() - start;
      readLatencies.push(readLatency);
      console.log(`   Read ${i + 1}: ${readLatency}ms`);
    }

    const avgReadLatency = readLatencies.reduce((a, b) => a + b, 0) / readLatencies.length;
    console.log(`   Average Read: ${avgReadLatency.toFixed(2)}ms\n`);

    // Test 4: Complex Query Performance
    console.log('4️⃣ Complex Query Performance Test');
    
    // Create a brand and product for testing
    const testBrand = await prisma.brand.create({
      data: {
        nameKo: '테스트 브랜드',
        slug: 'test-brand-perf',
        isActive: true,
      }
    });

    const testProduct = await prisma.product.create({
      data: {
        brandId: testBrand.id,
        sku: 'TEST-PERF-001',
        nameKo: '테스트 상품',
        basePrice: 29900,
        inventory: 100,
        status: 'ACTIVE',
      }
    });

    const complexLatencies: number[] = [];

    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      await prisma.product.findMany({
        where: { status: 'ACTIVE' },
        include: {
          brand: true,
        },
        take: 10,
      });
      const complexLatency = Date.now() - start;
      complexLatencies.push(complexLatency);
      console.log(`   Complex Query ${i + 1}: ${complexLatency}ms`);
    }

    const avgComplexLatency = complexLatencies.reduce((a, b) => a + b, 0) / complexLatencies.length;
    console.log(`   Average Complex: ${avgComplexLatency.toFixed(2)}ms\n`);

    // Test 5: Concurrent Connection Performance
    console.log('5️⃣ Concurrent Connection Test (10 simultaneous queries)');
    
    const concurrentStart = Date.now();
    const concurrentPromises = Array.from({ length: 10 }, (_, i) => 
      prisma.user.count().then(() => i)
    );
    
    const concurrentResults = await Promise.all(concurrentPromises);
    const concurrentTotal = Date.now() - concurrentStart;
    
    console.log(`   Total time for 10 concurrent queries: ${concurrentTotal}ms`);
    console.log(`   Average per query: ${(concurrentTotal / 10).toFixed(2)}ms\n`);

    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await prisma.product.delete({ where: { id: testProduct.id } });
    await prisma.brand.delete({ where: { id: testBrand.id } });
    await prisma.user.deleteMany({ 
      where: { email: { in: testUsers.map(u => u.email) } } 
    });

    // Performance Summary
    console.log('📈 Performance Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Region: Ohio (us-east-2) → Seoul latency`);
    console.log(`📍 Distance: ~11,000 km (cross-Pacific)`);
    console.log(`⚡ Network Ping: ${avgConnectionLatency.toFixed(2)}ms avg`);
    console.log(`✍️  Write Operations: ${avgWriteLatency.toFixed(2)}ms avg`);
    console.log(`📖 Read Operations: ${avgReadLatency.toFixed(2)}ms avg`);
    console.log(`🔄 Complex Queries: ${avgComplexLatency.toFixed(2)}ms avg`);
    console.log(`🔗 Concurrent Load: ${(concurrentTotal / 10).toFixed(2)}ms avg per query`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Performance Analysis
    console.log('🔍 Performance Analysis:');
    
    if (avgConnectionLatency > 200) {
      console.log('❌ High Latency (>200ms): Database operations will feel slow');
      console.log('💡 Recommendation: Consider migrating to ap-northeast-2 (Seoul)');
      console.log('📉 Expected improvement: ~150-180ms reduction');
    } else if (avgConnectionLatency > 100) {
      console.log('⚠️  Moderate Latency (100-200ms): Acceptable but not optimal');
      console.log('💡 Recommendation: Consider ap-northeast-2 for better UX');
      console.log('📉 Expected improvement: ~80-120ms reduction');
    } else {
      console.log('✅ Good Latency (<100ms): Performance is acceptable');
    }

    // Cost Analysis
    console.log('\n💰 Regional Cost Comparison:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Ohio (us-east-2):    $0.082/hour for db.t4g.medium');
    console.log('Seoul (ap-northeast-2): $0.096/hour for db.t4g.medium');
    console.log('Monthly difference:  ~$10 more for Seoul');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Trade-off: Pay ~$10/month more for 150ms better latency\n');

    console.log('✅ Performance measurement complete!');

  } catch (error: any) {
    console.error('❌ Performance test failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

measureAuroraPerformance().catch(console.error);