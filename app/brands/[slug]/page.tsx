import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Brand {
  id: string;
  slug: string;
  name: string;
  nameKo: string;
  description?: string;
  logoUrl?: string;
  tagline?: string;
  stats: {
    productCount: number;
    averageRating: number;
    totalOrders: number;
    foundedYear: number;
  };
}

async function getBrand(slug: string): Promise<Brand | null> {
  // 실제 브랜드 데이터 (데이터베이스에 있는 브랜드들)
  const brands: Record<string, Brand> = {
    'malbon-golf': {
      id: 'malbon-golf',
      slug: 'malbon-golf',
      name: 'MALBON GOLF',
      nameKo: 'MALBON GOLF',
      description: '말본 골프(MALBON GOLF)는 패션 디자이너 스테판 말본과 에리카 말본 부부가 론칭한 스트릿 감성의 라이프스타일 골프 웨어 브랜드입니다.',
      logoUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=200&h=100&fit=crop',
      tagline: '스트릿 감성의 라이프스타일 골프웨어',
      stats: {
        productCount: 128,
        averageRating: 4.8,
        totalOrders: 2847,
        foundedYear: 2017
      }
    },
    'southcape': {
      id: 'southcape',
      slug: 'southcape',
      name: 'SOUTHCAPE',
      nameKo: 'SOUTHCAPE',
      description: '사우스케이프가 골프 & 리조트 분야의 새로운 이상향을 제시한 것과 같이 골프웨어 분야에서도 일반적으로 티피컬한 골프웨어를 스타일리시하게 변화시켜, 새로운 이정표를 제시합니다.',
      logoUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=200&h=100&fit=crop',
      tagline: '골프 & 리조트 토탈 아웃도어 라이프스타일',
      stats: {
        productCount: 95,
        averageRating: 4.6,
        totalOrders: 1924,
        foundedYear: 2015
      }
    },
    'st-andrews': {
      id: 'st-andrews',
      slug: 'st-andrews',
      name: 'St.Andrews',
      nameKo: 'St.Andrews',
      description: '스코틀랜드의 클래식함을 바탕으로 품격이 넘치는 라이프 스타일을 패션과 결합한 하이엔드 골프웨어',
      logoUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=200&h=100&fit=crop',
      tagline: '스코틀랜드의 클래식함과 품격이 넘치는 하이엔드 골프웨어',
      stats: {
        productCount: 156,
        averageRating: 4.9,
        totalOrders: 3521,
        foundedYear: 1754
      }
    },
    'g-fore': {
      id: 'g-fore',
      slug: 'g-fore',
      name: 'G/FORE',
      nameKo: 'G/FORE',
      description: '2011년 LA 런칭 후 글로벌 브랜드로 성장, "골프의 전통성을 존중하는 파괴적인 럭셔리"를 컨셉으로 젊은 감각과 모던한 디자인을 선보입니다.',
      logoUrl: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=200&h=100&fit=crop',
      tagline: '골프의 전통성을 존중하는 파괴적인 럭셔리',
      stats: {
        productCount: 82,
        averageRating: 4.7,
        totalOrders: 1635,
        foundedYear: 2011
      }
    }
  };

  return brands[slug] || null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const brand = await getBrand(params.slug);

  if (!brand) {
    return {
      title: 'Brand Not Found',
    };
  }

  return {
    title: `${brand.nameKo} - GOLF B2B`,
    description: brand.description || `${brand.nameKo} 브랜드 상품 목록`,
  };
}

interface BrandPageProps {
  params: { slug: string };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const brand = await getBrand(params.slug);

  if (!brand) {
    notFound();
  }

  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{brand.nameKo} - GOLF B2B</title>
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
                cursor: pointer;
            }

            /* 브랜드 헤더 */
            .brand-header {
                background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
                color: #fff;
                padding: 60px 0;
                margin-bottom: 40px;
            }

            .brand-header-inner {
                max-width: 1280px;
                margin: 0 auto;
                padding: 0 20px;
                display: grid;
                grid-template-columns: 200px 1fr auto;
                gap: 40px;
                align-items: center;
            }

            .brand-logo {
                width: 200px;
                height: 100px;
                background: #fff;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: 900;
                color: #000;
            }

            .brand-logo img {
                max-width: 180px;
                max-height: 80px;
                object-fit: contain;
            }

            .brand-info h1 {
                font-size: 36px;
                font-weight: 900;
                margin-bottom: 10px;
            }

            .brand-tagline {
                font-size: 16px;
                opacity: 0.9;
                margin-bottom: 20px;
            }

            .brand-stats {
                display: flex;
                gap: 30px;
            }

            .stat-item {
                text-align: center;
            }

            .stat-number {
                font-size: 24px;
                font-weight: 700;
            }

            .stat-label {
                font-size: 12px;
                opacity: 0.8;
            }

            .brand-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .brand-btn {
                padding: 12px 30px;
                background: #fff;
                color: #1a237e;
                border: none;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .brand-btn:hover {
                transform: scale(1.05);
            }

            .brand-btn.outline {
                background: transparent;
                color: #fff;
                border: 2px solid #fff;
            }

            /* 브랜드 네비게이션 */
            .brand-nav {
                background: #f8f8f8;
                border-bottom: 1px solid #e5e5e5;
                position: sticky;
                top: 60px;
                z-index: 99;
            }

            .brand-nav-inner {
                max-width: 1280px;
                margin: 0 auto;
                padding: 0 20px;
                display: flex;
                gap: 30px;
                height: 50px;
                align-items: center;
            }

            .brand-nav-item {
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                padding: 5px 0;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;
            }

            .brand-nav-item:hover {
                border-bottom-color: #666;
            }

            .brand-nav-item.active {
                font-weight: 700;
                border-bottom-color: #000;
            }

            /* 컨테이너 */
            .container {
                max-width: 1280px;
                margin: 0 auto;
                padding: 0 20px 60px;
            }

            /* 컨텐츠 래퍼 */
            .content-wrapper {
                display: grid;
                grid-template-columns: 240px 1fr;
                gap: 30px;
                margin-top: 30px;
            }

            .filter-sidebar {
                position: sticky;
                top: 130px;
                height: fit-content;
            }

            .filter-section {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e5e5e5;
            }

            .filter-section:last-child {
                border-bottom: none;
            }

            .filter-title {
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
            }

            .filter-toggle {
                font-size: 12px;
                transition: transform 0.2s;
            }

            .filter-title.collapsed .filter-toggle {
                transform: rotate(180deg);
            }

            .filter-content {
                max-height: 500px;
                overflow: hidden;
                transition: max-height 0.3s;
            }

            .filter-content.collapsed {
                max-height: 0;
            }

            .filter-option {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 10px;
                font-size: 13px;
                cursor: pointer;
            }

            .filter-option:hover {
                color: #1a237e;
            }

            .filter-checkbox {
                width: 16px;
                height: 16px;
            }

            .filter-count {
                margin-left: auto;
                color: #999;
                font-size: 12px;
            }

            /* 가격 범위 슬라이더 */
            .price-range {
                margin: 20px 0;
            }

            .price-inputs {
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                gap: 10px;
                align-items: center;
                margin-bottom: 15px;
            }

            .price-input {
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 13px;
            }

            .price-slider {
                width: 100%;
                margin: 10px 0;
            }

            /* 색상 필터 */
            .color-filters {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 8px;
            }

            .color-filter {
                width: 28px;
                height: 28px;
                border: 2px solid #ddd;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
            }

            .color-filter:hover {
                transform: scale(1.1);
            }

            .color-filter.selected {
                border-color: #000;
                box-shadow: 0 0 0 2px #fff, 0 0 0 3px #000;
            }

            /* 컨텐츠 영역 */
            .main-content {
                min-height: 800px;
            }

            /* 정렬 바 */
            .sort-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 15px 0;
                border-bottom: 1px solid #e5e5e5;
            }

            .result-count {
                font-size: 14px;
                color: #666;
            }

            .sort-options {
                display: flex;
                gap: 20px;
                align-items: center;
            }

            .view-options {
                display: flex;
                gap: 5px;
            }

            .view-btn {
                width: 32px;
                height: 32px;
                border: 1px solid #ddd;
                background: #fff;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .view-btn:hover {
                background: #f5f5f5;
            }

            .view-btn.active {
                background: #000;
                color: #fff;
                border-color: #000;
            }

            .sort-select {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
            }

            /* 상품 그리드 */
            .product-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                gap: 20px;
            }

            .product-grid.list-view {
                grid-template-columns: 1fr;
            }

            /* 상품 카드 */
            .product-card {
                cursor: pointer;
                transition: transform 0.2s;
                position: relative;
            }

            .product-card:hover {
                transform: translateY(-5px);
            }

            .product-image-container {
                position: relative;
                padding-bottom: 120%;
                overflow: hidden;
                background: #f5f5f5;
                border-radius: 8px;
            }

            .product-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .product-badge {
                position: absolute;
                top: 10px;
                left: 10px;
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .badge {
                padding: 4px 8px;
                background: #ff4444;
                color: #fff;
                font-size: 11px;
                font-weight: 700;
                border-radius: 4px;
            }

            .badge.new {
                background: #4caf50;
            }

            .badge.best {
                background: #2196f3;
            }

            .quick-actions {
                position: absolute;
                bottom: 10px;
                right: 10px;
                display: flex;
                gap: 8px;
                opacity: 0;
                transition: opacity 0.3s;
            }

            .product-card:hover .quick-actions {
                opacity: 1;
            }

            .quick-action-btn {
                width: 36px;
                height: 36px;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid #ddd;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
            }

            .quick-action-btn:hover {
                background: #000;
                color: #fff;
                transform: scale(1.1);
            }

            .product-info {
                padding: 12px 0;
            }

            .product-category {
                font-size: 11px;
                color: #999;
                margin-bottom: 4px;
            }

            .product-name {
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                line-height: 1.4;
            }

            .product-price-area {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }

            .product-discount {
                color: #ff4444;
                font-weight: 700;
                font-size: 15px;
            }

            .product-price {
                font-size: 16px;
                font-weight: 700;
            }

            .product-original-price {
                color: #999;
                text-decoration: line-through;
                font-size: 13px;
            }

            .product-moq {
                display: inline-block;
                padding: 2px 6px;
                background: #f0f0f0;
                border-radius: 4px;
                font-size: 11px;
                color: #666;
            }

            .no-products {
                text-align: center;
                padding: 60px 20px;
                color: #666;
            }

            .no-products-icon {
                font-size: 48px;
                margin-bottom: 20px;
            }

            .no-products-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
            }

            .no-products-message {
                font-size: 14px;
                line-height: 1.6;
            }

            /* 페이지네이션 */
            .pagination {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 5px;
                margin-top: 40px;
                padding: 20px 0;
            }

            .page-btn {
                min-width: 36px;
                height: 36px;
                padding: 0 10px;
                border: 1px solid #ddd;
                background: #fff;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .page-btn:hover {
                background: #f5f5f5;
            }

            .page-btn.active {
                background: #000;
                color: #fff;
                border-color: #000;
            }

            .page-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
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
            <a href="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>GOLF B2B</a>
          </div>
        </div>

        {/* 브랜드 헤더 */}
        <div className="brand-header">
          <div className="brand-header-inner">
            <div className="brand-logo">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.nameKo} />
              ) : (
                brand.nameKo
              )}
            </div>
            <div className="brand-info">
              <h1>{brand.nameKo}</h1>
              <p className="brand-tagline">{brand.tagline}</p>
              <div className="brand-stats">
                <div className="stat-item">
                  <div className="stat-number">{brand.stats.productCount}</div>
                  <div className="stat-label">등록 상품</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{brand.stats.averageRating}</div>
                  <div className="stat-label">평균 평점</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{brand.stats.totalOrders.toLocaleString()}</div>
                  <div className="stat-label">누적 주문</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">Since {brand.stats.foundedYear}</div>
                  <div className="stat-label">브랜드 역사</div>
                </div>
              </div>
            </div>
            <div className="brand-actions">
              <button className="brand-btn">브랜드 팔로우</button>
              <button className="brand-btn outline">카탈로그 다운로드</button>
            </div>
          </div>
        </div>

        {/* 브랜드 네비게이션 */}
        <div className="brand-nav">
          <div className="brand-nav-inner">
            <div className="brand-nav-item active">전체상품</div>
            <div className="brand-nav-item">신상품</div>
            <div className="brand-nav-item">베스트셀러</div>
            <div className="brand-nav-item">남성</div>
            <div className="brand-nav-item">여성</div>
            <div className="brand-nav-item">용품</div>
            <div className="brand-nav-item">세일</div>
            <div className="brand-nav-item">브랜드 스토리</div>
          </div>
        </div>

        {/* 메인 컨테이너 */}
        <div className="container">
          {/* 컨텐츠 래퍼 */}
          <div className="content-wrapper">
            {/* 필터 사이드바 */}
            <aside className="filter-sidebar">
              {/* 카테고리 필터 */}
              <div className="filter-section">
                <div className="filter-title">
                  카테고리
                  <span className="filter-toggle">▼</span>
                </div>
                <div className="filter-content">
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="cat-all" defaultChecked />
                    <label htmlFor="cat-all">전체</label>
                    <span className="filter-count">{brand.stats.productCount}</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="cat-men" />
                    <label htmlFor="cat-men">남성 의류</label>
                    <span className="filter-count">52</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="cat-women" />
                    <label htmlFor="cat-women">여성 의류</label>
                    <span className="filter-count">38</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="cat-acc" />
                    <label htmlFor="cat-acc">액세서리</label>
                    <span className="filter-count">24</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="cat-bag" />
                    <label htmlFor="cat-bag">가방/용품</label>
                    <span className="filter-count">14</span>
                  </div>
                </div>
              </div>

              {/* 가격 필터 */}
              <div className="filter-section">
                <div className="filter-title">
                  가격
                  <span className="filter-toggle">▼</span>
                </div>
                <div className="filter-content">
                  <div className="price-range">
                    <div className="price-inputs">
                      <input type="number" className="price-input" placeholder="최소" defaultValue="0" />
                      <span>~</span>
                      <input type="number" className="price-input" placeholder="최대" defaultValue="500000" />
                    </div>
                    <input type="range" className="price-slider" min="0" max="500000" defaultValue="250000" />
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="price-1" />
                    <label htmlFor="price-1">5만원 이하</label>
                    <span className="filter-count">12</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="price-2" />
                    <label htmlFor="price-2">5-10만원</label>
                    <span className="filter-count">45</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="price-3" />
                    <label htmlFor="price-3">10-20만원</label>
                    <span className="filter-count">48</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="price-4" />
                    <label htmlFor="price-4">20만원 이상</label>
                    <span className="filter-count">23</span>
                  </div>
                </div>
              </div>

              {/* 색상 필터 */}
              <div className="filter-section">
                <div className="filter-title">
                  색상
                  <span className="filter-toggle">▼</span>
                </div>
                <div className="filter-content">
                  <div className="color-filters">
                    <div className="color-filter" style={{ background: '#000' }} title="블랙"></div>
                    <div className="color-filter" style={{ background: '#fff', borderColor: '#ddd' }} title="화이트"></div>
                    <div className="color-filter" style={{ background: '#1a237e' }} title="네이비"></div>
                    <div className="color-filter" style={{ background: '#757575' }} title="그레이"></div>
                    <div className="color-filter" style={{ background: '#ef5350' }} title="레드"></div>
                    <div className="color-filter" style={{ background: '#2196f3' }} title="블루"></div>
                    <div className="color-filter" style={{ background: '#4caf50' }} title="그린"></div>
                    <div className="color-filter" style={{ background: '#ffc107' }} title="옐로우"></div>
                    <div className="color-filter" style={{ background: '#ff6b35' }} title="오렌지"></div>
                    <div className="color-filter" style={{ background: '#e91e63' }} title="핑크"></div>
                    <div className="color-filter" style={{ background: '#9c27b0' }} title="퍼플"></div>
                    <div className="color-filter" style={{ background: '#8d6e63' }} title="브라운"></div>
                  </div>
                </div>
              </div>

              {/* 사이즈 필터 */}
              <div className="filter-section">
                <div className="filter-title">
                  사이즈
                  <span className="filter-toggle">▼</span>
                </div>
                <div className="filter-content">
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="size-s" />
                    <label htmlFor="size-s">S (90)</label>
                    <span className="filter-count">42</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="size-m" />
                    <label htmlFor="size-m">M (95)</label>
                    <span className="filter-count">68</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="size-l" />
                    <label htmlFor="size-l">L (100)</label>
                    <span className="filter-count">72</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="size-xl" />
                    <label htmlFor="size-xl">XL (105)</label>
                    <span className="filter-count">58</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="size-xxl" />
                    <label htmlFor="size-xxl">2XL (110)</label>
                    <span className="filter-count">35</span>
                  </div>
                </div>
              </div>

              {/* MOQ 필터 */}
              <div className="filter-section">
                <div className="filter-title">
                  최소주문수량
                  <span className="filter-toggle">▼</span>
                </div>
                <div className="filter-content">
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="moq-1" />
                    <label htmlFor="moq-1">5개 이하</label>
                    <span className="filter-count">23</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="moq-2" />
                    <label htmlFor="moq-2">10개 이하</label>
                    <span className="filter-count">64</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="moq-3" />
                    <label htmlFor="moq-3">20개 이하</label>
                    <span className="filter-count">32</span>
                  </div>
                  <div className="filter-option">
                    <input type="checkbox" className="filter-checkbox" id="moq-4" />
                    <label htmlFor="moq-4">20개 초과</label>
                    <span className="filter-count">9</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* 메인 컨텐츠 */}
            <main className="main-content">
              {/* 정렬 바 */}
              <div className="sort-bar">
                <span className="result-count">총 {brand.stats.productCount}개 상품</span>
                <div className="sort-options">
                  <select className="sort-select">
                    <option>추천순</option>
                    <option>신상품순</option>
                    <option>판매량순</option>
                    <option>낮은가격순</option>
                    <option>높은가격순</option>
                    <option>할인율순</option>
                  </select>
                  <div className="view-options">
                    <button className="view-btn active" data-view="grid">⊞</button>
                    <button className="view-btn" data-view="list">☰</button>
                  </div>
                </div>
              </div>

              {/* 상품 그리드 - 상품이 없으면 "상품 준비 중" 메시지 표시 */}
              <div className="product-grid" id="productGrid">
                <div className="no-products">
                  <div className="no-products-icon">📦</div>
                  <div className="no-products-title">{brand.nameKo} 상품 준비 중입니다</div>
                  <div className="no-products-message">
                    곧 다양한 {brand.nameKo} 상품들을 만나보실 수 있습니다.<br/>
                    브랜드를 팔로우하시면 신상품 출시 알림을 받으실 수 있습니다.
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            // 뷰 전환 (그리드/리스트)
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const view = this.dataset.view;
                    const grid = document.getElementById('productGrid');
                    
                    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    if (view === 'list') {
                        grid.classList.add('list-view');
                    } else {
                        grid.classList.remove('list-view');
                    }
                });
            });

            // 필터 접기/펼치기
            document.querySelectorAll('.filter-title').forEach(title => {
                title.addEventListener('click', function() {
                    this.classList.toggle('collapsed');
                    this.nextElementSibling.classList.toggle('collapsed');
                });
            });

            // 브랜드 팔로우
            document.querySelector('.brand-btn').addEventListener('click', function() {
                if (this.textContent === '브랜드 팔로우') {
                    this.textContent = '팔로잉 중';
                    this.style.background = '#4caf50';
                    this.style.color = '#fff';
                    alert('브랜드를 팔로우했습니다. 신상품 알림을 받으실 수 있습니다.');
                } else {
                    this.textContent = '브랜드 팔로우';
                    this.style.background = '#fff';
                    this.style.color = '#1a237e';
                }
            });

            // 카탈로그 다운로드
            document.querySelector('.brand-btn.outline').addEventListener('click', function() {
                alert('${brand.nameKo} 2025 S/S 카탈로그를 다운로드합니다.');
            });
          `
        }} />
      </body>
    </html>
  );
}