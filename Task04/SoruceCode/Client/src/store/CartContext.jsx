import { useState, useEffect, createContext, useContext } from 'react';

const CartContext = createContext();

// load cart from localStorage
const loadCart = () => {
  try {
    const saved = localStorage.getItem('shopping_cart');
    return saved ? JSON.parse(saved) : { items: [], total: 0 };
  } catch {
    return { items: [], total: 0 };
  }
};

// save cart to localStorage
const saveCart = (cart) => {
  localStorage.setItem('shopping_cart', JSON.stringify(cart));
};

// calculate total
const calcTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.price * item.qty), 0);
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  // persist to localStorage whenever cart changes
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.items.find(item => item._id === product._id);
      let newItems;
      
      if (existing) {
        newItems = prev.items.map(item =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        newItems = [...prev.items, { ...product, qty: 1 }];
      }
      
      return { items: newItems, total: calcTotal(newItems) };
    });
  };

  const updateQty = (productId, qty) => {
    setCart(prev => {
      let newItems;
      
      if (qty <= 0) {
        newItems = prev.items.filter(item => item._id !== productId);
      } else {
        newItems = prev.items.map(item =>
          item._id === productId ? { ...item, qty } : item
        );
      }
      
      return { items: newItems, total: calcTotal(newItems) };
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const newItems = prev.items.filter(item => item._id !== productId);
      return { items: newItems, total: calcTotal(newItems) };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
