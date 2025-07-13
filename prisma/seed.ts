import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test users
  const masterAdmin = await prisma.user.upsert({
    where: { email: 'master@kfashion.com' },
    update: {},
    create: {
      email: 'master@kfashion.com',
      name: 'Master Admin',
      role: 'MASTER_ADMIN',
      status: 'ACTIVE',
    },
  })

  // Create a test brand
  const testBrand = await prisma.brand.upsert({
    where: { slug: 'test-brand' },
    update: {},
    create: {
      nameKo: '테스트 브랜드',
      nameCn: '测试品牌',
      slug: 'test-brand',
      description: '테스트용 브랜드입니다',
      isActive: true,
    },
  })

  // Create brand admin user
  const brandAdmin = await prisma.user.upsert({
    where: { email: 'brand@kfashion.com' },
    update: {},
    create: {
      email: 'brand@kfashion.com',
      name: 'Brand Admin',
      role: 'BRAND_ADMIN',
      status: 'ACTIVE',
      brandId: testBrand.id,
    },
  })

  // Create a test buyer
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@kfashion.com' },
    update: {},
    create: {
      email: 'buyer@kfashion.com',
      name: 'Test Buyer',
      role: 'BUYER',
      status: 'ACTIVE',
    },
  })

  // Create test categories
  const topCategory = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: '의류',
      slug: 'clothing',
    },
  })

  const subCategory = await prisma.category.upsert({
    where: { slug: 'shirts' },
    update: {},
    create: {
      name: '셔츠',
      slug: 'shirts',
      parentId: topCategory.id,
    },
  })

  // Create test products
  const product1 = await prisma.product.create({
    data: {
      brandId: testBrand.id,
      sku: 'TEST-SHIRT-001',
      nameKo: '프리미엄 셔츠',
      nameCn: '高级衬衫',
      descriptionKo: '고품질 프리미엄 셔츠입니다',
      descriptionCn: '高品质高级衬衫',
      categoryId: subCategory.id,
      status: 'ACTIVE',
      basePrice: 89000,
      inventory: 100,
      images: ['https://via.placeholder.com/400x400'],
      options: {
        colors: ['화이트', '블랙', '네이비'],
        sizes: ['S', 'M', 'L', 'XL'],
      },
    },
  })

  const product2 = await prisma.product.create({
    data: {
      brandId: testBrand.id,
      sku: 'TEST-PANTS-001',
      nameKo: '슬림핏 팬츠',
      nameCn: '修身裤',
      descriptionKo: '편안한 슬림핏 팬츠',
      descriptionCn: '舒适的修身裤',
      categoryId: topCategory.id,
      status: 'ACTIVE',
      basePrice: 79000,
      inventory: 50,
      images: ['https://via.placeholder.com/400x400'],
      options: {
        colors: ['블랙', '그레이'],
        sizes: ['28', '30', '32', '34'],
      },
    },
  })

  // Create a test order
  const order = await prisma.order.create({
    data: {
      userId: buyer.id,
      status: 'PENDING',
      totalAmount: 168000,
      shippingAddress: {
        name: '홍길동',
        phone: '010-1234-5678',
        address: '서울시 강남구 테헤란로 123',
        addressDetail: '456호',
        zipCode: '06234',
      },
      paymentMethod: 'BANK_TRANSFER',
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 1,
            price: 89000,
            options: { color: '화이트', size: 'L' },
          },
          {
            productId: product2.id,
            quantity: 1,
            price: 79000,
            options: { color: '블랙', size: '32' },
          },
        ],
      },
    },
  })

  console.log('Seed data created:')
  console.log('- Users:', { masterAdmin: masterAdmin.email, brandAdmin: brandAdmin.email, buyer: buyer.email })
  console.log('- Brand:', testBrand.nameKo)
  console.log('- Products:', [product1.nameKo, product2.nameKo])
  console.log('- Order:', order.orderNumber)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })