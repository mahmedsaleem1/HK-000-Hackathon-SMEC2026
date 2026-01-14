const Product = require('../models/Product');

// get all products
exports.getAll = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// get single product
exports.getOne = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
