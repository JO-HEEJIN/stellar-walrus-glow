import { PrismaClient } from '@prisma/client';

async function testAuroraConnection() {
  console.log('🔍 Testing AWS Aurora MySQL connection...\n');

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Please set it in your .env file:');
    console.log('DATABASE_URL="mysql://username:password@your-aurora-endpoint.ap-northeast-2.rds.amazonaws.com:3306/kfashion"');
    process.exit(1);
  }

  // Parse the connection string
  try {
    const url = new URL(databaseUrl);
    console.log('📍 Connection Details:');
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port || '3306'}`);
    console.log(`   Database: ${url.pathname.slice(1)}`);
    console.log(`   User: ${url.username}`);
    console.log(`   Region: ${url.hostname.includes('ap-northeast-2') ? 'Seoul' : url.hostname.includes('ap-northeast-1') ? 'Tokyo' : 'Unknown'}\n`);
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const startConnect = Date.now();
    await prisma.$connect();
    const connectTime = Date.now() - startConnect;
    console.log(`✅ Connected successfully (${connectTime}ms)\n`);

    // Test 2: Database version
    console.log('2️⃣ Checking Aurora MySQL version...');
    const versionResult = await prisma.$queryRaw`SELECT VERSION() as version`;
    console.log(`✅ Aurora MySQL Version: ${(versionResult as any)[0].version}\n`);

    // Test 3: Create test data
    console.log('3️⃣ Testing write operations...');
    const startWrite = Date.now();
    
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: `test-aurora-${Date.now()}@kfashion.com`,
        name: 'Aurora Test User',
        role: 'BUYER',
      },
    });
    
    const writeTime = Date.now() - startWrite;
    console.log(`✅ Created test user: ${testUser.email} (${writeTime}ms)\n`);

    // Test 4: Read operations
    console.log('4️⃣ Testing read operations...');
    const startRead = Date.now();
    
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    
    const readTime = Date.now() - startRead;
    console.log(`✅ Found ${userCount} users (${readTime}ms)`);
    console.log('Recent users:', users.map(u => u.email).join(', '), '\n');

    // Test 5: Complex query with relations
    console.log('5️⃣ Testing complex queries...');
    const startComplex = Date.now();
    
    // This will test JOIN performance
    const productsWithBrands = await prisma.product.findMany({
      take: 5,
      include: {
        brand: true,
        inventory: true,
      },
    });
    
    const complexTime = Date.now() - startComplex;
    console.log(`✅ Complex query completed (${complexTime}ms)`);
    console.log(`Found ${productsWithBrands.length} products with relations\n`);

    // Test 6: Connection pool
    console.log('6️⃣ Testing connection pooling...');
    const poolPromises = Array.from({ length: 10 }, (_, i) => 
      prisma.user.count().then(() => i)
    );
    
    const startPool = Date.now();
    const results = await Promise.all(poolPromises);
    const poolTime = Date.now() - startPool;
    
    console.log(`✅ Executed ${results.length} concurrent queries (${poolTime}ms)`);
    console.log(`Average time per query: ${(poolTime / results.length).toFixed(2)}ms\n`);

    // Test 7: Latency check
    console.log('7️⃣ Measuring latency...');
    const latencies: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      latencies.push(Date.now() - start);
    }
    
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const minLatency = Math.min(...latencies);
    const maxLatency = Math.max(...latencies);
    
    console.log(`✅ Latency statistics:`);
    console.log(`   Average: ${avgLatency.toFixed(2)}ms`);
    console.log(`   Min: ${minLatency}ms`);
    console.log(`   Max: ${maxLatency}ms\n`);

    // Performance summary
    console.log('📊 Performance Summary:');
    console.log(`   Connection time: ${connectTime}ms`);
    console.log(`   Write latency: ${writeTime}ms`);
    console.log(`   Read latency: ${readTime}ms`);
    console.log(`   Complex query: ${complexTime}ms`);
    console.log(`   Avg network latency: ${avgLatency.toFixed(2)}ms\n`);

    // Region recommendation
    if (avgLatency > 30) {
      console.log('💡 Recommendation: Your latency is high (>30ms).');
      console.log('   Consider using Aurora in the same region as your application.');
      console.log('   Current latency suggests cross-region communication.\n');
    } else if (avgLatency > 10) {
      console.log('💡 Recommendation: Moderate latency detected (10-30ms).');
      console.log('   This is acceptable for most applications.\n');
    } else {
      console.log('🚀 Excellent latency! Your database is well-positioned.\n');
    }

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('✅ Test user deleted\n');

    console.log('✅ All tests passed! Aurora MySQL is working correctly.');

  } catch (error: any) {
    console.error('\n❌ Connection test failed:', error.message);
    
    if (error.code === 'P2002') {
      console.log('💡 Tip: Unique constraint violation. The database schema is working correctly.');
    } else if (error.code === 'P2003') {
      console.log('💡 Tip: Foreign key constraint issue. Check your data relationships.');
    } else if (error.code === 'P2021') {
      console.log('💡 Tip: Table does not exist. Run: npm run prisma:migrate');
    } else if (error.code === 'P2024') {
      console.log('💡 Tip: Connection timeout. Check your security groups and network settings.');
    } else if (error.code === 'P2025') {
      console.log('💡 Tip: Record not found. This might be normal for an empty database.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Tip: Cannot resolve hostname. Check your Aurora endpoint URL.');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.log('💡 Tip: Connection timeout. Verify security groups allow port 3306.');
    } else if (error.message.includes('Access denied')) {
      console.log('💡 Tip: Authentication failed. Check your username and password.');
    }
    
    console.log('\n📚 Troubleshooting steps:');
    console.log('1. Verify your DATABASE_URL in .env file');
    console.log('2. Check Aurora cluster is running in AWS console');
    console.log('3. Verify security group allows connections from your IP');
    console.log('4. Ensure you have run: npm run prisma:migrate');
    console.log('5. For detailed logs, set: DEBUG=prisma:query');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAuroraConnection().catch(console.error);