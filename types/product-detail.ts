export interface ProductColor {
  id: string;
  name: string;
  code: string;
  available: boolean;
}

export interface ProductSize {
  id: string;
  name: string;
  available: boolean;
}

export interface BulkPricing {
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit: number;
  discountRate: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface ProductDetail {
  id: string;
  sku: string;
  brandId: string;
  brandName: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  discountRate: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  colors: ProductColor[];
  sizes: ProductSize[];
  images: ProductImage[];
  bulkPricing: BulkPricing[];
  minOrderQuantity: number;
  features: string[];
  material: string;
  careInstructions: string;
  category: string[];
  tags: string[];
  isNew: boolean;
  isBestSeller: boolean;
  stock: number;
  isWishlisted?: boolean;
}

export interface ProductTab {
  id: string;
  label: string;
  count?: number;
}

export interface RelatedProduct {
  id: string;
  brandName: string;
  name: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
}