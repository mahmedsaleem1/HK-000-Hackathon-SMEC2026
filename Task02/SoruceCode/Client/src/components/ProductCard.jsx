import './ProductCard.css';
import { FaAmazon, FaEbay } from 'react-icons/fa';
import { SiWalmart } from 'react-icons/si';

const ProductCard = ({ product, isBestDeal }) => {
  const getSourceLogo = (source) => {
    switch(source) {
      case 'Amazon':
        return <FaAmazon className="store-icon amazon-icon" />;
      case 'eBay':
        return <FaEbay className="store-icon ebay-icon" />;
      case 'Walmart':
        return <SiWalmart className="store-icon walmart-icon" />;
      default:
        return null;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star">★</span>);
    }

    return stars;
  };

  return (
    <div className={`product-card ${isBestDeal ? 'best-deal' : ''}`}>
      {isBestDeal && (
        <div className="best-deal-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Best Price
        </div>
      )}
      
      <div className="product-header">
        <div className="source-info">
          <span className="source-logo">{getSourceLogo(product.source)}</span>
          <span className="source-name">{product.source}</span>
        </div>
        {product.inStock ? (
          <span className="stock-badge in-stock">In Stock</span>
        ) : (
          <span className="stock-badge out-of-stock">Out of Stock</span>
        )}
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-rating">
          <div className="stars">
            {renderStars(product.rating)}
          </div>
          <span className="rating-value">{product.rating}</span>
        </div>

        <div className="product-price">
          <span className="price-value">{formatPrice(product.price)}</span>
        </div>

        <div className="product-details">
          <div className="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="1" y="3" width="15" height="13"></rect>
              <path d="M16 8h7l-2 8h-5"></path>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span>{product.shipping}</span>
          </div>
          <div className="detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{product.delivery}</span>
          </div>
        </div>
      </div>

      <div className="product-footer">
        <a 
          href={product.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="view-button"
        >
          View on {product.source}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
