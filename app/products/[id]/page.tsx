import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail, RelatedProduct } from '@/types/product-detail';

async function getProduct(id: string): Promise<{ product: ProductDetail; relatedProducts: RelatedProduct[] } | null> {
  try {
    // 서버사이드에서 직접 Prisma 사용 시도, 실패 시 mock 데이터 반환
    try {
      const { prisma } = await import('@/lib/prisma');
      
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          brand: true,
          category: true,
          colors: {
            orderBy: { order: 'asc' }
          },
          sizes: {
            orderBy: { order: 'asc' }
          },
          bulkPricing: {
            orderBy: { minQuantity: 'asc' }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        }
      });

      if (!product) {
        return null;
      }

      // 관련 상품 조회
      const relatedProducts = await prisma.product.findMany({
        where: {
          AND: [
            { brandId: product.brandId },
            { id: { not: product.id } },
            { status: 'ACTIVE' }
          ]
        },
        take: 5,
        select: {
          id: true,
          nameKo: true,
          basePrice: true,
          discountPrice: true,
          thumbnailImage: true,
          brand: {
            select: {
              nameKo: true
            }
          }
        }
      });

      // 데이터 포맷팅
      const formattedProduct: ProductDetail = {
        id: product.id,
        sku: product.sku,
        brandId: product.brandId,
        brandName: product.brand.nameKo,
        name: product.nameKo,
        description: product.descriptionKo || '',
        price: Number(product.basePrice),
        discountPrice: product.discountPrice ? Number(product.discountPrice) : Number(product.basePrice),
        discountRate: product.discountRate,
        rating: Number(product.rating),
        reviewCount: product._count.reviews,
        soldCount: product.soldCount,
        colors: product.colors.map(color => ({
          id: color.id,
          name: color.name,
          code: color.code,
          available: color.available
        })),
        sizes: product.sizes.map(size => ({
          id: size.id,
          name: size.name,
          available: size.available
        })),
        images: product.images ? 
          (Array.isArray(product.images) ? 
            product.images
              .filter((url): url is string => typeof url === 'string')
              .map((url: string, index: number) => ({
                id: String(index + 1),
                url,
                alt: `${product.nameKo} ${index + 1}`,
                order: index + 1
              })) : []
          ) : [{
            id: '1',
            url: product.thumbnailImage || '/placeholder.svg',
            alt: product.nameKo,
            order: 1
          }],
        bulkPricing: product.bulkPricing.map(bp => ({
          minQuantity: bp.minQuantity,
          maxQuantity: bp.maxQuantity,
          pricePerUnit: Number(bp.pricePerUnit),
          discountRate: bp.discountRate
        })),
        minOrderQuantity: product.minOrderQty,
        features: product.features ? (Array.isArray(product.features) ? product.features : []) : [],
        material: product.material || '',
        careInstructions: product.careInstructions || '',
        category: product.category ? product.category.name.split('/') : [],
        tags: product.tags ? (Array.isArray(product.tags) ? product.tags : []) : [],
        isNew: product.isNew,
        isBestSeller: product.isBestSeller,
        stock: product.inventory,
        isWishlisted: false
      };

      const formattedRelatedProducts: RelatedProduct[] = relatedProducts.map(p => ({
        id: p.id,
        brandName: p.brand.nameKo,
        name: p.nameKo,
        price: Number(p.basePrice),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : undefined,
        imageUrl: p.thumbnailImage || '/placeholder.svg'
      }));

      return {
        product: formattedProduct,
        relatedProducts: formattedRelatedProducts
      };

    } catch (dbError) {
      console.error('Database error, falling back to mock data:', dbError);
      
      // Mock 데이터 반환
      const mockProduct: ProductDetail = {
        id,
        sku: `DEMO-${id}`,
        brandId: 'demo-brand',
        brandName: 'DEMO BRAND',
        name: '데모 상품 - 골프 폴로셔츠',
        description: '이 상품은 데모용 샘플 상품입니다. 실제 데이터베이스 연결 후 정확한 정보가 표시됩니다.',
        price: 120000,
        discountPrice: 89000,
        discountRate: 26,
        rating: 4.5,
        reviewCount: 42,
        soldCount: 156,
        colors: [
          { id: 'navy', name: '네이비', code: '#1a237e', available: true },
          { id: 'white', name: '화이트', code: '#ffffff', available: true },
          { id: 'black', name: '블랙', code: '#000000', available: false }
        ],
        sizes: [
          { id: '90', name: '90', available: true },
          { id: '95', name: '95', available: true },
          { id: '100', name: '100', available: true },
          { id: '105', name: '105', available: false }
        ],
        images: [
          {
            id: '1',
            url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=800&fit=crop',
            alt: '메인 이미지',
            order: 1
          },
          {
            id: '2', 
            url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&h=800&fit=crop',
            alt: '상세 이미지 1',
            order: 2
          }
        ],
        bulkPricing: [
          { minQuantity: 10, maxQuantity: 29, pricePerUnit: 89000, discountRate: 0 },
          { minQuantity: 30, maxQuantity: 99, pricePerUnit: 84550, discountRate: 5 },
          { minQuantity: 100, maxQuantity: null, pricePerUnit: 80100, discountRate: 10 }
        ],
        minOrderQuantity: 10,
        features: ['흡한속건', '자외선 차단', '4-way 스트레치'],
        material: '폴리에스터 88%, 스판덱스 12%',
        careInstructions: '찬물 세탁, 건조기 사용 금지',
        category: ['남성', '상의', '폴로셔츠'],
        tags: ['골프웨어', '폴로셔츠', '스포츠'],
        isNew: true,
        isBestSeller: false,
        stock: 50,
        isWishlisted: false
      };

      const mockRelatedProducts: RelatedProduct[] = [
        {
          id: 'demo-related-1',
          brandName: 'DEMO BRAND',
          name: '관련 상품 1',
          price: 95000,
          imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=200&h=267&fit=crop'
        },
        {
          id: 'demo-related-2', 
          brandName: 'DEMO BRAND',
          name: '관련 상품 2',
          price: 78000,
          discountPrice: 65000,
          imageUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=200&h=267&fit=crop'
        }
      ];

      return {
        product: mockProduct,
        relatedProducts: mockRelatedProducts
      };
    }

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
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{product.name} - {product.brandName} | GOLF B2B</title>
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                background-color: #fff;
                color: #000;
                line-height: 1.6;
            }

            /* 헤더 스타일 */
            .header-top {
                background: #000;
                color: #fff;
                padding: 8px 0;
                font-size: 12px;
            }

            .header-top-inner {
                max-width: 1280px;
                margin: 0 auto;
                padding: 0 20px;
                display: flex;
                justify-content: space-between;
            }

            .header-main {
                background: #fff;
                border-bottom: 1px solid #e5e5e5;
                position: sticky;
                top: 0;
                z-index: 100;
            }

            .header-main-inner {
                max-width: 1280px;
                margin: 0 auto;
                padding: 0 20px;
                display: flex;
                align-items: center;
                height: 60px;
            }

            .logo {
                font-size: 24px;
                font-weight: 900;
                letter-spacing: -1px;
                margin-right: 40px;
                cursor: pointer;
            }

            /* 브레드크럼 */
            .breadcrumb {
                background: #f8f8f8;
                padding: 12px 0;
                border-bottom: 1px solid #e5e5e5;
            }

            .breadcrumb-inner {
                max-width: 1280px;
                margin: 0 auto;
                padding: 0 20px;
                display: flex;
                gap: 8px;
                font-size: 13px;
                color: #666;
            }

            .breadcrumb span {
                cursor: pointer;
            }

            .breadcrumb span:hover {
                color: #000;
            }

            /* 상품 상세 컨테이너 */
            .product-detail-container {
                max-width: 1280px;
                margin: 40px auto;
                padding: 0 20px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 60px;
            }

            /* 이미지 갤러리 */
            .image-gallery {
                position: sticky;
                top: 100px;
                height: fit-content;
            }

            .main-image {
                width: 100%;
                aspect-ratio: 3/4;
                background: #f5f5f5;
                border-radius: 8px;
                overflow: hidden;
                margin-bottom: 15px;
                position: relative;
            }

            .main-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .image-zoom {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255,255,255,0.9);
                padding: 8px;
                border-radius: 50%;
                cursor: pointer;
            }

            .thumbnail-list {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 10px;
            }

            .thumbnail {
                aspect-ratio: 1;
                background: #f5f5f5;
                border: 2px solid transparent;
                border-radius: 4px;
                cursor: pointer;
                overflow: hidden;
                transition: border-color 0.2s;
            }

            .thumbnail.active {
                border-color: #000;
            }

            .thumbnail:hover {
                border-color: #666;
            }

            .thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            /* 상품 정보 */
            .product-info {
                padding-top: 10px;
            }

            .brand-name {
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 10px;
                cursor: pointer;
            }

            .brand-name:hover {
                text-decoration: underline;
            }

            .product-name {
                font-size: 24px;
                font-weight: 400;
                margin-bottom: 15px;
                line-height: 1.3;
            }

            .product-meta {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e5e5e5;
            }

            .meta-item {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 13px;
                color: #666;
            }

            .rating {
                display: flex;
                gap: 2px;
            }

            .star {
                color: #ffd700;
            }

            /* 가격 정보 */
            .price-section {
                padding: 20px 0;
                border-bottom: 1px solid #e5e5e5;
            }

            .price-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .price-label {
                font-size: 14px;
                color: #666;
            }

            .price-value {
                font-size: 16px;
                text-align: right;
            }

            .discount-rate {
                color: #ff4444;
                font-size: 24px;
                font-weight: 700;
            }

            .final-price {
                font-size: 28px;
                font-weight: 700;
            }

            .original-price {
                color: #999;
                text-decoration: line-through;
                font-size: 18px;
            }

            /* B2B 특별 가격 테이블 */
            .bulk-price-table {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
            }

            .bulk-price-title {
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 10px;
            }

            .bulk-price-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-size: 13px;
            }

            .bulk-price-row.highlight {
                background: #fff;
                margin: 0 -10px;
                padding: 8px 10px;
                border-radius: 4px;
                font-weight: 600;
            }

            /* 옵션 선택 */
            .option-section {
                padding: 20px 0;
                border-bottom: 1px solid #e5e5e5;
            }

            .option-title {
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 10px;
            }

            .color-options {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }

            .color-option {
                width: 40px;
                height: 40px;
                border: 2px solid #ddd;
                border-radius: 50%;
                cursor: pointer;
                position: relative;
                transition: all 0.2s;
            }

            .color-option.selected {
                border-color: #000;
                transform: scale(1.1);
            }

            .color-option:hover {
                border-color: #666;
            }

            .color-option.disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }

            .size-options {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
                gap: 8px;
            }

            .size-option {
                padding: 10px;
                border: 1px solid #ddd;
                text-align: center;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
                border-radius: 4px;
            }

            .size-option:hover {
                background: #f5f5f5;
            }

            .size-option.selected {
                background: #000;
                color: #fff;
                border-color: #000;
            }

            .size-option.disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }

            /* 수량 선택 */
            .quantity-section {
                padding: 20px 0;
                border-bottom: 1px solid #e5e5e5;
            }

            .quantity-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .quantity-control {
                display: flex;
                align-items: center;
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow: hidden;
            }

            .quantity-btn {
                width: 36px;
                height: 36px;
                border: none;
                background: #fff;
                cursor: pointer;
                font-size: 18px;
                transition: background 0.2s;
            }

            .quantity-btn:hover {
                background: #f5f5f5;
            }

            .quantity-input {
                width: 60px;
                height: 36px;
                border: none;
                border-left: 1px solid #ddd;
                border-right: 1px solid #ddd;
                text-align: center;
                font-size: 14px;
            }

            .moq-notice {
                font-size: 13px;
                color: #ff4444;
            }

            .total-price {
                font-size: 16px;
                font-weight: 700;
            }

            /* 액션 버튼 */
            .action-buttons {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 10px;
                margin-top: 30px;
            }

            .btn {
                padding: 16px;
                border: none;
                border-radius: 4px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-wishlist {
                background: #fff;
                border: 1px solid #ddd;
            }

            .btn-wishlist:hover {
                background: #f5f5f5;
            }

            .btn-cart {
                background: #000;
                color: #fff;
            }

            .btn-cart:hover {
                background: #333;
            }

            .btn-buy {
                background: #ff4444;
                color: #fff;
                grid-column: 1 / -1;
            }

            .btn-buy:hover {
                background: #ff3333;
            }

            /* 추가 정보 버튼들 */
            .quick-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }

            .quick-action {
                flex: 1;
                padding: 12px;
                background: #f8f8f8;
                border: none;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .quick-action:hover {
                background: #e5e5e5;
            }

            /* 상품 상세 정보 탭 */
            .detail-tabs {
                margin-top: 60px;
                border-top: 1px solid #000;
            }

            .tab-nav {
                display: flex;
                border-bottom: 1px solid #e5e5e5;
            }

            .tab-item {
                flex: 1;
                padding: 15px;
                text-align: center;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
                background: #f8f8f8;
                border-right: 1px solid #e5e5e5;
                transition: all 0.2s;
            }

            .tab-item:last-child {
                border-right: none;
            }

            .tab-item.active {
                background: #fff;
                font-weight: 700;
                border-bottom: 2px solid #000;
            }

            .tab-content {
                padding: 40px 0;
                min-height: 500px;
            }

            .tab-pane {
                display: none;
            }

            .tab-pane.active {
                display: block;
            }

            /* 상품 설명 콘텐츠 */
            .detail-content {
                max-width: 800px;
                margin: 0 auto;
            }

            .detail-content img {
                width: 100%;
                margin: 20px 0;
            }

            .detail-content h3 {
                font-size: 18px;
                margin: 30px 0 15px;
            }

            .detail-content p {
                margin-bottom: 15px;
                line-height: 1.8;
            }

            /* 사이즈 가이드 테이블 */
            .size-guide-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }

            .size-guide-table th,
            .size-guide-table td {
                padding: 12px;
                text-align: center;
                border: 1px solid #ddd;
            }

            .size-guide-table th {
                background: #f8f8f8;
                font-weight: 600;
            }

            /* 배송 정보 */
            .shipping-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }

            .shipping-row {
                display: flex;
                margin-bottom: 15px;
            }

            .shipping-label {
                width: 120px;
                font-weight: 600;
                font-size: 14px;
            }

            .shipping-value {
                flex: 1;
                font-size: 14px;
                color: #666;
            }

            /* 관련 상품 */
            .related-products {
                max-width: 1280px;
                margin: 60px auto;
                padding: 0 20px;
            }

            .related-title {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 20px;
            }

            .related-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 20px;
            }

            .related-item {
                cursor: pointer;
            }

            .related-image {
                aspect-ratio: 3/4;
                background: #f5f5f5;
                border-radius: 4px;
                margin-bottom: 10px;
                overflow: hidden;
            }

            .related-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .related-brand {
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 4px;
            }

            .related-name {
                font-size: 13px;
                margin-bottom: 8px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .related-price {
                font-size: 14px;
                font-weight: 700;
            }

            /* 플로팅 바 */
            .floating-bar {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #fff;
                border-top: 1px solid #ddd;
                padding: 15px 20px;
                display: none;
                z-index: 99;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
            }

            .floating-bar.show {
                display: block;
            }

            .floating-inner {
                max-width: 1280px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .floating-info {
                display: flex;
                align-items: center;
                gap: 20px;
            }

            .floating-price {
                font-size: 20px;
                font-weight: 700;
            }

            .floating-actions {
                display: flex;
                gap: 10px;
            }

            .floating-btn {
                padding: 12px 30px;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
            }
          `
        }} />
      </head>
      <body>
        {/* 헤더 */}
        <div className="header-top">
          <div className="header-top-inner">
            <div>고객센터 | 브랜드 입점문의 | 대량구매 문의</div>
            <div>로그인 | 회원가입 | 주문배송 | 🇰🇷 KOR | 🇨🇳 中文</div>
          </div>
        </div>

        <div className="header-main">
          <div className="header-main-inner">
            <div className="logo">GOLF B2B</div>
          </div>
        </div>

        {/* 브레드크럼 */}
        <div className="breadcrumb">
          <div className="breadcrumb-inner">
            <span>홈</span> &gt;
            <span>브랜드</span> &gt;
            <span>{product.brandName}</span> &gt;
            <span style={{ color: '#000', fontWeight: 600 }}>{product.name}</span>
          </div>
        </div>

        {/* 상품 상세 */}
        <div className="product-detail-container">
          {/* 이미지 갤러리 */}
          <div className="image-gallery">
            <div className="main-image">
              <img 
                src={product.images[0]?.url || '/placeholder.svg'} 
                alt={product.images[0]?.alt || product.name}
                id="mainImage"
              />
              <div className="image-zoom">🔍</div>
            </div>
            <div className="thumbnail-list">
              {product.images.slice(0, 5).map((image, index) => (
                <div key={image.id} className={`thumbnail ${index === 0 ? 'active' : ''}`} onClick={() => {
                  const mainImg = document.getElementById('mainImage') as HTMLImageElement;
                  if (mainImg) mainImg.src = image.url;
                  document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                  document.querySelectorAll('.thumbnail')[index].classList.add('active');
                }}>
                  <img src={image.url} alt={image.alt} />
                </div>
              ))}
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="product-info">
            <div className="brand-name">{product.brandName}</div>
            <h1 className="product-name">{product.name}</h1>
            
            <div className="product-meta">
              <div className="meta-item">
                <div className="rating">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className="star">{i < Math.floor(product.rating) ? '★' : '☆'}</span>
                  ))}
                </div>
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <div className="meta-item">
                <span>리뷰 {product.reviewCount}개</span>
              </div>
              <div className="meta-item">
                <span>누적판매 {product.soldCount.toLocaleString()}개</span>
              </div>
              <div className="meta-item">
                <span>SKU: {product.sku}</span>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="price-section">
              <div className="price-row">
                <span className="price-label">정상가</span>
                <span className="original-price">₩{product.price.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span className="price-label">판매가</span>
                <div>
                  {product.discountRate > 0 && (
                    <span className="discount-rate">{product.discountRate}%</span>
                  )}
                  <span className="final-price">₩{product.discountPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* B2B 대량구매 가격표 */}
            {product.bulkPricing.length > 0 && (
              <div className="bulk-price-table">
                <div className="bulk-price-title">🎯 대량구매 할인</div>
                {product.bulkPricing.map((bp, index) => (
                  <div key={index} className={`bulk-price-row ${index === 1 ? 'highlight' : ''}`}>
                    <span>
                      {bp.minQuantity}~{bp.maxQuantity || '∞'}개
                    </span>
                    <span>
                      개당 ₩{bp.pricePerUnit.toLocaleString()}
                      {bp.discountRate > 0 && ` (${bp.discountRate}% 할인)`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 옵션 선택 */}
            <div className="option-section">
              {/* 색상 옵션 */}
              {product.colors.length > 0 && (
                <>
                  <div className="option-title">색상</div>
                  <div className="color-options">
                    {product.colors.map((color, index) => (
                      <div 
                        key={color.id}
                        className={`color-option ${index === 0 ? 'selected' : ''} ${!color.available ? 'disabled' : ''}`}
                        style={{ backgroundColor: color.code }}
                        title={color.name}
                      ></div>
                    ))}
                  </div>
                </>
              )}

              {/* 사이즈 옵션 */}
              {product.sizes.length > 0 && (
                <>
                  <div className="option-title" style={{ marginTop: '20px' }}>사이즈</div>
                  <div className="size-options">
                    {product.sizes.map((size, index) => (
                      <div 
                        key={size.id}
                        className={`size-option ${index === 0 ? 'selected' : ''} ${!size.available ? 'disabled' : ''}`}
                      >
                        {size.name}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 수량 선택 */}
            <div className="quantity-section">
              <div className="quantity-row">
                <span className="option-title">수량</span>
                <div className="quantity-control">
                  <button className="quantity-btn" onClick={() => {
                    const input = document.querySelector('.quantity-input') as HTMLInputElement;
                    const current = parseInt(input.value);
                    if (current > product.minOrderQuantity) {
                      input.value = String(current - 1);
                      updateTotalPrice();
                    }
                  }}>-</button>
                  <input 
                    type="number" 
                    className="quantity-input" 
                    defaultValue={product.minOrderQuantity} 
                    min={product.minOrderQuantity}
                    onChange={() => updateTotalPrice()}
                  />
                  <button className="quantity-btn" onClick={() => {
                    const input = document.querySelector('.quantity-input') as HTMLInputElement;
                    input.value = String(parseInt(input.value) + 1);
                    updateTotalPrice();
                  }}>+</button>
                </div>
              </div>
              <div className="quantity-row">
                <span className="moq-notice">* 최소주문수량: {product.minOrderQuantity}개</span>
                <span className="total-price" id="totalPrice">총 ₩{(product.discountPrice * product.minOrderQuantity).toLocaleString()}</span>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="action-buttons">
              <button className="btn btn-wishlist">{product.isWishlisted ? '💖' : '❤️'} 관심상품</button>
              <button className="btn btn-cart" onClick={() => {
                const quantityInput = document.querySelector('.quantity-input') as HTMLInputElement;
                const selectedColor = document.querySelector('.color-option.selected')?.getAttribute('title') || undefined;
                const selectedSize = document.querySelector('.size-option.selected')?.textContent || undefined;
                const quantity = parseInt(quantityInput?.value || '${product.minOrderQuantity}');
                
                // Zustand store를 사용하여 장바구니에 추가
                if (typeof window !== 'undefined') {
                  const { useCartStore } = require('@/lib/stores/cart');
                  const addItem = useCartStore.getState().addItem;
                  
                  const itemId = `${product.id}-${selectedColor || 'default'}-${selectedSize || 'default'}`;
                  
                  addItem({
                    id: itemId,
                    productId: product.id,
                    name: product.name,
                    brandName: product.brandName,
                    price: product.discountPrice,
                    imageUrl: product.images[0]?.url || '/placeholder.svg',
                    color: selectedColor,
                    size: selectedSize,
                    quantity: quantity
                  });
                  
                  alert('장바구니에 추가되었습니다.');
                }
              }}>장바구니 담기</button>
              <button className="btn btn-buy">바로 구매하기</button>
            </div>

            {/* 빠른 액션 */}
            <div className="quick-actions">
              <button className="quick-action">📋 견적서 요청</button>
              <button className="quick-action">📞 전화 문의</button>
              <button className="quick-action">💬 카카오톡 상담</button>
            </div>

            {/* 배송 정보 */}
            <div className="shipping-info" style={{ marginTop: '30px' }}>
              <div className="shipping-row">
                <span className="shipping-label">배송방법</span>
                <span className="shipping-value">EMS 국제특송 (중국 직배송 가능)</span>
              </div>
              <div className="shipping-row">
                <span className="shipping-label">배송기간</span>
                <span className="shipping-value">결제 후 3~5일 (중국 기준)</span>
              </div>
              <div className="shipping-row">
                <span className="shipping-label">배송비</span>
                <span className="shipping-value">₩300,000 이상 무료배송</span>
              </div>
              <div className="shipping-row">
                <span className="shipping-label">통관</span>
                <span className="shipping-value">간편통관 지원 (세금계산서 발행 가능)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 상세정보 탭 */}
        <div className="detail-tabs">
          <div className="tab-nav">
            <div className="tab-item active" data-tab="description">상품상세</div>
            <div className="tab-item" data-tab="size">사이즈 가이드</div>
            <div className="tab-item" data-tab="review">상품리뷰 ({product.reviewCount})</div>
            <div className="tab-item" data-tab="qna">Q&A</div>
            <div className="tab-item" data-tab="shipping">배송/교환/반품</div>
          </div>

          <div className="tab-content">
            {/* 상품상세 탭 */}
            <div className="tab-pane active" id="description">
              <div className="detail-content">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p>상품 상세 정보가 준비 중입니다.</p>
                )}
                
                {product.features.length > 0 && (
                  <>
                    <h3>주요 특징</h3>
                    <ul>
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </>
                )}
                
                {product.material && (
                  <>
                    <h3>소재</h3>
                    <p>{product.material}</p>
                  </>
                )}
                
                {product.careInstructions && (
                  <>
                    <h3>관리 방법</h3>
                    <p>{product.careInstructions}</p>
                  </>
                )}
              </div>
            </div>

            {/* 사이즈 가이드 탭 */}
            <div className="tab-pane" id="size">
              <div className="detail-content">
                <h3>사이즈 가이드</h3>
                {product.sizes.length > 0 ? (
                  <p>사이즈 가이드가 준비 중입니다.</p>
                ) : (
                  <p>사이즈 정보가 없습니다.</p>
                )}
              </div>
            </div>

            {/* 리뷰 탭 */}
            <div className="tab-pane" id="review">
              <div className="detail-content">
                <h3>구매 리뷰</h3>
                <p>리뷰가 준비 중입니다.</p>
              </div>
            </div>

            {/* Q&A 탭 */}
            <div className="tab-pane" id="qna">
              <div className="detail-content">
                <h3>상품 Q&A</h3>
                <p>Q&A가 준비 중입니다.</p>
              </div>
            </div>

            {/* 배송정보 탭 */}
            <div className="tab-pane" id="shipping">
              <div className="detail-content">
                <h3>배송 정보</h3>
                <p>• 배송방법: EMS 국제특송<br/>
                • 배송기간: 결제 후 3~5일<br/>
                • 배송비: 주문금액 ₩300,000 이상 무료배송</p>
                
                <h3>교환/반품 안내</h3>
                <p>• 상품 수령 후 7일 이내 가능<br/>
                • 상품 불량 및 오배송: 100% 교환/환불<br/>
                • 단순 변심: 왕복 배송비 구매자 부담</p>
              </div>
            </div>
          </div>
        </div>

        {/* 관련 상품 */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2 className="related-title">함께 구매하면 좋은 상품</h2>
            <div className="related-grid">
              {relatedProducts.map((item) => (
                <div key={item.id} className="related-item">
                  <div className="related-image">
                    <img src={item.imageUrl} alt={item.name} />
                  </div>
                  <div className="related-brand">{item.brandName}</div>
                  <div className="related-name">{item.name}</div>
                  <div className="related-price">
                    {item.discountPrice ? (
                      <>₩{item.discountPrice.toLocaleString()}</>
                    ) : (
                      <>₩{item.price.toLocaleString()}</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 플로팅 바 */}
        <div className="floating-bar" id="floatingBar">
          <div className="floating-inner">
            <div className="floating-info">
              <span>{product.name}</span>
              <span className="floating-price">₩{product.discountPrice.toLocaleString()}</span>
            </div>
            <div className="floating-actions">
              <button className="floating-btn" style={{ background: '#fff', border: '1px solid #ddd' }}>장바구니</button>
              <button className="floating-btn" style={{ background: '#000', color: '#fff' }}>바로구매</button>
            </div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            // 수량별 총 가격 계산
            function updateTotalPrice() {
              const quantityInput = document.querySelector('.quantity-input');
              const totalPriceElement = document.getElementById('totalPrice');
              const unitPrice = ${product.discountPrice};
              const bulkPricing = ${JSON.stringify(product.bulkPricing)};
              
              let quantity = parseInt(quantityInput.value);
              if (quantity < ${product.minOrderQuantity}) {
                quantity = ${product.minOrderQuantity};
                quantityInput.value = quantity;
              }
              
              let finalPrice = unitPrice;
              
              // 대량구매 할인 적용
              for (const bp of bulkPricing) {
                if (quantity >= bp.minQuantity && (!bp.maxQuantity || quantity <= bp.maxQuantity)) {
                  finalPrice = bp.pricePerUnit;
                  break;
                }
              }
              
              const total = finalPrice * quantity;
              totalPriceElement.textContent = '총 ₩' + total.toLocaleString();
            }

            // 색상 옵션 선택
            document.querySelectorAll('.color-option:not(.disabled)').forEach(option => {
              option.addEventListener('click', function() {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
              });
            });

            // 사이즈 옵션 선택
            document.querySelectorAll('.size-option:not(.disabled)').forEach(option => {
              option.addEventListener('click', function() {
                document.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
              });
            });

            // 탭 전환
            document.querySelectorAll('.tab-item').forEach(tab => {
              tab.addEventListener('click', function() {
                const tabName = this.dataset.tab;
                
                // 탭 활성화
                document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // 콘텐츠 전환
                document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
                document.getElementById(tabName).classList.add('active');
              });
            });

            // 플로팅 바 표시/숨김
            window.addEventListener('scroll', function() {
              const productInfo = document.querySelector('.product-info');
              const rect = productInfo.getBoundingClientRect();
              const floatingBar = document.getElementById('floatingBar');
              
              if (rect.bottom < 0) {
                floatingBar.classList.add('show');
              } else {
                floatingBar.classList.remove('show');
              }
            });

            // 관심상품 토글
            document.querySelector('.btn-wishlist').addEventListener('click', function() {
              const isWishlisted = this.textContent.includes('💖');
              if (isWishlisted) {
                this.innerHTML = '❤️ 관심상품';
                this.style.background = '#fff';
              } else {
                this.innerHTML = '💖 관심상품 추가됨';
                this.style.background = '#ffe0e0';
              }
            });
            
            // 초기 총 가격 계산
            updateTotalPrice();
          `
        }} />
      </body>
    </html>
  );
}