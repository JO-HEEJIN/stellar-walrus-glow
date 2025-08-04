const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'classic-fashion' },
      update: {},
      create: {
        nameKo: '클래식 패션',
        nameCn: '经典时尚',
        slug: 'classic-fashion',
        description: '고급스러운 클래식 스타일의 패션 브랜드',
        logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
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
        logoUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=100&h=100&fit=crop',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'urban-street' },
      update: {},
      create: {
        nameKo: '어반 스트릿',
        nameCn: '都市街头',
        slug: 'urban-street',
        description: '도시적 감성의 스트릿 패션 브랜드',
        logoUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=100&h=100&fit=crop',
        isActive: true,
      },
    }),
  ])

  console.log('Created brands:', brands.map(b => b.nameKo))

  // Create products
  const products = await Promise.all([
    // Classic Fashion Products
    prisma.product.upsert({
      where: { sku: 'classic-shirt-001' },
      update: {},
      create: {
        sku: 'classic-shirt-001',
        nameKo: '클래식 셔츠',
        nameCn: '经典衬衫',
        descriptionKo: '고급 코튼 소재의 클래식 셔츠',
        descriptionCn: '高级棉质经典衬衫',
        basePrice: 89000,
        inventory: 50,
        status: 'ACTIVE',
        thumbnailImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop',
        images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop'],
        brandId: brands[0].id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'denim-jacket-001' },
      update: {},
      create: {
        sku: 'denim-jacket-001',
        nameKo: '데님 자켓',
        nameCn: '牛仔夹克',
        descriptionKo: '빈티지 스타일의 데님 자켓',
        descriptionCn: '复古风格牛仔夹克',
        basePrice: 129000,
        inventory: 30,
        status: 'ACTIVE',
        thumbnailImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop'],
        brandId: brands[0].id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'skinny-jeans-001' },
      update: {},
      create: {
        sku: 'skinny-jeans-001',
        nameKo: '스키니 진',
        nameCn: '紧身牛仔裤',
        descriptionKo: '편안한 착용감의 스키니 진',
        descriptionCn: '舒适贴身牛仔裤',
        basePrice: 79000,
        inventory: 25,
        status: 'ACTIVE',
        thumbnailImage: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop'],
        brandId: brands[0].id,
      },
    }),
    
    // K-Fashion Products
    prisma.product.upsert({
      where: { sku: 'hanbok-dress-001' },
      update: {},
      create: {
        sku: 'hanbok-dress-001',
        nameKo: '한복 원피스',
        nameCn: '韩服连衣裙',
        descriptionKo: '전통과 현대가 만난 한복 원피스',
        descriptionCn: '传统与现代结合的韩服连衣裙',
        basePrice: 159000,
        inventory: 20,
        status: 'ACTIVE',
        thumbnailImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop',
        images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop'],
        brandId: brands[1].id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'modern-hanbok-jacket-001' },
      update: {},
      create: {
        sku: 'modern-hanbok-jacket-001',
        nameKo: '개량 한복 자켓',
        nameCn: '改良韩服夹克',
        descriptionKo: '현대적으로 재해석한 한복 자켓',
        descriptionCn: '现代重新诠释的韩服夹克',
        basePrice: 189000,
        inventory: 15,
        status: 'ACTIVE',
        thumbnailImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=300&fit=crop',
        images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=300&fit=crop'],
        brandId: brands[1].id,
      },
    }),
    
    // Urban Street Products
    prisma.product.upsert({
      where: { sku: 'urban-hoodie-001' },
      update: {},
      create: {
        sku: 'urban-hoodie-001',
        nameKo: '어반 후드티',
        nameCn: '都市连帽衫',
        descriptionKo: '도시적 감성의 편안한 후드티',
        descriptionCn: '都市感舒适连帽衫',
        basePrice: 69000,
        inventory: 45,
        status: 'ACTIVE',
        thumbnailImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop'],
        brandId: brands[2].id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'street-jogger-pants-001' },
      update: {},
      create: {
        sku: 'street-jogger-pants-001',
        nameKo: '스트릿 조거팬츠',
        nameCn: '街头慢跑裤',
        descriptionKo: '활동적인 스트릿 스타일 조거팬츠',
        descriptionCn: '活跃街头风格慢跑裤',
        basePrice: 79000,
        inventory: 35,
        status: 'ACTIVE',
        thumbnailImage: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop',
        images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop'],
        brandId: brands[2].id,
      },
    }),
  ])

  console.log('Created products:', products.map(p => p.nameKo))

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })