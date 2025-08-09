const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Find the TITLEIST product specifically
    const titleistProduct = await prisma.product.findFirst({
      where: { sku: 'TTL-MPL-NV-2025' },
      include: {
        brand: true,
        colors: true,
        sizes: true,
        bulkPricing: true
      }
    });

    if (titleistProduct) {
      console.log('TITLEIST product found:');
      console.log('ID:', titleistProduct.id);
      console.log('Name:', titleistProduct.nameKo);
      console.log('Brand:', titleistProduct.brand?.nameKo);
      console.log('Colors:', titleistProduct.colors.length);
      console.log('Sizes:', titleistProduct.sizes.length);
      console.log('Bulk Pricing:', titleistProduct.bulkPricing.length);
      console.log('URL to test: http://localhost:3000/products/' + titleistProduct.id);
    }

    // Also get all products count
    const totalProducts = await prisma.product.count();
    console.log('Total products found:', totalProducts);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();