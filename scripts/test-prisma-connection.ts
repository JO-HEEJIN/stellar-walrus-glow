import { PrismaClient } from '@prisma/client';

async function testPrismaConnection() {
  console.log('🔍 Testing Prisma connection to Aurora...\n');

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('1️⃣ Testing basic Prisma connection...');
    await prisma.$connect();
    console.log('✅ Connected successfully');

    console.log('\n2️⃣ Testing raw query...');
    const result = await prisma.$queryRaw`SELECT VERSION() as version, NOW() as currentTime`;
    console.log('✅ Raw query result:', result);

    console.log('\n3️⃣ Testing table existence...');
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log('✅ Tables found:', tables);

    console.log('\n4️⃣ Testing user count...');
    const userCount = await prisma.user.count();
    console.log(`✅ User count: ${userCount}`);

    console.log('\n✅ All Prisma tests passed!');

  } catch (error: any) {
    console.error('\n❌ Prisma connection failed:', error.message);
    console.error('Error code:', error.code);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection().catch(console.error);