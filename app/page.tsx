'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/footer'

const CATEGORIES = ['Clubs', 'Balls', 'Apparel', 'Shoes', 'Accessories']

// Helper function to generate a random product
const createProduct = (id: number) => ({
  id,
    brand: `Brand ${String.fromCharCode(65 + (id % 5))}`,
  category: CATEGORIES[id % CATEGORIES.length],
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
  const [searchTerm, setSearchTerm] = useState('')
  const [activeNav, setActiveNav] = useState('All')
  const [activeSort, setActiveSort] = useState('Recommended')
  const [loading, setLoading] = useState(false)
  const loader = useRef(null)
  const [filteredProducts, setFilteredProducts] = useState(products)



    useEffect(() => {
    let tempProducts = [...products];

    // Filter by active navigation category
    if (activeNav !== 'All') {
      tempProducts = tempProducts.filter(p => p.category === activeNav);
    }

    // Filter by active brands
    if (!activeFilters.includes('All')) {
      tempProducts = tempProducts.filter(p => activeFilters.includes(p.brand));
    }

    // Filter by search term
    if (searchTerm) {
      tempProducts = tempProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    switch (activeSort) {
      case 'Newest':
        tempProducts.sort((a, b) => b.id - a.id);
        break;
      case 'Price: Low to High':
        tempProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'Price: High to Low':
        tempProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'Recommended':
      default:
        tempProducts.sort((a, b) => a.id - b.id); // Default sort by id
        break;
    }

    setFilteredProducts(tempProducts);
  }, [products, activeNav, activeFilters, searchTerm, activeSort]);

  const handleFilterClick = (filter: string) => {
    setActiveFilters(prev => {
      if (filter === 'All') {
        return ['All'];
      }
      const newFilters = prev.filter(f => f !== 'All');
      if (newFilters.includes(filter)) {
        const remainingFilters = newFilters.filter(f => f !== filter);
        return remainingFilters.length === 0 ? ['All'] : remainingFilters;
      } else {
        return [...newFilters, filter];
      }
    });
  };





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
    console.log('Searching for:', searchTerm)
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
            <Link href="/" className="logo">GOLF B2B</Link>
            <div className="search-bar">
              <input type="text" className="search-input" placeholder="Search for products, brands..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <button className="search-button" onClick={handleSearch}>[ICON]</button>
            </div>
            <div className="header-icons">
              <Link href="/dashboard/wishlist" className="header-icon">[ICON]<span>Wishlist</span></Link>
              <Link href="/dashboard/cart" className="header-icon">[ICON]<span>Cart</span><span className="icon-badge">3</span></Link>
              <Link href="/dashboard/quotes" className="header-icon">[ICON]<span>Quotes</span></Link>
              <Link href="/dashboard" className="header-icon">[ICON]<span>My Account</span></Link>
            </div>
          </div>
        </div>
        <nav className="nav-container">
          <div className="nav-inner">
            <ul className="nav-category">
              {NAV_ITEMS.map(nav => (
                <li key={nav} className={`main-nav-item ${activeNav === nav ? 'active' : ''}`}>
                  <button onClick={() => setActiveNav(nav)}>{nav}</button>
                </li>
              ))}
            </ul>
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
              <button
                key={brand}
                className={`filter-button ${activeFilters.includes(brand) ? 'active' : ''}`}
                onClick={() => handleFilterClick(brand)}
              >
                {brand} {brand !== 'All' && <span className="filter-count">{Math.floor(Math.random() * 50)}</span>}
              </button>
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
            {filteredProducts.map(product => (
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