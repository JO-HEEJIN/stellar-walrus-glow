'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, CartItem } from '@/lib/stores/cart';

export default function ShoppingCartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (Array.isArray(items) && items.length > 0) {
      setSelectedItems(items.map(item => item.id));
    }
  }, [items]);

  if (!mounted) {
    return null;
  }

  // 브랜드별로 아이템 그룹화 (items가 배열인지 확인)
  const groupedByBrand = (Array.isArray(items) ? items : []).reduce((groups, item) => {
    const brand = item.brandName || '기타';
    if (!groups[brand]) {
      groups[brand] = [];
    }
    groups[brand].push(item);
    return groups;
  }, {} as Record<string, CartItem[]>);

  // 선택된 아이템들의 총액과 개수 계산
  const selectedTotal = (Array.isArray(items) ? items : [])
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const selectedCount = selectedItems.length;
  const totalItems = Array.isArray(items) ? items.length : 0;
  const allSelected = totalItems > 0 && selectedItems.length === totalItems;

  // 전체 선택/해제
  const handleSelectAll = (selected: boolean) => {
    if (selected && Array.isArray(items)) {
      setSelectedItems(items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // 개별 아이템 선택/해제
  const handleItemSelect = (itemId: string, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  // 브랜드 전체 선택/해제
  const handleBrandSelect = (brandName: string, selected: boolean) => {
    const brandItems = Array.isArray(groupedByBrand[brandName]) ? groupedByBrand[brandName] : [];
    const brandItemIds = brandItems.map(item => item.id);
    
    if (selected) {
      setSelectedItems(prev => [...new Set([...prev, ...brandItemIds])]);
    } else {
      setSelectedItems(prev => prev.filter(id => !brandItemIds.includes(id)));
    }
  };

  // 선택 삭제
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      alert('삭제할 상품을 선택해주세요.');
      return;
    }
    
    if (confirm(`선택한 ${selectedItems.length}개 상품을 삭제하시겠습니까?`)) {
      selectedItems.forEach(itemId => removeItem(itemId));
      setSelectedItems([]);
    }
  };

  // 수량 변경
  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    updateQuantity(itemId, quantity);
  };

  // 아이템 제거
  const handleRemoveItem = (itemId: string) => {
    if (confirm('해당 상품을 삭제하시겠습니까?')) {
      removeItem(itemId);
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  // 결제 페이지로 이동
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('구매할 상품을 선택해주세요.');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <html lang="ko">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>장바구니 - GOLF B2B</title>
          <style dangerouslySetInnerHTML={{
            __html: `
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }

              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                background-color: #f8f9fa;
                color: #000;
                line-height: 1.6;
              }

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

              .empty-cart {
                max-width: 1280px;
                margin: 80px auto;
                text-align: center;
                padding: 80px 20px;
              }

              .empty-icon {
                font-size: 64px;
                margin-bottom: 20px;
              }

              .empty-title {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 10px;
              }

              .empty-message {
                font-size: 16px;
                color: #666;
                margin-bottom: 30px;
              }

              .continue-shopping {
                display: inline-block;
                padding: 15px 30px;
                background: #000;
                color: #fff;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 600;
                transition: background 0.2s;
              }

              .continue-shopping:hover {
                background: #333;
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
              <div className="logo" onClick={() => router.push('/')}>GOLF B2B</div>
            </div>
          </div>

          {/* 빈 장바구니 */}
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <div className="empty-title">장바구니가 비어있습니다</div>
            <div className="empty-message">원하는 상품을 장바구니에 담아보세요</div>
            <a href="/" className="continue-shopping">쇼핑 계속하기</a>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>장바구니 - GOLF B2B</title>
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              background-color: #f8f9fa;
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

            /* 장바구니 컨테이너 */
            .cart-container {
              max-width: 1280px;
              margin: 40px auto;
              padding: 0 20px;
              display: grid;
              grid-template-columns: 1fr 320px;
              gap: 30px;
            }

            /* 장바구니 헤더 */
            .cart-header {
              margin-bottom: 30px;
            }

            .cart-title {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 10px;
            }

            .cart-steps {
              display: flex;
              gap: 30px;
              margin-bottom: 20px;
            }

            .step {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;
            }

            .step-number {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 12px;
            }

            .step.active .step-number {
              background: #000;
              color: #fff;
            }

            .step.inactive .step-number {
              background: #e5e5e5;
              color: #999;
            }

            /* 장바구니 메인 */
            .cart-main {
              background: #fff;
              border-radius: 8px;
              overflow: hidden;
            }

            /* 선택 바 */
            .selection-bar {
              padding: 20px;
              background: #f8f9fa;
              border-bottom: 1px solid #e5e5e5;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .selection-left {
              display: flex;
              align-items: center;
              gap: 15px;
            }

            .checkbox {
              width: 20px;
              height: 20px;
              cursor: pointer;
            }

            .selection-text {
              font-size: 14px;
            }

            .selection-right {
              display: flex;
              gap: 10px;
            }

            .action-btn {
              padding: 8px 16px;
              border: 1px solid #ddd;
              background: #fff;
              border-radius: 4px;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.2s;
            }

            .action-btn:hover {
              background: #f5f5f5;
            }

            .action-btn.delete {
              color: #ff4444;
              border-color: #ff4444;
            }

            .action-btn.delete:hover {
              background: #ffe0e0;
            }

            /* 브랜드 그룹 */
            .brand-group {
              border-bottom: 1px solid #f0f0f0;
            }

            .brand-header {
              padding: 20px;
              background: #fafafa;
              display: flex;
              align-items: center;
              gap: 15px;
              font-weight: 600;
              font-size: 16px;
            }

            /* 상품 아이템 */
            .cart-item {
              padding: 20px;
              border-bottom: 1px solid #f0f0f0;
              display: flex;
              gap: 20px;
              align-items: center;
            }

            .item-select {
              margin-right: 10px;
            }

            .item-image {
              width: 100px;
              height: 120px;
              background: #f5f5f5;
              border-radius: 4px;
              overflow: hidden;
              flex-shrink: 0;
            }

            .item-image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .item-info {
              flex: 1;
            }

            .item-brand {
              font-size: 14px;
              font-weight: 600;
              color: #666;
              margin-bottom: 4px;
            }

            .item-name {
              font-size: 16px;
              font-weight: 500;
              margin-bottom: 8px;
            }

            .item-options {
              font-size: 13px;
              color: #666;
              margin-bottom: 12px;
            }

            .item-price-row {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 12px;
            }

            .item-discount {
              color: #ff4444;
              font-weight: 700;
              font-size: 14px;
            }

            .item-price {
              font-size: 18px;
              font-weight: 700;
            }

            .item-original-price {
              color: #999;
              text-decoration: line-through;
              font-size: 14px;
            }

            /* 수량 조절 */
            .quantity-controls {
              display: flex;
              align-items: center;
              gap: 15px;
            }

            .quantity-control {
              display: flex;
              align-items: center;
              border: 1px solid #ddd;
              border-radius: 4px;
              overflow: hidden;
            }

            .quantity-btn {
              width: 32px;
              height: 32px;
              border: none;
              background: #fff;
              cursor: pointer;
              font-size: 16px;
              transition: background 0.2s;
            }

            .quantity-btn:hover {
              background: #f5f5f5;
            }

            .quantity-input {
              width: 50px;
              height: 32px;
              border: none;
              border-left: 1px solid #ddd;
              border-right: 1px solid #ddd;
              text-align: center;
              font-size: 14px;
            }

            .total-price {
              font-size: 18px;
              font-weight: 700;
              margin-right: 15px;
            }

            .remove-btn {
              padding: 6px 12px;
              border: 1px solid #ddd;
              background: #fff;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
              color: #666;
              transition: all 0.2s;
            }

            .remove-btn:hover {
              color: #ff4444;
              border-color: #ff4444;
            }

            /* 사이드바 */
            .cart-sidebar {
              position: sticky;
              top: 100px;
              height: fit-content;
            }

            .order-summary {
              background: #fff;
              border-radius: 8px;
              padding: 25px;
              margin-bottom: 20px;
            }

            .summary-title {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 20px;
            }

            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              font-size: 14px;
            }

            .summary-row.total {
              padding-top: 15px;
              border-top: 1px solid #e5e5e5;
              font-size: 18px;
              font-weight: 700;
            }

            .checkout-btn {
              width: 100%;
              padding: 16px;
              background: #000;
              color: #fff;
              border: none;
              border-radius: 4px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              margin-bottom: 15px;
              transition: background 0.2s;
            }

            .checkout-btn:hover {
              background: #333;
            }

            .checkout-btn:disabled {
              background: #ccc;
              cursor: not-allowed;
            }

            .continue-shopping-btn {
              width: 100%;
              padding: 16px;
              background: #fff;
              color: #000;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            }

            .continue-shopping-btn:hover {
              background: #f5f5f5;
            }

            /* 배송 정보 */
            .shipping-info {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              font-size: 13px;
              line-height: 1.6;
              color: #666;
            }

            .shipping-info h4 {
              color: #000;
              margin-bottom: 10px;
              font-size: 14px;
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
            <div className="logo" onClick={() => router.push('/')}>GOLF B2B</div>
          </div>
        </div>

        {/* 장바구니 헤더 */}
        <div className="cart-header" style={{ maxWidth: '1280px', margin: '40px auto 0', padding: '0 20px' }}>
          <h1 className="cart-title">장바구니</h1>
          <div className="cart-steps">
            <div className="step active">
              <div className="step-number">1</div>
              <span>장바구니</span>
            </div>
            <div className="step inactive">
              <div className="step-number">2</div>
              <span>주문/결제</span>
            </div>
            <div className="step inactive">
              <div className="step-number">3</div>
              <span>주문완료</span>
            </div>
          </div>
        </div>

        {/* 장바구니 컨테이너 */}
        <div className="cart-container">
          {/* 메인 콘텐츠 */}
          <div className="cart-main">
            {/* 선택 바 */}
            <div className="selection-bar">
              <div className="selection-left">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span className="selection-text">
                  전체선택 ({selectedCount}/{totalItems})
                </span>
              </div>
              <div className="selection-right">
                <button className="action-btn delete" onClick={handleDeleteSelected}>
                  선택삭제
                </button>
              </div>
            </div>

            {/* 브랜드별 상품 그룹 */}
            {Object.entries(groupedByBrand).map(([brandName, brandItems]) => {
              const brandSelected = brandItems.every(item => selectedItems.includes(item.id));
              
              return (
                <div key={brandName} className="brand-group">
                  <div className="brand-header">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={brandSelected}
                      onChange={(e) => handleBrandSelect(brandName, e.target.checked)}
                    />
                    <span>{brandName}</span>
                  </div>

                  {brandItems.map((item) => {
                    const isSelected = selectedItems.includes(item.id);
                    const totalItemPrice = item.price * item.quantity;
                    
                    return (
                      <div key={item.id} className="cart-item">
                        <input
                          type="checkbox"
                          className="checkbox item-select"
                          checked={isSelected}
                          onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                        />

                        <div className="item-image">
                          <img src={item.imageUrl || '/placeholder.svg'} alt={item.name} />
                        </div>

                        <div className="item-info">
                          <div className="item-brand">{item.brandName}</div>
                          <div className="item-name">{item.name}</div>
                          {(item.color || item.size) && (
                            <div className="item-options">
                              {item.color && `색상: ${item.color}`}
                              {item.color && item.size && ' | '}
                              {item.size && `사이즈: ${item.size}`}
                            </div>
                          )}
                          <div className="item-price-row">
                            <span className="item-price">₩{item.price.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="quantity-controls">
                          <div className="quantity-control">
                            <button
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="quantity-input"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                              min="1"
                            />
                            <button
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          
                          <div className="total-price">₩{totalItemPrice.toLocaleString()}</div>
                          
                          <button
                            className="remove-btn"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* 사이드바 */}
          <div className="cart-sidebar">
            <div className="order-summary">
              <h3 className="summary-title">주문요약</h3>
              
              <div className="summary-row">
                <span>상품금액</span>
                <span>₩{selectedTotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>배송비</span>
                <span>{selectedTotal >= 300000 ? '무료' : '₩30,000'}</span>
              </div>
              <div className="summary-row total">
                <span>총 결제금액</span>
                <span>₩{(selectedTotal + (selectedTotal >= 300000 ? 0 : 30000)).toLocaleString()}</span>
              </div>

              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={selectedCount === 0}
              >
                주문하기 ({selectedCount})
              </button>

              <button
                className="continue-shopping-btn"
                onClick={() => router.push('/')}
              >
                쇼핑 계속하기
              </button>
            </div>

            <div className="shipping-info">
              <h4>배송 안내</h4>
              <p>• 30만원 이상 무료배송</p>
              <p>• EMS 국제특송 (중국 직배송)</p>
              <p>• 결제 후 3-5일 배송</p>
              <p>• 간편통관 지원</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}