import { useState, useEffect } from 'react';
import { useCart } from '../store/CartContext';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // using free fakestoreapi - no api key needed
        const res = await fetch('https://fakestoreapi.com/products');
        const data = await res.json();
        // map to match our cart structure
        const mapped = data.map(p => ({
          _id: p.id.toString(),
          name: p.title,
          price: p.price,
          description: p.description,
          image: p.image,
          category: p.category
        }));
        setProducts(mapped);
      } catch (err) {
        console.error('Failed to load products', err);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="product-grid">
      {products.map(product => (
        <div key={product._id} className="product-card">
          <img src={product.image} alt={product.name} className="product-img" />
          <div className="product-info">
            <h3>{product.name}</h3>
            <p className="product-desc">{product.description}</p>
            <div className="product-footer">
              <span className="price">${product.price.toFixed(2)}</span>
              <button
                onClick={() => addToCart(product)}
                className="add-btn"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
