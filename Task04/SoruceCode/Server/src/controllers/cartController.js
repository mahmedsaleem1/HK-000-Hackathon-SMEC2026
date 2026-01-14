const Cart = require('../models/Cart');
const Product = require('../models/Product');

// helper to calculate total
const calcTotal = (items) => {
  return items.reduce((sum, item) => {
    if (item.product && item.product.price) {
      return sum + (item.product.price * item.qty);
    }
    return sum;
  }, 0);
};

// get cart by session
exports.getCart = async (req, res) => {
  try {
    const { sessionId } = req.params;
    let cart = await Cart.findOne({ sessionId }).populate('items.product');
    
    if (!cart) {
      cart = new Cart({ sessionId, items: [], total: 0 });
      await cart.save();
    }
    
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// add item to cart
exports.addItem = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { productId, qty = 1 } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = new Cart({ sessionId, items: [], total: 0 });
    }
    
    // check if product already in cart
    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );
    
    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.items.push({ product: productId, qty });
    }
    
    await cart.save();
    
    // populate and return
    cart = await Cart.findOne({ sessionId }).populate('items.product');
    cart.total = calcTotal(cart.items);
    await cart.save();
    
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// update item quantity
exports.updateQty = async (req, res) => {
  try {
    const { sessionId, productId } = req.params;
    const { qty } = req.body;
    
    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }
    
    const item = cart.items.find(
      i => i.product.toString() === productId
    );
    
    if (!item) {
      return res.status(404).json({ msg: 'Item not in cart' });
    }
    
    if (qty <= 0) {
      cart.items = cart.items.filter(
        i => i.product.toString() !== productId
      );
    } else {
      item.qty = qty;
    }
    
    await cart.save();
    
    cart = await Cart.findOne({ sessionId }).populate('items.product');
    cart.total = calcTotal(cart.items);
    await cart.save();
    
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// remove item from cart
exports.removeItem = async (req, res) => {
  try {
    const { sessionId, productId } = req.params;
    
    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(
      i => i.product.toString() !== productId
    );
    
    await cart.save();
    
    cart = await Cart.findOne({ sessionId }).populate('items.product');
    cart.total = calcTotal(cart.items);
    await cart.save();
    
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// clear cart
exports.clearCart = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    let cart = await Cart.findOne({ sessionId });
    if (cart) {
      cart.items = [];
      cart.total = 0;
      await cart.save();
    }
    
    res.json({ msg: 'Cart cleared', cart });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
