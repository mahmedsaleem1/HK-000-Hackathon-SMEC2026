import { useCart } from '../store/CartContext';

function Cart({ isOpen, onClose }) {
  const { cart, updateQty, removeFromCart, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-panel" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {cart.items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.items.map(item => (
                <div key={item._id} className="cart-item">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="cart-item-img"
                  />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p className="item-price">${item.price?.toFixed(2)}</p>
                    <div className="qty-controls">
                      <button onClick={() => updateQty(item._id, item.qty - 1)}>
                        -
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item._id, item.qty + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-total">
                    <p>${(item.price * item.qty).toFixed(2)}</p>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total:</span>
                <span className="total-amount">${cart.total?.toFixed(2)}</span>
              </div>
              <button className="clear-btn" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
