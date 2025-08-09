const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBrands() {
  try {
    // 브랜드 목록 확인
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    console.log('\n=== 브랜드 목록 ===');
    brands.forEach(brand => {
      console.log(`\n브랜드: ${brand.nameKo} (${brand.slug || brand.id})`);
      console.log(`  - ID: ${brand.id}`);
      console.log(`  - 슬러그: ${brand.slug || '없음'}`);
      console.log(`  - 상품 수: ${brand._count.products}개`);
      console.log(`  - 로고: ${brand.logoUrl || '없음'}`);
      console.log(`  - 설명: ${brand.description || '없음'}`);
    });

    // 상품도 확인
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      take: 5,
      include: {
        brand: true,
        category: true
      }
    });

    console.log('\n\n=== 샘플 상품 목록 ===');
    products.forEach(product => {
      console.log(`\n상품: ${product.nameKo}`);
      console.log(`  - SKU: ${product.sku}`);
      console.log(`  - 브랜드: ${product.brand.nameKo}`);
      console.log(`  - 카테고리: ${product.category?.name || '없음'}`);
      console.log(`  - 가격: ₩${product.basePrice}`);
      console.log(`  - 썸네일: ${product.thumbnailImage || '없음'}`);
      console.log(`  - 이미지들: ${product.images ? JSON.stringify(product.images) : '없음'}`);
    });

  } catch (error) {
    console.error('에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBrands();