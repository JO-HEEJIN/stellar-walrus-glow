'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/footer'

// Helper function to generate a random product
const createProduct = (id: number) => ({
  id,
  brand: `Brand ${String.fromCharCode(65 + (id % 5))}`,
  name: `Premium Golf Clubs Set ${id + 1}`,
  price: (Math.random() * 500 + 200).toFixed(2),
  originalPrice: (Math.random() * 200 + 700).toFixed(2),
  discount: `${Math.floor(Math.random() * 20) + 10}%`,
  moq: Math.floor(Math.random() * 5) + 1,
  isNew: Math.random() > 0.8,
  image: `https://via.placeholder.com/280x340?text=Product+${id + 1}`,
})

export default function HomePage() {
  const [products, setProducts] = useState(() =>
    Array.from({ length: 12 }, (_, i) => createProduct(i))
  )
  const [activeFilters, setActiveFilters] = useState<string[]>(['All'])
  const [activeNav, setActiveNav] = useState('All')
  const [activeSort, setActiveSort] = useState('Recommended')
  const [loading, setLoading] = useState(false)
  const loader = useRef(null)

  const handleFilterClick = (filter: string) => {
    if (filter === 'All') {
      setActiveFilters(['All'])
    } else {
      setActiveFilters(prev =>
        prev.includes(filter)
          ? prev.filter(f => f !== filter && f !== 'All')
          : [...prev.filter(f => f !== 'All'), filter]
      )
    }
  }

  useEffect(() => {
    if (activeFilters.length === 0) {
      setActiveFilters(['All'])
    }
  }, [activeFilters])

  const loadMoreProducts = () => {
    setLoading(true)
    setTimeout(() => {
      const newProducts = Array.from({ length: 8 }, (_, i) =>
        createProduct(products.length + i)
      )
      setProducts(prev => [...prev, ...newProducts])
      setLoading(false)
    }, 1000)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading) {
          loadMoreProducts()
        }
      },
      { rootMargin: '200px' }
    )

    const currentLoader = loader.current
    if (currentLoader) {
      observer.observe(currentLoader)
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader)
      }
    }
  }, [loader, loading, products.length, loadMoreProducts])

  const handleQuickAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation()
    alert(`${action} clicked!`)
  }

  const handleSearch = () => {
    const input = document.querySelector('.search-input') as HTMLInputElement
    if (input && input.value) {
      alert(`Searching for: ${input.value}`)
    }
  }

  const BRANDS = ['All', 'Titleist', 'Callaway', 'TaylorMade', 'Ping', 'Cobra']
  const NAV_ITEMS = ['All', 'Clubs', 'Balls', 'Apparel', 'Shoes', 'Accessories']
  const SORT_OPTIONS = ['Recommended', 'Newest', 'Price: Low to High', 'Price: High to Low']

  return (
    <>
      <div className="App">
      <header>
        <div className="header-top">
          <div className="header-top-inner">
            <div className="header-top-left">
              <a href="#">About Us</a>
              <a href="#">B2B Information</a>
              <a href="#">Contact</a>
            </div>
            <div className="header-top-right">
              <a href="#">Help</a>
              <span>|</span>
              <a href="#">Language: EN ▾</a>
            </div>
          </div>
        </div>
        <div className="header-main">
          <div className="header-main-inner">
            <div className="logo">GOLF B2B</div>
            <div className="search-bar">
              <input type="text" className="search-input" placeholder="Search for products, brands..." />
              <button className="search-button" onClick={handleSearch}>[ICON]</button>
            </div>
            <div className="header-icons">
              <div className="header-icon">[ICON]<span>Wishlist</span></div>
              <div className="header-icon">[ICON]<span>Cart</span><span className="icon-badge">3</span></div>
              <div className="header-icon">[ICON]<span>Quotes</span></div>
              <div className="header-icon">[ICON]<span>My Account</span></div>
            </div>
          </div>
        </div>
        <nav className="nav-container">
          <div className="nav-inner">
            <div className="nav-category">
              {NAV_ITEMS.map(item => (
                <div
                  key={item}
                  className={`nav-item ${activeNav === item ? 'active' : ''}`}
                  onClick={() => setActiveNav(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <main>
        <div className="b2b-info-bar">
          <div className="b2b-info-inner">
            <div className="b2b-info-item">
              <span className="b2b-info-label">Minimum Order:</span>
              <span className="b2b-info-value">$500</span>
            </div>
            <div className="b2b-info-item">
              <span className="b2b-info-label">Est. Delivery:</span>
              <span className="b2b-info-value">3-5 Business Days</span>
            </div>
            <div className="b2b-info-item">
              <span className="b2b-info-label">Payment Methods:</span>
              <span className="b2b-info-value">Net 30/60, Credit Card</span>
            </div>
            <button className="bulk-order-btn" onClick={() => alert('Bulk Order Inquiry clicked!')}>Bulk Order Inquiry</button>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-inner">
            {BRANDS.map(brand => (
              <div
                key={brand}
                className={`filter-chip ${activeFilters.includes(brand) ? 'active' : ''}`}
                onClick={() => handleFilterClick(brand)}
              >
                {brand} {brand !== 'All' && <span className="filter-count">{Math.floor(Math.random() * 50)}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="banner-section">
          <div className="banner-container">
            <div className="banner-content">
              <div className="banner-label">Exclusive B2B Offer</div>
              <h1 className="banner-title">2024 Season Kick-off Deals</h1>
              <p className="banner-desc">Stock up for the new season with up to 30% off on select brands. Limited time only.</p>
              <div className="banner-button">Shop Now</div>
            </div>
          </div>
        </div>

        <section className="recommend-section">
          <div className="section-header">
            <h2 className="section-title">🔥 Recommended for You</h2>
            <div className="view-more">View All <span>→</span></div>
          </div>
          <div className="sort-options">
            {SORT_OPTIONS.map(option => (
              <div
                key={option}
                className={`sort-option ${activeSort === option ? 'active' : ''}`}
                onClick={() => setActiveSort(option)}
              >
                {option}
              </div>
            ))}
          </div>
          <div className="product-grid">
            {products.map(product => (
              <div className="product-card" key={product.id}>
                <div className="product-image-container">
                  <img src={product.image} alt={product.name} className="product-image" />
                  {product.isNew && <div className="product-badge">NEW</div>}
                  <div className="quick-actions">
                    <div className="quick-action-btn" onClick={(e) => handleQuickAction(e, 'Add to Cart')}>🛒</div>
                    <div className="quick-action-btn" onClick={(e) => handleQuickAction(e, 'Add to Wishlist')}>❤️</div>
                  </div>
                </div>
                <div className="product-info">
                  <div className="product-brand">{product.brand}</div>
                  <div className="product-name">{product.name}</div>
                  <div className="product-price-area">
                    <span className="product-discount">{product.discount}</span>
                    <span className="product-price">${product.price}</span>
                    <span className="product-original-price">${product.originalPrice}</span>
                  </div>
                  <div className="product-moq">MOQ: {product.moq}</div>
                </div>
              </div>
            ))}
          </div>
          <div ref={loader} style={{ height: '50px', margin: '20px 0' }}>
            {loading && <p style={{ textAlign: 'center' }}>Loading more products...</p>}
          </div>
        </section>
      </main>

      <div className="floating-buttons">
        <div className="floating-btn"><a href="#top">↑</a></div>
        <div className="floating-btn primary" onClick={() => alert('Quick Quote clicked!')}>⚡️</div>
      </div>
      </div>
      <Footer />
    </>
  )
}