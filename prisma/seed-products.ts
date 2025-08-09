import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProducts() {
  console.log('🌱 Seeding products...');

  // Check if we already have sample product with colors/sizes
  const existingProduct = await prisma.product.findFirst({
    where: { sku: 'TTL-MPL-NV-2025' },
    include: { colors: true, sizes: true }
  });
  
  if (existingProduct && existingProduct.colors.length > 0) {
    console.log('Sample product with details already exists, skipping seed');
    return;
  }

  // Get existing brand for seeding
  let brand = await prisma.brand.findFirst();
  
  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        nameKo: 'TITLEIST 타이틀리스트',
        nameCn: 'TITLEIST',
        slug: 'titleist',
        description: '세계 최고의 골프 브랜드',
        isActive: true
      }
    });
  }

  // Create category
  let category = await prisma.category.findFirst({
    where: { slug: 'mens-tops-polo' }
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: '남성/상의/폴로',
        slug: 'mens-tops-polo'
      }
    });
  }

  // Create the main product
  const product = await prisma.product.create({
    data: {
      brandId: brand.id,
      categoryId: category.id,
      sku: 'TTL-MPL-NV-2025',
      nameKo: '남성 투어 퍼포먼스 폴로 셔츠 (네이비)',
      descriptionKo: '프로 선수들이 착용하는 프리미엄 퍼포먼스 폴로 셔츠입니다. 뛰어난 신축성과 형태 유지력을 자랑하며, 흡한속건과 UV차단 기능을 제공합니다.',
      basePrice: 128000,
      discountPrice: 89000,
      discountRate: 30,
      inventory: 500,
      minOrderQty: 10,
      status: 'ACTIVE',
      features: ['흡한속건: 땀을 빠르게 흡수하고 건조', 'UV 차단: UPF 50+ 자외선 차단', '4-way 스트레치: 모든 방향으로 늘어나는 신축성', '안티오더: 항균 방취 기능'],
      material: '폴리에스터 88%, 스판덱스 12%',
      careInstructions: '찬물 세탁, 낮은 온도 건조, 다림질 금지',
      tags: ['골프웨어', '기능성', '투어라인', 'UV차단'],
      isNew: false,
      isBestSeller: true,
      soldCount: 1847,
      rating: 4.8,
      reviewCount: 328,
      thumbnailImage: '/placeholder.svg',
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg']
    }
  });

  console.log(`Created product: ${product.nameKo}`);

  // Create product colors
  const colors = [
    { name: '네이비', code: '#1a237e', available: true, order: 1 },
    { name: '블랙', code: '#000000', available: true, order: 2 },
    { name: '화이트', code: '#ffffff', available: true, order: 3 },
    { name: '브라운', code: '#8d6e63', available: true, order: 4 },
    { name: '레드', code: '#ef5350', available: false, order: 5 },
  ];

  for (const color of colors) {
    await prisma.productColor.create({
      data: {
        productId: product.id,
        ...color
      }
    });
  }

  console.log('Created product colors');

  // Create product sizes
  const sizes = [
    { name: '90', available: true, order: 1 },
    { name: '95', available: true, order: 2 },
    { name: '100', available: true, order: 3 },
    { name: '105', available: true, order: 4 },
    { name: '110', available: true, order: 5 },
    { name: '115', available: false, order: 6 },
  ];

  for (const size of sizes) {
    await prisma.productSize.create({
      data: {
        productId: product.id,
        ...size
      }
    });
  }

  console.log('Created product sizes');

  // Create bulk pricing
  const bulkPricing = [
    { minQuantity: 10, maxQuantity: 29, pricePerUnit: 89000, discountRate: 0 },
    { minQuantity: 30, maxQuantity: 99, pricePerUnit: 84550, discountRate: 5 },
    { minQuantity: 100, maxQuantity: null, pricePerUnit: 80100, discountRate: 10 },
  ];

  for (const pricing of bulkPricing) {
    await prisma.bulkPricing.create({
      data: {
        productId: product.id,
        ...pricing
      }
    });
  }

  console.log('Created bulk pricing');

  // Create related products
  const relatedProducts = [
    {
      sku: 'TTL-TPP-BK-2025',
      nameKo: '투어 퍼포먼스 팬츠',
      basePrice: 115000,
      discountPrice: 98000,
      discountRate: 15,
    },
    {
      sku: 'TTL-PLG-WH-2025',
      nameKo: '플레이어스 글러브',
      basePrice: 28000,
      discountPrice: 25000,
      discountRate: 10,
    },
    {
      sku: 'TTL-CAP-NV-2025',
      nameKo: '투어 캡 모자',
      basePrice: 45000,
      discountPrice: 38000,
      discountRate: 15,
    },
    {
      sku: 'TTL-BLT-BK-2025',
      nameKo: '스트레치 벨트',
      basePrice: 68000,
      discountPrice: 58000,
      discountRate: 15,
    },
    {
      sku: 'TTL-BAG-BK-2025',
      nameKo: '투어 백팩',
      basePrice: 158000,
      discountPrice: 135000,
      discountRate: 15,
    }
  ];

  for (const relatedProduct of relatedProducts) {
    const createdProduct = await prisma.product.create({
      data: {
        brandId: brand.id,
        categoryId: category.id,
        ...relatedProduct,
        descriptionKo: `고품질 ${relatedProduct.nameKo}입니다.`,
        inventory: 100,
        minOrderQty: 5,
        status: 'ACTIVE',
        thumbnailImage: '/placeholder.svg',
        images: ['/placeholder.svg']
      }
    });

    console.log(`Created related product: ${createdProduct.nameKo}`);
  }

  console.log('✅ Product seeding completed');
}

async function main() {
  try {
    await seedProducts();
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export default main;