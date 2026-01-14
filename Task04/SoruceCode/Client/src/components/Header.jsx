import { useCart } from '../store/CartContext';

function Header({ onCartClick }) {
  const { cartCount } = useCart();

  return (
    <header className="header">
      <h1>NeedKart</h1>
      <button className="cart-btn" onClick={onCartClick}>
        🛒 Cart {cartCount > 0 && <span className="badge">{cartCount}</span>}
      </button>
    </header>
  );
}

export default Header;
