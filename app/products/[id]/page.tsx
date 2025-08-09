import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { ProductDetail, RelatedProduct } from '@/types/product-detail';

async function getProduct(id: string): Promise<{ product: ProductDetail; relatedProducts: RelatedProduct[] } | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products/${id}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      product: data.data.product,
      relatedProducts: data.data.relatedProducts
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const result = await getProduct(params.id);

  if (!result) {
    return {
      title: 'Product Not Found',
    };
  }

  const { product } = result;

  return {
    title: `${product.name} - ${product.brandName} | GOLF B2B`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]?.url || ''],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getProduct(params.id);

  if (!result) {
    notFound();
  }

  const { product, relatedProducts } = result;

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}