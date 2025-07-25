import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

async function seedSampleDataWithMySQL() {
  console.log('🌱 Seeding sample data to Aurora database using mysql2...\n');

  const connection = await mysql.createConnection({
    host: 'k-fashion-aurora-cluster-instance-1.cf462wy64uko.us-east-2.rds.amazonaws.com',
    port: 3306,
    user: 'kfashion_admin',
    password: 'Qlalfqjsgh1!',
    database: 'kfashion'
  });

  try {
    // Create sample brands
    console.log('1️⃣ Creating sample brands...');
    
    const brandIds = {
      testBrand: uuidv4(),
      kFashion: uuidv4(),
      urbanStyle: uuidv4(),
    };

    await connection.execute(`
      INSERT IGNORE INTO Brand (id, nameKo, nameCn, slug, description, logoUrl, isActive, createdAt, updatedAt)
      VALUES 
        (?, '테스트브랜드', '测试品牌', 'test-brand', '고품질의 의류를 제공하는 테스트 브랜드입니다.', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop', 1, NOW(), NOW()),
        (?, 'K-패션', 'K时尚', 'k-fashion', '한국 전통 패션을 현대적으로 재해석한 브랜드', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop', 1, NOW(), NOW()),
        (?, '어반스타일', '都市风格', 'urban-style', '도시적이고 세련된 스타일의 캐주얼 브랜드', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=100&h=100&fit=crop', 1, NOW(), NOW())
    `, [brandIds.testBrand, brandIds.kFashion, brandIds.urbanStyle]);

    console.log('✅ Created 3 brands');

    // Create sample categories
    console.log('\n2️⃣ Creating sample categories...');
    
    const categoryIds = {
      tops: uuidv4(),
      bottoms: uuidv4(),
      dresses: uuidv4(),
      accessories: uuidv4(),
    };

    await connection.execute(`
      INSERT IGNORE INTO Category (id, name, slug, createdAt, updatedAt)
      VALUES 
        (?, '상의', 'tops', NOW(), NOW()),
        (?, '하의', 'bottoms', NOW(), NOW()),
        (?, '드레스', 'dresses', NOW(), NOW()),
        (?, '액세서리', 'accessories', NOW(), NOW())
    `, [categoryIds.tops, categoryIds.bottoms, categoryIds.dresses, categoryIds.accessories]);

    console.log('✅ Created 4 categories');

    // Create sample products
    console.log('\n3️⃣ Creating sample products...');
    
    const productIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];

    await connection.execute(`
      INSERT IGNORE INTO Product (id, brandId, categoryId, sku, nameKo, nameCn, descriptionKo, descriptionCn, status, basePrice, inventory, thumbnailImage, images, options, createdAt, updatedAt)
      VALUES 
        (?, ?, ?, 'TEST-001', '클래식 화이트 셔츠', '经典白衬衫', '고급 면 소재로 제작된 클래식한 화이트 셔츠입니다.', '采用高级棉质材料制作的经典白衬衫。', 'ACTIVE', 89000, 50, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop', JSON_ARRAY('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'), JSON_OBJECT('colors', JSON_ARRAY('화이트', '라이트블루'), 'sizes', JSON_ARRAY('S', 'M', 'L', 'XL')), NOW(), NOW()),
        (?, ?, ?, 'TEST-002', '스키니 진', '紧身牛仔裤', '슬림한 핏의 스키니 진으로 다양한 코디가 가능합니다.', '修身版型的紧身牛仔裤，可搭配多种造型。', 'ACTIVE', 75000, 30, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', JSON_ARRAY('https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'), JSON_OBJECT('colors', JSON_ARRAY('다크블루', '블랙'), 'sizes', JSON_ARRAY('26', '27', '28', '29', '30', '31', '32')), NOW(), NOW()),
        (?, ?, ?, 'KF-001', '한복 원피스', '韩服连衣裙', '전통 한복의 아름다움을 현대적으로 재해석한 원피스입니다.', '将传统韩服之美现代化重新诠释的连衣裙。', 'ACTIVE', 150000, 15, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop', JSON_ARRAY('https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'), JSON_OBJECT('colors', JSON_ARRAY('핑크', '블루', '퍼플'), 'sizes', JSON_ARRAY('S', 'M', 'L')), NOW(), NOW()),
        (?, ?, ?, 'URBAN-001', '오버사이즈 후드티', '宽松连帽衫', '편안한 착용감의 오버사이즈 후드티입니다.', '舒适穿着感的宽松连帽衫。', 'ACTIVE', 65000, 80, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', JSON_ARRAY('https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop'), JSON_OBJECT('colors', JSON_ARRAY('그레이', '블랙', '화이트'), 'sizes', JSON_ARRAY('M', 'L', 'XL', 'XXL')), NOW(), NOW()),
        (?, ?, ?, 'URBAN-002', '레더 백팩', '皮革背包', '고급 가죽으로 제작된 도시적인 백팩입니다.', '采用高级皮革制作的都市风背包。', 'ACTIVE', 120000, 25, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', JSON_ARRAY('https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'), JSON_OBJECT('colors', JSON_ARRAY('블랙', '브라운'), 'sizes', JSON_ARRAY('One Size')), NOW(), NOW())
    `, [
      productIds[0], brandIds.testBrand, categoryIds.tops,
      productIds[1], brandIds.testBrand, categoryIds.bottoms,
      productIds[2], brandIds.kFashion, categoryIds.dresses,
      productIds[3], brandIds.urbanStyle, categoryIds.tops,
      productIds[4], brandIds.urbanStyle, categoryIds.accessories
    ]);

    console.log('✅ Created 5 products');

    // Create sample users
    console.log('\n4️⃣ Creating sample users...');
    
    const userIds = [uuidv4(), uuidv4(), uuidv4()];

    await connection.execute(`
      INSERT IGNORE INTO User (id, name, email, role, status, brandId, createdAt, updatedAt)
      VALUES 
        (?, 'Master Admin', 'master@kfashion.com', 'MASTER_ADMIN', 'ACTIVE', NULL, NOW(), NOW()),
        (?, 'Brand Admin', 'brand@kfashion.com', 'BRAND_ADMIN', 'ACTIVE', ?, NOW(), NOW()),
        (?, 'Test Buyer', 'kf001@kfashion.com', 'BUYER', 'ACTIVE', NULL, NOW(), NOW())
    `, [userIds[0], userIds[1], brandIds.testBrand, userIds[2]]);

    console.log('✅ Created 3 users');

    // Verify data
    console.log('\n5️⃣ Verifying data...');
    
    const [brands] = await connection.execute('SELECT COUNT(*) as count FROM Brand');
    const [categories] = await connection.execute('SELECT COUNT(*) as count FROM Category');
    const [products] = await connection.execute('SELECT COUNT(*) as count FROM Product');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM User');

    console.log(`✅ Brands in DB: ${(brands as any)[0].count}`);
    console.log(`✅ Categories in DB: ${(categories as any)[0].count}`);
    console.log(`✅ Products in DB: ${(products as any)[0].count}`);
    console.log(`✅ Users in DB: ${(users as any)[0].count}`);

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Brands: 3 created');
    console.log('✅ Categories: 4 created');
    console.log('✅ Products: 5 created');
    console.log('✅ Users: 3 created');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🎯 Test Data Ready:');
    console.log('• master@kfashion.com (MASTER_ADMIN)');
    console.log('• brand@kfashion.com (BRAND_ADMIN)');
    console.log('• kf001@kfashion.com (BUYER)');
    console.log('• Products available from 3 brands');
    console.log('• Ready to test with real Aurora data!');
    
    console.log('\n✅ Sample data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedSampleDataWithMySQL().catch(console.error);