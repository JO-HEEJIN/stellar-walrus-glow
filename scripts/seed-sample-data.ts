import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSampleData() {
  console.log('🌱 Seeding sample data to Aurora database...\n');

  try {
    // Create sample brands
    console.log('1️⃣ Creating sample brands...');
    
    const brands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: 'test-brand' },
        update: {},
        create: {
          nameKo: '테스트브랜드',
          nameCn: '测试品牌',
          slug: 'test-brand',
          description: '고품질의 의류를 제공하는 테스트 브랜드입니다.',
          logoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
          isActive: true,
        },
      }),
      
      prisma.brand.upsert({
        where: { slug: 'k-fashion' },
        update: {},
        create: {
          nameKo: 'K-패션',
          nameCn: 'K时尚',
          slug: 'k-fashion',
          description: '한국 전통 패션을 현대적으로 재해석한 브랜드',
          logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
          isActive: true,
        },
      }),
      
      prisma.brand.upsert({
        where: { slug: 'urban-style' },
        update: {},
        create: {
          nameKo: '어반스타일',
          nameCn: '都市风格',
          slug: 'urban-style',
          description: '도시적이고 세련된 스타일의 캐주얼 브랜드',
          logoUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=100&h=100&fit=crop',
          isActive: true,
        },
      }),
    ]);

    console.log(`✅ Created ${brands.length} brands`);

    // Create sample categories
    console.log('\n2️⃣ Creating sample categories...');
    
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'tops' },
        update: {},
        create: {
          name: '상의',
          slug: 'tops',
        },
      }),
      
      prisma.category.upsert({
        where: { slug: 'bottoms' },
        update: {},
        create: {
          name: '하의',
          slug: 'bottoms',
        },
      }),
      
      prisma.category.upsert({
        where: { slug: 'dresses' },
        update: {},
        create: {
          name: '드레스',
          slug: 'dresses',
        },
      }),
      
      prisma.category.upsert({
        where: { slug: 'accessories' },
        update: {},
        create: {
          name: '액세서리',
          slug: 'accessories',
        },
      }),
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create sample products
    console.log('\n3️⃣ Creating sample products...');
    
    const products = await Promise.all([
      // Test Brand Products
      prisma.product.upsert({
        where: { sku: 'TEST-001' },
        update: {},
        create: {
          brandId: brands[0].id,
          categoryId: categories[0].id, // tops
          sku: 'TEST-001',
          nameKo: '클래식 화이트 셔츠',
          nameCn: '经典白衬衫',
          descriptionKo: '고급 면 소재로 제작된 클래식한 화이트 셔츠입니다.',
          descriptionCn: '采用高级棉质材料制作的经典白衬衫。',
          status: 'ACTIVE',
          basePrice: 89000,
          inventory: 50,
          thumbnailImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'
          ],
          options: {
            colors: ['화이트', '라이트블루'],
            sizes: ['S', 'M', 'L', 'XL']
          }
        },
      }),

      prisma.product.upsert({
        where: { sku: 'TEST-002' },
        update: {},
        create: {
          brandId: brands[0].id,
          categoryId: categories[1].id, // bottoms
          sku: 'TEST-002',
          nameKo: '스키니 진',
          nameCn: '紧身牛仔裤',
          descriptionKo: '슬림한 핏의 스키니 진으로 다양한 코디가 가능합니다.',
          descriptionCn: '修身版型的紧身牛仔裤，可搭配多种造型。',
          status: 'ACTIVE',
          basePrice: 75000,
          inventory: 30,
          thumbnailImage: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'
          ],
          options: {
            colors: ['다크블루', '블랙'],
            sizes: ['26', '27', '28', '29', '30', '31', '32']
          }
        },
      }),

      // K-Fashion Products
      prisma.product.upsert({
        where: { sku: 'KF-001' },
        update: {},
        create: {
          brandId: brands[1].id,
          categoryId: categories[2].id, // dresses
          sku: 'KF-001',
          nameKo: '한복 원피스',
          nameCn: '韩服连衣裙',
          descriptionKo: '전통 한복의 아름다움을 현대적으로 재해석한 원피스입니다.',
          descriptionCn: '将传统韩服之美现代化重新诠释的连衣裙。',
          status: 'ACTIVE',
          basePrice: 150000,
          inventory: 15,
          thumbnailImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'
          ],
          options: {
            colors: ['핑크', '블루', '퍼플'],
            sizes: ['S', 'M', 'L']
          }
        },
      }),

      // Urban Style Products
      prisma.product.upsert({
        where: { sku: 'URBAN-001' },
        update: {},
        create: {
          brandId: brands[2].id,
          categoryId: categories[0].id, // tops
          sku: 'URBAN-001',
          nameKo: '오버사이즈 후드티',
          nameCn: '宽松连帽衫',
          descriptionKo: '편안한 착용감의 오버사이즈 후드티입니다.',
          descriptionCn: '舒适穿着感的宽松连帽衫。',
          status: 'ACTIVE',
          basePrice: 65000,
          inventory: 80,
          thumbnailImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop'
          ],
          options: {
            colors: ['그레이', '블랙', '화이트'],
            sizes: ['M', 'L', 'XL', 'XXL']
          }
        },
      }),

      prisma.product.upsert({
        where: { sku: 'URBAN-002' },
        update: {},
        create: {
          brandId: brands[2].id,
          categoryId: categories[3].id, // accessories
          sku: 'URBAN-002',
          nameKo: '레더 백팩',
          nameCn: '皮革背包',
          descriptionKo: '고급 가죽으로 제작된 도시적인 백팩입니다.',
          descriptionCn: '采用高级皮革制作的都市风背包。',
          status: 'ACTIVE',
          basePrice: 120000,
          inventory: 25,
          thumbnailImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
          ],
          options: {
            colors: ['블랙', '브라운'],
            sizes: ['One Size']
          }
        },
      }),
    ]);

    console.log(`✅ Created ${products.length} products`);

    // Create sample users
    console.log('\n4️⃣ Creating sample users...');
    
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'master@kfashion.com' },
        update: {},
        create: {
          name: 'Master Admin',
          email: 'master@kfashion.com',
          role: 'MASTER_ADMIN',
          status: 'ACTIVE',
        },
      }),
      
      prisma.user.upsert({
        where: { email: 'brand@kfashion.com' },
        update: {},
        create: {
          name: 'Brand Admin',
          email: 'brand@kfashion.com',
          role: 'BRAND_ADMIN',
          status: 'ACTIVE',
          brandId: brands[0].id, // Associate with Test Brand
        },
      }),
      
      prisma.user.upsert({
        where: { email: 'kf001@kfashion.com' },
        update: {},
        create: {
          name: 'Test Buyer',
          email: 'kf001@kfashion.com',
          role: 'BUYER',
          status: 'ACTIVE',
        },
      }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Brands: ${brands.length} created`);
    console.log(`✅ Categories: ${categories.length} created`);
    console.log(`✅ Products: ${products.length} created`);
    console.log(`✅ Users: ${users.length} created`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🎯 Test Data Ready:');
    console.log('• Login with master@kfashion.com (MASTER_ADMIN)');
    console.log('• Login with brand@kfashion.com (BRAND_ADMIN)');
    console.log('• Login with kf001@kfashion.com (BUYER)');
    console.log('• Browse products, create orders, test functionality');
    
    console.log('\n✅ Sample data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleData().catch(console.error);