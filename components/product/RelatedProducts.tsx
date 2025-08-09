import Image from 'next/image';
import Link from 'next/link';
import { RelatedProduct } from '@/types/product-detail';

interface RelatedProductsProps {
  products: RelatedProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <div className="mt-20">
      <h2 className="text-xl font-bold mb-6">함께 구매하면 좋은 상품</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group"
          >
            <div className="aspect-[3/4] relative bg-gray-100 rounded overflow-hidden mb-3">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold">{product.brandName}</p>
              <p className="text-sm line-clamp-2">{product.name}</p>
              <p className="text-sm font-bold">
                {product.discountPrice ? (
                  <>
                    <span className="line-through text-gray-400 mr-2">
                      ₩{product.price.toLocaleString()}
                    </span>
                    <span>₩{product.discountPrice.toLocaleString()}</span>
                  </>
                ) : (
                  <span>₩{product.price.toLocaleString()}</span>
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}