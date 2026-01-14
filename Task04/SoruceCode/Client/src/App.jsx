import { useState } from 'react';
import { CartProvider } from './store/CartContext';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import './App.css';

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartProvider>
      <div className="app">
        <Header onCartClick={() => setCartOpen(true)} />
        <main className="main">
          <ProductList />
        </main>
        <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </CartProvider>
  );
}

export default App;
