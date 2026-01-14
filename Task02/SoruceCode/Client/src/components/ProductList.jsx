import ProductCard from './ProductCard';
import './ProductList.css';

const ProductList = ({ products, bestDeal }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="product-list-container">
      <div className="results-header">
        <h2 className="results-title">
          Price Comparison Results
        </h2>
        <p className="results-subtitle">
          Found {products.length} offers across major retailers
        </p>
      </div>

      {bestDeal && (
        <div className="best-deal-highlight">
          <div className="highlight-content">
            <div className="highlight-icon">🏆</div>
            <div className="highlight-text">
              <h3>Best Deal Found!</h3>
              <p>
                <strong>{bestDeal.source}</strong> offers the lowest price at{' '}
                <strong>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(bestDeal.price)}
                </strong>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isBestDeal={bestDeal && product.id === bestDeal.id}
          />
        ))}
      </div>

      <div className="price-summary">
        <div className="summary-card">
          <h4>Price Range</h4>
          <p className="summary-value">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(Math.min(...products.map(p => p.price)))}
            {' - '}
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(Math.max(...products.map(p => p.price)))}
          </p>
        </div>
        <div className="summary-card">
          <h4>Average Price</h4>
          <p className="summary-value">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(
              products.reduce((sum, p) => sum + p.price, 0) / products.length
            )}
          </p>
        </div>
        <div className="summary-card">
          <h4>Potential Savings</h4>
          <p className="summary-value savings">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(
              Math.max(...products.map(p => p.price)) - Math.min(...products.map(p => p.price))
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
