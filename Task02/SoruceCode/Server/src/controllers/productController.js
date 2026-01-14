const priceService = require('../services/priceService');

class ProductController {
  async searchProducts(req, res) {
    try {
      const { query } = req.query;

      if (!query || query.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Please provide a search query'
        });
      }

      const results = await priceService.searchProducts(query);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while searching products'
      });
    }
  }

  async getProductDetails(req, res) {
    try {
      const { id } = req.params;
      
      res.json({
        success: true,
        message: 'Product details endpoint',
        productId: id
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product details'
      });
    }
  }
}

module.exports = new ProductController();
