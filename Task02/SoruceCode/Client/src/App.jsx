import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import { searchProducts } from './services/api';
import { FaSearch, FaShoppingCart, FaTags, FaBolt, FaDollarSign, FaSyncAlt } from 'react-icons/fa';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [bestDeal, setBestDeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await searchProducts(query);
      
      if (response.success) {
        setProducts(response.data.products);
        setBestDeal(response.data.bestDeal);
      } else {
        setError('Failed to fetch products. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while searching. Please check if the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="app-title">
              <FaTags className="logo-icon" />
              PriceCompare
            </h1>
            <p className="app-subtitle">Find the best deals across top e-commerce platforms</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="search-section">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner-large"></div>
            <p className="loading-text">Searching across multiple platforms...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <ProductList products={products} bestDeal={bestDeal} />
        )}

        {!loading && !error && hasSearched && products.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon"><FaSearch /></div>
            <h3>No products found</h3>
            <p>Try searching for something else</p>
          </div>
        )}

        {!loading && !error && !hasSearched && (
          <div className="welcome-section">
            <div className="welcome-content">
              <div className="welcome-icon"><FaShoppingCart /></div>
              <h2>Welcome to PriceCompare</h2>
              <p>Compare prices across Amazon, eBay, and Walmart instantly</p>
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon"><FaBolt /></div>
                  <h4>Instant Comparison</h4>
                  <p>Search once, compare multiple stores</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"><FaDollarSign /></div>
                  <h4>Best Price Guarantee</h4>
                  <p>Find the lowest price automatically</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"><FaSyncAlt /></div>
                  <h4>Real-time Updates</h4>
                  <p>Fresh prices from top retailers</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2026 PriceCompare - Compare. Save. Shop Smart.</p>
        <div className="footer-links">
          <span>Amazon</span>
          <span>•</span>
          <span>eBay</span>
          <span>•</span>
          <span>Walmart</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
